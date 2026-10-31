import pyodbc
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from pathlib import Path
from uuid import uuid4
from database import get_db
import schemas
import auth

router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
ALLOWED_IMAGE_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024


def serialize(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row.get("description") or "",
        "price": float(row["price"]) if row["price"] is not None else 0.0,
        "stock": int(row["stock"]) if row["stock"] is not None else 0,
        "rice_standard": row.get("rice_standard") or "general",
        "rice_variety": row.get("rice_variety"),
        "unit": row.get("unit") or "ถุง (5 กก.)",
        "image_url": row.get("image_url"),
        "broken_rice_percentage": float(row["broken_rice_percentage"]) if row.get("broken_rice_percentage") is not None else 0.0,
        "ai_verified": bool(row.get("ai_verified")),
        "is_active": bool(row.get("is_active")),
        "owner_id": row.get("owner_id"),
        "seller_name": row.get("seller_full_name") or row.get("seller_username") or "ผู้ขายทั่วไป",
        "owner_name": row.get("seller_full_name") or row.get("seller_username"),
        "created_at": str(row["created_at"]) if row.get("created_at") else None,
    }


PRODUCT_SELECT_WITH_SELLER = "SELECT * FROM vw_ProductWithSeller p"


@router.get("/", response_model=dict)
def get_products(skip: int = 0, limit: int = 100, db=Depends(get_db)):
    with db.cursor() as cursor:
        cursor.execute(
            PRODUCT_SELECT_WITH_SELLER + " WHERE p.is_active = 1 ORDER BY p.id DESC OFFSET %s ROWS FETCH NEXT %s ROWS ONLY",
            (skip, limit),
        )
        rows = cursor.fetchall()
    return {"success": True, "data": [serialize(r) for r in rows]}


@router.post("/upload-image", response_model=dict)
async def upload_product_image(
    request: Request,
    image: UploadFile = File(...),
    current_user: dict = Depends(auth.require_roles("seller", "admin")),
):
    """รับรูปที่ผู้ขายเลือก แล้วเก็บเป็นไฟล์จริงแทนการส่ง Base64 ลงฐานข้อมูล"""
    extension = ALLOWED_IMAGE_TYPES.get(image.content_type or "")
    if not extension:
        raise HTTPException(status_code=400, detail="รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP")

    content = await image.read(MAX_IMAGE_SIZE + 1)
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="ไฟล์รูปต้องมีขนาดไม่เกิน 10 MB")
    if not content:
        raise HTTPException(status_code=400, detail="ไฟล์รูปว่างเปล่า")

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"product-{uuid4().hex}{extension}"
    destination = UPLOADS_DIR / filename
    destination.write_bytes(content)

    base_url = str(request.base_url).rstrip("/")
    return {"success": True, "url": f"{base_url}/uploads/{filename}"}


@router.get("/{product_id}")
def get_product(product_id: int, db=Depends(get_db)):
    with db.cursor() as cursor:
        cursor.execute(PRODUCT_SELECT_WITH_SELLER + " WHERE p.id = %s", (product_id,))
        row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้านี้")
    return {"success": True, "data": serialize(row)}


@router.post("/", response_model=dict)
def create_product(
    product: schemas.ProductCreate,
    db=Depends(get_db),
    current_user: dict = Depends(auth.require_roles("seller", "admin")),
):
    with db.cursor() as cursor:
        cursor.execute(
            """INSERT INTO riceproducts
                   (title, description, price, stock, rice_standard, rice_variety, unit,
                    image_url, broken_rice_percentage, ai_verified, is_active, owner_id, created_at)
               OUTPUT INSERTED.id
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, %s, GETDATE())""",
            (
                product.title,
                product.description or "",
                product.price,
                product.stock or 0,
                product.rice_standard or "general",
                product.rice_variety,
                product.unit or "ถุง (5 กก.)",
                product.image_url,
                product.broken_rice_percentage or 0.0,
                int(bool(product.ai_verified)),
                current_user["id"],
            ),
        )
        new_id = cursor.fetchone()["id"]
        cursor.execute(PRODUCT_SELECT_WITH_SELLER + " WHERE p.id = %s", (new_id,))
        row = cursor.fetchone()
    return {"success": True, "data": serialize(row)}


@router.put("/{product_id}")
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db=Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    with db.cursor() as cursor:
        cursor.execute("SELECT owner_id FROM riceproducts WHERE id = %s", (product_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")

        is_owner = existing["owner_id"] is not None and existing["owner_id"] == current_user["id"]
        if current_user["role"] != "admin" and not (current_user["role"] == "seller" and is_owner):
            raise HTTPException(status_code=403, detail="คุณแก้ไขได้เฉพาะสินค้าของตัวเองเท่านั้น")

        cursor.execute(
            """UPDATE riceproducts SET
                   title = %s, description = %s, price = %s, stock = %s, rice_standard = %s,
                   rice_variety = %s, unit = %s, image_url = %s, broken_rice_percentage = %s, ai_verified = %s
               WHERE id = %s""",
            (
                product.title,
                product.description or "",
                product.price,
                product.stock or 0,
                product.rice_standard or "general",
                product.rice_variety,
                product.unit or "ถุง (5 กก.)",
                product.image_url,
                product.broken_rice_percentage or 0.0,
                int(bool(product.ai_verified)),
                product_id,
            ),
        )
        cursor.execute(PRODUCT_SELECT_WITH_SELLER + " WHERE p.id = %s", (product_id,))
        row = cursor.fetchone()
    return {"success": True, "data": serialize(row)}


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db=Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    with db.cursor() as cursor:
        cursor.execute("SELECT owner_id FROM riceproducts WHERE id = %s", (product_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")

        is_owner = row["owner_id"] is not None and row["owner_id"] == current_user["id"]
        if current_user["role"] != "admin" and not (current_user["role"] == "seller" and is_owner):
            raise HTTPException(status_code=403, detail="คุณลบได้เฉพาะสินค้าของตัวเองเท่านั้น")

        try:
            cursor.execute("DELETE FROM riceproducts WHERE id = %s", (product_id,))
        except pyodbc.IntegrityError:
            raise HTTPException(status_code=409, detail="สินค้านี้มีคำสั่งซื้ออยู่ จึงลบไม่ได้ (ปิดการขายแทนได้)")
    return {"success": True, "message": "Product deleted successfully"}

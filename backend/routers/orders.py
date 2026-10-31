import pyodbc
from fastapi import APIRouter, Depends, HTTPException
from database import get_db, parse_proc_error
import schemas
import auth

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)

ORDER_SELECT = "SELECT * FROM vw_OrderDetail o"


def raise_proc_error(exc):
    parsed = parse_proc_error(exc)
    if parsed:
        raise HTTPException(status_code=parsed[0], detail=parsed[1])
    raise exc


def serialize(row):
    return {
        "id": row["id"],
        "product_id": row["product_id"],
        "product_title": row.get("product_title"),
        "product_image_url": row.get("product_image_url"),
        "buyer_id": row["buyer_id"],
        "buyer_username": row.get("buyer_username"),
        "buyer_email": row.get("buyer_email"),
        "buyer_full_name": row.get("buyer_full_name"),
        "seller_id": row["seller_id"],
        "quantity": float(row["quantity"]),
        "unit_price": float(row["unit_price"]),
        "total_amount": float(row["total_amount"]),
        "status": row["status"],
        "note": row.get("note"),
        "created_at": str(row["created_at"]) if row.get("created_at") else None,
        "updated_at": str(row["updated_at"]) if row.get("updated_at") else None,
    }


@router.post("/", response_model=dict)
def create_order(
    payload: schemas.OrderCreate,
    db=Depends(get_db),
    current_user: dict = Depends(auth.require_roles("buyer")),
):
    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="จำนวนต้องมากกว่า 0")

    try:
        with db.cursor() as cursor:
            cursor.execute(
                "EXEC sp_CreateOrder @product_id = %s, @buyer_id = %s, @quantity = %s, @note = %s",
                (payload.product_id, current_user["id"], payload.quantity, payload.note),
            )
            row = cursor.fetchone()
    except pyodbc.Error as exc:
        raise_proc_error(exc)

    return {"success": True, "data": serialize(row)}


@router.get("/my", response_model=dict)
def get_my_orders(db=Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    with db.cursor() as cursor:
        cursor.execute(ORDER_SELECT + " WHERE o.buyer_id = %s ORDER BY o.id DESC", (current_user["id"],))
        rows = cursor.fetchall()
    return {"success": True, "data": [serialize(r) for r in rows]}


@router.get("/", response_model=dict)
def get_orders(
    db=Depends(get_db),
    current_user: dict = Depends(auth.require_roles("seller", "admin")),
):
    with db.cursor() as cursor:
        if current_user["role"] == "admin":
            cursor.execute(ORDER_SELECT + " ORDER BY o.id DESC")
        else:
            cursor.execute(ORDER_SELECT + " WHERE o.seller_id = %s ORDER BY o.id DESC", (current_user["id"],))
        rows = cursor.fetchall()
    return {"success": True, "data": [serialize(r) for r in rows]}


@router.put("/{order_id}", response_model=dict)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db=Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    try:
        with db.cursor() as cursor:
            cursor.execute(
                "EXEC sp_UpdateOrderStatus @order_id = %s, @status = %s, @user_id = %s, @role = %s",
                (order_id, payload.status, current_user["id"], current_user["role"]),
            )
            row = cursor.fetchone()
    except pyodbc.Error as exc:
        raise_proc_error(exc)

    return {"success": True, "data": serialize(row)}

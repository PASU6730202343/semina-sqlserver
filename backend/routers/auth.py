from fastapi import APIRouter, Depends, HTTPException
from database import get_db
import schemas
import auth

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


def serialize_user(row):
    return {
        "id": row["id"],
        "username": row["username"],
        "email": row["email"],
        "role": row["role"],
        "full_name": row.get("full_name"),
        "phone": row.get("phone"),
    }


@router.post("/register", response_model=dict)
def register_user(user: schemas.UserRegister, db=Depends(get_db)):
    if user.role not in ("buyer", "seller"):
        raise HTTPException(status_code=400, detail="สมัครสมาชิกได้เฉพาะบทบาท buyer หรือ seller เท่านั้น")

    with db.cursor() as cursor:
        cursor.execute(
            "SELECT id FROM user_rice WHERE username = %s OR email = %s",
            (user.username, user.email),
        )
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username หรือ Email นี้ถูกใช้ไปแล้ว")

        hashed = auth.get_password_hash(user.password)
        cursor.execute(
            """INSERT INTO user_rice
               (username, email, password_hash, role, full_name, phone, is_active)
               OUTPUT INSERTED.id
               VALUES (%s, %s, %s, %s, %s, %s, 1)""",
            (user.username, user.email, hashed, user.role, user.full_name, user.phone),
        )
        new_id = cursor.fetchone()["id"]
        cursor.execute("SELECT * FROM user_rice WHERE id = %s", (new_id,))
        row = cursor.fetchone()

    return {"success": True, "message": "สมัครสมาชิกสำเร็จ", "data": serialize_user(row)}


@router.post("/login", response_model=dict)
def login(payload: schemas.LoginRequest, db=Depends(get_db)):
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM user_rice WHERE username = %s", (payload.username,))
        row = cursor.fetchone()

    if not row or not auth.verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Username หรือรหัสผ่านไม่ถูกต้อง")
    if not row["is_active"]:
        raise HTTPException(status_code=403, detail="บัญชีนี้ถูกระงับการใช้งาน")

    token = auth.create_access_token(
        data={"sub": row["username"], "id": row["id"], "role": row["role"]}
    )
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(row),
    }


@router.get("/me", response_model=dict)
def read_users_me(current_user: dict = Depends(auth.get_current_user), db=Depends(get_db)):
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM user_rice WHERE id = %s", (current_user["id"],))
        row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "data": serialize_user(row)}


@router.put("/role", response_model=dict)
def switch_role(
    payload: schemas.RoleSwitchRequest,
    db=Depends(get_db),
    current_user: dict = Depends(auth.get_current_user),
):
    if payload.role not in ("buyer", "seller"):
        raise HTTPException(status_code=400, detail="สลับได้เฉพาะบทบาท buyer หรือ seller เท่านั้น")
    if current_user["role"] == "admin":
        raise HTTPException(status_code=403, detail="บัญชีแอดมินไม่สามารถสลับประเภทบัญชีได้")

    with db.cursor() as cursor:
        cursor.execute(
            "UPDATE user_rice SET role = %s WHERE id = %s",
            (payload.role, current_user["id"]),
        )
        cursor.execute("SELECT * FROM user_rice WHERE id = %s", (current_user["id"],))
        row = cursor.fetchone()

    token = auth.create_access_token(
        data={"sub": row["username"], "id": row["id"], "role": row["role"]}
    )
    return {
        "success": True,
        "message": "สลับประเภทบัญชีสำเร็จแล้ว",
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(row),
    }

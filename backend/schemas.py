from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    role: str = "buyer"  # only 'buyer' or 'seller' may self-register; 'admin' is seeded manually
    full_name: Optional[str] = None
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class RoleSwitchRequest(BaseModel):
    role: str  # only 'buyer' or 'seller' — 'admin' can never be self-assigned

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True

# --- Product Schemas ---
class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    stock: Optional[int] = 0
    quantity: Optional[float] = None
    unit: Optional[str] = "ถุง (5 กก.)"
    rice_standard: Optional[str] = "general"
    rice_variety: Optional[str] = None
    image_url: Optional[str] = None
    broken_rice_percentage: Optional[float] = 0.0
    ai_verified: bool = False

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    owner_id: Optional[int] = 1

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True

# --- Rice Analysis Schemas ---
class RiceAnalysisResultBase(BaseModel):
    total_grains: int
    whole_grains: int
    broken_grains: int
    broken_percentage: float
    image_url: Optional[str] = None

class RiceAnalysisResultCreate(RiceAnalysisResultBase):
    product_id: int

class RiceAnalysisResultResponse(RiceAnalysisResultBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderCreate(BaseModel):
    product_id: int
    quantity: float
    note: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str  # 'pending' | 'confirmed' | 'shipped' | 'cancelled'

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

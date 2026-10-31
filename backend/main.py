from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from routers import auth, products, orders, ai, detection

UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Smart Rice Marketplace AI",
    description="API for Agricultural Marketplace with AI Pricing and Matching",
    version="1.0.0"
)

# ตั้งค่า CORS สำหรับให้ Frontend เรียกใช้งานได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ให้ frontend/browser เปิดดูรูปสินค้าที่อัปโหลดจาก backend ได้
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(ai.router)
app.include_router(detection.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Rice Marketplace AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

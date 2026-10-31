-- ============================================================
-- Smart Rice Marketplace-AI: สคริปต์สร้างฐานข้อมูลหลัก (PostgreSQL)
-- เวอร์ชัน 1.1 (เพิ่มการรองรับ rice_standard)
-- ============================================================

-- ==========================
-- 1. ตาราง users (ผู้ใช้งาน)
-- ==========================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,                          -- รหัสผู้ใช้ (auto-increment)
    name        VARCHAR(100) NOT NULL,                       -- ชื่อผู้ใช้
    email       VARCHAR(150) NOT NULL UNIQUE,                -- อีเมล (ห้ามซ้ำ)
    password    VARCHAR(255) NOT NULL,                       -- รหัสผ่าน (ควร hash ก่อนเก็บ)
    role        VARCHAR(10) NOT NULL                         -- บทบาท: 'farmer' หรือ 'buyer'
                    CHECK (role IN ('farmer', 'buyer')),
    created_at  TIMESTAMP DEFAULT NOW()                      -- วันที่สร้างบัญชี
);

-- ============================
-- 2. ตาราง products (สินค้า)
-- ============================
CREATE TABLE IF NOT EXISTS products (
    id            SERIAL PRIMARY KEY,                          -- รหัสสินค้า
    farmer_id     INT NOT NULL                                 -- รหัสเกษตรกรที่ลงขาย (FK → users)
                      REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(200) NOT NULL,                       -- ชื่อสินค้า
    description   TEXT,                                        -- รายละเอียดสินค้า
    price         NUMERIC(12, 2) NOT NULL CHECK (price >= 0), -- ราคาต่อหน่วย (บาท)
    quantity      INT NOT NULL CHECK (quantity >= 0),          -- จำนวนคงเหลือ
    rice_standard VARCHAR(50) DEFAULT 'general',               -- มาตรฐานข้าว: general / GI / Organic / GAP
    status        VARCHAR(20) DEFAULT 'available'              -- สถานะ: available / sold_out / hidden
                      CHECK (status IN ('available', 'sold_out', 'hidden')),
    created_at    TIMESTAMP DEFAULT NOW()                      -- วันที่ลงขาย
);

-- =============================================
-- 3. ตาราง images (รูปภาพของสินค้า)
-- =============================================
CREATE TABLE IF NOT EXISTS images (
    id          SERIAL PRIMARY KEY,                          -- รหัสรูปภาพ
    product_id  INT NOT NULL                                 -- รหัสสินค้า (FK → products)
                    REFERENCES products(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,                               -- URL ของรูปภาพ
    created_at  TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Index เพื่อเพิ่มประสิทธิภาพการค้นหา
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_status    ON products(status);
CREATE INDEX IF NOT EXISTS idx_images_product_id  ON images(product_id);

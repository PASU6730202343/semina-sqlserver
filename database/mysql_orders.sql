-- ============================================================
-- ตาราง order_rice: เก็บคำสั่งซื้อ ผูกกับ riceproducts และ user_rice
-- รัน SQL นี้ใน phpMyAdmin (แท็บ SQL) ของฐานข้อมูล ip_std6730202068
-- ต้องรันหลังจากมีตาราง riceproducts และ user_rice อยู่แล้วเท่านั้น
--
-- หมายเหตุ: ตั้งชื่อ order_rice (ไม่ใช่ orders เฉยๆ) เพราะฐานข้อมูลนี้มีตาราง
-- ชื่อ "orders" อยู่ก่อนแล้วจากโปรเจกต์อื่น (ข้อมูลไม่เกี่ยวข้องกัน) ห้ามไปยุ่งกับ
-- ตารางเดิมนั้นเด็ดขาด
-- ============================================================

CREATE TABLE IF NOT EXISTS order_rice (
    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,               -- สินค้าที่สั่งซื้อ
    buyer_id INT NOT NULL,                 -- ผู้ซื้อ (user_rice.id, role = buyer)
    seller_id INT NULL,                    -- ผู้ขาย ณ ตอนสั่งซื้อ (สำเนาไว้จาก riceproducts.owner_id
                                            -- กันกรณีสินค้าเปลี่ยนเจ้าของทีหลัง ข้อมูลคำสั่งซื้อเก่าจะยังถูกต้อง)

    quantity DECIMAL(10,2) NOT NULL,       -- จำนวนที่สั่ง
    unit_price DECIMAL(10,2) NOT NULL,     -- ราคาต่อหน่วย ณ ตอนสั่งซื้อ (เก็บสแนปช็อตไว้ เผื่อราคาสินค้าเปลี่ยนทีหลัง)
    total_amount DECIMAL(12,2) NOT NULL,   -- ยอดรวม = quantity * unit_price

    status ENUM('pending', 'confirmed', 'shipped', 'cancelled') NOT NULL DEFAULT 'pending',
    note VARCHAR(255),                     -- ข้อความจากผู้ซื้อถึงผู้ขาย (ถ้ามี)

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

    -- หมายเหตุ: ไม่ใส่ FOREIGN KEY เพราะบัญชี MySQL นี้ไม่มีสิทธิ์ REFERENCES
    -- (hosting ของนักศึกษาจำกัดสิทธิ์ไว้) ความถูกต้องของ product_id/buyer_id/seller_id
    -- จะคุมที่ฝั่ง backend code แทน เช่นเดียวกับ riceproducts.owner_id ที่ไม่มี FK เหมือนกัน
);

-- ============================================================
-- (ทางเลือก) ตัวอย่างข้อมูลทดสอบ — ลบทิ้งได้ถ้าไม่ต้องการ
-- เช็ค id จริงก่อนรัน: SELECT id FROM user_rice; และ SELECT id FROM riceproducts LIMIT 5;
-- ============================================================
-- INSERT INTO order_rice (product_id, buyer_id, seller_id, quantity, unit_price, total_amount, status, note)
-- VALUES (9, 3, 1, 5, 180.00, 900.00, 'pending', 'สนใจสั่งซื้อ 5 ถุง');

-- ============================================================
-- ตาราง user_rice: รองรับ 3 กลุ่มผู้ใช้ (buyer / seller / admin)
-- รัน SQL นี้ใน phpMyAdmin (แท็บ SQL) ของฐานข้อมูล ip_std6730202068
-- ============================================================

CREATE TABLE IF NOT EXISTS user_rice (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,   -- เก็บ bcrypt hash เท่านั้น ห้ามเก็บรหัสผ่านตรงๆ
    role ENUM('buyer', 'seller', 'admin') NOT NULL DEFAULT 'buyer',
    full_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_verification_user (user_id),
    CONSTRAINT fk_email_verification_user FOREIGN KEY (user_id)
      REFERENCES user_rice(id) ON DELETE CASCADE
);

-- ============================================================
-- บัญชีทดสอบ 3 กลุ่ม (รหัสผ่านถูก hash ด้วย bcrypt จริงแล้ว ใช้ล็อกอินทดสอบได้เลย)
--
--   username: admin     password: admin123     role: admin
--   username: seller1   password: seller123    role: seller
--   username: buyer1    password: buyer123     role: buyer
--
-- ⚠️ นี่เป็นรหัสผ่านสำหรับทดสอบเท่านั้น ก่อนใช้งานจริงควรเปลี่ยนรหัสผ่านทั้งหมด
-- ============================================================

INSERT INTO user_rice (username, email, password_hash, role, full_name) VALUES
('admin',   'admin@agrimatch.test',   '$2b$12$/oDjRfVC7qHLfAw0gvxQK.Q4Jd2bkaqXtGDcVZJZ/1uYUWFO02N/S', 'admin',  'ผู้ดูแลระบบ'),
('seller1', 'seller1@agrimatch.test', '$2b$12$jWfGHdCp05GWoRmXsnNsGeWkNyJ27kNEbUF7M5gt.8j5xGRD3flCK', 'seller', 'สมชาย มีรักษ์ (เกษตรกร)'),
('buyer1',  'buyer1@agrimatch.test',  '$2b$12$/caT.03dUyhQ3qaUPlny3uOwFW1mbv38quJFaGB4wZG0BZoIMZf0G', 'buyer',  'ลูกค้าทดสอบ');

-- ============================================================
-- (ทางเลือก) เชื่อม riceproducts.owner_id เข้ากับ user_rice.id ด้วย Foreign Key
-- ⚠️ อย่ารันส่วนนี้ทันที — ต้องเช็คก่อนว่า owner_id ที่มีอยู่ในตาราง riceproducts
--    ตอนนี้ตรงกับ id ของ user_rice จริงไหม (ข้อมูลเดิมที่ seed ไว้ตอนแรกอาจไม่ตรงกับ
--    บัญชีผู้ใช้ชุดใหม่นี้) ไม่งั้น ALTER TABLE จะ error เพราะ owner_id อ้างถึง
--    user ที่ไม่มีอยู่จริง
--
-- ขั้นแรกเช็คว่ามี owner_id ตัวไหนที่ไม่ตรงกับ user_rice.id บ้าง:
--   SELECT DISTINCT owner_id FROM riceproducts
--   WHERE owner_id IS NOT NULL AND owner_id NOT IN (SELECT id FROM user_rice);
--
-- ถ้าอยากเคลียร์ของเก่าให้ owner_id ว่างไว้ก่อน (เพราะยังไม่มีเจ้าของจริง):
--   UPDATE riceproducts SET owner_id = NULL
--   WHERE owner_id IS NOT NULL AND owner_id NOT IN (SELECT id FROM user_rice);
--
-- แล้วค่อยเพิ่ม constraint:
--   ALTER TABLE riceproducts
--     ADD CONSTRAINT fk_riceproducts_owner
--     FOREIGN KEY (owner_id) REFERENCES user_rice(id);
-- ============================================================

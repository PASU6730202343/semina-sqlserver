-- ============================================================
-- ข้อมูลตั้งต้น (seed): ผู้ใช้ทดสอบ 3 บัญชี + สินค้า 11 รายการ
--   admin / admin123 , seller1 / seller123 , buyer1 / buyer123  (ใช้ทดสอบเท่านั้น)
-- รันซ้ำได้: จะ insert เฉพาะเมื่อตารางยังว่าง
-- ============================================================
USE agrimatch;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.user_rice)
INSERT INTO user_rice (username, email, password_hash, role, full_name) VALUES
(N'admin',   N'admin@agrimatch.test',   N'$2b$12$/oDjRfVC7qHLfAw0gvxQK.Q4Jd2bkaqXtGDcVZJZ/1uYUWFO02N/S', N'admin',  N'ผู้ดูแลระบบ'),
(N'seller1', N'seller1@agrimatch.test', N'$2b$12$jWfGHdCp05GWoRmXsnNsGeWkNyJ27kNEbUF7M5gt.8j5xGRD3flCK', N'seller', N'สมชาย มีรักษ์ (เกษตรกร)'),
(N'buyer1',  N'buyer1@agrimatch.test',  N'$2b$12$/caT.03dUyhQ3qaUPlny3uOwFW1mbv38quJFaGB4wZG0BZoIMZf0G', N'buyer',  N'ลูกค้าทดสอบ');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.riceproducts)
INSERT INTO dbo.riceproducts (title, description, price, stock, rice_standard, rice_variety, unit, image_url, broken_rice_percentage, ai_verified, is_active, owner_id, created_at) VALUES
(
    N'ข้าวหอมมะลิ 105 สุรินทร์', 
    N'ข้าวหอมมะลิแท้ จ.สุรินทร์ เก็บเกี่ยวปีนี้ หอมนุ่มทุกเมล็ด บรรจุ 5 กก.', 
    220.00, 
    350, 
    N'GI', 
    N'ข้าวหอมมะลิ 105', 
    N'ถุง (5 กก.)', 
    N'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600', 
    5.0, 
    1, 
    1, 
    1, 
    GETDATE()
),
(
    N'ข้าวกข43 อินทรีย์', 
    N'ข้าวกข43 ปลูกแบบอินทรีย์ ไม่ใช้สารเคมี ต้านทานโรคได้ดี หอมนุ่มเบาๆ', 
    185.00, 
    80, 
    N'Organic', 
    N'กข43', 
    N'ถุง (5 กก.)', 
    N'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600', 
    3.0, 
    1, 
    1, 
    2, 
    GETDATE()
),
(
    N'ข้าวหอมนิล เพื่อสุขภาพ', 
    N'ข้าวสีม่วงเข้ม อุดมไปด้วยสารแอนโทไซยานิน เพื่อสุขภาพ บรรจุ 1 กก.', 
    320.00, 
    40, 
    N'Organic', 
    N'ข้าวหอมนิล', 
    N'ถุง (1 กก.)', 
    N'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=600', 
    2.0, 
    1, 
    1, 
    3, 
    GETDATE()
),
(
    N'ข้าวเหนียวเขาวง กาฬสินธุ์', 
    N'ข้าวเหนียวพันธุ์พื้นเมือง GI จ.กาฬสินธุ์ นุ่มหนึบ หอมมะลิอ่อนๆ', 
    160.00, 
    500, 
    N'GI', 
    N'ข้าวเหนียวเขาวง', 
    N'ถุง (5 กก.)', 
    N'https://images.unsplash.com/photo-1536304997881-a372c179924b?w=600', 
    5.0, 
    1, 
    1, 
    1, 
    GETDATE()
),
(
    N'ข้าวไรซ์เบอร์รี่ บรรจุถุงสุญญากาศ', 
    N'ข้าวไรซ์เบอร์รี่คัดพิเศษ บรรจุถุงสุญญากาศ 2 กก. คงความสดได้นาน', 
    280.00, 
    20, 
    N'GAP', 
    N'ไรซ์เบอร์รี่', 
    N'ถุง (2 กก.)', 
    N'https://images.unsplash.com/photo-1596450514946-b32f2c3a50d2?w=600', 
    4.0, 
    1, 
    1, 
    2, 
    GETDATE()
),
(
    N'ข้าวสังข์หยดพัทลุง', 
    N'ข้าวสังข์หยด จ.พัทลุง ขึ้นทะเบียน GI อุดมด้วยแร่ธาตุ เหมาะผู้รักสุขภาพ', 
    350.00, 
    60, 
    N'GI', 
    N'สังข์หยด', 
    N'ถุง (1 กก.)', 
    N'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600', 
    3.0, 
    1, 
    1, 
    3, 
    GETDATE()
),
(
    N'ข้าวหอมปทุม GAP มาตรฐาน', 
    N'ข้าวหอมปทุมธานี ผ่านมาตรฐาน GAP หอมเตะจมูก เหมาะทำข้าวสวยและข้าวหน้าต่างๆ', 
    195.00, 
    200, 
    N'GAP', 
    N'ปทุมธานี 1', 
    N'ถุง (5 กก.)', 
    N'https://images.unsplash.com/photo-1603520818073-7b9e5a6f7c4d?w=600', 
    5.0, 
    1, 
    1, 
    1, 
    GETDATE()
),
(
    N'ข้าวกล้องหอมมะลิ', 
    N'ข้าวกล้องหอมมะลิ สีข้าวเบาๆ คงคุณค่าสารอาหาร เหมาะสำหรับควบคุมน้ำหนัก', 
    240.00, 
    0, 
    N'Organic', 
    N'หอมมะลิ', 
    N'ถุง (5 กก.)', 
    N'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600', 
    5.0, 
    1, 
    0, 
    2, 
    GETDATE()
),
(
    N'ข้าวปทุมธานี 1', 
    N'ข้าวหอมคล้ายหอมมะลิ หุงขึ้นหม้อ รสชาติดีเยี่ยม', 
    180.00, 
    500, 
    N'general', 
    N'ปทุมธานี 1', 
    N'ถุง (5 กก.)', 
    N'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600', 
    5.0, 
    1, 
    1, 
    1, 
    GETDATE()
),
(
    N'ข้าวขาว 5%', 
    N'ข้าวขาวคุณภาพดี เมล็ดสวย สำหรับร้านอาหารและบริโภคทั่วไป', 
    150.00, 
    1000, 
    N'general', 
    N'ข้าวขาว', 
    N'ถุง (5 กก.)', 
    N'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600', 
    5.0, 
    1, 
    1, 
    2, 
    GETDATE()
),
(
    N'ข้าวเหนียว กข6', 
    N'ข้าวเหนียวพันธุ์ดี หอม นุ่ม นาน ไม่แข็งตัวง่าย', 
    190.00, 
    200, 
    N'general', 
    N'กข6', 
    N'ถุง (5 กก.)', 
    N'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600', 
    5.0, 
    1, 
    1, 
    3, 
    GETDATE()
);
GO

-- ============================================================
-- Views (ใช้งานจริงใน backend: products.py และ orders.py)
-- ============================================================
USE agrimatch;
GO

-- สินค้า + ชื่อผู้ขาย
CREATE OR ALTER VIEW dbo.vw_ProductWithSeller AS
SELECT p.id, p.title, p.description, p.price, p.stock, p.rice_standard, p.rice_variety,
       p.unit, p.image_url, p.broken_rice_percentage, p.ai_verified, p.is_active,
       p.owner_id, p.created_at,
       u.full_name AS seller_full_name,
       u.username  AS seller_username
FROM dbo.riceproducts p
LEFT JOIN dbo.user_rice u ON p.owner_id = u.id;
GO

-- คำสั่งซื้อ + ชื่อสินค้า + ข้อมูลผู้ซื้อ
CREATE OR ALTER VIEW dbo.vw_OrderDetail AS
SELECT o.id, o.product_id, o.buyer_id, o.seller_id, o.quantity, o.unit_price,
       o.total_amount, o.status, o.note, o.created_at, o.updated_at,
       p.title     AS product_title,
       p.image_url AS product_image_url,
       u.username  AS buyer_username,
       u.email     AS buyer_email,
       u.full_name AS buyer_full_name
FROM dbo.order_rice o
JOIN dbo.riceproducts p ON p.id = o.product_id
LEFT JOIN dbo.user_rice u ON u.id = o.buyer_id;
GO

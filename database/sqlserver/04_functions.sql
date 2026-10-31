-- ============================================================
-- Functions (ใช้ภายใน stored procedure)
-- ============================================================
USE agrimatch;
GO

-- ยอดรวม = จำนวน x ราคาต่อหน่วย (ปัด 2 ตำแหน่ง)
CREATE OR ALTER FUNCTION dbo.fn_OrderTotal (@quantity DECIMAL(10,2), @unit_price DECIMAL(10,2))
RETURNS DECIMAL(12,2)
AS
BEGIN
    RETURN ROUND(@quantity * @unit_price, 2);
END;
GO

-- สต็อกที่ขายได้จริงของสินค้า (สินค้าปิดการขาย/ไม่มีอยู่ = 0)
CREATE OR ALTER FUNCTION dbo.fn_AvailableStock (@product_id INT)
RETURNS INT
AS
BEGIN
    DECLARE @stock INT;
    SELECT @stock = stock FROM dbo.riceproducts WHERE id = @product_id AND is_active = 1;
    RETURN ISNULL(@stock, 0);
END;
GO

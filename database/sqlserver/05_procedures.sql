-- ============================================================
-- Stored procedures (เรียกจาก backend/routers/orders.py)
-- error ใช้ THROW รหัส 50400/50403/50404 -> backend แปลงเป็น HTTP 400/403/404
-- ============================================================
USE agrimatch;
GO

-- สร้างคำสั่งซื้อ: ตรวจสินค้า -> ตัด stock -> บันทึก order ใน transaction เดียว
CREATE OR ALTER PROCEDURE dbo.sp_CreateOrder
    @product_id INT,
    @buyer_id   INT,
    @quantity   DECIMAL(10,2),
    @note       NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @quantity IS NULL OR @quantity <= 0
        THROW 50400, N'จำนวนต้องมากกว่า 0', 1;

    DECLARE @price DECIMAL(12,2), @owner_id INT, @new_id INT;

    BEGIN TRY
        BEGIN TRAN;

        SELECT @price = price, @owner_id = owner_id
        FROM dbo.riceproducts WITH (UPDLOCK, HOLDLOCK)
        WHERE id = @product_id AND is_active = 1;

        IF @@ROWCOUNT = 0
            THROW 50404, N'ไม่พบสินค้านี้ หรือสินค้าถูกปิดการขายแล้ว', 1;

        IF dbo.fn_AvailableStock(@product_id) < @quantity
            THROW 50400, N'สินค้าคงเหลือไม่เพียงพอสำหรับจำนวนที่สั่ง', 1;

        UPDATE dbo.riceproducts SET stock = stock - @quantity WHERE id = @product_id;

        INSERT INTO dbo.order_rice (product_id, buyer_id, seller_id, quantity, unit_price, total_amount, status, note)
        VALUES (@product_id, @buyer_id, @owner_id, @quantity, @price,
                dbo.fn_OrderTotal(@quantity, @price), N'pending', @note);
        SET @new_id = SCOPE_IDENTITY();

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;

    SELECT * FROM dbo.vw_OrderDetail WHERE id = @new_id;
END;
GO

-- เปลี่ยนสถานะคำสั่งซื้อ: ตรวจสิทธิ์ตาม role, ยกเลิกแล้วคืน stock
CREATE OR ALTER PROCEDURE dbo.sp_UpdateOrderStatus
    @order_id INT,
    @status   NVARCHAR(20),
    @user_id  INT,
    @role     NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @status NOT IN (N'pending', N'confirmed', N'shipped', N'cancelled')
        THROW 50400, N'สถานะไม่ถูกต้อง', 1;

    DECLARE @old_status NVARCHAR(20), @buyer_id INT, @seller_id INT,
            @quantity DECIMAL(10,2), @product_id INT;

    BEGIN TRY
        BEGIN TRAN;

        SELECT @old_status = status, @buyer_id = buyer_id, @seller_id = seller_id,
               @quantity = quantity, @product_id = product_id
        FROM dbo.order_rice WITH (UPDLOCK, HOLDLOCK)
        WHERE id = @order_id;

        IF @@ROWCOUNT = 0
            THROW 50404, N'ไม่พบคำสั่งซื้อนี้', 1;

        IF @role = N'admin' OR (@role = N'seller' AND @seller_id = @user_id)
            SET @role = @role;  -- seller เจ้าของ order / admin เปลี่ยนเป็นสถานะใดก็ได้
        ELSE IF @role = N'buyer' AND @buyer_id = @user_id
        BEGIN
            IF @status <> N'cancelled' OR @old_status <> N'pending'
                THROW 50403, N'ผู้ซื้อยกเลิกได้เฉพาะคำสั่งซื้อที่ยังไม่ยืนยันเท่านั้น', 1;
        END
        ELSE
            THROW 50403, N'คุณไม่มีสิทธิ์แก้ไขคำสั่งซื้อนี้', 1;

        IF @status = N'cancelled' AND @old_status <> N'cancelled'
            UPDATE dbo.riceproducts SET stock = stock + @quantity WHERE id = @product_id;

        UPDATE dbo.order_rice SET status = @status WHERE id = @order_id;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;

    SELECT * FROM dbo.vw_OrderDetail WHERE id = @order_id;
END;
GO

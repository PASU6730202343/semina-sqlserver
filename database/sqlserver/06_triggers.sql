-- ============================================================
-- Triggers บนตาราง order_rice
-- ============================================================
USE agrimatch;
GO

-- 1) อัปเดต updated_at อัตโนมัติ (แทน ON UPDATE CURRENT_TIMESTAMP ของ MySQL)
CREATE OR ALTER TRIGGER dbo.trg_OrderRice_UpdatedAt
ON dbo.order_rice
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF TRIGGER_NESTLEVEL(OBJECT_ID(N'dbo.trg_OrderRice_UpdatedAt')) > 1 RETURN;
    UPDATE o SET updated_at = GETDATE()
    FROM dbo.order_rice o
    JOIN inserted i ON i.id = o.id;
END;
GO

-- 2) บันทึกประวัติเมื่อสร้าง order หรือสถานะเปลี่ยน ลงตาราง order_status_log
CREATE OR ALTER TRIGGER dbo.trg_OrderRice_StatusLog
ON dbo.order_rice
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.order_status_log (order_id, old_status, new_status)
    SELECT i.id, d.status, i.status
    FROM inserted i
    LEFT JOIN deleted d ON d.id = i.id
    WHERE d.id IS NULL OR d.status <> i.status;
END;
GO

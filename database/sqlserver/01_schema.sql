-- ============================================================
-- AgriMatch / Smart Rice Marketplace: schema สำหรับ SQL Server
-- รันซ้ำได้ (idempotent) ใช้ได้กับ SQL Server 2017 ขึ้นไป
-- ============================================================
IF DB_ID(N'agrimatch') IS NULL
    CREATE DATABASE agrimatch COLLATE Thai_100_CI_AS;
GO

USE agrimatch;
GO

-- ------------------------------------------------------------
-- user_rice: ผู้ใช้ 3 กลุ่ม (buyer / seller / admin)
-- ------------------------------------------------------------
IF OBJECT_ID(N'dbo.user_rice', N'U') IS NULL
CREATE TABLE dbo.user_rice (
    id             INT IDENTITY(1,1) CONSTRAINT PK_user_rice PRIMARY KEY,
    username       NVARCHAR(50)  NOT NULL CONSTRAINT UQ_user_rice_username UNIQUE,
    email          NVARCHAR(100) NOT NULL CONSTRAINT UQ_user_rice_email UNIQUE,
    password_hash  NVARCHAR(255) NOT NULL,            -- bcrypt hash เท่านั้น
    role           NVARCHAR(10)  NOT NULL CONSTRAINT DF_user_rice_role DEFAULT N'buyer'
                   CONSTRAINT CK_user_rice_role CHECK (role IN (N'buyer', N'seller', N'admin')),
    full_name      NVARCHAR(100) NULL,
    phone          NVARCHAR(20)  NULL,
    is_active      BIT NOT NULL CONSTRAINT DF_user_rice_active DEFAULT 1,
    email_verified BIT NOT NULL CONSTRAINT DF_user_rice_verified DEFAULT 1,
    created_at     DATETIME NOT NULL CONSTRAINT DF_user_rice_created DEFAULT GETDATE()
);
GO

-- ------------------------------------------------------------
-- email_verification_codes: รหัส OTP ยืนยันอีเมล
-- ------------------------------------------------------------
IF OBJECT_ID(N'dbo.email_verification_codes', N'U') IS NULL
CREATE TABLE dbo.email_verification_codes (
    id         INT IDENTITY(1,1) CONSTRAINT PK_email_verification_codes PRIMARY KEY,
    user_id    INT NOT NULL
               CONSTRAINT FK_email_verification_user REFERENCES dbo.user_rice(id) ON DELETE CASCADE,
    otp_hash   CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_email_verification_created DEFAULT GETDATE()
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_email_verification_user')
    CREATE INDEX idx_email_verification_user ON dbo.email_verification_codes(user_id);
GO

-- ------------------------------------------------------------
-- riceproducts: สินค้าข้าว
-- ------------------------------------------------------------
IF OBJECT_ID(N'dbo.riceproducts', N'U') IS NULL
CREATE TABLE dbo.riceproducts (
    id                     INT IDENTITY(1,1) CONSTRAINT PK_riceproducts PRIMARY KEY,
    title                  NVARCHAR(200) NOT NULL,
    description            NVARCHAR(MAX) NULL,
    price                  DECIMAL(12,2) NOT NULL CONSTRAINT DF_riceproducts_price DEFAULT 0,
    stock                  INT NOT NULL CONSTRAINT DF_riceproducts_stock DEFAULT 0,
    rice_standard          NVARCHAR(50)  NULL CONSTRAINT DF_riceproducts_standard DEFAULT N'general',
    rice_variety           NVARCHAR(100) NULL,
    unit                   NVARCHAR(50)  NULL CONSTRAINT DF_riceproducts_unit DEFAULT N'ถุง (5 กก.)',
    image_url              NVARCHAR(MAX) NULL,
    broken_rice_percentage FLOAT NULL CONSTRAINT DF_riceproducts_broken DEFAULT 0,
    ai_verified            BIT NULL CONSTRAINT DF_riceproducts_ai DEFAULT 0,
    is_active              BIT NULL CONSTRAINT DF_riceproducts_active DEFAULT 1,
    owner_id               INT NULL
                           CONSTRAINT FK_riceproducts_owner REFERENCES dbo.user_rice(id) ON DELETE SET NULL,
    created_at             DATETIME NULL CONSTRAINT DF_riceproducts_created DEFAULT GETDATE()
);
GO

-- ------------------------------------------------------------
-- order_rice: คำสั่งซื้อ
-- ------------------------------------------------------------
IF OBJECT_ID(N'dbo.order_rice', N'U') IS NULL
CREATE TABLE dbo.order_rice (
    id           INT IDENTITY(1,1) CONSTRAINT PK_order_rice PRIMARY KEY,
    product_id   INT NOT NULL CONSTRAINT FK_order_rice_product REFERENCES dbo.riceproducts(id),
    buyer_id     INT NOT NULL CONSTRAINT FK_order_rice_buyer   REFERENCES dbo.user_rice(id),
    seller_id    INT NULL     CONSTRAINT FK_order_rice_seller  REFERENCES dbo.user_rice(id),
    quantity     DECIMAL(10,2) NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL,   -- ราคาต่อหน่วย ณ ตอนสั่งซื้อ (snapshot)
    total_amount DECIMAL(12,2) NOT NULL,
    status       NVARCHAR(20) NOT NULL CONSTRAINT DF_order_rice_status DEFAULT N'pending'
                 CONSTRAINT CK_order_rice_status
                 CHECK (status IN (N'pending', N'confirmed', N'shipped', N'cancelled')),
    note         NVARCHAR(255) NULL,
    created_at   DATETIME NULL CONSTRAINT DF_order_rice_created DEFAULT GETDATE(),
    updated_at   DATETIME NULL CONSTRAINT DF_order_rice_updated DEFAULT GETDATE()
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_order_rice_buyer')
    CREATE INDEX idx_order_rice_buyer ON dbo.order_rice(buyer_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_order_rice_seller')
    CREATE INDEX idx_order_rice_seller ON dbo.order_rice(seller_id);
GO

-- ------------------------------------------------------------
-- order_status_log: ประวัติการเปลี่ยนสถานะ (เขียนโดย trigger)
-- ------------------------------------------------------------
IF OBJECT_ID(N'dbo.order_status_log', N'U') IS NULL
CREATE TABLE dbo.order_status_log (
    id         INT IDENTITY(1,1) CONSTRAINT PK_order_status_log PRIMARY KEY,
    order_id   INT NOT NULL
               CONSTRAINT FK_order_status_log_order REFERENCES dbo.order_rice(id) ON DELETE CASCADE,
    old_status NVARCHAR(20) NULL,
    new_status NVARCHAR(20) NOT NULL,
    changed_at DATETIME NOT NULL CONSTRAINT DF_order_status_log_changed DEFAULT GETDATE()
);
GO

# ฐานข้อมูล SQL Server (agrimatch)

## สร้างฐานข้อมูลบนเครื่องตัวเอง
ต้องมี SQL Server, `sqlcmd` และ ODBC Driver 17 for SQL Server

```powershell
cd database\sqlserver
.\setup.ps1                                  # Windows Authentication
.\setup.ps1 -User sa -Password "รหัสของคุณ"   # หรือใช้ SQL login
```
สคริปต์รันไฟล์ `01`–`06` ตามลำดับ และรันซ้ำได้ (ไม่ลบข้อมูลเดิม)

| ไฟล์ | เนื้อหา |
|---|---|
| 01_schema.sql | DB `agrimatch`, ตาราง, index, FK |
| 02_seed.sql | user ทดสอบ 3 บัญชี + สินค้า 11 รายการ |
| 03_views.sql | `vw_ProductWithSeller`, `vw_OrderDetail` |
| 04_functions.sql | `fn_OrderTotal`, `fn_AvailableStock` |
| 05_procedures.sql | `sp_CreateOrder`, `sp_UpdateOrderStatus` |
| 06_triggers.sql | `trg_OrderRice_UpdatedAt`, `trg_OrderRice_StatusLog` (+ตาราง `order_status_log`) |

## ตั้งค่า backend (`backend/.env`, ดูตัวอย่างที่ `.env.example`)
```
DB_HOST=localhost        # หรือ lpc:localhost ถ้า SQL Server ไม่ได้เปิด TCP/IP
DB_PORT=1433             # เว้นว่างได้ถ้าใช้ lpc: หรือชื่อ instance
DB_NAME=agrimatch
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_TRUSTED_CONNECTION=yes   # no = ใช้ DB_USER / DB_PASSWORD
```
จากนั้น `pip install -r requirements.txt` แล้วรัน `uvicorn main:app`

บัญชีทดสอบ: `admin/admin123`, `seller1/seller123`, `buyer1/buyer123`

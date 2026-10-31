import torch
from ultralytics import YOLO

def main():
    # 1. ตรวจสอบการใช้งาน GPU (CUDA)
    print("="*50)
    if torch.cuda.is_available():
        print(f"CUDA is available! Training on GPU: {torch.cuda.get_device_name(0)}")
    else:
        print("CUDA is NOT available. Training on CPU (this might be slow).")
    print("="*50)

    # 2. โหลด Base Model
    # เราใช้ yolov8n.pt (Nano) ซึ่งเบาและเร็วที่สุด เหมาะกับการเริ่มต้น
    print("Loading YOLOv8 nano model (yolov8n.pt)...")
    model = YOLO("yolov8n.pt")

    # 3. กำหนด Path ไปยังไฟล์ data.yaml ของคุณ
    # หากรันใน Windows และใช้ Backslash ควรใส่ r ข้างหน้า string หรือใช้ Forward slash
    data_path = "C:/Users/admin/Downloads/Find rice.yolov8/data.yaml"
    
    # 4. เริ่มการ Train
    print(f"\nStarting training process with dataset: {data_path}")
    print("Epochs: 50, Image Size: 640")
    
    results = model.train(
        data=data_path,
        epochs=50,
        imgsz=640,
        batch=16, # สามารถปรับ batch size ได้ตามขนาด VRAM ของ GPU
        name="rice_detection_model", # ชื่อโฟลเดอร์สำหรับเซฟผลลัพธ์
        device=0 if torch.cuda.is_available() else 'cpu' # บังคับรันบน GPU ถ้ามี
    )
    
    # 5. แสดงผลหลัง Train เสร็จ
    print("\n" + "="*50)
    print("Training Complete!")
    print("ผลลัพธ์และโมเดลถูกบันทึกไว้ที่:")
    print("- โฟลเดอร์: runs/detect/rice_detection_model")
    print("- ไฟล์โมเดลที่ดีที่สุด (นำไปใช้งานจริง): runs/detect/rice_detection_model/weights/best.pt")
    print("="*50)

if __name__ == '__main__':
    # สำหรับ Windows แนะนำให้รันด้วยการครอบ if __name__ == '__main__' เพื่อป้องกันปัญหา multi-processing
    main()

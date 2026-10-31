from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

MODEL_PATH = Path(__file__).resolve().parent / "best.pt"

app = FastAPI(title="Rice Grading AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if not MODEL_PATH.is_file():
    raise RuntimeError(f"Trained rice model not found: {MODEL_PATH}")
model = YOLO(str(MODEL_PATH))
print(f"Loaded trained rice model: {MODEL_PATH}")


@app.get("/")
def health():
    return {"message": "Rice Grading AI service is running"}


def _run_prediction(contents: bytes, rice_variety: Optional[str]) -> dict:
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Render's free tier gives this service only 0.1 CPU — a single scan at
    # imgsz=640 was taking 48-57s, long enough that Render's health check
    # decided the service was unresponsive and restarted it mid-request.
    # Trade some accuracy for a lot of speed to stay well under that.
    max_side = 640
    h, w = img.shape[:2]
    if max(h, w) > max_side:
        scale = max_side / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    results = model.predict(img, conf=0.15, iou=0.45, imgsz=320, agnostic_nms=True)
    result = results[0]

    grain_classes = {"broken_rice", "broken_grains", "half_grain", "full_grain", "whole_grain", "whole_grains"}
    broken_classes = {"broken_rice", "broken_grains", "half_grain"}
    detections = []
    grain_count = 0
    broken_grains = 0
    whole_grains = 0

    for box in result.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        conf = float(box.conf[0])
        cls_id = int(box.cls[0])
        class_name = result.names[cls_id]

        if class_name in grain_classes:
            grain_count += 1
            if class_name in broken_classes:
                broken_grains += 1
            else:
                whole_grains += 1

        detections.append({
            "xmin": int(x1),
            "ymin": int(y1),
            "xmax": int(x2),
            "ymax": int(y2),
            "confidence": round(conf, 4),
            "class_name": class_name,
        })

    total_grains = grain_count
    broken_percentage = round((broken_grains / total_grains) * 100, 2) if total_grains > 0 else 0.0

    base_price = 15000 if (rice_variety or "jasmine").lower() == "jasmine" else 12000
    penalty = (broken_percentage // 5) * 500
    suggested_price = max(base_price - penalty, 8000)
    price_range = f"{int(suggested_price - 250)} - {int(suggested_price + 250)} บาท/ตัน"

    return {
        "success": True,
        "message": f"พบเมล็ดข้าวทั้งหมด {total_grains} เมล็ด: เมล็ดสมบูรณ์ {whole_grains} เมล็ด | เมล็ดแตกหัก {broken_grains} เมล็ด ({broken_percentage}%)",
        "analysis": {
            "total_grains": total_grains,
            "whole_grains": whole_grains,
            "broken_grains": broken_grains,
            "broken_percentage": broken_percentage,
            "rice_grade_estimate": (
                f"ข้าวหักไม่เกิน {int(((broken_percentage // 5) + 1) * 5)}%"
                if total_grains else "ประเมินไม่ได้ ไม่พบเมล็ดข้าว"
            ),
        },
        "price_recommendation": {
            "suggested_price": suggested_price,
            "price_range": price_range,
        },
        "detections": detections,
    }


@app.post("/predict-rice-grade")
async def predict_rice_grade(
    file: UploadFile = File(...),
    rice_variety: Optional[str] = Form("jasmine"),
):
    contents = await file.read()
    try:
        return await run_in_threadpool(_run_prediction, contents, rice_variety)
    except HTTPException:
        raise
    except Exception as e:
        print("Error processing image with YOLO:", e)
        raise HTTPException(status_code=500, detail=str(e))

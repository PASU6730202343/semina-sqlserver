from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.concurrency import run_in_threadpool
from typing import Optional
import asyncio
import gc
import cv2
import numpy as np
import time
from .rice_model import model, load_rice_model

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Processing"]
)


def _run_prediction(contents: bytes, rice_variety: Optional[str]) -> dict:
    """CPU-bound YOLO inference. Runs in a worker thread so a slow scan
    doesn't block the event loop for everyone else — see predict_rice_grade
    for why this can't be a separate process on this particular server."""
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Full-resolution phone photos make this too heavy for this server.
    max_side = 1280
    h, w = img.shape[:2]
    if max(h, w) > max_side:
        scale = max_side / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    stage_started = time.perf_counter()
    request_model = load_rice_model()
    print(f"AI timing: model (re)loaded in {time.perf_counter() - stage_started:.2f}s", flush=True)

    stage_started = time.perf_counter()
    results = request_model.predict(img, conf=0.15, iou=0.45, imgsz=640, agnostic_nms=True)
    print(f"AI timing: inference finished in {time.perf_counter() - stage_started:.2f}s", flush=True)

    detections = []
    result = results[0]

    grain_classes = {"broken_rice", "broken_grains", "half_grain", "full_grain", "whole_grain", "whole_grains"}
    broken_classes = {"broken_rice", "broken_grains", "half_grain"}
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
            "class_name": class_name
        })

    total_grains = grain_count

    broken_percentage = round((broken_grains / total_grains) * 100, 2) if total_grains > 0 else 0.0

    base_price = 15000 if (rice_variety or "jasmine").lower() == 'jasmine' else 12000
    penalty = (broken_percentage // 5) * 500
    suggested_price = max(base_price - penalty, 8000)
    price_range = f"{int(suggested_price - 250)} - {int(suggested_price + 250)} บาท/ตัน"

    response = {
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
            )
        },
        "price_recommendation": {
            "suggested_price": suggested_price,
            "price_range": price_range
        },
        "detections": detections,
    }

    del img, results, result, request_model
    gc.collect()

    return response


# Only one scan runs at a time. Threads can't be forcibly killed if one gets
# stuck (and this sandboxed server refuses to create separate processes —
# see the PermissionError this replaced), so the next best thing is making
# sure a stuck scan can never pile up on top of another one and starve it
# for CPU too. A second request arriving while one is in flight is rejected
# immediately with a clear message instead of competing for the same core.
_scan_in_progress = False


def _run_prediction_and_release(contents: bytes, rice_variety: Optional[str]) -> dict:
    """Wraps _run_prediction so the in-progress flag only clears once the
    background thread truly finishes — not when the HTTP handler merely
    stops waiting for it at the 45s mark. The thread itself can't be killed,
    so this is what actually stops a stuck scan from letting a second one
    start on top of it."""
    global _scan_in_progress
    try:
        return _run_prediction(contents, rice_variety)
    finally:
        _scan_in_progress = False


@router.post("/predict-rice-grade", response_model=dict)
async def predict_rice_grade(
    file: UploadFile = File(...),
    rice_variety: Optional[str] = Form("jasmine"),
):
    global _scan_in_progress

    if model is None:
        raise HTTPException(status_code=500, detail="YOLO model not loaded.")

    if _scan_in_progress:
        raise HTTPException(
            status_code=429,
            detail="ระบบกำลังวิเคราะห์ภาพอื่นอยู่ กรุณารอสักครู่แล้วลองใหม่",
        )

    _scan_in_progress = True
    try:
        contents = await file.read()
        try:
            return await asyncio.wait_for(
                run_in_threadpool(_run_prediction_and_release, contents, rice_variety),
                timeout=45,
            )
        except asyncio.TimeoutError:
            # The thread is still running in the background and will clear
            # _scan_in_progress itself whenever it actually finishes — do not
            # clear it here, or a second request could start on top of it.
            raise HTTPException(
                status_code=504,
                detail="การวิเคราะห์ภาพใช้เวลานานเกินไป กรุณาลองใหม่ด้วยภาพที่ชัดเจนและมีขนาดเล็กลง",
            )
    except HTTPException:
        raise
    except Exception as e:
        print("Error processing image with YOLO:", e)
        _scan_in_progress = False
        raise HTTPException(status_code=500, detail=str(e))

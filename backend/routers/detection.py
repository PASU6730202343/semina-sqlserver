from fastapi import APIRouter, HTTPException, UploadFile, File
import cv2
import numpy as np
import base64
from .rice_model import model

router = APIRouter(
    tags=["Object Detection"]
)

@router.post("/predict", response_model=dict)
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="YOLO model not loaded.")
        
    try:
        # Read the uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Run YOLO inference
        results = model.predict(img, conf=0.15, iou=0.45, imgsz=640, agnostic_nms=True) # you can adjust confidence threshold
        
        detections = []
        
        # We assume one image is passed, so we take results[0]
        result = results[0]
        
        # Draw bounding boxes on the image
        img_with_boxes = result.plot()
        
        # Process bounding boxes
        for box in result.boxes:
            # Extract coordinates, confidence, and class
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            class_name = result.names[cls_id]
            
            detections.append({
                "xmin": int(x1),
                "ymin": int(y1),
                "xmax": int(x2),
                "ymax": int(y2),
                "confidence": round(conf, 4),
                "class_name": class_name
            })
            
        # Convert the processed image to Base64 to send to the frontend
        _, buffer = cv2.imencode('.jpg', img_with_boxes)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "success": True,
            "detections": detections,
            "total_objects": len(detections),
            "image_base64": f"data:image/jpeg;base64,{img_base64}"
        }

    except Exception as e:
        print("Error processing image with YOLO:", e)
        raise HTTPException(status_code=500, detail=str(e))

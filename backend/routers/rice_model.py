from pathlib import Path
from ultralytics import YOLO

MODEL_PATH = Path(__file__).resolve().parents[1] / "best.pt"

# This server has no outbound internet access. Ultralytics normally phones
# home for anonymous usage analytics on the first run of each session, and
# that request can hang for a long time instead of failing fast when there is
# no route out at all. Disable it before the model ever runs a prediction.
try:
    from ultralytics import settings as _ultra_settings
    _ultra_settings.update({"sync": False})
except Exception as exc:
    print(f"Could not disable ultralytics telemetry sync: {exc}")


def load_rice_model():
    if not MODEL_PATH.is_file():
        raise RuntimeError(f"Trained rice model not found: {MODEL_PATH}")
    try:
        model = YOLO(str(MODEL_PATH))
    except Exception as exc:
        raise RuntimeError(f"Could not load trained rice model at {MODEL_PATH}: {exc}") from exc
    print(f"Loaded trained rice model: {MODEL_PATH}")
    return model


model = load_rice_model()

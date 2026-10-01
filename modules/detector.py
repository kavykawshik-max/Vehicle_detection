"""
YOLOv8 Object Detection Inference Engine.
Loads pretrained weights (YOLOv8n), runs inference on image arrays,
and extracts bounding boxes, class names, and confidence scores.
"""
import os
import logging
from typing import Dict, List, Optional, Tuple, Any
import numpy as np

from utils.config import DEFAULT_CONFIDENCE_THRESHOLD, DEFAULT_MODEL_NAME, DEFAULT_INPUT_SIZE

logger = logging.getLogger("detector")


class YOLOVehicleDetector:
    """
    Manages YOLOv8n model loading, device selection, and inference.
    """

    def __init__(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
        device: Optional[str] = None,
    ):
        self.model_name = model_name
        self.confidence_threshold = confidence_threshold
        self.device = device or self._detect_device()
        self.model = None
        self._load_model()

    def _detect_device(self) -> str:
        """Determines whether CUDA GPU, Apple MPS, or CPU is available."""
        try:
            import torch
            if torch.cuda.is_available():
                return "cuda:0"
            if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                return "mps"
        except Exception:
            pass
        return "cpu"

    def _load_model(self):
        """Loads Ultralytics YOLO model."""
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_name)
            logger.info(f"Loaded YOLO model '{self.model_name}' on device '{self.device}'.")
        except Exception as e:
            logger.warning(f"Could not load Ultralytics YOLO model '{self.model_name}': {e}. Detector in standby.")
            self.model = None

    def predict(
        self,
        image_bgr: np.ndarray,
        confidence_threshold: Optional[float] = None,
        imgsz: int = DEFAULT_INPUT_SIZE,
    ) -> List[Dict[str, Any]]:
        """
        Runs object detection on a BGR image array.
        Returns a list of detected items:
        [
            {'box': [x1, y1, x2, y2], 'class_name': str, 'confidence': float, 'class_id': int},
            ...
        ]
        """
        conf_thr = confidence_threshold if confidence_threshold is not None else self.confidence_threshold

        if self.model is None:
            # Fallback when running without ultralytics weights downloaded
            return []

        try:
            # Run inference
            results = self.model.predict(
                source=image_bgr,
                conf=conf_thr,
                imgsz=imgsz,
                device=self.device,
                verbose=False,
            )

            detections: List[Dict[str, Any]] = []
            if not results or len(results) == 0:
                return detections

            res = results[0]
            names = res.names  # Mapping int -> class name
            boxes = res.boxes

            if boxes is None:
                return detections

            for box in boxes:
                xyxy = box.xyxy[0].cpu().numpy().tolist()  # [x1, y1, x2, y2]
                conf = float(box.conf[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                class_name = names.get(cls_id, f"class_{cls_id}")

                detections.append({
                    "box": [round(c, 2) for c in xyxy],
                    "class_name": class_name.lower().strip(),
                    "confidence": round(conf, 4),
                    "class_id": cls_id,
                })

            return detections
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return []

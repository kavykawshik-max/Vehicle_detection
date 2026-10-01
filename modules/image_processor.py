"""
Image Processor Module.
Handles end-to-end pipeline for single image surveillance:
Decoding, YOLO inference, classification, bounding box annotation, and scene reporting.
"""
import time
from typing import Dict, List, Optional, Tuple, Any
import cv2
import numpy as np

from modules.detector import YOLOVehicleDetector
from modules.vehicle_classifier import VehicleClassifier, DetectionItem
from modules.object_description import ObjectDescriptionEngine
from utils.visualization import draw_bounding_box, draw_hud_header


class ImageProcessor:
    """
    Executes end-to-end computer vision analysis on uploaded images.
    """

    def __init__(
        self,
        detector: Optional[YOLOVehicleDetector] = None,
        confidence_threshold: float = 0.35,
    ):
        self.detector = detector or YOLOVehicleDetector(confidence_threshold=confidence_threshold)
        self.classifier = VehicleClassifier(confidence_threshold=confidence_threshold)

    def process_image(
        self,
        image_bytes: bytes,
        confidence_threshold: Optional[float] = None,
        imgsz: int = 640,
    ) -> Dict[str, Any]:
        """
        Processes image buffer and returns full analysis dictionary:
        {
            'annotated_image': np.ndarray,
            'original_image': np.ndarray,
            'total_vehicles': int,
            'summary': dict,
            'scene_description': dict,
            'vehicle_detections': list,
            'non_vehicle_detections': list,
            'processing_time': float,
        }
        """
        start_t = time.time()
        conf_thr = confidence_threshold or self.classifier.confidence_threshold

        # Decode image using OpenCV
        np_arr = np.frombuffer(image_bytes, np.uint8)
        image_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image_bgr is None:
            raise ValueError("Failed to decode image. File may be corrupted or in an unsupported format.")

        orig_image = image_bgr.copy()

        # Run inference
        raw_detections = self.detector.predict(image_bgr, confidence_threshold=conf_thr, imgsz=imgsz)

        # Classify into vehicles vs non-vehicles
        vehicles, non_vehicles = self.classifier.filter_and_classify(raw_detections, confidence_threshold=conf_thr)

        # Vehicle counts summary
        v_summary = self.classifier.get_vehicle_summary(vehicles)

        # Generate contextual surveillance description
        scene_report = ObjectDescriptionEngine.describe_scene(vehicles, non_vehicles)

        # Annotate image: vehicles first (bold), then non-vehicles
        annotated = image_bgr.copy()

        # Draw non-vehicles with subtle borders
        for item in non_vehicles:
            annotated = draw_bounding_box(
                annotated,
                box=item.box,
                class_name=item.class_name,
                confidence=item.confidence,
                is_vehicle=False,
            )

        # Draw vehicles with primary high-visibility borders
        for item in vehicles:
            annotated = draw_bounding_box(
                annotated,
                box=item.box,
                class_name=item.class_name,
                confidence=item.confidence,
                is_vehicle=True,
            )

        # HUD top telemetry banner
        annotated = draw_hud_header(
            annotated,
            total_vehicles=v_summary["total_vehicles"],
            active_tracks=0,
            fps=None,
        )

        latency = time.time() - start_t

        return {
            "annotated_image": annotated,
            "original_image": orig_image,
            "total_vehicles": v_summary["total_vehicles"],
            "summary": v_summary,
            "scene_description": scene_report,
            "vehicle_detections": [v.to_dict() for v in vehicles],
            "non_vehicle_detections": [nv.to_dict() for nv in non_vehicles],
            "processing_time": round(latency, 3),
        }

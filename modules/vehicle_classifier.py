"""
Vehicle Classifier and Category Categorizer.
Classifies detected bounding boxes into vehicle and non-vehicle categories,
enforcing standard COCO class definitions and confidence thresholds.
"""
from typing import Dict, List, Optional, Tuple, Any
from utils.config import VEHICLE_CLASSES, NON_VEHICLE_CLASSES, DEFAULT_CONFIDENCE_THRESHOLD


class DetectionItem:
    """Represents a single bounding box detection result."""
    def __init__(
        self,
        box: List[float],
        class_name: str,
        confidence: float,
        tracking_id: Optional[int] = None,
    ):
        self.box = [round(float(coord), 2) for coord in box]  # [x1, y1, x2, y2]
        self.class_name = class_name.lower().strip()
        self.confidence = round(float(confidence), 4)
        self.tracking_id = tracking_id
        self.is_vehicle = self.class_name in VEHICLE_CLASSES

    def to_dict(self) -> Dict[str, Any]:
        return {
            "box": self.box,
            "class_name": self.class_name,
            "confidence": self.confidence,
            "tracking_id": self.tracking_id,
            "is_vehicle": self.is_vehicle,
        }


class VehicleClassifier:
    """
    Classifies raw object detection bounding boxes, splits vehicle vs non-vehicle,
    and calculates accurate counts by category.
    """

    def __init__(self, confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD):
        self.confidence_threshold = confidence_threshold
        self.vehicle_classes = set(VEHICLE_CLASSES)
        self.non_vehicle_classes = set(NON_VEHICLE_CLASSES)

    def is_vehicle_class(self, class_name: str) -> bool:
        """Determines if a given label belongs to the official vehicle categories."""
        return class_name.lower().strip() in self.vehicle_classes

    def filter_and_classify(
        self,
        raw_detections: List[Dict[str, Any]],
        confidence_threshold: Optional[float] = None,
    ) -> Tuple[List[DetectionItem], List[DetectionItem]]:
        """
        Filters raw detections by confidence threshold and segregates them into:
        (vehicle_detections, non_vehicle_detections).
        
        raw_detections items: {'box': [x1, y1, x2, y2], 'class_name': str, 'confidence': float, 'tracking_id': opt}
        """
        threshold = confidence_threshold if confidence_threshold is not None else self.confidence_threshold
        vehicles: List[DetectionItem] = []
        non_vehicles: List[DetectionItem] = []

        for item in raw_detections:
            conf = float(item.get("confidence", 0.0))
            if conf < threshold:
                continue

            c_name = str(item.get("class_name", "")).lower().strip()
            box = item.get("box", [0, 0, 0, 0])
            tid = item.get("tracking_id", None)

            detection = DetectionItem(box=box, class_name=c_name, confidence=conf, tracking_id=tid)

            if detection.is_vehicle:
                vehicles.append(detection)
            else:
                non_vehicles.append(detection)

        return vehicles, non_vehicles

    def count_by_category(self, detections: List[DetectionItem]) -> Dict[str, int]:
        """
        Tally counts per class name for the provided detections.
        """
        counts: Dict[str, int] = {}
        for d in detections:
            counts[d.class_name] = counts.get(d.class_name, 0) + 1
        return counts

    def get_vehicle_summary(self, vehicle_detections: List[DetectionItem]) -> Dict[str, Any]:
        """
        Summarizes vehicle detections into total counts and category breakdowns.
        """
        counts = self.count_by_category(vehicle_detections)
        total = len(vehicle_detections)
        avg_conf = (
            sum(d.confidence for d in vehicle_detections) / total
            if total > 0
            else 0.0
        )

        return {
            "total_vehicles": total,
            "counts_by_category": counts,
            "cars": counts.get("car", 0),
            "motorcycles": counts.get("motorcycle", 0),
            "buses": counts.get("bus", 0),
            "trucks": counts.get("truck", 0),
            "bicycles": counts.get("bicycle", 0),
            "trains": counts.get("train", 0),
            "average_confidence": round(avg_conf, 4),
        }

"""
Object Description and Non-Vehicle Scene Captioning Module.
Generates structured scene reports when no vehicles are detected,
identifying visible non-vehicle objects (people, animals, street furniture)
and providing official surveillance descriptions.
"""
from typing import Dict, List, Optional, Any
from modules.vehicle_classifier import DetectionItem


class ObjectDescriptionEngine:
    """
    Formulates precise contextual descriptions for images and video frames.
    Guarantees that scenes without vehicles report zero vehicle counts and describe visible objects.
    """

    @staticmethod
    def describe_scene(
        vehicle_detections: List[DetectionItem],
        non_vehicle_detections: List[DetectionItem],
        raw_description_hint: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Builds a comprehensive detection statement according to official surveillance standards.
        """
        vehicle_count = len(vehicle_detections)
        non_vehicle_count = len(non_vehicle_detections)

        # Extract unique non-vehicle object classes
        other_objects_tally: Dict[str, int] = {}
        for d in non_vehicle_detections:
            name = d.class_name.capitalize()
            other_objects_tally[name] = other_objects_tally.get(name, 0) + 1

        other_objects_list = [f"{count} {name}" if count > 1 else name for name, count in other_objects_tally.items()]
        other_objects_str = ", ".join(other_objects_list) if other_objects_list else "None detected"

        if vehicle_count == 0:
            status = "NO VEHICLES DETECTED"
            classification = "Non-Vehicle Scene"

            if non_vehicle_count > 0:
                desc = f"The image contains {', '.join([f'{count} {name.lower()}' if count > 1 else f'a {name.lower()}' for name, count in other_objects_tally.items()])}. No motorized or non-motorized vehicles were observed."
            else:
                desc = "No vehicles or recognized objects were detected in this image. Scene appears empty or contains non-cataloged visual features."

            if raw_description_hint:
                desc += f" Additional context: {raw_description_hint}"

            return {
                "vehicle_detection_status": status,
                "total_vehicles_detected": 0,
                "other_objects_detected": list(other_objects_tally.keys()),
                "other_objects_summary": other_objects_str,
                "image_classification": classification,
                "description": desc,
                "has_vehicles": False,
            }

        # Vehicles are present
        status = f"VEHICLES DETECTED ({vehicle_count} UNITS)"
        classification = "Traffic / Roadway Scene"

        # Tally vehicle types
        v_tally: Dict[str, int] = {}
        for d in vehicle_detections:
            v_name = d.class_name.capitalize()
            v_tally[v_name] = v_tally.get(v_name, 0) + 1

        v_summary_parts = [f"{count} {name}" if count > 1 else f"1 {name}" for name, count in v_tally.items()]
        v_summary = ", ".join(v_summary_parts)

        desc = f"Active traffic roadway with {vehicle_count} detected vehicle(s): {v_summary}."
        if non_vehicle_count > 0:
            desc += f" Also observed {other_objects_str}."

        return {
            "vehicle_detection_status": status,
            "total_vehicles_detected": vehicle_count,
            "other_objects_detected": list(other_objects_tally.keys()),
            "other_objects_summary": other_objects_str,
            "image_classification": classification,
            "description": desc,
            "has_vehicles": True,
        }

"""
Computer vision visualization utilities for OpenCV frames.
Draws color-coded bounding boxes, class labels, confidence scores,
virtual counting lines, and government-grade HUD telemetry overlays.
"""
from typing import Dict, List, Optional, Tuple, Any
import cv2
import numpy as np

from utils.config import CLASS_COLORS_BGR


def get_color_for_class(class_name: str, is_vehicle: bool) -> Tuple[int, int, int]:
    """Retrieves standard BGR color for class or fallback."""
    if class_name in CLASS_COLORS_BGR:
        return CLASS_COLORS_BGR[class_name]
    return CLASS_COLORS_BGR["default_vehicle"] if is_vehicle else CLASS_COLORS_BGR["default_non_vehicle"]


def draw_bounding_box(
    image: np.ndarray,
    box: List[int],
    class_name: str,
    confidence: float,
    is_vehicle: bool = True,
    tracking_id: Optional[int] = None,
) -> np.ndarray:
    """
    Draws an anti-aliased bounding box with translucent background header for label.
    box: [x1, y1, x2, y2]
    """
    annotated = image.copy()
    x1, y1, x2, y2 = [int(v) for v in box]
    h, w = annotated.shape[:2]

    # Clamp coordinates to frame boundaries
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w - 1, x2), min(h - 1, y2)

    color = get_color_for_class(class_name, is_vehicle)
    thickness = 2 if is_vehicle else 1

    # Draw main bounding rectangle
    cv2.rectangle(annotated, (x1, y1), (x2, y2), color, thickness, cv2.LINE_AA)

    # Label text formulation
    if tracking_id is not None:
        label = f"ID #{tracking_id} | {class_name.upper()} {confidence * 100:.1f}%"
    else:
        label = f"{class_name.upper()} {confidence * 100:.1f}%"

    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.5
    font_thickness = 1
    (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, font_thickness)

    # Label badge background
    badge_y1 = max(0, y1 - text_h - 8)
    badge_y2 = y1
    badge_x2 = min(w - 1, x1 + text_w + 10)

    # Header rectangle
    cv2.rectangle(annotated, (x1, badge_y1), (badge_x2, badge_y2), color, -1)
    
    # White or dark text depending on luminance
    text_color = (255, 255, 255)
    cv2.putText(
        annotated,
        label,
        (x1 + 4, badge_y2 - 4),
        font,
        font_scale,
        text_color,
        font_thickness,
        cv2.LINE_AA,
    )

    # Corner brackets for surveillance aesthetic
    corner_len = min(15, (x2 - x1) // 3, (y2 - y1) // 3)
    if corner_len > 4:
        # Top-left
        cv2.line(annotated, (x1, y1), (x1 + corner_len, y1), color, thickness + 1)
        cv2.line(annotated, (x1, y1), (x1, y1 + corner_len), color, thickness + 1)
        # Top-right
        cv2.line(annotated, (x2, y1), (x2 - corner_len, y1), color, thickness + 1)
        cv2.line(annotated, (x2, y1), (x2, y1 + corner_len), color, thickness + 1)
        # Bottom-left
        cv2.line(annotated, (x1, y2), (x1 + corner_len, y2), color, thickness + 1)
        cv2.line(annotated, (x1, y2), (x1, y2 - corner_len), color, thickness + 1)
        # Bottom-right
        cv2.line(annotated, (x2, y2), (x2 - corner_len, y2), color, thickness + 1)
        cv2.line(annotated, (x2, y2), (x2, y2 - corner_len), color, thickness + 1)

    return annotated


def draw_virtual_line(
    image: np.ndarray,
    line_y: int,
    count_a_to_b: int,
    count_b_to_a: int,
    line_name_a: str = "A -> B",
    line_name_b: str = "B -> A",
) -> np.ndarray:
    """
    Draws a horizontal counting line across the frame with directional HUD badges.
    """
    annotated = image.copy()
    h, w = annotated.shape[:2]
    line_y = max(10, min(h - 10, line_y))

    # Semi-transparent overlay line
    overlay = annotated.copy()
    cv2.line(overlay, (0, line_y), (w, line_y), (0, 255, 255), 2, cv2.LINE_AA)
    cv2.addWeighted(overlay, 0.8, annotated, 0.2, 0, annotated)

    # Left Badge (Direction A -> B)
    badge_text_a = f"{line_name_a}: {count_a_to_b}"
    cv2.rectangle(annotated, (15, line_y - 28), (220, line_y - 4), (20, 20, 20), -1)
    cv2.rectangle(annotated, (15, line_y - 28), (220, line_y - 4), (0, 220, 255), 1)
    cv2.putText(
        annotated,
        badge_text_a,
        (22, line_y - 11),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.45,
        (0, 240, 255),
        1,
        cv2.LINE_AA,
    )

    # Right Badge (Direction B -> A)
    badge_text_b = f"{line_name_b}: {count_b_to_a}"
    cv2.rectangle(annotated, (w - 235, line_y + 4), (w - 15, line_y + 28), (20, 20, 20), -1)
    cv2.rectangle(annotated, (w - 235, line_y + 4), (w - 15, line_y + 28), (255, 140, 0), 1)
    cv2.putText(
        annotated,
        badge_text_b,
        (w - 228, line_y + 21),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.45,
        (255, 180, 50),
        1,
        cv2.LINE_AA,
    )

    return annotated


def draw_hud_header(
    image: np.ndarray,
    total_vehicles: int,
    active_tracks: int,
    fps: Optional[float] = None,
    timestamp_str: Optional[str] = None,
) -> np.ndarray:
    """
    Draws a government surveillance HUD top banner.
    """
    annotated = image.copy()
    h, w = annotated.shape[:2]

    # Top dark HUD ribbon
    ribbon_h = 32
    overlay = annotated.copy()
    cv2.rectangle(overlay, (0, 0), (w, ribbon_h), (12, 24, 38), -1)
    cv2.addWeighted(overlay, 0.85, annotated, 0.15, 0, annotated)

    # Border line
    cv2.line(annotated, (0, ribbon_h), (w, ribbon_h), (40, 80, 120), 1)

    font = cv2.FONT_HERSHEY_SIMPLEX
    # Left status
    sys_text = "AI TRAFFIC SURVEILLANCE FEED [ONLINE]"
    cv2.putText(annotated, sys_text, (12, 21), font, 0.45, (80, 240, 160), 1, cv2.LINE_AA)

    # Center statistics
    stats_text = f"VEHICLES DETECTED: {total_vehicles} | ACTIVE TRACKS: {active_tracks}"
    (tw, _), _ = cv2.getTextSize(stats_text, font, 0.45, 1)
    cv2.putText(annotated, stats_text, (max(w // 2 - tw // 2, 260), 21), font, 0.45, (255, 255, 255), 1, cv2.LINE_AA)

    # Right telemetry
    right_info = []
    if fps:
        right_info.append(f"{fps:.1f} FPS")
    if timestamp_str:
        right_info.append(timestamp_str)
    if right_info:
        r_text = " | ".join(right_info)
        (rw, _), _ = cv2.getTextSize(r_text, font, 0.42, 1)
        cv2.putText(annotated, r_text, (w - rw - 14, 21), font, 0.42, (180, 200, 220), 1, cv2.LINE_AA)

    return annotated

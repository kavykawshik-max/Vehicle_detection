"""
System Configuration for AI-Based Intelligent Vehicle Detection & Traffic Counting.
Defines model parameters, COCO vehicle classes, non-vehicle labels, colors, and thresholds.
"""
from typing import Dict, Set, Tuple

# Standard COCO vehicle classes
VEHICLE_CLASSES: Set[str] = {
    "car",
    "motorcycle",
    "bus",
    "truck",
    "bicycle",
    "train",
}

# Common COCO non-vehicle classes for contextual scene identification
NON_VEHICLE_CLASSES: Set[str] = {
    "person", "dog", "cat", "bird", "horse", "sheep", "cow", "elephant", "bear",
    "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase",
    "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat",
    "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle",
    "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut",
    "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet",
    "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave",
    "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase",
    "scissors", "teddy bear", "hair drier", "toothbrush", "traffic light",
    "fire hydrant", "stop sign", "parking meter", "bench"
}

# Detection defaults
DEFAULT_CONFIDENCE_THRESHOLD: float = 0.35
DEFAULT_IOU_THRESHOLD: float = 0.45
DEFAULT_MODEL_NAME: str = "yolov8n.pt"
DEFAULT_INPUT_SIZE: int = 640

# Color mapping in BGR format for OpenCV visualization
CLASS_COLORS_BGR: Dict[str, Tuple[int, int, int]] = {
    "car": (245, 117, 33),         # Bright blue-cyan
    "motorcycle": (34, 180, 255),  # High-vis amber
    "bus": (180, 50, 240),         # Purple/Magenta
    "truck": (50, 205, 50),        # Lime green
    "bicycle": (0, 215, 255),      # Gold
    "train": (128, 0, 128),        # Deep violet
    "person": (147, 20, 255),      # Coral pink
    "dog": (128, 128, 0),          # Teal
    "cat": (0, 128, 128),          # Olive
    "default_vehicle": (220, 120, 50),
    "default_non_vehicle": (160, 160, 160), # Slate grey
}

# Virtual counting line configuration
DEFAULT_LINE_RATIO: float = 0.55  # 55% from top
DIRECTION_A_NAME: str = "Direction A -> B (Inbound / Southbound)"
DIRECTION_B_NAME: str = "Direction B -> A (Outbound / Northbound)"

# Database and file system
DEFAULT_DB_PATH: str = "data/traffic_surveillance.db"
OUTPUT_DIR: str = "outputs"
DATA_DIR: str = "data"

"""
Validation module for incoming media uploads.
Safely checks file formats, sizes, and integrity before running inference.
"""
import os
from typing import Tuple, List

SUPPORTED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp", ".bmp"]
SUPPORTED_VIDEO_EXTENSIONS: List[str] = [".mp4", ".avi", ".mov", ".mkv", ".webm"]
MAX_IMAGE_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB
MAX_VIDEO_SIZE_BYTES: int = 150 * 1024 * 1024 # 150 MB


def validate_image_file(filename: str, file_size: int) -> Tuple[bool, str]:
    """
    Validates image file extension and size.
    Returns (is_valid, error_message).
    """
    if not filename:
        return False, "No file specified."

    _, ext = os.path.splitext(filename.lower())
    if ext not in SUPPORTED_IMAGE_EXTENSIONS:
        return False, f"Unsupported format '{ext}'. Allowed: {', '.join(SUPPORTED_IMAGE_EXTENSIONS)}"

    if file_size <= 0:
        return False, "File is empty (0 bytes)."

    if file_size > MAX_IMAGE_SIZE_BYTES:
        max_mb = MAX_IMAGE_SIZE_BYTES / (1024 * 1024)
        return False, f"Image size exceeds maximum limit of {max_mb:.0f}MB."

    return True, "Valid image format."


def validate_video_file(filename: str, file_size: int) -> Tuple[bool, str]:
    """
    Validates video file extension and size.
    Returns (is_valid, error_message).
    """
    if not filename:
        return False, "No file specified."

    _, ext = os.path.splitext(filename.lower())
    if ext not in SUPPORTED_VIDEO_EXTENSIONS:
        return False, f"Unsupported video codec/container '{ext}'. Allowed: {', '.join(SUPPORTED_VIDEO_EXTENSIONS)}"

    if file_size <= 0:
        return False, "Video file is empty (0 bytes)."

    if file_size > MAX_VIDEO_SIZE_BYTES:
        max_mb = MAX_VIDEO_SIZE_BYTES / (1024 * 1024)
        return False, f"Video size exceeds maximum limit of {max_mb:.0f}MB."

    return True, "Valid video format."

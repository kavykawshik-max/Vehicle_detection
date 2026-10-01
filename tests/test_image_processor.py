"""
Tests for Image Processing and Non-Vehicle Scene Description.
"""
import pytest
from modules.vehicle_classifier import DetectionItem
from modules.object_description import ObjectDescriptionEngine
from utils.validation import validate_image_file, validate_video_file


def test_non_vehicle_scene_description():
    # Scenario B: Dog image with zero vehicles
    vehicles = []
    non_vehicles = [
        DetectionItem([10, 10, 50, 50], "dog", 0.92)
    ]

    report = ObjectDescriptionEngine.describe_scene(vehicles, non_vehicles)
    assert report["total_vehicles_detected"] == 0
    assert report["vehicle_detection_status"] == "NO VEHICLES DETECTED"
    assert "Dog" in report["other_objects_detected"]
    assert "No motorized or non-motorized vehicles" in report["description"]
    assert report["has_vehicles"] is False


def test_person_beside_car_scenario():
    # Scenario C: Person beside car
    vehicles = [
        DetectionItem([100, 100, 300, 300], "car", 0.89)
    ]
    non_vehicles = [
        DetectionItem([40, 50, 90, 200], "person", 0.94)
    ]

    report = ObjectDescriptionEngine.describe_scene(vehicles, non_vehicles)
    assert report["total_vehicles_detected"] == 1
    assert "VEHICLES DETECTED" in report["vehicle_detection_status"]
    assert "Person" in report["other_objects_detected"]
    assert report["has_vehicles"] is True


def test_empty_scene_description():
    vehicles = []
    non_vehicles = []
    report = ObjectDescriptionEngine.describe_scene(vehicles, non_vehicles)
    assert report["total_vehicles_detected"] == 0
    assert report["vehicle_detection_status"] == "NO VEHICLES DETECTED"
    assert report["has_vehicles"] is False


def test_file_validation_rules():
    # Valid formats
    assert validate_image_file("snapshot.jpg", 1024)[0] is True
    assert validate_image_file("frame.png", 2048)[0] is True
    assert validate_image_file("photo.webp", 4096)[0] is True

    # Invalid formats
    assert validate_image_file("script.py", 500)[0] is False
    assert validate_image_file("document.pdf", 1000)[0] is False

    # Empty file
    assert validate_image_file("empty.jpg", 0)[0] is False

    # Video validation
    assert validate_video_file("stream.mp4", 1024 * 1024)[0] is True
    assert validate_video_file("recording.avi", 1024 * 1024)[0] is True
    assert validate_video_file("audio.mp3", 1024 * 1024)[0] is False

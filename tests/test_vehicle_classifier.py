"""
Unit Tests for Vehicle Classifier and Categorizer.
Verifies vehicle filtering, confidence thresholds, and discrimination against non-vehicles.
"""
import pytest
from modules.vehicle_classifier import VehicleClassifier, DetectionItem
from utils.config import VEHICLE_CLASSES


def test_vehicle_class_identification():
    classifier = VehicleClassifier()
    assert classifier.is_vehicle_class("car") is True
    assert classifier.is_vehicle_class("motorcycle") is True
    assert classifier.is_vehicle_class("bus") is True
    assert classifier.is_vehicle_class("truck") is True
    assert classifier.is_vehicle_class("bicycle") is True
    assert classifier.is_vehicle_class("train") is True

    # Ensure non-vehicles are NOT identified as vehicles
    assert classifier.is_vehicle_class("person") is False
    assert classifier.is_vehicle_class("dog") is False
    assert classifier.is_vehicle_class("traffic light") is False
    assert classifier.is_vehicle_class("bench") is False


def test_confidence_threshold_filtering():
    classifier = VehicleClassifier(confidence_threshold=0.40)
    raw = [
        {"box": [10, 10, 50, 50], "class_name": "car", "confidence": 0.85},
        {"box": [20, 20, 60, 60], "class_name": "car", "confidence": 0.30}, # Below threshold
        {"box": [30, 30, 70, 70], "class_name": "truck", "confidence": 0.55},
        {"box": [40, 40, 80, 80], "class_name": "dog", "confidence": 0.70},  # Non-vehicle
    ]

    vehicles, non_vehicles = classifier.filter_and_classify(raw)

    assert len(vehicles) == 2
    assert [v.class_name for v in vehicles] == ["car", "truck"]
    assert len(non_vehicles) == 1
    assert non_vehicles[0].class_name == "dog"


def test_vehicle_category_aggregation():
    classifier = VehicleClassifier()
    items = [
        DetectionItem([0, 0, 10, 10], "car", 0.9),
        DetectionItem([10, 10, 20, 20], "car", 0.8),
        DetectionItem([20, 20, 30, 30], "motorcycle", 0.75),
        DetectionItem([30, 30, 40, 40], "bus", 0.92),
        DetectionItem([40, 40, 50, 50], "truck", 0.88),
        DetectionItem([50, 50, 60, 60], "bicycle", 0.65),
    ]

    summary = classifier.get_vehicle_summary(items)
    assert summary["total_vehicles"] == 6
    assert summary["cars"] == 2
    assert summary["motorcycles"] == 1
    assert summary["buses"] == 1
    assert summary["trucks"] == 1
    assert summary["bicycles"] == 1
    assert summary["trains"] == 0
    assert summary["average_confidence"] > 0.80


def test_person_and_animal_never_counted_as_vehicles():
    classifier = VehicleClassifier()
    raw = [
        {"box": [0, 0, 10, 10], "class_name": "person", "confidence": 0.95},
        {"box": [10, 10, 20, 20], "class_name": "dog", "confidence": 0.85},
        {"box": [20, 20, 30, 30], "class_name": "cat", "confidence": 0.80},
    ]

    vehicles, non_vehicles = classifier.filter_and_classify(raw)
    assert len(vehicles) == 0
    assert len(non_vehicles) == 3
    summary = classifier.get_vehicle_summary(vehicles)
    assert summary["total_vehicles"] == 0

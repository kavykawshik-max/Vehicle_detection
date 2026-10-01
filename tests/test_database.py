"""
Tests for SQLite Database Manager and CSV Report Generator.
"""
import os
import tempfile
import pytest
from modules.database import DatabaseManager
from modules.report_generator import ReportGenerator


@pytest.fixture
def temp_db():
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    temp_path = temp_file.name
    temp_file.close()

    db = DatabaseManager(db_path=temp_path)
    yield db

    # Teardown
    if os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except Exception:
            pass


def test_database_insert_and_retrieve(temp_db):
    analysis_id = temp_db.save_analysis(
        file_name="highway_cctv.mp4",
        file_type="video",
        total_vehicle_count=14,
        processing_time=3.45,
        status="SUCCESS",
        description="Active multilane traffic stream.",
        category_counts={"car": 10, "truck": 3, "bus": 1},
        detection_records=[
            {"box": [10, 10, 50, 50], "class_name": "car", "confidence": 0.91, "tracking_id": 1},
            {"box": [60, 60, 120, 120], "class_name": "truck", "confidence": 0.88, "tracking_id": 2},
        ],
    )
    assert analysis_id is not None
    assert analysis_id > 0

    records = temp_db.get_all_analyses()
    assert len(records) == 1
    assert records[0]["file_name"] == "highway_cctv.mp4"
    assert records[0]["total_vehicle_count"] == 14

    details = temp_db.get_analysis_details(analysis_id)
    assert details is not None
    assert details["category_counts"]["car"] == 10
    assert details["category_counts"]["truck"] == 3
    assert len(details["sample_detections"]) == 2


def test_dashboard_aggregates(temp_db):
    temp_db.save_analysis(
        file_name="img1.jpg",
        file_type="image",
        total_vehicle_count=5,
        processing_time=0.4,
        status="SUCCESS",
        description="Intersection 1",
        category_counts={"car": 4, "motorcycle": 1},
    )
    temp_db.save_analysis(
        file_name="vid1.mp4",
        file_type="video",
        total_vehicle_count=15,
        processing_time=5.2,
        status="SUCCESS",
        description="Highway segment 1",
        category_counts={"car": 10, "truck": 5},
    )

    summary = temp_db.get_dashboard_summary()
    assert summary["total_analyses"] == 2
    assert summary["total_vehicles_detected"] == 20
    assert summary["total_images"] == 1
    assert summary["total_videos"] == 1
    assert summary["cars"] == 14
    assert summary["trucks"] == 5
    assert summary["motorcycles"] == 1


def test_deletion_and_csv_generation(temp_db):
    aid = temp_db.save_analysis(
        file_name="delete_test.jpg",
        file_type="image",
        total_vehicle_count=3,
        processing_time=0.2,
        status="SUCCESS",
        description="Temporary image",
        category_counts={"car": 3},
    )

    all_recs = [temp_db.get_analysis_details(aid)]
    csv_str = ReportGenerator.generate_csv_report(all_recs)
    assert "delete_test.jpg" in csv_str
    assert "IMAGE" in csv_str
    assert "Total Vehicles" in csv_str

    # Delete
    deleted = temp_db.delete_analysis(aid)
    assert deleted is True
    assert len(temp_db.get_all_analyses()) == 0

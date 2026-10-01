"""
Unit Tests for Vehicle Tracker and Virtual Tripwire Counter.
Verifies persistent tracking IDs, elimination of duplicate counts,
and directional line crossing logic (A -> B vs B -> A).
"""
import pytest
from modules.vehicle_tracker import VehicleTracker, Track, compute_iou
from modules.vehicle_counter import VehicleCounter


def test_compute_iou():
    box1 = [0, 0, 10, 10]
    box2 = [0, 0, 10, 10]
    assert compute_iou(box1, box2) == 1.0

    box3 = [10, 10, 20, 20]
    assert compute_iou(box1, box3) == 0.0

    box4 = [5, 5, 15, 15]
    # Intersection: [5, 5, 10, 10] area = 25
    # Union: 100 + 100 - 25 = 175
    # IoU = 25 / 175 = 1/7 ~= 0.1428
    assert round(compute_iou(box1, box4), 3) == 0.143


def test_tracking_prevents_duplicate_counts_across_frames():
    tracker = VehicleTracker(max_lost_frames=5, iou_threshold=0.3)

    # Frame 1: One car enters
    f1_dets = [{"box": [100, 100, 150, 150], "class_name": "car", "confidence": 0.88}]
    res1 = tracker.update(f1_dets, frame_idx=1)
    assert len(res1) == 1
    car_id = res1[0]["tracking_id"]

    # Frame 2: Same car slightly moved
    f2_dets = [{"box": [105, 105, 155, 155], "class_name": "car", "confidence": 0.89}]
    res2 = tracker.update(f2_dets, frame_idx=2)
    assert len(res2) == 1
    assert res2[0]["tracking_id"] == car_id

    # Frame 3: Same car moved further
    f3_dets = [{"box": [110, 110, 160, 160], "class_name": "car", "confidence": 0.87}]
    res3 = tracker.update(f3_dets, frame_idx=3)
    assert len(res3) == 1
    assert res3[0]["tracking_id"] == car_id

    # Crucial check: Unique vehicles must be 1, NOT 3!
    summary = tracker.get_unique_vehicle_summary()
    assert summary["total_unique_vehicles"] == 1
    assert summary["cars"] == 1


def test_virtual_line_crossing_directions():
    counter = VehicleCounter(line_y=200)

    # Simulated track moving downwards (A to B): y starts at 150, ends at 220
    track_down = Track(track_id=1, box=[100, 140, 120, 160], class_name="car", confidence=0.9, frame_idx=1)
    track_down.update(box=[100, 210, 120, 230], confidence=0.9, frame_idx=2)

    dir_down = counter.check_line_crossing(track_down, frame_idx=2, timestamp_sec=0.1)
    assert dir_down == "A_to_B"
    assert counter.crossings_a_to_b == 1
    assert counter.crossings_b_to_a == 0

    # Simulated track moving upwards (B to A): y starts at 240, ends at 170
    track_up = Track(track_id=2, box=[200, 230, 220, 250], class_name="bus", confidence=0.85, frame_idx=1)
    track_up.update(box=[200, 160, 220, 180], confidence=0.85, frame_idx=2)

    dir_up = counter.check_line_crossing(track_up, frame_idx=2, timestamp_sec=0.1)
    assert dir_up == "B_to_A"
    assert counter.crossings_b_to_a == 1

    summary = counter.get_crossing_summary()
    assert summary["total_crossing_events"] == 2
    assert summary["direction_a_to_b_count"] == 1
    assert summary["direction_b_to_a_count"] == 1


def test_temporal_interval_aggregation():
    events = [
        {"timestamp_sec": 1.2},
        {"timestamp_sec": 3.4},
        {"timestamp_sec": 7.8},
        {"timestamp_sec": 12.1},
    ]
    bins = VehicleCounter.aggregate_intervals(events, interval_seconds=5.0, total_duration=15.0)
    assert len(bins) >= 3
    # 0s - 5s: 2 events (1.2, 3.4)
    assert bins[0]["vehicle_count"] == 2
    # 5s - 10s: 1 event (7.8)
    assert bins[1]["vehicle_count"] == 1
    # 10s - 15s: 1 event (12.1)
    assert bins[2]["vehicle_count"] == 1

"""
Vehicle Object Tracker.
Implements multi-object tracking (IoU + Centroid Trajectory Association)
designed to maintain stable IDs across consecutive video frames without duplicate counts.
"""
from typing import Dict, List, Optional, Tuple, Any
import numpy as np


def compute_iou(boxA: List[float], boxB: List[float]) -> float:
    """Computes Intersection-over-Union (IoU) between two bounding boxes [x1, y1, x2, y2]."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    inter_width = max(0.0, xB - xA)
    inter_height = max(0.0, yB - yA)
    inter_area = inter_width * inter_height

    boxA_area = max(0.0, boxA[2] - boxA[0]) * max(0.0, boxA[3] - boxA[1])
    boxB_area = max(0.0, boxB[2] - boxB[0]) * max(0.0, boxB[3] - boxB[1])

    union_area = boxA_area + boxB_area - inter_area
    if union_area <= 0:
        return 0.0
    return inter_area / union_area


class Track:
    """Represents an active or historical tracked vehicle object."""
    def __init__(self, track_id: int, box: List[float], class_name: str, confidence: float, frame_idx: int):
        self.track_id = track_id
        self.box = list(box)
        self.class_name = class_name
        self.confidence = confidence
        self.start_frame = frame_idx
        self.last_frame = frame_idx
        self.hits = 1
        self.time_since_update = 0
        
        # Centroid history [(cx, cy), ...]
        cx = (box[0] + box[2]) / 2.0
        cy = (box[1] + box[3]) / 2.0
        self.centroid_history: List[Tuple[float, float]] = [(cx, cy)]
        
        # Virtual line crossing flags
        self.crossed_line = False
        self.crossing_direction: Optional[str] = None
        self.crossing_frame: Optional[int] = None

    def update(self, box: List[float], confidence: float, frame_idx: int):
        self.box = list(box)
        self.confidence = confidence
        self.last_frame = frame_idx
        self.hits += 1
        self.time_since_update = 0
        cx = (box[0] + box[2]) / 2.0
        cy = (box[1] + box[3]) / 2.0
        self.centroid_history.append((cx, cy))
        if len(self.centroid_history) > 60:
            self.centroid_history.pop(0)

    @property
    def current_centroid(self) -> Tuple[float, float]:
        return self.centroid_history[-1]

    @property
    def previous_centroid(self) -> Optional[Tuple[float, float]]:
        if len(self.centroid_history) >= 2:
            return self.centroid_history[-2]
        return None


class VehicleTracker:
    """
    Maintains persistent tracks across frames to prevent duplicate vehicle counting.
    Assigns each physical vehicle a unique persistent ID.
    """

    def __init__(self, max_lost_frames: int = 15, iou_threshold: float = 0.3):
        self.max_lost_frames = max_lost_frames
        self.iou_threshold = iou_threshold
        self.next_id = 1
        self.tracks: Dict[int, Track] = {}
        self.all_unique_tracks: Dict[int, Track] = {}  # Retains all observed vehicles

    def reset(self):
        """Resets the tracker state for a new video."""
        self.next_id = 1
        self.tracks.clear()
        self.all_unique_tracks.clear()

    def update(
        self,
        detections: List[Dict[str, Any]],
        frame_idx: int
    ) -> List[Dict[str, Any]]:
        """
        Updates tracks with detections for the current frame.
        detections: list of dicts [{'box': [x1, y1, x2, y2], 'class_name': str, 'confidence': float}, ...]
        Returns matched detections with 'tracking_id' assigned.
        """
        # Increment time since update for existing tracks
        for track in self.tracks.values():
            track.time_since_update += 1

        active_track_ids = list(self.tracks.keys())
        det_indices = list(range(len(detections)))

        matched_tracks = set()
        matched_dets = set()
        matched_pairs: List[Tuple[int, int]] = []

        # Greedy IoU matching with class consistency check
        if active_track_ids and det_indices:
            iou_matrix = np.zeros((len(active_track_ids), len(det_indices)), dtype=np.float32)
            for i, tid in enumerate(active_track_ids):
                track = self.tracks[tid]
                for j, d_idx in enumerate(det_indices):
                    det = detections[d_idx]
                    # Encourage matching same class
                    if track.class_name == det["class_name"]:
                        iou_matrix[i, j] = compute_iou(track.box, det["box"])
                    else:
                        iou_matrix[i, j] = compute_iou(track.box, det["box"]) * 0.7

            # Find matches greedily in order of highest IoU
            while True:
                max_iou = np.max(iou_matrix) if iou_matrix.size > 0 else 0.0
                if max_iou < self.iou_threshold:
                    break
                row, col = np.unravel_index(np.argmax(iou_matrix), iou_matrix.shape)
                tid = active_track_ids[row]
                d_idx = det_indices[col]

                matched_pairs.append((tid, d_idx))
                matched_tracks.add(tid)
                matched_dets.add(d_idx)

                # Invalidate row and column
                iou_matrix[row, :] = -1.0
                iou_matrix[:, col] = -1.0

        # Update matched tracks
        results: List[Dict[str, Any]] = []
        for tid, d_idx in matched_pairs:
            det = detections[d_idx]
            track = self.tracks[tid]
            track.update(box=det["box"], confidence=det["confidence"], frame_idx=frame_idx)
            
            res_item = dict(det)
            res_item["tracking_id"] = tid
            results.append(res_item)

        # Create new tracks for unmatched detections
        for j, det in enumerate(detections):
            if j not in matched_dets:
                new_track = Track(
                    track_id=self.next_id,
                    box=det["box"],
                    class_name=det["class_name"],
                    confidence=det["confidence"],
                    frame_idx=frame_idx,
                )
                self.tracks[self.next_id] = new_track
                self.all_unique_tracks[self.next_id] = new_track

                res_item = dict(det)
                res_item["tracking_id"] = self.next_id
                results.append(res_item)
                self.next_id += 1

        # Purge stale tracks that exceeded max_lost_frames
        dead_ids = [
            tid for tid, track in self.tracks.items()
            if track.time_since_update > self.max_lost_frames
        ]
        for tid in dead_ids:
            del self.tracks[tid]

        return results

    def get_unique_vehicle_summary(self) -> Dict[str, Any]:
        """
        Returns summary of all unique vehicles tracked throughout the video stream.
        """
        counts: Dict[str, int] = {}
        for track in self.all_unique_tracks.values():
            counts[track.class_name] = counts.get(track.class_name, 0) + 1

        total_unique = len(self.all_unique_tracks)
        return {
            "total_unique_vehicles": total_unique,
            "counts_by_category": counts,
            "cars": counts.get("car", 0),
            "motorcycles": counts.get("motorcycle", 0),
            "buses": counts.get("bus", 0),
            "trucks": counts.get("truck", 0),
            "bicycles": counts.get("bicycle", 0),
            "trains": counts.get("train", 0),
        }

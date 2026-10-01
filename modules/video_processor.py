"""
Video Processor and Traffic Stream Analytics Engine.
Processes video streams frame-by-frame, integrates multi-object tracking,
manages virtual tripwire crossing events, and computes traffic statistics.
"""
import os
import time
from typing import Dict, List, Optional, Tuple, Any, Callable
import cv2
import numpy as np

from modules.detector import YOLOVehicleDetector
from modules.vehicle_classifier import VehicleClassifier
from modules.vehicle_tracker import VehicleTracker
from modules.vehicle_counter import VehicleCounter
from modules.object_description import ObjectDescriptionEngine
from utils.visualization import draw_bounding_box, draw_virtual_line, draw_hud_header


class VideoProcessor:
    """
    Executes frame-by-frame detection, tracking, and traffic flow counting on video files.
    """

    def __init__(
        self,
        detector: Optional[YOLOVehicleDetector] = None,
        confidence_threshold: float = 0.35,
        max_lost_frames: int = 15,
        iou_threshold: float = 0.3,
    ):
        self.detector = detector or YOLOVehicleDetector(confidence_threshold=confidence_threshold)
        self.classifier = VehicleClassifier(confidence_threshold=confidence_threshold)
        self.tracker = VehicleTracker(max_lost_frames=max_lost_frames, iou_threshold=iou_threshold)
        self.counter = VehicleCounter()

    def process_video(
        self,
        video_path: str,
        output_path: Optional[str] = None,
        line_ratio: Optional[float] = None,
        frame_stride: int = 1,
        confidence_threshold: Optional[float] = None,
        progress_callback: Optional[Callable[[float, Dict[str, Any]], None]] = None,
        stop_check: Optional[Callable[[], bool]] = None,
    ) -> Dict[str, Any]:
        """
        Processes video file, executes ByteTrack tracking, records tripwire crossings,
        and generates annotated output video.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video source at '{video_path}'. Format or codec may be unsupported.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0.0

        # Set up counting line if ratio is provided
        if line_ratio is not None and 0.05 < line_ratio < 0.95:
            line_y = int(height * line_ratio)
            self.counter.set_line_position(line_y)

        # Output video writer
        writer = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            out_fps = max(1.0, fps / frame_stride)
            writer = cv2.VideoWriter(output_path, fourcc, out_fps, (width, height))

        self.tracker.reset()
        conf_thr = confidence_threshold or self.classifier.confidence_threshold

        frame_idx = 0
        processed_count = 0
        all_non_vehicle_objects = set()
        confidences_list: List[float] = []

        start_time = time.time()

        try:
            while cap.isOpened():
                if stop_check and stop_check():
                    break

                ret, frame = cap.read()
                if not ret or frame is None:
                    break

                frame_idx += 1
                if frame_idx % frame_stride != 0:
                    continue

                processed_count += 1
                timestamp_sec = frame_idx / fps if fps > 0 else 0.0

                # Run detector
                raw_detections = self.detector.predict(frame, confidence_threshold=conf_thr)
                vehicles, non_vehicles = self.classifier.filter_and_classify(raw_detections, confidence_threshold=conf_thr)

                for nv in non_vehicles:
                    all_non_vehicle_objects.add(nv.class_name.capitalize())

                for v in vehicles:
                    confidences_list.append(v.confidence)

                # Format vehicle detections for tracker
                tracker_input = [
                    {"box": v.box, "class_name": v.class_name, "confidence": v.confidence}
                    for v in vehicles
                ]

                # Update tracks
                tracked_vehicles = self.tracker.update(tracker_input, frame_idx=frame_idx)

                # Check virtual tripwire crossings
                for tid, track in self.tracker.tracks.items():
                    self.counter.check_line_crossing(track, frame_idx=frame_idx, timestamp_sec=timestamp_sec)

                # Annotate frame
                annotated = frame.copy()

                # Draw non-vehicles lightly
                for nv in non_vehicles:
                    annotated = draw_bounding_box(
                        annotated,
                        box=nv.box,
                        class_name=nv.class_name,
                        confidence=nv.confidence,
                        is_vehicle=False,
                    )

                # Draw tracked vehicles with ID badges
                for tv in tracked_vehicles:
                    annotated = draw_bounding_box(
                        annotated,
                        box=tv["box"],
                        class_name=tv["class_name"],
                        confidence=tv["confidence"],
                        is_vehicle=True,
                        tracking_id=tv.get("tracking_id"),
                    )

                # Draw virtual line if enabled
                if self.counter.line_y is not None:
                    annotated = draw_virtual_line(
                        annotated,
                        line_y=self.counter.line_y,
                        count_a_to_b=self.counter.crossings_a_to_b,
                        count_b_to_a=self.counter.crossings_b_to_a,
                    )

                # Draw HUD
                annotated = draw_hud_header(
                    annotated,
                    total_vehicles=len(self.tracker.all_unique_tracks),
                    active_tracks=len(self.tracker.tracks),
                    fps=fps,
                    timestamp_str=f"{timestamp_sec:.1f}s",
                )

                if writer is not None:
                    writer.write(annotated)

                if progress_callback and total_frames > 0:
                    pct = min(1.0, frame_idx / total_frames)
                    progress_callback(pct, {
                        "frame": frame_idx,
                        "unique_vehicles": len(self.tracker.all_unique_tracks),
                        "crossings_a": self.counter.crossings_a_to_b,
                        "crossings_b": self.counter.crossings_b_to_a,
                    })

        finally:
            cap.release()
            if writer is not None:
                writer.release()

        elapsed_time = time.time() - start_time
        proc_fps = processed_count / elapsed_time if elapsed_time > 0 else 0.0
        avg_conf = sum(confidences_list) / len(confidences_list) if confidences_list else 0.0

        unique_summary = self.tracker.get_unique_vehicle_summary()
        crossing_summary = self.counter.get_crossing_summary()

        # Non-vehicle handling
        if unique_summary["total_unique_vehicles"] == 0:
            status = "NO VEHICLES DETECTED IN THIS VIDEO"
            other_obj_list = list(all_non_vehicle_objects)
            desc = (
                f"Throughout {processed_count} processed frames, no vehicles were detected. "
                + (f"Observed non-vehicle objects: {', '.join(other_obj_list)}." if other_obj_list else "Scene was devoid of recognizable objects.")
            )
        else:
            status = f"TRAFFIC STREAM ANALYZED ({unique_summary['total_unique_vehicles']} UNIQUE VEHICLES)"
            desc = (
                f"Traffic surveillance stream processed {processed_count} frames across {duration:.1f}s. "
                f"Identified {unique_summary['total_unique_vehicles']} distinct vehicles with {crossing_summary['total_crossing_events']} line crossing events."
            )

        return {
            "status": status,
            "description": desc,
            "duration_seconds": round(duration, 2),
            "total_frames": total_frames,
            "frames_processed": processed_count,
            "processing_time": round(elapsed_time, 2),
            "processing_fps": round(proc_fps, 1),
            "average_confidence": round(avg_conf, 4),
            "unique_vehicles": unique_summary,
            "crossing_summary": crossing_summary,
            "other_objects_detected": list(all_non_vehicle_objects),
            "output_video_path": output_path,
        }

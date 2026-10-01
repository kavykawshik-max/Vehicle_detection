"""
Vehicle Counter and Virtual Counting Line Module.
Accurately records vehicle passage events across user-defined tripwires,
classifies direction (A -> B vs B -> A), and tallies temporal traffic intervals.
"""
from typing import Dict, List, Optional, Tuple, Any
from modules.vehicle_tracker import Track


class VehicleCounter:
    """
    Evaluates tracks against virtual tripwires and temporal bins.
    Strictly separates 'Total Unique Vehicles' from 'Line Crossing Events'.
    """

    def __init__(
        self,
        line_y: Optional[int] = None,
        line_name_a: str = "Direction A -> B (Southbound/Inbound)",
        line_name_b: str = "Direction B -> A (Northbound/Outbound)",
    ):
        self.line_y = line_y
        self.line_name_a = line_name_a
        self.line_name_b = line_name_b

        # Crossing event records
        self.crossings_a_to_b: int = 0
        self.crossings_b_to_a: int = 0
        self.crossings_by_class_a: Dict[str, int] = {}
        self.crossings_by_class_b: Dict[str, int] = {}
        self.crossing_events: List[Dict[str, Any]] = []

    def set_line_position(self, line_y: int):
        """Sets or adjusts the horizontal virtual counting line."""
        self.line_y = line_y

    def check_line_crossing(
        self,
        track: Track,
        frame_idx: int,
        timestamp_sec: float = 0.0
    ) -> Optional[str]:
        """
        Tests whether the track centroid crossed the horizontal line between its previous
        and current position. Returns direction string if crossed, else None.
        """
        if self.line_y is None or track.crossed_line:
            return None

        prev = track.previous_centroid
        curr = track.current_centroid
        if prev is None:
            return None

        prev_y = prev[1]
        curr_y = curr[1]
        target_y = float(self.line_y)

        direction: Optional[str] = None

        # Cross moving downward (A -> B)
        if prev_y < target_y <= curr_y:
            direction = "A_to_B"
            self.crossings_a_to_b += 1
            self.crossings_by_class_a[track.class_name] = (
                self.crossings_by_class_a.get(track.class_name, 0) + 1
            )
        # Cross moving upward (B -> A)
        elif prev_y > target_y >= curr_y:
            direction = "B_to_A"
            self.crossings_b_to_a += 1
            self.crossings_by_class_b[track.class_name] = (
                self.crossings_by_class_b.get(track.class_name, 0) + 1
            )

        if direction:
            track.crossed_line = True
            track.crossing_direction = direction
            track.crossing_frame = frame_idx
            self.crossing_events.append({
                "track_id": track.track_id,
                "class_name": track.class_name,
                "direction": direction,
                "frame": frame_idx,
                "timestamp_sec": round(timestamp_sec, 2),
            })

        return direction

    def get_crossing_summary(self) -> Dict[str, Any]:
        """
        Returns full statistics for the virtual counting line.
        """
        total_crossings = self.crossings_a_to_b + self.crossings_b_to_a
        return {
            "virtual_line_enabled": self.line_y is not None,
            "line_y": self.line_y,
            "total_crossing_events": total_crossings,
            "direction_a_to_b_count": self.crossings_a_to_b,
            "direction_b_to_a_count": self.crossings_b_to_a,
            "direction_a_label": self.line_name_a,
            "direction_b_label": self.line_name_b,
            "crossings_by_class_a": self.crossings_by_class_a,
            "crossings_by_class_b": self.crossings_by_class_b,
            "events_log": self.crossing_events,
        }

    @staticmethod
    def aggregate_intervals(
        events: List[Dict[str, Any]],
        interval_seconds: float = 5.0,
        total_duration: float = 60.0
    ) -> List[Dict[str, Any]]:
        """
        Bins crossing events into discrete temporal intervals for traffic volume charts.
        """
        if interval_seconds <= 0:
            interval_seconds = 5.0
        
        num_intervals = max(1, int(total_duration // interval_seconds) + 1)
        bins = [0] * num_intervals

        for ev in events:
            t = ev.get("timestamp_sec", 0.0)
            idx = min(num_intervals - 1, int(t // interval_seconds))
            bins[idx] += 1

        result = []
        for i, count in enumerate(bins):
            start_t = i * interval_seconds
            end_t = (i + 1) * interval_seconds
            result.append({
                "interval": f"{int(start_t)}s - {int(end_t)}s",
                "start_second": start_t,
                "vehicle_count": count,
            })
        return result

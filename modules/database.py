"""
SQLite Database Storage Module for Traffic Surveillance Analysis History.
Stores analysis sessions, category breakdowns, and detection metadata.
"""
import os
import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from utils.config import DEFAULT_DB_PATH


class DatabaseManager:
    """
    Manages SQLite database transactions for traffic surveillance logs.
    """

    def __init__(self, db_path: str = DEFAULT_DB_PATH):
        self.db_path = db_path
        self._ensure_dir()
        self.init_db()

    def _ensure_dir(self):
        folder = os.path.dirname(self.db_path)
        if folder and not os.path.exists(folder):
            os.makedirs(folder, exist_ok=True)

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Initializes tables for analyses, vehicle stats, and detection records."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Main analysis table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_name TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    timestamp DATETIME NOT NULL,
                    total_vehicle_count INTEGER NOT NULL,
                    processing_time REAL NOT NULL,
                    status TEXT NOT NULL,
                    description TEXT,
                    metadata_json TEXT
                )
            """)

            # Vehicle statistics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS vehicle_statistics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    analysis_id INTEGER NOT NULL,
                    vehicle_class TEXT NOT NULL,
                    vehicle_count INTEGER NOT NULL,
                    FOREIGN KEY (analysis_id) REFERENCES analysis (id) ON DELETE CASCADE
                )
            """)

            # Detection records table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS detection_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    analysis_id INTEGER NOT NULL,
                    object_class TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    bounding_box TEXT NOT NULL,
                    tracking_id INTEGER,
                    FOREIGN KEY (analysis_id) REFERENCES analysis (id) ON DELETE CASCADE
                )
            """)

            conn.commit()

    def save_analysis(
        self,
        file_name: str,
        file_type: str,
        total_vehicle_count: int,
        processing_time: float,
        status: str,
        description: str,
        category_counts: Dict[str, int],
        detection_records: Optional[List[Dict[str, Any]]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> int:
        """
        Saves a completed analysis session into SQLite. Returns the inserted analysis ID.
        """
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        meta_str = json.dumps(metadata or {})

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO analysis (file_name, file_type, timestamp, total_vehicle_count, processing_time, status, description, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (file_name, file_type, now, total_vehicle_count, processing_time, status, description, meta_str),
            )
            analysis_id = cursor.lastrowid

            # Insert category statistics
            for v_class, count in category_counts.items():
                if count > 0:
                    cursor.execute(
                        """
                        INSERT INTO vehicle_statistics (analysis_id, vehicle_class, vehicle_count)
                        VALUES (?, ?, ?)
                        """,
                        (analysis_id, v_class, count),
                    )

            # Insert sample detection records if provided (limit to max 50 to avoid massive db)
            if detection_records:
                for rec in detection_records[:50]:
                    box_str = json.dumps(rec.get("box", []))
                    cursor.execute(
                        """
                        INSERT INTO detection_records (analysis_id, object_class, confidence, bounding_box, tracking_id)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            analysis_id,
                            rec.get("class_name", "unknown"),
                            float(rec.get("confidence", 0.0)),
                            box_str,
                            rec.get("tracking_id"),
                        ),
                    )

            conn.commit()
            return analysis_id

    def get_all_analyses(self) -> List[Dict[str, Any]]:
        """Returns all analysis rows sorted newest first."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM analysis ORDER BY id DESC")
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_analysis_details(self, analysis_id: int) -> Optional[Dict[str, Any]]:
        """Returns full record including category breakdown and sample detections."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM analysis WHERE id = ?", (analysis_id,))
            row = cursor.fetchone()
            if not row:
                return None

            data = dict(row)
            # Fetch vehicle stats
            cursor.execute("SELECT vehicle_class, vehicle_count FROM vehicle_statistics WHERE analysis_id = ?", (analysis_id,))
            stat_rows = cursor.fetchall()
            data["category_counts"] = {r["vehicle_class"]: r["vehicle_count"] for r in stat_rows}

            # Fetch detections
            cursor.execute("SELECT object_class, confidence, bounding_box, tracking_id FROM detection_records WHERE analysis_id = ?", (analysis_id,))
            det_rows = cursor.fetchall()
            data["sample_detections"] = [dict(d) for d in det_rows]

            return data

    def delete_analysis(self, analysis_id: int) -> bool:
        """Deletes an analysis record and cascading dependencies."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM vehicle_statistics WHERE analysis_id = ?", (analysis_id,))
            cursor.execute("DELETE FROM detection_records WHERE analysis_id = ?", (analysis_id,))
            cursor.execute("DELETE FROM analysis WHERE id = ?", (analysis_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_dashboard_summary(self) -> Dict[str, Any]:
        """Calculates global aggregates for dashboard metric cards."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as total_runs, SUM(total_vehicle_count) as total_vehicles FROM analysis")
            agg = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) FROM analysis WHERE file_type = 'image'")
            total_images = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM analysis WHERE file_type = 'video'")
            total_videos = cursor.fetchone()[0]

            # Category sum breakdown
            cursor.execute("""
                SELECT vehicle_class, SUM(vehicle_count) as total
                FROM vehicle_statistics
                GROUP BY vehicle_class
            """)
            cat_rows = cursor.fetchall()
            cat_dict = {r["vehicle_class"]: r["total"] for r in cat_rows}

            return {
                "total_analyses": agg["total_runs"] or 0,
                "total_vehicles_detected": agg["total_vehicles"] or 0,
                "total_images": total_images or 0,
                "total_videos": total_videos or 0,
                "cars": cat_dict.get("car", 0),
                "motorcycles": cat_dict.get("motorcycle", 0),
                "buses": cat_dict.get("bus", 0),
                "trucks": cat_dict.get("truck", 0),
                "bicycles": cat_dict.get("bicycle", 0),
                "trains": cat_dict.get("train", 0),
                "category_breakdown": cat_dict,
            }

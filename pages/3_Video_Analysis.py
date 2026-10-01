"""
Video Analysis Page.
Process video streams with frame-by-frame YOLOv8 detection,
ByteTrack tracking, and virtual line crossing diagnostics.
"""
import streamlit as st
import tempfile
import os
import time
from modules.detector import YOLOVehicleDetector
from modules.video_processor import VideoProcessor
from modules.database import DatabaseManager
from utils.validation import validate_video_file

st.title("🎥 Video Stream Surveillance & Multi-Object Tracking")
st.caption("Perform vehicle tracking across consecutive video frames with ByteTrack and virtual tripwire counting.")

@st.cache_resource
def get_cached_detector():
    return YOLOVehicleDetector()

detector = get_cached_detector()
db = DatabaseManager()

# Sidebar parameters
st.sidebar.subheader("Video Tracking Parameters")
conf_threshold = st.sidebar.slider("Detection Confidence", min_value=0.15, max_value=0.85, value=0.35, step=0.05)
frame_stride = st.sidebar.select_slider("Frame Processing Frequency", options=[1, 2, 3, 5], value=2,
                                       help="Processing every 2nd or 3rd frame accelerates analysis while maintaining track continuity.")

enable_virtual_line = st.sidebar.checkbox("Enable Virtual Counting Tripwire", value=True)
line_ratio = None
if enable_virtual_line:
    line_ratio = st.sidebar.slider("Tripwire Position (% from Top)", min_value=15, max_value=85, value=50, step=5) / 100.0

st.sidebar.info(
    f"**Tracker Specifications**\n\n"
    f"Algorithm: `ByteTrack / IoU Trajectory`\n\n"
    f"Hardware Acceleration: `{detector.device.upper()}`\n\n"
    f"Frame Stride: `Every {frame_stride} frame(s)`"
)

uploaded_video = st.file_uploader(
    "Upload Video Feed (MP4, AVI, MOV, WEBM)",
    type=["mp4", "avi", "mov", "webm"],
    help="Upload CCTV or highway video stream.",
)

if uploaded_video is not None:
    file_bytes = uploaded_video.read()
    is_valid, err_msg = validate_video_file(uploaded_video.name, len(file_bytes))

    if not is_valid:
        st.error(f"Validation Failure: {err_msg}")
    else:
        # Save to temporary file for OpenCV VideoCapture
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as in_tmp:
            in_tmp.write(file_bytes)
            input_video_path = in_tmp.name

        out_tmp_path = input_video_path.replace(".mp4", "_annotated.mp4")

        st.info(f"Target Video Loaded: `{uploaded_video.name}` ({len(file_bytes) / (1024*1024):.1f} MB)")

        start_btn = st.button("🚀 Start Surveillance Video Analysis", type="primary")

        if start_btn:
            progress_bar = st.progress(0.0)
            status_text = st.empty()
            live_telemetry = st.empty()

            def on_progress(pct: float, metrics: dict):
                progress_bar.progress(pct)
                status_text.text(f"Processing Video Stream: Frame {metrics.get('frame', 0)} ({pct * 100:.1f}%)")
                live_telemetry.caption(
                    f"Active Unique Vehicles: {metrics.get('unique_vehicles', 0)} | "
                    f"Line Crossings (A->B): {metrics.get('crossings_a', 0)} | "
                    f"Line Crossings (B->A): {metrics.get('crossings_b', 0)}"
                )

            processor = VideoProcessor(detector=detector, confidence_threshold=conf_threshold)

            with st.spinner("Processing Video Stream with Computer Vision Tracker..."):
                try:
                    res = processor.process_video(
                        video_path=input_video_path,
                        output_path=out_tmp_path,
                        line_ratio=line_ratio,
                        frame_stride=frame_stride,
                        confidence_threshold=conf_threshold,
                        progress_callback=on_progress,
                    )

                    unique_veh = res["unique_vehicles"]
                    crossing = res["crossing_summary"]

                    # Persist to database
                    db.save_analysis(
                        file_name=uploaded_video.name,
                        file_type="video",
                        total_vehicle_count=unique_veh["total_unique_vehicles"],
                        processing_time=res["processing_time"],
                        status="SUCCESS",
                        description=res["description"],
                        category_counts=unique_veh["counts_by_category"],
                        metadata={
                            "duration_seconds": res["duration_seconds"],
                            "frames_processed": res["frames_processed"],
                            "processing_fps": res["processing_fps"],
                            "counting_method": "ByteTrack Multi-Object Tracking + Tripwire",
                            "crossing_events": crossing["total_crossing_events"],
                        },
                    )

                    status_text.empty()
                    live_telemetry.empty()
                    progress_bar.progress(1.0)

                    # Official status announcement
                    if unique_veh["total_unique_vehicles"] == 0:
                        st.warning(f"**STATUS: {res['status']}**")
                    else:
                        st.success(f"**STATUS: {res['status']}**")

                    st.write(f"**Surveillance Executive Brief:** {res['description']}")

                    # Telemetry Metrics Grid
                    st.markdown("### Surveillance Telemetry")
                    m1, m2, m3, m4 = st.columns(4)
                    m1.metric("Unique Vehicles Identified", unique_veh["total_unique_vehicles"])
                    m2.metric("Total Line Crossings", crossing["total_crossing_events"])
                    m3.metric("Direction A → B (Inbound)", crossing["direction_a_to_b_count"])
                    m4.metric("Direction B → A (Outbound)", crossing["direction_b_to_a_count"])

                    vm1, vm2, vm3, vm4, vm5 = st.columns(5)
                    vm1.metric("Cars", unique_veh["cars"])
                    vm2.metric("Motorcycles", unique_veh["motorcycles"])
                    vm3.metric("Buses", unique_veh["buses"])
                    vm4.metric("Trucks", unique_veh["trucks"])
                    vm5.metric("Bicycles", unique_veh["bicycles"])

                    # Performance stats
                    st.markdown("### Pipeline Execution Telemetry")
                    pm1, pm2, pm3, pm4 = st.columns(4)
                    pm1.metric("Video Duration", f"{res['duration_seconds']}s")
                    pm2.metric("Frames Processed", res["frames_processed"])
                    pm3.metric("Processing Latency", f"{res['processing_time']}s")
                    pm4.metric("Processing Speed", f"{res['processing_fps']} FPS")

                    # Download processed video if generated
                    if os.path.exists(out_tmp_path):
                        with open(out_tmp_path, "rb") as vf:
                            video_bytes = vf.read()
                        st.download_button(
                            label="⬇️ Download Annotated Video Stream (.mp4)",
                            data=video_bytes,
                            file_name=f"tracked_{uploaded_video.name}",
                            mime="video/mp4",
                        )

                except Exception as e:
                    st.error(f"Video surveillance error: {e}")
                finally:
                    # Clean up temp files safely
                    if os.path.exists(input_video_path):
                        try:
                            os.remove(input_video_path)
                        except Exception:
                            pass
                    if os.path.exists(out_tmp_path):
                        try:
                            os.remove(out_tmp_path)
                        except Exception:
                            pass

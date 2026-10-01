"""
Image Detection Page.
Upload photographic surveillance media, execute YOLOv8n object detection,
distinguish vehicles from non-vehicles, and inspect bounding boxes.
"""
import streamlit as st
import cv2
import numpy as np
from PIL import Image
import io

from modules.detector import YOLOVehicleDetector
from modules.image_processor import ImageProcessor
from modules.database import DatabaseManager
from utils.validation import validate_image_file

st.title("📷 Photographic Surveillance & Vehicle Detection")
st.caption("Inspect road scenes, intersections, or non-vehicle imagery with real-time YOLOv8n inference.")

# Caching detector for performance
@st.cache_resource
def get_cached_detector():
    return YOLOVehicleDetector()

detector = get_cached_detector()
processor = ImageProcessor(detector=detector)
db = DatabaseManager()

# Sidebar parameters
st.sidebar.subheader("Detection Parameters")
conf_threshold = st.sidebar.slider("Confidence Threshold", min_value=0.10, max_value=0.90, value=0.35, step=0.05)
img_size = st.sidebar.select_slider("Inference Resolution (px)", options=[320, 480, 640, 960], value=640)

st.sidebar.info(
    f"**Engine Telemetry**\n\n"
    f"Model: `{detector.model_name}`\n\n"
    f"Hardware Device: `{detector.device.upper()}`\n\n"
    f"Confidence: `{conf_threshold:.2f}`"
)

# Upload or Presets
uploaded_file = st.file_uploader(
    "Upload Surveillance Image (JPG, JPEG, PNG, WEBP)",
    type=["jpg", "jpeg", "png", "webp"],
    help="Select a high-resolution roadway snapshot or ordinary scene.",
)

if uploaded_file is not None:
    file_bytes = uploaded_file.read()
    is_valid, err_msg = validate_image_file(uploaded_file.name, len(file_bytes))

    if not is_valid:
        st.error(f"Validation Failure: {err_msg}")
    else:
        with st.spinner("Executing Computer Vision Inference (YOLOv8n)..."):
            try:
                res = processor.process_image(
                    image_bytes=file_bytes,
                    confidence_threshold=conf_threshold,
                    imgsz=img_size,
                )

                # Persist to database
                db.save_analysis(
                    file_name=uploaded_file.name,
                    file_type="image",
                    total_vehicle_count=res["total_vehicles"],
                    processing_time=res["processing_time"],
                    status="SUCCESS",
                    description=res["scene_description"]["description"],
                    category_counts=res["summary"]["counts_by_category"],
                    detection_records=res["vehicle_detections"] + res["non_vehicle_detections"],
                )

                # Status Banner
                scene_info = res["scene_description"]
                if res["total_vehicles"] == 0:
                    st.warning(f"**STATUS: {scene_info['vehicle_detection_status']}**")
                    st.info(f"**Contextual Scene Analysis:** {scene_info['description']}")
                else:
                    st.success(f"**STATUS: {scene_info['vehicle_detection_status']}**")
                    st.write(f"**Scene Audit:** {scene_info['description']}")

                # Metric Cards
                summary = res["summary"]
                m1, m2, m3, m4, m5, m6 = st.columns(6)
                m1.metric("Total Vehicles", summary["total_vehicles"])
                m2.metric("Cars", summary["cars"])
                m3.metric("Motorcycles", summary["motorcycles"])
                m4.metric("Buses", summary["buses"])
                m5.metric("Trucks", summary["trucks"])
                m6.metric("Bicycles", summary["bicycles"])

                # Side-by-Side Images
                col_orig, col_annot = st.columns(2)
                with col_orig:
                    st.subheader("Original Surveillance Image")
                    rgb_orig = cv2.cvtColor(res["original_image"], cv2.COLOR_BGR2RGB)
                    st.image(rgb_orig, use_container_width=True)

                with col_annot:
                    st.subheader("Annotated Telemetry Overlay")
                    rgb_annot = cv2.cvtColor(res["annotated_image"], cv2.COLOR_BGR2RGB)
                    st.image(rgb_annot, use_container_width=True)

                    # Download button for annotated image
                    annotated_pil = Image.fromarray(rgb_annot)
                    buf = io.BytesIO()
                    annotated_pil.save(buf, format="JPEG")
                    st.download_button(
                        label="⬇️ Download Annotated Image",
                        data=buf.getvalue(),
                        file_name=f"annotated_{uploaded_file.name}",
                        mime="image/jpeg",
                    )

                # Detailed Detection Table
                st.markdown("---")
                st.subheader("Detailed Detection Manifest")
                
                tab_veh, tab_non_veh = st.tabs(["Vehicle Detections", "Non-Vehicle Objects"])
                
                with tab_veh:
                    if res["vehicle_detections"]:
                        veh_table = []
                        for i, d in enumerate(res["vehicle_detections"]):
                            veh_table.append({
                                "Index": i + 1,
                                "Category": d["class_name"].capitalize(),
                                "Confidence": f"{d['confidence'] * 100:.1f}%",
                                "Bounding Box [x1, y1, x2, y2]": str(d["box"]),
                            })
                        st.table(veh_table)
                    else:
                        st.info("No vehicle objects met the confidence threshold.")

                with tab_non_veh:
                    if res["non_vehicle_detections"]:
                        non_table = []
                        for i, d in enumerate(res["non_vehicle_detections"]):
                            non_table.append({
                                "Index": i + 1,
                                "Object Class": d["class_name"].capitalize(),
                                "Confidence": f"{d['confidence'] * 100:.1f}%",
                                "Bounding Box [x1, y1, x2, y2]": str(d["box"]),
                            })
                        st.table(non_table)
                    else:
                        st.info("No non-vehicle objects detected.")

            except Exception as e:
                st.error(f"Surveillance processing error: {e}")

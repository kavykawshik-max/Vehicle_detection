"""
About the Project Page.
Specifications, architecture, model justification, and prototype disclosures.
"""
import streamlit as st

st.title("ℹ️ About the Intelligent Traffic Monitoring System")
st.caption("AI-Powered Vehicle Detection, Classification & Traffic Analytics Prototype")

st.markdown("""
### 1. System Metadata
* **Project Name:** AI-Based Intelligent Vehicle Detection, Classification, and Traffic Counting System
* **Domain:** Machine Learning, Deep Learning, Computer Vision, Intelligent Transportation Systems (ITS)
* **Primary Language:** Python 3.10 / 3.11
* **Core Model:** YOLOv8n (You Only Look Once, Nano) via Ultralytics
* **Frameworks & Libraries:** PyTorch, OpenCV, ByteTrack, Streamlit, NumPy, Pandas, SQLite

---

### 2. Project Purpose & Engineering Rationale
This system is an intelligent computer vision application designed to analyze uploaded traffic photography and video surveillance streams. It automates:
1. Real-time detection and localization of motorized and non-motorized vehicles.
2. Classification into distinct vehicular categories (Car, Motorcycle, Bus, Truck, Bicycle, Train).
3. Frame-by-frame multi-object tracking to eliminate duplicate counts in video feeds.
4. Directional tripwire line-crossing calculations (Inbound vs Outbound).
5. Explicit identification of non-vehicle subjects (pedestrians, animals, urban fixtures) to ensure clean discrimination without false vehicle counts.

### 3. Why YOLOv8n Was Selected
* **Single Forward Pass:** Performs object bounding box regression and multi-class classification in one unified neural inference step.
* **Compact Footprint:** The nano architecture (~3.2 million parameters) allows high-throughput inference on CPU hardware without requiring high-end dedicated GPUs.
* **COCO Benchmark Alignment:** Pre-trained on 80 standardized object classes, allowing it to detect road vehicles while simultaneously recognizing non-vehicle objects (people, dogs, backpacks) to prevent false classification.
* **Modular Pipeline Support:** Seamlessly integrates with trajectory tracking algorithms such as ByteTrack and SORT.

---

### 4. System Architecture
```
[ Incoming Media (Image / Video Stream) ]
                   │
                   ▼
       [ Validation & OpenCV Decoding ]
                   │
                   ▼
     [ YOLOv8n Neural Inference Engine ]
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
 [ Vehicle Detections ]  [ Non-Vehicle Objects ]
         │                   │
         ▼                   ▼
 [ ByteTrack Tracker ]   [ Scene Descriptor ]
         │               ("No Vehicles Detected")
         ▼
[ Virtual Tripwire (A ↔ B) ]
         │
         ▼
[ SQLite Database & Reporting Suite ]
```

---

### 5. Potential Applications
* Municipal traffic flow monitoring and congestion surveillance.
* Highway and toll-plaza vehicle density profiling.
* Road intersection signal optimization studies.
* Parking facility occupancy and turnover analysis.
* Academic and public sector intelligent transportation research.

---

### 6. Prototype Accreditation & Legal Disclosure
> **Academic Surveillance Prototype Notice:**
> This system is developed as an engineering prototype for demonstrating machine learning and computer vision principles. It is **not** an officially certified law-enforcement tool, automated citation mechanism, or certified public safety apparatus.
""", unsafe_allow_html=True)

# AI-Based Intelligent Vehicle Detection, Classification, and Traffic Counting System

An enterprise-grade, government-style Intelligent Transportation System (ITS) prototype developed in Python using YOLOv8n (You Only Look Once, Nano), OpenCV, ByteTrack, PyTorch, and Streamlit.

---

## 1. System Overview

The **Intelligent Traffic Monitoring System** automates the surveillance and statistical census of vehicular transit across photographic captures and continuous video feeds. It identifies and classifies multi-class traffic (cars, motorcycles, buses, trucks, bicycles, trains) while strictly segregating and documenting non-vehicular scene features (pedestrians, domestic/wild animals, urban infrastructure).

### Key Operational Capabilities
- **Pretrained Neural Object Detection:** Powered by Ultralytics YOLOv8n for single-pass multi-class inference.
- **Strict Vehicle vs. Non-Vehicle Segregation:** Vehicles are tallied; non-vehicles (such as pedestrians, dogs, cats, benches) are classified into a contextual scene manifest without contaminating vehicle counts.
- **Zero-False-Positive Assurance for Non-Vehicle Media:** When an image or video devoid of vehicles is processed, the system explicitly reports:
  > **“VEHICLE DETECTION STATUS: NO VEHICLES DETECTED”** (Total vehicles: 0)
- **Multi-Object Tracking (ByteTrack):** Prevents duplicate frame-by-frame counting in video streams by maintaining persistent ID trajectories across consecutive frames.
- **Bi-Directional Virtual Tripwire (Counting Line):** Records directional crossing events (Direction A → B vs Direction B → A) with customizable line geometry.
- **Government Surveillance Dashboard:** Official command-center aesthetic styled in deep navy (`#0B192C`), slate gray, and tactical HUD overlays.
- **Audit-Ready Reporting & Persistence:** SQLite database archive with CSV export and incident bulletin generation.

---

## 2. Directory Structure

```
vehicle-traffic-monitoring/
│
├── app.py                      # Main Streamlit surveillance dashboard
├── requirements.txt            # Pinned dependencies
├── README.md                   # Full documentation & setup guide
├── .gitignore                  # Git ignore rules
│
├── modules/
│   ├── __init__.py
│   ├── detector.py             # YOLOv8n inference engine & device detection
│   ├── vehicle_classifier.py   # Category segregation & count aggregation
│   ├── image_processor.py      # Photographic analysis & OpenCV overlay
│   ├── video_processor.py      # Video stream pipeline & frame scheduler
│   ├── vehicle_tracker.py      # ByteTrack / SORT trajectory tracking
│   ├── vehicle_counter.py      # Virtual counting line & direction classifier
│   ├── object_description.py   # Non-vehicle captioning & scene summaries
│   ├── database.py             # SQLite persistence & audit archive
│   └── report_generator.py     # RFC-4180 CSV & incident bulletin generator
│
├── pages/
│   ├── 1_Dashboard.py          # Executive surveillance overview & charts
│   ├── 2_Image_Detection.py    # Dedicated photographic surveillance page
│   ├── 3_Video_Analysis.py     # Video tracking & tripwire diagnostic page
│   ├── 4_Traffic_Statistics.py # Historical trend analysis & CSV download
│   ├── 5_Analysis_History.py   # Database log browser & record deletion
│   └── 6_About.py              # Architecture, YOLOv8n justification & disclaimer
│
├── utils/
│   ├── __init__.py
│   ├── config.py               # COCO classes, BGR palettes, defaults
│   ├── validation.py           # Format validation & size boundary checks
│   └── visualization.py        # HUD headers, bracketed bounding boxes
│
├── tests/
│   ├── test_vehicle_classifier.py # Category filtering & confidence tests
│   ├── test_vehicle_counter.py    # Tracking de-duplication & tripwire tests
│   ├── test_image_processor.py    # Non-vehicle scene & validation tests
│   └── test_database.py           # SQLite insertion, retrieval & CSV tests
│
├── data/                       # Local SQLite database files
└── outputs/                    # Exported media and reports
```

---

## 3. Technology Stack & Frameworks

| Layer | Component | Specification |
| :--- | :--- | :--- |
| **Language** | Python | 3.10 / 3.11 |
| **Neural Detector** | YOLOv8n (Ultralytics) | COCO pre-trained weights (80 classes) |
| **Computer Vision** | OpenCV | Image decoding, HUD drawing, VideoCapture/VideoWriter |
| **Deep Learning** | PyTorch / Torchvision | CPU / CUDA / MPS acceleration |
| **Object Tracking** | ByteTrack / IoU Trajectory | Centroid displacement & trajectory association |
| **User Interface** | Streamlit | Government command console layout |
| **Visual Analytics** | Plotly & Pandas | Volume timelines, composition donuts, bar charts |
| **Database** | SQLite3 | Relational audit log with cascading relations |
| **Test Suite** | Pytest | Automated unit & integration verification |

---

## 4. Installation & Execution Guide

### Windows Setup Instructions

1. **Open PowerShell or Command Prompt** and navigate to the project directory:
   ```cmd
   cd vehicle-traffic-monitoring
   ```

2. **Create a Python Virtual Environment**:
   ```cmd
   python -m venv venv
   ```

3. **Activate the Virtual Environment**:
   ```cmd
   venv\Scripts\activate
   ```

4. **Upgrade pip and Install Dependencies**:
   ```cmd
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Execute Automated Pytest Test Suite**:
   ```cmd
   pytest -v
   ```

6. **Launch the Streamlit Surveillance Application**:
   ```cmd
   streamlit run app.py
   ```
   *The application will open in your default browser at `http://localhost:8501`.*

---

### Linux / macOS Setup Instructions

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/ -v

# Launch application
streamlit run app.py
```

---

## 5. Demonstration Scenarios

* **Scenario A: Road Image with Multiple Vehicles**
  - Identifies visible cars, motorcycles, buses, and trucks.
  - Generates color-coded bounding boxes and category metrics.
* **Scenario B: Non-Vehicle Image (e.g., Dog or Pet)**
  - Reports: `VEHICLE DETECTION STATUS: NO VEHICLES DETECTED`.
  - Lists recognized non-vehicular objects (e.g., "Dog") without counting them as vehicles.
* **Scenario C: Person Standing Beside a Car**
  - Accurately discriminates person from vehicle.
  - Logs `Total Vehicles: 1` and `Other Objects: Person`.
* **Scenario D: Highway Video Stream**
  - Assigns unique tracking IDs (`#1`, `#2`, `#3`, ...).
  - Traverses vehicles across the scene without inflating count per frame.
  - Detects virtual tripwire crossings with directional separation (`Direction A → B` vs `Direction B → A`).
* **Scenario E: Video of Pedestrians Walking**
  - Confirms zero vehicle presence: `NO VEHICLES DETECTED IN THIS VIDEO`.
  - Captures pedestrian metrics without fabricating vehicular volume.
* **Scenario F: Empty Roadway**
  - Reports zero detections without crashing or hallucinating phantom vehicles.

---

## 6. Model Limitations & Future Enhancements

### Limitations
- Extreme vehicle occlusion, dense fog, or nighttime headlight glare may lower confidence scores.
- Standard 2D camera geometry cannot determine physical vehicle speeds without multi-point ground-plane camera calibration.

### Future Enhancements
- Dedicated Automatic Number Plate Recognition (ANPR / ALPR) using specialized OCR.
- Calibrated speed estimation using multi-camera homography matrices.
- Direct RTSP / ONVIF streaming for live municipal CCTV integration.
- Congestion anomaly alerts and stalled vehicle detection.

---

## 7. Prototype Disclosure

*This application is an intelligent academic and research prototype engineered for transportation analytics demonstration. It is not an officially certified government law-enforcement citation apparatus.*

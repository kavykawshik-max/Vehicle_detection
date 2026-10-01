"""
AI-Based Intelligent Vehicle Detection, Classification, and Traffic Counting System
Main Government Traffic Surveillance Portal & Command Dashboard.
"""
import streamlit as st
import os
import sys

# Ensure project root is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modules.database import DatabaseManager

# Page configuration
st.set_page_config(
    page_title="Intelligent Traffic Monitoring System",
    page_icon="🚦",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Government Surveillance Styling (Navy, Slate, Crisp telemetry)
st.markdown("""
<style>
    /* Government surveillance color palette */
    :root {
        --primary-navy: #0B192C;
        --secondary-navy: #1E3E62;
        --accent-blue: #008DDA;
        --hud-green: #00E676;
        --hud-amber: #FFB300;
        --hud-crimson: #FF5252;
    }
    
    .gov-header {
        background: linear-gradient(135deg, #091524 0%, #132A46 100%);
        border-bottom: 2px solid #285587;
        padding: 20px 24px;
        border-radius: 8px;
        margin-bottom: 24px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }
    .gov-title {
        color: #FFFFFF;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.8px;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .gov-subtitle {
        color: #94A3B8;
        font-size: 13px;
        margin-top: 4px;
        letter-spacing: 0.4px;
    }
    .gov-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    .badge-status {
        background-color: rgba(0, 230, 118, 0.15);
        color: #00E676;
        border: 1px solid rgba(0, 230, 118, 0.4);
    }
    .badge-prototype {
        background-color: rgba(255, 179, 0, 0.15);
        color: #FFB300;
        border: 1px solid rgba(255, 179, 0, 0.4);
    }
    .metric-card {
        background: #102136;
        border: 1px solid #1E3E62;
        border-radius: 6px;
        padding: 16px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .metric-value {
        font-size: 28px;
        font-weight: 700;
        color: #38BDF8;
        margin-top: 4px;
    }
    .metric-label {
        font-size: 12px;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
</style>
""", unsafe_allow_html=True)

# Government Header
st.markdown("""
<div class="gov-header">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
            <div class="gov-title">
                <span>🛡️</span> INTELLIGENT TRAFFIC MONITORING SYSTEM
            </div>
            <div class="gov-subtitle">
                DEPARTMENT OF TRAFFIC MONITORING &bull; INTELLIGENT TRANSPORTATION ANALYTICS
            </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
            <span class="gov-badge badge-status">&bull; SYSTEM OPERATIONAL [YOLOv8n]</span>
            <span class="gov-badge badge-prototype">AI-Based Traffic Surveillance Prototype</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Initialize database
db = DatabaseManager()
stats = db.get_dashboard_summary()

st.sidebar.title("Surveillance Control")
st.sidebar.info(
    "**Traffic Surveillance Console**\n\n"
    "Select a module from the menu above to initiate detection, review traffic telemetry, or export reports."
)

st.subheader("System Status & Live Traffic Overview")

# Metric cards
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Vehicles Cataloged", stats["total_vehicles_detected"])
col2.metric("Images Analyzed", stats["total_images"])
col3.metric("Videos Analyzed", stats["total_videos"])
col4.metric("Surveillance Runs", stats["total_analyses"])

col_c, col_m, col_b, col_t, col_bk = st.columns(5)
col_c.metric("Cars", stats["cars"])
col_m.metric("Motorcycles", stats["motorcycles"])
col_b.metric("Buses", stats["buses"])
col_t.metric("Trucks", stats["trucks"])
col_bk.metric("Bicycles", stats["bicycles"])

st.markdown("---")

st.markdown("### Quick Navigation & Operational Modules")
c1, c2, c3 = st.columns(3)

with c1:
    st.markdown("#### 📷 Image Detection")
    st.write("Upload static photographic evidence or CCTV snapshots. Detects vehicles, extracts bounding boxes, identifies non-vehicle subjects (pedestrians, fauna), and tallies category metrics.")
    st.info("Navigate to **2_Image_Detection** in the sidebar.")

with c2:
    st.markdown("#### 🎥 Video Stream Analysis")
    st.write("Perform multi-object tracking across video footage. Employs ByteTrack trajectory persistence to ensure zero duplicate counts and tracks tripwire directional crossings (A ↔ B).")
    st.info("Navigate to **3_Video_Analysis** in the sidebar.")

with c3:
    st.markdown("#### 📊 Surveillance Analytics")
    st.write("Inspect comprehensive volume charts, temporal intervals, vehicle composition breakdowns, and generate official audit-ready CSV & incident bulletin reports.")
    st.info("Navigate to **4_Traffic_Statistics** in the sidebar.")

st.caption("Notice: System is an academic and research prototype for Intelligent Transportation Systems (ITS) and is not intended as an autonomous law-enforcement citation apparatus.")

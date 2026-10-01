"""
Dashboard Page: High-level overview of traffic surveillance data, charts, and recent events.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
from modules.database import DatabaseManager

st.title("Traffic Surveillance Executive Dashboard")
st.caption("AI-Based Vehicle Detection, Classification & Traffic Analytics Prototype")

db = DatabaseManager()
stats = db.get_dashboard_summary()
all_analyses = db.get_all_analyses()

# Primary metric cards
c1, c2, c3, c4 = st.columns(4)
c1.metric("Total Vehicles", stats["total_vehicles_detected"])
c2.metric("Images Processed", stats["total_images"])
c3.metric("Videos Processed", stats["total_videos"])
c4.metric("Total Records", stats["total_analyses"])

# Secondary vehicle category cards
sc1, sc2, sc3, sc4, sc5 = st.columns(5)
sc1.metric("🚗 Cars", stats["cars"])
sc2.metric("🏍️ Motorcycles", stats["motorcycles"])
sc3.metric("🚌 Buses", stats["buses"])
sc4.metric("🚛 Trucks", stats["trucks"])
sc5.metric("🚲 Bicycles", stats["bicycles"])

st.markdown("---")

if stats["total_vehicles_detected"] > 0:
    col_chart1, col_chart2 = st.columns(2)

    with col_chart1:
        st.subheader("Vehicle Category Distribution")
        cat_data = [
            {"Category": "Car", "Count": stats["cars"]},
            {"Category": "Motorcycle", "Count": stats["motorcycles"]},
            {"Category": "Bus", "Count": stats["buses"]},
            {"Category": "Truck", "Count": stats["trucks"]},
            {"Category": "Bicycle", "Count": stats["bicycles"]},
            {"Category": "Train", "Count": stats["trains"]},
        ]
        df_cat = pd.DataFrame(cat_data)
        fig_bar = px.bar(
            df_cat,
            x="Category",
            y="Count",
            color="Category",
            color_discrete_sequence=["#38BDF8", "#F59E0B", "#A855F7", "#22C55E", "#EAB308", "#EC4899"],
            title="Total Vehicle Count by Category",
        )
        fig_bar.update_layout(showlegend=False, template="plotly_dark")
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_chart2:
        st.subheader("Traffic Fleet Composition (%)")
        df_non_zero = df_cat[df_cat["Count"] > 0]
        if not df_non_zero.empty:
            fig_pie = px.pie(
                df_non_zero,
                values="Count",
                names="Category",
                hole=0.45,
                color_discrete_sequence=["#38BDF8", "#F59E0B", "#A855F7", "#22C55E", "#EAB308", "#EC4899"],
                title="Vehicle Fleet Share",
            )
            fig_pie.update_layout(template="plotly_dark")
            st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.info("No vehicle breakdown available yet.")
else:
    st.info("No traffic detection data in database yet. Run Image Detection or Video Analysis to populate statistics.")

st.markdown("---")
st.subheader("Recent Surveillance Operations")

if all_analyses:
    df_recent = pd.DataFrame(all_analyses)
    display_df = df_recent[["id", "file_name", "file_type", "timestamp", "total_vehicle_count", "processing_time", "status"]]
    display_df.columns = ["ID", "File Name", "Type", "Timestamp", "Vehicles", "Latency (s)", "Status"]
    st.dataframe(display_df, use_container_width=True)
else:
    st.write("No recorded operations. Upload an image or video to begin surveillance logging.")

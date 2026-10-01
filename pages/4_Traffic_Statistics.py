"""
Traffic Statistics Page.
Analyze aggregated traffic patterns, filter historical logs, and generate reports.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
from modules.database import DatabaseManager
from modules.report_generator import ReportGenerator

st.title("📊 Traffic Surveillance Analytics & Reports")
st.caption("Inspect macro traffic volume trends, fleet distributions, and download audit-ready reports.")

db = DatabaseManager()
all_analyses = db.get_all_analyses()

if not all_analyses:
    st.info("No surveillance sessions recorded yet. Please run image or video detections first.")
else:
    # Sidebar Filters
    st.sidebar.subheader("Filter Surveillance Records")
    file_type_filter = st.sidebar.selectbox("Media Type", ["All", "image", "video"])
    
    filtered_records = all_analyses
    if file_type_filter != "All":
        filtered_records = [r for r in filtered_records if r["file_type"] == file_type_filter]

    st.write(f"Displaying **{len(filtered_records)}** surveillance operation(s).")

    df = pd.DataFrame(filtered_records)

    # Volume across operations chart
    st.subheader("Vehicle Detection Volume per Operation")
    fig_vol = px.line(
        df,
        x="timestamp",
        y="total_vehicle_count",
        markers=True,
        title="Detected Vehicles Over Operational Timeline",
        labels={"timestamp": "Operation Timestamp", "total_vehicle_count": "Vehicles Detected"},
    )
    fig_vol.update_layout(template="plotly_dark")
    st.plotly_chart(fig_vol, use_container_width=True)

    # Vehicle Category breakdown across filtered records
    category_totals = {"car": 0, "motorcycle": 0, "bus": 0, "truck": 0, "bicycle": 0, "train": 0}
    for r in filtered_records:
        detail = db.get_analysis_details(r["id"])
        if detail and "category_counts" in detail:
            for k, v in detail["category_counts"].items():
                category_totals[k] = category_totals.get(k, 0) + v

    df_cats = pd.DataFrame([
        {"Category": k.capitalize(), "Volume": v}
        for k, v in category_totals.items()
    ])

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Cumulative Vehicle Volume by Class")
        fig_bar = px.bar(
            df_cats,
            x="Category",
            y="Volume",
            color="Category",
            color_discrete_sequence=["#38BDF8", "#F59E0B", "#A855F7", "#22C55E", "#EAB308", "#EC4899"],
            title="Total Count by Classification",
        )
        fig_bar.update_layout(showlegend=False, template="plotly_dark")
        st.plotly_chart(fig_bar, use_container_width=True)

    with col2:
        st.subheader("Traffic Fleet Distribution Ratio")
        df_cats_nonzero = df_cats[df_cats["Volume"] > 0]
        if not df_cats_nonzero.empty:
            fig_pie = px.pie(
                df_cats_nonzero,
                values="Volume",
                names="Category",
                hole=0.4,
                color_discrete_sequence=["#38BDF8", "#F59E0B", "#A855F7", "#22C55E", "#EAB308", "#EC4899"],
                title="Fleet Ratio",
            )
            fig_pie.update_layout(template="plotly_dark")
            st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.info("No vehicles cataloged in the filtered set.")

    st.markdown("---")
    st.subheader("Official Surveillance Audit Reports")

    c_csv, c_txt = st.columns(2)

    # CSV Download
    detailed_list = []
    for r in filtered_records:
        d = db.get_analysis_details(r["id"])
        if d:
            detailed_list.append(d)

    csv_data = ReportGenerator.generate_csv_report(detailed_list)

    with c_csv:
        st.markdown("#### Standardized Audit CSV Export")
        st.caption("RFC-compliant CSV containing operational records, vehicle categories, and timestamped latency.")
        st.download_button(
            label="⬇️ Download CSV Traffic Audit Log",
            data=csv_data,
            file_name="traffic_surveillance_report.csv",
            mime="text/csv",
        )

    with c_txt:
        st.markdown("#### Incident Bulletin Document")
        st.caption("Formatted government traffic surveillance briefing text.")
        if detailed_list:
            bulletin = ReportGenerator.generate_bulletin_text(detailed_list[0])
            st.download_button(
                label="⬇️ Download Latest Incident Bulletin (.txt)",
                data=bulletin,
                file_name=f"surveillance_bulletin_ID_{detailed_list[0]['id']}.txt",
                mime="text/plain",
            )

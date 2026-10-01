"""
Analysis History Page.
Browse SQLite surveillance logs, inspect detailed detection records, and delete items.
"""
import streamlit as st
import pandas as pd
from modules.database import DatabaseManager

st.title("🗄️ Surveillance Operations Archive & History")
st.caption("Inspect past image and video analysis sessions stored in local SQLite database.")

db = DatabaseManager()
all_analyses = db.get_all_analyses()

if not all_analyses:
    st.info("Archive is empty. Run detection on an image or video to create initial records.")
else:
    st.write(f"Total Archived Records: **{len(all_analyses)}**")

    # Select an analysis to view details
    options = {f"ID #{r['id']} - {r['file_name']} ({r['file_type'].upper()}) - {r['timestamp']}": r["id"] for r in all_analyses}
    selected_label = st.selectbox("Select Surveillance Record to Inspect:", list(options.keys()))
    selected_id = options[selected_label]

    details = db.get_analysis_details(selected_id)
    if details:
        st.markdown("---")
        st.subheader(f"Operation Record Details [ID: #{details['id']}]")

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Media Name", details["file_name"])
        c2.metric("Media Format", details["file_type"].upper())
        c3.metric("Vehicles Counted", details["total_vehicle_count"])
        c4.metric("Inference Latency", f"{details['processing_time']:.2f}s")

        st.info(f"**Surveillance Executive Summary:** {details.get('description', 'N/A')}")

        # Category Counts
        cats = details.get("category_counts", {})
        if cats:
            st.markdown("#### Vehicle Classification Breakdown")
            cat_cols = st.columns(len(cats))
            for i, (k, v) in enumerate(cats.items()):
                cat_cols[i].metric(k.capitalize(), v)
        else:
            st.write("No vehicle categories cataloged for this session.")

        # Sample detections
        samples = details.get("sample_detections", [])
        if samples:
            with st.expander(f"View Detection Manifest ({len(samples)} logged bounding boxes)"):
                df_samples = pd.DataFrame(samples)
                st.dataframe(df_samples, use_container_width=True)

        # Deletion
        st.markdown("---")
        c_del1, c_del2 = st.columns([1, 4])
        with c_del1:
            if st.button("🗑️ Delete Record", type="secondary"):
                success = db.delete_analysis(selected_id)
                if success:
                    st.success(f"Record #{selected_id} purged from archive.")
                    st.rerun()
                else:
                    st.error("Failed to delete record.")

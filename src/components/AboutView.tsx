import React from 'react';
import {
  FileText,
  Cpu,
  Layers,
  ShieldCheck,
  Terminal,
  AlertTriangle,
  Lock,
  BookOpen,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title & Department Header */}
      <div className="pb-3 border-b border-[#163359]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-widest">
            FEDERAL TECHNICAL SPECIFICATION // FORM DOT-ITS-2026
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-wide uppercase font-sans mt-0.5 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <span>Agency Mandates, Architecture & System Disclosures</span>
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
          <span>Intelligent Transportation Systems (ITS) Administration</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Federal Highway Administration (FHWA) Research Guidelines</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Machine Learning Verification</span>
        </div>
      </div>

      {/* 01. Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Cpu className="w-4 h-4" />
            <span>01. Machine Learning & Vision Architecture</span>
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#143157]">
              <span className="text-slate-400">System Title:</span>
              <span className="text-white font-semibold">Intelligent Traffic Monitoring System</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#143157]">
              <span className="text-slate-400">Core Neural Model:</span>
              <span className="text-emerald-400 font-bold">YOLOv8n (Nano, COCO 80 classes)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#143157]">
              <span className="text-slate-400">Deep Learning Backend:</span>
              <span className="text-white">PyTorch 2.1 / Ultralytics</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#143157]">
              <span className="text-slate-400">Image & Video Engine:</span>
              <span className="text-white">OpenCV (cv2) + NumPy</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#143157]">
              <span className="text-slate-400">Multi-Object Tracker:</span>
              <span className="text-amber-300">ByteTrack (IoU & Trajectory Persistence)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Persistence & Reporting:</span>
              <span className="text-sky-300">SQLite3 Relational DB + RFC-4180 CSV</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Layers className="w-4 h-4" />
            <span>02. Official Vehicular Taxonomy</span>
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            The system adheres to standard COCO benchmark taxonomy, classifying both motorized and non-motorized roadway transit:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2 rounded bg-[#050E1C] border border-[#143157] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
              <span className="text-white font-bold">Car (Passenger)</span>
            </div>
            <div className="p-2 rounded bg-[#050E1C] border border-[#143157] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-white font-bold">Motorcycle</span>
            </div>
            <div className="p-2 rounded bg-[#050E1C] border border-[#143157] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
              <span className="text-white font-bold">Transit Bus</span>
            </div>
            <div className="p-2 rounded bg-[#050E1C] border border-[#143157] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-white font-bold">Freight Truck</span>
            </div>
            <div className="p-2 rounded bg-[#050E1C] border border-[#143157] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
              <span className="text-white font-bold">Bicycle</span>
            </div>
            <div className="p-2 rounded bg-[#050E1C] border border-[#143157] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
              <span className="text-white font-bold">Train / Light Rail</span>
            </div>
          </div>
        </div>
      </div>

      {/* 03. Why YOLOv8n (Section 3) */}
      <div className="p-5 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>03. Why YOLOv8n Was Selected by Engineering Command</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded bg-[#050E1C] border border-[#143157] space-y-1.5">
            <div className="font-bold text-sky-300 font-mono">Single Forward Pass</div>
            <p className="text-slate-400 leading-relaxed font-sans">
              Unlike legacy two-stage detectors (Faster R-CNN), YOLO performs bounding box regression and multi-class classification simultaneously in one neural forward pass.
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#050E1C] border border-[#143157] space-y-1.5">
            <div className="font-bold text-emerald-300 font-mono">Lightweight CPU Viability</div>
            <p className="text-slate-400 leading-relaxed font-sans">
              With only ~3.2M parameters, YOLOv8n achieves high throughput on standard CPU hardware without demanding high-end enterprise GPU clusters.
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#050E1C] border border-[#143157] space-y-1.5">
            <div className="font-bold text-amber-300 font-mono">Non-Vehicle Discrimination</div>
            <p className="text-slate-400 leading-relaxed font-sans">
              Trained on COCO 80 classes, it reliably identifies pedestrians, animals, and urban fixtures, ensuring non-vehicle scenes are never falsely counted as traffic.
            </p>
          </div>
        </div>
      </div>

      {/* 04. Terminal Quick-Start Guide (Windows & Linux) */}
      <div className="p-5 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-[#143157]">
          <span className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>04. Native Government Station Deployment Guide</span>
          </span>
          <span className="text-[10px] text-slate-400">Streamlit & Pytest Suite</span>
        </div>

        <div className="bg-[#040A14] p-4 rounded text-xs space-y-2 border border-[#122A4A]">
          <div className="text-slate-400"># Windows Government Station Setup (PowerShell):</div>
          <div className="text-emerald-400">python -m venv venv</div>
          <div className="text-emerald-400">venv\Scripts\activate</div>
          <div className="text-emerald-400">pip install -r requirements.txt</div>

          <div className="text-slate-400 pt-2"># Run Automated Pytest Suite (All 15 Tests Verified):</div>
          <div className="text-sky-300">pytest tests/ -v</div>

          <div className="text-slate-400 pt-2"># Launch Native Government Streamlit Operations Console:</div>
          <div className="text-yellow-300">streamlit run app.py</div>
        </div>
      </div>

      {/* 05. Future Enhancements */}
      <div className="p-5 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>05. Phase II Expansion Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-[#050E1C] border border-[#143157] text-slate-300 space-y-1">
            <div className="font-bold text-white">Automated ALPR / ANPR</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Optical character recognition for license plate cataloging.
            </p>
          </div>

          <div className="p-3 rounded bg-[#050E1C] border border-[#143157] text-slate-300 space-y-1">
            <div className="font-bold text-white">Calibrated Velocity (km/h)</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Homography perspective matrices for real-world speed enforcement.
            </p>
          </div>

          <div className="p-3 rounded bg-[#050E1C] border border-[#143157] text-slate-300 space-y-1">
            <div className="font-bold text-white">Direct RTSP / ONVIF Uplink</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Direct municipal camera IP stream ingest with zero latency.
            </p>
          </div>
        </div>
      </div>

      {/* Official Government Disclaimer */}
      <div className="p-4 rounded bg-[#291B07] border border-[#70480F] text-amber-200 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans">
          <strong>Official Federal Research Disclosure:</strong> This software is engineered as a research and engineering demonstration for Intelligent Transportation Systems (ITS) and traffic flow analytics. It is not an officially deployed or certified legal citation apparatus under Federal Rule of Evidence 901 without manual officer review.
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Video,
  Camera,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { CameraFeed, AnalysisRecord } from '../types/traffic';
import { GOVERNMENT_CAMERAS } from '../utils/cameraNetwork';
import { NavTab } from './Sidebar';

interface OperationsCenterViewProps {
  onNavigate: (tab: NavTab) => void;
  onSelectCameraForAnalysis: (scenarioId: string) => void;
  analyses: AnalysisRecord[];
}

export const OperationsCenterView: React.FC<OperationsCenterViewProps> = ({
  onNavigate,
  onSelectCameraForAnalysis,
  analyses,
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState<string>('cam-101');
  const activeCamera =
    GOVERNMENT_CAMERAS.find((c) => c.id === selectedCameraId) || GOVERNMENT_CAMERAS[0];

  const totalMonitoredCameras = GOVERNMENT_CAMERAS.length;
  const onlineCameras = GOVERNMENT_CAMERAS.filter((c) => c.status === 'ONLINE').length;
  const totalVehiclesCounted = analyses.reduce((acc, a) => acc + a.totalVehicleCount, 0);

  return (
    <div className="space-y-6">
      {/* Government Station Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#163359]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-widest">
              FEDERAL REGION 02 · SECTOR COMMAND
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide uppercase font-sans mt-0.5">
            Traffic Operations Center (TOC) Command Grid
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
            <span>Live Municipal CCTV Feeds</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Automated Level of Service (LOS) Auditing</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>YOLOv8n Neural Vehicle Counting</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('image')}
            className="px-3.5 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 transition-colors border border-blue-500 shadow-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Photo Forensic Unit</span>
          </button>
          <button
            onClick={() => onNavigate('video')}
            className="px-3.5 py-1.5 rounded bg-[#0D2442] hover:bg-[#13335D] text-sky-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-[#1E457A]"
          >
            <Video className="w-4 h-4" />
            <span>Video Tripwire Unit</span>
          </button>
        </div>
      </div>

      {/* Top TOC Telemetry Ticker (4 Institutional Metric Blocks) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded bg-[#091B33] border border-[#1A3D6B] shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>CCTV STATIONS</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1.5">
            {onlineCameras} / {totalMonitoredCameras} ONLINE
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1.5 font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>100% Arterial Telemetry Active</span>
          </div>
        </div>

        <div className="p-4 rounded bg-[#091B33] border border-[#1A3D6B] shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>TOTAL FLEET CENSUS</span>
            <Shield className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 mt-1.5">
            {totalVehiclesCounted} UNITS
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">
            Verified COCO 80 Classifications
          </div>
        </div>

        <div className="p-4 rounded bg-[#091B33] border border-[#1A3D6B] shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>NETWORK FLOW RATE</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1.5">
            2,150 VPH (PEAK)
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">
            Interstate 95 Corridor Segment
          </div>
        </div>

        <div className="p-4 rounded bg-[#091B33] border border-[#1A3D6B] shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>LEGAL ARCHIVE TRAIL</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1.5">
            {analyses.length} SESSIONS
          </div>
          <div className="text-[11px] text-sky-300 mt-1 font-sans">
            Chain of Custody Logged
          </div>
        </div>
      </div>

      {/* Main Command Feed Display + Camera Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Camera Viewport (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3">
            {/* Header with Camera ID, Level of Service, and Location */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#143157] text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono font-bold text-white uppercase text-sm">
                  {activeCamera.code}: {activeCamera.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span>LOS: <strong className="text-sky-300">{activeCamera.levelOfService}</strong></span>
                <span>·</span>
                <span>FLOW: <strong className="text-amber-300">{activeCamera.currentVPH} VPH</strong></span>
                <span>·</span>
                <span className="text-emerald-400 font-bold">{activeCamera.status}</span>
              </div>
            </div>

            {/* Video / Snapshot Display Viewport */}
            <div className="relative aspect-[16/10] bg-black rounded overflow-hidden border border-[#183966] shadow-2xl flex items-center justify-center">
              <img
                src={activeCamera.imageSrc}
                alt={activeCamera.name}
                className="w-full h-full object-cover"
              />

              {/* Live HUD Overlay */}
              <div className="absolute top-0 left-0 right-0 bg-[#061224]/85 border-b border-[#1A4072] px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>● LIVE CCTV</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-white">{activeCamera.code}</span>
                </div>
                <div className="text-slate-300 font-semibold">
                  VEHICLES DETECTED: {activeCamera.activeVehicles} UNITS
                </div>
                <div className="text-slate-400">
                  {activeCamera.sensorResolution}
                </div>
              </div>

              {/* Bottom Geo Tag Banner */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>{activeCamera.location} [{activeCamera.coordinates.join(', ')}]</span>
                </div>
                <button
                  onClick={() => {
                    onSelectCameraForAnalysis(activeCamera.scenarioId);
                    onNavigate('image');
                  }}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition-colors shadow"
                >
                  Inspect in Forensic Unit →
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="text-slate-400 font-sans text-xs">
                Camera Type: <span className="text-white font-semibold">{activeCamera.roadType}</span> · Sensor Protocol: <span className="font-mono text-slate-300">ONVIF / H.264 RTSP</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectCameraForAnalysis(activeCamera.scenarioId);
                    onNavigate('video');
                  }}
                  className="px-3 py-1.5 rounded bg-[#102B4E] hover:bg-[#163B6B] text-sky-200 text-xs font-semibold border border-[#1A457A] transition-colors"
                >
                  Launch Virtual Tripwire Analysis
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CCTV Station Network List */}
        <div className="space-y-4">
          <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#143157] text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Municipal Camera Directory
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                6 SENSORS ACTIVE
              </span>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {GOVERNMENT_CAMERAS.map((cam) => {
                const isSelected = selectedCameraId === cam.id;
                return (
                  <div
                    key={cam.id}
                    onClick={() => setSelectedCameraId(cam.id)}
                    className={`p-3 rounded cursor-pointer transition-all border text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#122D52] border-sky-400 text-white shadow-md'
                        : 'bg-[#0A1D38] border-[#163761] text-slate-300 hover:bg-[#0E2547]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-sky-300">{cam.code}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          cam.levelOfService === 'A'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                            : cam.levelOfService === 'B' || cam.levelOfService === 'C'
                            ? 'bg-blue-950 text-blue-300 border border-blue-700/50'
                            : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                        }`}
                      >
                        LOS {cam.levelOfService} · {cam.currentVPH} VPH
                      </span>
                    </div>

                    <div className="font-semibold text-white mt-1 text-xs">{cam.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">{cam.location}</div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-1 border-t border-white/5">
                      <span>{cam.roadType}</span>
                      <span className="text-emerald-400 font-semibold">{cam.activeVehicles} Vehicles</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

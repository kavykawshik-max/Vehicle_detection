import React, { useState } from 'react';
import { MapPin, Video, Camera, Activity, Shield, Navigation } from 'lucide-react';
import { GOVERNMENT_CAMERAS } from '../utils/cameraNetwork';
import { CameraFeed } from '../types/traffic';
import { NavTab } from './Sidebar';

interface CameraMapViewProps {
  onNavigate: (tab: NavTab) => void;
  onSelectCamera: (scenarioId: string) => void;
}

export const CameraMapView: React.FC<CameraMapViewProps> = ({ onNavigate, onSelectCamera }) => {
  const [activeCam, setActiveCam] = useState<CameraFeed>(GOVERNMENT_CAMERAS[0]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#163359]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-widest">
              GEOGRAPHIC SURVEILLANCE SENSOR MAP
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide uppercase font-sans mt-0.5">
            Municipal CCTV Network & Sensor Deployment
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
            <span>Metropolitan Traffic Sensor Topology</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Real-Time Level of Service (LOS)</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Arterial Telemetry</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#091B33] border border-[#183966]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>6/6 SENSORS CALIBRATED</span>
          </div>
        </div>
      </div>

      {/* Grid: Schematic Map on Left, Camera Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schematic Geographic Sensor Map (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#143157] text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                <span>Sector GIS Arterial Grid</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                WGS 84 COORDINATE PROJECTION
              </span>
            </div>

            {/* Tactical Grid Map Canvas / SVG */}
            <div className="relative aspect-[16/10] bg-[#050E1C] rounded overflow-hidden border border-[#183966] select-none p-4 flex flex-col justify-between">
              {/* Grid Lines Pattern */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #1E457A 1px, transparent 1px), linear-gradient(to bottom, #1E457A 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Highway Curves overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <path
                  d="M 50 400 Q 300 200 750 100"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="8"
                  strokeDasharray="8 6"
                />
                <path
                  d="M 200 50 Q 400 300 650 450"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="6"
                />
                <path
                  d="M 100 150 L 700 350"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Top Map Banner */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>SECTOR 02 // METROPOLITAN CORRIDOR</span>
                <span>ELEVATION: 42M // HIGHWAY TRANSIT ZONES</span>
              </div>

              {/* Clickable Camera Sensor Nodes on Map */}
              <div className="relative z-10 h-full w-full">
                {/* CAM 101 */}
                <div
                  onClick={() => setActiveCam(GOVERNMENT_CAMERAS[0])}
                  style={{ top: '25%', left: '42%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 ${
                    activeCam.id === 'cam-101' ? 'scale-125 z-20' : 'z-10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-lg animate-pulse">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-sky-300 border border-sky-500/40">
                      CAM-101 (Midtown)
                    </span>
                  </div>
                </div>

                {/* CAM 102 */}
                <div
                  onClick={() => setActiveCam(GOVERNMENT_CAMERAS[1])}
                  style={{ top: '48%', left: '72%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 ${
                    activeCam.id === 'cam-102' ? 'scale-125 z-20' : 'z-10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-600 border-2 border-white flex items-center justify-center text-white shadow-lg animate-pulse">
                      <Video className="w-4 h-4" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40">
                      CAM-102 (I-95 North)
                    </span>
                  </div>
                </div>

                {/* CAM 103 */}
                <div
                  onClick={() => setActiveCam(GOVERNMENT_CAMERAS[2])}
                  style={{ top: '65%', left: '28%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 ${
                    activeCam.id === 'cam-103' ? 'scale-125 z-20' : 'z-10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-lg">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/40">
                      CAM-103 (Civic Plaza)
                    </span>
                  </div>
                </div>

                {/* CAM 104 */}
                <div
                  onClick={() => setActiveCam(GOVERNMENT_CAMERAS[3])}
                  style={{ top: '78%', left: '55%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 ${
                    activeCam.id === 'cam-104' ? 'scale-125 z-20' : 'z-10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white shadow-lg">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/40">
                      CAM-104 (Curbside)
                    </span>
                  </div>
                </div>

                {/* CAM 105 */}
                <div
                  onClick={() => setActiveCam(GOVERNMENT_CAMERAS[4])}
                  style={{ top: '15%', left: '80%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 ${
                    activeCam.id === 'cam-105' ? 'scale-125 z-20' : 'z-10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-sky-700 border-2 border-white flex items-center justify-center text-white shadow-lg">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-sky-200 border border-sky-500/40">
                      CAM-105 (Pass 17)
                    </span>
                  </div>
                </div>

                {/* CAM 106 */}
                <div
                  onClick={() => setActiveCam(GOVERNMENT_CAMERAS[5])}
                  style={{ top: '35%', left: '18%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 ${
                    activeCam.id === 'cam-106' ? 'scale-125 z-20' : 'z-10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center text-white shadow-lg">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-teal-300 border border-teal-500/40">
                      CAM-106 (Park Sector)
                    </span>
                  </div>
                </div>
              </div>

              {/* Map Legend */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-black/70 p-2 rounded border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>Arterial Intersections</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <span>Interstate Expressways</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>Pedestrian Zones</span>
                  </div>
                </div>
                <span>CLICK SENSOR NODE TO INSPECT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="space-y-4">
          <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl space-y-4">
            <div className="pb-2.5 border-b border-[#143157]">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-sky-400 font-bold">{activeCam.code}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/50">
                  {activeCam.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{activeCam.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeCam.location}</p>
            </div>

            {/* Snapshot */}
            <div className="aspect-[16/10] bg-black rounded overflow-hidden border border-[#183966]">
              <img src={activeCam.imageSrc} alt={activeCam.name} className="w-full h-full object-cover" />
            </div>

            {/* Telemetry specs */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#143157]">
                <span className="text-slate-400">Roadway Type:</span>
                <span className="text-white font-semibold">{activeCam.roadType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#143157]">
                <span className="text-slate-400">Level of Service:</span>
                <span className="text-sky-300 font-bold">LOS {activeCam.levelOfService}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#143157]">
                <span className="text-slate-400">Vehicles Per Hour:</span>
                <span className="text-amber-300 font-bold">{activeCam.currentVPH} VPH</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#143157]">
                <span className="text-slate-400">GPS Coordinates:</span>
                <span className="text-slate-300">{activeCam.coordinates.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Active Count:</span>
                <span className="text-emerald-400 font-bold">{activeCam.activeVehicles} Units</span>
              </div>
            </div>

            {/* Launch inspection */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onSelectCamera(activeCam.scenarioId);
                  onNavigate('image');
                }}
                className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs transition-colors shadow"
              >
                Inspect in Forensic Photographic Unit
              </button>
              <button
                onClick={() => {
                  onSelectCamera(activeCam.scenarioId);
                  onNavigate('video');
                }}
                className="w-full py-2 rounded bg-[#0F2849] hover:bg-[#163B6B] text-sky-200 font-sans font-semibold text-xs border border-[#1A457A] transition-colors"
              >
                Launch Multi-Object Video Tracking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

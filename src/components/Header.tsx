import React, { useState, useEffect } from 'react';
import { Shield, Clock, Radio, Activity, Lock } from 'lucide-react';

interface HeaderProps {
  onNewAnalysis?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewAnalysis }) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [localTime, setLocalTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      );
      setLocalTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' LOCAL'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#050C17] border-b border-[#132A4A] select-none shadow-xl sticky top-0 z-40 shrink-0 w-full">
      {/* Top Government Security Classification Ribbon */}
      <div className="bg-[#08172B] border-b border-[#163359] px-6 py-1 flex items-center justify-between text-[11px] font-mono tracking-widest text-slate-300">
        <div className="flex items-center gap-2">
          <Lock className="w-3 h-3 text-amber-400" />
          <span className="font-bold text-amber-300">FOR OFFICIAL GOVERNMENT USE ONLY</span>
          <span className="text-slate-500">·</span>
          <span>LAW ENFORCEMENT & TRAFFIC ENGINEERING OPERATIONS</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>CONSOLE: TOC-STATION-07</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-semibold">SECURE UPLINK ACTIVE</span>
        </div>
      </div>

      {/* Main Department Header */}
      <div className="px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Department Seal & Titles */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded bg-[#0A1B33] border-2 border-[#1E457A] flex items-center justify-center shrink-0 shadow-inner relative">
            <Shield className="w-7 h-7 text-sky-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 border border-white/40 flex items-center justify-center text-[9px] font-bold text-white">
              ★
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-wider uppercase font-sans">
                DEPARTMENT OF TRANSPORTATION
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#102A4C] text-sky-300 border border-[#1A447A] font-semibold">
                NATIONAL ITS DIRECTORY
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium tracking-normal mt-0.5">
              Intelligent Traffic Surveillance & Arterial Operations Directorate · Civil Infrastructure
            </div>
          </div>
        </div>

        {/* Live Operational Readouts */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Station Clock */}
          <div className="px-3 py-1.5 rounded bg-[#0A1C35] border border-[#173863] text-slate-300 flex items-center gap-2 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-bold text-white tabular-nums tracking-wide">{utcTime || 'SYNCHRONIZING...'}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 text-[11px] tabular-nums">{localTime}</span>
          </div>

          {/* Model Status */}
          <div className="px-3 py-1.5 rounded bg-[#0A1C35] border border-[#173863] flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>INFERENCE:</span>
            <span className="text-emerald-400 font-bold">YOLOv8n [COCO-80]</span>
          </div>

          {/* Rapid Action */}
          {onNewAnalysis && (
            <button
              onClick={onNewAnalysis}
              className="px-3.5 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-sans font-semibold text-xs transition-colors shadow-md border border-blue-500"
            >
              + Dispatch Analysis
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

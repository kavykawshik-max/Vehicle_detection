import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  X,
  Search,
  Eye,
  Crosshair,
  Sliders,
  Copy,
  Check,
  Cpu,
  Lock,
  Flag,
  Share2,
  FileCheck,
} from 'lucide-react';
import { DetectionItem, LicensePlateData } from '../types/traffic';

interface LicensePlateInspectorModalProps {
  detection: DetectionItem | null;
  onClose: () => void;
  onUpdatePlateStatus?: (plateNumber: string, newStatus: LicensePlateData['status']) => void;
}

export const LicensePlateInspectorModal: React.FC<LicensePlateInspectorModalProps> = ({
  detection,
  onClose,
  onUpdatePlateStatus,
}) => {
  const [filterMode, setFilterMode] = useState<'normal' | 'binarized' | 'infrared' | 'sobel'>('binarized');
  const [copied, setCopied] = useState<boolean>(false);
  const [citationIssued, setCitationIssued] = useState<boolean>(false);

  if (!detection || !detection.plate) return null;

  const plate = detection.plate;

  const handleCopy = () => {
    navigator.clipboard.writeText(plate.plateNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAlert = plate.status === 'WATCHLIST_FLAG' || plate.status === 'EXPIRED_REG';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#061224] border border-cyan-500/40 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden font-sans text-slate-200 text-xs border-t-2 border-t-cyan-400">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#091A33] to-[#040C1A] border-b border-[#143157] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Crosshair className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                  ANPR / ALPR FORENSIC OCR INSPECTOR
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  NEURAL OCR v2.8
                </span>
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                License Plate Verification: {plate.plateNumber}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0E223D] hover:bg-[#163761] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Watchlist Alert Banner if applicable */}
          {plate.status === 'WATCHLIST_FLAG' && (
            <div className="p-3.5 rounded-lg bg-rose-950/70 border border-rose-500/70 text-rose-200 text-xs flex items-center justify-between gap-3 animate-pulse shadow-lg shadow-rose-950/40">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <strong className="font-bold uppercase tracking-wider text-rose-300">
                    INTER-AGENCY WATCHLIST FLAG:
                  </strong>{' '}
                  Outstanding Municipal Summons & Suspended Registration ({plate.unpaidViolationsCount} active violations).
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-900 font-mono text-[10px] font-bold uppercase text-white border border-rose-400 shrink-0">
                PRIORITY 1
              </span>
            </div>
          )}

          {plate.status === 'EXPIRED_REG' && (
            <div className="p-3.5 rounded-lg bg-amber-950/70 border border-amber-500/70 text-amber-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="font-bold uppercase tracking-wider text-amber-300">
                  REGISTRATION LAPSED:
                </strong>{' '}
                Vehicle inspection expired on {plate.inspectionExpiry}. Citation eligible under Section 401(1).
              </div>
            </div>
          )}

          {/* Plate Digital Rendering & Filter Modes */}
          <div className="p-4 rounded-lg bg-[#040C1A] border border-[#143157] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase text-[11px]">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Optical Plate Binarization & Enhancement</span>
              </span>

              {/* Filter mode toggles */}
              <div className="flex items-center gap-1 p-0.5 rounded bg-[#08172D] border border-[#143157] text-[10px]">
                <button
                  onClick={() => setFilterMode('normal')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'normal' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw Crop
                </button>
                <button
                  onClick={() => setFilterMode('binarized')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'binarized' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Otsu Binarized
                </button>
                <button
                  onClick={() => setFilterMode('infrared')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'infrared' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Night-Vision
                </button>
                <button
                  onClick={() => setFilterMode('sobel')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'sobel' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sobel Edges
                </button>
              </div>
            </div>

            {/* High-tech Plate Graphic Card */}
            <div className="flex items-center justify-center p-6 bg-gradient-to-b from-[#061426] to-[#020712] rounded border border-cyan-500/30 relative overflow-hidden shadow-inner">
              {/* Scanline overlay effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

              {/* The License Plate Plate Graphic */}
              <div
                className={`relative px-8 py-4 rounded-md border-4 shadow-2xl transition-all duration-300 ${
                  filterMode === 'binarized'
                    ? 'bg-white text-black border-slate-900 font-mono tracking-widest'
                    : filterMode === 'infrared'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-400 font-mono tracking-widest'
                    : filterMode === 'sobel'
                    ? 'bg-black text-emerald-400 border-emerald-500 font-mono tracking-widest'
                    : 'bg-amber-100 text-blue-950 border-amber-300 font-mono tracking-widest'
                }`}
                style={{
                  minWidth: '280px',
                  boxShadow: '0 10px 30px -5px rgba(0, 240, 255, 0.25)',
                }}
              >
                {/* State Banner */}
                <div className="text-center font-bold text-[10px] uppercase tracking-widest border-b pb-0.5 opacity-80">
                  {plate.stateOrRegion}
                </div>

                {/* Primary Alphanumeric Text */}
                <div className="text-3xl font-black text-center my-1 tracking-wider select-all font-mono drop-shadow">
                  {plate.plateNumber}
                </div>

                {/* Bottom Registration Year / Seal */}
                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider pt-0.5 border-t opacity-70">
                  <span>DOT DEPT</span>
                  <span>{plate.status === 'TRANSIT_OFFICIAL' ? 'OFFICIAL' : 'VERIFIED'}</span>
                  <span>2026</span>
                </div>
              </div>

              {/* Confidence Score Pill */}
              <div className="absolute bottom-2 right-3 font-mono text-[10px] text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/40">
                OCR CONFIDENCE: <strong>{(plate.confidence * 100).toFixed(1)}%</strong>
              </div>
            </div>

            {/* Per-character OCR verification bar */}
            <div className="space-y-1.5 font-mono text-[10px]">
              <div className="flex justify-between text-slate-400">
                <span>NEURAL CHARACTER CONFIDENCE PROFILES:</span>
                <span className="text-cyan-400 font-bold">ALL CHARACTERS {'>'} 94%</span>
              </div>
              <div className="flex items-center gap-1.5">
                {plate.plateNumber.split('').map((char, idx) => {
                  if (char === ' ' || char === '·' || char === '-') {
                    return <span key={idx} className="text-slate-600 font-bold px-0.5">{char}</span>;
                  }
                  return (
                    <div
                      key={idx}
                      className="flex-1 py-1 rounded bg-[#091D38] border border-cyan-500/40 text-center font-bold text-white shadow-sm"
                    >
                      <div className="text-xs text-cyan-300">{char}</div>
                      <div className="text-[8px] text-emerald-400">98%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DMV & Law Enforcement Database Verification Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-[#07172E] border border-[#143157] space-y-2">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#143157]">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>DMV Registration Dossier</span>
              </h4>

              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Issuing State:</span>
                  <span className="text-white font-bold">{plate.stateOrRegion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered Model:</span>
                  <span className="text-sky-300 font-bold">{plate.vehicleModel || 'Standard Fleet Passenger'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VIN Snippet:</span>
                  <span className="text-slate-200 select-all">{plate.vinSnippet || '1HGCM82633A00****'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered Owner:</span>
                  <span className="text-slate-200">{plate.registeredOwner || 'Confidential Law Enforcement Hold'}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#07172E] border border-[#143157] space-y-2">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#143157]">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Enforcement & Compliance</span>
              </h4>

              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Registration Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      plate.status === 'CLEARED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                        : plate.status === 'WATCHLIST_FLAG'
                        ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                        : plate.status === 'TRANSIT_OFFICIAL'
                        ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-600/50'
                    }`}
                  >
                    {plate.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inspection Expiry:</span>
                  <span className="text-slate-200">{plate.inspectionExpiry || '2027-06-30'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unpaid Violations:</span>
                  <span className={plate.unpaidViolationsCount ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {plate.unpaidViolationsCount || 0} Infractions
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stolen Vehicle Registry:</span>
                  <span className="text-emerald-400 font-bold">CLEARED (NCIC NEGATIVE)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="pt-2 border-t border-[#143157] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded bg-[#091D38] hover:bg-[#0E2A52] text-slate-200 border border-[#143157] font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Plate Number'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCitationIssued(true);
                  setTimeout(() => setCitationIssued(false), 3000);
                }}
                className={`px-3.5 py-1.5 rounded font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition-all ${
                  citationIssued
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-700 hover:bg-rose-600 text-white border border-rose-500'
                }`}
              >
                {citationIssued ? <Check className="w-3.5 h-3.5" /> : <FileCheck className="w-3.5 h-3.5" />}
                <span>{citationIssued ? 'Citation Dispatched!' : 'Issue Digital Citation'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow border border-blue-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

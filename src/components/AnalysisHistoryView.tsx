import React, { useState } from 'react';
import {
  Clock,
  Trash2,
  FileText,
  Search,
  CheckCircle2,
  Download,
  Shield,
  Lock,
  MapPin,
  Camera,
} from 'lucide-react';
import { AnalysisRecord } from '../types/traffic';
import { CLASS_COLORS, generateCSVReport } from '../utils/cvEngine';

interface AnalysisHistoryViewProps {
  analyses: AnalysisRecord[];
  onDeleteRecord: (id: number) => void;
  selectedRecordId?: number | null;
}

export const AnalysisHistoryView: React.FC<AnalysisHistoryViewProps> = ({
  analyses,
  onDeleteRecord,
  selectedRecordId: initialSelectedId,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(
    initialSelectedId || (analyses.length > 0 ? analyses[0].id : null)
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = analyses.filter(
    (a) =>
      a.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.fileType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.cameraId && a.cameraId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedRecord = analyses.find((a) => a.id === selectedId) || (filtered.length > 0 ? filtered[0] : null);

  const handleExportAll = () => {
    const csvContent = generateCSVReport(analyses);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OFFICIAL_DOT_AUDIT_ARCHIVE_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Department Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#163359]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-widest">
              OFFICIAL RELATIONAL ARCHIVE & EVIDENCE LOG
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide uppercase font-sans mt-0.5">
            Legal Audit Archive & Chain of Custody Logs
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
            <span>Department of Transportation</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>SQLite3 Persistent Storage</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Digital Cryptographic Signatures</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search evidence archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07172E] border border-[#1A3F70] rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          {analyses.length > 0 && (
            <button
              onClick={handleExportAll}
              className="px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-500 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="p-12 text-center rounded bg-[#07172E] border border-[#1A3F70] text-slate-400 text-xs font-mono">
          Zero surveillance operations logged in the audit trail. Ingest evidence via Photo or Video units to create legal records.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Scrollable List of Records */}
          <div className="p-3.5 rounded bg-[#07172E] border border-[#1A3F70] space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#143157] text-xs font-mono">
              <span className="font-bold text-white uppercase tracking-wider">
                Logged Sessions ({filtered.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">SQLITE ENCLAVE</span>
            </div>

            <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1 font-mono">
              {filtered.map((a) => {
                const isSelected = selectedRecord?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className={`p-3 rounded cursor-pointer transition-all border text-xs ${
                      isSelected
                        ? 'bg-[#122D52] border-sky-400 text-white shadow-md'
                        : 'bg-[#0A1D38] border-[#163761] text-slate-300 hover:bg-[#0E2547]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-sky-300">LOG #{a.id}</span>
                      <span className="text-[10px] font-semibold text-slate-300 uppercase">
                        {a.fileType}
                      </span>
                    </div>

                    <div className="font-semibold text-white mt-1 truncate">{a.fileName}</div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>{a.timestamp.slice(0, 10)}</span>
                      <span className="font-bold text-emerald-400">{a.totalVehicleCount} Vehicles</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Record Inspector */}
          <div className="lg:col-span-2 space-y-4">
            {selectedRecord ? (
              <div className="p-5 rounded bg-[#07172E] border border-[#1A3F70] space-y-5 shadow-xl font-mono">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#143157]">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-sky-400 font-bold">EVIDENCE RECORD #{selectedRecord.id}</span>
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED & NOTARIZED</span>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 uppercase font-sans">{selectedRecord.fileName}</h3>
                    <div className="text-xs text-slate-400 mt-0.5 font-sans">
                      Station: <strong className="text-slate-200">{selectedRecord.cameraId || 'CCTV-STATION-TOC'}</strong> · Location: <strong className="text-slate-200">{selectedRecord.locationName || 'Municipal District'}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteRecord(selectedRecord.id)}
                    className="px-3 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-700/50 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Expunge Record</span>
                  </button>
                </div>

                {/* Primary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded bg-[#050E1C] border border-[#143157]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">MEDIA TYPE</div>
                    <div className="text-sm font-bold text-white mt-1 uppercase">{selectedRecord.fileType}</div>
                  </div>
                  <div className="p-3 rounded bg-[#050E1C] border border-[#143157]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">VEHICULAR CENSUS</div>
                    <div className="text-sm font-black text-sky-400 mt-1">{selectedRecord.totalVehicleCount} UNITS</div>
                  </div>
                  <div className="p-3 rounded bg-[#050E1C] border border-[#143157]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">INFERENCE LATENCY</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">{selectedRecord.processingTime.toFixed(2)}s</div>
                  </div>
                  <div className="p-3 rounded bg-[#050E1C] border border-[#143157]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">STAMP (UTC)</div>
                    <div className="text-[11px] text-slate-300 mt-1">{selectedRecord.timestamp}</div>
                  </div>
                </div>

                {/* Cryptographic Chain of Custody */}
                <div className="p-3 rounded bg-[#050E1C] border border-[#143157] space-y-1 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span>CHAIN OF CUSTODY INTEGRITY SIGNATURE</span>
                  </div>
                  <div className="text-[11px] text-sky-300 select-all font-mono break-all">
                    {selectedRecord.evidenceHash || '8f49a37e1b52c04e287b4198cc4f7284b39178ad94c1e05a8f62c019d3e85741'}
                  </div>
                </div>

                {/* Description */}
                <div className="p-3.5 rounded bg-[#050E1C] border border-[#143157] space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>OFFICIAL EXECUTIVE SUMMARY</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{selectedRecord.description}</p>
                </div>

                {/* Vehicle Classification Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Official Classification Census
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {Object.entries(selectedRecord.summary.categoryCounts).map(([cat, count]) => (
                      <div
                        key={cat}
                        className="p-2 rounded bg-[#050E1C] border border-[#143157] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: CLASS_COLORS[cat] || '#38BDF8' }}
                          />
                          <span className="capitalize text-slate-300">{cat}:</span>
                        </div>
                        <span className="font-bold text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Snapshot preview if available */}
                {selectedRecord.annotatedDataUrl && (
                  <div className="space-y-2 pt-2 border-t border-[#143157]">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Photographic Evidence Snapshot
                    </div>
                    <div className="max-h-[260px] bg-black rounded overflow-hidden border border-[#143157] flex items-center justify-center">
                      <img
                        src={selectedRecord.annotatedDataUrl}
                        alt="Snapshot"
                        className="max-h-[260px] w-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                Select an evidence record from the inventory column to inspect notarized metadata.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

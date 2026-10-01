import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Shield,
  Activity,
  Printer,
} from 'lucide-react';
import { AnalysisRecord } from '../types/traffic';
import { generateCSVReport, generateIncidentBulletin, CLASS_COLORS } from '../utils/cvEngine';

interface TrafficStatisticsViewProps {
  analyses: AnalysisRecord[];
}

export const TrafficStatisticsView: React.FC<TrafficStatisticsViewProps> = ({ analyses }) => {
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter records
  const filtered = analyses.filter((a) => {
    if (filterType !== 'all' && a.fileType !== filterType) return false;
    if (filterCategory !== 'all') {
      const count = a.summary.categoryCounts[filterCategory] || 0;
      if (count <= 0) return false;
    }
    return true;
  });

  // Calculate cumulative stats for filtered
  const totalVehicles = filtered.reduce((acc, a) => acc + a.totalVehicleCount, 0);
  const totalCrossings = filtered.reduce(
    (acc, a) => acc + (a.crossingSummary?.totalCrossingEvents || 0),
    0
  );
  const totalAtoB = filtered.reduce(
    (acc, a) => acc + (a.crossingSummary?.directionAToBCount || 0),
    0
  );
  const totalBtoA = filtered.reduce(
    (acc, a) => acc + (a.crossingSummary?.directionBToACount || 0),
    0
  );

  const categoryTotals: Record<string, number> = {
    car: 0,
    motorcycle: 0,
    bus: 0,
    truck: 0,
    bicycle: 0,
    train: 0,
  };

  filtered.forEach((a) => {
    Object.entries(a.summary.categoryCounts).forEach(([k, v]) => {
      categoryTotals[k] = (categoryTotals[k] || 0) + v;
    });
  });

  const maxCatCount = Math.max(1, ...Object.values(categoryTotals));

  // CSV download
  const handleDownloadCSV = () => {
    const csvContent = generateCSVReport(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DOT_TRAFFIC_AUDIT_REPORT_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Incident bulletin download
  const handleDownloadBulletin = () => {
    if (filtered.length === 0) return;
    const bulletin = generateIncidentBulletin(filtered[0]);
    const blob = new Blob([bulletin], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OFFICIAL_INCIDENT_BULLETIN_${filtered[0].id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Department Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#163359]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-widest">
              NATIONAL ARTERIAL PERFORMANCE DIVISION
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide uppercase font-sans mt-0.5">
            Municipal Traffic Analytics & Macro Surveillance Audit
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
            <span>Department of Transportation</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Highway Capacity Manual (HCM) Metrics</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>RFC-4180 Audit Export</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-[#07172E] border border-[#1A3F70] rounded p-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-transparent text-slate-200 py-0.5 px-2 rounded focus:outline-none"
            >
              <option value="all">ALL SENSOR MEDIA</option>
              <option value="image">PHOTOGRAPHIC ONLY</option>
              <option value="video">VIDEO STREAMS ONLY</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#07172E] border border-[#1A3F70] rounded p-1">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-slate-200 py-0.5 px-2 rounded focus:outline-none"
            >
              <option value="all">ALL VEHICLE CLASSES</option>
              <option value="car">CARS ONLY</option>
              <option value="motorcycle">MOTORCYCLES ONLY</option>
              <option value="bus">TRANSIT BUSES ONLY</option>
              <option value="truck">FREIGHT TRUCKS ONLY</option>
              <option value="bicycle">BICYCLES ONLY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            FILTERED LOG ENTRIES
          </div>
          <div className="text-3xl font-black text-white mt-1">{filtered.length}</div>
          <div className="text-[11px] text-slate-400 font-sans mt-0.5">Matching surveillance records</div>
        </div>

        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            TOTAL CENSUS UNITS
          </div>
          <div className="text-3xl font-black text-sky-400 mt-1">{totalVehicles}</div>
          <div className="text-[11px] text-emerald-400 font-sans mt-0.5">Verified across audit scope</div>
        </div>

        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            TOTAL BOUNDARY CROSSINGS
          </div>
          <div className="text-3xl font-black text-amber-300 mt-1">{totalCrossings}</div>
          <div className="text-[11px] text-slate-400 font-sans mt-0.5">Tripwire boundary breaches</div>
        </div>

        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            DIRECTIONAL TRAFFIC SPLIT
          </div>
          <div className="text-base font-black text-white mt-2 flex items-center gap-2">
            <span className="text-sky-400">A→B: {totalAtoB}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">B→A: {totalBtoA}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-sans mt-0.5">Inbound vs Outbound</div>
        </div>
      </div>

      {/* Visual Volume Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#143157]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Census by COCO Vehicle Classification</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: {totalVehicles}</span>
          </div>

          <div className="mt-4 space-y-3 font-mono">
            {Object.entries(categoryTotals).map(([cat, count]) => {
              const pct = (count / maxCatCount) * 100;
              const color = CLASS_COLORS[cat] || '#38BDF8';
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 capitalize">{cat}</span>
                    <span className="text-white font-bold">{count} units</span>
                  </div>
                  <div className="w-full h-2 rounded bg-[#050E1C] overflow-hidden border border-[#143157]">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${Math.max(count > 0 ? 5 : 0, pct)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fleet Composition */}
        <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#143157]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Arterial Fleet Composition Ratios</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">PERCENTAGES</span>
          </div>

          {totalVehicles > 0 ? (
            <div className="py-4 space-y-4">
              <div className="flex h-3.5 rounded overflow-hidden bg-[#050E1C] border border-[#143157]">
                {Object.entries(categoryTotals)
                  .filter(([_, count]) => count > 0)
                  .map(([cat, count]) => {
                    const widthPct = (count / totalVehicles) * 100;
                    return (
                      <div
                        key={cat}
                        className="h-full transition-all duration-500"
                        style={{ width: `${widthPct}%`, backgroundColor: CLASS_COLORS[cat] || '#38BDF8' }}
                        title={`${cat}: ${widthPct.toFixed(1)}%`}
                      />
                    );
                  })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 font-mono">
                {Object.entries(categoryTotals).map(([cat, count]) => {
                  const pct = totalVehicles > 0 ? ((count / totalVehicles) * 100).toFixed(1) : '0';
                  return (
                    <div key={cat} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CLASS_COLORS[cat] || '#38BDF8' }}
                      />
                      <span className="text-slate-300 capitalize">{cat}:</span>
                      <span className="text-white font-bold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-mono">
              Zero vehicle classifications recorded under the active filter scope.
            </div>
          )}

          <div className="pt-3 border-t border-[#143157] text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>FILTER: {filterType.toUpperCase()}</span>
            <span className="text-emerald-400 font-bold">STATUS: NOTARIZED AUDIT</span>
          </div>
        </div>
      </div>

      {/* Export Reports Box */}
      <div className="p-4 rounded bg-[#07172E] border border-[#1A3F70] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-400" />
              <span>Official Export & Certified Reports</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Generate RFC-4180 government census data or print official traffic incident bulletins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadCSV}
              disabled={filtered.length === 0}
              className="px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border border-emerald-500 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download CSV Audit Log</span>
            </button>

            <button
              onClick={handleDownloadBulletin}
              disabled={filtered.length === 0}
              className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border border-blue-500 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Download Incident Bulletin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

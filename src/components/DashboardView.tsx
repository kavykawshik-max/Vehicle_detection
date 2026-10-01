import React from 'react';
import {
  Car,
  Bike,
  Bus,
  Truck,
  FileVideo,
  FileImage,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { AnalysisRecord } from '../types/traffic';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  analyses: AnalysisRecord[];
  onNavigate: (tab: NavTab) => void;
  onSelectRecord: (id: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analyses,
  onNavigate,
  onSelectRecord,
}) => {
  const totalVehicles = analyses.reduce((acc, a) => acc + a.totalVehicleCount, 0);
  const totalImages = analyses.filter((a) => a.fileType === 'image').length;
  const totalVideos = analyses.filter((a) => a.fileType === 'video').length;

  const cars = analyses.reduce((acc, a) => acc + (a.summary.cars || 0), 0);
  const motorcycles = analyses.reduce((acc, a) => acc + (a.summary.motorcycles || 0), 0);
  const buses = analyses.reduce((acc, a) => acc + (a.summary.buses || 0), 0);
  const trucks = analyses.reduce((acc, a) => acc + (a.summary.trucks || 0), 0);
  const bicycles = analyses.reduce((acc, a) => acc + (a.summary.bicycles || 0), 0);

  const vehicleCategories = [
    { label: 'Cars', count: cars, color: '#38BDF8', icon: Car },
    { label: 'Motorcycles', count: motorcycles, color: '#F59E0B', icon: Bike },
    { label: 'Buses', count: buses, color: '#A855F7', icon: Bus },
    { label: 'Trucks', count: trucks, color: '#22C55E', icon: Truck },
    { label: 'Bicycles', count: bicycles, color: '#EAB308', icon: Bike },
  ];

  const maxCategoryCount = Math.max(1, ...vehicleCategories.map((c) => c.count));

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Traffic Operations Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time vehicle census, fleet composition, and recent surveillance logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('image')}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileImage className="w-4 h-4" />
            <span>Detect in Photo</span>
          </button>
          <button
            onClick={() => onNavigate('video')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <FileVideo className="w-4 h-4" />
            <span>Track in Video</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Vehicles
          </div>
          <div className="text-3xl font-extrabold text-white mt-1.5 font-mono">{totalVehicles}</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Verified across all runs
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Photos Analyzed
          </div>
          <div className="text-3xl font-extrabold text-white mt-1.5 font-mono">{totalImages}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Static road captures
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Videos Analyzed
          </div>
          <div className="text-3xl font-extrabold text-white mt-1.5 font-mono">{totalVideos}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Live video streams
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Saved Records
          </div>
          <div className="text-3xl font-extrabold text-white mt-1.5 font-mono">{analyses.length}</div>
          <div className="text-[11px] text-blue-400 mt-1">
            Stored in SQLite database
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-300">
          Vehicle Category Breakdown
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {vehicleCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                className="p-3.5 rounded-lg bg-[#111827] border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">{cat.label}</span>
                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-2">{cat.count}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {totalVehicles > 0
                    ? `${((cat.count / totalVehicles) * 100).toFixed(1)}% of fleet`
                    : '0%'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Bar Chart */}
        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Vehicle Count by Class</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total: {totalVehicles}</span>
          </div>

          <div className="mt-4 space-y-3">
            {vehicleCategories.map((cat) => {
              const pct = (cat.count / maxCategoryCount) * 100;
              return (
                <div key={cat.label}>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-300">{cat.label}</span>
                    <span className="text-white font-bold">{cat.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(cat.count > 0 ? 5 : 0, pct)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fleet Composition */}
        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Fleet Share</span>
            </h3>
            <span className="text-xs text-slate-400">Class Ratios</span>
          </div>

          {totalVehicles > 0 ? (
            <div className="py-4 space-y-4">
              <div className="flex h-3.5 rounded-full overflow-hidden bg-slate-800">
                {vehicleCategories
                  .filter((c) => c.count > 0)
                  .map((c) => {
                    const widthPct = (c.count / totalVehicles) * 100;
                    return (
                      <div
                        key={c.label}
                        className="h-full transition-all duration-500"
                        style={{ width: `${widthPct}%`, backgroundColor: c.color }}
                        title={`${c.label}: ${widthPct.toFixed(1)}%`}
                      />
                    );
                  })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {vehicleCategories.map((c) => {
                  const pct = totalVehicles > 0 ? ((c.count / totalVehicles) * 100).toFixed(1) : '0';
                  return (
                    <div key={c.label} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-slate-300">{c.label}:</span>
                      <span className="text-white font-mono font-bold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No vehicles in database yet. Detect vehicles in a photo or video to view fleet share.
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Model: YOLOv8n</span>
            <button
              onClick={() => onNavigate('stats')}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>View full statistics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="p-4 rounded-lg bg-[#111827] border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">
            Recent Analysis Sessions
          </h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {analyses.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">File Name</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Vehicles</th>
                  <th className="py-2 px-3">Latency</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
                {analyses.slice(0, 5).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400">#{a.id}</td>
                    <td className="py-2.5 px-3 text-white font-medium truncate max-w-[220px]">{a.fileName}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-300 capitalize">{a.fileType}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{a.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-white font-mono">{a.totalVehicleCount}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{a.processingTime.toFixed(2)}s</td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-400 text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectRecord(a.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            No analysis sessions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

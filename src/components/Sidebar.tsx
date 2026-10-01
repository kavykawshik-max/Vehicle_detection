import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Video,
  Cpu,
  MapPin,
  BarChart3,
  Archive,
  FileText,
  Shield,
  Radio,
  Lock,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'image' | 'video' | 'training' | 'map' | 'stats' | 'history' | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  analysisCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, analysisCount }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, index: '01', label: 'Operations Center', icon: LayoutDashboard },
    { id: 'image' as NavTab, index: '02', label: 'Forensic Photo Unit', icon: Camera },
    { id: 'video' as NavTab, index: '03', label: 'Video Tripwire Unit', icon: Video },
    { id: 'training' as NavTab, index: '04', label: 'Model Training Studio', icon: Cpu },
    { id: 'map' as NavTab, index: '05', label: 'Camera Network Map', icon: MapPin },
    { id: 'stats' as NavTab, index: '06', label: 'Municipal Analytics', icon: BarChart3 },
    { id: 'history' as NavTab, index: '07', label: 'Legal Audit Archive', icon: Archive, count: analysisCount },
    { id: 'about' as NavTab, index: '08', label: 'Agency Mandates & Specs', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#050D1A] border-r border-[#132A4A] flex flex-col justify-between p-3.5 shrink-0 select-none shadow-2xl h-full overflow-y-auto sticky top-0 left-0 z-30">
      <div className="space-y-4">
        {/* Module Category Ribbon */}
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 flex items-center justify-between border-b border-[#11243E] pb-2">
          <span>SURVEILLANCE TERMINAL</span>
          <span className="text-emerald-400 font-bold">SECURE</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#0E2647] text-white border-l-2 border-l-sky-400 font-semibold shadow-inner'
                    : 'text-slate-300 hover:bg-[#08182E] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono text-slate-400">{item.index}</span>
                  <Icon className={`w-4 h-4 ${active ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#061224] text-sky-300 border border-[#16355F]">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Official Government Station Badge Card */}
      <div className="pt-3 border-t border-[#11243E] space-y-2">
        <div className="p-3 rounded bg-[#08172D] border border-[#143257] text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 font-bold text-sky-300 text-xs">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>FEDERAL ITS TERMINAL</span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Station ID:</span>
              <span className="font-bold text-white">TOC-SEC-07</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jurisdiction:</span>
              <span className="text-white">Municipal Transit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Neural Model:</span>
              <span className="text-emerald-400 font-bold">YOLOv8n (FP32)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Class Standard:</span>
              <span className="text-amber-300">COCO 80-Class</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>CLASSIFIED CONSOLE</span>
          <span>BUILD 2026.09</span>
        </div>
      </div>
    </aside>
  );
};

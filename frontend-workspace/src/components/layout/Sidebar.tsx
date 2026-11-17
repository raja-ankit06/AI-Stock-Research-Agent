import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart2,
  Bookmark,
  Compass,
  History,
  Layers,
  Settings,
  ShieldAlert,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: BarChart2 },
    { to: '/watchlists', label: 'Watchlists', icon: Bookmark },
    { to: '/history', label: 'Research History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 border-r border-[#1F293D] bg-[#111827] flex flex-col justify-between p-3 hidden md:flex shrink-0">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Active Multi-Agents
          </div>
          <div className="space-y-1.5 px-3 font-mono text-[11px]">
            <div className="flex items-center justify-between text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Supervisor
              </span>
              <span className="text-[10px] text-gray-400">Arbiter</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Fundamental
              </span>
              <span className="text-[10px] text-gray-400">Ratios</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Technical
              </span>
              <span className="text-[10px] text-gray-400">Signals</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Sentiment
              </span>
              <span className="text-[10px] text-gray-400">News</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Risk Analysis
              </span>
              <span className="text-[10px] text-gray-400">Audit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-gray-900/60 rounded border border-[#1F293D] text-[11px] text-gray-400">
        <p className="font-medium text-gray-300 mb-1">Institutional Rigor</p>
        <p className="text-[10px] leading-relaxed">
          100% deterministic indicators. Zero arithmetic hallucinations.
        </p>
      </div>
    </aside>
  );
};


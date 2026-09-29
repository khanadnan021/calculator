/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Calculator, Wrench, Activity, Bookmark, RotateCcw } from 'lucide-react';

export type ActiveTab = 'matrix' | 'calc' | 'solvers' | 'plotter' | 'constants';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  angleMode: 'deg' | 'rad';
  onAngleModeToggle: () => void;
  precision: number;
  onPrecisionChange: (p: number) => void;
  onResetSession?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  angleMode,
  onAngleModeToggle,
  precision,
  onPrecisionChange,
  onResetSession
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm">
            Ω
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100 font-mono">
            OmniEngineer
          </span>
        </div>

        {/* Zone 2: Navigation links / segmented tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto text-xs font-medium">
          <button
            onClick={() => onTabChange('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Unit Matrix</span>
          </button>

          <button
            onClick={() => onTabChange('calc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'calc'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Dimensional Calc</span>
          </button>

          <button
            onClick={() => onTabChange('solvers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'solvers'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Domain Solvers</span>
          </button>

          <button
            onClick={() => onTabChange('plotter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'plotter'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Function Plotter</span>
          </button>

          <button
            onClick={() => onTabChange('constants')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'constants'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Constants & Tape</span>
          </button>
        </nav>

        {/* Zone 3: Primary quick actions (Angle mode, Precision selector, Reset) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Angle mode toggle */}
          <button
            onClick={onAngleModeToggle}
            title="Toggle Trigonometric Angle Mode (Degrees vs Radians)"
            className="px-2.5 py-1 text-xs font-mono font-medium rounded border border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap"
          >
            <span className={angleMode === 'rad' ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>RAD</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className={angleMode === 'deg' ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>DEG</span>
          </button>

          {/* Precision Selector */}
          <div className="flex items-center text-xs font-mono bg-slate-900 border border-slate-800 rounded px-2 py-1">
            <span className="text-slate-500 mr-1.5">SIG:</span>
            <select
              value={precision}
              onChange={(e) => onPrecisionChange(Number(e.target.value))}
              className="bg-transparent text-slate-200 border-none outline-none cursor-pointer focus:ring-0"
            >
              <option value={4} className="bg-slate-900 text-slate-200">4</option>
              <option value={6} className="bg-slate-900 text-slate-200">6</option>
              <option value={8} className="bg-slate-900 text-slate-200">8</option>
              <option value={10} className="bg-slate-900 text-slate-200">10</option>
            </select>
          </div>

          {onResetSession && (
            <button
              onClick={onResetSession}
              title="Reset default parameters"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Calculator, Wrench, Activity, Bookmark, RotateCcw, Grid } from 'lucide-react';

export type ActiveTab = 'matrix' | 'calc' | 'solvers' | 'plotter' | 'constants';
export type NeonTheme = 'cyan' | 'magenta' | 'emerald' | 'amber';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  angleMode: 'deg' | 'rad';
  onAngleModeToggle: () => void;
  precision: number;
  onPrecisionChange: (p: number) => void;
  neonTheme: NeonTheme;
  onNeonThemeChange: (theme: NeonTheme) => void;
  neonGridVisible: boolean;
  onToggleNeonGrid: () => void;
  onResetSession?: () => void;
}

const NEON_PRESETS: { id: NeonTheme; label: string; color: string; glow: string }[] = [
  { id: 'cyan', label: 'Cyber Cyan', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.8)' },
  { id: 'magenta', label: 'Synthwave Pink', color: '#ff007f', glow: 'rgba(255, 0, 127, 0.8)' },
  { id: 'emerald', label: 'Matrix Lime', color: '#00ff66', glow: 'rgba(0, 255, 102, 0.8)' },
  { id: 'amber', label: 'Solar Amber', color: '#ffaa00', glow: 'rgba(255, 170, 0, 0.8)' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  angleMode,
  onAngleModeToggle,
  precision,
  onPrecisionChange,
  neonTheme,
  onNeonThemeChange,
  neonGridVisible,
  onToggleNeonGrid,
  onResetSession
}) => {
  const activePreset = NEON_PRESETS.find((p) => p.id === neonTheme) || NEON_PRESETS[0];

  const getActiveTabStyle = (tab: ActiveTab) => {
    if (activeTab !== tab) {
      return 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent';
    }
    switch (neonTheme) {
      case 'magenta':
        return 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.3)]';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
    }
  };

  const getLogoStyle = () => {
    switch (neonTheme) {
      case 'magenta':
        return 'bg-pink-950/80 border-pink-700/80 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.35)]';
      case 'emerald':
        return 'bg-emerald-950/80 border-emerald-700/80 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]';
      case 'amber':
        return 'bg-amber-950/80 border-amber-700/80 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]';
      default:
        return 'bg-cyan-950/80 border-cyan-700/80 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark with glowing neon logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold font-mono text-sm transition-all duration-300 ${getLogoStyle()}`}>
            Ω
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-100 font-mono flex items-center gap-1.5">
              OmniEngineer
              <span className="text-[10px] font-mono px-1 py-0.2 rounded border uppercase tracking-wider font-semibold"
                style={{
                  color: activePreset.color,
                  borderColor: `${activePreset.color}50`,
                  backgroundColor: `${activePreset.color}15`,
                  textShadow: `0 0 8px ${activePreset.glow}`
                }}
              >
                NEON
              </span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links / segmented tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-950/90 border border-slate-800/90 rounded-lg overflow-x-auto text-xs font-medium backdrop-blur-md">
          <button
            onClick={() => onTabChange('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${getActiveTabStyle('matrix')}`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Unit Matrix</span>
          </button>

          <button
            onClick={() => onTabChange('calc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${getActiveTabStyle('calc')}`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Dimensional Calc</span>
          </button>

          <button
            onClick={() => onTabChange('solvers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${getActiveTabStyle('solvers')}`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Domain Solvers</span>
          </button>

          <button
            onClick={() => onTabChange('plotter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${getActiveTabStyle('plotter')}`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Function Plotter</span>
          </button>

          <button
            onClick={() => onTabChange('constants')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${getActiveTabStyle('constants')}`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Constants & Tape</span>
          </button>
        </nav>

        {/* Zone 3: Primary quick actions (Neon theme, Angle mode, Precision selector, Reset) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Neon Palette Selector & Grid Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1 shadow-inner">
            <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full animate-pulse inline-block"
                style={{
                  backgroundColor: activePreset.color,
                  boxShadow: `0 0 8px ${activePreset.color}`
                }}
              />
              <span className="hidden xl:inline">NEON GLOW</span>
            </span>

            <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
              {NEON_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onNeonThemeChange(preset.id)}
                  title={`Neon Background: ${preset.label}`}
                  className={`w-4 h-4 rounded-full transition-all duration-200 cursor-pointer ${
                    neonTheme === preset.id
                      ? 'scale-125 ring-2 ring-white/90 shadow-md'
                      : 'opacity-50 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: preset.color,
                    boxShadow: neonTheme === preset.id ? `0 0 10px ${preset.color}` : 'none'
                  }}
                />
              ))}
            </div>

            <button
              onClick={onToggleNeonGrid}
              title={neonGridVisible ? "Hide Neon Cyber Grid" : "Show Neon Cyber Grid"}
              className={`ml-0.5 p-1 rounded text-xs transition-colors cursor-pointer ${
                neonGridVisible
                  ? 'text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Angle mode toggle */}
          <button
            onClick={onAngleModeToggle}
            title="Toggle Trigonometric Angle Mode (Degrees vs Radians)"
            className="px-2.5 py-1 text-xs font-mono font-medium rounded border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span className={angleMode === 'rad' ? 'text-cyan-400 font-semibold drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]' : 'text-slate-500'}>RAD</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className={angleMode === 'deg' ? 'text-cyan-400 font-semibold drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]' : 'text-slate-500'}>DEG</span>
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
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

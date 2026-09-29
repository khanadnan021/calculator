/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab, NeonTheme } from './components/Header';
import { UnitMatrixView } from './components/UnitMatrixView';
import { DimensionalCalcView, HistoryItem } from './components/DimensionalCalcView';
import { DomainSolversView } from './components/DomainSolversView';
import { FunctionPlotterView } from './components/FunctionPlotterView';
import { ConstantsTapeView } from './components/ConstantsTapeView';

interface NeonThemeConfig {
  laserBeam: string;
  orb1: string;
  orb2: string;
  orb3: string;
  gridColor: string;
  glowClass: string;
  selection: string;
  accentBadge: string;
}

const NEON_CONFIGS: Record<NeonTheme, NeonThemeConfig> = {
  cyan: {
    laserBeam: 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00f0ff]',
    orb1: 'bg-cyan-500/30',
    orb2: 'bg-blue-600/25',
    orb3: 'bg-fuchsia-600/20',
    gridColor: 'rgba(6, 182, 212, 0.18)',
    glowClass: 'neon-box-glow-cyan',
    selection: 'selection:bg-cyan-500/30 selection:text-cyan-200',
    accentBadge: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/60'
  },
  magenta: {
    laserBeam: 'bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_20px_#ff007f]',
    orb1: 'bg-pink-500/30',
    orb2: 'bg-purple-600/25',
    orb3: 'bg-rose-600/20',
    gridColor: 'rgba(236, 72, 153, 0.18)',
    glowClass: 'neon-box-glow-magenta',
    selection: 'selection:bg-pink-500/30 selection:text-pink-200',
    accentBadge: 'text-pink-400 border-pink-500/30 bg-pink-950/60'
  },
  emerald: {
    laserBeam: 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#00ff66]',
    orb1: 'bg-emerald-500/30',
    orb2: 'bg-teal-600/25',
    orb3: 'bg-lime-600/20',
    gridColor: 'rgba(16, 185, 129, 0.18)',
    glowClass: 'neon-box-glow-emerald',
    selection: 'selection:bg-emerald-500/30 selection:text-emerald-200',
    accentBadge: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/60'
  },
  amber: {
    laserBeam: 'bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#ffaa00]',
    orb1: 'bg-amber-500/30',
    orb2: 'bg-orange-600/25',
    orb3: 'bg-yellow-600/20',
    gridColor: 'rgba(245, 158, 11, 0.18)',
    glowClass: 'neon-box-glow-amber',
    selection: 'selection:bg-amber-500/30 selection:text-amber-200',
    accentBadge: 'text-amber-400 border-amber-500/30 bg-amber-950/60'
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('rad');
  const [precision, setPrecision] = useState<number>(6);
  const [neonTheme, setNeonTheme] = useState<NeonTheme>('cyan');
  const [neonGridVisible, setNeonGridVisible] = useState<boolean>(true);
  const [calcExpression, setCalcExpression] = useState<string>('50 kN / (25 mm * 50 mm) to MPa');

  const activeNeon = NEON_CONFIGS[neonTheme];

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'init_1',
      expression: '50 kN / (25 mm * 50 mm) to MPa',
      result: '40 MPa',
      timestamp: '10:00:00 AM'
    },
    {
      id: 'init_2',
      expression: '2.4 kW * 3.5 hr to MJ',
      result: '30.24 MJ',
      timestamp: '10:02:15 AM'
    },
    {
      id: 'init_3',
      expression: '12 V / 330 ohm to mA',
      result: '36.3636 mA',
      timestamp: '10:05:42 AM'
    }
  ]);

  const handleRecordHistory = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev.slice(0, 49)]); // keep up to 50 items
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleSendToCalc = (expression: string) => {
    setCalcExpression(expression);
    setActiveTab('calc');
  };

  const handleToggleAngleMode = () => {
    setAngleMode((prev) => (prev === 'deg' ? 'rad' : 'deg'));
  };

  const handleToggleNeonGrid = () => {
    setNeonGridVisible((prev) => !prev);
  };

  return (
    <div className={`min-h-screen bg-[#04060f] text-slate-100 flex flex-col font-sans relative overflow-x-hidden ${activeNeon.selection}`}>
      {/* Top Neon Laser Horizon Beam */}
      <div className={`fixed top-0 left-0 right-0 h-[2px] z-50 transition-all duration-700 ${activeNeon.laserBeam}`} />

      {/* Luminous Neon Ambient Background Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Neon Ambient Orb 1 (Top-Left) */}
        <div
          className={`absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-[140px] transition-all duration-1000 animate-neon-pulse ${activeNeon.orb1}`}
        />
        {/* Neon Ambient Orb 2 (Right-Center) */}
        <div
          className={`absolute top-1/4 -right-48 w-[600px] h-[600px] rounded-full blur-[150px] transition-all duration-1000 animate-neon-pulse-delayed ${activeNeon.orb2}`}
        />
        {/* Neon Ambient Orb 3 (Bottom-Center) */}
        <div
          className={`absolute -bottom-32 left-1/4 w-[750px] h-[550px] rounded-full blur-[160px] transition-all duration-1000 animate-neon-pulse ${activeNeon.orb3}`}
        />

        {/* Luminous Cyber Neon Grid */}
        {neonGridVisible && (
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${activeNeon.gridColor} 1px, transparent 1px),
                linear-gradient(to bottom, ${activeNeon.gridColor} 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse 95% 85% at 50% 30%, black 45%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 95% 85% at 50% 30%, black 45%, transparent 100%)'
            }}
          />
        )}

        {/* Ambient subtle cyber scanline texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)',
            backgroundSize: '100% 4px'
          }}
        />
      </div>

      {/* Main Content Area (Elevated above neon background) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Strict 3-zone Header Contract with Neon Controls */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          angleMode={angleMode}
          onAngleModeToggle={handleToggleAngleMode}
          precision={precision}
          onPrecisionChange={setPrecision}
          neonTheme={neonTheme}
          onNeonThemeChange={setNeonTheme}
          neonGridVisible={neonGridVisible}
          onToggleNeonGrid={handleToggleNeonGrid}
        />

        {/* Main Workspace Frame */}
        <main className="flex-1 w-full pb-16">
          {activeTab === 'matrix' && (
            <UnitMatrixView
              precision={precision}
              onSendToCalc={handleSendToCalc}
            />
          )}

          {activeTab === 'calc' && (
            <DimensionalCalcView
              initialExpression={calcExpression}
              angleMode={angleMode}
              precision={precision}
              onRecordHistory={handleRecordHistory}
            />
          )}

          {activeTab === 'solvers' && (
            <DomainSolversView
              precision={precision}
              onSendToCalc={handleSendToCalc}
            />
          )}

          {activeTab === 'plotter' && (
            <FunctionPlotterView />
          )}

          {activeTab === 'constants' && (
            <ConstantsTapeView
              history={history}
              onClearHistory={handleClearHistory}
              onSendToCalc={handleSendToCalc}
            />
          )}
        </main>

        {/* Subtle Neon Engineering Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md py-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-200 font-semibold">OmniEngineer</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Multi-Domain Scientific Calculator & Dimensional Matrix</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeNeon.gridColor.replace(/[\d.]+\)$/, '1)') }} />
                Neon Calibrated
              </span>
              <span className="text-slate-600">·</span>
              <span>CODATA 2022 Calibrated</span>
              <span className="text-slate-600">·</span>
              <span>SI Base & US Customary</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

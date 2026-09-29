/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { UnitMatrixView } from './components/UnitMatrixView';
import { DimensionalCalcView, HistoryItem } from './components/DimensionalCalcView';
import { DomainSolversView } from './components/DomainSolversView';
import { FunctionPlotterView } from './components/FunctionPlotterView';
import { ConstantsTapeView } from './components/ConstantsTapeView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('rad');
  const [precision, setPrecision] = useState<number>(6);
  const [calcExpression, setCalcExpression] = useState<string>('50 kN / (25 mm * 50 mm) to MPa');

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* Strict 3-zone Header Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        angleMode={angleMode}
        onAngleModeToggle={handleToggleAngleMode}
        precision={precision}
        onPrecisionChange={setPrecision}
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

      {/* Subtle Engineering Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400">OmniEngineer</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Domain Engineering Calculator & Unit Conversion Matrix</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>CODATA 2022 Calibrated</span>
            <span>SI Base & US Customary</span>
            <span>Dimensional Analysis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

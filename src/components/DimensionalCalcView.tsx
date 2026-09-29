/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { evaluateEngineeringMath, CalcResult } from '../services/mathEngine';
import { Copy, Check, ArrowRight, Delete, RotateCcw, Sparkles } from 'lucide-react';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

interface DimensionalCalcViewProps {
  initialExpression?: string;
  angleMode: 'deg' | 'rad';
  precision: number;
  onRecordHistory: (item: HistoryItem) => void;
}

const COMMON_UNITS = [
  { group: 'Force & Pressure', units: ['N', 'kN', 'lbf', 'Pa', 'kPa', 'MPa', 'bar', 'psi', 'atm', 'torr'] },
  { group: 'Energy & Power', units: ['J', 'kJ', 'MJ', 'kWh', 'BTU', 'cal', 'W', 'kW', 'MW', 'hp'] },
  { group: 'Length & Area', units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi', 'm^2', 'cm^2', 'mm^2'] },
  { group: 'Electrical & RF', units: ['V', 'mV', 'A', 'mA', 'uA', 'ohm', 'kohm', 'Mohm', 'uF', 'nF', 'pF', 'uH', 'mH', 'Hz', 'kHz', 'MHz', 'GHz'] },
  { group: 'Flow & Time', units: ['L/min', 'CFM', 'm^3/s', 's', 'min', 'hr', 'day', 'kg/s'] }
];

const ENGINEERING_PRESETS = [
  {
    name: 'Mechanical Stress',
    formula: 'σ = F / A',
    expr: '50 kN / (25 mm * 50 mm) to MPa'
  },
  {
    name: 'Ohm\'s Law Current',
    formula: 'I = V / R',
    expr: '3.3 V / 220 ohm to mA'
  },
  {
    name: 'Thermal Heat Energy',
    formula: 'Q = P · t',
    expr: '2.5 kW * 4.5 hours to MJ'
  },
  {
    name: 'Hydrostatic Pressure',
    formula: 'P = ρ · g · h',
    expr: '1000 kg/m^3 * 9.80665 m/s^2 * 30 m to bar'
  },
  {
    name: 'Vehicle Kinetic Energy',
    formula: 'Ek = ½ m v²',
    expr: '0.5 * 1400 kg * (120 km/h)^2 to kJ'
  },
  {
    name: 'Capacitive Reactance',
    formula: 'Xc = 1 / (2π f C)',
    expr: '1 / (2 * pi * 50 kHz * 22 nF) to ohm'
  },
  {
    name: 'Shaft Mechanical Power',
    formula: 'P = 2π N T / 60',
    expr: '2 * pi * (3000 / 60 / s) * (180 N*m) to kW'
  },
  {
    name: 'Gas Law Pressure',
    formula: 'P = n R T / V',
    expr: '(5 mol * 8.3145 J/(mol*K) * 300 K) / 0.05 m^3 to bar'
  }
];

export const DimensionalCalcView: React.FC<DimensionalCalcViewProps> = ({
  initialExpression = '',
  angleMode,
  precision,
  onRecordHistory
}) => {
  const [expression, setExpression] = useState<string>(initialExpression || '50 kN / (25 mm * 50 mm) to MPa');
  const [lastAns, setLastAns] = useState<string>('0');
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeUnitTab, setActiveUnitTab] = useState<number>(0);

  // Sync initial expression if provided from external view
  useEffect(() => {
    if (initialExpression) {
      setExpression(initialExpression);
    }
  }, [initialExpression]);

  // Recalculate on expression, angleMode or precision change
  useEffect(() => {
    if (!expression.trim()) {
      setCalcResult(null);
      return;
    }
    const res = evaluateEngineeringMath(expression, angleMode, precision);
    setCalcResult(res);
  }, [expression, angleMode, precision]);

  const handleExecute = () => {
    if (!expression.trim()) return;
    const res = evaluateEngineeringMath(expression, angleMode, precision);
    setCalcResult(res);
    if (res.success) {
      setLastAns(res.formattedStandard);
      onRecordHistory({
        id: Date.now().toString(),
        expression,
        result: res.formattedStandard,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }
  };

  const insertToken = (token: string) => {
    setExpression((prev) => prev + token);
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setExpression('');
    setCalcResult(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
            Scientific & Dimensional Expression Engine
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Arbitrary Unit Arithmetic</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Dimensional Analysis</span>
            <span aria-hidden="true">·</span>
            <span>Trig Mode: {angleMode.toUpperCase()}</span>
          </div>
        </div>

        {/* Quick Help Indicator */}
        <div className="text-xs font-mono text-cyan-400/90 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Type &apos;to &lt;unit&gt;&apos; or &apos;in &lt;unit&gt;&apos; to convert results</span>
        </div>
      </div>

      {/* Main Console Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Display + Keypad (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Calculation Display Screen */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-inner space-y-3">
            {/* Input Expression Bar */}
            <div className="relative">
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecute();
                }}
                placeholder="Enter expression (e.g. 50 kN / (25 mm * 50 mm) to MPa)..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-lg sm:text-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Output Telemetry Display */}
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-lg min-h-[96px] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>EVALUATION TELEMETRY</span>
                {calcResult && (
                  <span className={calcResult.success ? 'text-emerald-400' : 'text-rose-400'}>
                    {calcResult.success ? '● VALID DIMENSION' : '✖ SYNTAX / UNIT MISMATCH'}
                  </span>
                )}
              </div>

              {calcResult?.success ? (
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300 tabular-nums break-all">
                      {calcResult.formattedStandard}
                    </span>
                    <button
                      onClick={() => handleCopy(calcResult.formattedStandard)}
                      className="text-slate-400 hover:text-slate-100 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Copy result"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-500">Scientific:</span> {calcResult.formattedScientific}
                    </div>
                    <div>
                      <span className="text-slate-500">Engineering:</span> {calcResult.formattedEngineering}
                    </div>
                    {calcResult.formattedHex && (
                      <div>
                        <span className="text-slate-500">Hex:</span> {calcResult.formattedHex}
                      </div>
                    )}
                    {calcResult.formattedBin && (
                      <div>
                        <span className="text-slate-500">Binary:</span> {calcResult.formattedBin}
                      </div>
                    )}
                  </div>
                </div>
              ) : calcResult?.error ? (
                <div className="text-sm font-mono text-rose-400 mt-2 break-all leading-relaxed">
                  {calcResult.error}
                </div>
              ) : (
                <div className="text-sm font-mono text-slate-600 mt-2">
                  Awaiting input expression...
                </div>
              )}
            </div>

            {/* Quick Dimensional Unit Insertion Strip */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  Quick Dimensional Unit Insertion
                </span>
                <div className="flex items-center gap-1">
                  {COMMON_UNITS.map((group, idx) => (
                    <button
                      key={group.group}
                      onClick={() => setActiveUnitTab(idx)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        activeUnitTab === idx
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {group.group.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {COMMON_UNITS[activeUnitTab].units.map((unit) => (
                  <button
                    key={unit}
                    onClick={() => insertToken(` ${unit}`)}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 rounded text-xs font-mono text-slate-300 transition-colors"
                  >
                    {unit}
                  </button>
                ))}
                <span className="text-slate-600 text-xs mx-1">|</span>
                <button
                  onClick={() => insertToken(' to ')}
                  className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 rounded text-xs font-mono transition-colors font-semibold"
                >
                  to ...
                </button>
                <button
                  onClick={() => insertToken(' in ')}
                  className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 rounded text-xs font-mono transition-colors font-semibold"
                >
                  in ...
                </button>
              </div>
            </div>
          </div>

          {/* Scientific Keypad Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-xs font-mono">
            {/* Scientific Functions Row 1 */}
            <button onClick={() => insertToken('sin(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">sin</button>
            <button onClick={() => insertToken('cos(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">cos</button>
            <button onClick={() => insertToken('tan(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">tan</button>
            <button onClick={() => insertToken('asin(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">asin</button>
            <button onClick={() => insertToken('acos(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">acos</button>
            <button onClick={() => insertToken('atan(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">atan</button>

            {/* Scientific Functions Row 2 */}
            <button onClick={() => insertToken('sqrt(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">√</button>
            <button onClick={() => insertToken('cbrt(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">∛</button>
            <button onClick={() => insertToken('^')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">x^y</button>
            <button onClick={() => insertToken('ln(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">ln</button>
            <button onClick={() => insertToken('log10(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">log₁₀</button>
            <button onClick={() => insertToken('log2(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">log₂</button>

            {/* Row 3: Constants & Brackets */}
            <button onClick={() => insertToken('pi')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-800 transition-colors">π</button>
            <button onClick={() => insertToken('e')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-800 transition-colors">e</button>
            <button onClick={() => insertToken('(')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">(</button>
            <button onClick={() => insertToken(')')} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors">)</button>
            <button onClick={handleBackspace} className="p-2.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 rounded-lg border border-rose-900/50 transition-colors flex items-center justify-center">
              <Delete className="w-4 h-4" />
            </button>
            <button onClick={handleClear} className="p-2.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-900/70 transition-colors font-bold">
              AC
            </button>

            {/* Standard Number Pad Numbers + Basic Ops */}
            <button onClick={() => insertToken('7')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">7</button>
            <button onClick={() => insertToken('8')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">8</button>
            <button onClick={() => insertToken('9')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">9</button>
            <button onClick={() => insertToken(' / ')} className="p-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-800 text-sm">÷</button>
            <button onClick={() => insertToken('abs(')} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs">|x|</button>
            <button onClick={() => insertToken('!')} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs">n!</button>

            <button onClick={() => insertToken('4')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">4</button>
            <button onClick={() => insertToken('5')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">5</button>
            <button onClick={() => insertToken('6')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">6</button>
            <button onClick={() => insertToken(' * ')} className="p-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-800 text-sm">×</button>
            <button onClick={() => insertToken('sinh(')} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs">sinh</button>
            <button onClick={() => insertToken('cosh(')} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs">cosh</button>

            <button onClick={() => insertToken('1')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">1</button>
            <button onClick={() => insertToken('2')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">2</button>
            <button onClick={() => insertToken('3')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">3</button>
            <button onClick={() => insertToken(' - ')} className="p-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-800 text-sm">−</button>
            <button onClick={() => insertToken(lastAns)} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs">Ans</button>
            <button onClick={() => insertToken(' * 10^')} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs">×10ⁿ</button>

            <button onClick={() => insertToken('0')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">0</button>
            <button onClick={() => insertToken('.')} className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-100 rounded-lg border border-slate-800 text-sm font-semibold">.</button>
            <button onClick={() => insertToken(' % ')} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-sm">mod</button>
            <button onClick={() => insertToken(' + ')} className="p-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-800 text-sm">+</button>
            
            {/* Execute Button Spans 2 columns */}
            <button
              onClick={handleExecute}
              className="col-span-2 p-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>EVALUATE (=)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Engineering Formula Presets / Templates (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Engineering Calculation Presets
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Load</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Explore authentic cross-domain engineering calculations featuring mixed units and dimensional auto-reduction.
            </p>

            <div className="space-y-2">
              {ENGINEERING_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setExpression(preset.expr);
                  }}
                  className="w-full text-left p-2.5 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{preset.formula}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-slate-400 truncate">
                    {preset.expr}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

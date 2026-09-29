/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DOMAIN_FORMULAS, DomainFormula } from '../data/domainFormulasData';
import { Copy, Check, CornerDownRight, Info } from 'lucide-react';

interface DomainSolversViewProps {
  precision: number;
  onSendToCalc: (expression: string) => void;
}

export const DomainSolversView: React.FC<DomainSolversViewProps> = ({
  precision,
  onSendToCalc
}) => {
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('beam_deflection_center');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Current active formula
  const activeFormula: DomainFormula = useMemo(() => {
    return DOMAIN_FORMULAS.find((f) => f.id === selectedFormulaId) || DOMAIN_FORMULAS[0];
  }, [selectedFormulaId]);

  // State for each parameter: { [paramId]: { value: number, unit: string } }
  const [paramState, setParamState] = useState<Record<string, { value: number; unit: string }>>(() => {
    const initial: Record<string, { value: number; unit: string }> = {};
    DOMAIN_FORMULAS.forEach((f) => {
      f.params.forEach((p) => {
        initial[`${f.id}_${p.id}`] = { value: p.defaultValue, unit: p.defaultUnit };
      });
    });
    return initial;
  });

  // State for output target unit
  const [targetUnitState, setTargetUnitState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    DOMAIN_FORMULAS.forEach((f) => {
      initial[f.id] = f.resultUnits[0].symbol;
    });
    return initial;
  });

  const filteredFormulas = useMemo(() => {
    if (selectedDomainFilter === 'all') return DOMAIN_FORMULAS;
    return DOMAIN_FORMULAS.filter((f) => f.domain === selectedDomainFilter);
  }, [selectedDomainFilter]);

  const handleParamValueChange = (paramId: string, val: number) => {
    setParamState((prev) => ({
      ...prev,
      [`${activeFormula.id}_${paramId}`]: {
        value: val,
        unit: prev[`${activeFormula.id}_${paramId}`]?.unit || activeFormula.params.find((p) => p.id === paramId)!.defaultUnit
      }
    }));
  };

  const handleParamUnitChange = (paramId: string, unit: string) => {
    setParamState((prev) => ({
      ...prev,
      [`${activeFormula.id}_${paramId}`]: {
        value: prev[`${activeFormula.id}_${paramId}`]?.value ?? activeFormula.params.find((p) => p.id === paramId)!.defaultValue,
        unit
      }
    }));
  };

  // Convert inputs to SI base values for evaluation
  const calculatedOutput = useMemo(() => {
    const baseValues: Record<string, number> = {};

    activeFormula.params.forEach((p) => {
      const state = paramState[`${activeFormula.id}_${p.id}`] || { value: p.defaultValue, unit: p.defaultUnit };
      const selectedUnitObj = p.units.find((u) => u.symbol === state.unit) || p.units[0];
      baseValues[p.id] = state.value * selectedUnitObj.factorToBase;
    });

    try {
      const computation = activeFormula.calculate(baseValues);
      const chosenUnitSymbol = targetUnitState[activeFormula.id] || activeFormula.resultUnits[0].symbol;
      const targetUnitObj = activeFormula.resultUnits.find((u) => u.symbol === chosenUnitSymbol) || activeFormula.resultUnits[0];

      const convertedVal = computation.resultInBase * targetUnitObj.factorFromBase;

      const formattedVal = Number.isInteger(convertedVal)
        ? convertedVal.toString()
        : Number(convertedVal.toPrecision(precision)).toString();

      return {
        success: true,
        numericInBase: computation.resultInBase,
        convertedValue: convertedVal,
        formattedValue: formattedVal,
        unitSymbol: chosenUnitSymbol,
        steps: computation.steps,
        regimeOrNotice: computation.regimeOrNotice
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Calculation error'
      };
    }
  }, [activeFormula, paramState, targetUnitState, precision]);

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
            Domain-Specific Engineering Solvers
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Rigorous Cross-Domain Physics</span>
            <span aria-hidden="true">·</span>
            <span>Step-by-Step Algebraic Substitution</span>
            <span aria-hidden="true">·</span>
            <span>Regime & Standard Verification</span>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          {['all', 'mechanical', 'electrical', 'civil', 'chemical', 'aerospace', 'digital'].map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomainFilter(domain)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors whitespace-nowrap ${
                selectedDomainFilter === domain
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Main Solvers Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Solvers (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500 px-1 mb-2">
            Available Solvers ({filteredFormulas.length})
          </div>

          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredFormulas.map((f) => {
              const isSelected = f.id === activeFormula.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormulaId(f.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {f.title}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {f.domain}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {f.tagline}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1.5 font-medium">
                    {f.equationLatex}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Solver Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Solver Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
            {/* Solver Title & Equation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold font-mono text-slate-100">
                  {activeFormula.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeFormula.tagline}
                </p>
              </div>
              <div className="px-3 py-1.5 bg-slate-950 border border-cyan-900/50 rounded-lg text-cyan-300 font-mono text-sm font-semibold whitespace-nowrap">
                {activeFormula.equationLatex}
              </div>
            </div>

            {/* Visual SVG Schematic Diagram */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 self-start">
                Schematic Reference Diagram
              </span>

              {/* Render dynamic schematic depending on diagram type */}
              {activeFormula.diagram === 'beam_deflection' && (
                <svg viewBox="0 0 500 120" className="w-full max-w-lg h-28 text-slate-300">
                  {/* Supports */}
                  <polygon points="50,90 40,110 60,110" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                  <polygon points="450,90 440,110 460,110" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                  {/* Ground hatching */}
                  <line x1="30" y1="110" x2="70" y2="110" stroke="#475569" strokeWidth="2" />
                  <line x1="430" y1="110" x2="470" y2="110" stroke="#475569" strokeWidth="2" />
                  {/* Undeformed Beam */}
                  <line x1="50" y1="90" x2="450" y2="90" stroke="#475569" strokeDasharray="4 4" strokeWidth="1.5" />
                  {/* Deflected Beam Curve */}
                  <path d="M 50,90 Q 250,112 450,90" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                  {/* Center Load Arrow */}
                  <line x1="250" y1="20" x2="250" y2="95" stroke="#f43f5e" strokeWidth="2.5" />
                  <polygon points="250,95 244,82 256,82" fill="#f43f5e" />
                  <text x="258" y="45" fill="#f43f5e" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">Load P</text>
                  {/* Span L Dimension */}
                  <line x1="50" y1="15" x2="450" y2="15" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="20" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="450" y1="10" x2="450" y2="20" stroke="#94a3b8" strokeWidth="1" />
                  <text x="235" y="12" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono">Span L</text>
                  {/* Max Deflection indicator */}
                  <line x1="250" y1="90" x2="250" y2="108" stroke="#38bdf8" strokeWidth="1" />
                  <text x="260" y="105" fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono">δ_max</text>
                </svg>
              )}

              {activeFormula.diagram === 'reynolds' && (
                <svg viewBox="0 0 500 120" className="w-full max-w-lg h-28 text-slate-300">
                  {/* Pipe Walls */}
                  <rect x="50" y="25" width="400" height="70" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />
                  {/* Flow Velocity Profile Arrows */}
                  <path d="M 120,30 Q 180,60 120,90" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="120" y1="60" x2="220" y2="60" stroke="#38bdf8" strokeWidth="2" />
                  <polygon points="220,60 210,56 210,64" fill="#38bdf8" />
                  <line x1="120" y1="45" x2="190" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
                  <polygon points="190,45 182,42 182,48" fill="#38bdf8" />
                  <line x1="120" y1="75" x2="190" y2="75" stroke="#38bdf8" strokeWidth="1.5" />
                  <polygon points="190,75 182,72 182,78" fill="#38bdf8" />
                  <text x="230" y="64" fill="#38bdf8" fontSize="12" fontFamily="JetBrains Mono">v</text>
                  {/* Diameter D Dimension */}
                  <line x1="380" y1="25" x2="380" y2="95" stroke="#94a3b8" strokeWidth="1" />
                  <text x="390" y="65" fill="#94a3b8" fontSize="12" fontFamily="JetBrains Mono">D</text>
                  <text x="70" y="112" fill="#64748b" fontSize="11" fontFamily="JetBrains Mono">Fluid Density ρ, Dynamic Viscosity μ</text>
                </svg>
              )}

              {activeFormula.diagram === 'resonance' && (
                <svg viewBox="0 0 500 120" className="w-full max-w-lg h-28 text-slate-300">
                  {/* Tank circuit loop */}
                  <rect x="100" y="30" width="300" height="60" fill="none" stroke="#475569" strokeWidth="2" />
                  {/* Inductor coil on top */}
                  <rect x="220" y="24" width="60" height="12" fill="#0f172a" />
                  <path d="M 220,30 Q 230,15 235,30 Q 245,15 250,30 Q 260,15 265,30 Q 275,15 280,30" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="245" y="12" fill="#38bdf8" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle">L (Inductance)</text>
                  {/* Capacitor on bottom */}
                  <rect x="230" y="84" width="40" height="12" fill="#0f172a" />
                  <line x1="242" y1="78" x2="242" y2="102" stroke="#38bdf8" strokeWidth="3" />
                  <line x1="258" y1="78" x2="258" y2="102" stroke="#38bdf8" strokeWidth="3" />
                  <text x="250" y="116" fill="#38bdf8" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle">C (Capacitance)</text>
                  <text x="370" y="65" fill="#06b6d4" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">f₀ = 1/2π√(LC)</text>
                </svg>
              )}

              {activeFormula.diagram === 'voltage_divider' && (
                <svg viewBox="0 0 500 120" className="w-full max-w-lg h-28 text-slate-300">
                  <line x1="160" y1="20" x2="160" y2="40" stroke="#475569" strokeWidth="2" />
                  <circle cx="160" cy="18" r="3" fill="#38bdf8" />
                  <text x="175" y="22" fill="#38bdf8" fontSize="12" fontFamily="JetBrains Mono">V_in</text>
                  {/* R1 */}
                  <rect x="150" y="40" width="20" height="30" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="180" y="58" fill="#e2e8f0" fontSize="11" fontFamily="JetBrains Mono">R₁</text>
                  {/* Node */}
                  <line x1="160" y1="70" x2="160" y2="80" stroke="#475569" strokeWidth="2" />
                  <line x1="160" y1="75" x2="260" y2="75" stroke="#06b6d4" strokeWidth="2" />
                  <circle cx="260" cy="75" r="4" fill="#06b6d4" />
                  <text x="275" y="79" fill="#06b6d4" fontSize="13" fontFamily="JetBrains Mono" fontWeight="bold">V_out</text>
                  {/* R2 */}
                  <rect x="150" y="80" width="20" height="30" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="180" y="98" fill="#e2e8f0" fontSize="11" fontFamily="JetBrains Mono">R₂</text>
                  {/* Ground */}
                  <line x1="160" y1="110" x2="160" y2="116" stroke="#475569" strokeWidth="2" />
                  <line x1="150" y1="116" x2="170" y2="116" stroke="#475569" strokeWidth="2" />
                </svg>
              )}

              {activeFormula.diagram === 'buckling' && (
                <svg viewBox="0 0 500 120" className="w-full max-w-lg h-28 text-slate-300">
                  <line x1="220" y1="20" x2="220" y2="105" stroke="#475569" strokeDasharray="3 3" strokeWidth="1.5" />
                  <path d="M 220,20 Q 255,62 220,105" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                  <line x1="220" y1="5" x2="220" y2="20" stroke="#f43f5e" strokeWidth="3" />
                  <polygon points="220,20 215,10 225,10" fill="#f43f5e" />
                  <text x="235" y="16" fill="#f43f5e" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">P_cr</text>
                  <text x="270" y="65" fill="#f43f5e" fontSize="11" fontFamily="JetBrains Mono">Buckling mode</text>
                </svg>
              )}

              {activeFormula.diagram === 'ideal_gas' && (
                <svg viewBox="0 0 500 120" className="w-full max-w-lg h-28 text-slate-300">
                  <rect x="180" y="25" width="140" height="80" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                  <rect x="180" y="45" width="140" height="10" fill="#334155" stroke="#64748b" />
                  <line x1="250" y1="10" x2="250" y2="45" stroke="#94a3b8" strokeWidth="3" />
                  <circle cx="210" cy="75" r="4" fill="#38bdf8" />
                  <circle cx="230" cy="85" r="4" fill="#38bdf8" />
                  <circle cx="270" cy="70" r="4" fill="#38bdf8" />
                  <circle cx="290" cy="90" r="4" fill="#38bdf8" />
                  <circle cx="250" cy="80" r="4" fill="#38bdf8" />
                  <text x="340" y="70" fill="#38bdf8" fontSize="12" fontFamily="JetBrains Mono">P · V = n · R · T</text>
                </svg>
              )}

              {activeFormula.diagram === 'rocket' && (
                <svg viewBox="0 0 500 120" className="w-full max-w-lg h-28 text-slate-300">
                  {/* Rocket Body */}
                  <polygon points="220,20 200,60 200,95 240,95 240,60" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  {/* Fins */}
                  <polygon points="200,85 185,95 200,95" fill="#334155" />
                  <polygon points="240,85 255,95 240,95" fill="#334155" />
                  {/* Exhaust Plume */}
                  <polygon points="210,95 230,95 220,118" fill="#f59e0b" />
                  <text x="270" y="55" fill="#38bdf8" fontSize="12" fontFamily="JetBrains Mono">Δv = Isp · g₀ · ln(m₀ / mf)</text>
                  <text x="270" y="75" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono">Propellant expulsion</text>
                </svg>
              )}

              {activeFormula.diagram === 'bandwidth' && (
                <svg viewBox="0 0 500 120" className="w-full max-w-lg h-28 text-slate-300">
                  <rect x="80" y="40" width="80" height="45" rx="4" fill="#1e293b" stroke="#64748b" />
                  <text x="120" y="67" fill="#e2e8f0" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">Payload S</text>
                  <line x1="160" y1="62" x2="340" y2="62" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6 4" />
                  <rect x="340" y="40" width="80" height="45" rx="4" fill="#1e293b" stroke="#64748b" />
                  <text x="380" y="67" fill="#e2e8f0" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">Receiver</text>
                  <text x="250" y="52" fill="#06b6d4" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">Bandwidth Rate R</text>
                  <text x="250" y="90" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">Transfer time t = S / R</text>
                </svg>
              )}
            </div>

            {/* Parameter Inputs Grid */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Input Parameters & Engineering Units
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeFormula.params.map((p) => {
                  const state = paramState[`${activeFormula.id}_${p.id}`] || { value: p.defaultValue, unit: p.defaultUnit };
                  return (
                    <div key={p.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-medium text-slate-300 flex items-center gap-1">
                          <span>{p.name}</span>
                          {p.tooltip && (
                            <span title={p.tooltip} className="cursor-help text-slate-500">
                              <Info className="w-3 h-3" />
                            </span>
                          )}
                        </label>
                        <span className="font-mono text-cyan-400 font-semibold">{p.symbol}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          value={state.value}
                          onChange={(e) => handleParamValueChange(p.id, parseFloat(e.target.value) || 0)}
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500 tabular-nums"
                        />
                        <select
                          value={state.unit}
                          onChange={(e) => handleParamUnitChange(p.id, e.target.value)}
                          className="w-28 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                        >
                          {p.units.map((u) => (
                            <option key={u.symbol} value={u.symbol}>
                              {u.symbol}
                            </option>
                          ))}
                        </select>
                      </div>

                      {p.tooltip && (
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {p.tooltip}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculated Output & Substitution Breakdown */}
            {calculatedOutput.success && (
              <div className="p-4 bg-slate-950 border border-cyan-950 rounded-xl space-y-4">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      {activeFormula.outputName} ({activeFormula.outputSymbol})
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300 tabular-nums">
                        {calculatedOutput.formattedValue}
                      </span>
                      <select
                        value={targetUnitState[activeFormula.id] || activeFormula.resultUnits[0].symbol}
                        onChange={(e) =>
                          setTargetUnitState((prev) => ({
                            ...prev,
                            [activeFormula.id]: e.target.value
                          }))
                        }
                        className="bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        {activeFormula.resultUnits.map((u) => (
                          <option key={u.symbol} value={u.symbol}>
                            {u.symbol || '(unitless)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleCopy(
                          `${calculatedOutput.formattedValue} ${targetUnitState[activeFormula.id] || activeFormula.resultUnits[0].symbol}`
                        )
                      }
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() =>
                        onSendToCalc(
                          `${calculatedOutput.formattedValue} ${targetUnitState[activeFormula.id] || activeFormula.resultUnits[0].symbol}`
                        )
                      }
                      className="px-3 py-1.5 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Send to Calc</span>
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Substitution Breakdown */}
                {calculatedOutput.steps && calculatedOutput.steps.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Step-by-Step Substitution
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                      {calculatedOutput.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80 gap-1 text-[11px]"
                        >
                          <span className="text-slate-400 font-semibold">{st.stepLabel}:</span>
                          <span className="text-slate-500 font-mono truncate">{st.expression}</span>
                          <span className="text-cyan-400 font-bold self-end sm:self-auto">{st.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engineering Notice / Regime Indicator */}
                {calculatedOutput.regimeOrNotice && (
                  <div className="p-3 bg-slate-900/90 border-l-2 border-cyan-500 rounded text-xs font-mono text-slate-300 leading-relaxed">
                    {calculatedOutput.regimeOrNotice}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

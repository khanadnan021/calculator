/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { evaluateEngineeringMath } from '../services/mathEngine';
import { Sliders, Crosshair, Play, RotateCcw } from 'lucide-react';

interface PresetCurve {
  id: string;
  name: string;
  domain: string;
  formula: string;
  xLabel: string;
  yLabel: string;
  defaultXMin: number;
  defaultXMax: number;
  params: { id: string; name: string; min: number; max: number; step: number; default: number; unit?: string }[];
  evaluate: (x: number, params: Record<string, number>) => number;
}

const PRESET_CURVES: PresetCurve[] = [
  {
    id: 'damped_oscillation',
    name: 'Damped Mechanical Vibration',
    domain: 'Mechanical',
    formula: 'x(t) = e^(-γ·t) · cos(ω·t)',
    xLabel: 'Time t (seconds)',
    yLabel: 'Displacement x (m)',
    defaultXMin: 0,
    defaultXMax: 10,
    params: [
      { id: 'gamma', name: 'Damping Factor γ', min: 0.05, max: 1.5, step: 0.05, default: 0.35, unit: 's⁻¹' },
      { id: 'omega', name: 'Natural Frequency ω', min: 1, max: 15, step: 0.5, default: 5, unit: 'rad/s' }
    ],
    evaluate: (t, p) => Math.exp(-p.gamma * t) * Math.cos(p.omega * t)
  },
  {
    id: 'rlc_response',
    name: 'RLC Dynamic Resonance Curve',
    domain: 'Electrical',
    formula: '|H(ω)| = 1 / √((1 - (ω/ω₀)²)² + (2ζ(ω/ω₀))²)',
    xLabel: 'Frequency Ratio (ω / ω₀)',
    yLabel: 'Gain Magnitude |H(ω)|',
    defaultXMin: 0.1,
    defaultXMax: 2.5,
    params: [
      { id: 'zeta', name: 'Damping Ratio ζ', min: 0.05, max: 1.2, step: 0.05, default: 0.2, unit: '' }
    ],
    evaluate: (w, p) => {
      const z = p.zeta;
      const term1 = Math.pow(1 - w * w, 2);
      const term2 = Math.pow(2 * z * w, 2);
      return 1 / Math.sqrt(term1 + term2);
    }
  },
  {
    id: 'beam_moment',
    name: 'Beam Bending Moment Distribution',
    domain: 'Civil',
    formula: 'M(x) = (w / 2) · (L·x - x²)',
    xLabel: 'Position along span x (m)',
    yLabel: 'Bending Moment M(x) (kN·m)',
    defaultXMin: 0,
    defaultXMax: 8,
    params: [
      { id: 'L', name: 'Beam Span L', min: 2, max: 16, step: 1, default: 8, unit: 'm' },
      { id: 'w', name: 'Uniform Distributed Load w', min: 1, max: 50, step: 1, default: 15, unit: 'kN/m' }
    ],
    evaluate: (x, p) => {
      if (x < 0 || x > p.L) return 0;
      return (p.w / 2) * (p.L * x - x * x);
    }
  },
  {
    id: 'aircraft_lift',
    name: 'Airfoil Lift Coefficient vs Angle of Attack',
    domain: 'Aerospace',
    formula: 'CL(α) = 2π·α · (1 - 0.005·α²)',
    xLabel: 'Angle of Attack α (degrees)',
    yLabel: 'Lift Coefficient C_L',
    defaultXMin: -4,
    defaultXMax: 18,
    params: [
      { id: 'camber', name: 'Zero-Lift Offset α₀', min: -4, max: 2, step: 0.5, default: -2, unit: '°' }
    ],
    evaluate: (alpha, p) => {
      const effectiveAlpha = (alpha - p.camber) * (Math.PI / 180);
      if (alpha > 14) {
        // Stall degradation
        return Math.max(0, 2 * Math.PI * (14 - p.camber) * (Math.PI / 180) * 0.9 - 0.15 * (alpha - 14));
      }
      return 2 * Math.PI * effectiveAlpha * (1 - 0.2 * Math.pow(effectiveAlpha, 2));
    }
  }
];

export const FunctionPlotterView: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('damped_oscillation');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customFormula, setCustomFormula] = useState<string>('sin(x) * exp(-0.15 * x)');
  const [customXMin, setCustomXMin] = useState<number>(0);
  const [customXMax, setCustomXMax] = useState<number>(20);

  const activePreset = useMemo(() => {
    return PRESET_CURVES.find((p) => p.id === selectedPresetId) || PRESET_CURVES[0];
  }, [selectedPresetId]);

  // Parameters state for presets
  const [paramValues, setParamValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    PRESET_CURVES.forEach((c) => {
      c.params.forEach((p) => {
        initial[`${c.id}_${p.id}`] = p.default;
      });
    });
    return initial;
  });

  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute curve points
  const { points, xMin, xMax, yMin, yMax, peak, trough } = useMemo(() => {
    const numSteps = 250;
    let minX = isCustomMode ? customXMin : activePreset.defaultXMin;
    let maxX = isCustomMode ? customXMax : activePreset.defaultXMax;
    if (minX >= maxX) maxX = minX + 1;

    const currentParams: Record<string, number> = {};
    if (!isCustomMode) {
      activePreset.params.forEach((p) => {
        currentParams[p.id] = paramValues[`${activePreset.id}_${p.id}`] ?? p.default;
      });
    }

    const pts: { x: number; y: number }[] = [];
    const step = (maxX - minX) / numSteps;

    let minY = Infinity;
    let maxY = -Infinity;
    let maxPt = { x: 0, y: -Infinity };
    let minPt = { x: 0, y: Infinity };

    for (let i = 0; i <= numSteps; i++) {
      const x = minX + i * step;
      let y = 0;

      if (isCustomMode) {
        const res = evaluateEngineeringMath(customFormula.replace(/x/g, `(${x})`), 'rad');
        y = res.numericValue !== undefined ? res.numericValue : 0;
      } else {
        y = activePreset.evaluate(x, currentParams);
      }

      if (!isNaN(y) && isFinite(y)) {
        pts.push({ x, y });
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (y > maxPt.y) maxPt = { x, y };
        if (y < minPt.y) minPt = { x, y };
      }
    }

    // Safety margins for plot frame
    const yDelta = maxY - minY;
    const paddedYMin = minY - (yDelta === 0 ? 1 : yDelta * 0.1);
    const paddedYMax = maxY + (yDelta === 0 ? 1 : yDelta * 0.1);

    return {
      points: pts,
      xMin: minX,
      xMax: maxX,
      yMin: paddedYMin,
      yMax: paddedYMax,
      peak: maxPt,
      trough: minPt
    };
  }, [isCustomMode, selectedPresetId, customFormula, customXMin, customXMax, activePreset, paramValues]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#030712'; // deep obsidian
    ctx.fillRect(0, 0, width, height);

    // Padding
    const padL = 55;
    const padR = 25;
    const padT = 30;
    const padB = 40;

    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const toCanvasX = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
    const toCanvasY = (y: number) => padT + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Horizontal Grid Lines & Y Ticks
    const numYGrid = 6;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= numYGrid; i++) {
      const val = yMin + (i / numYGrid) * (yMax - yMin);
      const yPos = toCanvasY(val);
      ctx.beginPath();
      ctx.moveTo(padL, yPos);
      ctx.lineTo(width - padR, yPos);
      ctx.stroke();

      ctx.fillText(Number(val.toPrecision(3)).toString(), padL - 8, yPos);
    }

    // Vertical Grid Lines & X Ticks
    const numXGrid = 6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i <= numXGrid; i++) {
      const val = xMin + (i / numXGrid) * (xMax - xMin);
      const xPos = toCanvasX(val);
      ctx.beginPath();
      ctx.moveTo(xPos, padT);
      ctx.lineTo(xPos, height - padB);
      ctx.stroke();

      ctx.fillText(Number(val.toPrecision(3)).toString(), xPos, height - padB + 8);
    }

    // Zero Axes if within bounds
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    if (yMin <= 0 && yMax >= 0) {
      const zeroY = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(padL, zeroY);
      ctx.lineTo(width - padR, zeroY);
      ctx.stroke();
    }
    if (xMin <= 0 && xMax >= 0) {
      const zeroX = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(zeroX, padT);
      ctx.lineTo(zeroX, height - padB);
      ctx.stroke();
    }

    // Draw Function Curve
    if (points.length > 1) {
      // Glow under-curve
      ctx.beginPath();
      ctx.moveTo(toCanvasX(points[0].x), toCanvasY(points[0].y));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(toCanvasX(points[i].x), toCanvasY(points[i].y));
      }
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw Crosshair if hovering
    if (hoverCoord) {
      const hx = toCanvasX(hoverCoord.x);
      const hy = toCanvasY(hoverCoord.y);

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(padL, hy);
      ctx.lineTo(width - padR, hy);
      ctx.moveTo(hx, padT);
      ctx.lineTo(hx, height - padB);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }, [points, xMin, xMax, yMin, yMax, hoverCoord]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;

    const padL = 55;
    const padR = 25;
    const plotW = canvas.width - padL - padR;

    const ratio = Math.max(0, Math.min(1, (clientX - padL) / plotW));
    const targetX = xMin + ratio * (xMax - xMin);

    // Find nearest point
    let nearest = points[0];
    let minDiff = Infinity;
    points.forEach((p) => {
      const diff = Math.abs(p.x - targetX);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = p;
      }
    });

    if (nearest) {
      setHoverCoord(nearest);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoverCoord(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
            Interactive 2D Engineering Function Plotter
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Dynamic Parameter Scrubbing</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Response Curves</span>
            <span aria-hidden="true">·</span>
            <span>Microsecond Inspector Probe</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`px-3 py-1 rounded-md transition-colors ${
              !isCustomMode ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            Engineering Presets
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`px-3 py-1 rounded-md transition-colors ${
              isCustomMode ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            Custom Equation f(x)
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Canvas Graph & HUD (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            {/* Graph Header & Coordinate HUD */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">
                {!isCustomMode ? activePreset.name : 'Custom: f(x) = ' + customFormula}
              </span>
              <div className="flex items-center gap-3">
                {hoverCoord ? (
                  <span className="text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    X: <span className="font-bold">{hoverCoord.x.toFixed(3)}</span> | Y:{' '}
                    <span className="font-bold">{hoverCoord.y.toFixed(4)}</span>
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Hover over curve to probe values</span>
                  </span>
                )}
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <canvas
                ref={canvasRef}
                width={720}
                height={380}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
                className="w-full h-[320px] sm:h-[380px] cursor-crosshair block"
              />
            </div>

            {/* Extrema Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Max Peak</span>
                <span className="text-cyan-300 font-semibold">{peak.y.toPrecision(4)}</span>
                <span className="text-[10px] text-slate-500 block">@ x = {peak.x.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Min Trough</span>
                <span className="text-rose-300 font-semibold">{trough.y.toPrecision(4)}</span>
                <span className="text-[10px] text-slate-500 block">@ x = {trough.x.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">X Range</span>
                <span className="text-slate-300">[{xMin.toFixed(1)}, {xMax.toFixed(1)}]</span>
                <span className="text-[10px] text-slate-500 block">Δ = {(xMax - xMin).toFixed(1)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Data Points</span>
                <span className="text-slate-300">{points.length} samples</span>
                <span className="text-[10px] text-slate-500 block">Continuous Eval</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Parameters & Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {!isCustomMode ? (
            /* Presets Configuration */
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Select Engineering Function
                </span>
                <div className="space-y-1.5 mt-2">
                  {PRESET_CURVES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedPresetId(c.id)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                        c.id === activePreset.id
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-950'
                      }`}
                    >
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{c.formula}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Parameter Sliders */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-Time Parameters</span>
                  </span>
                  <button
                    onClick={() => {
                      const resetObj: Record<string, number> = {};
                      activePreset.params.forEach((p) => {
                        resetObj[`${activePreset.id}_${p.id}`] = p.default;
                      });
                      setParamValues((prev) => ({ ...prev, ...resetObj }));
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {activePreset.params.map((p) => {
                    const currentVal = paramValues[`${activePreset.id}_${p.id}`] ?? p.default;
                    return (
                      <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300">{p.name}</span>
                          <span className="text-cyan-400 font-bold">
                            {currentVal} {p.unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={p.min}
                          max={p.max}
                          step={p.step}
                          value={currentVal}
                          onChange={(e) =>
                            setParamValues((prev) => ({
                              ...prev,
                              [`${activePreset.id}_${p.id}`]: parseFloat(e.target.value)
                            }))
                          }
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-600">
                          <span>{p.min}</span>
                          <span>{p.max}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Custom Equation Configuration */
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Custom Expression f(x)
              </span>

              <div className="space-y-2">
                <label className="text-xs text-slate-400">Enter formula using variable &apos;x&apos;:</label>
                <input
                  type="text"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder="e.g. sin(x) * exp(-0.1 * x)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Domain Range Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-mono">X Min</label>
                  <input
                    type="number"
                    value={customXMin}
                    onChange={(e) => setCustomXMin(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-mono">X Max</label>
                  <input
                    type="number"
                    value={customXMax}
                    onChange={(e) => setCustomXMax(parseFloat(e.target.value) || 10)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-100"
                  />
                </div>
              </div>

              {/* Quick Math Examples */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Example Formulas
                </span>
                {[
                  'sin(x) * exp(-0.15 * x)',
                  '1 / (1 + x^2)',
                  'x^3 - 3*x + 1',
                  'cos(2 * pi * x) * exp(-x)',
                  '10 * log10(abs(x) + 0.001)'
                ].map((eg) => (
                  <button
                    key={eg}
                    onClick={() => setCustomFormula(eg)}
                    className="w-full text-left p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors truncate"
                  >
                    {eg}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

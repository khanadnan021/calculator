/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { UNIT_CATEGORIES, DOMAINS, UnitCategory } from '../data/unitsData';
import { convertCategoryValues, ConvertedUnitItem } from '../services/unitConverterService';
import { evaluateEngineeringMath } from '../services/mathEngine';
import { Copy, Check, ArrowRight, ArrowRightLeft, Search, CornerDownRight, Zap } from 'lucide-react';

interface UnitMatrixViewProps {
  precision: number;
  onSendToCalc: (expression: string) => void;
}

export const UnitMatrixView: React.FC<UnitMatrixViewProps> = ({
  precision,
  onSendToCalc
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('pressure');
  const [sourceUnitId, setSourceUnitId] = useState<string>('bar');
  const [inputValueStr, setInputValueStr] = useState<string>('1.0');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compound unit converter state
  const [compoundInput, setCompoundInput] = useState<string>('50 lbf * ft');
  const [compoundTargetUnit, setCompoundTargetUnit] = useState<string>('N * m');
  const [compoundResult, setCompoundResult] = useState<{ val: string; unit: string; error?: string } | null>(null);

  // Filter categories by domain
  const filteredCategories = useMemo(() => {
    return UNIT_CATEGORIES.filter((cat) => {
      if (selectedDomain === 'all') return true;
      return cat.domain === selectedDomain || cat.domain === 'general';
    });
  }, [selectedDomain]);

  // Current category
  const currentCategory: UnitCategory = useMemo(() => {
    const found = UNIT_CATEGORIES.find((c) => c.id === selectedCategoryId);
    if (found) return found;
    return UNIT_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Update source unit if category changed
  const validSourceUnitId = useMemo(() => {
    const exists = currentCategory.units.some((u) => u.id === sourceUnitId);
    if (exists) return sourceUnitId;
    return currentCategory.units[0].id;
  }, [currentCategory, sourceUnitId]);

  const numericValue = useMemo(() => {
    const val = parseFloat(inputValueStr);
    return isNaN(val) ? 0 : val;
  }, [inputValueStr]);

  // Compute conversion table for all units in current category
  const convertedItems: ConvertedUnitItem[] = useMemo(() => {
    return convertCategoryValues(currentCategory, validSourceUnitId, numericValue, precision);
  }, [currentCategory, validSourceUnitId, numericValue, precision]);

  // Filter items by search query if any
  const displayedItems = useMemo(() => {
    if (!searchQuery.trim()) return convertedItems;
    const q = searchQuery.toLowerCase();
    return convertedItems.filter(
      (item) =>
        item.unit.name.toLowerCase().includes(q) ||
        item.unit.symbol.toLowerCase().includes(q) ||
        item.unit.id.toLowerCase().includes(q)
    );
  }, [convertedItems, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSwapSource = (newSourceUnitId: string) => {
    setSourceUnitId(newSourceUnitId);
  };

  const handleRunCompound = () => {
    if (!compoundInput.trim() || !compoundTargetUnit.trim()) return;
    const expr = `(${compoundInput}) to ${compoundTargetUnit}`;
    const res = evaluateEngineeringMath(expr, 'rad', precision);
    if (res.success) {
      setCompoundResult({
        val: res.formattedStandard,
        unit: res.unitString || compoundTargetUnit
      });
    } else {
      setCompoundResult({
        val: '',
        unit: '',
        error: res.error || 'Compound conversion failed. Verify dimension compatibility.'
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
            Multi-Domain Engineering Unit Matrix
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>26 Engineering Dimensions</span>
            <span aria-hidden="true">·</span>
            <span>250+ Calibrated Metric & Imperial Units</span>
            <span aria-hidden="true">·</span>
            <span>Instant Parallel Conversion</span>
          </div>
        </div>

        {/* Global Unit Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search unit (e.g. psi, micron, cSt)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Domain Selection Tabs (Segmented functional buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {DOMAINS.map((domain) => (
          <button
            key={domain.id}
            onClick={() => setSelectedDomain(domain.id)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              selectedDomain === domain.id
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-900'
            }`}
          >
            {domain.label}
          </button>
        ))}
      </div>

      {/* Categories Horizontal Carousel / List */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/60">
        {filteredCategories.map((cat) => {
          const isActive = cat.id === currentCategory.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setSourceUnitId(cat.units[0].id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] font-mono px-1 rounded ${
                isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {cat.units.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Primary Input & Source Calibration Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Input Controller */}
        <div className="lg:col-span-8 p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Source Magnitude & Unit
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Category: <span className="text-cyan-400 font-semibold">{currentCategory.name}</span> (Base SI: {currentCategory.baseUnit})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Input Value Field */}
            <div className="relative w-full sm:flex-1">
              <input
                type="number"
                step="any"
                value={inputValueStr}
                onChange={(e) => setInputValueStr(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xl focus:outline-none focus:border-cyan-500 transition-colors tabular-nums"
                placeholder="0.0"
              />
            </div>

            {/* Source Unit Selector */}
            <div className="w-full sm:w-64">
              <select
                value={validSourceUnitId}
                onChange={(e) => setSourceUnitId(e.target.value)}
                className="w-full px-3 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {currentCategory.units.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                    {u.symbol} — {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Magnitude Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs font-mono text-slate-400">
            <span className="text-slate-500 mr-1">Presets:</span>
            {[0.001, 0.1, 1, 10, 100, 1000, 101325].map((preset) => (
              <button
                key={preset}
                onClick={() => setInputValueStr(preset.toString())}
                className="px-2 py-0.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-slate-200 rounded transition-colors"
              >
                {preset}
              </button>
            ))}
            <button
              onClick={() => setInputValueStr((parseFloat(inputValueStr) * -1 || 0).toString())}
              className="px-2 py-0.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-slate-200 rounded transition-colors"
            >
              ± Negate
            </button>
          </div>
        </div>

        {/* Right: Compound Unit Calculator Tool */}
        <div className="lg:col-span-4 p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Compound Unit Engine</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Convert composite dimensional fractions and products directly.
          </p>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={compoundInput}
                onChange={(e) => setCompoundInput(e.target.value)}
                placeholder="e.g. 50 lbf * ft"
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex items-center gap-1">
                <span className="text-slate-500 text-xs">to</span>
                <input
                  type="text"
                  value={compoundTargetUnit}
                  onChange={(e) => setCompoundTargetUnit(e.target.value)}
                  placeholder="e.g. N * m"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleRunCompound}
              className="w-full py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono rounded transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Evaluate Compound Conversion</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {compoundResult && (
              <div className="p-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono">
                {compoundResult.error ? (
                  <span className="text-rose-400 text-[11px]">{compoundResult.error}</span>
                ) : (
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-cyan-400 font-semibold">{compoundResult.val}</span>
                    <button
                      onClick={() => handleCopy(compoundResult.val, 'compound')}
                      className="text-slate-400 hover:text-slate-100 p-0.5"
                    >
                      {copiedId === 'compound' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Converted Results Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Target Results Matrix</span>
            <span aria-hidden="true">·</span>
            <span>{displayedItems.length} units listed</span>
          </div>
          <span className="font-mono text-slate-500 hidden sm:inline">
            Click any row to make it the active source
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {displayedItems.map((item) => {
            const isSrc = item.isSource;
            return (
              <div
                key={item.unit.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSrc
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-slate-100">
                        {item.unit.symbol}
                      </span>
                      {isSrc && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Active Source
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.unit.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isSrc && (
                      <button
                        onClick={() => handleSwapSource(item.unit.id)}
                        title="Set as new source unit"
                        className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(`${item.formattedStandard} ${item.unit.symbol}`, item.unit.id)}
                      title="Copy formatted value"
                      className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                    >
                      {copiedId === item.unit.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onSendToCalc(`${item.formattedStandard} ${item.unit.mathjsSymbol || item.unit.symbol}`)}
                      title="Send to Dimensional Calculator"
                      className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Primary Numeric Display */}
                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <div className="text-lg font-mono font-semibold text-slate-100 tabular-nums break-all">
                    {item.formattedStandard}
                  </div>

                  {/* Scientific & Engineering Notation Subtext */}
                  <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Sci: {item.formattedScientific}</span>
                    <span>Eng: {item.formattedEngineering}</span>
                  </div>

                  {/* Relative Conversion Ratio */}
                  {!currentCategory.isNonLinear && !isSrc && (
                    <div className="mt-1 text-[10px] font-mono text-slate-500">
                      1 {validSourceUnitId} = {Number(item.factorRatio.toPrecision(5))} {item.unit.symbol}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

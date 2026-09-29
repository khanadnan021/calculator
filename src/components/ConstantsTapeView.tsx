/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PHYSICAL_CONSTANTS, PhysicalConstant } from '../data/constantsData';
import { HistoryItem } from './DimensionalCalcView';
import { Copy, Check, CornerDownRight, Search, Download, Trash2, Bookmark } from 'lucide-react';

interface ConstantsTapeViewProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onSendToCalc: (expression: string) => void;
}

export const ConstantsTapeView: React.FC<ConstantsTapeViewProps> = ({
  history,
  onClearHistory,
  onSendToCalc
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'constants' | 'tape'>('constants');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredConstants = useMemo(() => {
    return PHYSICAL_CONSTANTS.filter((c) => {
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.unit.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportTape = (format: 'markdown' | 'csv') => {
    if (history.length === 0) return;
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'markdown') {
      filename = `OmniEngineer_Calculation_Tape_${Date.now()}.md`;
      mimeType = 'text/markdown';
      content = `# OmniEngineer Calculation Tape Export\n\nExported: ${new Date().toISOString()}\n\n| Timestamp | Expression | Result |\n| :--- | :--- | :--- |\n`;
      history.forEach((h) => {
        content += `| ${h.timestamp} | \`${h.expression}\` | **${h.result}** |\n`;
      });
    } else {
      filename = `OmniEngineer_Calculation_Tape_${Date.now()}.csv`;
      mimeType = 'text/csv';
      content = 'Timestamp,Expression,Result\n';
      history.forEach((h) => {
        content += `"${h.timestamp}","${h.expression.replace(/"/g, '""')}","${h.result.replace(/"/g, '""')}"\n`;
      });
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
            CODATA Constants & Engineering Calculation Tape
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>CODATA 2022 Calibrated Standard Values</span>
            <span aria-hidden="true">·</span>
            <span>Traceable Calculation Audit Tape</span>
            <span aria-hidden="true">·</span>
            <span>Single-Click Calculator Pipeline</span>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('constants')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeSubTab === 'constants'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Physical Constants ({PHYSICAL_CONSTANTS.length})
          </button>
          <button
            onClick={() => setActiveSubTab('tape')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeSubTab === 'tape'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Calculation Tape ({history.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'constants' ? (
        /* Physical Constants Table View */
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'universal', label: 'Universal' },
                { id: 'electromagnetic', label: 'Electromagnetic' },
                { id: 'atomic', label: 'Atomic & Quantum' },
                { id: 'physicochemical', label: 'Physicochemical' },
                { id: 'mechanical_planetary', label: 'Planetary & Mechanics' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search constants (c, G, h, planck)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Constants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredConstants.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold font-mono text-cyan-300">
                        {c.symbol}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {c.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(c.valueString, c.id)}
                        title="Copy numeric value"
                        className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                      >
                        {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onSendToCalc(c.mathjsExpression)}
                        title="Send constant with units to Calculator"
                        className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 mt-1">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {c.description}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 mt-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-mono font-bold text-slate-100 tabular-nums">
                      {c.valueString}
                    </span>
                    <span className="text-xs font-mono text-cyan-400/90 font-medium">
                      {c.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Calculation Tape View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Session Audit Tape</span>
              <span aria-hidden="true">·</span>
              <span>{history.length} operations stored</span>
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <>
                  <button
                    onClick={() => handleExportTape('markdown')}
                    className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export MD</span>
                  </button>
                  <button
                    onClick={() => handleExportTape('csv')}
                    className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={onClearHistory}
                    className="px-2.5 py-1 text-xs font-mono bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/60 rounded flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Tape</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300 font-mono">No Calculations Logged Yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Expressions evaluated in the Dimensional Calculator will automatically populate this persistent audit tape.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                      <span>{item.timestamp}</span>
                    </div>
                    <div className="text-slate-300 text-sm font-semibold">
                      {item.expression}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-cyan-300 font-bold text-base tabular-nums">
                      = {item.result}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(item.result, item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800"
                        title="Copy result"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onSendToCalc(item.expression)}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800"
                        title="Re-run expression in calculator"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

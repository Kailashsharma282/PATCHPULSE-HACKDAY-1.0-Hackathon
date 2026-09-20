import React, { useEffect, useState } from 'react';
import { Sliders, ShieldCheck, Check, RotateCcw, Cpu } from 'lucide-react';
import { api } from '../lib/api';

export const AdminConfigPage: React.FC = () => {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Form states
  const [clusterThreshold, setClusterThreshold] = useState(0.78);
  const [maxRadius, setMaxRadius] = useState(150);
  const [aiMode, setAiMode] = useState('mock');
  const [weights, setWeights] = useState({
    severity: 0.25,
    impact: 0.20,
    persistence: 0.15,
    confidence: 0.15,
    vulnerability: 0.15,
    urgency: 0.10,
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getConfig();
        if (res.success && res.data) {
          setConfig(res.data);
          if (res.data.CLUSTERING_CONFIG) {
            setClusterThreshold(res.data.CLUSTERING_CONFIG.threshold ?? 0.78);
            setMaxRadius(res.data.CLUSTERING_CONFIG.maxRadiusMeters ?? 150);
          }
          if (res.data.PRIORITY_WEIGHTS) {
            setWeights(res.data.PRIORITY_WEIGHTS);
          }
          if (res.data.AI_MODE_ACTIVE) {
            setAiMode(res.data.AI_MODE_ACTIVE);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        api.updateConfig('PRIORITY_WEIGHTS', weights, 'Priority calculation factors'),
        api.updateConfig(
          'CLUSTERING_CONFIG',
          { threshold: clusterThreshold, maxRadiusMeters: maxRadius },
          'Clustering fusion settings'
        ),
        api.updateConfig('AI_MODE', { mode: aiMode }, 'AI execution mode'),
      ]);
      setSavedMessage('Configuration updated successfully!');
      setTimeout(() => setSavedMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#1F2C47]">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-teal-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">System Configuration</h1>
        </div>
        <p className="text-xs text-slate-400">
          Tune PULSE-5 clustering parameters, explainable priority weights, and AI execution modes.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-6">
        {savedMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* AI Execution Mode */}
        <div className="space-y-3 pb-6 border-b border-[#1F2C47]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">AI Engine Mode</h3>
          </div>
          <p className="text-xs text-slate-400">
            Select between High-Fidelity Deterministic Mock AI (zero latency, offline) or Live OpenAI API.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                aiMode === 'mock'
                  ? 'bg-teal-500/15 border-teal-500 text-teal-300'
                  : 'bg-[#161F33] border-[#1F2C47] text-slate-400'
              }`}
            >
              <div>
                <span className="block font-bold text-xs">Deterministic Mock AI</span>
                <span className="text-[10px] text-slate-400">Flagship Hackathon Demo (Instant)</span>
              </div>
              <input
                type="radio"
                name="aiMode"
                value="mock"
                checked={aiMode === 'mock'}
                onChange={() => setAiMode('mock')}
                className="accent-teal-500"
              />
            </label>

            <label
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                aiMode === 'openai'
                  ? 'bg-teal-500/15 border-teal-500 text-teal-300'
                  : 'bg-[#161F33] border-[#1F2C47] text-slate-400'
              }`}
            >
              <div>
                <span className="block font-bold text-xs">Live OpenAI API</span>
                <span className="text-[10px] text-slate-400">Configured via OPENAI_API_KEY</span>
              </div>
              <input
                type="radio"
                name="aiMode"
                value="openai"
                checked={aiMode === 'openai'}
                onChange={() => setAiMode('openai')}
                className="accent-teal-500"
              />
            </label>
          </div>
        </div>

        {/* Clustering Thresholds */}
        <div className="space-y-4 pb-6 border-b border-[#1F2C47]">
          <h3 className="text-sm font-bold text-white">Clustering Engine Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Cluster Match Threshold</span>
                <span className="font-mono text-teal-400 font-bold">{clusterThreshold}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.01"
                value={clusterThreshold}
                onChange={(e) => setClusterThreshold(parseFloat(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Composite score &ge; {clusterThreshold} triggers deduplication cluster merge
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Max Spatial Radius</span>
                <span className="font-mono text-teal-400 font-bold">{maxRadius}m</span>
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={maxRadius}
                onChange={(e) => setMaxRadius(parseInt(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Haversine distance boundary for candidate cluster checks
              </span>
            </div>
          </div>
        </div>

        {/* Priority Engine Weights */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Explainable Priority Formula Weights</h3>
            <span className="text-xs font-mono text-slate-400">Total: 1.0 (100%)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {Object.entries(weights).map(([factor, w]) => (
              <div key={factor} className="p-3 bg-[#161F33] rounded-xl border border-[#1F2C47] space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block truncate">
                  {factor}
                </span>
                <span className="font-bold text-teal-400 font-mono text-sm">
                  {Math.round((w as number) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
        >
          {saving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};

import React from 'react';
import { ShieldAlert, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { getPriorityColor } from '../lib/utils';

interface PriorityRadarProps {
  score: number;
  band: string;
  reasoning?: {
    factors?: {
      severity?: number;
      impact?: number;
      persistence?: number;
      confidence?: number;
      vulnerability?: number;
      urgency?: number;
    };
    weights?: Record<string, number>;
    reasons?: string[];
  } | null;
}

export const PriorityScoreCard: React.FC<PriorityRadarProps> = ({ score, band, reasoning }) => {
  const color = getPriorityColor(band);

  const factors = [
    { label: 'Severity', value: reasoning?.factors?.severity ?? 70, weight: '25%' },
    { label: 'Impact Radius', value: reasoning?.factors?.impact ?? 80, weight: '20%' },
    { label: 'Persistence', value: reasoning?.factors?.persistence ?? 60, weight: '15%' },
    { label: 'Confidence', value: reasoning?.factors?.confidence ?? 90, weight: '15%' },
    { label: 'Vulnerability', value: reasoning?.factors?.vulnerability ?? 85, weight: '15%' },
    { label: 'Urgency', value: reasoning?.factors?.urgency ?? 75, weight: '10%' },
  ];

  const reasons = reasoning?.reasons || [
    'Night-time blackout condition in student pedestrian conduit',
    'Multiple corroborating citizen reports unified under single issue',
    'Continuous multi-day persistence without corrective action',
  ];

  return (
    <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header & Main Score Dial */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Explainable Priority Score
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Multi-dimensional transparent calculation (0–100 scale)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {score}
            </span>
            <span className="text-xs text-slate-400 font-mono"> / 100</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${color.bg} ${color.text} ${color.border}`}
          >
            {band}
          </span>
        </div>
      </div>

      {/* 6-Factor Dimension Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {factors.map((f) => (
          <div key={f.label} className="bg-[#161F33] p-3 rounded-xl border border-[#1F2C47] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">{f.label}</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[10px] text-slate-400">Wt: {f.weight}</span>
                <span className="font-bold text-white">{f.value}%</span>
              </div>
            </div>
            <div className="h-2 w-full bg-[#090D16] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, f.value))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Transparent Reasons Breakdown (Section 17) */}
      <div className="pt-4 border-t border-[#1F2C47] space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          Transparent Explanation Rationale
        </h4>
        <ul className="space-y-1.5">
          {reasons.map((r, i) => (
            <li
              key={i}
              className="text-xs text-slate-300 flex items-start gap-2 bg-[#161F33]/40 p-2 rounded-lg border border-[#1F2C47]/50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

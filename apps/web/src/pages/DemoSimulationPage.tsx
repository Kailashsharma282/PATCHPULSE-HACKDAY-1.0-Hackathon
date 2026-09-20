import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Flame,
  Camera,
  Layers,
} from 'lucide-react';
import { api } from '../lib/api';

export const DemoSimulationPage: React.FC = () => {
  const [demoState, setDemoState] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    const res = await api.getDemoState();
    if (res.success && res.data) {
      setDemoState(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleNext = async () => {
    const res = await api.nextDemoStep();
    if (res.success && res.data) setDemoState(res.data);
  };

  const handlePrev = async () => {
    const res = await api.prevDemoStep();
    if (res.success && res.data) setDemoState(res.data);
  };

  const handleStepJump = async (step: number) => {
    const res = await api.setDemoStep(step);
    if (res.success && res.data) setDemoState(res.data);
  };

  const handleReset = async () => {
    const res = await api.resetDemo();
    if (res.success && res.data) setDemoState(res.data);
  };

  const step = demoState?.stepData;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Simulation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Flagship Live Simulation
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Interactive 13-step demonstration of the full PULSE-5 Civic Intelligence Lifecycle.
          </p>
        </div>

        {/* Action Controls: Step, Play, Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={demoState?.currentStep <= 1}
            className="p-2.5 rounded-xl bg-[#111726] hover:bg-[#161F33] text-slate-300 disabled:opacity-30 border border-[#1F2C47] transition"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-[#111726] hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-[#1F2C47] transition"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Timeline Indicator (Step X of 13) */}
      <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-teal-400 font-bold tracking-wider">
            STEP {demoState?.currentStep || 1} / {demoState?.totalSteps || 13}
          </span>
          <span className="text-slate-400 font-semibold">{step?.badge || 'SIMULATION ACTIVE'}</span>
        </div>

        {/* Step dots */}
        <div className="grid grid-cols-13 gap-1.5 h-2">
          {Array.from({ length: 13 }, (_, i) => i + 1).map((s) => (
            <button
              key={s}
              onClick={() => handleStepJump(s)}
              className={`rounded-full transition-all h-full ${
                s === demoState?.currentStep
                  ? 'bg-teal-400 ring-2 ring-teal-500/50'
                  : s < demoState?.currentStep
                  ? 'bg-teal-700 hover:bg-teal-500'
                  : 'bg-[#1F2C47] hover:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Flagship Active Step Card */}
      {step && (
        <div className="bg-[#111726] border border-[#1F2C47] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
            <div className="space-y-1">
              <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
                {step.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{step.title}</h2>
            </div>

            {step.priorityScore && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  Priority {step.priorityScore} / 100 ({step.priorityBand})
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {step.description}
          </p>

          {/* Step Details & Technical Telemetry */}
          {step.details && (
            <div className="p-4 rounded-2xl bg-[#161F33] border border-[#1F2C47] space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase text-slate-400 tracking-wider block font-bold">
                Telemetry & Signal Breakdown
              </span>
              {Object.entries(step.details).map(([k, v]: any) => (
                <div key={k} className="flex justify-between py-1 border-b border-[#1F2C47]/40 last:border-none">
                  <span className="text-slate-400">{k}:</span>
                  <span className="text-teal-300 font-bold">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick jump to inspect issue #P-024 */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Corroborated incident: <strong>Issue #P-024</strong>
            </span>
            <Link
              to="/issues/P-024"
              className="px-4 py-2 rounded-xl bg-[#161F33] hover:bg-teal-500 hover:text-slate-950 text-teal-400 text-xs font-bold border border-[#1F2C47] transition flex items-center gap-1.5"
            >
              Open Issue #P-024 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

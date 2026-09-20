import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, ShieldCheck, Sparkles, Eye } from 'lucide-react';

interface VerificationDiffViewerProps {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  visualChangeScore?: number;
  resolutionConfidence?: number;
  detectedBeforeState?: string;
  detectedAfterState?: string;
  recommendation?: string;
  status?: string;
}

export const VerificationDiffViewer: React.FC<VerificationDiffViewerProps> = ({
  beforeImageUrl = 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800',
  afterImageUrl = 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800',
  visualChangeScore = 0.94,
  resolutionConfidence = 0.97,
  detectedBeforeState = 'Non-functioning luminaire, zero lux output, severe darkness along pedestrian pathway.',
  detectedAfterState = '150W fixture fully illuminated with uniform 80-lux ground coverage; defect fully resolved.',
  recommendation = 'VERIFIED RESOLVED: Defect rectified and verified by AI visual comparison.',
  status = 'VERIFIED_RESOLVED',
}) => {
  const [activeTab, setActiveTab] = useState<'split' | 'before' | 'after'>('split');

  const isVerified = status === 'VERIFIED_RESOLVED' || resolutionConfidence >= 0.85;

  return (
    <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              AI Before / After Resolution Verification
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Automated photographic evidence delta verification (PULSE-5 Evidence Phase)
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-[#161F33] p-1 rounded-xl border border-[#1F2C47] text-xs">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === 'split' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setActiveTab('before')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === 'before' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setActiveTab('after')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === 'after' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            After
          </button>
        </div>
      </div>

      {/* Visual Comparison Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'split' || activeTab === 'before') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase text-red-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Before Repair (Defect State)
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-[#1F2C47] aspect-video bg-[#090D16]">
              <img
                src={beforeImageUrl}
                alt="Before repair condition"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-red-300 border border-red-500/40">
                DEFECT IDENTIFIED
              </div>
            </div>
            <p className="text-[11px] text-slate-400 bg-[#161F33] p-2.5 rounded-lg border border-[#1F2C47] leading-relaxed">
              <strong className="text-slate-200">AI Observation:</strong> {detectedBeforeState}
            </p>
          </div>
        )}

        {(activeTab === 'split' || activeTab === 'after') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                After Repair (Resolution Evidence)
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-[#1F2C47] aspect-video bg-[#090D16]">
              <img
                src={afterImageUrl}
                alt="After repair verification"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-emerald-300 border border-emerald-500/40">
                AI VERIFIED RECTIFIED
              </div>
            </div>
            <p className="text-[11px] text-slate-400 bg-[#161F33] p-2.5 rounded-lg border border-[#1F2C47] leading-relaxed">
              <strong className="text-slate-200">AI Verification:</strong> {detectedAfterState}
            </p>
          </div>
        )}
      </div>

      {/* Verification Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#161F33] border border-[#1F2C47]">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Visual Change Delta</span>
          <p className="text-xl font-bold font-mono text-teal-400">
            {Math.round(visualChangeScore * 100)}%
          </p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Resolution Confidence</span>
          <p className="text-xl font-bold font-mono text-emerald-400">
            {Math.round(resolutionConfidence * 100)}%
          </p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Audit Decision</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isVerified ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 font-mono">PASSED</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 font-mono">REVIEW REQ</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Final recommendation */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${
          isVerified
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        }`}
      >
        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
        <span className="leading-relaxed font-medium">{recommendation}</span>
      </div>
    </div>
  );
};

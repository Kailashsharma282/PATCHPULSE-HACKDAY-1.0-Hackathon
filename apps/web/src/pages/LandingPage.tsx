import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Layers,
  ShieldCheck,
  CheckCircle,
  Play,
  ArrowRight,
  Radio,
  Cpu,
  Eye,
  Sliders,
  Sparkles,
  MapPin,
  Flame,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const pulseSteps = [
    {
      letter: 'P',
      name: 'Perceive',
      title: 'Collect Weak Signals',
      desc: 'Ingests multi-modal signals: photos, natural language notes, voice complaints, device GPS, and historical telemetry without waiting for formal complaints.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      letter: 'U',
      name: 'Unify',
      title: 'Group Related Signals',
      desc: 'Clustering engine combines semantic embeddings, spatial Haversine distance, and temporal decay to fuse scattered reports into one Issue Fingerprint.',
      color: 'from-teal-500 to-emerald-500',
    },
    {
      letter: 'L',
      name: 'Learn',
      title: 'Understand Severity & Context',
      desc: 'Analyzes environmental vulnerability: nighttime illumination, proximity to student hostels, pedestrian conduit density, and hazard severity.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      letter: 'S',
      name: 'Score',
      title: 'Prioritize Transparently',
      desc: 'Calculates an explainable priority score (0–100) across 6 weighted dimensions. Every score includes transparent, human-readable justification.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      letter: 'E',
      name: 'Evidence',
      title: 'Verify Real Resolution',
      desc: 'Demands photographic proof before closing work orders. Dual-frame AI visual inspection validates whether the physical defect has actually been cured.',
      color: 'from-emerald-500 to-teal-400',
    },
  ];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8 pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          HACKDAY 1.0 — TECH FOR A BETTER TOMORROW
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Detect problems before <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            complaints become crises.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Traditional platforms count complaints. <strong>PATCHPULSE</strong> reconstructs the
          underlying physical problem. It fuses scattered weak signals into verified civic
          intelligence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/report"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-teal-500/20 transition transform hover:-translate-y-0.5"
          >
            <span>Report an Issue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-[#111726] hover:bg-[#161F33] text-white font-semibold text-sm border border-[#1F2C47] transition flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Command Center</span>
          </Link>
          <Link
            to="/demo"
            className="px-6 py-3.5 rounded-xl bg-[#1F2C47] hover:bg-[#2A3B5E] text-teal-300 font-semibold text-sm border border-teal-500/40 transition flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current text-teal-400" />
            <span>Interactive Demo</span>
          </Link>
        </div>

        {/* Live Metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-[#1F2C47]">
          <div className="p-4 bg-[#111726] rounded-xl border border-[#1F2C47]">
            <p className="text-2xl font-bold font-mono text-teal-400">75%</p>
            <p className="text-xs text-slate-400">Duplicate Noise Compressed</p>
          </div>
          <div className="p-4 bg-[#111726] rounded-xl border border-[#1F2C47]">
            <p className="text-2xl font-bold font-mono text-emerald-400">97%</p>
            <p className="text-xs text-slate-400">AI Verification Confidence</p>
          </div>
          <div className="p-4 bg-[#111726] rounded-xl border border-[#1F2C47]">
            <p className="text-2xl font-bold font-mono text-cyan-400">PULSE-5</p>
            <p className="text-xs text-slate-400">Signal Fusion Methodology</p>
          </div>
          <div className="p-4 bg-[#111726] rounded-xl border border-[#1F2C47]">
            <p className="text-2xl font-bold font-mono text-amber-400">Zero</p>
            <p className="text-xs text-slate-400">Unverified Button Resolutions</p>
          </div>
        </div>
      </section>

      {/* PULSE-5 Methodology Section */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase text-teal-400 tracking-wider">
            CORE METHODOLOGY
          </span>
          <h2 className="text-3xl font-black text-white">The PULSE-5 Intelligence Engine</h2>
          <p className="text-sm text-slate-400">
            How PATCHPULSE transforms multi-modal signals into verified infrastructure repairs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pulseSteps.map((step) => (
            <div
              key={step.letter}
              className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 flex flex-col justify-between hover:border-teal-500/50 transition relative overflow-hidden group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center font-mono font-black text-2xl text-slate-950 mb-4 shadow-lg`}
              >
                {step.letter}
              </div>
              <div>
                <p className="text-xs font-mono uppercase text-teal-400 font-semibold mb-1">
                  {step.name}
                </p>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flagship Scenario Showcase */}
      <section className="bg-[#111726] border border-[#1F2C47] rounded-3xl p-8 lg:p-12 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono uppercase">
              <Flame className="w-3.5 h-3.5" />
              FLAGSHIP SCENARIO #P-024
            </div>

            <h2 className="text-3xl font-black text-white leading-tight">
              From 3 Scattered Signals to One Critical Repair Order
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              When a student uploads a dark photo, another reports pathway darkness, and a voice
              call arrives, traditional systems open 3 separate tickets. <strong>PATCHPULSE</strong>{' '}
              recognizes they are the exact same streetlight failure at Block C Parking Area, fuses
              them into <strong>Issue #P-024</strong>, elevates priority to <strong>91 (CRITICAL)</strong>,
              and automatically assigns <strong>Work Order #PX-0192</strong>.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Haversine Proximity: 24 meters</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Semantic Cosine Similarity: 0.88</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>AI Before/After Resolution Verification: 97% Confidence</span>
              </div>
            </div>

            <Link
              to="/issues/P-024"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-teal-500/20"
            >
              Inspect Issue #P-024
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-[#090D16] border border-[#1F2C47] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#1F2C47]">
              <span className="font-mono text-xs text-teal-400 font-bold">ISSUE #P-024</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                CRITICAL (91/100)
              </span>
            </div>

            <p className="text-sm font-semibold text-white">
              Streetlight failure and severe darkness near Block C Parking Area
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#111726] p-2.5 rounded-lg border border-[#1F2C47]">
                <span className="text-[10px] text-slate-400 block font-mono">Signals Fused</span>
                <span className="font-bold text-white">4 Independent Sources</span>
              </div>
              <div className="bg-[#111726] p-2.5 rounded-lg border border-[#1F2C47]">
                <span className="text-[10px] text-slate-400 block font-mono">Work Order</span>
                <span className="font-bold text-teal-400">#PX-0192 Dispatched</span>
              </div>
            </div>

            <div className="p-3 bg-[#111726] rounded-xl border border-[#1F2C47] text-xs space-y-2">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>AI Verification Status</span>
                <span className="text-emerald-400 font-mono font-bold">VERIFIED RESOLVED (97%)</span>
              </div>
              <div className="h-1.5 w-full bg-[#161F33] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[97%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Deployment & Scalability */}
      <section className="text-center space-y-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-white">
          Built for Campuses Today, Scalable to Metropolises Tomorrow
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Starting with university campuses, residential townships, and hospital networks,
          PATCHPULSE’s generic geospatial architecture seamlessly expands to smart city civic
          monitoring.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-[#111726] border border-[#1F2C47] rounded-2xl">
            <h3 className="font-bold text-white text-base mb-2">Phase 1: Campus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              University campus infrastructure, streetlights, pathways, dormitories, student safety.
            </p>
          </div>
          <div className="p-6 bg-[#111726] border border-[#1F2C47] rounded-2xl">
            <h3 className="font-bold text-white text-base mb-2">Phase 2: Townships</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gated residential communities, corporate tech parks, hospital zones, transit hubs.
            </p>
          </div>
          <div className="p-6 bg-[#111726] border border-[#1F2C47] rounded-2xl">
            <h3 className="font-bold text-white text-base mb-2">Phase 3: Smart Cities</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Municipal public works, storm drains, water mains, IoT telemetry, citywide incident fusion.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

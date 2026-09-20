import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, MapPin, Zap } from 'lucide-react';
import { api } from '../lib/api';

export const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [ov, tr, cat, prio, hot] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getAnalyticsTrends(),
          api.getAnalyticsCategories(),
          api.getAnalyticsPriorities(),
          api.getAnalyticsHotspots(),
        ]);

        if (ov.success) setOverview(ov.data);
        if (tr.success) setTrends(tr.data);
        if (cat.success) setCategories(cat.data);
        if (prio.success) setPriorities(prio.data);
        if (hot.success) setHotspots(hot.data);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Civic Intelligence Analytics</h1>
          </div>
          <p className="text-xs text-slate-400">
            Signal volume trends, category concentrations, compression metrics, and campus hotspot density.
          </p>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Duplicate Noise Compressed</span>
          <p className="text-3xl font-bold font-mono text-teal-400">{overview?.compressionRate ?? 75}%</p>
          <p className="text-[11px] text-slate-400">Complaint clutter eliminated</p>
        </div>
        <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Resolution Time</span>
          <p className="text-3xl font-bold font-mono text-emerald-400">{overview?.averageResolutionHours ?? 4.8}h</p>
          <p className="text-[11px] text-slate-400">From signal to verification</p>
        </div>
        <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Verification Success</span>
          <p className="text-3xl font-bold font-mono text-cyan-400">{overview?.verificationSuccessRate ?? 96.5}%</p>
          <p className="text-[11px] text-slate-400">AI visual defect checks passed</p>
        </div>
        <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Weak Signals</span>
          <p className="text-3xl font-bold font-mono text-white">{overview?.totalSignals ?? 24}</p>
          <p className="text-[11px] text-slate-400">Photos, voice notes, telemetry</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signal & Issue Trends Chart */}
        <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2C47]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Signal Velocity & Incident Creation (Weekly)
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorSignals" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2C47" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111726', borderColor: '#1F2C47', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="signals" stroke="#2DD4BF" fillOpacity={1} fill="url(#colorSignals)" name="Weak Signals" />
                <Area type="monotone" dataKey="issuesDetected" stroke="#F97316" fillOpacity={0} name="Issues Unified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2C47]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Issues by Infrastructure Category
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2C47" />
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => v.slice(0, 6)} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111726', borderColor: '#1F2C47', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#2DD4BF" radius={[4, 4, 0, 0]} name="Issues" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hotspots Section (Section 30) */}
      <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2C47]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Campus Hotspot Analysis</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">IDENTIFIED RISK ZONES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hotspots.map((h) => (
            <div
              key={h.id}
              className="p-4 rounded-xl bg-[#161F33] border border-[#1F2C47] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">{h.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    h.riskLevel === 'HIGH_RISK'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  }`}
                >
                  {h.riskLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Zone: {h.zone}</p>
              <div className="flex justify-between text-xs pt-1 border-t border-[#1F2C47] font-mono">
                <span className="text-slate-400">Issues: {h.issueCount}</span>
                <span className="text-teal-400 font-bold">Avg Score: {h.averagePriority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Flame,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Play,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { api } from '../lib/api';
import { SignalStream } from '../components/SignalStream';
import { InteractiveMap } from '../components/InteractiveMap';
import { getPriorityColor, getStatusBadge, formatRelativeTime } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ovRes, isRes] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getIssues({ limit: 6, sortBy: 'newest' }),
        ]);

        if (ovRes.success && ovRes.data) setOverview(ovRes.data);
        if (isRes.success && isRes.data) setRecentIssues(isRes.data.items || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Command Center</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              IIT CAMPUS GRID
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time civic intelligence, multi-modal weak signal fusion, and evidence verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/demo"
            className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-teal-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Launch Live Simulation
          </Link>
          <Link
            to="/report"
            className="px-3.5 py-2 rounded-xl bg-[#161F33] hover:bg-[#1F2C47] text-white font-semibold text-xs border border-[#1F2C47] flex items-center gap-1.5 transition"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            Report Signal
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-[#111726] border border-[#1F2C47] rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Issues</span>
          <p className="text-2xl font-bold font-mono text-white">
            {overview?.totalIssues ?? '—'}
          </p>
          <span className="text-[10px] text-teal-400 font-mono">Fingerprints active</span>
        </div>

        <div className="p-4 bg-[#111726] border border-red-500/30 rounded-2xl space-y-1 bg-red-500/5">
          <span className="text-[10px] font-mono uppercase text-red-400 font-semibold">
            Critical Issues
          </span>
          <p className="text-2xl font-bold font-mono text-red-400">
            {overview?.criticalCount ?? '—'}
          </p>
          <span className="text-[10px] text-red-400/80 font-mono">Score 75–100</span>
        </div>

        <div className="p-4 bg-[#111726] border border-orange-500/30 rounded-2xl space-y-1 bg-orange-500/5">
          <span className="text-[10px] font-mono uppercase text-orange-400 font-semibold">
            High Priority
          </span>
          <p className="text-2xl font-bold font-mono text-orange-400">
            {overview?.highCount ?? '—'}
          </p>
          <span className="text-[10px] text-orange-400/80 font-mono">Score 55–74</span>
        </div>

        <div className="p-4 bg-[#111726] border border-[#1F2C47] rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Open Tickets</span>
          <p className="text-2xl font-bold font-mono text-blue-400">
            {overview?.openCount ?? '—'}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Under operation</span>
        </div>

        <div className="p-4 bg-[#111726] border border-emerald-500/30 rounded-2xl space-y-1 bg-emerald-500/5">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
            Verified Resolved
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {overview?.resolvedCount ?? '—'}
          </p>
          <span className="text-[10px] text-emerald-400/80 font-mono">With proof</span>
        </div>

        <div className="p-4 bg-[#111726] border border-[#1F2C47] rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Noise Reduction</span>
          <p className="text-2xl font-bold font-mono text-teal-400">
            {overview?.compressionRate ?? 75}%
          </p>
          <span className="text-[10px] text-teal-400 font-mono">Duplicate reports merged</span>
        </div>
      </div>

      {/* Main Dashboard Body: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Map & Recent Issues Table */}
        <div className="lg:col-span-2 space-y-8">
          {/* Map Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Live Geospatial Telemetry
                </h3>
              </div>
              <Link to="/map" className="text-xs text-teal-400 hover:underline flex items-center gap-1">
                Full Screen Map <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <InteractiveMap issues={recentIssues} height="360px" />
          </div>

          {/* Recent Active Issues Table */}
          <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2C47]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Active Issue Fingerprints
                </h3>
              </div>
              <Link to="/issues" className="text-xs text-teal-400 hover:underline">
                View All Issues →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-mono uppercase border-b border-[#1F2C47]">
                    <th className="pb-3 font-semibold">Issue ID</th>
                    <th className="pb-3 font-semibold">Category & Summary</th>
                    <th className="pb-3 font-semibold">Priority</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2C47]/50">
                  {recentIssues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No active issues found.
                      </td>
                    </tr>
                  ) : (
                    recentIssues.map((issue) => {
                      const prioColor = getPriorityColor(issue.priorityBand);
                      const statusBadge = getStatusBadge(issue.status);

                      return (
                        <tr key={issue.id} className="hover:bg-[#161F33]/50 transition">
                          <td className="py-3 font-mono font-bold text-teal-400">
                            #{issue.id}
                          </td>
                          <td className="py-3 pr-4 max-w-xs">
                            <p className="font-semibold text-white truncate">
                              {issue.canonicalSummary}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              📍 {issue.locationName}
                            </p>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${prioColor.bg} ${prioColor.text} ${prioColor.border}`}
                            >
                              {issue.priorityBand} ({issue.priorityScore})
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge.color}`}
                            >
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              to={`/issues/${issue.id}`}
                              className="px-2.5 py-1 rounded-lg bg-[#161F33] hover:bg-teal-500 hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition border border-[#1F2C47]"
                            >
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Signal Stream & Quick Tools */}
        <div className="space-y-6">
          <SignalStream />

          {/* Quick Info & Methodology Card */}
          <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              PULSE-5 Active Pipeline
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#161F33]">
                <span>Clustering Engine Threshold:</span>
                <span className="font-mono text-teal-400 font-bold">0.78 / 1.0</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#161F33]">
                <span>Spatial Search Radius:</span>
                <span className="font-mono text-teal-400 font-bold">150 meters</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#161F33]">
                <span>AI Verification Min Confidence:</span>
                <span className="font-mono text-emerald-400 font-bold">85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

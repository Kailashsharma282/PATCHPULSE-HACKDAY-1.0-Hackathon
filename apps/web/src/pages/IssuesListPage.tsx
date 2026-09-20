import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  Search,
  Filter,
  ArrowUpDown,
  Shield,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { api } from '../lib/api';
import { getPriorityColor, getStatusBadge, formatRelativeTime } from '../lib/utils';

export const IssuesListPage: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [priorityBand, setPriorityBand] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('priority');

  const fetchIssues = async () => {
    setLoading(true);
    const res = await api.getIssues({
      search: search || undefined,
      category: category !== 'ALL' ? category : undefined,
      priorityBand: priorityBand !== 'ALL' ? priorityBand : undefined,
      status: status !== 'ALL' ? status : undefined,
      sortBy,
    });
    if (res.success && res.data) {
      setIssues(res.data.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, [category, priorityBand, status, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIssues();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertOctagon className="w-5 h-5 text-teal-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Issue Fingerprints</h1>
          </div>
          <p className="text-xs text-slate-400">
            Deduplicated civic incidents created by multi-dimensional signal clustering.
          </p>
        </div>

        <Link
          to="/report"
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
        >
          <Layers className="w-4 h-4" />
          Report New Signal
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-4 shadow-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, keyword, location, or summary..."
              className="w-full bg-[#161F33] border border-[#1F2C47] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1F2C47] hover:bg-[#2A3B5E] text-white text-xs font-semibold transition"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#161F33] border border-[#1F2C47] rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Categories</option>
            <option value="STREETLIGHT">Streetlight Failure</option>
            <option value="POTHOLE">Pothole / Road</option>
            <option value="WATER_LEAKAGE">Water Leakage</option>
            <option value="GARBAGE_OVERFLOW">Garbage Overflow</option>
            <option value="BLOCKED_DRAIN">Blocked Drain</option>
            <option value="ELECTRICAL_HAZARD">Electrical Hazard</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityBand}
            onChange={(e) => setPriorityBand(e.target.value)}
            className="bg-[#161F33] border border-[#1F2C47] rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">CRITICAL (75–100)</option>
            <option value="HIGH">HIGH (55–74)</option>
            <option value="MEDIUM">MEDIUM (30–54)</option>
            <option value="LOW">LOW (0–29)</option>
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#161F33] border border-[#1F2C47] rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="CORROBORATING">Corroborating</option>
            <option value="PRIORITIZED">Prioritized</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="VERIFIED_RESOLVED">Verified Resolved</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#161F33] border border-[#1F2C47] rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="priority">Highest Priority</option>
            <option value="newest">Newest First</option>
            <option value="signals">Most Signals Fused</option>
            <option value="persistence">Longest Persistence</option>
          </select>
        </div>
      </div>

      {/* Issues Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-[#111726] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16 bg-[#111726] border border-[#1F2C47] rounded-2xl p-8 space-y-3">
          <p className="text-sm text-slate-400">No issue fingerprints found matching criteria.</p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('ALL');
              setPriorityBand('ALL');
              setStatus('ALL');
            }}
            className="text-xs text-teal-400 hover:underline font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map((issue) => {
            const prio = getPriorityColor(issue.priorityBand);
            const stat = getStatusBadge(issue.status);

            return (
              <div
                key={issue.id}
                className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 shadow-xl space-y-4 hover:border-teal-500/50 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-400">
                      #{issue.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${prio.bg} ${prio.text} ${prio.border}`}
                      >
                        {issue.priorityBand} ({issue.priorityScore})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${stat.color}`}
                      >
                        {stat.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">
                    {issue.canonicalSummary}
                  </h3>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    {issue.locationName}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#1F2C47] text-center font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Signals</span>
                    <span className="text-white font-bold">{issue.signalCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Confidence</span>
                    <span className="text-teal-400 font-bold">
                      {Math.round((issue.confidence || 0.8) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Radius</span>
                    <span className="text-slate-300 font-bold">{issue.affectedRadius}m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-500">
                    Detected {formatRelativeTime(issue.firstDetectedAt)}
                  </span>
                  <Link
                    to={`/issues/${issue.id}`}
                    className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500 hover:text-slate-950 text-teal-300 text-xs font-bold border border-teal-500/30 transition flex items-center gap-1"
                  >
                    Intelligence Page
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

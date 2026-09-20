import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Layers, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { api } from '../lib/api';
import { InteractiveMap, MapIssue } from '../components/InteractiveMap';
import { getPriorityColor, getStatusBadge } from '../lib/utils';

export const MapExplorerPage: React.FC = () => {
  const [issues, setIssues] = useState<MapIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMapIssues() {
      setLoading(true);
      const res = await api.getIssues({
        priorityBand: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        limit: 100,
      });
      if (res.success && res.data) {
        setIssues(res.data.items || []);
      }
      setLoading(false);
    }
    loadMapIssues();
  }, [priorityFilter]);

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2C47]">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Geospatial Explorer</h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#111726] text-teal-400 border border-[#1F2C47]">
            {issues.length} Map Incidents
          </span>
        </div>

        {/* Priority Band Filter bar */}
        <div className="flex items-center gap-1.5 bg-[#111726] p-1 rounded-xl border border-[#1F2C47] text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((band) => (
            <button
              key={band}
              onClick={() => setPriorityFilter(band)}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] transition ${
                priorityFilter === band
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {band}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-[#1F2C47] shadow-2xl">
        <InteractiveMap
          issues={issues}
          selectedIssueId={selectedIssue?.id}
          onSelectIssue={(issue) => setSelectedIssue(issue)}
          height="100%"
        />

        {/* Floating Selected Issue Drawer */}
        {selectedIssue && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 bg-[#111726]/95 backdrop-blur border border-[#1F2C47] rounded-2xl p-5 shadow-2xl z-20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-400">
                  #{selectedIssue.id}
                </span>
                <span className="text-xs font-bold text-white">{selectedIssue.canonicalCategory}</span>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#161F33]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 font-semibold">{selectedIssue.canonicalSummary}</p>
            <p className="text-[11px] text-slate-400 font-mono">📍 {selectedIssue.locationName}</p>

            <div className="flex items-center justify-between pt-2 border-t border-[#1F2C47]">
              <span className="text-xs font-mono font-bold text-red-400">
                Priority {selectedIssue.priorityScore} ({selectedIssue.priorityBand})
              </span>
              <Link
                to={`/issues/${selectedIssue.id}`}
                className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-1"
              >
                Open Fingerprint <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

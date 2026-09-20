import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Camera, Mic, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { formatRelativeTime } from '../lib/utils';

export const ReportsListPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      const res = await api.getReports({ status: statusFilter === 'ALL' ? undefined : statusFilter });
      if (res.success && res.data) {
        setReports(res.data.items || []);
      }
      setLoading(false);
    }
    loadReports();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-teal-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Raw Citizen Reports</h1>
          </div>
          <p className="text-xs text-slate-400">
            Ingested weak signals before clustering and corroboration into Issue Fingerprints.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-[#111726] p-1 rounded-xl border border-[#1F2C47] text-xs">
          {['ALL', 'CLUSTERED', 'PENDING'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition ${
                statusFilter === s ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[#111726] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-[#111726] border border-[#1F2C47] rounded-2xl p-8 space-y-3">
          <p className="text-sm text-slate-400">No reports found matching the selected filter.</p>
          <Link
            to="/report"
            className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline font-bold"
          >
            Submit the first report →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 shadow-xl space-y-3 hover:border-slate-600 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161F33] text-teal-400 border border-[#1F2C47]">
                  {r.aiCategory || 'UNCATEGORIZED'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {formatRelativeTime(r.createdAt)}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                "{r.description}"
              </p>

              {r.mediaUrl && (
                <div className="rounded-xl overflow-hidden aspect-video border border-[#1F2C47] max-h-36">
                  <img src={r.mediaUrl} alt="Report attachment" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-[#1F2C47] text-xs font-mono">
                <span className="text-slate-400">
                  Status:{' '}
                  <strong className={r.status === 'CLUSTERED' ? 'text-teal-400' : 'text-amber-400'}>
                    {r.status}
                  </strong>
                </span>

                {r.issue && (
                  <Link
                    to={`/issues/${r.issue.id}`}
                    className="text-teal-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    Issue #{r.issue.id} <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

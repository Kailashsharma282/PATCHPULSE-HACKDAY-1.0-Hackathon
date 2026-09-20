import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, User, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { getPriorityColor, getStatusBadge, formatDate } from '../lib/utils';

export const WorkOrdersPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadWorkOrders() {
      setLoading(true);
      const res = await api.getWorkOrders({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.success && res.data) {
        setWorkOrders(res.data.items || []);
      }
      setLoading(false);
    }
    loadWorkOrders();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-teal-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Work Orders Board</h1>
          </div>
          <p className="text-xs text-slate-400">
            Field maintenance dispatches, equipment requirements, and verification lifecycles.
          </p>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-1 bg-[#111726] p-1 rounded-xl border border-[#1F2C47] text-xs">
          {['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'].map((s) => (
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
            <div key={i} className="h-24 bg-[#111726] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : workOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#111726] border border-[#1F2C47] rounded-2xl p-8 space-y-3">
          <p className="text-sm text-slate-400">No work orders found for this status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workOrders.map((wo) => {
            const prio = getPriorityColor(wo.priority);
            const stat = getStatusBadge(wo.status);

            return (
              <div
                key={wo.id}
                className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 shadow-xl hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-400">#{wo.id}</span>
                    <span className="text-slate-600">•</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${prio.bg} ${prio.text} ${prio.border}`}
                    >
                      {wo.priority}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${stat.color}`}
                    >
                      {stat.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{wo.summary}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                    <span>👥 {wo.requiredTeam}</span>
                    <span>👤 {wo.assignedToUser?.name || 'Unassigned'}</span>
                    <span>⏰ Deadline: {formatDate(wo.deadline)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/work-orders/${wo.id}`}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
                  >
                    Manage Order <ArrowRight className="w-3.5 h-3.5" />
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

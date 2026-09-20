import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Clock,
  User,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Play,
  ShieldCheck,
  Camera,
  Layers,
} from 'lucide-react';
import { api } from '../lib/api';
import { getPriorityColor, getStatusBadge, formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const WorkOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workOrder, setWorkOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchWorkOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getWorkOrder(id);
      if (res.success && res.data) {
        setWorkOrder(res.data);
      } else {
        setError(res.message || 'Work Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load work order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    setStatusUpdating(true);
    try {
      const res = await api.updateWorkOrderStatus(id, newStatus);
      if (res.success) {
        fetchWorkOrder();
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-[#111726] rounded-2xl animate-pulse" />;
  }

  if (error || !workOrder) {
    return (
      <div className="text-center py-16 bg-[#111726] border border-[#1F2C47] rounded-2xl p-8 space-y-4">
        <p className="text-xs text-slate-400">{error || 'Work Order not found'}</p>
        <Link to="/work-orders" className="text-teal-400 text-xs font-bold hover:underline">
          ← Back to Work Orders
        </Link>
      </div>
    );
  }

  const prio = getPriorityColor(workOrder.priority);
  const stat = getStatusBadge(workOrder.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/work-orders" className="hover:text-white">
          ← Work Orders
        </Link>
        <span>/</span>
        <span className="font-mono text-teal-400 font-bold">#{workOrder.id}</span>
      </div>

      <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-teal-400">
                WORK ORDER #{workOrder.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${prio.bg} ${prio.text} ${prio.border}`}
              >
                {workOrder.priority}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${stat.color}`}>
                {stat.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{workOrder.summary}</h1>
          </div>

          <Link
            to={`/issues/${workOrder.issueId}`}
            className="px-4 py-2 rounded-xl bg-[#161F33] hover:bg-[#1F2C47] text-teal-400 text-xs font-bold border border-[#1F2C47] transition"
          >
            View Linked Issue #{workOrder.issueId} →
          </Link>
        </div>

        {/* State Machine Transition Controls (Section 24) */}
        <div className="p-4 bg-[#161F33] rounded-xl border border-[#1F2C47] space-y-3">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
            State Machine Progression
          </span>
          <div className="flex flex-wrap gap-2">
            {workOrder.status === 'ASSIGNED' && (
              <button
                disabled={statusUpdating}
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
              >
                Start Work (Move to IN_PROGRESS)
              </button>
            )}
            {workOrder.status === 'IN_PROGRESS' && (
              <button
                disabled={statusUpdating}
                onClick={() => handleStatusChange('COMPLETED')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                Complete Work (Ready for Verification)
              </button>
            )}
            {(workOrder.status === 'COMPLETED' || workOrder.status === 'VERIFICATION_PENDING') && (
              <Link
                to={`/issues/${workOrder.issueId}`}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                Upload After-Photo & Verify
              </Link>
            )}
            {workOrder.status === 'VERIFIED' && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                Resolution Verified by Evidence
              </div>
            )}
          </div>
        </div>

        {/* Specifications & Tooling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#161F33] border border-[#1F2C47] space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Dispatch Team</span>
            <p className="font-bold text-white text-sm">{workOrder.requiredTeam}</p>
            <p className="text-slate-400">
              Assigned Specialist: <strong className="text-teal-400">{workOrder.assignedToUser?.name || 'Manoj Kumar'}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161F33] border border-[#1F2C47] space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Recommended Action</span>
            <p className="text-slate-200 leading-relaxed">{workOrder.recommendedAction}</p>
          </div>
        </div>

        {/* Suggested Equipment Checklist */}
        <div className="p-4 rounded-xl bg-[#161F33] border border-[#1F2C47] space-y-2 text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">
            Suggested Tooling & Safety Equipment
          </span>
          <p className="font-mono text-teal-300">
            {workOrder.suggestedEquipment || 'Standard electrical safety toolkit, multimeter, high-visibility PPE'}
          </p>
        </div>
      </div>
    </div>
  );
};

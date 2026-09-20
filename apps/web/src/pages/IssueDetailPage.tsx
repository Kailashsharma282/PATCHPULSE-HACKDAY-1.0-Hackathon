import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  MapPin,
  Camera,
  Mic,
  FileText,
  Clock,
  CheckCircle,
  Wrench,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  Share2,
  RefreshCw,
  PlusCircle,
  Check,
} from 'lucide-react';
import { api } from '../lib/api';
import { PriorityScoreCard } from '../components/PriorityRadar';
import { VerificationDiffViewer } from '../components/VerificationDiffViewer';
import { InteractiveMap } from '../components/InteractiveMap';
import { getPriorityColor, getStatusBadge, formatDate, formatRelativeTime } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Work order modal state
  const [showWoModal, setShowWoModal] = useState(false);
  const [woSummary, setWoSummary] = useState('');
  const [woTeam, setWoTeam] = useState('Electrical Maintenance Unit 2');
  const [woSubmitting, setWoSubmitting] = useState(false);

  // Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [afterImageUrl, setAfterImageUrl] = useState(
    'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800'
  );
  const [verifying, setVerifying] = useState(false);

  const fetchIssue = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getIssue(id);
      if (res.success && res.data) {
        setIssue(res.data);
      } else {
        setError(res.message || 'Failed to load issue');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading issue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setWoSubmitting(true);
    try {
      const res = await api.createWorkOrder({
        issueId: id,
        summary: woSummary || undefined,
        requiredTeam: woTeam,
      });
      if (res.success) {
        setShowWoModal(false);
        fetchIssue();
      }
    } finally {
      setWoSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setVerifying(true);
    try {
      const res = await api.verifyResolution(id, {
        afterImageUrl,
        workOrderId: issue?.workOrders?.[0]?.id,
      });
      if (res.success) {
        setShowVerifyModal(false);
        fetchIssue();
      }
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-10 bg-[#111726] rounded-xl w-1/3" />
        <div className="h-64 bg-[#111726] rounded-2xl" />
        <div className="h-96 bg-[#111726] rounded-2xl" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="text-center py-16 bg-[#111726] border border-[#1F2C47] rounded-2xl p-8 space-y-4">
        <AlertOctagon className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Issue Not Found</h2>
        <p className="text-xs text-slate-400">{error || `Incident #${id} could not be located.`}</p>
        <Link
          to="/issues"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161F33] text-teal-400 font-semibold text-xs border border-[#1F2C47]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Issues
        </Link>
      </div>
    );
  }

  const prio = getPriorityColor(issue.priorityBand);
  const stat = getStatusBadge(issue.status);
  const activeWorkOrder = issue.workOrders?.[0];
  const activeVerification = issue.verifications?.[0];

  return (
    <div className="space-y-8 py-2">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2C47]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/issues" className="text-xs text-slate-400 hover:text-white transition">
              ← Issues
            </Link>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-xs text-teal-400 font-bold">#{issue.id}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {issue.canonicalSummary}
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            {issue.locationName} (Radius: {issue.affectedRadius}m)
          </p>
        </div>

        {/* Priority & Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${prio.bg} ${prio.text} ${prio.border}`}
          >
            {issue.priorityBand} ({issue.priorityScore}/100)
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${stat.color}`}>
            {stat.label}
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Map, AI Analysis, Evidence, Corroboration */}
        <div className="lg:col-span-2 space-y-8">
          {/* Interactive Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                Geospatial Incident Zone
              </span>
              <span className="font-mono text-slate-400">
                GPS: {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
              </span>
            </div>
            <InteractiveMap
              issues={[issue]}
              selectedIssueId={issue.id}
              center={[issue.latitude, issue.longitude]}
              zoom={17}
              height="300px"
            />
          </div>

          {/* AI Analysis Summary Card */}
          <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2C47]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  AI Structural Analysis & Inferences
                </h3>
              </div>
              <span className="text-xs font-mono text-teal-400">
                {Math.round((issue.confidence || 0.9) * 100)}% AI Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#161F33] border border-[#1F2C47]">
                <span className="text-[10px] text-slate-400 font-mono block">Inferred Category</span>
                <span className="font-bold text-white">{issue.canonicalCategory}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#161F33] border border-[#1F2C47]">
                <span className="text-[10px] text-slate-400 font-mono block">Hazard Severity</span>
                <span className="font-bold text-orange-400">{issue.severity} / 10</span>
              </div>
              <div className="p-3 rounded-xl bg-[#161F33] border border-[#1F2C47]">
                <span className="text-[10px] text-slate-400 font-mono block">Signal Sources</span>
                <span className="font-bold text-cyan-400">{issue.signalCount} Multi-modal</span>
              </div>
              <div className="p-3 rounded-xl bg-[#161F33] border border-[#1F2C47]">
                <span className="text-[10px] text-slate-400 font-mono block">First Detected</span>
                <span className="font-bold text-slate-300">
                  {formatRelativeTime(issue.firstDetectedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Corroboration & Multi-modal Evidence (Section 19) */}
          <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2C47]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Multi-Modal Corroboration Signals ({issue.signals?.length || issue.signalCount})
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                PULSE-5 UNIFY
              </span>
            </div>

            <div className="space-y-3">
              {issue.signals?.map((sig: any) => (
                <div
                  key={sig.id}
                  className="p-3.5 rounded-xl bg-[#161F33] border border-[#1F2C47] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#090D16] text-teal-400 border border-[#1F2C47]">
                        {sig.type}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        Source: {sig.source}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {formatDate(sig.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{sig.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Section (Before / After AI comparison) */}
          {activeVerification ? (
            <VerificationDiffViewer
              beforeImageUrl={activeVerification.beforeImageUrl}
              afterImageUrl={activeVerification.afterImageUrl}
              visualChangeScore={activeVerification.visualChangeScore}
              resolutionConfidence={activeVerification.resolutionConfidence}
              detectedBeforeState={activeVerification.detectedBeforeState}
              detectedAfterState={activeVerification.detectedAfterState}
              recommendation={activeVerification.recommendation}
              status={activeVerification.status}
            />
          ) : (
            <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F2C47]">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Resolution Verification (Pending)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  EVIDENCE REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                PATCHPULSE requires photographic evidence before closing work orders. An operator or
                technician must upload an "after" photo to initiate AI dual-frame validation.
              </p>
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
              >
                <Camera className="w-4 h-4" />
                Upload After-Repair Evidence & Verify
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Column: Explainable Priority Card & Action Work Order */}
        <div className="space-y-6">
          {/* Explainable Priority Card */}
          <PriorityScoreCard
            score={issue.priorityScore}
            band={issue.priorityBand}
            reasoning={issue.priorityReasoning}
          />

          {/* Actionable Work Order Section (Section 23) */}
          <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2C47]">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">Work Order Dispatch</h3>
              </div>
              {activeWorkOrder && (
                <span className="text-xs font-mono text-teal-400 font-bold">
                  #{activeWorkOrder.id}
                </span>
              )}
            </div>

            {activeWorkOrder ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#161F33] rounded-xl border border-[#1F2C47] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Team:</span>
                    <span className="text-white font-semibold">{activeWorkOrder.requiredTeam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Technician:</span>
                    <span className="text-teal-400 font-semibold">
                      {activeWorkOrder.assignedToUser?.name || 'Manoj Kumar'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {activeWorkOrder.status}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 bg-[#090D16] p-3 rounded-lg border border-[#1F2C47]">
                  <strong>Recommended Action:</strong> {activeWorkOrder.recommendedAction}
                </p>

                <div className="flex gap-2">
                  <Link
                    to={`/work-orders/${activeWorkOrder.id}`}
                    className="flex-1 text-center py-2.5 rounded-xl bg-[#161F33] hover:bg-[#1F2C47] text-white font-semibold text-xs border border-[#1F2C47] transition"
                  >
                    Manage Work Order →
                  </Link>
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
                  >
                    Verify Repair
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  No work order has been generated for this incident yet. Generate one with
                  AI-recommended equipment and team dispatch.
                </p>
                <button
                  onClick={() => setShowWoModal(true)}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Generate Actionable Work Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Generate Work Order */}
      {showWoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateWorkOrder}
            className="max-w-md w-full bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">Generate Work Order for #{issue.id}</h3>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Work Order Summary</label>
              <input
                type="text"
                value={woSummary}
                onChange={(e) => setWoSummary(e.target.value)}
                placeholder={`Repair: ${issue.canonicalSummary}`}
                className="w-full bg-[#161F33] border border-[#1F2C47] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Required Team</label>
              <select
                value={woTeam}
                onChange={(e) => setWoTeam(e.target.value)}
                className="w-full bg-[#161F33] border border-[#1F2C47] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Electrical Maintenance Unit 2">Electrical Maintenance Unit 2</option>
                <option value="Civil Road Maintenance Squad">Civil Road Maintenance Squad</option>
                <option value="Civil Hydraulics Rapid Response">Civil Hydraulics Rapid Response</option>
                <option value="Sanitation Rapid Response">Sanitation Rapid Response</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-3">
              <button
                type="button"
                onClick={() => setShowWoModal(false)}
                className="px-4 py-2 rounded-xl bg-[#161F33] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={woSubmitting}
                className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold"
              >
                {woSubmitting ? 'Generating...' : 'Dispatch Order'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Verify Resolution (Section 25) */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleVerify}
            className="max-w-md w-full bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">
              AI Before/After Resolution Verification
            </h3>
            <p className="text-xs text-slate-400">
              Upload or link an after-repair photo. AI will inspect visual change, lux readings, and
              fixture integrity.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">After-Repair Photo URL</label>
              <input
                type="url"
                required
                value={afterImageUrl}
                onChange={(e) => setAfterImageUrl(e.target.value)}
                className="w-full bg-[#161F33] border border-[#1F2C47] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="rounded-xl overflow-hidden aspect-video border border-[#1F2C47] max-h-40">
              <img src={afterImageUrl} alt="After repair preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 justify-end pt-3">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 rounded-xl bg-[#161F33] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifying}
                className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold"
              >
                {verifying ? 'Running AI Vision...' : 'Verify Resolution'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

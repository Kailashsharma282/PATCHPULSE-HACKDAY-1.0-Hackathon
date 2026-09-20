import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function getPriorityColor(band: string | undefined): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (band?.toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dot: 'bg-red-500',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        dot: 'bg-orange-500',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500',
      };
    default:
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-500',
      };
  }
}

export function getStatusBadge(status: string | undefined): {
  label: string;
  color: string;
} {
  switch (status) {
    case 'DETECTED':
      return { label: 'Detected', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    case 'CORROBORATING':
      return { label: 'Corroborating', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
    case 'PRIORITIZED':
      return { label: 'Prioritized', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
    case 'ASSIGNED':
      return { label: 'Assigned', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
    case 'RESOLVED_PENDING_VERIFICATION':
      return { label: 'Pending Verification', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    case 'VERIFIED_RESOLVED':
      return { label: 'Verified Resolved', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    case 'REOPENED':
      return { label: 'Reopened', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
    case 'CLOSED':
      return { label: 'Closed', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
    default:
      return { label: status || 'Unknown', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  }
}

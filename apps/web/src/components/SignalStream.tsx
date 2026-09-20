import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  MessageSquare,
  Mic,
  MapPin,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatRelativeTime } from '../lib/utils';

export const SignalStream: React.FC = () => {
  const [signals, setSignals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSignals = async () => {
    const res = await api.getRecentSignals(15);
    if (res.success && res.data) {
      setSignals(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 5000); // Poll every 5s for live simulation updates
    return () => clearInterval(interval);
  }, []);

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'PHOTO':
        return <Camera className="w-3.5 h-3.5 text-cyan-400" />;
      case 'VOICE':
        return <Mic className="w-3.5 h-3.5 text-purple-400" />;
      case 'LOCATION':
        return <MapPin className="w-3.5 h-3.5 text-emerald-400" />;
      case 'HISTORICAL':
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1F2C47]">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-wide">Live Signal Stream</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
          WEAK SIGNALS INGEST
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-1 max-h-[420px]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#161F33] animate-pulse rounded-xl" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No incoming signals recorded yet.
          </div>
        ) : (
          signals.map((signal) => (
            <div
              key={signal.id}
              className="p-3 bg-[#161F33]/80 hover:bg-[#161F33] border border-[#1F2C47] rounded-xl text-xs transition space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 rounded bg-[#090D16] border border-[#1F2C47]">
                    {getSignalIcon(signal.type)}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-200">
                    {signal.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({Math.round((signal.confidence || 0.9) * 100)}% conf)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatRelativeTime(signal.timestamp || signal.createdAt)}
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                {signal.content}
              </p>

              {signal.issue && (
                <div className="pt-1 flex items-center justify-between border-t border-[#1F2C47]/50">
                  <span className="text-[10px] font-mono text-slate-400">
                    Fused to Issue:
                  </span>
                  <Link
                    to={`/issues/${signal.issue.id}`}
                    className="text-[11px] font-mono text-teal-400 hover:underline flex items-center gap-1"
                  >
                    #{signal.issue.id} • {signal.issue.canonicalCategory}
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

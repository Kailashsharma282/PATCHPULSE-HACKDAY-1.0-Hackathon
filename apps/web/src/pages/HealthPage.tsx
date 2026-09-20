import React, { useEffect, useState } from 'react';
import { HeartPulse, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const HealthPage: React.FC = () => {
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    const res = await api.getHealth();
    if (res.success && res.data) {
      setHealth(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1F2C47]">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-teal-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">System & AI Health</h1>
        </div>
        <button
          onClick={fetchHealth}
          className="p-2 rounded-lg bg-[#111726] hover:bg-[#161F33] text-slate-300 text-xs flex items-center gap-1.5 border border-[#1F2C47]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-[#111726] rounded-2xl animate-pulse" />
      ) : (
        <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1F2C47]">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">OVERALL STATUS</span>
              <p className="text-xl font-bold text-emerald-400 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-5 h-5" />
                ALL SYSTEMS OPERATIONAL
              </p>
            </div>
            <div className="text-right text-xs font-mono text-slate-400">
              Uptime: <span className="text-white">{health?.uptimeSeconds || 0}s</span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {health?.services &&
              Object.entries(health.services).map(([service, details]: any) => (
                <div
                  key={service}
                  className="p-3.5 rounded-xl bg-[#161F33] border border-[#1F2C47] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white uppercase">{service}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {details.provider || details.type || details.mode || ''}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {details.status}
                  </span>
                </div>
              ))}
          </div>

          {/* Hackathon Submission Credentials Verification */}
          <div className="p-4 rounded-xl bg-[#090D16] border border-[#1F2C47] text-xs font-mono space-y-1 text-slate-400">
            <p className="text-slate-300 font-bold">HACKDAY 1.0 — TECH FOR A BETTER TOMORROW</p>
            <p>Participant: Pochiraju Kailash Ram Markandeya Sharma (Solo)</p>
            <p>Team: kailashsharma8 | Project: PATCHPULSE</p>
          </div>
        </div>
      )}
    </div>
  );
};

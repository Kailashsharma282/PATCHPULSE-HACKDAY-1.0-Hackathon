import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Sliders, HeartPulse, ArrowRight } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#1F2C47]">
        <h1 className="text-2xl font-black text-white tracking-tight">System Administration</h1>
        <p className="text-xs text-slate-400">
          Governance console for priority algorithms, user roles, campus zones, and engine health.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/admin/configuration"
          className="p-6 bg-[#111726] border border-[#1F2C47] rounded-2xl hover:border-teal-500/50 transition space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition">
            Scoring & Clustering Weights
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tune the explainable priority equation weights, spatial clustering threshold, and AI mode.
          </p>
          <span className="text-xs text-teal-400 font-semibold inline-flex items-center gap-1">
            Configure Parameters <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 bg-[#111726] border border-[#1F2C47] rounded-2xl hover:border-teal-500/50 transition space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">
            User Role Governance
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage citizen, operator, and administrator roles and dispatch permissions.
          </p>
          <span className="text-xs text-purple-400 font-semibold inline-flex items-center gap-1">
            Manage Users <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/health"
          className="p-6 bg-[#111726] border border-[#1F2C47] rounded-2xl hover:border-teal-500/50 transition space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
            System & AI Health
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect real-time database connections, fallback cache status, and AI mode telemetry.
          </p>
          <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1">
            System Status <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
};

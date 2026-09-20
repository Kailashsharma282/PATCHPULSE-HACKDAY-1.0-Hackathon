import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center p-6">
      <div className="max-w-md w-full bg-[#111726] border border-[#1F2C47] rounded-3xl p-8 shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white font-mono">404</h1>
          <h2 className="text-base font-bold text-slate-200">Page Not Located in Campus Grid</h2>
          <p className="text-xs text-slate-400">
            The requested route does not correspond to an active civic telemetry endpoint.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
        >
          <Home className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

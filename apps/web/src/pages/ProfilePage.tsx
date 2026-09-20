import React from 'react';
import { User, Shield, Building, Mail, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-white tracking-tight pb-3 border-b border-[#1F2C47]">
        User Profile
      </h1>

      <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
            alt={user.name}
            className="w-16 h-16 rounded-full border border-teal-500/40 bg-[#161F33]"
          />
          <div>
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              ROLE: {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-[#1F2C47]">
          <div className="p-3 bg-[#161F33] rounded-xl border border-[#1F2C47] space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">ORGANIZATION</span>
            <span className="font-semibold text-white">Smart Tech University — Central Campus</span>
          </div>
          <div className="p-3 bg-[#161F33] rounded-xl border border-[#1F2C47] space-y-1">
            <span className="text-[10px] text-slate-400 font-mono block">SYSTEM PERMISSIONS</span>
            <span className="font-semibold text-teal-400 font-mono">
              {user.role === 'ADMIN' ? 'FULL_GOVERNANCE_ACCESS' : user.role === 'OPERATOR' ? 'DISPATCH_VERIFY_ACCESS' : 'CITIZEN_REPORT_ACCESS'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertOctagon,
  Wrench,
  MapPin,
  FileText,
  BarChart3,
  PlaySquare,
  ShieldCheck,
  HeartPulse,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isOperator = user?.role === 'OPERATOR' || isAdmin;

  const links = [
    { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard, badge: 'Live' },
    { to: '/issues', label: 'Issue Fingerprints', icon: AlertOctagon },
    { to: '/work-orders', label: 'Work Orders', icon: Wrench },
    { to: '/map', label: 'Geospatial Map', icon: MapPin },
    { to: '/reports', label: 'Raw Signal Reports', icon: FileText },
    { to: '/analytics', label: 'Civic Analytics', icon: BarChart3 },
    { to: '/demo', label: '13-Step Simulation', icon: PlaySquare, badge: 'Demo' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'System Admin', icon: ShieldCheck },
    { to: '/admin/configuration', label: 'Scoring & Weights', icon: Wrench },
    { to: '/health', label: 'System Health', icon: HeartPulse },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Action CTA */}
      <NavLink
        to="/report"
        onClick={onCloseMobile}
        className="mb-6 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs tracking-wide uppercase shadow-lg shadow-teal-500/20 transition transform active:scale-95"
      >
        <Send className="w-4 h-4" />
        Report Signal
      </NavLink>

      {/* Primary Navigation */}
      <div className="space-y-1">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 mb-2">
          Civic Intelligence
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111726]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161F33] text-teal-400 border border-[#1F2C47]">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Admin / Governance links */}
      {isOperator && (
        <div className="space-y-1 mt-8">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 mb-2">
            Governance & Health
          </p>
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#111726]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Hackday 1.0 Footer Info */}
      <div className="mt-auto pt-6 border-t border-[#1F2C47] text-[11px] font-mono text-slate-400">
        <p className="font-semibold text-slate-300">HACKDAY 1.0</p>
        <p className="text-teal-400 truncate">Pochiraju Kailash Ram</p>
        <p className="text-slate-400">Team: kailashsharma8</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-[#090D16] border-r border-[#1F2C47] flex-shrink-0 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 bg-[#090D16] h-full shadow-2xl border-r border-[#1F2C47]"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

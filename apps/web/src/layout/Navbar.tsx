import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Bell,
  CheckCircle,
  Play,
  User,
  LogOut,
  ChevronDown,
  Menu,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { user, logout, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoSwitch, setShowDemoSwitch] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications().then((res) => {
        if (res.success && res.data) {
          setNotifications(res.data);
        }
      });
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-16 bg-[#090D16]/95 border-b border-[#1F2C47] sticky top-0 z-40 backdrop-blur px-4 lg:px-8 flex items-center justify-between">
      {/* Brand & Left controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#111726]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="PATCHPULSE" className="w-8 h-8" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider text-white">PATCHPULSE</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                PULSE-5 AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Civic Intelligence Platform</span>
          </div>
        </Link>
      </div>

      {/* Center status pulse indicator */}
      <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#111726] border border-[#1F2C47]">
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
        </div>
        <span className="text-xs font-mono text-slate-300">TELEMETRY: ACTIVE (IIT CAMPUS)</span>
        <span className="text-slate-600">|</span>
        <span className="text-xs text-teal-400 font-mono">0 DUPLICATE NOISE</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Quick Launch Flagship Demo */}
        <Link
          to="/demo"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition shadow-lg shadow-teal-500/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch Demo</span>
        </Link>

        {/* Quick Report CTA for citizens */}
        <Link
          to="/report"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F2C47] hover:bg-[#2A3B5E] text-white text-xs font-medium border border-slate-700 transition"
        >
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>Report Signal</span>
        </Link>

        {/* Notifications Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#111726] relative transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#090D16]" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-[#111726] border border-[#1F2C47] rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1F2C47]">
                  <span className="text-xs font-semibold text-slate-200">Incident Notifications</span>
                  <span className="text-[11px] text-teal-400 font-mono">{unreadCount} New</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No notifications yet</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className="p-2 rounded-lg bg-[#161F33] hover:bg-[#1F2C47] cursor-pointer transition text-xs"
                        onClick={() => {
                          setShowNotifs(false);
                          if (n.link) navigate(n.link);
                        }}
                      >
                        <p className="font-semibold text-slate-200 text-xs mb-1">{n.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="block text-center text-xs text-teal-400 hover:underline pt-2 mt-2 border-t border-[#1F2C47]"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Demo Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowDemoSwitch(!showDemoSwitch)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#111726] border border-[#1F2C47] transition"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-mono">
              {user ? user.role : 'GUEST'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showDemoSwitch && (
            <div className="absolute right-0 mt-2 w-52 bg-[#111726] border border-[#1F2C47] rounded-xl shadow-2xl p-2 z-50">
              <p className="text-[11px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
                Quick Demo Switcher
              </p>
              <button
                onClick={() => {
                  loginAsDemo('ADMIN');
                  setShowDemoSwitch(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-200 hover:bg-[#1F2C47] flex items-center justify-between"
              >
                <span>Dr. Ramesh (Admin)</span>
                <span className="text-[10px] text-teal-400 font-mono">ADMIN</span>
              </button>
              <button
                onClick={() => {
                  loginAsDemo('OPERATOR');
                  setShowDemoSwitch(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-200 hover:bg-[#1F2C47] flex items-center justify-between"
              >
                <span>Vikram (Ops Lead)</span>
                <span className="text-[10px] text-cyan-400 font-mono">OPERATOR</span>
              </button>
              <button
                onClick={() => {
                  loginAsDemo('CITIZEN');
                  setShowDemoSwitch(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-200 hover:bg-[#1F2C47] flex items-center justify-between"
              >
                <span>Ananya (Student)</span>
                <span className="text-[10px] text-emerald-400 font-mono">CITIZEN</span>
              </button>
            </div>
          )}
        </div>

        {/* User Account / Auth Actions */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-teal-500 transition"
            >
              <img
                src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-slate-700 bg-[#161F33]"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111726] border border-[#1F2C47] rounded-xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-[#1F2C47]">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 rounded text-xs text-slate-200 hover:bg-[#1F2C47] flex items-center gap-2 transition"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 rounded text-xs text-slate-200 hover:bg-[#1F2C47] flex items-center gap-2 transition"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 rounded text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#111726] transition font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-1.5 rounded-lg transition font-semibold"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

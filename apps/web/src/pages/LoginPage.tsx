import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'ADMIN' | 'OPERATOR' | 'CITIZEN') => {
    setLoading(true);
    try {
      await loginAsDemo(role);
      navigate('/dashboard');
    } catch {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-2">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to PATCHPULSE</h1>
        <p className="text-xs text-slate-400">
          Civic intelligence & incident verification console
        </p>
      </div>

      {/* 1-Click Demo Accounts Pill Bar */}
      <div className="p-4 bg-[#111726] border border-teal-500/30 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center gap-1.5 text-xs font-mono text-teal-400 font-bold uppercase">
          <Sparkles className="w-4 h-4" />
          Quick Demo Accounts (Hackday 1.0)
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemo('ADMIN')}
            className="p-2 rounded-xl bg-[#161F33] hover:bg-teal-500/20 border border-[#1F2C47] text-left transition"
          >
            <span className="block font-mono text-[10px] text-teal-400 font-bold">ADMIN</span>
            <span className="block text-xs font-semibold text-white">Dr. Ramesh</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemo('OPERATOR')}
            className="p-2 rounded-xl bg-[#161F33] hover:bg-teal-500/20 border border-[#1F2C47] text-left transition"
          >
            <span className="block font-mono text-[10px] text-cyan-400 font-bold">OPERATOR</span>
            <span className="block text-xs font-semibold text-white">Vikram Singh</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemo('CITIZEN')}
            className="p-2 rounded-xl bg-[#161F33] hover:bg-teal-500/20 border border-[#1F2C47] text-left transition"
          >
            <span className="block font-mono text-[10px] text-emerald-400 font-bold">CITIZEN</span>
            <span className="block text-xs font-semibold text-white">Ananya Verma</span>
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="bg-[#111726] border border-[#1F2C47] rounded-2xl p-6 shadow-2xl space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@patchpulse.demo"
              className="w-full bg-[#161F33] border border-[#1F2C47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#161F33] border border-[#1F2C47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/20 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-teal-400 hover:underline font-semibold">
          Create Account
        </Link>
      </div>
    </div>
  );
};

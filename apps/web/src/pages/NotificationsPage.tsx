import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Clock, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    const res = await api.getNotifications();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    await api.markAllNotificationsRead();
    fetchNotifs();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1F2C47]">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Notification Center</h1>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAll}
            className="px-3 py-1.5 rounded-lg bg-[#161F33] hover:bg-[#1F2C47] text-teal-400 text-xs font-semibold flex items-center gap-1.5 transition border border-[#1F2C47]"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#111726] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-[#111726] border border-[#1F2C47] rounded-2xl p-8 space-y-2">
          <p className="text-xs text-slate-400">No notifications in your inbox.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition ${
                n.isRead
                  ? 'bg-[#111726]/60 border-[#1F2C47] text-slate-400'
                  : 'bg-[#111726] border-teal-500/40 text-slate-200 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-white text-sm">{n.title}</span>
                <span className="font-mono text-[10px] text-slate-500">{formatDate(n.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{n.message}</p>
              {n.link && (
                <Link
                  to={n.link}
                  className="text-xs font-semibold text-teal-400 hover:underline inline-flex items-center gap-1"
                >
                  View Incident <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

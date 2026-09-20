import React, { useEffect, useState } from 'react';
import { Users, Shield, Check } from 'lucide-react';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await api.getUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await api.updateUserRole(userId, newRole);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#1F2C47]">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-teal-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">User Governance</h1>
        </div>
        <p className="text-xs text-slate-400">
          Manage campus roles: Citizens (reports), Operators (dispatch & verification), Admins.
        </p>
      </div>

      <div className="bg-[#111726] border border-[#1F2C47] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1F2C47] text-slate-400 font-mono uppercase bg-[#161F33]/40">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Activity</th>
              <th className="p-4">Role Permission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2C47]/50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#161F33]/40 transition">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={u.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt={u.name}
                    className="w-8 h-8 rounded-full border border-slate-700 bg-[#090D16]"
                  />
                  <span className="font-semibold text-white">{u.name}</span>
                </td>
                <td className="p-4 font-mono text-slate-400">{u.email}</td>
                <td className="p-4 font-mono text-slate-300">
                  {u._count?.reports || 0} Reports • {u._count?.workOrders || 0} WOs
                </td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-[#161F33] border border-[#1F2C47] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                  >
                    <option value="CITIZEN">CITIZEN</option>
                    <option value="OPERATOR">OPERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

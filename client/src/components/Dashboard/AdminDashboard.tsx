import React, { useState, useEffect } from 'react';
import { AdminStats, User } from '../../types';
import { Shield, Users, MessageSquare, Cpu, Database, Activity, RefreshCw, X, Radio } from 'lucide-react';
import { fetchAdminStatsFromSupabase, searchUsersInSupabase } from '../../services/supabaseServices';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [s, users] = await Promise.all([
        fetchAdminStatsFromSupabase(),
        searchUsersInSupabase('', ''),
      ]);
      setStats(s);
      setUserList(users);
    } catch (err) {
      console.error('Failed to fetch admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#202c33] rounded-2xl p-6 border border-[#222d34] shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto font-sans">
        <div className="flex items-center justify-between border-b border-[#222d34] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00a884]/20 rounded-xl border border-[#00a884]/40">
              <Shield className="w-6 h-6 text-[#00a884]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#e9edef]">System Health Dashboard</h2>
              <p className="text-xs text-[#8696a0]">Monitor database performance, active users, and real-time message telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              className="p-2 bg-[#111b21] hover:bg-[#2a3942] text-[#00a884] rounded-lg border border-[#222d34] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={onClose} className="p-2 text-[#8696a0] hover:text-[#e9edef] rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#111b21] border border-[#222d34] rounded-xl">
              <div className="flex items-center justify-between text-[#8696a0] text-xs font-medium mb-1">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-[#00a884]" />
              </div>
              <p className="text-2xl font-bold text-[#e9edef]">{stats.totalUsers}</p>
              <p className="text-[11px] text-[#00a884] mt-1 font-medium">{stats.onlineUsers} Active Online</p>
            </div>

            <div className="p-4 bg-[#111b21] border border-[#222d34] rounded-xl">
              <div className="flex items-center justify-between text-[#8696a0] text-xs font-medium mb-1">
                <span>Total Messages</span>
                <MessageSquare className="w-4 h-4 text-[#53bdeb]" />
              </div>
              <p className="text-2xl font-bold text-[#e9edef]">{stats.totalMessages}</p>
              <p className="text-[11px] text-[#8696a0] mt-1">{stats.totalConversations} Channels</p>
            </div>

            <div className="p-4 bg-[#111b21] border border-[#222d34] rounded-xl">
              <div className="flex items-center justify-between text-[#8696a0] text-xs font-medium mb-1">
                <span>Server Node</span>
                <Cpu className="w-4 h-4 text-[#00a884]" />
              </div>
              <p className="text-base font-bold text-[#e9edef] truncate">{stats.serverNode}</p>
              <p className="text-[11px] text-[#00a884] mt-1 font-mono">Status: Connected</p>
            </div>

            <div className="p-4 bg-[#111b21] border border-[#222d34] rounded-xl">
              <div className="flex items-center justify-between text-[#8696a0] text-xs font-medium mb-1">
                <span>Database Status</span>
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs font-bold text-[#00a884] truncate mt-1">{stats.dbStatus}</p>
              <p className="text-[10px] text-[#8696a0] mt-1 truncate">
                {stats.pubSubStatus?.mode || 'Active'}
              </p>
            </div>
          </div>
        )}

        {/* Realtime Engine Info */}
        <div className="p-4 bg-[#111b21] border border-[#222d34] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-[#00a884] animate-pulse" />
            <div>
              <h4 className="text-xs font-semibold text-[#e9edef]">Realtime Messaging Engine Active</h4>
              <p className="text-[11px] text-[#8696a0]">
                WebSocket subscriptions and database change capture streaming instantly.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] text-xs font-medium rounded-full flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> 99.9% Uptime
          </span>
        </div>

        {/* Registered Users Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#e9edef] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00a884]" /> Registered System Users ({userList.length})
          </h3>

          <div className="overflow-x-auto border border-[#222d34] rounded-xl bg-[#111b21]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#202c33] text-[#8696a0] border-b border-[#222d34]">
                <tr>
                  <th className="p-3 font-semibold">User</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222d34] text-[#e9edef]">
                {userList.map((u) => (
                  <tr key={u._id} className="hover:bg-[#202c33] transition-colors">
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="font-semibold block">{u.name}</span>
                        <span className="text-[10px] text-[#8696a0]">@{u.username}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[#8696a0]">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40' : 'bg-[#202c33] text-[#8696a0]'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          u.status === 'online' ? 'text-[#00a884]' : 'text-[#8696a0]'
                        }`}
                      >
                        ● {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

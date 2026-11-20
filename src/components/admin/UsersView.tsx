import React, {useState, useEffect, useMemo} from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ExternalLink,
  FolderHeart,
  Globe,
  Loader2,
  Mail,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import {fiwiApi} from '../../lib/api';
import {useFiwiStore} from '../../stores/useFiwiStore';
import type {UserManagementRecord} from '../../types/fiwi';

interface UsersViewProps {
  onRefreshStats: () => void;
}

export default function UsersView({onRefreshStats}: UsersViewProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);
  const openConfirm = useFiwiStore((s) => s.openConfirm);

  const [users, setUsers] = useState<UserManagementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const [busyId, setBusyId] = useState<string | null>(null);

  // Suspension Modal state
  const [suspendingUser, setSuspendingUser] = useState<UserManagementRecord | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fiwiApi.adminGetUsers();
      setUsers(res.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleOpenSuspendModal = (user: UserManagementRecord) => {
    setSuspendingUser(user);
    setSuspensionReason(user.suspensionReason || '');
  };

  const handleConfirmSuspend = async () => {
    if (!suspendingUser) return;
    setBusyId(suspendingUser.id);
    try {
      await fiwiApi.adminSuspendUser(suspendingUser.id, suspensionReason.trim());
      pushToast({
        title: 'Account suspended',
        description: `Access blocked for ${suspendingUser.username}.`,
        tone: 'info',
      });
      setSuspendingUser(null);
      await loadUsers();
      onRefreshStats();
    } catch (err) {
      pushToast({
        title: 'Suspension failed',
        description: err instanceof Error ? err.message : 'Error suspending user',
        tone: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleUnsuspend = async (user: UserManagementRecord) => {
    setBusyId(user.id);
    try {
      await fiwiApi.adminUnsuspendUser(user.id);
      pushToast({
        title: 'Account unsuspended',
        description: `Full access restored for ${user.username}.`,
        tone: 'success',
      });
      await loadUsers();
      onRefreshStats();
    } catch (err) {
      pushToast({
        title: 'Action failed',
        description: err instanceof Error ? err.message : 'Error unsuspending user',
        tone: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteUser = (user: UserManagementRecord) => {
    openConfirm({
      title: 'Permanently delete user account?',
      message: `Are you sure you want to delete ${user.username} (${user.email})? This permanently purges their profile, submissions, and auth account.`,
      confirmLabel: 'Delete User Account',
      destructive: true,
      onConfirm: async () => {
        setBusyId(user.id);
        try {
          await fiwiApi.adminDeleteUser(user.id);
          pushToast({title: 'User account permanently deleted', tone: 'info'});
          await loadUsers();
          onRefreshStats();
        } catch (err) {
          pushToast({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Error deleting account',
            tone: 'error',
          });
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter === 'active' && u.isSuspended) return false;
      if (statusFilter === 'suspended' && !u.isSuspended) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUsername = u.username.toLowerCase().includes(q);
        const matchesEmail = u.email ? u.email.toLowerCase().includes(q) : false;
        const matchesName = u.displayName ? u.displayName.toLowerCase().includes(q) : false;
        if (!matchesUsername && !matchesEmail && !matchesName) return false;
      }
      return true;
    });
  }, [users, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#1020F5] text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'active'
                  ? 'bg-[#1020F5] text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Active ({users.filter((u) => !u.isSuspended).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('suspended')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'suspended'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Suspended ({users.filter((u) => u.isSuspended).length})
            </button>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white transition-colors"
            title="Reload user list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, email, name..."
            className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-[#1020F5]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-white/50 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#93C5FD]" />
            <span>Loading user registry from Supabase...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-xs">
            {error}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email &amp; Verification</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const isBusy = busyId === u.id;
                  const isSuperAdmin = u.email === 'notmesubh@gmail.com';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Avatar and Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              u.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{u.displayName || u.username}</span>
                              {isSuperAdmin && (
                                <span className="px-1.5 py-0.2 rounded bg-[#1020F5]/20 text-[#93C5FD] border border-[#1020F5]/40 text-[9px] font-bold">
                                  ROOT ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-white/40 font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email & Verification */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[180px]">{u.email || 'No email registered'}</span>
                          {u.emailVerified ? (
                            <span title="Email Verified">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            </span>
                          ) : (
                            <span title="Unverified">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-white/[0.05] border border-white/10 text-white/80">
                          {u.plan}
                        </span>
                      </td>

                      {/* Submissions & Collections */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] space-y-0.5 text-white/60">
                          <div>
                            Submissions:{' '}
                            <span className="font-semibold text-white">
                              {u.approvedCount || 0} / {u.submissionsCount || 0}
                            </span>
                          </div>
                          <div>
                            Collections:{' '}
                            <span className="font-semibold text-white">
                              {u.collectionsCount || 0}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.isSuspended ? (
                          <div className="flex flex-col">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 w-fit">
                              Suspended
                            </span>
                            {u.suspensionReason && (
                              <span className="text-[10px] text-rose-400/80 truncate max-w-[120px] mt-0.5" title={u.suspensionReason}>
                                {u.suspensionReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-[11px] text-white/50">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {!isSuperAdmin && (
                          <div className="flex items-center justify-end gap-1.5">
                            {u.isSuspended ? (
                              <button
                                type="button"
                                onClick={() => handleUnsuspend(u)}
                                disabled={isBusy}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors disabled:opacity-50"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenSuspendModal(u)}
                                disabled={isBusy}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold transition-colors disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              disabled={isBusy}
                              className="p-1 rounded-lg text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-white/50">
            No registered users found matching the query.
          </div>
        )}
      </div>

      {/* Suspend Account Modal */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#05081E] border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Ban className="w-4 h-4" />
                <span>Suspend User Account</span>
              </div>
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/70">
              Suspending <span className="font-semibold text-white">{suspendingUser.username}</span> will
              immediately revoke all active sessions and block any subsequent API requests through
              server-enforced security middleware.
            </p>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Reason for Suspension (Visible to Admin &amp; User upon login)
              </label>
              <input
                type="text"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g. Terms of service violation, repeated spam submissions..."
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                disabled={busyId !== null}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Suspension</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
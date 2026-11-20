import React, {useState, useEffect, useMemo} from 'react';
import {
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  ScrollText,
  Search,
  Shield,
  User,
} from 'lucide-react';
import {fiwiApi} from '../../lib/api';
import type {AdminAuditLog} from '../../types/fiwi';

export default function ActivityLogsView() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fiwiApi.adminGetLogs();
      setLogs(res.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesTarget = log.targetId ? log.targetId.toLowerCase().includes(q) : false;
        const matchesAdmin = log.adminEmail.toLowerCase().includes(q);
        const matchesDetails = JSON.stringify(log.details || {}).toLowerCase().includes(q);
        if (!matchesAction && !matchesTarget && !matchesAdmin && !matchesDetails) return false;
      }
      return true;
    });
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <ScrollText className="w-4 h-4 text-[#93C5FD]" />
            <span>Immutable Security Trail:</span>
            <span className="font-bold text-white">{logs.length} logged events</span>
          </div>
          <button
            type="button"
            onClick={loadLogs}
            disabled={loading}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white transition-colors"
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
            placeholder="Search by action, target, or detail..."
            className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-[#1020F5]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-white/50 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#93C5FD]" />
            <span>Loading security audit records...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-xs">{error}</div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Admin Principal</th>
                  <th className="py-3 px-4">Context Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-white/50 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    {/* Action Tag */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-[#1020F5]/20 text-[#93C5FD] border border-[#1020F5]/30 font-bold">
                        {log.action}
                      </span>
                    </td>

                    {/* Target Resource */}
                    <td className="py-3 px-4 text-white/70">
                      {log.targetType}:{' '}
                      <span className="text-white font-medium">
                        {log.targetId ? log.targetId.slice(0, 14) : 'Platform'}
                      </span>
                    </td>

                    {/* Admin Principal */}
                    <td className="py-3 px-4 text-emerald-400 font-sans">
                      {log.adminEmail}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-white/60 font-sans max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-white/50">
            No audit logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
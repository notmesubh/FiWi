import React, {useState, useMemo} from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import {fiwiApi} from '../../lib/api';
import {useFiwiStore} from '../../stores/useFiwiStore';
import type {WebsiteReportRecord} from '../../types/fiwi';

interface ReportsViewProps {
  reports: WebsiteReportRecord[];
  onRefresh: () => void;
}

export default function ReportsView({reports, onRefresh}: ReportsViewProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);
  const openConfirm = useFiwiStore((s) => s.openConfirm);

  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'reviewing' | 'resolved' | 'dismissed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Resolution modal state
  const [selectedReport, setSelectedReport] = useState<WebsiteReportRecord | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<WebsiteReportRecord['status']>('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const openResolutionModal = (report: WebsiteReportRecord) => {
    setSelectedReport(report);
    setResolutionStatus(report.status === 'open' ? 'resolved' : report.status);
    setResolutionNotes(report.resolutionNotes || '');
  };

  const handleSaveResolution = async () => {
    if (!selectedReport) return;
    setBusyId(selectedReport.id);
    try {
      await fiwiApi.adminUpdateReport(selectedReport.id, {
        status: resolutionStatus,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
      pushToast({
        title: `Report marked as ${resolutionStatus}`,
        tone: 'success',
      });
      setSelectedReport(null);
      onRefresh();
    } catch (err) {
      pushToast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Error updating report',
        tone: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteReportedWebsite = (websiteId: string, websiteTitle?: string) => {
    openConfirm({
      title: 'Delete reported website?',
      message: `Permanently delete "${websiteTitle || 'this website'}" from the public library? This will also remove the problematic content flagged by users.`,
      confirmLabel: 'Delete Website',
      destructive: true,
      onConfirm: async () => {
        try {
          await fiwiApi.adminDeleteWebsite(websiteId);
          pushToast({title: 'Problematic website deleted', tone: 'info'});
          onRefresh();
        } catch (err) {
          pushToast({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Could not delete',
            tone: 'error',
          });
        }
      },
    });
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesReason = r.reason.toLowerCase().includes(q);
        const matchesDetails = r.details.toLowerCase().includes(q);
        const matchesTitle = r.websiteTitle ? r.websiteTitle.toLowerCase().includes(q) : false;
        const matchesReporter = r.reporterHandle ? r.reporterHandle.toLowerCase().includes(q) : false;
        if (!matchesReason && !matchesDetails && !matchesTitle && !matchesReporter) return false;
      }
      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex flex-wrap items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
          {(['all', 'open', 'reviewing', 'resolved', 'dismissed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-[#1020F5] text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'all' ? `All (${reports.length})` : tab}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by reason, details..."
            className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-[#1020F5]"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
        {filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Flagged Subject</th>
                  <th className="py-3 px-4">Reason &amp; Description</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReports.map((report) => {
                  const isBusy = busyId === report.id;

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Flagged Website / Submission */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white truncate max-w-[180px]">
                            {report.websiteTitle || 'Unknown / Deleted Resource'}
                          </span>
                          {report.websiteId && (
                            <span className="text-[10px] text-white/40 font-mono">
                              ID: {report.websiteId.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reason & Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-sm">
                          <span className="font-semibold text-amber-300 block">
                            {report.reason}
                          </span>
                          <p className="text-[11px] text-white/60 line-clamp-2">
                            {report.details || 'No additional details provided.'}
                          </p>
                          {report.resolutionNotes && (
                            <div className="mt-1 text-[10px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                              Resolution: {report.resolutionNotes}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Reporter */}
                      <td className="py-3.5 px-4 text-white/70">
                        {report.reporterHandle || 'Anonymous'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            report.status === 'open'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : report.status === 'reviewing'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : report.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[11px] text-white/50">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openResolutionModal(report)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-white text-xs font-medium transition-colors"
                          >
                            Resolve / Update
                          </button>

                          {report.websiteId && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteReportedWebsite(report.websiteId!, report.websiteTitle)
                              }
                              className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                              title="Delete flagged website"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-white/50">
            No community reports found. Safety queue is clean!
          </div>
        )}
      </div>

      {/* Report Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#05081E] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Update Report Status</h3>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-white/60">
                Reason: <span className="font-semibold text-white">{selectedReport.reason}</span>
              </div>
              <p className="text-white/50 text-[11px] p-2 rounded bg-white/[0.03] border border-white/5">
                {selectedReport.details || 'No additional details.'}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1">Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#05081E] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                >
                  <option value="open">Open (Unresolved)</option>
                  <option value="reviewing">Under Investigation</option>
                  <option value="resolved">Resolved (Action Taken)</option>
                  <option value="dismissed">Dismissed (No Action Required)</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 mb-1">Resolution Notes</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain resolution or dismissal rationale..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveResolution}
                disabled={busyId !== null}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1020F5] hover:bg-[#1020F5]/80 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
              >
                <span>Save Resolution</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
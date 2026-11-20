import React, {useState, useMemo} from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  Filter,
  Globe,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import {fiwiApi} from '../../lib/api';
import {useFiwiStore} from '../../stores/useFiwiStore';
import type {SiteCategory, SubmissionStatus, WebsiteSubmissionRecord} from '../../types/fiwi';

interface SubmissionsViewProps {
  submissions: WebsiteSubmissionRecord[];
  onOpenReview: (submission: WebsiteSubmissionRecord) => void;
  onRefresh: () => void;
  initialFilter?: string;
}

type SubmissionFilterTab = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'changes_requested';

export default function SubmissionsView({
  submissions,
  onOpenReview,
  onRefresh,
  initialFilter,
}: SubmissionsViewProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);
  const openConfirm = useFiwiStore((s) => s.openConfirm);

  const [activeTab, setActiveTab] = useState<SubmissionFilterTab>(
    (initialFilter as SubmissionFilterTab) || 'all',
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Tab filter
      if (activeTab !== 'all' && sub.status !== activeTab) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && sub.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = sub.title.toLowerCase().includes(q);
        const matchesUrl = sub.url.toLowerCase().includes(q);
        const matchesDesc = sub.description.toLowerCase().includes(q);
        const matchesAuthor =
          (sub.authorUsername && sub.authorUsername.toLowerCase().includes(q)) ||
          (sub.submitterEmail && sub.submitterEmail.toLowerCase().includes(q));
        if (!matchesTitle && !matchesUrl && !matchesDesc && !matchesAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [submissions, activeTab, categoryFilter, searchQuery]);

  // Bulk selection helpers
  const allFilteredSelected =
    filteredSubmissions.length > 0 &&
    filteredSubmissions.every((s) => selectedIds.has(s.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      filteredSubmissions.forEach((s) => next.add(s.id));
      setSelectedIds(next);
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'delete') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const actionText =
      action === 'approve'
        ? 'approve & publish'
        : action === 'reject'
        ? 'reject'
        : 'permanently delete';

    openConfirm({
      title: `Bulk ${action.toUpperCase()} ${ids.length} Submissions?`,
      message: `Are you sure you want to ${actionText} all ${ids.length} selected submission(s)?`,
      confirmLabel: `Confirm Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      destructive: action === 'delete' || action === 'reject',
      onConfirm: async () => {
        setBulkBusy(true);
        try {
          const res = await fiwiApi.adminBulkModerateSubmissions(ids, action);
          pushToast({
            title: `Bulk operation complete`,
            description: `Successfully applied ${action} to ${res.count} submission(s).`,
            tone: action === 'approve' ? 'success' : 'info',
          });
          setSelectedIds(new Set());
          onRefresh();
        } catch (err) {
          pushToast({
            title: 'Bulk action failed',
            description: err instanceof Error ? err.message : 'Error executing bulk action',
            tone: 'error',
          });
        } finally {
          setBulkBusy(false);
        }
      },
    });
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Rejected
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Under Review
          </span>
        );
      case 'changes_requested':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
            Changes Requested
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1020F5]/20 text-[#93C5FD] border border-[#1020F5]/30">
            Pending
          </span>
        );
    }
  };

  const getCategoryBadge = (category: SiteCategory) => {
    switch (category) {
      case 'Vibecoded':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Vibecoded
          </span>
        );
      case 'Connect':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Connect
          </span>
        );
      case 'Test':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Test
          </span>
        );
      case 'Normal':
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/10 text-white/80">
            Normal
          </span>
        );
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const underReviewCount = submissions.filter((s) => s.status === 'under_review').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Top Filter Tabs & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-[#1020F5] text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#1020F5] text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-[#1020F5] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('under_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'under_review'
                ? 'bg-amber-600 text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>Under Review</span>
            {underReviewCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                {underReviewCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Category & Search Filter */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#05081E] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
          >
            <option value="all">All Categories</option>
            <option value="Normal">Normal</option>
            <option value="Vibecoded">Vibecoded</option>
            <option value="Connect">Connect</option>
            <option value="Test">Test</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, URL, submitter..."
              className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-[#1020F5]"
            />
          </div>
        </div>
      </div>

      {/* Bulk Selection Bar (Shows when 1+ selected) */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1020F5]/20 border border-[#1020F5]/40 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs text-white font-semibold">
            <span className="w-6 h-6 rounded-lg bg-[#1020F5] flex items-center justify-center text-xs">
              {selectedIds.size}
            </span>
            <span>submission(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkAction('approve')}
              disabled={bulkBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve Selected</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction('reject')}
              disabled={bulkBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject Selected</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction('delete')}
              disabled={bulkBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 rounded-xl text-xs text-white/50 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Submissions Table / Queue */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
        {filteredSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded bg-white/10 border-white/20 text-[#1020F5] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Website &amp; URL</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubmissions.map((sub) => {
                  const isSelected = selectedIds.has(sub.id);

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isSelected ? 'bg-[#1020F5]/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(sub.id)}
                          className="rounded bg-white/10 border-white/20 text-[#1020F5] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Title, Thumbnail & URL */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {sub.thumbnailUrl ? (
                              <img
                                src={sub.thumbnailUrl}
                                alt={sub.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Globe className="w-4 h-4 text-white/30" />
                            )}
                          </div>
                          <div className="truncate max-w-[220px]">
                            <div className="font-semibold text-white truncate flex items-center gap-1.5">
                              <span>{sub.title}</span>
                              {sub.reviewAttempts && sub.reviewAttempts > 1 && (
                                <span className="text-[10px] px-1.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                                  #{sub.reviewAttempts}
                                </span>
                              )}
                            </div>
                            <a
                              href={sub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#93C5FD] hover:underline flex items-center gap-1 truncate"
                            >
                              <span className="truncate">{sub.url}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getCategoryBadge(sub.category)}
                          {sub.tags && sub.tags.length > 0 && (
                            <span className="text-[10px] text-white/40">
                              #{sub.tags[0]}
                              {sub.tags.length > 1 ? ` +${sub.tags.length - 1}` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Submitter */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-white truncate max-w-[140px]">
                            {sub.authorDisplayName || sub.authorUsername || 'Member'}
                          </span>
                          <span className="text-[11px] text-white/40 truncate max-w-[140px]">
                            {sub.submitterEmail || sub.authorHandle || sub.userId.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(sub.status)}</td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[11px] text-white/50">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenReview(sub)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1020F5] hover:bg-[#1020F5]/80 text-white text-xs font-semibold shadow transition-all"
                            title="Open Review Workspace"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-white/40">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-white">No submissions found</div>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              There are no submissions matching your current status tab and filter query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
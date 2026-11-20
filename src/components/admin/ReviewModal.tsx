import React, {useState, useEffect} from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Globe,
  Loader2,
  Lock,
  MessageSquare,
  Radio,
  Save,
  Shield,
  Sparkles,
  Star,
  Trash2,
  User,
  Wifi,
  WifiOff,
  X,
  XCircle,
} from 'lucide-react';
import {fiwiApi} from '../../lib/api';
import {useFiwiStore} from '../../stores/useFiwiStore';
import type {SiteCategory, WebsiteSubmissionRecord} from '../../types/fiwi';

interface ReviewModalProps {
  submission: WebsiteSubmissionRecord;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ReviewModal({
  submission,
  onClose,
  onRefresh,
}: ReviewModalProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);
  const openConfirm = useFiwiStore((s) => s.openConfirm);

  // Action states
  const [busy, setBusy] = useState(false);
  const [actionTab, setActionTab] = useState<'review' | 'edit'>('review');

  // Review inputs
  const [moderationNotes, setModerationNotes] = useState(submission.reviewerNotes || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesNotes, setChangesNotes] = useState(submission.changesRequestedNotes || '');
  const [markFeatured, setMarkFeatured] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState(submission.title);
  const [editUrl, setEditUrl] = useState(submission.url);
  const [editDescription, setEditDescription] = useState(submission.description);
  const [editCategory, setEditCategory] = useState<SiteCategory>(submission.category);
  const [editTags, setEditTags] = useState(submission.tags.join(', '));
  const [editHeroTitle, setEditHeroTitle] = useState(submission.heroTitle || '');

  // Live URL Availability check
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    reachable: boolean;
    statusCode?: number;
    responseTimeMs?: number;
    error?: string;
  } | null>(null);

  // Signed proof url for Test submissions
  const [fetchingProof, setFetchingProof] = useState(false);
  const [signedProofUrl, setSignedProofUrl] = useState<string | null>(null);

  const handleCheckUrl = async () => {
    setCheckingUrl(true);
    setCheckResult(null);
    try {
      const res = await fiwiApi.adminCheckSiteStatus(submission.url);
      setCheckResult(res);
      if (res.reachable) {
        pushToast({
          title: `Website reachable (${res.statusCode})`,
          description: `Responded in ${res.responseTimeMs}ms`,
          tone: 'success',
        });
      } else {
        pushToast({
          title: 'Website unreachable',
          description: res.error || `HTTP ${res.statusCode}`,
          tone: 'error',
        });
      }
    } catch (err) {
      setCheckResult({
        reachable: false,
        error: err instanceof Error ? err.message : 'Check failed',
      });
      pushToast({title: 'Check failed', tone: 'error'});
    } finally {
      setCheckingUrl(false);
    }
  };

  const handleFetchProof = async () => {
    setFetchingProof(true);
    try {
      const res = await fiwiApi.getSubmissionProofUrl(submission.id);
      setSignedProofUrl(res.signedUrl);
    } catch (err) {
      pushToast({
        title: 'Proof generation failed',
        description: err instanceof Error ? err.message : 'Unable to sign URL',
        tone: 'error',
      });
    } finally {
      setFetchingProof(false);
    }
  };

  const handleApprove = async () => {
    setBusy(true);
    try {
      await fiwiApi.moderateSubmission(submission.id, {
        action: 'approve',
        notes: moderationNotes,
        isFeatured: markFeatured,
      });
      pushToast({title: 'Submission approved and published!', tone: 'success'});
      onRefresh();
      onClose();
    } catch (err) {
      pushToast({
        title: 'Approval failed',
        description: err instanceof Error ? err.message : 'Could not approve submission',
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      pushToast({title: 'Rejection reason is required', tone: 'error'});
      return;
    }
    setBusy(true);
    try {
      await fiwiApi.moderateSubmission(submission.id, {
        action: 'reject',
        notes: rejectionReason.trim(),
      });
      pushToast({title: 'Submission marked as rejected', tone: 'info'});
      onRefresh();
      onClose();
    } catch (err) {
      pushToast({
        title: 'Rejection failed',
        description: err instanceof Error ? err.message : 'Could not reject submission',
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!changesNotes.trim()) {
      pushToast({title: 'Please specify the changes required', tone: 'error'});
      return;
    }
    setBusy(true);
    try {
      await fiwiApi.moderateSubmission(submission.id, {
        action: 'changes_requested',
        notes: changesNotes.trim(),
      });
      pushToast({title: 'Changes requested from submitter', tone: 'info'});
      onRefresh();
      onClose();
    } catch (err) {
      pushToast({
        title: 'Request failed',
        description: err instanceof Error ? err.message : 'Failed to request changes',
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleUnderReview = async () => {
    setBusy(true);
    try {
      await fiwiApi.moderateSubmission(submission.id, {
        action: 'under_review',
        notes: moderationNotes,
      });
      pushToast({title: 'Flagged under active review', tone: 'info'});
      onRefresh();
      onClose();
    } catch (err) {
      pushToast({
        title: 'Flagging failed',
        description: err instanceof Error ? err.message : 'Failed to update status',
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editUrl.trim() || !editDescription.trim()) {
      pushToast({title: 'Title, URL, and Description are required', tone: 'error'});
      return;
    }
    setBusy(true);
    try {
      const parsedTags = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await fiwiApi.adminEditSubmission(submission.id, {
        title: editTitle.trim(),
        url: editUrl.trim(),
        description: editDescription.trim(),
        category: editCategory,
        tags: parsedTags,
        heroTitle: editHeroTitle.trim() || undefined,
      });

      pushToast({title: 'Submission metadata saved', tone: 'success'});
      onRefresh();
      setActionTab('review');
    } catch (err) {
      pushToast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Could not save changes',
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    openConfirm({
      title: 'Permanently delete submission?',
      message: `Are you sure you want to delete "${submission.title}"? This cannot be undone.`,
      confirmLabel: 'Delete Submission',
      destructive: true,
      onConfirm: async () => {
        setBusy(true);
        try {
          await fiwiApi.adminDeleteSubmission(submission.id);
          pushToast({title: 'Submission deleted', tone: 'info'});
          onRefresh();
          onClose();
        } catch (err) {
          pushToast({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Could not delete',
            tone: 'error',
          });
          setBusy(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#05081E] border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                submission.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : submission.status === 'rejected'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : submission.status === 'under_review'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : submission.status === 'changes_requested'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'bg-[#1020F5]/20 text-[#93C5FD] border border-[#1020F5]/40'
              }`}
            >
              {submission.status.replace('_', ' ')}
            </span>
            <span className="text-xs text-white/50">
              Submitted {new Date(submission.createdAt).toLocaleDateString()}
            </span>
            {submission.reviewAttempts && submission.reviewAttempts > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                Attempt #{submission.reviewAttempts}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white/[0.05] p-0.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActionTab('review')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  actionTab === 'review'
                    ? 'bg-[#1020F5] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Review Workspace
              </button>
              <button
                type="button"
                onClick={() => setActionTab('edit')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  actionTab === 'edit'
                    ? 'bg-[#1020F5] text-white shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Edit Metadata
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {actionTab === 'edit' ? (
            /* Direct Edit Form */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                <span className="font-semibold">Safe Admin Correction:</span> Edit
                metadata, categories, tags, or description without accidentally triggering
                publication.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Website Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Hero Catchphrase (Optional)
                  </label>
                  <input
                    type="text"
                    value={editHeroTitle}
                    onChange={(e) => setEditHeroTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Target Website URL
                </label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Primary Discovery Section
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as SiteCategory)}
                    className="w-full px-3 py-2 bg-[#05081E] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
                  >
                    <option value="Normal">Normal (Standard Directory)</option>
                    <option value="Vibecoded">Vibecoded (AI-Created)</option>
                    <option value="Connect">Connect (Collaboration)</option>
                    <option value="Test">Test (Paid Testing / Bounty)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionTab('review')}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1020F5] hover:bg-[#1020F5]/80 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Metadata</span>
                </button>
              </div>
            </div>
          ) : (
            /* Review Workspace */
            <>
              {/* Site Overview Banner */}
              <div className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                {/* Thumbnail Preview */}
                <div className="w-full md:w-56 h-36 rounded-xl bg-black/40 border border-white/10 overflow-hidden relative shrink-0 flex items-center justify-center">
                  {submission.thumbnailUrl ? (
                    <img
                      src={submission.thumbnailUrl}
                      alt={submission.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-white/30">
                      <Globe className="w-8 h-8" />
                      <span className="text-[10px]">No Thumbnail</span>
                    </div>
                  )}
                </div>

                {/* Core Info & Live Ping */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        {submission.title}
                      </h2>
                      {submission.heroTitle && (
                        <p className="text-xs text-[#93C5FD] italic">
                          &ldquo;{submission.heroTitle}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-medium text-white/80">
                      {submission.category}
                    </span>
                  </div>

                  <p className="text-xs text-white/70 line-clamp-2">
                    {submission.description}
                  </p>

                  {/* URL Bar & Availability Ping */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <a
                      href={submission.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1020F5]/20 hover:bg-[#1020F5]/30 border border-[#1020F5]/30 text-xs text-[#93C5FD] hover:text-white transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span className="max-w-[200px] truncate">{submission.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCheckUrl}
                      disabled={checkingUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {checkingUrl ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wifi className="w-3.5 h-3.5" />
                      )}
                      <span>Check Availability</span>
                    </button>

                    {checkResult && (
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border ${
                          checkResult.reachable
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {checkResult.reachable ? (
                          <Wifi className="w-3.5 h-3.5" />
                        ) : (
                          <WifiOff className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {checkResult.reachable
                            ? `HTTP ${checkResult.statusCode} (${checkResult.responseTimeMs}ms)`
                            : checkResult.error || 'Unreachable'}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitter Credentials & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    Submitter Profile
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                      <User className="w-4 h-4 text-white/70" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {submission.authorDisplayName || submission.authorUsername || 'Anonymous User'}
                      </div>
                      <div className="text-[11px] text-white/50">
                        {submission.submitterEmail || submission.authorHandle || submission.userId}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    Tags & Classification
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {submission.tags.length > 0 ? (
                      submission.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/40">No tags assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Specialized Category Sections */}
              {submission.category === 'Vibecoded' && submission.vibecoded && (
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Vibecoded AI Provenance</span>
                  </div>
                  {submission.vibecoded.aiTools && submission.vibecoded.aiTools.length > 0 && (
                    <div className="text-xs text-white/80">
                      <span className="text-white/50">AI Tooling: </span>
                      {submission.vibecoded.aiTools.join(', ')}
                    </div>
                  )}
                  {submission.vibecoded.originalPrompt && (
                    <div>
                      <span className="text-[11px] font-semibold text-white/50 block mb-1">
                        Original Prompt
                      </span>
                      <pre className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white/80 whitespace-pre-wrap font-mono">
                        {submission.vibecoded.originalPrompt}
                      </pre>
                    </div>
                  )}
                  {submission.vibecoded.developmentSteps && (
                    <div>
                      <span className="text-[11px] font-semibold text-white/50 block mb-1">
                        Build Steps & Architecture
                      </span>
                      <p className="text-xs text-white/70">
                        {submission.vibecoded.developmentSteps}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {submission.category === 'Test' && submission.test && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Website Testing Bounty Scope</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-white/50">Bounty Reward: </span>
                      <span className="font-bold text-emerald-400">
                        ${submission.test.budgetUsd || 0} USD
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50">Owner Authorized: </span>
                      <span className="font-semibold text-white">
                        {submission.test.ownerAuthorized ? 'Yes (Verified)' : 'No'}
                      </span>
                    </div>
                  </div>
                  {submission.test.testingScope && (
                    <div>
                      <span className="text-[11px] font-semibold text-white/50 block mb-1">
                        Testing Scope
                      </span>
                      <p className="text-xs text-white/80">{submission.test.testingScope}</p>
                    </div>
                  )}
                  {submission.test.authorizationProofPath && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleFetchProof}
                        disabled={fetchingProof}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>
                          {fetchingProof ? 'Generating Signed URL...' : 'View Authorization Proof'}
                        </span>
                      </button>
                      {signedProofUrl && (
                        <div className="mt-2">
                          <a
                            href={signedProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 underline flex items-center gap-1"
                          >
                            <span>Open Signed Document</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {submission.category === 'Connect' && submission.connect && (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
                    <Compass className="w-4 h-4" />
                    <span>Connect Opportunity Details</span>
                  </div>
                  <div className="text-xs text-white/80">
                    <span className="text-white/50">Collaboration Type: </span>
                    {submission.connect.collaborationType}
                  </div>
                  <div className="text-xs text-white/80">
                    <span className="text-white/50">Contact: </span>
                    {submission.connect.contactName} ({submission.connect.contactEmail})
                  </div>
                  {submission.connect.lookingFor && (
                    <p className="text-xs text-white/70">{submission.connect.lookingFor}</p>
                  )}
                </div>
              )}

              {/* Gallery Screenshots */}
              {submission.galleryUrls && submission.galleryUrls.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    Submitted Screenshots ({submission.galleryUrls.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {submission.galleryUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-28 rounded-xl bg-black/40 border border-white/10 overflow-hidden group relative"
                      >
                        <img
                          src={url}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ExternalLink className="w-4 h-4 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderation Controls Area */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    Moderator Actions
                  </h3>
                  <label className="flex items-center gap-2 text-xs text-amber-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={markFeatured}
                      onChange={(e) => setMarkFeatured(e.target.checked)}
                      className="rounded bg-white/10 border-white/20 text-[#1020F5] focus:ring-0"
                    />
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Feature on homepage upon approval</span>
                  </label>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {/* Approve */}
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={busy}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve &amp; Publish</span>
                  </button>

                  {/* Request Changes */}
                  <button
                    type="button"
                    onClick={handleRequestChanges}
                    disabled={busy}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600/30 hover:bg-orange-600/40 border border-orange-500/40 text-orange-200 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Request Changes</span>
                  </button>

                  {/* Flag for Further Review */}
                  <button
                    type="button"
                    onClick={handleUnderReview}
                    disabled={busy}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Flag For Review</span>
                  </button>

                  {/* Reject */}
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={busy}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>

                {/* Rejection / Changes Notes input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-medium text-rose-300 mb-1">
                      Rejection Reason (Required if Rejecting)
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Broken links, duplicate entry, spam..."
                      className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-rose-500/30 text-xs text-white placeholder-white/30 outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-orange-300 mb-1">
                      Required Changes Notes (Required if Requesting Changes)
                    </label>
                    <input
                      type="text"
                      value={changesNotes}
                      onChange={(e) => setChangesNotes(e.target.value)}
                      placeholder="e.g. Please upload higher resolution screenshot..."
                      className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-orange-500/30 text-xs text-white placeholder-white/30 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Internal Moderation Notes */}
                <div>
                  <label className="block text-[11px] font-medium text-white/50 mb-1">
                    Internal Moderator Notes (Visible in Audit Log)
                  </label>
                  <input
                    type="text"
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                    placeholder="Optional internal comments or investigation notes..."
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-[#1020F5]"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Footer with Destructive Actions */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Submission</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors"
          >
            Close Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
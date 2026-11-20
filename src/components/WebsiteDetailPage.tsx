import React, {useState, useMemo, useRef} from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  ExternalLink,
  Flag,
  FolderPlus,
  Globe,
  Heart,
  Mail,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  User,
  X,
} from 'lucide-react';
import type {
  PersonalCollection,
  SavedSite,
  SubmittedSite,
  FiwiUser,
} from '../types/fiwi';
import {fiwiApi} from '../lib/api';
import {useFiwiStore} from '../stores/useFiwiStore';
import {SiteCard} from './SiteCard';

interface WebsiteDetailPageProps {
  site: SubmittedSite;
  allSites: SubmittedSite[];
  savedRecord: SavedSite | null;
  isLoggedIn: boolean;
  user: FiwiUser | null;
  collections: PersonalCollection[];
  savedCount: number;
  saveLimit: number;
  planLabel: string;
  onBack: () => void;
  onOpenSite: (site: SubmittedSite) => void;
  onOpenProfile?: (username: string) => void;
  onToggleLike?: (site: SubmittedSite) => Promise<void> | void;
  onToggleCollection: (site: SubmittedSite, collectionId: string) => Promise<void> | void;
  onUpdateSavedCollections: (savedSiteId: string, collectionIds: string[]) => Promise<void> | void;
  onCreateCollectionAndAssign: (
    name: string,
    site: SubmittedSite,
    savedRecord: SavedSite | null,
  ) => Promise<string | null> | string | null;
  onRequireAuth: () => void;
  onOpenPricing: () => void;
}

export default function WebsiteDetailPage({
  site,
  allSites,
  savedRecord,
  isLoggedIn,
  user,
  collections,
  savedCount,
  saveLimit,
  planLabel,
  onBack,
  onOpenSite,
  onOpenProfile,
  onToggleLike,
  onToggleCollection,
  onUpdateSavedCollections,
  onCreateCollectionAndAssign,
  onRequireAuth,
  onOpenPricing,
}: WebsiteDetailPageProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);

  // Active gallery screenshot
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | null>(null);

  // Copy states
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Collection picker dropdown state
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);

  // Reporting modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('broken');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const isSaved = Boolean(savedRecord);
  const assignedCollectionIds = useMemo(() => {
    return new Set(savedRecord?.collectionIds ?? []);
  }, [savedRecord]);

  // Gallery items
  const galleryItems = useMemo(() => {
    const urls: string[] = [];
    const heroThumb =
      site.media?.hero?.previewUrl ||
      site.media?.hero?.publicUrl ||
      site.thumbnailUrl ||
      site.screenshotUrl;
    if (heroThumb) urls.push(heroThumb);

    if (site.media?.gallery) {
      site.media.gallery.forEach((g) => {
        const u = g.previewUrl || g.publicUrl;
        if (u && !urls.includes(u)) urls.push(u);
      });
    }
    return urls;
  }, [site]);

  const currentDisplayImage = activeMediaUrl || galleryItems[0] || null;

  // Intelligent recommendations: same category, matching tags, or top liked
  const recommendedSites = useMemo(() => {
    return allSites
      .filter((s) => s.id !== site.id)
      .sort((a, b) => {
        // Boost same category
        const aCat = a.category === site.category ? 2 : 0;
        const bCat = b.category === site.category ? 2 : 0;
        // Boost shared tags
        const aTags = a.tags.filter((t) => site.tags.includes(t)).length;
        const bTags = b.tags.filter((t) => site.tags.includes(t)).length;
        return (bCat + bTags) - (aCat + aTags);
      })
      .slice(0, 4);
  }, [allSites, site]);

  const handleCopyPrompt = async () => {
    if (!site.vibecoded?.originalPrompt) return;
    try {
      await navigator.clipboard.writeText(site.vibecoded.originalPrompt);
      setCopiedPrompt(true);
      pushToast({title: 'Prompt copied to clipboard', tone: 'success'});
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      pushToast({title: 'Failed to copy prompt', tone: 'error'});
    }
  };

  const handleShareLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/#site/${site.slug || site.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      pushToast({title: 'Link copied to clipboard', tone: 'success'});
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      pushToast({title: 'Failed to copy share link', tone: 'error'});
    }
  };

  const handleSaveToggle = () => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    if (collections.length === 0) {
      // Create default collection
      void onCreateCollectionAndAssign('Favorites', site, savedRecord);
      return;
    }
    setShowCollectionPicker(!showCollectionPicker);
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setCreatingCollection(true);
    try {
      await onCreateCollectionAndAssign(newCollectionName.trim(), site, savedRecord);
      setNewCollectionName('');
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      await fiwiApi.reportWebsite(site.id, reportReason, reportDetails.trim());
      pushToast({title: 'Report submitted. Thank you for keeping FiWi safe.', tone: 'success'});
      setShowReportModal(false);
      setReportDetails('');
    } catch (err) {
      pushToast({
        title: 'Report submission failed',
        description: err instanceof Error ? err.message : 'Please try again later.',
        tone: 'error',
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#02031A] text-white flex flex-col items-center">
      {/* Top Header / Breadcrumb Bar */}
      <div className="w-full max-w-[1240px] px-4 sm:px-8 pt-8 pb-4 flex items-center justify-between border-b border-white/10 text-xs">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="font-medium text-[13px]">Back to Directory</span>
        </button>

        <div className="flex items-center gap-2 text-white/50 mono text-[11px] uppercase tracking-wider">
          <span>{site.category}</span>
          <span>/</span>
          {site.subCategory && (
            <>
              <span>{site.subCategory}</span>
              <span>/</span>
            </>
          )}
          <span className="text-white truncate max-w-[150px]">{site.title}</span>
        </div>
      </div>

      {/* Main Content Showcase */}
      <main className="w-full max-w-[1240px] px-4 sm:px-8 py-8 space-y-10">
        {/* Title, Author & Action Buttons Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#1020F5]/25 text-[#93C5FD] border border-[#1020F5]/40">
                {site.category}
              </span>
              {site.subCategory && (
                <span className="text-xs text-white/60 font-medium">
                  {site.subCategory}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-none">
              {site.title}
            </h1>

            {site.heroTitle && (
              <p className="text-sm sm:text-base text-white/70 max-w-2xl font-light italic">
                &ldquo;{site.heroTitle}&rdquo;
              </p>
            )}

            {/* Author Profile Tag */}
            {site.authorUsername && (
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenProfile?.(site.authorUsername)}
                  className="flex items-center gap-2 text-xs text-white/70 hover:text-white group transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-white">
                    {site.authorDisplayName ? site.authorDisplayName.charAt(0) : 'U'}
                  </div>
                  <span>by <strong className="font-medium text-white group-hover:underline">{site.authorDisplayName || site.authorUsername}</strong> ({site.authorHandle})</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Visit Website Primary Button */}
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1020F5] hover:bg-[#1020F5]/85 text-white text-xs font-bold shadow-lg shadow-[#1020F5]/30 transition-all hover:scale-[1.02]"
            >
              <span>Visit Website</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            {/* Like Button */}
            <button
              type="button"
              onClick={() => onToggleLike?.(site)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                site.viewerHasLiked
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-white/[0.04] text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Heart
                className="w-4 h-4"
                fill={site.viewerHasLiked ? 'currentColor' : 'none'}
              />
              <span className="tabular-nums">{site.likesCount || 0}</span>
            </button>

            {/* Save / Bookmark Button */}
            <div className="relative">
              <button
                type="button"
                onClick={handleSaveToggle}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isSaved
                    ? 'bg-[#1020F5]/25 text-[#93C5FD] border-[#1020F5]/50'
                    : 'bg-white/[0.04] text-white/80 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Collection Dropdown Selector */}
              {showCollectionPicker && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-2xl bg-[#070B24] border border-white/15 shadow-2xl z-30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white">Save to collection</span>
                    <button
                      type="button"
                      onClick={() => setShowCollectionPicker(false)}
                      className="p-1 text-white/40 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {collections.map((col) => {
                      const isAssigned = assignedCollectionIds.has(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            void onToggleCollection(site, col.id);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isAssigned
                              ? 'bg-[#1020F5] text-white'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{col.name}</span>
                          {isAssigned && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>

                  <form onSubmit={handleCreateCollection} className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="New collection name..."
                      className="flex-1 px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-lg text-xs text-white placeholder-white/40 outline-none focus:border-[#1020F5]"
                    />
                    <button
                      type="submit"
                      disabled={creatingCollection}
                      className="px-2.5 py-1 bg-[#1020F5] text-white rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShareLink}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
              title="Share website link"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Report Button */}
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/10 text-white/50 hover:text-rose-400 transition-colors"
              title="Report issue"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary High-Resolution Screenshot Showcase */}
        <div className="w-full rounded-2xl overflow-hidden bg-[#0A0D28] border border-white/15 shadow-2xl relative group">
          {/* Subtle browser mockup top header bar */}
          <div className="h-10 px-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <div className="px-4 py-0.5 rounded-full bg-black/40 border border-white/5 text-[11px] text-white/40 font-mono truncate max-w-sm">
              {site.url}
            </div>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Screenshot Display */}
          <div className="w-full aspect-[16/10] bg-black/50 relative overflow-hidden flex items-center justify-center">
            {currentDisplayImage ? (
              <img
                src={currentDisplayImage}
                alt={site.title}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/30 p-12">
                <Globe className="w-16 h-16" />
                <span className="text-xs uppercase tracking-widest font-mono">No Preview Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Thumbnails Strip (if multiple screenshots exist) */}
        {galleryItems.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
            {galleryItems.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMediaUrl(url)}
                className={`w-28 h-18 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                  currentDisplayImage === url
                    ? 'border-[#1020F5] ring-2 ring-[#1020F5]/50 scale-105'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Website Information & Provenance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Left Column: Description & Metadata */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mono">
                About this website
              </h2>
              <p className="text-base text-white/80 leading-relaxed whitespace-pre-line font-sans">
                {site.description}
              </p>
            </div>

            {/* Tags */}
            {site.tags && site.tags.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mono">
                  Tags &amp; Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {site.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specialized Section: Vibecoded AI Provenance */}
            {site.category === 'Vibecoded' && site.vibecoded && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/30 to-purple-900/10 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI Vibe Coding Architecture</span>
                  </div>
                  {site.vibecoded.originalPrompt && (
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-colors"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                    </button>
                  )}
                </div>

                {/* AI Tools Used */}
                {site.vibecoded.aiTools && site.vibecoded.aiTools.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block">
                      AI Tools &amp; Engines
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {site.vibecoded.aiTools.map((tool) => (
                        <div
                          key={tool}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white flex items-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt */}
                {site.vibecoded.originalPrompt && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block">
                      Generation Prompt
                    </span>
                    <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white/80 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {site.vibecoded.originalPrompt}
                    </div>
                  </div>
                )}

                {/* Development Steps */}
                {site.vibecoded.developmentSteps && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block">
                      Build Steps &amp; Tech Stack
                    </span>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {site.vibecoded.developmentSteps}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Specialized Section: Connect Collaboration */}
            {site.category === 'Connect' && site.contact?.collaborationType && (
              <div className="p-6 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-4">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Collaboration Opportunity</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-white/50 block">Type:</span>
                    <span className="font-semibold text-white capitalize">{site.contact.collaborationType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block">Contact:</span>
                    <span className="font-semibold text-white">{site.contact.email}</span>
                  </div>
                </div>
                {site.contact.lookingFor && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block">
                      Looking For
                    </span>
                    <p className="text-xs text-white/80">{site.contact.lookingFor}</p>
                  </div>
                )}
              </div>
            )}

            {/* Specialized Section: Test Bounty */}
            {site.category === 'Test' && site.contact && (
              <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Authorized Website Testing Bounty</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-white/50 block">Bounty Reward:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {site.contact.testBudget ? `${site.contact.testBudget}` : 'Bounty Reward'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50 block">Owner Authorized:</span>
                    <span className="font-semibold text-white">
                      {site.contact.testAuthorized ? 'Verified Authorization' : 'Community Submission'}
                    </span>
                  </div>
                </div>
                {site.contact.testingRules && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block">
                      Scope &amp; Rules
                    </span>
                    <p className="text-xs text-white/80">{site.contact.testingRules}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Key Details Card */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-white">Project Details</h3>

              <div className="space-y-3 divide-y divide-white/5">
                <div className="pt-2 flex justify-between">
                  <span className="text-white/50">Category</span>
                  <span className="font-semibold text-white">{site.category}</span>
                </div>
                {site.subCategory && (
                  <div className="pt-2 flex justify-between">
                    <span className="text-white/50">Subcategory</span>
                    <span className="font-semibold text-white">{site.subCategory}</span>
                  </div>
                )}
                <div className="pt-2 flex justify-between">
                  <span className="text-white/50">Submitted</span>
                  <span className="text-white">{new Date(site.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-white/50">Likes</span>
                  <span className="text-white font-mono">{site.likesCount || 0}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-white/50">Saves</span>
                  <span className="text-white font-mono">{site.savesCount || 0}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors"
                >
                  <span>Open Target Website</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Recommended Websites Section (Clean thumbnail card + name below) */}
        {/* ------------------------------------------------------------------ */}
        {recommendedSites.length > 0 && (
          <div className="pt-12 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                  Recommended Websites
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  More websites you might love in {site.category}
                </p>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="text-xs text-[#93C5FD] hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Full Directory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recommendations Grid: Clean thumbnail card, name below */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedSites.map((rec) => (
                <SiteCard
                  key={rec.id}
                  site={rec}
                  onSelect={(selected) => onOpenSite(selected)}
                  onToggleLike={onToggleLike}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#05081E] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Report Website</h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1">Reason for report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#05081E] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                >
                  <option value="broken">Broken or offline website</option>
                  <option value="spam">Spam or misleading information</option>
                  <option value="inappropriate">Inappropriate or adult content</option>
                  <option value="copyright">Copyright or trademark concern</option>
                  <option value="malicious">Suspicious or malicious link</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 mb-1">Details (Optional)</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide context for our moderators..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
                >
                  <span>Submit Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
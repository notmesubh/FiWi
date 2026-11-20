import {useEffect, useMemo, useRef, useState, type FormEvent} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Copy,
  Flag,
  FolderPlus,
  Heart,
  Loader2,
  Mail,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react';
import type {
  PersonalCollection,
  SavedSite,
  SubmittedMediaItem,
  SubmittedSite,
} from '../types/fiwi';
import {fiwiApi} from '../lib/api';
import {useFiwiStore} from '../stores/useFiwiStore';
import {
  FIWI_TAP,
  FIWI_TRANSITION_FAST,
  fiwiModalBackdropVariants,
  fiwiModalSurfaceVariants,
  fiwiPanelRevealVariants,
} from '../lib/motion';
import {
  AI_TOOLS_OPTIONS,
  formatFileSize,
  TECH_STACK_OPTIONS,
  type BrandToolOption,
} from './submit/submitData';
import {BrandLogoBadge} from './submit/BrandLogoBadge';

interface SiteDetailModalProps {
  site: SubmittedSite | null;
  savedRecord: SavedSite | null;
  isLoggedIn: boolean;
  collections: PersonalCollection[];
  savedCount: number;
  saveLimit: number;
  planLabel: string;
  onClose: () => void;
  onSelectSite?: (site: SubmittedSite) => void;
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

export default function SiteDetailModal({
  site,
  savedRecord,
  isLoggedIn,
  collections,
  savedCount,
  saveLimit,
  planLabel,
  onClose,
  onSelectSite,
  onOpenProfile,
  onToggleLike,
  onToggleCollection,
  onUpdateSavedCollections,
  onCreateCollectionAndAssign,
  onRequireAuth,
  onOpenPricing,
}: SiteDetailModalProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);

  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<'prompt' | 'email' | 'share' | null>(null);

  const [enrichedSite, setEnrichedSite] = useState<SubmittedSite | null>(null);
  const [relatedSites, setRelatedSites] = useState<SubmittedSite[]>([]);

  const copyTimerRef = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const baseSite: SubmittedSite | null = useMemo(() => {
    if (site) return site;
    if (!savedRecord) return null;
    return {
      id: savedRecord.submittedSiteId ?? savedRecord.id,
      slug: savedRecord.id,
      title: savedRecord.title,
      url: savedRecord.url,
      category: savedRecord.category,
      subCategory: savedRecord.subCategory,
      customSubCategory: savedRecord.customSubCategory,
      description: savedRecord.description,
      tags: [],
      likesCount: 0,
      savesCount: 0,
      viewsCount: 0,
      authorHandle: '',
      authorUsername: '',
      authorId: '',
      createdAt: savedRecord.savedAt,
    };
  }, [site, savedRecord]);

  const activeSite = enrichedSite && enrichedSite.id === baseSite?.id ? enrichedSite : baseSite;

  useEffect(() => {
    setSelectedGalleryId(null);
    setShowCollectionPicker(false);
    setShowReportPanel(false);
    setReportDetails('');
    setNewCollectionName('');
    setCollectionError(null);
    setCopiedKey(null);
    setEnrichedSite(null);
    setRelatedSites([]);

    const lookupTarget = site?.slug || site?.id || savedRecord?.submittedSiteId;
    if (!lookupTarget) return;

    let cancelled = false;
    fiwiApi
      .getWebsiteDetail(lookupTarget)
      .then((res) => {
        if (cancelled) return;
        setEnrichedSite(res.website);
        setRelatedSites(res.related);
      })
      .catch(() => {
        // Fallback silently to card data if detail request fails
      });

    return () => {
      cancelled = true;
    };
  }, [site?.id, site?.slug, savedRecord?.submittedSiteId]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!baseSite) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';

    const focusRaf = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({preventScroll: true});
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusRaf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      if (prevFocus?.isConnected) {
        prevFocus.focus({preventScroll: true});
      }
    };
  }, [baseSite, onClose]);

  if (!activeSite) return null;

  const isFullSubmission = Boolean(site || enrichedSite);
  const subCategoryLabel = activeSite.subCategory || activeSite.customSubCategory || null;

  const formattedDate = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(activeSite.createdAt));
    } catch {
      return null;
    }
  })();

  const heroMedia = activeSite.media?.hero ?? null;
  const galleryMedia = activeSite.media?.gallery ?? [];
  const allMediaItems: SubmittedMediaItem[] = [
    ...(heroMedia ? [heroMedia] : []),
    ...galleryMedia,
  ];
  const activeMedia =
    allMediaItems.find((item) => item.id === selectedGalleryId) ?? heroMedia ?? galleryMedia[0] ?? null;

  const assignedCollectionIds = isLoggedIn && savedRecord ? savedRecord.collectionIds : [];
  const isSaved = assignedCollectionIds.length > 0;

  const resolvedAiTools: BrandToolOption[] = activeSite.vibecoded
    ? [
        ...activeSite.vibecoded.aiTools.map(
          (id) =>
            AI_TOOLS_OPTIONS.find((item) => item.id === id) ?? {
              id,
              name: id,
              description: '',
            },
        ),
        ...activeSite.vibecoded.customAiTools.map((name) => ({
          id: `custom-ai-${name}`,
          name,
          description: '',
        })),
      ]
    : [];

  const resolvedTechStack: BrandToolOption[] = activeSite.vibecoded
    ? [
        ...activeSite.vibecoded.techStack.map(
          (id) =>
            TECH_STACK_OPTIONS.find((item) => item.id === id) ?? {
              id,
              name: id,
              description: '',
            },
        ),
        ...activeSite.vibecoded.customTechStack.map((name) => ({
          id: `custom-tech-${name}`,
          name,
          description: '',
        })),
      ]
    : [];

  const copyText = async (value: string, key: 'prompt' | 'email' | 'share') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      if (key === 'share') {
        pushToast({title: 'Website link copied', tone: 'success'});
      }
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        copyTimerRef.current = null;
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1800);
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopiedKey(key);
        if (key === 'share') {
          pushToast({title: 'Website link copied', tone: 'success'});
        }
        if (copyTimerRef.current !== null) {
          window.clearTimeout(copyTimerRef.current);
        }
        copyTimerRef.current = window.setTimeout(() => {
          copyTimerRef.current = null;
          setCopiedKey((prev) => (prev === key ? null : prev));
        }, 1800);
      } catch {
        pushToast({title: 'Unable to copy to clipboard', tone: 'error'});
      }
    }
  };

  const handleToggleCollectionItem = async (collectionId: string) => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    setCollectionError(null);
    try {
      if (site || enrichedSite) {
        await onToggleCollection(activeSite, collectionId);
        return;
      }
      if (savedRecord) {
        const exists = savedRecord.collectionIds.includes(collectionId);
        const next = exists
          ? savedRecord.collectionIds.filter((id) => id !== collectionId)
          : [...savedRecord.collectionIds, collectionId];
        await onUpdateSavedCollections(savedRecord.id, next);
      }
    } catch (err) {
      setCollectionError(
        err instanceof Error ? err.message : 'Unable to update saved website.',
      );
    }
  };

  const handleCreateAndAssignSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    const err = await onCreateCollectionAndAssign(newCollectionName, activeSite, savedRecord);
    if (err) {
      setCollectionError(err);
      return;
    }
    setCollectionError(null);
    setNewCollectionName('');
  };

  const handleReportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    setSubmittingReport(true);
    try {
      await fiwiApi.reportWebsite(activeSite.id, reportReason, reportDetails.trim());
      pushToast({
        title: 'Report submitted',
        description: 'Our moderation team will review this listing.',
        tone: 'success',
      });
      setShowReportPanel(false);
      setReportDetails('');
    } catch (err) {
      pushToast({
        title: 'Report failed',
        description: err instanceof Error ? err.message : 'Unable to submit report.',
        tone: 'error',
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <motion.div
      variants={fiwiModalBackdropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-[#02031A]/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fiwi-site-detail-title"
      onClick={onClose}
    >
      <motion.div
        variants={fiwiModalSurfaceVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative w-full max-w-[840px] max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#0B0C10] border border-[#02031A]/16 dark:border-white/16 text-[#02031A] dark:text-white shadow-[0_28px_70px_-18px_rgba(2,3,26,0.45)] p-5 sm:p-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Metadata + Close */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#02031A]/12 dark:border-white/14">
          <div className="min-w-0">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/60 dark:text-white/60 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-[#1020F5] dark:text-[#60A5FA]">
                {activeSite.category}
              </span>
              {subCategoryLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{subCategoryLabel}</span>
                </>
              )}
              {activeSite.authorHandle && (
                <>
                  <span aria-hidden="true">·</span>
                  {onOpenProfile && activeSite.authorUsername ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenProfile(activeSite.authorUsername);
                      }}
                      className="bg-transparent border-0 p-0 text-[#02031A] dark:text-white font-semibold hover:text-[#1020F5] dark:hover:text-[#60A5FA] hover:underline cursor-pointer"
                    >
                      {activeSite.authorHandle}
                    </button>
                  ) : (
                    <span>{activeSite.authorHandle}</span>
                  )}
                </>
              )}
              {formattedDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{formattedDate}</span>
                </>
              )}
            </div>

            <h2
              id="fiwi-site-detail-title"
              className="font-display mt-2 text-[38px] sm:text-[50px] font-semibold leading-[0.95] tracking-[-0.015em] text-[#02031A] dark:text-white text-balance"
            >
              {activeSite.title}
            </h2>

            {activeSite.heroTitle && (
              <p className="mt-2 mb-0 text-[16px] sm:text-[18px] font-medium text-[#02031A]/80 dark:text-white/80">
                {activeSite.heroTitle}
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close website details"
            className="w-10 h-10 shrink-0 border border-[#02031A]/14 dark:border-white/16 bg-[#F7F9FC] dark:bg-white/[0.06] text-[#02031A] dark:text-white hover:bg-[#02031A] hover:text-white dark:hover:bg-white dark:hover:text-[#02031A] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Strip */}
        <div className="py-4 border-b border-[#02031A]/10 dark:border-white/12 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={activeSite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn h-[42px] px-5 text-[15px] bg-[#02031A] text-white hover:bg-[#1020F5] dark:bg-white dark:text-[#02031A] dark:hover:bg-white/85 inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span>Visit website</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            {onToggleLike && site && (
              <button
                type="button"
                onClick={() => void onToggleLike(activeSite)}
                aria-pressed={Boolean(activeSite.viewerHasLiked)}
                className={`btn h-[42px] px-4 btn-square text-[14px] inline-flex items-center gap-2 whitespace-nowrap border transition-colors ${
                  activeSite.viewerHasLiked
                    ? 'border-[#DC2626]/45 bg-[#FEF2F2] text-[#B91C1C] dark:bg-[#DC2626]/20 dark:text-[#FCA5A5]'
                    : 'border-[#02031A]/18 dark:border-white/20 bg-white dark:bg-white/[0.04] text-[#02031A] dark:text-white hover:bg-[#F7F9FC] dark:hover:bg-white/[0.08]'
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={activeSite.viewerHasLiked ? 'currentColor' : 'none'}
                />
                <span className="tabular-nums">{activeSite.likesCount}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  onRequireAuth();
                  return;
                }
                setShowCollectionPicker((prev) => !prev);
              }}
              aria-expanded={showCollectionPicker}
              className={`btn h-[42px] px-4 btn-square text-[14px] inline-flex items-center gap-2 whitespace-nowrap border transition-colors ${
                isSaved
                  ? 'border-[#1020F5] bg-[#EEF2FF] text-[#1020F5] dark:border-[#60A5FA] dark:bg-[#1020F5]/20 dark:text-[#93B4FF]'
                  : 'border-[#02031A]/18 dark:border-white/20 bg-white dark:bg-white/[0.04] text-[#02031A] dark:text-white hover:bg-[#F7F9FC] dark:hover:bg-white/[0.08]'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? `Saved (${assignedCollectionIds.length})` : 'Save'}</span>
            </button>

            {site && (
              <button
                type="button"
                onClick={() =>
                  void copyText(
                    `${window.location.origin}/#site/${activeSite.slug || activeSite.id}`,
                    'share',
                  )
                }
                aria-label="Copy share link"
                title="Copy share link"
                className="btn h-[42px] px-3.5 btn-square border border-[#02031A]/18 dark:border-white/20 bg-white dark:bg-white/[0.04] text-[#02031A] dark:text-white hover:bg-[#F7F9FC] dark:hover:bg-white/[0.08] text-[13px] inline-flex items-center gap-1.5"
              >
                {copiedKey === 'share' ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Share2 className="w-4 h-4" />}
              </button>
            )}

            {site && (
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    onRequireAuth();
                    return;
                  }
                  setShowReportPanel((prev) => !prev);
                }}
                aria-label="Report listing"
                title="Report listing"
                className="btn h-[42px] px-3.5 btn-square border border-[#02031A]/18 dark:border-white/20 bg-white dark:bg-white/[0.04] text-[#02031A]/75 dark:text-white/75 hover:text-[#991B1B] text-[13px] inline-flex items-center gap-1.5"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>

          <a
            href={activeSite.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[12px] text-[#02031A]/65 dark:text-white/65 hover:text-[#1020F5] dark:hover:text-[#60A5FA] break-all"
          >
            {activeSite.url}
          </a>
        </div>

        {/* Inline Report Drawer */}
        <AnimatePresence initial={false}>
          {showReportPanel && isLoggedIn && (
            <motion.form
              key="report-panel"
              variants={fiwiPanelRevealVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleReportSubmit}
              className="mt-4 p-4 border border-[#B91C1C]/30 bg-[#FEF2F2]/75 dark:bg-[#1E1316] space-y-3"
            >
              <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#991B1B] dark:text-[#FCA5A5] font-semibold">
                Report website listing
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="fiwi-field dark:bg-[#181922] dark:text-white dark:border-white/16"
                >
                  <option value="spam">Spam or misleading promotion</option>
                  <option value="broken">Broken or unsafe link</option>
                  <option value="unauthorized_test">Unauthorized test listing</option>
                  <option value="misleading">Misleading metadata or attribution</option>
                  <option value="other">Other guideline violation</option>
                </select>
                <input
                  type="text"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Optional context for moderators"
                  className="fiwi-field dark:bg-[#181922] dark:text-white dark:border-white/16"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportPanel(false)}
                  className="btn h-[36px] px-4 btn-square border border-[#02031A]/18 bg-white text-[#02031A] text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="btn h-[36px] px-4 btn-square bg-[#B91C1C] text-white text-[12px] inline-flex items-center gap-1.5"
                >
                  {submittingReport && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit report</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Inline Personal Collection Assignment Panel */}
        <AnimatePresence initial={false}>
          {showCollectionPicker && isLoggedIn && (
            <motion.div
              key="collection-picker"
              variants={fiwiPanelRevealVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-4 p-4 border border-[#02031A]/14 dark:border-white/16 bg-[#F7F9FC] dark:bg-[#121319]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/70 dark:text-white/70 font-semibold tabular-nums">
                  Save into personal collections · {savedCount} / {saveLimit} ({planLabel})
                </div>
                <button
                  type="button"
                  onClick={() => setShowCollectionPicker(false)}
                  className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55 hover:text-[#02031A] dark:hover:text-white bg-transparent border-0 p-0 cursor-pointer"
                >
                  Done
                </button>
              </div>

              {!isSaved && savedCount >= saveLimit && (
                <div
                  role="alert"
                  className="mb-3 p-3 border border-[#B91C1C]/35 bg-white dark:bg-[#1C1215] flex flex-wrap items-center justify-between gap-2 text-[12.5px] font-medium text-[#991B1B] dark:text-[#FCA5A5]"
                >
                  <span>
                    Limit reached: {saveLimit} saved websites on {planLabel}.
                  </span>
                  <button
                    type="button"
                    onClick={onOpenPricing}
                    className="mono text-[11px] uppercase tracking-[0.06em] font-semibold text-[#1020F5] dark:text-[#60A5FA] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Upgrade plan
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {collections.map((col) => {
                  const checked = assignedCollectionIds.includes(col.id);
                  return (
                    <motion.button
                      key={col.id}
                      type="button"
                      whileTap={FIWI_TAP}
                      aria-pressed={checked}
                      onClick={() => void handleToggleCollectionItem(col.id)}
                      className={`inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-[#1020F5] text-white border-[#1020F5]'
                          : 'bg-white dark:bg-[#181922] text-[#02031A] dark:text-white border-[#02031A]/14 dark:border-white/14 hover:border-[#02031A]/35 dark:hover:border-white/35'
                      }`}
                    >
                      <Check
                        className={`w-3.5 h-3.5 transition-opacity ${checked ? 'opacity-100' : 'opacity-25'}`}
                      />
                      <span>{col.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              <form
                onSubmit={handleCreateAndAssignSubmit}
                className="mt-3 pt-3 border-t border-[#02031A]/10 dark:border-white/10 flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => {
                    setNewCollectionName(e.target.value);
                    setCollectionError(null);
                  }}
                  placeholder="New collection name (e.g. SaaS Inspiration)"
                  aria-label="New personal collection name"
                  className="fiwi-field flex-1 dark:bg-[#181922] dark:text-white dark:border-white/16"
                />
                <button
                  type="submit"
                  className="btn h-[40px] px-4 btn-square bg-[#02031A] text-white hover:bg-[#1020F5] dark:bg-white dark:text-[#02031A] dark:hover:bg-white/85 text-[13px] inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create &amp; save</span>
                </button>
              </form>
              {collectionError && (
                <p role="alert" className="mt-2 mb-0 text-[12px] font-medium text-[#991B1B] dark:text-[#FCA5A5]">
                  {collectionError}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded Media Viewer */}
        {activeMedia && (
          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMedia.id}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={FIWI_TRANSITION_FAST}
              >
                {activeMedia.previewUrl ? (
                  <div className="relative aspect-video w-full bg-[#0A0C24] border border-[#02031A]/12 dark:border-white/14 overflow-hidden">
                    {activeMedia.kind === 'video' ? (
                      <video
                        src={activeMedia.previewUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={activeMedia.previewUrl}
                        alt={`${activeSite.title} — ${activeMedia.fileName}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-4 border border-[#02031A]/12 dark:border-white/14 bg-[#F7F9FC] dark:bg-white/[0.04] flex items-center justify-between gap-3 text-[13px]">
                    <span className="font-medium truncate">{activeMedia.fileName}</span>
                    <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55 tabular-nums shrink-0">
                      {activeMedia.kind.toUpperCase()} · {formatFileSize(activeMedia.fileSizeBytes)}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {allMediaItems.length > 1 && (
              <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
                {allMediaItems.map((item, idx) => {
                  const isCurrent = item.id === activeMedia.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedGalleryId(item.id)}
                      className={`shrink-0 w-24 aspect-video border overflow-hidden cursor-pointer p-0 transition-opacity ${
                        isCurrent
                          ? 'border-[#1020F5] ring-1 ring-[#1020F5] opacity-100'
                          : 'border-[#02031A]/14 dark:border-white/16 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {item.previewUrl && item.kind === 'image' ? (
                        <img
                          src={item.previewUrl}
                          alt={item.fileName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center bg-[#F4F6FA] dark:bg-white/10 mono text-[10px] text-[#02031A] dark:text-white">
                          {idx === 0 ? 'HERO' : `0${idx}`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Website Overview */}
        <div className="mt-6">
          <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
            About this website
          </div>
          <p className="mt-2 mb-0 text-[15.5px] leading-[1.65] text-[#02031A]/85 dark:text-white/85 whitespace-pre-line max-w-[68ch]">
            {activeSite.description}
          </p>

          {activeSite.tags && activeSite.tags.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {activeSite.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 border border-[#02031A]/14 dark:border-white/14 bg-[#F7F9FC] dark:bg-white/[0.04] mono text-[11px] text-[#02031A]/75 dark:text-white/75"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Category-Specific Details: Vibecoded */}
        {isFullSubmission && activeSite.category === 'Vibecoded' && activeSite.vibecoded && (
          <div className="mt-7 pt-6 border-t border-[#02031A]/12 dark:border-white/14 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] dark:text-[#60A5FA] font-semibold">
                Vibecoded Building Insights
              </div>
              {activeSite.vibecoded.aiModel && (
                <span className="mono text-[11px] px-2.5 py-0.5 bg-[#EEF2FF] dark:bg-[#1020F5]/20 text-[#1020F5] dark:text-[#93B4FF]">
                  Model: {activeSite.vibecoded.aiModel}
                </span>
              )}
            </div>

            {resolvedAiTools.length > 0 && (
              <div>
                <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55 mb-2.5">
                  AI Tools Used
                </div>
                <div className="flex flex-wrap gap-2">
                  {resolvedAiTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-[#02031A]/14 dark:border-white/16 bg-[#F7F9FC] dark:bg-white/[0.05] text-[13px] font-semibold text-[#02031A] dark:text-white"
                    >
                      <BrandLogoBadge tool={tool} size="sm" />
                      <span>{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resolvedTechStack.length > 0 && (
              <div>
                <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55 mb-2.5">
                  Tech Stack
                </div>
                <div className="flex flex-wrap gap-2">
                  {resolvedTechStack.map((tool) => (
                    <div
                      key={tool.id}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-[#02031A]/14 dark:border-white/16 bg-[#F7F9FC] dark:bg-white/[0.05] text-[13px] font-semibold text-[#02031A] dark:text-white"
                    >
                      <BrandLogoBadge tool={tool} size="sm" />
                      <span>{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSite.vibecoded.originalPrompt && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                    Original Prompt
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(activeSite.vibecoded!.originalPrompt, 'prompt')}
                    className="inline-flex items-center gap-1 mono text-[11px] uppercase tracking-[0.06em] text-[#1020F5] dark:text-[#60A5FA] hover:opacity-80 bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {copiedKey === 'prompt' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 border border-[#02031A]/12 dark:border-white/14 bg-[#F7F9FC] dark:bg-white/[0.04] text-[14px] leading-[1.6] text-[#02031A]/85 dark:text-white/85 whitespace-pre-line">
                  {activeSite.vibecoded.originalPrompt}
                </div>
              </div>
            )}

            {activeSite.vibecoded.developmentSteps && (
              <div>
                <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55 mb-2">
                  Development Steps
                </div>
                <div className="p-4 border border-[#02031A]/12 dark:border-white/14 bg-[#F7F9FC] dark:bg-white/[0.04] text-[14px] leading-[1.6] text-[#02031A]/85 dark:text-white/85 whitespace-pre-line">
                  {activeSite.vibecoded.developmentSteps}
                </div>
              </div>
            )}

            {activeSite.vibecoded.extraInfo && (
              <div className="text-[13.5px] text-[#02031A]/80 dark:text-white/80">
                <span className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55 block mb-1">
                  Additional Building Notes
                </span>
                {activeSite.vibecoded.extraInfo}
              </div>
            )}
          </div>
        )}

        {/* Category-Specific Details: Connect & Test */}
        {isFullSubmission &&
          (activeSite.category === 'Connect' || activeSite.category === 'Test') &&
          activeSite.contact && (
            <div className="mt-7 pt-6 border-t border-[#02031A]/12 dark:border-white/14 space-y-5">
              <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] dark:text-[#60A5FA] font-semibold">
                {activeSite.category === 'Test'
                  ? 'Authorized Testing Scope & Contact'
                  : 'Collaboration Opportunity & Creator Contact'}
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                {activeSite.contact.name && (
                  <div>
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      Contact Name
                    </dt>
                    <dd className="mt-1 font-semibold text-[#02031A] dark:text-white">
                      {activeSite.contact.name}
                    </dd>
                  </div>
                )}

                {activeSite.contact.email && (
                  <div>
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      Contact Email
                    </dt>
                    <dd className="mt-1 flex flex-wrap items-center gap-2.5">
                      <a
                        href={`mailto:${activeSite.contact.email}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#1020F5] dark:text-[#60A5FA] hover:underline break-all"
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>{activeSite.contact.email}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText(activeSite.contact!.email, 'email')}
                        className="mono text-[10.5px] uppercase tracking-[0.06em] text-[#02031A]/60 dark:text-white/60 hover:text-[#02031A] dark:hover:text-white bg-transparent border-0 p-0 cursor-pointer"
                      >
                        {copiedKey === 'email' ? 'Copied' : 'Copy'}
                      </button>
                    </dd>
                  </div>
                )}

                {activeSite.category === 'Connect' && activeSite.contact.collaborationType && (
                  <div>
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      Collaboration Type
                    </dt>
                    <dd className="mt-1 font-semibold capitalize text-[#02031A] dark:text-white">
                      {activeSite.contact.collaborationType.replace(/_/g, ' ')}
                    </dd>
                  </div>
                )}

                {activeSite.contact.requiredRoles && activeSite.contact.requiredRoles.length > 0 && (
                  <div>
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      Roles Needed
                    </dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {activeSite.contact.requiredRoles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-0.5 bg-[#F4F6FA] dark:bg-white/10 border border-[#02031A]/12 dark:border-white/14 text-[12px]"
                        >
                          {role}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

                {activeSite.contact.skills && activeSite.contact.skills.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      Skills
                    </dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {activeSite.contact.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-[#EEF2FF] dark:bg-[#1020F5]/20 text-[#1020F5] dark:text-[#93B4FF] text-[12px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

                {activeSite.contact.link && (
                  <div className="sm:col-span-2">
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      Contact Link
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={activeSite.contact.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#1020F5] dark:text-[#60A5FA] hover:underline break-all"
                      >
                        <span>{activeSite.contact.link}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </dd>
                  </div>
                )}

                {activeSite.category === 'Test' && (
                  <>
                    {activeSite.contact.authorizedTargetUrl && (
                      <div>
                        <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                          Authorized Target URL
                        </dt>
                        <dd className="mt-1 break-all text-[#1020F5] dark:text-[#60A5FA]">
                          {activeSite.contact.authorizedTargetUrl}
                        </dd>
                      </div>
                    )}
                    {activeSite.contact.testBudget !== undefined && (
                      <div>
                        <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                          Testing Payment / Budget
                        </dt>
                        <dd className="mt-1 font-semibold text-[#02031A] dark:text-white tabular-nums">
                          {(() => {
                            const parsed = Number(activeSite.contact.testBudget);
                            if (!Number.isFinite(parsed) || parsed <= 0) {
                              return '$0.00 USD (Unpaid / Volunteer)';
                            }
                            return `$${parsed.toFixed(2)} USD`;
                          })()}
                        </dd>
                      </div>
                    )}
                    {activeSite.contact.deadline && (
                      <div>
                        <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                          Deadline
                        </dt>
                        <dd className="mt-1 font-medium text-[#02031A] dark:text-white tabular-nums">
                          {activeSite.contact.deadline}
                        </dd>
                      </div>
                    )}
                  </>
                )}

                {activeSite.contact.primaryTopic && (
                  <div className="sm:col-span-2">
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      {activeSite.category === 'Test'
                        ? 'What Is In Scope to Test'
                        : 'Reason for Contact'}
                    </dt>
                    <dd className="mt-1 text-[#02031A]/85 dark:text-white/85 whitespace-pre-line leading-[1.6]">
                      {activeSite.contact.primaryTopic}
                    </dd>
                  </div>
                )}

                {activeSite.contact.lookingFor && (
                  <div className="sm:col-span-2">
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      What They Are Looking For
                    </dt>
                    <dd className="mt-1 text-[#02031A]/85 dark:text-white/85 whitespace-pre-line leading-[1.6]">
                      {activeSite.contact.lookingFor}
                    </dd>
                  </div>
                )}

                {activeSite.category === 'Test' && activeSite.contact.testingRules && (
                  <div className="sm:col-span-2">
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      Testing Rules &amp; Boundaries
                    </dt>
                    <dd className="mt-1 text-[#02031A]/85 dark:text-white/85 whitespace-pre-line leading-[1.6]">
                      {activeSite.contact.testingRules}
                    </dd>
                  </div>
                )}

                {activeSite.category === 'Test' && activeSite.contact.disclosurePolicy && (
                  <div className="sm:col-span-2">
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                      Responsible Disclosure Policy
                    </dt>
                    <dd className="mt-1 text-[#02031A]/85 dark:text-white/85 whitespace-pre-line leading-[1.6]">
                      {activeSite.contact.disclosurePolicy}
                    </dd>
                  </div>
                )}
              </dl>

              {activeSite.category === 'Test' && activeSite.contact.testAuthorized && (
                <div className="pt-4 border-t border-[#02031A]/10 dark:border-white/12 flex items-center gap-2 text-[13px] font-medium text-[#02031A] dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>
                    Owner confirmed explicit authorization for community testing within stated scope
                    {activeSite.contact.hasAuthorizationProof ? ' (verification proof reviewed)' : ''}.
                  </span>
                </div>
              )}
            </div>
          )}

        {/* Related Websites Strip */}
        {Array.isArray(relatedSites) && relatedSites.length > 0 && onSelectSite && (
          <div className="mt-8 pt-6 border-t border-[#02031A]/12 dark:border-white/14">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55 mb-3">
              More in {activeSite.category}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedSites.slice(0, 4).map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onSelectSite(rel)}
                  className="p-3.5 border border-[#02031A]/14 dark:border-white/14 bg-[#F7F9FC] dark:bg-white/[0.04] hover:border-[#1020F5] text-left cursor-pointer transition-colors"
                >
                  <div className="mono text-[10px] uppercase tracking-[0.08em] text-[#02031A]/60 dark:text-white/60 truncate">
                    {rel.category} · {rel.authorHandle}
                  </div>
                  <div className="mt-1 font-display text-[22px] font-semibold leading-none text-[#02031A] dark:text-white truncate">
                    {rel.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

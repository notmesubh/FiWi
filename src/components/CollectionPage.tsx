import {useCallback, useEffect, useRef, useState, type FormEvent} from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Check,
  Copy,
  Globe,
  ImagePlus,
  Loader2,
  Lock,
  Trash2,
} from 'lucide-react';
import {fiwiApi, uploadMediaFile} from '../lib/api';
import {useFiwiStore} from '../stores/useFiwiStore';
import {SiteCard} from './SiteCard';
import type {
  CollectionDetailPayload,
  SubmittedSite,
} from '../types/fiwi';

interface CollectionPageProps {
  slugOrId: string;
  onBack: () => void;
  onOpenProfile: (username: string) => void;
  onOpenSite: (site: SubmittedSite) => void;
}

export default function CollectionPage({
  slugOrId,
  onBack,
  onOpenProfile,
  onOpenSite,
}: CollectionPageProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);
  const refreshUserWorkspace = useFiwiStore((s) => s.refreshUserWorkspace);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivateBlocked, setIsPrivateBlocked] = useState(false);
  const [data, setData] = useState<CollectionDetailPayload | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  const [editCoverUrl, setEditCoverUrl] = useState<string | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const loadCollection = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsPrivateBlocked(false);
    try {
      const res = await fiwiApi.getCollectionView(slugOrId);
      setData(res);
      setEditName(res.collection.name);
      setEditDescription(res.collection.description);
      setEditPublic(res.collection.isPublic);
      setEditCoverUrl(res.collection.coverImageUrl ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load collection.';
      setError(message);
      if (message.toLowerCase().includes('private')) {
        setIsPrivateBlocked(true);
      }
    } finally {
      setLoading(false);
    }
  }, [slugOrId]);

  useEffect(() => {
    void loadCollection();
  }, [loadCollection]);

  const handleCopyShareUrl = async () => {
    if (!data) return;
    const shareUrl = `${window.location.origin}/#collection/${data.collection.slug || data.collection.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      pushToast({title: 'Collection link copied', tone: 'success'});
      window.setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      pushToast({title: 'Unable to copy link', tone: 'error'});
    }
  };

  const handleCoverUpload = async (file: File | undefined) => {
    if (!file || !data) return;
    setUploadingCover(true);
    try {
      const uploaded = await uploadMediaFile({file, purpose: 'collection_cover'});
      if (uploaded.publicUrl) {
        setEditCoverUrl(uploaded.publicUrl);
        await fiwiApi.updateCollection(data.collection.id, {coverImageUrl: uploaded.publicUrl});
        await Promise.all([loadCollection(), refreshUserWorkspace()]);
        pushToast({title: 'Collection cover updated', tone: 'success'});
      }
    } catch (err) {
      pushToast({
        title: 'Cover upload failed',
        description: err instanceof Error ? err.message : 'Unable to upload image.',
        tone: 'error',
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveMeta = async (e: FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSavingMeta(true);
    try {
      await fiwiApi.updateCollection(data.collection.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        isPublic: editPublic,
        coverImageUrl: editCoverUrl,
      });
      setEditMode(false);
      await Promise.all([loadCollection(), refreshUserWorkspace()]);
      pushToast({title: 'Collection updated', tone: 'success'});
    } catch (err) {
      pushToast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Unable to save collection settings.',
        tone: 'error',
      });
    } finally {
      setSavingMeta(false);
    }
  };

  const handleMoveItem = async (bookmarkId: string, direction: 'up' | 'down') => {
    if (!data) return;
    const ids = data.items.map((i) => i.bookmark.id);
    const idx = ids.indexOf(bookmarkId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= ids.length) return;
    const nextIds = [...ids];
    const [moved] = nextIds.splice(idx, 1);
    nextIds.splice(targetIdx, 0, moved);

    const nextItems = [...data.items];
    const [movedItem] = nextItems.splice(idx, 1);
    nextItems.splice(targetIdx, 0, movedItem);
    setData({...data, items: nextItems});

    try {
      await fiwiApi.reorderCollection(data.collection.id, nextIds);
      await refreshUserWorkspace();
    } catch (err) {
      pushToast({
        title: 'Reorder failed',
        description: err instanceof Error ? err.message : 'Unable to reorder items.',
        tone: 'error',
      });
      void loadCollection();
    }
  };

  const handleRemoveItem = async (bookmarkId: string, collectionIds: string[]) => {
    if (!data) return;
    const nextColIds = collectionIds.filter((id) => id !== data.collection.id);
    try {
      if (nextColIds.length === 0) {
        await fiwiApi.deleteBookmark(bookmarkId);
      } else {
        await fiwiApi.updateBookmarkCollections(bookmarkId, nextColIds);
      }
      await Promise.all([loadCollection(), refreshUserWorkspace()]);
      pushToast({title: 'Removed from collection', tone: 'info'});
    } catch (err) {
      pushToast({
        title: 'Action failed',
        description: err instanceof Error ? err.message : 'Unable to update bookmark.',
        tone: 'error',
      });
    }
  };

  return (
    <div className="relative z-[2] mt-[52px] mb-24 w-full max-w-[1200px] flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="btn h-[40px] px-4 btn-square bg-white/85 text-[#02031A] hover:bg-white text-[13px] inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {data && (
          <div className="flex items-center gap-2">
            {data.collection.isPublic && (
              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="btn h-[40px] px-4 btn-square bg-white/85 text-[#02031A] hover:bg-white text-[13px] inline-flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#1020F5]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied URL' : 'Share collection'}</span>
              </button>
            )}
            {data.isOwner && (
              <button
                type="button"
                onClick={() => setEditMode((prev) => !prev)}
                className="btn h-[40px] px-4 btn-square bg-[#02031A] text-white hover:bg-[#1020F5] text-[13px]"
              >
                {editMode ? 'Close edit' : 'Edit collection'}
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="glass fiwi-auth-card w-full p-12 flex flex-col items-center justify-center gap-3 min-h-[280px]">
          <Loader2 className="w-6 h-6 animate-spin text-[#1020F5]" />
          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/70">
            Loading collection...
          </span>
        </div>
      ) : error || !data ? (
        <div className="glass fiwi-auth-card w-full max-w-[600px] p-8 text-center">
          <div className="w-12 h-12 mx-auto bg-[#02031A] text-white flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display text-[38px] font-semibold leading-none text-[#02031A]">
            {isPrivateBlocked ? 'Private Collection' : 'Collection Unavailable'}
          </h1>
          <p className="mt-3 text-[14.5px] text-[#02031A]/75">
            {error ?? 'This collection could not be loaded.'}
          </p>
        </div>
      ) : (
        <>
          <div className="glass fiwi-auth-card w-full overflow-hidden text-left">
            {data.collection.coverImageUrl && (
              <div className="w-full h-[180px] sm:h-[240px] bg-[#0A0C24] overflow-hidden border-b border-[#02031A]/12">
                <img
                  src={data.collection.coverImageUrl}
                  alt={data.collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/65 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[#1020F5] font-semibold">
                    {data.collection.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {data.collection.isPublic ? 'Public Collection' : 'Private Collection'}
                  </span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => onOpenProfile(data.owner.username)}
                    className="bg-transparent border-0 p-0 text-[#02031A] font-semibold hover:text-[#1020F5] hover:underline cursor-pointer"
                  >
                    by {data.owner.handle}
                  </button>
                  <span>·</span>
                  <span className="tabular-nums">{data.items.length} websites</span>
                </div>

                {data.isOwner && (
                  <>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        void handleCoverUpload(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                      className="sr-only"
                    />
                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverInputRef.current?.click()}
                      className="mono text-[11px] uppercase tracking-[0.08em] font-semibold text-[#1020F5] hover:underline bg-transparent border-0 p-0 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                      <span>{data.collection.coverImageUrl ? 'Change cover' : 'Upload cover'}</span>
                    </button>
                  </>
                )}
              </div>

              <h1 className="mt-2 font-display text-[44px] sm:text-[56px] font-semibold leading-[0.95] text-[#02031A]">
                {data.collection.name}
              </h1>

              {data.collection.description && (
                <p className="mt-2.5 mb-0 text-[15px] leading-[1.55] text-[#02031A]/80 max-w-[66ch]">
                  {data.collection.description}
                </p>
              )}

              {editMode && data.isOwner && (
                <form
                  onSubmit={handleSaveMeta}
                  className="mt-6 pt-5 border-t border-[#02031A]/12 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                        Collection name
                      </span>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="fiwi-field"
                      />
                    </label>
                    <label className="flex items-center gap-2.5 pt-5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editPublic}
                        onChange={(e) => setEditPublic(e.target.checked)}
                        className="w-4 h-4 accent-[#1020F5]"
                      />
                      <span className="text-[13.5px] font-medium text-[#02031A]">
                        Make collection public (shareable URL &amp; visible on profile)
                      </span>
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                      Description
                    </span>
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Describe the theme or focus of this collection..."
                      className="fiwi-field"
                    />
                  </label>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="submit"
                      disabled={savingMeta}
                      className="btn h-[42px] px-5 bg-[#02031A] text-white hover:bg-[#1020F5] text-[14px] inline-flex items-center gap-2"
                    >
                      {savingMeta && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save collection</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="w-full mt-8">
            {data.items.length === 0 ? (
              <div className="tile !h-auto py-10 flex-col items-center justify-center text-center">
                <span className="mono text-[12px] uppercase tracking-[0.08em] text-[#02031A]/70">
                  This collection has no websites yet.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.items.map(({bookmark, site}) => {
                  const displaySite: SubmittedSite = site ?? {
                    id: bookmark.submittedSiteId ?? bookmark.id,
                    slug: bookmark.id,
                    title: bookmark.title,
                    url: bookmark.url,
                    category: bookmark.category,
                    subCategory: bookmark.subCategory,
                    customSubCategory: bookmark.customSubCategory,
                    description: bookmark.description,
                    tags: [],
                    likesCount: 0,
                    savesCount: 0,
                    viewsCount: 0,
                    authorHandle: data.owner.handle,
                    authorUsername: data.owner.username,
                    authorId: data.owner.id,
                    createdAt: bookmark.savedAt,
                  };
                  return (
                    <SiteCard
                      key={bookmark.id}
                      site={displaySite}
                      isSaved={true}
                      onSelect={() => onOpenSite(displaySite)}
                      onDelete={
                        data.isOwner
                          ? () => void handleRemoveItem(bookmark.id, bookmark.collectionIds)
                          : undefined
                      }
                      canDelete={data.isOwner}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

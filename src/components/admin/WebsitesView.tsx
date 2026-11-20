import React, {useState, useMemo} from 'react';
import {
  Archive,
  ArrowUpRight,
  Award,
  Check,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Globe,
  Heart,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {fiwiApi} from '../../lib/api';
import {useFiwiStore} from '../../stores/useFiwiStore';
import type {SiteCategory, SubmittedSite} from '../../types/fiwi';

interface WebsitesViewProps {
  websites: SubmittedSite[];
  onRefresh: () => void;
  sectionFilter?: SiteCategory;
}

export default function WebsitesView({
  websites,
  onRefresh,
  sectionFilter,
}: WebsitesViewProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);
  const openConfirm = useFiwiStore((s) => s.openConfirm);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(sectionFilter || 'all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'saves'>('recent');

  const [busyId, setBusyId] = useState<string | null>(null);

  // Edit Website Modal state
  const [editingSite, setEditingSite] = useState<SubmittedSite | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<SiteCategory>('Normal');
  const [editTags, setEditTags] = useState('');

  const openEditModal = (site: SubmittedSite) => {
    setEditingSite(site);
    setEditTitle(site.title);
    setEditUrl(site.url);
    setEditDescription(site.description);
    setEditCategory(site.category);
    setEditTags(site.tags.join(', '));
  };

  const handleSaveEdit = async () => {
    if (!editingSite) return;
    setBusyId(`edit-${editingSite.id}`);
    try {
      const parsedTags = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await fiwiApi.adminUpdateWebsite(editingSite.id, {
        title: editTitle.trim(),
        url: editUrl.trim(),
        description: editDescription.trim(),
        category: editCategory,
        tags: parsedTags,
      });

      pushToast({title: 'Website updated successfully', tone: 'success'});
      setEditingSite(null);
      onRefresh();
    } catch (err) {
      pushToast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Error updating website',
        tone: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleFeatured = async (site: SubmittedSite) => {
    setBusyId(`feat-${site.id}`);
    try {
      await fiwiApi.adminUpdateWebsite(site.id, {
        isFeatured: !site.isFeatured,
      });
      pushToast({
        title: !site.isFeatured ? 'Website featured on homepage' : 'Featured flag removed',
        tone: 'success',
      });
      onRefresh();
    } catch (err) {
      pushToast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Error updating featured status',
        tone: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteWebsite = (site: SubmittedSite) => {
    openConfirm({
      title: 'Permanently delete published website?',
      message: `Are you sure you want to delete "${site.title}" from the public FIWI directory? All saves and bookmarks for this site will be removed.`,
      confirmLabel: 'Delete Website',
      destructive: true,
      onConfirm: async () => {
        setBusyId(`del-${site.id}`);
        try {
          await fiwiApi.adminDeleteWebsite(site.id);
          pushToast({title: 'Website permanently deleted', tone: 'info'});
          onRefresh();
        } catch (err) {
          pushToast({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Could not delete website',
            tone: 'error',
          });
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const filteredWebsites = useMemo(() => {
    return websites
      .filter((w) => {
        if (categoryFilter !== 'all' && w.category !== categoryFilter) {
          return false;
        }
        if (featuredOnly && !w.isFeatured) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = w.title.toLowerCase().includes(q);
          const matchesUrl = w.url.toLowerCase().includes(q);
          const matchesDesc = w.description.toLowerCase().includes(q);
          const matchesAuthor =
            w.authorUsername && w.authorUsername.toLowerCase().includes(q);
          if (!matchesTitle && !matchesUrl && !matchesDesc && !matchesAuthor) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'likes') return (b.likesCount || 0) - (a.likesCount || 0);
        if (sortBy === 'saves') return (b.savesCount || 0) - (a.savesCount || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [websites, categoryFilter, featuredOnly, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#05081E] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
          >
            <option value="all">All Sections ({websites.length})</option>
            <option value="Normal">Normal</option>
            <option value="Vibecoded">Vibecoded</option>
            <option value="Connect">Connect</option>
            <option value="Test">Test</option>
          </select>

          {/* Featured Toggle */}
          <button
            type="button"
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              featuredOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow'
                : 'bg-white/[0.04] text-white/70 border-white/10 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${featuredOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Featured Highlights</span>
          </button>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-[#05081E] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
          >
            <option value="recent">Recently Published</option>
            <option value="likes">Most Liked</option>
            <option value="saves">Most Saved / Bookmarked</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search published listings..."
            className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-[#1020F5]"
          />
        </div>
      </div>

      {/* Websites Library Grid */}
      {filteredWebsites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWebsites.map((site) => {
            const isBusy = busyId?.includes(site.id);

            return (
              <div
                key={site.id}
                className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  {/* Top card bar: Category badge + Featured star */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/[0.06] border border-white/10 text-white/80">
                      {site.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(site)}
                      disabled={isBusy}
                      className={`p-1.5 rounded-lg transition-colors ${
                        site.isFeatured
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-white/30 hover:text-amber-300 hover:bg-white/5'
                      }`}
                      title={site.isFeatured ? 'Remove featured' : 'Make featured'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          site.isFeatured ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Thumbnail / Header */}
                  <div className="h-32 rounded-xl bg-black/40 border border-white/10 overflow-hidden relative mb-3 flex items-center justify-center">
                    {site.thumbnailUrl ? (
                      <img
                        src={site.thumbnailUrl}
                        alt={site.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Globe className="w-8 h-8 text-white/20" />
                    )}
                  </div>

                  {/* Title and URL */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white truncate">{site.title}</h3>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#93C5FD] hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{site.url}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  </div>

                  <p className="text-xs text-white/60 line-clamp-2 mt-2">
                    {site.description}
                  </p>

                  {/* Tags */}
                  {site.tags && site.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {site.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-white/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom stats and action buttons */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      {site.likesCount || 0}
                    </span>
                    <span>Saves: {site.savesCount || 0}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(site)}
                      className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit metadata"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteWebsite(site)}
                      className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete website"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center space-y-3 rounded-2xl bg-white/[0.02] border border-white/10">
          <Globe className="w-8 h-8 text-white/30 mx-auto" />
          <div className="text-sm font-semibold text-white">No published websites</div>
          <p className="text-xs text-white/50">
            No published listings match the current filters.
          </p>
        </div>
      )}

      {/* Edit Website Modal */}
      {editingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#05081E] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Published Listing</h3>
              <button
                type="button"
                onClick={() => setEditingSite(null)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">URL</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Discovery Section</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as SiteCategory)}
                  className="w-full px-3 py-2 bg-[#05081E] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                >
                  <option value="Normal">Normal</option>
                  <option value="Vibecoded">Vibecoded</option>
                  <option value="Connect">Connect</option>
                  <option value="Test">Test</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingSite(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={busyId !== null}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1020F5] hover:bg-[#1020F5]/80 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, {useState, useEffect, useMemo} from 'react';
import {
  ExternalLink,
  FolderHeart,
  Globe,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import {fiwiApi} from '../../lib/api';
import {useFiwiStore} from '../../stores/useFiwiStore';
import type {PersonalCollection} from '../../types/fiwi';

interface AdminCollectionItem extends PersonalCollection {
  ownerId?: string;
  ownerUsername?: string;
  ownerEmail?: string;
}

export default function CollectionsView() {
  const pushToast = useFiwiStore((s) => s.pushToast);
  const openConfirm = useFiwiStore((s) => s.openConfirm);

  const [collections, setCollections] = useState<AdminCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fiwiApi.adminGetCollections();
      setCollections(res.collections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCollections();
  }, []);

  const handleDeleteCollection = (collection: AdminCollectionItem) => {
    openConfirm({
      title: 'Delete collection?',
      message: `Permanently delete "${collection.name}"? This removes the collection and all bookmark references within it.`,
      confirmLabel: 'Delete Collection',
      destructive: true,
      onConfirm: async () => {
        setBusyId(collection.id);
        try {
          await fiwiApi.adminDeleteCollection(collection.id);
          pushToast({title: 'Collection deleted', tone: 'info'});
          await loadCollections();
        } catch (err) {
          pushToast({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Could not delete collection',
            tone: 'error',
          });
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesDesc = c.description ? c.description.toLowerCase().includes(q) : false;
        const matchesOwner = c.ownerUsername ? c.ownerUsername.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesDesc && !matchesOwner) return false;
      }
      return true;
    });
  }, [collections, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>Total Collections:</span>
            <span className="font-bold text-white">{collections.length}</span>
          </div>
          <button
            type="button"
            onClick={loadCollections}
            disabled={loading}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white transition-colors"
            title="Reload collections"
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
            placeholder="Search collections or owners..."
            className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-[#1020F5]"
          />
        </div>
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-white/50 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#93C5FD]" />
          <span>Loading collections...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-400 text-xs">{error}</div>
      ) : filteredCollections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollections.map((col) => {
            const isBusy = busyId === col.id;

            return (
              <div
                key={col.id}
                className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                        col.isPublic
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {col.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{col.isPublic ? 'Public' : 'Private'}</span>
                    </span>

                    <span className="text-[11px] text-white/40">
                      {col.itemCount || 0} items
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white truncate">{col.name}</h3>
                  <p className="text-xs text-white/60 line-clamp-2 mt-1">
                    {col.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-white/50">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">
                      @{col.ownerUsername || 'creator'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCollection(col)}
                    disabled={isBusy}
                    className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                    title="Delete collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-white/50 rounded-2xl bg-white/[0.02] border border-white/10">
          No collections match the search query.
        </div>
      )}
    </div>
  );
}
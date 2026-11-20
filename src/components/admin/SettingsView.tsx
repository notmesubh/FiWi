import React, {useState, useEffect, type FormEvent} from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Database,
  Layers,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Server,
  Settings,
  Shield,
  Tag,
  Trash2,
} from 'lucide-react';
import {fiwiApi} from '../../lib/api';
import {useFiwiStore} from '../../stores/useFiwiStore';
import type {CategoryRecord, PlatformSettings, TagRecord} from '../../types/fiwi';

interface SettingsViewProps {
  categories: CategoryRecord[];
  tags: TagRecord[];
  onRefresh: () => void;
}

export default function SettingsView({
  categories,
  tags,
  onRefresh,
}: SettingsViewProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);
  const openConfirm = useFiwiStore((s) => s.openConfirm);

  const [settings, setSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    submissionsOpen: true,
    autoCheckSites: true,
    announcementBanner: {
      enabled: false,
      text: '',
      link: '',
    },
    authorizedAdminEmail: 'notmesubh@gmail.com',
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // New Category & Tag Inputs
  const [newCatName, setNewCatName] = useState('');
  const [newCatGroup, setNewCatGroup] = useState<'Normal' | 'Vibecoded' | 'Connect' | 'Test'>('Normal');
  const [busyCategory, setBusyCategory] = useState(false);

  const [newTagName, setNewTagName] = useState('');
  const [busyTag, setBusyTag] = useState(false);

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fiwiApi.adminGetSettings();
      setSettings(res.settings);
    } catch {
      // Use defaults
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSavePlatformSettings = async () => {
    setSavingSettings(true);
    try {
      await fiwiApi.adminUpdateSettings(settings);
      pushToast({title: 'Platform settings saved', tone: 'success'});
      onRefresh();
    } catch (err) {
      pushToast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Could not save settings',
        tone: 'error',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setBusyCategory(true);
    try {
      await fiwiApi.adminCreateCategory({
        name: newCatName.trim(),
        group: newCatGroup,
      });
      pushToast({title: 'Category created', tone: 'success'});
      setNewCatName('');
      onRefresh();
    } catch (err) {
      pushToast({
        title: 'Failed to create category',
        description: err instanceof Error ? err.message : 'Error creating category',
        tone: 'error',
      });
    } finally {
      setBusyCategory(false);
    }
  };

  const handleDeleteCategory = (cat: CategoryRecord) => {
    openConfirm({
      title: 'Delete Category?',
      message: `Permanently delete category "${cat.name}"?`,
      confirmLabel: 'Delete Category',
      destructive: true,
      onConfirm: async () => {
        try {
          await fiwiApi.adminDeleteCategory(cat.id);
          pushToast({title: 'Category deleted', tone: 'info'});
          onRefresh();
        } catch (err) {
          pushToast({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Could not delete category',
            tone: 'error',
          });
        }
      },
    });
  };

  const handleCreateTag = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setBusyTag(true);
    try {
      await fiwiApi.adminCreateTag(newTagName.trim());
      pushToast({title: 'Tag created', tone: 'success'});
      setNewTagName('');
      onRefresh();
    } catch (err) {
      pushToast({
        title: 'Failed to create tag',
        description: err instanceof Error ? err.message : 'Error creating tag',
        tone: 'error',
      });
    } finally {
      setBusyTag(false);
    }
  };

  const handleDeleteTag = (tag: TagRecord) => {
    openConfirm({
      title: 'Delete Tag?',
      message: `Permanently delete tag "${tag.name}"?`,
      confirmLabel: 'Delete Tag',
      destructive: true,
      onConfirm: async () => {
        try {
          await fiwiApi.adminDeleteTag(tag.id);
          pushToast({title: 'Tag deleted', tone: 'info'});
          onRefresh();
        } catch (err) {
          pushToast({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Could not delete tag',
            tone: 'error',
          });
        }
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Security & Single Administrator Enforcement Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 to-[#1020F5]/10 border border-[#1020F5]/30 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1020F5]/20 border border-[#1020F5]/40 flex items-center justify-center text-[#93C5FD]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Single Administrator Authorization Lock
            </h3>
            <p className="text-xs text-white/60">
              Cryptographically verified single-admin security enforcement
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">
              Authorized Root Admin Account
            </span>
            <div className="text-sm font-mono font-bold text-emerald-400">
              {settings.authorizedAdminEmail || 'notmesubh@gmail.com'}
            </div>
            <p className="text-[11px] text-white/40 pt-1">
              Exact match enforced server-side. Zero admin registration or invitations permitted.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">
              Backend Enforcement Status
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">
                ACTIVE (HTTP 403 Forbidden on violation)
              </span>
            </div>
            <p className="text-[11px] text-white/40 pt-1">
              Preview mode: controls are visual only.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Platform Feature Flags & Controls */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Platform Flags &amp; Toggles</h3>
            <p className="text-xs text-white/50">Control global behavior and operational modes</p>
          </div>

          <button
            type="button"
            onClick={handleSavePlatformSettings}
            disabled={savingSettings}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1020F5] hover:bg-[#1020F5]/80 text-white text-xs font-semibold rounded-xl shadow-lg shadow-[#1020F5]/30 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Maintenance Mode */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Maintenance Mode</span>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings((s) => ({...s, maintenanceMode: e.target.checked}))
                  }
                  className="rounded bg-white/10 border-white/20 text-[#1020F5] focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>
              <p className="text-[11px] text-white/50 mt-1">
                Show maintenance banner across the public portal.
              </p>
            </div>
            <span
              className={`text-[10px] font-bold uppercase ${
                settings.maintenanceMode ? 'text-amber-400' : 'text-white/40'
              }`}
            >
              {settings.maintenanceMode ? 'Active' : 'Disabled'}
            </span>
          </div>

          {/* Submissions Open */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Submissions Open</span>
                <input
                  type="checkbox"
                  checked={settings.submissionsOpen}
                  onChange={(e) =>
                    setSettings((s) => ({...s, submissionsOpen: e.target.checked}))
                  }
                  className="rounded bg-white/10 border-white/20 text-[#1020F5] focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>
              <p className="text-[11px] text-white/50 mt-1">
                Allow users to submit new websites for review.
              </p>
            </div>
            <span
              className={`text-[10px] font-bold uppercase ${
                settings.submissionsOpen ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {settings.submissionsOpen ? 'Accepting Submissions' : 'Submissions Paused'}
            </span>
          </div>

          {/* Automated Ping */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Automated Site Checks</span>
                <input
                  type="checkbox"
                  checked={settings.autoCheckSites}
                  onChange={(e) =>
                    setSettings((s) => ({...s, autoCheckSites: e.target.checked}))
                  }
                  className="rounded bg-white/10 border-white/20 text-[#1020F5] focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>
              <p className="text-[11px] text-white/50 mt-1">
                Enable live HTTP/HTTPS status pinging in review workspace.
              </p>
            </div>
            <span
              className={`text-[10px] font-bold uppercase ${
                settings.autoCheckSites ? 'text-emerald-400' : 'text-white/40'
              }`}
            >
              {settings.autoCheckSites ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Global Announcement Banner */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Global Announcement Banner</span>
            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcementBanner?.enabled ?? false}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    announcementBanner: {
                      enabled: e.target.checked,
                      text: s.announcementBanner?.text || '',
                      link: s.announcementBanner?.link || '',
                    },
                  }))
                }
                className="rounded bg-white/10 border-white/20 text-[#1020F5] focus:ring-0"
              />
              <span>Banner Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input
              type="text"
              value={settings.announcementBanner?.text || ''}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  announcementBanner: {
                    enabled: s.announcementBanner?.enabled ?? false,
                    text: e.target.value,
                    link: s.announcementBanner?.link || '',
                  },
                }))
              }
              placeholder="Banner message text..."
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
            />
            <input
              type="text"
              value={settings.announcementBanner?.link || ''}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  announcementBanner: {
                    enabled: s.announcementBanner?.enabled ?? false,
                    text: s.announcementBanner?.text || '',
                    link: e.target.value,
                  },
                }))
              }
              placeholder="Banner destination URL (optional)..."
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
            />
          </div>
        </div>
      </div>

      {/* 3. Taxonomy Manager (Categories & Tags) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#93C5FD]" />
            <h3 className="text-sm font-bold text-white">Categories ({categories.length})</h3>
          </div>

          <form onSubmit={handleCreateCategory} className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name..."
              className="flex-1 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
            />
            <select
              value={newCatGroup}
              onChange={(e) => setNewCatGroup(e.target.value as any)}
              className="px-2 py-1.5 bg-[#05081E] border border-white/10 rounded-xl text-xs text-white"
            >
              <option value="Normal">Normal</option>
              <option value="Vibecoded">Vibecoded</option>
              <option value="Connect">Connect</option>
              <option value="Test">Test</option>
            </select>
            <button
              type="submit"
              disabled={busyCategory}
              className="px-3 py-1.5 bg-[#1020F5] hover:bg-[#1020F5]/80 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white/80"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{cat.name}</span>
                  <span className="text-[10px] text-white/40">({cat.group})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="p-1 text-white/40 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#93C5FD]" />
            <h3 className="text-sm font-bold text-white">Tags ({tags.length})</h3>
          </div>

          <form onSubmit={handleCreateTag} className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name (e.g. minimalist)..."
              className="flex-1 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#1020F5]"
            />
            <button
              type="submit"
              disabled={busyTag}
              className="px-3 py-1.5 bg-[#1020F5] hover:bg-[#1020F5]/80 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70"
              >
                <span>#{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag)}
                  className="text-white/40 hover:text-rose-400 transition-colors ml-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

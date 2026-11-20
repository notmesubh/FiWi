import React, {useState, useEffect} from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {fiwiApi} from '../../lib/api';
import {useFiwiStore} from '../../stores/useFiwiStore';
import type {AdminNotification} from '../../types/fiwi';

export default function NotificationsView() {
  const pushToast = useFiwiStore((s) => s.pushToast);
  const openConfirm = useFiwiStore((s) => s.openConfirm);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New notification form modal
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'info' | 'warning' | 'alert' | 'success'>('info');
  const [recipientUserId, setRecipientUserId] = useState('');
  const [newLink, setNewLink] = useState('');
  const [busy, setBusy] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fiwiApi.adminGetNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleSendNotification = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      pushToast({title: 'Title and message are required', tone: 'error'});
      return;
    }
    setBusy(true);
    try {
      await fiwiApi.adminSendNotification({
        title: newTitle.trim(),
        message: newMessage.trim(),
        type: newType,
        recipientUserId: recipientUserId.trim() || undefined,
        link: newLink.trim() || undefined,
      });

      pushToast({title: 'Notification dispatched', tone: 'success'});
      setIsComposeOpen(false);
      setNewTitle('');
      setNewMessage('');
      setRecipientUserId('');
      setNewLink('');
      await loadNotifications();
    } catch (err) {
      pushToast({
        title: 'Dispatch failed',
        description: err instanceof Error ? err.message : 'Error sending notification',
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteNotification = (notif: AdminNotification) => {
    openConfirm({
      title: 'Delete notification?',
      message: `Delete announcement "${notif.title}"?`,
      confirmLabel: 'Delete Notification',
      destructive: true,
      onConfirm: async () => {
        try {
          await fiwiApi.adminDeleteNotification(notif.id);
          pushToast({title: 'Notification removed', tone: 'info'});
          await loadNotifications();
        } catch (err) {
          pushToast({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Error deleting notification',
            tone: 'error',
          });
        }
      },
    });
  };

  const applyTemplate = (
    template: 'approved' | 'rejected' | 'maintenance' | 'feature',
  ) => {
    if (template === 'approved') {
      setNewTitle('Listing Approved & Published! 🎉');
      setNewMessage(
        'Congratulations! Your submission has been reviewed and published to the public directory.',
      );
      setNewType('success');
    } else if (template === 'rejected') {
      setNewTitle('Submission Update Needed');
      setNewMessage(
        'Your recent submission was not approved. Please review our submission guidelines and update your metadata.',
      );
      setNewType('warning');
    } else if (template === 'maintenance') {
      setNewTitle('Scheduled Platform Maintenance');
      setNewMessage(
        'FIWI will undergo scheduled infrastructure upgrades. Brief interruptions may occur.',
      );
      setNewType('alert');
    } else if (template === 'feature') {
      setNewTitle('New Platform Features Released 🚀');
      setNewMessage(
        'Explore our newest discovery filters, enhanced vibe coding tools, and lightning-fast search.',
      );
      setNewType('info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/70">Announcements Dispatch Center</span>
          <button
            type="button"
            onClick={loadNotifications}
            disabled={loading}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1020F5] hover:bg-[#1020F5]/80 text-white text-xs font-semibold rounded-xl shadow-lg shadow-[#1020F5]/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Compose Announcement</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-white/50 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#93C5FD]" />
            <span>Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-xs">{error}</div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start justify-between gap-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                    notif.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : notif.type === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : notif.type === 'alert'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-[#1020F5]/20 text-[#93C5FD] border border-[#1020F5]/30'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{notif.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/60 uppercase font-mono">
                      {notif.type}
                    </span>
                    {notif.recipientUserId ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                        Targeted User
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                        Broadcast All
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white/70 max-w-2xl">{notif.message}</p>

                  <div className="pt-1 flex items-center gap-3 text-[11px] text-white/40">
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    {notif.link && (
                      <a
                        href={notif.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#93C5FD] hover:underline flex items-center gap-1"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteNotification(notif)}
                className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-white/50 rounded-2xl bg-white/[0.02] border border-white/10">
            No announcements dispatched yet.
          </div>
        )}
      </div>

      {/* Compose Announcement Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#05081E] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Broadcast Announcement</h3>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-white/50 block">
                Quick Preset Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTemplate('approved')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium"
                >
                  Listing Approved
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('rejected')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-medium"
                >
                  Changes Needed
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('maintenance')}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-medium"
                >
                  Maintenance
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('feature')}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-[11px] font-medium"
                >
                  Feature Release
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Announcement headline..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1">Notification Tone / Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#05081E] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                >
                  <option value="info">Info (Standard Blue)</option>
                  <option value="success">Success (Emerald)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="alert">Alert (Rose)</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 mb-1">Message Body</label>
                <textarea
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Full text of notification..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1">Recipient User ID (Optional)</label>
                  <input
                    type="text"
                    value={recipientUserId}
                    onChange={(e) => setRecipientUserId(e.target.value)}
                    placeholder="Leave empty to broadcast all"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-1">Call to Action Link (Optional)</label>
                  <input
                    type="text"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-white outline-none focus:border-[#1020F5]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1020F5] hover:bg-[#1020F5]/80 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Announcement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
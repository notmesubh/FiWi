import React from 'react';
import {
  BarChart3,
  Bell,
  CheckSquare,
  Compass,
  FileCheck2,
  FolderHeart,
  Globe,
  Layers,
  LogOut,
  Radio,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type {AdminOverviewPayload} from '../../types/fiwi';

export type AdminSection =
  | 'overview'
  | 'submissions'
  | 'websites'
  | 'users'
  | 'reports'
  | 'collections'
  | 'connect'
  | 'test'
  | 'analytics'
  | 'notifications'
  | 'logs'
  | 'settings';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  overview: AdminOverviewPayload | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onExitAdmin: () => void;
}

export default function AdminSidebar({
  activeSection,
  onSelectSection,
  overview,
  collapsed,
  onToggleCollapse,
  onExitAdmin,
}: AdminSidebarProps) {
  const pendingCount = overview?.stats?.pendingSubmissionsCount ?? 0;
  const openReportsCount = overview?.stats?.openReportsCount ?? 0;

  const navItems: Array<{
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{className?: string}>;
    badge?: number;
    badgeColor?: string;
  }> = [
    {id: 'overview', label: 'Overview', icon: BarChart3},
    {
      id: 'submissions',
      label: 'Submissions',
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-[#1020F5] text-white',
    },
    {id: 'websites', label: 'Websites Library', icon: Globe},
    {id: 'users', label: 'User Directory', icon: Users},
    {
      id: 'reports',
      label: 'Reports Center',
      icon: Shield,
      badge: openReportsCount > 0 ? openReportsCount : undefined,
      badgeColor: 'bg-rose-600 text-white',
    },
    {id: 'collections', label: 'Collections', icon: FolderHeart},
    {id: 'connect', label: 'Connect Hub', icon: Compass},
    {id: 'test', label: 'Testing Bounties', icon: CheckSquare},
    {id: 'analytics', label: 'Platform Analytics', icon: Sparkles},
    {id: 'notifications', label: 'Announcements', icon: Bell},
    {id: 'logs', label: 'Audit Logs', icon: ScrollText},
    {id: 'settings', label: 'Settings & Taxonomy', icon: Settings},
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-[#05081E]/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1020F5] to-blue-400 flex items-center justify-center shrink-0 shadow-lg shadow-[#1020F5]/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
                FIWI Admin
              </span>
              <span className="text-[10px] text-blue-300 font-mono tracking-wider">
                SUPER CONSOLE
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-[#1020F5] text-white shadow-lg shadow-[#1020F5]/25 font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'scale-110 text-white' : 'text-white/60 group-hover:text-white'
                }`}
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full leading-none shrink-0 ${
                    item.badgeColor || 'bg-white/15 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Identity & Exit Footer */}
      <div className="p-3 border-t border-white/10 bg-black/20 space-y-2">
        {!collapsed && (
          <div className="px-2 py-2 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] font-medium text-white/90 truncate">
                notmesubh@gmail.com
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5 pl-4">
              Authorized Root Admin
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title="Exit to FIWI Platform"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Back to FIWI</span>}
        </button>
      </div>
    </aside>
  );
}
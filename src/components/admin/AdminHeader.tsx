import React from 'react';
import {
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertTriangle,
  Database,
  Radio,
} from 'lucide-react';
import type {AdminSection} from './AdminSidebar';
import type {PlatformSettings} from '../../types/fiwi';

interface AdminHeaderProps {
  activeSection: AdminSection;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  settings?: PlatformSettings;
  sidebarCollapsed: boolean;
}

const SECTION_TITLES: Record<AdminSection, {title: string; subtitle: string}> = {
  overview: {
    title: 'Platform Overview & Live Analytics',
    subtitle: 'Real-time telemetry, platform growth, and core platform vital statistics.',
  },
  submissions: {
    title: 'Website Moderation Workspace',
    subtitle: 'Review, approve, request revisions, or reject submitted sites for the public directory.',
  },
  websites: {
    title: 'Published Website Directory',
    subtitle: 'Manage live listings, featured highlights, category assignments, and metadata.',
  },
  users: {
    title: 'User Management & Security',
    subtitle: 'Browse all registered accounts, manage suspension status, and enforce account boundaries.',
  },
  reports: {
    title: 'Reports & Moderation Desk',
    subtitle: 'Investigate reported spam, broken links, copyright claims, and community flags.',
  },
  collections: {
    title: 'Collections Registry',
    subtitle: 'Inspect public and private user collections and purge violating content.',
  },
  connect: {
    title: 'Connect Opportunities',
    subtitle: 'Monitor and moderate founder, dev, and designer collaboration listings.',
  },
  test: {
    title: 'Testing Bounties & Scope',
    subtitle: 'Verify website testing submissions, reward amounts, and authorized proof files.',
  },
  analytics: {
    title: 'Deep Analytics & Metrics',
    subtitle: 'Explore user adoption curves, submission conversion rates, and popularity cohorts.',
  },
  notifications: {
    title: 'Platform Announcements',
    subtitle: 'Broadcast global alerts, system notices, and targeted moderation messages.',
  },
  logs: {
    title: 'Security Audit Trail',
    subtitle: 'Immutable chronological record of administrative actions, edits, and state transitions.',
  },
  settings: {
    title: 'System Settings & Taxonomy',
    subtitle: 'Configure platform flags, categories, tags, and verify single-admin access.',
  },
};

export default function AdminHeader({
  activeSection,
  searchQuery,
  onSearchChange,
  onRefresh,
  refreshing,
  settings,
  sidebarCollapsed,
}: AdminHeaderProps) {
  const current = SECTION_TITLES[activeSection] || {
    title: 'Admin Console',
    subtitle: 'Platform control center',
  };

  return (
    <header className="sticky top-0 z-30 bg-[#02031A]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white tracking-tight font-sans">
            {current.title}
          </h1>
          {settings?.maintenanceMode && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              MAINTENANCE MODE
            </span>
          )}
        </div>
        <p className="text-xs text-white/50 mt-0.5">{current.subtitle}</p>
      </div>

      {/* Global Search & System Badges */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Search Bar */}
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records, users, URLs..."
            className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.08] text-xs text-white placeholder-white/40 border border-white/10 focus:border-[#1020F5] rounded-xl outline-none transition-colors"
          />
        </div>

        {/* Real-time sync badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-emerald-400">
          <Database className="w-3.5 h-3.5" />
          <span>DB Connected</span>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#93C5FD]' : ''}`} />
          <span>Sync</span>
        </button>

        {/* Live Site Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1020F5]/20 hover:bg-[#1020F5]/30 border border-[#1020F5]/40 text-xs font-medium text-[#93C5FD] hover:text-white transition-colors"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
}
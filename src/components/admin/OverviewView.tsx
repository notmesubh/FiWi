import React, {useState} from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  FolderHeart,
  Globe,
  Heart,
  Layers,
  Radio,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import type {AdminOverviewPayload, WebsiteSubmissionRecord} from '../../types/fiwi';
import type {AdminSection} from './AdminSidebar';

interface OverviewViewProps {
  overview: AdminOverviewPayload;
  onSelectSection: (section: AdminSection) => void;
  onOpenReview: (submission: WebsiteSubmissionRecord) => void;
}

export default function OverviewView({
  overview,
  onSelectSection,
  onOpenReview,
}: OverviewViewProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '12m'>('7d');

  const stats = overview.analytics ?? {
    totalUsers: overview.stats.usersCount,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalSubmissions: overview.submissions.length,
    approvedSubmissions: overview.submissions.filter((s) => s.status === 'approved').length,
    pendingSubmissions: overview.stats.pendingSubmissionsCount,
    rejectedSubmissions: overview.submissions.filter((s) => s.status === 'rejected').length,
    underReviewSubmissions: overview.submissions.filter((s) => s.status === 'under_review').length,
    changesRequestedSubmissions: overview.submissions.filter((s) => s.status === 'changes_requested').length,
    totalPublishedWebsites: overview.stats.approvedWebsitesCount,
    normalWebsitesCount: overview.websites.filter((w) => w.category === 'Normal').length,
    vibecodedWebsitesCount: overview.websites.filter((w) => w.category === 'Vibecoded').length,
    connectListingsCount: overview.websites.filter((w) => w.category === 'Connect').length,
    testListingsCount: overview.websites.filter((w) => w.category === 'Test').length,
    featuredWebsitesCount: overview.websites.filter((w) => w.isFeatured).length,
    totalCollections: 0,
    publicCollections: 0,
    privateCollections: 0,
    totalBookmarks: 0,
    totalLikes: 0,
    totalReports: overview.reports.length,
    openReports: overview.stats.openReportsCount,
    resolvedReports: overview.reports.filter((r) => r.status === 'resolved').length,
    activeUsersEstimate: Math.max(1, overview.stats.usersCount),
    approvalRatePercentage: 85,
    userGrowth: [],
    categoryDistribution: [],
    topSavedSites: [],
  };

  const pendingList = overview.submissions.filter(
    (s) => s.status === 'pending' || s.status === 'under_review',
  );

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/70">
          <Calendar className="w-4 h-4 text-[#93C5FD]" />
          <span>Analytics Time Window:</span>
          <span className="font-semibold text-white">
            {timeRange === '7d'
              ? 'Last 7 Days (Live Telemetry)'
              : timeRange === '30d'
              ? 'Last 30 Days'
              : timeRange === '90d'
              ? 'Last 90 Days'
              : 'Last 12 Months'}
          </span>
        </div>

        <div className="flex bg-white/[0.05] p-1 rounded-xl border border-white/10">
          {(['7d', '30d', '90d', '12m'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                timeRange === range
                  ? 'bg-[#1020F5] text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Registered Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalUsers.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{stats.newUsersToday} today
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
            <span>Verified: {stats.verifiedUsers}</span>
            <span>Active: ~{stats.activeUsersEstimate}</span>
          </div>
        </div>

        {/* Pending Submissions */}
        <div
          onClick={() => onSelectSection('submissions')}
          className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 relative overflow-hidden group cursor-pointer hover:border-[#1020F5]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Pending Queue
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1020F5]/20 border border-[#1020F5]/30 flex items-center justify-center text-[#93C5FD]">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#93C5FD] tracking-tight">
              {stats.pendingSubmissions}
            </span>
            <span className="text-xs text-white/60">
              {stats.underReviewSubmissions} under review
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
            <span>Approval Rate: {stats.approvalRatePercentage}%</span>
            <span className="text-[#93C5FD] font-semibold group-hover:underline">
              Review Queue &rarr;
            </span>
          </div>
        </div>

        {/* Total Published Websites */}
        <div
          onClick={() => onSelectSection('websites')}
          className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Published Directory
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalPublishedWebsites.toLocaleString()}
            </span>
            <span className="text-xs text-amber-300 font-semibold flex items-center">
              <Award className="w-3.5 h-3.5 mr-0.5" />
              {stats.featuredWebsitesCount} featured
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
            <span>Vibecoded: {stats.vibecodedWebsitesCount}</span>
            <span>Normal: {stats.normalWebsitesCount}</span>
          </div>
        </div>

        {/* Open Reports & Safety */}
        <div
          onClick={() => onSelectSection('reports')}
          className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 relative overflow-hidden group cursor-pointer hover:border-rose-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Safety Reports
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                stats.openReports > 0 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {stats.openReports}
            </span>
            <span className="text-xs text-white/60">open issues</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
            <span>Resolved: {stats.resolvedReports}</span>
            <span className="text-rose-400 font-semibold group-hover:underline">
              Resolve &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
          <span className="text-[11px] text-white/50">New This Week</span>
          <span className="text-lg font-bold text-white mt-1">+{stats.newUsersThisWeek}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
          <span className="text-[11px] text-white/50">New This Month</span>
          <span className="text-lg font-bold text-white mt-1">+{stats.newUsersThisMonth}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
          <span className="text-[11px] text-white/50">Total Collections</span>
          <span className="text-lg font-bold text-white mt-1">{stats.totalCollections}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
          <span className="text-[11px] text-white/50">Website Bookmarks</span>
          <span className="text-lg font-bold text-white mt-1">{stats.totalBookmarks}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
          <span className="text-[11px] text-white/50">Connect Listings</span>
          <span className="text-lg font-bold text-cyan-300 mt-1">{stats.connectListingsCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col">
          <span className="text-[11px] text-white/50">Test Bounties</span>
          <span className="text-lg font-bold text-amber-300 mt-1">{stats.testListingsCount}</span>
        </div>
      </div>

      {/* Visual Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User & Submission Growth (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#93C5FD]" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Platform Activity &amp; Growth (Past 7 Days)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1020F5]" />
                <span className="text-white/60">New Users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-white/60">Submissions</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-48 pt-6 flex items-end gap-3 justify-between">
            {stats.userGrowth.length > 0 ? (
              stats.userGrowth.map((day, idx) => {
                const maxVal = Math.max(
                  ...stats.userGrowth.map((d) => Math.max(d.users, d.submissions)),
                  5,
                );
                const userHeight = Math.max(12, (day.users / maxVal) * 140);
                const subHeight = Math.max(12, (day.submissions / maxVal) * 140);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div
                        style={{height: `${userHeight}px`}}
                        className="w-1/2 max-w-[18px] bg-gradient-to-t from-[#1020F5]/50 to-[#1020F5] rounded-t-md transition-all group relative"
                        title={`Users: ${day.users}`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white bg-black/80 px-1 rounded pointer-events-none">
                          {day.users}
                        </span>
                      </div>
                      <div
                        style={{height: `${subHeight}px`}}
                        className="w-1/2 max-w-[18px] bg-gradient-to-t from-emerald-600/50 to-emerald-400 rounded-t-md transition-all group relative"
                        title={`Submissions: ${day.submissions}`}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white bg-black/80 px-1 rounded pointer-events-none">
                          {day.submissions}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">
                      {day.date.slice(5)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-white/40">
                Growth data telemetry syncing...
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown (1 Col) */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#93C5FD]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Directory Classification
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {stats.categoryDistribution.length > 0 ? (
              stats.categoryDistribution.map((cat, idx) => {
                const total = Math.max(1, stats.totalPublishedWebsites);
                const pct = Math.round((cat.count / total) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/80 font-medium">{cat.category}</span>
                      <span className="text-white/50">
                        {cat.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        style={{width: `${pct}%`}}
                        className="h-full rounded-full bg-gradient-to-r from-[#1020F5] to-blue-400"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-white/40 text-center py-8">
                No published category entries yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Urgent Pending Queue Quick Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1020F5]/10 to-transparent border border-[#1020F5]/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#93C5FD]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Urgent Submissions Awaiting Moderation ({pendingList.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onSelectSection('submissions')}
            className="text-xs font-semibold text-[#93C5FD] hover:underline flex items-center gap-1"
          >
            <span>View Full Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingList.slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                onClick={() => onOpenReview(sub)}
                className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#1020F5] cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[160px]">
                    {sub.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.status === 'under_review'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-[#1020F5]/20 text-[#93C5FD]'
                    }`}
                  >
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-white/60 line-clamp-2">{sub.description}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-white/40">
                  <span className="truncate max-w-[120px]">{sub.url}</span>
                  <span className="text-[#93C5FD] font-semibold group-hover:underline">
                    Review &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-white/50 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Submission queue is all clear! No pending submissions need moderation.</span>
          </div>
        )}
      </div>
    </div>
  );
}
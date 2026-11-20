import React, {useState, useEffect, useCallback} from 'react';
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Shield,
  WifiOff,
} from 'lucide-react';
import {fiwiApi} from '../lib/api';
import {useFiwiStore} from '../stores/useFiwiStore';
import type {
  AdminOverviewPayload,
  FiwiUser,
  WebsiteSubmissionRecord,
} from '../types/fiwi';

import AdminSidebar, {type AdminSection} from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import ReviewModal from './admin/ReviewModal';
import OverviewView from './admin/OverviewView';
import SubmissionsView from './admin/SubmissionsView';
import WebsitesView from './admin/WebsitesView';
import UsersView from './admin/UsersView';
import ReportsView from './admin/ReportsView';
import CollectionsView from './admin/CollectionsView';
import NotificationsView from './admin/NotificationsView';
import ActivityLogsView from './admin/ActivityLogsView';
import SettingsView from './admin/SettingsView';

const AUTHORIZED_ADMIN_EMAIL = 'notmesubh@gmail.com';

interface AdminDashboardProps {
  user: FiwiUser | null;
  onBack: () => void;
  onRefreshPublicLibrary: () => void;
  onLoginSuccess?: () => void;
}

export default function AdminDashboard({
  user,
  onBack,
  onRefreshPublicLibrary,
}: AdminDashboardProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);

  const isAuthorizedAdmin =
    user?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() &&
    user?.isAdmin;

  // If a user with another email or unauthenticated visits, redirect immediately to hero
  useEffect(() => {
    if (!isAuthorizedAdmin) {
      onBack();
    }
  }, [isAuthorizedAdmin, onBack]);

  // Dashboard state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AdminOverviewPayload | null>(null);

  // Navigation & layout state
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Active Review Workspace modal
  const [activeReviewSubmission, setActiveReviewSubmission] =
    useState<WebsiteSubmissionRecord | null>(null);

  const loadAdminData = useCallback(async (isBackground = false) => {
    if (!isAuthorizedAdmin) {
      setLoading(false);
      return;
    }

    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const data = await fiwiApi.getAdminOverview();
      setOverview(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to connect to admin console.';
      setError(message);
      pushToast({
        title: 'Admin connection error',
        description: message,
        tone: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthorizedAdmin, pushToast]);

  useEffect(() => {
    if (isAuthorizedAdmin) {
      void loadAdminData();
    }
  }, [isAuthorizedAdmin, loadAdminData]);

  if (!isAuthorizedAdmin) {
    return null;
  }

  const handleRefreshAll = () => {
    void loadAdminData(true);
    onRefreshPublicLibrary();
  };

  return (
    <div className="min-h-screen w-full bg-[#02031A] text-white flex">
      {/* 1. Fixed Admin Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          window.scrollTo(0, 0);
        }}
        overview={overview}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onExitAdmin={onBack}
      />

      {/* 2. Main Content Canvas */}
      <main
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Admin Header */}
        <AdminHeader
          activeSection={activeSection}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onRefresh={handleRefreshAll}
          refreshing={refreshing}
          settings={overview?.settings}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Content Body */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {loading ? (
            <div className="min-h-[500px] flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1020F5]/20 border border-[#1020F5]/40 flex items-center justify-center text-[#93C5FD]">
                <Loader2 className="w-6 h-6 animate-spin text-[#1020F5]" />
              </div>
              <span className="text-sm font-semibold text-white">
                Initializing FIWI Super Admin Console...
              </span>
              <span className="text-xs text-white/50">
                Verifying authorization credentials for {AUTHORIZED_ADMIN_EMAIL}
              </span>
            </div>
          ) : error ? (
            <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center max-w-md mx-auto my-12 space-y-3">
              <WifiOff className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-base font-bold text-white">Admin Connection Failed</h2>
              <p className="text-xs text-white/70">{error}</p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => loadAdminData()}
                  className="px-4 py-2 bg-[#1020F5] hover:bg-[#1020F5]/80 text-white text-xs font-semibold rounded-xl shadow"
                >
                  Retry Connection
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl"
                >
                  Back to FIWI
                </button>
              </div>
            </div>
          ) : overview ? (
            <>
              {/* Dynamic Section Views */}
              {activeSection === 'overview' && (
                <OverviewView
                  overview={overview}
                  onSelectSection={(sec) => setActiveSection(sec)}
                  onOpenReview={(sub) => setActiveReviewSubmission(sub)}
                />
              )}

              {activeSection === 'submissions' && (
                <SubmissionsView
                  submissions={overview.submissions}
                  onOpenReview={(sub) => setActiveReviewSubmission(sub)}
                  onRefresh={handleRefreshAll}
                />
              )}

              {activeSection === 'websites' && (
                <WebsitesView
                  websites={overview.websites}
                  onRefresh={handleRefreshAll}
                />
              )}

              {activeSection === 'users' && (
                <UsersView onRefreshStats={handleRefreshAll} />
              )}

              {activeSection === 'reports' && (
                <ReportsView
                  reports={overview.reports}
                  onRefresh={handleRefreshAll}
                />
              )}

              {activeSection === 'collections' && <CollectionsView />}

              {activeSection === 'connect' && (
                <WebsitesView
                  websites={overview.websites.filter((w) => w.category === 'Connect')}
                  onRefresh={handleRefreshAll}
                  sectionFilter="Connect"
                />
              )}

              {activeSection === 'test' && (
                <WebsitesView
                  websites={overview.websites.filter((w) => w.category === 'Test')}
                  onRefresh={handleRefreshAll}
                  sectionFilter="Test"
                />
              )}

              {activeSection === 'analytics' && (
                <OverviewView
                  overview={overview}
                  onSelectSection={(sec) => setActiveSection(sec)}
                  onOpenReview={(sub) => setActiveReviewSubmission(sub)}
                />
              )}

              {activeSection === 'notifications' && <NotificationsView />}

              {activeSection === 'logs' && <ActivityLogsView />}

              {activeSection === 'settings' && (
                <SettingsView
                  categories={overview.categories}
                  tags={overview.tags}
                  onRefresh={handleRefreshAll}
                />
              )}
            </>
          ) : null}
        </div>
      </main>

      {/* 3. Detailed Review Workspace Modal */}
      {activeReviewSubmission && (
        <ReviewModal
          submission={activeReviewSubmission}
          onClose={() => setActiveReviewSubmission(null)}
          onRefresh={handleRefreshAll}
        />
      )}
    </div>
  );
}
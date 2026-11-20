/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {MotionConfig, AnimatePresence, motion} from 'motion/react';
import {installLiquidGlassPointerEffect} from './lib/liquidGlass';
import {
  AlertCircle,
  ArrowUpDown,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  EyeOff,
  FileEdit,
  FolderOpen,
  FolderPlus,
  Globe,
  Heart,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  MailCheck,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sun,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {
  FIWI_TAP,
  fiwiModalBackdropVariants,
  fiwiPanelRevealVariants,
  fiwiPopoverVariants,
} from './lib/motion';
import grasslandImg from './assets/images/fiwi_grassland_horizon_1794735029180.jpg';
import grasslandWebp from './assets/images/fiwi_grassland_horizon_1794735029180.webp';
import type {BillingCycle, PlanId} from './components/PricingSection';
import HeroBackdrop from './components/HeroBackdrop';
import PrimaryNavbar from './components/PrimaryNavbar';
import {
  AboutHeader,
  BlogHeader,
  ContactHeader,
  DocsHeader,
  LegalHeader,
} from './components/PageHeaders';
import Footer, {type FooterRoute} from './components/Footer';
import ToastViewport from './components/ui/ToastViewport';
import ConfirmDialog from './components/ui/ConfirmDialog';
import {AI_TOOLS_OPTIONS, type SubmitCategoryId} from './components/submit/submitData';
import {fiwiApi, uploadMediaFile} from './lib/api';
import {
  exchangeAuthCode,
  getActiveSession,
  getSupabaseClient,
  isClientSupabaseConfigured,
  requestPasswordReset,
  resendVerificationEmail,
  signInWithGoogle,
  signInWithSupabase,
  signOutFromSupabase,
  signUpWithSupabase,
  updateAccountPassword,
  verifyAuthOtp,
} from './lib/supabaseClient';
import {useFiwiStore} from './stores/useFiwiStore';
import {
  PLAN_SAVE_DESCRIPTIONS,
  PLAN_SAVE_LIMITS,
  SHOWCASE_CATEGORIES,
  type PlanTierId,
  type SavedSite,
  type ShowcaseCategory,
  type SiteCategory,
  type SubmittedSite,
  type WebsiteSubmissionRecord,
} from './types/fiwi';

const PricingSection = lazy(() => import('./components/PricingSection'));
const SearchShowcaseSection = lazy(() => import('./components/SearchShowcaseSection'));
const CategoriesShowcaseSection = lazy(() => import('./components/CategoriesShowcaseSection'));
const FaqSection = lazy(() => import('./components/FaqSection'));
const BlogPage = lazy(() => import('./components/BlogPage'));
const DocsPage = lazy(() => import('./components/DocsPage'));
const AboutPage = lazy(() =>
  import('./components/InfoPages').then((mod) => ({default: mod.AboutPage})),
);
const ContactPage = lazy(() =>
  import('./components/InfoPages').then((mod) => ({default: mod.ContactPage})),
);
const LegalPage = lazy(() =>
  import('./components/InfoPages').then((mod) => ({default: mod.LegalPage})),
);
const SiteDetailModal = lazy(() => import('./components/SiteDetailModal'));
const SubmitWebsiteFlow = lazy(() => import('./components/submit/SubmitWebsiteFlow'));
const PublicProfilePage = lazy(() => import('./components/PublicProfilePage'));
const CollectionPage = lazy(() => import('./components/CollectionPage'));
const MySubmissionsSection = lazy(() => import('./components/MySubmissionsSection'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const WebsiteDetailPage = lazy(() => import('./components/WebsiteDetailPage'));
import { SiteCard } from './components/SiteCard';

type FilterTab = 'All' | SiteCategory;
type LibraryPage = 'Hero' | FilterTab;
type ActiveView =
  | 'library'
  | 'pricing'
  | 'auth'
  | 'reset-password'
  | 'submit'
  | 'my-submissions'
  | 'saved'
  | 'collection'
  | 'profile'
  | 'settings'
  | 'admin'
  | 'blog'
  | 'docs'
  | 'about'
  | 'contact'
  | 'legal'
  | 'site';
type AuthMode = 'login' | 'signup' | 'forgot' | 'verify';

export interface PendingAuthAction {
  type:
    | 'library'
    | 'save_site'
    | 'submit'
    | 'saved'
    | 'my-submissions'
    | 'settings'
    | 'admin'
    | 'site'
    | 'collection';
  site?: SubmittedSite;
  siteId?: string;
  collectionSlug?: string;
  returnView?: ActiveView;
}

const PENDING_ACTION_STORAGE_KEY = 'fiwi_pending_auth_action';

function getStoredPendingAction(): PendingAuthAction | null { return null; }
function setStoredPendingAction(_action: PendingAuthAction | null): void {}

function GoogleIcon({className = 'w-4 h-4'}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

const NAV_ITEMS: {label: string; tab: FilterTab}[] = [
  {label: 'All', tab: 'All'},
  {label: 'Normal', tab: 'Normal'},
  {label: 'Vibecoded', tab: 'Vibecoded'},
  {label: 'Connect', tab: 'Connect'},
  {label: 'Test', tab: 'Test'},
];

const FILTER_TABS: FilterTab[] = ['All', 'Normal', 'Vibecoded', 'Connect', 'Test'];
const INITIAL_GRID_BATCH = 16;

const PAGE_COPY: Record<LibraryPage, {hero: string; subtext: string}> = {
  Hero: {
    hero: 'Every site worth seeing.',
    subtext:
      'A curated platform for discovering, exploring, and sharing websites from across the internet.',
  },
  All: {
    hero: 'Where the web comes together.',
    subtext:
      'Explore the Normal collection, Vibecoded AI-built projects, Connect collaboration opportunities, and authorized Test listings in one organized library.',
  },
  Normal: {
    hero: 'Discover the internet, differently.',
    subtext:
      'Explore traditional websites, beautifully designed SaaS products, and creative studios curated across the web.',
  },
  Vibecoded: {
    hero: 'Built with AI. Made to inspire.',
    subtext:
      'Explore AI-generated projects alongside the tools, tech stacks, prompts, and building insights behind them.',
  },
  Connect: {
    hero: 'Great ideas deserve great collaborators.',
    subtext:
      'Find collaboration opportunities, discover people to build with, and connect directly with creators.',
  },
  Test: {
    hero: 'Find it. Test it. Make it better.',
    subtext:
      'Discover authorized website testing opportunities, review testing scope, and help creators strengthen real-world products.',
  },
};

export default function App() {
  const supabaseConfigured = useFiwiStore((s) => s.supabaseConfigured);
  const schemaReady = useFiwiStore((s) => s.schemaReady);
  const configChecked = useFiwiStore((s) => s.configChecked);
  const user = useFiwiStore((s) => s.user);
  const collections = useFiwiStore((s) => s.collections);
  const savedSites = useFiwiStore((s) => s.savedSites);
  const mySubmissions = useFiwiStore((s) => s.mySubmissions);

  const setHealthStatus = useFiwiStore((s) => s.setHealthStatus);
  const setAuthInitialized = useFiwiStore((s) => s.setAuthInitialized);
  const setPasswordRecoveryMode = useFiwiStore((s) => s.setPasswordRecoveryMode);
  const setUser = useFiwiStore((s) => s.setUser);
  const setCollections = useFiwiStore((s) => s.setCollections);
  const setSavedSites = useFiwiStore((s) => s.setSavedSites);
  const refreshUserWorkspace = useFiwiStore((s) => s.refreshUserWorkspace);
  const clearUserWorkspace = useFiwiStore((s) => s.clearUserWorkspace);
  const pushToast = useFiwiStore((s) => s.pushToast);
  const openConfirm = useFiwiStore((s) => s.openConfirm);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [activePage, setActivePage] = useState<LibraryPage>('Hero');
  const [tileFilter, setTileFilter] = useState<FilterTab>('All');
  const [subCategoryFilter, setSubCategoryFilter] = useState<ShowcaseCategory | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('library');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const [librarySites, setLibrarySites] = useState<SubmittedSite[]>([]);
  const [libraryTotal, setLibraryTotal] = useState(0);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryLoadingMore, setLibraryLoadingMore] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [librarySort, setLibrarySort] = useState<'newest' | 'popular' | 'title'>('newest');
  const [libraryAiToolFilter, setLibraryAiToolFilter] = useState<string>('');
  const [libraryTagFilter, setLibraryTagFilter] = useState<string>('');
  const [libraryReloadToken, setLibraryReloadToken] = useState(0);

  // Route targets
  const [activeProfileUsername, setActiveProfileUsername] = useState<string>('');
  const [activeCollectionSlug, setActiveCollectionSlug] = useState<string>('');
  const [editingSubmission, setEditingSubmission] = useState<WebsiteSubmissionRecord | null>(null);
  const [activeSiteDetail, setActiveSiteDetail] = useState<SubmittedSite | null>(null);

  // Detail modal
  const [selectedDetailTarget, setSelectedDetailTarget] = useState<{
    site: SubmittedSite | null;
    savedRecord: SavedSite | null;
  } | null>(null);

  // Saved / collections management UI
  const [activeCollectionId, setActiveCollectionId] = useState<string>('all');
  const [savedCategoryFilter, setSavedCategoryFilter] = useState<ShowcaseCategory | null>(null);
  const [savedVisibleCount, setSavedVisibleCount] = useState(INITIAL_GRID_BATCH);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState('');
  const [showQuickSave, setShowQuickSave] = useState(false);
  const [quickSaveTitle, setQuickSaveTitle] = useState('');
  const [quickSaveUrl, setQuickSaveUrl] = useState('');
  const [quickSaveCategory, setQuickSaveCategory] = useState<ShowcaseCategory>('Business & SaaS');
  const [quickSaveCollectionId, setQuickSaveCollectionId] = useState<string>('');
  const [quickSaveSubmitting, setQuickSaveSubmitting] = useState(false);
  const [quickSaveError, setQuickSaveError] = useState<string | null>(null);
  const [saveLimitNotice, setSaveLimitNotice] = useState<string | null>(null);

  const [postAuthRedirect, setPostAuthRedirect] = useState<
    'library' | 'saved' | 'submit' | 'my-submissions' | 'admin' | null
  >(null);

  // Settings form state
  const [settingsName, setSettingsName] = useState('');
  const [settingsHandle, setSettingsHandle] = useState('');
  const [settingsBio, setSettingsBio] = useState('');
  const [settingsAvatarUrl, setSettingsAvatarUrl] = useState<string | null>(null);
  const [settingsWebsite, setSettingsWebsite] = useState('');
  const [settingsGithub, setSettingsGithub] = useState('');
  const [settingsX, setSettingsX] = useState('');
  const [settingsLinkedin, setSettingsLinkedin] = useState('');
  const [settingsUploadingAvatar, setSettingsUploadingAvatar] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSavedNotice, setSettingsSavedNotice] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);

  const [isSavedIconOnWhite, setIsSavedIconOnWhite] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Auth form state
  const [authName, setAuthName] = useState('');
  const [authHandle, setAuthHandle] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    valid?: boolean;
    available?: boolean;
    reason?: string;
  }>({checking: false});
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfoNotice, setAuthInfoNotice] = useState<string | null>(null);
  const [needsVerificationEmail, setNeedsVerificationEmail] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifyingCallback, setIsVerifyingCallback] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  // Initial category hint when opening Submit flow
  const [initialSubmitCategory, setInitialSubmitCategory] = useState<SubmitCategoryId | null>(null);

  // Pricing state
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);

  const savedBtnRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const grasslandMistRef = useRef<HTMLDivElement>(null);
  const lowerWhiteSectionRef = useRef<HTMLDivElement>(null);
  const pricingSkyBandRef = useRef<HTMLDivElement>(null);
  const executePendingActionRef = useRef<(forcedRedirect?: string | null) => Promise<void>>(async () => {});
  const pricingGrasslandMistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Debounce library search input (260ms)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(librarySearchQuery.trim());
    }, 260);
    return () => window.clearTimeout(timer);
  }, [librarySearchQuery]);

  // Real-time username availability check on Sign Up
  useEffect(() => {
    if (activeView !== 'auth' || authMode !== 'signup') return;
    const raw = authHandle.trim().replace(/^@+/, '');
    if (!raw || raw.length < 3) {
      setUsernameStatus({checking: false});
      return;
    }

    let cancelled = false;
    setUsernameStatus({checking: true});
    const timer = window.setTimeout(async () => {
      try {
        const res = await fiwiApi.checkUsername(raw);
        if (cancelled) return;
        setUsernameStatus({
          checking: false,
          valid: res.valid,
          available: res.available,
          reason: res.reason,
        });
      } catch {
        if (!cancelled) {
          setUsernameStatus({checking: false});
        }
      }
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [authHandle, authMode, activeView]);

  // Bootstrap health check & Supabase auth subscription
  useEffect(() => {
    let active = true;

    fiwiApi
      .getHealth()
      .then((health) => {
        if (!active) return;
        setHealthStatus(
          Boolean(health.supabaseConfigured && isClientSupabaseConfigured),
          Boolean(health.schemaReady),
        );
      })
      .catch(() => {
        if (!active) return;
        setHealthStatus(isClientSupabaseConfigured, false);
      });

    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthInitialized(true);
      return;
    }

    supabase.auth.getSession().then(async ({data}) => {
      if (!active) return;
      if (data.session) {
        await refreshUserWorkspace();
      } else {
        clearUserWorkspace();
      }
      if (active) setAuthInitialized(true);
    });

    const {data: sub} = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryMode(true);
        setActiveView('reset-password');
        return;
      }
      if (session) {
        await refreshUserWorkspace();
        if (event === 'SIGNED_IN') {
          if (
            window.location.pathname.includes('/auth/callback') ||
            window.location.hash.includes('auth-callback') ||
            window.location.hash.toLowerCase() === '#login' ||
            window.location.hash.toLowerCase() === '#signup' ||
            window.location.hash.toLowerCase() === '#verify-email'
          ) {
            try {
              window.history.replaceState(null, '', '/');
            } catch {}
            void executePendingActionRef.current();
          }
        }
      } else {
        clearUserWorkspace();
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [
    clearUserWorkspace,
    refreshUserWorkspace,
    setAuthInitialized,
    setHealthStatus,
    setPasswordRecoveryMode,
  ]);

  useEffect(() => {
    const handleEmailNotVerified = (e: Event) => {
      const custom = e as CustomEvent<{message?: string}>;
      if (user && !user.emailVerified) {
        setNeedsVerificationEmail(user.email);
        setAuthMode('verify');
        setActiveView('auth');
        pushToast({
          tone: 'error',
          title: 'Email verification required',
          description: custom.detail?.message || `Please verify ${user.email} to continue.`,
        });
      }
    };
    window.addEventListener('fiwi:email_not_verified', handleEmailNotVerified);
    return () => window.removeEventListener('fiwi:email_not_verified', handleEmailNotVerified);
  }, [user, pushToast]);

  // Fetch public discovery websites from backend API
  const refreshPublicLibrary = useCallback(() => {
    setLibraryReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isHero = activePage === 'Hero';

    setLibraryLoading(true);
    setLibraryError(null);

    fiwiApi
      .listWebsites({
        category: isHero ? tileFilter : activePage,
        subCategory: isHero ? null : subCategoryFilter,
        q: isHero ? undefined : debouncedSearchQuery,
        aiTool: isHero || activePage !== 'Vibecoded' ? undefined : libraryAiToolFilter || undefined,
        tag: isHero ? undefined : libraryTagFilter || undefined,
        sort: isHero ? 'newest' : librarySort,
        limit: isHero ? 8 : INITIAL_GRID_BATCH,
        offset: 0,
      })
      .then((res) => {
        if (cancelled) return;
        setLibrarySites(Array.isArray(res?.items) ? res.items : []);
        setLibraryTotal(typeof res?.total === 'number' ? res.total : 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setLibrarySites([]);
        setLibraryTotal(0);
        const msg = err instanceof Error ? err.message : 'Unable to load websites.';
        setLibraryError(msg);
      })
      .finally(() => {
        if (!cancelled) setLibraryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activePage,
    tileFilter,
    subCategoryFilter,
    debouncedSearchQuery,
    libraryAiToolFilter,
    libraryTagFilter,
    librarySort,
    libraryReloadToken,
  ]);

  const handleLoadMoreLibrary = async () => {
    const currentSites = Array.isArray(librarySites) ? librarySites : [];
    if (libraryLoadingMore || currentSites.length >= libraryTotal) return;
    setLibraryLoadingMore(true);
    try {
      const res = await fiwiApi.listWebsites({
        category: activePage === 'Hero' ? tileFilter : activePage,
        subCategory: activePage === 'Hero' ? null : subCategoryFilter,
        q: activePage === 'Hero' ? undefined : debouncedSearchQuery,
        aiTool: activePage === 'Vibecoded' && libraryAiToolFilter ? libraryAiToolFilter : undefined,
        tag: libraryTagFilter || undefined,
        sort: librarySort,
        limit: INITIAL_GRID_BATCH,
        offset: currentSites.length,
      });
      const incoming = Array.isArray(res?.items) ? res.items : [];
      setLibrarySites((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const seen = new Set(safePrev.map((s) => s.id));
        return [...safePrev, ...incoming.filter((item) => !seen.has(item.id))];
      });
      setLibraryTotal(typeof res?.total === 'number' ? res.total : currentSites.length + incoming.length);
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not load more websites',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLibraryLoadingMore(false);
    }
  };

  // Sync default quick-save collection when user collections arrive
  useEffect(() => {
    if (collections.length > 0 && !collections.some((c) => c.id === quickSaveCollectionId)) {
      setQuickSaveCollectionId(collections[0].id);
    }
  }, [collections, quickSaveCollectionId]);

  const showNav =
    activeView !== 'auth' && activeView !== 'reset-password' && activeView !== 'admin';
  const isHeroView = activeView === 'library' && activePage === 'Hero';
  const hasLowerEditorialPage =
    activeView === 'blog' ||
    activeView === 'docs' ||
    activeView === 'about' ||
    activeView === 'contact' ||
    activeView === 'legal' ||
    activeView === 'site';
  const hasCompactHeroContainer = isHeroView || hasLowerEditorialPage;
  const currentCopy = PAGE_COPY[activePage];

  useLayoutEffect(() => {
    const computeContrast = () => {
      if (!showNav || theme === 'dark') {
        setIsSavedIconOnWhite((prev) => (prev ? false : prev));
        return;
      }

      const btnRect = savedBtnRef.current?.getBoundingClientRect();
      const probeY = btnRect ? btnRect.top + btnRect.height / 2 : 28;

      const pricingSkyRect = pricingSkyBandRef.current?.getBoundingClientRect();
      if (pricingSkyRect && pricingSkyRect.top <= probeY && pricingSkyRect.bottom >= probeY) {
        if (probeY <= pricingSkyRect.top + 32) {
          setIsSavedIconOnWhite(true);
          return;
        }
        const pricingMistRect = pricingGrasslandMistRef.current?.getBoundingClientRect();
        if (
          pricingMistRect &&
          pricingMistRect.top + pricingMistRect.height * 0.72 <= probeY &&
          pricingMistRect.bottom >= probeY
        ) {
          setIsSavedIconOnWhite(true);
          return;
        }
        setIsSavedIconOnWhite(false);
        return;
      }

      const lowerRect = lowerWhiteSectionRef.current?.getBoundingClientRect();
      if (lowerRect && lowerRect.top <= probeY && lowerRect.bottom >= probeY) {
        setIsSavedIconOnWhite(true);
        return;
      }

      const mistRect = grasslandMistRef.current?.getBoundingClientRect();
      if (
        mistRect &&
        mistRect.top + mistRect.height * 0.72 <= probeY &&
        mistRect.bottom >= probeY
      ) {
        setIsSavedIconOnWhite(true);
        return;
      }

      setIsSavedIconOnWhite(false);
    };

    computeContrast();

    let scheduledRaf: number | null = null;
    const scheduleContrast = () => {
      if (scheduledRaf !== null) return;
      scheduledRaf = window.requestAnimationFrame(() => {
        scheduledRaf = null;
        computeContrast();
      });
    };

    window.addEventListener('scroll', scheduleContrast, {passive: true});
    window.addEventListener('resize', scheduleContrast, {passive: true});
    return () => {
      if (scheduledRaf !== null) {
        window.cancelAnimationFrame(scheduledRaf);
      }
      window.removeEventListener('scroll', scheduleContrast);
      window.removeEventListener('resize', scheduleContrast);
    };
  }, [showNav, isHeroView, theme, activeView, activePage]);

  useEffect(() => {
    setSavedVisibleCount(INITIAL_GRID_BATCH);
  }, [activeCollectionId, savedCategoryFilter, activeView]);

  const safeLibrarySites = useMemo(
    () => (Array.isArray(librarySites) ? librarySites : []),
    [librarySites],
  );
  const safeCollections = useMemo(
    () => (Array.isArray(collections) ? collections : []),
    [collections],
  );
  const safeSavedSites = useMemo(
    () => (Array.isArray(savedSites) ? savedSites : []),
    [savedSites],
  );

  const visibleSites = useMemo(
    () => (activePage === 'Hero' ? safeLibrarySites.slice(0, 8) : safeLibrarySites),
    [activePage, safeLibrarySites],
  );
  const placeholderCount = activePage === 'Hero' ? Math.max(0, 8 - visibleSites.length) : 0;
  const remainingLibraryCount = Math.max(0, libraryTotal - safeLibrarySites.length);

  const activePlan: PlanTierId = user?.plan ?? 'free';
  const activeSaveLimit = PLAN_SAVE_LIMITS[activePlan];
  const activePlanMeta = PLAN_SAVE_DESCRIPTIONS[activePlan];
  const isAtSaveLimit = safeSavedSites.length >= activeSaveLimit;
  const saveProgressPercent = Math.min(
    100,
    Math.round((safeSavedSites.length / Math.max(1, activeSaveLimit)) * 100),
  );

  const collectionNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const col of safeCollections) {
      map.set(col.id, col.name);
    }
    return map;
  }, [safeCollections]);

  const collectionCountsById = useMemo(() => {
    const counts = new Map<string, number>();
    for (const site of safeSavedSites) {
      for (const colId of site.collectionIds ?? []) {
        counts.set(colId, (counts.get(colId) ?? 0) + 1);
      }
    }
    return counts;
  }, [safeSavedSites]);

  const submittedSiteLookup = useMemo(() => {
    const byId = new Map<string, SubmittedSite>();
    const byUrl = new Map<string, SubmittedSite>();
    for (const site of safeLibrarySites) {
      byId.set(site.id, site);
      byUrl.set(site.url.toLowerCase(), site);
    }
    return {byId, byUrl};
  }, [safeLibrarySites]);

  const savedLookup = useMemo(() => {
    const byId = new Map<string, SavedSite>();
    const bySubmittedId = new Map<string, SavedSite>();
    const byUrl = new Map<string, SavedSite>();
    for (const item of safeSavedSites) {
      byId.set(item.id, item);
      if (item.submittedSiteId) {
        bySubmittedId.set(item.submittedSiteId, item);
      }
      byUrl.set(item.url.toLowerCase(), item);
    }
    return {byId, bySubmittedId, byUrl};
  }, [safeSavedSites]);

  const filteredSavedSites = useMemo(
    () =>
      safeSavedSites.filter((site) => {
        const matchesCollection =
          activeCollectionId === 'all' || (site.collectionIds ?? []).includes(activeCollectionId);
        const matchesCategory = !savedCategoryFilter || site.subCategory === savedCategoryFilter;
        return matchesCollection && matchesCategory;
      }),
    [safeSavedSites, activeCollectionId, savedCategoryFilter],
  );
  const visibleSavedSites = useMemo(
    () => filteredSavedSites.slice(0, savedVisibleCount),
    [filteredSavedSites, savedVisibleCount],
  );
  const remainingSavedCount = Math.max(0, filteredSavedSites.length - visibleSavedSites.length);
  const savedPlaceholderCount = Math.max(0, 8 - visibleSavedSites.length);

  useEffect(() => installLiquidGlassPointerEffect(), []);

  useEffect(() => {
    if (!mobileNavOpen && !accountMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false);
        setAccountMenuOpen(false);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (!accountMenuOpen) return;
      const target = e.target as Node | null;
      if (!target) return;
      const insideMenu = accountMenuRef.current?.contains(target);
      const insideTrigger = accountTriggerRef.current?.contains(target);
      if (!insideMenu && !insideTrigger) {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [mobileNavOpen, accountMenuOpen]);

  const closeFloatingMenus = useCallback(() => {
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
  }, []);

  const setRouteHash = useCallback((hash: string) => {
    try {
      window.history.replaceState(null, '', hash);
    } catch {
      // ignore history errors
    }
  }, []);

  const openLibraryTab = useCallback(
    (tab: LibraryPage, subCategory: ShowcaseCategory | null = null, initialSearch = '') => {
      closeFloatingMenus();
      setActivePage(tab);
      setTileFilter('All');
      setSubCategoryFilter(tab === 'Hero' ? null : subCategory);
      setLibrarySearchQuery(tab === 'Hero' ? '' : initialSearch);
      setDebouncedSearchQuery(tab === 'Hero' ? '' : initialSearch);
      setLibraryAiToolFilter('');
      setLibraryTagFilter('');
      setActiveView('library');
      setRouteHash(tab === 'Hero' ? '#hero' : `#${tab.toLowerCase()}`);
      window.scrollTo(0, 0);
    },
    [closeFloatingMenus, setRouteHash],
  );

  const openPricingPage = useCallback(() => {
    closeFloatingMenus();
    setActiveView('pricing');
    setRouteHash('#pricing');
    window.scrollTo(0, 0);
  }, [closeFloatingMenus, setRouteHash]);

  const openBlogPage = () => {
    closeFloatingMenus();
    setActiveView('blog');
    setRouteHash('#blog');
    window.scrollTo(0, 0);
  };

  const openDocsPage = () => {
    closeFloatingMenus();
    setActiveView('docs');
    setRouteHash('#docs');
    window.scrollTo(0, 0);
  };

  const openAboutPage = () => {
    closeFloatingMenus();
    setActiveView('about');
    setRouteHash('#about');
    window.scrollTo(0, 0);
  };

  const openContactPage = () => {
    closeFloatingMenus();
    setActiveView('contact');
    setRouteHash('#contact');
    window.scrollTo(0, 0);
  };

  const openLegalPage = () => {
    closeFloatingMenus();
    setActiveView('legal');
    setRouteHash('#legal');
    window.scrollTo(0, 0);
  };

  const openAuthView = useCallback(
    (mode: AuthMode) => {
      closeFloatingMenus();
      setAuthMode(mode);
      setAuthError(null);
      setAuthInfoNotice(null);
      if (mode !== 'verify') {
        setNeedsVerificationEmail(null);
      }
      setActiveView('auth');
    },
    [closeFloatingMenus],
  );

  const openSavedPage = useCallback(() => {
    closeFloatingMenus();
    if (!user) {
      setStoredPendingAction({type: 'saved', returnView: activeView});
      setAuthInfoNotice('Sign in to view and manage your saved websites.');
      openAuthView('login');
      return;
    }
    if (!user.emailVerified) {
      pushToast({
        tone: 'error',
        title: 'Email verification required',
        description: `Please verify your email address (${user.email}) to access your saved websites.`,
      });
      setNeedsVerificationEmail(user.email);
      setAuthMode('verify');
      setActiveView('auth');
      return;
    }
    setSavedCategoryFilter(null);
    setShowQuickSave(false);
    setShowNewCollectionForm(false);
    setEditingCollectionId(null);
    setCollectionError(null);
    setQuickSaveError(null);
    setActiveView('saved');
    setRouteHash('#saved');
    window.scrollTo(0, 0);
  }, [activeView, closeFloatingMenus, openAuthView, pushToast, setRouteHash, user]);

  const openMySubmissionsPage = useCallback(() => {
    closeFloatingMenus();
    if (!user) {
      setStoredPendingAction({type: 'my-submissions', returnView: activeView});
      setAuthInfoNotice('Sign in to manage your website submissions.');
      openAuthView('login');
      return;
    }
    if (!user.emailVerified) {
      pushToast({
        tone: 'error',
        title: 'Email verification required',
        description: `Please verify your email address (${user.email}) to view and manage your submissions.`,
      });
      setNeedsVerificationEmail(user.email);
      setAuthMode('verify');
      setActiveView('auth');
      return;
    }
    setActiveView('my-submissions');
    setRouteHash('#my-submissions');
    window.scrollTo(0, 0);
    void refreshUserWorkspace();
  }, [activeView, closeFloatingMenus, openAuthView, pushToast, refreshUserWorkspace, setRouteHash, user]);

  const openAdminDashboard = useCallback(() => {
    closeFloatingMenus();
    const isAuthorized = Boolean(user?.isAdmin);
    if (!isAuthorized) {
      openLibraryTab('Hero');
      try {
        window.history.replaceState(null, '', '/#hero');
      } catch {}
      return;
    }
    setActiveView('admin');
    setRouteHash('#admin');
    window.scrollTo(0, 0);
  }, [closeFloatingMenus, openLibraryTab, setRouteHash, user]);

  const openPublicProfile = useCallback(
    (username: string) => {
      closeFloatingMenus();
      const normalized = username.replace(/^@+/, '').trim().toLowerCase();
      if (!normalized) return;
      setSelectedDetailTarget(null);
      setActiveProfileUsername(normalized);
      setActiveView('profile');
      setRouteHash(`#u/${encodeURIComponent(normalized)}`);
      window.scrollTo(0, 0);
    },
    [closeFloatingMenus, setRouteHash],
  );

  const openCollectionPage = useCallback(
    (slugOrId: string) => {
      closeFloatingMenus();
      if (!slugOrId) return;
      setSelectedDetailTarget(null);
      setActiveCollectionSlug(slugOrId);
      setActiveView('collection');
      setRouteHash(`#collection/${encodeURIComponent(slugOrId)}`);
      window.scrollTo(0, 0);
    },
    [closeFloatingMenus, setRouteHash],
  );

  const openSettingsPage = useCallback(() => {
    closeFloatingMenus();
    if (!user) {
      setStoredPendingAction({type: 'settings', returnView: activeView});
      setAuthInfoNotice('Sign in to manage your profile and account settings.');
      openAuthView('login');
      return;
    }
    if (!user.emailVerified) {
      pushToast({
        tone: 'error',
        title: 'Email verification required',
        description: `Please verify your email address (${user.email}) to access account settings.`,
      });
      setNeedsVerificationEmail(user.email);
      setAuthMode('verify');
      setActiveView('auth');
      return;
    }
    setSettingsName(user.name);
    setSettingsHandle(user.username || user.handle.replace(/^@+/, ''));
    setSettingsBio(user.bio ?? '');
    setSettingsAvatarUrl(user.avatarUrl ?? null);
    setSettingsWebsite(user.socialLinks?.website ?? '');
    setSettingsGithub(user.socialLinks?.github ?? '');
    setSettingsX(user.socialLinks?.x ?? '');
    setSettingsLinkedin(user.socialLinks?.linkedin ?? '');
    setSettingsError(null);
    setSettingsSavedNotice(null);
    setPasswordUpdateError(null);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setActiveView('settings');
    setRouteHash('#settings');
    window.scrollTo(0, 0);
  }, [activeView, closeFloatingMenus, openAuthView, pushToast, setRouteHash, user]);

  const openSubmitView = useCallback(
    (submissionToEdit: WebsiteSubmissionRecord | null = null) => {
      closeFloatingMenus();
      const categoryHint: SubmitCategoryId | null =
        activePage === 'Hero' || activePage === 'All' ? null : activePage;
      setInitialSubmitCategory(categoryHint);
      setEditingSubmission(submissionToEdit);

      if (!user) {
        setStoredPendingAction({type: 'submit', returnView: activeView});
        setAuthInfoNotice('Sign in or create an account to submit your website.');
        openAuthView('signup');
        return;
      }
      if (!user.emailVerified) {
        pushToast({
          tone: 'error',
          title: 'Email verification required',
          description: `Please verify your email address (${user.email}) to submit websites to FIWI.`,
        });
        setNeedsVerificationEmail(user.email);
        setAuthMode('verify');
        setActiveView('auth');
        return;
      }

      setActiveView('submit');
      setRouteHash('#submit');
      window.scrollTo(0, 0);
    },
    [activePage, activeView, closeFloatingMenus, openAuthView, pushToast, setRouteHash, user],
  );

  const openWebsiteDetailPage = useCallback(
    (site: SubmittedSite) => {
      closeFloatingMenus();
      setActiveSiteDetail(site);
      setActiveView('site');
      setSelectedDetailTarget(null);
      const slugOrId = site.slug || site.id;
      setRouteHash(`#site/${slugOrId}`);
      window.scrollTo({top: 0, behavior: 'smooth'});
    },
    [closeFloatingMenus, setRouteHash],
  );

  const handleOpenWebsiteBySlugOrId = useCallback(
    async (slugOrId: string) => {
      try {
        const res = await fiwiApi.getWebsiteDetail(slugOrId);
        openWebsiteDetailPage(res.website);
      } catch (err) {
        pushToast({
          tone: 'error',
          title: 'Website not found',
          description: err instanceof Error ? err.message : undefined,
        });
      }
    },
    [openWebsiteDetailPage, pushToast],
  );

  const handleSelectHome = useCallback(() => openLibraryTab('Hero'), [openLibraryTab]);
  const handleSelectLibraryTab = useCallback(
    (tab: FilterTab) => openLibraryTab(tab),
    [openLibraryTab],
  );
  const handleOpenNavLogin = useCallback(() => {
    setPostAuthRedirect(null);
    openAuthView('login');
  }, [openAuthView]);
  const handleToggleAccountMenu = useCallback(
    () => setAccountMenuOpen((prev) => !prev),
    [],
  );
  const handleToggleMobileNav = useCallback(
    () => setMobileNavOpen((prev) => !prev),
    [],
  );

  const findSavedForSite = useCallback(
    (site: SubmittedSite): SavedSite | null => {
      if (!user) return null;
      return (
        savedLookup.bySubmittedId.get(site.id) ??
        savedLookup.byId.get(site.id) ??
        savedLookup.byUrl.get(site.url.toLowerCase()) ??
        null
      );
    },
    [user, savedLookup],
  );

  const isSiteSaved = useCallback(
    (site: SubmittedSite) => Boolean(findSavedForSite(site)),
    [findSavedForSite],
  );

  const handleToggleSaveSite = useCallback(
    async (site: SubmittedSite, targetCollectionId?: string) => {
      if (!user) {
        setStoredPendingAction({
          type: 'save_site',
          site,
          returnView: activeView,
        });
        setAuthInfoNotice(`Create an account or sign in to save "${site.title}" to your library.`);
        openAuthView('signup');
        return;
      }

      if (!user.emailVerified) {
        pushToast({
          tone: 'error',
          title: 'Email verification required',
          description: `Please verify your email address (${user.email}) to save websites to your collections.`,
        });
        setNeedsVerificationEmail(user.email);
        setAuthMode('verify');
        setActiveView('auth');
        return;
      }

      const defaultColId = targetCollectionId ?? collections[0]?.id;
      const existing = findSavedForSite(site);
      const res = await fiwiApi.toggleBookmark(
        site.id,
        targetCollectionId ? targetCollectionId : existing ? undefined : defaultColId,
      );
      setSaveLimitNotice(null);
      setSavedSites(res.bookmarks);
    },
    [activeView, collections, findSavedForSite, openAuthView, pushToast, setSavedSites, user],
  );

  const executePendingAuthAction = useCallback(
    async (forcedRedirect?: string | null) => {
      const pending = getStoredPendingAction();
      setStoredPendingAction(null);

      const targetType = pending?.type || forcedRedirect || postAuthRedirect || 'library';
      setPostAuthRedirect(null);

      if (targetType === 'save_site' && pending?.site) {
        try {
          const siteToSave = pending.site;
          await handleToggleSaveSite(siteToSave);
          pushToast({
            tone: 'success',
            title: 'Saved to library',
            description: `"${siteToSave.title}" has been saved to your collections.`,
          });
          setSelectedDetailTarget({
            site: siteToSave,
            savedRecord: findSavedForSite(siteToSave),
          });
        } catch (err) {
          console.error('Failed to execute pending save:', err);
        }
        return;
      }

      if (targetType === 'submit') {
        openSubmitView(null);
        return;
      }

      if (targetType === 'saved') {
        openSavedPage();
        return;
      }

      if (targetType === 'my-submissions') {
        openMySubmissionsPage();
        return;
      }

      if (targetType === 'settings') {
        openSettingsPage();
        return;
      }

      if (targetType === 'admin') {
        openAdminDashboard();
        return;
      }

      if (targetType === 'site' && pending?.siteId) {
        void handleOpenWebsiteBySlugOrId(pending.siteId);
        return;
      }

      if (targetType === 'collection' && pending?.collectionSlug) {
        openCollectionPage(pending.collectionSlug);
        return;
      }

      openLibraryTab('Hero');
    },
    [
      findSavedForSite,
      handleOpenWebsiteBySlugOrId,
      handleToggleSaveSite,
      openAdminDashboard,
      openCollectionPage,
      openLibraryTab,
      openMySubmissionsPage,
      openSavedPage,
      openSettingsPage,
      openSubmitView,
      postAuthRedirect,
      pushToast,
    ],
  );
  executePendingActionRef.current = executePendingAuthAction;

  const handleGoogleSignIn = useCallback(async () => {
    setAuthError(null);
    setAuthInfoNotice(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with Google.';
      setAuthError(msg);
      pushToast({
        tone: 'error',
        title: 'Google Sign-in failed',
        description: msg,
      });
      setIsGoogleSubmitting(false);
    }
  }, [pushToast]);

  const handleAuthCallback = useCallback(
    async (params: URLSearchParams) => {
      const code = params.get('code');
      const tokenHash = params.get('token_hash');
      const type = params.get('type') || 'signup';
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      const next = params.get('next');

      if (error) {
        pushToast({
          tone: 'error',
          title: 'Authentication error',
          description: errorDescription || error,
        });
        setAuthError(errorDescription || error);
        openAuthView('login');
        return;
      }

      setIsVerifyingCallback(true);
      try {
        if (code) {
          try {
            await exchangeAuthCode(code);
          } catch (exchangeErr) {
            console.warn('Code exchange warning:', exchangeErr);
            const session = await getActiveSession();
            if (!session) throw exchangeErr;
          }
        } else if (tokenHash) {
          await verifyAuthOtp(tokenHash, type);
        } else {
          // If access_token was passed in URL hash (implicit flow), apply it or verify active session
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const client = getSupabaseClient();
          if (accessToken && client) {
            await client.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
          } else {
            const session = await getActiveSession();
            if (!session) {
              throw new Error('No active session found.');
            }
          }
        }

        // Establish user workspace and session
        await refreshUserWorkspace();

        pushToast({
          tone: 'success',
          title: 'Signed in successfully!',
          description: 'Your account is verified and ready.',
        });

        // Clean callback parameters from URL without reloading
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch {}

        await executePendingAuthAction(next);
      } catch (err) {
        console.warn('Auth callback resolution notice:', err);
        const existingSession = await getActiveSession();
        if (existingSession) {
          await refreshUserWorkspace();
          try {
            window.history.replaceState(null, '', window.location.pathname);
          } catch {}
          await executePendingAuthAction(next);
        } else {
          const msg = err instanceof Error ? err.message : 'Unable to complete verification.';
          pushToast({
            tone: 'error',
            title: 'Verification failed',
            description: msg,
          });
          setAuthError(msg);
          openAuthView('login');
        }
      } finally {
        setIsVerifyingCallback(false);
      }
    },
    [executePendingAuthAction, openAuthView, pushToast, refreshUserWorkspace],
  );

  const routeActionsRef = useRef({
    openLibraryTab,
    openPricingPage,
    openBlogPage,
    openDocsPage,
    openAboutPage,
    openContactPage,
    openLegalPage,
    openSavedPage,
    openMySubmissionsPage,
    openSettingsPage,
    openSubmitView,
    openAdminDashboard,
    openPublicProfile,
    openCollectionPage,
    handleOpenWebsiteBySlugOrId,
    handleAuthCallback,
    openAuthView,
    pushToast,
  });
  routeActionsRef.current = {
    openLibraryTab,
    openPricingPage,
    openBlogPage,
    openDocsPage,
    openAboutPage,
    openContactPage,
    openLegalPage,
    openSavedPage,
    openMySubmissionsPage,
    openSettingsPage,
    openSubmitView,
    openAdminDashboard,
    openPublicProfile,
    openCollectionPage,
    handleOpenWebsiteBySlugOrId,
    handleAuthCallback,
    openAuthView,
    pushToast,
  };

  useEffect(() => {
    const applyHashRoute = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const urlError = searchParams.get('error_description') || searchParams.get('error');
      const actions = routeActionsRef.current;

      if (urlError) {
        actions.pushToast({tone: 'error', title: 'Authentication failed', description: urlError});
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        } catch {}
      }

      const rawHash = window.location.hash.replace(/^#/, '');
      const hashLower = rawHash.toLowerCase();
      const pathLower = window.location.pathname.toLowerCase();

      if (pathLower === '/admin' || hashLower === 'admin') {
        const isAuthorized = Boolean(user?.isAdmin);
        if (!isAuthorized) {
          actions.openLibraryTab('Hero');
          try {
            window.history.replaceState(null, '', '/#hero');
          } catch {}
          return;
        }
        actions.openAdminDashboard();
        return;
      }

      if (hashLower.includes('type=recovery') || hashLower === 'reset-password') {
        setPasswordRecoveryMode(true);
        setActiveView('reset-password');
        return;
      }
      if (
        hashLower === 'auth-callback' ||
        hashLower.startsWith('auth-callback') ||
        hashLower.includes('access_token=') ||
        hashLower.includes('code=') ||
        hashLower.includes('token_hash=') ||
        searchParams.has('code') ||
        searchParams.has('token_hash')
      ) {
        let comboParams = new URLSearchParams(window.location.search);
        if (rawHash.includes('?')) {
          const hashQuery = rawHash.slice(rawHash.indexOf('?') + 1);
          const hashParams = new URLSearchParams(hashQuery);
          hashParams.forEach((val, key) => comboParams.set(key, val));
        } else if (rawHash.includes('=')) {
          const clean = rawHash.replace(/^auth-callback\/?/, '').replace(/^\?/, '');
          const hashParams = new URLSearchParams(clean);
          hashParams.forEach((val, key) => comboParams.set(key, val));
        }
        void actions.handleAuthCallback(comboParams);
        return;
      }

      if (!rawHash) return;

      if (hashLower === 'login' || hashLower === 'signin') {
        actions.openAuthView('login');
        return;
      }
      if (hashLower === 'signup' || hashLower === 'register') {
        actions.openAuthView('signup');
        return;
      }
      if (hashLower === 'verify-email') {
        actions.openAuthView('verify');
        return;
      }

      if (hashLower === 'hero') actions.openLibraryTab('Hero');
      else if (hashLower === 'all') actions.openLibraryTab('All');
      else if (hashLower === 'normal') actions.openLibraryTab('Normal');
      else if (hashLower === 'vibecoded') actions.openLibraryTab('Vibecoded');
      else if (hashLower === 'connect') actions.openLibraryTab('Connect');
      else if (hashLower === 'test') actions.openLibraryTab('Test');
      else if (hashLower === 'pricing') actions.openPricingPage();
      else if (hashLower === 'blog') actions.openBlogPage();
      else if (hashLower === 'docs') actions.openDocsPage();
      else if (hashLower === 'about') actions.openAboutPage();
      else if (hashLower === 'contact') actions.openContactPage();
      else if (hashLower === 'legal') actions.openLegalPage();
      else if (hashLower === 'saved') actions.openSavedPage();
      else if (hashLower === 'my-submissions') actions.openMySubmissionsPage();
      else if (hashLower === 'settings') actions.openSettingsPage();
      else if (hashLower === 'submit') actions.openSubmitView(null);
      else if (hashLower === 'admin') actions.openAdminDashboard();
      else if (hashLower.startsWith('u/')) {
        const username = decodeURIComponent(rawHash.slice(2));
        if (username) actions.openPublicProfile(username);
      } else if (hashLower.startsWith('collection/')) {
        const slugOrId = decodeURIComponent(rawHash.slice('collection/'.length));
        if (slugOrId) actions.openCollectionPage(slugOrId);
      } else if (hashLower.startsWith('site/')) {
        const slugOrId = decodeURIComponent(rawHash.slice('site/'.length));
        if (slugOrId) void actions.handleOpenWebsiteBySlugOrId(slugOrId);
      }
    };

    applyHashRoute();
    window.addEventListener('hashchange', applyHashRoute);
    return () => window.removeEventListener('hashchange', applyHashRoute);
  }, [setPasswordRecoveryMode]);

  const handleLogout = async () => {
    closeFloatingMenus();
    await signOutFromSupabase();
    clearUserWorkspace();
    setStoredPendingAction(null);
    setPostAuthRedirect(null);
    setSelectedDetailTarget(null);
    pushToast({tone: 'info', title: 'Logged out'});
    if (
      activeView === 'submit' ||
      activeView === 'my-submissions' ||
      activeView === 'saved' ||
      activeView === 'settings' ||
      activeView === 'admin'
    ) {
      openLibraryTab('Hero');
    }
  };

  const handleAvatarFileSelected = async (file: File) => {
    setSettingsUploadingAvatar(true);
    setSettingsError(null);
    try {
      const uploaded = await uploadMediaFile({file, purpose: 'avatar'});
      if (uploaded.publicUrl) {
        setSettingsAvatarUrl(uploaded.publicUrl);
      }
      pushToast({tone: 'success', title: 'Avatar ready — click Save changes to apply.'});
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'Unable to upload avatar.');
    } finally {
      setSettingsUploadingAvatar(false);
    }
  };

  const handleSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSettingsError(null);
    setSettingsSavedNotice(null);
    setSettingsSaving(true);

    try {
      const res = await fiwiApi.updateMyProfile({
        name: settingsName,
        username: settingsHandle,
        bio: settingsBio,
        avatarUrl: settingsAvatarUrl,
        socialLinks: {
          website: settingsWebsite.trim() || undefined,
          github: settingsGithub.trim() || undefined,
          x: settingsX.trim() || undefined,
          linkedin: settingsLinkedin.trim() || undefined,
        },
      });
      setUser(res.user);
      setSettingsName(res.user.name);
      setSettingsHandle(res.user.username || res.user.handle.replace(/^@+/, ''));
      setSettingsBio(res.user.bio ?? '');
      setSettingsAvatarUrl(res.user.avatarUrl ?? null);
      setSettingsSavedNotice('Profile updated.');
      pushToast({tone: 'success', title: 'Profile updated'});
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handlePasswordUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordUpdateError(null);
    if (newPasswordInput.length < 6) {
      setPasswordUpdateError('Password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordUpdateError('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateAccountPassword(newPasswordInput);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setPasswordRecoveryMode(false);
      pushToast({tone: 'success', title: 'Password updated successfully'});
      if (activeView === 'reset-password') {
        openLibraryTab('Hero');
      }
    } catch (err) {
      setPasswordUpdateError(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthInfoNotice(null);
    setIsSubmittingAuth(true);

    try {
      if (authMode === 'forgot') {
        if (!authEmail.trim()) {
          throw new Error('Please enter your account email address.');
        }
        await requestPasswordReset(authEmail);
        setAuthInfoNotice(
          'Password reset link sent! Check your inbox to set a new password.',
        );
        return;
      }

      if (authMode === 'signup') {
        const cleanName = authName.trim();
        const cleanEmail = authEmail.trim().toLowerCase();
        if (!cleanName) {
          throw new Error('Please enter your full name.');
        }
        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
          throw new Error('Please enter a valid email address.');
        }
        if (authPassword.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (authPassword !== authConfirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (usernameStatus.valid === false) {
          throw new Error(usernameStatus.reason ?? 'Please choose a valid username.');
        }
        if (usernameStatus.available === false) {
          throw new Error('That username is already taken.');
        }

        const result = await signUpWithSupabase({
          name: cleanName,
          username: authHandle || cleanName,
          email: cleanEmail,
          password: authPassword,
        });

        if (result.requiresEmailVerification) {
          setNeedsVerificationEmail(cleanEmail);
          setAuthMode('verify');
          setResendCooldown(60);
          setAuthInfoNotice(
            `Account created! We've sent a verification email to ${cleanEmail}. Click the link to complete registration and sign in automatically.`,
          );
          pushToast({
            tone: 'success',
            title: 'Account created!',
            description: `Verification link sent to ${cleanEmail}.`,
          });
          setAuthPassword('');
          setAuthConfirmPassword('');
          return;
        }

        await refreshUserWorkspace();
        pushToast({tone: 'success', title: 'Welcome to FiWi'});
      } else {
        await signInWithSupabase({
          email: authEmail,
          password: authPassword,
        });
        await refreshUserWorkspace();
        pushToast({tone: 'success', title: 'Signed in successfully'});
      }

      setAuthPassword('');
      setAuthConfirmPassword('');
      await executePendingAuthAction();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to complete authentication.';
      setAuthError(msg);
      if (msg.toLowerCase().includes('email not confirmed')) {
        setNeedsVerificationEmail(authEmail.trim().toLowerCase());
        setAuthMode('verify');
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleResendVerification = async () => {
    const email = needsVerificationEmail ?? user?.email ?? authEmail.trim().toLowerCase();
    if (!email || resendingVerification || resendCooldown > 0) return;
    setResendingVerification(true);
    setAuthError(null);
    try {
      await resendVerificationEmail(email);
      setResendCooldown(60);
      pushToast({tone: 'success', title: `Verification email resent to ${email}`});
      setAuthInfoNotice(`A fresh verification link was sent to ${email}. Check your inbox.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to resend verification email.';
      setAuthError(msg);
      pushToast({tone: 'error', title: 'Unable to resend email', description: msg});
    } finally {
      setResendingVerification(false);
    }
  };

  const handleDeletePublishedSite = (site: SubmittedSite) => {
    if (!user) return;
    openConfirm({
      title: `Remove "${site.title}"?`,
      message: 'This permanently removes the published website from the public FiWi library.',
      confirmLabel: 'Remove website',
      destructive: true,
      onConfirm: async () => {
        try {
          await fiwiApi.deleteWebsite(site.id);
          setLibrarySites((prev) => prev.filter((item) => item.id !== site.id));
          setLibraryTotal((prev) => Math.max(0, prev - 1));
          setSelectedDetailTarget((prev) => (prev?.site?.id === site.id ? null : prev));
          await refreshUserWorkspace();
          pushToast({tone: 'info', title: 'Website removed'});
        } catch (err) {
          pushToast({
            tone: 'error',
            title: 'Could not remove website',
            description: err instanceof Error ? err.message : undefined,
          });
        }
      },
    });
  };

  const handleActivatePlan = async (planId: PlanId) => {
    if (!user) {
      setStoredPendingAction({type: 'library'});
      openAuthView('signup');
      return;
    }
    if (!user.emailVerified) {
      pushToast({
        tone: 'error',
        title: 'Email verification required',
        description: `Please verify your email address (${user.email}) before switching plans.`,
      });
      setNeedsVerificationEmail(user.email);
      setAuthMode('verify');
      setActiveView('auth');
      return;
    }
    try {
      const res = await fiwiApi.updateMyPlan(planId);
      setUser(res.user);
      setSelectedPlan(planId);
      setSaveLimitNotice(null);
      setQuickSaveError(null);
      pushToast({
        tone: 'success',
        title: `Switched to ${PLAN_SAVE_DESCRIPTIONS[planId].label} plan`,
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Unable to update plan',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleToggleLikeSite = async (site: SubmittedSite) => {
    if (!user) {
      setStoredPendingAction({type: 'save_site', site, returnView: activeView});
      openAuthView('login');
      return;
    }
    if (!user.emailVerified) {
      pushToast({
        tone: 'error',
        title: 'Email verification required',
        description: `Please verify your email address (${user.email}) to like websites.`,
      });
      setNeedsVerificationEmail(user.email);
      setAuthMode('verify');
      setActiveView('auth');
      return;
    }
    try {
      const res = await fiwiApi.toggleWebsiteLike(site.id);
      setLibrarySites((prev) =>
        prev.map((item) =>
          item.id === site.id
            ? {...item, likesCount: res.likesCount, viewerHasLiked: res.liked}
            : item,
        ),
      );
      setSelectedDetailTarget((prev) =>
        prev?.site?.id === site.id
          ? {
              ...prev,
              site: {...prev.site, likesCount: res.likesCount, viewerHasLiked: res.liked},
            }
          : prev,
      );
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not update like',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleTileToggleSaveSite = async (site: SubmittedSite) => {
    try {
      await handleToggleSaveSite(site);
    } catch (err) {
      setSaveLimitNotice(
        err instanceof Error
          ? err.message
          : `Saved websites limit reached (${activeSaveLimit} on ${activePlanMeta.label}).`,
      );
    }
  };

  const handleUpdateSavedCollections = async (savedSiteId: string, collectionIds: string[]) => {
    if (user && !user.emailVerified) {
      pushToast({
        tone: 'error',
        title: 'Email verification required',
        description: `Please verify your email address (${user.email}) to manage collections.`,
      });
      setNeedsVerificationEmail(user.email);
      setAuthMode('verify');
      setActiveView('auth');
      return;
    }
    try {
      const res = await fiwiApi.updateBookmarkCollections(savedSiteId, collectionIds);
      setSavedSites(res.bookmarks);
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Unable to update collections',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleCreateCollectionAndAssign = async (
    name: string,
    site: SubmittedSite,
    savedRec: SavedSite | null,
  ): Promise<string | null> => {
    if (user && !user.emailVerified) {
      pushToast({
        tone: 'error',
        title: 'Email verification required',
        description: `Please verify your email address (${user.email}) to create collections.`,
      });
      setNeedsVerificationEmail(user.email);
      setAuthMode('verify');
      setActiveView('auth');
      return 'Email verification required';
    }
    if (!savedRec && savedSites.length >= activeSaveLimit) {
      return `Saved websites limit reached (${activeSaveLimit} websites on ${activePlanMeta.label}). Upgrade your plan or remove a saved website to add more.`;
    }
    try {
      const {collections: nextCols, created} = await fiwiApi.createCollection({name});
      setCollections(nextCols);
      if (savedRec) {
        const nextIds = Array.from(new Set([...savedRec.collectionIds, created.id]));
        const bmRes = await fiwiApi.updateBookmarkCollections(savedRec.id, nextIds);
        setSavedSites(bmRes.bookmarks);
      } else {
        const bmRes = await fiwiApi.toggleBookmark(site.id, created.id);
        setSavedSites(bmRes.bookmarks);
      }
      pushToast({tone: 'success', title: `Added to "${created.name}"`});
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Unable to create collection.';
    }
  };

  const handleCreateCollectionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCollectionError(null);
    if (user && !user.emailVerified) {
      setCollectionError('Please verify your email address before creating collections.');
      return;
    }
    if (!newCollectionName.trim()) {
      setCollectionError('Collection name is required.');
      return;
    }
    setCreatingCollection(true);
    try {
      const {collections: nextCols, created} = await fiwiApi.createCollection({
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || undefined,
        isPublic: newCollectionPublic,
      });
      setCollections(nextCols);
      setActiveCollectionId(created.id);
      setQuickSaveCollectionId(created.id);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionPublic(false);
      setShowNewCollectionForm(false);
      pushToast({tone: 'success', title: `Created "${created.name}"`});
    } catch (err) {
      setCollectionError(err instanceof Error ? err.message : 'Unable to create collection.');
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleRenameCollectionSubmit = async (e: FormEvent, collectionId: string) => {
    e.preventDefault();
    setCollectionError(null);
    try {
      const res = await fiwiApi.updateCollection(collectionId, {name: editingCollectionName.trim()});
      setCollections(res.collections);
      setEditingCollectionId(null);
      setEditingCollectionName('');
      pushToast({tone: 'success', title: 'Collection renamed'});
    } catch (err) {
      setCollectionError(err instanceof Error ? err.message : 'Unable to rename collection.');
    }
  };

  const handleDeleteCollectionClick = (collectionId: string, name: string) => {
    setCollectionError(null);
    openConfirm({
      title: `Delete "${name}"?`,
      message: 'Saved websites will remain in your other collections or Unsorted bookmarks.',
      confirmLabel: 'Delete collection',
      destructive: true,
      onConfirm: async () => {
        try {
          const res = await fiwiApi.deleteCollection(collectionId);
          setCollections(res.collections);
          setSavedSites(res.bookmarks);
          if (activeCollectionId === collectionId) {
            setActiveCollectionId('all');
          }
          if (quickSaveCollectionId === collectionId) {
            setQuickSaveCollectionId(res.collections[0]?.id ?? '');
          }
          if (editingCollectionId === collectionId) {
            setEditingCollectionId(null);
          }
          pushToast({tone: 'info', title: 'Collection deleted'});
        } catch (err) {
          setCollectionError(err instanceof Error ? err.message : 'Unable to delete collection.');
        }
      },
    });
  };

  const handleRemoveSavedSite = async (bookmarkId: string) => {
    try {
      const res = await fiwiApi.deleteBookmark(bookmarkId);
      setSavedSites(res.bookmarks);
      pushToast({tone: 'info', title: 'Removed from saved websites'});
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not remove bookmark',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleQuickSaveSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setQuickSaveError(null);
    const targetCollectionId = collections.some((col) => col.id === quickSaveCollectionId)
      ? quickSaveCollectionId
      : collections[0]?.id;

    setQuickSaveSubmitting(true);
    try {
      const res = await fiwiApi.createCustomBookmark({
        title: quickSaveTitle,
        url: quickSaveUrl,
        subCategory: quickSaveCategory,
        collectionIds: targetCollectionId ? [targetCollectionId] : undefined,
      });
      setSavedSites(res.bookmarks);
      setQuickSaveTitle('');
      setQuickSaveUrl('');
      setShowQuickSave(false);
      pushToast({tone: 'success', title: 'Saved to collection'});
    } catch (err) {
      setQuickSaveError(err instanceof Error ? err.message : 'Unable to save website.');
    } finally {
      setQuickSaveSubmitting(false);
    }
  };

  const currentFooterRoute: FooterRoute | undefined =
    activeView === 'library'
      ? activePage === 'Hero'
        ? 'hero'
        : activePage === 'All'
          ? 'explore'
          : (activePage.toLowerCase() as FooterRoute)
      : activeView === 'pricing' ||
          activeView === 'blog' ||
          activeView === 'docs' ||
          activeView === 'submit' ||
          activeView === 'saved' ||
          activeView === 'about' ||
          activeView === 'contact' ||
          activeView === 'legal'
        ? activeView
        : undefined;

  const isAuthScreen = activeView === 'auth' || activeView === 'reset-password';
  if (activeView === 'admin') {
    return (
      <MotionConfig reducedMotion="user">
        <Suspense
          fallback={
            <div className="min-h-screen w-full bg-[#02031A] flex items-center justify-center text-white">
              <Loader2 className="w-8 h-8 animate-spin text-[#93C5FD]" />
            </div>
          }
        >
          <AdminDashboard
            user={user}
            onBack={() => openLibraryTab('Hero')}
            onRefreshPublicLibrary={refreshPublicLibrary}
            onLoginSuccess={async () => {
              await refreshUserWorkspace();
            }}
          />
          <ToastViewport />
          <ConfirmDialog />
        </Suspense>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full bg-white dark:bg-black flex flex-col items-center transition-colors duration-200">
        <div
          className={
            isAuthScreen
              ? 'fiwi-hero fiwi-hero--auth w-full relative min-h-[100dvh] overflow-x-hidden box-border px-4 sm:px-8 py-6 text-white flex flex-col items-center justify-center'
              : hasCompactHeroContainer
                ? 'fiwi-hero w-full relative overflow-clip box-border px-4 sm:px-8 pt-[108px] sm:pt-[61px] pb-0 text-white flex flex-col items-center'
                : 'fiwi-hero w-full relative overflow-clip min-h-screen box-border px-4 sm:px-8 pt-[108px] sm:pt-[61px] pb-0 text-white flex flex-col items-center'
          }
        >
          <HeroBackdrop />

          {/* Persistent Fixed Navigation Pill across full scroll height */}
          {showNav && (
            <PrimaryNavbar
              navItems={NAV_ITEMS}
              activeView={activeView}
              activePage={activePage}
              isHeroView={isHeroView}
              theme={theme}
              user={user}
              accountMenuOpen={accountMenuOpen}
              mobileNavOpen={mobileNavOpen}
              accountTriggerRef={accountTriggerRef}
              onSelectHome={handleSelectHome}
              onSelectLibraryTab={handleSelectLibraryTab}
              onSelectPricing={openPricingPage}
              onOpenSubmit={() => openSubmitView(null)}
              onOpenLogin={handleOpenNavLogin}
              onToggleAccountMenu={handleToggleAccountMenu}
              onToggleTheme={toggleTheme}
              onToggleMobileNav={handleToggleMobileNav}
            />
          )}

          {/* Desktop Account Dropdown Popover (outside .fiwi-nav to avoid clip-path clipping) */}
          <AnimatePresence>
            {showNav && user && accountMenuOpen && (
              <motion.div
                ref={accountMenuRef}
                key="desktop-account-popover"
                role="menu"
                aria-label="Member account menu"
                variants={fiwiPopoverVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="hidden md:flex flex-col fixed top-[66px] right-12 z-[56] w-[276px] bg-[#070B2A]/95 backdrop-blur-xl border border-white/22 p-3.5 text-white shadow-[0_24px_48px_-14px_rgba(2,3,26,0.65)] text-left"
              >
                <div className="pb-3 border-b border-white/14">
                  <div className="text-[14px] font-semibold leading-tight truncate">{user.name}</div>
                  <div className="mono text-[11px] text-white/65 truncate mt-0.5">{user.handle}</div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] mono uppercase tracking-[0.06em] text-white/80 tabular-nums">
                    <span>{activePlanMeta.label} plan</span>
                    <span>
                      {savedSites.length} / {activeSaveLimit} saved
                    </span>
                  </div>
                </div>

                <div className="py-1.5 flex flex-col gap-0.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => openSubmitView(null)}
                    className="w-full px-2.5 py-2 text-left text-[13px] font-medium text-white/90 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer bg-transparent border-0 transition-colors"
                  >
                    <span>Submit a website</span>
                    <Plus className="w-3.5 h-3.5 opacity-75" />
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openMySubmissionsPage}
                    className="w-full px-2.5 py-2 text-left text-[13px] font-medium text-white/90 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer bg-transparent border-0 transition-colors"
                  >
                    <span>My submissions ({mySubmissions.length})</span>
                    <FileEdit className="w-3.5 h-3.5 opacity-75" />
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openSavedPage}
                    className="w-full px-2.5 py-2 text-left text-[13px] font-medium text-white/90 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer bg-transparent border-0 transition-colors"
                  >
                    <span>Saved websites</span>
                    <Bookmark className="w-3.5 h-3.5 opacity-75" />
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => openPublicProfile(user.username)}
                    className="w-full px-2.5 py-2 text-left text-[13px] font-medium text-white/90 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer bg-transparent border-0 transition-colors"
                  >
                    <span>Public profile</span>
                    <User className="w-3.5 h-3.5 opacity-75" />
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openSettingsPage}
                    className="w-full px-2.5 py-2 text-left text-[13px] font-medium text-white/90 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer bg-transparent border-0 transition-colors"
                  >
                    <span>Account settings</span>
                    <Settings className="w-3.5 h-3.5 opacity-75" />
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openPricingPage}
                    className="w-full px-2.5 py-2 text-left text-[13px] font-medium text-white/90 hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer bg-transparent border-0 transition-colors"
                  >
                    <span>Plan &amp; limits</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-75" />
                  </button>
                  {user.isAdmin && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={openAdminDashboard}
                      className="w-full px-2.5 py-2 text-left text-[13px] font-medium text-[#93C5FD] hover:bg-white/10 hover:text-white flex items-center justify-between cursor-pointer bg-transparent border-0 transition-colors"
                    >
                      <span>Admin moderation</span>
                      <Shield className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="pt-1.5 border-t border-white/14">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full px-2.5 py-2 text-left text-[13px] font-medium text-[#FCA5A5] hover:bg-white/10 flex items-center justify-between cursor-pointer bg-transparent border-0 transition-colors"
                  >
                    <span>Log out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Navigation Drawer */}
          <AnimatePresence>
            {showNav && mobileNavOpen && (
              <>
                <motion.div
                  key="mobile-nav-backdrop"
                  variants={fiwiModalBackdropVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onClick={() => setMobileNavOpen(false)}
                  className="fixed inset-0 z-[49] bg-[#02031A]/45 backdrop-blur-[2px] md:hidden"
                  aria-hidden="true"
                />
                <motion.div
                  id="fiwi-mobile-nav"
                  key="mobile-nav-drawer"
                  role="dialog"
                  aria-label="Mobile navigation"
                  variants={fiwiPopoverVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="fixed top-[66px] inset-x-4 z-[56] md:hidden bg-[#070B2A]/95 backdrop-blur-xl border border-white/20 p-4 text-white shadow-[0_24px_56px_-14px_rgba(2,3,26,0.72)] text-left"
                >
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/14">
                    <div className="min-w-0">
                      {user ? (
                        <>
                          <div className="text-[14px] font-semibold truncate">{user.name}</div>
                          <div className="mono text-[11px] text-white/65 truncate">
                            {user.handle} · {savedSites.length}/{activeSaveLimit} saved
                          </div>
                        </>
                      ) : (
                        <span className="mono text-[11px] uppercase tracking-[0.08em] text-white/75">
                          Explore FiWi
                        </span>
                      )}
                    </div>

                    {isHeroView && (
                      <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="h-8 px-2.5 border border-white/25 bg-white/10 text-white inline-flex items-center gap-1.5 text-[11px] mono uppercase tracking-[0.06em] cursor-pointer"
                      >
                        {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openLibraryTab('Hero')}
                      className={`px-3 py-2 text-left text-[13px] font-medium border cursor-pointer transition-colors ${
                        activeView === 'library' && activePage === 'Hero'
                          ? 'bg-white text-[#02031A] border-white'
                          : 'bg-white/5 text-white border-white/15 hover:bg-white/15'
                      }`}
                    >
                      Home
                    </button>
                    {NAV_ITEMS.map((item) => {
                      const isCurrent = activeView === 'library' && activePage === item.tab;
                      return (
                        <button
                          key={item.tab}
                          type="button"
                          onClick={() => openLibraryTab(item.tab)}
                          className={`px-3 py-2 text-left text-[13px] font-medium border cursor-pointer transition-colors ${
                            isCurrent
                              ? 'bg-white text-[#02031A] border-white'
                              : 'bg-white/5 text-white border-white/15 hover:bg-white/15'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/14 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={openPricingPage}
                      className="px-3 py-2 text-left text-[13px] font-medium bg-white/5 text-white border border-white/15 hover:bg-white/15 cursor-pointer"
                    >
                      Pricing
                    </button>
                    <button
                      type="button"
                      onClick={openSavedPage}
                      className="px-3 py-2 text-left text-[13px] font-medium bg-white/5 text-white border border-white/15 hover:bg-white/15 cursor-pointer"
                    >
                      Saved websites
                    </button>
                    {user && (
                      <>
                        <button
                          type="button"
                          onClick={openMySubmissionsPage}
                          className="px-3 py-2 text-left text-[13px] font-medium bg-white/5 text-white border border-white/15 hover:bg-white/15 cursor-pointer"
                        >
                          My submissions
                        </button>
                        <button
                          type="button"
                          onClick={() => openPublicProfile(user.username)}
                          className="px-3 py-2 text-left text-[13px] font-medium bg-white/5 text-white border border-white/15 hover:bg-white/15 cursor-pointer"
                        >
                          Public profile
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={openDocsPage}
                      className="px-3 py-2 text-left text-[13px] font-medium bg-white/5 text-white border border-white/15 hover:bg-white/15 cursor-pointer"
                    >
                      Docs
                    </button>
                    <button
                      type="button"
                      onClick={openBlogPage}
                      className="px-3 py-2 text-left text-[13px] font-medium bg-white/5 text-white border border-white/15 hover:bg-white/15 cursor-pointer"
                    >
                      Blog
                    </button>
                    {user?.isAdmin && (
                      <button
                        type="button"
                        onClick={openAdminDashboard}
                        className="col-span-2 px-3 py-2 text-left text-[13px] font-medium bg-[#1020F5]/35 text-white border border-white/25 hover:bg-[#1020F5]/55 cursor-pointer"
                      >
                        Admin moderation
                      </button>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/14 flex items-center gap-2">
                    {user ? (
                      <>
                        <button
                          type="button"
                          onClick={openSettingsPage}
                          className="flex-1 h-9 px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[12px] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Settings</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="h-9 px-3.5 bg-white/10 hover:bg-white/20 text-[#FCA5A5] border border-white/20 text-[12px] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => openAuthView('login')}
                          className="flex-1 h-9 bg-white text-[#02031A] text-[12px] font-semibold uppercase tracking-[0.06em] cursor-pointer border-0"
                        >
                          Login
                        </button>
                        <button
                          type="button"
                          onClick={() => openAuthView('signup')}
                          className="flex-1 h-9 bg-white/10 text-white border border-white/25 text-[12px] font-semibold uppercase tracking-[0.06em] cursor-pointer"
                        >
                          Sign up
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Email Verification Required Banner for Unverified Logged-In Users */}
          {showNav && user && !user.emailVerified && (
            <div className="fixed top-[66px] left-1/2 -translate-x-1/2 z-[52] w-[calc(100%-2rem)] max-w-[820px] pointer-events-auto">
              <div className="bg-[#FFFBEB]/95 dark:bg-[#78350F]/90 backdrop-blur-md border border-[#F59E0B]/40 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(245,158,11,0.15)] text-[13px] text-[#92400E] dark:text-[#FEF3C7]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span className="truncate">
                    Please verify your email (<strong>{user.email}</strong>) to unlock submissions and collections.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={resendingVerification || resendCooldown > 0}
                  onClick={() => {
                    setNeedsVerificationEmail(user.email);
                    void handleResendVerification();
                  }}
                  className="mono text-[11px] uppercase tracking-[0.06em] font-bold text-[#1020F5] dark:text-[#93C5FD] hover:underline bg-transparent border-0 p-0 cursor-pointer shrink-0"
                >
                  {resendingVerification
                    ? 'Resending...'
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend email'}
                </button>
              </div>
            </div>
          )}

          {showNav && (
            <button
              ref={savedBtnRef}
              type="button"
              onClick={openSavedPage}
              aria-label={user ? `Saved websites (${savedSites.length})` : 'Login to view saved websites'}
              title={user ? 'Saved websites' : 'Login to view saved websites'}
              aria-current={activeView === 'saved' ? 'page' : undefined}
              className={`fixed top-3.5 right-3 sm:top-4 sm:right-6 z-[53] bg-transparent border-0 p-2 hover:opacity-75 flex items-center justify-center cursor-pointer transition-all duration-150 ${
                isSavedIconOnWhite
                  ? 'text-black'
                  : 'text-white drop-shadow-[0_1px_6px_rgba(2,3,26,0.35)]'
              }`}
            >
              <Bookmark
                className="w-5 h-5"
                fill={user && (activeView === 'saved' || savedSites.length > 0) ? 'currentColor' : 'none'}
              />
            </button>
          )}

          {activeView === 'library' && (
            <>
              {/* Hero Headline Stack */}
              <div className="relative z-[2] text-center mt-[72px] max-w-[1000px]">
                <div className="glass fiwi-eyebrow mono inline-flex flex-wrap justify-center gap-[14px] py-[8px] px-[18px] rounded-none text-[12px] tracking-[0.08em] uppercase text-[#02031A]">
                  <span>: Discover</span>
                  <span>: Explore</span>
                  <span>: Connect</span>
                  <span>: Test :</span>
                </div>

                <div>
                  <h1
                    className={`font-display mt-[22px] mx-auto max-w-[1000px] leading-[0.95] font-medium tracking-[-0.01em] ${
                      activePage === 'Hero'
                        ? 'text-[68px] sm:text-[104px] lg:text-[136px]'
                        : 'text-[56px] sm:text-[88px] lg:text-[116px]'
                    }`}
                  >
                    {currentCopy.hero}
                  </h1>

                  <p className="mt-[24px] mx-auto max-w-[560px] text-[19px] font-medium leading-[1.45]">
                    {currentCopy.subtext}
                  </p>
                </div>

                {isHeroView && (
                  <div className="flex gap-[12px] justify-center mt-[32px] flex-wrap">
                    <a
                      href="#site-previews"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('site-previews')?.scrollIntoView({behavior: 'smooth'});
                      }}
                      className="btn bg-[#02031A] text-white"
                    >
                      Explore sites
                    </a>
                    <a
                      href="#community"
                      onClick={(e) => {
                        e.preventDefault();
                        openLibraryTab('Connect');
                      }}
                      className="btn glass fiwi-cta-glass btn-square text-[#02031A]"
                    >
                      <span>Join the community</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Bottom Filter Tabs + Site Discovery Grid */}
              <div
                id="site-previews"
                className="relative z-[2] mt-10 sm:mt-14 pt-[24px] pb-6 w-full max-w-[1200px]"
              >
                {configChecked && (!supabaseConfigured || !schemaReady) && (
                  <div
                    role="status"
                    className="mb-5 p-4 border border-white/65 bg-white/85 backdrop-blur-md text-[#02031A] text-left flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-[#1020F5] shrink-0 mt-0.5" />
                      <div>
                        <div className="mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1020F5]">
                          {!supabaseConfigured
                            ? 'Database setup required'
                            : 'Supabase connected — run SQL migrations'}
                        </div>
                        <p className="m-0 mt-0.5 text-[13.5px] font-medium text-[#02031A]/85">
                          {!supabaseConfigured ? (
                            <>
                              Connect your Supabase project (<code className="mono text-[12px]">VITE_SUPABASE_URL</code>,{' '}
                              <code className="mono text-[12px]">VITE_SUPABASE_ANON_KEY</code>,{' '}
                              <code className="mono text-[12px]">SUPABASE_SERVICE_ROLE_KEY</code>) and run the SQL
                              migrations in <code className="mono text-[12px]">SUPABASE_SETUP.md</code> to enable live
                              discovery, accounts, submissions, and collections.
                            </>
                          ) : (
                            <>
                              Your Supabase keys are connected! Run{' '}
                              <code className="mono text-[12px]">supabase/migrations/202611170001_fiwi_core_schema.sql</code>{' '}
                              and <code className="mono text-[12px]">supabase/migrations/202611170002_fiwi_storage.sql</code>{' '}
                              in your Supabase SQL Editor to finish creating the FiWi tables and storage buckets.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openDocsPage}
                      className="mono text-[11px] uppercase tracking-[0.08em] font-semibold text-[#1020F5] hover:underline bg-transparent border-0 p-0 cursor-pointer shrink-0"
                    >
                      Read Docs
                    </button>
                  </div>
                )}

                <div className="glass fiwi-tabs flex gap-[4px] justify-center mx-auto mb-[20px] p-[5px] rounded-2xl md:rounded-full w-fit max-w-full flex-wrap md:flex-nowrap">
                  {activePage === 'Hero' ? (
                    FILTER_TABS.map((tab) => {
                      const isActive = tileFilter === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setTileFilter(tab)}
                          className={`btn lab tab-btn ${
                            isActive ? 'bg-[#1020F5] text-white' : 'bg-transparent text-[#02031A]'
                          }`}
                        >
                          {tab}
                        </button>
                      );
                    })
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSubCategoryFilter(null)}
                        className={`btn lab tab-btn-category ${
                          subCategoryFilter === null
                            ? 'bg-[#1020F5] text-white'
                            : 'bg-transparent text-[#02031A]'
                        }`}
                      >
                        All
                      </button>
                      {SHOWCASE_CATEGORIES.map((category) => {
                        const isActive = subCategoryFilter === category;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() =>
                              setSubCategoryFilter((prev) => (prev === category ? null : category))
                            }
                            className={`btn lab tab-btn-category ${
                              isActive ? 'bg-[#1020F5] text-white' : 'bg-transparent text-[#02031A]'
                            }`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>

                {activePage !== 'Hero' && (
                  <div className="glass fiwi-filter-bar mb-4 px-3.5 sm:px-4 py-2 text-[#02031A] flex flex-wrap items-center justify-between gap-2.5 focus-within:border-white">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search
                        aria-hidden="true"
                        className="pointer-events-none w-4 h-4 text-[#02031A]/55 absolute left-1 top-1/2 -translate-y-1/2"
                      />
                      <input
                        type="search"
                        value={librarySearchQuery}
                        onChange={(e) => setLibrarySearchQuery(e.target.value)}
                        placeholder={`Search ${activePage === 'All' ? 'library' : activePage} by name, topic, AI tool, or tech stack...`}
                        aria-label="Filter library websites"
                        className="w-full h-9 pl-7 pr-8 bg-transparent border-0 text-[13.5px] font-medium text-[#02031A] placeholder:text-[#02031A]/55 focus:outline-none"
                      />
                      {librarySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setLibrarySearchQuery('')}
                          aria-label="Clear library search"
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-[#02031A]/55 hover:text-[#02031A] bg-transparent border-0 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {activePage === 'Vibecoded' && (
                        <select
                          aria-label="Filter by AI tool"
                          value={libraryAiToolFilter}
                          onChange={(e) => setLibraryAiToolFilter(e.target.value)}
                          className="h-8 px-2.5 bg-white/75 border border-[#02031A]/15 text-[12px] font-medium text-[#02031A] focus:outline-none"
                        >
                          <option value="">All AI tools</option>
                          {AI_TOOLS_OPTIONS.map((tool) => (
                            <option key={tool.id} value={tool.id}>
                              {tool.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {libraryTagFilter && (
                        <button
                          type="button"
                          onClick={() => setLibraryTagFilter('')}
                          className="h-8 px-2.5 bg-[#1020F5] text-white text-[11px] mono uppercase tracking-[0.06em] inline-flex items-center gap-1 border-0 cursor-pointer"
                        >
                          <span>#{libraryTagFilter}</span>
                          <X className="w-3 h-3" />
                        </button>
                      )}

                      <span
                        aria-hidden="true"
                        className="hidden sm:block h-4 w-px bg-[#02031A]/15"
                      />

                      <span className="mono text-[11px] uppercase tracking-[0.06em] text-[#02031A]/70 tabular-nums px-1">
                        {libraryTotal} {libraryTotal === 1 ? 'site' : 'sites'}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setLibrarySort((prev) =>
                            prev === 'newest' ? 'popular' : prev === 'popular' ? 'title' : 'newest',
                          )
                        }
                        className="h-9 px-2.5 rounded-full bg-transparent border-0 hover:bg-white/30 text-[12.5px] font-medium text-[#02031A] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-[#02031A]/65" />
                        <span>
                          {librarySort === 'newest'
                            ? 'Newest'
                            : librarySort === 'popular'
                              ? 'Popular'
                              : 'A–Z'}
                        </span>
                      </button>

                      {(subCategoryFilter !== null ||
                        librarySearchQuery.trim().length > 0 ||
                        libraryAiToolFilter !== '' ||
                        libraryTagFilter !== '') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSubCategoryFilter(null);
                            setLibrarySearchQuery('');
                            setLibraryAiToolFilter('');
                            setLibraryTagFilter('');
                          }}
                          className="h-9 px-2.5 rounded-full bg-transparent border-0 hover:bg-white/30 text-[12px] font-semibold text-[#1020F5] cursor-pointer transition-colors"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {saveLimitNotice && (
                    <motion.div
                      key="library-save-limit-notice"
                      variants={fiwiPanelRevealVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      role="alert"
                      className="mb-4 p-4 border border-[#B91C1C]/35 bg-white/95 text-[#02031A] flex flex-wrap items-center justify-between gap-3 text-left shadow-sm"
                    >
                      <span className="text-[13.5px] font-medium text-[#991B1B]">
                        {saveLimitNotice}
                      </span>
                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSaveLimitNotice(null);
                            openPricingPage();
                          }}
                          className="mono text-[11px] uppercase tracking-[0.08em] font-semibold text-[#1020F5] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                        >
                          Upgrade plan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSaveLimitNotice(null);
                            openSavedPage();
                          }}
                          className="mono text-[11px] uppercase tracking-[0.08em] font-semibold text-[#02031A]/75 hover:text-[#02031A] bg-transparent border-0 p-0 cursor-pointer"
                        >
                          Manage saved
                        </button>
                        <button
                          type="button"
                          onClick={() => setSaveLimitNotice(null)}
                          aria-label="Dismiss save limit notice"
                          className="text-[#02031A]/55 hover:text-[#02031A] bg-transparent border-0 p-0 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {libraryLoading
                    ? Array.from({length: activePage === 'Hero' ? 8 : 8}).map((_, idx) => (
                        <div key={`skeleton-${idx}`} className="flex flex-col text-left">
                          <div className="w-full aspect-[16/10] rounded-2xl bg-[#02031A]/10 dark:bg-white/5 animate-pulse border border-[#02031A]/10 dark:border-white/10" />
                          <div className="mt-2.5 space-y-1.5 px-1">
                            <div className="h-4 w-3/5 bg-[#02031A]/15 dark:bg-white/10 rounded animate-pulse" />
                            <div className="h-3 w-2/5 bg-[#02031A]/10 dark:bg-white/5 rounded animate-pulse" />
                          </div>
                        </div>
                      ))
                    : visibleSites.map((site) => {
                        const saved = isSiteSaved(site);
                        return (
                          <SiteCard
                            key={site.id}
                            site={site}
                            isSaved={saved}
                            onSelect={() => openWebsiteDetailPage(site)}
                            onToggleLike={() => void handleToggleLikeSite(site)}
                            onToggleSave={() => void handleTileToggleSaveSite(site)}
                            onDelete={
                              user?.id === site.authorId || user?.isAdmin
                                ? () => handleDeletePublishedSite(site)
                                : undefined
                            }
                            canDelete={user?.id === site.authorId || user?.isAdmin}
                          />
                        );
                      })}

                  {!libraryLoading &&
                    Array.from({length: activePage === 'Hero' ? placeholderCount : visibleSites.length === 0 ? 4 : 0}).map(
                      (_, idx) => {
                        const hasActiveFilter =
                          activePage !== 'Hero' &&
                          (subCategoryFilter !== null ||
                            debouncedSearchQuery.length > 0 ||
                            libraryAiToolFilter !== '' ||
                            libraryTagFilter !== '');
                        const isFirstEmpty = visibleSites.length === 0 && idx === 0;
                        return (
                          <div
                            key={`placeholder-${idx}`}
                            className="tile flex-col justify-end items-start text-left"
                          >
                            {isFirstEmpty ? (
                              <div className="w-full flex flex-col items-start gap-2">
                                <span className="mono text-[11px] uppercase tracking-[0.06em] text-[#02031A]/75">
                                  {libraryError && supabaseConfigured
                                    ? libraryError
                                    : hasActiveFilter
                                      ? 'No matching websites found'
                                      : 'No published websites yet'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (hasActiveFilter) {
                                      setSubCategoryFilter(null);
                                      setLibrarySearchQuery('');
                                      setLibraryAiToolFilter('');
                                      setLibraryTagFilter('');
                                    } else {
                                      openSubmitView(null);
                                    }
                                  }}
                                  className="h-7 px-2.5 bg-[#02031A] text-white hover:bg-[#1020F5] text-[11px] mono uppercase tracking-[0.06em] cursor-pointer border-0 transition-colors"
                                >
                                  {hasActiveFilter ? 'Clear filters' : 'Submit a website'}
                                </button>
                              </div>
                            ) : (
                              <span className="mono text-[12px]">
                                {activePage === 'Hero'
                                  ? tileFilter === 'All'
                                    ? 'Site preview'
                                    : `${tileFilter} · Site preview`
                                  : subCategoryFilter
                                    ? `${subCategoryFilter} · Site preview`
                                    : `${activePage} · Site preview`}
                              </span>
                            )}
                          </div>
                        );
                      },
                    )}
                </div>

                {activePage !== 'Hero' && remainingLibraryCount > 0 && (
                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      disabled={libraryLoadingMore}
                      onClick={handleLoadMoreLibrary}
                      className="btn glass fiwi-cta-glass text-[#02031A] px-6 h-10 inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      {libraryLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Show more ({remainingLibraryCount} remaining)</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeView === 'pricing' && (
            <Suspense
              fallback={
                <div className="relative z-[2] w-full max-w-[1200px] mt-[56px] mb-24 min-h-[680px]" />
              }
            >
              <PricingSection
                variant="standalone"
                billingCycle={billingCycle}
                onBillingCycleChange={setBillingCycle}
                selectedPlan={selectedPlan}
                currentPlan={user ? activePlan : undefined}
                onSelectPlan={(planId) => setSelectedPlan(planId)}
                onActivatePlan={handleActivatePlan}
                isLoggedIn={Boolean(user)}
                onContinueWithPlan={() => {
                  if (user) {
                    openSubmitView(null);
                  } else {
                    setStoredPendingAction({type: 'library'});
                    openAuthView('signup');
                  }
                }}
                onOpenSubmitOrAuth={() => {
                  if (user) {
                    openSubmitView(null);
                  } else {
                    setStoredPendingAction({type: 'submit'});
                    openAuthView('login');
                  }
                }}
              />
            </Suspense>
          )}

          {activeView === 'auth' && (
            <div className="relative z-[2] w-full max-w-[560px] flex flex-col items-center text-center my-auto py-2">
              {authMode === 'verify' ? (
                <div>
                  <h1 className="font-display leading-[0.95] font-medium tracking-[-0.01em] text-[40px] sm:text-[54px] lg:text-[60px]">
                    Check your inbox.{' '}
                    <span className="font-serif-italic font-normal text-[38px] sm:text-[50px] lg:text-[56px]">
                      Verify.
                    </span>
                  </h1>
                  <p className="mt-2 mx-auto max-w-[440px] text-[15px] font-medium leading-[1.4] text-white/95">
                    We sent an activation link to your email. Click the link to complete registration and log in automatically.
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="font-display leading-[0.95] font-medium tracking-[-0.01em] text-[40px] sm:text-[54px] lg:text-[60px]">
                    {authMode === 'login'
                      ? 'Welcome back.'
                      : authMode === 'signup'
                        ? 'Join the library.'
                        : 'Reset password.'}{' '}
                    <span className="font-serif-italic font-normal text-[38px] sm:text-[50px] lg:text-[56px]">
                      {authMode === 'login'
                        ? 'Sign in.'
                        : authMode === 'signup'
                          ? 'Sign up.'
                          : 'Recover.'}
                    </span>
                  </h1>

                  <p className="mt-2 mx-auto max-w-[440px] text-[15px] font-medium leading-[1.4] text-white/95">
                    {authMode === 'login'
                      ? 'Sign in to submit websites to the FiWi collection and manage your discoveries.'
                      : authMode === 'signup'
                        ? 'Create a FiWi member account to publish websites and connect with builders.'
                        : 'Enter your email address and we will send a password recovery link.'}
                  </p>
                </div>
              )}

              {authMode !== 'verify' && authMode !== 'forgot' && (
                <div className="glass fiwi-tabs flex gap-[4px] justify-center mt-4 mb-4 p-[5px] rounded-full w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                      setAuthInfoNotice(null);
                    }}
                    className={`btn lab tab-btn ${
                      authMode === 'login' ? 'bg-[#1020F5] text-white' : 'bg-transparent text-[#02031A]'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError(null);
                      setAuthInfoNotice(null);
                    }}
                    className={`btn lab tab-btn ${
                      authMode === 'signup' ? 'bg-[#1020F5] text-white' : 'bg-transparent text-[#02031A]'
                    }`}
                  >
                    Sign up
                  </button>
                </div>
              )}

              {authMode === 'verify' ? (
                <div className="glass fiwi-auth-card w-full mt-5 p-7 sm:p-9 text-center flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-[#1020F5]/10 border border-[#1020F5]/25 flex items-center justify-center text-[#1020F5] shadow-inner">
                    <MailCheck className="w-8 h-8" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/65">
                      Verification link sent to
                    </span>
                    <div className="mono text-[14px] sm:text-[15px] font-semibold text-[#02031A] px-4 py-1.5 rounded-full bg-white/80 border border-[#02031A]/12 inline-block max-w-[380px] truncate">
                      {needsVerificationEmail || authEmail}
                    </div>
                  </div>

                  <div className="max-w-[420px] text-[13.5px] leading-relaxed text-[#02031A]/80 bg-white/55 border border-[#02031A]/10 p-4 rounded-xl text-left">
                    <p className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#1020F5] shrink-0 mt-0.5" />
                      <span>
                        Click the button in your email to activate your account.
                        <strong> You won't need to manually log in</strong> — your session will be established automatically upon verification.
                      </span>
                    </p>
                  </div>

                  <AnimatePresence initial={false}>
                    {authError && (
                      <motion.div
                        key="verify-error-banner"
                        variants={fiwiPanelRevealVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        role="alert"
                        className="w-full border border-[#B91C1C]/35 bg-white/85 px-3 py-2 text-[13px] font-medium text-[#991B1B] text-left"
                      >
                        {authError}
                      </motion.div>
                    )}
                    {authInfoNotice && (
                      <motion.div
                        key="verify-info-banner"
                        variants={fiwiPanelRevealVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        role="status"
                        className="w-full border border-[#1020F5]/30 bg-white/90 px-3 py-2.5 text-[13px] font-medium text-[#02031A] text-left"
                      >
                        {authInfoNotice}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-full flex flex-col gap-3 pt-2">
                    <motion.button
                      type="button"
                      disabled={resendingVerification || resendCooldown > 0}
                      onClick={handleResendVerification}
                      whileTap={FIWI_TAP}
                      className="btn h-[48px] bg-[#1020F5] text-white w-full hover:bg-[#02031A] disabled:opacity-60 inline-flex items-center justify-center gap-2 font-medium"
                    >
                      {resendingVerification ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Resending verification email...</span>
                        </>
                      ) : resendCooldown > 0 ? (
                        <>
                          <Clock className="w-4 h-4 opacity-75" />
                          <span>Resend in {resendCooldown}s</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Resend verification email</span>
                        </>
                      )}
                    </motion.button>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#02031A]/10 w-full text-[13px]">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setAuthError(null);
                          setAuthInfoNotice(null);
                        }}
                        className="lab text-[#1020F5] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Use a different email
                      </button>
                      <button
                        type="button"
                        onClick={() => openLibraryTab('Hero')}
                        className="lab text-[#02031A]/75 hover:text-[#02031A] bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Browse library
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleAuthSubmit}
                  className="glass fiwi-auth-card w-full min-h-[380px] sm:min-h-[420px] p-7 sm:p-9 text-left flex flex-col justify-between gap-6"
                  noValidate
                >
                  <div className="flex flex-col gap-4">
                    {configChecked && !supabaseConfigured && (
                      <div className="border border-[#B91C1C]/35 bg-white/90 px-3 py-2.5 text-[12.5px] font-medium text-[#991B1B]">
                        Supabase Auth is not configured yet. Follow <code className="mono">SUPABASE_SETUP.md</code>{' '}
                        to enable signup and login.
                      </div>
                    )}

                    {/* Google OAuth Button */}
                    {authMode !== 'forgot' && (
                      <div className="flex flex-col gap-3">
                        <motion.button
                          type="button"
                          disabled={isGoogleSubmitting || isSubmittingAuth}
                          onClick={handleGoogleSignIn}
                          whileTap={FIWI_TAP}
                          className="btn h-[48px] w-full border border-[#02031A]/18 bg-white/90 hover:bg-white text-[#02031A] font-medium text-[14px] inline-flex items-center justify-center gap-3 shadow-[0_1px_3px_rgba(2,3,26,0.06)] disabled:opacity-60 cursor-pointer transition-all"
                        >
                          {isGoogleSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#1020F5]" />
                              <span>Connecting to Google...</span>
                            </>
                          ) : (
                            <>
                              <GoogleIcon className="w-4 h-4 shrink-0" />
                              <span>
                                {authMode === 'signup'
                                  ? 'Sign up with Google'
                                  : 'Continue with Google'}
                              </span>
                            </>
                          )}
                        </motion.button>

                        <div className="flex items-center gap-3 my-1">
                          <div className="h-px flex-1 bg-[#02031A]/12" />
                          <span className="mono text-[10px] uppercase tracking-[0.08em] text-[#02031A]/55">
                            or continue with email
                          </span>
                          <div className="h-px flex-1 bg-[#02031A]/12" />
                        </div>
                      </div>
                    )}

                    {authMode === 'signup' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <label className="flex flex-col gap-1.5">
                          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                            Full name
                          </span>
                          <input
                            type="text"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Alex Mercer"
                            autoComplete="name"
                            required
                            className="fiwi-field"
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                            Username
                          </span>
                          <input
                            type="text"
                            value={authHandle}
                            onChange={(e) => setAuthHandle(e.target.value)}
                            placeholder="alex"
                            autoComplete="username"
                            className="fiwi-field"
                          />
                          {authHandle.trim().length >= 3 && (
                            <span
                              className={`mono text-[10px] tracking-[0.04em] ${
                                usernameStatus.checking
                                  ? 'text-[#02031A]/60'
                                  : usernameStatus.valid === false || usernameStatus.available === false
                                    ? 'text-[#B91C1C]'
                                    : usernameStatus.available
                                      ? 'text-[#166534]'
                                      : 'text-[#02031A]/60'
                              }`}
                            >
                              {usernameStatus.checking
                                ? 'Checking availability...'
                                : usernameStatus.valid === false
                                  ? usernameStatus.reason
                                  : usernameStatus.available === false
                                    ? 'Username already taken'
                                    : usernameStatus.available
                                      ? 'Username available'
                                      : ''}
                            </span>
                          )}
                        </label>
                      </div>
                    )}

                    <label className="flex flex-col gap-1.5">
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                        Email address
                      </span>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="you@domain.com"
                        autoComplete="email"
                        required
                        className="fiwi-field"
                      />
                    </label>

                    {authMode === 'signup' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <label className="flex flex-col gap-1.5">
                          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                            Password
                          </span>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="Min 6 characters"
                              autoComplete="new-password"
                              required
                              className="fiwi-field pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#02031A]/65 hover:text-[#02031A] bg-transparent border-0 p-1 cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                            Confirm password
                          </span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={authConfirmPassword}
                            onChange={(e) => setAuthConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            required
                            className="fiwi-field"
                          />
                        </label>
                      </div>
                    )}

                    {authMode === 'login' && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                            Password
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('forgot');
                              setAuthError(null);
                              setAuthInfoNotice(null);
                            }}
                            className="mono text-[10.5px] uppercase tracking-[0.06em] text-[#1020F5] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="Enter password"
                            autoComplete="current-password"
                            required
                            className="fiwi-field pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#02031A]/65 hover:text-[#02031A] bg-transparent border-0 p-1 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <AnimatePresence initial={false}>
                      {authError && (
                        <motion.div
                          key="auth-error-banner"
                          variants={fiwiPanelRevealVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          role="alert"
                          className="border border-[#B91C1C]/35 bg-white/85 px-3 py-2 text-[13px] font-medium text-[#991B1B]"
                        >
                          {authError}
                        </motion.div>
                      )}

                      {authInfoNotice && (
                        <motion.div
                          key="auth-info-banner"
                          variants={fiwiPanelRevealVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          role="status"
                          className="border border-[#1020F5]/30 bg-white/90 px-3 py-2.5 text-[13px] font-medium text-[#02031A]"
                        >
                          {authInfoNotice}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <motion.button
                        type="submit"
                        disabled={isSubmittingAuth || isGoogleSubmitting}
                        whileTap={FIWI_TAP}
                        className="btn h-[48px] bg-[#02031A] text-white flex-1 hover:bg-[#1020F5] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                      >
                        {isSubmittingAuth ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Please wait...</span>
                          </>
                        ) : authMode === 'login' ? (
                          'Login'
                        ) : authMode === 'signup' ? (
                          'Create account'
                        ) : (
                          'Send reset link'
                        )}
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => openLibraryTab('Hero')}
                        className="btn h-[48px] btn-square border border-[#02031A]/20 bg-white/65 text-[#02031A] hover:bg-white"
                      >
                        Back
                      </button>
                    </div>

                    <div className="pt-3 border-t border-[#02031A]/12 flex items-center justify-between gap-3 flex-wrap text-[13px] text-[#02031A]/80">
                      <span>
                        {authMode === 'login'
                          ? 'New to FiWi?'
                          : authMode === 'signup'
                            ? 'Already have an account?'
                            : 'Remembered your password?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode(authMode === 'login' ? 'signup' : 'login');
                          setAuthError(null);
                          setAuthInfoNotice(null);
                        }}
                        className="lab text-[14px] text-[#1020F5] hover:opacity-80 bg-transparent border-0 p-0 cursor-pointer"
                      >
                        {authMode === 'login' ? 'Create an account' : 'Login instead'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeView === 'reset-password' && (
            <div className="relative z-[2] w-full max-w-[500px] flex flex-col items-center text-center my-auto py-4">
              <h1 className="font-display leading-[0.95] font-medium tracking-[-0.01em] text-[44px] sm:text-[58px]">
                Set new password.
              </h1>
              <p className="mt-2 mx-auto max-w-[420px] text-[15px] font-medium text-white/95">
                Choose a strong password for your FiWi account.
              </p>

              <form
                onSubmit={handlePasswordUpdateSubmit}
                className="glass fiwi-auth-card w-full mt-6 p-7 sm:p-8 text-left flex flex-col gap-4"
              >
                <label className="flex flex-col gap-1.5">
                  <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                    New password
                  </span>
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="fiwi-field"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="fiwi-field"
                  />
                </label>

                {passwordUpdateError && (
                  <div className="border border-[#B91C1C]/35 bg-white/85 px-3 py-2 text-[13px] font-medium text-[#991B1B]">
                    {passwordUpdateError}
                  </div>
                )}

                <div className="flex gap-3 mt-1">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="btn h-[46px] bg-[#02031A] text-white flex-1 hover:bg-[#1020F5] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {updatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Update password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openLibraryTab('Hero')}
                    className="btn h-[46px] btn-square border border-[#02031A]/20 bg-white/65 text-[#02031A] hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeView === 'submit' && user && (
            <Suspense
              fallback={
                <div className="relative z-[2] w-full max-w-[820px] mt-[56px] mb-24 min-h-[560px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white/80" />
                </div>
              }
            >
              <SubmitWebsiteFlow
                key={editingSubmission?.id ?? `new-${initialSubmitCategory ?? 'none'}`}
                initialCategory={initialSubmitCategory}
                editingSubmission={editingSubmission}
                userName={user.name}
                userHandle={user.handle}
                onCompleted={async () => {
                  await refreshUserWorkspace();
                  refreshPublicLibrary();
                }}
                onViewMySubmissions={openMySubmissionsPage}
                onExit={() => openLibraryTab('Hero')}
              />
            </Suspense>
          )}

          {activeView === 'my-submissions' && user && (
            <Suspense
              fallback={
                <div className="relative z-[2] w-full max-w-[960px] mt-[56px] mb-24 min-h-[420px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white/80" />
                </div>
              }
            >
              <MySubmissionsSection
                submissions={mySubmissions}
                onStartNew={() => openSubmitView(null)}
                onEditSubmission={(sub) => openSubmitView(sub)}
                onBack={() => openLibraryTab('Hero')}
              />
            </Suspense>
          )}

          {activeView === 'profile' && (
            <Suspense
              fallback={
                <div className="relative z-[2] w-full max-w-[1200px] mt-[56px] mb-24 min-h-[480px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white/80" />
                </div>
              }
            >
              <PublicProfilePage
                username={activeProfileUsername}
                viewerUserId={user?.id ?? null}
                onBack={() => openLibraryTab('Hero')}
                onOpenSite={(site) => openWebsiteDetailPage(site)}
                onOpenCollection={openCollectionPage}
                onOpenSettings={openSettingsPage}
                onToggleSaveSite={handleTileToggleSaveSite}
                isSiteSaved={isSiteSaved}
              />
            </Suspense>
          )}

          {activeView === 'collection' && (
            <Suspense
              fallback={
                <div className="relative z-[2] w-full max-w-[1200px] mt-[56px] mb-24 min-h-[480px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white/80" />
                </div>
              }
            >
              <CollectionPage
                slugOrId={activeCollectionSlug}
                onBack={() => (user ? openSavedPage() : openLibraryTab('Hero'))}
                onOpenProfile={openPublicProfile}
                onOpenSite={(site) => openWebsiteDetailPage(site)}
              />
            </Suspense>
          )}

          {activeView === 'saved' && user && (
            <>
              <div className="relative z-[2] text-center mt-[72px] max-w-[1000px]">
                <div className="glass fiwi-eyebrow mono inline-flex flex-wrap justify-center gap-[14px] py-[8px] px-[18px] rounded-none text-[12px] tracking-[0.08em] uppercase text-[#02031A]">
                  <span>: Saved</span>
                  <span>: Collections</span>
                  <span>: Inspiration</span>
                  <span>: Library :</span>
                </div>

                <h1 className="font-display mt-[22px] mx-auto max-w-[1000px] leading-[0.95] font-medium tracking-[-0.01em] text-[56px] sm:text-[88px] lg:text-[116px]">
                  Personal collections.
                </h1>

                <p className="mt-[24px] mx-auto max-w-[600px] text-[19px] font-medium leading-[1.45]">
                  Save your discoveries into named personal collections, share public boards, and revisit them anytime.
                </p>

                <div className="flex gap-[12px] justify-center mt-[32px] flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickSave((prev) => !prev);
                      setShowNewCollectionForm(false);
                      setQuickSaveError(null);
                      setCollectionError(null);
                    }}
                    className="btn bg-[#02031A] text-white inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{showQuickSave ? 'Close form' : 'Save a website'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCollectionForm((prev) => !prev);
                      setShowQuickSave(false);
                      setCollectionError(null);
                    }}
                    className="btn glass fiwi-cta-glass btn-square text-[#02031A] inline-flex items-center gap-2"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>{showNewCollectionForm ? 'Cancel' : 'New collection'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openLibraryTab('All')}
                    className="btn glass fiwi-cta-glass btn-square text-[#02031A]"
                  >
                    <span>Browse All sites</span>
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {showNewCollectionForm && (
                  <motion.div
                    key="new-collection-form"
                    variants={fiwiModalBackdropVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full flex justify-center mt-8"
                  >
                    <form
                      onSubmit={handleCreateCollectionSubmit}
                      className="glass fiwi-auth-card relative z-[2] w-full max-w-[560px] p-6 sm:p-7 text-left space-y-4"
                      noValidate
                    >
                      <label className="flex flex-col gap-1.5">
                        <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                          Collection name
                        </span>
                        <input
                          type="text"
                          value={newCollectionName}
                          onChange={(e) => {
                            setNewCollectionName(e.target.value);
                            setCollectionError(null);
                          }}
                          placeholder="SaaS Inspiration, Vibecoded Prompts, QA Targets..."
                          required
                          className="fiwi-field"
                        />
                      </label>

                      <label className="flex flex-col gap-1.5">
                        <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                          Description (optional)
                        </span>
                        <input
                          type="text"
                          value={newCollectionDescription}
                          onChange={(e) => setNewCollectionDescription(e.target.value)}
                          placeholder="Curated visual references for upcoming product sprints..."
                          className="fiwi-field"
                        />
                      </label>

                      <label className="flex items-center gap-2.5 text-[13px] font-medium text-[#02031A] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newCollectionPublic}
                          onChange={(e) => setNewCollectionPublic(e.target.checked)}
                          className="w-4 h-4 accent-[#1020F5]"
                        />
                        <span>Make collection public (visible on your profile &amp; shareable)</span>
                      </label>

                      {collectionError && (
                        <div
                          role="alert"
                          className="border border-[#B91C1C]/35 bg-white/85 px-3.5 py-2 text-[13px] font-medium text-[#991B1B]"
                        >
                          {collectionError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={creatingCollection}
                          className="btn h-[46px] bg-[#02031A] text-white flex-1 hover:bg-[#1020F5] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                          {creatingCollection && <Loader2 className="w-4 h-4 animate-spin" />}
                          <span>Create collection</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCollectionForm(false);
                            setCollectionError(null);
                          }}
                          className="btn h-[46px] btn-square border border-[#02031A]/20 bg-white/65 text-[#02031A] hover:bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {showQuickSave && (
                  <motion.div
                    key="quick-save-form"
                    variants={fiwiModalBackdropVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full flex justify-center mt-8"
                  >
                    <form
                      onSubmit={handleQuickSaveSubmit}
                      className="glass fiwi-auth-card relative z-[2] w-full max-w-[620px] p-6 sm:p-7 text-left"
                      noValidate
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1.5">
                          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                            Website name
                          </span>
                          <input
                            type="text"
                            value={quickSaveTitle}
                            onChange={(e) => setQuickSaveTitle(e.target.value)}
                            placeholder="Atelier Nord"
                            required
                            className="fiwi-field"
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                            Category
                          </span>
                          <select
                            value={quickSaveCategory}
                            onChange={(e) => setQuickSaveCategory(e.target.value as ShowcaseCategory)}
                            className="fiwi-field"
                          >
                            {SHOWCASE_CATEGORIES.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <label className="flex flex-col gap-1.5">
                          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                            Website URL
                          </span>
                          <input
                            type="url"
                            value={quickSaveUrl}
                            onChange={(e) => setQuickSaveUrl(e.target.value)}
                            placeholder="https://ateliernord.design"
                            required
                            className="fiwi-field"
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                            Personal collection
                          </span>
                          <select
                            value={
                              collections.some((c) => c.id === quickSaveCollectionId)
                                ? quickSaveCollectionId
                                : collections[0]?.id ?? ''
                            }
                            onChange={(e) => setQuickSaveCollectionId(e.target.value)}
                            className="fiwi-field"
                          >
                            {collections.map((col) => (
                              <option key={col.id} value={col.id}>
                                {col.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {quickSaveError && (
                        <div
                          role="alert"
                          className="mt-4 border border-[#B91C1C]/35 bg-white/85 px-3.5 py-2.5 text-[13px] font-medium text-[#991B1B] flex flex-wrap items-center justify-between gap-2"
                        >
                          <span>{quickSaveError}</span>
                          {isAtSaveLimit && (
                            <button
                              type="button"
                              onClick={openPricingPage}
                              className="mono text-[11px] uppercase tracking-[0.06em] font-semibold text-[#1020F5] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                            >
                              Upgrade plan
                            </button>
                          )}
                        </div>
                      )}

                      <div className="mt-5 flex gap-3">
                        <button
                          type="submit"
                          disabled={quickSaveSubmitting}
                          className="btn h-[46px] bg-[#02031A] text-white flex-1 hover:bg-[#1020F5] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                          {quickSaveSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                          <span>Add to collection</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQuickSave(false)}
                          className="btn h-[46px] btn-square border border-[#02031A]/20 bg-white/65 text-[#02031A] hover:bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative z-[2] mt-10 sm:mt-14 pt-[24px] pb-6 w-full max-w-[1200px]">
                {/* Saved Websites Quota & Plan Limit Strip */}
                <div className="mb-5 p-4 sm:px-5 bg-white/80 border border-[#02031A]/14 text-[#02031A] text-left">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <span className="mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1020F5] tabular-nums">
                        {activePlanMeta.label} plan · {savedSites.length} / {activeSaveLimit} saved websites
                      </span>
                      <span className="text-[13px] text-[#02031A]/75">
                        {activePlanMeta.tagline}
                      </span>
                    </div>

                    {activePlan !== 'pro' && (
                      <button
                        type="button"
                        onClick={openPricingPage}
                        className="mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1020F5] hover:underline bg-transparent border-0 p-0 cursor-pointer shrink-0"
                      >
                        {activePlan === 'free'
                          ? 'Upgrade to Plus (100) or Pro (500)'
                          : 'Upgrade to Pro (500)'}
                      </button>
                    )}
                  </div>

                  <div
                    className="mt-2.5 h-1.5 w-full bg-[#02031A]/10 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={savedSites.length}
                    aria-valuemin={0}
                    aria-valuemax={activeSaveLimit}
                    aria-label="Saved websites storage quota"
                  >
                    <div
                      className={`h-full transition-all duration-300 ${
                        isAtSaveLimit ? 'bg-[#B91C1C]' : 'bg-[#1020F5]'
                      }`}
                      style={{width: `${saveProgressPercent}%`}}
                    />
                  </div>

                  {isAtSaveLimit && (
                    <p role="status" className="mt-2 mb-0 text-[12.5px] font-medium text-[#991B1B]">
                      {savedSites.length > activeSaveLimit
                        ? `You have ${savedSites.length} saved websites, above your ${activePlanMeta.label} limit of ${activeSaveLimit}. Existing saves remain intact—remove items or upgrade your plan to add more.`
                        : `You have reached your ${activePlanMeta.label} limit of ${activeSaveLimit} saved websites. Remove a saved website or upgrade your plan to save more.`}
                    </p>
                  )}
                </div>

                {/* Named Personal Collections Switcher */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveCollectionId('all')}
                    className={`px-3.5 py-2 text-[13px] font-medium border transition-colors cursor-pointer tabular-nums ${
                      activeCollectionId === 'all'
                        ? 'bg-[#02031A] text-white border-[#02031A]'
                        : 'bg-white/70 text-[#02031A] border-[#02031A]/16 hover:bg-white'
                    }`}
                  >
                    All saved · {savedSites.length}
                  </button>

                  {collections.map((col) => {
                    const count = collectionCountsById.get(col.id) ?? 0;
                    const isActive = activeCollectionId === col.id;
                    const isEditing = editingCollectionId === col.id;

                    if (isEditing) {
                      return (
                        <form
                          key={col.id}
                          onSubmit={(e) => handleRenameCollectionSubmit(e, col.id)}
                          className="inline-flex items-center gap-1 bg-white border border-[#1020F5] px-2 py-1"
                        >
                          <input
                            type="text"
                            value={editingCollectionName}
                            onChange={(e) => {
                              setEditingCollectionName(e.target.value);
                              setCollectionError(null);
                            }}
                            aria-label={`Rename ${col.name}`}
                            autoFocus
                            className="w-32 text-[13px] text-[#02031A] bg-transparent border-0 outline-none px-1"
                          />
                          <button
                            type="submit"
                            aria-label="Save collection name"
                            className="p-1 text-[#1020F5] hover:opacity-75 bg-transparent border-0 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCollectionId(null);
                              setCollectionError(null);
                            }}
                            aria-label="Cancel rename"
                            className="p-1 text-[#02031A]/60 hover:text-[#02031A] bg-transparent border-0 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      );
                    }

                    return (
                      <div
                        key={col.id}
                        className={`inline-flex items-center border transition-colors ${
                          isActive
                            ? 'bg-[#1020F5] text-white border-[#1020F5]'
                            : 'bg-white/70 text-[#02031A] border-[#02031A]/16 hover:bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveCollectionId(col.id)}
                          className="px-3.5 py-2 text-[13px] font-medium bg-transparent border-0 text-inherit cursor-pointer tabular-nums"
                        >
                          {col.name} · {count}
                        </button>
                        <button
                          type="button"
                          onClick={() => openCollectionPage(col.slug || col.id)}
                          aria-label={`Open ${col.name} board`}
                          title="Open full collection board & share settings"
                          className={`pr-1.5 py-2 bg-transparent border-0 cursor-pointer transition-opacity ${
                            isActive ? 'text-white/80 hover:text-white' : 'text-[#02031A]/50 hover:text-[#02031A]'
                          }`}
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCollectionId(col.id);
                            setEditingCollectionName(col.name);
                            setCollectionError(null);
                          }}
                          aria-label={`Rename ${col.name}`}
                          title="Rename collection"
                          className={`pr-1.5 py-2 bg-transparent border-0 cursor-pointer transition-opacity ${
                            isActive ? 'text-white/80 hover:text-white' : 'text-[#02031A]/50 hover:text-[#02031A]'
                          }`}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {!col.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCollectionClick(col.id, col.name)}
                            aria-label={`Delete ${col.name}`}
                            title="Delete collection"
                            className={`pr-2.5 py-2 bg-transparent border-0 cursor-pointer transition-opacity ${
                              isActive ? 'text-white/80 hover:text-white' : 'text-[#02031A]/50 hover:text-[#991B1B]'
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {collectionError && !showNewCollectionForm && (
                  <div
                    role="alert"
                    className="mx-auto mb-4 max-w-[480px] border border-[#B91C1C]/35 bg-white/90 px-3.5 py-2 text-[13px] font-medium text-[#991B1B] text-center"
                  >
                    {collectionError}
                  </div>
                )}

                <div className="glass fiwi-tabs flex gap-[4px] justify-center mx-auto mb-[20px] p-[5px] rounded-2xl md:rounded-full w-fit max-w-full flex-wrap md:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setSavedCategoryFilter(null)}
                    className={`btn lab tab-btn-category ${
                      savedCategoryFilter === null
                        ? 'bg-[#1020F5] text-white'
                        : 'bg-transparent text-[#02031A]'
                    }`}
                  >
                    All
                  </button>
                  {SHOWCASE_CATEGORIES.map((category) => {
                    const isActive = savedCategoryFilter === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setSavedCategoryFilter((prev) => (prev === category ? null : category))
                        }
                        className={`btn lab tab-btn-category ${
                          isActive ? 'bg-[#1020F5] text-white' : 'bg-transparent text-[#02031A]'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
                  {visibleSavedSites.map((site) => {
                    const matchedSubmitted =
                      (site.submittedSiteId
                        ? submittedSiteLookup.byId.get(site.submittedSiteId)
                        : undefined) ??
                      submittedSiteLookup.byId.get(site.id) ??
                      submittedSiteLookup.byUrl.get(site.url.toLowerCase()) ??
                      null;
                    const collectionLabels = site.collectionIds
                      .map((id) => collectionNameById.get(id))
                      .filter(Boolean)
                      .join(', ');
                    const displaySite: SubmittedSite = matchedSubmitted || {
                      id: site.submittedSiteId || site.id,
                      slug: site.submittedSiteId || site.id,
                      title: site.title,
                      url: site.url,
                      description: site.description,
                      category: site.category,
                      subCategory: site.subCategory,
                      tags: [],
                      status: 'published',
                      authorId: user?.id || '',
                      authorHandle: user?.handle || '',
                      authorUsername: user?.handle || '',
                      likesCount: 0,
                      savesCount: 1,
                      viewsCount: 0,
                      createdAt: site.savedAt,
                      updatedAt: site.savedAt,
                    };

                    return (
                      <SiteCard
                        key={site.id}
                        site={displaySite}
                        isSaved={true}
                        onSelect={() => openWebsiteDetailPage(displaySite)}
                        onToggleSave={() => void handleRemoveSavedSite(site.id)}
                      />
                    );
                  })}

                  {Array.from({length: savedPlaceholderCount}).map((_, idx) => {
                    const activeColName =
                      activeCollectionId === 'all'
                        ? null
                        : collectionNameById.get(activeCollectionId) ?? null;
                    return (
                      <div key={`saved-placeholder-${idx}`} className="tile">
                        <span className="mono text-[12px]">
                          {filteredSavedSites.length === 0 && idx === 0
                            ? activeColName
                              ? `No websites in "${activeColName}" yet`
                              : 'No saved websites yet'
                            : savedCategoryFilter
                              ? `${savedCategoryFilter} · Saved`
                              : activeColName
                                ? `${activeColName} · Site preview`
                                : 'Collection · Site preview'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {remainingSavedCount > 0 && (
                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setSavedVisibleCount((prev) => prev + INITIAL_GRID_BATCH)}
                      className="btn glass fiwi-cta-glass text-[#02031A] px-6 h-10"
                    >
                      Show more ({remainingSavedCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeView === 'settings' && user && (
            <div className="relative z-[2] mt-[56px] mb-24 w-full max-w-[660px] flex flex-col items-center text-center">
              <div className="glass fiwi-eyebrow mono inline-flex flex-wrap justify-center gap-[14px] py-[8px] px-[18px] rounded-none text-[12px] tracking-[0.08em] uppercase text-[#02031A]">
                <span>: Account</span>
                <span>: Profile</span>
                <span>: Collections</span>
                <span>: Settings :</span>
              </div>

              <h1 className="font-display mt-[20px] leading-[0.95] font-medium tracking-[-0.01em] text-[56px] sm:text-[76px]">
                Account settings.
              </h1>

              <p className="mt-[14px] max-w-[480px] text-[17px] font-medium leading-[1.45] text-white/95">
                Signed in as {user.name} · {user.handle}
              </p>

              <form
                onSubmit={handleSettingsSubmit}
                className="glass fiwi-auth-card w-full mt-7 p-6 sm:p-8 text-left"
                noValidate
              >
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-[#02031A]/12">
                    <button
                      type="button"
                      onClick={openSavedPage}
                      className="bg-white/65 hover:bg-white border border-[#02031A]/12 px-4 py-3 text-left cursor-pointer transition-colors"
                    >
                      <div className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/60">
                        Saved ({activePlanMeta.label})
                      </div>
                      <div className="font-display text-[26px] font-semibold leading-none mt-1 text-[#02031A] tabular-nums">
                        {savedSites.length}{' '}
                        <span className="text-[15px] font-medium text-[#02031A]/55">
                          / {activeSaveLimit}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={openMySubmissionsPage}
                      className="bg-white/65 hover:bg-white border border-[#02031A]/12 px-4 py-3 text-left cursor-pointer transition-colors"
                    >
                      <div className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/60">
                        My submissions
                      </div>
                      <div className="font-display text-[26px] font-semibold leading-none mt-1 text-[#02031A] tabular-nums">
                        {mySubmissions.length}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => openPublicProfile(user.username)}
                      className="bg-white/65 hover:bg-white border border-[#02031A]/12 px-4 py-3 text-left cursor-pointer transition-colors"
                    >
                      <div className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/60">
                        Public profile
                      </div>
                      <div className="text-[13px] font-semibold mt-1.5 text-[#1020F5] flex items-center gap-1">
                        <span>View {user.handle}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  </div>

                  {/* Avatar upload row */}
                  <div className="flex flex-wrap items-center gap-4 py-2">
                    <div className="w-14 h-14 bg-[#02031A] text-white flex items-center justify-center font-display text-[26px] font-semibold overflow-hidden shrink-0 border border-[#02031A]/15">
                      {settingsAvatarUrl ? (
                        <img
                          src={settingsAvatarUrl}
                          alt={settingsName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (settingsName || user.name || 'F').slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) void handleAvatarFileSelected(file);
                        }}
                      />
                      <button
                        type="button"
                        disabled={settingsUploadingAvatar}
                        onClick={() => avatarInputRef.current?.click()}
                        className="h-9 px-3 bg-white border border-[#02031A]/20 text-[#02031A] text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#F4F6FB]"
                      >
                        {settingsUploadingAvatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ImagePlus className="w-3.5 h-3.5" />
                        )}
                        <span>{settingsAvatarUrl ? 'Change avatar' : 'Upload avatar'}</span>
                      </button>
                      {settingsAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setSettingsAvatarUrl(null)}
                          className="h-9 px-2.5 bg-transparent border border-[#02031A]/15 text-[#991B1B] text-[12px] cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-2.5 px-3.5 bg-white/55 border border-[#02031A]/10 text-[13px]">
                    <span className="text-[#02031A]/80">
                      <span className="font-semibold text-[#02031A]">{activePlanMeta.label} plan:</span>{' '}
                      {activePlanMeta.tagline}
                    </span>
                    <button
                      type="button"
                      onClick={openPricingPage}
                      className="mono text-[11px] uppercase tracking-[0.08em] font-semibold text-[#1020F5] hover:underline bg-transparent border-0 p-0 cursor-pointer shrink-0"
                    >
                      {activePlan === 'pro' ? 'View plans' : 'Upgrade'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <label className="flex flex-col gap-1.5">
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                        Display name
                      </span>
                      <input
                        type="text"
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        placeholder="Alex Mercer"
                        required
                        className="fiwi-field"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                        Username
                      </span>
                      <input
                        type="text"
                        value={settingsHandle}
                        onChange={(e) => setSettingsHandle(e.target.value)}
                        placeholder="alex"
                        className="fiwi-field"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                      Bio
                    </span>
                    <textarea
                      rows={3}
                      value={settingsBio}
                      onChange={(e) => setSettingsBio(e.target.value)}
                      placeholder="Design engineer curating web typography, AI experiments, and minimalist tooling."
                      className="fiwi-field resize-y"
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <label className="flex flex-col gap-1.5">
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Personal website
                      </span>
                      <input
                        type="url"
                        value={settingsWebsite}
                        onChange={(e) => setSettingsWebsite(e.target.value)}
                        placeholder="https://yoursite.com"
                        className="fiwi-field"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                        GitHub
                      </span>
                      <input
                        type="url"
                        value={settingsGithub}
                        onChange={(e) => setSettingsGithub(e.target.value)}
                        placeholder="https://github.com/username"
                        className="fiwi-field"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                        X / Twitter
                      </span>
                      <input
                        type="url"
                        value={settingsX}
                        onChange={(e) => setSettingsX(e.target.value)}
                        placeholder="https://x.com/username"
                        className="fiwi-field"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                        LinkedIn
                      </span>
                      <input
                        type="url"
                        value={settingsLinkedin}
                        onChange={(e) => setSettingsLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="fiwi-field"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                      Email address
                    </span>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="fiwi-field opacity-70 cursor-not-allowed"
                    />
                  </label>

                  <AnimatePresence initial={false}>
                    {settingsError && (
                      <motion.div
                        key="settings-error-banner"
                        variants={fiwiPanelRevealVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        role="alert"
                        className="border border-[#B91C1C]/35 bg-white/85 px-3.5 py-2.5 text-[13px] font-medium text-[#991B1B]"
                      >
                        {settingsError}
                      </motion.div>
                    )}

                    {settingsSavedNotice && (
                      <motion.div
                        key="settings-saved-banner"
                        variants={fiwiPanelRevealVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        role="status"
                        className="border border-[#02031A]/20 bg-white/85 px-3.5 py-2.5 text-[13px] font-medium text-[#02031A]"
                      >
                        {settingsSavedNotice}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="btn bg-[#02031A] text-white flex-1 hover:bg-[#1020F5] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      {settingsSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Save changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openLibraryTab('Hero')}
                      className="btn btn-square border border-[#02031A]/20 bg-white/65 text-[#02031A] hover:bg-white"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </form>

              {/* Password Update Box */}
              <form
                onSubmit={handlePasswordUpdateSubmit}
                className="glass fiwi-auth-card w-full mt-5 p-6 sm:p-7 text-left space-y-3"
              >
                <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                  Change password
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="fiwi-field"
                  />
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Confirm new password"
                    className="fiwi-field"
                  />
                </div>
                {passwordUpdateError && (
                  <p className="m-0 text-[12.5px] font-medium text-[#991B1B]">
                    {passwordUpdateError}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={updatingPassword || !newPasswordInput}
                    className="h-9 px-4 bg-[#02031A] text-white hover:bg-[#1020F5] disabled:opacity-50 text-[12px] mono uppercase tracking-[0.06em] border-0 cursor-pointer"
                  >
                    {updatingPassword ? 'Updating...' : 'Update password'}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 lab text-[14px] text-[#991B1B] hover:opacity-80 bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeView === 'blog' && <BlogHeader />}
          {activeView === 'docs' && <DocsHeader />}
          {activeView === 'about' && <AboutHeader />}
          {activeView === 'contact' && <ContactHeader />}
          {activeView === 'legal' && <LegalHeader />}

          {/* Sunlit Rolling Grassland Horizon */}
          <div
            aria-hidden="true"
            className={
              isAuthScreen
                ? 'absolute inset-x-0 bottom-0 z-0 pointer-events-none select-none h-[34vh] max-h-[340px] overflow-hidden'
                : 'relative z-0 pointer-events-none select-none -mx-4 sm:-mx-8 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] -mt-[96px] h-[400px] sm:h-[480px] lg:h-[560px] overflow-hidden'
            }
          >
            <picture className="block w-full h-full">
              <source srcSet={grasslandWebp} type="image/webp" />
              <img
                src={grasslandImg}
                alt=""
                width={1376}
                height={768}
                decoding="async"
                fetchPriority="high"
                className={
                  isAuthScreen
                    ? 'fiwi-grassland-img w-full h-full object-cover object-[50%_45%]'
                    : 'fiwi-grassland-img w-full h-full object-cover object-[50%_58%]'
                }
              />
            </picture>
            <div
              ref={grasslandMistRef}
              className={`fiwi-grassland-mist absolute inset-x-0 bottom-0 h-[55%] ${
                !isAuthScreen ? 'fiwi-grassland-mist--all' : ''
              }`}
            />
          </div>
        </div>

        {!isAuthScreen && (
          <div
            ref={lowerWhiteSectionRef}
            className="w-full bg-white dark:bg-black flex flex-col items-center transition-colors duration-200"
          >
            {isHeroView && (
              <>
                <section
                  aria-label="FiWi introduction"
                  className="w-full bg-white dark:bg-black px-4 sm:px-8 pt-14 sm:pt-20 pb-6 sm:pb-8 flex justify-center transition-colors duration-200"
                >
                  <div className="w-full max-w-[1200px] flex justify-end">
                    <div className="max-w-[980px] text-right">
                      <p className="m-0 text-[26px] sm:text-[36px] lg:text-[44px] font-semibold leading-[1.16] tracking-[-0.03em] text-[#02031A] dark:text-white">
                        Discovering great websites shouldn&apos;t be hard.
                        <br />
                        Now, it&apos;s all in one place.
                      </p>
                      <p className="mt-6 sm:mt-8 mb-0 text-[26px] sm:text-[36px] lg:text-[44px] font-semibold leading-[1.16] tracking-[-0.03em] text-[#02031A]/45 dark:text-white/45">
                        From traditional websites and SaaS products to AI-built projects,
                        <br />
                        collaboration opportunities, and authorized testing—explore, save into
                        <br />
                        personal collections, and connect with creators on FiWi.
                      </p>
                    </div>
                  </div>
                </section>
                <Suspense fallback={<div className="w-full min-h-[420px]" aria-hidden="true" />}>
                  <SearchShowcaseSection
                    submittedSites={librarySites}
                    onSelectSite={(site) => openWebsiteDetailPage(site)}
                    onSearchLibrary={(q) => openLibraryTab('All', null, q)}
                  />
                </Suspense>
                <Suspense fallback={<div className="w-full min-h-[520px]" aria-hidden="true" />}>
                  <CategoriesShowcaseSection
                    onSelectCategory={(category) => {
                      openLibraryTab('All', category);
                    }}
                  />
                </Suspense>
                <div
                  ref={pricingSkyBandRef}
                  className="fiwi-pricing-sky-bg w-full relative overflow-clip px-4 sm:px-8 pt-24 sm:pt-28 pb-0 text-white flex flex-col items-center"
                >
                  {/* Soft transition from upper white/black page into sky */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-[72px] sm:h-[96px] z-[1] bg-gradient-to-b from-white via-white/45 to-transparent dark:from-black dark:via-black/45 dark:to-transparent"
                  />

                  {/* Sky Backdrop — Radial Rays, Radar Rings, and Soft Clouds */}
                  <HeroBackdrop idPrefix="pricing" variant="pricing" />

                  <Suspense fallback={<div className="w-full min-h-[680px]" aria-hidden="true" />}>
                    <PricingSection
                      variant="inline"
                      hasSkyBackground
                      billingCycle={billingCycle}
                      onBillingCycleChange={setBillingCycle}
                      selectedPlan={selectedPlan}
                      currentPlan={user ? activePlan : undefined}
                      onSelectPlan={(planId) => setSelectedPlan(planId)}
                      onActivatePlan={handleActivatePlan}
                      onOpenStandalonePricing={openPricingPage}
                      isLoggedIn={Boolean(user)}
                      onContinueWithPlan={() => {
                        if (user) {
                          openSubmitView(null);
                        } else {
                          setStoredPendingAction({type: 'library'});
                          openAuthView('signup');
                        }
                      }}
                    />
                  </Suspense>

                  {/* Sunlit Rolling Grassland Horizon */}
                  <div
                    aria-hidden="true"
                    className="relative z-0 pointer-events-none select-none -mx-4 sm:-mx-8 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] -mt-[88px] h-[360px] sm:h-[440px] lg:h-[520px] overflow-hidden"
                  >
                    <picture className="block w-full h-full">
                      <source srcSet={grasslandWebp} type="image/webp" />
                      <img
                        src={grasslandImg}
                        alt=""
                        width={1376}
                        height={768}
                        loading="lazy"
                        decoding="async"
                        className="fiwi-grassland-img w-full h-full object-cover object-[50%_58%]"
                      />
                    </picture>
                    <div
                      ref={pricingGrasslandMistRef}
                      className="fiwi-grassland-mist fiwi-grassland-mist--all absolute inset-x-0 bottom-0 h-[55%]"
                    />
                  </div>
                </div>
                <Suspense fallback={<div className="w-full min-h-[380px]" aria-hidden="true" />}>
                  <FaqSection />
                </Suspense>
              </>
            )}

            {activeView === 'blog' && (
              <Suspense fallback={<div className="w-full min-h-[520px]" aria-hidden="true" />}>
                <BlogPage
                  onExploreLibrary={() => openLibraryTab('All')}
                  onOpenDocs={openDocsPage}
                />
              </Suspense>
            )}

            {activeView === 'docs' && (
              <Suspense fallback={<div className="w-full min-h-[520px]" aria-hidden="true" />}>
                <DocsPage
                  onNavigateLibrary={(tab = 'All') => openLibraryTab(tab)}
                  onOpenSubmit={() => openSubmitView(null)}
                  onOpenPricing={openPricingPage}
                  onOpenSaved={openSavedPage}
                />
              </Suspense>
            )}

            {activeView === 'about' && (
              <Suspense fallback={<div className="w-full min-h-[480px]" aria-hidden="true" />}>
                <AboutPage
                  onExploreLibrary={() => openLibraryTab('All')}
                  onOpenBlog={openBlogPage}
                  onOpenDocs={openDocsPage}
                />
              </Suspense>
            )}

            {activeView === 'contact' && (
              <Suspense fallback={<div className="w-full min-h-[480px]" aria-hidden="true" />}>
                <ContactPage />
              </Suspense>
            )}

            {activeView === 'legal' && (
              <Suspense fallback={<div className="w-full min-h-[480px]" aria-hidden="true" />}>
                <LegalPage />
              </Suspense>
            )}

            {activeView === 'site' && activeSiteDetail && (
              <Suspense
                fallback={
                  <div className="w-full min-h-[600px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                }
              >
                <WebsiteDetailPage
                  site={activeSiteDetail}
                  allSites={librarySites}
                  savedRecord={findSavedForSite(activeSiteDetail)}
                  isLoggedIn={Boolean(user)}
                  user={user}
                  collections={collections}
                  savedCount={savedSites.length}
                  saveLimit={activeSaveLimit}
                  planLabel={activePlanMeta.label}
                  onBack={() => {
                    openLibraryTab(activePage === 'Hero' ? 'All' : (activePage as FilterTab));
                  }}
                  onOpenSite={(nextSite) => openWebsiteDetailPage(nextSite)}
                  onOpenProfile={openPublicProfile}
                  onToggleLike={handleToggleLikeSite}
                  onToggleCollection={handleToggleSaveSite}
                  onUpdateSavedCollections={handleUpdateSavedCollections}
                  onCreateCollectionAndAssign={handleCreateCollectionAndAssign}
                  onRequireAuth={() => {
                    setStoredPendingAction({
                      type: 'save_site',
                      site: activeSiteDetail,
                      returnView: 'site',
                    });
                    setAuthInfoNotice(
                      `Sign in or create an account to save "${activeSiteDetail.title}" to your library.`,
                    );
                    openAuthView('signup');
                  }}
                  onOpenPricing={openPricingPage}
                />
              </Suspense>
            )}

            <Footer
              currentRoute={currentFooterRoute}
              onNavigateHome={() => openLibraryTab('Hero')}
              onNavigateLibrary={(tab) => openLibraryTab(tab)}
              onNavigatePricing={openPricingPage}
              onNavigateBlog={openBlogPage}
              onNavigateDocs={openDocsPage}
              onNavigateSubmit={() => openSubmitView(null)}
              onNavigateSaved={openSavedPage}
              onNavigateAbout={openAboutPage}
              onNavigateContact={openContactPage}
              onNavigateLegal={openLegalPage}
            />
          </div>
        )}

        <AnimatePresence>
          {selectedDetailTarget && (() => {
            const savedRec = selectedDetailTarget.savedRecord;
            const targetSite =
              selectedDetailTarget.site ??
              (savedRec
                ? (savedRec.submittedSiteId
                    ? submittedSiteLookup.byId.get(savedRec.submittedSiteId)
                    : undefined) ??
                  submittedSiteLookup.byId.get(savedRec.id) ??
                  submittedSiteLookup.byUrl.get(savedRec.url.toLowerCase()) ??
                  null
                : null);

            const activeSavedRecord = targetSite
              ? findSavedForSite(targetSite)
              : savedRec
                ? savedLookup.byId.get(savedRec.id) ?? null
                : null;

            const displaySite: SubmittedSite | null =
              targetSite ??
              (activeSavedRecord
                ? null
                : savedRec
                  ? {
                      id: savedRec.submittedSiteId ?? savedRec.id,
                      slug: savedRec.submittedSiteId ?? savedRec.id,
                      title: savedRec.title,
                      url: savedRec.url,
                      category: savedRec.category,
                      subCategory: savedRec.subCategory,
                      customSubCategory: savedRec.customSubCategory,
                      description: savedRec.description,
                      tags: [],
                      likesCount: 0,
                      savesCount: 0,
                      viewsCount: 0,
                      authorHandle: '',
                      authorUsername: '',
                      authorId: '',
                      createdAt: savedRec.savedAt,
                    }
                  : null);

            const modalKey = displaySite?.id ?? activeSavedRecord?.id ?? 'site-detail-modal';

            return (
              <Suspense key={modalKey} fallback={null}>
                <SiteDetailModal
                  site={displaySite}
                  savedRecord={activeSavedRecord}
                  isLoggedIn={Boolean(user)}
                  collections={collections}
                  savedCount={savedSites.length}
                  saveLimit={activeSaveLimit}
                  planLabel={activePlanMeta.label}
                  onClose={() => setSelectedDetailTarget(null)}
                  onSelectSite={(nextSite) =>
                    setSelectedDetailTarget({
                      site: nextSite,
                      savedRecord: findSavedForSite(nextSite),
                    })
                  }
                  onOpenProfile={openPublicProfile}
                  onToggleLike={handleToggleLikeSite}
                  onToggleCollection={handleToggleSaveSite}
                  onUpdateSavedCollections={handleUpdateSavedCollections}
                  onCreateCollectionAndAssign={handleCreateCollectionAndAssign}
                  onRequireAuth={() => {
                    if (displaySite) {
                      setStoredPendingAction({
                        type: 'save_site',
                        site: displaySite,
                        returnView: activeView,
                      });
                      setAuthInfoNotice(`Sign in or create an account to save "${displaySite.title}" to your library.`);
                    } else {
                      setStoredPendingAction({
                        type: 'saved',
                        returnView: activeView,
                      });
                    }
                    openAuthView('signup');
                  }}
                  onOpenPricing={() => {
                    setSelectedDetailTarget(null);
                    openPricingPage();
                  }}
                />
              </Suspense>
            );
          })()}
        </AnimatePresence>

        {isVerifyingCallback && (
          <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#02031a]/90 backdrop-blur-md text-white p-4">
            <div className="flex flex-col items-center gap-4 p-8 max-w-sm w-full rounded-2xl bg-white/[0.04] border border-white/10 shadow-2xl text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#1020F5]" />
              <div>
                <h3 className="font-display text-xl font-medium text-white">Authenticating</h3>
                <p className="mt-1 text-sm text-white/60">Verifying your credentials and establishing your session...</p>
              </div>
            </div>
          </div>
        )}

        <ToastViewport />
        <ConfirmDialog />
      </div>
    </MotionConfig>
  );
}

export type SiteCategory = 'Normal' | 'Vibecoded' | 'Connect' | 'Test';

export type ShowcaseCategory =
  | 'Business & SaaS'
  | 'Design & Creative'
  | 'E-commerce & Lifestyle'
  | 'Technology'
  | 'Media & Content'
  | 'Experimental & Unique';

export const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  'Business & SaaS',
  'Design & Creative',
  'E-commerce & Lifestyle',
  'Technology',
  'Media & Content',
  'Experimental & Unique',
];

export type PlanTierId = 'free' | 'plus' | 'pro';

export const PLAN_SAVE_LIMITS: Record<PlanTierId, number> = {
  free: 15,
  plus: 100,
  pro: 500,
};

export const PLAN_SUBMISSION_LIMITS: Record<PlanTierId, number | null> = {
  free: 5,
  plus: 25,
  pro: null,
};

export const PLAN_COLLECTION_LIMITS: Record<PlanTierId, number | null> = {
  free: 3,
  plus: null,
  pro: null,
};

export const PLAN_SAVE_DESCRIPTIONS: Record<
  PlanTierId,
  {label: string; limit: number; tagline: string}
> = {
  free: {
    label: 'Free',
    limit: 15,
    tagline: '15 websites — enough to experience FiWi.',
  },
  plus: {
    label: 'Plus',
    limit: 100,
    tagline: '100 websites — suitable for regular users.',
  },
  pro: {
    label: 'Pro',
    limit: 500,
    tagline: '500 websites — for heavy researchers and creators.',
  },
};

export interface SocialLinks {
  website?: string;
  github?: string;
  x?: string;
  linkedin?: string;
}

export interface FiwiUser {
  id: string;
  name: string;
  username: string;
  handle: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string;
  socialLinks?: SocialLinks;
  plan: PlanTierId;
  isAdmin: boolean;
  adminRole?: 'moderator' | 'admin' | 'super_admin' | null;
  emailVerified: boolean;
  authProvider?: string;
  isSuspended?: boolean;
  suspendedReason?: string;
  createdAt: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  handle: string;
  displayName: string;
  avatarUrl?: string | null;
  bio: string;
  socialLinks: SocialLinks;
  plan: PlanTierId;
  likesReceived: number;
  createdAt: string;
}

export interface SubmittedMediaItem {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  kind: 'image' | 'video';
  previewUrl?: string;
  publicUrl?: string;
  storagePath?: string;
}

export type CollaborationType =
  | 'seeking_collaborators'
  | 'offering_collaboration'
  | 'partnership';

export interface ConnectListingInfo {
  collaborationType: CollaborationType;
  contactName: string;
  contactEmail: string;
  contactLink?: string;
  reasonForContact: string;
  lookingFor: string;
  requiredRoles: string[];
  skills: string[];
  isOpen: boolean;
}

export interface TestListingInfo {
  authorizedTargetUrl: string;
  testingScope: string;
  lookingFor: string;
  testingRules: string;
  budgetUsd: number;
  deadline?: string | null;
  disclosurePolicy: string;
  contactName: string;
  contactEmail: string;
  contactLink?: string;
  ownerAuthorized: boolean;
  hasAuthorizationProof: boolean;
  isOpen: boolean;
}

export interface VibecodedInfo {
  originalPrompt: string;
  developmentSteps: string;
  techStack: string[];
  customTechStack: string[];
  aiTools: string[];
  customAiTools: string[];
  aiModel?: string;
  extraInfo?: string;
}

export interface SubmittedSite {
  id: string;
  slug: string;
  title: string;
  url: string;
  category: SiteCategory;
  subCategory?: ShowcaseCategory;
  customSubCategory?: string;
  description: string;
  heroTitle?: string;
  tags: string[];
  thumbnailUrl?: string | null;
  screenshotUrl?: string | null;
  isFeatured?: boolean;
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  viewerHasLiked?: boolean;
  contact?: {
    name: string;
    email: string;
    link?: string;
    primaryTopic: string;
    lookingFor: string;
    testBudget?: string;
    testAuthorized?: boolean;
    collaborationType?: CollaborationType;
    requiredRoles?: string[];
    skills?: string[];
    authorizedTargetUrl?: string;
    testingRules?: string;
    deadline?: string;
    disclosurePolicy?: string;
    hasAuthorizationProof?: boolean;
    isOpen?: boolean;
  };
  vibecoded?: VibecodedInfo;
  media?: {
    hero: SubmittedMediaItem | null;
    gallery: SubmittedMediaItem[];
  };
  authorHandle: string;
  authorUsername: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string | null;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
  status?: string;
}

export type SubmissionStatus =
  | 'draft'
  | 'pending'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected';

export interface WebsiteSubmissionRecord {
  id: string;
  userId: string;
  submitterEmail?: string | null;
  publishedWebsiteId?: string | null;
  title: string;
  heroTitle?: string | null;
  url: string;
  description: string;
  category: SiteCategory;
  subCategory?: string | null;
  customSubCategory?: string | null;
  tags: string[];
  thumbnailUrl?: string | null;
  galleryUrls: string[];
  media?: {
    hero: SubmittedMediaItem | null;
    gallery: SubmittedMediaItem[];
  };
  vibecoded?: VibecodedInfo | null;
  connect?: ConnectListingInfo | null;
  test?: (TestListingInfo & {authorizationProofPath?: string | null}) | null;
  status: SubmissionStatus;
  reviewerNotes?: string | null;
  changesRequestedNotes?: string | null;
  reviewAttempts?: number;
  reviewedAt?: string | null;
  authorHandle?: string;
  authorUsername?: string;
  authorDisplayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalCollection {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImageUrl?: string | null;
  isPublic: boolean;
  isDefault?: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedSite {
  id: string;
  submittedSiteId?: string;
  title: string;
  url: string;
  category: SiteCategory;
  subCategory?: ShowcaseCategory;
  customSubCategory?: string;
  description: string;
  collectionIds: string[];
  positions?: Record<string, number>;
  savedAt: string;
}

export interface CollectionDetailPayload {
  collection: PersonalCollection;
  owner: PublicProfile;
  isOwner: boolean;
  items: Array<{
    bookmark: SavedSite;
    site: SubmittedSite | null;
    position: number;
  }>;
}

export interface CategoryRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  group?: string;
}

export interface TagRecord {
  id: string;
  slug: string;
  name: string;
}

export interface WebsiteReportRecord {
  id: string;
  websiteId: string | null;
  websiteTitle?: string;
  websiteSlug?: string;
  reporterId: string | null;
  reporterHandle?: string;
  reason: string;
  details: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  resolutionNotes?: string | null;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  targetTitle?: string | null;
  details?: string | null;
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  userId?: string | null;
  recipientUserId?: string | null;
  targetEmail?: string | null;
  type:
    | 'announcement'
    | 'website_approved'
    | 'website_rejected'
    | 'changes_requested'
    | 'website_removed'
    | 'account_suspended'
    | 'info'
    | 'warning'
    | 'alert'
    | 'success';
  title: string;
  message: string;
  link?: string | null;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface UserManagementRecord {
  id: string;
  username: string;
  displayName: string;
  handle: string;
  email: string;
  avatarUrl: string | null;
  plan: PlanTierId;
  isAdmin: boolean;
  emailVerified: boolean;
  isSuspended: boolean;
  suspensionReason?: string | null;
  submissionsCount: number;
  approvedCount: number;
  collectionsCount: number;
  savedCount: number;
  createdAt: string;
}

export interface AdminAnalyticsStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  underReviewSubmissions: number;
  changesRequestedSubmissions: number;
  totalPublishedWebsites: number;
  normalWebsitesCount: number;
  vibecodedWebsitesCount: number;
  connectListingsCount: number;
  testListingsCount: number;
  featuredWebsitesCount: number;
  totalCollections: number;
  publicCollections: number;
  privateCollections: number;
  totalBookmarks: number;
  totalLikes: number;
  totalReports: number;
  openReports: number;
  resolvedReports: number;
  activeUsersEstimate: number;
  approvalRatePercentage: number;
  userGrowth: Array<{date: string; users: number; submissions: number}>;
  categoryDistribution: Array<{category: string; count: number}>;
  topSavedSites: Array<{id: string; title: string; count: number; category: string}>;
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  submissionsOpen: boolean;
  autoCheckSites: boolean;
  announcementBanner?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  authorizedAdminEmail: string;
}

export interface AdminOverviewPayload {
  stats: {
    usersCount: number;
    approvedWebsitesCount: number;
    pendingSubmissionsCount: number;
    openReportsCount: number;
  };
  submissions: WebsiteSubmissionRecord[];
  websites: SubmittedSite[];
  reports: WebsiteReportRecord[];
  categories: CategoryRecord[];
  tags: TagRecord[];
  users: PublicProfile[];
  analytics?: AdminAnalyticsStats;
  auditLogs?: AdminAuditLog[];
  notifications?: AdminNotification[];
  settings?: PlatformSettings;
}

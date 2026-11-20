import type {
  AdminAuditLog,
  AdminNotification,
  AdminOverviewPayload,
  CategoryRecord,
  CollectionDetailPayload,
  CollaborationType,
  FiwiUser,
  PersonalCollection,
  PlanTierId,
  PlatformSettings,
  PublicProfile,
  SavedSite,
  SiteCategory,
  SocialLinks,
  SubmittedSite,
  TagRecord,
  UserManagementRecord,
  WebsiteSubmissionRecord,
} from '../types/fiwi';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const mockSites = [
  {id: 'demo-1', slug: 'field-notes', title: 'Field Notes', url: 'https://fieldnotes.example', category: 'Normal', subCategory: 'Design & Creative', description: 'A thoughtful digital journal for collecting ideas and inspiration.', heroTitle: 'Make room for good ideas.', tags: ['design', 'journal'], thumbnailUrl: null, likesCount: 24, savesCount: 12, viewsCount: 180, authorHandle: '@studio', authorUsername: 'studio', authorDisplayName: 'Studio North', authorId: 'demo-author', createdAt: '2026-05-10', status: 'approved'},
  {id: 'demo-2', slug: 'orbit-ai', title: 'Orbit AI', url: 'https://orbit.example', category: 'Vibecoded', subCategory: 'Technology', description: 'A calm workspace for exploring ideas with AI.', heroTitle: 'Find your next direction.', tags: ['AI', 'productivity'], thumbnailUrl: null, likesCount: 18, savesCount: 9, viewsCount: 126, authorHandle: '@maker', authorUsername: 'maker', authorDisplayName: 'Alex Morgan', authorId: 'demo-maker', createdAt: '2026-05-08', status: 'approved'},
  {id: 'demo-3', slug: 'good-together', title: 'Good Together', url: 'https://goodtogether.example', category: 'Connect', subCategory: 'Business & SaaS', description: 'A small directory helping independent makers find collaborators.', heroTitle: 'Build better, together.', tags: ['community', 'makers'], thumbnailUrl: null, likesCount: 31, savesCount: 14, viewsCount: 210, authorHandle: '@commons', authorUsername: 'commons', authorDisplayName: 'Common Studio', authorId: 'demo-commons', createdAt: '2026-05-04', status: 'approved'}
] as const;
function mockFor<T>(path: string): T {
  if (path.match(/\/websites\/[^?]+/)) { const slug = path.split('/').pop()?.split('?')[0]; const website = mockSites.find(site => site.id === slug || site.slug === slug) || mockSites[0]; return {website, related: mockSites.filter(site => site.id !== website.id)} as T; }
  if (path.includes('/websites')) { const category = new URLSearchParams(path.split('?')[1] || '').get('category'); const items = category ? mockSites.filter(site => site.category === category) : mockSites; return {items, total: items.length, limit: 16, offset: 0} as T; }
  if (path.includes('/categories')) return {categories: [], tags: []} as T;
  if (path.includes('/bookmarks')) return {bookmarks: []} as T;
  if (path.includes('/collections')) return {collections: [], bookmarks: [], website: null, related: []} as T;
  if (path.includes('/submissions')) return {submissions: [], submission: {id: 'demo', status: 'draft'}} as T;
  if (path.includes('/profiles/check-username')) return {valid: true, available: true, normalized: 'user'} as T;
  if (path.includes('/profiles')) return {user: {id: 'demo-user', name: 'User', username: 'user', handle: '@user', email: 'user@example.com', plan: 'free', isAdmin: true, emailVerified: true, createdAt: '2026-01-01'}, profile: {id: 'demo-user', username: 'user', handle: '@user', displayName: 'User', bio: '', socialLinks: {}, plan: 'free', likesReceived: 0, createdAt: '2026-01-01'}, websites: [], collections: [], isOwner: true} as T;
  if (path.includes('/admin/overview')) return {overview: {}, stats: {}, submissions: [], websites: mockSites, users: [], reports: [], notifications: [], activity: [], settings: {}} as T;
  if (path.includes('/health')) return {ok: true, supabaseConfigured: true, hasServiceRole: false, schemaReady: true, timestamp: new Date().toISOString()} as T;
  return {ok: true, liked: false, likesCount: 0, status: 'draft', count: 0, action: 'done', signedUrl: '', expiresInSeconds: 0, url: '', reachable: true} as T;
}

async function requestJson<T>(path: string, _options: {method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; body?: unknown; auth?: boolean} = {}): Promise<T> {
  return Promise.resolve(mockFor<T>(path));
}

export type UploadPurpose =
  | 'website_hero'
  | 'website_gallery'
  | 'avatar'
  | 'collection_cover'
  | 'test_proof';

export async function uploadMediaFile(params: {file: File; purpose: UploadPurpose}): Promise<{bucket: 'public-assets' | 'private-assets'; path: string; publicUrl?: string; mimeType: string; fileSizeBytes: number}> {
  const path = `mock/${params.purpose}/${params.file.name}`;
  return {bucket: params.purpose === 'test_proof' ? 'private-assets' : 'public-assets', path, publicUrl: URL.createObjectURL(params.file), mimeType: params.file.type || 'application/octet-stream', fileSizeBytes: params.file.size};
}

export const fiwiApi = {
  getHealth: () =>
    requestJson<{
      ok: boolean;
      supabaseConfigured: boolean;
      hasServiceRole: boolean;
      schemaReady?: boolean;
      timestamp: string;
    }>('/health'),

  listCategories: () =>
    requestJson<{categories: CategoryRecord[]; tags: TagRecord[]}>('/categories'),

  listWebsites: (params: {
    category?: 'All' | SiteCategory;
    subCategory?: string | null;
    q?: string;
    tag?: string;
    aiTool?: string;
    tech?: string;
    sort?: 'newest' | 'popular' | 'title';
    limit?: number;
    offset?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.category && params.category !== 'All') sp.set('category', params.category);
    if (params.subCategory) sp.set('subCategory', params.subCategory);
    if (params.q?.trim()) sp.set('q', params.q.trim());
    if (params.tag?.trim()) sp.set('tag', params.tag.trim());
    if (params.aiTool?.trim()) sp.set('aiTool', params.aiTool.trim());
    if (params.tech?.trim()) sp.set('tech', params.tech.trim());
    if (params.sort) sp.set('sort', params.sort);
    if (params.limit !== undefined) sp.set('limit', String(params.limit));
    if (params.offset !== undefined) sp.set('offset', String(params.offset));
    const qs = sp.toString();
    return requestJson<{items: SubmittedSite[]; total: number; limit: number; offset: number}>(
      `/websites${qs ? `?${qs}` : ''}`,
    );
  },

  getWebsiteDetail: (idOrSlug: string) =>
    requestJson<{website: SubmittedSite; related: SubmittedSite[]}>(
      `/websites/${encodeURIComponent(idOrSlug)}`,
    ),

  toggleWebsiteLike: (id: string) =>
    requestJson<{liked: boolean; likesCount: number}>(`/websites/${encodeURIComponent(id)}/like`, {
      method: 'POST',
      auth: true,
    }),

  reportWebsite: (id: string, reason: string, details: string) =>
    requestJson<{ok: boolean; message: string}>(`/websites/${encodeURIComponent(id)}/report`, {
      method: 'POST',
      auth: true,
      body: {reason, details},
    }),

  deleteWebsite: (id: string) =>
    requestJson<{ok: boolean}>(`/websites/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),

  listMySubmissions: () =>
    requestJson<{submissions: WebsiteSubmissionRecord[]}>('/submissions/mine', {
      auth: true,
    }),

  createSubmission: (payload: SubmissionPayload) =>
    requestJson<{submission: WebsiteSubmissionRecord}>('/submissions', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  updateSubmission: (id: string, payload: SubmissionPayload) =>
    requestJson<{submission: WebsiteSubmissionRecord}>(`/submissions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  deleteSubmission: (id: string) =>
    requestJson<{ok: boolean}>(`/submissions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),

  listCollections: () =>
    requestJson<{collections: PersonalCollection[]}>('/collections', {auth: true}),

  createCollection: (payload: {
    name: string;
    description?: string;
    isPublic?: boolean;
    coverImageUrl?: string | null;
  }) =>
    requestJson<{created: PersonalCollection; collections: PersonalCollection[]}>('/collections', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  updateCollection: (
    id: string,
    payload: {
      name?: string;
      description?: string;
      isPublic?: boolean;
      coverImageUrl?: string | null;
    },
  ) =>
    requestJson<{collections: PersonalCollection[]}>(`/collections/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  deleteCollection: (id: string) =>
    requestJson<{collections: PersonalCollection[]; bookmarks: SavedSite[]}>(
      `/collections/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        auth: true,
      },
    ),

  reorderCollection: (id: string, bookmarkIds: string[]) =>
    requestJson<{ok: boolean}>(`/collections/${encodeURIComponent(id)}/reorder`, {
      method: 'PUT',
      auth: true,
      body: {bookmarkIds},
    }),

  getCollectionView: (slugOrId: string) =>
    requestJson<CollectionDetailPayload>(`/collections/view/${encodeURIComponent(slugOrId)}`),

  listBookmarks: () =>
    requestJson<{bookmarks: SavedSite[]}>('/bookmarks', {auth: true}),

  toggleBookmark: (websiteId: string, collectionId?: string) =>
    requestJson<{bookmarks: SavedSite[]}>('/bookmarks/toggle', {
      method: 'POST',
      auth: true,
      body: {websiteId, collectionId},
    }),

  createCustomBookmark: (payload: {
    title: string;
    url: string;
    subCategory?: string;
    description?: string;
    collectionIds?: string[];
  }) =>
    requestJson<{bookmarks: SavedSite[]}>('/bookmarks/custom', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  updateBookmarkCollections: (bookmarkId: string, collectionIds: string[]) =>
    requestJson<{bookmarks: SavedSite[]}>(`/bookmarks/${encodeURIComponent(bookmarkId)}`, {
      method: 'PATCH',
      auth: true,
      body: {collectionIds},
    }),

  deleteBookmark: (bookmarkId: string) =>
    requestJson<{bookmarks: SavedSite[]}>(`/bookmarks/${encodeURIComponent(bookmarkId)}`, {
      method: 'DELETE',
      auth: true,
    }),

  getMyProfile: () => requestJson<{user: FiwiUser}>('/profiles/me', {auth: true}),

  updateMyProfile: (payload: {
    name: string;
    username: string;
    bio?: string;
    avatarUrl?: string | null;
    socialLinks?: SocialLinks;
  }) =>
    requestJson<{user: FiwiUser}>('/profiles/me', {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  updateMyPlan: (plan: PlanTierId) =>
    requestJson<{user: FiwiUser}>('/profiles/me/plan', {
      method: 'PATCH',
      auth: true,
      body: {plan},
    }),

  checkUsername: (username: string) =>
    requestJson<{valid: boolean; available: boolean; normalized?: string; reason?: string}>(
      `/profiles/check-username/${encodeURIComponent(username)}`,
    ),

  getPublicProfile: (username: string) =>
    requestJson<{
      profile: PublicProfile;
      isOwner: boolean;
      websites: SubmittedSite[];
      collections: PersonalCollection[];
    }>(`/profiles/${encodeURIComponent(username)}`),

  getAdminOverview: () => requestJson<AdminOverviewPayload>('/admin/overview', {auth: true}),

  moderateSubmission: (
    id: string,
    payload: {
      action: 'approve' | 'reject' | 'under_review' | 'changes_requested';
      notes?: string;
      isFeatured?: boolean;
    },
  ) =>
    requestJson<{ok: boolean; status: string; websiteId?: string}>(
      `/admin/submissions/${encodeURIComponent(id)}/moderate`,
      {method: 'POST', auth: true, body: payload},
    ),

  adminBulkModerateSubmissions: (
    submissionIds: string[],
    action: 'approve' | 'reject' | 'delete',
    notes?: string,
  ) =>
    requestJson<{ok: boolean; count: number; action: string}>(
      '/admin/submissions/bulk-moderate',
      {
        method: 'POST',
        auth: true,
        body: {submissionIds, action, notes},
      },
    ),

  adminEditSubmission: (
    id: string,
    payload: {
      title?: string;
      url?: string;
      description?: string;
      category?: SiteCategory;
      subCategory?: string;
      tags?: string[];
      heroTitle?: string;
    },
  ) =>
    requestJson<{ok: boolean; submission: WebsiteSubmissionRecord}>(
      `/admin/submissions/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        auth: true,
        body: payload,
      },
    ),

  adminDeleteSubmission: (id: string) =>
    requestJson<{ok: boolean}>(`/admin/submissions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),

  getSubmissionProofUrl: (id: string) =>
    requestJson<{signedUrl: string; expiresInSeconds: number}>(
      `/admin/submissions/${encodeURIComponent(id)}/proof-url`,
      {auth: true},
    ),

  adminUpdateWebsite: (
    id: string,
    payload: {
      title?: string;
      url?: string;
      description?: string;
      category?: SiteCategory;
      subCategory?: string;
      tags?: string[];
      isFeatured?: boolean;
      status?: 'approved' | 'archived' | 'removed';
    },
  ) =>
    requestJson<{ok: boolean; website?: SubmittedSite}>(
      `/admin/websites/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        auth: true,
        body: payload,
      },
    ),

  adminDeleteWebsite: (id: string) =>
    requestJson<{ok: boolean}>(`/admin/websites/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),

  adminGetUsers: () =>
    requestJson<{users: UserManagementRecord[]}>('/admin/users', {
      auth: true,
    }),

  adminSuspendUser: (id: string, reason?: string) =>
    requestJson<{ok: boolean}>(`/admin/users/${encodeURIComponent(id)}/suspend`, {
      method: 'POST',
      auth: true,
      body: {reason},
    }),

  adminUnsuspendUser: (id: string) =>
    requestJson<{ok: boolean}>(`/admin/users/${encodeURIComponent(id)}/unsuspend`, {
      method: 'POST',
      auth: true,
    }),

  adminDeleteUser: (id: string) =>
    requestJson<{ok: boolean}>(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),

  adminCreateCategory: (payload: {name: string; group?: string; description?: string; sortOrder?: number}) =>
    requestJson<{category: CategoryRecord}>('/admin/categories', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  adminDeleteCategory: (id: string) =>
    requestJson<{ok: boolean}>(`/admin/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),

  adminCreateTag: (name: string) =>
    requestJson<{tag: TagRecord}>('/admin/tags', {
      method: 'POST',
      auth: true,
      body: {name},
    }),

  adminDeleteTag: (id: string) =>
    requestJson<{ok: boolean}>(`/admin/tags/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),

  adminUpdateReport: (
    id: string,
    payload: {status: 'open' | 'reviewing' | 'resolved' | 'dismissed'; resolutionNotes?: string},
  ) =>
    requestJson<{ok: boolean}>(`/admin/reports/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  adminGetCollections: () =>
    requestJson<{
      collections: Array<
        PersonalCollection & {
          ownerId?: string;
          ownerUsername?: string;
          ownerEmail?: string;
        }
      >;
    }>('/admin/collections', {
      auth: true,
    }),

  adminDeleteCollection: (id: string) =>
    requestJson<{ok: boolean}>(`/admin/collections/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),

  adminGetNotifications: () =>
    requestJson<{notifications: AdminNotification[]}>('/admin/notifications', {
      auth: true,
    }),

  adminSendNotification: (payload: {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'alert' | 'success';
    recipientUserId?: string;
    link?: string;
  }) =>
    requestJson<{notification: AdminNotification}>('/admin/notifications', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  adminDeleteNotification: (id: string) =>
    requestJson<{ok: boolean}>(`/admin/notifications/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),

  adminGetLogs: () =>
    requestJson<{logs: AdminAuditLog[]}>('/admin/logs', {
      auth: true,
    }),

  adminGetSettings: () =>
    requestJson<{settings: PlatformSettings}>('/admin/settings', {
      auth: true,
    }),

  adminUpdateSettings: (payload: Partial<PlatformSettings>) =>
    requestJson<{settings: PlatformSettings}>('/admin/settings', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  adminCheckSiteStatus: (url: string) =>
    requestJson<{
      url: string;
      reachable: boolean;
      statusCode?: number;
      responseTimeMs?: number;
      error?: string;
    }>('/admin/check-site-status', {
      method: 'POST',
      auth: true,
      body: {url},
    }),
};

export interface SubmissionPayload {
  status: 'draft' | 'pending';
  category: SiteCategory;
  subCategory: string;
  customSubCategory?: string;
  title: string;
  heroTitle?: string;
  url: string;
  description: string;
  tags: string[];
  thumbnailUrl?: string | null;
  galleryUrls?: string[];
  mediaMeta?: Record<string, unknown>;
  vibecoded?: {
    originalPrompt: string;
    developmentSteps: string;
    aiTools: string[];
    customAiTools: string[];
    techStack: string[];
    customTechStack: string[];
    aiModel?: string;
    extraInfo?: string;
  };
  connect?: {
    collaborationType: CollaborationType;
    contactName: string;
    contactEmail: string;
    contactLink?: string;
    reasonForContact: string;
    lookingFor: string;
    requiredRoles: string[];
    skills: string[];
    isOpen?: boolean;
  };
  test?: {
    authorizedTargetUrl: string;
    contactName: string;
    contactEmail: string;
    contactLink?: string;
    testingScope: string;
    lookingFor: string;
    testingRules: string;
    disclosurePolicy: string;
    budgetUsd: number;
    deadline?: string | null;
    ownerAuthorized: boolean;
    authorizationProofPath?: string | null;
    isOpen?: boolean;
  };
}

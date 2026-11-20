import {
  siAstro,
  siDocker,
  siDrizzle,
  siFirebase,
  siFramer,
  siJavascript,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siSupabase,
  siSvelte,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVite,
  siVuedotjs,
  type SimpleIcon,
} from 'simple-icons';
import type {CollaborationType, WebsiteSubmissionRecord} from '../../types/fiwi';

export type SubmitCategoryId = 'Normal' | 'Vibecoded' | 'Test' | 'Connect';
export type SubmitStep = 1 | 2 | 3 | 'review' | 'success';
export type AiBrandLogoId =
  | 'chatgpt'
  | 'claude'
  | 'cursor'
  | 'windsurf'
  | 'lovable'
  | 'bolt'
  | 'v0'
  | 'replit'
  | 'google-ai-studio'
  | 'antigravity'
  | 'github-copilot'
  | 'gemini';

export interface CategoryOption {
  id: SubmitCategoryId;
  name: string;
  description: string;
  tagline: string;
}

export interface BrandToolOption {
  id: string;
  name: string;
  icon?: SimpleIcon;
  brandLogoId?: AiBrandLogoId;
  monogram?: string;
  description: string;
}

export interface MediaAsset {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  kind: 'image' | 'video';
  previewUrl: string;
  storagePath?: string;
  publicUrl?: string;
}

export interface ProofDocumentAsset {
  fileName: string;
  path: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface SubmissionDraft {
  submissionId?: string;
  category: SubmitCategoryId | null;
  subCategory: string;
  customSubCategory: string;
  tags: string[];
  common: {
    name: string;
    url: string;
    description: string;
    heroTitle: string;
  };
  contact: {
    name: string;
    email: string;
    link: string;
    primaryTopic: string;
    lookingFor: string;
    testBudget: string;
    testAuthorized: boolean;
    collaborationType: CollaborationType;
    requiredRoles: string[];
    skills: string[];
    authorizedTargetUrl: string;
    testingRules: string;
    deadline: string;
    disclosurePolicy: string;
    authorizationProof: ProofDocumentAsset | null;
  };
  vibecoded: {
    originalPrompt: string;
    developmentSteps: string;
    techStack: string[];
    customTechStack: string[];
    aiTools: string[];
    customAiTools: string[];
    aiModel: string;
    extraInfo: string;
  };
  media: {
    hero: MediaAsset | null;
    gallery: MediaAsset[];
  };
}

export const CATEGORY_CARDS: CategoryOption[] = [
  {
    id: 'Normal',
    name: 'Normal',
    tagline: 'Showcase & Discovery',
    description:
      'For regular websites, SaaS products, portfolios, landing pages, and other digital experiences.',
  },
  {
    id: 'Vibecoded',
    name: 'Vibecoded',
    tagline: 'AI-Built Experiences',
    description:
      'For websites and applications created using AI development tools.',
  },
  {
    id: 'Test',
    name: 'Test',
    tagline: 'Authorized Testing',
    description:
      'For websites looking for people to participate in authorized testing opportunities.',
  },
  {
    id: 'Connect',
    name: 'Connect',
    tagline: 'Teams & Collaborators',
    description:
      'For websites, projects, or products looking for collaborations, partnerships, and contributors.',
  },
];

export const SUBCATEGORY_OPTIONS: readonly string[] = [
  'Business & SaaS',
  'Design & Creative',
  'E-commerce & Lifestyle',
  'Technology',
  'Media & Content',
  'Experimental & Unique',
];

export const SUBCATEGORIES_BY_CATEGORY: Record<SubmitCategoryId, readonly string[]> = {
  Normal: SUBCATEGORY_OPTIONS,
  Vibecoded: SUBCATEGORY_OPTIONS,
  Test: SUBCATEGORY_OPTIONS,
  Connect: SUBCATEGORY_OPTIONS,
};

export const TECH_STACK_OPTIONS: BrandToolOption[] = [
  {id: 'react', name: 'React', icon: siReact, description: 'Component UI library'},
  {id: 'nextjs', name: 'Next.js', icon: siNextdotjs, description: 'Full-stack React framework'},
  {id: 'typescript', name: 'TypeScript', icon: siTypescript, description: 'Typed JavaScript'},
  {id: 'javascript', name: 'JavaScript', icon: siJavascript, description: 'Web scripting language'},
  {id: 'tailwindcss', name: 'Tailwind CSS', icon: siTailwindcss, description: 'Utility-first styling'},
  {id: 'supabase', name: 'Supabase', icon: siSupabase, description: 'Postgres & auth platform'},
  {id: 'postgresql', name: 'PostgreSQL', icon: siPostgresql, description: 'Relational SQL database'},
  {id: 'nodejs', name: 'Node.js', icon: siNodedotjs, description: 'Server runtime'},
  {id: 'python', name: 'Python', icon: siPython, description: 'Backend & AI scripts'},
  {id: 'vite', name: 'Vite', icon: siVite, description: 'Frontend build tool'},
  {id: 'prisma', name: 'Prisma', icon: siPrisma, description: 'Type-safe ORM'},
  {id: 'drizzle', name: 'Drizzle', icon: siDrizzle, description: 'SQL schema & queries'},
  {id: 'threejs', name: 'Three.js', icon: siThreedotjs, description: '3D WebGL engine'},
  {id: 'firebase', name: 'Firebase', icon: siFirebase, description: 'Realtime app platform'},
  {id: 'astro', name: 'Astro', icon: siAstro, description: 'Content-focused web framework'},
  {id: 'svelte', name: 'Svelte', icon: siSvelte, description: 'Compiled reactive UI'},
  {id: 'vue', name: 'Vue.js', icon: siVuedotjs, description: 'Progressive UI framework'},
  {id: 'framer', name: 'Framer', icon: siFramer, description: 'Interactive design & web'},
  {id: 'docker', name: 'Docker', icon: siDocker, description: 'Containerized deployments'},
];

export const AI_TOOLS_OPTIONS: BrandToolOption[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT / OpenAI',
    brandLogoId: 'chatgpt',
    description: 'OpenAI models & ChatGPT workspace',
  },
  {
    id: 'claude',
    name: 'Claude',
    brandLogoId: 'claude',
    description: 'Anthropic Claude & Claude Code',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    brandLogoId: 'cursor',
    description: 'AI-first code editor',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    brandLogoId: 'windsurf',
    description: 'Agentic IDE workflow',
  },
  {
    id: 'lovable',
    name: 'Lovable',
    brandLogoId: 'lovable',
    description: 'Full-stack AI app builder',
  },
  {
    id: 'bolt',
    name: 'Bolt',
    brandLogoId: 'bolt',
    description: 'Browser-native AI web builder',
  },
  {
    id: 'v0',
    name: 'v0',
    brandLogoId: 'v0',
    description: 'Generative UI by Vercel',
  },
  {
    id: 'replit',
    name: 'Replit',
    brandLogoId: 'replit',
    description: 'Replit Agent & cloud IDE',
  },
  {
    id: 'google-ai-studio',
    name: 'Google AI Studio',
    brandLogoId: 'google-ai-studio',
    description: 'Gemini prototyping & build studio',
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    brandLogoId: 'antigravity',
    description: 'Agentic development IDE',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    brandLogoId: 'github-copilot',
    description: 'GitHub AI pair programmer',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    brandLogoId: 'gemini',
    description: 'Google Gemini models',
  },
];

export const MAX_GALLERY_IMAGES = 15;
export const MAX_DESCRIPTION_LENGTH = 480;
export const MAX_HERO_TITLE_LENGTH = 90;

export function createInitialSubmissionDraft(
  defaultCategory: SubmitCategoryId | null = null,
): SubmissionDraft {
  return {
    category: defaultCategory,
    subCategory: '',
    customSubCategory: '',
    tags: [],
    common: {
      name: '',
      url: '',
      description: '',
      heroTitle: '',
    },
    contact: {
      name: '',
      email: '',
      link: '',
      primaryTopic: '',
      lookingFor: '',
      testBudget: '',
      testAuthorized: false,
      collaborationType: 'seeking_collaborators',
      requiredRoles: [],
      skills: [],
      authorizedTargetUrl: '',
      testingRules: '',
      deadline: '',
      disclosurePolicy: '',
      authorizationProof: null,
    },
    vibecoded: {
      originalPrompt: '',
      developmentSteps: '',
      techStack: [],
      customTechStack: [],
      aiTools: [],
      customAiTools: [],
      aiModel: '',
      extraInfo: '',
    },
    media: {
      hero: null,
      gallery: [],
    },
  };
}

export function submissionRecordToDraft(record: WebsiteSubmissionRecord): SubmissionDraft {
  const base = createInitialSubmissionDraft(record.category);
  const subCat = record.subCategory
    ? record.subCategory
    : record.customSubCategory
      ? 'Other'
      : '';

  const heroAsset: MediaAsset | null = record.media?.hero
    ? {
        id: record.media.hero.id,
        fileName: record.media.hero.fileName,
        fileSizeBytes: record.media.hero.fileSizeBytes,
        mimeType: record.media.hero.mimeType,
        kind: record.media.hero.kind,
        previewUrl: record.media.hero.previewUrl ?? record.thumbnailUrl ?? '',
        publicUrl: record.media.hero.previewUrl ?? record.thumbnailUrl ?? undefined,
        storagePath: record.media.hero.storagePath,
      }
    : record.thumbnailUrl
      ? {
          id: `hero-${record.id}`,
          fileName: 'hero-preview',
          fileSizeBytes: 0,
          mimeType: 'image/webp',
          kind: 'image',
          previewUrl: record.thumbnailUrl,
          publicUrl: record.thumbnailUrl,
        }
      : null;

  const galleryAssets: MediaAsset[] = (record.media?.gallery ?? []).map((item, idx) => ({
    id: item.id || `gal-${idx}`,
    fileName: item.fileName,
    fileSizeBytes: item.fileSizeBytes,
    mimeType: item.mimeType,
    kind: 'image',
    previewUrl: item.previewUrl ?? record.galleryUrls[idx] ?? '',
    publicUrl: item.previewUrl ?? record.galleryUrls[idx],
    storagePath: item.storagePath,
  }));

  return {
    ...base,
    submissionId: record.id,
    category: record.category,
    subCategory: subCat,
    customSubCategory: record.customSubCategory ?? '',
    tags: record.tags ?? [],
    common: {
      name: record.title ?? '',
      url: record.url ?? '',
      description: record.description ?? '',
      heroTitle: record.heroTitle ?? '',
    },
    contact: {
      ...base.contact,
      name: record.connect?.contactName ?? record.test?.contactName ?? '',
      email: record.connect?.contactEmail ?? record.test?.contactEmail ?? '',
      link: record.connect?.contactLink ?? record.test?.contactLink ?? '',
      primaryTopic: record.connect?.reasonForContact ?? record.test?.testingScope ?? '',
      lookingFor: record.connect?.lookingFor ?? record.test?.lookingFor ?? '',
      collaborationType: record.connect?.collaborationType ?? 'seeking_collaborators',
      requiredRoles: record.connect?.requiredRoles ?? [],
      skills: record.connect?.skills ?? [],
      authorizedTargetUrl: record.test?.authorizedTargetUrl ?? '',
      testingRules: record.test?.testingRules ?? '',
      deadline: record.test?.deadline ?? '',
      disclosurePolicy: record.test?.disclosurePolicy ?? '',
      testBudget:
        record.test?.budgetUsd !== undefined ? String(record.test.budgetUsd) : '',
      testAuthorized: Boolean(record.test?.ownerAuthorized),
      authorizationProof: record.test?.authorizationProofPath
        ? {
            fileName: 'Uploaded authorization proof',
            path: record.test.authorizationProofPath,
            fileSizeBytes: 0,
            mimeType: 'application/pdf',
          }
        : null,
    },
    vibecoded: {
      originalPrompt: record.vibecoded?.originalPrompt ?? '',
      developmentSteps: record.vibecoded?.developmentSteps ?? '',
      techStack: record.vibecoded?.techStack ?? [],
      customTechStack: record.vibecoded?.customTechStack ?? [],
      aiTools: record.vibecoded?.aiTools ?? [],
      customAiTools: record.vibecoded?.customAiTools ?? [],
      aiModel: record.vibecoded?.aiModel ?? '',
      extraInfo: record.vibecoded?.extraInfo ?? '',
    },
    media: {
      hero: heroAsset,
      gallery: galleryAssets,
    },
  };
}

export function isValidHttpUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export type ValidationErrors = Record<string, string>;

export function validateStepOne(draft: SubmissionDraft): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!draft.category) {
    errors.category = 'Please choose a category before continuing.';
  }
  if (!draft.subCategory) {
    errors.subCategory = 'Please select a subcategory for your website.';
  } else if (draft.subCategory === 'Other' && !draft.customSubCategory.trim()) {
    errors.customSubCategory = 'Please specify your custom subcategory.';
  }
  return errors;
}

export function validateStepTwo(draft: SubmissionDraft): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!draft.common.name.trim()) {
    errors.commonName = 'Website name is required.';
  }
  if (!isValidHttpUrl(draft.common.url)) {
    errors.commonUrl = 'Enter a valid URL starting with https:// or http:// (e.g. https://fiwi.design).';
  }
  if (draft.common.description.trim().length < 20) {
    errors.commonDescription = 'Please write at least 20 characters describing your website.';
  } else if (draft.common.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.commonDescription = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`;
  }
  if (draft.common.heroTitle.trim().length > MAX_HERO_TITLE_LENGTH) {
    errors.commonHeroTitle = `Hero title must be ${MAX_HERO_TITLE_LENGTH} characters or fewer.`;
  }

  if (draft.category === 'Connect' || draft.category === 'Test') {
    if (!draft.contact.name.trim()) {
      errors.contactName = 'Contact name is required.';
    }
    if (!isValidEmail(draft.contact.email)) {
      errors.contactEmail = 'Please enter a valid contact email address.';
    }
    if (draft.contact.link.trim() && !isValidHttpUrl(draft.contact.link)) {
      errors.contactLink = 'Optional contact link must be a valid URL starting with https:// or http://.';
    }
    if (draft.contact.primaryTopic.trim().length < 12) {
      errors.contactPrimaryTopic =
        draft.category === 'Test'
          ? 'Please describe what you want tested (at least 12 characters).'
          : 'Please explain your reason for contact (at least 12 characters).';
    }
    if (draft.contact.lookingFor.trim().length < 12) {
      errors.contactLookingFor = 'Please describe what you are looking for (at least 12 characters).';
    }
    if (draft.category === 'Test') {
      const targetUrl = draft.contact.authorizedTargetUrl.trim() || draft.common.url.trim();
      if (!isValidHttpUrl(targetUrl)) {
        errors.authorizedTargetUrl = 'Enter a valid authorized target URL (e.g. https://staging.example.com).';
      }
      if (draft.contact.testingRules.trim().length < 10) {
        errors.testingRules = 'Specify testing rules and safe boundaries (at least 10 characters).';
      }
      if (draft.contact.disclosurePolicy.trim().length < 10) {
        errors.disclosurePolicy = 'Specify a responsible disclosure policy (at least 10 characters).';
      }
      const rawBudget = draft.contact.testBudget.trim();
      const parsedBudget = Number(rawBudget);
      if (
        !rawBudget ||
        !/^\d+(\.\d{1,2})?$/.test(rawBudget) ||
        !Number.isFinite(parsedBudget) ||
        parsedBudget < 0
      ) {
        errors.testBudget =
          'Enter the amount in USD you can pay for testing (e.g. 50.00, or 0 if unpaid).';
      }
      if (!draft.contact.testAuthorized) {
        errors.testAuthorized =
          'Confirm you are authorized to offer this website for testing before continuing.';
      }
    }
  }

  if (draft.category === 'Vibecoded') {
    if (draft.vibecoded.originalPrompt.trim().length < 12) {
      errors.originalPrompt = 'Please share the original prompt used to build this website.';
    }
    if (draft.vibecoded.developmentSteps.trim().length < 12) {
      errors.developmentSteps = 'Please outline the development steps you followed.';
    }
    if (
      draft.vibecoded.techStack.length === 0 &&
      draft.vibecoded.customTechStack.length === 0
    ) {
      errors.techStack = 'Select at least one technology or add a custom tech stack item.';
    }
    if (
      draft.vibecoded.aiTools.length === 0 &&
      draft.vibecoded.customAiTools.length === 0
    ) {
      errors.aiTools = 'Select at least one AI tool used or add a custom AI tool.';
    }
  }

  return errors;
}

export function validateStepThree(draft: SubmissionDraft): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!draft.media.hero) {
    errors.heroMedia = 'Upload a mandatory 16:9 hero image or video to serve as the primary FiWi thumbnail.';
  } else if (!draft.media.hero.publicUrl) {
    errors.heroMedia = 'Please wait for hero media upload to finish before continuing.';
  }
  return errors;
}

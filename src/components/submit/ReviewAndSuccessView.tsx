import {motion} from 'motion/react';
import {
  ArrowUpRight,
  CheckCircle2,
  Edit3,
  ShieldCheck,
} from 'lucide-react';
import {BrandLogoBadge} from './BrandLogoBadge';
import {
  AI_TOOLS_OPTIONS,
  TECH_STACK_OPTIONS,
  type SubmissionDraft,
} from './submitData';
import {FIWI_TAP, FIWI_TRANSITION_BASE} from '../../lib/motion';

interface ReviewSubmissionViewProps {
  draft: SubmissionDraft;
  onEditStep: (step: 1 | 2 | 3) => void;
}

export function ReviewSubmissionView({
  draft,
  onEditStep,
}: ReviewSubmissionViewProps) {
  const category = draft.category ?? 'Normal';
  const resolvedSubCategory =
    draft.subCategory === 'Other' && draft.customSubCategory.trim()
      ? draft.customSubCategory.trim()
      : draft.subCategory;

  const selectedAiTools = AI_TOOLS_OPTIONS.filter((tool) =>
    draft.vibecoded.aiTools.includes(tool.id),
  );
  const selectedTechStack = TECH_STACK_OPTIONS.filter((tech) =>
    draft.vibecoded.techStack.includes(tech.id),
  );

  return (
    <div className="text-left space-y-6">
      <div>
        <h2 className="font-display text-[36px] sm:text-[44px] font-medium leading-[0.98] tracking-[-0.015em] text-[#02031A]">
          Review your submission
        </h2>
        <p className="mt-2 text-[15px] sm:text-[16px] text-[#02031A]/75 leading-[1.45]">
          Preview how your listing will appear once approved by FiWi moderators.
        </p>
      </div>

      {/* Primary Hero Thumbnail Preview Card */}
      <div className="bg-white border border-[#02031A]/14 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#02031A]/10 bg-[#FAFBFD]">
          <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/65">
            Primary Thumbnail · 16:9 Hero Media
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1020F5] hover:opacity-75 bg-transparent border-0 p-0 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit media</span>
          </button>
        </div>

        {draft.media.hero ? (
          <div className="aspect-video w-full bg-[#0A0C24]">
            {draft.media.hero.kind === 'video' ? (
              <video
                src={draft.media.hero.previewUrl}
                controls
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={draft.media.hero.previewUrl}
                alt={draft.common.name || 'Primary website hero thumbnail'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : (
          <div className="aspect-video w-full bg-[#F4F6FA] flex items-center justify-center text-[13px] text-[#02031A]/55">
            No hero media uploaded
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="mono text-[11.5px] uppercase tracking-[0.08em] text-[#02031A]/65">
              <span>{category}</span>
              {resolvedSubCategory && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span>{resolvedSubCategory}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1020F5] hover:opacity-75 bg-transparent border-0 p-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit category</span>
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-[34px] sm:text-[40px] font-semibold leading-none tracking-[-0.015em] text-[#02031A]">
              {draft.common.name}
            </h3>

            <a
              href={draft.common.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1020F5] hover:underline break-all"
            >
              <span>{draft.common.url}</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>

          {draft.common.heroTitle.trim() && (
            <div className="mt-2.5 text-[16px] font-semibold text-[#02031A]/90">
              “{draft.common.heroTitle.trim()}”
            </div>
          )}

          <p className="mt-3 text-[14.5px] leading-[1.6] text-[#02031A]/80 whitespace-pre-line">
            {draft.common.description}
          </p>

          {draft.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#F4F6FA] border border-[#02031A]/12 mono text-[11px] text-[#02031A]/75"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-[#02031A]/10 flex justify-end">
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1020F5] hover:opacity-75 bg-transparent border-0 p-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit website information</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category-specific Details: Connect / Test */}
      {(category === 'Connect' || category === 'Test') && (
        <div className="bg-white border border-[#02031A]/14 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#02031A]/10">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] font-semibold">
              {category === 'Test' ? 'Authorized Testing Scope & Contact' : 'Collaboration Contact'}
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1020F5] hover:opacity-75 bg-transparent border-0 p-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13.5px]">
            <div>
              <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                Contact Name
              </dt>
              <dd className="mt-1 font-semibold text-[#02031A]">{draft.contact.name}</dd>
            </div>
            <div>
              <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                Contact Email
              </dt>
              <dd className="mt-1 font-semibold text-[#02031A]">{draft.contact.email}</dd>
            </div>
            {category === 'Connect' && (
              <>
                <div>
                  <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                    Collaboration Type
                  </dt>
                  <dd className="mt-1 font-semibold text-[#02031A] capitalize">
                    {draft.contact.collaborationType.replace(/_/g, ' ')}
                  </dd>
                </div>
                {draft.contact.requiredRoles.length > 0 && (
                  <div>
                    <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                      Required Roles
                    </dt>
                    <dd className="mt-1 text-[#02031A]">{draft.contact.requiredRoles.join(', ')}</dd>
                  </div>
                )}
              </>
            )}
            {draft.contact.link.trim() && (
              <div className="sm:col-span-2">
                <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                  Contact Link
                </dt>
                <dd className="mt-1 text-[#1020F5] break-all">{draft.contact.link}</dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                {category === 'Test' ? 'What Is In Scope to Test?' : 'Reason for Contact'}
              </dt>
              <dd className="mt-1 text-[#02031A]/85 whitespace-pre-line leading-[1.55]">
                {draft.contact.primaryTopic}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                What Are You Looking For?
              </dt>
              <dd className="mt-1 text-[#02031A]/85 whitespace-pre-line leading-[1.55]">
                {draft.contact.lookingFor}
              </dd>
            </div>
            {category === 'Test' && (
              <>
                <div>
                  <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                    Authorized Target URL
                  </dt>
                  <dd className="mt-1 text-[#1020F5] break-all">
                    {draft.contact.authorizedTargetUrl.trim() || draft.common.url}
                  </dd>
                </div>
                <div>
                  <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                    Testing Payment / Budget
                  </dt>
                  <dd className="mt-1 font-semibold text-[#02031A] tabular-nums">
                    {(() => {
                      const parsed = Number(draft.contact.testBudget);
                      if (!Number.isFinite(parsed) || parsed <= 0) {
                        return '$0.00 USD (Unpaid / Volunteer)';
                      }
                      return `$${parsed.toFixed(2)} USD`;
                    })()}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                    Testing Rules &amp; Boundaries
                  </dt>
                  <dd className="mt-1 text-[#02031A]/85 whitespace-pre-line">
                    {draft.contact.testingRules}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55">
                    Disclosure Policy
                  </dt>
                  <dd className="mt-1 text-[#02031A]/85 whitespace-pre-line">
                    {draft.contact.disclosurePolicy}
                  </dd>
                </div>
              </>
            )}
          </dl>

          {category === 'Test' && draft.contact.testAuthorized && (
            <div className="mt-4 pt-3 border-t border-[#02031A]/10 flex items-center gap-2 text-[13px] font-medium text-[#02031A]">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>
                Owner/authorized testing confirmation checked
                {draft.contact.authorizationProof ? ' · Private proof document attached' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Category-specific Details: Vibecoded */}
      {category === 'Vibecoded' && (
        <div className="bg-white border border-[#02031A]/14 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#02031A]/10">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] font-semibold">
              Vibecoded Prompts, Stack &amp; AI Tools
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1020F5] hover:opacity-75 bg-transparent border-0 p-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {draft.vibecoded.aiModel.trim() && (
            <div className="text-[13.5px]">
              <span className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 mr-2">
                Model:
              </span>
              <span className="font-semibold text-[#02031A]">{draft.vibecoded.aiModel}</span>
            </div>
          )}

          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 mb-2">
              AI Tools Used
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedAiTools.map((tool) => (
                <div
                  key={tool.id}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-[#02031A]/14 bg-[#FAFBFD] text-[12.5px] font-semibold text-[#02031A]"
                >
                  <BrandLogoBadge tool={tool} size="sm" />
                  <span>{tool.name}</span>
                </div>
              ))}
              {draft.vibecoded.customAiTools.map((toolName) => (
                <div
                  key={toolName}
                  className="inline-flex items-center px-3 py-1.5 border border-[#02031A]/14 bg-[#FAFBFD] text-[12.5px] font-semibold text-[#02031A]"
                >
                  {toolName}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 mb-2">
              Tech Stack
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTechStack.map((tech) => (
                <div
                  key={tech.id}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-[#02031A]/14 bg-[#FAFBFD] text-[12.5px] font-medium text-[#02031A]"
                >
                  <BrandLogoBadge tool={tech} size="sm" />
                  <span>{tech.name}</span>
                </div>
              ))}
              {draft.vibecoded.customTechStack.map((techName) => (
                <div
                  key={techName}
                  className="inline-flex items-center px-3 py-1.5 border border-[#02031A]/14 bg-[#FAFBFD] text-[12.5px] font-medium text-[#02031A]"
                >
                  {techName}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 mb-1.5">
              Original Prompt
            </div>
            <div className="p-3.5 bg-[#F8FAFC] border border-[#02031A]/10 text-[13px] leading-[1.6] text-[#02031A]/85 whitespace-pre-line">
              {draft.vibecoded.originalPrompt}
            </div>
          </div>

          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/55 mb-1.5">
              Development Steps
            </div>
            <div className="p-3.5 bg-[#F8FAFC] border border-[#02031A]/10 text-[13px] leading-[1.6] text-[#02031A]/85 whitespace-pre-line">
              {draft.vibecoded.developmentSteps}
            </div>
          </div>
        </div>
      )}

      {/* Additional Preview Gallery */}
      {draft.media.gallery.length > 0 && (
        <div className="bg-white border border-[#02031A]/14 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#02031A]/10">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/65 tabular-nums">
              Additional Preview Gallery ({draft.media.gallery.length})
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1020F5] hover:opacity-75 bg-transparent border-0 p-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit gallery</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {draft.media.gallery.map((img) => (
              <div
                key={img.id}
                className="aspect-[16/10] bg-[#F4F6FA] border border-[#02031A]/10 overflow-hidden"
              >
                <img
                  src={img.previewUrl}
                  alt={img.fileName}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SubmissionSuccessViewProps {
  websiteName: string;
  categoryName: string;
  isDraft?: boolean;
  onReturnToFiwi: () => void;
  onViewMySubmissions: () => void;
  onStartAnother: () => void;
}

export function SubmissionSuccessView({
  websiteName,
  categoryName,
  isDraft = false,
  onReturnToFiwi,
  onViewMySubmissions,
  onStartAnother,
}: SubmissionSuccessViewProps) {
  return (
    <div className="py-6 sm:py-10 px-2 flex flex-col items-center text-center max-w-[540px] mx-auto">
      <motion.span
        initial={{opacity: 0, scale: 0.9}}
        animate={{opacity: 1, scale: 1}}
        transition={FIWI_TRANSITION_BASE}
        className="w-16 h-16 rounded-full bg-[#02031A] text-white flex items-center justify-center shadow-[0_16px_36px_-12px_rgba(2,3,26,0.45)]"
      >
        <CheckCircle2 className="w-8 h-8" />
      </motion.span>

      <div className="mt-5 mono text-[11px] uppercase tracking-[0.1em] text-[#1020F5] font-semibold">
        {categoryName} {isDraft ? 'Draft Saved' : 'Submission Queued'}
      </div>

      <h2 className="mt-2 font-display text-[42px] sm:text-[52px] font-medium leading-[0.95] tracking-[-0.015em] text-[#02031A]">
        {isDraft ? 'Draft saved' : 'Submission sent for review'}
      </h2>

      <p className="mt-3.5 text-[15px] sm:text-[16px] leading-[1.55] text-[#02031A]/80">
        {isDraft ? (
          <>
            Your draft for{' '}
            <strong className="text-[#02031A] [overflow-wrap:anywhere]">
              {websiteName || 'your website'}
            </strong>{' '}
            is safely stored in your account. You can resume editing and submit it for moderation anytime from My Submissions.
          </>
        ) : (
          <>
            Your submission for{' '}
            <strong className="text-[#02031A] [overflow-wrap:anywhere]">
              {websiteName || 'your website'}
            </strong>{' '}
            has been queued for FiWi moderator review. Track approval status or reviewer notes anytime in My Submissions.
          </>
        )}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3 w-full">
        <motion.button
          type="button"
          whileTap={FIWI_TAP}
          onClick={onViewMySubmissions}
          className="btn h-[48px] px-6 bg-[#02031A] text-white hover:bg-[#1020F5]"
        >
          My submissions
        </motion.button>
        <motion.button
          type="button"
          whileTap={FIWI_TAP}
          onClick={onReturnToFiwi}
          className="btn h-[48px] px-6 btn-square border border-[#02031A]/20 bg-white/80 text-[#02031A] hover:bg-white"
        >
          Return to FiWi
        </motion.button>
        <motion.button
          type="button"
          whileTap={FIWI_TAP}
          onClick={onStartAnother}
          className="btn h-[48px] px-6 btn-square border border-[#02031A]/20 bg-white/80 text-[#02031A] hover:bg-white"
        >
          Submit another
        </motion.button>
      </div>
    </div>
  );
}

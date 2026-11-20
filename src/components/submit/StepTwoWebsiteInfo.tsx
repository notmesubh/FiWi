import {useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {Check, FileUp, Loader2, Plus, ShieldCheck, Trash2, X} from 'lucide-react';
import {BrandLogoBadge} from './BrandLogoBadge';
import {
  AI_TOOLS_OPTIONS,
  MAX_DESCRIPTION_LENGTH,
  MAX_HERO_TITLE_LENGTH,
  TECH_STACK_OPTIONS,
  type SubmissionDraft,
  type ValidationErrors,
} from './submitData';
import {uploadMediaFile} from '../../lib/api';
import {FIWI_TAP, fiwiPanelRevealVariants} from '../../lib/motion';
import type {CollaborationType} from '../../types/fiwi';

interface StepTwoWebsiteInfoProps {
  draft: SubmissionDraft;
  errors: ValidationErrors;
  onUpdateCommon: (patch: Partial<SubmissionDraft['common']>) => void;
  onUpdateTags: (tags: string[]) => void;
  onUpdateContact: (patch: Partial<SubmissionDraft['contact']>) => void;
  onUpdateVibecoded: (patch: Partial<SubmissionDraft['vibecoded']>) => void;
}

export default function StepTwoWebsiteInfo({
  draft,
  errors,
  onUpdateCommon,
  onUpdateTags,
  onUpdateContact,
  onUpdateVibecoded,
}: StepTwoWebsiteInfoProps) {
  const [showCustomTechInput, setShowCustomTechInput] = useState(
    draft.vibecoded.customTechStack.length > 0,
  );
  const [customTechInput, setCustomTechInput] = useState('');

  const [showCustomAiInput, setShowCustomAiInput] = useState(
    draft.vibecoded.customAiTools.length > 0,
  );
  const [customAiInput, setCustomAiInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const category = draft.category ?? 'Normal';
  const showContactFirst = category === 'Connect' || category === 'Test';

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed || draft.tags.length >= 10) return;
    if (!draft.tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onUpdateTags([...draft.tags, trimmed.slice(0, 28)]);
    }
    setTagInput('');
  };

  const addChip = (
    raw: string,
    current: string[],
    max: number,
    onDone: (next: string[]) => void,
    clearInput: () => void,
  ) => {
    const trimmed = raw.trim();
    if (!trimmed || current.length >= max) return;
    if (!current.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      onDone([...current, trimmed.slice(0, 40)]);
    }
    clearInput();
  };

  const handleProofUpload = async (file: File | undefined) => {
    if (!file) return;
    setProofError(null);
    setUploadingProof(true);
    try {
      const res = await uploadMediaFile({file, purpose: 'test_proof'});
      onUpdateContact({
        authorizationProof: {
          fileName: file.name,
          path: res.path,
          fileSizeBytes: res.fileSizeBytes,
          mimeType: res.mimeType,
        },
      });
    } catch (err) {
      setProofError(
        err instanceof Error ? err.message : 'Unable to upload authorization proof.',
      );
    } finally {
      setUploadingProof(false);
    }
  };

  const toggleTech = (id: string) => {
    const exists = draft.vibecoded.techStack.includes(id);
    const next = exists
      ? draft.vibecoded.techStack.filter((item) => item !== id)
      : [...draft.vibecoded.techStack, id];
    onUpdateVibecoded({techStack: next});
  };

  const addCustomTech = () => {
    const trimmed = customTechInput.trim();
    if (!trimmed) return;
    const alreadyExists = draft.vibecoded.customTechStack.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!alreadyExists) {
      onUpdateVibecoded({
        customTechStack: [...draft.vibecoded.customTechStack, trimmed],
      });
    }
    setCustomTechInput('');
  };

  const removeCustomTech = (name: string) => {
    onUpdateVibecoded({
      customTechStack: draft.vibecoded.customTechStack.filter((item) => item !== name),
    });
  };

  const toggleAiTool = (id: string) => {
    const exists = draft.vibecoded.aiTools.includes(id);
    const next = exists
      ? draft.vibecoded.aiTools.filter((item) => item !== id)
      : [...draft.vibecoded.aiTools, id];
    onUpdateVibecoded({aiTools: next});
  };

  const addCustomAiTool = () => {
    const trimmed = customAiInput.trim();
    if (!trimmed) return;
    const alreadyExists = draft.vibecoded.customAiTools.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!alreadyExists) {
      onUpdateVibecoded({
        customAiTools: [...draft.vibecoded.customAiTools, trimmed],
      });
    }
    setCustomAiInput('');
  };

  const removeCustomAiTool = (name: string) => {
    onUpdateVibecoded({
      customAiTools: draft.vibecoded.customAiTools.filter((item) => item !== name),
    });
  };

  const renderContactOrTestSection = () => (
    <section
      aria-label={category === 'Test' ? 'Testing details and authorization' : 'Contact information'}
      className="mb-7 pb-7 border-b border-[#02031A]/12"
    >
      <div className="mb-4">
        <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] font-semibold">
          {category === 'Test' ? 'Testing Brief & Contact' : 'Collaboration Contact'}
        </div>
        <h3 className="mt-1 font-display text-[28px] font-medium leading-none tracking-[-0.01em] text-[#02031A]">
          {category === 'Test'
            ? 'Who should testers reach out to?'
            : 'How can collaborators reach you?'}
        </h3>
        <p className="mt-1.5 text-[13.5px] text-[#02031A]/70">
          {category === 'Test'
            ? 'Provide authorized contact details, scope boundaries, rules, and responsible disclosure expectations.'
            : 'Share your collaboration type, roles needed, contact details, and how contributors can join.'}
        </p>
      </div>

      {category === 'Connect' && (
        <div className="mb-4 space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              Collaboration Type *
            </span>
            <select
              value={draft.contact.collaborationType}
              onChange={(e) =>
                onUpdateContact({collaborationType: e.target.value as CollaborationType})
              }
              className="fiwi-field"
            >
              <option value="seeking_collaborators">Looking for collaborators</option>
              <option value="offering_collaboration">Offering collaboration</option>
              <option value="partnership">Partnership / Open launch</option>
            </select>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                Required Roles <span className="text-[#02031A]/45">(up to 10)</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChip(
                        roleInput,
                        draft.contact.requiredRoles,
                        10,
                        (next) => onUpdateContact({requiredRoles: next}),
                        () => setRoleInput(''),
                      );
                    }
                  }}
                  placeholder="e.g. Design Engineer"
                  className="fiwi-field flex-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    addChip(
                      roleInput,
                      draft.contact.requiredRoles,
                      10,
                      (next) => onUpdateContact({requiredRoles: next}),
                      () => setRoleInput(''),
                    )
                  }
                  className="btn h-[42px] px-3.5 btn-square bg-[#02031A] text-white text-[12px]"
                >
                  Add
                </button>
              </div>
              {draft.contact.requiredRoles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {draft.contact.requiredRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#02031A] text-white text-[12px]"
                    >
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateContact({
                            requiredRoles: draft.contact.requiredRoles.filter((r) => r !== role),
                          })
                        }
                        aria-label={`Remove ${role}`}
                        className="bg-transparent border-0 p-0 text-white/75 hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                Skills Wanted <span className="text-[#02031A]/45">(up to 14)</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChip(
                        skillInput,
                        draft.contact.skills,
                        14,
                        (next) => onUpdateContact({skills: next}),
                        () => setSkillInput(''),
                      );
                    }
                  }}
                  placeholder="e.g. TypeScript, WebGL"
                  className="fiwi-field flex-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    addChip(
                      skillInput,
                      draft.contact.skills,
                      14,
                      (next) => onUpdateContact({skills: next}),
                      () => setSkillInput(''),
                    )
                  }
                  className="btn h-[42px] px-3.5 btn-square bg-[#02031A] text-white text-[12px]"
                >
                  Add
                </button>
              </div>
              {draft.contact.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {draft.contact.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF2FF] border border-[#1020F5]/25 text-[#1020F5] text-[12px] font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateContact({
                            skills: draft.contact.skills.filter((s) => s !== skill),
                          })
                        }
                        aria-label={`Remove ${skill}`}
                        className="bg-transparent border-0 p-0 text-[#1020F5]/75 hover:text-[#1020F5] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
            Contact Name *
          </span>
          <input
            type="text"
            value={draft.contact.name}
            onChange={(e) => onUpdateContact({name: e.target.value})}
            placeholder="Alex Rivera"
            aria-invalid={Boolean(errors.contactName)}
            className="fiwi-field"
          />
          {errors.contactName && (
            <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
              {errors.contactName}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
            Contact Email *
          </span>
          <input
            type="email"
            value={draft.contact.email}
            onChange={(e) => onUpdateContact({email: e.target.value})}
            placeholder="alex@studio.com"
            aria-invalid={Boolean(errors.contactEmail)}
            className="fiwi-field"
          />
          {errors.contactEmail && (
            <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
              {errors.contactEmail}
            </span>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1.5 mt-4">
        <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
          Contact Link <span className="text-[#02031A]/45">(optional)</span>
        </span>
        <input
          type="url"
          value={draft.contact.link}
          onChange={(e) => onUpdateContact({link: e.target.value})}
          placeholder="https://x.com/yourhandle or https://cal.com/yourname"
          aria-invalid={Boolean(errors.contactLink)}
          className="fiwi-field"
        />
        {errors.contactLink && (
          <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
            {errors.contactLink}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 mt-4">
        <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
          {category === 'Test' ? 'What Is In Scope to Test? *' : 'Reason for Contact *'}
        </span>
        <textarea
          rows={3}
          value={draft.contact.primaryTopic}
          onChange={(e) => onUpdateContact({primaryTopic: e.target.value})}
          placeholder={
            category === 'Test'
              ? 'e.g. Authentication flows, checkout edge cases on staging.myapp.com, and responsive accessibility...'
              : 'e.g. Launching our v2 interactive design engine and looking to team up on growth & polish...'
          }
          aria-invalid={Boolean(errors.contactPrimaryTopic)}
          className="fiwi-field resize-y min-h-[88px]"
        />
        {errors.contactPrimaryTopic && (
          <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
            {errors.contactPrimaryTopic}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 mt-4">
        <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
          What Are You Looking For? *
        </span>
        <textarea
          rows={3}
          value={draft.contact.lookingFor}
          onChange={(e) => onUpdateContact({lookingFor: e.target.value})}
          placeholder={
            category === 'Test'
              ? 'e.g. Detailed UX bug reports, security scope feedback within authorized staging routes, or mobile QA testers...'
              : 'e.g. A frontend motion engineer, founding product designer, or strategic launch partners...'
          }
          aria-invalid={Boolean(errors.contactLookingFor)}
          className="fiwi-field resize-y min-h-[88px]"
        />
        {errors.contactLookingFor && (
          <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
            {errors.contactLookingFor}
          </span>
        )}
      </label>

      {category === 'Test' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                Authorized Target URL *
              </span>
              <input
                type="url"
                value={draft.contact.authorizedTargetUrl}
                onChange={(e) => onUpdateContact({authorizedTargetUrl: e.target.value})}
                placeholder="https://staging.yourdomain.com (defaults to Website URL)"
                aria-invalid={Boolean(errors.authorizedTargetUrl)}
                className="fiwi-field"
              />
              {errors.authorizedTargetUrl && (
                <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
                  {errors.authorizedTargetUrl}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
                Testing Deadline <span className="text-[#02031A]/45">(optional)</span>
              </span>
              <input
                type="date"
                value={draft.contact.deadline}
                onChange={(e) => onUpdateContact({deadline: e.target.value})}
                className="fiwi-field"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              Testing Rules &amp; Boundaries *
            </span>
            <textarea
              rows={3}
              value={draft.contact.testingRules}
              onChange={(e) => onUpdateContact({testingRules: e.target.value})}
              placeholder="e.g. No automated DoS/flooding, test only with @test-account emails, out-of-scope: third-party billing portals."
              aria-invalid={Boolean(errors.testingRules)}
              className="fiwi-field resize-y min-h-[80px]"
            />
            {errors.testingRules && (
              <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
                {errors.testingRules}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              Responsible Disclosure Policy *
            </span>
            <textarea
              rows={2}
              value={draft.contact.disclosurePolicy}
              onChange={(e) => onUpdateContact({disclosurePolicy: e.target.value})}
              placeholder="e.g. Report vulnerabilities privately to security@yourdomain.com and allow 14 days before public disclosure."
              aria-invalid={Boolean(errors.disclosurePolicy)}
              className="fiwi-field resize-y min-h-[72px]"
            />
            {errors.disclosurePolicy && (
              <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
                {errors.disclosurePolicy}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              Amount You Can Pay for Testing (USD) *
            </span>
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 mono text-[13px] text-[#02031A]/55"
              >
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={draft.contact.testBudget}
                onChange={(e) => onUpdateContact({testBudget: e.target.value})}
                placeholder="50.00"
                aria-invalid={Boolean(errors.testBudget)}
                className="fiwi-field pl-7 pr-14 tabular-nums"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/45"
              >
                USD
              </span>
            </div>
            <span className="text-[12px] text-[#02031A]/60">
              Enter the budget or reward you can pay testers (enter 0 if testing is unpaid).
            </span>
            {errors.testBudget && (
              <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
                {errors.testBudget}
              </span>
            )}
          </label>

          {/* Private Authorization Proof Upload */}
          <div className="p-3.5 border border-[#02031A]/14 bg-white/75 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/80 font-semibold">
                  Authorization Proof Document <span className="text-[#02031A]/45">(Private · Moderators Only)</span>
                </div>
                <p className="m-0 text-[12px] text-[#02031A]/65">
                  Optional PDF, PNG, JPG, or TXT stored in private storage for admin verification only.
                </p>
              </div>
              <input
                ref={proofInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/*,text/plain"
                onChange={(e) => {
                  void handleProofUpload(e.target.files?.[0]);
                  e.target.value = '';
                }}
                className="sr-only"
              />
              <button
                type="button"
                disabled={uploadingProof}
                onClick={() => proofInputRef.current?.click()}
                className="btn h-[36px] px-3.5 btn-square bg-[#02031A] text-white hover:bg-[#1020F5] text-[12px] inline-flex items-center gap-1.5"
              >
                {uploadingProof ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileUp className="w-3.5 h-3.5" />
                )}
                <span>{draft.contact.authorizationProof ? 'Replace file' : 'Upload proof'}</span>
              </button>
            </div>

            {draft.contact.authorizationProof && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#ECFDF5] border border-[#16A34A]/30 text-[12.5px] text-[#166534]">
                <span className="truncate font-medium">
                  Attached: {draft.contact.authorizationProof.fileName}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateContact({authorizationProof: null})}
                  aria-label="Remove authorization proof"
                  className="bg-transparent border-0 p-1 text-[#991B1B] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {proofError && (
              <p role="alert" className="m-0 text-[12px] font-medium text-[#991B1B]">
                {proofError}
              </p>
            )}
          </div>

          <div>
            <label
              className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                draft.contact.testAuthorized
                  ? 'bg-white border-[#1020F5]/45'
                  : 'bg-white/75 border-[#02031A]/15 hover:bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={draft.contact.testAuthorized}
                onChange={(e) => onUpdateContact({testAuthorized: e.target.checked})}
                className="mt-0.5 w-4 h-4 accent-[#1020F5] cursor-pointer shrink-0"
              />
              <div className="text-[13px] leading-[1.45] text-[#02031A]">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1020F5] shrink-0" />
                  <span>Authorization confirmation *</span>
                </div>
                <p className="mt-0.5 text-[#02031A]/75">
                  I confirm that I own or have explicit authorization to list this website for authorized community testing within the stated scope.
                </p>
              </div>
            </label>
            {errors.testAuthorized && (
              <p role="alert" className="mt-1.5 text-[12px] font-medium text-[#991B1B]">
                {errors.testAuthorized}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );

  const renderCommonFields = () => {
    const descLen = draft.common.description.length;
    const heroLen = draft.common.heroTitle.length;

    return (
      <section aria-label="Core website details">
        {showContactFirst && (
          <div className="mb-4">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/60">
              Website Details
            </div>
            <h3 className="mt-1 font-display text-[26px] font-medium leading-none tracking-[-0.01em] text-[#02031A]">
              About your website
            </h3>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              Website Name *
            </span>
            <input
              type="text"
              value={draft.common.name}
              onChange={(e) => onUpdateCommon({name: e.target.value})}
              placeholder="Atelier Nord"
              aria-invalid={Boolean(errors.commonName)}
              className="fiwi-field"
            />
            {errors.commonName && (
              <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
                {errors.commonName}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              Website URL *
            </span>
            <input
              type="url"
              value={draft.common.url}
              onChange={(e) => onUpdateCommon({url: e.target.value})}
              placeholder="https://ateliernord.design"
              aria-invalid={Boolean(errors.commonUrl)}
              className="fiwi-field"
            />
            {errors.commonUrl && (
              <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
                {errors.commonUrl}
              </span>
            )}
          </label>
        </div>

        <label className="flex flex-col gap-1.5 mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              Website Description *
            </span>
            <span
              className={`mono text-[11px] tabular-nums ${
                descLen > MAX_DESCRIPTION_LENGTH ? 'text-[#991B1B] font-semibold' : 'text-[#02031A]/55'
              }`}
            >
              {descLen}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <textarea
            rows={3}
            value={draft.common.description}
            onChange={(e) => onUpdateCommon({description: e.target.value})}
            placeholder="Summarize what this website does, what makes the experience distinctive, and why visitors should explore it."
            aria-invalid={Boolean(errors.commonDescription)}
            className="fiwi-field resize-y min-h-[92px]"
          />
          <span className="text-[12px] text-[#02031A]/60">
            Minimum 20 characters. Clear, concise editorial summaries work best in FiWi search.
          </span>
          {errors.commonDescription && (
            <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
              {errors.commonDescription}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5 mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              Hero Title <span className="text-[#02031A]/45">(optional)</span>
            </span>
            <span
              className={`mono text-[11px] tabular-nums ${
                heroLen > MAX_HERO_TITLE_LENGTH ? 'text-[#991B1B] font-semibold' : 'text-[#02031A]/55'
              }`}
            >
              {heroLen}/{MAX_HERO_TITLE_LENGTH}
            </span>
          </div>
          <input
            type="text"
            value={draft.common.heroTitle}
            onChange={(e) => onUpdateCommon({heroTitle: e.target.value})}
            placeholder="Optional featured headline for your FiWi spotlight"
            aria-invalid={Boolean(errors.commonHeroTitle)}
            className="fiwi-field"
          />
          {errors.commonHeroTitle && (
            <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
              {errors.commonHeroTitle}
            </span>
          )}
        </label>

        {/* Discovery Tags (Optional across all categories) */}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              Tags <span className="text-[#02031A]/45">(optional · up to 10)</span>
            </span>
            <span className="mono text-[11px] text-[#02031A]/50 tabular-nums">
              {draft.tags.length}/10
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="e.g. minimal, 3d, devtools, open-source"
              className="fiwi-field flex-1"
            />
            <button
              type="button"
              onClick={addTag}
              className="btn h-[42px] px-4 btn-square bg-[#02031A] text-white hover:bg-[#1020F5] text-[13px]"
            >
              Add tag
            </button>
          </div>
          {draft.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#02031A]/18 text-[#02031A] text-[12px] font-medium"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateTags(draft.tags.filter((t) => t !== tag))}
                    aria-label={`Remove tag ${tag}`}
                    className="bg-transparent border-0 p-0 text-[#02031A]/55 hover:text-[#02031A] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderVibecodedSection = () => (
    <section
      aria-label="Vibecoded development provenance"
      className="mt-7 pt-7 border-t border-[#02031A]/12 space-y-6"
    >
      <div>
        <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] font-semibold">
          Development Information
        </div>
        <h3 className="mt-1 font-display text-[28px] font-medium leading-none tracking-[-0.01em] text-[#02031A]">
          Prompts, stack &amp; AI tools
        </h3>
        <p className="mt-1.5 text-[13.5px] text-[#02031A]/70">
          Help the FiWi community learn how you crafted this AI-built website.
        </p>
      </div>

      {/* Original Prompt */}
      <label className="flex flex-col gap-1.5">
        <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
          Original Prompt *
        </span>
        <textarea
          rows={5}
          value={draft.vibecoded.originalPrompt}
          onChange={(e) => onUpdateVibecoded({originalPrompt: e.target.value})}
          placeholder="Paste the initial prompt you used to generate the layout, visual style, and core features..."
          aria-invalid={Boolean(errors.originalPrompt)}
          className="fiwi-field resize-y min-h-[124px]"
        />
        {errors.originalPrompt && (
          <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
            {errors.originalPrompt}
          </span>
        )}
      </label>

      {/* Development Steps */}
      <label className="flex flex-col gap-1.5">
        <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
          Development Steps *
        </span>
        <textarea
          rows={5}
          value={draft.vibecoded.developmentSteps}
          onChange={(e) => onUpdateVibecoded({developmentSteps: e.target.value})}
          placeholder="Walk through how you iterated: prompt refinements, layout tuning, bug fixes, animations, or custom code adjustments..."
          aria-invalid={Boolean(errors.developmentSteps)}
          className="fiwi-field resize-y min-h-[124px]"
        />
        {errors.developmentSteps && (
          <span role="alert" className="text-[12px] font-medium text-[#991B1B]">
            {errors.developmentSteps}
          </span>
        )}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
            Primary AI Model <span className="text-[#02031A]/45">(optional)</span>
          </span>
          <input
            type="text"
            value={draft.vibecoded.aiModel}
            onChange={(e) => onUpdateVibecoded({aiModel: e.target.value})}
            placeholder="e.g. Claude Sonnet 4.5, Gemini 2.5 Pro, GPT-4o"
            className="fiwi-field"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
            Extra Building Notes <span className="text-[#02031A]/45">(optional)</span>
          </span>
          <input
            type="text"
            value={draft.vibecoded.extraInfo}
            onChange={(e) => onUpdateVibecoded({extraInfo: e.target.value})}
            placeholder="e.g. Built in 4 hours, deployed on Vercel + Supabase"
            className="fiwi-field"
          />
        </label>
      </div>

      {/* Tech Stack */}
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2.5">
          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
            Tech Stack *
          </span>
          <span className="mono text-[11px] tabular-nums text-[#02031A]/55">
            {draft.vibecoded.techStack.length + draft.vibecoded.customTechStack.length} selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {TECH_STACK_OPTIONS.map((tech) => {
            const isSelected = draft.vibecoded.techStack.includes(tech.id);
            return (
              <motion.button
                key={tech.id}
                type="button"
                aria-pressed={isSelected}
                title={tech.description}
                whileTap={FIWI_TAP}
                onClick={() => toggleTech(tech.id)}
                className={`px-2.5 py-2 border flex items-center gap-2.5 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1020F5] ${
                  isSelected
                    ? 'bg-[#02031A] border-[#02031A] text-white'
                    : 'bg-white/80 hover:bg-white border-[#02031A]/14 text-[#02031A] hover:border-[#02031A]/30'
                }`}
              >
                <BrandLogoBadge tool={tech} size="sm" inverted={isSelected} />
                <span className="text-[12.5px] font-medium truncate flex-1">{tech.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              </motion.button>
            );
          })}

          <motion.button
            type="button"
            aria-pressed={showCustomTechInput}
            whileTap={FIWI_TAP}
            onClick={() => setShowCustomTechInput((prev) => !prev)}
            className={`px-2.5 py-2 border flex items-center gap-2.5 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1020F5] ${
              showCustomTechInput || draft.vibecoded.customTechStack.length > 0
                ? 'bg-[#1020F5]/10 border-[#1020F5] text-[#02031A]'
                : 'bg-white/80 hover:bg-white border-[#02031A]/14 text-[#02031A]'
            }`}
          >
            <span className="w-7 h-7 rounded-[8px] border border-[#02031A]/15 bg-white flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5 text-[#02031A]" />
            </span>
            <span className="text-[12.5px] font-medium truncate">Other</span>
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {(showCustomTechInput || draft.vibecoded.customTechStack.length > 0) && (
            <motion.div
              key="custom-tech-drawer"
              variants={fiwiPanelRevealVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-3 p-3.5 bg-white/75 border border-[#02031A]/12"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTechInput}
                  onChange={(e) => setCustomTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTech();
                    }
                  }}
                  placeholder="Add custom technology (e.g. WebGPU, GSAP, Convex)"
                  className="fiwi-field flex-1"
                />
                <button
                  type="button"
                  onClick={addCustomTech}
                  className="btn h-[42px] px-4 btn-square bg-[#02031A] text-white text-[13px] hover:bg-[#1020F5]"
                >
                  Add
                </button>
              </div>

              {draft.vibecoded.customTechStack.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {draft.vibecoded.customTechStack.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#02031A] text-white text-[12px] font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomTech(item)}
                        aria-label={`Remove ${item}`}
                        className="text-white/75 hover:text-white bg-transparent border-0 p-0 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {errors.techStack && (
          <p role="alert" className="mt-2 text-[12.5px] font-medium text-[#991B1B]">
            {errors.techStack}
          </p>
        )}
      </div>

      {/* AI Tools Used Grid */}
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2.5">
          <div>
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/75">
              AI Tools Used *
            </span>
            <p className="text-[12.5px] text-[#02031A]/65 mt-0.5">
              Select all AI editors, builders, and assistants that helped build this site.
            </p>
          </div>
          <span className="mono text-[11px] tabular-nums text-[#02031A]/55 shrink-0">
            {draft.vibecoded.aiTools.length + draft.vibecoded.customAiTools.length} selected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {AI_TOOLS_OPTIONS.map((tool) => {
            const isSelected = draft.vibecoded.aiTools.includes(tool.id);
            return (
              <motion.button
                key={tool.id}
                type="button"
                aria-pressed={isSelected}
                title={tool.description}
                whileTap={FIWI_TAP}
                onClick={() => toggleAiTool(tool.id)}
                className={`group p-3 border flex items-center justify-between gap-3 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1020F5] ${
                  isSelected
                    ? 'bg-white border-[#1020F5] shadow-[0_10px_24px_-12px_rgba(16,32,245,0.3)]'
                    : 'bg-white/80 hover:bg-white border-[#02031A]/14 hover:border-[#02031A]/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BrandLogoBadge tool={tool} size="md" />
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-[#02031A] truncate">
                      {tool.name}
                    </div>
                    <div className="text-[11px] text-[#02031A]/60 truncate">
                      {tool.description}
                    </div>
                  </div>
                </div>

                <span
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#1020F5] border-[#1020F5] text-white'
                      : 'border-[#02031A]/20 bg-white text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </span>
              </motion.button>
            );
          })}

          <motion.button
            type="button"
            aria-pressed={showCustomAiInput}
            whileTap={FIWI_TAP}
            onClick={() => setShowCustomAiInput((prev) => !prev)}
            className={`group p-3 border flex items-center justify-between gap-3 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1020F5] ${
              showCustomAiInput || draft.vibecoded.customAiTools.length > 0
                ? 'bg-white border-[#1020F5] shadow-[0_10px_24px_-12px_rgba(16,32,245,0.3)]'
                : 'bg-white/80 hover:bg-white border-[#02031A]/14 hover:border-[#02031A]/30'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-[8px] border border-[#02031A]/12 bg-[#F4F6FA] flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-[#02031A]" />
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-[#02031A]">Other</div>
                <div className="text-[11px] text-[#02031A]/60 truncate">
                  Add additional AI tools
                </div>
              </div>
            </div>

            <span
              aria-hidden="true"
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                showCustomAiInput || draft.vibecoded.customAiTools.length > 0
                  ? 'bg-[#1020F5] border-[#1020F5] text-white'
                  : 'border-[#02031A]/20 bg-white text-transparent'
              }`}
            >
              <Check className="w-3 h-3 stroke-[2.5]" />
            </span>
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {(showCustomAiInput || draft.vibecoded.customAiTools.length > 0) && (
            <motion.div
              key="custom-ai-drawer"
              variants={fiwiPanelRevealVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-3 p-4 bg-white/80 border border-[#02031A]/14"
            >
              <div className="mono text-[10.5px] uppercase tracking-[0.08em] text-[#02031A]/70 mb-2">
                Additional AI tools
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAiInput}
                  onChange={(e) => setCustomAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAiTool();
                    }
                  }}
                  placeholder="Enter AI tool name (e.g. Cline, Aider, Devin)"
                  className="fiwi-field flex-1"
                />
                <button
                  type="button"
                  onClick={addCustomAiTool}
                  className="btn h-[42px] px-4 btn-square bg-[#02031A] text-white text-[13px] hover:bg-[#1020F5]"
                >
                  Add tool
                </button>
              </div>

              {draft.vibecoded.customAiTools.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {draft.vibecoded.customAiTools.map((toolName) => (
                    <span
                      key={toolName}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#02031A] text-white text-[12.5px] font-medium"
                    >
                      <span>{toolName}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomAiTool(toolName)}
                        aria-label={`Remove ${toolName}`}
                        className="text-white/75 hover:text-white bg-transparent border-0 p-0 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {errors.aiTools && (
          <p role="alert" className="mt-2 text-[12.5px] font-medium text-[#991B1B]">
            {errors.aiTools}
          </p>
        )}
      </div>
    </section>
  );

  return (
    <div className="text-left">
      <div className="mb-6">
        <h2 className="font-display text-[36px] sm:text-[44px] font-medium leading-[0.98] tracking-[-0.015em] text-[#02031A]">
          Website information
        </h2>
        <p className="mt-2 text-[15px] sm:text-[16px] text-[#02031A]/75 leading-[1.45]">
          {category === 'Normal' &&
            'Provide the core title, live URL, tags, and summary for your submission.'}
          {category === 'Connect' &&
            'Add collaboration roles, skills, and contact info first, followed by your website details.'}
          {category === 'Test' &&
            'Share testing scope, safe rules, disclosure policy, and authorization confirmation above your website info.'}
          {category === 'Vibecoded' &&
            'Enter your website overview along with the prompts, model, tech stack, and AI tools used.'}
        </p>
      </div>

      {showContactFirst && renderContactOrTestSection()}
      {renderCommonFields()}
      {category === 'Vibecoded' && renderVibecodedSection()}
    </div>
  );
}

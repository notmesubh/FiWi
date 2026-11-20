import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowLeft, ArrowRight, Eye, Loader2, Save, Send} from 'lucide-react';
import StepOneCategory from './StepOneCategory';
import StepTwoWebsiteInfo from './StepTwoWebsiteInfo';
import StepThreeMedia from './StepThreeMedia';
import StepProgressHeader from './StepProgressHeader';
import {
  ReviewSubmissionView,
  SubmissionSuccessView,
} from './ReviewAndSuccessView';
import {
  FIWI_TAP,
  FIWI_TRANSITION_FAST,
  fiwiFadeSlideVariants,
  fiwiPanelRevealVariants,
} from '../../lib/motion';
import {
  createInitialSubmissionDraft,
  MAX_GALLERY_IMAGES,
  submissionRecordToDraft,
  validateStepOne,
  validateStepThree,
  validateStepTwo,
  type MediaAsset,
  type SubmitCategoryId,
  type SubmitStep,
  type SubmissionDraft,
  type ValidationErrors,
} from './submitData';
import {fiwiApi, uploadMediaFile, type SubmissionPayload} from '../../lib/api';
import {useFiwiStore} from '../../stores/useFiwiStore';
import type {WebsiteSubmissionRecord} from '../../types/fiwi';

interface SubmitWebsiteFlowProps {
  initialCategory?: SubmitCategoryId | null;
  editingSubmission?: WebsiteSubmissionRecord | null;
  userHandle?: string;
  userName?: string;
  onCompleted: () => Promise<void> | void;
  onViewMySubmissions: () => void;
  onExit: () => void;
}

export default function SubmitWebsiteFlow({
  initialCategory = null,
  editingSubmission = null,
  userHandle,
  userName,
  onCompleted,
  onViewMySubmissions,
  onExit,
}: SubmitWebsiteFlowProps) {
  const pushToast = useFiwiStore((s) => s.pushToast);

  const [step, setStep] = useState<SubmitStep>(1);
  const [draft, setDraft] = useState<SubmissionDraft>(() =>
    editingSubmission
      ? submissionRecordToDraft(editingSubmission)
      : createInitialSubmissionDraft(initialCategory),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAsDraftSuccess, setSavedAsDraftSuccess] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const cardTopRef = useRef<HTMLDivElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (editingSubmission) {
      setDraft(submissionRecordToDraft(editingSubmission));
      setStep(1);
    } else {
      setDraft(createInitialSubmissionDraft(initialCategory));
    }
  }, [editingSubmission, initialCategory]);

  const revokeUrlSafe = (url: string | undefined | null) => {
    if (!url) return;
    if (objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  };

  const revokeAllMediaUrls = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  };

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const scrollCardIntoView = () => {
    cardTopRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const handleSelectCategory = (category: SubmitCategoryId) => {
    setDraft((prev) => ({
      ...prev,
      category,
      subCategory: prev.category === category ? prev.subCategory : '',
      customSubCategory: prev.category === category ? prev.customSubCategory : '',
    }));
    setErrors((prev) => {
      const next = {...prev};
      delete next.category;
      delete next.subCategory;
      delete next.customSubCategory;
      return next;
    });
  };

  const handleSelectSubCategory = (subCategory: string) => {
    setDraft((prev) => ({
      ...prev,
      subCategory,
      customSubCategory: subCategory === 'Other' ? prev.customSubCategory : '',
    }));
    setErrors((prev) => {
      const next = {...prev};
      delete next.subCategory;
      delete next.customSubCategory;
      return next;
    });
  };

  const handleSetHeroMedia = async (file: File) => {
    const localPreviewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(localPreviewUrl);
    const kind: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
    const mediaId = `hero_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    setUploadError(null);
    setUploadingHero(true);

    setDraft((prev) => {
      revokeUrlSafe(prev.media.hero?.previewUrl);
      return {
        ...prev,
        media: {
          ...prev.media,
          hero: {
            id: mediaId,
            fileName: file.name,
            fileSizeBytes: file.size,
            mimeType: file.type,
            kind,
            previewUrl: localPreviewUrl,
          },
        },
      };
    });

    try {
      const uploaded = await uploadMediaFile({file, purpose: 'website_hero'});
      if (!uploaded.publicUrl) {
        throw new Error('Upload succeeded without a public storage URL.');
      }
      setDraft((prev) => {
        if (prev.media.hero?.id !== mediaId) return prev;
        return {
          ...prev,
          media: {
            ...prev.media,
            hero: {
              ...prev.media.hero,
              mimeType: uploaded.mimeType,
              fileSizeBytes: uploaded.fileSizeBytes,
              storagePath: uploaded.path,
              publicUrl: uploaded.publicUrl,
              previewUrl: uploaded.publicUrl!,
            },
          },
        };
      });
      revokeUrlSafe(localPreviewUrl);
      setErrors((prev) => {
        const next = {...prev};
        delete next.heroMedia;
        return next;
      });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Unable to upload hero media to FiWi Storage.',
      );
      setDraft((prev) => ({
        ...prev,
        media: {
          ...prev.media,
          hero: prev.media.hero?.id === mediaId ? null : prev.media.hero,
        },
      }));
      revokeUrlSafe(localPreviewUrl);
    } finally {
      setUploadingHero(false);
    }
  };

  const handleRemoveHeroMedia = () => {
    setUploadError(null);
    setDraft((prev) => {
      revokeUrlSafe(prev.media.hero?.previewUrl);
      return {
        ...prev,
        media: {
          ...prev.media,
          hero: null,
        },
      };
    });
  };

  const handleAddGalleryImages = async (files: File[]) => {
    const remaining = Math.max(0, MAX_GALLERY_IMAGES - draft.media.gallery.length);
    const picked = files.slice(0, remaining);
    if (picked.length === 0) return;

    setUploadError(null);
    setUploadingGallery(true);
    try {
      const uploadedAssets: MediaAsset[] = [];
      for (const file of picked) {
        const uploaded = await uploadMediaFile({file, purpose: 'website_gallery'});
        if (uploaded.publicUrl) {
          uploadedAssets.push({
            id: `gallery_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            fileName: file.name,
            fileSizeBytes: uploaded.fileSizeBytes,
            mimeType: uploaded.mimeType,
            kind: 'image',
            previewUrl: uploaded.publicUrl,
            publicUrl: uploaded.publicUrl,
            storagePath: uploaded.path,
          });
        }
      }
      if (uploadedAssets.length > 0) {
        setDraft((prev) => ({
          ...prev,
          media: {
            ...prev.media,
            gallery: [...prev.media.gallery, ...uploadedAssets].slice(0, MAX_GALLERY_IMAGES),
          },
        }));
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Unable to upload gallery images to FiWi Storage.',
      );
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (id: string) => {
    setDraft((prev) => {
      const target = prev.media.gallery.find((item) => item.id === id);
      revokeUrlSafe(target?.previewUrl);
      return {
        ...prev,
        media: {
          ...prev.media,
          gallery: prev.media.gallery.filter((item) => item.id !== id),
        },
      };
    });
  };

  const handleReorderGalleryImage = (id: string, direction: 'prev' | 'next') => {
    setDraft((prev) => {
      const list = [...prev.media.gallery];
      const idx = list.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'prev' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const [moved] = list.splice(idx, 1);
      list.splice(targetIdx, 0, moved);
      return {
        ...prev,
        media: {
          ...prev.media,
          gallery: list,
        },
      };
    });
  };

  const handleContinue = () => {
    setSubmitError(null);
    if (step === 1) {
      const stepErrors = validateStepOne(draft);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setErrors({});
      setStep(2);
      scrollCardIntoView();
      return;
    }

    if (step === 2) {
      const stepErrors = validateStepTwo(draft);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setErrors({});
      setStep(3);
      scrollCardIntoView();
      return;
    }

    if (step === 3) {
      const stepErrors = validateStepThree(draft);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
      setErrors({});
      setStep('review');
      scrollCardIntoView();
    }
  };

  const handleBack = () => {
    setErrors({});
    setSubmitError(null);
    if (step === 1) {
      onExit();
      return;
    }
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 'review') {
      setStep(3);
    }
    scrollCardIntoView();
  };

  const handleJumpToStep = (targetStep: 1 | 2 | 3) => {
    setErrors({});
    setSubmitError(null);
    setStep(targetStep);
    scrollCardIntoView();
  };

  const buildPayload = (status: 'draft' | 'pending'): SubmissionPayload => {
    const category = draft.category ?? 'Normal';
    const subCategory =
      draft.subCategory === 'Other' ? 'Other' : draft.subCategory || 'Business & SaaS';

    return {
      status,
      category,
      subCategory,
      customSubCategory: draft.customSubCategory.trim() || undefined,
      title: draft.common.name.trim(),
      heroTitle: draft.common.heroTitle.trim() || undefined,
      url: draft.common.url.trim(),
      description: draft.common.description.trim(),
      tags: draft.tags,
      thumbnailUrl: draft.media.hero?.publicUrl ?? null,
      galleryUrls: draft.media.gallery
        .map((g) => g.publicUrl)
        .filter((u): u is string => Boolean(u)),
      mediaMeta: {
        hero: draft.media.hero
          ? {
              id: draft.media.hero.id,
              fileName: draft.media.hero.fileName,
              fileSizeBytes: draft.media.hero.fileSizeBytes,
              mimeType: draft.media.hero.mimeType,
              kind: draft.media.hero.kind,
              storagePath: draft.media.hero.storagePath,
            }
          : null,
        gallery: draft.media.gallery.map((g) => ({
          id: g.id,
          fileName: g.fileName,
          fileSizeBytes: g.fileSizeBytes,
          mimeType: g.mimeType,
          kind: g.kind,
          storagePath: g.storagePath,
        })),
      },
      vibecoded:
        category === 'Vibecoded'
          ? {
              originalPrompt: draft.vibecoded.originalPrompt.trim(),
              developmentSteps: draft.vibecoded.developmentSteps.trim(),
              aiTools: draft.vibecoded.aiTools,
              customAiTools: draft.vibecoded.customAiTools,
              techStack: draft.vibecoded.techStack,
              customTechStack: draft.vibecoded.customTechStack,
              aiModel: draft.vibecoded.aiModel.trim() || undefined,
              extraInfo: draft.vibecoded.extraInfo.trim() || undefined,
            }
          : undefined,
      connect:
        category === 'Connect'
          ? {
              collaborationType: draft.contact.collaborationType,
              contactName: draft.contact.name.trim(),
              contactEmail: draft.contact.email.trim(),
              contactLink: draft.contact.link.trim() || undefined,
              reasonForContact: draft.contact.primaryTopic.trim(),
              lookingFor: draft.contact.lookingFor.trim(),
              requiredRoles: draft.contact.requiredRoles,
              skills: draft.contact.skills,
              isOpen: true,
            }
          : undefined,
      test:
        category === 'Test'
          ? {
              authorizedTargetUrl:
                draft.contact.authorizedTargetUrl.trim() || draft.common.url.trim(),
              contactName: draft.contact.name.trim(),
              contactEmail: draft.contact.email.trim(),
              contactLink: draft.contact.link.trim() || undefined,
              testingScope: draft.contact.primaryTopic.trim(),
              lookingFor: draft.contact.lookingFor.trim(),
              testingRules: draft.contact.testingRules.trim(),
              disclosurePolicy: draft.contact.disclosurePolicy.trim(),
              budgetUsd: Number(draft.contact.testBudget || 0),
              deadline: draft.contact.deadline.trim() || null,
              ownerAuthorized: draft.contact.testAuthorized,
              authorizationProofPath: draft.contact.authorizationProof?.path ?? null,
              isOpen: true,
            }
          : undefined,
    };
  };

  const handlePersistSubmission = async (status: 'draft' | 'pending') => {
    if (isSubmitting || uploadingHero || uploadingGallery) return;
    setSubmitError(null);

    if (status === 'draft') {
      if (!draft.category) {
        setSubmitError('Choose a category before saving a draft.');
        return;
      }
      if (!draft.common.name.trim() || !draft.common.url.trim()) {
        setSubmitError('Enter at least a Website Name and Website URL in Step 2 to save a draft.');
        return;
      }
    } else {
      const s1 = validateStepOne(draft);
      const s2 = validateStepTwo(draft);
      const s3 = validateStepThree(draft);
      if (Object.keys(s1).length + Object.keys(s2).length + Object.keys(s3).length > 0) {
        setErrors({...s1, ...s2, ...s3});
        setSubmitError('Complete all required fields before submitting for moderation.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload(status);
      const result = draft.submissionId
        ? await fiwiApi.updateSubmission(draft.submissionId, payload)
        : await fiwiApi.createSubmission(payload);

      setDraft((prev) => ({...prev, submissionId: result.submission.id}));
      await onCompleted();
      setSavedAsDraftSuccess(status === 'draft');
      setErrors({});
      setStep('success');
      scrollCardIntoView();
      pushToast({
        title: status === 'draft' ? 'Draft saved' : 'Submission sent for moderation',
        tone: 'success',
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to save website submission.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAnother = () => {
    revokeAllMediaUrls();
    setDraft(createInitialSubmissionDraft(null));
    setErrors({});
    setSubmitError(null);
    setSavedAsDraftSuccess(false);
    setStep(1);
    scrollCardIntoView();
  };

  const handleReturnToFiwi = () => {
    revokeAllMediaUrls();
    onExit();
  };

  const hasValidationErrors = Object.keys(errors).length > 0;
  const canQuickSaveDraft = Boolean(
    draft.category && draft.common.name.trim() && draft.common.url.trim() && step !== 1,
  );

  return (
    <div
      ref={cardTopRef}
      className="relative z-[2] mt-[52px] mb-24 w-full max-w-[860px] flex flex-col items-center text-center scroll-mt-[84px]"
    >
      <div className="glass fiwi-eyebrow mono inline-flex flex-wrap justify-center gap-[14px] py-[8px] px-[18px] rounded-none text-[12px] tracking-[0.08em] uppercase text-[#02031A]">
        <span>: Discover</span>
        <span>: Explore</span>
        <span>: Connect</span>
        <span>: Test :</span>
      </div>

      <h1 className="font-display mt-[20px] leading-[0.95] font-medium tracking-[-0.01em] text-[52px] sm:text-[72px] lg:text-[84px]">
        {draft.submissionId ? 'Edit submission.' : 'Submit a website.'}
      </h1>

      <div className="font-serif-italic relative z-1 mt-[6px] text-[38px] sm:text-[50px] leading-[1.1] tracking-[-0.01em]">
        Share it with FiWi.
      </div>

      {userName && userHandle && (
        <p className="mt-[12px] max-w-[540px] text-[15px] sm:text-[16px] font-medium leading-[1.45] text-white/95">
          Signed in as {userName} · {userHandle}
        </p>
      )}

      <div className="fiwi-submit-glass w-full mt-7 p-5 sm:p-8 text-[#02031A]">
        <StepProgressHeader currentStep={step} onJumpToStep={handleJumpToStep} />

        <AnimatePresence initial={false}>
          {(hasValidationErrors || submitError) && (
            <motion.div
              key="submit-validation-alert"
              variants={fiwiPanelRevealVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              role="alert"
              className="mb-5 border border-[#B91C1C]/35 bg-white px-4 py-3 text-left text-[13px] font-medium text-[#991B1B]"
            >
              {submitError ?? 'Please resolve the highlighted fields below before continuing.'}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={String(step)}
            variants={fiwiFadeSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={FIWI_TRANSITION_FAST}
          >
            {step === 1 && (
              <StepOneCategory
                selectedCategory={draft.category}
                selectedSubCategory={draft.subCategory}
                customSubCategory={draft.customSubCategory}
                errors={errors}
                onSelectCategory={handleSelectCategory}
                onSelectSubCategory={handleSelectSubCategory}
                onCustomSubCategoryChange={(val) => {
                  setDraft((prev) => ({...prev, customSubCategory: val}));
                  setErrors((prev) => {
                    const next = {...prev};
                    delete next.customSubCategory;
                    return next;
                  });
                }}
              />
            )}

            {step === 2 && (
              <StepTwoWebsiteInfo
                draft={draft}
                errors={errors}
                onUpdateCommon={(patch) =>
                  setDraft((prev) => ({
                    ...prev,
                    common: {...prev.common, ...patch},
                  }))
                }
                onUpdateTags={(tags) => setDraft((prev) => ({...prev, tags}))}
                onUpdateContact={(patch) =>
                  setDraft((prev) => ({
                    ...prev,
                    contact: {...prev.contact, ...patch},
                  }))
                }
                onUpdateVibecoded={(patch) =>
                  setDraft((prev) => ({
                    ...prev,
                    vibecoded: {...prev.vibecoded, ...patch},
                  }))
                }
              />
            )}

            {step === 3 && (
              <StepThreeMedia
                heroMedia={draft.media.hero}
                galleryMedia={draft.media.gallery}
                errors={errors}
                uploadingHero={uploadingHero}
                uploadingGallery={uploadingGallery}
                uploadError={uploadError}
                onSetHeroMedia={handleSetHeroMedia}
                onRemoveHeroMedia={handleRemoveHeroMedia}
                onAddGalleryImages={handleAddGalleryImages}
                onRemoveGalleryImage={handleRemoveGalleryImage}
                onReorderGalleryImage={handleReorderGalleryImage}
              />
            )}

            {step === 'review' && (
              <ReviewSubmissionView
                draft={draft}
                onEditStep={handleJumpToStep}
              />
            )}

            {step === 'success' && (
              <SubmissionSuccessView
                websiteName={draft.common.name}
                categoryName={draft.category ?? 'Website'}
                isDraft={savedAsDraftSuccess}
                onReturnToFiwi={handleReturnToFiwi}
                onViewMySubmissions={onViewMySubmissions}
                onStartAnother={handleStartAnother}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Wizard Footer Navigation */}
        {step !== 'success' && (
          <div className="mt-8 pt-6 border-t border-[#02031A]/12 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <motion.button
              type="button"
              disabled={isSubmitting}
              whileTap={FIWI_TAP}
              onClick={handleBack}
              className="btn h-[46px] px-6 btn-square border border-[#02031A]/20 bg-white/80 text-[#02031A] hover:bg-white inline-flex items-center justify-center gap-2 text-[15px] disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{step === 1 ? 'Cancel' : 'Back'}</span>
            </motion.button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {canQuickSaveDraft && (
                <motion.button
                  type="button"
                  disabled={isSubmitting || uploadingHero || uploadingGallery}
                  whileTap={FIWI_TAP}
                  onClick={() => void handlePersistSubmission('draft')}
                  className="btn h-[48px] px-5 btn-square border border-[#02031A]/20 bg-white/85 text-[#02031A] hover:bg-white inline-flex items-center justify-center gap-2 text-[14px] disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </motion.button>
              )}

              {step === 'review' ? (
                <motion.button
                  type="button"
                  disabled={isSubmitting || uploadingHero || uploadingGallery}
                  whileTap={FIWI_TAP}
                  onClick={() => void handlePersistSubmission('pending')}
                  className="btn h-[48px] px-8 bg-[#02031A] text-white hover:bg-[#1020F5] inline-flex items-center justify-center gap-2 text-[16px] disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Website</span>
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  disabled={uploadingHero || uploadingGallery}
                  whileTap={FIWI_TAP}
                  onClick={handleContinue}
                  className="btn h-[48px] px-8 bg-[#02031A] text-white hover:bg-[#1020F5] inline-flex items-center justify-center gap-2 text-[16px] disabled:opacity-60"
                >
                  {step === 3 ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Review Submission</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

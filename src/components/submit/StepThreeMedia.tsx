import {useRef, useState, type DragEvent} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Film,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  formatFileSize,
  MAX_GALLERY_IMAGES,
  type MediaAsset,
  type ValidationErrors,
} from './submitData';
import {
  FIWI_TRANSITION_FAST,
  fiwiFadeSlideVariants,
  fiwiPanelRevealVariants,
} from '../../lib/motion';

interface StepThreeMediaProps {
  heroMedia: MediaAsset | null;
  galleryMedia: MediaAsset[];
  errors: ValidationErrors;
  uploadingHero?: boolean;
  uploadingGallery?: boolean;
  uploadError?: string | null;
  onSetHeroMedia: (file: File) => void;
  onRemoveHeroMedia: () => void;
  onAddGalleryImages: (files: File[]) => void;
  onRemoveGalleryImage: (id: string) => void;
  onReorderGalleryImage: (id: string, direction: 'prev' | 'next') => void;
}

export default function StepThreeMedia({
  heroMedia,
  galleryMedia,
  errors,
  uploadingHero = false,
  uploadingGallery = false,
  uploadError = null,
  onSetHeroMedia,
  onRemoveHeroMedia,
  onAddGalleryImages,
  onRemoveGalleryImage,
  onReorderGalleryImage,
}: StepThreeMediaProps) {
  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [isHeroDragging, setIsHeroDragging] = useState(false);
  const [isGalleryDragging, setIsGalleryDragging] = useState(false);
  const [localMediaError, setLocalMediaError] = useState<string | null>(null);

  const handleHeroFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setLocalMediaError('Primary hero media must be an image (PNG, JPG, WebP) or video (MP4, WebM, MOV).');
      return;
    }
    setLocalMediaError(null);
    onSetHeroMedia(file);
  };

  const handleGalleryFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = MAX_GALLERY_IMAGES - galleryMedia.length;
    if (remainingSlots <= 0) {
      setLocalMediaError(`Gallery limit of ${MAX_GALLERY_IMAGES} images reached.`);
      return;
    }

    const picked = Array.from(files);
    const validImages = picked.filter((file) => file.type.startsWith('image/'));
    const rejectedCount = picked.length - validImages.length;

    if (rejectedCount > 0) {
      setLocalMediaError(
        'Only image files (PNG, JPG, WebP, GIF) are allowed in the additional preview gallery.',
      );
    } else if (validImages.length > remainingSlots) {
      setLocalMediaError(
        `Added the first ${remainingSlots} image${remainingSlots === 1 ? '' : 's'} to stay within the ${MAX_GALLERY_IMAGES}-image maximum.`,
      );
    } else {
      setLocalMediaError(null);
    }

    if (validImages.length > 0) {
      onAddGalleryImages(validImages.slice(0, remainingSlots));
    }
  };

  const handleHeroDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHeroDragging(false);
    handleHeroFiles(e.dataTransfer.files);
  };

  const handleGalleryDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsGalleryDragging(false);
    handleGalleryFiles(e.dataTransfer.files);
  };

  const canAddMoreGallery = galleryMedia.length < MAX_GALLERY_IMAGES;
  const activeError = uploadError ?? localMediaError;

  return (
    <div className="text-left">
      <div>
        <h2 className="font-display text-[36px] sm:text-[44px] font-medium leading-[0.98] tracking-[-0.015em] text-[#02031A]">
          Showcase your website
        </h2>
        <p className="mt-2 text-[15px] sm:text-[16px] text-[#02031A]/75 leading-[1.45]">
          Upload visuals directly to FiWi Storage so reviewers and visitors see your live preview.
        </p>
      </div>

      <AnimatePresence initial={false}>
        {activeError && (
          <motion.div
            key="local-media-error"
            variants={fiwiPanelRevealVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="alert"
            className="mt-4 border border-[#B91C1C]/35 bg-white px-4 py-2.5 text-[13px] font-medium text-[#991B1B]"
          >
            {activeError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Hero Media (16:9 Mandatory) */}
      <section aria-label="Primary hero media" className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/80 font-semibold">
              Primary Hero Media * <span className="text-[#1020F5]">· Becomes primary FiWi thumbnail</span>
            </div>
            <p className="text-[12.5px] text-[#02031A]/65 mt-0.5">
              16:9 recommended aspect ratio. Images auto-optimize to WebP before upload.
            </p>
          </div>
          <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/60 tabular-nums inline-flex items-center gap-1.5">
            {uploadingHero && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1020F5]" />}
            <span>{uploadingHero ? 'Uploading...' : '16:9 Required'}</span>
          </span>
        </div>

        <input
          ref={heroInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            handleHeroFiles(e.target.files);
            e.target.value = '';
          }}
          className="sr-only"
          aria-label="Upload primary hero image or video"
        />

        <AnimatePresence mode="wait" initial={false}>
          {!heroMedia ? (
            <motion.div
              key="hero-dropzone"
              variants={fiwiFadeSlideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={FIWI_TRANSITION_FAST}
              role="button"
              tabIndex={0}
              onClick={() => !uploadingHero && heroInputRef.current?.click()}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !uploadingHero) {
                  e.preventDefault();
                  heroInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsHeroDragging(true);
              }}
              onDragLeave={() => setIsHeroDragging(false)}
              onDrop={handleHeroDrop}
              className={`aspect-video w-full border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1020F5] ${
                isHeroDragging
                  ? 'border-[#1020F5] bg-white scale-[0.995]'
                  : 'border-[#02031A]/25 bg-white/75 hover:bg-white hover:border-[#1020F5]/60'
              }`}
            >
              <span className="w-12 h-12 rounded-full bg-[#02031A] text-white flex items-center justify-center mb-3.5 shadow-sm">
                {uploadingHero ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              </span>
              <div className="text-[15px] sm:text-[16px] font-semibold text-[#02031A]">
                {uploadingHero
                  ? 'Uploading hero media to FiWi Storage...'
                  : 'Drag and drop your primary 16:9 hero media here'}
              </div>
              <p className="mt-1 text-[13px] text-[#02031A]/65 max-w-[420px]">
                Supports high-resolution screenshots (PNG, JPG, WebP) or walkthrough clips (MP4, WebM, MOV).
              </p>
              <span className="mt-4 btn h-[38px] px-5 btn-square bg-[#02031A] text-white text-[13px]">
                {uploadingHero ? 'Uploading...' : 'Choose hero file'}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key={heroMedia.id}
              variants={fiwiFadeSlideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={FIWI_TRANSITION_FAST}
              className="bg-white border border-[#02031A]/14 p-3 sm:p-4"
            >
              <div className="relative aspect-video w-full bg-[#0A0C24] overflow-hidden border border-[#02031A]/10">
                {heroMedia.kind === 'video' ? (
                  <video
                    src={heroMedia.previewUrl}
                    controls
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={heroMedia.previewUrl}
                    alt={heroMedia.fileName}
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute top-3 left-3 bg-[#02031A]/90 text-white px-2.5 py-1 mono text-[10px] uppercase tracking-[0.08em] flex items-center gap-1.5">
                  {heroMedia.kind === 'video' && <Film className="w-3 h-3" />}
                  <span>
                    {uploadingHero ? 'Uploading to Storage...' : 'Primary FiWi thumbnail'}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-[#02031A] truncate">
                    {heroMedia.fileName}
                  </div>
                  <div className="mono text-[11px] text-[#02031A]/60 tabular-nums mt-0.5">
                    {heroMedia.kind.toUpperCase()}
                    {heroMedia.fileSizeBytes > 0 ? ` · ${formatFileSize(heroMedia.fileSizeBytes)}` : ''}
                    {heroMedia.publicUrl ? ' · Stored' : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={uploadingHero}
                    onClick={() => heroInputRef.current?.click()}
                    className="btn h-[36px] px-4 btn-square border border-[#02031A]/20 bg-white text-[#02031A] hover:bg-[#F4F6FA] text-[12px] inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    disabled={uploadingHero}
                    onClick={onRemoveHeroMedia}
                    aria-label="Remove primary hero media"
                    className="btn h-[36px] px-3.5 btn-square border border-[#B91C1C]/25 bg-white text-[#991B1B] hover:bg-[#FEF2F2] text-[12px] inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {errors.heroMedia && (
          <p role="alert" className="mt-2 text-[13px] font-medium text-[#991B1B]">
            {errors.heroMedia}
          </p>
        )}
      </section>

      {/* Additional Preview Images (Optional, Up to 15 Images Only) */}
      <section aria-label="Additional preview images" className="mt-8 pt-7 border-t border-[#02031A]/12">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/80 font-semibold">
              Additional Preview Images <span className="text-[#02031A]/50">(Optional)</span>
            </div>
            <p className="text-[12.5px] text-[#02031A]/65 mt-0.5">
              Images only (PNG, JPG, WebP, GIF). Reorder to arrange how they appear in your showcase.
            </p>
          </div>
          <span className="mono text-[12px] font-semibold tabular-nums text-[#02031A] inline-flex items-center gap-1.5">
            {uploadingGallery && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1020F5]" />}
            <span>
              {galleryMedia.length}/{MAX_GALLERY_IMAGES}
            </span>
          </span>
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            handleGalleryFiles(e.target.files);
            e.target.value = '';
          }}
          className="sr-only"
          aria-label="Upload additional preview images"
        />

        {galleryMedia.length === 0 ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => !uploadingGallery && galleryInputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !uploadingGallery) {
                e.preventDefault();
                galleryInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsGalleryDragging(true);
            }}
            onDragLeave={() => setIsGalleryDragging(false)}
            onDrop={handleGalleryDrop}
            className={`w-full py-8 px-5 border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1020F5] ${
              isGalleryDragging
                ? 'border-[#1020F5] bg-white'
                : 'border-[#02031A]/20 bg-white/65 hover:bg-white hover:border-[#02031A]/35'
            }`}
          >
            {uploadingGallery ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#1020F5] mb-2" />
            ) : (
              <ImagePlus className="w-6 h-6 text-[#02031A]/75 mb-2" />
            )}
            <div className="text-[14px] font-semibold text-[#02031A]">
              {uploadingGallery
                ? 'Uploading gallery images...'
                : `Drop up to ${MAX_GALLERY_IMAGES} screenshots or click to browse`}
            </div>
            <p className="mt-1 text-[12.5px] text-[#02031A]/60">
              Show extra flows, responsive views, or key interface moments.
            </p>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (canAddMoreGallery) setIsGalleryDragging(true);
            }}
            onDragLeave={() => setIsGalleryDragging(false)}
            onDrop={handleGalleryDrop}
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-2 transition-colors ${
              isGalleryDragging ? 'bg-white/60 outline-2 outline-dashed outline-[#1020F5]' : ''
            }`}
          >
            {galleryMedia.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{opacity: 0, scale: 0.96}}
                animate={{opacity: 1, scale: 1}}
                transition={FIWI_TRANSITION_FAST}
                className="group bg-white border border-[#02031A]/12 p-1.5 flex flex-col"
              >
                <div className="relative aspect-[16/10] w-full bg-[#F4F6FA] overflow-hidden">
                  <img
                    src={img.previewUrl}
                    alt={img.fileName}
                    className="w-full h-full object-cover"
                  />

                  <span className="absolute top-1.5 left-1.5 bg-[#02031A]/85 text-white px-1.5 py-0.5 mono text-[9.5px] tabular-nums">
                    0{index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveGalleryImage(img.id)}
                    aria-label={`Remove ${img.fileName}`}
                    title="Remove image"
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/95 hover:bg-[#991B1B] text-[#02031A] hover:text-white border border-[#02031A]/15 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5">
                  <span className="text-[11px] text-[#02031A]/70 truncate">
                    {img.fileName}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onReorderGalleryImage(img.id, 'prev')}
                      aria-label={`Move ${img.fileName} earlier`}
                      title="Move earlier"
                      className="w-6 h-6 border border-[#02031A]/12 bg-[#F8FAFC] hover:bg-[#02031A] hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === galleryMedia.length - 1}
                      onClick={() => onReorderGalleryImage(img.id, 'next')}
                      aria-label={`Move ${img.fileName} later`}
                      title="Move later"
                      className="w-6 h-6 border border-[#02031A]/12 bg-[#F8FAFC] hover:bg-[#02031A] hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {canAddMoreGallery && (
              <button
                type="button"
                disabled={uploadingGallery}
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-[16/10] min-h-[104px] border border-dashed border-[#02031A]/25 bg-white/70 hover:bg-white hover:border-[#1020F5] flex flex-col items-center justify-center gap-1.5 p-3 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1020F5]"
              >
                {uploadingGallery ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#1020F5]" />
                ) : (
                  <ImagePlus className="w-5 h-5 text-[#02031A]/75" />
                )}
                <span className="text-[12px] font-semibold text-[#02031A]">
                  {uploadingGallery ? 'Uploading...' : 'Add more'}
                </span>
                <span className="mono text-[10px] tabular-nums text-[#02031A]/55">
                  {MAX_GALLERY_IMAGES - galleryMedia.length} left
                </span>
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

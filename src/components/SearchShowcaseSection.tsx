import {useEffect, useMemo, useRef, useState} from 'react';
import {motion} from 'motion/react';
import {ArrowRight, ArrowUpRight, Globe, RotateCw, Search, X} from 'lucide-react';
import type {SubmittedSite} from '../types/fiwi';
import {FIWI_TRANSITION_REVEAL, FIWI_VIEWPORT} from '../lib/motion';

const WEBSITE_RECOMMENDATIONS: string[] = [
  'Interactive 3D agency websites',
  'Minimal AI product launch sites',
  'Design studio portfolios',
  'Developer tools & open-source sites',
  'Startups looking for collaborators',
  'Authorized security testing targets',
];

interface GallerySlot {
  id: string;
  wide: boolean;
  site?: SubmittedSite;
}

const DEFAULT_CARD_WIDTHS = [true, false, true, false, true, false];

interface SearchShowcaseSectionProps {
  submittedSites: SubmittedSite[];
  externalQuery?: {text: string; nonce: number} | null;
  onSelectSite?: (site: SubmittedSite) => void;
  onSearchLibrary?: (query: string) => void;
}

export default function SearchShowcaseSection({
  submittedSites,
  externalQuery,
  onSelectSite,
  onSearchLibrary,
}: SearchShowcaseSectionProps) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {rootMargin: '120px'},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!externalQuery) return;
    setUserQuery(externalQuery.text);
    inputRef.current?.focus();
  }, [externalQuery]);

  const isUserTyping = isFocused || userQuery.length > 0;

  // Typewriter cycling through website gallery recommendations when visible & user is not actively typing
  useEffect(() => {
    if (isUserTyping || !isVisible) return;

    const currentTarget = WEBSITE_RECOMMENDATIONS[promptIndex];
    let timeoutMs = isDeleting ? 28 : 52;

    if (!isDeleting && typedText === currentTarget) {
      timeoutMs = 1900;
    } else if (isDeleting && typedText === '') {
      timeoutMs = 260;
    }

    const timer = window.setTimeout(() => {
      if (!isDeleting && typedText === currentTarget) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && typedText === '') {
        setIsDeleting(false);
        setPromptIndex((prev) => (prev + 1) % WEBSITE_RECOMMENDATIONS.length);
        return;
      }

      if (isDeleting) {
        setTypedText(currentTarget.slice(0, typedText.length - 1));
      } else {
        setTypedText(currentTarget.slice(0, typedText.length + 1));
      }
    }, timeoutMs);

    return () => window.clearTimeout(timer);
  }, [promptIndex, typedText, isDeleting, isUserTyping, isVisible]);

  const trimmedQuery = userQuery.trim().toLowerCase();
  const matchingSubmitted = useMemo(
    () =>
      trimmedQuery
        ? submittedSites.filter((site) => {
            const haystack = [
              site.title,
              site.category,
              site.subCategory,
              site.customSubCategory,
              site.heroTitle,
              site.description,
              ...(site.vibecoded?.aiTools ?? []),
              ...(site.vibecoded?.customAiTools ?? []),
              ...(site.vibecoded?.techStack ?? []),
              ...(site.vibecoded?.customTechStack ?? []),
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            return haystack.includes(trimmedQuery);
          })
        : submittedSites,
    [submittedSites, trimmedQuery],
  );

  const hasActiveNoMatch = Boolean(trimmedQuery && matchingSubmitted.length === 0);

  const baseSlots: GallerySlot[] = useMemo(
    () =>
      DEFAULT_CARD_WIDTHS.map((wide, idx) => ({
        id: `slot-${idx}`,
        wide,
        site: matchingSubmitted[idx],
      })),
    [matchingSubmitted],
  );

  const renderCard = (slot: GallerySlot, keyPrefix: string, slotIndex: number) => {
    const widthClass = slot.wide
      ? 'w-[360px] sm:w-[520px]'
      : 'w-[250px] sm:w-[320px]';

    if (slot.site) {
      const siteItem = slot.site;
      const subLabel = siteItem.subCategory || siteItem.customSubCategory;
      const heroThumb =
        siteItem.media?.hero?.previewUrl ||
        siteItem.media?.hero?.publicUrl ||
        siteItem.thumbnailUrl ||
        siteItem.screenshotUrl ||
        null;
      const domain = siteItem.url
        ? siteItem.url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0]
        : '';

      return (
        <div
          key={`${keyPrefix}-${slot.id}`}
          role={onSelectSite ? 'button' : undefined}
          tabIndex={onSelectSite ? 0 : undefined}
          onClick={() => onSelectSite?.(siteItem)}
          onKeyDown={(e) => {
            if (onSelectSite && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onSelectSite(siteItem);
            }
          }}
          className={`group ${widthClass} shrink-0 flex flex-col text-left transition-transform duration-200 ${
            onSelectSite ? 'cursor-pointer' : ''
          }`}
        >
          {/* Thumbnail box: ONLY thumbnail visible */}
          <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#0A0D28]/30 dark:bg-white/[0.04] border border-[#02031A]/12 dark:border-white/14 group-hover:border-[#02031A]/30 dark:group-hover:border-white/30 group-hover:shadow-lg transition-all duration-300 relative">
            {heroThumb ? (
              <img
                src={heroThumb}
                alt={siteItem.title}
                loading="lazy"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1020F5]/5 to-transparent text-[#02031A]/40 dark:text-white/30">
                <Globe className="w-8 h-8 mb-2 stroke-[1.5]" />
                <span className="mono text-[11px] truncate max-w-[80%] font-medium">
                  {domain || 'fiwi.net'}
                </span>
              </div>
            )}
          </div>

          {/* Details BELOW the card, not on it */}
          <div className="mt-2.5 flex items-start justify-between gap-2 px-1">
            <div className="min-w-0 flex-1">
              <div className="font-display text-[18px] sm:text-[20px] font-semibold text-[#02031A] dark:text-white truncate group-hover:text-[#1020F5] dark:group-hover:text-[#60A5FA] transition-colors leading-tight">
                {siteItem.title}
              </div>
              <div className="mono text-[11px] uppercase tracking-[0.06em] text-[#02031A]/60 dark:text-white/50 truncate mt-1">
                {subLabel ? `${siteItem.category} · ${subLabel}` : siteItem.category} · {siteItem.authorHandle}
              </div>
            </div>
            <a
              href={siteItem.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Visit ${siteItem.title}`}
              className="text-[#02031A] dark:text-white hover:text-[#1020F5] dark:hover:text-white/75 p-1 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      );
    }

    return (
      <div
        key={`${keyPrefix}-${slot.id}`}
        className={`${widthClass} shrink-0 flex flex-col text-left`}
      >
        <div className="w-full aspect-[16/10] rounded-2xl border border-[#02031A]/10 dark:border-white/12 bg-[#F6F8FC] dark:bg-[#0B0B0D] p-5 flex flex-col justify-end text-left transition-colors hover:border-[#02031A]/25 dark:hover:border-white/25">
          {hasActiveNoMatch && slotIndex === 0 ? (
            <div className="w-full">
              <div className="mono text-[12px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                0 matches
              </div>
              <div className="mt-1 text-[16px] font-semibold tracking-[-0.015em] text-[#02031A] dark:text-white">
                No sites match &ldquo;{userQuery.trim()}&rdquo;
              </div>
            </div>
          ) : (
            <span className="mono text-[12px] text-[#02031A]/60 dark:text-white/60">Site preview</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="search-showcase"
      aria-label="Website recommendations search showcase"
      className="fiwi-cv-auto w-full bg-white dark:bg-black pt-8 sm:pt-12 pb-14 sm:pb-20 flex flex-col items-center overflow-hidden transition-colors duration-200"
    >
      {/* Left-Aligned Typewriter Website Search Prompt */}
      <motion.div
        initial={{opacity: 0, y: 12}}
        whileInView={{opacity: 1, y: 0}}
        viewport={FIWI_VIEWPORT}
        transition={FIWI_TRANSITION_REVEAL}
        className="w-full px-4 sm:px-8 mb-10 sm:mb-14 flex justify-center"
      >
        <div className="w-full max-w-[1200px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            onClick={() => inputRef.current?.focus()}
            className="relative flex items-center gap-3.5 sm:gap-4 w-full max-w-[920px] py-2 cursor-text text-left"
          >
            {isUserTyping ? (
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[#02031A] dark:text-white shrink-0" />
            ) : isDeleting ? (
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[#02031A]/70 dark:text-white/70 shrink-0" />
            ) : (
              <RotateCw className="w-6 h-6 sm:w-8 sm:h-8 text-[#02031A]/75 dark:text-white/75 shrink-0" />
            )}

            <div className="relative flex-1 min-w-0 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={userQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userQuery.trim() && onSearchLibrary) {
                    e.preventDefault();
                    onSearchLibrary(userQuery.trim());
                  } else if (e.key === 'Escape' && userQuery) {
                    setUserQuery('');
                  }
                }}
                aria-label="Search websites"
                className="w-full bg-transparent border-0 outline-none p-0 pr-8 text-[26px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.025em] leading-[1.2] text-[#02031A] dark:text-white caret-[#02031A] dark:caret-white"
              />

              {!isUserTyping && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap text-[26px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.025em] leading-[1.2] text-[#02031A] dark:text-white"
                >
                  <span>{typedText}</span>
                  <span className="fiwi-caret inline-block w-[2.5px] h-[1.05em] bg-[#02031A] dark:bg-white ml-0.5 align-middle" />
                </div>
              )}

              {isFocused && userQuery.length === 0 && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center text-[26px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.025em] leading-[1.2] text-[#02031A]/35 dark:text-white/35"
                >
                  Search websites...
                </span>
              )}

              {userQuery.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search query"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-[#02031A]/45 dark:text-white/45 hover:text-[#02031A] dark:hover:text-white bg-transparent border-0 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {userQuery.trim().length > 0 && onSearchLibrary && (
            <button
              type="button"
              onClick={() => onSearchLibrary(userQuery.trim())}
              className="btn h-[42px] px-5 bg-[#02031A] text-white hover:bg-[#1020F5] dark:bg-white dark:text-[#02031A] dark:hover:bg-white/85 text-[14px] inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <span>Filter library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Horizontal Scrolling Website Preview Strip */}
      <div
        data-paused={!isVisible ? 'true' : undefined}
        className="fiwi-marquee-viewport relative w-full overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-white dark:from-black to-transparent z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-white dark:from-black to-transparent z-10"
        />

        <div className="fiwi-marquee-track py-1">
          <div className="flex gap-[20px] shrink-0">
            {baseSlots.map((slot, idx) => renderCard(slot, 'primary', idx))}
          </div>
          <div className="flex gap-[20px] shrink-0" aria-hidden="true">
            {baseSlots.map((slot, idx) => renderCard(slot, 'duplicate', idx))}
          </div>
        </div>
      </div>
    </section>
  );
}

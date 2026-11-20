import {memo, useEffect, useRef, useState} from 'react';
import {motion} from 'motion/react';
import {
  Bookmark,
  Layers,
  Search,
  Square,
  Star,
} from 'lucide-react';
import {SHOWCASE_CATEGORIES, type ShowcaseCategory} from '../types/fiwi';
import {
  FIWI_TAP,
  FIWI_TRANSITION_REVEAL,
  FIWI_VIEWPORT,
  fiwiStaggerContainer,
  fiwiStaggerItem,
} from '../lib/motion';

interface CategoriesShowcaseSectionProps {
  onSelectCategory: (category: ShowcaseCategory) => void;
}

export default function CategoriesShowcaseSection({
  onSelectCategory,
}: CategoriesShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [tick, setTick] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

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
    if (prefersReducedMotion || !isVisible) return;
    const interval = window.setInterval(() => {
      setTick((prev) => (prev + 1) % 120);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion, isVisible]);

  const step3 = tick % 3;
  const step4 = tick % 4;
  const flowPingPong = [0, 1, 2, 1][step4];
  const uiMode = Math.floor(tick / 2) % 2;

  return (
    <section
      ref={sectionRef}
      aria-label="Website categories library"
      className="fiwi-cv-auto w-full bg-white dark:bg-black px-4 sm:px-8 pt-6 sm:pt-10 pb-16 sm:pb-24 flex flex-col items-center transition-colors duration-200"
    >
      <div className="w-full max-w-[1200px] flex flex-col items-center">
        <motion.h2
          initial={{opacity: 0, y: 12}}
          whileInView={{opacity: 1, y: 0}}
          viewport={FIWI_VIEWPORT}
          transition={FIWI_TRANSITION_REVEAL}
          className="m-0 text-center text-[34px] sm:text-[46px] lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.06] text-[#02031A] dark:text-white text-balance"
        >
          Find inspiration.
          <br />
          Find opportunities.
        </motion.h2>

        <motion.div
          variants={fiwiStaggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={FIWI_VIEWPORT}
          className="mt-10 sm:mt-14 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {SHOWCASE_CATEGORIES.map((category) => (
            <motion.button
              key={category}
              type="button"
              variants={fiwiStaggerItem}
              whileTap={FIWI_TAP}
              onClick={() => onSelectCategory(category)}
              className="group relative w-full rounded-[20px] bg-[#F5F6F8] dark:bg-[#0D0D10] border border-[#02031A]/[0.08] dark:border-white/[0.1] hover:border-[#02031A]/20 dark:hover:border-white/25 hover:bg-[#EFEFF3] dark:hover:bg-[#131317] text-center px-5 pt-6 pb-0 overflow-hidden flex flex-col items-center justify-between cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02031A] dark:focus-visible:outline-white"
            >
              <span className="text-[17px] sm:text-[18px] font-semibold tracking-[-0.015em] text-[#02031A] dark:text-white">
                {category}
              </span>

              <div className="w-full h-[214px] sm:h-[228px] mt-4 flex items-center justify-center relative select-none">
                {category === 'Business & SaaS' && <BusinessSaasPreview step={step3} />}
                {category === 'Design & Creative' && <DesignCreativePreview step={step3} />}
                {category === 'E-commerce & Lifestyle' && (
                  <EcommerceLifestylePreview step={step3} />
                )}
                {category === 'Technology' && <TechnologyPreview step={flowPingPong} />}
                {category === 'Media & Content' && <MediaContentPreview step={step3} />}
                {category === 'Experimental & Unique' && (
                  <ExperimentalUniquePreview mode={uiMode} step={step4} />
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  1. Business & SaaS — Cycling Trios of Tilted App Icon Tiles               */
/* -------------------------------------------------------------------------- */
const BusinessSaasPreview = memo(function BusinessSaasPreview({step}: {step: number}) {
  const decks = [
    [
      {
        id: 'p-blue',
        bg: 'bg-[#1028E8]',
        tilt: '-rotate-[8deg] -translate-x-[58px] translate-y-[4px] z-10',
        mark: (
          <span className="font-display text-[28px] font-semibold leading-none text-white">
            P
          </span>
        ),
      },
      {
        id: 'f-lime',
        bg: 'bg-[#94EB64]',
        tilt: 'rotate-0 translate-x-0 scale-[1.06] z-30',
        mark: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5H19L15.5 10H9.5L13 15L9.5 20L5 5Z" fill="#0B1020" />
          </svg>
        ),
      },
      {
        id: 'wallet-dark',
        bg: 'bg-[#121318]',
        tilt: 'rotate-[8deg] translate-x-[58px] translate-y-[4px] z-20',
        mark: (
          <div className="w-11 h-9 rounded-[7px] overflow-hidden flex flex-col border border-white/15">
            <div className="h-2.5 bg-[#38BDF8]" />
            <div className="h-2.5 bg-[#FBBF24]" />
            <div className="flex-1 bg-[#1E293B]" />
          </div>
        ),
      },
    ],
    [
      {
        id: 'grid-black',
        bg: 'bg-[#0E1015]',
        tilt: '-rotate-[8deg] -translate-x-[58px] translate-y-[4px] z-10',
        mark: (
          <div className="grid grid-cols-2 gap-1 w-7 h-7">
            <span className="rounded-[2px] bg-white" />
            <span className="rounded-[2px] bg-white/25" />
            <span className="rounded-[2px] bg-white/25" />
            <span className="rounded-[2px] bg-white" />
          </div>
        ),
      },
      {
        id: 'c-blue',
        bg: 'bg-[#0D47FF]',
        tilt: 'rotate-0 translate-x-0 scale-[1.06] z-30',
        mark: (
          <div className="relative w-8 h-8 flex items-center justify-center">
            <span className="w-7 h-7 rounded-full border-[5px] border-white block" />
            <span className="absolute right-0 w-2.5 h-2.5 rounded-full bg-[#0D47FF]" />
          </div>
        ),
      },
      {
        id: 'violet-mark',
        bg: 'bg-[#A79BFF]',
        tilt: 'rotate-[8deg] translate-x-[58px] translate-y-[4px] z-20',
        mark: (
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
          </div>
        ),
      },
    ],
    [
      {
        id: 'frosted',
        bg: 'bg-white',
        tilt: '-rotate-[8deg] -translate-x-[58px] translate-y-[4px] z-10',
        mark: (
          <div className="flex items-end gap-1 h-7">
            <span className="w-1.5 h-3.5 rounded-full bg-[#1020F5]" />
            <span className="w-1.5 h-5.5 rounded-full bg-[#1020F5]" />
            <span className="w-1.5 h-7 rounded-full bg-[#1020F5]" />
          </div>
        ),
      },
      {
        id: 'coral',
        bg: 'bg-[#FF385C]',
        tilt: 'rotate-0 translate-x-0 scale-[1.06] z-30',
        mark: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 4L19 18H5L12 4Z"
              stroke="white"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        id: 'obsidian',
        bg: 'bg-[#090A0F]',
        tilt: 'rotate-[8deg] translate-x-[58px] translate-y-[4px] z-20',
        mark: (
          <span className="font-display text-[22px] font-semibold tracking-tight text-white">
            fiwi
          </span>
        ),
      },
    ],
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center pb-4">
      {decks.map((deck, deckIdx) => {
        const isCurrent = deckIdx === step;
        const isPrev = (deckIdx + 1) % 3 === step;

        return (
          <div
            key={deckIdx}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {deck.map((tile, itemIdx) => (
              <div
                key={tile.id}
                style={{
                  transitionDelay: isCurrent ? `${itemIdx * 45}ms` : '0ms',
                }}
                className={`absolute w-[84px] h-[84px] rounded-[20px] ${tile.bg} border border-black/10 dark:border-white/15 flex items-center justify-center shadow-[0_18px_32px_-12px_rgba(2,3,26,0.3)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isCurrent
                    ? `opacity-100 ${tile.tilt}`
                    : isPrev
                      ? 'opacity-0 scale-75 -translate-y-3 pointer-events-none'
                      : 'opacity-0 scale-75 translate-y-3 pointer-events-none'
                }`}
              >
                {tile.mark}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  2. Design & Creative — Browser Showcase with Floating Fanned Glass Deck   */
/* -------------------------------------------------------------------------- */
const DesignCreativePreview = memo(function DesignCreativePreview({step}: {step: number}) {
  const swatches = [
    '#1E293B',
    '#F59E0B',
    '#818CF8',
    '#94A3B8',
    '#10B981',
    '#FB7185',
    '#334155',
  ];

  const featuredCards = [
    {
      id: 'atelier',
      kicker: 'ARCHITECTURE',
      title: 'Atelier Nord',
      surface: 'bg-gradient-to-br from-[#F8FAFC]/95 via-[#EFF6FF]/92 to-[#DBEAFE]/92 text-[#02031A] border-white/80',
      kickerColor: 'text-[#02031A]/55',
      barColor: 'bg-[#02031A]/18',
    },
    {
      id: 'kroma',
      kicker: 'INTERACTIVE WEB',
      title: 'Kroma Lab',
      surface: 'bg-gradient-to-br from-[#DBEAFE]/95 via-[#93C5FD]/90 to-[#60A5FA]/90 text-[#02031A] border-white/75',
      kickerColor: 'text-[#02031A]/60',
      barColor: 'bg-[#02031A]/20',
    },
    {
      id: 'monolith',
      kicker: 'STUDIO FOUNDRY',
      title: 'Monolith',
      surface: 'bg-gradient-to-br from-[#27272A]/95 to-[#09090B]/95 text-white border-white/20',
      kickerColor: 'text-white/60',
      barColor: 'bg-white/25',
    },
  ];

  return (
    <div className="w-[94%] max-w-[300px] h-[196px] mt-auto rounded-t-[10px] bg-white dark:bg-[#14151A] border border-b-0 border-[#02031A]/12 dark:border-white/14 shadow-[0_14px_32px_-12px_rgba(2,3,26,0.18)] overflow-hidden flex flex-col">
      {/* Browser top bar */}
      <div className="h-[22px] px-2.5 border-b border-[#02031A]/8 dark:border-white/10 bg-[#FAFAFC] dark:bg-[#101116] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#02031A]/20 dark:bg-white/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#02031A]/20 dark:bg-white/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#02031A]/20 dark:bg-white/20" />
        </div>
        <div className="h-[14px] px-3 rounded-full bg-[#F1F2F6] dark:bg-white/10 flex items-center justify-center">
          <span className="mono text-[8px] text-[#02031A]/65 dark:text-white/70">
            fiwi.gallery
          </span>
        </div>
        <span className="text-[10px] text-[#02031A]/40 dark:text-white/40 leading-none">+</span>
      </div>

      {/* Browser interior */}
      <div className="relative flex-1 p-2.5 flex flex-col justify-between bg-white dark:bg-[#0D0E12] overflow-hidden">
        {/* Background 2x4 subtle grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-1.5 opacity-60">
          <div className="h-[46px] rounded-[4px] bg-[#F1F5F9] dark:bg-white/[0.06]" />
          <div className="h-[46px] rounded-[4px] bg-[#E2E8F0] dark:bg-white/[0.08]" />
          <div className="h-[46px] rounded-[4px] bg-[#F1F5F9] dark:bg-white/[0.06]" />
          <div className="h-[46px] rounded-[4px] bg-[#E2E8F0] dark:bg-white/[0.08]" />
          <div className="h-[46px] rounded-[4px] bg-[#E0E7FF] dark:bg-white/[0.07]" />
          <div className="h-[46px] rounded-[4px] bg-[#FFEDD5] dark:bg-white/[0.05]" />
          <div className="h-[46px] rounded-[4px] bg-[#E2E8F0] dark:bg-white/[0.08]" />
          <div className="h-[46px] rounded-[4px] bg-[#D1FAE5] dark:bg-white/[0.06]" />
        </div>

        {/* Fanned layered glass cards floating forward */}
        <div className="absolute inset-x-0 top-3 bottom-7 flex items-center justify-center pointer-events-none">
          {featuredCards.map((card, idx) => {
            const rel = (idx - step + 3) % 3;
            const slotClass =
              rel === 0
                ? 'translate-x-0 rotate-0 scale-100 z-20 shadow-[0_20px_34px_-12px_rgba(2,3,26,0.3)]'
                : rel === 1
                  ? '-translate-x-[58px] -rotate-[4deg] scale-[0.78] z-10 shadow-[0_12px_24px_-10px_rgba(2,3,26,0.22)]'
                  : 'translate-x-[58px] rotate-[4deg] scale-[0.78] z-10 shadow-[0_12px_24px_-10px_rgba(2,3,26,0.22)]';

            return (
              <div
                key={card.id}
                className={`absolute w-[134px] h-[90px] rounded-[10px] border p-3 flex flex-col justify-between text-left backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${card.surface} ${slotClass}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`mono text-[7px] uppercase tracking-[0.07em] truncate ${card.kickerColor}`}>
                    {card.kicker}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-opacity duration-300 ${
                      rel === 0 ? 'opacity-100' : 'opacity-0'
                    } ${card.barColor}`}
                  />
                </div>
                <div>
                  <div className="font-display text-[20px] font-semibold leading-none tracking-[-0.01em] truncate">
                    {card.title}
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <span className={`h-1.5 w-9 rounded-full ${card.barColor}`} />
                    <span className={`h-1.5 w-4 rounded-full ${card.barColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom color swatch bar */}
        <div className="relative z-20 flex items-center justify-center gap-1.5 pt-1">
          {swatches.map((hex) => (
            <span
              key={hex}
              style={{backgroundColor: hex}}
              className="w-6 h-2.5 rounded-[3px] shadow-xs"
            />
          ))}
        </div>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  3. E-commerce & Lifestyle — Cycling Full-Screen Mobile Storefront Views   */
/* -------------------------------------------------------------------------- */
const EcommerceLifestylePreview = memo(function EcommerceLifestylePreview({step}: {step: number}) {
  return (
    <div className="relative w-[134px] h-[204px] mt-auto rounded-t-[26px] bg-[#141418] p-[5px] pb-0 shadow-[0_18px_36px_-10px_rgba(2,3,26,0.3)]">
      <div className="w-full h-full rounded-t-[21px] bg-white overflow-hidden relative flex flex-col">
        {/* Dynamic Island Notch */}
        <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-[34px] h-[9px] rounded-full bg-[#090A0D] z-30" />

        {/* Screen 0: Deep Emerald Seasonal Index Card */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-[#17653A] via-[#0B3B21] to-[#051B0F] text-white p-3 pt-7 flex flex-col justify-between text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            step === 0
              ? 'opacity-100 translate-y-0 z-20'
              : step === 1
                ? 'opacity-0 -translate-y-4 z-10'
                : 'opacity-0 translate-y-4 z-10'
          }`}
        >
          <div className="mono text-[7px] uppercase tracking-[0.08em] text-white/75">
            Seasonal Index
          </div>

          <div className="my-auto">
            <div className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
              73%
            </div>
            <p className="mt-1.5 mb-0 text-[8.5px] leading-[1.35] text-white/85">
              Organic textiles &amp; small-batch studios
            </p>
          </div>

          <div className="mb-2 px-2.5 py-2 rounded-[10px] bg-black/35 border border-white/10 flex items-center justify-between text-[7.5px]">
            <span className="text-white/80">Live stock</span>
            <span className="font-semibold tabular-nums">24 items</span>
          </div>
        </div>

        {/* Screen 1: Warm Sunset Header Storefront Profile */}
        <div
          className={`absolute inset-0 bg-[#FAF8F5] text-[#02031A] flex flex-col text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            step === 1
              ? 'opacity-100 translate-y-0 z-20'
              : step === 2
                ? 'opacity-0 -translate-y-4 z-10'
                : 'opacity-0 translate-y-4 z-10'
          }`}
        >
          <div className="h-[58px] bg-gradient-to-br from-[#FF6B1A] via-[#FF8A3D] to-[#FBBF24] p-2.5 flex items-end justify-center">
            <span className="w-7 h-7 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-[#02031A]">
              KC
            </span>
          </div>
          <div className="flex-1 p-2.5 flex flex-col justify-between">
            <div className="text-center">
              <div className="text-[10px] font-semibold text-[#02031A]">Kuro Ceramic</div>
              <div className="text-[7px] text-[#02031A]/55">Autumn release · Kyoto</div>
            </div>
            <div className="space-y-1.5 text-[7.5px]">
              <div className="flex items-center justify-between py-1 border-b border-[#02031A]/8">
                <span className="text-[#02031A]/75">Hand-thrown vessel</span>
                <span className="mono font-semibold tabular-nums">$140</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#02031A]/8">
                <span className="text-[#02031A]/75">Stoneware carafe</span>
                <span className="mono font-semibold tabular-nums">$85</span>
              </div>
            </div>
            <div className="mb-1.5 h-[22px] rounded-[6px] bg-[#02031A] text-white text-[8px] font-semibold flex items-center justify-center">
              View collection
            </div>
          </div>
        </div>

        {/* Screen 2: Minimalist Light Orbit Storefront */}
        <div
          className={`absolute inset-0 bg-white text-[#02031A] p-3 pt-8 flex flex-col justify-between text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            step === 2
              ? 'opacity-100 translate-y-0 z-20'
              : step === 0
                ? 'opacity-0 -translate-y-4 z-10'
                : 'opacity-0 translate-y-4 z-10'
          }`}
        >
          <div className="relative w-[78px] h-[78px] mx-auto mt-1 flex items-center justify-center">
            <span className="w-7 h-7 rounded-full bg-[#02031A] text-white text-[9px] font-semibold flex items-center justify-center">
              V
            </span>
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span className="absolute top-3 right-2 w-2.5 h-2.5 rounded-full bg-[#F97316]" />
            <span className="absolute bottom-3 right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="absolute bottom-3 left-1 w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
            <span className="absolute top-3 left-2 w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
          </div>

          <div className="mb-3">
            <div className="text-[11px] font-semibold text-[#02031A]">Verve Objects</div>
            <div className="text-[7.5px] text-[#02031A]/55 mt-0.5">Curated daily essentials</div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  4. Technology — Horizontal Multi-Screen Flow Strip                        */
/* -------------------------------------------------------------------------- */
const TechnologyPreview = memo(function TechnologyPreview({step}: {step: number}) {
  const translateX = -(step * 42);

  return (
    <div className="w-full h-full flex items-end justify-center overflow-hidden px-1">
      <div
        className="flex items-end gap-2.5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{transform: `translate3d(${translateX}px, 0, 0)`}}
      >
        {/* Step 01 */}
        <div className="w-[86px] h-[176px] shrink-0 rounded-t-[12px] bg-white dark:bg-[#14151A] border border-b-0 border-[#02031A]/10 dark:border-white/12 p-2.5 flex flex-col justify-between text-center">
          <div className="h-[3px] w-full rounded-full bg-[#E5E7EB] dark:bg-white/10 overflow-hidden">
            <div className="h-full w-1/3 bg-[#10B981] rounded-full" />
          </div>
          <div className="my-auto flex flex-col items-center">
            <div className="w-6 h-6 rounded-[6px] bg-[#10B981] text-white mono text-[9px] font-semibold flex items-center justify-center">
              01
            </div>
            <div className="mt-2 text-[9px] font-semibold text-[#02031A] dark:text-white">
              Vector DB
            </div>
            <div className="text-[7px] text-[#02031A]/50 dark:text-white/50 mt-0.5">
              12 ms query
            </div>
          </div>
          <div className="mb-2 h-[18px] rounded-[5px] bg-[#F1F3F6] dark:bg-white/10 text-[7.5px] font-medium text-[#02031A]/70 dark:text-white/70 flex items-center justify-center">
            Inspect
          </div>
        </div>

        {/* Step 02 */}
        <div className="w-[86px] h-[176px] shrink-0 rounded-t-[12px] bg-white dark:bg-[#14151A] border border-b-0 border-[#02031A]/10 dark:border-white/12 p-2.5 flex flex-col justify-between text-center">
          <div className="h-[3px] w-full rounded-full bg-[#E5E7EB] dark:bg-white/10 overflow-hidden">
            <div className="h-full w-2/3 bg-[#1020F5] rounded-full" />
          </div>
          <div className="my-auto flex flex-col items-center">
            <div className="w-6 h-6 rounded-[6px] bg-[#1020F5] text-white mono text-[9px] font-semibold flex items-center justify-center">
              02
            </div>
            <div className="mt-2 text-[9px] font-semibold text-[#02031A] dark:text-white">
              Edge Route
            </div>
            <div className="text-[7px] text-[#02031A]/50 dark:text-white/50 mt-0.5">
              Global mesh
            </div>
          </div>
          <div className="mb-2 h-[18px] rounded-[5px] bg-[#F1F3F6] dark:bg-white/10 text-[7.5px] font-medium text-[#02031A]/70 dark:text-white/70 flex items-center justify-center">
            Deploy
          </div>
        </div>

        {/* Step 03 (Active checklist & bright CTA like Flows) */}
        <div className="w-[86px] h-[184px] shrink-0 rounded-t-[12px] bg-white dark:bg-[#14151A] border border-b-0 border-[#02031A]/14 dark:border-white/16 shadow-[0_12px_24px_-12px_rgba(2,3,26,0.16)] p-2.5 flex flex-col justify-between text-left">
          <div className="h-[3px] w-full rounded-full bg-[#E5E7EB] dark:bg-white/10 overflow-hidden">
            <div className="h-full w-full bg-[#77D400] rounded-full" />
          </div>
          <div className="space-y-1.5 my-auto">
            <div className="h-5 rounded-[5px] bg-[#F4F6FA] dark:bg-white/[0.06] px-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span className="h-1.5 w-8 rounded-full bg-[#CBD5E1] dark:bg-white/25" />
            </div>
            <div className="h-5 rounded-[5px] bg-[#F4F6FA] dark:bg-white/[0.06] px-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="h-1.5 w-6 rounded-full bg-[#CBD5E1] dark:bg-white/25" />
            </div>
            <div className="h-5 rounded-[5px] bg-[#F4F6FA] dark:bg-white/[0.06] px-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="h-1.5 w-7 rounded-full bg-[#CBD5E1] dark:bg-white/25" />
            </div>
          </div>
          <div className="mb-2 h-[18px] rounded-[5px] bg-[#77D400] text-white text-[7.5px] font-semibold flex items-center justify-center">
            Select
          </div>
        </div>

        {/* Step 04 */}
        <div className="w-[86px] h-[176px] shrink-0 rounded-t-[12px] bg-white dark:bg-[#14151A] border border-b-0 border-[#02031A]/10 dark:border-white/12 p-2.5 flex flex-col justify-between text-center">
          <div className="h-[3px] w-full rounded-full bg-[#E5E7EB] dark:bg-white/10 overflow-hidden">
            <div className="h-full w-3/4 bg-[#059669] rounded-full" />
          </div>
          <div className="my-auto flex flex-col items-center">
            <div className="w-6 h-6 rounded-[6px] bg-[#059669] text-white mono text-[9px] font-semibold flex items-center justify-center">
              04
            </div>
            <div className="mt-2 text-[9px] font-semibold text-[#02031A] dark:text-white">
              Live API
            </div>
            <div className="text-[7px] text-[#02031A]/50 dark:text-white/50 mt-0.5">
              99.98% uptime
            </div>
          </div>
          <div className="mb-2 h-[18px] rounded-[5px] bg-[#F1F3F6] dark:bg-white/10 text-[7.5px] font-medium text-[#02031A]/70 dark:text-white/70 flex items-center justify-center">
            Inspect
          </div>
        </div>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  5. Media & Content — Mobile Editorial & Motion Sequence                   */
/* -------------------------------------------------------------------------- */
const MediaContentPreview = memo(function MediaContentPreview({step}: {step: number}) {
  return (
    <div className="relative w-[134px] h-[204px] mt-auto rounded-t-[26px] bg-[#141418] p-[5px] pb-0 shadow-[0_18px_36px_-10px_rgba(2,3,26,0.3)]">
      <div className="w-full h-full rounded-t-[21px] bg-white overflow-hidden relative flex flex-col">
        {/* Dynamic Island Notch */}
        <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-[34px] h-[9px] rounded-full bg-[#090A0D] z-30" />

        {/* Stage 0: Orbital Dot Ring & Editorial Caption */}
        <div
          className={`absolute inset-0 bg-white text-[#02031A] p-3 pt-8 flex flex-col justify-between items-center text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            step === 0
              ? 'opacity-100 scale-100 z-20'
              : 'opacity-0 scale-95 pointer-events-none z-10'
          }`}
        >
          <div className="relative w-[84px] h-[84px] mt-1 flex items-center justify-center">
            <span className="w-6 h-6 rounded-full bg-[#090A0F] text-white text-[9px] font-semibold flex items-center justify-center z-10">
              F
            </span>
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span className="absolute top-[12px] right-[10px] w-2.5 h-2.5 rounded-full bg-[#F97316]" />
            <span className="absolute bottom-[14px] right-[6px] w-2.5 h-2.5 rounded-full bg-[#EC4899]" />
            <span className="absolute bottom-0 right-[26px] w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
            <span className="absolute bottom-0 left-[26px] w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
            <span className="absolute bottom-[14px] left-[6px] w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="absolute top-[12px] left-[10px] w-2.5 h-2.5 rounded-full bg-[#090A0F]" />
          </div>

          <p className="m-0 mb-3 text-[9px] font-semibold leading-[1.35] text-[#02031A] max-w-[100px]">
            Stories, radio &amp; editorial archives.
          </p>
        </div>

        {/* Stage 1: Clean Editorial Statement */}
        <div
          className={`absolute inset-0 bg-[#FAF9F5] text-[#02031A] p-3 pt-8 flex flex-col justify-between text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            step === 1
              ? 'opacity-100 translate-y-0 z-20'
              : 'opacity-0 translate-y-3 pointer-events-none z-10'
          }`}
        >
          <span className="mono text-[7px] uppercase tracking-[0.08em] text-[#1020F5]">
            Essay · 14
          </span>
          <p className="m-0 my-auto text-[11px] font-semibold leading-[1.3] text-[#02031A]">
            A new era of digital publishing.
          </p>
          <span className="mono text-[7px] text-[#02031A]/45 mb-2">6 min read</span>
        </div>

        {/* Stage 2: Dark Editorial Issue Cover */}
        <div
          className={`absolute inset-0 bg-[#0D0E12] text-white p-3 pt-8 flex flex-col justify-between text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            step === 2
              ? 'opacity-100 translate-y-0 z-20'
              : 'opacity-0 translate-y-3 pointer-events-none z-10'
          }`}
        >
          <span className="mono text-[7px] uppercase tracking-[0.08em] text-white/55">
            Archive
          </span>
          <div className="my-auto">
            <div className="font-serif-italic text-[18px] leading-[1.1] text-white">
              Quiet Rooms
            </div>
            <div className="mt-1.5 text-[7.5px] text-white/65 leading-[1.35]">
              Independent print &amp; web journals.
            </div>
          </div>
          <span className="mono text-[7px] text-white/45 mb-2">Issue 08</span>
        </div>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  6. Experimental & Unique — Breakdown Card <-> Floating Interactive Dock   */
/* -------------------------------------------------------------------------- */
const ExperimentalUniquePreview = memo(function ExperimentalUniquePreview({
  mode,
  step,
}: {
  mode: number;
  step: number;
}) {
  const dockIcons = [Square, Layers, Star, Bookmark, Search];
  const activeDockIdx = (step + 3) % dockIcons.length;

  return (
    <div className="relative w-full h-full flex items-center justify-center pb-4">
      {/* Mode 0: Floating interactive dock pill (matches UI Elements 00:04-00:07) */}
      <div
        className={`rounded-full bg-white dark:bg-[#14151A] border border-[#02031A]/10 dark:border-white/14 shadow-[0_14px_28px_-12px_rgba(2,3,26,0.16)] px-3 py-2 flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mode === 0
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none absolute'
        }`}
      >
        {dockIcons.map((Icon, idx) => {
          const isActive = idx === activeDockIdx;
          return (
            <span
              key={idx}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isActive
                  ? 'bg-[#02031A] text-white dark:bg-[#1020F5]'
                  : 'text-[#02031A]/65 dark:text-white/65'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
          );
        })}
      </div>

      {/* Mode 1: Clean tabular spec breakdown card (matches UI Elements 00:00-00:03) */}
      <div
        className={`w-[228px] rounded-[14px] bg-white dark:bg-[#14151A] border border-[#02031A]/10 dark:border-white/14 shadow-[0_14px_28px_-12px_rgba(2,3,26,0.14)] p-4 flex flex-col gap-2 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mode === 1
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none absolute'
        }`}
      >
        <div className="text-[10.5px] font-medium text-[#02031A]/60 dark:text-white/60 pb-1">
          Interactive canvas specs
        </div>

        <div className="flex items-center justify-between text-[10.5px]">
          <span className="text-[#02031A]/60 dark:text-white/60">Shader passes</span>
          <span className="font-medium tabular-nums text-[#02031A] dark:text-white">04</span>
        </div>

        <div className="flex items-center justify-between text-[10.5px]">
          <span className="text-[#02031A]/60 dark:text-white/60">Pointer damping</span>
          <span className="font-medium tabular-nums text-[#02031A] dark:text-white">0.16</span>
        </div>

        <div className="flex items-center justify-between text-[10.5px]">
          <span className="text-[#02031A]/60 dark:text-white/60">Frame target</span>
          <span className="font-medium tabular-nums text-[#1020F5] dark:text-[#60A5FA]">
            120 Hz
          </span>
        </div>

        <div className="pt-2 mt-0.5 border-t border-[#02031A]/10 dark:border-white/10 flex items-center justify-between text-[10.5px]">
          <span className="font-semibold text-[#02031A] dark:text-white">WebGL score</span>
          <span className="font-semibold tabular-nums text-[#02031A] dark:text-white">98.4</span>
        </div>
      </div>
    </div>
  );
});

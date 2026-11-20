import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type RefObject,
} from 'react';
import {ChevronDown, Menu, Moon, Sun, X} from 'lucide-react';
import type {FiwiUser, SiteCategory} from '../types/fiwi';

export interface PrimaryNavItem {
  label: string;
  tab: 'All' | SiteCategory;
}

interface PrimaryNavbarProps {
  navItems: PrimaryNavItem[];
  activeView: string;
  activePage: 'Hero' | 'All' | SiteCategory;
  isHeroView: boolean;
  theme: 'light' | 'dark';
  user: FiwiUser | null;
  accountMenuOpen: boolean;
  mobileNavOpen: boolean;
  accountTriggerRef: RefObject<HTMLButtonElement | null>;
  onSelectHome: () => void;
  onSelectLibraryTab: (tab: 'All' | SiteCategory) => void;
  onSelectPricing: () => void;
  onOpenSubmit: () => void;
  onOpenLogin: () => void;
  onToggleAccountMenu: () => void;
  onToggleTheme: () => void;
  onToggleMobileNav: () => void;
}

interface PillMetric {
  left: number;
  width: number;
  visible: boolean;
  animateMove: boolean;
}

const HIDDEN_PILL: PillMetric = {
  left: 0,
  width: 0,
  visible: false,
  animateMove: false,
};

const PrimaryNavbar = memo(function PrimaryNavbar({
  navItems,
  activeView,
  activePage,
  isHeroView,
  theme,
  user,
  accountMenuOpen,
  mobileNavOpen,
  accountTriggerRef,
  onSelectHome,
  onSelectLibraryTab,
  onSelectPricing,
  onOpenSubmit,
  onOpenLogin,
  onToggleAccountMenu,
  onToggleTheme,
  onToggleMobileNav,
}: PrimaryNavbarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const hoverKeyRef = useRef<string | null>(null);
  const isInsideTrackRef = useRef(false);

  const activeKey: string | null =
    activeView === 'library' && activePage !== 'Hero'
      ? activePage
      : activeView === 'pricing'
        ? 'Pricing'
        : null;

  const activeKeyRef = useRef<string | null>(activeKey);
  activeKeyRef.current = activeKey;

  const [activeMetric, setActiveMetric] = useState<PillMetric>(HIDDEN_PILL);
  const [hoverMetric, setHoverMetric] = useState<PillMetric>(HIDDEN_PILL);

  const readLinkBox = useCallback((key: string): {left: number; width: number} | null => {
    const link = linkRefs.current[key];
    if (!link) return null;
    const width = link.offsetWidth;
    if (width <= 0) return null;
    return {
      left: link.offsetLeft,
      width,
    };
  }, []);

  const syncActiveMetric = useCallback(
    (allowSlide: boolean) => {
      const key = activeKeyRef.current;
      if (!key) {
        setActiveMetric((prev) =>
          prev.visible ? {...prev, visible: false, animateMove: false} : prev,
        );
        return;
      }
      const box = readLinkBox(key);
      if (!box) return;
      setActiveMetric((prev) => {
        const shouldSlide = allowSlide && prev.visible;
        if (
          prev.visible &&
          Math.abs(prev.left - box.left) < 0.25 &&
          Math.abs(prev.width - box.width) < 0.25 &&
          prev.animateMove === shouldSlide
        ) {
          return prev;
        }
        return {
          left: box.left,
          width: box.width,
          visible: true,
          animateMove: shouldSlide,
        };
      });
    },
    [readLinkBox],
  );

  const setHoveredItem = useCallback(
    (nextKey: string | null) => {
      const wasInsideTrack = isInsideTrackRef.current;
      hoverKeyRef.current = nextKey;
      if (!nextKey) {
        isInsideTrackRef.current = false;
        setHoverMetric((prev) => (prev.visible ? {...prev, visible: false} : prev));
        return;
      }
      isInsideTrackRef.current = true;
      const box = readLinkBox(nextKey);
      if (!box) return;
      const isOverActive = nextKey === activeKeyRef.current;
      setHoverMetric({
        left: box.left,
        width: box.width,
        visible: !isOverActive,
        animateMove: wasInsideTrack,
      });
    },
    [readLinkBox],
  );

  useLayoutEffect(() => {
    syncActiveMetric(true);
    if (hoverKeyRef.current) {
      const isOverActive = hoverKeyRef.current === activeKey;
      setHoverMetric((prev) =>
        prev.width > 0 ? {...prev, visible: !isOverActive} : prev,
      );
    }
  }, [activeKey, syncActiveMetric]);

  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;

    const resyncStatic = () => {
      syncActiveMetric(false);
      if (hoverKeyRef.current) {
        const box = readLinkBox(hoverKeyRef.current);
        if (box) {
          setHoverMetric((prev) => ({
            ...prev,
            left: box.left,
            width: box.width,
            animateMove: false,
          }));
        }
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resyncStatic);
      resizeObserver.observe(trackEl);
    }

    let cancelled = false;
    if (document.fonts && document.fonts.status !== 'loaded') {
      void document.fonts.ready.then(() => {
        if (!cancelled) resyncStatic();
      });
    }

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
    };
  }, [readLinkBox, syncActiveMetric]);

  const handleTrackBlur = (e: FocusEvent<HTMLDivElement>) => {
    const nextTarget = e.relatedTarget as Node | null;
    if (!trackRef.current?.contains(nextTarget)) {
      setHoveredItem(null);
    }
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="glass fiwi-nav flex items-center justify-between md:justify-center gap-2.5 sm:gap-3 md:gap-2.5 lg:gap-[22px] py-[9px] sm:py-[10px] pr-[10px] sm:pr-[12px] pl-[14px] sm:pl-[20px]"
    >
      <a
        href="#hero"
        onClick={(e) => {
          e.preventDefault();
          onSelectHome();
        }}
        className="font-display text-[30px] sm:text-[32px] md:text-[40px] font-semibold tracking-[-0.02em] leading-none shrink-0"
      >
        fiwi
      </a>

      <div
        ref={trackRef}
        onMouseLeave={() => setHoveredItem(null)}
        onBlurCapture={handleTrackBlur}
        className="relative hidden md:flex items-center md:gap-0.5 lg:gap-1"
      >
        {/* Persistent hover pill track — never unmounts so glide trajectories never teleport */}
        <span
          aria-hidden="true"
          style={{
            transform: `translate3d(${hoverMetric.left}px, 0, 0)`,
            width: `${hoverMetric.width}px`,
            opacity: hoverMetric.visible ? 1 : 0,
            transitionProperty: hoverMetric.animateMove
              ? 'transform, width, opacity'
              : 'opacity',
          }}
          className="fiwi-nav-pill fiwi-nav-pill--hover pointer-events-none absolute top-0 bottom-0 left-0 rounded-full bg-white/12"
        />

        {/* Persistent active pill track */}
        <span
          aria-hidden="true"
          style={{
            transform: `translate3d(${activeMetric.left}px, 0, 0)`,
            width: `${activeMetric.width}px`,
            opacity: activeMetric.visible ? 1 : 0,
            transitionProperty: activeMetric.animateMove
              ? 'transform, width, opacity'
              : 'opacity',
          }}
          className="fiwi-nav-pill fiwi-nav-pill--active pointer-events-none absolute top-0 bottom-0 left-0 rounded-full bg-white/22 border border-white/32 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]"
        />

        {navItems.map((item) => {
          const isCurrent = activeKey === item.tab;
          return (
            <a
              key={item.label}
              ref={(el) => {
                linkRefs.current[item.tab] = el;
              }}
              href={`#${item.label.toLowerCase()}`}
              aria-current={isCurrent ? 'page' : undefined}
              onMouseEnter={() => setHoveredItem(item.tab)}
              onFocus={() => setHoveredItem(item.tab)}
              onClick={(e) => {
                e.preventDefault();
                hoverKeyRef.current = item.tab;
                setHoverMetric((prev) => ({...prev, visible: false}));
                onSelectLibraryTab(item.tab);
              }}
              className={`relative z-[1] px-2.5 lg:px-3.5 py-1.5 rounded-full lab text-[14px] lg:text-[16px] whitespace-nowrap transition-colors duration-150 ${
                isCurrent ? 'text-white' : 'text-white/85 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          );
        })}

        <a
          ref={(el) => {
            linkRefs.current.Pricing = el;
          }}
          href="#pricing"
          aria-current={activeKey === 'Pricing' ? 'page' : undefined}
          onMouseEnter={() => setHoveredItem('Pricing')}
          onFocus={() => setHoveredItem('Pricing')}
          onClick={(e) => {
            e.preventDefault();
            hoverKeyRef.current = 'Pricing';
            setHoverMetric((prev) => ({...prev, visible: false}));
            onSelectPricing();
          }}
          className={`relative z-[1] px-2.5 lg:px-3.5 py-1.5 rounded-full lab text-[14px] lg:text-[16px] whitespace-nowrap transition-colors duration-150 ${
            activeKey === 'Pricing' ? 'text-white' : 'text-white/85 hover:text-white'
          }`}
        >
          Pricing
        </a>
      </div>

      <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
        {user ? (
          <>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="btn btn-nav md:!px-4 lg:!px-[26px] whitespace-nowrap"
            >
              Submit a website
            </button>
            <button
              ref={accountTriggerRef}
              type="button"
              onClick={onToggleAccountMenu}
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
              title={`${user.name} (${user.handle})`}
              className={`h-9 pl-1.5 pr-3 rounded-full inline-flex items-center gap-2 border border-white/25 cursor-pointer transition-colors ${
                accountMenuOpen || activeView === 'settings'
                  ? 'bg-white text-[#02031A]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-white/30 shrink-0"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-white/20 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="mono text-[11px] font-semibold uppercase tracking-[0.04em] max-w-[92px] truncate">
                {user.handle}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  accountMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="btn btn-nav"
          >
            Login
          </button>
        )}

        {isHeroView && (
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="w-10 h-10 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Mobile Controls (< md) */}
      <div className="flex md:hidden items-center gap-2 shrink-0">
        {user ? (
          <button
            type="button"
            onClick={onOpenSubmit}
            className="btn btn-nav !h-[34px] !px-3.5 !text-[12px] whitespace-nowrap"
          >
            Submit
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="btn btn-nav !h-[34px] !px-4 !text-[12px]"
          >
            Login
          </button>
        )}

        <button
          type="button"
          onClick={onToggleMobileNav}
          aria-expanded={mobileNavOpen}
          aria-controls="fiwi-mobile-nav"
          aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="w-9 h-9 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
        >
          {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
});

export default PrimaryNavbar;

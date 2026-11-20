import {motion} from 'motion/react';
import type {SiteCategory} from '../types/fiwi';
import {FIWI_TRANSITION_REVEAL, FIWI_VIEWPORT} from '../lib/motion';
import logoImg from './Logo.png';

export type FooterRoute =
  | 'hero'
  | 'explore'
  | 'normal'
  | 'vibecoded'
  | 'connect'
  | 'test'
  | 'pricing'
  | 'blog'
  | 'docs'
  | 'submit'
  | 'saved'
  | 'about'
  | 'contact'
  | 'legal';

interface FooterProps {
  currentRoute?: FooterRoute;
  onNavigateHome: () => void;
  onNavigateLibrary: (tab: 'All' | SiteCategory) => void;
  onNavigatePricing: () => void;
  onNavigateBlog: () => void;
  onNavigateDocs: () => void;
  onNavigateSubmit: () => void;
  onNavigateSaved: () => void;
  onNavigateAbout: () => void;
  onNavigateContact: () => void;
  onNavigateLegal: () => void;
}

function ArrowUpSvg() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5"
    >
      <path
        d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export default function Footer({
  currentRoute,
  onNavigateHome,
  onNavigateLibrary,
  onNavigatePricing,
  onNavigateBlog,
  onNavigateDocs,
  onNavigateSubmit,
  onNavigateSaved,
  onNavigateAbout,
  onNavigateContact,
  onNavigateLegal,
}: FooterProps) {
  const linkClass = (active: boolean) =>
    `text-[14px] leading-[1.4] py-1 transition-colors whitespace-nowrap w-fit hover:underline underline-offset-4 ${
      active
        ? 'font-semibold text-[#1020F5] dark:text-[#60A5FA]'
        : 'font-medium text-[#02031A]/75 dark:text-white/75 hover:text-[#02031A] dark:hover:text-white'
    }`;

  return (
    <footer
      aria-label="Site footer"
      className="fiwi-cv-auto w-full bg-white dark:bg-black border-t border-[#02031A]/12 dark:border-white/14 px-4 sm:px-8 pt-14 sm:pt-16 pb-10 flex justify-center transition-colors duration-200"
    >
      <motion.div
        initial={{opacity: 0, y: 10}}
        whileInView={{opacity: 1, y: 0}}
        viewport={FIWI_VIEWPORT}
        transition={FIWI_TRANSITION_REVEAL}
        className="w-full max-w-[1200px] flex flex-col"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-14">
          {/* Brand Summary Column */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome();
              }}
              className="inline-flex items-center gap-2.5 text-[#02031A] dark:text-white hover:opacity-80 transition-opacity"
            >
              <img
                src={logoImg}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                decoding="async"
                className="w-6 h-6 object-contain shrink-0"
              />
              <span className="font-display text-[34px] font-semibold tracking-[-0.02em] leading-none">
                fiwi
              </span>
            </a>

            <p className="mt-4 mb-0 max-w-[330px] text-[14px] leading-[1.6] text-[#02031A]/65 dark:text-white/65">
              A curated platform for discovering traditional websites, AI-built projects, collaboration opportunities, and authorized testing—where the web comes together.
            </p>
          </div>

          {/* Navigation Columns */}
          <nav
            aria-label="Footer navigation"
            className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-left"
          >
            <div className="flex flex-col gap-2">
              <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/50 dark:text-white/50 mb-1">
                Explore
              </div>
              <a
                href="#all"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateLibrary('All');
                }}
                className={linkClass(currentRoute === 'explore')}
              >
                Explore
              </a>
              <a
                href="#normal"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateLibrary('Normal');
                }}
                className={linkClass(currentRoute === 'normal')}
              >
                Normal
              </a>
              <a
                href="#vibecoded"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateLibrary('Vibecoded');
                }}
                className={linkClass(currentRoute === 'vibecoded')}
              >
                Vibecoded
              </a>
              <a
                href="#connect"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateLibrary('Connect');
                }}
                className={linkClass(currentRoute === 'connect')}
              >
                Connect
              </a>
              <a
                href="#test"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateLibrary('Test');
                }}
                className={linkClass(currentRoute === 'test')}
              >
                Test
              </a>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePricing();
                }}
                className={linkClass(currentRoute === 'pricing')}
              >
                Pricing
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/50 dark:text-white/50 mb-1">
                Resources
              </div>
              <a
                href="#blog"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateBlog();
                }}
                className={linkClass(currentRoute === 'blog')}
              >
                Blog
              </a>
              <a
                href="#docs"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateDocs();
                }}
                className={linkClass(currentRoute === 'docs')}
              >
                Docs
              </a>
              <a
                href="#submit"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSubmit();
                }}
                className={linkClass(currentRoute === 'submit')}
              >
                Submit a website
              </a>
              <a
                href="#saved"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSaved();
                }}
                className={linkClass(currentRoute === 'saved')}
              >
                Saved
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/50 dark:text-white/50 mb-1">
                Company
              </div>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateAbout();
                }}
                className={linkClass(currentRoute === 'about')}
              >
                About
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateContact();
                }}
                className={linkClass(currentRoute === 'contact')}
              >
                Contact
              </a>
              <a
                href="#legal"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateLegal();
                }}
                className={linkClass(currentRoute === 'legal')}
              >
                Legal
              </a>
            </div>
          </nav>
        </div>

        {/* Bottom Legal & Utility Row */}
        <div className="pt-6 border-t border-[#02031A]/10 dark:border-white/12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-[13px] text-[#02031A]/55 dark:text-white/55">
            &copy; {new Date().getFullYear()} FiWi. All rights reserved.
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-[#02031A]/65 dark:text-white/65 hover:text-[#02031A] dark:hover:text-white bg-transparent border-0 p-0 cursor-pointer transition-colors whitespace-nowrap"
          >
            <span>Back to top</span>
            <ArrowUpSvg />
          </button>
        </div>
      </motion.div>
    </footer>
  );
}

import {ArrowRight} from 'lucide-react';

export {BlogHeader} from './PageHeaders';

interface BlogPageProps {
  onExploreLibrary: () => void;
  onOpenDocs: () => void;
}

export default function BlogPage({onExploreLibrary, onOpenDocs}: BlogPageProps) {
  return (
    <section
      aria-label="FiWi Blog"
      className="w-full bg-white dark:bg-black px-4 sm:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28 flex justify-center transition-colors duration-200"
    >
      <div className="w-full max-w-[820px] flex flex-col">
        {/* Single Category Bar: Intro */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#02031A]/12 dark:border-white/15">
          <div className="flex items-center gap-6" role="tablist" aria-label="Blog categories">
            <button
              type="button"
              role="tab"
              aria-selected="true"
              className="relative pb-2 -mb-[17px] border-0 border-b-2 border-[#1020F5] dark:border-[#60A5FA] bg-transparent text-[14px] font-semibold tracking-[-0.01em] text-[#02031A] dark:text-white cursor-pointer whitespace-nowrap shrink-0"
            >
              Intro
            </button>
          </div>
          <span className="mono text-[12px] tabular-nums text-[#02031A]/50 dark:text-white/50 whitespace-nowrap">
            1 article
          </span>
        </div>

        {/* Featured Intro Article */}
        <article className="pt-10 sm:pt-12">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#02031A]/60 dark:text-white/60">
            <span className="font-semibold text-[#1020F5] dark:text-[#60A5FA]">Intro</span>
            <span aria-hidden="true">·</span>
            <time dateTime="2026-11-15">November 15, 2026</time>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">4 min read</span>
          </div>

          <h2 className="font-display mt-4 text-[40px] sm:text-[56px] font-medium leading-[0.98] tracking-[-0.015em] text-[#02031A] dark:text-white text-balance">
            Introducing FiWi: Where the web comes together.
          </h2>

          <p className="mt-5 text-[18px] sm:text-[20px] font-medium leading-[1.5] text-[#02031A]/80 dark:text-white/80 max-w-[68ch]">
            FiWi is a curated platform for discovering, exploring, and sharing websites from across the internet. From beautifully designed websites and SaaS products to AI-built projects and collaboration opportunities, FiWi brings everything together in one organized library.
          </p>

          <div className="mt-8 pt-8 border-t border-[#02031A]/10 dark:border-white/12 flex flex-col gap-6 text-[16px] leading-[1.72] text-[#02031A]/82 dark:text-white/80 max-w-[68ch]">
            <p className="m-0">
              Instead of scattering inspiration across browser bookmarks, screenshots, and disconnected threads, FiWi gives every website clear context—how it was crafted, which tools shaped it, or how you can participate.
            </p>

            <p className="m-0">
              Explore four focused collections designed to help you move effortlessly from discovery to action:
            </p>

            <div className="py-2 border-y border-[#02031A]/10 dark:border-white/12 divide-y divide-[#02031A]/10 dark:divide-white/12">
              <div className="py-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                <span className="w-[120px] shrink-0 font-semibold text-[#02031A] dark:text-white">
                  Normal
                </span>
                <span className="text-[15px] leading-[1.6] text-[#02031A]/75 dark:text-white/75">
                  Traditional websites, SaaS products, portfolios, and crafted digital experiences organized across six showcase themes.
                </span>
              </div>
              <div className="py-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                <span className="w-[120px] shrink-0 font-semibold text-[#02031A] dark:text-white">
                  Vibecoded
                </span>
                <span className="text-[15px] leading-[1.6] text-[#02031A]/75 dark:text-white/75">
                  AI-generated projects paired with the AI tools, prompts, tech stack, and building insights behind them.
                </span>
              </div>
              <div className="py-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                <span className="w-[120px] shrink-0 font-semibold text-[#02031A] dark:text-white">
                  Connect
                </span>
                <span className="text-[15px] leading-[1.6] text-[#02031A]/75 dark:text-white/75">
                  Collaboration opportunities where creators share live projects and connect directly with builders and contributors.
                </span>
              </div>
              <div className="py-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                <span className="w-[120px] shrink-0 font-semibold text-[#02031A] dark:text-white">
                  Test
                </span>
                <span className="text-[15px] leading-[1.6] text-[#02031A]/75 dark:text-white/75">
                  Authorized website testing opportunities with defined scope briefs, contact details, and transparent testing budgets.
                </span>
              </div>
            </div>

            <p className="m-0">
              Save your discoveries into personal collections, get inspired by innovative projects, and connect with creators. Whether you are looking for inspiration, your next project, or people to build with, FiWi is where the web comes together.
            </p>
          </div>

          {/* Article Footer Actions */}
          <div className="mt-10 pt-8 border-t border-[#02031A]/12 dark:border-white/15 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onExploreLibrary}
              className="btn h-[46px] px-6 text-[16px] bg-[#02031A] text-white hover:bg-[#1020F5] dark:bg-white dark:text-[#02031A] dark:hover:bg-white/85 inline-flex items-center gap-2"
            >
              <span>Explore the library</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenDocs}
              className="inline-flex items-center gap-1.5 lab text-[15px] text-[#1020F5] dark:text-[#60A5FA] hover:opacity-80 bg-transparent border-0 p-0 cursor-pointer whitespace-nowrap"
            >
              <span>Read the documentation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

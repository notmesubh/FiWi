import {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowLeft, ArrowRight, ChevronDown, Search, X} from 'lucide-react';
import type {SiteCategory} from '../types/fiwi';
import {
  FIWI_TRANSITION_FAST,
  fiwiPopoverVariants,
} from '../lib/motion';

export type DocTopicId =
  | 'overview'
  | 'collections'
  | 'normal-vibecoded'
  | 'connect-test'
  | 'submission-flow'
  | 'review-guidelines'
  | 'plans-addons';

interface DocSectionBlock {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

interface DocTopic {
  id: DocTopicId;
  group: string;
  title: string;
  summary: string;
  sections: DocSectionBlock[];
  cta?: {
    label: string;
    action: 'library' | 'submit' | 'pricing' | 'saved';
  };
}

const DOC_TOPICS: DocTopic[] = [
  {
    id: 'overview',
    group: 'Getting Started',
    title: 'Overview',
    summary:
      'FiWi is a curated platform for discovering, exploring, and sharing websites—bringing traditional sites, AI-built Vibecoded projects, collaboration opportunities, and authorized testing together in one organized library.',
    sections: [
      {
        heading: 'How FiWi is organized',
        paragraphs: [
          'Every listing in FiWi belongs to one of four collections—Normal for traditional websites, Vibecoded for AI-generated projects with their tools and building insights, Connect for collaboration opportunities, and Test for authorized website testing—alongside six thematic categories.',
          'Browse the library from the navigation bar, search interactively on the homepage, or click any submitted website card to open its full detail view.',
        ],
      },
      {
        heading: 'Core workflows',
        paragraphs: ['Depending on what you are looking for, FiWi supports three main workflows:'],
        bullets: [
          'Discover & save: Search or filter by category and save discoveries into named personal collections stored in your browser.',
          'Inspect & connect: Open any submitted website to read Vibecoded tools and building insights, contact creators on Connect, or review Test scope and budgets.',
          'Share your work: Submit websites in three steps so every detail you provide becomes inspectable in the library.',
        ],
      },
    ],
    cta: {label: 'Browse all websites', action: 'library'},
  },
  {
    id: 'collections',
    group: 'Getting Started',
    title: 'Personal Collections',
    summary:
      'Save your discoveries into custom named personal collections, organize projects by theme, and revisit them anytime.',
    sections: [
      {
        heading: 'Creating & organizing collections',
        paragraphs: [
          'Once signed in, open Personal Collections from the bookmark icon at the top-right edge of the screen. You start with a General collection and can create, rename, or remove custom named collections at any time.',
          'Every submitted website card and detail modal lets you assign a discovery into one or more named collections—or create a new collection on the spot.',
        ],
      },
      {
        heading: 'Saved websites limits by plan',
        paragraphs: [
          'Your Saved websites page quota scales with your active FiWi plan:',
        ],
        bullets: [
          'Free: 15 websites — enough to experience FiWi.',
          'Plus: 100 websites — suitable for regular users.',
          'Pro: 500 websites — for heavy researchers and creators.',
          'All collections and saved discoveries are stored locally in your browser.',
        ],
      },
    ],
    cta: {label: 'Open Personal Collections', action: 'saved'},
  },
  {
    id: 'normal-vibecoded',
    group: 'Library Categories',
    title: 'Normal & Vibecoded',
    summary:
      'Explore traditional websites in Normal and AI-generated projects with their tools, prompts, and building insights in Vibecoded.',
    sections: [
      {
        heading: 'Normal',
        paragraphs: [
          'Normal is FiWi’s collection for traditional websites—beautifully designed SaaS products, studio portfolios, editorial publications, and interactive web experiences.',
        ],
      },
      {
        heading: 'Vibecoded',
        paragraphs: [
          'Vibecoded highlights AI-generated projects. Clicking any Vibecoded card opens a detail view displaying the exact AI tools, tech stack, original prompt, and development steps entered by the creator during submission.',
        ],
        table: {
          headers: ['Field', 'Normal', 'Vibecoded'],
          rows: [
            ['Website URL & summary', 'Required', 'Required'],
            ['Thematic sub-category', 'Required', 'Required'],
            ['AI tools & tech stack', 'Not included', 'Entered in Step 2 & shown in detail view'],
            ['Original prompt & steps', 'Not included', 'Entered in Step 2 & shown in detail view'],
          ],
        },
      },
    ],
  },
  {
    id: 'connect-test',
    group: 'Library Categories',
    title: 'Connect & Test',
    summary:
      'Find people to build with in Connect, or participate in clearly scoped, explicitly authorized website testing in Test.',
    sections: [
      {
        heading: 'Connect',
        paragraphs: [
          'Connect helps creators find collaborators—designers, developers, writers, or product partners. Opening a Connect card surfaces the creator contact details, reason for contact, and what collaborators they are looking for.',
        ],
      },
      {
        heading: 'Test & Authorized Scope',
        paragraphs: [
          'Test features authorized website testing opportunities posted by project owners. Each Test detail view shows the stated scope, testing contact details, authorization confirmation, and the testing payment budget entered by the owner.',
        ],
        bullets: [
          'Only test endpoints, features, or flows explicitly listed inside the submission’s authorized scope.',
          'Respect all reporting instructions and non-destructive testing boundaries specified by the owner.',
          'Submitting to Test requires specifying what you can pay for testing (or 0 if unpaid) and confirming explicit authorization.',
        ],
      },
    ],
  },
  {
    id: 'submission-flow',
    group: 'Submissions',
    title: 'Submitting a Website',
    summary:
      'Publish directly to FiWi in three guided steps: choose your collection, enter website details and insights, and attach visual media before reviewing.',
    sections: [
      {
        heading: 'Step 1 — Collection & category',
        paragraphs: [
          'Sign in to your FiWi account and click "Submit a website" in the navigation bar. Select Normal, Vibecoded, Connect, or Test along with a thematic sub-category.',
        ],
      },
      {
        heading: 'Step 2 — Details & category insights',
        paragraphs: [
          'Enter the website name, canonical URL, summary description, and optional hero headline. Vibecoded includes AI tools, stack, prompts, and steps; Connect and Test include creator contact info, briefs, and Test payment budget.',
        ],
      },
      {
        heading: 'Step 3 — Media & publishing',
        paragraphs: [
          'Upload a 16:9 hero thumbnail and optional gallery images, review your entry, and submit. Only the fields you entered will be shown when visitors inspect your website card.',
        ],
      },
    ],
    cta: {label: 'Submit a website', action: 'submit'},
  },
  {
    id: 'review-guidelines',
    group: 'Submissions',
    title: 'Review Guidelines',
    summary:
      'What we look for when reviewing website submissions to keep the FiWi library high-signal, legible, and safe.',
    sections: [
      {
        heading: 'Quality & clarity standards',
        paragraphs: [
          'Submissions should link to a live, accessible website with accurate titles and descriptions free of promotional hype.',
        ],
        bullets: [
          'Provide a working HTTPS URL with clear purpose and functional navigation.',
          'Avoid duplicate submissions for the same domain within the same category.',
          'Ensure screenshots accurately represent the live site without misleading overlays.',
          'For Test listings, clearly specify what is in scope and out of scope before publishing.',
        ],
      },
    ],
  },
  {
    id: 'plans-addons',
    group: 'Membership',
    title: 'Plans & Add-ons',
    summary:
      'Start for free with core discovery and collections, upgrade to Plus or Pro for higher submission limits, or select one-time promotional add-ons.',
    sections: [
      {
        heading: 'Membership tiers',
        paragraphs: [
          'Every FiWi member starts on the Free tier with access to all four library sections, search, up to 15 saved websites, 3 collections, and 5 website submissions.',
        ],
        table: {
          headers: ['Plan', 'Monthly', 'Annual', 'Saved websites & key limits'],
          rows: [
            ['Free', '$0.00', '$0.00', '15 saved websites, 3 collections, 5 submissions'],
            ['Plus', '$2.99/mo', '$2.33/mo', '100 saved websites, unlimited collections, 25 submissions'],
            ['Pro', '$6.99/mo', '$5.45/mo', '500 saved websites, unlimited submissions, priority review, 5 promo credits'],
          ],
        },
      },
      {
        heading: 'Additional add-ons',
        paragraphs: [
          'Need temporary visibility without changing your plan? On the Pricing page you can purchase add-ons such as Featured Website (7 or 30 days), Promoted Connect or Test listings, Priority submission review, and Startup Spotlight.',
        ],
      },
    ],
    cta: {label: 'View pricing & add-ons', action: 'pricing'},
  },
];

export {DocsHeader} from './PageHeaders';

interface DocsPageProps {
  onNavigateLibrary: (tab?: SiteCategory | 'All') => void;
  onOpenSubmit: () => void;
  onOpenPricing: () => void;
  onOpenSaved: () => void;
}

export default function DocsPage({
  onNavigateLibrary,
  onOpenSubmit,
  onOpenPricing,
  onOpenSaved,
}: DocsPageProps) {
  const [activeTopicId, setActiveTopicId] = useState<DocTopicId>('overview');
  const [filterQuery, setFilterQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredTopics = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return DOC_TOPICS;
    return DOC_TOPICS.filter(
      (topic) =>
        topic.title.toLowerCase().includes(q) ||
        topic.group.toLowerCase().includes(q) ||
        topic.summary.toLowerCase().includes(q) ||
        topic.sections.some(
          (sec) =>
            sec.heading.toLowerCase().includes(q) ||
            sec.paragraphs.some((p) => p.toLowerCase().includes(q)),
        ),
    );
  }, [filterQuery]);

  const groupedTopics = useMemo(() => {
    const groups: {name: string; items: DocTopic[]}[] = [];
    for (const topic of filteredTopics) {
      let existing = groups.find((g) => g.name === topic.group);
      if (!existing) {
        existing = {name: topic.group, items: []};
        groups.push(existing);
      }
      existing.items.push(topic);
    }
    return groups;
  }, [filteredTopics]);

  const currentTopic =
    DOC_TOPICS.find((t) => t.id === activeTopicId) ?? filteredTopics[0] ?? DOC_TOPICS[0];

  const currentIndex = DOC_TOPICS.findIndex((t) => t.id === currentTopic.id);
  const prevTopic = currentIndex > 0 ? DOC_TOPICS[currentIndex - 1] : null;
  const nextTopic = currentIndex < DOC_TOPICS.length - 1 ? DOC_TOPICS[currentIndex + 1] : null;

  const handleCta = (action: NonNullable<DocTopic['cta']>['action']) => {
    if (action === 'library') onNavigateLibrary('All');
    else if (action === 'submit') onOpenSubmit();
    else if (action === 'pricing') onOpenPricing();
    else if (action === 'saved') onOpenSaved();
  };

  return (
    <section
      aria-label="FiWi Documentation"
      className="w-full bg-white dark:bg-black px-4 sm:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28 flex justify-center transition-colors duration-200"
    >
      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Navigation Sidebar */}
        <aside
          aria-label="Documentation navigation"
          className="lg:col-span-3 lg:sticky lg:top-[84px] flex flex-col gap-4 lg:gap-6 text-left"
        >
          <div className="relative">
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-[#02031A]/45 dark:text-white/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter docs..."
              aria-label="Filter documentation topics"
              className="w-full bg-[#F6F8FC] dark:bg-[#0D0D10] border border-[#02031A]/12 dark:border-white/14 text-[#02031A] dark:text-white placeholder:text-[#02031A]/45 dark:placeholder:text-white/45 pl-9 pr-8 py-2 text-[13px] font-medium outline-none focus:border-[#1020F5] dark:focus:border-[#60A5FA] transition-colors"
            />
            {filterQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                aria-label="Clear documentation filter"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#02031A]/50 dark:text-white/50 hover:text-[#02031A] dark:hover:text-white bg-transparent border-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile/Tablet Topic Dropdown Switcher */}
          <div className="lg:hidden relative">
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="w-full px-3.5 py-2.5 bg-[#F6F8FC] dark:bg-[#0D0D10] border border-[#02031A]/14 dark:border-white/14 flex items-center justify-between gap-2 text-left text-[14px] font-semibold text-[#02031A] dark:text-white cursor-pointer"
            >
              <span className="truncate">
                {currentTopic.group} · {currentTopic.title}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                  mobileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {mobileMenuOpen && (
                <motion.div
                  variants={fiwiPopoverVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-1.5 border border-[#02031A]/14 dark:border-white/16 bg-white dark:bg-[#0D0D10] p-2 shadow-lg flex flex-col gap-3"
                >
                  {groupedTopics.length === 0 ? (
                    <p className="text-[13px] text-[#02031A]/60 dark:text-white/60 m-0 px-2 py-1">
                      No matching topics.
                    </p>
                  ) : (
                    groupedTopics.map((group) => (
                      <div key={group.name} className="flex flex-col gap-1">
                        <div className="mono text-[10px] uppercase tracking-[0.08em] text-[#02031A]/50 dark:text-white/50 px-2 pt-1">
                          {group.name}
                        </div>
                        {group.items.map((item) => {
                          const isActive = item.id === currentTopic.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setActiveTopicId(item.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 text-[13.5px] border-0 cursor-pointer transition-colors ${
                                isActive
                                  ? 'bg-[#F2F5FC] dark:bg-white/10 font-semibold text-[#1020F5] dark:text-[#60A5FA]'
                                  : 'bg-transparent font-medium text-[#02031A]/80 dark:text-white/80 hover:bg-[#F7F9FC] dark:hover:bg-white/[0.04]'
                              }`}
                            >
                              {item.title}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Sidebar Nav */}
          <div className="hidden lg:block">
            {groupedTopics.length === 0 ? (
              <p className="text-[13px] text-[#02031A]/60 dark:text-white/60 m-0">
                No matching topics for &ldquo;{filterQuery}&rdquo;.
              </p>
            ) : (
              <nav className="flex flex-col gap-6">
                {groupedTopics.map((group) => (
                  <div key={group.name} className="flex flex-col gap-1.5">
                    <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/50 dark:text-white/50 pb-1">
                      {group.name}
                    </div>
                    <ul className="m-0 p-0 list-none flex flex-col gap-0.5">
                      {group.items.map((item) => {
                        const isActive = item.id === currentTopic.id;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => setActiveTopicId(item.id)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`w-full text-left px-3 py-2 text-[14px] border-0 cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                                isActive
                                  ? 'bg-[#F2F5FC] dark:bg-white/10 font-semibold text-[#1020F5] dark:text-[#60A5FA]'
                                  : 'bg-transparent font-medium text-[#02031A]/72 dark:text-white/72 hover:text-[#02031A] dark:hover:text-white hover:bg-[#F7F9FC] dark:hover:bg-white/[0.04]'
                              }`}
                            >
                              <span>{item.title}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            )}
          </div>
        </aside>

        {/* Main Documentation Reading Area */}
        <div className="lg:col-span-9 w-full max-w-[760px] text-left">
          <article className="w-full">
              <div className="pb-6 border-b border-[#02031A]/12 dark:border-white/15">
                <div className="flex items-center gap-2 text-[13px] text-[#02031A]/55 dark:text-white/55">
                  <span className="font-semibold text-[#1020F5] dark:text-[#60A5FA]">
                    {currentTopic.group}
                  </span>
                  <span aria-hidden="true">/</span>
                  <span>{currentTopic.title}</span>
                </div>

                <h2 className="font-display mt-3 text-[42px] sm:text-[56px] font-medium leading-[0.96] tracking-[-0.015em] text-[#02031A] dark:text-white">
                  {currentTopic.title}
                </h2>

                <p className="mt-4 text-[17px] sm:text-[18px] font-medium leading-[1.55] text-[#02031A]/75 dark:text-white/75 max-w-[66ch]">
                  {currentTopic.summary}
                </p>
              </div>

              <div className="pt-8 flex flex-col gap-10">
                {currentTopic.sections.map((section) => (
                  <section key={section.heading} className="flex flex-col gap-4">
                    <h3 className="text-[20px] sm:text-[22px] font-semibold tracking-[-0.02em] text-[#02031A] dark:text-white m-0">
                      {section.heading}
                    </h3>

                    {section.paragraphs.map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className="m-0 text-[15.5px] sm:text-[16px] leading-[1.68] text-[#02031A]/80 dark:text-white/80 max-w-[68ch]"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets && (
                      <ul className="m-0 pl-5 flex flex-col gap-2.5 text-[15px] leading-[1.6] text-[#02031A]/80 dark:text-white/80 max-w-[66ch]">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}

                    {section.table && (
                      <div className="mt-2 w-full overflow-x-auto border border-[#02031A]/12 dark:border-white/14">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b border-[#02031A]/12 dark:border-white/14 bg-[#F7F9FC] dark:bg-[#0D0D10]">
                              {section.table.headers.map((header) => (
                                <th
                                  key={header}
                                  scope="col"
                                  className="py-3 px-4 mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#02031A]/65 dark:text-white/65"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={
                                  rIdx < section.table!.rows.length - 1
                                    ? 'border-b border-[#02031A]/10 dark:border-white/10'
                                    : undefined
                                }
                              >
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`py-3 px-4 text-[14px] tabular-nums ${
                                      cIdx === 0
                                        ? 'font-medium text-[#02031A] dark:text-white'
                                        : 'text-[#02031A]/75 dark:text-white/75'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                ))}

                {currentTopic.cta && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleCta(currentTopic.cta!.action)}
                      className="btn h-[44px] px-6 text-[15px] bg-[#02031A] text-white hover:bg-[#1020F5] dark:bg-white dark:text-[#02031A] dark:hover:bg-white/85 inline-flex items-center gap-2"
                    >
                      <span>{currentTopic.cta.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Previous / Next Documentation Topic Navigation */}
              <div className="mt-12 pt-6 border-t border-[#02031A]/12 dark:border-white/15 flex items-center justify-between gap-4">
                {prevTopic ? (
                  <button
                    type="button"
                    onClick={() => setActiveTopicId(prevTopic.id)}
                    className="group flex flex-col items-start gap-1 text-left bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/50 dark:text-white/50 inline-flex items-center gap-1">
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
                      Previous
                    </span>
                    <span className="text-[15px] font-semibold text-[#02031A] dark:text-white group-hover:text-[#1020F5] dark:group-hover:text-[#60A5FA] transition-colors">
                      {prevTopic.title}
                    </span>
                  </button>
                ) : (
                  <span />
                )}

                {nextTopic ? (
                  <button
                    type="button"
                    onClick={() => setActiveTopicId(nextTopic.id)}
                    className="group flex flex-col items-end gap-1 text-right bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/50 dark:text-white/50 inline-flex items-center gap-1">
                      Next
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </span>
                    <span className="text-[15px] font-semibold text-[#02031A] dark:text-white group-hover:text-[#1020F5] dark:group-hover:text-[#60A5FA] transition-colors">
                      {nextTopic.title}
                    </span>
                  </button>
                ) : (
                  <span />
                )}
              </div>
          </article>
        </div>
      </div>
    </section>
  );
}

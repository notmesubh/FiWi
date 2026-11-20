import {useEffect, useRef, useState, type FormEvent} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowRight, Check, Loader2} from 'lucide-react';
import {
  FIWI_TRANSITION_FAST,
  fiwiPanelRevealVariants,
} from '../lib/motion';

/* -------------------------------------------------------------------------- */
/*  About Page                                                                */
/* -------------------------------------------------------------------------- */

export {AboutHeader, ContactHeader, LegalHeader} from './PageHeaders';

export function AboutPage({
  onExploreLibrary,
  onOpenBlog,
  onOpenDocs,
}: {
  onExploreLibrary: () => void;
  onOpenBlog: () => void;
  onOpenDocs: () => void;
}) {
  return (
    <section
      aria-label="About FiWi"
      className="w-full bg-white dark:bg-black px-4 sm:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28 flex justify-center transition-colors duration-200"
    >
      <div className="w-full max-w-[820px] flex flex-col text-left">
        <h2 className="font-display text-[36px] sm:text-[50px] font-medium leading-[0.98] tracking-[-0.015em] text-[#02031A] dark:text-white text-balance">
          Where the web comes together, in one organized library.
        </h2>

        <p className="mt-5 text-[17px] sm:text-[18px] font-medium leading-[1.55] text-[#02031A]/75 dark:text-white/75 max-w-[66ch]">
          From beautifully designed websites and SaaS products to AI-built projects and collaboration opportunities, FiWi brings everything together so you can save discoveries into personal collections, get inspired, and connect with creators.
        </p>

        <div className="mt-10 border-y border-[#02031A]/12 dark:border-white/14 divide-y divide-[#02031A]/10 dark:divide-white/12">
          <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6">
            <div className="sm:col-span-4 font-semibold text-[16px] text-[#02031A] dark:text-white">
              Normal &amp; Personal Collections
            </div>
            <div className="sm:col-span-8 text-[15px] leading-[1.6] text-[#02031A]/75 dark:text-white/75">
              Explore traditional websites, SaaS products, and creative studios across six categories, and save your discoveries into custom named personal collections.
            </div>
          </div>

          <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6">
            <div className="sm:col-span-4 font-semibold text-[16px] text-[#02031A] dark:text-white">
              Vibecoded Building Insights
            </div>
            <div className="sm:col-span-8 text-[15px] leading-[1.6] text-[#02031A]/75 dark:text-white/75">
              Explore AI-generated projects alongside the AI tools, tech stack, original prompts, and building insights shared by their creators.
            </div>
          </div>

          <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6">
            <div className="sm:col-span-4 font-semibold text-[16px] text-[#02031A] dark:text-white">
              Connect &amp; Authorized Test
            </div>
            <div className="sm:col-span-8 text-[15px] leading-[1.6] text-[#02031A]/75 dark:text-white/75">
              Connect with creators looking for collaborators, or explore explicitly authorized website testing opportunities with clear scope and testing budgets.
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={onExploreLibrary}
            className="btn h-[46px] px-6 text-[16px] bg-[#02031A] text-white hover:bg-[#1020F5] dark:bg-white dark:text-[#02031A] dark:hover:bg-white/85 inline-flex items-center gap-2"
          >
            <span>Explore sites</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenBlog}
            className="lab text-[15px] text-[#1020F5] dark:text-[#60A5FA] hover:opacity-80 bg-transparent border-0 p-0 cursor-pointer"
          >
            Read the Intro post
          </button>

          <button
            type="button"
            onClick={onOpenDocs}
            className="lab text-[15px] text-[#02031A]/75 dark:text-white/75 hover:text-[#1020F5] dark:hover:text-white bg-transparent border-0 p-0 cursor-pointer"
          >
            Documentation
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contact Page                                                              */
/* -------------------------------------------------------------------------- */



export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General inquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const sendTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Please include a brief message (at least 10 characters).');
      return;
    }

    setIsSending(true);
    if (sendTimerRef.current !== null) {
      window.clearTimeout(sendTimerRef.current);
    }
    sendTimerRef.current = window.setTimeout(() => {
      sendTimerRef.current = null;
      setIsSending(false);
      setSubmitted(true);
    }, 240);
  };

  return (
    <section
      aria-label="Contact FiWi"
      className="w-full bg-white dark:bg-black px-4 sm:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28 flex justify-center transition-colors duration-200"
    >
      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start text-left">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div>
            <h2 className="font-display text-[36px] sm:text-[44px] font-medium leading-[0.98] tracking-[-0.015em] text-[#02031A] dark:text-white">
              Get in touch
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-[#02031A]/75 dark:text-white/75">
              Send us a message about website curation, account access, or add-on placements. We review all inquiries in the order received.
            </p>
          </div>

          <div className="border-t border-[#02031A]/12 dark:border-white/14 divide-y divide-[#02031A]/10 dark:divide-white/12">
            <div className="py-4">
              <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                General &amp; Support
              </div>
              <div className="mt-1 text-[15px] font-medium text-[#02031A] dark:text-white">
                hello@fiwi.gallery
              </div>
            </div>
            <div className="py-4">
              <div className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/55 dark:text-white/55">
                Submissions &amp; Testing Scope
              </div>
              <div className="mt-1 text-[15px] font-medium text-[#02031A] dark:text-white">
                review@fiwi.gallery
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div
                key="contact-submitted"
                variants={fiwiPanelRevealVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                role="status"
                className="border border-[#02031A]/14 dark:border-white/16 bg-[#F7F9FC] dark:bg-[#0D0D10] p-7 sm:p-8 flex flex-col gap-4"
              >
                <div className="w-9 h-9 rounded-full bg-[#1020F5] text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <h3 className="font-display text-[30px] font-medium leading-none text-[#02031A] dark:text-white">
                  Message received
                </h3>
                <p className="m-0 text-[15px] leading-[1.6] text-[#02031A]/75 dark:text-white/75">
                  Thanks, {name.trim()}. Your note regarding <strong>{topic}</strong> has been recorded for {email.trim()}.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="lab text-[14px] text-[#1020F5] dark:text-[#60A5FA] hover:opacity-80 bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="contact-form"
                variants={fiwiPanelRevealVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onSubmit={handleSubmit}
                noValidate
                className="border border-[#02031A]/12 dark:border-white/14 bg-[#F7F9FC] dark:bg-[#0D0D10] p-6 sm:p-8 flex flex-col gap-5"
              >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/70 dark:text-white/70">
                    Name
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    required
                    className="w-full bg-white dark:bg-[#141418] border border-[#02031A]/16 dark:border-white/16 text-[#02031A] dark:text-white px-3 py-2.5 text-[14px] font-medium outline-none focus:border-[#1020F5] dark:focus:border-[#60A5FA]"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/70 dark:text-white/70">
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full bg-white dark:bg-[#141418] border border-[#02031A]/16 dark:border-white/16 text-[#02031A] dark:text-white px-3 py-2.5 text-[14px] font-medium outline-none focus:border-[#1020F5] dark:focus:border-[#60A5FA]"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/70 dark:text-white/70">
                  Topic
                </span>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-white dark:bg-[#141418] border border-[#02031A]/16 dark:border-white/16 text-[#02031A] dark:text-white px-3 py-2.5 text-[14px] font-medium outline-none focus:border-[#1020F5] dark:focus:border-[#60A5FA]"
                >
                  <option value="General inquiry">General inquiry</option>
                  <option value="Website submission">Website submission</option>
                  <option value="Connect & collaborations">Connect &amp; collaborations</option>
                  <option value="Test scope & safety">Test scope &amp; safety</option>
                  <option value="Billing & add-ons">Billing &amp; add-ons</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#02031A]/70 dark:text-white/70">
                  Message
                </span>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  required
                  className="w-full bg-white dark:bg-[#141418] border border-[#02031A]/16 dark:border-white/16 text-[#02031A] dark:text-white px-3 py-2.5 text-[14px] font-medium outline-none focus:border-[#1020F5] dark:focus:border-[#60A5FA] resize-y"
                />
              </label>

              {error && (
                <div
                  role="alert"
                  className="border border-[#B91C1C]/35 bg-white dark:bg-[#1F1215] px-3.5 py-2.5 text-[13px] font-medium text-[#991B1B] dark:text-[#FCA5A5]"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="btn h-[46px] bg-[#02031A] text-white hover:bg-[#1020F5] dark:bg-white dark:text-[#02031A] dark:hover:bg-white/85 disabled:opacity-65 inline-flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send message</span>
                )}
              </button>
            </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Legal Page                                                                */
/* -------------------------------------------------------------------------- */



type LegalTab = 'terms' | 'privacy' | 'testing';

export function LegalPage() {
  const [activeTab, setActiveTab] = useState<LegalTab>('terms');

  return (
    <section
      aria-label="FiWi Legal Information"
      className="w-full bg-white dark:bg-black px-4 sm:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28 flex justify-center transition-colors duration-200"
    >
      <div className="w-full max-w-[820px] flex flex-col text-left">
        <div
          role="tablist"
          aria-label="Legal documents"
          className="flex flex-wrap gap-6 pb-4 border-b border-[#02031A]/12 dark:border-white/15"
        >
          {(
            [
              {id: 'terms', label: 'Terms of Use'},
              {id: 'privacy', label: 'Privacy Policy'},
              {id: 'testing', label: 'Authorized Testing Policy'},
            ] as const
          ).map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-2 -mb-[17px] border-0 bg-transparent text-[14px] cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                  isSelected
                    ? 'font-semibold text-[#02031A] dark:text-white'
                    : 'font-medium text-[#02031A]/60 dark:text-white/60 hover:text-[#02031A] dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {isSelected && (
                  <motion.span
                    layoutId="legal-active-underline"
                    transition={FIWI_TRANSITION_FAST}
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-[#1020F5] dark:bg-[#60A5FA]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'terms' && (
          <div className="pt-8 flex flex-col gap-5 text-[15.5px] leading-[1.7] text-[#02031A]/80 dark:text-white/80 max-w-[68ch]">
              <div className="mono text-[12px] text-[#02031A]/50 dark:text-white/50">
                Last updated: November 15, 2026
              </div>
              <h2 className="font-display text-[34px] font-medium leading-none text-[#02031A] dark:text-white m-0">
                Terms of Use
              </h2>
              <p className="m-0">
                By accessing or submitting websites to FiWi, you confirm that you have the right to share any submitted links, descriptions, screenshots, and project notes.
              </p>
              <p className="m-0">
                Submissions may be reviewed, categorized, or removed if they contain broken destinations, deceptive claims, unauthorized testing targets, or abusive material.
              </p>
              <p className="m-0">
                Membership plans and promotional add-ons apply to the account or listing specified at checkout. Free discovery remains accessible without a paid plan.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="pt-8 flex flex-col gap-5 text-[15.5px] leading-[1.7] text-[#02031A]/80 dark:text-white/80 max-w-[68ch]">
              <div className="mono text-[12px] text-[#02031A]/50 dark:text-white/50">
                Last updated: November 15, 2026
              </div>
              <h2 className="font-display text-[34px] font-medium leading-none text-[#02031A] dark:text-white m-0">
                Privacy Policy
              </h2>
              <p className="m-0">
                FiWi collects only the information needed to maintain your profile, saved websites, and submitted listings. In this local preview, account records, bookmarks, and submissions are stored directly in your browser storage.
              </p>
              <p className="m-0">
                You can update your profile name and handle from Account Settings or log out at any time.
              </p>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="pt-8 flex flex-col gap-5 text-[15.5px] leading-[1.7] text-[#02031A]/80 dark:text-white/80 max-w-[68ch]">
              <div className="mono text-[12px] text-[#02031A]/50 dark:text-white/50">
                Last updated: November 15, 2026
              </div>
              <h2 className="font-display text-[34px] font-medium leading-none text-[#02031A] dark:text-white m-0">
                Authorized Testing Policy
              </h2>
              <p className="m-0">
                Listings published under the Test category include explicit authorization from the project owner within a stated scope. Testers must stay strictly inside the authorized URLs, methods, and timeframes defined on the listing.
              </p>
              <p className="m-0">
                Any out-of-scope probing, denial-of-service activity, or unauthorized data extraction is strictly prohibited.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}

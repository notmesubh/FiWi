import {useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {Plus} from 'lucide-react';
import {FIWI_TRANSITION_FAST, FIWI_TRANSITION_REVEAL, FIWI_VIEWPORT} from '../lib/motion';

interface FaqItem {
  number: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    number: '01',
    question: 'What is FiWi?',
    answer:
      'FiWi is a curated platform for discovering, exploring, and sharing websites from across the internet—bringing traditional websites, SaaS products, AI-built projects, collaboration opportunities, and authorized testing together in one organized library.',
  },
  {
    number: '02',
    question: 'What are the four main collections on FiWi?',
    answer:
      'Explore Normal for traditional websites, Vibecoded for AI-generated projects with their tools and building insights, Connect for collaboration opportunities, and Test for authorized website testing opportunities.',
  },
  {
    number: '03',
    question: 'What is the Vibecoded collection?',
    answer:
      'Vibecoded showcases AI-generated projects alongside the AI tools, tech stack, original prompts, and building insights shared by the creator during submission.',
  },
  {
    number: '04',
    question: 'Can I submit my own website to FiWi?',
    answer:
      'Yes. Signed-in members can submit websites into Normal, Vibecoded, Connect, or Test. Every detail you enter during submission becomes inspectable when visitors open your website card.',
  },
  {
    number: '05',
    question: 'What is the Connect collection?',
    answer:
      'Connect highlights collaboration opportunities where founders, designers, and developers share projects, specify what they are looking for, and connect directly with builders.',
  },
  {
    number: '06',
    question: 'What is the Test collection?',
    answer:
      'Test features authorized website testing opportunities posted by project owners with clear scope definitions, owner authorization confirmation, and transparent testing budgets. Always stay within the stated authorized scope.',
  },
  {
    number: '07',
    question: 'Can I save discoveries into personal collections?',
    answer:
      'Yes. Create named personal collections—such as design inspiration or project leads—save discoveries from anywhere in FiWi, or bookmark external URLs directly into any collection. Free accounts can save up to 15 websites, Plus supports 100 websites, and Pro supports 500 websites.',
  },
  {
    number: '08',
    question: 'Is FiWi free to use?',
    answer:
      'FiWi’s core discovery experience is free for everyone, including up to 15 saved websites on the Free plan. Plus ($2.99/mo) expands your Saved websites limit to 100, and Pro ($6.99/mo) expands it to 500 for heavy researchers and creators.',
  },
  {
    number: '09',
    question: 'Who is FiWi designed for?',
    answer:
      'FiWi is built for designers, developers, AI builders, founders, testers, and anyone looking for inspiration, their next project, or people to build with.',
  },
  {
    number: '10',
    question: 'How can I contribute to FiWi?',
    answer:
      'Submit traditional websites to Normal, share AI-built projects and prompts in Vibecoded, post collaboration opportunities in Connect, or offer authorized testing briefs in Test.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq-section"
      aria-label="Frequently Asked Questions"
      className="fiwi-cv-auto w-full bg-white dark:bg-black px-4 sm:px-8 pt-6 sm:pt-10 pb-24 sm:pb-32 flex justify-center transition-colors duration-200"
    >
      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <motion.div
          initial={{opacity: 0, y: 12}}
          whileInView={{opacity: 1, y: 0}}
          viewport={FIWI_VIEWPORT}
          transition={FIWI_TRANSITION_REVEAL}
          className="lg:col-span-4 lg:sticky lg:top-[84px] text-left"
        >
          <div className="mono text-[12px] uppercase tracking-[0.1em] text-[#02031A]/50 dark:text-white/50">
            Questions
          </div>
          <h2 className="font-display mt-3 font-medium tracking-[-0.015em] leading-[0.96] text-[48px] sm:text-[64px] lg:text-[72px] text-[#02031A] dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 max-w-[360px] text-[16px] font-medium leading-[1.5] text-[#02031A]/65 dark:text-white/65">
            Everything you need to know about discovering, sharing, collaborating, and testing on FiWi.
          </p>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 12}}
          whileInView={{opacity: 1, y: 0}}
          viewport={FIWI_VIEWPORT}
          transition={FIWI_TRANSITION_REVEAL}
          className="lg:col-span-8 w-full border-t border-[#02031A]/12 dark:border-white/15"
        >
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `fiwi-faq-panel-${item.number}`;
            const buttonId = `fiwi-faq-btn-${item.number}`;

            return (
              <div
                key={item.number}
                className="border-b border-[#02031A]/12 dark:border-white/15"
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
                  className="w-full py-5 sm:py-6 px-1 flex items-start justify-between gap-4 text-left bg-transparent border-0 cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02031A] dark:focus-visible:outline-white"
                >
                  <div className="flex items-baseline gap-4 sm:gap-5 min-w-0">
                    <span className="mono text-[13px] tabular-nums text-[#02031A]/45 dark:text-white/45 shrink-0">
                      {item.number}.
                    </span>
                    <span className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.015em] leading-[1.35] text-[#02031A] dark:text-white group-hover:text-[#02031A]/80 dark:group-hover:text-white/85 transition-colors">
                      {item.question}
                    </span>
                  </div>
                  <Plus
                    aria-hidden="true"
                    className={`w-5 h-5 mt-1 shrink-0 text-[#02031A]/55 dark:text-white/55 group-hover:text-[#02031A] dark:group-hover:text-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? 'rotate-45 text-[#02031A] dark:text-white' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={panelId}
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{opacity: 0, y: -4}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -4}}
                      transition={FIWI_TRANSITION_FAST}
                      className="pl-[38px] sm:pl-[44px] pr-8 pb-6 text-[15px] sm:text-[16px] leading-[1.6] text-[#02031A]/75 dark:text-white/75"
                    >
                      {item.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

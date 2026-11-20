import {AnimatePresence, motion} from 'motion/react';
import {Check} from 'lucide-react';
import {type SubmitStep} from './submitData';
import {FIWI_TAP, fiwiPanelRevealVariants} from '../../lib/motion';

interface StepProgressHeaderProps {
  currentStep: SubmitStep;
  onJumpToStep: (step: 1 | 2 | 3) => void;
}

const STEPS: {num: 1 | 2 | 3; label: string; shortLabel: string}[] = [
  {num: 1, label: 'Category', shortLabel: 'Category'},
  {num: 2, label: 'Website Information', shortLabel: 'Details'},
  {num: 3, label: 'Media & Previews', shortLabel: 'Media'},
];

export default function StepProgressHeader({
  currentStep,
  onJumpToStep,
}: StepProgressHeaderProps) {
  if (currentStep === 'success') return null;

  const numericCurrent = currentStep === 'review' ? 4 : currentStep;

  return (
    <div
      aria-label="Submission progress"
      className="w-full mb-7 pb-5 border-b border-[#02031A]/12"
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
        {STEPS.map((step) => {
          const isCompleted = numericCurrent > step.num;
          const isCurrent = currentStep === step.num;
          const canClick = isCompleted;

          return (
            <motion.button
              key={step.num}
              type="button"
              disabled={!canClick}
              whileTap={canClick ? FIWI_TAP : undefined}
              onClick={() => canClick && onJumpToStep(step.num)}
              aria-current={isCurrent ? 'step' : undefined}
              className={`group flex items-center gap-2.5 sm:gap-3 text-left px-2.5 sm:px-3.5 py-2.5 border transition-colors duration-150 ${
                isCurrent
                  ? 'bg-white border-[#1020F5]/45 shadow-[0_8px_20px_-10px_rgba(16,32,245,0.28)] cursor-default'
                  : isCompleted
                    ? 'bg-white/75 hover:bg-white border-[#02031A]/14 cursor-pointer'
                    : 'bg-white/35 border-[#02031A]/10 opacity-65 cursor-default'
              }`}
            >
              <span
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 mono text-[11px] font-semibold tabular-nums transition-colors ${
                  isCurrent
                    ? 'bg-[#1020F5] text-white'
                    : isCompleted
                      ? 'bg-[#02031A] text-white'
                      : 'bg-[#02031A]/10 text-[#02031A]/70'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.num}
              </span>

              <div className="min-w-0">
                <div className="mono text-[10px] uppercase tracking-[0.08em] text-[#02031A]/55">
                  Step 0{step.num}
                </div>
                <div className="text-[12px] sm:text-[13px] font-semibold text-[#02031A] truncate">
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {currentStep === 'review' && (
          <motion.div
            key="final-preview-banner"
            variants={fiwiPanelRevealVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mt-3 flex items-center justify-between text-[12px] text-[#02031A]/75 px-1"
          >
            <span className="font-medium">
              All three steps completed — review your listing before submitting.
            </span>
            <span className="mono text-[11px] uppercase tracking-[0.08em] text-[#1020F5] font-semibold">
              Final Preview
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

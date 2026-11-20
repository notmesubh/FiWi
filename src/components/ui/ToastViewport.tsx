import {AnimatePresence, motion} from 'motion/react';
import {AlertCircle, CheckCircle2, Info, X} from 'lucide-react';
import {useFiwiStore} from '../../stores/useFiwiStore';
import {FIWI_TRANSITION_FAST} from '../../lib/motion';

export default function ToastViewport() {
  const toasts = useFiwiStore((state) => state.toasts);
  const dismissToast = useFiwiStore((state) => state.dismissToast);

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[95] flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-[380px] pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const isError = toast.tone === 'error';
          const isSuccess = toast.tone === 'success';
          return (
            <motion.div
              key={toast.id}
              initial={{opacity: 0, y: 12, scale: 0.98}}
              animate={{opacity: 1, y: 0, scale: 1}}
              exit={{opacity: 0, y: 8, scale: 0.98}}
              transition={FIWI_TRANSITION_FAST}
              role={isError ? 'alert' : 'status'}
              className={`pointer-events-auto p-3.5 border shadow-[0_18px_40px_-12px_rgba(2,3,26,0.38)] backdrop-blur-xl flex items-start gap-3 text-left ${
                isError
                  ? 'bg-white/95 dark:bg-[#191216]/95 border-[#B91C1C]/45 text-[#991B1B] dark:text-[#FCA5A5]'
                  : isSuccess
                    ? 'bg-white/95 dark:bg-[#0D131C]/95 border-[#1020F5]/35 text-[#02031A] dark:text-white'
                    : 'bg-white/95 dark:bg-[#0D101B]/95 border-[#02031A]/18 dark:border-white/18 text-[#02031A] dark:text-white'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {isError ? (
                  <AlertCircle className="w-4 h-4 text-[#DC2626] dark:text-[#F87171]" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1020F5] dark:text-[#60A5FA]" />
                ) : (
                  <Info className="w-4 h-4 text-[#1020F5] dark:text-[#60A5FA]" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold leading-snug">{toast.title}</div>
                {toast.description && (
                  <p className="mt-0.5 mb-0 text-[12.5px] leading-snug opacity-80 [overflow-wrap:anywhere]">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="p-1 opacity-60 hover:opacity-100 bg-transparent border-0 cursor-pointer text-current shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

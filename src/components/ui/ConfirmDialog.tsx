import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {Loader2, X} from 'lucide-react';
import {useFiwiStore} from '../../stores/useFiwiStore';
import {
  fiwiModalBackdropVariants,
  fiwiModalSurfaceVariants,
} from '../../lib/motion';

export default function ConfirmDialog() {
  const dialog = useFiwiStore((state) => state.confirmDialog);
  const closeConfirm = useFiwiStore((state) => state.closeConfirm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!dialog) {
      setBusy(false);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        closeConfirm();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog, busy, closeConfirm]);

  const handleConfirm = async () => {
    if (!dialog || busy) return;
    setBusy(true);
    try {
      await dialog.onConfirm();
      closeConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {dialog && (
        <motion.div
          key="fiwi-confirm-backdrop"
          variants={fiwiModalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fiwi-confirm-title"
          onClick={() => !busy && closeConfirm()}
          className="fixed inset-0 z-[92] flex items-center justify-center p-4 bg-[#02031A]/65 backdrop-blur-sm"
        >
          <motion.div
            variants={fiwiModalSurfaceVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] bg-white dark:bg-[#0B0C10] border border-[#02031A]/18 dark:border-white/18 p-6 text-[#02031A] dark:text-white shadow-[0_28px_70px_-18px_rgba(2,3,26,0.5)] text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="fiwi-confirm-title"
                className="font-display text-[30px] font-semibold leading-none tracking-[-0.015em]"
              >
                {dialog.title}
              </h2>
              <button
                type="button"
                disabled={busy}
                onClick={closeConfirm}
                aria-label="Close confirmation dialog"
                className="p-1.5 text-[#02031A]/60 dark:text-white/60 hover:text-[#02031A] dark:hover:text-white bg-transparent border-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 mb-0 text-[14.5px] leading-[1.55] text-[#02031A]/80 dark:text-white/80">
              {dialog.message}
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={busy}
                onClick={closeConfirm}
                className="btn h-[42px] px-5 btn-square border border-[#02031A]/18 dark:border-white/18 bg-transparent text-[#02031A] dark:text-white hover:bg-[#F7F9FC] dark:hover:bg-white/[0.06] text-[14px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleConfirm}
                className={`btn h-[42px] px-5 btn-square text-[14px] inline-flex items-center gap-2 ${
                  dialog.destructive
                    ? 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
                    : 'bg-[#02031A] text-white hover:bg-[#1020F5] dark:bg-white dark:text-[#02031A]'
                }`}
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{dialog.confirmLabel ?? 'Confirm'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

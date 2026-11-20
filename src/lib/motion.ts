import type {Transition, Variants} from 'motion/react';

/**
 * Unified FiWi Motion Language (Emil Kowalski Motion Principles)
 * - Single natural ease-out curve across all surfaces
 * - Compositor-only transforms and opacity
 * - Snappy control feedback (140–220ms) and non-blocking reveals
 */
export const FIWI_EASE = [0.22, 1, 0.36, 1] as const;

export const FIWI_DURATION = {
  fast: 0.16,
  base: 0.22,
  reveal: 0.3,
} as const;

export const FIWI_TRANSITION_FAST: Transition = {
  duration: FIWI_DURATION.fast,
  ease: FIWI_EASE,
};

export const FIWI_TRANSITION_BASE: Transition = {
  duration: FIWI_DURATION.base,
  ease: FIWI_EASE,
};

export const FIWI_TRANSITION_REVEAL: Transition = {
  duration: FIWI_DURATION.reveal,
  ease: FIWI_EASE,
};

export const FIWI_VIEWPORT = {
  once: true,
  amount: 0.14,
} as const;

export const FIWI_TAP = {
  scale: 0.98,
  transition: {duration: 0.1, ease: FIWI_EASE},
} as const;

export const fiwiFadeSlideVariants: Variants = {
  initial: {opacity: 0, y: 8},
  animate: {opacity: 1, y: 0, transition: FIWI_TRANSITION_BASE},
  exit: {opacity: 0, y: -6, transition: FIWI_TRANSITION_FAST},
};

export const fiwiPanelRevealVariants: Variants = {
  initial: {opacity: 0, y: 6, scale: 0.99},
  animate: {opacity: 1, y: 0, scale: 1, transition: FIWI_TRANSITION_BASE},
  exit: {opacity: 0, y: 4, scale: 0.99, transition: FIWI_TRANSITION_FAST},
};

export const fiwiPopoverVariants: Variants = {
  initial: {opacity: 0, y: -6, scale: 0.97},
  animate: {opacity: 1, y: 0, scale: 1, transition: FIWI_TRANSITION_FAST},
  exit: {opacity: 0, y: -4, scale: 0.98, transition: {duration: 0.12, ease: FIWI_EASE}},
};

export const fiwiModalBackdropVariants: Variants = {
  initial: {opacity: 0},
  animate: {opacity: 1, transition: {duration: 0.18, ease: FIWI_EASE}},
  exit: {opacity: 0, transition: {duration: 0.14, ease: FIWI_EASE}},
};

export const fiwiModalSurfaceVariants: Variants = {
  initial: {opacity: 0, y: 10, scale: 0.985},
  animate: {opacity: 1, y: 0, scale: 1, transition: FIWI_TRANSITION_BASE},
  exit: {opacity: 0, y: 6, scale: 0.985, transition: FIWI_TRANSITION_FAST},
};

export const fiwiStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const fiwiStaggerItem: Variants = {
  initial: {opacity: 0, y: 10},
  animate: {opacity: 1, y: 0, transition: FIWI_TRANSITION_REVEAL},
};

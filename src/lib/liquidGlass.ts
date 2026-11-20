const GLASS_INTERACTIVE_SELECTOR = '.tile, .fiwi-cta-glass';

/**
 * Lightweight, zero-idle pointer specular tracker for FiWi's native CSS Liquid Glass surfaces.
 * Uses one passive delegated `pointermove` listener with single-rAF coalescing—no WebGL contexts,
 * no DOM rasterization, and zero animation frames running when the pointer is idle.
 */
export function installLiquidGlassPointerEffect(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
  if (prefersReducedMotion || hasCoarsePointer) {
    return () => {};
  }

  let rafId: number | null = null;
  let pendingEl: HTMLElement | null = null;
  let pendingX = 0;
  let pendingY = 0;
  let lastStyledEl: HTMLElement | null = null;

  const commit = () => {
    rafId = null;
    const el = pendingEl;
    if (!el || !el.isConnected) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const relX = Math.max(0, Math.min(rect.width, pendingX - rect.left));
    const relY = Math.max(0, Math.min(rect.height, pendingY - rect.top));
    el.style.setProperty('--fiwi-gx', `${relX.toFixed(1)}px`);
    el.style.setProperty('--fiwi-gy', `${relY.toFixed(1)}px`);
    lastStyledEl = el;
  };

  const handlePointerMove = (e: PointerEvent) => {
    const target = e.target as Element | null;
    const glassEl = target?.closest?.(GLASS_INTERACTIVE_SELECTOR) as HTMLElement | null;

    if (!glassEl) {
      if (lastStyledEl && lastStyledEl.isConnected) {
        lastStyledEl.style.removeProperty('--fiwi-gx');
        lastStyledEl.style.removeProperty('--fiwi-gy');
        lastStyledEl = null;
      }
      pendingEl = null;
      return;
    }

    if (lastStyledEl && lastStyledEl !== glassEl && lastStyledEl.isConnected) {
      lastStyledEl.style.removeProperty('--fiwi-gx');
      lastStyledEl.style.removeProperty('--fiwi-gy');
    }

    pendingEl = glassEl;
    pendingX = e.clientX;
    pendingY = e.clientY;

    if (rafId === null) {
      rafId = window.requestAnimationFrame(commit);
    }
  };

  const clearOnLeave = () => {
    pendingEl = null;
    if (lastStyledEl && lastStyledEl.isConnected) {
      lastStyledEl.style.removeProperty('--fiwi-gx');
      lastStyledEl.style.removeProperty('--fiwi-gy');
      lastStyledEl = null;
    }
  };

  document.addEventListener('pointermove', handlePointerMove, {passive: true});
  document.addEventListener('pointercancel', clearOnLeave, {passive: true});
  window.addEventListener('blur', clearOnLeave);

  return () => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    clearOnLeave();
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointercancel', clearOnLeave);
    window.removeEventListener('blur', clearOnLeave);
  };
}

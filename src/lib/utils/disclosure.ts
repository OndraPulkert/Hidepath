/** Od této šířky jsou sbalitelné karty rozbalené hned (na telefonu sbalené). */
const OPEN_MEDIA = '(min-width: 768px)';

/**
 * Výchozí stav sbalitelné karty: rozbalená na širší obrazovce, nebo když na ni míří kotva
 * v adrese (`anchor` bez „#“); na telefonu sbalená, aby nezabrala celou stránku.
 */
export function initiallyOpenOnWide(anchor?: string): boolean {
  if (typeof window === 'undefined') return true;
  if (anchor && window.location.hash === `#${anchor}`) return true;
  return window.matchMedia?.(OPEN_MEDIA).matches ?? true;
}

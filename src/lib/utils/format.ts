const czkFormatter = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
});

/** Naformátuje částku v haléřích jako české koruny bez desetinných míst, např. „1 850 Kč“. */
export function formatCzk(amountCents: number): string {
  return czkFormatter.format(Math.round(amountCents / 100));
}

const NBSP = '\u00a0';

/** Rozsah cen „350–600 Kč“; při shodných hodnotách vrátí jednu částku. */
export function formatCzkRange(minCents: number, maxCents: number): string {
  if (minCents === maxCents) return formatCzk(minCents);
  const min = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(
    Math.round(minCents / 100),
  );
  return `${min}–${formatCzk(maxCents)}`;
}

/** Procenta v českém zápisu s nezlomitelnou mezerou před znakem: „67 %“. Hodnota 0–1 se ořízne. */
export function formatPercent(ratio: number): string {
  const clamped = Math.min(1, Math.max(0, ratio));
  return `${Math.round(clamped * 100)}${NBSP}%`;
}

/**
 * Česká typografie v textu z obsahu: nezlomitelná mezera mezi číslem a jednotkou
 * („3,85–4 mm“, „67 %“, „350 Kč“), kolem „×“ a za jednopísmennými předložkami a spojkami.
 */
export function typo(text: string): string {
  return text
    .replace(/(\d)\s(mm|cm|m|ml|kč|Kč|%|ks|h|min|g|kg|SPI)\b/g, `$1${NBSP}$2`)
    .replace(/(\d)\s×\s(\d)/g, `$1${NBSP}×${NBSP}$2`)
    .replace(/(^|\s)([ksvzouaiKSVZOUAI])\s/g, `$1$2${NBSP}`);
}

/** Dvouciferný kód kroku / lekce: 1 → „01“. */
export function formatOrdinalCode(order: number): string {
  return String(order).padStart(2, '0');
}

/**
 * České skloňování podle počtu: pluralize(1, ['položka','položky','položek']) → „1 položka“.
 * Tvary: [1, 2–4, 0 a 5+].
 */
export function pluralizeCs(count: number, forms: readonly [string, string, string]): string {
  const abs = Math.abs(count);
  const form = abs === 1 ? forms[0] : abs >= 2 && abs <= 4 ? forms[1] : forms[2];
  return `${count} ${form}`;
}

/** České datum „7. 9. 2026“ s nezlomitelnými mezerami; vstup ISO datum (YYYY-MM-DD) bere jako lokální den. */
export function formatDateCs(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return `${d}.${NBSP}${m}.${NBSP}${y}`;
}

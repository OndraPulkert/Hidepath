import { type ProductExample } from '@/content/schema';

/**
 * Seskupení ověřených příkladů výrobků pro zobrazení. Datový model zůstává „jeden příklad
 * na variantu“ (nákupní plány párují příklad přes `url` + `variant`); tady se jen pro UI
 * slijí varianty téhož výrobku do jedné karty s tabulkou variant.
 */

export interface ExampleVariantRow {
  example: ProductExample;
  /** Popisek varianty do tabulky (šířka, délka, zrnitost…). */
  label: string;
  /** Poznámka k řádku – jen když se poznámky variant liší. */
  note: string | null;
  /** Poznámka k ceně u řádku – jen když se liší mezi variantami. */
  priceNote: string | null;
}

export interface ExampleGroup {
  key: string;
  /** Název výrobku bez varianty (u samostatného příkladu název včetně varianty, bez zdvojení). */
  title: string;
  shop: string;
  /** Společný odkaz; `null`, když varianty vedou na různé stránky obchodu (odkaz je pak u řádku). */
  url: string | null;
  /** Řádky seřazené podle rozměrů (šířka, pak délka). U samostatného výrobku jeden řádek. */
  rows: ExampleVariantRow[];
  /** Společná poznámka všech variant (jednou za kartu). */
  note: string | null;
  priceNote: string | null;
  /** Společné datum ověření; `null`, když se mezi variantami liší (pak je u řádku). */
  checkedAt: string | null;
  minPriceCents: number;
  maxPriceCents: number;
  /** Nejlepší dostupnost ve skupině – podle ní se karty řadí. */
  availability: ProductExample['availability'];
  /** Společná barva variant (pás na opasek); `null`, když ji příklady nemají nebo se liší. */
  color: string | null;
}

const availabilityRank = { in_stock: 0, preorder: 1, unavailable: 2 } as const;

const normalize = (s: string) => s.replace(/\s+/gu, ' ').trim().toLocaleLowerCase('cs');

/** Obsahuje název už popisek varianty („…, šířka 28 mm“ × „28 mm“)? Mezery se porovnávají volně. */
export function titleContainsVariant(title: string, variant: string): boolean {
  return normalize(title).includes(normalize(variant));
}

/**
 * Společný začátek názvů variant téhož výrobku, bez koncové části s variantou:
 * „Řemen …, 130–140 cm, šířka 28 mm“ + „… šířka 30 mm“ → „Řemen …, 130–140 cm“.
 * Krátí se po celých slovech; když by společná část skončila uprostřed úseku za čárkou
 * nebo uvnitř závorky, ořízne se na poslední celý úsek.
 */
export function commonBaseTitle(titles: readonly string[]): string {
  const first = titles[0];
  if (first === undefined) return '';
  if (titles.every((t) => t === first)) return first;
  const tokenized = titles.map((t) => t.trim().split(/\s+/u));
  const firstTokens = tokenized[0] ?? [];
  let n = 0;
  while (n < firstTokens.length && tokenized.every((tokens) => tokens[n] === firstTokens[n])) n++;
  let prefix = firstTokens.slice(0, n);

  const joined = prefix.join(' ');
  const openParen = joined.lastIndexOf('(');
  if (openParen > joined.lastIndexOf(')')) {
    // Varianta v závorce („(varianta Ø 8 mm)“) – vše od závorky dál patří variantě.
    prefix = joined.slice(0, openParen).split(/\s+/u).filter(Boolean);
  } else if (n > 0 && !(prefix[n - 1] ?? '').endsWith(',')) {
    const lastComma = prefix.findLastIndex((tok) => tok.endsWith(','));
    if (lastComma >= 0) prefix = prefix.slice(0, lastComma + 1);
  }
  const head = prefix
    .join(' ')
    .replace(/(\s+[Ø⌀×])+$/u, '')
    .replace(/[\s,;:–—(-]+$/u, '');

  // Společné celé úseky na konci („Ø 9 × 5 mm, černý nikl, 10 ks“ × „Ø 9,5 × 6,5 mm, černý nikl, 10 ks“).
  const minLength = Math.min(...tokenized.map((tokens) => tokens.length));
  let s = 0;
  while (
    n + s < minLength &&
    tokenized.every(
      (tokens) => tokens[tokens.length - 1 - s] === firstTokens[firstTokens.length - 1 - s],
    )
  )
    s++;
  let tail = '';
  for (let i = firstTokens.length - s; i < firstTokens.length; i++) {
    if ((firstTokens[i - 1] ?? '').endsWith(',') && i > n) {
      tail = firstTokens.slice(i).join(' ');
      break;
    }
  }
  const base = head && tail ? `${head}, ${tail}` : head;
  return base || first;
}

/** Zbytek názvu za společným základem („, šířka 28 mm“ → „šířka 28 mm“). */
function titleRemainder(title: string, base: string): string {
  let i = 0;
  while (i < title.length && title[i] === base[i]) i++;
  return title
    .slice(i)
    .replace(/^[\s,;:–—-]+/u, '')
    .replace(/^\((.*)\)$/u, '$1')
    .trim();
}

/**
 * Rozměry z popisku varianty v milimetrech, v pořadí výskytu („28 mm, 130 cm“ → [28, 1300]).
 * Čísla bez jednotky (zrnitost 180, A4) se berou tak, jak jsou.
 */
export function variantMeasures(label: string): number[] {
  const out: number[] = [];
  for (const m of label.matchAll(/(\d+(?:[.,]\d+)?)\s*(mm|cm|m(?![a-z²³]))?/giu)) {
    const value = Number((m[1] ?? '0').replace(',', '.'));
    const unit = m[2]?.toLowerCase();
    out.push(unit === 'cm' ? value * 10 : unit === 'm' ? value * 1000 : value);
  }
  return out;
}

function compareLabels(a: string, b: string): number {
  const ma = variantMeasures(a);
  const mb = variantMeasures(b);
  for (let i = 0; i < Math.min(ma.length, mb.length); i++) {
    const diff = (ma[i] ?? 0) - (mb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  if (ma.length !== mb.length) return ma.length - mb.length;
  return a.localeCompare(b, 'cs');
}

function shared<T>(values: readonly T[]): T | null {
  const first = values[0];
  return first !== undefined && values.every((v) => v === first) ? first : null;
}

const splitSentences = (text: string) => text.trim().split(/(?<=[.!?])\s+/u);

/**
 * Věty společné všem poznámkám variant jdou do karty jednou, k řádku zůstane jen to, čím se
 * varianta liší („Přepínač délek ukazuje nižší cenu…“ jen u delších řemenů).
 */
function splitNotes(notes: readonly (string | null)[]): {
  common: string | null;
  rest: Map<number, string>;
} {
  const rest = new Map<number, string>();
  const first = notes[0];
  if (notes.every((n) => n === first)) return { common: first ?? null, rest };
  if (notes.some((n) => n === null)) {
    notes.forEach((n, i) => n !== null && rest.set(i, n));
    return { common: null, rest };
  }
  const split = notes.map((n) => splitSentences(n ?? ''));
  const common = (split[0] ?? []).filter((sentence) => split.every((ss) => ss.includes(sentence)));
  split.forEach((ss, i) => {
    const own = ss.filter((sentence) => !common.includes(sentence)).join(' ');
    if (own) rest.set(i, own);
  });
  return { common: common.length > 0 ? common.join(' ') : null, rest };
}

function buildGroup(key: string, examples: readonly ProductExample[]): ExampleGroup {
  const first = examples[0];
  if (!first) throw new Error('Prázdná skupina příkladů');
  const urls = examples.map((e) => e.url);
  const notes = examples.map((e) => e.note ?? null);
  const priceNotes = examples.map((e) => e.priceNote ?? null);
  const { common: sharedNote, rest: noteRest } = splitNotes(notes);
  const sharedPriceNote = shared(priceNotes);
  const prices = examples.map((e) => e.priceCents);
  const availability = examples
    .map((e) => e.availability)
    .reduce((best, a) => (availabilityRank[a] < availabilityRank[best] ? a : best));
  const common = {
    key,
    shop: first.shop,
    url: shared(urls),
    note: sharedNote,
    priceNote: sharedPriceNote,
    checkedAt: shared(examples.map((e) => e.checkedAt)),
    minPriceCents: Math.min(...prices),
    maxPriceCents: Math.max(...prices),
    availability,
    color: shared(examples.map((e) => e.color ?? null)),
  };
  const rowExtras = (e: ProductExample, i: number) => ({
    note: noteRest.get(i) ?? null,
    priceNote: sharedPriceNote === null ? (e.priceNote ?? null) : null,
  });

  if (examples.length === 1) {
    const title =
      first.variant && !titleContainsVariant(first.title, first.variant)
        ? `${first.title} – ${first.variant}`
        : first.title;
    return {
      ...common,
      title,
      rows: [{ example: first, label: first.variant ?? title, ...rowExtras(first, 0) }],
    };
  }

  const base = commonBaseTitle(examples.map((e) => e.title));
  // Zbytek názvu za základem; prázdný (shodné názvy) nahradí celý název.
  const remainders = examples.map((e) => {
    const rest = titleRemainder(e.title, base);
    return rest === '' ? e.title : rest;
  });
  let labels = examples.map((e, i) => e.variant ?? remainders[i] ?? e.title);
  if (new Set(labels).size !== labels.length) {
    // Popisky variant se opakují (např. stejná šířka u dvou tlouštěk) – rozliší je zbytek názvu.
    labels = examples.map((e, i) => {
      const rest = remainders[i] ?? e.title;
      return e.variant && !titleContainsVariant(rest, e.variant) ? `${rest}, ${e.variant}` : rest;
    });
  }
  const rows = examples
    .map((e, i) => ({ example: e, label: labels[i] ?? e.title, ...rowExtras(e, i) }))
    .sort((a, b) => compareLabels(a.label, b.label));
  return { ...common, title: base, rows };
}

/**
 * Seskupí příklady po výrobcích: stejný obchod + stejná stránka, a pak ještě stejný obchod +
 * stejný název bez varianty (obchod někdy dělí jednu řadu na víc stránek podle šířky).
 * Skupiny jsou seřazené podle dostupnosti (skladem první), jinak v pořadí obsahu.
 */
export function groupProductExamples(examples: readonly ProductExample[]): ExampleGroup[] {
  const byUrl = new Map<string, ProductExample[]>();
  for (const e of examples) {
    const key = `${e.shop}\n${e.url}`;
    const list = byUrl.get(key);
    if (list) list.push(e);
    else byUrl.set(key, [e]);
  }

  const byBase = new Map<string, ProductExample[]>();
  for (const list of byUrl.values()) {
    const first = list[0];
    if (!first) continue;
    const base =
      list.length > 1 ? commonBaseTitle(list.map((e) => e.title)) : buildGroup('', list).title;
    const key = `${first.shop}\n${normalize(base)}`;
    const merged = byBase.get(key);
    if (merged) merged.push(...list);
    else byBase.set(key, [...list]);
  }

  return [...byBase.entries()]
    .map(([key, list]) => buildGroup(key, list))
    .sort((a, b) => availabilityRank[a.availability] - availabilityRank[b.availability]);
}

export interface ExampleColorSection {
  /** Barva malými písmeny; `null` = příklady barvu neuvádějí. */
  color: string | null;
  groups: ExampleGroup[];
}

/**
 * Karty výrobků podle barvy (pás na opasek: přírodní, hnědá, černá…). Barvy jdou v pořadí,
 * v jakém je obsah poprvé uvádí; uvnitř barvy platí pořadí `groupProductExamples`. Bez barev
 * je jedna sekce s `color: null`.
 */
export function groupProductExamplesByColor(
  examples: readonly ProductExample[],
): ExampleColorSection[] {
  const order: (string | null)[] = [];
  const byColor = new Map<string | null, ProductExample[]>();
  for (const e of examples) {
    const color = e.color ?? null;
    const list = byColor.get(color);
    if (list) list.push(e);
    else {
      order.push(color);
      byColor.set(color, [e]);
    }
  }
  return order.map((color) => ({ color, groups: groupProductExamples(byColor.get(color) ?? []) }));
}

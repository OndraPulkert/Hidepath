import {
  type EquipmentCatalog,
  type ProductExample,
  type ShoppingPlan,
  type ShoppingPlanLine,
} from '@/content/schema';
import { beltConfigPrefill } from '@/features/belt/belt-prefill';
import { savedBeltsFromRecords } from '@/features/belt/saved-belts';
import { type LessonRecordEntry } from '@/features/notebook/types';
import {
  type BeltConfigInput,
  type BeltConfigResult,
  deriveBeltConfig,
  parseBeltConfigForm,
} from '@/lib/patterns/belt-config';
import { cz } from '@/lib/patterns/belt-sheets';

/**
 * Nákupní plán pásku podle sestavy uživatele: pás ve variantě jeho šířky, přezka jeho šířky
 * a nýt s dříkem pro jeho změřenou tloušťku. Bere jen ověřené příklady z katalogu
 * (`src/content/equipment/belt.ts`); co katalog nemá, jde do `skipped` s „ověřte u prodejce“.
 * Bez sestavy platí plán projektu (pásek 40 mm). Čisté funkce bez Reactu.
 */

/** Položky plánu, které závisí na sestavě. Ostatní (nástroje) jsou pro všechny pásky stejné. */
export const BELT_CONFIG_PLAN_SLUGS = [
  'belt-strap',
  'belt-buckle',
  'chicago-screws',
  'hole-punch-5mm',
] as const;
type ConfigSlug = (typeof BELT_CONFIG_PLAN_SLUGS)[number];

/** Z jaké sestavy plán je: nejnovější z „Mých pásků“, jinak čísla ze zápisníku. */
export interface BeltPlanBasis {
  name: string;
  input: BeltConfigInput;
  source: 'saved' | 'notebook';
}

/** Název sestavy, když pochází jen ze zápisů v lekcích (šířka, tloušťka, obvod…). */
export const NOTEBOOK_BASIS_NAME = 'čísla ze zápisníku';

export function beltPlanBasis(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): BeltPlanBasis | null {
  const saved = savedBeltsFromRecords(entries, projectSlug);
  const newest = [...saved].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (newest) return { name: newest.name, input: newest.input, source: 'saved' };
  const prefill = beltConfigPrefill(entries, projectSlug);
  if (!prefill) return null;
  const parsed = parseBeltConfigForm(prefill.form);
  if ('problems' in parsed) return null;
  return { name: NOTEBOOK_BASIS_NAME, input: parsed.input, source: 'notebook' };
}

const examplesOf = (catalog: EquipmentCatalog, slug: string): readonly ProductExample[] =>
  catalog[slug]?.examples ?? [];

const lineFor = (
  slug: ConfigSlug,
  example: ProductExample,
  quantity: number,
  purpose: string,
): ShoppingPlanLine => ({
  equipmentSlug: slug,
  url: example.url,
  ...(example.variant ? { variant: example.variant } : {}),
  quantity,
  purpose,
});

/** `keep` = řádek plánu projektu platí beze změny. */
type PlanPick = { line: ShoppingPlanLine } | { skipped: string } | { keep: true };

function strapPick(r: BeltConfigResult, catalog: EquipmentCatalog): PlanPick {
  const w = r.input.widthMm;
  const t = r.input.thicknessMm;
  const length =
    r.strap.minLengthCm === null
      ? `délka = obvod + ${cz(r.strap.allowanceMm)} mm`
      : `aspoň ${r.strap.minLengthCm} cm`;
  const strapLine = r.shopping.find((l) => l.offers !== undefined);
  // Výchozí nabídku vybírá výpočet (CraftPoint, jinak nejlevnější skladem s ověřeným činěním);
  // na objednávku, vyprodané a bez uvedeného činění se nikdy nevybere samo.
  const pick = strapLine?.defaultOffer;
  const example = pick
    ? examplesOf(catalog, 'belt-strap').find(
        (e) => e.url === pick.url && e.variant === pick.variant,
      )
    : undefined;
  if (pick && example) {
    return {
      line: lineFor('belt-strap', example, 1, `šířka ${w} mm, změřte ${cz(t)} mm; ${length}`),
    };
  }
  const others = strapLine?.offers?.length ?? 0;
  if (others > 0) {
    return {
      skipped: `Pás ${w} mm, ${cz(t)} mm (${length}): skladem s ověřeným činěním žádný. Nabídky k ověření jsou ve „Váš pásek“ pod „Kde jinde koupit“.`,
    };
  }
  return {
    skipped: `Pás ${w} mm, ${cz(t)} mm (${length}): v ověřených nabídkách není. Ověřte u prodejce.`,
  };
}

function bucklePick(r: BeltConfigResult, catalog: EquipmentCatalog): PlanPick {
  const w = r.input.widthMm;
  const all = examplesOf(catalog, 'belt-buckle');
  // Jednotrnová s typem trnu ověřeným na stránce: mosazné z CraftPointu (stejné pravidlo jako
  // `buckle.verified` ve výpočtu).
  const verified = all.find(
    (e) => e.shop === 'CraftPoint' && e.title === `Mosazná opasková přezka ${w} mm`,
  );
  if (verified) {
    return { line: lineFor('belt-buckle', verified, 1, `přezka ${w} mm = šířka pásu`) };
  }
  const sameWidth = all
    .filter((e) => new RegExp(`(^|\\s)${w} mm(\\b|,|$)`).test(e.title))
    .sort((a, b) => a.priceCents - b.priceCents)[0];
  if (sameWidth) {
    return {
      line: lineFor(
        'belt-buckle',
        sameWidth,
        1,
        `přezka ${w} mm = šířka pásu; typ trnu stránka neuvádí, ověřte na fotce`,
      ),
    };
  }
  return {
    skipped: `Přezku ${w} mm v ověřených nabídkách nemáme. Ověřte u prodejce: jednotrnová, vnitřní světlost ${w} mm.`,
  };
}

function screwPick(r: BeltConfigResult, catalog: EquipmentCatalog): PlanPick {
  const { rivet } = r;
  const range = `dřík ${cz(rivet.minMm)}–${cz(rivet.maxMm)} mm na spoj 2 × ${cz(r.input.thicknessMm)} mm`;
  for (const option of rivet.options) {
    const example = examplesOf(catalog, 'chicago-screws').find(
      (e) => e.url === option.url && e.variant === option.variant,
    );
    if (example) {
      return {
        line: lineFor(
          'chicago-screws',
          example,
          option.quantity,
          option.confirmed ? range : `${range}; dřík jen podle názvu, ověřte u prodejce`,
        ),
      };
    }
  }
  return {
    skipped: `Nýt (${range}) v ověřených nabídkách nemáme. Ověřte u prodejce.`,
  };
}

/** Sada CraftPoint 2–5 mm má hrot 4,5 mm (katalog `hole-punch-5mm`). */
const PUNCH_SET_URL = 'https://craft-point.cz/products/sada-vysecniku-na-kuzi-7-velikosti-2-5mm';

/**
 * Výsečník na dírky pro trn podle Ø dírek pásku. Plán projektu kupuje 5 mm; 4,5 mm je v sadě
 * CraftPoint 2–5 mm, 6 mm je tentýž výsečník jako na nýty a 5,5 mm podklady nemají.
 */
function punchPick(r: BeltConfigResult, catalog: EquipmentCatalog): PlanPick {
  const d = r.holes.diameterMm;
  const near = (v: number) => Math.abs(d - v) < 1e-9;
  if (near(5)) return { keep: true };
  if (near(4.5)) {
    const set = examplesOf(catalog, 'hole-punch-5mm').find((e) => e.url === PUNCH_SET_URL);
    if (set) {
      return {
        line: lineFor('hole-punch-5mm', set, 1, 'dírky pro trn Ø 4,5 mm (hrot 4,5 mm ze sady)'),
      };
    }
  }
  if (near(6)) {
    return {
      skipped: 'Dírky Ø 6 mm sekáte výsečníkem Ø 6 mm (stejný jako na nýty), Ø 5 mm nepotřebujete.',
    };
  }
  return {
    skipped: `Výsečník Ø ${cz(d)} mm v ověřených nabídkách nemáme (sady jdou po celých mm), ověřte u prodejce.`,
  };
}

/** Název položky v „Připravte si“, když se liší od katalogu (výsečník podle Ø dírek). */
export function beltEquipmentNames(r: BeltConfigResult): Record<string, string> {
  const d = r.holes.diameterMm;
  if (Math.abs(d - 5) < 1e-9) return {};
  return { 'hole-punch-5mm': `Výsečník Ø ${cz(d)} mm (dírky pro trn)` };
}

/**
 * Plán projektu upravený pro sestavu: řádky pásu, přezky a nýtů nahradí ty, které odpovídají
 * sestavě (na místě původních), nebo je přesune do `skipped` s důvodem.
 */
export function beltShoppingPlan(
  plan: ShoppingPlan,
  result: BeltConfigResult,
  name: string,
  catalog: EquipmentCatalog,
): ShoppingPlan {
  const picks: Record<ConfigSlug, PlanPick> = {
    'belt-strap': strapPick(result, catalog),
    'belt-buckle': bucklePick(result, catalog),
    'chicago-screws': screwPick(result, catalog),
    'hole-punch-5mm': punchPick(result, catalog),
  };
  const sixMmHoles = Math.abs(result.holes.diameterMm - 6) < 1e-9;
  const isConfigSlug = (slug: string): slug is ConfigSlug =>
    (BELT_CONFIG_PLAN_SLUGS as readonly string[]).includes(slug);
  const placed = new Set<ConfigSlug>();
  const lines: ShoppingPlanLine[] = [];
  for (const line of plan.lines) {
    if (!isConfigSlug(line.equipmentSlug)) {
      lines.push(
        sixMmHoles && line.equipmentSlug === 'hole-punch-6mm'
          ? { ...line, purpose: 'dírky pro trn, otvory pro nýty a konce oválu' }
          : line,
      );
      continue;
    }
    const slug = line.equipmentSlug;
    if (placed.has(slug)) continue;
    placed.add(slug);
    const pick = picks[slug];
    if ('line' in pick) lines.push(pick.line);
    else if ('keep' in pick) lines.push(line);
  }
  const skipped = [
    ...plan.skipped.filter((s) => !isConfigSlug(s.equipmentSlug)),
    ...BELT_CONFIG_PLAN_SLUGS.flatMap((slug) => {
      const pick = picks[slug];
      return 'skipped' in pick ? [{ equipmentSlug: slug, reason: pick.skipped }] : [];
    }),
  ];
  return {
    ...plan,
    title: `Podle pásku „${name}“: ${result.label}. Pás, přezka, nýty a výsečník na dírky jsou pro tuto sestavu, ostatní položky jsou pro všechny pásky stejné.`,
    lines,
    skipped,
  };
}

/**
 * Plán pro „Připravte si“: podle nejnovějšího uloženého pásku (nebo zápisníku). `null` = sestava
 * není, platí plán projektu (40 mm). Když sestava je, ale nejde spočítat, platí plán projektu
 * a `basis` řekne proč – ne potichu 40 mm.
 */
export function beltPrepPlan(
  plan: ShoppingPlan,
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
  catalog: EquipmentCatalog,
): { plan: ShoppingPlan; basis: string; equipmentNames?: Record<string, string> } | null {
  const basis = beltPlanBasis(entries, projectSlug);
  if (!basis) return null;
  const outcome = deriveBeltConfig(basis.input);
  if (!outcome.ok) {
    const prefillProblems =
      basis.source === 'notebook' ? (beltConfigPrefill(entries, projectSlug)?.problems ?? []) : [];
    const problems = prefillProblems.length > 0 ? prefillProblems : outcome.problems;
    const what =
      basis.source === 'notebook'
        ? `${basis.name} nejdou spočítat`
        : `pásek „${basis.name}“ nejde spočítat`;
    return { plan, basis: `podle plánu projektu (pásek 40 mm): ${what}. ${problems.join(' ')}` };
  }
  return {
    plan: beltShoppingPlan(plan, outcome.result, basis.name, catalog),
    basis: `podle pásku: ${basis.name} (${outcome.result.label})`,
    equipmentNames: beltEquipmentNames(outcome.result),
  };
}

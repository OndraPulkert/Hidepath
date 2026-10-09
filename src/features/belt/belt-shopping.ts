import {
  type EquipmentCatalog,
  type ProductExample,
  type ShoppingPlan,
  type ShoppingPlanLine,
} from '@/content/schema';
import { resolveActiveBelt } from '@/features/belt/active-belt';
import { beltPurchase, screwDetail } from '@/features/belt/belt-purchase';
import { type BudgetPriceOverride } from '@/features/shopping/budget';
import { findPlanExample } from '@/features/shopping/plan';
import { type LessonRecordEntry } from '@/features/notebook/types';
import {
  type BeltConfigInput,
  type BeltConfigResult,
  PRONG_SOURCE_LABELS,
  deriveBeltConfig,
  verifiedBuckles,
} from '@/lib/patterns/belt-config';
import { cz } from '@/lib/patterns/belt-sheets';
import {
  EDGE_PAINT_URLS,
  STRAP_COLOR_LABELS,
  type StrapColor,
  isDyedStrap,
  strapOfferCaveat,
} from '@/lib/patterns/belt-strap-offers';

/**
 * Nákupní plán pásku podle aktivního pásku (`resolveActiveBelt`): pás ve variantě jeho šířky a barvy, přezka jeho
 * šířky, nýt s dříkem pro jeho změřenou tloušťku a u barevného pásu barva na hrany. Bere jen ověřené příklady z katalogu
 * (`src/content/equipment/belt.ts`); co katalog nemá, jde do `skipped` s „ověřte u prodejce“.
 * Bez sestavy platí plán projektu (modrý pásek 40 mm). Čisté funkce bez Reactu.
 */

/** Položky plánu, které závisí na sestavě. Ostatní (nástroje) jsou pro všechny pásky stejné. */
export const BELT_CONFIG_PLAN_SLUGS = [
  'belt-strap',
  'belt-buckle',
  'chicago-screws',
  'hole-punch-5mm',
  'edge-paint',
] as const;
type ConfigSlug = (typeof BELT_CONFIG_PLAN_SLUGS)[number];

/** Z jaké sestavy plán je: aktivní pásek, nebo staré zápisy lekce 1, dokud nejsou uložené. */
export interface BeltPlanBasis {
  name: string;
  input: BeltConfigInput;
  source: 'saved' | 'notebook';
  /** Pás o 15 cm delší na odřezek k tréninku (lekce 2). */
  scrapFromStrap: boolean;
}

export function beltPlanBasis(
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
): BeltPlanBasis | null {
  const { active } = resolveActiveBelt(entries, projectSlug);
  if (!active) return null;
  return {
    name: active.name,
    input: active.input,
    source: active.source,
    scrapFromStrap: active.scrapFromStrap === true,
  };
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

const colorOf = (r: BeltConfigResult): StrapColor => r.input.color ?? 'prirodni';

/** „Pás 40 mm“, u barevného „Barevný pás (černá) 40 mm“. */
const strapName = (r: BeltConfigResult): string =>
  isDyedStrap(colorOf(r))
    ? `Barevný pás (${STRAP_COLOR_LABELS[colorOf(r)]}) ${r.input.widthMm} mm`
    : `Pás ${r.input.widthMm} mm`;

function strapPick(
  r: BeltConfigResult,
  catalog: EquipmentCatalog,
  scrapFromStrap: boolean,
): PlanPick {
  const w = r.input.widthMm;
  const t = r.input.thicknessMm;
  const dyed = isDyedStrap(colorOf(r));
  // Stejná nabídka a délka jako souhrn „Koupit“ na stránce Váš pásek (i s odřezkem + 15 cm).
  const purchase = beltPurchase(r, { scrapFromStrap });
  const length =
    purchase.neededCm === null
      ? `délka = obvod + ${cz(r.strap.allowanceMm)} mm`
      : scrapFromStrap
        ? `aspoň ${purchase.neededCm} cm (s odřezkem na trénink)`
        : `aspoň ${purchase.neededCm} cm`;
  // Výchozí nabídku vybírá výpočet (výběr uživatele, jinak CraftPoint, jinak nejlevnější skladem
  // s ověřeným činěním); na objednávku a vyprodané se nikdy nevybere samo.
  const pick = purchase.offer;
  const example = pick
    ? examplesOf(catalog, 'belt-strap').find(
        (e) => e.url === pick.url && e.variant === pick.variant,
      )
    : undefined;
  if (pick && example) {
    const colorPart = dyed ? `${STRAP_COLOR_LABELS[colorOf(r)]}, ` : '';
    const caveat = strapOfferCaveat(pick);
    return {
      line: lineFor(
        'belt-strap',
        example,
        1,
        `${colorPart}šířka ${w} mm, změřte ${cz(t)} mm; ${length}${caveat ? `; ${caveat}` : ''}`,
      ),
    };
  }
  if (purchase.offers.length > 0) {
    return {
      skipped: `${strapName(r)}, ${cz(t)} mm (${length}): skladem s ověřeným činěním žádný. Nabídky k ověření jsou ve „Váš pásek“ pod „Kde jinde koupit“.`,
    };
  }
  return {
    skipped: `${strapName(r)}, ${cz(t)} mm (${length}): v ověřených nabídkách není. Ověřte u prodejce.`,
  };
}

function bucklePick(r: BeltConfigResult, catalog: EquipmentCatalog): PlanPick {
  const w = r.input.widthMm;
  const all = examplesOf(catalog, 'belt-buckle');
  // První přezka s ověřeným jedním trnem (stránka nebo fotka) v pořadí doporučení; stejné
  // pravidlo jako `buckle.verified` ve výpočtu.
  for (const b of verifiedBuckles(w)) {
    const example = all.find((e) => e.url === b.url);
    if (example) {
      return {
        line: lineFor(
          'belt-buckle',
          example,
          1,
          `přezka ${w} mm = šířka pásu; ${b.product}, ${PRONG_SOURCE_LABELS[b.prong]}`,
        ),
      };
    }
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

function screwPick(
  r: BeltConfigResult,
  catalog: EquipmentCatalog,
  scrapFromStrap: boolean,
): PlanPick {
  const { rivet } = r;
  const range = `dřík ${cz(rivet.minMm)}–${cz(rivet.maxMm)} mm na spoj 2 × ${cz(r.input.thicknessMm)} mm`;
  // Stejné doporučení jako souhrn „Koupit“ (nýt, jiný obchod než pás, co dalšího sedí).
  const purchase = beltPurchase(r, { scrapFromStrap });
  const option = purchase.screws.pick;
  const example = option
    ? examplesOf(catalog, 'chicago-screws').find(
        (e) => e.url === option.url && e.variant === option.variant,
      )
    : undefined;
  if (option && example) {
    return {
      line: lineFor(
        'chicago-screws',
        example,
        option.quantity,
        `spoj 2 × ${cz(r.input.thicknessMm)} mm; ${screwDetail(purchase)}`,
      ),
    };
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

/**
 * Barva na hrany: jen u barevného pásu. Přírodní pás ji nekupuje (vynechá s důvodem; plán
 * projektu je pro modrý pás). Barevný: ověřený odstín z katalogu, jinak vynechat s důvodem.
 */
function edgePaintPick(r: BeltConfigResult, catalog: EquipmentCatalog): PlanPick {
  const color = colorOf(r);
  if (!isDyedStrap(color)) {
    return { skipped: 'Jen u barevného pásku: přírodní pás natřete balzámem.' };
  }
  const label = STRAP_COLOR_LABELS[color];
  const url = EDGE_PAINT_URLS[color];
  const example = url ? examplesOf(catalog, 'edge-paint').find((e) => e.url === url) : undefined;
  if (example) {
    return {
      line: lineFor(
        'edge-paint',
        example,
        1,
        `barevný pás (${label}): hrany obarvit před leštěním; odstín a přilnavost ověřte na odřezku (lekce 2)`,
      ),
    };
  }
  return {
    skipped: `Barevný pás (${label}): barvu na hrany v tomto odstínu v ověřených příkladech nemáme (ověřená je hnědá, tmavě hnědá a černá). Odstín ověřte u prodejce podle pásu a na odřezku.`,
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
  { scrapFromStrap = false }: { scrapFromStrap?: boolean } = {},
): ShoppingPlan {
  const picks: Record<ConfigSlug, PlanPick> = {
    'belt-strap': strapPick(result, catalog, scrapFromStrap),
    'belt-buckle': bucklePick(result, catalog),
    'chicago-screws': screwPick(result, catalog, scrapFromStrap),
    'hole-punch-5mm': punchPick(result, catalog),
    'edge-paint': edgePaintPick(result, catalog),
  };
  const dyed = isDyedStrap(colorOf(result));
  const sixMmHoles = Math.abs(result.holes.diameterMm - 6) < 1e-9;
  const isConfigSlug = (slug: string): slug is ConfigSlug =>
    (BELT_CONFIG_PLAN_SLUGS as readonly string[]).includes(slug);
  const placed = new Set<ConfigSlug>();
  const lines: ShoppingPlanLine[] = [];
  const placeEdgePaint = () => {
    if (placed.has('edge-paint')) return;
    placed.add('edge-paint');
    const pick = picks['edge-paint'];
    if ('line' in pick) lines.push(pick.line);
  };
  for (const line of plan.lines) {
    if (!isConfigSlug(line.equipmentSlug)) {
      lines.push(
        sixMmHoles && line.equipmentSlug === 'hole-punch-6mm'
          ? { ...line, purpose: 'dírky pro trn, otvory pro nýty a konce oválu' }
          : line.equipmentSlug === 'leather-balm'
            ? {
                ...line,
                purpose: dyed
                  ? 'barevný pás: jen když na odřezku vyhoví vzhled (lekce 2)'
                  : 'přírodní pás bez barvení; nejdřív na odřezku',
              }
            : line,
      );
      // Barva na hrany (jen barevný pás) hned za balzám: obojí je konečná úprava.
      if (line.equipmentSlug === 'leather-balm') placeEdgePaint();
      continue;
    }
    const slug = line.equipmentSlug;
    if (placed.has(slug)) continue;
    placed.add(slug);
    const pick = picks[slug];
    if ('line' in pick) lines.push(pick.line);
    else if ('keep' in pick) lines.push(line);
  }
  placeEdgePaint();
  // `keep` u položky, kterou plán projektu vynechává, nechá jeho důvod.
  const keptSkips = plan.skipped.filter(
    (s) => !isConfigSlug(s.equipmentSlug) || 'keep' in picks[s.equipmentSlug],
  );
  const skipped = [
    ...keptSkips,
    ...BELT_CONFIG_PLAN_SLUGS.flatMap((slug) => {
      const pick = picks[slug];
      return 'skipped' in pick ? [{ equipmentSlug: slug, reason: pick.skipped }] : [];
    }),
  ];
  return {
    ...plan,
    title: `Podle pásku „${name}“: ${result.label}. Pás, přezka, nýty a výsečník na dírky${dyed ? ', balzám a barva na hrany' : ''} jsou pro tuto sestavu, ostatní položky jsou pro všechny pásky stejné.`,
    lines,
    skipped,
  };
}

/**
 * Plán pro „Připravte si“: podle aktivního pásku. `null` = pásek není, platí plán projektu
 * (40 mm). Když pásek je, ale nejde spočítat, platí plán projektu a `basis` řekne proč – ne
 * potichu 40 mm.
 */
export function beltPrepPlan(
  plan: ShoppingPlan,
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
  catalog: EquipmentCatalog,
): { plan: ShoppingPlan; basis: string; equipmentNames?: Record<string, string> } | null {
  const { active, legacy } = resolveActiveBelt(entries, projectSlug);
  if (!active) {
    // Staré zápisy, které nejdou spočítat (např. trn moc silný): říct proč.
    if (legacy && legacy.problems.length > 0) {
      return {
        plan,
        basis: `${BELT_FALLBACK_BASIS}: zápisy z lekce 1 nejdou spočítat. ${legacy.problems.join(' ')}`,
      };
    }
    return null;
  }
  const outcome = deriveBeltConfig(active.input);
  if (!outcome.ok) {
    return {
      plan,
      basis: `${BELT_FALLBACK_BASIS}: pásek „${active.name}“ nejde spočítat. ${outcome.problems.join(' ')}`,
    };
  }
  return {
    plan: beltShoppingPlan(plan, outcome.result, active.name, catalog, {
      scrapFromStrap: active.scrapFromStrap === true,
    }),
    basis: `podle pásku: ${active.name} (${outcome.result.label})`,
    equipmentNames: beltEquipmentNames(outcome.result),
  };
}

/** Poznámka, když sestava není: platí plán projektu. */
export const BELT_FALLBACK_BASIS = 'podle plánu projektu (modrý pásek 40 mm)';

/** Barva pásu v plánu projektu (výběr uživatele 9. 10. 2026: modrý pás Andexnite 40 mm). */
export const BELT_PLAN_COLOR: StrapColor = 'modra';

/** Nákup pásku pro „Co koupit“ a rozpočet: plán, podle čeho je, názvy položek a ceny. */
export interface BeltPlanView {
  plan: ShoppingPlan;
  /** „podle pásku: …“, nebo „podle plánu projektu (pásek 40 mm)“ (případně s důvodem). */
  basis: string;
  equipmentNames: Record<string, string>;
  /** Ceny pásu, přezky, nýtů a výsečníku na dírky podle plánu – pro rozpočet. */
  budgetPrices: Record<string, BudgetPriceOverride>;
}

/**
 * Ceny položek, které závisí na sestavě, podle řádků plánu (cena příkladu × počet). Co plán
 * vynechal, je bez ověřené ceny; výsečník Ø 5 mm se při dírkách Ø 6 mm nekupuje a barva na
 * hrany u přírodního pásu také ne.
 */
export function beltBudgetPrices(
  plan: ShoppingPlan,
  catalog: EquipmentCatalog,
  holeDiameterMm: number | null,
  color: StrapColor = 'prirodni',
): Record<string, BudgetPriceOverride> {
  const out: Record<string, BudgetPriceOverride> = {};
  for (const slug of BELT_CONFIG_PLAN_SLUGS) {
    const lines = plan.lines.filter((l) => l.equipmentSlug === slug);
    if (lines.length === 0) {
      const sixMm = holeDiameterMm !== null && Math.abs(holeDiameterMm - 6) < 1e-9;
      const notNeeded =
        (slug === 'hole-punch-5mm' && sixMm) || (slug === 'edge-paint' && !isDyedStrap(color));
      out[slug] = notNeeded ? 'not-needed' : 'unpriced';
      continue;
    }
    const prices = lines.map((l) => {
      const example = findPlanExample(l, catalog);
      return example ? example.priceCents * l.quantity : null;
    });
    out[slug] = prices.every((c) => c !== null)
      ? { cents: prices.reduce<number>((a, c) => a + (c ?? 0), 0) }
      : 'unpriced';
  }
  return out;
}

/**
 * „Co koupit“ a rozpočet pásku: jako „Připravte si“ (`beltPrepPlan`) podle aktivního pásku,
 * jinak plán projektu (40 mm) s poznámkou, proč.
 */
export function beltPlanView(
  plan: ShoppingPlan,
  entries: readonly LessonRecordEntry[],
  projectSlug: string,
  catalog: EquipmentCatalog,
): BeltPlanView {
  const prep = beltPrepPlan(plan, entries, projectSlug, catalog);
  const basis = beltPlanBasis(entries, projectSlug);
  const outcome = basis ? deriveBeltConfig(basis.input) : null;
  const holeDiameterMm = outcome?.ok ? outcome.result.holes.diameterMm : null;
  // Bez spočítaného pásku platí plán projektu, a ten je pro modrý pás.
  const color = outcome?.ok ? (outcome.result.input.color ?? 'prirodni') : BELT_PLAN_COLOR;
  const effective = prep?.plan ?? plan;
  return {
    plan: effective,
    basis: prep?.basis ?? BELT_FALLBACK_BASIS,
    equipmentNames: prep?.equipmentNames ?? {},
    budgetPrices: beltBudgetPrices(effective, catalog, holeDiameterMm, color),
  };
}

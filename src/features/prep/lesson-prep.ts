import { routes } from '@/app/routes';
import {
  type EquipmentCatalog,
  type EquipmentStatus,
  type LessonDefinition,
  type LessonPrint,
  type LessonStep,
  type ProjectDefinition,
  type ShoppingPlan,
} from '@/content/schema';
import { getEquipmentStatus, type InventoryState } from '@/features/inventory/types';
import { type PrepCheckRecord } from '@/features/prep/types';
import { type ProgressState } from '@/features/progress/types';
import { resolveShoppingPlan } from '@/features/shopping/plan';

/** Nejdelší `itemKey` (sloupec `lesson_prep_checks.item_key` má 1–120 znaků). */
export const PREP_ITEM_KEY_MAX = 120;

type PrintSource = LessonPrint['source'];

/** Název výtisku, když lekce nemá `prints` a odkaz je jen pod krokem (`printLink`). */
const fallbackPrintTitles: Record<PrintSource, string> = {
  'pattern-sheets': 'Listy střihu 1:1',
  'practice-sheets': 'Cvičné listy 1:1',
  template: 'Šablona 1:1',
};

export interface PrepPrintItem {
  kind: 'print';
  /** `print:<source>:<sheetId>`, u šablony `print:template`, u odkazu z kroku `print:<source>`. */
  key: string;
  source: PrintSource;
  sheetId?: string;
  title: string;
  /** Počet výtisků; u odkazu z kroku neznámý (obsah ho neuvádí). */
  copies?: number;
  purpose?: string;
  paper?: string;
  /** Tisk jen za podmínky – položka je volitelná a nepočítá se do „Připraveno“. */
  condition?: string;
  /** Kroky lekce (od 1), pod kterými je odkaz na tisk – jen u náhrady z `printLink`. */
  fromSteps?: readonly number[];
  href: string;
  checked: boolean;
  optional: boolean;
}

export interface PrepPlanLine {
  title: string;
  variant?: string;
  shop: string;
  quantity: number;
  lineCents: number;
  purpose?: string;
  /** Řádek plánu jen za podmínky (mimo součet). */
  optional?: true;
}

export interface PrepEquipmentItem {
  kind: 'equipment';
  slug: string;
  name: string;
  /** Podle seznamu lekce: `requiredEquipment` / `recommendedEquipment`. */
  priority: 'required' | 'recommended';
  status: EquipmentStatus;
  /** „Mám“ = stav inventáře `owned`; žádné zvláštní zaškrtnutí. */
  checked: boolean;
  /** Řádky nákupního plánu projektu pro tuto položku (může jich být víc). */
  planLines: readonly PrepPlanLine[];
  /** Důvod, proč plán položku tentokrát nekupuje. */
  skippedReason?: string;
  href: string;
  optional: boolean;
}

export interface PrepMaterialItem {
  kind: 'material';
  /** `mat:<slug textu>`. */
  key: string;
  text: string;
  /** Text je doslova v `shoppingPlan.alsoNeeded` – odkaz na nákupní seznam. */
  shoppingHref?: string;
  checked: boolean;
  optional: boolean;
}

export interface PrepRequirementItem {
  kind: 'requirement';
  /** `req:<id>`. */
  key: string;
  id: string;
  label: string;
  note?: string;
  fromLesson: { slug: string; title: string; order: number; href: string };
  /** Je lekce, ze které díl pochází, dokončená? */
  fromLessonCompleted: boolean;
  checked: boolean;
  optional: boolean;
}

export type PrepItem = PrepPrintItem | PrepEquipmentItem | PrepMaterialItem | PrepRequirementItem;

export interface LessonPrepView {
  prints: readonly PrepPrintItem[];
  equipment: readonly PrepEquipmentItem[];
  materials: readonly PrepMaterialItem[];
  requires: readonly PrepRequirementItem[];
  /** Podle jaké sestavy je nákupní plán u nástrojů (např. „podle pásku: …“); bez ní plán projektu. */
  planBasis?: string;
  /** Povinné položky (bez volitelných): kolik je připraveno z kolika. */
  summary: { done: number; total: number };
}

export interface BuildLessonPrepInput {
  project: ProjectDefinition;
  lesson: LessonDefinition;
  catalog: EquipmentCatalog;
  inventory: InventoryState;
  progress: ProgressState;
  /** Zaškrtnutí přípravy (stačí záznamy projektu; cizí lekce se ignorují). */
  checks: readonly PrepCheckRecord[];
  /**
   * Nákupní plán pro sestavu uživatele (u pásku podle uloženého pásku) místo plánu projektu.
   * `basis` se ukáže u nástrojů, ať je jasné, z čeho plán je.
   */
  planOverride?: {
    plan: ShoppingPlan;
    basis: string;
    /** Název položky podle sestavy (např. výsečník Ø 4,5 mm místo katalogového 5 mm). */
    equipmentNames?: Readonly<Record<string, string>>;
  } | null;
}

/** Klíč zaškrtnutí výtisku. */
export function printItemKey(source: PrintSource, sheetId?: string): string {
  if (source === 'template') return 'print:template';
  return sheetId ? `print:${source}:${sheetId}` : `print:${source}`;
}

export function requirementItemKey(id: string): string {
  return `req:${id}`;
}

/**
 * Slug textu materiálu bez diakritiky: „Houbička a voda“ → `houbicka-a-voda`. Dlouhý text se
 * zkrátí, aby se klíč (`mat:` + slug + případná přípona) vešel do {@link PREP_ITEM_KEY_MAX}.
 */
export function slugifyMaterial(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const short = slug.slice(0, 100).replace(/-+$/, '');
  return short.length > 0 ? short : 'material';
}

/**
 * Klíče materiálů lekce v pořadí textů. Dva texty se stejným slugem (po zkrácení) dostanou
 * příponu `-2`, `-3`…, aby se jejich zaškrtnutí nepletla.
 */
export function materialItemKeys(materials: readonly string[]): string[] {
  const seen = new Map<string, number>();
  return materials.map((text) => {
    const base = slugifyMaterial(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return `mat:${n === 1 ? base : `${base}-${n}`}`;
  });
}

/**
 * Tisková stránka zdroje, s předvýběrem listu (`?list=<sheetId>`), je-li znám. Listy střihu
 * pásku se tisknou ze stránky „Váš pásek“ (listy pro uložený pásek).
 */
export function printHref(
  project: Pick<ProjectDefinition, 'slug' | 'patternSheets'>,
  source: PrintSource,
  sheetId?: string,
): string {
  if (source === 'practice-sheets') return routes.practiceSheets(project.slug, sheetId);
  if (source === 'pattern-sheets' && project.patternSheets?.browserGenerator === 'belt-config') {
    return routes.beltConfig(project.slug, sheetId);
  }
  return routes.template(project.slug, sheetId);
}

function sheetTitle(project: ProjectDefinition, source: PrintSource, sheetId?: string) {
  if (source === 'template' || !sheetId) return fallbackPrintTitles[source];
  const sheets =
    source === 'pattern-sheets' ? project.patternSheets?.sheets : project.practiceSheets?.sheets;
  return sheets?.find((s) => s.id === sheetId)?.title ?? sheetId;
}

function buildPrints(
  project: ProjectDefinition,
  lesson: LessonDefinition,
  isChecked: (key: string) => boolean,
): PrepPrintItem[] {
  if (lesson.prints) {
    // Stejný list může být v lekci dvakrát (např. jednou s podmínkou) – klíče musí být různé.
    const seen = new Map<string, number>();
    return lesson.prints.map((p) => {
      const sheetId = p.source === 'template' ? undefined : p.sheetId;
      const base = printItemKey(p.source, sheetId);
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      const key = n === 1 ? base : `${base}-${n}`;
      return {
        kind: 'print',
        key,
        source: p.source,
        ...(sheetId ? { sheetId } : {}),
        title: sheetTitle(project, p.source, sheetId),
        copies: p.copies,
        purpose: p.purpose,
        ...(p.paper ? { paper: p.paper } : {}),
        ...(p.condition ? { condition: p.condition } : {}),
        href: printHref(project, p.source, sheetId),
        checked: isChecked(key),
        optional: p.condition !== undefined,
      };
    });
  }
  // Náhrada: lekce bez `prints` – jeden řádek za každý zdroj z odkazů pod kroky.
  const bySource = new Map<PrintSource, number[]>();
  lesson.steps.forEach((step: LessonStep, index) => {
    if (!step.printLink) return;
    bySource.set(step.printLink, [...(bySource.get(step.printLink) ?? []), index + 1]);
  });
  return [...bySource].map(([source, steps]) => {
    const key = printItemKey(source);
    return {
      kind: 'print',
      key,
      source,
      title: fallbackPrintTitles[source],
      fromSteps: steps,
      href: printHref(project, source),
      checked: isChecked(key),
      optional: false,
    };
  });
}

function buildEquipment(input: BuildLessonPrepInput): PrepEquipmentItem[] {
  const { project, lesson, catalog, inventory, planOverride } = input;
  const plan = resolveShoppingPlan(
    planOverride ? { shoppingPlan: planOverride.plan } : project,
    catalog,
    inventory,
  );
  const planLines = (slug: string): PrepPlanLine[] =>
    (plan?.shops ?? []).flatMap((group) =>
      group.lines
        .filter((l) => l.equipmentSlug === slug)
        .map((l) => ({
          title: l.example.title,
          ...(l.example.variant ? { variant: l.example.variant } : {}),
          shop: group.shop,
          quantity: l.quantity,
          lineCents: l.lineCents,
          ...(l.purpose ? { purpose: l.purpose } : {}),
          ...(l.optional ? { optional: true as const } : {}),
        })),
    );
  const item = (slug: string, priority: 'required' | 'recommended'): PrepEquipmentItem => {
    const status = getEquipmentStatus(inventory, slug);
    const skipped = plan?.skipped.find((s) => s.equipmentSlug === slug);
    return {
      kind: 'equipment',
      slug,
      name: planOverride?.equipmentNames?.[slug] ?? catalog[slug]?.name ?? slug,
      priority,
      status,
      checked: status === 'owned',
      planLines: planLines(slug),
      ...(skipped ? { skippedReason: skipped.reason } : {}),
      href: routes.shoppingItem(slug, project.slug),
      optional: priority === 'recommended',
    };
  };
  const required = lesson.requiredEquipment.map((slug) => item(slug, 'required'));
  const recommended = lesson.recommendedEquipment
    .filter((slug) => !lesson.requiredEquipment.includes(slug))
    .map((slug) => item(slug, 'recommended'));
  return [...required, ...recommended];
}

function buildMaterials(
  project: ProjectDefinition,
  lesson: LessonDefinition,
  isChecked: (key: string) => boolean,
): PrepMaterialItem[] {
  const alsoNeeded = new Set(project.shoppingPlan?.alsoNeeded ?? []);
  const keys = materialItemKeys(lesson.materials);
  return lesson.materials.map((text, i) => {
    const key = keys[i]!;
    return {
      kind: 'material',
      key,
      text,
      ...(alsoNeeded.has(text) ? { shoppingHref: routes.shopping } : {}),
      checked: isChecked(key),
      optional: false,
    };
  });
}

function buildRequires(
  input: BuildLessonPrepInput,
  isChecked: (key: string) => boolean,
): PrepRequirementItem[] {
  const { project, lesson, progress } = input;
  return (lesson.requires ?? []).flatMap((r) => {
    const from = project.lessons.find((l) => l.slug === r.fromLesson);
    if (!from) return []; // hlídá schéma; v aplikaci jen vynechat
    const key = requirementItemKey(r.id);
    return [
      {
        kind: 'requirement' as const,
        key,
        id: r.id,
        label: r.label,
        ...(r.note ? { note: r.note } : {}),
        fromLesson: {
          slug: from.slug,
          title: from.title,
          order: from.order,
          href: routes.lesson(project.slug, from.slug),
        },
        fromLessonCompleted: progress.lessons[from.slug]?.status === 'completed',
        checked: isChecked(key),
        optional: false,
      },
    ];
  });
}

/**
 * „Připravte si“ jedné lekce: co vytisknout, jaké nástroje (stav z inventáře a řádek nákupního
 * plánu), jaký materiál a co přinést z dřívějších lekcí. `summary` počítá jen povinné položky –
 * doporučené vybavení a tisk s podmínkou jsou volitelné.
 */
export function buildLessonPrep(input: BuildLessonPrepInput): LessonPrepView {
  const { project, lesson, checks } = input;
  const checked = new Set(
    checks
      .filter((c) => c.projectSlug === project.slug && c.lessonSlug === lesson.slug && c.checked)
      .map((c) => c.itemKey),
  );
  const isChecked = (key: string) => checked.has(key);

  const prints = buildPrints(project, lesson, isChecked);
  const equipment = buildEquipment(input);
  const materials = buildMaterials(project, lesson, isChecked);
  const requires = buildRequires(input, isChecked);

  const counted = [...prints, ...equipment, ...materials, ...requires].filter((i) => !i.optional);
  return {
    prints,
    equipment,
    materials,
    requires,
    ...(input.planOverride ? { planBasis: input.planOverride.basis } : {}),
    summary: { done: counted.filter((i) => i.checked).length, total: counted.length },
  };
}

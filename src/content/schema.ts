import { z } from 'zod';

/**
 * Typy a validace obsahu (IMPLEMENTATION.md §7). Obsah je v repozitáři jako typované
 * objekty; každý objekt projde Zod schématem v testu i při generování seznamu záběrů.
 */

export const equipmentPrioritySchema = z.enum(['required', 'recommended', 'later']);
export type EquipmentPriority = z.infer<typeof equipmentPrioritySchema>;

export const equipmentStatusSchema = z.enum(['want_to_buy', 'ordered', 'owned']);
export type EquipmentStatus = z.infer<typeof equipmentStatusSchema>;

export const lessonStatusSchema = z.enum(['locked', 'available', 'in_progress', 'completed']);
export type LessonStatus = z.infer<typeof lessonStatusSchema>;

export const equipmentCategorySchema = z.enum([
  'material',
  'cutting',
  'stitching',
  'gluing',
  'finishing',
  'forming',
]);
export type EquipmentCategory = z.infer<typeof equipmentCategorySchema>;

export const reviewStatusSchema = z.enum(['draft', 'reviewed']);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: jen malá písmena, čísla a pomlčky');

/** Popis záběru (ADR 001). Dokud není `src`, UI ukáže slot s popiskem, co má záběr zachytit. */
export const mediaSlotSchema = z.object({
  id: slug,
  kind: z.enum(['photo', 'video', 'illustration']),
  /** Co má záběr zachytit – slouží zároveň jako alt text a jako položka seznamu záběrů. */
  caption: z.string().min(8),
  status: z.enum(['planned', 'available']),
  /** URL nebo cesta k assetu, jen pro status `available`. */
  src: z
    .union([
      z.url().regex(/^https:\/\//, 'jen https'),
      z.string().regex(/^\/[^\s]+$/, 'relativní cesta od kořene'),
      // Malé SVG z generátoru Vite vloží jako data URL (assetsInlineLimit).
      z.string().regex(/^data:image\/svg\+xml[;,]/, 'vložené SVG'),
    ])
    .optional(),
  /** Pro video: délka v sekundách. */
  durationSeconds: z.number().int().positive().optional(),
  /** Pro ilustrace: klíč vestavěné SVG komponenty. */
  illustration: z
    .enum(['template', 'stitch-offset', 'saddle-stitch', 'blade-angle', 'assembled'])
    .optional(),
});
export type MediaSlot = z.infer<typeof mediaSlotSchema>;

const priceRangeSchema = z
  .object({ minCents: z.number().int().nonnegative(), maxCents: z.number().int().nonnegative() })
  .refine((r) => r.maxCents >= r.minCents, 'maxCents musí být ≥ minCents');
export type PriceRange = z.infer<typeof priceRangeSchema>;

const labeledValueSchema = z.object({ label: z.string().min(1), value: z.string().min(1) });
const titledReasonSchema = z.object({ title: z.string().min(1), reason: z.string().min(1) });

/**
 * Ověřený příklad konkrétního výrobku v obchodě. Přidává se jen z reálně navštívené stránky,
 * s datem ověření; ceny se mění, proto UI vždy ukazuje datum.
 */
export const productExampleSchema = z.object({
  title: z.string().min(1),
  shop: z.string().min(1),
  url: z.url().regex(/^https:\/\//, 'jen https'),
  priceCents: z.number().int().nonnegative(),
  /**
   * Varianta nabídky (velikost přířezu, zrnitost…), když katalog pod stejnou URL uvádí víc cen.
   * Spolu s `url` jednoznačně určuje příklad, na který odkazuje nákupní plán projektu.
   */
  variant: z.string().min(1).optional(),
  /** Např. „za kus, potřebujete 4“, „cena za 100 g“. */
  priceNote: z.string().min(1).optional(),
  /** Co o výrobku říct začátečníkovi (proč právě tento). */
  note: z.string().min(1).optional(),
  /**
   * Barva výrobku malými písmeny (např. „přírodní“, „černá“), když se výrobek prodává ve více
   * barvách – podle ní se příklady v katalogu seskupí (pás na opasek).
   */
  color: z.string().min(1).optional(),
  availability: z.enum(['in_stock', 'unavailable', 'preorder']),
  /** ISO datum ověření (YYYY-MM-DD). */
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type ProductExample = z.infer<typeof productExampleSchema>;

/** Nástroj nebo materiál – sdílený napříč projekty. */
export const equipmentDefinitionSchema = z
  .object({
    slug,
    name: z.string().min(1),
    englishName: z.string().min(1),
    category: equipmentCategorySchema,
    /** Jedna věta do řádku seznamu. */
    shortDescription: z.string().min(1),
    /** „K čemu slouží“ – odstavec. */
    purpose: z.string().min(1),
    /** „Co koupit“ – parametry. */
    buyingGuide: z.array(labeledValueSchema),
    /** „Na co si dát pozor“. */
    cautions: z.array(z.string().min(1)),
    /** „Nekupujte“. */
    avoid: z.array(titledReasonSchema),
    /** „Levnější nebo domácí alternativy“. */
    alternatives: z.array(titledReasonSchema),
    /** Orientační cenový rozsah; zdroj a datum v `priceNote`. */
    priceRange: priceRangeSchema,
    /**
     * `verified` = rozsah odpovídá ověřeným nabídkám (docs/content/notes-vybaveni.md); `estimate` = odhad;
     * `unknown` = cenu zatím nemáme odkud vzít (rozsah 0–0), do rozpočtu se nepočítá a UI to řekne.
     */
    priceSource: z.enum(['verified', 'estimate', 'unknown']),
    priceNote: z.string().min(1),
    /** Kde se hodí i mimo tento projekt (jen text). */
    alsoUsedFor: z.array(z.string().min(1)),
    /** Ověřené příklady výrobků s odkazy do obchodů. */
    examples: z.array(productExampleSchema),
    /** Věc běžně v domácnosti – nabídne se v onboardingu „Co už máte doma?“. */
    commonlyAtHome: z.boolean(),
    media: z.array(mediaSlotSchema),
    reviewStatus: reviewStatusSchema,
  })
  .refine(
    (e) =>
      e.priceSource !== 'unknown' || (e.priceRange.minCents === 0 && e.priceRange.maxCents === 0),
    'priceSource unknown musí mít rozsah 0–0 (žádná vymyšlená čísla)',
  );
export type EquipmentDefinition = z.infer<typeof equipmentDefinitionSchema>;

export const equipmentRequirementSchema = z.object({
  equipmentSlug: slug,
  priority: equipmentPrioritySchema,
  /** Proč je pro tento projekt potřeba. */
  reason: z.string().min(1),
  /** Konkrétní specifikace pro tento projekt. */
  specification: z.string().min(1),
  alternatives: z.array(z.string().min(1)).optional(),
});
export type EquipmentRequirement = z.infer<typeof equipmentRequirementSchema>;

export const checkpointDefinitionSchema = z.object({
  slug,
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  required: z.boolean(),
});
export type CheckpointDefinition = z.infer<typeof checkpointDefinitionSchema>;

/**
 * Odkaz z kroku na animaci postupu: samostatná stránka v `public/animace` (precachovaná
 * service workerem, funguje offline), volitelně s kotvou části (`#B`, `#anim-dno`).
 * Odkazy se skládají přes `animationLink()` z `@/content/animations`, ne ručně.
 */
export const animationLinkSchema = z.object({
  href: z
    .string()
    .regex(
      /^\/animace\/[a-z0-9-]+\.html(#[A-Za-z0-9-]+)?$/,
      'animationLink.href musí mířit na /animace/<soubor>.html, volitelně s kotvou',
    ),
  /** Která část animace se otevře, např. „Část B – značky na líc“. */
  label: z.string().min(1),
});
export type AnimationLink = z.infer<typeof animationLinkSchema>;

/**
 * Čekání v kroku (schnutí lepidla, přes noc pod zátěží…), ze kterého si uživatel spustí časovač.
 * Čísla se berou jen z textu lekce nebo zadání (`basis: 'text'`, UI „Podle lekce: …“). Kde text
 * říká „podle návodu“, je `basis: 'manufacturer'`: UI ukáže, že výchozí doba je orientační
 * a má se nastavit podle návodu. Kde text dobu neuvádí vůbec (např. „nejlépe přes noc“), je
 * `basis: 'estimate'`: výchozí doba je jen odhad k úpravě. Obojí jde upravit.
 */
export const stepWaitSchema = z
  .object({
    id: slug,
    /** Co se čeká, např. „Zavadnutí lepidla“. */
    label: z.string().min(1),
    minutes: z.number().int().positive(),
    /** Horní mez rozsahu („10–15 min“); chybí = pevná doba. */
    maxMinutes: z.number().int().positive().optional(),
    basis: z.enum(['text', 'manufacturer', 'estimate']),
    /** Pozdější krok téže lekce, se kterým se musí počkat, než čekání doběhne. */
    blocksStepId: slug.optional(),
    /**
     * Pole zápisníku v minutách (z dřívějšího kroku), jehož zapsaná hodnota je výchozí doba
     * časovače – např. doba schnutí barvy, kterou si uživatel ověřil na odřezku.
     */
    initialFromField: slug.optional(),
  })
  .refine((w) => w.maxMinutes === undefined || w.maxMinutes >= w.minutes, {
    message: 'maxMinutes musí být ≥ minutes',
  });
export type StepWait = z.infer<typeof stepWaitSchema>;

export const recordUnitSchema = z.enum(['mm', 'cm', 'min', 'ks', '×', '']);
export type RecordUnit = z.infer<typeof recordUnitSchema>;

const recordFieldBase = {
  /** Unikátní v celém projektu; na pole se odkazují `recalls` a předvyplnění listů. */
  id: slug,
  label: z.string().min(1),
  hint: z.string().min(1).optional(),
};

/** Pole zápisníku v kroku: číslo (naměřená hodnota), volba, nebo krátký text. */
export const recordFieldSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('number'),
    ...recordFieldBase,
    unit: recordUnitSchema,
    min: z.number().optional(),
    max: z.number().optional(),
    /** Počet desetinných míst při zobrazení. */
    decimals: z.number().int().min(0).max(3).optional(),
    /** Cílové rozmezí z textu lekce; mimo něj UI upozorní. */
    target: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
        /** Např. „cíl 50 mm“. */
        label: z.string().min(1),
      })
      .optional(),
  }),
  z.object({
    kind: z.literal('choice'),
    ...recordFieldBase,
    options: z.array(z.object({ value: slug, label: z.string().min(1) })).min(2),
  }),
  z.object({
    kind: z.literal('text'),
    ...recordFieldBase,
    maxLength: z.number().int().positive().max(1000).optional(),
  }),
]);
export type RecordField = z.infer<typeof recordFieldSchema>;

/** Připomínka hodnoty zapsané dříve (v dřívější lekci nebo dřívějším kroku téže lekce). */
export const stepRecallSchema = z.object({
  fieldId: slug,
  /** Např. „Výsečník, který vám sedl v lekci 3“. */
  label: z.string().min(1),
});
export type StepRecall = z.infer<typeof stepRecallSchema>;

export const lessonStepSchema = z.object({
  id: slug,
  title: z.string().min(1),
  body: z.string().min(1),
  media: z.array(mediaSlotSchema),
  /**
   * Odkaz pod krokem na tiskovou stránku: `practice-sheets` = cvičné listy projektu
   * (`practiceSheets`), např. cvičná šablona k vyzkoušení přenosu šablony na odřezku;
   * `pattern-sheets` = listy střihu projektu (`patternSheets`), kde krok říká „vytiskněte list …“;
   * `template` = obdélníková šablona 1:1 projektu (`template`).
   */
  printLink: z.enum(['practice-sheets', 'pattern-sheets', 'template']).optional(),
  /**
   * Odkazy pod krokem na animace postupu a návod na délku nitě, každý jako vlastní tlačítko
   * („▶ Animace postupu“, „📏 Jak odměřit nit“) v pořadí pole. Bez odkazů pole vynechte.
   */
  animationLinks: z.array(animationLinkSchema).min(1).optional(),
  /** Čekání v kroku, ze kterých jde spustit časovač. */
  waits: z.array(stepWaitSchema).min(1).optional(),
  /** Pole zápisníku: co si v tomto kroku zapsat. */
  records: z.array(recordFieldSchema).min(1).optional(),
  /** Hodnoty zapsané dříve, které se v tomto kroku hodí připomenout. */
  recalls: z.array(stepRecallSchema).min(1).optional(),
});
export type LessonStep = z.infer<typeof lessonStepSchema>;

/**
 * Fáze cesty. `kind` říká, z čeho se počítá postup fáze:
 * enrollment = výběr projektu, equipment = nezbytné vybavení ve stavu Mám,
 * lessons = povinné kontrolní body lekcí této fáze, completion = označení projektu za hotový.
 */
export const phaseDefinitionSchema = z.object({
  slug,
  code: z.string().regex(/^\d{2}$/),
  name: z.string().min(1),
  kind: z.enum(['enrollment', 'equipment', 'lessons', 'completion']),
});
export type PhaseDefinition = z.infer<typeof phaseDefinitionSchema>;

/**
 * Co si před lekcí vytisknout. `sheetId` je id listu z `patternSheets` / `practiceSheets`
 * (povinné kromě `template`, kde se tiskne celá šablona projektu).
 */
export const lessonPrintSchema = z.object({
  source: z.enum(['pattern-sheets', 'practice-sheets', 'template']),
  sheetId: slug.optional(),
  copies: z.number().int().positive(),
  /** K čemu výtisk slouží v lekci. */
  purpose: z.string().min(1),
  /** Např. „čtvrtka“, „obyčejný papír A4“. */
  paper: z.string().min(1).optional(),
  /** Kdy tisknout, např. „jen když zkouška okna nevyšla“. */
  condition: z.string().min(1).optional(),
});
export type LessonPrint = z.infer<typeof lessonPrintSchema>;

/** Co si přinést z dřívější lekce (vyschlý díl, vyříznutá šablona…). */
export const lessonRequirementSchema = z.object({
  id: slug,
  fromLesson: slug,
  label: z.string().min(1),
  note: z.string().min(1).optional(),
});
export type LessonRequirement = z.infer<typeof lessonRequirementSchema>;

export const lessonDefinitionSchema = z.object({
  slug,
  title: z.string().min(1),
  order: z.number().int().positive(),
  phaseSlug: slug,
  estimatedMinutes: z.number().int().positive(),
  /** „Cíl:“ jedna věta. */
  goal: z.string().min(1),
  /** Co si připravit navíc k vybavení (odřezky, voda…). */
  materials: z.array(z.string().min(1)),
  requiredEquipment: z.array(slug),
  /** Doporučené vybavení pro lekci – zobrazí se v „Připravte si“, nikdy neblokuje. */
  recommendedEquipment: z.array(slug),
  prerequisiteLessons: z.array(slug),
  steps: z.array(lessonStepSchema).min(1),
  checkpoints: z.array(checkpointDefinitionSchema).min(1),
  commonMistakes: z.array(z.string().min(1)),
  safety: z.array(z.string().min(1)),
  /** Hlavní záběr lekce. */
  media: z.array(mediaSlotSchema),
  reviewStatus: reviewStatusSchema,
  /** „Připravte si → Vytisknout“. */
  prints: z.array(lessonPrintSchema).min(1).optional(),
  /** „Připravte si → Z předchozích lekcí“. */
  requires: z.array(lessonRequirementSchema).min(1).optional(),
});
export type LessonDefinition = z.infer<typeof lessonDefinitionSchema>;

/** Díl šablony 1:1 v milimetrech. */
export const templatePieceSchema = z.object({
  id: slug,
  name: z.string().min(1),
  widthMm: z.number().positive(),
  heightMm: z.number().positive(),
  cornerRadiusMm: z.number().nonnegative(),
  /** Vzdálenost linie stehu od hrany. */
  stitchOffsetMm: z.number().positive(),
  /** `top` = horní hrana bez stehu (otvor kapsy); `none` = steh po celém obvodu. */
  openEdge: z.enum(['top', 'none']),
  /** Steh na bocích vede od spodku jen do této výšky (např. zadní díl jen po výšku přední kapsy). */
  stitchUpToMm: z.number().positive().optional(),
  /**
   * Značka výšky na obou bocích (od spodní hrany), krátká čárka `lengthMm` dovnitř dílu, např.
   * horní hrana přední kapsy na zadním dílu. Propichuje se šídlem (lekce 6 projektu 01).
   */
  heightMark: z
    .object({ fromBottomMm: z.number().positive(), lengthMm: z.number().positive() })
    .optional(),
  /** Mělký výřez na palec uprostřed horní hrany, kterým se vysouvá karta. */
  thumbCutout: z
    .object({ widthMm: z.number().positive(), depthMm: z.number().positive() })
    .optional(),
  quantity: z.number().int().positive(),
});
export type TemplatePiece = z.infer<typeof templatePieceSchema>;

export const templateDefinitionSchema = z.object({
  pieces: z.array(templatePieceSchema).min(1),
  stitchSpacingLabel: z.string().min(1),
  threadLabel: z.string().min(1),
  /** Kontrolní úsečka pro ověření tisku 1:1. */
  calibrationMm: z.number().positive(),
  printNote: z.string().min(1),
});
export type TemplateDefinition = z.infer<typeof templateDefinitionSchema>;

/**
 * List střihu vygenerovaný skriptem (SVG v mm, 1:1). Pro projekty, jejichž díly nejsou obdélníky
 * a kreslí je generátor (`scripts/*.ts`), ne `TemplateIllustration`. Soubor k listu dodá registr
 * `patternSheetUrlsFor(projectSlug)` podle `id`.
 */
export const patternSheetSchema = z.object({
  id: slug,
  title: z.string().min(1),
  /** Jedna věta: co na listu je a kdy ho použít. */
  note: z.string().min(1),
  orientation: z.enum(['portrait', 'landscape']),
  widthMm: z.number().positive(),
  heightMm: z.number().positive(),
  /** Např. „mince 40 mm (předloha)“; bez varianty = výchozí střih. */
  variant: z.string().min(1).optional(),
});
export type PatternSheet = z.infer<typeof patternSheetSchema>;

export const patternSheetsDefinitionSchema = z.object({
  sheets: z.array(patternSheetSchema).min(1),
  calibrationMm: z.number().positive(),
  printNote: z.string().min(1),
  /** Jak si vygenerovat další varianty (příkaz generátoru). */
  variantsNote: z.string().min(1).optional(),
  /** Nadpis skupiny listů bez varianty na tiskové stránce (např. pro jakou minci a kůži); jinak „Výchozí střih“. */
  defaultVariantLabel: z.string().min(1).optional(),
  /**
   * Listy umí aplikace vygenerovat i v prohlížeči pro změřené hodnoty (formulář na stránce tisku).
   * Klíč vybere formulář; výpočet a kreslení jsou v `src/lib/patterns`. `belt-config` =
   * „Váš pásek“ (šířka, tloušťka, obvod, konec, dírky); listy mají id `prezka` a `spicka`
   * (`BELT_SHEET_IDS`).
   */
  browserGenerator: z.enum(['lid-wallet-thickness', 'belt-config']).optional(),
});
export type PatternSheetsDefinition = z.infer<typeof patternSheetsDefinitionSchema>;

/**
 * Řádek nákupního plánu: kolik kusů kterého ověřeného příkladu z katalogu koupit. Cenu, obchod
 * a dostupnost plán neopisuje – bere je z příkladu (`url` + případně `variant`), aby se ceny
 * nevedly na dvou místech.
 */
export const shoppingPlanLineSchema = z.object({
  equipmentSlug: slug,
  url: z.url().regex(/^https:\/\//, 'jen https'),
  variant: z.string().min(1).optional(),
  quantity: z.number().int().positive(),
  /** Na co se kupuje, např. „pás těla 240,35 × 104,1 mm“. */
  purpose: z.string().min(1).optional(),
});
export type ShoppingPlanLine = z.infer<typeof shoppingPlanLineSchema>;

/**
 * „Co koupit“ pro jednu konkrétní sestavu projektu (mince, tloušťka kůže, kování). Každá
 * nezbytná a doporučená položka projektu je buď v `lines`, nebo v `skipped` s důvodem.
 */
export const shoppingPlanSchema = z.object({
  /** Pro jakou sestavu plán platí. */
  title: z.string().min(1),
  lines: z.array(shoppingPlanLineSchema).min(1),
  skipped: z.array(z.object({ equipmentSlug: slug, reason: z.string().min(1) })),
  /**
   * Drobnosti z domácnosti, papírnictví nebo hobby marketu, které postup potřebuje, ale katalog
   * je nevede a cenu neověřujeme (maskovací páska, čtvrtka…). Do součtu se nepočítají.
   */
  alsoNeeded: z.array(z.string().min(1)).optional(),
});
export type ShoppingPlan = z.infer<typeof shoppingPlanSchema>;

export const projectDefinitionSchema = z
  .object({
    slug,
    code: z.string().regex(/^\d{2}$/),
    title: z.string().min(1),
    summary: z.string().min(1),
    description: z.string().min(1),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedHours: z.object({ min: z.number().positive(), max: z.number().positive() }),
    /** „Naučíte se“. */
    skills: z.array(z.string().min(1)),
    phases: z.array(phaseDefinitionSchema).min(1),
    equipment: z.array(equipmentRequirementSchema).min(1),
    lessons: z.array(lessonDefinitionSchema).min(1),
    /** Šablona z obdélníkových dílů (kreslí ji aplikace). Projekt má buď tuto, nebo `patternSheets`. */
    template: templateDefinitionSchema.optional(),
    /** Listy střihu z generátoru (SVG 1:1). */
    patternSheets: patternSheetsDefinitionSchema.optional(),
    /**
     * Cvičné listy z generátoru (SVG 1:1) na trénink na odřezku, ne díly výrobku. Mají vlastní
     * tiskovou stránku, takže je může mít i projekt s obdélníkovou `template`. Soubory dodá stejný
     * registr jako u `patternSheets` (`patternSheetUrlsFor`), id se nesmí s listy střihu opakovat.
     */
    practiceSheets: patternSheetsDefinitionSchema.optional(),
    /** Nákupní plán „Co koupit“ (volitelný); ceny a odkazy bere z příkladů v katalogu. */
    shoppingPlan: shoppingPlanSchema.optional(),
    media: z.array(mediaSlotSchema),
    contentVersion: z.number().int().positive(),
    reviewStatus: reviewStatusSchema,
  })
  .superRefine((project, ctx) => {
    if ((project.template === undefined) === (project.patternSheets === undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: `Projekt ${project.slug}: potřebuje právě jedno z template / patternSheets`,
      });
    }
    if (!project.template) {
      const media = [
        ...project.media,
        ...project.lessons.flatMap((l) => [...l.media, ...l.steps.flatMap((s) => s.media)]),
      ];
      for (const m of media) {
        if (m.illustration === 'template' || m.illustration === 'assembled') {
          ctx.addIssue({
            code: 'custom',
            message: `Projekt ${project.slug}: ilustrace ${m.illustration} (${m.id}) potřebuje obdélníkovou šablonu`,
          });
        }
      }
    }
    const sheetIds = [
      ...(project.patternSheets?.sheets.map((s) => s.id) ?? []),
      ...(project.practiceSheets?.sheets.map((s) => s.id) ?? []),
    ];
    if (new Set(sheetIds).size !== sheetIds.length) {
      ctx.addIssue({ code: 'custom', message: `Projekt ${project.slug}: duplicitní id listu` });
    }
    const phaseSlugs = new Set(project.phases.map((p) => p.slug));
    const equipmentSlugs = new Set(project.equipment.map((e) => e.equipmentSlug));
    if (project.shoppingPlan) {
      const plan = project.shoppingPlan;
      const planned = new Set(plan.lines.map((l) => l.equipmentSlug));
      const skipped = new Set(plan.skipped.map((s) => s.equipmentSlug));
      for (const s of [...planned, ...skipped]) {
        if (!equipmentSlugs.has(s)) {
          ctx.addIssue({
            code: 'custom',
            message: `Projekt ${project.slug}: nákupní plán zmiňuje ${s}, které v projektu není`,
          });
        }
        if (planned.has(s) && skipped.has(s)) {
          ctx.addIssue({
            code: 'custom',
            message: `Projekt ${project.slug}: ${s} je v plánu zároveň ke koupi i vynechané`,
          });
        }
      }
      for (const req of project.equipment) {
        if (req.priority === 'later') continue;
        if (!planned.has(req.equipmentSlug) && !skipped.has(req.equipmentSlug)) {
          ctx.addIssue({
            code: 'custom',
            message: `Projekt ${project.slug}: nákupní plán neříká nic o ${req.equipmentSlug}`,
          });
        }
      }
      const keys = plan.lines.map((l) => `${l.equipmentSlug} ${l.url} ${l.variant ?? ''}`);
      if (new Set(keys).size !== keys.length) {
        ctx.addIssue({
          code: 'custom',
          message: `Projekt ${project.slug}: duplicitní řádek plánu`,
        });
      }
    }
    const sortedOrders = [...project.lessons].map((l) => l.order).sort((a, b) => a - b);
    sortedOrders.forEach((order, index) => {
      if (order !== index + 1) {
        ctx.addIssue({
          code: 'custom',
          message: `Lekce musí mít order 1..n bez mezer, nalezeno ${order}`,
        });
      }
    });

    for (const lesson of project.lessons) {
      if (!phaseSlugs.has(lesson.phaseSlug)) {
        ctx.addIssue({
          code: 'custom',
          message: `Lekce ${lesson.slug}: neznámá fáze ${lesson.phaseSlug}`,
        });
      }
      for (const p of lesson.prerequisiteLessons) {
        const target = project.lessons.find((l) => l.slug === p);
        if (!target) {
          ctx.addIssue({
            code: 'custom',
            message: `Lekce ${lesson.slug}: neznámá prerekvizita ${p}`,
          });
        } else if (target.order >= lesson.order) {
          ctx.addIssue({
            code: 'custom',
            message: `Lekce ${lesson.slug}: prerekvizita ${p} musí předcházet`,
          });
        }
      }
      for (const e of [...lesson.requiredEquipment, ...lesson.recommendedEquipment]) {
        if (!equipmentSlugs.has(e)) {
          ctx.addIssue({
            code: 'custom',
            message: `Lekce ${lesson.slug}: vybavení ${e} není v projektu`,
          });
        }
      }
      for (const step of lesson.steps) {
        if (step.printLink === 'practice-sheets' && !project.practiceSheets) {
          ctx.addIssue({
            code: 'custom',
            message: `Lekce ${lesson.slug}: krok ${step.id} odkazuje na cvičné listy, projekt žádné nemá`,
          });
        }
        if (step.printLink === 'template' && !project.template) {
          ctx.addIssue({
            code: 'custom',
            message: `Lekce ${lesson.slug}: krok ${step.id} odkazuje na šablonu, projekt žádnou nemá`,
          });
        }
        if (step.printLink === 'pattern-sheets' && !project.patternSheets) {
          ctx.addIssue({
            code: 'custom',
            message: `Lekce ${lesson.slug}: krok ${step.id} odkazuje na listy střihu, projekt žádné nemá`,
          });
        }
      }
      checkLessonPrints(project, lesson, ctx);
      checkLessonRequires(project.lessons, lesson, ctx);
      checkStepWaits(lesson, ctx);
      if (!lesson.checkpoints.some((c) => c.required)) {
        ctx.addIssue({
          code: 'custom',
          message: `Lekce ${lesson.slug}: chybí povinný kontrolní bod`,
        });
      }
    }
    checkRecords(project.lessons, ctx);
  });
export type ProjectDefinition = z.infer<typeof projectDefinitionSchema>;

/** Mapa slug → definice vybavení. */
export type EquipmentCatalog = Readonly<Record<string, EquipmentDefinition>>;

/* Kontroly polí kroků a lekcí (časovače, zápisník, „Připravte si“). */

type Ctx = z.core.$RefinementCtx<unknown>;
type ProjectShape = Pick<ProjectDefinition, 'template' | 'patternSheets' | 'practiceSheets'>;

function checkLessonPrints(project: ProjectShape, lesson: LessonDefinition, ctx: Ctx) {
  for (const print of lesson.prints ?? []) {
    if (print.source === 'template') {
      if (!project.template) {
        ctx.addIssue({
          code: 'custom',
          message: `Lekce ${lesson.slug}: tisk šablony, projekt žádnou obdélníkovou šablonu nemá`,
        });
      }
      if (print.sheetId !== undefined) {
        ctx.addIssue({
          code: 'custom',
          message: `Lekce ${lesson.slug}: tisk šablony nemá sheetId`,
        });
      }
      continue;
    }
    const sheets =
      print.source === 'pattern-sheets' ? project.patternSheets : project.practiceSheets;
    if (print.sheetId === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: `Lekce ${lesson.slug}: tisk z ${print.source} potřebuje sheetId`,
      });
    } else if (!sheets?.sheets.some((s) => s.id === print.sheetId)) {
      ctx.addIssue({
        code: 'custom',
        message: `Lekce ${lesson.slug}: list ${print.sheetId} v ${print.source} neexistuje`,
      });
    }
  }
}

function checkLessonRequires(
  lessons: readonly LessonDefinition[],
  lesson: LessonDefinition,
  ctx: Ctx,
) {
  const ids = new Set<string>();
  for (const req of lesson.requires ?? []) {
    if (ids.has(req.id)) {
      ctx.addIssue({
        code: 'custom',
        message: `Lekce ${lesson.slug}: duplicitní id požadavku ${req.id}`,
      });
    }
    ids.add(req.id);
    const from = lessons.find((l) => l.slug === req.fromLesson);
    if (!from) {
      ctx.addIssue({
        code: 'custom',
        message: `Lekce ${lesson.slug}: požadavek ${req.id} z neznámé lekce ${req.fromLesson}`,
      });
    } else if (from.order >= lesson.order) {
      ctx.addIssue({
        code: 'custom',
        message: `Lekce ${lesson.slug}: požadavek ${req.id} musí být z dřívější lekce`,
      });
    }
  }
}

function checkStepWaits(lesson: LessonDefinition, ctx: Ctx) {
  lesson.steps.forEach((step, index) => {
    const ids = new Set<string>();
    for (const wait of step.waits ?? []) {
      if (ids.has(wait.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Lekce ${lesson.slug}: krok ${step.id} má duplicitní čekání ${wait.id}`,
        });
      }
      ids.add(wait.id);
      if (wait.blocksStepId === undefined) continue;
      const target = lesson.steps.findIndex((s) => s.id === wait.blocksStepId);
      if (target === -1) {
        ctx.addIssue({
          code: 'custom',
          message: `Lekce ${lesson.slug}: čekání ${wait.id} blokuje neznámý krok ${wait.blocksStepId}`,
        });
      } else if (target <= index) {
        ctx.addIssue({
          code: 'custom',
          message: `Lekce ${lesson.slug}: čekání ${wait.id} smí blokovat jen pozdější krok`,
        });
      }
    }
  });
}

/** Pozice pole zápisníku v projektu: pořadí lekce a index kroku. */
interface FieldPosition {
  lessonOrder: number;
  stepIndex: number;
}

function checkRecords(lessons: readonly LessonDefinition[], ctx: Ctx) {
  const positions = new Map<string, FieldPosition & { field: RecordField }>();
  for (const lesson of lessons) {
    lesson.steps.forEach((step, stepIndex) => {
      for (const field of step.records ?? []) {
        if (positions.has(field.id)) {
          ctx.addIssue({
            code: 'custom',
            message: `Lekce ${lesson.slug}: pole zápisníku ${field.id} už v projektu je`,
          });
        }
        positions.set(field.id, { lessonOrder: lesson.order, stepIndex, field });
        checkRecordField(lesson.slug, field, ctx);
      }
    });
  }
  const isEarlier = (at: FieldPosition, lesson: LessonDefinition, stepIndex: number) =>
    at.lessonOrder < lesson.order || (at.lessonOrder === lesson.order && at.stepIndex < stepIndex);
  for (const lesson of lessons) {
    lesson.steps.forEach((step, stepIndex) => {
      for (const wait of step.waits ?? []) {
        if (wait.initialFromField === undefined) continue;
        const at = positions.get(wait.initialFromField);
        const where = `Lekce ${lesson.slug}: čekání ${wait.id}`;
        if (!at) {
          ctx.addIssue({
            code: 'custom',
            message: `${where} přebírá dobu z neznámého pole ${wait.initialFromField}`,
          });
        } else if (!isEarlier(at, lesson, stepIndex)) {
          ctx.addIssue({
            code: 'custom',
            message: `${where} smí převzít dobu jen z dříve zapsaného pole (${wait.initialFromField})`,
          });
        } else if (at.field.kind !== 'number' || at.field.unit !== 'min') {
          ctx.addIssue({
            code: 'custom',
            message: `${where}: pole ${wait.initialFromField} není v minutách`,
          });
        }
      }
      for (const recall of step.recalls ?? []) {
        const at = positions.get(recall.fieldId);
        if (!at) {
          ctx.addIssue({
            code: 'custom',
            message: `Lekce ${lesson.slug}: krok ${step.id} připomíná neznámé pole ${recall.fieldId}`,
          });
        } else if (!isEarlier(at, lesson, stepIndex)) {
          ctx.addIssue({
            code: 'custom',
            message: `Lekce ${lesson.slug}: krok ${step.id} smí připomínat jen dříve zapsané pole (${recall.fieldId})`,
          });
        }
      }
    });
  }
}

function checkRecordField(lessonSlug: string, field: RecordField, ctx: Ctx) {
  const issue = (what: string) =>
    ctx.addIssue({ code: 'custom', message: `Lekce ${lessonSlug}: pole ${field.id}: ${what}` });
  if (field.kind === 'number') {
    if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
      issue('min musí být ≤ max');
    }
    const t = field.target;
    if (t) {
      if (t.min === undefined && t.max === undefined) issue('cíl potřebuje min nebo max');
      if (t.min !== undefined && t.max !== undefined && t.min > t.max) {
        issue('cíl: min musí být ≤ max');
      }
    }
  } else if (field.kind === 'choice') {
    const values = field.options.map((o) => o.value);
    if (new Set(values).size !== values.length) issue('duplicitní hodnota volby');
  }
}

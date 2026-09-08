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
  /** Např. „za kus, potřebujete 4“, „cena za 100 g“. */
  priceNote: z.string().min(1).optional(),
  /** Co o výrobku říct začátečníkovi (proč právě tento). */
  note: z.string().min(1).optional(),
  availability: z.enum(['in_stock', 'unavailable', 'preorder']),
  /** ISO datum ověření (YYYY-MM-DD). */
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type ProductExample = z.infer<typeof productExampleSchema>;

/** Nástroj nebo materiál – sdílený napříč projekty. */
export const equipmentDefinitionSchema = z.object({
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
  /** `verified` = rozsah odpovídá ověřeným nabídkám (docs/content/notes-vybaveni.md); `estimate` = odhad. */
  priceSource: z.enum(['verified', 'estimate']),
  priceNote: z.string().min(1),
  /** Kde se hodí i mimo tento projekt (jen text). */
  alsoUsedFor: z.array(z.string().min(1)),
  /** Ověřené příklady výrobků s odkazy do obchodů. */
  examples: z.array(productExampleSchema),
  /** Věc běžně v domácnosti – nabídne se v onboardingu „Co už máte doma?“. */
  commonlyAtHome: z.boolean(),
  media: z.array(mediaSlotSchema),
  reviewStatus: reviewStatusSchema,
});
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

export const lessonStepSchema = z.object({
  id: slug,
  title: z.string().min(1),
  body: z.string().min(1),
  media: z.array(mediaSlotSchema),
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
    template: templateDefinitionSchema,
    media: z.array(mediaSlotSchema),
    contentVersion: z.number().int().positive(),
    reviewStatus: reviewStatusSchema,
  })
  .superRefine((project, ctx) => {
    const phaseSlugs = new Set(project.phases.map((p) => p.slug));
    const equipmentSlugs = new Set(project.equipment.map((e) => e.equipmentSlug));
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
      if (!lesson.checkpoints.some((c) => c.required)) {
        ctx.addIssue({
          code: 'custom',
          message: `Lekce ${lesson.slug}: chybí povinný kontrolní bod`,
        });
      }
    }
  });
export type ProjectDefinition = z.infer<typeof projectDefinitionSchema>;

/** Mapa slug → definice vybavení. */
export type EquipmentCatalog = Readonly<Record<string, EquipmentDefinition>>;

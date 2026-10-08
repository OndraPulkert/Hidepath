import { beltProject } from '@/content/projects/belt/project';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { type ProjectDefinition } from '@/content/schema';

/**
 * Zápisy Víčka: stav formuláře „Listy pro vaši kůži“ (jediný zdroj tlouštěk, P0, k, magnetu
 * a záloh), výsledky zkoušek, ze kterých formulář upozorní na zálohu, a starší pole lekcí (jen
 * pro převod). Přes registr, aby aplikace neimportovala obsah projektu přímo.
 */
export {
  LEGACY_LID_RECORD_IDS,
  LEGACY_LID_SHEETS_LIMITS,
  LID_RECORD_IDS,
  LID_SHEETS_FIELD_ID,
  LID_SHEETS_LESSON_SLUG,
  LID_V12_RESULTS,
  LID_Z2_RESULTS,
} from '@/content/projects/lid-wallet/record-ids';

/**
 * Zápisy pásku: „Moje pásky“, aktivní pásek a starší pole lekce 1 (jen pro převod na uložený
 * pásek).
 */
export {
  BELT_ACTIVE_FIELD_ID,
  BELT_CONFIG_FIELD_PREFIX,
  BELT_CONFIG_LESSON_SLUG,
  BELT_PLATE_CHECK,
  BELT_PLATE_CHECK_ID,
  BELT_TIP_CHOICES,
  LEGACY_BELT_MARKING,
  LEGACY_BELT_MARKING_ID,
  LEGACY_BELT_RECORD_IDS,
} from '@/content/projects/belt/record-ids';

/** Ilustrace měření obvodu pro formulář „Váš pásek“ (tytéž jako v lekci 1 pásku). */
export {
  illustration as BELT_ILLUSTRATION,
  illustrationCaption as BELT_ILLUSTRATION_CAPTION,
} from '@/content/projects/belt/illustrations';

export const projects: readonly ProjectDefinition[] = [
  cardHolderProject,
  coinCardHolderProject,
  lidWalletProject,
  beltProject,
];

/**
 * První zastávka cesty učení: projekt, na který nový uživatel nastupuje (onboarding) a který
 * je aktivní, dokud se uživatel nezapíše jinam (`resolveActiveProject`).
 * **Jediné místo v aplikaci, které pouzdro jmenuje.** Stránky ho neimportují
 * přímo – berou si aktivní projekt přes `useActiveProject()`, aby druhý projekt
 * (peněženka, pásek) nevyžadoval zásah do sedmi souborů jako dosud.
 */
export const startingProject: ProjectDefinition = cardHolderProject;

export function findProject(slug: string): ProjectDefinition | undefined {
  return projects.find((p) => p.slug === slug);
}

export const difficultyLabels: Record<ProjectDefinition['difficulty'], string> = {
  beginner: 'Začátečník',
  intermediate: 'Mírně pokročilý',
  advanced: 'Pokročilý',
};

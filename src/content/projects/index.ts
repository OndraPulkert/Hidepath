import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { type ProjectDefinition } from '@/content/schema';

export const projects: readonly ProjectDefinition[] = [
  cardHolderProject,
  coinCardHolderProject,
  lidWalletProject,
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

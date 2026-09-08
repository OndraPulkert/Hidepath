import { cardHolderProject } from '@/content/projects/card-holder/project';
import { type ProjectDefinition } from '@/content/schema';

export const projects: readonly ProjectDefinition[] = [cardHolderProject];

export function findProject(slug: string): ProjectDefinition | undefined {
  return projects.find((p) => p.slug === slug);
}

export const difficultyLabels: Record<ProjectDefinition['difficulty'], string> = {
  beginner: 'Začátečník',
  intermediate: 'Mírně pokročilý',
  advanced: 'Pokročilý',
};

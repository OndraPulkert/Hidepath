import { describe, expect, it } from 'vitest';

import { projects, startingProject } from '@/content/projects';
import { type ProjectDefinition } from '@/content/schema';
import { type EnrollmentRecord } from '@/features/progress/types';

import { resolveActiveProject } from './active-project';

const other: ProjectDefinition = { ...startingProject, slug: 'druhy-projekt', code: '02' };
const all = [startingProject, other];

function enrollment(
  projectSlug: string,
  status: EnrollmentRecord['status'],
  updatedAt: string,
): EnrollmentRecord {
  return {
    id: `id-${projectSlug}`,
    userId: null,
    projectSlug,
    contentVersion: 1,
    status,
    startedAt: updatedAt,
    completedAt: status === 'completed' ? updatedAt : null,
    createdAt: updatedAt,
    updatedAt,
  };
}

describe('resolveActiveProject', () => {
  it('bez zápisu je aktivní první zastávka cesty', () => {
    expect(resolveActiveProject(all, [], null, startingProject)).toBe(startingProject);
    expect(resolveActiveProject(all, [], other.slug, startingProject)).toBe(startingProject);
  });

  it('volba z přehledu vyhraje, jen když je do projektu zápis', () => {
    const e = [
      enrollment(startingProject.slug, 'active', '2026-09-20T10:00:00Z'),
      enrollment(other.slug, 'active', '2026-09-10T10:00:00Z'),
    ];
    expect(resolveActiveProject(all, e, other.slug, startingProject)).toBe(other);
    expect(resolveActiveProject(all, e, 'neexistuje', startingProject)).toBe(startingProject);
  });

  it('bez volby rozhodne naposledy změněný aktivní zápis, dokončený až potom', () => {
    const e = [
      enrollment(startingProject.slug, 'completed', '2026-09-25T10:00:00Z'),
      enrollment(other.slug, 'active', '2026-09-10T10:00:00Z'),
    ];
    expect(resolveActiveProject(all, e, null, startingProject)).toBe(other);
    const onlyCompleted = [enrollment(other.slug, 'completed', '2026-09-10T10:00:00Z')];
    expect(resolveActiveProject(all, onlyCompleted, null, startingProject)).toBe(other);
  });

  it('archivovaný zápis ani zápis neznámého projektu se nepočítá', () => {
    const e = [
      enrollment(other.slug, 'archived', '2026-09-25T10:00:00Z'),
      enrollment('smazany-projekt', 'active', '2026-09-26T10:00:00Z'),
    ];
    expect(resolveActiveProject(all, e, other.slug, startingProject)).toBe(startingProject);
  });

  it('registr obsahuje první zastávku cesty', () => {
    expect(projects).toContain(startingProject);
  });
});

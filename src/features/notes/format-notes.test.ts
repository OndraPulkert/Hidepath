import { cardHolderProject } from '@/content/projects/card-holder/project';
import { countNotedLessons, formatProjectNotes } from '@/features/notes/format-notes';
import { type LessonNoteRecord } from '@/features/notes/types';

const note = (lessonSlug: string, text: string): LessonNoteRecord => ({
  id: `n-${lessonSlug}`,
  userId: null,
  projectSlug: cardHolderProject.slug,
  lessonSlug,
  text,
  createdAt: '2026-09-13T08:00:00.000Z',
  updatedAt: '2026-09-13T08:00:00.000Z',
});

describe('formatProjectNotes', () => {
  const [l1, l2, l3] = cardHolderProject.lessons;

  it('řadí podle pořadí lekcí, ne podle pořadí zápisu, a prázdné vynechá', () => {
    const out = formatProjectNotes(
      cardHolderProject,
      [
        note(l3!.slug, 'krok 2 – nůž klouzal'),
        note(l1!.slug, 'chyběl světlo'),
        note(l2!.slug, '   '),
      ],
      new Date('2026-09-13T10:00:00Z'),
    );
    expect(out.startsWith(`Poznámky od ponku – ${cardHolderProject.title} (2026-09-13)`)).toBe(
      true,
    );
    expect(out.indexOf(l1!.title)).toBeLessThan(out.indexOf(l3!.title));
    expect(out).not.toContain(l2!.title);
    expect(out).toContain('01 ');
    expect(out).toContain('krok 2 – nůž klouzal');
  });

  it('bez poznámek vrátí prázdný řetězec, ne jen hlavičku', () => {
    expect(formatProjectNotes(cardHolderProject, [])).toBe('');
    expect(formatProjectNotes(cardHolderProject, [note(l1!.slug, '  ')])).toBe('');
  });

  it('počítá jen lekce s neprázdnou poznámkou', () => {
    expect(countNotedLessons([note('a', 'x'), note('b', ' '), note('c', 'y')])).toBe(2);
  });
});

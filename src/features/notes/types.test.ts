import {
  buildLessonNote,
  clampNoteText,
  LESSON_NOTE_MAX_LENGTH,
  type LessonNoteRecord,
  mergeNoteForMigration,
} from '@/features/notes/types';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const input = { projectSlug: 'lid-wallet', lessonSlug: '01-measure' };

function note(text: string, updatedAt: string, id = A): LessonNoteRecord {
  return {
    id,
    userId: null,
    ...input,
    text,
    createdAt: '2026-10-07T08:00:00.000Z',
    updatedAt,
  };
}

describe('buildLessonNote', () => {
  it('nová poznámka dostane id a čas; další zápis si nechá id i createdAt', () => {
    const first = buildLessonNote(
      undefined,
      { ...input, text: 'krok 3' },
      A,
      '2026-10-07T10:00:00.000Z',
    );
    expect(first).toMatchObject({ id: A, text: 'krok 3', createdAt: '2026-10-07T10:00:00.000Z' });
    const second = buildLessonNote(
      first!,
      { ...input, text: 'krok 4' },
      B,
      '2026-10-07T11:00:00.000Z',
    );
    expect(second).toMatchObject({ id: A, createdAt: '2026-10-07T10:00:00.000Z', text: 'krok 4' });
  });

  it('vymazání je náhrobek s prázdným textem; vymazat nezapsané nebo zapsat totéž = nic', () => {
    const existing = note('krok 3', '2026-10-07T10:00:00.000Z');
    expect(
      buildLessonNote(existing, { ...input, text: '   ' }, B, '2026-10-07T11:00:00.000Z'),
    ).toMatchObject({
      id: A,
      text: '',
    });
    expect(
      buildLessonNote(undefined, { ...input, text: '' }, B, '2026-10-07T11:00:00.000Z'),
    ).toBeNull();
    expect(
      buildLessonNote(existing, { ...input, text: 'krok 3' }, B, '2026-10-07T11:00:00.000Z'),
    ).toBeNull();
  });

  it('razítko je vždy po známém stavu (hodiny zařízení pozadu)', () => {
    const fromFuture = note('x', '2026-10-07T12:00:00.000Z');
    const next = buildLessonNote(
      fromFuture,
      { ...input, text: 'y' },
      B,
      '2026-10-07T11:00:00.000Z',
    );
    expect(Date.parse(next!.updatedAt)).toBeGreaterThan(Date.parse(fromFuture.updatedAt));
  });

  it('text delší než limit se ořízne po znacích (stejný limit hlídá databáze)', () => {
    const long = 'ž'.repeat(LESSON_NOTE_MAX_LENGTH + 10);
    const saved = buildLessonNote(
      undefined,
      { ...input, text: long },
      A,
      '2026-10-07T10:00:00.000Z',
    );
    expect(Array.from(saved!.text)).toHaveLength(LESSON_NOTE_MAX_LENGTH);
    const emoji = '🧵'.repeat(LESSON_NOTE_MAX_LENGTH + 1);
    expect(Array.from(clampNoteText(emoji))).toHaveLength(LESSON_NOTE_MAX_LENGTH);
    expect(clampNoteText(emoji).endsWith('🧵')).toBe(true);
  });
});

describe('mergeNoteForMigration (poznámka z prohlížeče do účtu)', () => {
  const now = '2026-10-08T10:00:00.000Z';

  it('různé texty spojí – nic se neztratí; razítko je po stavu účtu', () => {
    const account = note('z telefonu', '2026-10-09T10:00:00.000Z', B);
    const merged = mergeNoteForMigration(
      note('z notebooku', '2026-10-07T10:00:00.000Z'),
      account,
      now,
    );
    expect(merged).toMatchObject({ id: B, text: 'z telefonu\n\nz notebooku' });
    expect(Date.parse(merged!.updatedAt)).toBeGreaterThan(Date.parse(account.updatedAt));
  });

  it('obsahuje-li účet text z prohlížeče, nic nenahraje; delší text z prohlížeče vyhraje', () => {
    const account = note('krok 3 – lepidlo teklo', '2026-10-07T10:00:00.000Z', B);
    expect(
      mergeNoteForMigration(note('lepidlo teklo', '2026-10-07T09:00:00.000Z'), account, now),
    ).toBeNull();
    expect(
      mergeNoteForMigration(
        note('krok 3 – lepidlo teklo, příště méně', '2026-10-07T09:00:00.000Z'),
        account,
        now,
      )?.text,
    ).toBe('krok 3 – lepidlo teklo, příště méně');
    expect(mergeNoteForMigration(note('', '2026-10-07T09:00:00.000Z'), account, now)).toBeNull();
  });

  it('vymazanou poznámku v účtu nahradí text z prohlížeče', () => {
    const account = note('', '2026-10-07T10:00:00.000Z', B);
    expect(
      mergeNoteForMigration(note('krok 5', '2026-10-07T09:00:00.000Z'), account, now)?.text,
    ).toBe('krok 5');
  });
});

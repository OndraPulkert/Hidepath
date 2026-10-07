import { equipmentList } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import {
  equipmentDefinitionSchema,
  type LessonDefinition,
  type LessonStep,
  projectDefinitionSchema,
  type RecordField,
} from '@/content/schema';

describe('obsah – validace schématem', () => {
  it('každá položka vybavení odpovídá schématu a má unikátní slug', () => {
    const slugs = new Set<string>();
    for (const item of equipmentList) {
      const result = equipmentDefinitionSchema.safeParse(item);
      expect(result.success, `${item.slug}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
      expect(slugs.has(item.slug)).toBe(false);
      slugs.add(item.slug);
    }
  });

  it('projekt pouzdra na karty odpovídá schématu', () => {
    const result = projectDefinitionSchema.safeParse(cardHolderProject);
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
  });

  it('odkaz kroku na listy střihu potřebuje projekt s listy střihu', () => {
    const [first, ...rest] = cardHolderProject.lessons;
    const broken = {
      ...cardHolderProject,
      lessons: [
        {
          ...first!,
          steps: first!.steps.map((s, i) =>
            i === 0 ? { ...s, printLink: 'pattern-sheets' as const } : s,
          ),
        },
        ...rest,
      ],
    };
    const result = projectDefinitionSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain('odkazuje na listy střihu');
  });

  it('odkaz kroku na šablonu potřebuje projekt s obdélníkovou šablonou', () => {
    const { template: _template, ...withoutTemplate } = cardHolderProject;
    const result = projectDefinitionSchema.safeParse({
      ...withoutTemplate,
      patternSheets: cardHolderProject.practiceSheets,
      practiceSheets: undefined,
    });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain('odkazuje na šablonu');
  });

  it('projekt odkazuje jen na existující vybavení', () => {
    const known = new Set(equipmentList.map((e) => e.slug));
    for (const req of cardHolderProject.equipment) {
      expect(known.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
    }
  });

  it('lekce jsou seřazené 1..n a prerekvizity ukazují jen zpět', () => {
    const order = new Map(cardHolderProject.lessons.map((l) => [l.slug, l.order]));
    cardHolderProject.lessons.forEach((lesson, i) => {
      expect(lesson.order).toBe(i + 1);
      for (const p of lesson.prerequisiteLessons) {
        expect(order.get(p)!).toBeLessThan(lesson.order);
      }
    });
  });

  it('id záběrů jsou unikátní napříč obsahem', () => {
    const ids = [
      ...equipmentList.flatMap((e) => e.media.map((m) => m.id)),
      ...cardHolderProject.media.map((m) => m.id),
      ...cardHolderProject.lessons.flatMap((l) => [
        ...l.media.map((m) => m.id),
        ...l.steps.flatMap((s) => s.media.map((m) => m.id)),
      ]),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('dostupné záběry mají src nebo ilustraci, plánované ne', () => {
    const all = cardHolderProject.lessons.flatMap((l) => [
      ...l.media,
      ...l.steps.flatMap((s) => s.media),
    ]);
    for (const m of all) {
      if (m.status === 'available') expect(Boolean(m.src ?? m.illustration), m.id).toBe(true);
      else expect(m.src, m.id).toBeUndefined();
    }
  });

  it('příklad je v položce jednoznačný podle URL a varianty', () => {
    for (const e of equipmentList) {
      const keys = e.examples.map((x) => `${x.url} ${x.variant ?? ''}`);
      expect(new Set(keys).size, e.slug).toBe(keys.length);
    }
  });

  it('příklady výrobků mají https odkaz, cenu a datum ověření', () => {
    const examples = equipmentList.flatMap((e) => e.examples.map((x) => ({ slug: e.slug, ...x })));
    expect(examples.length).toBeGreaterThan(10);
    for (const x of examples) {
      expect(x.url.startsWith('https://'), `${x.slug}: ${x.url}`).toBe(true);
      expect(x.url.includes('utm_'), `${x.slug}: odkaz bez sledovacích parametrů`).toBe(false);
      expect(x.priceCents).toBeGreaterThan(0);
      expect(x.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

/** Kopie pouzdra na karty s upravenou lekcí `lessonIndex` (0 = lekce 1). */
function withLesson(
  lessonIndex: number,
  patch: (lesson: LessonDefinition) => LessonDefinition,
  base = cardHolderProject,
) {
  return {
    ...base,
    lessons: base.lessons.map((l, i) => (i === lessonIndex ? patch(l) : l)),
  };
}

/** Upraví krok `stepIndex` v lekci. */
function withStep(lesson: LessonDefinition, stepIndex: number, extra: Partial<LessonStep>) {
  return {
    ...lesson,
    steps: lesson.steps.map((s, i) => (i === stepIndex ? { ...s, ...extra } : s)),
  };
}

function issuesOf(project: unknown): string {
  const result = projectDefinitionSchema.safeParse(project);
  return result.success ? '' : JSON.stringify(result.error.issues);
}

const mmField = (id: string, extra: Partial<RecordField> = {}): RecordField =>
  ({ kind: 'number', id, label: 'Rozteč', unit: 'mm', ...extra }) as RecordField;

describe('obsah – čekání, zápisník a „Připravte si“', () => {
  const lesson1 = cardHolderProject.lessons[0]!;
  const lesson2 = cardHolderProject.lessons[1]!;

  it('lekce 1 má aspoň dva kroky (předpoklad testů)', () => {
    expect(lesson1.steps.length).toBeGreaterThanOrEqual(2);
  });

  it('platné čekání, pole, připomínka, tisk i požadavek projdou', () => {
    const lastStep = lesson1.steps[lesson1.steps.length - 1]!;
    let project = withLesson(0, (l) =>
      withStep(l, 0, {
        waits: [
          {
            id: 'glue',
            label: 'Zavadnutí lepidla',
            minutes: 10,
            maxMinutes: 15,
            basis: 'text',
            blocksStepId: lastStep.id,
          },
        ],
        records: [
          mmField('spacing', { min: 1, max: 10, target: { min: 3, max: 4, label: 'cíl 3–4' } }),
          {
            kind: 'choice',
            id: 'glue-hold',
            label: 'Drží',
            options: [
              { value: 'better', label: 'líp' },
              { value: 'same', label: 'stejně' },
            ],
          },
        ],
      }),
    );
    project = withLesson(
      1,
      (l) => ({
        ...withStep(l, 0, { recalls: [{ fieldId: 'spacing', label: 'Rozteč z lekce 1' }] }),
        prints: [{ source: 'template', copies: 1, purpose: 'šablona dílů' }],
        requires: [{ id: 'scrap', fromLesson: lesson1.slug, label: 'Odřezek z lekce 1' }],
      }),
      project,
    );
    expect(issuesOf(project)).toBe('');
  });

  it('maxMinutes nesmí být menší než minutes', () => {
    const project = withLesson(0, (l) =>
      withStep(l, 0, {
        waits: [{ id: 'w', label: 'Schnutí', minutes: 20, maxMinutes: 10, basis: 'text' }],
      }),
    );
    expect(issuesOf(project)).toContain('maxMinutes musí být ≥ minutes');
  });

  it('čekání má v kroku unikátní id', () => {
    const wait = { id: 'w', label: 'Schnutí', minutes: 5, basis: 'manufacturer' as const };
    const project = withLesson(0, (l) => withStep(l, 0, { waits: [wait, wait] }));
    expect(issuesOf(project)).toContain('duplicitní čekání w');
  });

  it('čekání blokuje jen existující pozdější krok téže lekce', () => {
    const wait = (blocksStepId: string) => ({
      id: 'w',
      label: 'Schnutí',
      minutes: 5,
      basis: 'text' as const,
      blocksStepId,
    });
    expect(
      issuesOf(withLesson(0, (l) => withStep(l, 0, { waits: [wait('neni-takovy-krok')] }))),
    ).toContain('blokuje neznámý krok');
    expect(
      issuesOf(withLesson(0, (l) => withStep(l, 1, { waits: [wait(lesson1.steps[0]!.id)] }))),
    ).toContain('smí blokovat jen pozdější krok');
    expect(
      issuesOf(withLesson(0, (l) => withStep(l, 0, { waits: [wait(lesson1.steps[0]!.id)] }))),
    ).toContain('smí blokovat jen pozdější krok');
  });

  it('id pole zápisníku je unikátní v celém projektu', () => {
    let project = withLesson(0, (l) => withStep(l, 0, { records: [mmField('spacing')] }));
    project = withLesson(1, (l) => withStep(l, 0, { records: [mmField('spacing')] }), project);
    expect(issuesOf(project)).toContain('pole zápisníku spacing už v projektu je');
  });

  it('číselné pole má min ≤ max a smysluplný cíl', () => {
    expect(
      issuesOf(
        withLesson(0, (l) => withStep(l, 0, { records: [mmField('a', { min: 5, max: 1 })] })),
      ),
    ).toContain('min musí být ≤ max');
    expect(
      issuesOf(
        withLesson(0, (l) =>
          withStep(l, 0, { records: [mmField('a', { target: { min: 5, max: 1, label: 'x' } })] }),
        ),
      ),
    ).toContain('cíl: min musí být ≤ max');
    expect(
      issuesOf(
        withLesson(0, (l) =>
          withStep(l, 0, { records: [mmField('a', { target: { label: 'x' } })] }),
        ),
      ),
    ).toContain('cíl potřebuje min nebo max');
  });

  it('volba má aspoň dvě různé hodnoty', () => {
    const choice = (values: string[]) =>
      ({
        kind: 'choice',
        id: 'c',
        label: 'Volba',
        options: values.map((value) => ({ value, label: value })),
      }) as RecordField;
    expect(issuesOf(withLesson(0, (l) => withStep(l, 0, { records: [choice(['a'])] })))).not.toBe(
      '',
    );
    expect(
      issuesOf(withLesson(0, (l) => withStep(l, 0, { records: [choice(['a', 'a'])] }))),
    ).toContain('duplicitní hodnota volby');
  });

  it('textové pole má maxLength nejvýš 1000', () => {
    const project = withLesson(0, (l) =>
      withStep(l, 0, { records: [{ kind: 'text', id: 't', label: 'Poznámka', maxLength: 5000 }] }),
    );
    expect(issuesOf(project)).not.toBe('');
  });

  it('připomínka míří jen na dříve zapsané pole', () => {
    const recall = { fieldId: 'spacing', label: 'Rozteč' };
    expect(
      issuesOf(withLesson(0, (l) => withStep(l, 0, { recalls: [{ ...recall, fieldId: 'nic' }] }))),
    ).toContain('připomíná neznámé pole nic');

    // Pole v lekci 2, připomínka v lekci 1 → dopředu.
    let forward = withLesson(1, (l) => withStep(l, 0, { records: [mmField('spacing')] }));
    forward = withLesson(0, (l) => withStep(l, 0, { recalls: [recall] }), forward);
    expect(issuesOf(forward)).toContain('smí připomínat jen dříve zapsané pole');

    // Týž krok → také ne.
    const same = withLesson(0, (l) =>
      withStep(l, 0, { records: [mmField('spacing')], recalls: [recall] }),
    );
    expect(issuesOf(same)).toContain('smí připomínat jen dříve zapsané pole');

    // Dřívější krok téže lekce → v pořádku.
    const earlierStep = withLesson(0, (l) =>
      withStep(withStep(l, 0, { records: [mmField('spacing')] }), 1, { recalls: [recall] }),
    );
    expect(issuesOf(earlierStep)).toBe('');
  });

  it('tisk listu potřebuje existující sheetId, šablona projekt se šablonou', () => {
    const practiceId = cardHolderProject.practiceSheets!.sheets[0]!.id;
    const withPrints = (prints: LessonDefinition['prints']) =>
      withLesson(1, (l) => ({ ...l, prints }));
    expect(
      issuesOf(
        withPrints([{ source: 'practice-sheets', sheetId: practiceId, copies: 1, purpose: 'x' }]),
      ),
    ).toBe('');
    expect(
      issuesOf(withPrints([{ source: 'practice-sheets', copies: 1, purpose: 'x' }])),
    ).toContain('potřebuje sheetId');
    expect(
      issuesOf(
        withPrints([{ source: 'practice-sheets', sheetId: 'neni', copies: 1, purpose: 'x' }]),
      ),
    ).toContain('list neni v practice-sheets neexistuje');
    expect(
      issuesOf(
        withPrints([{ source: 'pattern-sheets', sheetId: practiceId, copies: 1, purpose: 'x' }]),
      ),
    ).toContain('v pattern-sheets neexistuje');
    expect(
      issuesOf(withPrints([{ source: 'template', sheetId: practiceId, copies: 1, purpose: 'x' }])),
    ).toContain('tisk šablony nemá sheetId');
    expect(issuesOf(withPrints([{ source: 'template', copies: 0, purpose: 'x' }]))).not.toBe('');

    const { template: _template, ...noTemplate } = cardHolderProject;
    const sheetsOnly = {
      ...noTemplate,
      patternSheets: cardHolderProject.practiceSheets,
      practiceSheets: undefined,
      lessons: noTemplate.lessons.map((l) => ({
        ...l,
        steps: l.steps.map(({ printLink: _p, ...s }) => s),
        media: l.media.filter(
          (m) => m.illustration !== 'template' && m.illustration !== 'assembled',
        ),
        prints:
          l.slug === lesson2.slug
            ? [{ source: 'template' as const, copies: 1, purpose: 'x' }]
            : undefined,
      })),
    };
    expect(issuesOf(sheetsOnly)).toContain('projekt žádnou obdélníkovou šablonu nemá');
  });

  it('požadavek je z dřívější lekce a má v lekci unikátní id', () => {
    const withRequires = (index: number, requires: LessonDefinition['requires']) =>
      withLesson(index, (l) => ({ ...l, requires }));
    expect(
      issuesOf(withRequires(0, [{ id: 'r', fromLesson: lesson2.slug, label: 'Díl' }])),
    ).toContain('musí být z dřívější lekce');
    expect(
      issuesOf(withRequires(0, [{ id: 'r', fromLesson: lesson1.slug, label: 'Díl' }])),
    ).toContain('musí být z dřívější lekce');
    expect(issuesOf(withRequires(1, [{ id: 'r', fromLesson: 'neni', label: 'Díl' }]))).toContain(
      'z neznámé lekce neni',
    );
    const req = { id: 'r', fromLesson: lesson1.slug, label: 'Díl' };
    expect(issuesOf(withRequires(1, [req, req]))).toContain('duplicitní id požadavku r');
  });
});

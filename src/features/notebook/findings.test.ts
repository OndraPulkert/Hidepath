import { projectDefinitionSchema } from '@/content/schema';
import {
  buildProjectFindings,
  countFindings,
  formatFindingsText,
  indexRecordFields,
  latestEntriesByField,
  projectHasRecordFields,
  resolveRecall,
} from '@/features/notebook/findings';
import { notebookProject, projectWithoutNotebook, recordEntry } from '@/test/notebook-fixtures';

const NBSP = ' ';

describe('zápisník – Co jsem zjistil', () => {
  it('testovací projekt s poli zápisníku projde schématem', () => {
    expect(() => projectDefinitionSchema.parse(notebookProject)).not.toThrow();
    expect(projectHasRecordFields(notebookProject)).toBe(true);
  });

  it('najde pole podle id s lekcí a krokem', () => {
    const index = indexRecordFields(notebookProject);
    expect(index.get('print-line')).toMatchObject({
      lesson: { slug: '05-transfer-and-cut' },
      step: { id: 'print-check' },
      stepIndex: 0,
      fieldIndex: 0,
    });
    expect(index.get('print-note')?.fieldIndex).toBe(1);
  });

  it('bere nejnovější zápis pole a ignoruje jiné projekty', () => {
    const latest = latestEntriesByField(
      [
        recordEntry('print-line', 49, { updatedAt: '2026-10-01T00:00:00.000Z' }),
        recordEntry('print-line', 50, { updatedAt: '2026-10-02T00:00:00.000Z' }),
        recordEntry('print-line', 51, {
          projectSlug: 'jiny',
          updatedAt: '2026-10-03T00:00:00.000Z',
        }),
      ],
      notebookProject.slug,
    );
    expect(latest.get('print-line')?.value).toBe(50);
  });

  it('seřadí zápisy po lekcích, krocích a polích; vymazané a neznámé vynechá', () => {
    const findings = buildProjectFindings(notebookProject, [
      recordEntry('print-note', 'tiskárna zmenšuje'),
      recordEntry('print-line', 51),
      recordEntry('chisel-pitch', 3.85),
      recordEntry('glue-hold', null),
      recordEntry('gone-field', 4),
    ]);
    expect(findings.map((l) => l.lessonSlug)).toEqual([
      '01-prepare-workspace',
      '05-transfer-and-cut',
    ]);
    expect(findings[0]!.items).toEqual([
      expect.objectContaining({
        fieldId: 'chisel-pitch',
        display: `3,85${NBSP}mm`,
        stepId: 'check-chisels',
        stepNumber: 3,
        target: 'unknown',
        targetLabel: null,
      }),
    ]);
    expect(findings[1]!.items.map((f) => f.fieldId)).toEqual(['print-line', 'print-note']);
    expect(findings[1]!.items[0]).toMatchObject({ target: 'warn', targetLabel: 'cíl 50 mm' });
    expect(countFindings(findings)).toBe(3);
  });

  it('text ke zkopírování má lekce, hodnoty, kroky a upozornění mimo cíl', () => {
    const findings = buildProjectFindings(notebookProject, [
      recordEntry('print-line', 51),
      recordEntry('glue-hold', 'better'),
    ]);
    const text = formatFindingsText(notebookProject, findings, new Date('2026-10-07T12:00:00Z'));
    expect(text).toBe(
      [
        `Co jsem zjistil – ${notebookProject.title} (2026-10-07)`,
        '',
        '04 Lepení, děrování dvou vrstev a sedlářský steh\n- Jak drží spoj: Líp – krok 1',
        '',
        `05 Přenesení šablony a řezání dílů\n- Kontrolní úsečka: 51${NBSP}mm (mimo cíl: cíl 50 mm) – krok 1`,
      ].join('\n'),
    );
    expect(formatFindingsText(notebookProject, [])).toBe('');
    // Datum je místní, ne UTC: krátce po půlnoci je to už dnešek.
    const justAfterMidnight = new Date(2026, 9, 8, 0, 15);
    expect(formatFindingsText(notebookProject, findings, justAfterMidnight)).toContain(
      '(2026-10-08)',
    );
  });

  it('projekt bez polí zápisníku nemá co ukázat', () => {
    expect(projectHasRecordFields(projectWithoutNotebook)).toBe(false);
    expect(buildProjectFindings(projectWithoutNotebook, [recordEntry('print-line', 50)])).toEqual(
      [],
    );
  });
});

describe('zápisník – připomínky', () => {
  const recall = { fieldId: 'chisel-pitch', label: 'Rozteč' };

  it('zapsaná hodnota', () => {
    const r = resolveRecall(notebookProject, recall, [recordEntry('chisel-pitch', 4)]);
    expect(r).toMatchObject({ status: 'recorded', display: `4,00${NBSP}mm`, target: 'unknown' });
  });

  it('nezapsaná nebo vymazaná hodnota ukáže, kde se zapisuje', () => {
    for (const entries of [[], [recordEntry('chisel-pitch', null)]]) {
      const r = resolveRecall(notebookProject, recall, entries);
      expect(r.status).toBe('missing');
      if (r.status === 'missing') {
        expect(r.location.lesson.order).toBe(1);
        expect(r.location.stepIndex).toBe(2);
      }
    }
  });

  it('cíl se vyhodnotí i v připomínce', () => {
    const r = resolveRecall(notebookProject, { fieldId: 'print-line', label: 'Úsečka' }, [
      recordEntry('print-line', 49),
    ]);
    expect(r).toMatchObject({ status: 'recorded', target: 'warn' });
  });

  it('neznámé pole', () => {
    expect(resolveRecall(notebookProject, { fieldId: 'nic', label: 'x' }, []).status).toBe(
      'unknown',
    );
  });
});

import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import {
  LEGACY_LID_RECORD_IDS,
  LID_RECORD_IDS,
  LID_V12_RESULTS,
  LID_Z2_RESULTS,
} from '@/content/projects/lid-wallet/record-ids';
import { legacyLidOffer } from '@/features/lid-wallet/lid-sheets-state';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { DEFAULT_LID_WALLET, lidWalletLayout, lidWalletVariant } from '@/lib/geometry/lid-wallet';
import { buildLidBackSvg, buildLidJigsSvg } from '@/lib/patterns/lid-wallet-sheets';

/** Regrese z kontroly p03: lekce Víčka musí vést ke stavbě bez rozporů s listy a zadáním. */
const lesson = (n: number) => lidWalletProject.lessons.find((l) => l.order === n)!;
const stepOf = (n: number, id: string) => lesson(n).steps.find((s) => s.id === id)!;
const cz = (n: number): string => String(Math.round(n * 100) / 100).replace('.', ',');

const entry = (fieldId: string, value: number | string): LessonRecordEntry => ({
  id: crypto.randomUUID(),
  userId: null,
  projectSlug: 'lid-wallet',
  lessonSlug: 'x',
  fieldId,
  value,
  contentVersion: 1,
  createdAt: '2026-10-07T10:00:00.000Z',
  updatedAt: '2026-10-07T10:00:00.000Z',
});

describe('Víčko – opravy z kontroly p03', () => {
  it('L1: rámeček na listu 4 je pro všechna čísla, i výšky švů, okének a horní hrany F', () => {
    const body = stepOf(1, 'numbers-box').body;
    for (const what of ['švy S1–S6', 'okénka mincí', 'horní hranu F', 'G4']) {
      expect(body).toContain(what);
    }
  });

  it('L1 a L11: nejužší okno lepení magnetu je záloha A (~0,1 mm), ne 0,13', () => {
    const a = lidWalletLayout(lidWalletVariant({ p1Mm: 0.8 }));
    expect(a.magnetYBMax - a.magnetYBMin).toBeLessThan(0.13);
    expect(stepOf(1, 'numbers-box').body).not.toContain('0,13');
    expect(stepOf(1, 'numbers-box').body).toContain('asi 0,1 mm');
    // Okno pro zálohu A je na listu 4 té varianty; lekce 11 ukazuje okno pro vaše listy pod krokem.
    expect(buildLidJigsSvg(lidWalletVariant({ p1Mm: 0.8 }))).toContain(
      `okno lepení ${cz(a.magnetYBMin)}–${cz(a.magnetYBMax)}`,
    );
    expect(stepOf(11, 'find-plate').body).toContain('pro vaše listy ho ukazuje souhrn pod krokem');
  });

  it('záloha A: useň 0,8 se změří a zadá ve formuláři listů, převod vezme změřenou hodnotu', () => {
    const decide = stepOf(3, 'decide');
    expect(decide.body).not.toContain('zadejte P1 0,8)');
    expect(decide.body).toContain('zadejte změřenou tloušťku usně 0,8');
    expect(decide.records!.map((r) => r.id)).toEqual([LID_RECORD_IDS.v12Result]);
    expect(decide.lidSheetRecalls).toEqual(['variant']);

    const resultA = entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.cracked);
    const measured = legacyLidOffer(
      [
        entry(LEGACY_LID_RECORD_IDS.p1Thickness, 1.02),
        resultA,
        entry(LEGACY_LID_RECORD_IDS.p1BackupAThickness, 0.86),
      ],
      'lid-wallet',
    )!;
    expect(measured.form).toMatchObject({ p1: '1,02', backupA: true, p1BackupA: '0,86' });
    // Nezměřená useň: výchozí 0,8.
    expect(legacyLidOffer([resultA], 'lid-wallet')!.form.p1BackupA).toBe('0,8');
    // Z-2 → finální kus v záloze A: stejně jako V12 záloha A.
    const z2 = legacyLidOffer(
      [
        entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.ok),
        entry(LEGACY_LID_RECORD_IDS.p1Thickness, 1.0),
        entry(LID_RECORD_IDS.z2Result, LID_Z2_RESULTS.cracks),
        entry(LEGACY_LID_RECORD_IDS.p1BackupAThickness, 0.82),
      ],
      'lid-wallet',
    )!;
    expect(z2.form).toMatchObject({ backupA: true, p1BackupA: '0,82' });
    // L12: po Z-2 useň změřit a listy vygenerovat znovu; finální kus ukáže zálohu z formuláře.
    for (const id of ['z2', 'final-piece']) {
      expect(stepOf(12, id).body).toMatch(/změřte/);
      expect(stepOf(12, id).body).toContain('vygenerujte znovu');
    }
    expect(stepOf(12, 'final-piece').lidSheetRecalls).toContain('variant');
  });

  it('záloha B1: rýha jen ve výchozím střihu a v záloze A, V12 na ztenčeném odřezku před listy', () => {
    const crease = stepOf(5, 'crease').body;
    expect(crease).toContain('V záloze B1 rýhu nedělejte');
    const done = lesson(5).checkpoints.find((c) => c.slug === 'crease-done')!;
    expect(done.title).toContain('B1');
    expect(stepOf(3, 'decide').body).toContain('teprve pak vygenerujte listy B1');
    expect(stepOf(5, 'skive-backup').body).not.toContain('poslouží i k opakování V12');
    expect(stepOf(7, 'place-spacer').body).toContain('v záloze B1');
  });

  it('šablona výřezu pro palec: co z listu 1 vyříznout a jak ji přiložit', () => {
    expect(stepOf(2, 'templates').body).toContain('20 mm');
    expect(stepOf(5, 'thumb-notch').body).toContain('horní hranu šablony na horní hranu F');
  });

  it('Tokonole: rub pásu víčka podle listu 2, rub konce jazýčku bez něj', () => {
    const body = stepOf(5, 'tokonole').body;
    expect(body).toContain('rub pásu víčka');
    expect(body).toMatch(/jazýčku.*bez Tokonole/);
    expect(buildLidBackSvg(DEFAULT_LID_WALLET)).toContain('rub pásu víčka: Tokonole, nelepit');
  });

  it('L4: nemagnetická je jen austenitická nerez', () => {
    const mistakes = lesson(4).commonMistakes.join(' ');
    expect(mistakes).not.toContain('nerezu: ta je prakticky nemagnetická');
    expect(mistakes).toContain('austenitick');
  });

  it('L2: jednoznačné „dokud nemáte nové listy“ a co dělat při vyčnívání pod 15 mm', () => {
    expect(stepOf(2, 'record').body).not.toContain('Do nových listů');
    expect(stepOf(2, 'record').body).toContain('Dokud nemáte nové listy');
    expect(stepOf(2, 'bills').body).toContain('neřežte');
  });
});

describe('Víčko – rozhodnutí autora 8. 10. 2026', () => {
  it('L12: Z-4 a Z-2 mají postup, když neprojdou (oddíl 7 a konec 5.8 zadání)', () => {
    const z4 = stepOf(12, 'z4');
    expect(z4.body).toContain('zvyšte D1 o 0,5 mm');
    expect(z4.body).toContain('prodlužte D2 o 0,5 mm nahoru');
    const z4Options = z4.records![0]!;
    expect(z4Options.kind === 'choice' && z4Options.options.map((o) => o.value)).toEqual([
      'pass',
      'bill-over-d1',
      'coin-over-d2',
      'both',
      'fail',
    ]);
    const z2 = stepOf(12, 'z2');
    expect(z2.body).toContain('Palec víčko pohodlně neudrží');
    expect(z2.body).toContain('x 27–42');
    const z2Options = z2.records![0]!;
    expect(z2Options.kind === 'choice' && z2Options.options.map((o) => o.value)).toContain('thumb');
  });

  it('B2 po záloze A: zpět na P1 1,0, useň 0,8 se neztenčuje (V6(c))', () => {
    expect(stepOf(12, 'z2').body).toContain('vraťte se k P1 z usně 1,0');
    expect(stepOf(5, 'skive-backup').body).toContain('useň 0,8 se neztenčuje');
    const b2 = legacyLidOffer(
      [
        entry(LEGACY_LID_RECORD_IDS.p1Thickness, 1.0),
        entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.cracked),
        entry(LID_RECORD_IDS.z2Result, LID_Z2_RESULTS.cracksAgain),
      ],
      'lid-wallet',
    )!;
    expect(b2.form).toMatchObject({
      p1: '1,0',
      backupA: false,
      skiveFold: true,
      skiveHinge: true,
    });
  });

  it('L1: listy znovu i po k z lekce 10 a magnetu z lekce 11', () => {
    const body = stepOf(1, 'sheets-rule').body;
    expect(body).not.toContain('jen když');
    expect(body).toContain('lekce 10');
    expect(body).toContain('lekce 11');
  });

  it('L5: klín spodní hrany D2 z líce D2, strana se už neověřuje', () => {
    const body = stepOf(5, 'd2-edge').body;
    expect(body).toContain('z líce D2');
    expect(body).not.toContain('stranu klínu ověřte');
  });
});

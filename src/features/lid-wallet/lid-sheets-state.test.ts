import {
  LEGACY_LID_RECORD_IDS as OLD,
  LEGACY_LID_SHEETS_LIMITS,
  LID_RECORD_IDS,
  LID_SHEETS_FIELD_ID,
  LID_V12_RESULTS,
  LID_Z2_RESULTS,
} from '@/content/projects';
import {
  type LidSheetsState,
  legacyLidOffer,
  lidFormInitial,
  lidSheetFact,
  parseLidSheetsValue,
  resolveLidSheets,
  sameLidForm,
  serializeLidSheets,
} from '@/features/lid-wallet/lid-sheets-state';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { fmt, lidWalletLayout, lidWalletVariant } from '@/lib/geometry/lid-wallet';
import {
  DEFAULT_LID_GENERATOR_FORM,
  EMPTY_LID_P0_FIELDS,
  type LidGeneratorForm,
  type LidMeasuredInput,
  lidFormInvalidFields,
  lidMaxDividerMm,
  lidSheetsForMeasured,
  parseLidGeneratorForm,
} from '@/lib/patterns/lid-wallet-input';

const SLUG = 'lid-wallet';

const entry = (
  fieldId: string,
  value: number | string | null,
  extra: Partial<LessonRecordEntry> = {},
): LessonRecordEntry => ({
  id: crypto.randomUUID(),
  userId: null,
  projectSlug: SLUG,
  lessonSlug: 'x',
  fieldId,
  value,
  contentVersion: 1,
  createdAt: '2026-10-07T10:00:00.000Z',
  updatedAt: '2026-10-07T10:00:00.000Z',
  ...extra,
});

const form = (patch: Partial<LidGeneratorForm>): LidGeneratorForm => ({
  ...DEFAULT_LID_GENERATOR_FORM,
  ...patch,
  p0: { ...EMPTY_LID_P0_FIELDS, ...patch.p0 },
});

const saved = (
  f: LidGeneratorForm,
  trial: boolean | null = null,
  updatedAt = '2026-10-08T10:00:00.000Z',
) => entry(LID_SHEETS_FIELD_ID, serializeLidSheets(f, trial), { updatedAt });

const stateWith = (
  f: LidGeneratorForm | null,
  patch: Partial<LidSheetsState> = {},
): LidSheetsState => ({
  form: f,
  source: f ? 'saved' : null,
  trialOutsideLimits: null,
  legacy: null,
  newerLegacy: null,
  suggestion: null,
  magnetMarkY: null,
  ...patch,
});

describe('Víčko – převod starých zápisů lekcí do formuláře listů (jednou, nic se nemaže)', () => {
  it('bez zápisů není co převádět; zápisy jiného projektu se nepočítají', () => {
    expect(legacyLidOffer([], SLUG)).toBeNull();
    expect(legacyLidOffer([entry(OLD.p1Thickness, null)], SLUG)).toBeNull();
    expect(
      legacyLidOffer([entry(OLD.p1Thickness, 0.95, { projectSlug: 'card-holder' })], SLUG),
    ).toBeNull();
  });

  it('tloušťky z lekce 1 (1,1 / 0,9 / 0,8 / 0,9) přejdou do formuláře, D1 a D2 zvlášť', () => {
    const offer = legacyLidOffer(
      [
        entry(OLD.p1Thickness, 1.1),
        entry(OLD.d1Thickness, 0.9),
        entry(OLD.d2Thickness, 0.8),
        entry(OLD.liningThickness, 0.9),
      ],
      SLUG,
    )!;
    expect(offer.form).toMatchObject({ p1: '1,1', d1: '0,9', d2: '0,8', lining: '0,9' });
    expect(offer.filled).toEqual(['P1 1,1', 'D1 0,9', 'D2 0,8', 'L1 0,9']);
    // Jedna přepážka bez druhé se převezme taky (aplikace pak chce tu druhou).
    const onlyD1 = legacyLidOffer([entry(OLD.d1Thickness, 0.7)], SLUG)!;
    expect(onlyD1.form).toMatchObject({ d1: '0,7', d2: '' });
  });

  it('převedený formulář dá stejné listy jako ruční zadání (do listů větší z D1 a D2)', () => {
    const offer = legacyLidOffer(
      [
        entry(OLD.p1Thickness, 0.95),
        entry(OLD.d1Thickness, 0.7),
        entry(OLD.d2Thickness, 0.8),
        entry(OLD.liningThickness, 0.9),
      ],
      SLUG,
    )!;
    const parsed = parseLidGeneratorForm(offer.form);
    const manual: LidMeasuredInput = {
      p1Mm: 0.95,
      dividerMm: 0.8,
      liningMm: 0.9,
      skiveFold: false,
      skiveHinge: false,
      p0: {},
    };
    expect(parsed).toEqual({ input: manual });
    expect(lidSheetsForMeasured(manual).ok).toBe(true);
  });

  it('zálohy z výsledků V12 a Z-2: A s useň 0,8, B1, B2 po A z V12 i s B1', () => {
    const a = legacyLidOffer(
      [
        entry(OLD.p1Thickness, 1.02),
        entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.cracked),
        entry(OLD.p1BackupAThickness, 0.86),
      ],
      SLUG,
    )!;
    expect(a.form).toMatchObject({ p1: '1,02', backupA: true, p1BackupA: '0,86' });
    expect(parseLidGeneratorForm({ ...a.form, d1: '0,6', d2: '0,6', lining: '0,6' })).toMatchObject(
      { input: { p1Mm: 0.86 } },
    );
    // Nezměřená useň 0,8: platí 0,8.
    const unmeasured = legacyLidOffer(
      [entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.cracked)],
      SLUG,
    )!;
    expect(unmeasured.form).toMatchObject({ backupA: true, p1BackupA: '0,8' });

    const b1 = legacyLidOffer(
      [entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.crackedAgain)],
      SLUG,
    )!;
    expect(b1.form).toMatchObject({ backupA: false, skiveFold: true, skiveHinge: false });

    const z2a = legacyLidOffer(
      [
        entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.ok),
        entry(LID_RECORD_IDS.z2Result, LID_Z2_RESULTS.cracks),
        entry(OLD.p1BackupAThickness, 0.82),
      ],
      SLUG,
    )!;
    expect(z2a.form).toMatchObject({ backupA: true, p1BackupA: '0,82' });

    const b2 = legacyLidOffer(
      [
        entry(OLD.p1Thickness, 1.0),
        entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.cracked),
        entry(LID_RECORD_IDS.z2Result, LID_Z2_RESULTS.cracksAgain),
      ],
      SLUG,
    )!;
    expect(b2.form).toMatchObject({ p1: '1,0', backupA: false, skiveFold: true, skiveHinge: true });
    expect(b2.filled).toContain('záloha B1 (ztenčený ohyb dna) + B2 (ztenčený závěs)');
    // Výchozí výsledek V12 nic nepřevádí.
    expect(legacyLidOffer([entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.ok)], SLUG)).toBeNull();
  });

  it('k z lekce 10 má přednost, k z papírového modelu zůstane v poznámce; P0, magnet a listy mimo meze', () => {
    const offer = legacyLidOffer(
      [
        entry(OLD.p0K, 1.1),
        entry(OLD.kMeasured, 1.3),
        entry(OLD.cardLift, 2.5),
        entry(OLD.coinLift, 1.25),
        entry(OLD.billSheet, 0.11),
        entry(OLD.billHeightMin, 70),
        entry(OLD.billHeightMax, 74),
        entry(OLD.billHalfWidthMin, 63),
        entry(OLD.billHalfWidthMax, 76),
        entry(OLD.magnetThickness, 2),
        entry(OLD.sheetsOutsideLimits, LEGACY_LID_SHEETS_LIMITS.outside),
      ],
      SLUG,
    )!;
    expect(offer.form.p0).toEqual({
      k: '1,3',
      cardLift: '2,5',
      coinLift: '1,25',
      billSheet: '0,11',
      billHeightMin: '70',
      billHeightMax: '74',
      billHalfWidthMin: '63',
      billHalfWidthMax: '76',
      magnetThickness: '2',
    });
    expect(offer.filled).toContain('k 1,3 z lekce 10 (z papírového modelu bylo 1,1)');
    expect(offer.trialOutsideLimits).toBe(true);
    const onlyModel = legacyLidOffer([entry(OLD.p0K, 1.1)], SLUG)!;
    expect(onlyModel.form.p0.k).toBe('1,1');
  });

  it('nejnovější zápis vyhraje, text v číselném poli se ignoruje', () => {
    const offer = legacyLidOffer(
      [
        entry(OLD.liningThickness, 0.7, { updatedAt: '2026-10-01T00:00:00.000Z' }),
        entry(OLD.liningThickness, 0.9, { updatedAt: '2026-10-05T00:00:00.000Z' }),
        entry(OLD.p1Thickness, 'tlustá'),
      ],
      SLUG,
    )!;
    expect(offer.form).toMatchObject({ lining: '0,9', p1: '1,0' });
  });

  it('po uložení formuláře nabídka zmizí; novější staré zápisy (jiné zařízení) se doplní', () => {
    const old = [entry(OLD.p1Thickness, 1.1), entry(OLD.d1Thickness, 0.9)];
    const f = form({ p1: '1,05', d1: '0,7', d2: '0,7', lining: '0,6' });
    const state = resolveLidSheets([...old, saved(f)], SLUG);
    expect(state.source).toBe('saved');
    expect(state.legacy).toBeNull();
    expect(state.newerLegacy).toBeNull();
    expect(state.form).toEqual(f);
    expect(lidFormInitial(state)).toMatchObject({ saved: true, takeover: null });

    const newer = resolveLidSheets(
      [...old, saved(f), entry(OLD.magnetThickness, 2, { updatedAt: '2026-10-09T00:00:00.000Z' })],
      SLUG,
    );
    expect(newer.newerLegacy?.filled).toEqual(['tloušťka magnetu 2']);
    expect(lidFormInitial(newer)).toMatchObject({
      saved: false,
      form: { p1: '1,05', p0: { magnetThickness: '2' } },
      takeover: { kind: 'newer' },
    });
  });

  it('bez uloženého formuláře počítají lekce z převzatých zápisů', () => {
    const state = resolveLidSheets([entry(OLD.p1Thickness, 1.1)], SLUG);
    expect(state.source).toBe('notebook');
    expect(lidFormInitial(state)).toMatchObject({ saved: false, takeover: { kind: 'legacy' } });
  });
});

describe('Víčko – uložený formulář listů', () => {
  it('JSON tam a zpět, poškozený zápis se ignoruje, vejde se do 2000 znaků', () => {
    const f = form({
      p1: '1,15',
      backupA: true,
      p1BackupA: '0,83',
      d1: '0,72',
      d2: '0,78',
      lining: '0,66',
      p0: {
        k: '1,31',
        cardLift: '2,55',
        coinLift: '1,35',
        billSheet: '0,12',
        billHeightMin: '68,5',
        billHeightMax: '74,5',
        billHalfWidthMin: '69,5',
        billHalfWidthMax: '85,5',
        magnetThickness: '1,5',
      },
    });
    const raw = serializeLidSheets(f, true);
    expect(raw.length).toBeLessThan(2000);
    expect(parseLidSheetsValue(raw)).toEqual({ form: f, trialOutsideLimits: true });
    expect(parseLidSheetsValue(serializeLidSheets(f, null))?.trialOutsideLimits).toBeNull();
    expect(parseLidSheetsValue('{')).toBeNull();
    expect(parseLidSheetsValue(JSON.stringify({ v: 1, form: { p1: 1 } }))).toBeNull();
    expect(sameLidForm(f, { ...f, p1: ' 1,15 ' })).toBe(true);
    expect(sameLidForm(f, { ...f, d2: '0,79' })).toBe(false);
  });

  it('záloha A se neztenčuje: A s B1 nebo B2 formulář nepustí', () => {
    const parsed = parseLidGeneratorForm(
      form({ backupA: true, skiveHinge: true, d1: '0,6', d2: '0,6', lining: '0,6' }),
    );
    expect('problems' in parsed && parsed.problems.join(' ')).toContain('B1 ani B2 s ní nejdou');
  });
});

describe('Víčko – meze v lekcích spočítané z formuláře (ne pevné číslo)', () => {
  const maxAt = (p1Mm: number) => lidMaxDividerMm(lidWalletVariant({ p1Mm }))!;

  it('hranice přepážek podle P1: 1,0 → 0,92, 1,1 → 0,80', () => {
    expect(maxAt(1.0)).toBeCloseTo(0.92);
    expect(maxAt(1.1)).toBeCloseTo(0.8);
    const at10 = lidSheetFact(
      'thicknesses',
      stateWith(form({ p1: '1,0', d1: '0,85', d2: '0,8', lining: '0,6' })),
    );
    expect(at10.value).toBe('P1 1,0 · D1 0,85 · D2 0,8 · L1 0,6 mm');
    expect(at10.check).toEqual({ ok: true, text: 'přepážky max 0,92 mm (při P1 1,0)' });

    // Stejná D1 0,85 je při P1 1,1 nad hranicí – dřív pevné „nejvýš 0,92“ tvrdilo „V cíli“.
    const at11 = lidSheetFact(
      'thicknesses',
      stateWith(form({ p1: '1,1', d1: '0,9', d2: '0,8', lining: '0,9' })),
    );
    expect(at11.value).toBe('P1 1,1 · D1 0,9 · D2 0,8 · L1 0,9 mm');
    expect(at11.check).toEqual({
      ok: false,
      text: 'přepážky max 0,80 mm (při P1 1,1): D1 0,9 nad hranicí',
    });
  });

  it('v záloze A počítá hranici z usně 0,8', () => {
    const fact = lidSheetFact(
      'thicknesses',
      stateWith(form({ p1: '1,1', backupA: true, p1BackupA: '0,8', d1: '0,9', d2: '0,9' })),
    );
    expect(fact.value).toBe('P1 1,1 · P1 v záloze A 0,8 · D1 0,9 · D2 0,9 · L1 – mm');
    expect(fact.check?.text).toContain('při P1 0,8');
    expect(fact.check?.ok).toBe(true);
  });

  it('okno lepení magnetu z formuláře a porovnání se značkou z lekce 11', () => {
    const f = form({ p1: '1,0', d1: '0,6', d2: '0,6', lining: '0,6' });
    const layout = lidWalletLayout(lidWalletVariant({ p1Mm: 1.0 }));
    const window = lidSheetFact('magnetWindow', stateWith(f));
    expect(window.value).toBe(
      `y ${fmt(layout.magnetYBMin)}–${fmt(layout.magnetYBMax)} mm, značka ${fmt(layout.magnetYB)}`,
    );
    expect(lidSheetFact('magnetWindow', stateWith(f, { magnetMarkY: 11.9 })).check?.ok).toBe(true);
    expect(lidSheetFact('magnetWindow', stateWith(f, { magnetMarkY: 12.5 })).check).toEqual({
      ok: false,
      text: 'vaše značka 12,5 je mimo okno – přeměřte ji',
    });
    // Jiná P1 = jiné okno.
    const thicker = lidSheetFact(
      'magnetWindow',
      stateWith({ ...f, p1: '1,1', d1: '0,5', d2: '0,5' }),
    );
    expect(thicker.value).not.toBe(window.value);
  });

  it('k nad 1,24 upozorní, záloha ve formuláři se porovná s výsledkem zkoušky', () => {
    expect(
      lidSheetFact('k', stateWith(form({ p0: { ...EMPTY_LID_P0_FIELDS, k: '1,3' } }))).check?.ok,
    ).toBe(false);
    expect(
      lidSheetFact('k', stateWith(form({ p0: { ...EMPTY_LID_P0_FIELDS, k: '1,2' } }))).check?.ok,
    ).toBe(true);
    const state = resolveLidSheets(
      [saved(form({})), entry(LID_RECORD_IDS.v12Result, LID_V12_RESULTS.cracked)],
      SLUG,
    );
    const variant = lidSheetFact('variant', state);
    expect(variant.value).toBe('výchozí střih');
    expect(variant.check?.text).toContain('platí záloha A (P1 z usně 0,8)');
  });

  it('listy mimo meze se ukážou jako jen zkušební kus; bez formuláře „nezadané“', () => {
    const fact = lidSheetFact('sheets', stateWith(form({}), { trialOutsideLimits: true }));
    expect(fact.value).toBe('mimo ověřené meze – jen zkušební kus');
    expect(fact.check?.ok).toBe(false);
    expect(lidSheetFact('thicknesses', stateWith(null)).value).toBeNull();
  });
});

describe('Víčko – kontrola přísné revize (jediný zdroj)', () => {
  it('bez zadaných D1/D2 souhrn netvrdí „V pořádku“, jen ukáže mez podle P1', () => {
    const none = lidSheetFact('thicknesses', stateWith(form({ p1: '1,1' })));
    expect(none.check).toEqual({
      ok: null,
      text: 'přepážky max 0,80 mm (při P1 1,1), D1 a D2 zatím nezadané',
    });
    const onlyD1 = lidSheetFact('thicknesses', stateWith(form({ p1: '1,0', d1: '0,8' })));
    expect(onlyD1.check?.ok).toBeNull();
    expect(onlyD1.check?.text).toContain('D2 zatím nezadané');
    const overD1 = lidSheetFact('thicknesses', stateWith(form({ p1: '1,1', d1: '0,85' })));
    expect(overD1.check?.ok).toBe(false);
  });

  it('uložený JSON má pole bez mezer a vejde se do 2000 znaků i s nejdelšími poli', () => {
    const long = '9'.repeat(16);
    const full = form({
      p1: ` ${long} `,
      backupA: true,
      p1BackupA: long,
      d1: long,
      d2: long,
      lining: long,
      skiveFold: true,
      skiveHinge: true,
      p0: Object.fromEntries(
        Object.keys(EMPTY_LID_P0_FIELDS).map((k) => [k, long]),
      ) as unknown as LidGeneratorForm['p0'],
    });
    const raw = serializeLidSheets(full, true);
    expect(raw.length).toBeLessThan(2000);
    expect(parseLidSheetsValue(raw)?.form.p1).toBe(long);
    expect(lidFormInvalidFields(form({ d1: '1'.repeat(17) })).join(' ')).toContain('kratší');
  });

  it('novější k z papírového modelu nepřepíše k z lekce 10 (stará aplikace v jiném zařízení)', () => {
    const later = { updatedAt: '2026-10-09T10:00:00.000Z' };
    const state = resolveLidSheets(
      [
        entry(OLD.kMeasured, 1.2),
        saved(form({ p0: { ...EMPTY_LID_P0_FIELDS, k: '1,2' } })),
        entry(OLD.p0K, 1.1, later),
      ],
      SLUG,
    );
    expect(state.newerLegacy).toBeNull();
    expect(state.form?.p0.k).toBe('1,2');
  });
});

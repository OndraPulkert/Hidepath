import { equipmentCatalog, equipmentList } from '@/content/equipment';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { LID_RECORD_IDS, LID_V12_VARIANTS } from '@/content/projects/lid-wallet/record-ids';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import { projectDefinitionSchema } from '@/content/schema';
import { lidGeneratorPrefill } from '@/features/notebook/lid-wallet-prefill';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { findPlanExample, resolveShoppingPlan } from '@/features/shopping/plan';
import {
  DEFAULT_LID_WALLET,
  fmt,
  hingePath,
  lidWalletLayout,
  lidWalletPunches,
  lidWalletVariant,
} from '@/lib/geometry/lid-wallet';
import {
  lidMaxDividerMm,
  lidSheetsForMeasured,
  parseLidGeneratorForm,
} from '@/lib/patterns/lid-wallet-input';

/** Číslo tak, jak ho píše obsah (desetinná čárka, zaokrouhlené na `d` míst). */
const cz = (n: number, d = 2): string =>
  String(Math.round(n * 10 ** d) / 10 ** d).replace('.', ',');

const L = lidWalletLayout(DEFAULT_LID_WALLET);
const state = (id: string) => L.states.find((s) => s.state.id === id)!;
const lessonText = (slug: string): string => {
  const lesson = lidWalletProject.lessons.find((l) => l.slug === slug)!;
  return JSON.stringify(lesson);
};

describe('obsah – peněženka Víčko', () => {
  it('projekt odpovídá schématu', () => {
    const result = projectDefinitionSchema.safeParse(lidWalletProject);
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
  });

  it('každý list střihu má v registru soubor peněženky Víčko', () => {
    const urls = patternSheetUrlsFor(lidWalletProject.slug);
    for (const sheet of lidWalletProject.patternSheets!.sheets) {
      expect(urls[sheet.id], sheet.id).toMatch(/penezenka-vicko-.*\.svg/);
    }
    expect(lidWalletProject.patternSheets!.sheets).toHaveLength(4);
  });

  it('projekt odkazuje jen na existující vybavení', () => {
    const known = new Set(equipmentList.map((e) => e.slug));
    for (const req of lidWalletProject.equipment) {
      expect(known.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
    }
  });

  it('lekce jsou seřazené 1..n a prerekvizity ukazují jen zpět', () => {
    const order = new Map(lidWalletProject.lessons.map((l) => [l.slug, l.order]));
    lidWalletProject.lessons.forEach((lesson, i) => {
      expect(lesson.order).toBe(i + 1);
      for (const p of lesson.prerequisiteLessons) expect(order.get(p)!).toBeLessThan(lesson.order);
    });
  });

  it('id záběrů jsou unikátní v projektu i proti katalogu vybavení', () => {
    const ids = [
      ...equipmentList.flatMap((e) => e.media.map((m) => m.id)),
      ...lidWalletProject.media.map((m) => m.id),
      ...lidWalletProject.lessons.flatMap((l) => [
        ...l.media.map((m) => m.id),
        ...l.steps.flatMap((s) => s.media.map((m) => m.id)),
      ]),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('dostupné záběry mají src, plánované ne', () => {
    const all = lidWalletProject.lessons.flatMap((l) => [
      ...l.media,
      ...l.steps.flatMap((s) => s.media),
    ]);
    for (const m of all) {
      if (m.status === 'available') expect(Boolean(m.src), m.id).toBe(true);
      else expect(m.src, m.id).toBeUndefined();
    }
  });

  it('upozornění pro začátečníka: listy pro změřenou kůži, karty proužkem k víčku, víčko samo nestojí', () => {
    // Lekce 1 vede na generátor v aplikaci se všemi třemi vstupy (P1, přepážky, L1).
    expect(lessonText('01-measure-and-sheets')).toContain('„Listy pro vaši kůži“');
    expect(lessonText('01-measure-and-sheets')).toContain(
      'zadejte změřenou P1, větší z D1 a D2 a L1',
    );
    expect(lidWalletProject.patternSheets!.variantsNote).toContain('--divider');
    expect(lessonText('02-paper-model')).toContain('proužkem k horní hraně (k víčku)');
    expect(lessonText('12-finish-and-tests')).toContain('proužkem k horní hraně (k víčku)');
    expect(lessonText('02-paper-model')).toContain('samo nestojí');
    expect(lessonText('10-hinge-forming')).toContain('samo nestojí');
  });

  it('postup: zkušební kus napřed, špička až v lekci 11, šablony po P0, výměna magnetu, zálohy B1/B2', () => {
    expect(lessonText('04-cut-and-mark')).toContain(
      'Lekce 4–12 projdete nejdřív celé na zkušebním kuse',
    );
    expect(lessonText('04-cut-and-mark')).toContain('Špičku R10 teď neřežte');
    expect(lessonText('02-paper-model')).toContain('šablonu konce jazýčku z listu 4');
    expect(lessonText('02-paper-model')).toContain('k = (y_C − y_A) / (P(C) − P(A))');
    expect(lessonText('12-finish-and-tests')).toContain('Výměna magnetu (jen když Z-1 neprojde)');
    // Jiná tloušťka magnetu: přepočet střihu před lepením.
    expect(lessonText('12-finish-and-tests')).toContain(
      'před lepením ji zadejte ve formuláři „Listy pro vaši kůži“',
    );
    expect(lessonText('03-bend-test')).toContain('--skive-fold 0.6');
    expect(lessonText('12-finish-and-tests')).toContain('--skive-hinge 0.6');
    const l5 = lidWalletProject.lessons.find((l) => l.slug === '05-crease-windows-edges')!;
    expect(l5.requiredEquipment).toContain('edge-paint');
    expect(lidWalletProject.equipment.find((e) => e.equipmentSlug === 'edge-paint')!.priority).toBe(
      'required',
    );
  });

  it('vrtačka (lekce 5) a epoxid (lekce 11) odkazují v bezpečnosti na návod výrobce', () => {
    const safetyOf = (order: number) =>
      lidWalletProject.lessons.find((l) => l.order === order)!.safety.join(' ');
    expect(safetyOf(5)).toMatch(/Aku vrtačku používejte podle návodu výrobce/);
    expect(safetyOf(11)).toMatch(/epoxid .*podle návodu a bezpečnostních pokynů výrobce/);
  });

  it('nejasnosti lekcí 4, 5, 6 a 9 jsou dořešené podle zadání', () => {
    const stepOf = (order: number, id: string) =>
      lidWalletProject.lessons.find((l) => l.order === order)!.steps.find((s) => s.id === id)!.body;
    // Lekce 4: na rub jen to, co kreslí list 2; švy S1–S3 a S6 se přenášejí z líce (lekce 6 a 8).
    const markBack = stepOf(4, 'mark-back');
    expect(markBack).not.toMatch(/čáry švů S1–S3 a S6, okénka/);
    expect(markBack).toContain('Čáry švů S1–S3 a S6 ani okénko bankovek na rub nekreslete');
    expect(markBack).toContain('propíchnou se jehlou a děrují vidličkou');
    expect(markBack).not.toContain('propichují vidličkou');
    // Lekce 5: strana sekání, tvrdá deska, šablona, bezpečnost výsečníku a aku vrtačka.
    expect(stepOf(5, 'coin-windows')).toContain('sekejte z líce B');
    expect(stepOf(5, 'coin-windows')).toContain('na tvrdou desku');
    expect(stepOf(5, 'coin-windows')).toContain('před sekáním ji sejměte');
    expect(stepOf(5, 'thumb-notch')).toContain('sekejte z líce F');
    expect(stepOf(5, 'thumb-notch')).toContain('zůstává přiložená');
    const safety5 = lidWalletProject.lessons.find((l) => l.order === 5)!.safety.join(' ');
    expect(safety5).toContain('palička dopadá na horní konec. Děrujte jen na tvrdé desce.');
    expect(lessonText('05-crease-windows-edges')).not.toMatch(/akuvrtač|ve vrtačce/i);
    // Lekce 6 (b): přes vyříznutou šablonu se neobkresluje, konce čar se propíchnou.
    expect(stepOf(6, 'mark-s1-s3')).not.toContain('obkreslete');
    expect(stepOf(6, 'mark-s1-s3')).toContain('propíchněte jehlou skrz šablonu');
    // Lekce 9: úseky děrování se nepřekrývají a sedí na otvory modelu.
    const punch = stepOf(9, 'punch-sew');
    expect(punch).toContain('(1) y 8–52 z líce F');
    expect(punch).toContain('(2) y 56–68 po jednom otvoru');
    expect(punch).toContain('(3) y 72–76 z líce D2');
    expect(punch).not.toContain('y 8–60 z líce F');
    const side = L.seams.find((q) => q.id === 'S4')!.holes.map((h) => h.y);
    expect(side.filter((y) => y <= 52)).toEqual([8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52]);
    expect(side.filter((y) => y >= 56 && y <= 68)).toEqual([56, 60, 64, 68]);
    expect(side.filter((y) => y >= 72)).toEqual([72, 76]);
    expect(punch).toContain('na líc D2 těsně k horní hraně F');
    expect(punch).toContain(
      'otvory 64 a 68 jdou i skrz něj. Jak ho držet, ověřte na zkušebním kuse.',
    );
    expect(punch).toContain('jak přesně, ověřte na zkušebním kuse');
    const mark = stepOf(9, 'mark-side');
    expect(mark).toContain('ne od přečnívající D2');
    expect(L.seamSideX[0]).toBe(3);
    expect(L.d2.x0).toBe(-1);
    expect(mark).toContain('4,0 mm od hrany D2');
  });

  it('kroky s tiskem listů mají odkaz na Listy střihu, značky z listu 1 se dostanou na kůži', () => {
    const withPrint = lidWalletProject.lessons.flatMap((l) =>
      l.steps.filter((s) => s.printLink === 'pattern-sheets').map((s) => `${l.order}/${s.id}`),
    );
    expect(withPrint).toEqual([
      '1/sheets-for-thickness',
      '1/sheets-rule',
      '1/print-check',
      '2/glue-model',
      '2/record',
      '2/templates',
      '4/valid-sheets',
      '4/tape-sheet-1',
      '4/cut-parts',
      '4/mark-back',
      '10/k-too-high',
      '11/magnet-dry-test',
    ]);
    // Středy okénka bankovek: propíchnout přes list 1 na líc (lekce 4), sekat z líce B (lekce 6).
    expect(lessonText('04-cut-and-mark')).toContain('Ø 14 na koncích okénka bankovek');
    expect(lessonText('06-d2-and-coin-columns')).toContain('šablony okénka bankovek z listu 4');
    // Čára hrany vložky dna se vyznačí v lekci 4, v lekci 7 se na ni pokládá vložka.
    expect(lessonText('04-cut-and-mark')).toContain(`výchozí v ${cz(L.v.insertEdge)}`);
    // Rysky přehybů závěsu z lekce 4 slouží v lekci 10 ke kontrole.
    expect(lessonText('10-hinge-forming')).toContain('Rysky přehybů z lekce 4');
    expect(lessonText('04-cut-and-mark')).toContain('Horní hranu přední stěny F řežte rovně');
  });

  it('hrany: všude pořadí vybrousit → zkosit → vyleštit, smirek 220–400, kolík Ø 8, klín jen do rysky 2,5', () => {
    const all = lidWalletProject.lessons.map((l) => JSON.stringify(l)).join(' ');
    expect(all).not.toMatch(/zkoste, vybruste/);
    expect(all).not.toMatch(/Ø 8–1[02]/);
    expect(all).not.toContain('z projektu 01 nebo 02');
    expect(lessonText('05-crease-windows-edges')).toContain('vybruste smirkem 220–400');
    expect(lessonText('05-crease-windows-edges')).toContain('leštítkem nebo kusem plátna');
    expect(lessonText('09-side-seams')).toContain('5 × délka švu');
    expect(lessonText('11-magnet-lining-s7')).toContain('jen mezi ryskou a špičkou');
    expect(lessonText('11-magnet-lining-s7')).not.toContain('ne blíž než 2,5 mm');
  });

  it('čísla v lekcích a listech odpovídají modelu (výchozí střih)', () => {
    const sheets = new Map(lidWalletProject.patternSheets!.sheets.map((s) => [s.id, s.note]));
    expect(sheets.get('sablona')).toContain(`${cz(L.widthMm)} × ${cz(L.p1LengthMm)} mm`);
    expect(lidWalletProject.patternSheets!.printNote).toContain(`${cz(L.p1LengthMm)} mm`);
    const parts = sheets.get('dily')!;
    expect(parts).toContain(`D1 ${cz(L.d1.x1 - L.d1.x0)} × ${cz(L.d1.y1 - L.d1.y0)} mm`);
    expect(parts).toContain(`D2 ${cz(L.d2.x1 - L.d2.x0)} × ${cz(L.d2.y1 - L.d2.y0)} mm`);
    expect(parts).toContain(
      `L1 ${DEFAULT_LID_WALLET.liningBlankWidthMm} × ${DEFAULT_LID_WALLET.liningBlankHeightMm} mm`,
    );
    expect(parts).toContain(
      `K2 ${cz(L.plate.x1 - L.plate.x0)} × ${cz(L.plate.y1 - L.plate.y0)} mm`,
    );
    const punches = lidWalletPunches(DEFAULT_LID_WALLET).map((p) => p.diameterMm);
    expect(sheets.get('sablona')).toContain(
      `Ø ${punches.slice(0, -1).join(', ')} a ${punches.at(-1)} mm`,
    );
    for (const d of punches) {
      expect(
        equipmentCatalog['round-punches-8-14']!.examples.some((x) => x.variant === `Ø ${d} mm`),
        `Ø ${d}`,
      ).toBe(true);
    }
    expect(lessonText('01-measure-and-sheets')).toContain(`${cz(L.p1LengthMm)} mm`);
    expect(lessonText('01-measure-and-sheets')).toContain(
      `${L.bottomSpacer.widthMm} × ${L.bottomSpacer.depthMm} × ${cz(DEFAULT_LID_WALLET.bottomSpacerMm)} mm`,
    );
    expect(lessonText('04-cut-and-mark')).toContain(
      `v ${cz(L.v.foldAxis)} a ${cz(L.v.hingeBand[0])}–${cz(L.v.hingeBand[1])}`,
    );
    // Přehyb 145,105 dokument píše jako 145,10 – stačí shoda na desetiny.
    expect(lessonText('04-cut-and-mark')).toContain(`v ${cz(L.v.rearCrease, 1)}`);
    expect(lessonText('04-cut-and-mark')).toContain(` a ${cz(L.v.frontCrease)};`);
    expect(lessonText('05-crease-windows-edges')).toContain(`v ${cz(L.v.foldAxis)}`);
    const cw = L.coinWindows[0];
    expect(lessonText('05-crease-windows-edges')).toContain(
      `středy y ${cz(cw.y0 + cw.width / 2)} a ${cz(cw.y1 - cw.width / 2)}`,
    );
    expect(lessonText('06-d2-and-coin-columns')).toContain(`do y ${cz(L.topGlueY)}`);
    const bw = L.billWindow;
    expect(lessonText('06-d2-and-coin-columns')).toContain(
      `${cz(bw.width)} × ${cz(bw.y1 - bw.y0)} mm uprostřed zad (x ${cz(bw.cx - bw.width / 2)}–${cz(bw.cx + bw.width / 2)}, y ${cz(bw.y0)}–${cz(bw.y1)})`,
    );
    expect(lessonText('07-bottom-fold')).toContain(
      `v ${cz(L.v.insertEdge)}, tedy ${cz(L.v.insertEdge - L.v.foldAxis)} mm za rýhou`,
    );
    expect(lessonText('08-plate-d1-card-floor')).toContain(
      `x ${cz(L.plate.x0)}–${cz(L.plate.x1)}, y ${cz(L.plate.y0)}–${cz(L.plate.y1)}`,
    );
    expect(lessonText('08-plate-d1-card-floor')).toContain(`y ${cz(L.s6Y)} (výchozí)`);
    expect(lessonText('10-hinge-forming')).toContain(`${cz(L.hingeContentBMm)} mm`);
    const pA = hingePath(DEFAULT_LID_WALLET, L.hingeContentAMm);
    const pC = hingePath(DEFAULT_LID_WALLET, L.hingeContentCMm);
    expect(lessonText('10-hinge-forming')).toContain(`/ ${cz(pC - pA)}`);
    expect(lessonText('10-hinge-forming')).toContain(
      `A ${cz(state('A').bandEdgeY, 1)} / B ${cz(state('B').bandEdgeY, 1)} / C ${cz(state('C').bandEdgeY, 1)} mm`,
    );
    expect(lessonText('10-hinge-forming')).toContain(
      `A ${cz(state('A').bandEdgeYkMax, 1)} a C ${cz(state('C').bandEdgeYkMax, 1)}`,
    );
    expect(lessonText('11-magnet-lining-s7')).toContain(`y ${cz(L.magnetYB, 1)}`);
    expect(lessonText('11-magnet-lining-s7')).toContain(
      `${cz(L.magnetYBMin)}–${cz(L.magnetYBMax)}`,
    );
    expect(lessonText('11-magnet-lining-s7')).toContain(
      `${DEFAULT_LID_WALLET.magnetFromTipMm.toFixed(1).replace('.', ',')} mm pod značkou`,
    );
    expect(lessonText('11-magnet-lining-s7')).toContain(`${L.lining.seamHoles.length} otvorů S7`);
  });

  describe('dílenský režim, zápisník a „Připravte si“', () => {
    const lessonOf = (order: number) => lidWalletProject.lessons.find((l) => l.order === order)!;
    const stepAt = (order: number, id: string) => lessonOf(order).steps.find((s) => s.id === id)!;
    const allSteps = lidWalletProject.lessons.flatMap((l) =>
      l.steps.map((step) => ({ lesson: l, step })),
    );

    it('čekání: doby jen z textu lekcí (nebo tabulky 9.1 zadání u lepidla podle návodu)', () => {
      const waits = allSteps.flatMap(({ lesson, step }) =>
        (step.waits ?? []).map(
          (w) =>
            `${lesson.order}/${step.id}/${w.id} ${w.minutes}${w.maxMinutes ? `–${w.maxMinutes}` : ''} ${w.basis}${w.blocksStepId ? ` → ${w.blocksStepId}` : ''}`,
        ),
      );
      expect(waits).toEqual([
        '3/wet-and-fold/dampen 5–10 text',
        '3/dry/overnight 720–1440 text → inspect',
        '4/plate/plate-glue-test 1440 text',
        '5/d1-paint/coat 20–30 text',
        '6/g3/tack 10–15 text',
        '6/g3/cure 60 text → stitch-s1-s3',
        '7/wet/dampen 5–10 text',
        '7/fold-clamp/overnight 720–1440 text → remove-spacer',
        '8/g1/tack 10–15 manufacturer',
        '8/g2/tack 10–15 manufacturer',
        '8/g2/cure 60 text → s6',
        '9/g4/tack 10–15 manufacturer',
        '9/g4/cure 60 text → punch-sew',
        '10/overnight/overnight 720–1440 text → measure-k',
        '11/epoxy/set 30 manufacturer → lining',
        '11/lining/tack 10–15 manufacturer',
        '11/cure/cure 1440 text → s7',
        '12/magnet-swap/set 30 manufacturer',
        '12/magnet-swap/cure 1440 text',
      ]);
      // Doby „text“ stojí v textu kroku; 1 h před děrováním v textu blokovaného kroku.
      expect(stepAt(3, 'wet-and-fold').body).toContain('(5–10 min)');
      expect(stepAt(7, 'wet').body).toContain('(5–10 min)');
      for (const [order, id] of [
        [3, 'dry'],
        [7, 'fold-clamp'],
        [10, 'overnight'],
      ] as const) {
        expect(stepAt(order, id).body).toContain('přes noc');
        expect(stepAt(order, id).body).toContain('12–24 h');
      }
      expect(stepAt(4, 'plate').body).toContain('po 24 h');
      expect(stepAt(5, 'd1-paint').body).toContain('mezi nimi 20–30 min');
      expect(stepAt(6, 'g3').body).toContain('zavadnout 10–15 min');
      expect(stepAt(6, 'g3').body).toContain('Děrujte nejdřív za 1 h');
      expect(stepAt(8, 's6').body).toContain('Po lepení počkejte aspoň 1 h');
      expect(stepAt(9, 'punch-sew').body).toContain('Po lepení G4 počkejte aspoň 1 h');
      expect(stepAt(11, 'epoxy').body).toContain('podle návodu (orientačně 30 min, ověřte)');
      expect(stepAt(11, 'cure').body).toContain('Nechte 24 h vytvrdit, teprve pak šijte S7');
      expect(stepAt(12, 'magnet-swap').body).toContain('Po 24 h');
      // Zavadnutí v lekcích 8, 9 a 11 lekce nečísluje: tabulka 9.1 zadání, „podle návodu“.
      expect(
        lidWalletProject.equipment.find((e) => e.equipmentSlug === 'contact-cement')!.specification,
      ).toContain('zavadnout 10–15 min, děrovat nejdřív za 1 h');
    });

    it('zápisník: pole pro předvyplnění listů jsou v krocích podle record-ids', () => {
      const where = new Map(
        allSteps.flatMap(({ lesson, step }) =>
          (step.records ?? []).map((f) => [f.id, { at: `${lesson.order}/${step.id}`, f }] as const),
        ),
      );
      const expected: Record<keyof typeof LID_RECORD_IDS, string> = {
        p1Thickness: '1/measure',
        d1Thickness: '1/measure',
        d2Thickness: '1/measure',
        liningThickness: '1/measure',
        billSheet: '2/bills',
        billHeightMin: '2/bills',
        billHeightMax: '2/bills',
        billHalfWidthMin: '2/bills',
        billHalfWidthMax: '2/bills',
        p0K: '2/k',
        cardLift: '2/coins-wedge',
        coinLift: '2/coins-wedge',
        v12Offset: '3/inspect',
        v12Variant: '3/decide',
        p1BackupAThickness: '3/decide',
        z2Result: '12/z2',
        sheetsOutsideLimits: '1/sheets-for-thickness',
        kMeasured: '10/measure-k',
        magnetThickness: '11/magnet-dry-test',
      };
      for (const [key, at] of Object.entries(expected)) {
        const id = LID_RECORD_IDS[key as keyof typeof LID_RECORD_IDS];
        const found = where.get(id);
        expect(found?.at, id).toBe(at);
        expect(found?.f.kind, id).toBe(
          key === 'v12Variant' || key === 'z2Result' || key === 'sheetsOutsideLimits'
            ? 'choice'
            : 'number',
        );
      }
      const variant = where.get(LID_RECORD_IDS.v12Variant)!.f;
      expect(variant.kind === 'choice' && variant.options.map((o) => o.value)).toEqual(
        Object.values(LID_V12_VARIANTS),
      );
      // Cíle jen z čísel lekcí.
      const target = (id: string) => {
        const f = where.get(id)!.f;
        return f.kind === 'number' ? f.target : undefined;
      };
      expect(target(LID_RECORD_IDS.d1Thickness)?.max).toBe(0.92);
      expect(target(LID_RECORD_IDS.d2Thickness)?.max).toBe(0.92);
      // Pole drží průměr, pravidlo lekce platí pro každé místo: „V cíli“ nesmí tvrdit víc.
      for (const id of [LID_RECORD_IDS.d1Thickness, LID_RECORD_IDS.d2Thickness]) {
        expect(target(id)?.label, id).toBe('průměr nejvýš 0,92 mm (při P1 1,0)');
        expect(where.get(id)!.f.hint, id).toMatch(/ani jedno měření nemá víc než 0,92 mm/);
      }
      expect(target(LID_RECORD_IDS.p0K)?.max).toBe(DEFAULT_LID_WALLET.kMax);
      expect(target(LID_RECORD_IDS.kMeasured)?.max).toBe(DEFAULT_LID_WALLET.kMax);
      expect(target(LID_RECORD_IDS.v12Offset)?.max).toBe(0.3);
      expect(target('p0-bill-protrusion')?.min).toBe(15);
      expect(target('card-pocket-width')?.min).toBe(90.5);
      expect(target('d1-from-f-edge')?.min).toBe(3.5);
      expect(stepAt(1, 'measure').body).toContain('víc než 0,92 mm');
      // 0,92 platí jen pro P1 1,0, tlustší P1 hranici snižuje (čísla z modelu).
      const maxAt = (p1Mm: number) => fmt(lidMaxDividerMm(lidWalletVariant({ p1Mm }))!);
      expect(maxAt(1.0)).toBe('0,92');
      expect(stepAt(1, 'measure').body).toContain(
        `při 1,05 na ${maxAt(1.05)} a při 1,1 na ${maxAt(1.1).padEnd(4, '0')} mm`,
      );
      expect(stepAt(2, 'k').body).toContain('nad 1,24');
      expect(stepAt(3, 'inspect').body).toContain('Do 0,3 mm nechte čáru z listu');
      expect(stepAt(2, 'bills').body).toContain('Cíl je aspoň 15 mm');
      expect(stepAt(8, 'check-d1').body).toContain('aspoň 90,5 mm');
      expect(stepAt(8, 'check-d1').body).toContain('aspoň 3,5 mm');
      // Nápovědy „model počítá s …“ odpovídají modelu.
      const hint = (id: string) => where.get(id)!.f.hint ?? '';
      expect(hint(LID_RECORD_IDS.billHeightMin)).toContain(
        `${DEFAULT_LID_WALLET.billHeightMinMm} mm`,
      );
      expect(hint(LID_RECORD_IDS.billHeightMax)).toContain(
        `${DEFAULT_LID_WALLET.billHeightMaxMm} mm`,
      );
      expect(hint(LID_RECORD_IDS.billHalfWidthMin)).toContain(
        `${DEFAULT_LID_WALLET.billHalfWidthMinMm} mm`,
      );
      expect(hint(LID_RECORD_IDS.billHalfWidthMax)).toContain(
        `${DEFAULT_LID_WALLET.billHalfWidthMaxMm} mm`,
      );
      expect(hint(LID_RECORD_IDS.billSheet)).toContain(`${cz(DEFAULT_LID_WALLET.billSheetMm)} mm`);
      expect(hint(LID_RECORD_IDS.cardLift)).toContain(
        `${cz(DEFAULT_LID_WALLET.wedgeLiftNom * DEFAULT_LID_WALLET.cardsMax * DEFAULT_LID_WALLET.cardThicknessMm)} mm`,
      );
      expect(hint(LID_RECORD_IDS.coinLift)).toContain(
        `${cz(DEFAULT_LID_WALLET.wedgeLiftNom * DEFAULT_LID_WALLET.coinThicknessMaxMm)} mm`,
      );
      expect(hint(LID_RECORD_IDS.magnetThickness)).toContain(
        `výchozí ${cz(DEFAULT_LID_WALLET.magnetThicknessMm)}`,
      );
    });

    it('zápisy z polí lekcí předvyplní formulář listů, který listy vytvoří', () => {
      const values: Partial<Record<string, number | string>> = {
        [LID_RECORD_IDS.p1Thickness]: 0.95,
        [LID_RECORD_IDS.d1Thickness]: 0.7,
        [LID_RECORD_IDS.d2Thickness]: 0.75,
        [LID_RECORD_IDS.liningThickness]: 0.7,
        [LID_RECORD_IDS.v12Variant]: LID_V12_VARIANTS.backupB1,
        [LID_RECORD_IDS.p0K]: 1.1,
        [LID_RECORD_IDS.magnetThickness]: 1.5,
      };
      const entries: LessonRecordEntry[] = allSteps.flatMap(({ lesson, step }) =>
        (step.records ?? [])
          .filter((f) => values[f.id] !== undefined)
          .map((f) => ({
            id: crypto.randomUUID(),
            userId: null,
            projectSlug: lidWalletProject.slug,
            lessonSlug: lesson.slug,
            fieldId: f.id,
            value: values[f.id]!,
            contentVersion: lidWalletProject.contentVersion,
            createdAt: '2026-10-07T10:00:00.000Z',
            updatedAt: '2026-10-07T10:00:00.000Z',
          })),
      );
      expect(entries).toHaveLength(Object.keys(values).length);
      const prefill = lidGeneratorPrefill(entries, lidWalletProject.slug)!;
      expect(prefill.form).toMatchObject({ p1: '0,95', divider: '0,75', lining: '0,7' });
      expect(prefill.form.skiveFold).toBe(true);
      const parsed = parseLidGeneratorForm(prefill.form);
      expect('input' in parsed && lidSheetsForMeasured(parsed.input).ok).toBe(true);
    });

    it('připomínky: varianta V12, čára hrany vložky, k a magnet tam, kde se s nimi pracuje', () => {
      const recalls = allSteps.flatMap(({ lesson, step }) =>
        (step.recalls ?? []).map((r) => `${lesson.order}/${step.id} ← ${r.fieldId}`),
      );
      expect(recalls).toEqual(
        expect.arrayContaining([
          `1/sheets-for-thickness ← ${LID_RECORD_IDS.p1Thickness}`,
          `2/record ← ${LID_RECORD_IDS.p0K}`,
          `4/valid-sheets ← ${LID_RECORD_IDS.v12Variant}`,
          `4/mark-back ← ${LID_RECORD_IDS.v12Offset}`,
          '4/mark-back ← v12-shift',
          `5/skive-backup ← ${LID_RECORD_IDS.v12Variant}`,
          `7/place-spacer ← ${LID_RECORD_IDS.v12Offset}`,
          '7/place-spacer ← v12-shift',
          `10/k-too-high ← ${LID_RECORD_IDS.kMeasured}`,
          `12/magnet-swap ← ${LID_RECORD_IDS.magnetThickness}`,
          `12/final-piece ← ${LID_RECORD_IDS.v12Variant}`,
          '12/final-piece ← z2-result',
        ]),
      );
      // Kroky s připomínkou opravdu s hodnotou pracují.
      expect(stepAt(4, 'valid-sheets').body).toContain('Pokud P0, V12 nebo zkušební kus');
      expect(stepAt(4, 'mark-back').body).toContain('posunutou podle V12');
      expect(stepAt(7, 'place-spacer').body).toContain('posunutou podle V12');
      expect(stepAt(5, 'skive-backup').body).toContain('Jen pro zálohu B1');
      expect(stepAt(10, 'k-too-high').body).toContain('Zapište k');
    });

    it('připravte si: listy k tisku podle textu lekcí a díly z dřívějších lekcí', () => {
      const prints = lidWalletProject.lessons.flatMap((l) =>
        (l.prints ?? []).map((p) => `${l.order}/${p.sheetId}×${p.copies}`),
      );
      expect(prints).toEqual([
        '1/sablona×1',
        '1/rub×1',
        '1/dily×1',
        '1/pripravky×1',
        '2/pripravky×1',
        '2/sablona×1',
        '4/sablona×2',
        '4/rub×1',
        '4/dily×2',
        '4/pripravky×1',
      ]);
      expect(stepAt(4, 'valid-sheets').body).toContain('List 1 a list 3 vytiskněte dvakrát');
      expect(stepAt(4, 'valid-sheets').body).toContain('matný papír 120 g');
      expect(stepAt(2, 'templates').body).toContain('nalepte list 4 a list 1 na tvrdý papír');
      expect(stepAt(1, 'sheets-rule').body).toContain('Listy vytiskněte hned');

      const requires = lidWalletProject.lessons.flatMap((l) =>
        (l.requires ?? []).map((r) => `${l.order} ← ${r.fromLesson.slice(0, 2)} ${r.id}`),
      );
      expect(requires).toEqual([
        '2 ← 01 model-sheets',
        '3 ← 01 spacer',
        '5 ← 03 v12-scrap',
        '5 ← 02 notch-template',
        '5 ← 04 coin-window-template',
        '6 ← 04 d2-template',
        '6 ← 04 bill-window-template',
        '6 ← 04 sheet1-template',
        '7 ← 01 spacer',
        '8 ← 04 plate',
        '8 ← 04 sheet1-template',
        '9 ← 04 side-strip',
        '11 ← 02 tongue-template',
        '11 ← 04 lining-blank',
      ]);
      // Co je v „Z předchozích lekcí“, není znovu mezi materiály.
      for (const l of lidWalletProject.lessons) {
        for (const m of l.materials)
          expect(m, `${l.order}: ${m}`).not.toMatch(/\(lekce \d+\)$|z lekce 1$/);
      }
    });
  });

  /** Příklady CraftPointu, jejichž ceny a sklad jsme znovu ověřili 8. 10. 2026. */
  const RECHECKED_2026_10_08 = [
    'hovezi-kuze-licova-juchtova-trislocinena-1-2-mm',
    'trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu',
    'hovezi-licova-kuze-trislocinena-1-2-mm-whisky',
    'horizontalni-palicka-na-kuzi',
    'vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
  ];
  const rechecked = (url: string) =>
    url.startsWith('https://craft-point.cz/') && RECHECKED_2026_10_08.some((h) => url.endsWith(h));

  describe('nákupní plán „Co koupit“', () => {
    const plan = lidWalletProject.shoppingPlan!;

    it('každý řádek míří na právě jeden ověřený příklad z 29. 9. 2026 (maskovací páska z 1. 10. 2026, Lederversand Berlin a useň P1 ze 7. 10., ceny CraftPointu znovu 8. 10. 2026); skladem vše kromě výsečníku Ø 10', () => {
      for (const line of plan.lines) {
        const example = findPlanExample(line, equipmentCatalog);
        expect(example, `${line.equipmentSlug} ${line.url} ${line.variant ?? ''}`).toBeDefined();
        expect(example!.availability, line.url).toBe(
          line.variant === 'Ø 10 mm' ? 'unavailable' : 'in_stock',
        );
        expect(example!.checkedAt, line.url).toBe(
          line.equipmentSlug === 'masking-tape'
            ? '2026-10-01'
            : example!.shop === 'Lederversand Berlin' ||
                line.equipmentSlug === 'veg-tan-leather-1mm'
              ? '2026-10-07'
              : rechecked(line.url)
                ? '2026-10-08'
                : '2026-09-29',
        );
      }
    });

    it('pokryje každou nezbytnou i doporučenou položku projektu', () => {
      const covered = new Set([
        ...plan.lines.map((l) => l.equipmentSlug),
        ...plan.skipped.map((s) => s.equipmentSlug),
      ]);
      for (const req of lidWalletProject.equipment) {
        if (req.priority !== 'later')
          expect(covered.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
      }
    });

    it('kůže 1 233,06 Kč (oddíl 10.1, nebarvená kozinka z Lederversand Berlin) a výsečníky 150 Kč', () => {
      const resolved = resolveShoppingPlan(lidWalletProject, equipmentCatalog, {})!;
      const lines = resolved.shops.flatMap((s) => s.lines);
      const sum = (slugs: string[]) =>
        lines.filter((l) => slugs.includes(l.equipmentSlug)).reduce((s, l) => s + l.lineCents, 0);
      expect(sum(['veg-tan-leather-1mm', 'thin-goatskin'])).toBe(123_306);
      expect(sum(['round-punches-8-14'])).toBe(15_000);
      // Součty po obchodech napevno (ceny z 29. 9., 7. 10. a 8. 10. 2026): změna ceny nebo množství v katalogu
      // se tu musí projevit vědomě. Pořadí obchodů = pořadí první zmínky v plánu.
      expect(resolved.shops.map((g) => [g.shop, g.totalCents])).toEqual([
        ['Šijeme z kůže', 29_250],
        ['Lederversand Berlin', 94_056],
        ['CraftPoint', 324_000],
        ['ELIDIS', 1_212],
        ['Orodian', 820],
        ['OBI', 65_500],
        ['UNI HOBBY', 89_900],
        ['IKEA', 11_800],
      ]);
      expect(resolved.totalCents).toBe(616_538);
      expect(lines).toHaveLength(plan.lines.length);
      expect(resolved.notInStockCount).toBe(1);
    });

    it('drobnosti mimo katalog jsou v seznamu „mějte doma nebo dokupte“', () => {
      const also = plan.alsoNeeded!.join(' ');
      for (const thing of ['lepicí páska', 'lak na nehty', 'kolík Ø 8', 'čtvrtka']) {
        expect(also, thing).toContain(thing);
      }
      // Maskovací páska je v katalogu (masking-tape) a v plánu, ne mezi drobnostmi.
      expect(also).not.toContain('maskovací páska');
      expect(plan.lines.some((l) => l.equipmentSlug === 'masking-tape')).toBe(true);
      expect(plan.lines.some((l) => l.equipmentSlug === 'leather-balm')).toBe(true);
    });

    it('položka bez ověřené ceny má rozsah 0–0 a do plánu nejde', () => {
      const unknown = equipmentList.filter((e) => e.priceSource === 'unknown');
      for (const e of unknown) expect(e.priceRange).toEqual({ minCents: 0, maxCents: 0 });
      expect(plan.lines.some((l) => l.equipmentSlug === 'veg-tan-leather-0-8')).toBe(false);
    });
  });
});

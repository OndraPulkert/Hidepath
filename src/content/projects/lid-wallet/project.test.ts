import { equipmentCatalog, equipmentList } from '@/content/equipment';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import { projectDefinitionSchema } from '@/content/schema';
import { findPlanExample, resolveShoppingPlan } from '@/features/shopping/plan';
import {
  DEFAULT_LID_WALLET,
  hingePath,
  lidWalletLayout,
  lidWalletPunches,
} from '@/lib/geometry/lid-wallet';

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
      'zapište si ji a před lepením nechte střih přepočítat',
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
      '1/print-check',
      '2/glue-model',
      '2/templates',
      '4/valid-sheets',
      '4/tape-sheet-1',
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

  describe('nákupní plán „Co koupit“', () => {
    const plan = lidWalletProject.shoppingPlan!;

    it('každý řádek míří na právě jeden ověřený příklad skladem z 29. 9. 2026 (maskovací páska z 1. 10. 2026)', () => {
      for (const line of plan.lines) {
        const example = findPlanExample(line, equipmentCatalog);
        expect(example, `${line.equipmentSlug} ${line.url} ${line.variant ?? ''}`).toBeDefined();
        expect(example!.availability, line.url).toBe('in_stock');
        expect(example!.checkedAt, line.url).toBe(
          line.equipmentSlug === 'masking-tape' ? '2026-10-01' : '2026-09-29',
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

    it('kůže odpovídá oddílu 10.1 (336 Kč) a výsečníky 150 Kč', () => {
      const resolved = resolveShoppingPlan(lidWalletProject, equipmentCatalog, {})!;
      const lines = resolved.shops.flatMap((s) => s.lines);
      const sum = (slugs: string[]) =>
        lines.filter((l) => slugs.includes(l.equipmentSlug)).reduce((s, l) => s + l.lineCents, 0);
      expect(sum(['veg-tan-leather-1mm', 'thin-goatskin'])).toBe(33_600);
      expect(sum(['round-punches-8-14'])).toBe(15_000);
      // Součty po obchodech napevno (ceny z 29. 9. 2026): změna ceny nebo množství v katalogu
      // se tu musí projevit vědomě. Pořadí obchodů = pořadí první zmínky v plánu.
      expect(resolved.shops.map((g) => [g.shop, g.totalCents])).toEqual([
        ['Šijeme z kůže', 33_600],
        ['CraftPoint', 324_200],
        ['ELIDIS', 1_212],
        ['Orodian', 820],
        ['OBI', 65_500],
        ['UNI HOBBY', 89_900],
        ['IKEA', 11_800],
      ]);
      expect(resolved.totalCents).toBe(527_032);
      expect(lines).toHaveLength(plan.lines.length);
      expect(resolved.notInStockCount).toBe(0);
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

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
    expect(lessonText('01-measure-and-sheets')).toContain('--divider');
    expect(lessonText('01-measure-and-sheets')).toContain('--lining');
    expect(lessonText('01-measure-and-sheets')).toContain('--p1');
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
    expect(lessonText('12-finish-and-tests')).toContain('magnetThicknessMm');
    expect(lessonText('03-bend-test')).toContain('--skive-fold 0.6');
    expect(lessonText('12-finish-and-tests')).toContain('--skive-hinge 0.6');
    const l5 = lidWalletProject.lessons.find((l) => l.slug === '05-crease-windows-edges')!;
    expect(l5.requiredEquipment).toContain('edge-paint');
    expect(lidWalletProject.equipment.find((e) => e.equipmentSlug === 'edge-paint')!.priority).toBe(
      'required',
    );
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
    expect(lessonText('04-cut-and-mark')).toContain(` a ${cz(L.v.frontCrease)})`);
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

    it('každý řádek míří na právě jeden ověřený příklad skladem z 29. 9. 2026', () => {
      for (const line of plan.lines) {
        const example = findPlanExample(line, equipmentCatalog);
        expect(example, `${line.equipmentSlug} ${line.url} ${line.variant ?? ''}`).toBeDefined();
        expect(example!.availability, line.url).toBe('in_stock');
        expect(example!.checkedAt, line.url).toBe('2026-09-29');
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
        ['OBI', 51_600],
        ['UNI HOBBY', 89_900],
        ['IKEA', 11_800],
      ]);
      expect(resolved.totalCents).toBe(513_132);
      expect(lines).toHaveLength(plan.lines.length);
      expect(resolved.notInStockCount).toBe(0);
    });

    it('drobnosti mimo katalog jsou v seznamu „mějte doma nebo dokupte“', () => {
      const also = plan.alsoNeeded!.join(' ');
      for (const thing of ['maskovací páska', 'lak na nehty', 'kolík Ø 8', 'čtvrtka']) {
        expect(also, thing).toContain(thing);
      }
      expect(plan.lines.some((l) => l.equipmentSlug === 'leather-balm')).toBe(true);
    });

    it('položka bez ověřené ceny má rozsah 0–0 a do plánu nejde', () => {
      const unknown = equipmentList.filter((e) => e.priceSource === 'unknown');
      for (const e of unknown) expect(e.priceRange).toEqual({ minCents: 0, maxCents: 0 });
      expect(plan.lines.some((l) => l.equipmentSlug === 'veg-tan-leather-0-8')).toBe(false);
    });
  });
});

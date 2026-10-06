import { equipmentCatalog, equipmentList } from '@/content/equipment';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import { projectDefinitionSchema } from '@/content/schema';
import { findPlanExample, resolveShoppingPlan } from '@/features/shopping/plan';
import {
  DEFAULT_COIN_CARD_HOLDER,
  NAMED_COINS,
  coinCardHolderLayout,
} from '@/lib/geometry/coin-card-holder';

/** Číslo tak, jak ho píše obsah (desetinná čárka). */
const cz = (n: number): string => String(n).replace('.', ',');

describe('obsah – pouzdro s vsazenou mincí', () => {
  it('projekt odpovídá schématu', () => {
    const result = projectDefinitionSchema.safeParse(coinCardHolderProject);
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
  });

  it('každý list střihu má v registru soubor', () => {
    const urls = patternSheetUrlsFor(coinCardHolderProject.slug);
    for (const sheet of coinCardHolderProject.patternSheets!.sheets) {
      expect(urls[sheet.id], sheet.id).toMatch(/pouzdro-mince-.*\.svg/);
    }
  });

  it('projekt odkazuje jen na existující vybavení', () => {
    const known = new Set(equipmentList.map((e) => e.slug));
    for (const req of coinCardHolderProject.equipment) {
      expect(known.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
    }
  });

  it('lekce jsou seřazené 1..n a prerekvizity ukazují jen zpět', () => {
    const order = new Map(coinCardHolderProject.lessons.map((l) => [l.slug, l.order]));
    coinCardHolderProject.lessons.forEach((lesson, i) => {
      expect(lesson.order).toBe(i + 1);
      for (const p of lesson.prerequisiteLessons) {
        expect(order.get(p)!).toBeLessThan(lesson.order);
      }
    });
  });

  it('id záběrů jsou unikátní napříč projektem', () => {
    const ids = [
      ...coinCardHolderProject.media.map((m) => m.id),
      ...coinCardHolderProject.lessons.flatMap((l) => [
        ...l.media.map((m) => m.id),
        ...l.steps.flatMap((s) => s.media.map((m) => m.id)),
      ]),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('dostupné záběry mají src nebo ilustraci, plánované ne', () => {
    const all = coinCardHolderProject.lessons.flatMap((l) => [
      ...l.media,
      ...l.steps.flatMap((s) => s.media),
    ]);
    for (const m of all) {
      if (m.status === 'available') expect(Boolean(m.src ?? m.illustration), m.id).toBe(true);
      else expect(m.src, m.id).toBeUndefined();
    }
  });

  it('čísla kapsy, okna a formy v listech a vybavení odpovídají modelu (výchozí 50 Kč, varianta 40 mm)', () => {
    const def = coinCardHolderLayout(DEFAULT_COIN_CARD_HOLDER);
    const big = coinCardHolderLayout({
      ...DEFAULT_COIN_CARD_HOLDER,
      coinDiameterMm: NAMED_COINS.decision,
    });
    expect(DEFAULT_COIN_CARD_HOLDER.coinDiameterMm).toBe(NAMED_COINS['50kc']);
    const sheets = new Map(coinCardHolderProject.patternSheets!.sheets.map((x) => [x.id, x.note]));
    for (const [id, L] of [
      ['kapsa', def],
      ['kapsa-40mm', big],
    ] as const) {
      const note = sheets.get(id)!;
      expect(note, id).toContain(`${cz(L.pocketWidthMm)} × ${cz(L.pocketHeightMm)} mm`);
      expect(note, id).toContain(`okno Ø ${cz(L.windowDiameterMm)} mm`);
      expect(note, id).toMatch(new RegExp(`formy (Ø )?${cz(L.formHoleDiameterMm)} mm`));
    }
    expect(sheets.get('sablona')).toContain(`${cz(def.stripLengthMm)} × ${cz(def.panelHeightMm)}`);
    const byslug = new Map(equipmentList.map((e) => [e.slug, e]));
    const block = JSON.stringify(byslug.get('coin-forming-block')!.buyingGuide);
    expect(block).toContain(`Ø ${cz(def.formHoleDiameterMm)} mm pro výchozí minci 50 Kč`);
    expect(block).toContain(`Ø ${cz(big.formHoleDiameterMm)} mm pro minci 40 mm`);
    expect(block).toContain(`${cz(def.formPlateMm)} × ${cz(def.formPlateMm)} mm`);
    const punch = byslug.get('round-punch-32mm')!;
    expect(punch.name.startsWith(`Kruhový výsečník na okno Ø ${def.windowDiameterMm} mm`)).toBe(
      true,
    );
    expect(punch.name).toBe(`Kruhový výsečník na okno Ø ${def.windowDiameterMm} mm`);
    expect(JSON.stringify(punch.buyingGuide)).toContain(
      `volitelně ${big.windowDiameterMm} mm pro minci 40 mm`,
    );
    // Rozpočet počítá střed rozsahu: u výchozí mince se nesmí míchat nabídky jen pro minci 40 mm.
    const window19 = punch.examples.find((x) => x.title.includes(`${def.windowDiameterMm} mm`))!;
    expect(punch.priceRange).toEqual({
      minCents: window19.priceCents,
      maxCents: window19.priceCents,
    });
  });

  describe('texty lekcí po řemeslné kontrole', () => {
    const lesson = (n: number) => coinCardHolderProject.lessons.find((l) => l.order === n)!;
    const step = (n: number, id: string) => lesson(n).steps.find((x) => x.id === id)!.body;

    it('lekce 4: délka proužku pro obě tloušťky a krajní otvory podle modelu a listu PÁS', () => {
      const thick = coinCardHolderLayout(DEFAULT_COIN_CARD_HOLDER);
      const thin = coinCardHolderLayout({
        ...DEFAULT_COIN_CARD_HOLDER,
        bodyThicknessMm: 1.2,
        foldSkiveThicknessMm: null,
      });
      const strip = lesson(4).materials[0]!;
      for (const [label, L] of [
        ['1,5 mm', thick],
        ['1,2 mm', thin],
      ] as const) {
        const total = Math.round(90 + L.foldBackFrontMm + L.foldFrontInnerMm);
        expect(strip, label).toContain(`u kůže ${label} asi ${total} mm`);
      }
      expect(strip).not.toContain('dohromady asi 117 mm');

      // Krajní otvor dna: řada vystředěná na panelu (generátor listu PÁS).
      const pitch = DEFAULT_COIN_CARD_HOLDER.stitchPitchMm;
      const edge = (thick.panelWidthMm - (thick.bottomSeamHoles - 1) * pitch) / 2;
      expect(edge).toBe(4);
      const dots = step(4, 'mark-mirrored-dots');
      expect(dots).toContain(`(72 − 16 × 4) / 2 = ${edge} mm od čar ohybů i od hran`);
      expect(dots).toContain(
        `Na listu PÁS vyjde stejným výpočtem z panelu 72 mm ${thick.bottomSeamHoles} otvorů`,
      );
      expect(dots).toContain('(30 − 5 × 4) / 2 = 5 mm');
    });

    it('lepení dna: lepidlo v tenké vrstvě, ohyb ne úplně naplocho; spoj 2 líc vnitřního ↔ rub zadního', () => {
      for (const [n, id] of [
        [4, 'unfold-roughen-glue'],
        [7, 'roughen-and-glue-bottom'],
      ] as const) {
        expect(step(n, id)).toContain('ne úplně naplocho');
        expect(step(n, id)).toContain('naneste lepidlo v tenké rovnoměrné vrstvě');
        expect(step(n, id)).not.toContain('lepidlo naplocho');
      }
      expect(step(7, 'roughen-and-glue-bottom')).toContain('rub předního a rub vnitřního panelu');
      expect(step(7, 'roughen-and-glue-bottom')).toContain('líc vnitřního a rub zadního panelu');
    });

    it('lekce 7: šev dna sedlářským stehem s kontrolou rubu, lícování otvorů před zaschnutím', () => {
      expect(step(7, 'stitch-bottom')).toContain('sedlářským stehem');
      expect(step(7, 'stitch-bottom')).toContain('steh na rubu má být stejně rovný jako na líci');
      expect(step(7, 'press-and-clamp')).toMatch(
        /Než necháte zaschnout, zkontrolujte, že se otvory dna na sousedních panelech po složení lícují/,
      );
      // Nit 0,8 m zůstává, ale s důvodem z návodu „Jak odměřit nit“.
      expect(lesson(7).materials.join(' ')).toContain(
        'asi na 0,6 m; 0,8 m nechává začátečníkovi rezervu',
      );
      expect(lesson(4).materials.join(' ')).toContain('0,8 m nechává začátečníkovi rezervu');
    });

    it('druk: díly v lekci 3 na začátku, strana dříku v lekci 6, klobouček podle obtisku v lekci 8', () => {
      expect(step(3, 'why-scrap-first')).toContain('Druk je čtyřdílný');
      expect(step(3, 'punch-post-hole')).not.toContain('Druk je čtyřdílný');
      expect(step(6, 'set-snap-post')).toContain(
        'Dřík jde z rubu předního panelu, hlavička zůstane na jeho líci',
      );
      const l8 = JSON.stringify(lesson(8));
      expect(l8).not.toMatch(/původní (odhadovan[áé] )?značk/);
      expect(step(8, 'imprint-cap-position')).toContain('Střed obtisku je střed kloboučku');
      expect(step(8, 'imprint-cap-position')).toContain('ověřit na odřezku');
      expect(step(8, 'shorten-tongue')).toContain('na líci jazyka 11 mm od středu kloboučku');
      expect(lesson(8).requiredEquipment).toEqual(
        expect.arrayContaining(['steel-ruler', 'scratch-awl']),
      );
      const capFits = lesson(8).checkpoints.find((c) => c.slug === 'cap-fits')!.title;
      expect(capFits).toContain('jde znovu rozepnout');
    });
  });

  describe('nákupní plán „Co koupit“', () => {
    const plan = coinCardHolderProject.shoppingPlan!;

    it('každý řádek míří na právě jeden ověřený příklad skladem z 29. 9. 2026 (maskovací páska z 1. 10., vykružovák Wolfcraft z 2. 10. 2026)', () => {
      const checkedAtFor = (line: (typeof plan.lines)[number]) => {
        if (line.equipmentSlug === 'masking-tape') return '2026-10-01';
        if (line.url.includes('Wolfcraft')) return '2026-10-02';
        return '2026-09-29';
      };
      for (const line of plan.lines) {
        const example = findPlanExample(line, equipmentCatalog);
        expect(example, `${line.equipmentSlug} ${line.url} ${line.variant ?? ''}`).toBeDefined();
        expect(example!.availability, line.url).toBe('in_stock');
        expect(example!.checkedAt, line.url).toBe(checkedAtFor(line));
      }
    });

    it('pokryje každou nezbytnou i doporučenou položku projektu', () => {
      const covered = new Set([
        ...plan.lines.map((l) => l.equipmentSlug),
        ...plan.skipped.map((s) => s.equipmentSlug),
      ]);
      for (const req of coinCardHolderProject.equipment) {
        if (req.priority !== 'later')
          expect(covered.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
      }
    });

    it('sestava odpovídá modelu: okno, kůže 1,2 mm bez ztenčení a rozměr pásu z listu', () => {
      const def = coinCardHolderLayout(DEFAULT_COIN_CARD_HOLDER);
      expect(plan.title).toContain(`okno Ø ${cz(def.windowDiameterMm)} mm`);
      expect(plan.title).toContain('kůže 1,2 mm');
      expect(plan.skipped.map((s) => s.equipmentSlug)).toContain('safety-skiver');
      const sheet = coinCardHolderProject.patternSheets!.sheets.find(
        (x) => x.id === 'sablona-kuze-1-2',
      )!;
      const strip = /\d+,\d+ × \d+,\d+ mm/.exec(plan.lines[0]!.purpose!)![0];
      expect(sheet.note).toContain(strip);
      expect(
        plan.lines.some(
          (l) =>
            l.url.includes('vysecniky') && l.purpose?.includes(`${cz(def.windowDiameterMm)} mm`),
        ),
      ).toBe(true);
      expect(
        plan.lines.some(
          (l) =>
            l.equipmentSlug === 'coin-forming-block' &&
            l.purpose?.includes(`${Math.ceil(def.formHoleDiameterMm)} mm`),
        ),
      ).toBe(true);
    });

    it('součet plánu je součet řádků a nic se nevynechá', () => {
      const resolved = resolveShoppingPlan(coinCardHolderProject, equipmentCatalog, {})!;
      const lines = resolved.shops.flatMap((s) => s.lines);
      expect(lines).toHaveLength(plan.lines.length);
      expect(resolved.totalCents).toBe(
        lines.reduce((s, l) => s + l.example.priceCents * l.quantity, 0),
      );
      expect(resolved.notInStockCount).toBe(0);
    });
  });
});

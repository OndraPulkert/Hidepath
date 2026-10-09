import { equipmentCatalog, equipmentList } from '@/content/equipment';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import { projectDefinitionSchema } from '@/content/schema';
import { groupPatternSheets } from '@/components/projects/pattern-sheet-list';
import { findPlanExample, resolveShoppingPlan } from '@/features/shopping/plan';
import {
  DEFAULT_COIN_CARD_HOLDER,
  NAMED_COINS,
  coinCardHolderLayout,
} from '@/lib/geometry/coin-card-holder';
import { practiceStripLayout } from '@/lib/geometry/coin-card-holder-practice';

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

  it('výchozí skupina listů (předem zaškrtnutá k tisku) je pro kůži 1,2 mm, 1,5 mm je varianta', () => {
    const groups = groupPatternSheets(coinCardHolderProject.patternSheets!.sheets);
    expect(groups[0]!.variant).toBeNull();
    expect(groups[0]!.sheets.map((x) => x.id)).toEqual([
      'papirovy-model-kuze-1-2',
      'sablona-kuze-1-2',
      'kapsa',
      'postup-kuze-1-2',
    ]);
    const thick = groups.find((g) => g.sheets.some((x) => x.id === 'sablona'))!;
    expect(thick.variant).toContain('kůže 1,5 mm');
    expect(thick.sheets.map((x) => x.id)).toContain('postup');
    expect(coinCardHolderProject.patternSheets!.defaultVariantLabel).toContain('kůže 1,2 mm');
    // Záložní okno Ø 18 mm: vlastní skupina (nezaškrtnutá), prstenec podle modelu.
    const w18 = coinCardHolderLayout({ ...DEFAULT_COIN_CARD_HOLDER, windowDiameterMm: 18 });
    const sheet18 = coinCardHolderProject.patternSheets!.sheets.find(
      (x) => x.id === 'kapsa-okno-18',
    )!;
    expect(sheet18.variant).toBeDefined();
    expect(sheet18.note).toContain(`prstenec ${cz(w18.coinRingMm)} mm`);
  });

  it('kroky, které říkají „vytiskněte list“, odkazují na listy střihu', () => {
    const linked = coinCardHolderProject.lessons.flatMap((l) =>
      l.steps.filter((s) => s.printLink === 'pattern-sheets').map((s) => `${l.order}/${s.id}`),
    );
    expect(linked).toEqual(
      expect.arrayContaining([
        '1/print-check',
        '2/drill-form',
        '2/test-window-retention',
        '5/print-check',
        '6/trace-and-punch-pocket',
      ]),
    );
  });

  describe('cvičný proužek pro lekci 4', () => {
    const l4 = coinCardHolderProject.lessons.find((l) => l.order === 4)!;
    const sheets = coinCardHolderProject.practiceSheets!.sheets;
    /** Na jedno desetinné místo, jak to píše lekce („asi 15,7 mm“). */
    const cz1 = (n: number): string => cz(Math.round(n * 10) / 10);

    it('cvičné listy mají soubor v registru a id se neplete s listy střihu', () => {
      const urls = patternSheetUrlsFor(coinCardHolderProject.slug);
      for (const sheet of sheets) {
        expect(urls[sheet.id], sheet.id).toMatch(/pouzdro-mince-cvicny-prouzek.*\.svg/);
      }
      expect(sheets.find((x) => x.variant === undefined)!.id).toBe('cvicny-prouzek-kuze-1-2');
    });

    it('krok s cvičným listem na něj odkazuje a jmenuje ho stejně jako list', () => {
      const s = l4.steps.find((x) => x.id === 'cut-practice-strip')!;
      expect(s.printLink).toBe('practice-sheets');
      expect(s.body).toContain(`„${sheets[0]!.title}“`);
    });

    it.each([
      [1.2, 'cvicny-prouzek-kuze-1-2'],
      [1.5, 'cvicny-prouzek'],
    ])('čísla v lekci a na listu sedí s modelem pro kůži %s mm', (t, id) => {
      const P = practiceStripLayout(t);
      const materials = l4.materials.join(' ');
      const strip = l4.steps.find((x) => x.id === 'cut-practice-strip')!.body;
      for (const text of [materials, strip]) {
        expect(text).toContain(`${cz1(P.foldAMm)} mm`);
        expect(text).toContain(`${cz1(P.foldBMm)} mm`);
      }
      expect(materials).toContain(`asi ${Math.round(P.stripLengthMm)} mm`);
      const note = sheets.find((x) => x.id === id)!.note;
      expect(note).toContain(`${cz(P.stripLengthMm)} × 40 mm`);
      expect(note).toContain(`ohyb A ${cz(P.foldAMm)} mm`);
      expect(note).toContain(`ohyb B ${cz(P.foldBMm)} mm`);
      const dots = l4.steps.find((x) => x.id === 'mark-mirrored-dots')!.body;
      expect(dots).toContain(`${P.holesPerPanel} otvorů`);
      expect(dots).toContain(`= ${P.endHoleOffsetMm} mm od čáry ohybu`);
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
      expect(step(7, 'stitch-bottom')).toContain('Na začátku i na konci ušijte dva zpětné stehy');
      // Rub stejně jako u pouzdra na karty: méně pravidelný je normální, ale utažený a v řadě.
      for (const [n, id] of [
        [4, 'stitch-through-layers'],
        [7, 'stitch-bottom'],
      ] as const) {
        expect(step(n, id)).toContain('trochu méně pravidelný než líc, to je normální');
        expect(step(n, id)).toContain('stejně utažené, v jedné řadě a bez smyček');
        expect(step(n, id)).not.toContain('stejně rovný jako na líci');
      }
      expect(step(7, 'press-and-clamp')).toMatch(
        /Než necháte zaschnout, zkontrolujte, že se otvory dna na sousedních panelech po složení lícují/,
      );
      // Nit 0,8 m zůstává, ale s důvodem z návodu „Jak odměřit nit“.
      expect(lesson(7).materials.join(' ')).toContain(
        'asi na 0,6 m; 0,8 m nechává začátečníkovi rezervu',
      );
      expect(lesson(4).materials.join(' ')).toContain('0,8 m nechává začátečníkovi rezervu');
    });

    it('lekce 5: páska povinná, čáry ohybů na rub, pečetění rubu mimo pruh lepení', () => {
      expect(lesson(5).requiredEquipment).toContain('masking-tape');
      expect(step(5, 'draw-fold-lines')).toContain('4 čáry');
      expect(step(7, 'wet-fold-zones')).toContain('narýsované tužkou v lekci 5');
      expect(step(5, 'dye-burnish-and-seal')).toContain('přelepte maskovací páskou');
      for (const n of [5, 6, 8]) {
        expect(lesson(n).recommendedEquipment, `lekce ${n}`).toContain('edge-paint');
      }
      expect(step(4, 'try-edge-paint')).toContain('Jen u barvené kůže');
      // Délku nitě pro dno krátký šev odřezku neověří.
      expect(lesson(7).materials.join(' ')).not.toMatch(/ověř\w* na odřezku/);
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
      expect(step(8, 'imprint-cap-position')).toContain('ověřte na odřezku');
      expect(step(8, 'shorten-tongue')).toContain('na líci jazyka 11 mm od středu kloboučku');
      expect(lesson(8).requiredEquipment).toEqual(
        expect.arrayContaining(['steel-ruler', 'scratch-awl']),
      );
      const capFits = lesson(8).checkpoints.find((c) => c.slug === 'cap-fits')!.title;
      expect(capFits).toContain('jde znovu rozepnout');
    });
  });

  describe('čekání, zápisník a „Připravte si“', () => {
    const lesson = (n: number) => coinCardHolderProject.lessons.find((l) => l.order === n)!;
    const stepOf = (n: number, id: string) => lesson(n).steps.find((x) => x.id === id)!;

    it('čekání jsou jen tam, kde lekce čeká, s dobou podle textu nebo návodu', () => {
      const waits = coinCardHolderProject.lessons.flatMap((l) =>
        l.steps.flatMap((s) =>
          (s.waits ?? []).map((w) => ({
            at: `${l.order}/${s.id}/${w.id}`,
            body: s.body,
            w,
          })),
        ),
      );
      expect(waits.map((x) => x.at)).toEqual([
        '2/dry-and-inspect/dry-overnight',
        '4/unfold-roughen-glue/glue-front-inner',
        '4/unfold-roughen-glue/glue-inner-back',
        '4/try-edge-paint/edge-paint-dry',
        '5/dye-burnish-and-seal/edge-paint-dry',
        '6/form-dimple/dry-overnight',
        '6/dye-burnish-pocket-edges/edge-paint-dry',
        '6/glue-pocket/glue-pocket',
        '7/roughen-and-glue-bottom/glue-front-inner',
        '7/roughen-and-glue-bottom/glue-inner-back',
        '8/dye-and-burnish-edges/edge-paint-dry',
      ]);
      for (const { at, body, w } of waits) {
        if (w.id === 'dry-overnight') {
          // Lekce ani zadání hodiny neuvádí („nejlépe přes noc“) – jen odhad k úpravě, ne „Podle lekce“.
          expect(body, at).toContain('přes noc');
          expect([w.minutes, w.maxMinutes, w.basis], at).toEqual([720, undefined, 'estimate']);
        } else if (w.id.startsWith('glue')) {
          // Lekce říká „odvětrat podle návodu“; výchozí doba je jen orientační (UI to říká).
          expect(body, at).toMatch(/odvětr/);
          expect([w.minutes, w.maxMinutes, w.basis], at).toEqual([10, 15, 'manufacturer']);
        } else {
          expect(body, at).toMatch(/obarv|barv/);
          expect([w.minutes, w.maxMinutes, w.basis], at).toEqual([20, 30, 'manufacturer']);
          // Po lekci 4 začíná časovač dobou schnutí, kterou si uživatel ověřil a zapsal.
          expect(w.initialFromField, at).toBe(
            at.startsWith('4/') ? undefined : 'edge-paint-dry-minutes',
          );
        }
      }
    });

    it('schnutí přes noc blokuje krok se zaschlým dílem', () => {
      for (const [n, from, to] of [
        [2, 'dry-and-inspect', 'test-window-retention'],
        [6, 'form-dimple', 'cut-outline-and-window'],
      ] as const) {
        expect(stepOf(n, from).waits![0]!.blocksStepId).toBe(to);
        expect(stepOf(n, to).body).toMatch(/^Zaschl/);
      }
    });

    it('pole zápisníku jsou v krocích, které říkají „zapište“ nebo „změřte“', () => {
      const fields = (n: number, id: string) => (stepOf(n, id).records ?? []).map((f) => f.id);
      expect(fields(1, 'checklist')).toHaveLength(8);
      expect(stepOf(1, 'checklist').body).toContain('Zapište');
      expect(fields(1, 'decide')).toEqual(['model-fits', 'model-mismatch']);
      expect(fields(2, 'test-window-retention')).toEqual(['window-diameter']);
      expect(fields(3, 'punch-post-hole')).toEqual(['post-hole-punch']);
      expect(fields(3, 'practice-snap-cap')).toEqual(['cap-hole-punch']);
      expect(stepOf(3, 'practice-snap-cap').body).toContain('Zapište si, který výsečník sedl');
      expect(fields(3, 'measure-flange')).toEqual(['flange-diameter']);
      expect(fields(4, 'fold-around-content')).toEqual([
        'practice-holes-offset',
        'fold-a-stiffness',
      ]);
      expect(fields(4, 'try-edge-paint')).toEqual(['edge-paint-coats', 'edge-paint-dry-minutes']);
      expect(stepOf(4, 'try-edge-paint').body).toContain('Zapište si počet vrstev a dobu schnutí');
    });

    it('cíle polí jsou čísla z textu lekce', () => {
      const number = (n: number, step: string, id: string) => {
        const f = stepOf(n, step).records!.find((x) => x.id === id)!;
        if (f.kind !== 'number') throw new Error(id);
        return f;
      };
      expect(number(3, 'measure-flange', 'flange-diameter').target).toEqual({
        max: 11,
        label: 'nejvýš 11 mm',
      });
      expect(stepOf(3, 'measure-flange').body).toContain('nejvýš 11 mm');
      expect(number(1, 'checklist', 'model-tongue-behind-snap').target!.min).toBe(11);
      expect(stepOf(1, 'checklist').body).toContain('cíl 11 mm + rezerva');
      expect(number(1, 'checklist', 'model-card-visible').hint).toContain('19 mm');
      expect(stepOf(1, 'checklist').body).toContain('cíl 19 mm');
    });

    it('připomínky jsou v krocích, které na dřívější výsledek odkazují', () => {
      const fieldLesson = new Map(
        coinCardHolderProject.lessons.flatMap((l) =>
          l.steps.flatMap((s) => (s.records ?? []).map((f) => [f.id, l.order] as const)),
        ),
      );
      const recalls = coinCardHolderProject.lessons.flatMap((l) =>
        l.steps.flatMap((s) =>
          (s.recalls ?? []).map((r) => ({ at: `${l.order}/${s.id}`, body: s.body, r })),
        ),
      );
      expect(recalls.map((x) => `${x.at}<-${x.r.fieldId}`)).toEqual([
        '5/dye-burnish-and-seal<-edge-paint-coats',
        '5/dye-burnish-and-seal<-edge-paint-dry-minutes',
        '6/trace-pocket-template<-window-diameter',
        '6/cut-outline-and-window<-window-diameter',
        '6/dye-burnish-pocket-edges<-edge-paint-coats',
        '6/dye-burnish-pocket-edges<-edge-paint-dry-minutes',
        '6/punch-post-hole<-post-hole-punch',
        '7/press-and-clamp<-practice-holes-offset',
        '8/punch-cap-hole<-cap-hole-punch',
        '8/dye-and-burnish-edges<-edge-paint-coats',
        '8/dye-and-burnish-edges<-edge-paint-dry-minutes',
      ]);
      for (const { at, body, r } of recalls) {
        const from = fieldLesson.get(r.fieldId)!;
        expect(body, at).toMatch(new RegExp(`lekc[ie] ${from}\\b`));
        expect(r.label, at).toContain(`lekc`);
      }
    });

    it('výtisky: výchozí varianta listu, počty podle lekcí', () => {
      const prints = coinCardHolderProject.lessons.flatMap((l) =>
        (l.prints ?? []).map((p) => `${l.order}:${p.sheetId}×${p.copies}${p.condition ? '?' : ''}`),
      );
      expect(prints).toEqual([
        '1:papirovy-model-kuze-1-2×1',
        '2:kapsa×3',
        '2:kapsa-okno-18×1?',
        '4:cvicny-prouzek-kuze-1-2×1',
        '5:sablona-kuze-1-2×1',
        // Výtisk na značky jen, když nezůstal z lekce 2 (list KAPSA celkem 3×).
        '6:kapsa×1?',
        // Jen šablona s oknem (forma je hotová z lekce 2): 1 výtisk, když chybí.
        '6:kapsa×1?',
        '6:kapsa-okno-18×1?',
      ]);
      const l6 = coinCardHolderProject.lessons.find((l) => l.order === 6)!;
      expect(l6.prints?.map((p) => p.purpose).join(' | ')).not.toMatch(/form/);
      expect(stepOf(2, 'drill-form').body).toContain('3× na 100 %');
      const sheets = [
        ...coinCardHolderProject.patternSheets!.sheets,
        ...coinCardHolderProject.practiceSheets!.sheets,
      ];
      for (const l of coinCardHolderProject.lessons) {
        for (const p of l.prints ?? []) {
          const sheet = sheets.find((s) => s.id === p.sheetId)!;
          // Výchozí skupina (bez varianty); záložní okno Ø 18 mm má jen jednu variantu.
          if (p.sheetId !== 'kapsa-okno-18') expect(sheet.variant, p.sheetId).toBeUndefined();
        }
        // Každá lekce s odkazem na tisk pod krokem má i výtisk v „Připravte si“.
        const linked = new Set(l.steps.flatMap((s) => (s.printLink ? [s.printLink] : [])));
        for (const source of linked) {
          expect(
            (l.prints ?? []).some((p) => p.source === source),
            `${l.order} ${source}`,
          ).toBe(true);
        }
        // Výtisky nejsou zároveň v materiálu.
        expect(l.materials.join(' '), `${l.order}`).not.toMatch(
          /\blist (KAPSA|Papírový)|šablona PÁS/,
        );
      }
    });

    it('díly z předchozích lekcí: forma a špalík z lekce 2, pás, tělo', () => {
      const requires = coinCardHolderProject.lessons.flatMap((l) =>
        (l.requires ?? []).map((r) => `${l.order}:${r.id}<-${r.fromLesson.slice(0, 2)}`),
      );
      expect(requires).toEqual([
        '6:strip<-05',
        '6:form<-02',
        '6:block<-02',
        '6:marks-print<-02',
        '6:window-template<-02',
        '7:strip-with-pocket<-06',
        '8:body<-07',
      ]);
      expect(stepOf(6, 'cut-outline-and-window').body).toContain('špalík z lekce 2');
      // Šablonu s oknem si lekce 2 schovává pro lekci 6.
      expect(stepOf(2, 'trace-template').body).toContain('použijete ji i na kapsu v lekci 6');
      expect(stepOf(6, 'trace-pocket-template').body).toContain('šablonu s oknem z lekce 2');
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
    const plan = coinCardHolderProject.shoppingPlan!;

    it('každý řádek míří na právě jeden ověřený příklad skladem z 29. 9. 2026 (maskovací páska z 1. 10., sada korunek Extol na Alze a ceny CraftPointu znovu 8. 10. 2026)', () => {
      const checkedAtFor = (line: (typeof plan.lines)[number]) => {
        if (line.equipmentSlug === 'masking-tape') return '2026-10-01';
        if (line.url.startsWith('https://www.alza.cz/')) return '2026-10-08';
        if (rechecked(line.url)) return '2026-10-08';
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
        lines.filter((l) => !l.optional).reduce((s, l) => s + l.example.priceCents * l.quantity, 0),
      );
      // Záložní výsečník Ø 18 mm je jen volitelný řádek mimo součet.
      expect(lines.filter((l) => l.optional).map((l) => l.example.variant)).toEqual(['Ø 18 mm']);
      expect(resolved.notInStockCount).toBe(0);
    });
  });
});

import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';

const raw: Record<string, string> = import.meta.glob(
  '/docs/generated/pouzdro-mince-cvicny-prouzek*.svg',
  { query: '?raw', import: 'default', eager: true },
);

/** Regrese z kontroly p02: texty lekcí musí vést k postavení pouzdra bez rozporů. */
const lesson = (n: number) => coinCardHolderProject.lessons.find((l) => l.order === n)!;
const stepOf = (n: number, id: string) => lesson(n).steps.find((x) => x.id === id)!;
const allText = (n: number) => JSON.stringify(lesson(n));

describe('pouzdro s mincí – opravy z kontroly p02', () => {
  it('L1: odchylka se měří od značky kloboučku na jazyku, ne od značky patice', () => {
    const body = stepOf(1, 'checklist').body;
    expect(body).toContain('od vytištěné značky kloboučku');
    expect(body).not.toContain('od vytištěné značky patice');
    const records = stepOf(1, 'checklist').records!;
    expect(records.find((r) => r.id === 'model-snap-offset')!.label).toMatch(/^\(1\) Klobouček/);
    expect(records.find((r) => r.id === 'model-card-visible')!.label).toBe(
      '(2) Kolik karty je vidět ve výřezu',
    );
  });

  it('L1: patice je vysvětlená a bezpečnost zmiňuje šídlo', () => {
    expect(stepOf(1, 'glue-and-cut').body).toMatch(/patice = dřík s hlavičkou/);
    expect(lesson(1).safety.join(' ')).toMatch(/Šídl/);
  });

  it('L4: tečky dna se propichují skrz kůži, bez listu se přenesou i na líc', () => {
    expect(stepOf(4, 'cut-practice-strip').body).toContain('skrz papír i kůži');
    expect(stepOf(4, 'mark-mirrored-dots').body).toMatch(/na líci/);
    const sheets = Object.entries(raw);
    expect(sheets).toHaveLength(2);
    for (const [k, svg] of sheets) expect(svg, k).toContain('skrz papír i kůži všechny kroužky');
  });

  it('L2: deska a svěrky – vyložení, bez neověřené značky, bez Forstneru a 1 mm', () => {
    const l2 = allText(2);
    expect(l2).not.toContain('Orion');
    expect(JSON.stringify(coinCardHolderProject.equipment)).not.toContain('Orion');
    const drill = stepOf(2, 'drill-form').body;
    expect(drill).not.toContain('Forstner');
    expect(drill).not.toContain('asi 1 mm');
    expect(stepOf(2, 'press-and-clamp').body).toMatch(/vyložení/);
    expect(stepOf(2, 'test-window-retention').body).toMatch(/jen dotýkal/);
  });

  it('L3: větší příruba má záložní cestu', () => {
    expect(stepOf(3, 'measure-flange').body).toContain('Stoklasa');
    expect(lesson(3).title).not.toMatch(/^Ztenčení/);
  });

  it('L5: ztenčení není povinné, značka druku odpovídá listu', () => {
    const cp = lesson(5).checkpoints.find((c) => c.slug === 'skive-transferred')!;
    expect(cp.required).toBe(false);
    expect(stepOf(5, 'transfer-marks-awl').body).toContain('druk – patice');
  });

  it('L6: materiál a tisk odpovídají krokům', () => {
    const l6 = lesson(6);
    expect(l6.materials.join(' ')).toMatch(/houbička/);
    expect(l6.requiredEquipment).toContain('sandpaper');
    expect(l6.recommendedEquipment).not.toContain('sandpaper');
    expect(l6.prints!.every((p) => p.condition !== undefined)).toBe(true);
    expect(stepOf(6, 'trace-pocket-template').body).toContain('Kapsa – záložní okno Ø 20 mm');
  });

  it('bezpečnost lepidla je podmíněná (nákup je lepidlo na vodní bázi)', () => {
    for (const l of coinCardHolderProject.lessons) {
      for (const s of l.safety) expect(s, `${l.order}`).not.toMatch(/^Kontaktní lepidlo na rozp/);
    }
  });

  it('projekt neslibuje ztenčení jako dovednost výchozí cesty', () => {
    expect(coinCardHolderProject.description).not.toMatch(/ztenčení ohybu, osazení/);
    for (const s of coinCardHolderProject.skills) {
      if (/[Zz]tenčení/.test(s)) expect(s).toMatch(/1,5 mm/);
    }
  });
});

describe('pouzdro s mincí – rozhodnutí autora 8. 10. 2026', () => {
  it('L2: korunka Ø 32 mm na unášeči, Extol jako příklad', () => {
    expect(stepOf(2, 'drill-form').body).toContain('korunkou Ø 32 mm na unášeči');
    expect(lesson(2).materials.join(' ')).toContain('Extol Premium');
  });

  it('L2: když neudrží ani Ø 20 mm, do kapsy nesekat a zkusit hlubší důlek', () => {
    const body = stepOf(2, 'test-window-retention').body;
    expect(body).toContain('volitelný řádek');
    expect(body).toContain('hlubší důlek');
    const plan = coinCardHolderProject.shoppingPlan!;
    const backup = plan.lines.find((l) => l.variant === 'Ø 20 mm')!;
    expect(backup.optional).toBe(true);
    expect(backup.equipmentSlug).toBe('round-punch-32mm');
  });

  it('L7: neslibuje odřezek z lekce 4, posun změřit a zkusit na novém proužku', () => {
    const body = stepOf(7, 'press-and-clamp').body;
    expect(body).not.toContain('odřezku z lekce 4');
    expect(body).toContain('novém cvičném proužku');
  });

  it('L1, L2, L5 a L6: šablony a model nalepené na tenký karton, forma a 1. PÁS na papíře', () => {
    const CARD = 'tenký karton (krabice od cereálií)';
    expect(stepOf(2, 'trace-template').body).toContain(
      `Výtisk na šablonu nalepte lepidlem v tyčince na ${CARD}`,
    );
    expect(stepOf(2, 'test-window-retention').body).toMatch(
      /Kapsa – záložní okno Ø 20 mm[^.]*nalepte ho na tenký karton/,
    );
    expect(stepOf(6, 'trace-pocket-template').body).toContain(
      `nalepte ho lepidlem v tyčince na ${CARD}`,
    );
    expect(lesson(2).materials.join(' ')).toMatch(/tenký karton.*šablonu s oknem/);
    expect(lesson(6).materials.join(' ')).toMatch(/tenký karton.*šablonu s oknem/);
    // Šablona s oknem (obkresluje se), výtisk na značky (propichuje se opakovaně) a šablona
    // s okénkem (doraz kapsy) na kartonu, ostatní papír.
    const needsCard = (purpose: string) => /šablon[aou] s oknem|na značky|s okénkem/.test(purpose);
    for (const n of [2, 6]) {
      for (const p of lesson(n).prints!) {
        expect(p.mount !== undefined, `${n} ${p.purpose}`).toBe(needsCard(p.purpose));
      }
    }
    // Forma, značky, šablona s oknem: list KAPSA v lekci 2 třikrát.
    expect(
      lesson(2)
        .prints!.filter((p) => p.sheetId === 'kapsa')
        .map((p) => (p.mount ? 'karton' : 'papír')),
    ).toEqual(['papír', 'karton', 'karton']);
    // Papírový model se skládá a plní: na kartonu.
    expect(lesson(1).prints![0]!.mount?.reason).toContain('držet tvar');
    expect(stepOf(1, 'glue-and-cut').body).toContain('tenký karton');
    for (const p of lesson(4).prints!) expect(p.mount).toBeUndefined();
    // PÁS: 1. výtisk se rozřeže (papír), 2. výtisk je šablona s okénkem (karton).
    expect(lesson(5).prints!.map((p) => [p.copies, p.mount ? 'karton' : 'papír'])).toEqual([
      [1, 'papír'],
      [1, 'karton'],
    ]);
    // Lekce 5 už nenabízí obkreslení PÁS z papíru.
    expect(lesson(5).steps.some((s) => s.id === 'transfer-other')).toBe(false);
    // Nic se netiskne přímo na karton.
    for (const l of [1, 2, 5, 6]) {
      for (const st of lesson(l).steps)
        expect(st.body, st.id).not.toMatch(/(tisk\w*) na (tenký )?karton/);
    }
  });
});

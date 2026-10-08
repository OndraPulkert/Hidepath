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
    expect(stepOf(6, 'trace-pocket-template').body).toContain('Kapsa – záložní okno Ø 18 mm');
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

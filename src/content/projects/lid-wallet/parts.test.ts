import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { lessonBodiesFor } from '@/content/projects/lesson-bodies';
import { lidWalletGlossary } from '@/content/projects/lid-wallet/parts';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import { glossarySchema } from '@/content/schema';
import { glossaryTermsIn } from '@/features/glossary/glossary-text';
import { DEFAULT_LID_WALLET } from '@/lib/geometry/lid-wallet';
import { lidPartsDiagram } from '@/lib/patterns/lid-wallet-parts-diagram';
import {
  buildLidSheets,
  LID_PART_NAMES,
  LID_PARTS_LINE_PREFIX,
  LID_SHEET_PARTS,
} from '@/lib/patterns/lid-wallet-sheets';

/** Úvodní texty lekcí (MDX) vykreslené na prostý text. */
const mdxSources: Record<string, string> = Object.fromEntries(
  Object.entries(lessonBodiesFor(lidWalletProject.slug)).map(([slug, Body]) => [
    slug,
    renderToStaticMarkup(createElement(Body)).replace(/<[^>]+>/g, ''),
  ]),
);

const entries = lidWalletGlossary.entries;
const known = new Set(entries.map((e) => e.term));

/** Texty lekcí Víčka, které čte uživatel (bez popisků animací – kotvy B3 jsou kroky animace). */
function lessonTexts(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  for (const l of lidWalletProject.lessons) {
    const at = (what: string, text: string | undefined) => {
      if (text) out.push({ where: `${l.slug} · ${what}`, text });
    };
    at('název', l.title);
    at('cíl', l.goal);
    l.materials.forEach((m) => at('materiál', m));
    l.commonMistakes.forEach((m) => at('chyba', m));
    l.safety.forEach((m) => at('bezpečnost', m));
    l.checkpoints.forEach((c) => {
      at(`bod ${c.slug}`, c.title);
      at(`bod ${c.slug}`, c.description);
    });
    l.steps.forEach((s) => {
      at(`krok ${s.id}`, s.title);
      at(`krok ${s.id}`, s.body);
    });
  }
  for (const [file, text] of Object.entries(mdxSources)) out.push({ where: file, text });
  return out;
}

/**
 * Zkratky dílů, lepení, švů a zkoušek, jak je píše zadání: P0/P1, D1, L1, K1, G1–G6 (+ a–c),
 * S1–S7, V12, Z-1…, B1/B2 a samotné F. Samotné B (záda / stav / záloha) a k řeší vzory hesel.
 */
const ABBREVIATION = /(?<![\p{L}\p{N}_-])(?:[PDLKSVB]\d+|G\d[a-c]?|Z-\d|F)(?![\p{L}\p{N}_])/gu;

describe('slovníček Víčka', () => {
  it('odpovídá schématu a hesla se neopakují', () => {
    expect(glossarySchema.safeParse(lidWalletGlossary).success).toBe(true);
    expect(known.size).toBe(entries.length);
  });

  it('pokrývá každou zkratku, která je v textech lekcí Víčka', () => {
    expect(Object.keys(mdxSources)).toHaveLength(lidWalletProject.lessons.length);
    expect(Object.values(mdxSources)[0]).toContain('Názvy dílů.');
    const missing = new Set<string>();
    for (const { where, text } of lessonTexts()) {
      for (const m of text.matchAll(ABBREVIATION)) {
        if (!known.has(m[0])) missing.add(`${m[0]} (${where})`);
      }
    }
    expect([...missing]).toEqual([]);
  });

  it('vzory hesel v lekcích opravdu najdou hlavní zkratky', () => {
    const found = new Set(lessonTexts().flatMap(({ text }) => glossaryTermsIn(text, entries)));
    for (const term of ['P1', 'F', 'B', 'D1', 'D2', 'L1', 'G2b', 'S7', 'P0', 'V12', 'Z-1', 'k']) {
      expect(found.has(term), term).toBe(true);
    }
    for (const term of ['záloha A', 'B1', 'B2', 'stav A, B, C']) {
      expect(found.has(term), term).toBe(true);
    }
  });

  it('jména dílů jsou stejná jako na listech', () => {
    for (const [id, name] of Object.entries(LID_PART_NAMES)) {
      expect(entries.find((e) => e.term === id)?.name, id).toBe(name);
    }
  });

  it('projekt slovníček používá a ukazuje schéma pásu', () => {
    expect(lidWalletProject.glossary).toBe(lidWalletGlossary);
    expect(lidWalletGlossary.diagram).toBe('lid-wallet-strip');
  });
});

describe('listy Víčka – řádek dílů v legendě', () => {
  const sheets = buildLidSheets(DEFAULT_LID_WALLET);

  it('každý list má v legendě řádek s díly, které kreslí', () => {
    expect(sheets).toHaveLength(4);
    sheets.forEach((sheet, i) => {
      const parts = LID_SHEET_PARTS[(i + 1) as 1 | 2 | 3 | 4];
      const svg = sheet.svg.replace(/<\/text><text[^>]*>/g, ' ');
      expect(svg, `list ${i + 1}`).toContain(`${LID_PARTS_LINE_PREFIX} ${parts[0]} = `);
      for (const id of parts) {
        expect(svg, `list ${i + 1}: ${id}`).toContain(`${id} = ${LID_PART_NAMES[id]}`);
      }
    });
    expect(sheets[0]!.svg).toContain('P1 = tělo z kaštanu, F = přední stěna');
  });

  it('řádek dílů vysvětlí každou zkratku dílu, kterou list píše', () => {
    const ids = Object.keys(LID_PART_NAMES) as (keyof typeof LID_PART_NAMES)[];
    const partId = new RegExp(
      String.raw`(?<![\p{L}\p{N}_,])(${ids.join('|')})(?![\p{L}\p{N}_])`,
      'gu',
    );
    sheets.forEach((sheet, i) => {
      const listed = new Set<string>(LID_SHEET_PARTS[(i + 1) as 1 | 2 | 3 | 4]);
      const texts = [...sheet.svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)]
        .map((m) => m[1]!)
        .filter((t) => !t.startsWith(LID_PARTS_LINE_PREFIX) && !/^[A-Z]\d? = /.test(t));
      const used = new Set(texts.flatMap((t) => [...t.matchAll(partId)].map((m) => m[1]!)));
      expect(
        [...used].filter((id) => !listed.has(id)),
        `list ${i + 1}`,
      ).toEqual([]);
    });
  });
});

describe('schéma dílů z modelu', () => {
  it('úseky P1 navazují a díly leží na svém místě', () => {
    const d = lidPartsDiagram();
    const z = Object.fromEntries(d.zones.map((x) => [x.id, x.rect]));
    expect(z.F!.y).toBe(0);
    for (const [a, b] of [
      ['F', 'fold'],
      ['fold', 'B'],
      ['B', 'hinge'],
      ['hinge', 'band'],
      ['band', 'tongue'],
    ] as const) {
      expect(z[a]!.y + z[a]!.height).toBeCloseTo(z[b]!.y, 1);
    }
    const part = (id: string) => d.parts.find((p) => p.id === id)!.rect;
    // Plíšek na F, D2 na B, L1 a magnet na jazýčku.
    expect(part('K2').y).toBeGreaterThan(0);
    expect(part('K2').y + part('K2').height).toBeLessThan(z.F!.height);
    expect(part('D2').y).toBeGreaterThan(z.B!.y);
    expect(d.magnet.cy).toBeGreaterThan(z.tongue!.y);
    expect(d.magnet.cy).toBeLessThan(z.tongue!.y + z.tongue!.height);
    // Popisky vpravo se nepřekrývají.
    const ys = d.callouts.map((c) => c.labelY);
    ys.slice(1).forEach((y, i) => expect(y - ys[i]!).toBeGreaterThanOrEqual(d.fontSize));
  });
});

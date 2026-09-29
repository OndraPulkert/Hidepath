import { describe, expect, it } from 'vitest';

import { DEFAULT_COIN_CARD_HOLDER, SNAP_POST_RADIUS_MM } from '@/lib/geometry/coin-card-holder';

/**
 * Virtuální papírový model: vezme vygenerovaný střih (docs/generated/pouzdro-mince-sablona.svg),
 * přečte z něj čáry ohybů, otvory a druky a „složí“ ho ohybem s konstantní délkou
 * pásma (pásmo délky L ohnuté o 180° má poloměr L/π a odsune další panel o 2L/π). Nepoužívá
 * vzorce modelu – ověřuje, že to, co je NAKRESLENÉ, po složení funguje.
 */
const svgs: Record<string, string> = import.meta.glob('/docs/generated/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const sheet = Object.entries(svgs).find(([k]) => k.endsWith('/pouzdro-mince-sablona.svg'))![1];
const spec = DEFAULT_COIN_CARD_HOLDER;
const t = spec.bodyThicknessMm;

const circles = [...sheet.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map(
  (m) => ({ x: Number(m[1]), y: Number(m[2]), r: Number(m[3]) }),
);
const near = (a: number, b: number, tol = 0.02): boolean => Math.abs(a - b) <= tol;

// Čáry ohybů: svislé čárkované (3 2) čáry, zleva ohyb A (dvě čáry) a ohyb B (dvě čáry).
const foldLines = [
  ...sheet.matchAll(
    /<path d="M([\d.]+) ([\d.]+) L\1 ([\d.]+)" fill="none" stroke="#7a7a7a" stroke-width="0.2" stroke-dasharray="3 2"/g,
  ),
]
  .map((m) => ({ x: Number(m[1]), y0: Number(m[2]), y1: Number(m[3]) }))
  .sort((a, b) => a.x - b.x);
const [a0, a1, b0, b1] = foldLines.map((l) => l.x) as [number, number, number, number];
// Horní hrana pásu = začátek čar ohybu B; dno = jejich konec.
const top = foldLines[2]!.y0;
const bottom = foldLines[2]!.y1;
const bandA = a1 - a0;
const bandB = b1 - b0;

/** Přední panel je v soustavě listu mezi a1 a b0; x v předním panelu měříme od a1. */
const frontX = (x: number): number => x - a1;
/** Zadní panel (vlevo od ohybu A) se po složení otočí: bod ve vzdálenosti u od ohybu padne na a1 + u. */
const backToFront = (x: number): number => frontX(a1 + (a0 - x));
/** Vnitřní panel (vpravo od ohybu B) se otočí kolem ohybu B. */
const innerToFront = (x: number): number => frontX(b0 - (x - b1));
// Ztenčené pásmo (šrafa v listu) má neutrální osu blíž lícu: panely jsou o (t − s) blíž, než
// kolik by dala délka pásma u plné tloušťky.
const skivedB = [...sheet.matchAll(/<rect class="skive-zone" x="([\d.]+)"/g)].some(
  (m) => Number(m[1]) < b0 && Number(m[1]) > a1,
);
const skiveOffB = skivedB ? t - (spec.foldSkiveThicknessMm ?? t) : 0;
const zInner = (2 * bandB) / Math.PI - skiveOffB;
const zBack = (2 * bandA) / Math.PI;
const W = b0 - a1;

describe('virtuální složení nakresleného střihu (papírový model v počítači)', () => {
  it('všechny tři panely jsou stejně široké a pás má dva ohyby', () => {
    expect(foldLines.length).toBe(4);
    expect(a0 - 10).toBeCloseTo(W, 1); // zadní panel od levého okraje listu (10 mm)
    expect(W).toBeGreaterThan(60);
  });

  it('karty i bankovky mají po složení vůli aspoň 1 mm', () => {
    const cards = spec.cardsCount * spec.cardThicknessMm;
    const cardsGap = zInner - t;
    const billsGap = zBack - zInner - t;
    expect(cardsGap - cards).toBeGreaterThanOrEqual(1.2);
    expect(billsGap - spec.billsThicknessMm).toBeGreaterThanOrEqual(1.2);
  });

  it('otvory dna na zadním a vnitřním panelu padnou po složení na otvory předku', () => {
    const seamY = Math.max(...circles.filter((c) => near(c.r, 0.45)).map((c) => c.y));
    const holes = circles.filter((c) => near(c.r, 0.45) && near(c.y, seamY));
    const front = holes.filter((c) => c.x > a1 && c.x < b0).map((c) => frontX(c.x));
    const back = holes.filter((c) => c.x < a0).map((c) => backToFront(c.x));
    const inner = holes.filter((c) => c.x > b1).map((c) => innerToFront(c.x));
    expect(front.length).toBeGreaterThan(10);
    expect(back.length).toBe(front.length);
    expect(inner.length).toBe(front.length);
    for (const x of [...back, ...inner]) {
      expect(front.some((f) => near(f, x, 0.05))).toBe(true);
    }
    // Šev dna je pod kartami: karta stojí na švu, horní hrana karty topOverCard pod okrajem.
    expect(bottom - seamY).toBeCloseTo(spec.stitchOffsetMm, 1);
  });

  // Volitelnou průchodku (--grommet) skládá virtuálně scripts/coin-card-holder.test.ts.
  it('výchozí střih je od v4.11 bez průchodky (volitelná, --grommet)', () => {
    expect(spec.grommet).toBe(false);
    expect(sheet).not.toMatch(/průchodka/);
    expect(circles.some((c) => near(c.r, spec.grommetHoleMm / 2))).toBe(false);
  });

  it('jazyk přehnutý přes horní hranu dopadne kloboučkem na patici (± 1 mm)', () => {
    const snaps = circles.filter((c) => near(c.r, spec.snapDiameterMm / 2));
    const cap = snaps.find((c) => c.y < top)!;
    const socket = snaps.find((c) => c.y > top)!;
    // Oblouk přes horní hranu: od osy zadního panelu (hloubka zBack) k ose jazyka na předku (-t).
    const wrap = (Math.PI * (zBack + t)) / 2;
    const capBelowTop = top - cap.y - wrap;
    expect(Math.abs(capBelowTop - (socket.y - top))).toBeLessThanOrEqual(0.3);
    // Ve vodorovném směru: zadní panel se otočí kolem ohybu A.
    expect(backToFront(cap.x)).toBeCloseTo(frontX(socket.x), 1);
    // Patice i s přírubou je nad kartami.
    expect(socket.y - top + SNAP_POST_RADIUS_MM).toBeLessThanOrEqual(spec.topOverCardMm);
  });

  it('zkrácený jazyk (11 mm za kloboučkem) nezasahuje do kapsy s mincí', () => {
    const socket = circles.find((c) => near(c.r, spec.snapDiameterMm / 2) && c.y > top)!;
    const tabEnd = socket.y - top + spec.tabBeyondSnapMm;
    // Vodicí obrys kapsy: čárkovaná (1 1) cesta na předním panelu (pod horní hranou pásu).
    const guides = [
      ...sheet.matchAll(
        /d="M([\d.]+) ([\d.]+) [^"]*" fill="none" stroke="#7a7a7a" stroke-width="0.2" stroke-dasharray="1 1"/g,
      ),
    ].filter((m) => Number(m[2]) > top && Number(m[1]) > a1 && Number(m[1]) < b0);
    expect(guides.length).toBe(1);
    const guide = guides[0]!;
    const pocketTop = Number(guide[2]) - top;
    expect(pocketTop - tabEnd).toBeGreaterThanOrEqual(3);
  });
});

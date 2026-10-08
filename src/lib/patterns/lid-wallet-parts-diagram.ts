import { DEFAULT_LID_WALLET, lidWalletLayout, type LidWalletSpec } from '@/lib/geometry/lid-wallet';
import { LID_PART_NAMES } from '@/lib/patterns/lid-wallet-sheets';

/**
 * Schéma „Díly Víčka“ pro stránku projektu: rozvinutý pás P1 z rubu (shora horní hrana F,
 * dolů ke špičce jazýčku) s úseky F – ohyb dna – B – závěs – pás víčka – jazýček a s polohou
 * D1, D2, plíšku K2, magnetu K1 a podšívky L1. Souřadnice v mm: x = šířka peněženky (0–101),
 * y = v podél pásu (D1 přečnívá nad horní hranu F, proto začíná v záporném v).
 * Jen data – kreslí je komponenta, čísla bere z modelu `lidWalletLayout`.
 */
export interface DiagramRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PartsDiagramZone {
  id: 'F' | 'fold' | 'B' | 'hinge' | 'band' | 'tongue';
  /** `leather` = rovná část pásu, `bend` = ohyb dna a závěs (nelepit, nešít). */
  kind: 'leather' | 'bend';
  rect: DiagramRect;
  /** Popisek uvnitř úseku (jen u širokých úseků), jinak popis vpravo. */
  label?: string;
}

export interface PartsDiagramPart {
  id: 'D1' | 'D2' | 'K2' | 'L1';
  kind: 'divider' | 'metal' | 'lining';
  rect: DiagramRect;
  /** Popisek uvnitř dílu. */
  label?: { text: string; x: number; y: number };
}

export interface PartsDiagramCallout {
  text: string;
  /** Bod na díle, kam vede odkazová čára. */
  target: { x: number; y: number };
  /** Svislá poloha popisku vpravo (po rozestoupení). */
  labelY: number;
}

export interface LidPartsDiagram {
  viewBox: DiagramRect;
  /** Kde začíná sloupec popisků vpravo. */
  calloutX: number;
  fontSize: number;
  zones: PartsDiagramZone[];
  parts: PartsDiagramPart[];
  magnet: { cx: number; cy: number; r: number };
  callouts: PartsDiagramCallout[];
}

const FONT = 6;
/** Nejmenší svislý rozestup popisků vpravo. */
const CALLOUT_GAP = FONT * 1.45;

/** Rozestoupí popisky (seřazené podle cíle) tak, aby se nepřekrývaly. */
function spreadCallouts(
  items: { text: string; target: { x: number; y: number } }[],
): PartsDiagramCallout[] {
  const sorted = [...items].sort((a, b) => a.target.y - b.target.y);
  const out: PartsDiagramCallout[] = [];
  for (const it of sorted) {
    const prev = out[out.length - 1];
    const labelY = prev ? Math.max(it.target.y, prev.labelY + CALLOUT_GAP) : it.target.y;
    out.push({ ...it, labelY });
  }
  return out;
}

export function lidPartsDiagram(spec: LidWalletSpec = DEFAULT_LID_WALLET): LidPartsDiagram {
  const L = lidWalletLayout(spec);
  const W = L.widthMm;
  const v = L.v;
  const r2 = (n: number): number => Math.round(n * 100) / 100;
  const band = (y0: number, y1: number, x0 = 0, x1 = W): DiagramRect => ({
    x: r2(x0),
    y: r2(y0),
    width: r2(x1 - x0),
    height: r2(y1 - y0),
  });
  // Na F: v = horní hrana F − y; na B: v = začátek B + (y − začátek rovné části).
  const vOnF = (y: number): number => L.frontTopY - y;
  const vOnB = (y: number): number => v.backStart + (y - L.flatFromY);
  const [t0, t1] = L.tongueX;

  const zones: PartsDiagramZone[] = [
    {
      id: 'F',
      kind: 'leather',
      rect: band(0, v.frontEnd),
      label: `F · ${LID_PART_NAMES.F}`,
    },
    { id: 'fold', kind: 'bend', rect: band(v.frontEnd, v.backStart) },
    {
      id: 'B',
      kind: 'leather',
      rect: band(v.backStart, v.hingeStart),
      label: `B · ${LID_PART_NAMES.B}`,
    },
    { id: 'hinge', kind: 'bend', rect: band(v.hingeStart, v.hingeEnd) },
    { id: 'band', kind: 'leather', rect: band(v.hingeEnd, v.bandEnd), label: 'pás víčka' },
    { id: 'tongue', kind: 'leather', rect: band(v.bandEnd, v.tip, t0, t1) },
  ];

  const d1 = band(vOnF(L.d1.y1), vOnF(L.d1.y0), L.d1.x0, L.d1.x1);
  const d2 = band(vOnB(L.d2.y0), vOnB(L.d2.y1), L.d2.x0, L.d2.x1);
  const plate = band(vOnF(L.plate.y1), vOnF(L.plate.y0), L.plate.x0, L.plate.x1);
  const lining = band(v.tip - L.lining.topAboveTipMm, v.tip, t0, t1);
  const magnet = {
    cx: L.axisX,
    cy: r2(v.tip - spec.magnetFromTipMm),
    r: spec.magnetDiameterMm / 2,
  };

  const parts: PartsDiagramPart[] = [
    {
      id: 'D1',
      kind: 'divider',
      rect: d1,
      // Popisek v části D1, která přečnívá nad horní hranu F.
      label: { text: 'D1', x: L.axisX, y: r2(d1.y / 2) },
    },
    {
      id: 'D2',
      kind: 'divider',
      rect: d2,
      label: {
        text: 'D2',
        x: r2(L.columnLeft[0] + (L.columnLeft[1] - L.columnLeft[0]) / 2),
        y: r2(d2.y + d2.height / 2),
      },
    },
    { id: 'K2', kind: 'metal', rect: plate },
    { id: 'L1', kind: 'lining', rect: lining },
  ];

  const right = (y: number, x = W): { x: number; y: number } => ({ x: r2(x), y: r2(y) });
  // Popisky vpravo jen krátké (jméno dílu je v seznamu pod schématem); D1 a D2 mají popisek uvnitř.
  const callouts = spreadCallouts([
    { text: 'K2 plíšek', target: right(plate.y + plate.height / 2, plate.x + plate.width) },
    { text: 'ohyb dna', target: right((v.frontEnd + v.backStart) / 2) },
    { text: 'závěs', target: right((v.hingeStart + v.hingeEnd) / 2) },
    { text: 'jazýček', target: right((v.bandEnd + lining.y) / 2, t1) },
    { text: 'L1 podšívka', target: right(lining.y + 1.5, t1) },
    { text: 'K1 magnet', target: right(magnet.cy, magnet.cx + magnet.r) },
  ]);

  const calloutX = W + 8;
  const top = Math.min(d1.y, 0) - 6;
  const bottom = Math.max(v.tip, ...callouts.map((c) => c.labelY)) + 6;
  return {
    viewBox: { x: -4, y: r2(top), width: r2(calloutX + 46), height: r2(bottom - top) },
    calloutX,
    fontSize: FONT,
    zones,
    parts,
    magnet,
    callouts,
  };
}

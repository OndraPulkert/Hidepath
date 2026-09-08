/**
 * Geometrie dílu šablony v milimetrech. Čistá funkce – kreslí ji jak náhled, tak tisková
 * verze i schéma sestavení, takže se tvar nemůže na jednotlivých místech rozejít.
 */
export interface ThumbCutout {
  /** Šířka výřezu na horní hraně. */
  widthMm: number;
  /** Hloubka výřezu měřená od horní hrany dolů. */
  depthMm: number;
}

export interface PieceOutline {
  x: number;
  y: number;
  widthMm: number;
  heightMm: number;
  cornerRadiusMm: number;
  thumbCutout?: ThumbCutout | undefined;
}

/**
 * Obrys dílu: obdélník se zaoblenými rohy a volitelným mělkým výřezem na palec
 * uprostřed horní hrany. Výřez je kvadratická křivka, jejíž nejhlubší bod leží přesně
 * `depthMm` pod horní hranou.
 */
export function piecePath({
  x,
  y,
  widthMm: w,
  heightMm: h,
  cornerRadiusMm,
  thumbCutout,
}: PieceOutline): string {
  const r = Math.min(cornerRadiusMm, w / 2, h / 2);
  const top: string[] = [];

  if (thumbCutout && thumbCutout.widthMm > 0 && thumbCutout.depthMm > 0) {
    const cw = Math.min(thumbCutout.widthMm, w - 2 * r);
    const start = x + (w - cw) / 2;
    const end = start + cw;
    // Řídicí bod ve dvojnásobné hloubce: vrchol kvadratické křivky pak leží v depthMm.
    top.push(`L${round(start)} ${round(y)}`);
    top.push(
      `Q${round(x + w / 2)} ${round(y + thumbCutout.depthMm * 2)} ${round(end)} ${round(y)}`,
    );
  }

  return [
    `M${round(x + r)} ${round(y)}`,
    ...top,
    `L${round(x + w - r)} ${round(y)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + w)} ${round(y + r)}`,
    `L${round(x + w)} ${round(y + h - r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + w - r)} ${round(y + h)}`,
    `L${round(x + r)} ${round(y + h)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x)} ${round(y + h - r)}`,
    `L${round(x)} ${round(y + r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + r)} ${round(y)}`,
    'Z',
  ].join(' ');
}

/** Kolik milimetrů karty odkryje výřez: karta sahá `cardTopMm` nad spodní hranu dílu. */
export function exposedCardHeightMm(
  pieceHeightMm: number,
  cardTopMm: number,
  cutout?: ThumbCutout,
): number {
  const pocketTop = pieceHeightMm;
  const cutoutBottom = cutout ? pieceHeightMm - cutout.depthMm : pieceHeightMm;
  const edge = cutout ? cutoutBottom : pocketTop;
  return Math.max(0, cardTopMm - edge);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

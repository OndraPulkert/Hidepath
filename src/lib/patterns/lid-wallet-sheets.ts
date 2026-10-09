/**
 * Kreslení listů střihu peněženky VÍČKO (docs/zadani/penezenka-vicko.md) do SVG 1:1. Čistý kód bez
 * Node API: používá ho generátor `scripts/lid-wallet.ts` (SVG + PDF do docs/generated) i aplikace,
 * která listy vygeneruje v prohlížeči pro změřenou tloušťku kůže. Geometrie je celá
 * v src/lib/geometry/lid-wallet.ts; tady se jen kreslí.
 */
import {
  CALIBRATION_MM,
  DEFAULT_LID_WALLET,
  PRINT_SHEET,
  SHEET_FOOTER_MM,
  SHEET_HEADER_MM,
  type GlueArea,
  type LidWalletLayout,
  type LidWalletSpec,
  type Slot,
  assertLidWallet,
  billsThickness,
  fmt,
  lidWalletLayout,
  lidWalletPunches,
} from '../geometry/lid-wallet';

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
const cz = fmt;
/** Tloušťka usně vždy na 1 desetinné místo (1,0 / 0,8), jako v dokumentu. */
const czT = (v: number): string => v.toFixed(1).replace('.', ',');

export const COLORS = {
  CUT: '#1f1f1f',
  STITCH: '#b3261e',
  FOLD: '#1f5fa8',
  GLUE: '#2e7d32',
  GUIDE: '#6f6f6f',
} as const;
/** Poloměr tečky otvoru stehu v mm (testy podle něj otvory poznají). */
export const HOLE_R = 0.45;
export const LAYERS = ['CUT', 'STITCH', 'FOLD', 'GLUE', 'GUIDE'] as const;
type Layer = (typeof LAYERS)[number];
type Anchor = 'start' | 'middle' | 'end';

interface LineStyle {
  color: string;
  width: number;
  dash?: string;
}
/** Poloměr kroužku „propíchnout jehlou“. */
const PRICK_R = 0.7;
/** Barva značek pro broušení do tenka (klín, ztenčení). */
const SKIVE_COLOR = '#b26a00';
/** Světlá výplň pásu ohybu a závěsu (nelepit, nešít). */
const BAND_FILL = 'fill="#000000" fill-opacity="0.07" stroke="none"';
/**
 * Styly čar, které mají na všech čtyřech listech stejný význam (a stejný vzorek v legendě).
 * Vrstva se volí zvlášť (řez později je v CUT, aby šel ze souboru vybrat, popisky nikdy).
 */
const STYLE = {
  cut: { color: COLORS.CUT, width: 0.3 },
  cutLater: { color: COLORS.CUT, width: 0.3, dash: '3 1.2' },
  templateCut: { color: COLORS.CUT, width: 0.3, dash: '0.4 0.9' },
  pencil: { color: COLORS.GUIDE, width: 0.2, dash: '1.2 0.8' },
  info: { color: '#9a9a9a', width: 0.2, dash: '0.3 0.7' },
  mark: { color: COLORS.GUIDE, width: 0.3 },
  skive: { color: SKIVE_COLOR, width: 0.3, dash: '1 0.6' },
  seam: { color: COLORS.STITCH, width: 0.15, dash: '0.8 0.6' },
  foldAxis: { color: COLORS.FOLD, width: 0.15, dash: '6 1.5 1 1.5' },
  crease: { color: COLORS.FOLD, width: 0.25, dash: '3 1.5' },
  hingeEdge: { color: COLORS.FOLD, width: 0.12, dash: '1 1' },
  glueEdge: { color: COLORS.GLUE, width: 0.15, dash: '0.6 0.6' },
} as const satisfies Record<string, LineStyle>;

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Kreslicí plátno s pěti vrstvami. */
class Sheet {
  private readonly layers: Record<Layer, string[]> = {
    CUT: [],
    STITCH: [],
    FOLD: [],
    GLUE: [],
    GUIDE: [],
  };
  private readonly defs: string[] = [];

  add(layer: Layer, s: string): void {
    this.layers[layer].push(s);
  }

  /** Ořezová maska podle obrysu dílu: lepené plochy se nekreslí přes hranu. */
  clipPath(id: string, outlineD: string): void {
    this.defs.push(`<clipPath id="${id}"><path d="${outlineD}"/></clipPath>`);
  }

  path(layer: Layer, d: string, width: number, dash?: string, extra = ''): void {
    this.add(
      layer,
      `<path d="${d}" fill="none" stroke="${COLORS[layer]}" stroke-width="${f(width)}"` +
        (dash ? ` stroke-dasharray="${dash}"` : '') +
        extra +
        '/>',
    );
  }

  line(layer: Layer, x0: number, y0: number, x1: number, y1: number, width = 0.2, dash?: string) {
    this.path(layer, `M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}`, width, dash);
  }

  rect(layer: Layer, x: number, y: number, w: number, h: number, width = 0.2, dash?: string) {
    this.path(
      layer,
      `M${f(x)} ${f(y)} L${f(x + w)} ${f(y)} L${f(x + w)} ${f(y + h)} L${f(x)} ${f(y + h)} Z`,
      width,
      dash,
    );
  }

  circle(layer: Layer, cx: number, cy: number, r: number, width = 0.2, dash?: string, cls = '') {
    this.add(
      layer,
      `<circle${cls ? ` class="${cls}"` : ''} cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${COLORS[layer]}" stroke-width="${f(width)}"` +
        (dash ? ` stroke-dasharray="${dash}"` : '') +
        '/>',
    );
  }

  hole(cx: number, cy: number): void {
    this.add(
      'STITCH',
      `<circle cx="${f(cx)}" cy="${f(cy)}" r="${HOLE_R}" fill="${COLORS.STITCH}"/>`,
    );
  }

  cross(layer: Layer, cx: number, cy: number, s = 1.5): void {
    this.path(
      layer,
      `M${f(cx - s)} ${f(cy)} L${f(cx + s)} ${f(cy)} M${f(cx)} ${f(cy - s)} L${f(cx)} ${f(cy + s)}`,
      0.2,
    );
  }

  /** Značka „propíchnout jehlou“: černý kroužek (legenda PRICK). */
  prick(cx: number, cy: number): void {
    this.add(
      'GUIDE',
      `<circle class="prick" cx="${f(cx)}" cy="${f(cy)}" r="${PRICK_R}" fill="none" stroke="${COLORS.CUT}" stroke-width="0.2"/>`,
    );
  }

  /** Střed výsečníku: křížek v kroužku (legenda PUNCH) – propíchnout, pak vyseknout. */
  punch(cx: number, cy: number, s = 1): void {
    this.cross('GUIDE', cx, cy, s);
    this.add(
      'GUIDE',
      `<circle class="punch" cx="${f(cx)}" cy="${f(cy)}" r="${f(s)}" fill="none" stroke="${COLORS.CUT}" stroke-width="0.2"/>`,
    );
  }

  /** Čára v pevně daném stylu (STYLE) – stejný vzhled na všech listech i v legendě. */
  styled(layer: Layer, d: string, st: LineStyle, cls = ''): void {
    this.add(
      layer,
      `<path${cls ? ` class="${cls}"` : ''} d="${d}" fill="none" stroke="${st.color}" stroke-width="${f(st.width)}"` +
        (st.dash ? ` stroke-dasharray="${st.dash}"` : '') +
        '/>',
    );
  }

  text(
    layer: Layer,
    x: number,
    y: number,
    s: string,
    size = 2.2,
    anchor: Anchor = 'start',
    opts: { bold?: boolean; rotate?: number; fill?: string; halo?: boolean } = {},
  ): void {
    const rot = opts.rotate ? ` transform="rotate(${opts.rotate} ${f(x)} ${f(y)})"` : '';
    // Bílý lem pod písmem: popisek přes čáru nebo šrafu zůstane čitelný.
    const halo = opts.halo
      ? ' stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round" paint-order="stroke"'
      : '';
    this.add(
      layer,
      `<text x="${f(x)}" y="${f(y)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(size)}"` +
        `${opts.bold ? ' font-weight="bold"' : ''} text-anchor="${anchor}" fill="${opts.fill ?? COLORS[layer]}"${halo}${rot}>${esc(s)}</text>`,
    );
  }

  /** Šrafa pod 45° oříznutá na obdélník (vektorově; vzor <pattern> se v PDF rastruje). */
  hatch(layer: Layer, x0: number, y0: number, w: number, h: number, cls: string): void {
    const stepH = 1.2;
    const segs: string[] = [];
    for (let c = x0 - (y0 + h); c <= x0 + w - y0; c += stepH) {
      const ya = Math.max(y0, x0 - c);
      const yb = Math.min(y0 + h, x0 + w - c);
      if (yb - ya > 0.05) segs.push(`M${f(ya + c)} ${f(ya)} L${f(yb + c)} ${f(yb)}`);
    }
    this.add(
      layer,
      `<path d="${segs.join(' ')}" stroke="${COLORS[layer]}" stroke-width="0.15" stroke-opacity="0.7" fill="none"/>`,
    );
    this.add(
      layer,
      `<rect class="${cls}" x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(h)}" fill="none" stroke="${COLORS[layer]}" stroke-width="0.25"/>`,
    );
  }

  render(title: string): string {
    const { widthMm: W, heightMm: H } = PRINT_SHEET;
    const groups = LAYERS.map(
      (id) =>
        `<g id="${id}" inkscape:groupmode="layer" inkscape:label="${id}">${this.layers[id].join('')}</g>`,
    ).join('');
    const defs = this.defs.length > 0 ? `<defs>${this.defs.join('')}</defs>` : '';
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" ` +
      `width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">` +
      `<title>${esc(title)}</title>` +
      defs +
      `<rect width="${W}" height="${H}" fill="#ffffff"/>` +
      groups +
      '</svg>\n'
    );
  }
}

/** Kontrolní úsečka 50 mm, texty o tisku a legenda vrstev (na každém listu). */
function footer(s: Sheet, note: string): void {
  const { heightMm: H, marginMm: m } = PRINT_SHEET;
  const y = H - m - SHEET_FOOTER_MM + 7;
  const x0 = m;
  s.line('GUIDE', x0, y, x0 + CALIBRATION_MM, y, 0.4);
  s.line('GUIDE', x0, y - 2.5, x0, y + 2.5, 0.3);
  s.line('GUIDE', x0 + CALIBRATION_MM, y - 2.5, x0 + CALIBRATION_MM, y + 2.5, 0.3);
  s.add(
    'GUIDE',
    `<path class="calibration" d="M${f(x0)} ${f(y)} L${f(x0 + CALIBRATION_MM)} ${f(y)}" stroke="${COLORS.GUIDE}" stroke-width="0.01"/>`,
  );
  s.text('GUIDE', x0 + CALIBRATION_MM / 2, y - 3.2, 'KONTROLNÍ ÚSEČKA 50 mm', 2.4, 'middle', {
    bold: true,
    fill: COLORS.CUT,
  });
  s.text('GUIDE', x0 + CALIBRATION_MM + 6, y - 1.5, 'PRINT AT 100% / ACTUAL SIZE', 3.4, 'start', {
    bold: true,
    fill: COLORS.CUT,
  });
  s.text(
    'GUIDE',
    x0 + CALIBRATION_MM + 6,
    y + 2.5,
    'Tisk na 100 % (skutečná velikost), vypnout „přizpůsobit stránce“ · měřítko 1:1',
    2.3,
    'start',
    { fill: COLORS.CUT },
  );
  s.text(
    'GUIDE',
    x0,
    y + 7.5,
    'Po tisku změř úsečku pravítkem: musí mít přesně 50 mm, jinak střih nepoužívej.',
    2.3,
  );
  s.text('GUIDE', x0, y + 11.5, note, 2.3);
}

/** Položky legendy: stejné pořadí, vzorek i text na všech listech; list ukáže jen ty, které kreslí. */
const LEGEND = {
  cut: 'řez nožem po čáře',
  cutLater: 'řez později – lekce je u popisku',
  templateCut: 'řez jen v šabloně (výtisk na tvrdém papíře)',
  prick: 'propíchnout jehlou skrz papír',
  punch: 'střed výsečníku: propíchnout, pak vyseknout',
  punchDia: 'průměr výsečníku',
  center: 'střed: propíchnout, šablonu přiložit na vpich',
  mark: 'ryska: tužkou na bok, přiložit na rysku',
  hole: 'otvor švu: propíchnout, děrovat vidličkou',
  seam: 'čára švu',
  foldAxis: 'osa ohybu dna (rýha z rubu)',
  crease: 'přehyb závěsu, konec oblouku ohybu',
  hingeEdge: 'začátek a konec závěsu',
  insert: 'hrana vložky dna (u boků)',
  band: 'pás ohybu a závěsu: nelepit, nešít',
  glue: 'lepit kontaktním lepidlem (tato strana)',
  glueOther: 'lepí se druhá strana (líc D2): zdrsnit',
  glueEdge: 'hranice lepení – lepí se na rubu (list 2)',
  pencil: 'tužkou na rub: poloha dílu',
  skive: 'brousit do tenka (klín, ztenčení)',
  info: 'jen pro orientaci, nic nedělat',
  left: 'levá strana: „L“ napsat na rub',
} as const;
type LegendKey = keyof typeof LEGEND;

/**
 * Krátká jména dílů Víčka (oddíl 5.2 zadání). Sdílí je legenda listů (řádek „Díly“) a slovníček
 * projektu v aplikaci (`src/content/projects/lid-wallet/parts.ts`), aby se jména nerozešla.
 */
export const LID_PART_NAMES = {
  P1: 'hlavní pás z usně',
  F: 'přední stěna',
  B: 'záda',
  D1: 'přepážka karty / bankovky',
  D2: 'přepážka bankovky / mince',
  L1: 'podšívka jazýčku',
  K1: 'magnet',
  K2: 'plíšek',
} as const;
export type LidPartId = keyof typeof LID_PART_NAMES;

/**
 * Díly v řádku legendy jednotlivých listů: každá zkratka dílu, kterou list píše, a magnet K1 na
 * listech, které kreslí jeho polohu (test hlídá, že žádná zkratka na listu nechybí).
 */
export const LID_SHEET_PARTS: Readonly<Record<1 | 2 | 3 | 4, readonly LidPartId[]>> = {
  1: ['P1', 'F', 'B', 'D1', 'D2', 'L1', 'K1', 'K2'],
  2: ['P1', 'F', 'B', 'D1', 'D2', 'L1', 'K2'],
  3: ['F', 'B', 'D1', 'D2', 'L1', 'K2'],
  4: ['P1', 'F', 'B', 'D1', 'D2', 'L1', 'K1', 'K2'],
};

/** Začátek řádku dílů v legendě (testy podle něj řádek najdou). */
export const LID_PARTS_LINE_PREFIX = 'Díly:';

/** Řádek „Díly: P1 = hlavní pás z usně, F = přední stěna, …“ zalomený po nejvýš `max` znacích. */
export function lidPartsLines(parts: readonly LidPartId[], max = 46): string[] {
  const items = parts.map(
    (id, i) => `${id} = ${LID_PART_NAMES[id]}${i < parts.length - 1 ? ',' : ''}`,
  );
  const lines: string[] = [];
  for (const item of items) {
    const last = lines[lines.length - 1];
    if (last !== undefined && last.length + 1 + item.length <= max) {
      lines[lines.length - 1] = `${last} ${item}`;
    } else {
      lines.push(last === undefined ? `${LID_PARTS_LINE_PREFIX} ${item}` : item);
    }
  }
  return lines;
}

/**
 * Legenda značek: nahoře řádek dílů na listu, pak řádek na značku (vzorek 7 mm + text). Vrací y
 * pod posledním řádkem.
 */
function legend(
  s: Sheet,
  x: number,
  y: number,
  parts: readonly LidPartId[],
  keys: readonly LegendKey[],
): number {
  s.text('GUIDE', x, y, 'ZNAČKY NA TOMTO LISTU', 2.2, 'start', { bold: true, fill: COLORS.CUT });
  const gap = 2.85;
  const order = Object.keys(LEGEND) as LegendKey[];
  let yy = y + 3.4;
  for (const ln of lidPartsLines(parts)) {
    s.text('GUIDE', x, yy, ln, 1.9, 'start', { fill: COLORS.CUT });
    yy += gap;
  }
  for (const key of order.filter((k) => keys.includes(k))) {
    const cy = yy - 0.65;
    const x1 = x + 7;
    const ln = (st: LineStyle): void =>
      s.styled('GUIDE', `M${f(x)} ${f(cy)} L${f(x1)} ${f(cy)}`, st, 'legend');
    switch (key) {
      case 'prick':
        s.prick(x + 3.5, cy);
        break;
      case 'punch':
        s.punch(x + 3.5, cy, 1);
        break;
      case 'center':
        s.cross('GUIDE', x + 3.5, cy, 1);
        break;
      case 'punchDia':
        s.circle('GUIDE', x + 3.5, cy, 1.2, 0.12, '1 0.8');
        break;
      case 'mark':
        s.styled('GUIDE', `M${f(x + 2)} ${f(cy)} L${f(x + 5)} ${f(cy)}`, STYLE.mark, 'legend');
        break;
      case 'hole':
        ln(STYLE.seam);
        for (const dx of [1, 3.5, 6]) {
          s.add(
            'GUIDE',
            `<circle class="legend" cx="${f(x + dx)}" cy="${f(cy)}" r="0.5" fill="${COLORS.STITCH}"/>`,
          );
        }
        break;
      case 'insert':
        s.add(
          'GUIDE',
          `<path class="legend" d="M${f(x + 2)} ${f(cy - 1)} L${f(x + 5)} ${f(cy)} L${f(x + 2)} ${f(cy + 1)} Z" fill="${COLORS.FOLD}" stroke="none"/>`,
        );
        break;
      case 'band':
        s.add(
          'GUIDE',
          `<rect class="legend" x="${f(x)}" y="${f(cy - 1)}" width="7" height="2" ${BAND_FILL}/>`,
        );
        break;
      case 'glue':
        s.hatch('GLUE', x, cy - 1.1, 7, 2.2, 'legend');
        break;
      case 'glueOther':
        s.hatch('GUIDE', x, cy - 1.1, 7, 2.2, 'legend');
        break;
      case 'left':
        s.text('GUIDE', x + 3.5, yy + 0.2, 'L', 2.6, 'middle', { bold: true, fill: COLORS.CUT });
        break;
      default:
        ln(STYLE[key]);
    }
    s.text('GUIDE', x + 9, yy, LEGEND[key], 1.9, 'start', { fill: COLORS.CUT });
    yy += gap;
  }
  return yy;
}

/**
 * Listy zkušebního kusu mimo ověřené meze: `outsideLimits` = krátké popisy překročených mezí
 * (např. „šev S4/S5 3,1 mm (max 3,0)“). Kontroly tloušťky se vynechají, ostatní platí dál
 * a geometrie se počítá normálně; v hlavičce každého listu je výrazný varovný pruh.
 */
export interface LidSheetOptions {
  outsideLimits?: readonly string[];
}

/** Začátek textu varovného pruhu (testy a aplikace podle něj listy mimo meze poznají). */
export const LID_OUTSIDE_LIMITS_BAND = 'MIMO OVĚŘENÉ MEZE – jen zkušební kus:';

const outside = (o: LidSheetOptions): readonly string[] => o.outsideLimits ?? [];

/** Kontrola před kreslením; s listy mimo meze bez kontrol tloušťky. */
function assertFor(spec: LidWalletSpec, o: LidSheetOptions): void {
  assertLidWallet(spec, { allowThickness: outside(o).length > 0 });
}

/** Rozdělí položky do řádků po nejvýš `max` znacích (oddělovač „ · “). */
function wrapItems(items: readonly string[], max: number): string[] {
  const lines: string[] = [];
  for (const item of items) {
    const last = lines[lines.length - 1];
    if (last !== undefined && last.length + 3 + item.length <= max) {
      lines[lines.length - 1] = `${last} · ${item}`;
    } else {
      lines.push(item);
    }
  }
  return lines;
}

function header(s: Sheet, title: string, sub: string, o: LidSheetOptions = {}): void {
  const m = PRINT_SHEET.marginMm;
  s.text('GUIDE', m, m + 5, title, 4.6, 'start', { bold: true, fill: COLORS.CUT });
  s.text('GUIDE', m, m + 10, sub, 2.5, 'start', { fill: COLORS.CUT });
  const limits = outside(o);
  if (limits.length === 0) {
    s.text('GUIDE', PRINT_SHEET.widthMm - m, m + 5, 'NÁVRH – ověřit na prototypu', 2.6, 'end', {
      bold: true,
      fill: COLORS.STITCH,
    });
    return;
  }
  // Varovný pruh vpravo v hlavičce (nad díly, které začínají v PIECE_Y): nadpis a překročené
  // hodnoty nejvýš na 3 řádcích.
  const x1 = PRINT_SHEET.widthMm - m;
  const x0 = x1 - 92;
  const lines = wrapItems(limits, 80);
  const shown = lines.length > 3 ? [...lines.slice(0, 2), `${lines[2]} …`] : lines;
  const y0 = m - 0.5;
  // Spodní okraj s rezervou pod posledním řádkem; při 3 řádcích končí pruh nad PIECE_Y.
  const h = 5.6 + shown.length * 2.9;
  s.add(
    'GUIDE',
    `<rect class="outside-limits" x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(h)}" fill="#fde8e6" stroke="${COLORS.STITCH}" stroke-width="0.5"/>`,
  );
  s.text('GUIDE', x0 + 2, y0 + 3.9, LID_OUTSIDE_LIMITS_BAND, 2.6, 'start', {
    bold: true,
    fill: COLORS.STITCH,
  });
  shown.forEach((ln, i) => {
    s.text('GUIDE', x0 + 2, y0 + 7.1 + i * 2.9, ln, 1.9, 'start', { fill: COLORS.CUT });
  });
}

/** Sloupec textu; řádek „# …“ je nadpis. Vrací y pod posledním řádkem. */
function column(s: Sheet, x: number, y: number, lines: string[], size = 2.1, gap = 3.1): number {
  let yy = y;
  for (const ln of lines) {
    if (ln === '') {
      yy += gap * 0.5;
      continue;
    }
    const bold = ln.startsWith('# ');
    s.text('GUIDE', x, yy, bold ? ln.slice(2) : ln, bold ? size + 0.3 : size, 'start', {
      bold,
      fill: COLORS.CUT,
    });
    yy += gap;
  }
  return yy;
}

const PIECE_X = PRINT_SHEET.marginMm;
const PIECE_Y = PRINT_SHEET.marginMm + SHEET_HEADER_MM;

/** Mapování pásu P1 (x, v) na list; `mirror` = pohled na rub (x_rub = W − x). */
interface Frame {
  X: (x: number) => number;
  V: (v: number) => number;
  /** v na přední stěně F, zadní stěně B a na víčku (stav B) z výšky y peněženky. */
  vF: (y: number) => number;
  vB: (y: number) => number;
  sweep: (s: 0 | 1) => 0 | 1;
}

function p1Frame(L: LidWalletLayout, ox: number, oy: number, mirror: boolean): Frame {
  const W = L.widthMm;
  return {
    X: (x) => ox + (mirror ? W - x : x),
    V: (v) => oy + v,
    vF: (y) => L.frontTopY - y,
    vB: (y) => L.v.backStart + (y - L.flatFromY),
    sweep: (s) => (mirror ? ((1 - s) as 0 | 1) : s),
  };
}

/**
 * Obrys P1: obdélník F–B–závěs–pás víčka (horní rohy F R2, rohy pásu víčka R4) a jazýček
 * s vydutým napojením R4 (výsečník Ø 8). Konec jazýčku je zatím rovný (rezerva na ořez).
 * V horní hraně F je uprostřed výřez pro palec: vypouklé rohy ústí, rovné boky a dno půlkruh.
 */
export function p1Outline(
  L: LidWalletLayout,
  spec: LidWalletSpec,
  fr: Frame,
  withNotch = true,
): string {
  const { X, V, sweep } = fr;
  const W = L.widthMm;
  const r2 = spec.frontTopCornerRadiusMm;
  const r4 = spec.bandCornerRadiusMm;
  const rj = spec.tongueJoinRadiusMm;
  const [t0, t1] = L.tongueX;
  const vb = L.v.bandEnd;
  const ve = L.v.cutEnd;
  const P = (x: number, v: number): string => `${f(X(x))} ${f(V(v))}`;
  const A = (r: number, s: 0 | 1, x: number, v: number): string =>
    `A${f(r)} ${f(r)} 0 0 ${sweep(s)} ${P(x, v)} `;
  const n = L.thumbNotch;
  const rc = n.cornerRadiusMm;
  const vc = n.depthMm - n.radius;
  const notch =
    `L${P(n.x0 - rc, 0)} ` +
    A(rc, 1, n.x0, rc) +
    `L${P(n.x0, vc)} ` +
    A(n.radius, 0, n.x1, vc) +
    `L${P(n.x1, rc)} ` +
    A(rc, 1, n.x1 + rc, 0);
  return (
    `M${P(0, r2)} ` +
    A(r2, 1, r2, 0) +
    (withNotch ? notch : '') +
    `L${P(W - r2, 0)} ` +
    A(r2, 1, W, r2) +
    `L${P(W, vb - r4)} ` +
    A(r4, 1, W - r4, vb) +
    `L${P(t1 + rj, vb)} ` +
    A(rj, 0, t1, vb + rj) +
    `L${P(t1, ve)} L${P(t0, ve)} L${P(t0, vb + rj)} ` +
    A(rj, 0, t0 - rj, vb) +
    `L${P(r4, vb)} ` +
    A(r4, 1, 0, vb - r4) +
    'Z'
  );
}

/** Výřez pro palec samotný (otevřená křivka od rohu ústí k rohu), stejný jako v obrysu P1. */
function thumbNotchPath(L: LidWalletLayout, fr: Frame): string {
  const { X, V, sweep } = fr;
  const P = (x: number, v: number): string => `${f(X(x))} ${f(V(v))}`;
  const A = (r: number, sw: 0 | 1, x: number, v: number): string =>
    `A${f(r)} ${f(r)} 0 0 ${sweep(sw)} ${P(x, v)} `;
  const n = L.thumbNotch;
  const rc = n.cornerRadiusMm;
  const vc = n.depthMm - n.radius;
  return (
    `M${P(n.x0 - rc, 0)} ` +
    A(rc, 1, n.x0, rc) +
    `L${P(n.x0, vc)} ` +
    A(n.radius, 0, n.x1, vc) +
    `L${P(n.x1, rc)} ` +
    A(rc, 1, n.x1 + rc, 0)
  ).trim();
}

/** Štěrbina s půlkruhovými konci (výsečník Ø šířky); y0/y1 jsou vnější konce. */
function slotPath(fr: Frame, slot: Slot, toV: (y: number) => number): string {
  const r = slot.width / 2;
  const xa = Math.min(fr.X(slot.cx - r), fr.X(slot.cx + r));
  const xb = Math.max(fr.X(slot.cx - r), fr.X(slot.cx + r));
  const va = Math.min(toV(slot.y0 + r), toV(slot.y1 - r));
  const vb = Math.max(toV(slot.y0 + r), toV(slot.y1 - r));
  const top = fr.V(va);
  const bottom = fr.V(vb);
  return (
    `M${f(xa)} ${f(top)} A${f(r)} ${f(r)} 0 0 1 ${f(xb)} ${f(top)} L${f(xb)} ${f(bottom)} ` +
    `A${f(r)} ${f(r)} 0 0 1 ${f(xa)} ${f(bottom)} Z`
  );
}

/** Obdélník lepené plochy na listu. */
function glueRect(fr: Frame, g: GlueArea): { x: number; y: number; w: number; h: number } {
  const toV = g.wall === 'F' ? fr.vF : fr.vB;
  const xa = Math.min(fr.X(g.x0), fr.X(g.x1));
  const xb = Math.max(fr.X(g.x0), fr.X(g.x1));
  const va = Math.min(toV(g.y0), toV(g.y1));
  const vb = Math.max(toV(g.y0), toV(g.y1));
  return { x: xa, y: fr.V(va), w: xb - xa, h: vb - va };
}

/** Kótovací svislice délky P1 vpravo od dílu. */
function lengthDim(s: Sheet, x: number, y0: number, y1: number, label: string): void {
  s.line('GUIDE', x, y0, x, y1, 0.15);
  s.line('GUIDE', x - 1.2, y0, x + 1.2, y0, 0.15);
  s.line('GUIDE', x - 1.2, y1, x + 1.2, y1, 0.15);
  s.text('GUIDE', x + 2.6, (y0 + y1) / 2, label, 2.1, 'middle', {
    rotate: -90,
    fill: COLORS.CUT,
  });
}

/** Popisek hrany vložky dna (Kolo 9), stejný na listu 1 i 2. */
const insertEdgeLabel = (L: LidWalletLayout): string =>
  `hrana vložky dna v ${cz(L.v.insertEdge)} (${cz(L.v.insertEdge - L.v.foldAxis)} za rýhou, na rub B) · ověřit V12`;

/**
 * Společné kreslení pásu P1 (obrys, okénka mincí, ohyby) pro líc i rub. `rub`: list 2 – popisek
 * hrany vložky dna těsně pod čarou (na listu 1 je tam pás ohybu, popisek jde níž) a kroužky
 * na koncích osy ohybu a hrany vložky (na líci se nepropichuje nic na bocích).
 */
function drawP1Base(
  s: Sheet,
  L: LidWalletLayout,
  spec: LidWalletSpec,
  fr: Frame,
  clipId: string,
  rub: boolean,
): void {
  const insertLabelBelow = rub;
  const pricks = rub;
  // V lekci 4 se horní hrana F řeže rovně přes výřez pro palec; výřez a okénka mincí až v lekci 5.
  const outline = p1Outline(L, spec, fr, false);
  s.path('CUT', outline, 0.3, undefined, ' class="outline"');
  s.clipPath(clipId, outline);
  s.styled('CUT', thumbNotchPath(L, fr), STYLE.cutLater, 'thumb-notch');
  for (const w of L.coinWindows) {
    s.styled('CUT', slotPath(fr, w, fr.vB), STYLE.cutLater, 'coin-window');
  }
  const W = L.widthMm;
  const x0 = fr.X(0);
  const x1 = fr.X(W);
  const xl = Math.min(x0, x1);
  const xr = Math.max(x0, x1);
  const hline = (v: number): string => `M${f(x0)} ${f(fr.V(v))} L${f(x1)} ${f(fr.V(v))}`;
  // Ohyb dna: konce oblouku čárkovaně, osa čerchovaně.
  s.styled('FOLD', hline(L.v.frontEnd), STYLE.crease);
  s.styled('FOLD', hline(L.v.backStart), STYLE.crease);
  s.styled('FOLD', hline(L.v.foldAxis), STYLE.foldAxis);
  // Závěs: dva přehyby (plochý vrch přes obsah), začátek a konec závěsu.
  s.styled('FOLD', hline(L.v.rearCrease), STYLE.crease);
  s.styled('FOLD', hline(L.v.frontCrease), STYLE.crease);
  s.styled('FOLD', hline(L.v.hingeStart), STYLE.hingeEdge);
  s.styled('FOLD', hline(L.v.hingeEnd), STYLE.hingeEdge);
  // Ryska osy ohybu dna vně obrysu (na boky). Kroužky „propíchnout“ na koncích osy a hrany vložky
  // jen na rubu (list 2, lekce 4): rub ohybu dna je uvnitř peněženky, vpich na líci by zůstal vidět.
  // Přehyby závěsu se neznačí vůbec (tvar dá obsah, lekce 10); závěs je vidět z líce i z rubu.
  {
    const y = fr.V(L.v.foldAxis);
    s.styled('GUIDE', `M${f(xl - 3.5)} ${f(y)} L${f(xl - 0.5)} ${f(y)}`, STYLE.mark);
    s.styled('GUIDE', `M${f(xr + 0.5)} ${f(y)} L${f(xr + 3.5)} ${f(y)}`, STYLE.mark);
    if (pricks) {
      s.prick(xl + 1.5, y);
      s.prick(xr - 1.5, y);
    }
  }
  // Hrana vložky dna (Kolo 9): leží na rubu B o půl oblouku za osou ohybu; čára splývá s koncem
  // oblouku, proto má vlastní zarovnávací trojúhelníčky vně obrysu a popisek.
  {
    const vi = fr.V(L.v.insertEdge);
    s.add(
      'FOLD',
      `<path class="insert-edge" d="M${f(xl - 3.5)} ${f(vi - 1)} L${f(xl - 0.5)} ${f(vi)} L${f(xl - 3.5)} ${f(vi + 1)} Z ` +
        `M${f(xr + 3.5)} ${f(vi - 1)} L${f(xr + 0.5)} ${f(vi)} L${f(xr + 3.5)} ${f(vi + 1)} Z" fill="${COLORS.FOLD}" stroke="none"/>`,
    );
    if (pricks) {
      s.prick(xl + 1.5, vi);
      s.prick(xr - 1.5, vi);
    }
    if (insertLabelBelow)
      s.text('FOLD', fr.X(L.axisX), vi + 1.9, insertEdgeLabel(L), 1.5, 'middle', { halo: true });
  }
  // Osa x 50,5 (souměrnost) – značky pod dnem výřezu pro palec v F (celé v kůži, ne v otvoru),
  // nad spodní hranou D1 (y 2, odsud se D1 přikládá, lekce 8) a na zadní stěně B.
  const xa = fr.X(L.axisX);
  for (const v of [L.thumbNotch.depthMm + 2, L.v.backStart + 11]) {
    s.styled('GUIDE', `M${f(xa)} ${f(fr.V(v) - 1.5)} L${f(xa)} ${f(fr.V(v) + 1.5)}`, STYLE.mark);
    s.text('GUIDE', xa + 1, fr.V(v) + 0.6, `osa ${cz(L.axisX)}`, 1.5, 'start', { halo: true });
  }
  // Krátká ryska osy mezi plíškem a ohybem dna (u y 2, odkud se D1 přikládá).
  {
    const va = fr.vF(L.plate.y0) + 0.25;
    const vb = L.v.frontEnd - 0.15;
    if (vb - va > 0.8) {
      s.styled('GUIDE', `M${f(xa)} ${f(fr.V(va))} L${f(xa)} ${f(fr.V(vb))}`, STYLE.mark);
      s.text('GUIDE', xa + 1, fr.V(vb) - 0.1, 'osa', 1.4, 'start', { halo: true });
    }
  }
}

/** Šablona výřezu pro palec (lekce 2): obdélník kolem výřezu, horní hranou na horní hraně F. */
const THUMB_TEMPLATE = { widthMm: 30, heightMm: 20 } as const;

/**
 * Výřez pro palec: střed výsečníku (křížek v kroužku) a popisek; obrys je čárkovaně v CUT
 * (drawP1Base), řeže se v lekci 5. `template`: na listu 1 i obdélník šablony výřezu (lekce 2).
 */
function thumbNotchMarks(s: Sheet, L: LidWalletLayout, fr: Frame, template: boolean): void {
  const n = L.thumbNotch;
  const vc = fr.vF(n.centerY);
  s.punch(fr.X(n.cx), fr.V(vc), 1);
  const half = THUMB_TEMPLATE.widthMm / 2;
  if (template) {
    const xa = fr.X(n.cx - half);
    const xb = fr.X(n.cx + half);
    const vb = fr.V(THUMB_TEMPLATE.heightMm);
    s.styled(
      'CUT',
      `M${f(xa)} ${f(fr.V(0))} L${f(xa)} ${f(vb)} L${f(xb)} ${f(vb)} L${f(xb)} ${f(fr.V(0))}`,
      STYLE.templateCut,
      'thumb-template',
    );
  }
  const xr = Math.max(fr.X(n.cx - half), fr.X(n.cx + half)) + 2;
  const lines = [
    `výřez pro palec Ø ${cz(2 * n.radius)} + nůž`,
    'až v lekci 5 · rohy papírem · ověřit P0',
    ...(template
      ? [
          `tečkovaně: šablona výřezu ${THUMB_TEMPLATE.widthMm} × ${THUMB_TEMPLATE.heightMm}`,
          '(2. výtisk, lekce 2)',
        ]
      : []),
  ];
  lines.forEach((t, i) => s.text('GUIDE', xr, fr.V(vc) - 2.8 + i * 2.2, t, 1.5));
}

/** List 1: pás P1 z líce. */
export function buildLidSheetSvg(
  spec: LidWalletSpec = DEFAULT_LID_WALLET,
  options: LidSheetOptions = {},
): string {
  assertFor(spec, options);
  const L = lidWalletLayout(spec);
  const s = new Sheet();
  const fr = p1Frame(L, PIECE_X, PIECE_Y, false);
  const { X, V, vF, vB } = fr;
  const W = L.widthMm;
  header(
    s,
    'VÍČKO · P1 PÁS · LÍC',
    `1 ks · useň ${czT(spec.leatherMm)} mm · přířez ${cz(W)} × ${cz(L.p1LengthMm)} mm · list 1/4`,
    options,
  );
  drawP1Base(s, L, spec, fr, 'clip-p1-lic', false);

  /* STITCH – švy, které se děrují na rozloženém P1 (S1–S3 skrz D2 + B, S6 skrz F + D1). */
  for (const q of L.seams) {
    // S4/S5 se děrují až po složení, S7 podle šablony konce jazýčku (list 4) na hotovém kusu.
    if (q.where === 'body' || q.where === 'tongue') continue;
    const toV = q.where === 'F' ? vF : vB;
    const pts = q.holes.map((h) => ({ X: X(h.x), Y: V(toV(h.y)) }));
    // čára švu (u S6 dvě části)
    const parts: (typeof pts)[] = [];
    for (const pt of pts) {
      const last = parts[parts.length - 1];
      const prev = last?.[last.length - 1];
      if (!last || !prev || Math.hypot(pt.X - prev.X, pt.Y - prev.Y) > spec.stitchPitchMm + 0.01) {
        parts.push([pt]);
      } else last.push(pt);
    }
    for (const part of parts) {
      const a = part[0]!;
      const b = part[part.length - 1]!;
      s.styled('STITCH', `M${f(a.X)} ${f(a.Y)} L${f(b.X)} ${f(b.Y)}`, STYLE.seam);
    }
    for (const pt of pts) s.hole(pt.X, pt.Y);
  }
  const s1 = L.seams.find((q) => q.id === 'S1')!;
  const s6 = L.seams.find((q) => q.id === 'S6')!;
  s.text(
    'STITCH',
    X(L.axisX),
    V(vB(L.s1Y)) + 3,
    `S1 dno mincí · ${s1.holes.length} otvorů`,
    1.8,
    'middle',
    { halo: true },
  );
  s.text(
    'STITCH',
    X(L.axisX),
    V(vF(L.s6Y)) - 1.5,
    `S6 dno karet · ${s6.holes.length} otvorů`,
    1.8,
    'middle',
  );
  for (const q of L.seams.filter((z) => z.id === 'S2' || z.id === 'S3')) {
    const x = q.holes[0]!.x;
    s.text(
      'STITCH',
      X(x) + (x < L.axisX ? -1 : 1),
      V(vB(q.holes[q.holes.length - 1]!.y)) + 3,
      `${q.id} ${q.holes.length}`,
      1.8,
      x < L.axisX ? 'end' : 'start',
    );
  }

  /* GLUE – jen obrysy (nanáší se na rubu, list 2), ořezané obrysem dílu. */
  s.add('GLUE', '<g clip-path="url(#clip-p1-lic)">');
  for (const g of L.glue) {
    const r = glueRect(fr, g);
    s.add(
      'GLUE',
      `<rect class="glue-outline" x="${f(r.x)}" y="${f(r.y)}" width="${f(r.w)}" height="${f(r.h)}" fill="none" stroke="${STYLE.glueEdge.color}" stroke-width="${STYLE.glueEdge.width}" stroke-dasharray="${STYLE.glueEdge.dash}"/>`,
    );
  }
  s.add('GLUE', '</g>');
  s.text('GLUE', X(L.axisX), V(vF(34.5)), 'lepené plochy = na RUBU, list 2', 1.8, 'middle', {
    halo: true,
  });

  /* GUIDE */
  // Okénko bankovek: řeže se až po lepení G3 skrz D2 + B najednou (lekce 6).
  s.styled('CUT', slotPath(fr, L.billWindow, vB), STYLE.cutLater, 'bill-window');
  const bw = L.billWindow;
  for (const yc of [bw.y0 + bw.width / 2, bw.y1 - bw.width / 2]) {
    s.punch(X(bw.cx), V(vB(yc)), 1);
  }
  s.text('GUIDE', X(bw.cx), V(vB((bw.y0 + bw.y1) / 2)) - 1, 'OKÉNKO', 1.7, 'middle');
  s.text('GUIDE', X(bw.cx), V(vB((bw.y0 + bw.y1) / 2)) + 1.4, 'BANKOVEK', 1.7, 'middle');
  s.text('GUIDE', X(bw.cx), V(vB((bw.y0 + bw.y1) / 2)) + 3.8, 'až po G3', 1.5, 'middle');
  s.text('GUIDE', X(bw.cx), V(vB((bw.y0 + bw.y1) / 2)) + 6, '(lekce 6)', 1.5, 'middle');
  for (const w of L.coinWindows) {
    s.text('GUIDE', X(w.cx), V(vB((w.y0 + w.y1) / 2)), 'MINCE · lekce 5', 1.7, 'middle', {
      rotate: -90,
    });
    for (const yc of [w.y0 + w.width / 2, w.y1 - w.width / 2]) {
      s.circle('GUIDE', X(w.cx), V(vB(yc)), w.width / 2, 0.12, '1 0.8');
      s.punch(X(w.cx), V(vB(yc)), 1);
    }
  }
  // Středy výsečníku Ø 8 na napojení jazýčku (leží v odpadu vedle jazýčku, propichují se
  // v lekci 4, sekají při řezu P1): kruh Ø 8 a popisek.
  {
    const rj = spec.tongueJoinRadiusMm;
    const xs = [L.tongueX[0] - rj, L.tongueX[1] + rj];
    for (const xc of xs) {
      s.circle('GUIDE', X(xc), V(L.v.bandEnd + rj), rj, 0.12, '1 0.8');
      s.punch(X(xc), V(L.v.bandEnd + rj), 1);
    }
    s.text('GUIDE', X(xs[1]!) + rj + 1, V(L.v.bandEnd + rj) + 0.6, `Ø ${cz(2 * rj)}, lekce 4`, 1.5);
  }
  // Pás ohybu dna a pás závěsu: od Kola 6 bez ztenčení (ztenčení jen jako záloha).
  for (const [a, b, label, skive, plain] of [
    [
      L.v.foldBand[0],
      L.v.foldBand[1],
      'ohyb dna',
      spec.bottomFoldSkiveMm,
      'rýha z rubu na ose ohybu',
    ],
    [L.v.hingeBand[0], L.v.hingeBand[1], 'závěs', spec.hingeSkiveMm, 'pás závěsu – nelepit, nešít'],
  ] as const) {
    s.add(
      'FOLD',
      `<rect class="band" x="${f(Math.min(X(0), X(W)))}" y="${f(V(a))}" width="${f(W)}" height="${f(b - a)}" ${BAND_FILL}/>`,
    );
    if (skive !== null) {
      s.styled(
        'GUIDE',
        `M${f(X(0))} ${f(V(a))} L${f(X(W))} ${f(V(a))} L${f(X(W))} ${f(V(b))} L${f(X(0))} ${f(V(b))} Z`,
        STYLE.skive,
      );
    }
    s.text(
      'GUIDE',
      X(W) - 1,
      V(a) - 0.6,
      skive === null
        ? plain
        : label === 'závěs'
          ? `ztenčit ${cz(skive)} na plno · ${label}`
          : `ztenčit ${cz(skive)} · ${label} (záloha)`,
      1.6,
      'end',
      { halo: true },
    );
  }
  // Záloha B2: náběh ztenčení závěsu vně pásu (lekce 5).
  if (spec.hingeSkiveMm !== null) {
    for (const v of [L.v.hingeBand[0] - spec.skiveTaperMm, L.v.hingeBand[1] + spec.skiveTaperMm]) {
      s.styled('GUIDE', `M${f(X(0))} ${f(V(v))} L${f(X(W))} ${f(V(v))}`, STYLE.skive);
    }
    s.text(
      'GUIDE',
      X(1),
      V(L.v.hingeBand[0] - spec.skiveTaperMm) - 0.6,
      `oranžově: náběh ${cz(spec.skiveTaperMm)} mm vně pásu závěsu`,
      1.5,
      'start',
      { halo: true },
    );
  }
  s.text(
    'FOLD',
    X(9),
    V(L.v.foldBand[1]) + 2.4,
    `OHYB DNA za mokra · vložka ${cz(spec.bottomSpacerMm)}`,
    1.6,
    'start',
  );
  s.text('FOLD', X(W) - 5.5, V(L.v.foldBand[1]) + 2.4, insertEdgeLabel(L), 1.5, 'end');
  s.text(
    'FOLD',
    X(9),
    V(L.v.hingeBand[1]) + 2.4,
    'ZÁVĚS · 2 přehyby, tvarovat zavřený přes obsah stavu B',
    1.6,
    'start',
  );
  // Boční švy S4/S5: na rozloženém P1 se nic nepropichuje, otvory dá proužek z listu 4 po
  // složení (lekce 9); tady jen popisek, aby se boky neznačily zbytečně.
  const side = L.seams.find((q) => q.id === 'S4')!;
  s.text('GUIDE', X(6), V(vF(30)), 'S4 až po složení (lekce 9)', 1.5, 'start', {
    rotate: -90,
    halo: true,
  });
  s.text('GUIDE', X(W - 4.5), V(vF(30)), 'S5 až po složení (lekce 9)', 1.5, 'start', {
    rotate: -90,
    halo: true,
  });
  // Spodní rohy těla: výchozí hranaté (Kolo 6). Jen při volitelném zaoblení R > 0 se kreslí
  // oblouk, který se řeže až po sešití přes ohyb (F i B, na obou bocích).
  const rb = spec.bodyCornerRadiusMm;
  for (const [toV, dir] of (rb > 0
    ? [
        [vF, 1],
        [vB, -1],
      ]
    : []) as [(y: number) => number, 1 | -1][]) {
    const vc = toV(rb);
    s.styled(
      'CUT',
      `M${f(X(0))} ${f(V(vc))} A${f(rb)} ${f(rb)} 0 0 ${dir > 0 ? 0 : 1} ${f(X(rb))} ${f(V(vc + dir * rb))}` +
        ` M${f(X(W))} ${f(V(vc))} A${f(rb)} ${f(rb)} 0 0 ${dir > 0 ? 1 : 0} ${f(X(W - rb))} ${f(V(vc + dir * rb))}`,
      STYLE.cutLater,
    );
  }
  // Plíšek (na rubu F) – jen pro orientaci (kde S6 vynechává). Magnet se na listu nekreslí:
  // jeho poloha se určí až na kusu (lekce 11).
  const pl = L.plate;
  s.styled(
    'GUIDE',
    `M${f(X(pl.x0))} ${f(V(vF(pl.y1)))} h${f(pl.x1 - pl.x0)} v${f(pl.y1 - pl.y0)} h${f(-(pl.x1 - pl.x0))} Z`,
    STYLE.info,
  );
  s.text('GUIDE', X(L.axisX), V(vF((pl.y0 + pl.y1) / 2)) + 0.7, 'plíšek (rub)', 1.5, 'middle');
  const vMag = L.v.tip - spec.magnetFromTipMm;
  // Osa jazýčku (souměrnost; podle ní se v lekci 11 klade magnet a šablona konce jazýčku).
  s.styled(
    'GUIDE',
    `M${f(X(L.axisX))} ${f(V(L.v.bandEnd + 2))} L${f(X(L.axisX))} ${f(V(L.v.cutEnd - 1))}`,
    STYLE.info,
  );
  // Budoucí špička R10 (ořez až na hotovém kusu, po nalepení magnetu i L1, lekce 11).
  const rt = spec.tongueTipRadiusMm;
  const [t0, t1] = L.tongueX;
  s.styled(
    'CUT',
    `M${f(X(t0))} ${f(V(L.v.tip - rt))} A${f(rt)} ${f(rt)} 0 0 0 ${f(X(t1))} ${f(V(L.v.tip - rt))}`,
    STYLE.cutLater,
    'tongue-tip',
  );
  s.text('GUIDE', X(t1) + 1.5, V(L.v.tip) - 1, 'špička R10 až po nalepení', 1.6);
  s.text('GUIDE', X(t1) + 1.5, V(L.v.tip) + 1.3, 'magnetu + L1 (lekce 11)', 1.6);
  s.text('GUIDE', X(t1) + 1.5, V(vMag) + 0.6, 'magnet: poloha se určí', 1.6);
  s.text('GUIDE', X(t1) + 1.5, V(vMag) + 2.9, 'na kusu (lekce 11)', 1.6);
  const s7 = L.seams.find((q) => q.id === 'S7')!;
  s.text('STITCH', X(t1) + 1.5, V(vMag) - 4.6, `S7 obšití L1 · ${s7.holes.length} otvorů`, 1.6);
  s.text('STITCH', X(t1) + 1.5, V(vMag) - 2.4, 'podle šablony, list 4', 1.6);
  // Názvy úseků.
  s.text('GUIDE', X(L.axisX), V(vF(37.5)), 'F · PŘEDNÍ STĚNA (karty)', 2.4, 'middle', {
    bold: true,
  });
  s.text('GUIDE', X(L.axisX), V(vB(10)), 'B · ZADNÍ STĚNA', 2.4, 'middle', { bold: true });
  s.text('GUIDE', X(L.axisX), V((L.v.hingeEnd + L.v.bandEnd) / 2) + 1, 'PÁS VÍČKA', 2.4, 'middle', {
    bold: true,
  });
  s.text('GUIDE', X(L.axisX), V(L.v.bandEnd + 14), 'JAZÝČEK', 2.2, 'middle', {
    bold: true,
    rotate: -90,
    halo: true,
  });
  s.text('GUIDE', X(L.axisX) + 1.2, V(L.v.bandEnd + 32), 'osa jazýčku', 1.5, 'start', {
    rotate: -90,
    halo: true,
  });
  for (const col of [L.columnLeft, L.columnRight]) {
    s.text(
      'GUIDE',
      X((col[0] + col[1]) / 2),
      V(vB(L.coinFloorY + 1.5)),
      'sloupec mincí',
      1.6,
      'middle',
    );
  }
  s.text('GUIDE', X(22), V(vF(L.cardFloorY)) + 3, 'dno karet (líc F)', 1.6, 'middle');
  thumbNotchMarks(s, L, fr, true);
  lengthDim(s, X(W) + 5.5, V(0), V(L.v.cutEnd), `P1 = ${cz(L.p1LengthMm)} mm`);

  const x = X(W) + 11;
  const tb = L.v;
  const tn = L.thumbNotch;
  const colEnd = column(s, x, PIECE_Y + 2, [
    '# P1 PÁS – 1 ks',
    `useň ${czT(spec.leatherMm)} mm, třísločiněná, pevná`,
    `přířez ${cz(W)} × ${cz(L.p1LengthMm)}, líc nahoru`,
    'souměrné podle osy x ' + cz(L.axisX),
    '',
    '# Úseky v od horní hrany F',
    `F 0–${cz(tb.frontEnd)} (y ${cz(L.frontTopY)} → ${cz(L.flatFromY)})`,
    `ohyb dna ${cz(tb.frontEnd)}–${cz(tb.backStart)} (oblouk ${cz(tb.foldArc)})`,
    `B ${cz(tb.backStart)}–${cz(tb.hingeStart)} (y ${cz(L.flatFromY)} → ${cz(L.hingeStartY)})`,
    `závěs ${cz(tb.hingeStart)}–${cz(tb.hingeEnd)} (${cz(tb.hingeLenB)}, stav B)`,
    `přehyby v ${cz(tb.rearCrease)} a ${cz(tb.frontCrease)}`,
    `pás víčka ${cz(tb.hingeEnd)}–${cz(tb.bandEnd)} (${cz(L.bandLenB)})`,
    `jazýček ${cz(tb.bandEnd)}–${cz(tb.tip)} + ${cz(spec.tongueReserveMm)} rezerva`,
    `  šířka ${cz(spec.tongueWidthMm)}, x ${cz(L.tongueX[0])}–${cz(L.tongueX[1])}`,
    '',
    '# Ohyb dna a závěs',
    ...(spec.bottomFoldSkiveMm === null
      ? [
          `ohyb dna ${czT(L.bottomFoldMm)} bez ztenčení, osa v ${cz(tb.foldAxis)}:`,
          '  rýha z rubu, ohnout za mokra (V12 na odřezku)',
        ]
      : [
          `ohyb dna ztenčit na ${cz(spec.bottomFoldSkiveMm)}, v ${cz(tb.foldBand[0])}–${cz(tb.foldBand[1])}`,
        ]),
    `hrana vložky dna v ${cz(tb.insertEdge)} na rubu B`,
    `  (osa + ${cz(tb.insertEdge - tb.foldAxis)}, půl oblouku; ověřit V12)`,
    ...(spec.hingeSkiveMm === null
      ? [
          `závěs ${czT(L.hingeMm)} bez ztenčení, pás v ${cz(tb.hingeBand[0])}–${cz(tb.hingeBand[1])}`,
        ]
      : [
          `závěs ztenčit na plno ${cz(spec.hingeSkiveMm)}, v ${cz(tb.hingeBand[0])}–${cz(tb.hingeBand[1])}`,
          `  náběh ${cz(spec.skiveTaperMm)} mm vně pásu (lekce 5)`,
        ]),
    ...(spec.bottomFoldSkiveMm !== null || spec.hingeSkiveMm !== null
      ? ['  z rubu, kraje pásu náběh, ne schod (záloha, lekce 5)']
      : []),
    `špička jazýčku: jen posledních ${cz(spec.tipSkiveMm)} mm`,
    '  do klínu papírem, až po ořezu (lekce 11)',
    '',
    '# Výřezy',
    `okénka mincí (jen B, lekce 5) ${cz(spec.coinWindowWidthMm)} × ${cz(L.coinWindows[0].y1 - L.coinWindows[0].y0)},`,
    `  x ${cz(L.coinWindows[0].cx - 6)}–${cz(L.coinWindows[0].cx + 6)} a ${cz(L.coinWindows[1].cx - 6)}–${cz(L.coinWindows[1].cx + 6)},`,
    `  y ${cz(L.coinWindows[0].y0)}–${cz(L.coinWindows[0].y1)}, výsečník Ø ${cz(spec.coinWindowWidthMm)}`,
    `okénko bankovek ${cz(bw.width)} × ${cz(bw.y1 - bw.y0)} (lekce 6):`,
    `  x ${cz(bw.cx - bw.width / 2)}–${cz(bw.cx + bw.width / 2)}, y ${cz(bw.y0)}–${cz(bw.y1)},`,
    `  výsečník Ø ${cz(bw.width)}, řezat po G3 skrz D2 + B`,
    `výřez pro palec v F: U ${cz(tn.x1 - tn.x0)} × ${cz(tn.depthMm)}, x ${cz(tn.x0)}–${cz(tn.x1)},`,
    `  dno výsečník Ø ${cz(2 * tn.radius)} (střed y ${cz(tn.centerY)}), boky nožem,`,
    `  rohy ústí R${cz(tn.cornerRadiusMm)} papírem; ověřit na papírovém modelu P0`,
    `rohy F nahoře R${cz(spec.frontTopCornerRadiusMm)}, pás víčka R${cz(spec.bandCornerRadiusMm)},`,
    `napojení jazýčku vyduté R${cz(spec.tongueJoinRadiusMm)} (Ø ${cz(2 * spec.tongueJoinRadiusMm)})`,
    spec.bodyCornerRadiusMm > 0
      ? `spodní rohy těla R${cz(spec.bodyCornerRadiusMm)} až po sešití`
      : 'spodní rohy těla hranaté, jen zabrousit a leštit',
    `výsečníky Ø ${lidWalletPunches(spec)
      .map((u) => cz(u.diameterMm))
      .join(', ')}`,
    '',
    '# Švy na rozloženém P1',
    `S1 y ${cz(L.s1Y)} (B): ${s1.holes.length} otvorů`,
    `  x ${cz(s1.holes[0]!.x)}…${cz(s1.holes[s1.holes.length - 1]!.x)}, skrz D2 + B`,
    `S2/S3 x ${cz(L.seamColumnX[0])} / ${cz(L.seamColumnX[1])}: 2 × ${L.seams[1]!.holes.length}`,
    `  y ${cz(L.seams[1]!.holes[0]!.y)}…${cz(L.seams[1]!.holes[L.seams[1]!.holes.length - 1]!.y)}`,
    `S6 y ${cz(L.s6Y)} (F): 2 × ${s6.holes.length / 2}, skrz F + D1`,
    `  vynechá x ${cz(L.axisX - spec.s6ClearFromAxisMm)}–${cz(L.axisX + spec.s6ClearFromAxisMm)} (plíšek, jazýček)`,
    `S4/S5 x ${cz(L.seamSideX[0])} / ${cz(L.seamSideX[1])}: 2 × ${side.holes.length},`,
    `  y ${cz(side.holes[0]!.y)}…${cz(side.holes[side.holes.length - 1]!.y)}, až po složení`,
    `S7 obšití L1 (jazýček + L1): ${s7.holes.length}, šablona list 4`,
    `celkem ${L.holesTotal} otvorů, rozteč ${cz(spec.stitchPitchMm)} mm`,
    '',
    '# Hotový kus',
    `${cz(W)} × ${cz(L.heightMm)} mm, plná ${cz(L.thicknessMaxMm)} mm`,
    `horní hrana F y ${cz(L.frontTopY)}, dno karet ${cz(L.cardFloorY)}`,
    `strop ${cz(L.ceilingY)}, závěs od y ${cz(L.hingeStartY)}`,
  ]);
  legend(s, x, colEnd + 3, LID_SHEET_PARTS[1], [
    'cut',
    'cutLater',
    'templateCut',
    'punch',
    'punchDia',
    'mark',
    'hole',
    'seam',
    'foldAxis',
    'crease',
    'hingeEdge',
    'insert',
    'band',
    'glueEdge',
    'info',
    ...(spec.bottomFoldSkiveMm !== null || spec.hingeSkiveMm !== null ? (['skive'] as const) : []),
  ]);
  footer(
    s,
    'P1 z LÍCE. Lepení se značí na RUBU podle listu 2. D1, D2, L1, K2: list 3. Šablony: list 4.',
  );
  return s.render('VÍČKO – P1 pás, líc');
}

/** List 2: pás P1 z rubu s lepenými plochami a polohou D1, D2 a plíšku. */
export function buildLidBackSvg(
  spec: LidWalletSpec = DEFAULT_LID_WALLET,
  options: LidSheetOptions = {},
): string {
  assertFor(spec, options);
  const L = lidWalletLayout(spec);
  const s = new Sheet();
  const fr = p1Frame(L, PIECE_X, PIECE_Y, true);
  const { X, V, vF, vB } = fr;
  const W = L.widthMm;
  header(
    s,
    'VÍČKO · P1 PÁS · RUB (lepení)',
    `pohled na rub, díl je souměrný podle osy x ${cz(W / 2)} · list 2/4`,
    options,
  );
  // Pás ohybu a pás závěsu (nelepit, nešít) – světle podložené, stejně jako na listu 1.
  for (const [a, b] of [L.v.foldBand, L.v.hingeBand]) {
    s.add(
      'FOLD',
      `<rect class="band" x="${f(X(W))}" y="${f(V(a))}" width="${f(W)}" height="${f(b - a)}" ${BAND_FILL}/>`,
    );
  }
  drawP1Base(s, L, spec, fr, 'clip-p1-rub', true);
  // Zálohy B1/B2: hranice ztenčení (jako na listu 1) přes celou šířku až na obrys šablony. Konce
  // čar se v lekci 5 přenesou tužkou na boky (hranu) a podle nich se pás ohraničí páskou, bez vpichů.
  const skiveV = [
    ...(spec.bottomFoldSkiveMm !== null ? L.v.foldBand : []),
    ...(spec.hingeSkiveMm !== null
      ? [
          ...L.v.hingeBand,
          L.v.hingeBand[0] - spec.skiveTaperMm,
          L.v.hingeBand[1] + spec.skiveTaperMm,
        ]
      : []),
  ];
  for (const v of skiveV) {
    s.styled('GUIDE', `M${f(X(0))} ${f(V(v))} L${f(X(W))} ${f(V(v))}`, STYLE.skive, 'skive-edge');
  }

  s.add('GLUE', '<g clip-path="url(#clip-p1-rub)">');
  for (const g of L.glue) {
    const r = glueRect(fr, g);
    s.hatch('GLUE', r.x, r.y, r.w, r.h, `glue glue-${g.id}`);
  }
  s.add('GLUE', '</g>');
  // Rohy ploch lepení propíchnout jehlou (lekce 4): kroužek v každém rohu uvnitř dílu; roh na boku
  // dílu se posune o 1,5 mm dovnitř, aby jehla nešla do hrany. Stejné body se kreslí jednou.
  {
    const pts: { x: number; y: number }[] = [];
    const xl = Math.min(X(0), X(W));
    const xr = Math.max(X(0), X(W));
    const top = V(0);
    for (const g of L.glue) {
      const r = glueRect(fr, g);
      for (const cx of [r.x, r.x + r.w]) {
        for (const cy of [r.y, r.y + r.h]) {
          if (cy <= top + 0.01) continue;
          const x = Math.min(Math.max(cx, xl + 1.5), xr - 1.5);
          if (pts.some((q) => Math.hypot(q.x - x, q.y - cy) < 1.2)) continue;
          pts.push({ x, y: cy });
        }
      }
    }
    for (const q of pts) s.prick(q.x, q.y);
  }
  // Osa x 50,5 na rub F a rub B (lekce 4): kroužky na ryskách „osa“ a na horní hraně G3c.
  // Spojené tužkou dají osu, na kterou se přikládají vpichy osy D1 (lekce 8) a D2 (lekce 6).
  {
    const xa = X(L.axisX);
    const vD1a = vF(L.plate.y0) + 0.25;
    const vD1b = L.v.frontEnd - 0.15;
    const axisV = [L.thumbNotch.depthMm + 2, L.v.backStart + 11, vB(L.topGlueY)];
    if (vD1b - vD1a > 0.8) axisV.push((vD1a + vD1b) / 2);
    for (const v of axisV) s.prick(xa, V(v));
  }
  // Popisky ploch (jednou za ID, u první plochy).
  const labelled = new Set<string>();
  for (const g of L.glue) {
    if (labelled.has(g.id)) continue;
    labelled.add(g.id);
    const r = glueRect(fr, g);
    const cx = r.x + r.w / 2;
    // Úzké pásy: popisek svisle (pás ≥ 3 mm uvnitř, užší vedle směrem do kapsy).
    const narrow = r.w < 8;
    const inward = r.x + r.w / 2 < PIECE_X + L.widthMm / 2 ? 1 : -1;
    const lx = !narrow ? (g.id === 'G2' ? r.x + 15 : cx) : r.w >= 3 ? cx + 0.6 : cx + inward * 2.2;
    s.text('GLUE', lx, r.y + (narrow ? 14 : r.h / 2 + 0.7), g.id, narrow ? 1.7 : 2, 'middle', {
      bold: true,
      halo: true,
      fill: COLORS.GLUE,
      ...(narrow ? { rotate: -90 } : {}),
    });
  }
  // D1 a D2 – poloha (GUIDE). D1 oříznutá obrysem, aby přes ústí výřezu pro palec nevedla čára.
  const d1 = L.d1;
  s.add('GUIDE', '<g clip-path="url(#clip-p1-rub)">');
  const rectD = (xa: number, xb: number, ya: number, yb: number, toV: (y: number) => number) => {
    const x0 = Math.min(X(xa), X(xb));
    const y0 = V(Math.min(toV(ya), toV(yb)));
    return `M${f(x0)} ${f(y0)} h${f(Math.abs(xb - xa))} v${f(Math.abs(yb - ya))} h${f(-Math.abs(xb - xa))} Z`;
  };
  s.styled('GUIDE', rectD(d1.x0, d1.x1, d1.y0, Math.min(d1.y1, L.frontTopY), vF), STYLE.pencil);
  s.add('GUIDE', '</g>');
  s.text('GUIDE', X(L.axisX), V(vF(35)), 'D1 leží rubem sem (y 2 – horní hrana F,', 1.7, 'middle', {
    halo: true,
  });
  s.text(
    'GUIDE',
    X(L.axisX),
    V(vF(35)) + 2.4,
    `nad F ještě do y ${cz(d1.y1)} volně)`,
    1.7,
    'middle',
    { halo: true },
  );
  // D2 v plné šířce přířezu: přesahuje boky P1 o 1 mm (zarovná se až po šití, lekce 9).
  const d2 = L.d2;
  s.styled('GUIDE', rectD(d2.x0, d2.x1, d2.y0, Math.min(d2.y1, L.hingeStartY), vB), STYLE.pencil);
  s.text('GUIDE', X(L.axisX), V(vB(36)), 'D2 rubem sem,', 1.7, 'middle', { halo: true });
  s.text('GUIDE', X(L.axisX), V(vB(36)) + 2.4, 'přesah 1 mm na bocích', 1.7, 'middle', {
    halo: true,
  });
  // Plíšek.
  const pl = L.plate;
  s.rect('GUIDE', X(pl.x1), V(vF(pl.y1)), pl.x1 - pl.x0, pl.y1 - pl.y0, 0.25);
  // Značky „L“ (levá strana) zvlášť na rubu F a rubu B.
  for (const v of [vF(52), vB(11)]) {
    s.text('GUIDE', X(12), V(v) + 1.4, 'L', 4, 'middle', { bold: true, fill: COLORS.CUT });
  }
  s.text('GUIDE', X(12), V(vF(52)) + 4.5, 'rub F', 1.6, 'middle');
  s.text('GUIDE', X(12), V(vB(11)) - 3.6, 'rub B', 1.6, 'middle');
  s.text('GUIDE', X(L.axisX), V(vF(41)), 'RUB · přední stěna F', 2.4, 'middle', { bold: true });
  thumbNotchMarks(s, L, fr, false);
  s.text('GUIDE', X(L.axisX), V(vB(8)), 'RUB · zadní stěna B', 2.4, 'middle', { bold: true });
  // Nelepit.
  s.text(
    'GUIDE',
    X(L.axisX),
    V(L.v.foldAxis) + 0.6,
    spec.bottomFoldSkiveMm === null ? 'ohyb dna – rýha na ose, NElepit' : 'ohyb dna – NElepit',
    1.8,
    'middle',
    { halo: true },
  );
  s.text(
    'GUIDE',
    X(L.axisX),
    V((L.v.rearCrease + L.v.frontCrease) / 2) + 0.6,
    'závěs – NElepit, NEšít',
    1.8,
    'middle',
    { halo: true },
  );
  s.text(
    'GUIDE',
    X(L.axisX),
    V((L.v.hingeEnd + L.v.bandEnd) / 2),
    'rub pásu víčka: Tokonole, nelepit',
    1.8,
    'middle',
  );
  // Hranice Tokonole (lekce 5): pás víčka ano, jazýček ne (lepí se na něj magnet a L1). Leží na
  // prodloužení rovných spodních hran pásu víčka: v lekci 5 pravítko přes kořen jazýčku a páska,
  // bez vpichu a bez čáry (rub víčka je vidět).
  {
    const [t0, t1] = L.tongueX;
    const vb = V(L.v.bandEnd);
    s.styled('GUIDE', `M${f(X(t0))} ${f(vb)} L${f(X(t1))} ${f(vb)}`, STYLE.info, 'tokonole-edge');
    s.text('GUIDE', X(L.axisX), vb - 3.4, 'Tokonole jen nad touto čarou:', 1.5, 'middle');
    s.text('GUIDE', X(L.axisX), vb - 1, 'pravítko na spodní hrany pásu víčka', 1.5, 'middle');
    s.text('GUIDE', X(L.axisX), vb + 3, 'jazýček: BEZ', 1.6, 'middle', { bold: true });
    s.text('GUIDE', X(L.axisX), vb + 5.3, 'Tokonole', 1.6, 'middle', { bold: true });
    s.text('GUIDE', X(L.axisX), vb + 7.6, '(magnet a L1,', 1.5, 'middle');
    s.text('GUIDE', X(L.axisX), vb + 9.6, 'lekce 11)', 1.5, 'middle');
  }
  lengthDim(s, X(0) + 5.5, V(0), V(L.v.cutEnd), `P1 = ${cz(L.p1LengthMm)} mm`);

  const lines = [
    '# Lepení – kontaktní lepidlo',
    'oba povrchy, šrafované plochy;',
    'lícové plochy k lepení zdrsnit;',
    'hrany ploch olepit maskovací páskou',
    '',
    '# Plochy (x · y peněženky)',
    // Plocha lepená na F i na B (G4 rub F ↔ rub B) je jeden řádek s oběma stěnami.
    ...L.glue
      .filter(
        (g, i, a) =>
          a.findIndex(
            (q) =>
              q.id === g.id && q.x0 === g.x0 && q.x1 === g.x1 && q.y0 === g.y0 && q.y1 === g.y1,
          ) === i,
      )
      .map((g) => {
        const both = L.glue.some(
          (q) =>
            q !== g &&
            q.id === g.id &&
            q.wall !== g.wall &&
            q.x0 === g.x0 &&
            q.x1 === g.x1 &&
            q.y0 === g.y0 &&
            q.y1 === g.y1,
        );
        return `${g.id} ${g.what}: x ${cz(g.x0)}–${cz(g.x1)}, y ${cz(g.y0)}–${cz(g.y1)}${both ? ' (F i B)' : ''}`;
      }),
    '',
    '# Pořadí (lekce 6–9)',
    '1. G3: D2 na rub B, pak okénko bankovek,',
    '   děrovat a šít S1–S3',
    spec.bottomFoldSkiveMm === null
      ? '2. mokrý ohyb dna (rýha z lekce 5)'
      : '2. mokrý ohyb dna, nechat vyschnout',
    '3. G1: plíšek (hrany přelakované),',
    '   G2 + G2b: D1; F rubem nahoru na desce;',
    '   šít S6 (dno karet)',
    '4. G4: boky F–D2 a F–B, pak S4/S5',
    '',
    '# Nelepí se',
    'ohyb dna, závěs (lepení končí na',
    `y ${cz(L.topGlueY)}, kde začíná přehyb), kapsa karet,`,
    'oddíl bankovek, sloupce mincí, rub víčka',
    '',
    '# Značky',
    '„L“ = levá strana, zvlášť na rubu F',
    'a na rubu B. Díl je souměrný, šikmé',
    'otvory určuje jen pravidlo v lekci 6.',
  ];
  const colEnd = column(s, X(0) + 11, PIECE_Y + 2, lines, 1.95, 2.9);
  legend(s, X(0) + 11, colEnd + 3, LID_SHEET_PARTS[2], [
    'cut',
    'cutLater',
    'prick',
    'punch',
    'mark',
    'foldAxis',
    'crease',
    'hingeEdge',
    'insert',
    'band',
    'glue',
    'pencil',
    ...(spec.bottomFoldSkiveMm !== null || spec.hingeSkiveMm !== null ? (['skive'] as const) : []),
    'info',
    'left',
  ]);
  footer(
    s,
    'P1 z RUBU. Obrys se řeže podle listu 1 (líc). Na rubu se jen značí lepení a poloha dílů. ' +
      'Švy S1–S3 a S6 se na rub neznačí: přenášejí se z líce (list 1, lekce 6 a 8).',
  );
  return s.render('VÍČKO – P1 pás, rub');
}

/** Kroužek u hrany dílu leží o tolik dovnitř, aby jehla nešla do hrany. */
const EDGE_INSET_MM = 1.5;

/**
 * Kroužky hranic lepení na přepážce (D1, D2): rohy ploch uvnitř dílu. Roh na boku dílu se posune
 * o 1,5 mm dovnitř (čára pak jde k hraně); vynechá se roh na spodní nebo horní hraně dílu a roh na
 * boku, který sdílejí dvě plochy nad sebou (hranice mezi dvěma lepenými plochami nic nedělí).
 */
function dividerGluePricks(
  areas: readonly { x0: number; x1: number; y0: number; y1: number }[],
  part: { x0: number; x1: number; y0: number; y1: number },
): { x: number; y: number }[] {
  const near = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;
  const corners = areas.flatMap((g) =>
    [g.x0, g.x1].flatMap((x) => [g.y0, g.y1].map((y) => ({ x, y }))),
  );
  const onSide = (c: { x: number }): boolean => near(c.x, part.x0) || near(c.x, part.x1);
  const pts: { x: number; y: number }[] = [];
  // Nejdřív rohy uvnitř dílu, pak rohy na boku: posunutý roh blíž než 1,2 mm k jinému kroužku
  // (úzký pás G2b) se vynechá.
  for (const c of [...corners.filter((q) => !onSide(q)), ...corners.filter(onSide)]) {
    if (near(c.y, part.y0) || near(c.y, part.y1)) continue;
    const side = onSide(c);
    if (side && corners.filter((o) => near(o.x, c.x) && near(o.y, c.y)).length > 1) continue;
    const x = !side ? c.x : near(c.x, part.x0) ? part.x0 + EDGE_INSET_MM : part.x1 - EDGE_INSET_MM;
    if (pts.some((q) => Math.hypot(q.x - x, q.y - c.y) < 1.2)) continue;
    pts.push({ x, y: c.y });
  }
  return pts;
}

/** List 3: přepážky D1, D2, podšívka L1 a plíšek K2. */
export function buildLidPartsSvg(
  spec: LidWalletSpec = DEFAULT_LID_WALLET,
  options: LidSheetOptions = {},
): string {
  assertFor(spec, options);
  const L = lidWalletLayout(spec);
  const s = new Sheet();
  header(
    s,
    'VÍČKO · D1, D2, L1, K2',
    `D1 ${cz(L.d1.x1 - L.d1.x0)} × ${cz(L.d1.y1 - L.d1.y0)} · D2 ${cz(L.d2.x1 - L.d2.x0)} × ${cz(L.d2.y1 - L.d2.y0)} · useň ${cz(spec.dividerMm)} · list 3/4`,
    options,
  );
  const ox = PIECE_X + 4;
  /* D1 – pohled na RUB (lepí se rubem na rub F). y dolů = shora dolů. */
  const d1 = L.d1;
  const d1w = d1.x1 - d1.x0;
  const d1h = d1.y1 - d1.y0;
  const oy1 = PIECE_Y + 6;
  const Y1 = (y: number): number => oy1 + (d1.y1 - y);
  const X1 = (x: number): number => ox + (x - d1.x0);
  const r3 = spec.d1CornerRadiusMm;
  const d1Path =
    `M${f(X1(d1.x0))} ${f(Y1(d1.y0))} L${f(X1(d1.x0))} ${f(Y1(d1.y1) + r3)} ` +
    `A${f(r3)} ${f(r3)} 0 0 1 ${f(X1(d1.x0) + r3)} ${f(Y1(d1.y1))} L${f(X1(d1.x1) - r3)} ${f(Y1(d1.y1))} ` +
    `A${f(r3)} ${f(r3)} 0 0 1 ${f(X1(d1.x1))} ${f(Y1(d1.y1) + r3)} L${f(X1(d1.x1))} ${f(Y1(d1.y0))} Z`;
  s.path('CUT', d1Path, 0.3, undefined, ' class="d1"');
  s.clipPath('clip-d1', d1Path);
  s.add('GLUE', '<g clip-path="url(#clip-d1)">');
  for (const g of L.glue.filter((q) => q.id === 'G2' || q.id === 'G2b')) {
    s.hatch('GLUE', X1(g.x0), Y1(g.y1), g.x1 - g.x0, g.y1 - g.y0, `glue glue-${g.id}`);
  }
  s.add('GLUE', '</g>');
  // Hranice G2 a G2b na rubu D1 (lekce 4 propíchnout, lekce 8 spojit): rohy uvnitř D1. Rohy na
  // obrysu D1 kroužek nemají, čára tam končí na hraně.
  for (const q of dividerGluePricks(
    L.glue.filter((g) => g.id === 'G2' || g.id === 'G2b'),
    d1,
  )) {
    s.prick(X1(q.x), Y1(q.y));
  }
  s.styled(
    'GUIDE',
    `M${f(X1(d1.x0))} ${f(Y1(L.frontTopY))} L${f(X1(d1.x1))} ${f(Y1(L.frontTopY))}`,
    STYLE.info,
  );
  s.text('GUIDE', X1(d1.x0) + 2, Y1(L.frontTopY) - 1, `horní hrana F (y ${cz(L.frontTopY)})`, 1.6);
  s.text('GUIDE', ox + d1w / 2, Y1(50), 'D1 · RUB', 2.6, 'middle', { bold: true });
  s.text(
    'GUIDE',
    ox + d1w / 2,
    Y1(50) + 3.4,
    'dno karet a přepážka karty / bankovky',
    1.8,
    'middle',
  );
  s.text(
    'GLUE',
    ox + d1w / 2,
    Y1(L.cardFloorY) - 1.5,
    `G2 (šrafa) dno karet ${cz(L.cardFloorY - d1.y0)} mm – rubem na rub F`,
    1.8,
    'middle',
    {
      fill: COLORS.CUT,
    },
  );
  s.text('GLUE', X1(d1.x0) + 2.5, Y1(40), 'G2b 1 mm', 1.5, 'start', { rotate: -90 });

  /* D2 – pohled na RUB (lepí se rubem na rub B). */
  const d2 = L.d2;
  const d2w = d2.x1 - d2.x0;
  const d2h = d2.y1 - d2.y0;
  const oy2 = oy1 + d1h + 12;
  const Y2 = (y: number): number => oy2 + (d2.y1 - y);
  const X2 = (x: number): number => ox - 5 + (x - d2.x0);
  const d2Path = `M${f(X2(d2.x0))} ${f(Y2(d2.y1))} h${f(d2w)} v${f(d2h)} h${f(-d2w)} Z`;
  s.path('CUT', d2Path, 0.3, undefined, ' class="d2"');
  s.clipPath('clip-d2', d2Path);
  s.add('GLUE', '<g clip-path="url(#clip-d2)">');
  for (const g of L.glue.filter((q) => q.id.startsWith('G3'))) {
    const x0 = g.x0 === 0 ? d2.x0 : g.x0;
    const x1 = g.x1 === L.widthMm ? d2.x1 : g.x1;
    s.hatch('GLUE', X2(x0), Y2(g.y1), x1 - x0, g.y1 - g.y0, `glue glue-${g.id}`);
  }
  s.add('GLUE', '</g>');
  // Rohy šrafy G3 na rubu D2 (lekce 6, šablona D2): stejné body jako na listu 2.
  for (const q of dividerGluePricks(
    L.glue
      .filter((g) => g.id.startsWith('G3'))
      .map((g) => ({
        ...g,
        x0: g.x0 === 0 ? d2.x0 : g.x0,
        x1: g.x1 === L.widthMm ? d2.x1 : g.x1,
      })),
    d2,
  )) {
    s.prick(X2(q.x), Y2(q.y));
  }
  // Švy S1–S3 i s otvory (způsob (b) v lekci 6: šablona D2 přiložená na D2).
  for (const q of L.seams.filter((z) => z.id === 'S1' || z.id === 'S2' || z.id === 'S3')) {
    const a = q.holes[0]!;
    const b = q.holes[q.holes.length - 1]!;
    s.styled('STITCH', `M${f(X2(a.x))} ${f(Y2(a.y))} L${f(X2(b.x))} ${f(Y2(b.y))}`, STYLE.seam);
    for (const h of q.holes) s.hole(X2(h.x), Y2(h.y));
    const top = q.id === 'S1' ? a : q.holes.reduce((m, h) => (h.y > m.y ? h : m), a);
    s.text(
      'STITCH',
      X2(top.x) + (q.id === 'S1' ? -1.5 : 0),
      Y2(top.y) - 1.4,
      q.id,
      1.7,
      q.id === 'S1' ? 'end' : 'middle',
      { bold: true, halo: true },
    );
  }
  s.styled(
    'CUT',
    slotPath({ X: X2, V: (v) => v, vF: (y) => y, vB: (y) => y, sweep: (q) => q }, L.billWindow, Y2),
    STYLE.cutLater,
    'bill-window',
  );
  s.text(
    'GUIDE',
    X2(L.axisX),
    Y2((L.billWindow.y0 + L.billWindow.y1) / 2),
    'okénko',
    1.6,
    'middle',
    { halo: true },
  );
  s.text(
    'GUIDE',
    X2(L.axisX),
    Y2((L.billWindow.y0 + L.billWindow.y1) / 2) + 2.2,
    'po G3 (lekce 6)',
    1.6,
    'middle',
    { halo: true },
  );
  {
    const xa = X2(d2.x0);
    const xb = X2(d2.x1);
    const ya = Y2(d2.y0 + spec.d2SkiveWedgeMm);
    s.styled('GUIDE', `M${f(xa)} ${f(ya)} L${f(xb)} ${f(ya)}`, STYLE.skive, 'd2-wedge');
    // Konce čáry klínu propíchnout přes šablonu D2 přiloženou na líc D2 (lekce 5).
    s.prick(xa + EDGE_INSET_MM, ya);
    s.prick(xb - EDGE_INSET_MM, ya);
  }
  s.text(
    'GUIDE',
    X2(d2.x0),
    Y2(d2.y0) + 3.5,
    `oranžově: klín ${cz(spec.d2SkiveWedgeMm)} mm na spodní hraně D2, končí pod S1 – brousit z LÍCE D2 (k bankovkám); kroužky přes šablonu na líci`,
    1.6,
    'start',
    { fill: COLORS.CUT },
  );
  for (const col of [L.columnLeft, L.columnRight]) {
    s.text('GUIDE', X2((col[0] + col[1]) / 2), Y2(55), 'sloupec', 1.8, 'middle', { bold: true });
    s.text('GUIDE', X2((col[0] + col[1]) / 2), Y2(55) + 2.6, 'NElepit', 1.6, 'middle');
  }
  s.text('GUIDE', X2((L.columnLeft[0] + L.columnLeft[1]) / 2), Y2(70), 'D2 · RUB', 2.4, 'middle', {
    bold: true,
  });
  // G4 leží na LÍCI D2 (kontakt s rubem F u boků) – i na kresbě rubu je to stejné x, jen opačná
  // strana listu; označit, aby se bok D2 před sestavením zdrsnil (nález K nezávislého ověření).
  for (const g of L.glue.filter((q) => q.id === 'G4' && q.what.includes('líc D2'))) {
    const x0 = Math.max(g.x0, d2.x0);
    const x1 = Math.min(g.x1, d2.x1);
    // Bez kroužků: horní hrana G4 je horní hrana F, nad ní je líc D2 u boku vidět. Hranici dá
    // páska nalepená při zkoušce nanečisto na hranu F (lekce 9).
    s.hatch('GUIDE', X2(x0), Y2(g.y1), x1 - x0, g.y1 - g.y0, 'g4-area');
  }
  // Popisek uvnitř šedé šrafy (od spodní hrany D2 nahoru), nad horní hranou F nic nepřečnívá.
  for (const [x, anchor] of [
    [X2(d2.x0) + 2, 'start'],
    [X2(d2.x1) - 2, 'end'],
  ] as const) {
    s.text(
      'GUIDE',
      x,
      anchor === 'start' ? Y2(d2.y0) - 2 : Y2(L.frontTopY) + 2,
      'G4 (líc, na F) – zdrsnit pod páskou',
      1.5,
      anchor,
      {
        rotate: -90,
        halo: true,
      },
    );
  }
  // Osa x 50,5 (souměrnost): podle osy se D1 přikládá zdola (lekce 8) a D2 na spodní hranu
  // (lekce 6). Ryska u spodní hrany D1, u horní i spodní hrany D2.
  s.styled(
    'GUIDE',
    `M${f(X1(L.axisX))} ${f(Y1(d1.y0) - 3)} L${f(X1(L.axisX))} ${f(Y1(d1.y0))}`,
    STYLE.mark,
  );
  s.styled(
    'GUIDE',
    `M${f(X2(L.axisX))} ${f(Y2(d2.y1))} L${f(X2(L.axisX))} ${f(Y2(d2.y1) + 3)}`,
    STYLE.mark,
  );
  s.text('GUIDE', X2(L.axisX) + 1, Y2(d2.y1) + 4.6, `osa ${cz(L.axisX)}`, 1.5, 'start', {
    halo: true,
  });
  s.styled(
    'GUIDE',
    `M${f(X2(L.axisX))} ${f(Y2(d2.y0) - 3)} L${f(X2(L.axisX))} ${f(Y2(d2.y0))}`,
    STYLE.mark,
  );
  // Osu propíchnout skrz (lekce 4): vpich musí být vidět z líce, přepážky se přikládají lícem
  // nahoru. Proto jen tam, kde líc na hotovém kusu vidět není: D1 1,5 mm nad spodní hranou a
  // v ploše G2 pod spodní hranou D2 (+2 mm; přes ni ji zakryjí D2 a záda, okénko bankovek začíná
  // výš), D2 ve středech výsečníků okénka bankovek (vysekne se v lekci 6).
  const d1AxisY = Math.min(L.cardFloorY - EDGE_INSET_MM, d2.y0 + 2);
  s.prick(X1(L.axisX), Y1(d1.y0) - EDGE_INSET_MM);
  s.prick(X1(L.axisX), Y1(d1AxisY));
  s.text('GUIDE', X1(L.axisX) + 1.6, Y1(d1AxisY) + 0.6, `osa ${cz(L.axisX)}`, 1.5, 'start', {
    halo: true,
  });
  const bw = L.billWindow;
  s.prick(X2(L.axisX), Y2(bw.y0 + bw.width / 2));
  s.prick(X2(L.axisX), Y2(bw.y1 - bw.width / 2));

  /* L1 a K2 */
  const oy3 = oy2 + d2h + 10;
  const lw = spec.liningBlankWidthMm;
  const lh = spec.liningBlankHeightMm;
  s.rect('CUT', ox, oy3, lw, lh, 0.3);
  s.text('GUIDE', ox + lw / 2, oy3 + 7, 'L1 přířez', 2, 'middle', { bold: true });
  s.text(
    'GUIDE',
    ox + lw / 2,
    oy3 + 10,
    `${cz(lw)} × ${cz(lh)} · useň ${cz(spec.liningMm)}`,
    1.6,
    'middle',
  );
  s.text('GUIDE', ox + lw / 2, oy3 + 13, 'ořez s jazýčkem,', 1.6, 'middle');
  s.text('GUIDE', ox + lw / 2, oy3 + 16, 'obšít S7 (list 4)', 1.6, 'middle');
  const pl = L.plate;
  const pw = pl.x1 - pl.x0;
  const ph = pl.y1 - pl.y0;
  const px = ox + 34;
  const rr = 3;
  s.path(
    'CUT',
    `M${f(px + rr)} ${f(oy3)} h${f(pw - 2 * rr)} a${rr} ${rr} 0 0 1 ${rr} ${rr} v${f(ph - 2 * rr)} a${rr} ${rr} 0 0 1 ${-rr} ${rr} h${f(-(pw - 2 * rr))} a${rr} ${rr} 0 0 1 ${-rr} ${-rr} v${f(-(ph - 2 * rr))} a${rr} ${rr} 0 0 1 ${rr} ${-rr} Z`,
    0.3,
    undefined,
    ' class="plate"',
  );
  s.text(
    'GUIDE',
    px + pw / 2,
    oy3 + ph + 3,
    `K2 plíšek ${cz(pw)} × ${cz(ph)} × ${cz(spec.plateThicknessMm)}`,
    1.8,
    'middle',
    {
      bold: true,
    },
  );

  column(s, px + pw + 8, oy3 + 1, [
    '# D1 – 1 ks, useň ' + cz(spec.dividerMm),
    `x ${cz(d1.x0)}–${cz(d1.x1)}, y ${cz(d1.y0)}–${cz(d1.y1)}, horní rohy R${cz(r3)}`,
    'rub dopředu (k rubu F), líc k bankovkám',
    `G2 y ${cz(d1.y0)}–${cz(L.cardFloorY)} + G2b boky 1 mm do y ${cz(L.frontTopY - 1)}`,
    'horní hranu D1 natřít kontrastní barvou na hrany',
    '  (R4: je vidět, kde končí karty; přilnavost ověřit)',
    '',
    '# D2 – 1 ks, useň ' + cz(spec.dividerMm),
    `přířez ${cz(d2w)} (po šití zarovnat na ${cz(L.widthMm)}) × ${cz(d2h)}`,
    `y ${cz(d2.y0)}–${cz(d2.y1)}; S1 ${cz(L.s1Y - d2.y0)} mm od spodní hrany`,
    'líc dopředu k bankovkám, rub na rub B',
    'v tónu kontrastním k D1 (R4, ústí bankovek je vidět)',
    '',
    '# L1, K2',
    `L1 useň ${cz(spec.liningMm)} (kozinka jako D1), lepí se přes magnet,`,
    'pak ořez s jazýčkem a obšití S7 (list 4)',
    'K2: magnetická ocel s ochranou,',
    'ověřit magnetem; hrany zabrousit',
    'a přelakovat; NE austenitická nerez',
  ]);
  legend(s, ox + d1w + 8, oy1 + 2, LID_SHEET_PARTS[3], [
    'cut',
    'cutLater',
    'prick',
    'mark',
    'hole',
    'seam',
    'glue',
    'glueOther',
    'skive',
    'info',
  ]);
  footer(
    s,
    'D1 a D2 z RUBU (lepení šrafovaně). Otvory S1–S3: z listu 1, nebo ze šablony D2 na tomto listu (lekce 6).',
  );
  return s.render('VÍČKO – D1, D2, L1, K2');
}

/** List 4: šablony a přípravky. */
export function buildLidJigsSvg(
  spec: LidWalletSpec = DEFAULT_LID_WALLET,
  options: LidSheetOptions = {},
): string {
  assertFor(spec, options);
  const L = lidWalletLayout(spec);
  const s = new Sheet();
  header(
    s,
    'VÍČKO · ŠABLONY A PŘÍPRAVKY',
    'konec jazýčku, okénka, plíšek, proužek otvorů, vložka dna, tvarování závěsu · list 4/4',
    options,
  );
  const ox = PIECE_X + 4;
  const oy = PIECE_Y + 6;

  /* Šablona konce jazýčku: 20 × 24 s R10, magnet 7 nad špičkou, střed R10 10 nad špičkou. */
  const tw = spec.tongueWidthMm;
  const rt = spec.tongueTipRadiusMm;
  const th = 24;
  const tipY = oy + th;
  s.path(
    'CUT',
    `M${f(ox)} ${f(oy)} L${f(ox + tw)} ${f(oy)} L${f(ox + tw)} ${f(tipY - rt)} A${f(rt)} ${f(rt)} 0 0 1 ${f(ox)} ${f(tipY - rt)} Z`,
    0.3,
    undefined,
    ' class="tongue-template"',
  );
  const my = tipY - spec.magnetFromTipMm;
  const cx = ox + tw / 2;
  s.circle('GUIDE', cx, my, spec.magnetDiameterMm / 2, 0.15, '0.3 0.7', 'magnet');
  // Střed magnetu: kroužek se propíchne do rubu jazýčku a magnet se na vpich klade (lekce 11).
  s.prick(cx, my);
  s.cross('GUIDE', cx, tipY - rt, 0.8);
  // Osa jazýčku (jen orientačně) a čára značky magnetu přes celou šířku šablony: šablona se klade
  // boky na boky jazýčku (stejná šířka) a čárou na rysky značky na bocích jazýčku (lekce 11).
  s.styled('GUIDE', `M${f(cx)} ${f(oy - 2)} L${f(cx)} ${f(tipY + 2)}`, STYLE.info, 'tongue-axis');
  s.styled(
    'GUIDE',
    `M${f(ox - 2)} ${f(my)} L${f(ox + tw + 2)} ${f(my)}`,
    STYLE.mark,
    'magnet-mark',
  );
  const skHalf = Math.sqrt(rt * rt - (rt - spec.tipSkiveMm) ** 2);
  s.styled(
    'GUIDE',
    `M${f(cx - skHalf)} ${f(tipY - spec.tipSkiveMm)} L${f(cx + skHalf)} ${f(tipY - spec.tipSkiveMm)}`,
    STYLE.skive,
    'tip-skive',
  );
  // Rysku klínu nepropichovat (líc špičky je vidět): končí na obrysu R10, její konce se po ořezu
  // špičky přenesou tužkou na hranu jazýčku (lekce 11).
  // Přířez L1: horní hrana nad středem magnetu podle modelu, dole přesahuje špičku (ořez s jazýčkem).
  const ln = L.lining;
  const lTop = tipY - ln.topAboveTipMm;
  s.styled(
    'GUIDE',
    `M${f(cx - spec.liningBlankWidthMm / 2)} ${f(lTop)} h${f(spec.liningBlankWidthMm)} v${f(spec.liningBlankHeightMm)} h${f(-spec.liningBlankWidthMm)} Z`,
    STYLE.info,
  );
  // Horní hrana L1 (lekce 11) bez vpichů: druhá šablona se tu zkrátí a slouží jako doraz pro pásku.
  s.styled(
    'CUT',
    `M${f(ox)} ${f(lTop)} L${f(ox + tw)} ${f(lTop)}`,
    STYLE.templateCut,
    'lining-mark',
  );
  // Šev S7 kolem L1 (U kolem magnetu, ke špičce otevřený): otvory se propíchnou šablonou.
  for (let i = 1; i < ln.seamHoles.length; i++) {
    const a = ln.seamHoles[i - 1]!;
    const b = ln.seamHoles[i]!;
    s.styled(
      'STITCH',
      `M${f(cx + a.u)} ${f(tipY - a.h)} L${f(cx + b.u)} ${f(tipY - b.h)}`,
      STYLE.seam,
    );
  }
  for (const q of ln.seamHoles) s.hole(ox + tw / 2 + q.u, tipY - q.h);
  s.text('GUIDE', ox + tw + 6, oy + 3, 'ŠABLONA KONCE JAZÝČKU', 2.2, 'start', {
    bold: true,
    fill: COLORS.CUT,
  });
  const textEnd = column(
    s,
    ox + tw + 6,
    oy + 6.5,
    [
      `šířka ${cz(tw)}, špička R${cz(rt)}: střed oblouku ${cz(rt)} nad špičkou,`,
      `  tj. ${cz(rt - spec.magnetFromTipMm)} nad středem magnetu`,
      `střed magnetu Ø ${cz(spec.magnetDiameterMm)} ${cz(spec.magnetFromTipMm)} nad špičkou (kroužek)`,
      'přikládá se boky na boky jazýčku a čárou přes',
      '  kroužek magnetu na rysky značky na bocích jazýčku',
      `oranžově: klín jen posledních ${cz(spec.tipSkiveMm)} mm (magnet začíná ${cz(spec.magnetFromTipMm - spec.magnetDiameterMm / 2)} mm od špičky);`,
      '  po ořezu špičky konce čáry tužkou na hranu jazýčku',
      `tečkovaně šedě: přířez L1 ${cz(spec.liningBlankWidthMm)} × ${cz(spec.liningBlankHeightMm)} (useň ${cz(spec.liningMm)})`,
      `tečkovaně černě: horní hrana L1 ${cz(spec.liningTopAboveMagnetMm)} nad středem magnetu –`,
      '  2. šablonu (výtisk z lekce 4) tu zkrátit, kruh magnetu',
      `  vyseknout Ø ${cz(spec.magnetDiameterMm + 2)}: doraz pro pásku (lekce 11)`,
      'lekce 11: podle obrysu R10 seříznout jazýček',
      '  i s L1 najednou',
      `lekce 11: S7 – ${ln.seamHoles.length} červených otvorů (U kolem magnetu),`,
      `  ≥ ${cz(ln.seamToMagnetMm)} mm od magnetu; propíchnout přes šablonu`,
    ],
    1.8,
    2.7,
  );

  /* Šablony okének (pod šablonou jazýčku i pod jejím textem). */
  const wy = Math.max(oy + th + 12, textEnd + 6);
  const drawSlot = (x: number, y: number, w: number, len: number, cls: string): void => {
    const r = w / 2;
    s.path(
      'CUT',
      `M${f(x)} ${f(y + r)} A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)} L${f(x + w)} ${f(y + len - r)} A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + len - r)} Z`,
      0.3,
      undefined,
      ` class="${cls}"`,
    );
    s.cross('GUIDE', x + r, y + r, 1);
    s.cross('GUIDE', x + r, y + len - r, 1);
    s.styled('GUIDE', `M${f(x + r)} ${f(y - 2)} L${f(x + r)} ${f(y + len + 2)}`, STYLE.info);
  };
  const cw = L.coinWindows[0];
  drawSlot(ox, wy, cw.width, cw.y1 - cw.y0, 'coin-window-template');
  s.text(
    'GUIDE',
    ox + cw.width / 2,
    wy + (cw.y1 - cw.y0) + 5,
    `mince ${cz(cw.width)} × ${cz(cw.y1 - cw.y0)}`,
    1.7,
    'middle',
  );
  s.text(
    'GUIDE',
    ox + cw.width / 2,
    wy + (cw.y1 - cw.y0) + 7.5,
    `2 ks, jen B, Ø ${cz(cw.width)}`,
    1.6,
    'middle',
  );
  const bw = L.billWindow;
  const bx = ox + 22;
  drawSlot(bx, wy, bw.width, bw.y1 - bw.y0, 'bill-window-template');
  s.text(
    'GUIDE',
    bx + bw.width / 2,
    wy + (bw.y1 - bw.y0) + 5,
    `bankovky ${cz(bw.width)} × ${cz(bw.y1 - bw.y0)}`,
    1.7,
    'middle',
  );
  s.text(
    'GUIDE',
    bx + bw.width / 2,
    wy + (bw.y1 - bw.y0) + 7.5,
    `D2 + B po G3, Ø ${cz(bw.width)}`,
    1.6,
    'middle',
  );

  /* Šablona plíšku. */
  const pl = L.plate;
  const px = bx + bw.width + 12;
  s.rect('CUT', px, wy, pl.x1 - pl.x0, pl.y1 - pl.y0, 0.3);
  s.text(
    'GUIDE',
    px + (pl.x1 - pl.x0) / 2,
    wy + (pl.y1 - pl.y0) + 4,
    `plíšek ${cz(pl.x1 - pl.x0)} × ${cz(pl.y1 - pl.y0)}`,
    1.7,
    'middle',
  );
  s.text(
    'GUIDE',
    px + (pl.x1 - pl.x0) / 2,
    wy + (pl.y1 - pl.y0) + 6.5,
    'rohy R3 brusným papírem',
    1.6,
    'middle',
  );

  /* Proužek poloh otvorů bočních švů (y od spodní hrany), lekce 9. */
  const side = L.seams.find((q) => q.id === 'S4')!;
  const sx = px + 26;
  const sH = L.heightMm;
  s.rect('CUT', sx, wy, 10, sH, 0.3);
  const SY = (y: number): number => wy + sH - y;
  // Čára švu S4/S5 3,0 od hrany boku F a B (lekce 9): proužek se přikládá levou hranou k boku.
  // Čára jen mezi prvním a posledním otvorem: mimo šev by na líci zůstala vidět.
  const e = L.seamSideX[0];
  const sideYs = side.holes.map((h) => h.y);
  s.add(
    'STITCH',
    `<path class="side-seam-line" d="M${f(sx + e)} ${f(SY(Math.max(...sideYs)))} L${f(sx + e)} ${f(SY(Math.min(...sideYs)))}" stroke="${COLORS.STITCH}" stroke-width="0.15" stroke-dasharray="0.8 0.6" fill="none"/>`,
  );
  // Otvory: červené tečky na čáře švu (třída strip-hole: nepočítají se k S7).
  for (const h of side.holes) {
    s.add(
      'STITCH',
      `<circle class="strip-hole" cx="${f(sx + e)}" cy="${f(SY(h.y))}" r="${HOLE_R}" fill="${COLORS.STITCH}"/>`,
    );
  }
  // Vodorovné značky: horní hrana F (leží na horní hraně F), dno karet, S1 – vlevo s popiskem.
  for (const [y, label, dash] of [
    [L.frontTopY, `F ${cz(L.frontTopY)}`, STYLE.mark],
    [L.cardFloorY, `dno karet ${cz(L.cardFloorY)}`, STYLE.info],
    [L.s1Y, `S1 ${cz(L.s1Y)}`, STYLE.info],
  ] as const) {
    s.styled('GUIDE', `M${f(sx)} ${f(SY(y))} L${f(sx + 10)} ${f(SY(y))}`, dash);
    s.text('GUIDE', sx - 1, SY(y) + 0.6, label, 1.5, 'end');
  }
  // Úseky děrování (lekce 9): pod horní hranou F z líce F, nad ní z líce D2; úsek kolem horní
  // hrany F po jednom otvoru. Závorky vpravo od proužku.
  const ys = side.holes.map((h) => h.y);
  const sBelow = ys.filter((y) => y < L.frontTopY).sort((p, q) => p - q);
  const sAbove = ys.filter((y) => y > L.frontTopY).sort((p, q) => p - q);
  const segs: { a: number; b: number; lines: string[] }[] = [
    {
      a: sBelow[0]!,
      b: sBelow[sBelow.length - 3]!,
      lines: ['① z líce F,', '  vícezubou', '  vidličkou'],
    },
    {
      a: sBelow[sBelow.length - 2]!,
      b: sAbove[1]!,
      lines: [
        '② po jednom:',
        `  ${cz(sBelow[sBelow.length - 2]!)}, ${cz(sBelow[sBelow.length - 1]!)} z líce F`,
        `  ${cz(sAbove[0]!)}, ${cz(sAbove[1]!)} z líce D2`,
        `  zdvojit ${cz(sBelow[sBelow.length - 1]!)}–${cz(sAbove[0]!)}`,
      ],
    },
    { a: sAbove[2]!, b: sAbove[sAbove.length - 1]!, lines: ['③ z líce D2'] },
  ];
  const bx2 = sx + 11.5;
  for (const sg of segs) {
    const ya = SY(sg.b);
    const yb = SY(sg.a);
    s.styled(
      'GUIDE',
      `M${f(bx2 - 0.8)} ${f(ya)} L${f(bx2)} ${f(ya)} L${f(bx2)} ${f(yb)} L${f(bx2 - 0.8)} ${f(yb)}`,
      STYLE.mark,
    );
    const mid = (ya + yb) / 2 - ((sg.lines.length - 1) * 2.1) / 2 + 0.5;
    sg.lines.forEach((ln2, k) => s.text('GUIDE', bx2 + 1.2, mid + k * 2.1, ln2, 1.5, 'start'));
  }
  // Zdvojený steh přes horní hranu F a směr šití (od nejvyššího otvoru dolů).
  const d0 = sBelow[sBelow.length - 1]!;
  const d1y = sAbove[0]!;
  s.styled(
    'STITCH',
    `M${f(sx + e + 1)} ${f(SY(d1y))} L${f(sx + e + 1)} ${f(SY(d0))}`,
    { color: COLORS.STITCH, width: 0.45 },
    'double-stitch',
  );
  const top = ys[0]! > ys[ys.length - 1]! ? ys[0]! : ys[ys.length - 1]!;
  const bottom = Math.min(...ys);
  s.text('STITCH', sx - 1, SY(top) + 0.6, `šít od ${cz(top)} ↓`, 1.5, 'end');
  s.text('STITCH', sx - 1, SY(bottom) + 0.6, `konec ${cz(bottom)}`, 1.5, 'end');
  // Nad horní hranou F je navrchu D2 o 1 mm širší: čára tam leží 4,0 od hrany D2.
  s.text(
    'GUIDE',
    sx + 7.6,
    SY((L.frontTopY + top) / 2),
    `nad F ${czT(e + 1)} od D2`,
    1.4,
    'middle',
    { rotate: -90 },
  );
  s.text(
    'GUIDE',
    sx + 7.6,
    SY((L.frontTopY + L.cardFloorY) / 2),
    'S4 líc nahoru · S5 rub nahoru',
    1.4,
    'middle',
    {
      rotate: -90,
    },
  );
  s.text('GUIDE', sx + 5, wy - 2, 'PROUŽEK S4/S5', 1.8, 'middle', { bold: true, fill: COLORS.CUT });
  s.text('GUIDE', sx + 5, SY(0) + 3, 'spodní hrana', 1.6, 'middle');
  s.text(
    'STITCH',
    sx,
    SY(0) + 5.4,
    `čára švu ${czT(e)} od levé hrany, jen mezi otvory`,
    1.5,
    'start',
  );
  s.text('STITCH', sx, SY(0) + 7.5, '(levou hranou k boku F a B)', 1.5, 'start');

  /* Čísla pro postup pro tuto variantu: lekce je berou odsud, ne z textu. Odkazy jsou na lekce, ne na kroky zadání. */
  const st = (id: string) => L.states.find((q) => q.state.id === id)!;
  const [sA, sB, sC] = [st('A'), st('B'), st('C')];
  const g2b = L.glue.find((g) => g.id === 'G2b')!;
  // Šířka okna z hodnot, jak jsou vytištěné (na 0,01), ať sedí s rozdílem čísel na listu.
  const r2 = (v: number): number => Math.round(v * 100) / 100;
  const winMm = r2(r2(L.magnetYBMax) - r2(L.magnetYBMin));
  // Výšky, které se ve variantách posouvají (přepážky nad 0,6, záloha A/B1: o 0,5 níž) a lekce 5, 6
  // a 9 je uvádějí jen pro výchozí střih: okénka mincí, S1–S3, G3, G4, horní hrana F a S4/S5.
  const coinR = L.coinWindows[0].width / 2;
  const s2 = L.seams.find((q) => q.id === 'S2')!.holes.map((h) => h.y);
  const sideY = side.holes.map((h) => h.y);
  const below = sideY.filter((y) => y < L.frontTopY);
  const above = sideY.filter((y) => y > L.frontTopY);
  const g4D2 = L.glue.find((g) => g.id === 'G4' && g.what.includes('líc D2'))!;
  const g4B = L.glue.find((g) => g.id === 'G4' && g.what.includes('rub F ↔ rub B'))!;
  const range = (ys: number[]): string => `${cz(ys[0]!)}–${cz(ys[ys.length - 1]!)}`;
  column(
    s,
    sx + 32,
    wy + 1,
    [
      '# Čísla pro postup (platí pro tento list)',
      `P1 ${czT(spec.leatherMm)} · ohyb dna ${czT(L.bottomFoldMm)} · závěs ${czT(L.hingeMm)}`,
      `D1/D2 ${cz(spec.dividerMm)} · L1 ${cz(spec.liningMm)} (změřené, lekce 1)`,
      '',
      `kóta P1 na listu 1 (lekce 1, 4): ${cz(L.p1LengthMm)}`,
      `osa ohybu, rýha (lekce 4, 5): v ${cz(L.v.foldAxis)}`,
      `hrana vložky dna (lekce 3, 4, 7): v ${cz(L.v.insertEdge)} (${cz(L.v.insertEdge - L.v.foldAxis)} za rýhou)`,
      `pás závěsu (lekce 5, 6): v ${cz(L.v.hingeBand[0])}–${cz(L.v.hingeBand[1])}`,
      `G3 jen do y ${cz(L.hingeBandStartY)} (lekce 6)`,
      `plíšek y ${cz(L.plate.y0)}–${cz(L.plate.y1)} (lekce 8, 11)`,
      `G2 y ${cz(L.d1BottomY)}–${cz(L.cardFloorY)}, boky G2b do y ${cz(g2b.y1)} (lekce 8)`,
      `S6 y ${cz(L.s6Y)} (lekce 8)`,
      `okénka mincí, středy konců (lekce 5): y ${cz(L.coinWindows[0].y0 + coinR)} a ${cz(L.coinWindows[0].y1 - coinR)}`,
      `G3 dno mincí y ${cz(L.d2BottomY)}–${cz(L.coinFloorY)}, spodní hrana D2 y ${cz(L.d2BottomY)} (lekce 6)`,
      `S1 y ${cz(L.s1Y)} · S2/S3 y ${range(s2)} (lekce 6)`,
      `horní hrana F (lekce 9, 10): y ${cz(L.frontTopY)}`,
      `G4 (lekce 9): F–D2 y ${cz(g4D2.y0)}–${cz(g4D2.y1)}, F–B y ${cz(g4B.y0)}–${cz(g4B.y1)}`,
      `S4/S5 (lekce 9): y ${cz(sideY[sideY.length - 1]!)} až ${cz(sideY[0]!)}, úseky ${range(below.slice(0, -2))} /`,
      `  ${range([...below.slice(-2), ...above.slice(0, 2)])} / ${range(above.slice(2))}, zdvojit ${range([below[below.length - 1]!, above[0]!])}`,
      `hrana víčka A / B / C (lekce 10): ${cz(sA.bandEdgeY)} / ${cz(sB.bandEdgeY)} / ${cz(sC.bandEdgeY)}`,
      `  při k ${cz(spec.kMax)}: A ${cz(sA.bandEdgeYkMax)} / C ${cz(sC.bandEdgeYkMax)}`,
      `  k = (y_C − y_A) / ${cz(sC.hingePathMm - sA.hingePathMm)}`,
      '',
      `# Značka magnetu y_m,B (lekce 11): ${cz(L.magnetYB)}`,
      `okno lepení ${cz(L.magnetYBMin)}–${cz(L.magnetYBMax)} (šířka ${cz(winMm)} mm)`,
      winMm < 0.2
        ? 'úzké okno: značku měřit posuvkou od spodní hrany'
        : 'značku přeměřit posuvkou od spodní hrany',
    ],
    1.75,
    2.55,
  );

  /* Vložka dna (jediný přípravek od Kola 9) a tvarování závěsu přes obsah stavu B. */
  const jy = wy + sH + 12;
  const bs = L.bottomSpacer;
  const fc = bs.fromCards;
  s.rect('CUT', ox, jy, bs.widthMm, bs.depthMm, 0.3);
  // Hrana, která jde do ohybu (nahoře), a spoj karet vedle sebe (orientačně).
  s.line('FOLD', ox, jy, ox + bs.widthMm, jy, 0.5);
  s.text(
    'FOLD',
    ox + bs.widthMm / 2,
    jy - 1.2,
    `tahle hrana do ohybu: na čáru hrany vložky v ${cz(L.v.insertEdge)} (list 1 a 2)`,
    1.6,
    'middle',
  );
  s.text(
    'GUIDE',
    ox + bs.widthMm / 2,
    jy + 6,
    `VLOŽKA DNA aspoň ${cz(bs.widthMm)} × ${cz(bs.depthMm)} × ${cz(spec.bottomSpacerMm)}`,
    2,
    'middle',
    { bold: true },
  );
  s.text(
    'GUIDE',
    ox + bs.widthMm / 2,
    jy + 9.5,
    `${fc.layers} vrstvy starých karet (${fc.layers} × ${cz(spec.cardThicknessMm)} = ${cz(fc.thicknessMm)}), v každé ${fc.cardsPerLayer} karty vedle sebe (${cz(fc.lengthMm)} ≥ ${cz(bs.widthMm)})`,
    1.6,
    'middle',
  );
  s.text(
    'GUIDE',
    ox + bs.widthMm / 2,
    jy + 12.5,
    `hranu do ohybu u každé karty odstřihnout rovně o ${cz(fc.edgeTrimMm)} mm (pryč zaoblené rohy), přebytek ${cz(fc.excessMm)}`,
    1.6,
    'middle',
  );
  s.text(
    'GUIDE',
    ox + bs.widthMm / 2,
    jy + 15.5,
    `ustřihnout v jedné vrstvě zleva, v druhé zprava; výšku nezkracovat (~${cz(Math.round(fc.heightMm - fc.edgeTrimMm))} ≥ ${cz(bs.depthMm)}); slepit páskou; na rub B, hranou k F`,
    1.6,
    'middle',
  );
  s.text(
    'GUIDE',
    ox + bs.widthMm / 2,
    jy + 19,
    `nebo jiný rovný pás ${cz(spec.bottomSpacerMm)} mm · o ${cz(spec.bottomSpacerOverhangMm)} mm na každé straně širší než díl ${cz(L.widthMm)}`,
    1.5,
    'middle',
  );
  s.text(
    'GUIDE',
    ox + bs.widthMm / 2,
    jy + 22,
    'po vyschnutí ohybu vysunout bokem · ověřit na odřezku V12',
    1.5,
    'middle',
  );

  column(
    s,
    ox + bs.widthMm + 8,
    jy + 1,
    [
      '# Tvarování závěsu (lekce 10)',
      'bez kopyta a bez opěrky: formou je',
      'peněženka s obsahem stavu B',
      `(${sB.state.cards} staré karty + místo bankovky papír`,
      `  složený na ~${cz(billsThickness(spec, sB.state.bills))} mm podle posuvky,`,
      `  obsah pod závěsem ${cz(L.hingeContentBMm)})`,
      'navlhčit jen pás závěsu, víčko zavřít',
      'přes obsah, přes noc pod knihou',
      '',
      'otevřené víčko samo nestojí,',
      'u bankovek a mincí ho drží palec',
      'ruky, která peněženku drží',
      'posun víčka k změřit v lekci 10',
    ],
    1.75,
    2.55,
  );
  /* Proužek V12 (lekce 3): rýha a hrana vložky na rub odřezku propíchnutím, ne měřením. */
  {
    const vx = ox + 78;
    const vy = jy + bs.depthMm + 24;
    const vw = 30;
    const vh = 14;
    const gap = L.v.insertEdge - L.v.foldAxis;
    const yr = vy + 5;
    const yi = yr + gap;
    s.path(
      'CUT',
      `M${f(vx)} ${f(vy)} h${vw} v${vh} h${-vw} Z`,
      0.3,
      undefined,
      ' class="v12-strip"',
    );
    s.styled('FOLD', `M${f(vx)} ${f(yr)} L${f(vx + vw)} ${f(yr)}`, STYLE.foldAxis, 'v12-crease');
    s.styled('FOLD', `M${f(vx)} ${f(yi)} L${f(vx + vw)} ${f(yi)}`, STYLE.info, 'v12-insert');
    s.add(
      'FOLD',
      `<path d="M${f(vx - 3.5)} ${f(yi - 1)} L${f(vx - 0.5)} ${f(yi)} L${f(vx - 3.5)} ${f(yi + 1)} Z ` +
        `M${f(vx + vw + 3.5)} ${f(yi - 1)} L${f(vx + vw + 0.5)} ${f(yi)} L${f(vx + vw + 3.5)} ${f(yi + 1)} Z" fill="${COLORS.FOLD}" stroke="none"/>`,
    );
    // Kroužky rýhy u boků, kroužky hrany vložky o kus dál od boků, ať se neslijí.
    s.prick(vx + EDGE_INSET_MM, yr);
    s.prick(vx + vw - EDGE_INSET_MM, yr);
    s.prick(vx + 4.5, yi);
    s.prick(vx + vw - 4.5, yi);
    s.text('GUIDE', vx + vw / 2, yr - 1.6, 'rýha', 1.5, 'middle');
    s.text('GUIDE', vx + vw / 2, yi + 3.4, 'hrana vložky', 1.5, 'middle');
    s.text('GUIDE', vx + vw / 2, yi + 5.6, 'vložka leží tady', 1.5, 'middle');
    column(
      s,
      vx + vw + 6,
      vy + 1,
      [
        '# Proužek V12 (lekce 3)',
        'vystřihnout, přiložit na rub odřezku,',
        'kroužky propíchnout, vpichy spojit tužkou:',
        `čerchovaně rýha, za ní hrana vložky (${cz(gap)} mm)`,
      ],
      1.75,
      2.55,
    );
  }
  legend(s, ox, jy + bs.depthMm + 6, LID_SHEET_PARTS[4], [
    'cut',
    'templateCut',
    'prick',
    'center',
    'mark',
    'hole',
    'seam',
    'foldAxis',
    'insert',
    'skive',
    'info',
  ]);
  footer(
    s,
    'Šablony se lepí na tvrdý papír a vyříznou. Poloha magnetu se určuje až na hotovém kusu (lekce 11).',
  );
  return s.render('VÍČKO – šablony a přípravky');
}

export const LID_FILE_STEM = 'penezenka-vicko';

/** Všechny listy s názvy souborů (bez přípony). */
export function buildLidSheets(
  spec: LidWalletSpec = DEFAULT_LID_WALLET,
  options: LidSheetOptions = {},
): { name: string; svg: string }[] {
  return [
    { name: `${LID_FILE_STEM}-sablona`, svg: buildLidSheetSvg(spec, options) },
    { name: `${LID_FILE_STEM}-rub`, svg: buildLidBackSvg(spec, options) },
    { name: `${LID_FILE_STEM}-dily`, svg: buildLidPartsSvg(spec, options) },
    { name: `${LID_FILE_STEM}-pripravky`, svg: buildLidJigsSvg(spec, options) },
  ];
}

/** Rozsah tloušťky P1 (mm), který generátor přijme (`--p1`, pole v aplikaci). */
export const LID_P1_RANGE_MM: readonly [number, number] = [0.6, 1.4];
/** Rozsah tloušťky po ztenčení v záloze B (`--skive-fold`, `--skive-hinge`). */
export const LID_SKIVE_RANGE_MM: readonly [number, number] = [0.3, 1.4];
/** Rozsah změřené tloušťky přepážek D1/D2 a podšívky L1 (mm), který generátor přijme. */
export const LID_THIN_LEATHER_RANGE_MM: readonly [number, number] = [0.3, 1.2];

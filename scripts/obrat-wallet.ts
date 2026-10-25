/**
 * OBRAT R11 – listy střihu 1:1 (A4 na výšku), konstrukční nákres a kontrolní výstup.
 *
 *   pnpm pattern:wallet-obrat
 *
 * 1. docs/generated/obrat-list-1-telo.svg – T1 záda + klopa (RUB nahoru), šablona rohu klopy
 * 2. docs/generated/obrat-list-2-dily.svg – T2 přední stěna (LÍC), P zadní díl kapsy + víčko
 *    (RUB), T3 předek kapsy (LÍC), kryt K patice C (RUB) a papírová měrka objímek
 * 3. public/projekty/obrat/konstrukce.svg – nákres pro aplikaci (ne střih)
 * 4. docs/design/obrat/obrat-r09-kontrola.json – kontroly a součty z modelu (název souboru
 *    zůstává kvůli odkazům, obsah je aktuální revize)
 *
 * Geometrie je celá v src/lib/geometry/obrat-wallet.ts; tady se jen kreslí.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  OBRAT,
  OBRAT_REVISION,
  type ObratPart,
  type ObratSpec,
  checkObrat,
  flapEdgeY,
  fmt,
  obratLidEndX,
  obratParts,
  obratReview,
} from '../src/lib/geometry/obrat-wallet.ts';

/** Zvednuté víčko v pohledu zepředu: zkrácená hloubka pásu nad ohybem (mm, jen nákres). */
const LIFTED_LID_DEPTH = 6;

const STYLE = `<style>
text{font-family:Arial,Helvetica,sans-serif;fill:#1d1d1d}
.t{font-size:5px;font-weight:bold}.h{font-size:3.6px;font-weight:bold}.s{font-size:3px}.xs{font-size:2.5px}
.id{font-size:9px;font-weight:bold;fill:#9a9a9a}
.cut{fill:none;stroke:#000;stroke-width:.3}
.seam{fill:none;stroke:#333;stroke-width:.25;stroke-dasharray:1 1}
.fold{fill:none;stroke:#1f5fa8;stroke-width:.3;stroke-dasharray:4 1 1 1}
.position{fill:none;stroke:#1d7a6c;stroke-width:.25;stroke-dasharray:2.5 1 .5 1}
.trim{fill:none;stroke:#8a5a00;stroke-width:.25;stroke-dasharray:3 2}
.glue{fill:url(#hatch);stroke:none}
.paper{fill:none;stroke:#555;stroke-width:.25;stroke-dasharray:.6 .6}
.cap{fill:none;stroke:#b0441c;stroke-width:.2;stroke-dasharray:.8 .6}
.hole{fill:#fff;stroke:#b0441c;stroke-width:.3}
.cross{stroke:#b0441c;stroke-width:.2}
</style>
<defs><pattern id="hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2" stroke="#c9c9c9" stroke-width=".6"/></pattern></defs>`;

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x: number, y: number, t: string, cls = 's', anchor = 'start') =>
  `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(t)}</text>`;

/** Řádky textu; řádek začínající dvěma mezerami je odsazený pokračováním předchozího. */
const lines = (x: number, y: number, rows: string[], step = 4, cls = 's') =>
  rows
    .map((t, i) =>
      t === ''
        ? ''
        : t.startsWith('  ')
          ? text(x + 3, y + i * step, t.trim(), cls)
          : text(x, y + i * step, t, cls),
    )
    .join('');

function drawPart(
  part: ObratPart,
  x: number,
  y: number,
  spec: ObratSpec,
  label: string[],
  labelAt: { x: number; y: number } = { x: part.width / 2, y: part.height / 2 },
  notes: { x: number; y: number; t: string; anchor?: string }[] = [],
): string {
  const out = [`<g transform="translate(${x} ${y})">`];
  for (const l of part.lines.filter((l) => l.kind === 'glue'))
    out.push(`<path class="glue" d="${l.d}"/>`);
  out.push(`<path class="cut" d="${part.outline}"/>`);
  for (const l of part.lines.filter((l) => l.kind !== 'glue'))
    out.push(`<path class="${l.kind}" d="${l.d}"/>`);
  for (const m of part.marks) {
    if (m.kind === 'stud-hole') {
      const r = spec.snapCap / 2;
      out.push(
        `<circle class="cap" cx="${m.x}" cy="${m.y}" r="${r}"/>`,
        `<path class="cross" d="M${m.x - 3} ${m.y}H${m.x + 3}M${m.x} ${m.y - 3}V${m.y + 3}"/>`,
        `<circle class="hole" cx="${m.x}" cy="${m.y}" r="0.6"/>`,
        text(m.x, m.y + r + 3, m.label, 'xs', 'middle'),
      );
    } else {
      out.push(`<circle class="hole" cx="${m.x}" cy="${m.y}" r="${spec.reliefHoleDiameter / 2}"/>`);
    }
  }
  out.push(text(labelAt.x, labelAt.y + 2, part.id, 'id', 'middle'));
  label.forEach((t, i) => out.push(text(labelAt.x, labelAt.y + 7 + i * 3.6, t, 's', 'middle')));
  for (const note of notes) out.push(text(note.x, note.y, note.t, 'xs', note.anchor ?? 'start'));
  out.push('</g>');
  return out.join('');
}

/** Kontrolní úsečky 50 mm: vodorovná od (x, y) doprava, svislá u x + 62 nahoru. */
function calibration(x: number, y: number): string {
  return [
    `<path class="cut" d="M${x} ${y}H${x + 50}M${x} ${y - 2}V${y + 2}M${x + 50} ${y - 2}V${y + 2}"/>`,
    text(x, y + 5, 'Kontrola 50 mm vodorovně'),
    `<path class="cut" d="M${x + 62} ${y}V${y - 50}M${x + 60} ${y}H${x + 64}M${x + 60} ${y - 50}H${x + 64}"/>`,
    text(x + 60, y - 24, 'svisle 50', 'xs', 'end'),
  ].join('');
}

/** Popisek poloměru vně rohu (dx, dy = směr ven z dílu). */
function cornerR(x: number, y: number, r: number, dx: -1 | 1, dy: -1 | 1): string {
  return text(
    x + dx * 1.2,
    y + (dy > 0 ? 3.6 : -1.2),
    `R${fmt(r)}`,
    'xs',
    dx < 0 ? 'end' : 'start',
  );
}

/** Šablona rohu klopy: čtverec s jedním rohem o poloměru r, ryska na začátku oblouku. */
function cornerTemplate(x: number, y: number, r: number, size = 24): string {
  const d = `M${x + r} ${y}H${x + size}V${y + size}H${x}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  return [
    `<path class="cut" d="${d}"/>`,
    `<path class="cross" d="M${x + r} ${y}v2.5M${x} ${y + r}h2.5"/>`,
    text(x + size / 2 + 2, y + size / 2 + 2, `R${fmt(r)}`, 'h', 'middle'),
  ].join('');
}

function legend(x: number, y: number, holes: boolean): string {
  const row = (dy: number, el: string, t: string) => el + text(x + 13, y + dy + 1, t, 'xs');
  return [
    text(x, y - 5, 'Legenda', 'h'),
    row(0, `<path class="cut" d="M${x} ${y}H${x + 10}"/>`, 'řez'),
    row(5, `<path class="seam" d="M${x} ${y + 5}H${x + 10}"/>`, 'linie stehu (vidličky)'),
    row(10, `<path class="fold" d="M${x} ${y + 10}H${x + 10}"/>`, 'ohyb – rýsovat jen na rubu'),
    row(15, `<path class="position" d="M${x} ${y + 15}H${x + 10}"/>`, 'poloha dílu – jen na rubu'),
    row(
      20,
      `<path class="trim" d="M${x} ${y + 20}H${x + 10}"/>`,
      'klopa po seříznutí – orientačně',
    ),
    row(25, `<rect class="glue" x="${x}" y="${y + 23}" width="10" height="4"/>`, 'lepidlo'),
    ...(holes
      ? [
          row(
            30,
            `<circle class="cap" cx="${x + 5}" cy="${y + 30}" r="2.5"/><circle class="hole" cx="${x + 5}" cy="${y + 30}" r="0.6"/>`,
            'patice: střed, čárkovaně klobouček',
          ),
          row(
            35,
            `<circle class="hole" cx="${x + 5}" cy="${y + 35}" r="1"/>`,
            'otvor Ø 2 – vyseknout před řezem',
          ),
        ]
      : []),
  ].join('');
}

const header = (title: string, rows: string[]) =>
  [text(15, 19, `OBRAT ${OBRAT_REVISION} · ${title}`, 't'), lines(15, 25, rows)].join('');

const svgA4 = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">${STYLE}<rect width="210" height="297" fill="#fff"/>${body}</svg>\n`;

export function buildObratSheets(spec: ObratSpec = OBRAT): { telo: string; dily: string } {
  const errors = checkObrat(spec);
  if (errors.length) throw new Error(errors.join('\n'));
  const parts = Object.fromEntries(obratParts(spec).map((p) => [p.id, p])) as Record<
    ObratPart['id'],
    ObratPart
  >;
  const T1 = parts.T1;
  const flapL = fmt(spec.flapFoldAllowance + spec.flapTrimReserve + spec.flapEndY);
  const flapR = fmt(spec.flapFoldAllowance + spec.flapTrimReserve + flapEdgeY(spec, spec.width));
  const gap15 = fmt(spec.lidFoldY - flapEdgeY(spec, 15));
  const gapR = fmt(spec.lidFoldY - flapEdgeY(spec, spec.width));

  const tx = 20;
  const telo = svgA4(
    [
      header('LIST 1 · T1 záda a klopa', [
        'Tisk A4 na výšku, 100 %, bez přizpůsobení. Obě kontrolní úsečky musí měřit 50 mm.',
        'List přiložte na RUB kůže. Šikmá hrana klopy pak po přehnutí stoupá doprava, jak má.',
      ]),
      drawPart(T1, tx, 36, spec, ['RUB nahoru', 'záda + klopa, 1 ×'], { x: 54, y: 100 }),
      cornerR(tx, 36, spec.flapCornerR, -1, -1),
      cornerR(
        tx + T1.width,
        36 + flapEdgeY(spec, 0) - flapEdgeY(spec, spec.width),
        spec.flapCornerR,
        1,
        -1,
      ),
      cornerR(tx, 36 + T1.height, spec.bodyCornerR, -1, 1),
      cornerR(tx + T1.width, 36 + T1.height, spec.bodyCornerR, 1, 1),
      text(142, 44, 'Šablona rohu klopy', 'h'),
      lines(
        142,
        48,
        ['karton, vystřihnout po plné čáře;', 'lekce 9: oba rohy klopy', 'po seříznutí'],
        3,
        'xs',
      ),
      cornerTemplate(144, 60, spec.flapCornerR),
      lines(142, 90, ['Ryska = začátek oblouku.', 'Rovné hrany na bok a hranu klopy.'], 3, 'xs'),
      text(
        tx + 54,
        36 + T1.height + 6,
        `108 mm · klopa ${flapL} mm vlevo, ${flapR} mm vpravo od ohybu (s rezervou ${fmt(spec.flapTrimReserve)} mm)`,
        's',
        'middle',
      ),
      text(15, 198, 'Postup s listem', 'h'),
      lines(15, 203, [
        `1. Řežte po plné čáře, klopa má rezervu. Ohyb a lepené pásy (${fmt(spec.bodyGlue)} mm) rýsujte jen na rubu.`,
        '2. Linii stehu veďte kružítkem 3,5 mm od hrany.',
        '3. Nejdřív obtisk C, pak klopu seřízněte přes obsah (lekce 9). Mezera mezi hranou klopy',
        `  a hřbetem ohybu víčka: 15 mm od levého boku ${gap15} mm, u pravého boku ${gapR} mm.`,
        '4. Potom ozdobný šev klopy 3,5 mm od hrany (3 mm před ohybem končí) a objímka C.',
      ]),
      legend(20, 236, false),
      calibration(122, 276),
    ].join(''),
  );

  const T2 = parts.T2;
  const P = parts.P;
  const T3 = parts.T3;
  const K = parts.K;
  const x0 = 20;
  const yT2 = 38;
  const yP = 124;
  const yT3 = 200;
  const yK = 248;
  const pFold = spec.lidBottomY - spec.lidFoldY + spec.lidFoldAllowance;
  const pMouth = pFold + spec.coinMouthY - spec.lidFoldY;
  const cellX = [
    (spec.seamOffset + spec.dividerSeams[0]) / 2,
    (spec.dividerSeams[1] + spec.width - spec.seamOffset) / 2,
  ];
  const gauge = spec.snapFlangeMax / 2 + 1;
  const dily = svgA4(
    [
      header('LIST 2 · T2, P, T3, K', [
        'Tisk A4 na výšku, 100 %, bez přizpůsobení. Obě kontrolní úsečky musí měřit 50 mm.',
        'T2 a T3 přiložte na LÍC, P a K na RUB. Otvory patic vysekněte skrz list i kůži,',
        'nebo jen propíchněte (lekce 4); kroužky v rozích zářezů P vždy vysekněte.',
      ]),
      // T2 – líc: rámeček „zdrsnit + lepidlo“ pro P, patice C
      drawPart(T2, x0, yT2, spec, ['LÍC nahoru · přední stěna, 1 ×'], { x: 54, y: 50 }, [
        { x: 54, y: 63, t: `šrafa na líci: zdrsnit a přilepit P (lekce 8)`, anchor: 'middle' },
        {
          x: 54,
          y: 66.5,
          t: `rub: lepené pásy jako na T1 (boky a dno ${fmt(spec.bodyGlue)} mm)`,
          anchor: 'middle',
        },
      ]),
      cornerR(x0, yT2 + T2.height, spec.bodyCornerR, -1, 1),
      cornerR(x0 + T2.width, yT2 + T2.height, spec.bodyCornerR, 1, 1),
      // P – rub: šrafa pro T3, ohyb víčka, ústí T3, otvory v rozích zářezů
      drawPart(
        P,
        x0,
        yP,
        spec,
        ['RUB nahoru · zadní díl + víčko, 1 ×', 'šrafa = lepidlo pro T3 (rub na rub)'],
        { x: 54, y: 6 },
        [
          {
            x: 54,
            y: pFold - 1.2,
            t: 'víčko: rezerva 4 mm, seříznout na 20 mm (lekce 6)',
            anchor: 'middle',
          },
          { x: cellX[0], y: pMouth + 14, t: 'dutina', anchor: 'middle' },
          { x: cellX[1], y: pMouth + 14, t: 'dutina', anchor: 'middle' },
        ],
      ),
      cornerR(
        x0 + spec.width - obratLidEndX(spec, spec.lidBottomY + spec.lidFoldAllowance),
        yP,
        spec.lidCornerR,
        1,
        -1,
      ),
      cornerR(
        x0 + obratLidEndX(spec, spec.lidBottomY + spec.lidFoldAllowance),
        yP,
        spec.lidCornerR,
        -1,
        -1,
      ),
      cornerR(x0 + P.width, yP + P.height, spec.bodyCornerR, 1, 1),
      cornerR(x0, yP + P.height, spec.bodyCornerR, -1, 1),
      text(
        x0 + P.width / 2,
        yP + P.height + 4.5,
        'P: rohy dna R6, u zářezů R1, víčko R4, konce víčka šikmo · líc P se lepí na T2',
        'xs',
        'middle',
      ),
      // T3 – líc: U-linie (prorazit), dělicí švy, patice B
      drawPart(T3, x0, yT3, spec, ['LÍC nahoru', 'předek kapsy, 1 ×'], { x: cellX[0], y: 14 }, [
        { x: cellX[1], y: 17, t: 'U-linii jen prorazit,', anchor: 'middle' },
        { x: cellX[1], y: 20.5, t: 'šije se s tělem (lekce 8)', anchor: 'middle' },
      ]),
      cornerR(x0, yT3 + T3.height, spec.bodyCornerR, -1, 1),
      cornerR(x0 + T3.width, yT3 + T3.height, spec.bodyCornerR, 1, 1),
      text(x0 + T3.width / 2, yT3 + T3.height + 4.5, 'T3: rohy dna R6, nahoře R1', 'xs', 'middle'),
      // K a papírová měrka
      drawPart(K, x0, yK, spec, [], { x: K.width / 2, y: K.height / 2 }),
      `<circle class="paper" cx="${x0 + K.width + 4 + gauge}" cy="${yK + K.height / 2}" r="${gauge}"/>`,
      lines(
        x0 + K.width + 8 + 2 * gauge,
        yK + 6,
        [
          `K – kryt patice C, Ø ${fmt(2 * spec.coverRadius)}, z kůže, 1 × (lekce 7).`,
          `Tečkované kolečko Ø ${fmt(2 * gauge)} jen z papíru: měrka objímek.`,
        ],
        3.6,
        'xs',
      ),
      // Pravý sloupec
      text(136, 42, 'Pořadí', 'h'),
      lines(136, 48, [
        '1. Kroužky v rozích zářezů P a B',
        '  vyseknout (nebo propíchnout, lekce 4),',
        '  pak P a T3 vyříznout.',
        '2. Rub P: ohyb a ústí T3 přenést; hrany',
        '  ústí T3, zářezů a víčka dokončit.',
        '3. Líc P zdrsnit v pásech pro T2 (boky,',
        '  dno, horní pás) – před dělicími švy.',
        '4. Patice B do T3; T3 lepit na rub P jen',
        '  na šrafu (pásy 4 mm, pole s B), přes noc.',
        '5. Dělicí švy ušít, U-linii jen prorazit.',
        '6. Víčko ohnout navlhko, seříznout,',
        '  objímka B podle obtisku.',
        '7. Zkouška s pomocnou nití (lekce 6).',
        '8. T2: patice C, kryt K na rub.',
        '9. Lekce 8: líc T2 zdrsnit; T2 na T1,',
        '  přes noc; pak modul na T2, přes noc;',
        '  U-šev jednou nití.',
        '',
        'Polohy a ohyby jen na rubu. Na líci jen',
        'linie stehu a pásy, které zakryje P.',
      ]),
      legend(136, 142, true),
      calibration(122, 276),
    ].join(''),
  );
  return { telo, dily };
}

/** Nákres pro aplikaci: zavřená, otevřené C, otevřené B s víčkem. Měřítko 2,4 px/mm. */
export function buildObratDrawing(spec: ObratSpec = OBRAT): string {
  const k = 2.4;
  const W = spec.width * k;
  const H = spec.height * k;
  const s = spec.seamOffset * k;
  const st = (d: string) => `<path d="${d}" class="st"/>`;
  /** Druk s popiskem vpravo od kloboučku, nebo od `labelX` (vně peněženky). */
  const snap = (x: number, y: number, label: string, socket = false, labelX = x + 18) =>
    `<circle cx="${x}" cy="${y}" r="${(spec.snapCap / 2) * k}" class="snap"/>${socket ? `<circle cx="${x}" cy="${y}" r="5" fill="#4a3620"/>` : ''}<text x="${labelX}" y="${y + 5}" class="s">${label}</text>`;
  const flap = (x0: number, y0: number) => {
    const yl = y0 + spec.flapEndY * k;
    const yr = y0 + flapEdgeY(spec, spec.width) * k;
    const r = spec.flapCornerR * k;
    return `<path class="cut" d="M${x0} ${y0}H${x0 + W}V${yr - r}Q${x0 + W} ${yr} ${x0 + W - r} ${yr - 0.3}L${x0 + r} ${yl - 0.1}Q${x0} ${yl} ${x0} ${yl - r}Z"/>${st(`M${x0 + s} ${y0 + 3 * k}V${yl - s}L${x0 + W - s} ${yr - s}V${y0 + 3 * k}`)}`;
  };
  /** Obrys zavřeného víčka (od ohybu dolů). */
  const lid = (x0: number, y0: number) => {
    const fy = spec.lidFoldY;
    const len = spec.lidBottomY - fy;
    const Y = (d: number) => y0 + (fy + d) * k;
    const xa = obratLidEndX(spec, fy);
    const xb = obratLidEndX(spec, spec.lidBottomY);
    const r = spec.lidCornerR * k;
    const X = (x: number) => x0 + x * k;
    // roh volné hrany zaoblený R4 (přibližně podél šikmé hrany)
    const t = r / Math.hypot((xb - xa) * k, len * k);
    const ax = X(xb) - (X(xb) - X(xa)) * t;
    const ay = Y(len) - (Y(len) - Y(0)) * t;
    const bx = X(spec.width - xb) + (X(spec.width - xa) - X(spec.width - xb)) * t;
    return `<path class="lid" d="M${X(xa)} ${Y(0)}L${ax} ${ay}Q${X(xb)} ${Y(len)} ${X(xb) + r} ${Y(len)}H${X(spec.width - xb) - r}Q${X(spec.width - xb)} ${Y(len)} ${bx} ${ay}L${X(spec.width - xa)} ${Y(0)}Z"/>`;
  };
  /** Kapsa na mince: P + T3 přes celou šířku, dělicí švy; víčko zavřené, nebo otevřené s mincemi. */
  const pocket = (x0: number, y0: number, open: boolean) => {
    const mouth = y0 + spec.coinMouthY * k;
    const bot = y0 + (spec.height - spec.seamOffset) * k;
    const rr = spec.bodyCornerR * k;
    const X = (x: number) => x0 + x * k;
    const seamTop = y0 + (spec.frontTopY + spec.seamEndGap) * k;
    const out = [
      `<path class="in" d="M${x0} ${mouth}H${x0 + W}V${y0 + H - rr}Q${x0 + W} ${y0 + H} ${x0 + W - rr} ${y0 + H}H${x0 + rr}Q${x0} ${y0 + H} ${x0} ${y0 + H - rr}Z"/>`,
      st(`M${x0 + s} ${seamTop}V${bot}H${x0 + W - s}V${seamTop}`),
      ...spec.dividerSeams.map((d) =>
        st(`M${X(d)} ${mouth + spec.seamEndGap * k}V${bot - spec.dividerBottomGap * k}`),
      ),
    ];
    if (open) {
      // rub P mezi ohybem a ústím
      out.push(
        `<rect x="${X(spec.lidInset)}" y="${y0 + spec.lidFoldY * k}" width="${(spec.width - 2 * spec.lidInset) * k}" height="${(spec.coinMouthY - spec.lidFoldY) * k}" fill="#d9a877" stroke="#5e3519" stroke-width="1"/>`,
      );
      const cells = [
        { x: (spec.seamOffset + spec.dividerSeams[0]) / 2, d: 27.5 },
        { x: (spec.dividerSeams[1] + spec.width - spec.seamOffset) / 2, d: 26 },
      ];
      for (const c of cells)
        out.push(
          `<circle class="coin" cx="${X(c.x)}" cy="${bot - (c.d / 2 + 1) * k}" r="${(c.d / 2) * k}"/>`,
        );
      out.push(snap(X(spec.snapB.x), y0 + spec.snapB.y * k, 'B – patice', false, x0 + W + 16));
    } else {
      out.push(lid(x0, y0), snap(X(spec.snapB.x), y0 + spec.snapB.y * k, 'B'));
    }
    return out.join('');
  };
  /** Víčko zvednuté asi na 90°: zkrácený pás nad ohybem (vnitřní strana), objímka B jako elipsa. */
  const liftedLid = (x0: number, y0: number) => {
    const X = (x: number) => x0 + x * k;
    const yf = y0 + spec.lidFoldY * k;
    const depth = LIFTED_LID_DEPTH * k;
    const xa = obratLidEndX(spec, spec.lidFoldY);
    const xb = obratLidEndX(spec, spec.lidBottomY);
    const bY = yf - ((spec.snapB.y - spec.lidFoldY) / (spec.lidBottomY - spec.lidFoldY)) * depth;
    const r = (spec.snapCap / 2) * k;
    const f = depth / ((spec.lidBottomY - spec.lidFoldY) * k);
    return [
      `<path class="lid" d="M${X(xa)} ${yf}L${X(xb) + 3} ${yf - depth}H${X(spec.width - xb) - 3}L${X(spec.width - xa)} ${yf}Z"/>`,
      `<ellipse cx="${X(spec.snapB.x)}" cy="${bY}" rx="${r}" ry="${r * f}" class="snap"/>`,
      `<ellipse cx="${X(spec.snapB.x)}" cy="${bY}" rx="5" ry="${5 * f}" fill="#4a3620"/>`,
      `<text x="${x0 + W + 16}" y="${bY + 5}" class="s">B – objímka</text>`,
    ].join('');
  };
  const body = (x0: number, y0: number) =>
    `<rect class="cut" x="${x0}" y="${y0}" width="${W}" height="${H}" rx="${spec.bodyCornerR * k}"/>` +
    st(
      `M${x0 + s} ${y0 + (spec.frontTopY + spec.seamEndGap) * k}V${y0 + H - s}H${x0 + W - s}V${y0 + (spec.frontTopY + spec.seamEndGap) * k}`,
    );

  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="820" viewBox="0 0 1320 820">`,
    `<style>text{font-family:Arial,sans-serif;fill:#342a23}.h{font-size:22px;font-weight:bold}.t{font-size:16px}.s{font-size:14px}.cut{fill:#a9672f;stroke:#5e3519;stroke-width:2}.in{fill:#c58a52;stroke:#5e3519;stroke-width:2}.lid{fill:#b8783e;stroke:#5e3519;stroke-width:2}.st{fill:none;stroke:#f2d6ab;stroke-width:1.4;stroke-dasharray:5 4}.snap{fill:#d8b66b;stroke:#765a27;stroke-width:2}.coin{fill:#cfc4a0;stroke:#6f6a55;stroke-width:1.5}</style>`,
    `<rect width="1320" height="820" fill="#faf6ef"/>`,
    `<text x="40" y="44" class="h">OBRAT ${OBRAT_REVISION} · přišitá kapsa na mince</text>`,
    `<text x="40" y="70" class="t">Zavřená ${spec.width} × ${spec.height} mm · jedna useň ${fmt(spec.leather)} mm · střih 1:1 na listech 1 a 2 · prototyp zatím neověřený</text>`,
  ];
  // 01 zavřená
  let x0 = 40;
  const y0 = 230;
  out.push(
    `<text x="${x0}" y="${y0 - 110}" class="h">01 · zavřená</text>`,
    body(x0, y0),
    pocket(x0, y0, false),
    flap(x0, y0),
    snap(x0 + spec.snapC.x * k, y0 + spec.snapC.y * k, 'C'),
  );
  // 02 otevřené C
  x0 = 380;
  out.push(`<text x="${x0}" y="${y0 - 110}" class="h">02 · otevřené jen C</text>`, body(x0, y0));
  out.push(
    `<rect x="${x0 + 22}" y="${y0 + 12 * k}" width="${85.75 * k}" height="${60 * k}" fill="#ddd3b5" stroke="#9e947a"/>`,
  );
  for (let i = 0; i < 4; i++)
    out.push(
      `<rect x="${x0 + 30 + i * 2}" y="${y0 + (32.5 - (3 - i) * 1.5) * k}" width="${85.6 * k}" height="${54 * k}" rx="6" fill="${['#aab6b8', '#80969c', '#4c6976', '#294754'][i]}" stroke="#e7edea"/>`,
    );
  const N = spec.notch;
  const t = y0 + spec.frontTopY * k;
  const nb = y0 + N.bottomY * k;
  out.push(
    `<path class="in" d="M${x0} ${t}H${x0 + N.start * k}C${x0 + (N.start + 6) * k} ${t} ${x0 + (N.bottomStart - 6) * k} ${nb} ${x0 + N.bottomStart * k} ${nb}H${x0 + N.bottomEnd * k}C${x0 + (N.bottomEnd + 6) * k} ${nb} ${x0 + (N.end - 6) * k} ${t} ${x0 + N.end * k} ${t}H${x0 + W}V${y0 + H - 14}Q${x0 + W} ${y0 + H} ${x0 + W - 14} ${y0 + H}H${x0 + 14}Q${x0} ${y0 + H} ${x0} ${y0 + H - 14}Z"/>`,
    pocket(x0, y0, false),
    snap(x0 + spec.snapC.x * k, y0 + spec.snapC.y * k, 'C – patice', false, x0 + W + 12),
  );
  out.push(
    `<path class="cut" d="M${x0} ${y0}V${y0 - 70}Q${x0} ${y0 - 86} ${x0 + 16} ${y0 - 86}H${x0 + W - 16}Q${x0 + W} ${y0 - 86} ${x0 + W} ${y0 - 70}V${y0}Z"/>`,
    snap(x0 + spec.snapC.x * k, y0 - spec.snapC.y * k, 'C – objímka', true, x0 + W + 12),
  );
  // 03 otevřené B, víčko zvednuté
  x0 = 720;
  out.push(
    `<text x="${x0}" y="${y0 - 110}" class="h">03 · otevřené jen B</text>`,
    body(x0, y0),
    pocket(x0, y0, true),
    flap(x0, y0),
    snap(x0 + spec.snapC.x * k, y0 + spec.snapC.y * k, 'C'),
    liftedLid(x0, y0),
    `<text x="${x0 + W + 16}" y="${y0 + (spec.lidFoldY - 18) * k}" class="s">víčko zvednuté</text>`,
    `<text x="${x0 + W + 16}" y="${y0 + (spec.lidFoldY - 18) * k + 18}" class="s">(stačí asi na 90°)</text>`,
    `<text x="${x0 + W + 16}" y="${y0 + 74 * k}" class="s">dvě dutiny 37 mm,</text>`,
    `<text x="${x0 + W + 16}" y="${y0 + 74 * k + 18}" class="s">mezi nimi pole s B</text>`,
  );

  // 04 díly a pořadí
  const y1 = 530;
  out.push(
    `<path d="M40 ${y1 - 24}H1280" stroke="#c9bfae"/>`,
    `<text x="40" y="${y1}" class="h">04 · díly a pořadí</text>`,
  );
  [
    'T1 záda + klopa (1 ohyb) · T2 přední stěna s výkusem · P zadní díl kapsy + víčko (1 ohyb) · T3 předek kapsy · kryt K Ø 17.',
    'Všechny díly z jedné usně 1,2 mm, rovné řezy a zaoblené rohy; všechny švy se šijí naplocho.',
    '1. Modul: patice B do T3 → T3 přilepit na rub P → dělicí švy ušít, U-linii jen prorazit → víčko ohnout → objímka B.',
    '2. Patice C do T2, kryt K na rub. 3. T2 na T1, modul na líc T2, U-šev těla jednou nití přes díry modulu.',
    '4. Objímka C podle obtisku. 5. Zkoušky: C samo, B samo, třesení, tloušťka.',
    'Zavřený řez nad mincí: záda → obsah → T2 → P → mince → T3 → víčko (5 vrstev usně).',
    'Proti předloze 03: stejná klopa se šikmou hranou a C; kapsa na mince přes celou šířku, B uprostřed.',
    'Jiné: kapsa je přišitá v U-švu těla, víčko je ohnutý horní okraj zadního dílu P. Nákres není střih.',
  ].forEach((l, i) => out.push(`<text x="40" y="${y1 + 34 + i * 28}" class="t">${esc(l)}</text>`));
  out.push('</svg>\n');
  return out.join('');
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, '..');
  const gen = resolve(root, 'docs/generated');
  mkdirSync(gen, { recursive: true });
  const { telo, dily } = buildObratSheets();
  writeFileSync(resolve(gen, 'obrat-list-1-telo.svg'), telo, 'utf8');
  writeFileSync(resolve(gen, 'obrat-list-2-dily.svg'), dily, 'utf8');
  const pub = resolve(root, 'public/projekty/obrat');
  mkdirSync(pub, { recursive: true });
  writeFileSync(resolve(pub, 'konstrukce.svg'), buildObratDrawing(), 'utf8');
  writeFileSync(
    resolve(root, 'docs/design/obrat/obrat-r09-kontrola.json'),
    JSON.stringify(obratReview(OBRAT), null, 2) + '\n',
    'utf8',
  );
  console.log(
    `OBRAT ${OBRAT_REVISION}: listy 1–2, nákres a kontrola uloženy. Fyzické ověření neprovedeno.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();

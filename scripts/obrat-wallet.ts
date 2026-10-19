/**
 * OBRAT R09 – listy střihu 1:1 (A4 na výšku), konstrukční nákres a kontrolní výstup.
 *
 *   pnpm pattern:wallet-obrat
 *
 * 1. docs/generated/obrat-list-1-telo.svg – T1 záda + klopa (RUB nahoru)
 * 2. docs/generated/obrat-list-2-dily.svg – T2 přední stěna (LÍC), P pás + víčko (RUB),
 *    T3 předek mincí (LÍC), 2 × K kryt
 * 3. public/projekty/obrat/konstrukce.svg – nákres pro aplikaci (ne střih)
 * 4. docs/design/obrat/obrat-r09-kontrola.json – kontroly a součty z modelu
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
  obratParts,
  obratReview,
} from '../src/lib/geometry/obrat-wallet.ts';

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
.cap{fill:none;stroke:#b0441c;stroke-width:.2;stroke-dasharray:.8 .6}
.hole{fill:#fff;stroke:#b0441c;stroke-width:.3}
.cross{stroke:#b0441c;stroke-width:.2}
</style>
<defs><pattern id="hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2" stroke="#c9c9c9" stroke-width=".6"/></pattern></defs>`;

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x: number, y: number, t: string, cls = 's', anchor = 'start') =>
  `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(t)}</text>`;

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
      out.push(
        `<circle class="cap" cx="${m.x}" cy="${m.y}" r="${spec.snapCap / 2}"/>`,
        `<path class="cross" d="M${m.x - 3} ${m.y}H${m.x + 3}M${m.x} ${m.y - 3}V${m.y + 3}"/>`,
        `<circle class="hole" cx="${m.x}" cy="${m.y}" r="0.6"/>`,
        text(m.x + 6.8, m.y + 1, m.label, 'xs'),
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

function legend(x: number, y: number): string {
  const row = (dy: number, el: string, t: string) => el + text(x + 14, y + dy + 1, t);
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
    row(
      30,
      `<circle class="cap" cx="${x + 5}" cy="${y + 30}" r="2.5"/><circle class="hole" cx="${x + 5}" cy="${y + 30}" r="0.6"/>`,
      'střed otvoru patice (čárkovaně klobouček)',
    ),
    row(
      35,
      `<circle class="hole" cx="${x + 5}" cy="${y + 35}" r="1"/>`,
      'odlehčovací otvor Ø 2 – vyseknout před řezem',
    ),
  ].join('');
}

const header = (title: string, lines: string[]) =>
  [
    text(15, 16, `OBRAT ${OBRAT_REVISION} · ${title}`, 't'),
    ...lines.map((l, i) => text(15, 22 + i * 4, l)),
  ].join('');

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
  const gapL = fmt(spec.bandTopY - spec.flapEndY);
  const gapR = fmt(spec.bandTopY - flapEdgeY(spec, spec.width));

  const telo = svgA4(
    [
      header('LIST 1 · T1 záda a klopa', [
        'Tisk A4 na výšku, 100 %, bez přizpůsobení. Obě kontrolní úsečky musí měřit 50 mm.',
        'List přiložte na RUB kůže (šikmá hrana klopy pak stoupá doprava, jak má).',
      ]),
      drawPart(T1, 51, 36, spec, ['RUB nahoru', 'záda + klopa, 1 ×'], { x: 54, y: 100 }),
      cornerR(51, 36, spec.flapCornerR, -1, -1),
      cornerR(
        51 + T1.width,
        36 + flapEdgeY(spec, 0) - flapEdgeY(spec, spec.width),
        spec.flapCornerR,
        1,
        -1,
      ),
      cornerR(51, 36 + T1.height, spec.bodyCornerR, -1, 1),
      cornerR(51 + T1.width, 36 + T1.height, spec.bodyCornerR, 1, 1),
      text(166, 44, 'Šablona rohu klopy', 'h'),
      text(166, 48, 'karton, vystřihnout po plné', 'xs'),
      text(166, 51, 'čáře; lekce 9: oba rohy', 'xs'),
      text(166, 54, 'klopy po seříznutí', 'xs'),
      cornerTemplate(168, 58, spec.flapCornerR),
      text(166, 87, 'Ryska = začátek oblouku.', 'xs'),
      text(166, 90, 'Rovné hrany na bok', 'xs'),
      text(166, 93, 'a hranu klopy.', 'xs'),
      text(
        51 + 54,
        36 + T1.height + 6,
        `108 mm · klopa ${flapL} mm vlevo, ${flapR} mm vpravo od ohybu (s rezervou ${fmt(spec.flapTrimReserve)} mm)`,
        's',
        'middle',
      ),
      text(15, 196, 'Postup s listem', 'h'),
      text(
        15,
        201,
        '1. Řežte po plné čáře, klopa má rezervu. Ohyb a lepené pásy rýsujte jen na rubu.',
      ),
      text(15, 205, '2. Linii stehu veďte kružítkem 3,5 mm od hrany.'),
      text(
        15,
        209,
        `3. Klopu seřízněte až přes obsah (lekce 9): mezera nad pásem ${gapL} mm vlevo, ${gapR} mm vpravo.`,
      ),
      text(15, 213, '4. Potom ozdobný šev klopy 3,5 mm od hrany a objímka C podle obtisku.'),
      legend(15, 228),
      calibration(122, 280),
    ].join(''),
  );

  const dily = svgA4(
    [
      header('LIST 2 · T2, P, T3, K', [
        'Tisk A4 na výšku, 100 %, bez přizpůsobení. Obě kontrolní úsečky musí měřit 50 mm.',
        'T2 a T3 přiložte na LÍC, P a K na RUB. Otvory patic vysekněte skrz list i kůži.',
      ]),
      drawPart(parts.T2, 15, 36, spec, ['LÍC nahoru', 'přední stěna, 1 ×'], { x: 54, y: 34 }, [
        { x: 101, y: 30, t: 'konec P', anchor: 'end' },
        { x: 54, y: 52, t: 'rub: lepené pásy 6 mm podél švu jako na T1', anchor: 'middle' },
      ]),
      cornerR(15, 36 + parts.T2.height, spec.bodyCornerR, -1, 1),
      cornerR(15 + parts.T2.width, 36 + parts.T2.height, spec.bodyCornerR, 1, 1),
      cornerR(15 + parts.P.width, 122, spec.lidCornerR, 1, -1),
      cornerR(15 + parts.P.width, 122 + parts.P.height, spec.bodyCornerR, 1, 1),
      cornerR(15, 122 + parts.P.height, spec.bodyCornerR, -1, 1),
      text(
        15 + parts.P.width / 2,
        122 + parts.P.height + 4.5,
        'P: rohy u zářezu R1 a R1,5',
        'xs',
        'middle',
      ),
      text(15 + parts.T3.width + 3, 199 + parts.T3.height - 1, 'T3: rohy R2, u ústí R1', 'xs'),
      drawPart(parts.P, 15, 122, spec, ['RUB nahoru · pás + víčko, 1 ×'], { x: 30, y: 7 }, [
        { x: 104, y: 10, t: 'VÍČKO · objímka B podle obtisku', anchor: 'end' },
        { x: 106, y: 62, t: 'A podle obtisku', anchor: 'end' },
        { x: 47, y: 53, t: 'T3: lepit jen šrafu (pásy 4 mm a jazýček)', anchor: 'middle' },
      ]),
      text(15 + 3, 122 - 1.5, 'závěs (šije se s tělem)', 'xs'),
      text(15 + 108, 122 - 1.5, 'volný konec · A', 'xs', 'end'),
      drawPart(parts.T3, 15, 199, spec, ['LÍC nahoru', 'předek mincí, 1 ×'], { x: 21, y: 16 }),
      drawPart(parts.K, 15, 244, spec, []),
      drawPart(parts.K, 32, 244, spec, []),
      text(49, 252, 'K – kryt patice, 2 × (lekce 7)', 'xs'),
      text(130, 40, 'Pořadí', 'h'),
      ...[
        '1. P a T3 vyříznout, otvory vyseknout.',
        '2. Ústí T3 a víčko: hrany dokončit.',
        '3. Patice B do jazýčku T3.',
        '4. T3 přilepit na rub P do zelené',
        '    polohy, jen do šrafy.',
        '5. Šít U-šev a dělicí šev T3.',
        '6. Víčko ohnout k T3, B podle obtisku.',
        '7. T2: patice A a C, kryty K.',
        '8. Tělo: konec P na šrafu T2.',
        '',
        'Na líci nic nepropichujte:',
        'polohy a ohyby jen na rubu,',
        'otvory patic zmizí pod kováním.',
      ].map((t, i) => text(130, 46 + i * 4, t)),
      legend(130, 112),
      calibration(122, 280),
    ].join(''),
  );
  return { telo, dily };
}

/** Nákres pro aplikaci: zavřená, otevřené C, otevřené A s víčkem. Měřítko 2,4 px/mm. */
export function buildObratDrawing(spec: ObratSpec = OBRAT): string {
  const k = 2.4;
  const W = spec.width * k;
  const H = spec.height * k;
  const s = spec.seamOffset * k;
  const st = (d: string) => `<path d="${d}" class="st"/>`;
  const snap = (x: number, y: number, label: string, socket = false) =>
    `<circle cx="${x}" cy="${y}" r="${(spec.snapCap / 2) * k}" class="snap"/>${socket ? `<circle cx="${x}" cy="${y}" r="5" fill="#4a3620"/>` : ''}<text x="${x + 18}" y="${y + 5}" class="s">${label}</text>`;
  const flap = (x0: number, y0: number) => {
    const yl = y0 + spec.flapEndY * k;
    const yr = y0 + flapEdgeY(spec, spec.width) * k;
    const r = spec.flapCornerR * k;
    return `<path class="cut" d="M${x0} ${y0}H${x0 + W}V${yr - r}Q${x0 + W} ${yr} ${x0 + W - r} ${yr - 0.3}L${x0 + r} ${yl - 0.1}Q${x0} ${yl} ${x0} ${yl - r}Z"/>${st(`M${x0 + s} ${y0}V${yl - s}L${x0 + W - s} ${yr - s}V${y0}`)}`;
  };
  const band = (x0: number, y0: number) => {
    const by = y0 + spec.bandTopY * k;
    const [c0, c1, c2] = spec.cellSeams.map((c) => x0 + c * k);
    const mouth = y0 + spec.coinMouthY * k;
    const bot = y0 + (spec.height - spec.seamOffset) * k;
    return [
      `<rect class="cut" x="${x0}" y="${by}" width="${W}" height="${(spec.height - spec.bandTopY) * k}" rx="${spec.bodyCornerR * k}"/>`,
      st(`M${c0} ${mouth}V${bot}H${c2}V${mouth}`),
      st(`M${c1} ${y0 + (spec.coinMouthY + spec.seamEndGap) * k}V${bot}`),
      st(`M${x0 + W - s} ${by + 4}V${bot}`),
      snap(x0 + spec.snapA.x * k, y0 + spec.snapA.y * k, 'A'),
    ].join('');
  };
  const body = (x0: number, y0: number) =>
    `<rect class="cut" x="${x0}" y="${y0}" width="${W}" height="${H}" rx="${spec.bodyCornerR * k}"/>` +
    st(
      `M${x0 + s} ${y0 + spec.frontTopY * k}V${y0 + H - s}H${x0 + W - s}V${y0 + spec.frontTopY * k}`,
    );

  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="820" viewBox="0 0 1320 820">`,
    `<style>text{font-family:Arial,sans-serif;fill:#342a23}.h{font-size:22px;font-weight:bold}.t{font-size:16px}.s{font-size:14px}.cut{fill:#a9672f;stroke:#5e3519;stroke-width:2}.in{fill:#c58a52;stroke:#5e3519;stroke-width:2}.lid{fill:#b8783e;stroke:#5e3519;stroke-width:2}.st{fill:none;stroke:#f2d6ab;stroke-width:1.4;stroke-dasharray:5 4}.snap{fill:#d8b66b;stroke:#765a27;stroke-width:2}.coin{fill:#cfc4a0;stroke:#6f6a55;stroke-width:1.5}</style>`,
    `<rect width="1320" height="820" fill="#faf6ef"/>`,
    `<text x="40" y="44" class="h">OBRAT ${OBRAT_REVISION} · zjednodušená konstrukce</text>`,
    `<text x="40" y="70" class="t">Zavřená ${spec.width} × ${spec.height} mm · jedna useň ${fmt(spec.leather)} mm · střih 1:1 na listech 1 a 2 · prototyp zatím neověřený</text>`,
  ];
  // 01 zavřená
  let x0 = 40;
  let y0 = 230;
  out.push(
    `<text x="${x0}" y="${y0 - 110}" class="h">01 · zavřená</text>`,
    body(x0, y0),
    band(x0, y0),
    flap(x0, y0),
  );
  out.push(snap(x0 + spec.snapC.x * k, y0 + spec.snapC.y * k, 'C'));
  // 02 otevřené C
  x0 = 350;
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
    band(x0, y0),
    snap(x0 + spec.snapC.x * k, y0 + spec.snapC.y * k, 'C – patice'),
  );
  out.push(
    `<path class="cut" d="M${x0} ${y0}V${y0 - 70}Q${x0} ${y0 - 86} ${x0 + 16} ${y0 - 86}H${x0 + W - 16}Q${x0 + W} ${y0 - 86} ${x0 + W} ${y0 - 70}V${y0}Z"/>`,
    snap(x0 + spec.snapC.x * k, y0 - spec.snapC.y * k, 'C – objímka', true),
  );
  // 03 otevřené A, víčko otevřené
  x0 = 660;
  out.push(
    `<text x="${x0}" y="${y0 - 110}" class="h">03 · otevřené A a B</text>`,
    body(x0, y0),
    flap(x0, y0),
  );
  out.push(snap(x0 + spec.snapC.x * k, y0 + spec.snapC.y * k, 'C'));
  out.push(snap(x0 + spec.snapA.x * k, y0 + spec.snapA.y * k, 'A – patice'));
  const bx = x0 + W - s; // závěs
  const by = y0 + spec.bandTopY * k;
  const u = (x: number) => bx + (spec.width - x - spec.seamOffset) * k;
  const bh = (spec.height - spec.bandTopY) * k;
  out.push(`<rect class="in" x="${bx - s}" y="${by}" width="${W}" height="${bh}" rx="8"/>`);
  const s3 = spec.seamOffset;
  const [q0, , q2] = spec.cellSeams;
  const t3 = [
    [spec.coinTab.left, spec.coinMouthY],
    [q2 + s3, spec.coinMouthY],
    [q2 + s3, spec.height],
    [q0 - s3, spec.height],
    [q0 - s3, spec.coinTab.bottomY],
    [spec.coinTab.left, spec.coinTab.bottomY],
  ]
    .map(([x, y]) => `${u(x)} ${y0 + y * k}`)
    .join(' L');
  out.push(`<path d="M${t3} Z" fill="#b47640" stroke="#5e3519" stroke-width="1.5"/>`);
  const mouth = y0 + spec.coinMouthY * k;
  const bot = y0 + (spec.height - spec.seamOffset) * k;
  out.push(st(`M${u(spec.cellSeams[2])} ${mouth}V${bot}H${u(spec.cellSeams[0])}V${mouth}`));
  out.push(st(`M${u(spec.cellSeams[1])} ${mouth + spec.seamEndGap * k}V${bot}`));
  for (const cx of [42, 78])
    out.push(`<circle class="coin" cx="${u(cx)}" cy="${bot - 34}" r="30"/>`);
  out.push(snap(u(spec.snapB.x), y0 + spec.snapB.y * k, 'B – patice'));
  out.push(snap(u(spec.snapA.x), y0 + spec.snapA.y * k, 'A – objímka', true));
  // otevřené víčko nad pásem
  const lidH = (spec.lidBottomY - spec.bandTopY) * k;
  out.push(
    `<rect class="lid" x="${u(spec.lidEndX)}" y="${by - lidH}" width="${spec.lidEndX * k}" height="${lidH}" rx="6"/>`,
    snap(u(spec.snapB.x), by - (spec.snapB.y - spec.bandTopY) * k, 'B – objímka', true),
  );
  out.push(
    `<text x="${bx + 4}" y="${by + bh + 22}" class="s">závěs = pravý šev těla · víčko ohnuté z pásu</text>`,
  );

  // 04 díly a pořadí
  y0 = 530;
  out.push(
    `<path d="M40 ${y0 - 24}H1280" stroke="#c9bfae"/>`,
    `<text x="40" y="${y0}" class="h">04 · díly a pořadí</text>`,
  );
  [
    'T1 záda + klopa (1 ohyb) · T2 přední stěna s výkusem · P pás + víčko (1 ohyb) · T3 předek mincí · 2 × K kryt.',
    'Všechny díly z jedné usně 1,2 mm, rovné řezy a zaoblené rohy; všechny švy se šijí naplocho.',
    '1. Mincovní modul: patice B do jazýčku T3 → T3 přilepit a přišít na P → ohnout víčko → objímka B obtiskem.',
    '2. Patice A a C do T2, kryty K na rub. 3. T2 na T1, konec P do pravého švu, šít U-šev.',
    '4. Objímky C a A podle obtisku. 5. Zkoušky: C samo, A + B samo, třesení, tloušťka.',
    'Zavřený řez nad mincí: záda → obsah → T2 → víčko → T3 → mince → P (5 vrstev usně).',
    'Proti předloze 03: stejná klopa se šikmou hranou, C, pás se třemi poli a A; B je schovaný pod pásem.',
    'Jiné: šev závěsu na pravém boku pásu, horní hrana pásu je ohyb víčka. Nákres není střih.',
  ].forEach((l, i) => out.push(`<text x="40" y="${y0 + 34 + i * 28}" class="t">${esc(l)}</text>`));
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
  console.log('OBRAT R09: listy 1–2, nákres a kontrola uloženy. Fyzické ověření neprovedeno.');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();

/**
 * Bezpečný okraj tištěných listů pouzdra s mincí: odhad šířky textu (pro rozvržení bloků
 * zarovnaných k pravému okraji) a obalový obdélník všeho nakresleného v SVG listu (pro test, že
 * nic neleží blíž než 13 mm k hraně A4).
 *
 * Šířky znaků jsou z metrik Helvetiky (AFM, jednotky 1/1000 em), zaokrouhlené nahoru; neznámý
 * znak počítá jako široký (1 em), takže odhad je spíš větší než skutečnost. Ověřeno proti
 * getBBox v Chrome na všech listech: šířka o 0–17 % větší, nikde menší; svisle počítá s rámečkem
 * písma jako Chrome (1,02 em nad účaří, 0,3 em pod ním).
 */

/** Šířka znaku Helvetiky v em (jen znaky, které listy používají; ostatní 1 em). */
function charEm(ch: string): number {
  const base = ch.normalize('NFD')[0] ?? ch; // Č → C, ů → u (diakritika šířku nemění)
  if (/[il]/.test(base)) return 0.23;
  if (/[jI]/.test(base)) return 0.28;
  if (/[ftr]/.test(base)) return 0.34;
  if (base === 'm') return 0.84;
  if (base === 'w') return 0.73;
  if (/[a-z]/.test(base)) return 0.56;
  if (/[MW]/.test(base)) return 0.95;
  if (/[A-Z]/.test(base)) return 0.73;
  if (/[0-9]/.test(base)) return 0.56;
  if (base === ' ') return 0.28;
  if (/[.,:;·'!|]/.test(base)) return 0.28;
  if (/[()[\]/„“"–-]/.test(base)) return 0.56;
  if (/[=+×≥≤<>~]/.test(base)) return 0.59;
  if (base === '%') return 0.89;
  if (base === 'Ø') return 0.78;
  return 1;
}

/** Odhad šířky textu (mm) při velikosti písma `size` (mm); tučné o 8 % širší. */
export function estimateTextWidthMm(s: string, size: number, bold = false): number {
  let em = 0;
  for (const ch of s) em += charEm(ch);
  return em * size * (bold ? 1.08 : 1);
}

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface DrawnBox extends Box {
  /** Značka a začátek obsahu prvku – do chybové hlášky testu. */
  what: string;
}

/** Body oblouku SVG (endpoint parametrizace → střed), vzorkované po 2°. */
function arcPoints(
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  phiDeg: number,
  large: boolean,
  sweep: boolean,
  x2: number,
  y2: number,
): [number, number][] {
  if (rx === 0 || ry === 0) return [[x2, y2]];
  const phi = (phiDeg * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const xp = cos * dx + sin * dy;
  const yp = -sin * dx + cos * dy;
  let a = Math.abs(rx);
  let b = Math.abs(ry);
  const lambda = (xp * xp) / (a * a) + (yp * yp) / (b * b);
  if (lambda > 1) {
    a *= Math.sqrt(lambda);
    b *= Math.sqrt(lambda);
  }
  const num = a * a * b * b - a * a * yp * yp - b * b * xp * xp;
  const den = a * a * yp * yp + b * b * xp * xp;
  const coef = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (coef * (a * yp)) / b;
  const cyp = (coef * -(b * xp)) / a;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number): number =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (xp - cxp) / a, (yp - cyp) / b);
  let dt = ang((xp - cxp) / a, (yp - cyp) / b, (-xp - cxp) / a, (-yp - cyp) / b);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(2, Math.ceil(Math.abs(dt) / (Math.PI / 90)));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = t1 + (dt * i) / n;
    const ex = a * Math.cos(t);
    const ey = b * Math.sin(t);
    pts.push([cos * ex - sin * ey + cx, sin * ex + cos * ey + cy]);
  }
  return pts;
}

/** Všechny body cesty SVG (M L H V A Q Z, i relativní m l h v q). */
export function pathPoints(d: string): [number, number][] {
  const pts: [number, number][] = [];
  const tokens = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  const num = (): number => {
    const t = tokens[i++];
    if (t === undefined || Number.isNaN(Number(t))) throw new Error(`Cesta „${d}“: chybí číslo.`);
    return Number(t);
  };
  while (i < tokens.length) {
    const t = tokens[i];
    if (/[A-Za-z]/.test(t)) {
      cmd = t;
      i++;
      if (cmd === 'Z' || cmd === 'z') {
        x = sx;
        y = sy;
        continue;
      }
    }
    switch (cmd) {
      case 'M':
      case 'L':
        x = num();
        y = num();
        if (cmd === 'M') [sx, sy] = [x, y];
        pts.push([x, y]);
        break;
      case 'm':
      case 'l':
        x += num();
        y += num();
        if (cmd === 'm') [sx, sy] = [x, y];
        pts.push([x, y]);
        break;
      case 'H':
        x = num();
        pts.push([x, y]);
        break;
      case 'h':
        x += num();
        pts.push([x, y]);
        break;
      case 'V':
        y = num();
        pts.push([x, y]);
        break;
      case 'v':
        y += num();
        pts.push([x, y]);
        break;
      case 'Q': {
        // Kontrolní bod leží vně křivky, takže obal z něj je konzervativní.
        const qx = num();
        const qy = num();
        x = num();
        y = num();
        pts.push([qx, qy], [x, y]);
        break;
      }
      case 'q': {
        const qx = x + num();
        const qy = y + num();
        x += num();
        y += num();
        pts.push([qx, qy], [x, y]);
        break;
      }
      case 'A': {
        const rx = num();
        const ry = num();
        const rot = num();
        const large = num() !== 0;
        const sweep = num() !== 0;
        const nx = num();
        const ny = num();
        pts.push(...arcPoints(x, y, rx, ry, rot, large, sweep, nx, ny));
        x = nx;
        y = ny;
        break;
      }
      default:
        throw new Error(`Cesta „${d}“: příkaz ${cmd} test nezná.`);
    }
  }
  return pts;
}

const SKIP = new Set(['defs', 'clipPath', 'title', 'desc', 'pattern', 'mask', 'marker']);

/** Prvek SVG z jednoduchého parseru (listy generuje náš kód: bez CDATA, komentářů a entit kromě &amp; &lt;). */
interface Node {
  nodeName: string;
  attrs: Map<string, string>;
  parent: Node | null;
  children: Node[];
  text: string;
}

const decode = (t: string): string =>
  t
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

/** Strom prvků SVG (deklarace <?xml ?> se přeskočí). */
export function parseSvg(svg: string): Node {
  const top: Node = { nodeName: '#doc', attrs: new Map(), parent: null, children: [], text: '' };
  let cur = top;
  const re = /<\?[^>]*\?>|<(\/?)([A-Za-z][\w:-]*)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>|([^<]+)/g;
  for (const m of svg.matchAll(re)) {
    if (m[5] !== undefined) {
      cur.text += decode(m[5]);
      continue;
    }
    if (m[2] === undefined) continue; // <?xml ?>
    if (m[1] === '/') {
      if (cur.nodeName !== m[2]) throw new Error(`SVG: </${m[2]}> nezavírá <${cur.nodeName}>.`);
      cur = cur.parent ?? top;
      continue;
    }
    const attrs = new Map<string, string>();
    for (const a of (m[3] ?? '').matchAll(/([\w:-]+)="([^"]*)"/g)) attrs.set(a[1], decode(a[2]));
    const el: Node = { nodeName: m[2], attrs, parent: cur, children: [], text: '' };
    cur.children.push(el);
    if (m[4] !== '/') cur = el;
  }
  if (cur !== top) throw new Error(`SVG: neuzavřený <${cur.nodeName}>.`);
  const root = top.children.find((c) => c.nodeName === 'svg');
  if (!root) throw new Error('Není to SVG.');
  return root;
}

/** Text prvku včetně potomků (jako textContent). */
const textContent = (el: Node): string => el.text + el.children.map(textContent).join('');

/**
 * Obalové obdélníky všeho nakresleného v SVG listu (v mm = jednotkách viewBoxu), včetně
 * poloviny tloušťky čar a odhadu rozsahu textu (1,02 em nad účaří, 0,3 em pod ním).
 * Bílé pozadí přes celý list se nepočítá. Transformace listy nepoužívají – kdyby se objevila,
 * funkce selže, aby test potichu nepočítal špatné souřadnice.
 */
export function drawnBoxes(svg: string): { width: number; height: number; boxes: DrawnBox[] } {
  const root = parseSvg(svg);
  const vb = (root.attrs.get('viewBox') ?? '').split(/\s+/).map(Number);
  const [vx = 0, vy = 0, width = NaN, height = NaN] = vb;
  if (vx !== 0 || vy !== 0) throw new Error('List má posunutý viewBox.');
  const boxes: DrawnBox[] = [];
  const num = (el: Node, a: string, dflt = 0): number => {
    const v = el.attrs.get(a);
    return v === undefined ? dflt : Number(v);
  };
  const strokeHalf = (el: Node): number => {
    for (let e: Node | null = el; e && e !== root; e = e.parent) {
      if (e.attrs.get('stroke') === 'none') return 0;
      const sw = e.attrs.get('stroke-width');
      if (sw !== undefined) return Number(sw) / 2;
    }
    return 0;
  };
  const push = (el: Node, pts: [number, number][], pad: number, what: string): void => {
    if (pts.length === 0) return;
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    boxes.push({
      x0: Math.min(...xs) - pad,
      y0: Math.min(...ys) - pad,
      x1: Math.max(...xs) + pad,
      y1: Math.max(...ys) + pad,
      what: `<${el.nodeName}> ${what.slice(0, 60)}`,
    });
  };
  const walk = (el: Node): void => {
    if (SKIP.has(el.nodeName)) return;
    if (el.attrs.has('transform')) {
      throw new Error(`Prvek <${el.nodeName}> má transform – obal nelze spočítat.`);
    }
    const sw = strokeHalf(el);
    switch (el.nodeName) {
      case 'path': {
        const d = el.attrs.get('d') ?? '';
        push(el, pathPoints(d), sw, d);
        break;
      }
      case 'circle': {
        const cx = num(el, 'cx');
        const cy = num(el, 'cy');
        const r = num(el, 'r');
        push(
          el,
          [
            [cx - r, cy - r],
            [cx + r, cy + r],
          ],
          sw,
          `${cx} ${cy} r${r}`,
        );
        break;
      }
      case 'rect': {
        const x = num(el, 'x');
        const y = num(el, 'y');
        const w = num(el, 'width');
        const h = num(el, 'height');
        // Bílé pozadí celého listu není kresba.
        if (x === 0 && y === 0 && w >= width && h >= height) break;
        push(
          el,
          [
            [x, y],
            [x + w, y + h],
          ],
          sw,
          `${x} ${y} ${w}×${h}`,
        );
        break;
      }
      case 'line':
        push(
          el,
          [
            [num(el, 'x1'), num(el, 'y1')],
            [num(el, 'x2'), num(el, 'y2')],
          ],
          sw,
          '',
        );
        break;
      case 'text': {
        const s = textContent(el);
        const size = num(el, 'font-size', 3);
        const bold = el.attrs.get('font-weight') === 'bold';
        const w = estimateTextWidthMm(s, size, bold);
        const x = num(el, 'x');
        const y = num(el, 'y');
        const anchor = el.attrs.get('text-anchor') ?? 'start';
        const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
        // Bílý lem (paint-order stroke) přidá polovinu své tloušťky.
        const halo = el.attrs.has('stroke') ? sw : 0;
        push(
          el,
          [
            [x0, y - 1.02 * size],
            [x0 + w, y + 0.3 * size],
          ],
          halo,
          s,
        );
        break;
      }
      case 'svg':
      case 'g':
        break;
      default:
        throw new Error(`Prvek <${el.nodeName}> test nezná – doplň ho do drawnBoxes.`);
    }
    for (const c of el.children) walk(c);
  };
  walk(root);
  return { width, height, boxes };
}

/** Prvky, které zasahují blíž než `safe` mm k některé hraně listu. */
export function outsideSafeArea(svg: string, safe: number): DrawnBox[] {
  const { width, height, boxes } = drawnBoxes(svg);
  const eps = 1e-6;
  return boxes.filter(
    (b) =>
      b.x0 < safe - eps ||
      b.y0 < safe - eps ||
      b.x1 > width - safe + eps ||
      b.y1 > height - safe + eps,
  );
}

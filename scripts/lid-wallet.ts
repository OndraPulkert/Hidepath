/**
 * Vykreslí 1:1 výrobní střih peněženky VÍČKO (docs/zadani/penezenka-vicko.md) do SVG a PDF.
 *
 *   pnpm pattern:wallet-lid
 *
 * Listy (A4 na výšku, 1:1, v každém SVG vrstvy CUT / STITCH / FOLD / GLUE / GUIDE):
 * 1. penezenka-vicko-sablona – pás P1 z LÍCE: obrys, okénka mincí, švy S1–S3 a S6, ohyb dna,
 *    přehyby závěsu, pás ohybu a pás závěsu (ztenčení jen v záloze), okénko bankovek (řeže se až
 *    po lepení G3), značky,
 * 2. penezenka-vicko-rub – pás P1 z RUBU: lepené plochy G1–G4, poloha D1, D2 a plíšku,
 * 3. penezenka-vicko-dily – přepážky D1 a D2, podšívka L1, plíšek K2,
 * 4. penezenka-vicko-pripravky – šablona konce jazýčku s otvory S7, šablony okének a plíšku, proužek
 *    otvorů bočních švů, vložka dna a tvarování závěsu přes obsah (Kolo 9, bez kopyta).
 * Přepínače záloh (Kolo 6): --p1 0.8, --skive-fold 0.6, --skive-hinge 0.6; změřená tloušťka přepážek
 * a podšívky (Kolo 9): --divider 0.8, --lining 0.9 – listy s příponou v názvu.
 * Všechny listy jsou i v penezenka-vicko-vse.pdf. Geometrie je celá v
 * src/lib/geometry/lid-wallet.ts; tady se jen kreslí.
 *
 * NÁVRH k ověření na prototypu: nejdřív papírový model P0, zkouška ohybu V12 a zkušební kus
 * z levné kůže (oddíl 9, krok 0 a oddíl 11).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  DEFAULT_LID_WALLET,
  type LidWalletSpec,
  fmt,
  lidWalletLayout,
  lidWalletVariant,
} from '../src/lib/geometry/lid-wallet.ts';
import {
  LID_FILE_STEM,
  LID_P1_RANGE_MM,
  LID_SKIVE_RANGE_MM,
  LID_THIN_LEATHER_RANGE_MM,
  buildLidSheets,
} from '../src/lib/patterns/lid-wallet-sheets.ts';

export {
  COLORS,
  LID_THIN_LEATHER_RANGE_MM,
  HOLE_R,
  LAYERS,
  LID_FILE_STEM,
  buildLidBackSvg,
  buildLidJigsSvg,
  buildLidPartsSvg,
  buildLidSheetSvg,
  buildLidSheets,
  p1Outline,
} from '../src/lib/patterns/lid-wallet-sheets.ts';

const f = (n: number): string => (Math.round(n * 1000) / 1000).toString();
const cz = fmt;
/** Tloušťka usně vždy na 1 desetinné místo (1,0 / 0,8), jako v dokumentu. */
const czT = (v: number): string => v.toFixed(1).replace('.', ',');

/** Hodnota přepínače `--name value` nebo `--name=value`; undefined, když přepínač chybí. */
function argValue(args: string[], name: string): string | undefined {
  const eq = args.find((a) => a.startsWith(`${name}=`));
  if (eq !== undefined) return eq.slice(name.length + 1);
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  return args[i + 1] ?? '';
}

/** Desetinné číslo v mm z přepínače (tečka i čárka), v mezích; undefined, když chybí. */
function readMm(args: string[], name: string, min: number, max: number): number | undefined {
  const raw = argValue(args, name);
  if (raw === undefined) return undefined;
  const value = /^\d+([.,]\d+)?$/.test(raw) ? Number(raw.replace(',', '.')) : Number.NaN;
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} potřebuje číslo mezi ${cz(min)} a ${cz(max)} mm (dostal „${raw}“).`);
  }
  return value;
}

const KNOWN_FLAGS = ['--p1', '--skive-fold', '--skive-hinge', '--divider', '--lining'] as const;

/**
 * Přepínače záloh (oddíl 13, Kolo 6): `--p1 0.8` = záloha A (celý P1 z usně 0,8), `--skive-fold
 * 0.6` / `--skive-hinge 0.6` = záloha B (ztenčení ohybu dna / závěsu). Od Kola 9 změřená tloušťka
 * koupené usně: `--divider 0.8` (D1 i D2, zadává se větší z obou) a `--lining 0.9` (L1). Bez
 * přepínačů výchozí střih. Neznámý přepínač = chyba, aby překlep potichu nepřepsal verzovaný
 * výchozí střih.
 */
export function lidSpecFromArgs(rawArgs: string[]): { spec: LidWalletSpec; suffix: string } {
  // `pnpm pattern:wallet-lid -- --p1 0.8` (zvyk z npm): pnpm 10 předá samotné „--“ doslova.
  const args = rawArgs.filter((a) => a !== '--');
  const repeated = KNOWN_FLAGS.filter(
    (flag) => args.filter((a) => a === flag || a.startsWith(`${flag}=`)).length > 1,
  );
  if (repeated.length > 0) {
    throw new Error(`Přepínač zadaný víckrát: ${repeated.join(', ')}. Zadej každý nejvýš jednou.`);
  }
  const bad = args.filter((a, i) => {
    if (a.startsWith('--')) return !(KNOWN_FLAGS as readonly string[]).includes(a.split('=')[0]);
    const prev = args[i - 1];
    return !(prev !== undefined && (KNOWN_FLAGS as readonly string[]).includes(prev));
  });
  if (bad.length > 0) {
    throw new Error(`Neznámý přepínač: ${bad.join(' ')}. Povolené: ${KNOWN_FLAGS.join(', ')}.`);
  }
  const p1 = readMm(args, '--p1', ...LID_P1_RANGE_MM);
  const fold = readMm(args, '--skive-fold', ...LID_SKIVE_RANGE_MM);
  const hinge = readMm(args, '--skive-hinge', ...LID_SKIVE_RANGE_MM);
  const [thinMin, thinMax] = LID_THIN_LEATHER_RANGE_MM;
  const divider = readMm(args, '--divider', thinMin, thinMax);
  const lining = readMm(args, '--lining', thinMin, thinMax);
  const spec = lidWalletVariant({
    ...(p1 !== undefined ? { p1Mm: p1 } : {}),
    ...(fold !== undefined ? { bottomFoldSkiveMm: fold } : {}),
    ...(hinge !== undefined ? { hingeSkiveMm: hinge } : {}),
    ...(divider !== undefined ? { dividerMm: divider } : {}),
    ...(lining !== undefined ? { liningMm: lining } : {}),
  });
  const tag = (n: number): string => f(n).replace('.', '-');
  // Hodnota rovná výchozímu střihu (např. --p1 1) je výchozí střih: bez přípony, ať nevznikne
  // kopie výchozích listů pod jiným jménem.
  const suffix = [
    p1 !== undefined && Math.abs(p1 - DEFAULT_LID_WALLET.leatherMm) > 1e-9 ? `-p1-${tag(p1)}` : '',
    fold !== undefined ? `-ohyb-${tag(fold)}` : '',
    hinge !== undefined ? `-zaves-${tag(hinge)}` : '',
    divider !== undefined && Math.abs(divider - DEFAULT_LID_WALLET.dividerMm) > 1e-9
      ? `-d-${tag(divider)}`
      : '',
    lining !== undefined && Math.abs(lining - DEFAULT_LID_WALLET.liningMm) > 1e-9
      ? `-l1-${tag(lining)}`
      : '',
  ].join('');
  return { spec, suffix };
}

async function main(): Promise<void> {
  const { spec, suffix } = lidSpecFromArgs(process.argv.slice(2));
  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/generated');
  mkdirSync(outDir, { recursive: true });
  // Varianta (záloha) se zapíše pod vlastním jménem, verzovaný výchozí střih zůstane.
  const sheets = buildLidSheets(spec).map((q) => ({
    ...q,
    name: q.name.replace(LID_FILE_STEM, `${LID_FILE_STEM}${suffix}`),
  }));
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome' });
  const pageCss =
    '<style>@page{size:A4 portrait;margin:0}html,body{margin:0;padding:0}' +
    '.s{width:210mm;height:297mm;overflow:hidden;page-break-after:always;break-after:page}</style>';
  const pdf = async (html: string, path: string): Promise<void> => {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path,
      width: '210mm',
      height: '297mm',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
  };
  for (const { name, svg } of sheets) {
    writeFileSync(resolve(outDir, `${name}.svg`), svg, 'utf8');
    await pdf(`${pageCss}<div class="s">${svg}</div>`, resolve(outDir, `${name}.pdf`));
    console.log(`Zapsáno docs/generated/${name}.svg + .pdf (A4 na výšku, 100 %)`);
  }
  await pdf(
    pageCss + sheets.map(({ svg }) => `<div class="s">${svg}</div>`).join(''),
    resolve(outDir, `${LID_FILE_STEM}${suffix}-vse.pdf`),
  );
  console.log(`Zapsáno docs/generated/${LID_FILE_STEM}${suffix}-vse.pdf (všechny listy)`);
  await browser.close();
  const L = lidWalletLayout(spec);
  console.log(
    `P1 ${cz(L.widthMm)} × ${cz(L.p1LengthMm)} mm, hotový kus ${cz(L.widthMm)} × ${cz(L.heightMm)} × ${cz(L.thicknessMaxMm)} mm, ` +
      `${L.holesTotal} otvorů, magnet ve stavu B y ${cz(L.magnetYB)}, plíšek y ${cz(L.plate.y0)}–${cz(L.plate.y1)}, ` +
      `ohyb dna ${czT(L.bottomFoldMm)}, závěs ${czT(L.hingeMm)}, přepážky ${cz(spec.dividerMm)}, L1 ${cz(spec.liningMm)}, ` +
      `hrana vložky dna v ${cz(L.v.insertEdge)}.`,
  );
}

const invokedAsScript =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) {
  try {
    await main();
  } catch (e) {
    // Kontroly modelu a přepínačů hlásí česky, co neplatí; bez výpisu zásobníku.
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}

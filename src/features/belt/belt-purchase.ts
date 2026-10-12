import { formatDecimal } from '@/features/notebook/values';
import {
  BELT_LIMITS,
  type BeltConfigResult,
  type ChicagoScrewOption,
  PRONG_SOURCE_LABELS,
  type VerifiedBuckle,
  isVerifiedPunchMm,
  verifiedBuckles,
} from '@/lib/patterns/belt-config';
import {
  EDGE_PAINT_URLS,
  STRAP_COLOR_LABELS,
  type StrapOffer,
  defaultStrapOffer,
  isDyedStrap,
  strapOffers,
  strapOfferCaveat,
} from '@/lib/patterns/belt-strap-offers';
import { type KeeperCalculation, keeperStripText } from '@/lib/patterns/belt-keeper';
import { formatCzk } from '@/lib/utils/format';

/**
 * „Koupit“ nahoře na stránce „Váš pásek“: pás (šířka, tloušťka, nejkratší délka a délka,
 * kterou doporučená nabídka opravdu prodává), přezka, šrouby, výsečníky a doporučený obchod.
 * Čisté funkce bez Reactu; čísla jsou z výpočtu `deriveBeltConfig`.
 */

/**
 * Odřezek na trénink z téhož pásu (lekce 1, krok „Objednejte“; lekce 2 ho uřízne): pás musí být
 * o 15 cm delší než nejkratší délka.
 */
export const SCRAP_ALLOWANCE_CM = 15;

/** Délky hotových pásů, které obchody prodávají nejčastěji (130 cm, Andexnite i 140 cm). */
export const COMMON_STRAP_LENGTHS_CM = [130, 140] as const;

/**
 * Z čeho se skládá délka pásu: pásek, kus na poutko z téhož řemene a odřezek na trénink.
 * Obojí navíc se přičítá; `null` bez obvodu.
 */
export interface StrapLengthPlan {
  beltCm: number | null;
  /** Kus na poutko z téhož řemene (0 = poutko z jiné kůže). */
  keeperCm: number;
  /** Odřezek na trénink z téhož řemene (0 = samostatný odřezek). */
  scrapCm: number;
  /** Pásek + poutko. */
  beltAndKeeperCm: number | null;
  /** Pásek + poutko + odřezek: kolik pás musí mít. */
  neededCm: number | null;
}

export function strapLengthPlan(
  result: BeltConfigResult,
  { scrapFromStrap = false }: { scrapFromStrap?: boolean } = {},
): StrapLengthPlan {
  const beltCm = result.strap.minLengthCm;
  const keeperCm = result.strap.keeperPieceCm;
  const scrapCm = scrapFromStrap ? SCRAP_ALLOWANCE_CM : 0;
  return {
    beltCm,
    keeperCm,
    scrapCm,
    beltAndKeeperCm: beltCm === null ? null : beltCm + keeperCm,
    neededCm: beltCm === null ? null : beltCm + keeperCm + scrapCm,
  };
}

/** Nejkratší běžná délka pásu (130 / 140 cm), která pokryje `cm`; `null`, když žádná. */
export function shortestCommonStrapCm(cm: number): number | null {
  return COMMON_STRAP_LENGTHS_CM.find((len) => cm <= len) ?? null;
}

/** „pás 130 cm nestačí“ / „pás 130 ani 140 cm nestačí“; `null`, když stačí 130 cm. */
function shortStrapText(cm: number): string | null {
  const [short, long] = COMMON_STRAP_LENGTHS_CM;
  if (cm <= short) return null;
  return cm <= long
    ? `pás ${short} cm nestačí, ${long} cm ano`
    : `pás ${short} ani ${long} cm nestačí`;
}

/**
 * Varování, když běžný pás 130 / 140 cm nepokryje pásek s poutkem z téhož řemene, nebo
 * k tomu odřezek na trénink. Jen když se k pásku něco přičítá (poutko nebo odřezek).
 */
export function strapLengthWarnings(
  plan: StrapLengthPlan,
  { orderCm = null }: { orderCm?: number | null } = {},
): string[] {
  const { beltCm, beltAndKeeperCm, neededCm } = plan;
  if (beltCm === null || beltAndKeeperCm === null || neededCm === null) return [];
  const warnings: string[] = [];
  if (plan.keeperCm > 0) {
    const short = shortStrapText(beltAndKeeperCm);
    if (short) {
      warnings.push(
        `Pásek ${beltCm} cm a poutko ${plan.keeperCm} cm potřebují ${beltAndKeeperCm} cm: ${short}.` +
          (beltAndKeeperCm > COMMON_STRAP_LENGTHS_CM[1]
            ? ' Kupte delší pás, nebo poutko udělejte z jiné kůže (vypněte „Poutko z téhož řemene“).'
            : ''),
      );
    }
  }
  if (plan.scrapCm > 0) {
    const short = shortStrapText(neededCm);
    if (short) {
      const without = shortestCommonStrapCm(beltAndKeeperCm);
      const what = plan.keeperCm > 0 ? 'pásek a poutko' : 'pásek';
      warnings.push(
        `S odřezkem na trénink ${plan.scrapCm} cm potřebujete ${neededCm} cm: ${short}.` +
          (neededCm > COMMON_STRAP_LENGTHS_CM[1]
            ? orderCm !== null && orderCm >= neededCm
              ? ` Objednejte delší pás (${orderCm} cm).`
              : without !== null
                ? ` Trénujte na samostatném odřezku (vypněte trénink na odřezku téhož řemene): na ${what} stačí pás ${without} cm.`
                : ' Trénujte na samostatném odřezku, nebo kupte delší pás.'
            : ''),
      );
    }
  }
  return warnings;
}

/**
 * Lekce 2: smí se odřezek na trénink uříznout z konce pásu? Zbytek = pás − pásek − poutko
 * z téhož řemene; na odřezek musí zbýt aspoň 15 cm. `strapCm` = délka pásu, který máte
 * (`scrapCheckStrapCm`); `null` bez obvodu nebo bez délky pásu.
 */
export interface ScrapCutCheck {
  strapCm: number;
  beltCm: number;
  keeperCm: number;
  leftoverCm: number;
  /** Zbude aspoň 15 cm. */
  canCut: boolean;
}

export function scrapCutCheck(
  result: BeltConfigResult,
  strapCm: number | null,
): ScrapCutCheck | null {
  const plan = strapLengthPlan(result);
  if (plan.beltCm === null || plan.beltAndKeeperCm === null || strapCm === null) return null;
  const leftoverCm = strapCm - plan.beltAndKeeperCm;
  return {
    strapCm,
    beltCm: plan.beltCm,
    keeperCm: plan.keeperCm,
    leftoverCm,
    canCut: leftoverCm >= SCRAP_ALLOWANCE_CM,
  };
}

/**
 * Délka pásu pro kontrolu odřezku v lekci 2: objednaná délka z „Koupit“ (i když se do ní odřezek
 * nevejde, `beltPurchase` doporučí pás na pásek a poutko), jinak nejkratší běžná délka 130 / 140 cm,
 * která pokryje pásek a poutko. `null` bez obvodu, nebo když nestačí ani 140 cm.
 */
export function scrapCheckStrapCm(p: BeltPurchase): number | null {
  if (p.orderCm !== null) return p.orderCm;
  return p.plan.beltAndKeeperCm === null ? null : shortestCommonStrapCm(p.plan.beltAndKeeperCm);
}

/** Věta pro lekci 2 (pod krokem): kolik zbývá a jestli konec řezat. */
export function scrapCutText(c: ScrapCutCheck): string {
  const keeper = c.keeperCm > 0 ? ` a poutku ${c.keeperCm} cm` : '';
  const rest = `Z pásu ${c.strapCm} cm po pásku ${c.beltCm} cm${keeper} zbývá ${c.leftoverCm} cm`;
  return c.canCut
    ? `${rest}: odřezek ${SCRAP_ALLOWANCE_CM} cm z konce u špičky uříznout můžete.`
    : `${rest}: konec na trénink neřežte${c.keeperCm > 0 ? ', je na poutko' : ''}. Trénujte na samostatném odřezku.`;
}

export interface BeltPurchase {
  widthMm: number;
  thicknessMm: number;
  /** Nejkratší délka pásu pro pásek; `null` bez obvodu. */
  minLengthCm: number | null;
  /** Kolik pás musí mít: nejkratší délka + kus na poutko z téhož řemene + případně 15 cm na odřezek. */
  neededCm: number | null;
  scrapFromStrap: boolean;
  /**
   * Odřezek na trénink z téhož řemene je zapnutý, ale s ním nestačí ani pás 140 cm a doporučená
   * nabídka není: doporučená nabídka a `orderCm` jsou pak jen pro pásek a poutko (bez odřezku).
   */
  scrapDropped: boolean;
  /** Skladba délky (pásek, poutko, odřezek). */
  plan: StrapLengthPlan;
  /** Pás 130 / 140 cm nepokryje pásek s poutkem (nebo s odřezkem). */
  lengthWarnings: string[];
  /** Poutko: z téhož řemene, nebo z jiné kůže. */
  keeper: KeeperCalculation;
  /**
   * Doporučená nabídka (výběr uživatele, jinak CraftPoint, jinak nejlevnější skladem s ověřeným
   * činěním; `defaultStrapOffer`).
   */
  offer: StrapOffer | null;
  /** Délka, kterou objednat: nejkratší, kterou doporučená nabídka prodává a která stačí. */
  orderCm: number | null;
  /** Všechny nabídky pro tuto délku, od nejlevnější (i doporučená). */
  offers: StrapOffer[];
  buckleWidthMm: number;
  /** Přezka této šířky je v podkladech (jinak „ověřte u prodejce“). */
  buckleVerified: boolean;
  /** Doporučená přezka (první s ověřeným jedním trnem); `null`, když žádná. */
  buckle: VerifiedBuckle | null;
  screws: {
    count: number;
    postMm: number | null;
    minMm: number;
    maxMm: number;
    /** Dřík uvádí stránka výrobku (jinak jen v názvu, „ověřte u prodejce“). */
    verified: boolean;
    /** Doporučený nýt (dřík v rozsahu, potvrzené první); `null`, když žádný. */
    pick: ChicagoScrewOption | null;
    /** Další nýty, jejichž dřík do rozsahu také padne. */
    alsoFit: ChicagoScrewOption[];
    /** Nýt je z jiného obchodu než doporučený pás: další zásilka a poštovné. */
    otherShop: boolean;
  };
  /** Výsečníky: Ø dírek pro trn a Ø otvorů pro nýty, vzestupně a bez opakování. */
  punchesMm: number[];
  /** Ø výsečníků, které podklady nemají (ověřte u prodejce). */
  unverifiedPunchesMm: number[];
  /** Barva pásu, když je barevný (pak i barva na hrany); jinak `null`. */
  dyedColor: string | null;
  /** Barva na hrany v tomto odstínu je v ověřených příkladech. */
  edgePaintVerified: boolean;
}

export function beltPurchase(
  result: BeltConfigResult,
  { scrapFromStrap = false }: { scrapFromStrap?: boolean } = {},
): BeltPurchase {
  const { input } = result;
  const color = input.color ?? 'prirodni';
  const minLengthCm = result.strap.minLengthCm;
  const plan = strapLengthPlan(result, { scrapFromStrap });
  const { neededCm } = plan;
  const withScrap = strapOffers(input.widthMm, input.thicknessMm, neededCm, color);
  // S odřezkem nestačí ani běžný pás 140 cm a doporučená nabídka není: doporučit pás na pásek
  // a poutko, ať souhrn neztratí nabídku, která na pásek stačí (trénuje se pak na samostatném
  // odřezku, varování to řekne).
  const fallback =
    scrapFromStrap &&
    defaultStrapOffer(withScrap) === null &&
    neededCm !== null &&
    neededCm > COMMON_STRAP_LENGTHS_CM[1] &&
    plan.beltAndKeeperCm !== null
      ? strapOffers(input.widthMm, input.thicknessMm, plan.beltAndKeeperCm, color)
      : null;
  const scrapDropped = fallback !== null && defaultStrapOffer(fallback) !== null;
  const offers = scrapDropped && fallback ? fallback : withScrap;
  const offer = defaultStrapOffer(offers);
  const [screw, ...alsoFit] = result.rivet.options;
  const punches = [result.holes.diameterMm, result.buckleEnd.rivetHoleMm].sort((a, b) => a - b);
  const punchesMm = punches.filter((d, i) => i === 0 || Math.abs(d - punches[i - 1]!) > 1e-9);
  return {
    widthMm: input.widthMm,
    thicknessMm: input.thicknessMm,
    minLengthCm,
    neededCm,
    scrapFromStrap,
    scrapDropped,
    plan,
    lengthWarnings: strapLengthWarnings(plan, {
      orderCm: neededCm === null ? null : (offer?.lengthCm ?? null),
    }),
    keeper: result.keeper,
    offer,
    orderCm: neededCm === null ? null : (offer?.lengthCm ?? null),
    offers,
    buckleWidthMm: result.buckle.widthMm,
    buckleVerified: result.buckle.verified,
    buckle: verifiedBuckles(result.buckle.widthMm)[0] ?? null,
    screws: {
      count: 2,
      postMm: result.rivet.postMm,
      minMm: result.rivet.minMm,
      maxMm: result.rivet.maxMm,
      verified: result.rivet.verified !== null,
      pick: screw ?? null,
      alsoFit,
      otherShop: screw !== undefined && offer !== null && screw.shop !== offer.shop,
    },
    punchesMm,
    unverifiedPunchesMm: punchesMm.filter((d) => !isVerifiedPunchMm(d)),
    dyedColor: isDyedStrap(color) ? STRAP_COLOR_LABELS[color] : null,
    edgePaintVerified: EDGE_PAINT_URLS[color] !== undefined,
  };
}

const mm = (v: number) => `${formatDecimal(v)} mm`;

/** Co podklady nemají ověřené: řádek souhrnu to řekne, ne potichu. */
const VERIFY = ' (ověřte u prodejce)';

/** Řádek souhrnu: co (krátce) a podrobnost. */
export interface PurchaseLine {
  what: string;
  detail: string;
}

/** „Leatory 1/4" = 6,35 mm“ / „Andexnite 6,5 mm“: obchod a dřík, palce přepočtené. */
const screwSize = (o: ChicagoScrewOption): string =>
  `${o.shop} ${o.inch ? `${o.inch} = ` : ''}${mm(o.postMm)}`;

/**
 * Nýty podle změřené tloušťky: počet a dřík, doporučený výrobek (jen s dříkem v rozsahu
 * 2t − 1,5 … 2t − 1 mm), jiný obchod než pás, a co dalšího do rozsahu padne.
 */
export function screwDetail(p: BeltPurchase): string {
  const s = p.screws;
  const range = `${formatDecimal(s.minMm)}–${mm(s.maxMm)}`;
  if (s.pick === null) return `${s.count} ks, dřík ${range}${VERIFY}`;
  const parts = [
    `${s.count} ks, dřík ${mm(s.pick.postMm)} (rozsah ${range}): ${s.pick.product}${s.pick.confirmed ? '' : ', ověřte u prodejce'}`,
  ];
  if (s.otherShop) parts.push(`jiný obchod než pás (${p.offer!.shop}), další poštovné`);
  if (s.alsoFit.length > 0) parts.push(`sedí i ${s.alsoFit.map(screwSize).join(', ')}`);
  return parts.join('; ');
}

/**
 * „aspoň 114 cm + 14 cm na poutko + 15 cm na odřezek = 143 cm“; bez přídavků „aspoň 114 cm“.
 * Bez obvodu prázdné.
 */
export function strapLengthText(plan: StrapLengthPlan): string {
  if (plan.beltCm === null) return '';
  const parts = [
    ...(plan.keeperCm > 0 ? [`${plan.keeperCm} cm na poutko`] : []),
    ...(plan.scrapCm > 0 ? [`${plan.scrapCm} cm na odřezek`] : []),
  ];
  return parts.length === 0
    ? `aspoň ${plan.beltCm} cm`
    : `aspoň ${plan.beltCm} cm + ${parts.join(' + ')} = ${plan.neededCm} cm`;
}

/** Souhrn k zobrazení, česky a krátce. */
export function purchaseLines(p: BeltPurchase): PurchaseLine[] {
  const { min, max } = BELT_LIMITS.thicknessMm;
  // Odřezek se nevejde (`scrapDropped`): řádek ukáže jen pásek a poutko, ať nežádá víc, než
  // se pak objednává; že trénink na téže kůži nejde, řekne poznámka v závorce.
  const shownPlan: StrapLengthPlan = p.scrapDropped
    ? { ...p.plan, scrapCm: 0, neededCm: p.plan.beltAndKeeperCm }
    : p.plan;
  const length =
    p.minLengthCm === null ? 'délka: zadejte obvod' : `délka ${strapLengthText(shownPlan)}`;
  const order =
    p.orderCm === null
      ? ''
      : ` → objednejte ${p.orderCm} cm${p.scrapDropped ? ' (odřezek na trénink se nevejde, trénujte na samostatném)' : ''}`;
  const lines: PurchaseLine[] = [
    {
      what: p.dyedColor ? `Řemen (${p.dyedColor})` : 'Řemen',
      detail: `${mm(p.widthMm)} široký, tloušťka ${mm(p.thicknessMm)} (postup: ${formatDecimal(min)}–${mm(max)}), ${length}${order}`,
    },
    {
      what: 'Poutko',
      detail: p.keeper.fromStrap
        ? `z téhož řemene: kus ${p.keeper.pieceCm} cm, proužek ${keeperStripText(p.keeper)}`
        : `z jiné kůže ${mm(p.keeper.thicknessMm)} v barvě pásu: proužek ${keeperStripText(p.keeper)}, pás se neprodlužuje`,
    },
    {
      what: 'Přezka',
      detail: p.buckle
        ? `${mm(p.buckleWidthMm)}, jednotrnová: ${p.buckle.product} (${PRONG_SOURCE_LABELS[p.buckle.prong]})`
        : `${mm(p.buckleWidthMm)}, jednotrnová${VERIFY}`,
    },
    {
      what: 'Šrouby chicago',
      detail: screwDetail(p),
    },
    {
      what: 'Výsečník',
      detail:
        p.punchesMm.map((d) => `Ø ${formatDecimal(d)}`).join(' a ') +
        ' mm' +
        (p.unverifiedPunchesMm.length > 0
          ? ` (Ø ${p.unverifiedPunchesMm.map((d) => formatDecimal(d)).join(' a ')} mm ověřte u prodejce)`
          : ''),
    },
  ];
  if (p.dyedColor) {
    lines.push({
      what: 'Barva na hrany',
      detail: p.edgePaintVerified
        ? p.dyedColor
        : `${p.dyedColor}: ověřenou v tomto odstínu nemáme, odstín ověřte u prodejce a na odřezku`,
    });
  }
  return lines;
}

/** „Doporučeno: CraftPoint 284 Kč“, nebo proč doporučení není. */
export function recommendedOfferText(p: BeltPurchase): string {
  if (p.offer) {
    const caveat = strapOfferCaveat(p.offer);
    return `Doporučeno: ${p.offer.shop}, ${p.offer.lengthCm} cm, ${formatCzk(p.offer.priceCents)}${caveat ? ` (${caveat})` : ''}`;
  }
  return p.offers.length > 0
    ? 'Doporučený obchod není: skladem s ověřeným činěním nic, nabídky k ověření jsou níže'
    : 'Ověřenou nabídku pro tento pás nemáme, ověřte u prodejce';
}

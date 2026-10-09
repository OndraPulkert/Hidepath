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

export interface BeltPurchase {
  widthMm: number;
  thicknessMm: number;
  /** Nejkratší délka pásu pro pásek; `null` bez obvodu. */
  minLengthCm: number | null;
  /** Kolik pás musí mít: nejkratší délka, případně + 15 cm na odřezek. */
  neededCm: number | null;
  scrapFromStrap: boolean;
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
  const neededCm =
    minLengthCm === null ? null : minLengthCm + (scrapFromStrap ? SCRAP_ALLOWANCE_CM : 0);
  const offers = strapOffers(input.widthMm, input.thicknessMm, neededCm, color);
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

/** Souhrn k zobrazení, česky a krátce. */
export function purchaseLines(p: BeltPurchase): PurchaseLine[] {
  const { min, max } = BELT_LIMITS.thicknessMm;
  const length =
    p.minLengthCm === null
      ? 'délka: zadejte obvod'
      : p.scrapFromStrap
        ? `délka aspoň ${p.minLengthCm} cm + ${SCRAP_ALLOWANCE_CM} cm na odřezek = ${p.neededCm} cm`
        : `délka aspoň ${p.minLengthCm} cm`;
  const order = p.orderCm === null ? '' : ` → objednejte ${p.orderCm} cm`;
  const lines: PurchaseLine[] = [
    {
      what: p.dyedColor ? `Řemen (${p.dyedColor})` : 'Řemen',
      detail: `${mm(p.widthMm)} široký, tloušťka ${mm(p.thicknessMm)} (postup: ${formatDecimal(min)}–${mm(max)}), ${length}${order}`,
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

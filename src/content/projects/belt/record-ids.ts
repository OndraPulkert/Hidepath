/**
 * Id polí zápisníku pásku (projekt 04), ze kterých se předvyplňuje formulář „Váš pásek“
 * (`beltConfigPrefill`). Lekce je použijí v `records` a `recalls`, aby se id nerozešla.
 * Id musí být unikátní v projektu (kontroluje schéma).
 */
export const BELT_RECORD_IDS = {
  /** Šířka pásu = vnitřní světlost přezky, mm (celé číslo). */
  width: 'belt-width',
  /** Tloušťka pásu změřená posuvkou na řezu, mm. */
  thickness: 'belt-thickness',
  /** Obvod: ohyb u přezky → nošená dírka, cm. */
  waist: 'belt-waist',
  /** Volba konce: hodnoty `BELT_TIP_CHOICES`. */
  tip: 'belt-tip',
  /** Trn přezky u kořene, mm. Dírka = trn + 0,5 mm. */
  prong: 'belt-prong',
  /** Barva pásu: hodnoty `StrapColor` (src/lib/patterns/belt-strap-offers.ts). */
  color: 'belt-color',
} as const;

export type BeltRecordId = (typeof BELT_RECORD_IDS)[keyof typeof BELT_RECORD_IDS];

/** Hodnoty volby `tip` (stejné jako `BeltTip` v src/lib/patterns/belt-config.ts). */
export const BELT_TIP_CHOICES = {
  hrot: 'hrot',
  zaobleny: 'zaobleny',
} as const;

/**
 * „Moje pásky“: každá uložená sestava je jeden zápis zápisníku s id `belt-config-<uuid>`
 * a hodnotou JSON (text do 2000 znaků, viz migrace `lesson_records`). Díky tomu se
 * synchronizuje s účtem bez nové tabulky. Do „Co jsem zjistil“ se nedostane – zobrazují se
 * jen pole, která obsah lekcí zná.
 */
export const BELT_CONFIG_FIELD_PREFIX = 'belt-config-';

/** Lekce, ke které se uložené pásky v zápisníku vážou (jen metadata zápisu). */
export const BELT_CONFIG_LESSON_SLUG = 'vas-pasek';

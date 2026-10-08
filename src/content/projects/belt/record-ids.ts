/**
 * Starší id polí zápisníku pásku (projekt 04). Parametry pásku se dřív zapisovaly v lekci 1;
 * teď je jediným místem pro ně stránka „Váš pásek“ (uložené pásky níže). Id tu zůstávají jen
 * kvůli převodu starých zápisů na uložený pásek (`legacyBeltOffer`), lekce je už nepoužívají.
 */
export const LEGACY_BELT_RECORD_IDS = {
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

/** Hodnoty volby konce (stejné jako `BeltTip` v src/lib/patterns/belt-config.ts). */
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

/**
 * Aktivní pásek: zápis zápisníku, jehož hodnota je id pole zvoleného pásku
 * (`belt-config-<uuid>`). Synchronizuje se s účtem jako ostatní zápisy, takže volba platí
 * i v dílně na telefonu. Bez zápisu (nebo když pásek mezitím zmizel) je aktivní naposledy
 * uložený pásek.
 */
export const BELT_ACTIVE_FIELD_ID = 'belt-active';

/** Lekce, ke které se uložené pásky v zápisníku vážou (jen metadata zápisu). */
export const BELT_CONFIG_LESSON_SLUG = 'vas-pasek';

/** Lekce 1, krok `plate-check`: výsledek kontroly destičky (výsledek zkoušky, zůstává v zápisníku). */
export const BELT_PLATE_CHECK_ID = 'plate-check';
export const BELT_PLATE_CHECK = { ok: 'ok', deviation: 'deviation' } as const;

/**
 * Stará volba lekce 1 „Čím budete značit“: zachycovala totéž co kontrola destičky a tabulka
 * „Váš pásek“. Teď se odvozuje (`beltMarking`); `sheets` bez zapsané kontroly destičky se čte
 * jako odchylka destičky.
 */
export const LEGACY_BELT_MARKING_ID = 'belt-marking';
export const LEGACY_BELT_MARKING = { plate: 'plate', sheets: 'sheets' } as const;

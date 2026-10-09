/**
 * Id polí zápisníku peněženky VÍČKO. Tloušťky, výsledky P0, k, magnet a zálohy se zadávají jen
 * ve formuláři „Listy pro vaši kůži“ (jediný zdroj, `LID_SHEETS_FIELD_ID`); v zápisníku lekcí
 * zůstávají jen výsledky zkoušek. Id musí být unikátní v projektu (kontroluje schéma).
 */
export const LID_RECORD_IDS = {
  /** Lekce 3, krok `inspect`: odchylka rysky rýhy od vrcholu ohybu V12, mm. */
  v12Offset: 'v12-offset',
  /**
   * Lekce 3, krok `decide`: výsledek zkoušky V12 (`LID_V12_RESULTS`). Id zůstává z doby, kdy
   * pole drželo i zvolenou variantu, aby staré zápisy platily dál.
   */
  v12Result: 'v12-variant',
  /** Lekce 11, krok `find-plate`: přeměřená značka magnetu od spodní hrany, mm. */
  magnetMarkY: 'magnet-mark-y',
  /** Lekce 12, krok `z2`: výsledek zkoušky závěsu (`LID_Z2_RESULTS`). */
  z2Result: 'z2-result',
} as const;

/**
 * Výsledek zkoušky V12. Hodnoty jsou ze staré volby varianty (`default` / `backup-a` /
 * `backup-b1`), takže staré zápisy znamenají totéž: nepopraskal / popraskal / popraskal i na
 * usni 0,8 nebo ta nejde sehnat.
 */
export const LID_V12_RESULTS = {
  ok: 'default',
  cracked: 'backup-a',
  crackedAgain: 'backup-b1',
} as const;

/** Výsledek zkoušky Z-2 (lekce 12). */
export const LID_Z2_RESULTS = {
  pass: 'pass',
  cracks: 'cracks-backup-a',
  cracksAgain: 'cracks-backup-b2',
  thumb: 'thumb',
} as const;

/**
 * Stav formuláře „Listy pro vaši kůži“: jeden zápis zápisníku s hodnotou JSON (text do 2000
 * znaků, viz migrace `lesson_records`), synchronizuje se s účtem bez nové tabulky. Do „Co jsem
 * zjistil“ se nedostane – zobrazují se jen pole, která obsah lekcí zná.
 */
export const LID_SHEETS_FIELD_ID = 'lid-sheets-input';

/** „Lekce“, ke které se stav formuláře v zápisníku váže (jen metadata zápisu). */
export const LID_SHEETS_LESSON_SLUG = 'listy-pro-vasi-kuzi';

/**
 * Starší id polí zápisníku, kam se hodnoty dřív zapisovaly v lekcích. Teď je jediným místem
 * formulář listů; id tu zůstávají jen kvůli převodu starých zápisů (`legacyLidOffer`), lekce je
 * už nepoužívají (hlídá test obsahu).
 */
export const LEGACY_LID_RECORD_IDS = {
  /** Lekce 1: tloušťka P1, mm. */
  p1Thickness: 'p1-thickness',
  /** Lekce 1: tloušťka přepážky D1, mm. */
  d1Thickness: 'd1-thickness',
  /** Lekce 1: tloušťka přepážky D2, mm. */
  d2Thickness: 'd2-thickness',
  /** Lekce 1: tloušťka podšívky L1, mm. */
  liningThickness: 'lining-thickness',
  /** Lekce 1: listy zkušebního kusu v mezích / mimo (`LEGACY_LID_SHEETS_LIMITS`). */
  sheetsOutsideLimits: 'sheets-outside-limits',
  /** Lekce 2 (P0-1): bankovky, mm. */
  billSheet: 'p0-bill-sheet',
  billHeightMin: 'p0-bill-height-min',
  billHeightMax: 'p0-bill-height-max',
  billHalfWidthMin: 'p0-bill-half-width-min',
  billHalfWidthMax: 'p0-bill-half-width-max',
  /** Lekce 2 (P0-3): k z papírového modelu. */
  p0K: 'p0-k',
  /** Lekce 2 (P0-6): zvednutí karet nad G2 a mincí nad G3a, mm. */
  cardLift: 'p0-card-lift',
  coinLift: 'p0-coin-lift',
  /** Lekce 3: změřená useň 0,8 na P1 v záloze A, mm. */
  p1BackupAThickness: 'p1-backup-a-thickness',
  /** Lekce 10: k na hotovém závěsu. */
  kMeasured: 'k-measured',
  /** Lekce 11: tloušťka magnetu Ø 8, mm. */
  magnetThickness: 'magnet-thickness',
} as const;

/** Hodnoty staré volby `sheetsOutsideLimits`. */
export const LEGACY_LID_SHEETS_LIMITS = {
  within: 'within-limits',
  outside: 'outside-limits',
} as const;

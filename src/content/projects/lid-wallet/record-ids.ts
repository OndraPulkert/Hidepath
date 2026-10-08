/**
 * Id polí zápisníku peněženky VÍČKO, ze kterých se předvyplňuje formulář „Listy pro vaši kůži“
 * (`lidGeneratorPrefill`). Obsah lekcí (`records` v krocích) i předvyplnění používají tyto
 * konstanty, aby se id nerozešla. Id musí být unikátní v projektu (kontroluje schéma).
 */
export const LID_RECORD_IDS = {
  /** Lekce 1, krok `measure`: tloušťka P1 (kaštan), mm. */
  p1Thickness: 'p1-thickness',
  /** Lekce 1, krok `measure`: tloušťka přepážky D1, mm. */
  d1Thickness: 'd1-thickness',
  /** Lekce 1, krok `measure`: tloušťka přepážky D2, mm. */
  d2Thickness: 'd2-thickness',
  /** Lekce 1, krok `measure`: tloušťka podšívky L1, mm. */
  liningThickness: 'lining-thickness',

  /** Lekce 2, krok `bills` (P0-1): tloušťka nejtlustší bankovky, mm. */
  billSheet: 'p0-bill-sheet',
  /** Lekce 2, krok `bills` (P0-1): výška bankovky, nejmenší a největší, mm. */
  billHeightMin: 'p0-bill-height-min',
  billHeightMax: 'p0-bill-height-max',
  /** Lekce 2, krok `bills` (P0-1): šířka bankovky složené napůl, nejmenší a největší, mm. */
  billHalfWidthMin: 'p0-bill-half-width-min',
  billHalfWidthMax: 'p0-bill-half-width-max',
  /** Lekce 2, krok `k` (P0-3): k z papírového modelu. */
  p0K: 'p0-k',
  /** Lekce 2, krok `coins-wedge` (P0-6): zvednutí svazku karet nad G2, mm. */
  cardLift: 'p0-card-lift',
  /** Lekce 2, krok `coins-wedge` (P0-6): zvednutí sloupce mincí nad G3a, mm. */
  coinLift: 'p0-coin-lift',

  /** Lekce 3, krok `inspect`: odchylka rysky rýhy od vrcholu ohybu V12, mm. */
  v12Offset: 'v12-offset',
  /** Lekce 3, krok `decide`: varianta střihu (výchozí / záloha A / záloha B1). */
  v12Variant: 'v12-variant',
  /** Lekce 3, krok `decide`: změřená tloušťka usně 0,8 na P1 v záloze A, mm. */
  p1BackupAThickness: 'p1-backup-a-thickness',

  /** Lekce 10, krok `measure-k`: k naměřené na hotovém ohybu. */
  kMeasured: 'k-measured',

  /** Lekce 12, krok `z2`: výsledek zkoušky závěsu (`cracks-backup-a` = finální kus v záloze A). */
  z2Result: 'z2-result',

  /** Lekce 11, krok `magnet-dry-test`: zvolená tloušťka magnetu Ø 8, mm. */
  magnetThickness: 'magnet-thickness',
} as const;

export type LidRecordId = (typeof LID_RECORD_IDS)[keyof typeof LID_RECORD_IDS];

/**
 * Hodnoty volby `v12Variant`. `backup-a` = celý P1 z usně 0,8 (do listů její změřená tloušťka);
 * `backup-b1` = ztenčit pás ohybu dna na 0,6 (`--skive-fold 0.6`).
 */
export const LID_V12_VARIANTS = {
  default: 'default',
  backupA: 'backup-a',
  backupB1: 'backup-b1',
} as const;

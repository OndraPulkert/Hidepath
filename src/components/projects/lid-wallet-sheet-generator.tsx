import { type FormEvent, useId, useState } from 'react';

import {
  type GeneratedPatternSheet,
  generatedSheetId,
  svgDataUrl,
} from '@/components/projects/generated-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { type PatternSheet } from '@/content/schema';
import { fmt } from '@/lib/geometry/lid-wallet';
import {
  DEFAULT_LID_GENERATOR_FORM,
  type LidGeneratorForm,
  type LidP0Fields,
  lidP0ModelValues,
  lidSheetsForMeasured,
  parseLidGeneratorForm,
} from '@/lib/patterns/lid-wallet-input';
import { LID_FILE_STEM } from '@/lib/patterns/lid-wallet-sheets';
import { typo } from '@/lib/utils/format';

const MODEL = lidP0ModelValues();

/** Pole P0 a magnetu: popisek a nápověda s hodnotou, se kterou počítá model. */
const P0_FIELDS: readonly { key: keyof LidP0Fields; label: string; hint: string }[] = [
  {
    key: 'k',
    label: 'k (P0-3, lekce 10)',
    hint: `Do ${fmt(MODEL.kMax)} listy platí, zadávat nemusíte.`,
  },
  {
    key: 'cardLift',
    label: 'Zvednutí karet nad G2 (P0-6), mm',
    hint: `Model počítá s ${fmt(MODEL.cardLiftMm)}.`,
  },
  {
    key: 'coinLift',
    label: 'Zvednutí mincí nad G3a (P0-6), mm',
    hint: `Model počítá s ${fmt(MODEL.coinLiftMm)}.`,
  },
  {
    key: 'billHeightMin',
    label: 'Výška bankovky nejmenší, mm',
    hint: `Model počítá s ${fmt(MODEL.billHeightMinMm)}.`,
  },
  {
    key: 'billHeightMax',
    label: 'Výška bankovky největší, mm',
    hint: `Model počítá s ${fmt(MODEL.billHeightMaxMm)}.`,
  },
  {
    key: 'billSheet',
    label: 'Tloušťka bankovky (nejtlustší), mm',
    hint: `Jedna nesložená bankovka. Model počítá s ${fmt(MODEL.billSheetMm)}.`,
  },
  {
    key: 'billHalfWidthMin',
    label: 'Šířka složené napůl nejmenší, mm',
    hint: `Model počítá s ${fmt(MODEL.billHalfWidthMinMm)}.`,
  },
  {
    key: 'billHalfWidthMax',
    label: 'Šířka složené napůl největší, mm',
    hint: `Model počítá s ${fmt(MODEL.billHalfWidthMaxMm)}.`,
  },
  {
    key: 'magnetThickness',
    label: 'Tloušťka magnetu Ø 8, mm (lekce 11)',
    hint: `Výchozí ${fmt(MODEL.magnetThicknessMm)}.`,
  },
];

/**
 * Listy peněženky Víčko pro změřenou kůži, vygenerované přímo v prohlížeči (lekce 1, krok 0(a)
 * návrhu). Výpočet i kreslení jsou v `src/lib` (stejný kód jako `pnpm pattern:wallet-lid`), tady
 * je jen formulář. Hotové listy předá stránce tisku jako další skupinu k zaškrtnutí.
 */
export function LidWalletSheetGenerator({
  baseSheets,
  onGenerated,
  initial,
}: {
  /** Listy výchozího střihu – z nich se převezme název, orientace a rozměr listu. */
  baseSheets: readonly PatternSheet[];
  onGenerated: (sheets: GeneratedPatternSheet[]) => void;
  /**
   * Předvyplnění ze zápisníku (`lidGeneratorPrefill`): hodnoty formuláře a co se předvyplnilo.
   * Čte se jen při prvním vykreslení; pak formulář patří uživateli.
   */
  initial?: { form: LidGeneratorForm; filled: readonly string[] } | null | undefined;
}) {
  const id = useId();
  // Předvyplnění platí jen pro první vykreslení – poznámka musí sedět k hodnotám ve formuláři,
  // i když se zápisník mezitím znovu načte.
  const [prefilled] = useState(initial);
  const start = prefilled?.form ?? DEFAULT_LID_GENERATOR_FORM;
  const [p1, setP1] = useState(start.p1);
  const [divider, setDivider] = useState(start.divider);
  const [lining, setLining] = useState(start.lining);
  const [skiveFold, setSkiveFold] = useState(start.skiveFold);
  const [skiveHinge, setSkiveHinge] = useState(start.skiveHinge);
  const [p0Fields, setP0Fields] = useState<LidP0Fields>(start.p0);
  const [problems, setProblems] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);
  const p0Prefilled = Object.values(start.p0).some((v) => v !== '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(null);
    const parsed = parseLidGeneratorForm({
      p1,
      divider,
      lining,
      skiveFold,
      skiveHinge,
      p0: p0Fields,
    });
    if ('problems' in parsed) {
      setProblems(parsed.problems);
      return;
    }
    const result = lidSheetsForMeasured(parsed.input);
    if (!result.ok) {
      setProblems(result.problems);
      return;
    }
    setProblems([]);
    const variant = `Pro změřenou kůži: ${result.label}`;
    const sheets = result.sheets.flatMap((s): GeneratedPatternSheet[] => {
      const base = baseSheets.find((b) => `${LID_FILE_STEM}-${b.id}` === s.name);
      if (!base) return [];
      return [
        {
          id: generatedSheetId(base.id),
          title: base.title,
          note: 'Vygenerováno v aplikaci pro zadané tloušťky. Čísla pro postup jsou v rámečku na listu 4.',
          orientation: base.orientation,
          widthMm: base.widthMm,
          heightMm: base.heightMm,
          variant,
          url: svgDataUrl(s.svg),
        },
      ];
    });
    onGenerated(sheets);
    setDone(result.label);
  };

  return (
    <Card className="mb-8 flex flex-col gap-4" aria-labelledby={`${id}-title`}>
      <div>
        <h2 id={`${id}-title`} className="text-h2">
          Listy pro vaši kůži
        </h2>
        <p className="mt-1 max-w-prose text-body text-ink-2">
          {typo(
            'Zadejte, co jste naměřili posuvkou (lekce 1). Aplikace spočítá a nakreslí všechny 4 listy stejně jako generátor v repozitáři a zkontroluje, že střih s touto kůží platí. Zálohy zaškrtněte, jen když je vybrala zkouška ohybu V12 nebo zkušební kus.',
          )}
        </p>
      </div>
      {prefilled && prefilled.filled.length > 0 ? (
        <p
          role="note"
          className="rounded-control border border-forest bg-forest-tint px-4 py-3 text-body"
        >
          <span className="font-medium">Předvyplněno ze zápisníku:</span>{' '}
          {typo(prefilled.filled.join(', '))}. Před generováním hodnoty zkontrolujte.
        </p>
      ) : null}
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor={`${id}-p1`}>P1 (kaštan), mm</Label>
            <Input
              id={`${id}-p1`}
              inputMode="decimal"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              aria-describedby={`${id}-p1-hint`}
            />
            <p id={`${id}-p1-hint`} className="mt-1 text-meta text-ink-2">
              {typo(
                'Liší-li se od 1,0 o méně než 0,05 mm, platí výchozí 1,0. V záloze A zadejte změřenou useň 0,8.',
              )}
            </p>
          </div>
          <div>
            <Label htmlFor={`${id}-divider`}>Přepážky D1/D2, mm</Label>
            <Input
              id={`${id}-divider`}
              inputMode="decimal"
              value={divider}
              onChange={(e) => setDivider(e.target.value)}
              aria-describedby={`${id}-divider-hint`}
            />
            <p id={`${id}-divider-hint`} className="mt-1 text-meta text-ink-2">
              {typo('Větší z D1 a D2. Nad 0,92 mm střih nejde.')}
            </p>
          </div>
          <div>
            <Label htmlFor={`${id}-lining`}>Podšívka L1, mm</Label>
            <Input
              id={`${id}-lining`}
              inputMode="decimal"
              value={lining}
              onChange={(e) => setLining(e.target.value)}
            />
          </div>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-meta font-medium text-ink-2">
            Záloha B (jen podle V12 nebo zkušebního kusu)
          </legend>
          <label className="flex min-h-touch items-start gap-3 text-body">
            <input
              type="checkbox"
              className="mt-1.5 size-4"
              checked={skiveFold}
              onChange={(e) => setSkiveFold(e.target.checked)}
            />
            <span>{typo('B1 – ztenčit pás ohybu dna na 0,6 mm (--skive-fold 0.6)')}</span>
          </label>
          <label className="flex min-h-touch items-start gap-3 text-body">
            <input
              type="checkbox"
              className="mt-1.5 size-4"
              checked={skiveHinge}
              onChange={(e) => setSkiveHinge(e.target.checked)}
            />
            <span>{typo('B2 – ztenčit pás závěsu na 0,6 mm (--skive-hinge 0.6)')}</span>
          </label>
        </fieldset>
        <details className="rounded-control border border-line px-4 py-2" open={p0Prefilled}>
          <summary className="min-h-touch cursor-pointer text-body font-medium">
            Výsledky P0 a jiný magnet (lekce 2, 10 a 11)
          </summary>
          <p className="mt-2 max-w-prose text-meta text-ink-2">
            {typo(
              'Vyplňte jen to, co se od modelu liší. Prázdné pole = hodnota modelu. Tloušťky kůže a zálohy nahoře zadejte zároveň, listy platí pro všechno najednou.',
            )}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {P0_FIELDS.map((field) => (
              <div key={field.key}>
                <Label htmlFor={`${id}-p0-${field.key}`}>{typo(field.label)}</Label>
                <Input
                  id={`${id}-p0-${field.key}`}
                  inputMode="decimal"
                  value={p0Fields[field.key]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setP0Fields((prev) => ({ ...prev, [field.key]: value }));
                  }}
                  aria-describedby={`${id}-p0-${field.key}-hint`}
                />
                <p id={`${id}-p0-${field.key}-hint`} className="mt-1 text-meta text-ink-2">
                  {typo(field.hint)}
                </p>
              </div>
            ))}
          </div>
        </details>
        <div>
          <Button type="submit" variant="secondary">
            Vygenerovat listy
          </Button>
        </div>
      </form>
      {problems.length > 0 ? (
        <div role="alert" className="text-body text-cognac-deep">
          <p className="font-medium">Listy nevznikly – s těmito hodnotami střih neplatí:</p>
          <ul className="mt-1 list-disc pl-5">
            {problems.map((p) => (
              <li key={p}>{typo(p)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {done ? (
        <p role="status" className="text-body font-medium text-forest">
          {typo(
            `Listy pro ${done} jsou připravené níže a zaškrtnuté k tisku. Po tisku zkontrolujte úsečku 50 mm a kótu P1 podle rámečku na listu 4.`,
          )}
        </p>
      ) : null}
    </Card>
  );
}

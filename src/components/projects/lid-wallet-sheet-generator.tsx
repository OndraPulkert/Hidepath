import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { LID_SHEETS_ANCHOR } from '@/app/routes';
import {
  type GeneratedPatternSheet,
  generatedSheetId,
  svgDataUrl,
} from '@/components/projects/generated-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { type PatternSheet } from '@/content/schema';
import {
  type LidBackupSuggestion,
  type LidFormInitial,
  dividerCheck,
  lidBackupMismatch,
  sameLidForm,
} from '@/features/lid-wallet/lid-sheets-state';
import { fmt } from '@/lib/geometry/lid-wallet';
import {
  DEFAULT_LID_GENERATOR_FORM,
  type LidGeneratedSheet,
  type LidGeneratorForm,
  type LidLimitExceeded,
  type LidMeasuredInput,
  LID_FORM_FIELD_MAX_LENGTH,
  type LidP0Fields,
  lidBackupProblem,
  lidFormInvalidFields,
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
    label: 'k (P0-3, lekce 2 a 10)',
    hint: `k = (y_C − y_A) / dělitel z rámečku na listu 4. Do ${fmt(MODEL.kMax)} listy platí, nad ${fmt(MODEL.kMax)} se přepočítají. Platí k z hotového závěsu (lekce 10), dokud ho nemáte, z papírového modelu.`,
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
    hint: `Výchozí ${fmt(MODEL.magnetThicknessMm)}. Po výměně magnetu (lekce 12) zadejte nový.`,
  },
];

/** Pole tloušťky s nápovědou. */
function ThicknessField({
  id,
  label,
  value,
  onChange,
  hint,
  warn = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string | undefined;
  warn?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="decimal"
        maxLength={LID_FORM_FIELD_MAX_LENGTH}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...(hint ? { 'aria-describedby': `${id}-hint` } : {})}
      />
      {hint ? (
        <p
          id={`${id}-hint`}
          className={warn ? 'mt-1 text-meta text-cognac-deep' : 'mt-1 text-meta text-ink-2'}
        >
          {typo(hint)}
        </p>
      ) : null}
    </div>
  );
}

/** Jak dopadlo generování: listy (případně pro zkušební kus), nebo co neplatí. */
type LidRun =
  | { ok: true; label: string; sheets: LidGeneratedSheet[]; trial: boolean }
  | {
      ok: false;
      problems: string[];
      /** Neprošly jen meze tloušťky: listy jde vygenerovat pro zkušební kus. */
      limits: { input: LidMeasuredInput; exceeded: LidLimitExceeded[] } | null;
    };

/**
 * Listy z formuláře. `trial` = když neprojdou jen meze tloušťky, vygenerovat listy pro
 * zkušební kus (uživatel to už potvrdil).
 */
function runLidGeneration(values: LidGeneratorForm, trial: boolean): LidRun {
  const parsed = parseLidGeneratorForm(values);
  if ('problems' in parsed) return { ok: false, problems: parsed.problems, limits: null };
  const result = lidSheetsForMeasured(parsed.input);
  if (result.ok) return { ok: true, label: result.label, sheets: result.sheets, trial: false };
  if (result.kind === 'limits' && trial) {
    const forced = lidSheetsForMeasured(parsed.input, { trial: true });
    if (forced.ok) return { ok: true, label: forced.label, sheets: forced.sheets, trial: true };
  }
  return {
    ok: false,
    problems: result.problems,
    limits: result.kind === 'limits' ? { input: parsed.input, exceeded: result.exceeded } : null,
  };
}

/** Listy pro stránku tisku: název, orientace a rozměr z výchozího střihu. */
function toPrintSheets(
  baseSheets: readonly PatternSheet[],
  run: Extract<LidRun, { ok: true }>,
): GeneratedPatternSheet[] {
  const variant = run.trial
    ? `Zkušební kus mimo ověřené meze: ${run.label}`
    : `Pro změřenou kůži: ${run.label}`;
  const note = run.trial
    ? 'Jen zkušební kus: listy jsou mimo ověřené meze (pruh v hlavičce listu). Finální kus jen z listů v mezích. Čísla pro postup jsou v rámečku na listu 4.'
    : 'Vygenerováno v aplikaci pro zadané tloušťky. Čísla pro postup jsou v rámečku na listu 4.';
  return run.sheets.flatMap((s): GeneratedPatternSheet[] => {
    const base = baseSheets.find((b) => `${LID_FILE_STEM}-${b.id}` === s.name);
    if (!base) return [];
    return [
      {
        id: generatedSheetId(base.id),
        title: base.title,
        note,
        orientation: base.orientation,
        widthMm: base.widthMm,
        heightMm: base.heightMm,
        variant,
        url: svgDataUrl(s.svg),
      },
    ];
  });
}

/**
 * Listy peněženky Víčko pro změřenou kůži, vygenerované přímo v prohlížeči (lekce 1, krok 0(a)
 * návrhu). Formulář je jediné místo, kde se zadávají tloušťky, výsledky P0, k, magnet a zálohy:
 * „Uložit a vygenerovat listy“ je uloží do zápisníku a lekce je odsud jen zobrazují. Výpočet
 * i kreslení jsou v `src/lib` (stejný kód jako `pnpm pattern:wallet-lid`). Hotové listy předá
 * stránce tisku jako další skupinu k zaškrtnutí; z uloženého formuláře hned po otevření.
 */
export function LidWalletSheetGenerator({
  baseSheets,
  onGenerated,
  initial,
  suggestion = null,
  onSave,
}: {
  /** Listy výchozího střihu – z nich se převezme název, orientace a rozměr listu. */
  baseSheets: readonly PatternSheet[];
  onGenerated: (sheets: GeneratedPatternSheet[]) => void;
  /**
   * Uložený formulář, nebo převzatý ze starých zápisů (`lidFormInitial`). Čte se jen při prvním
   * vykreslení; pak formulář patří uživateli, dokud ho neuloží.
   */
  initial?: LidFormInitial | null | undefined;
  /** Záloha podle výsledků zkoušek V12 a Z-2: formulář upozorní, když se liší. */
  suggestion?: LidBackupSuggestion | null | undefined;
  /** Uloží formulář (jediný zdroj); bez něj se nic neukládá (např. v testu komponenty). */
  onSave?:
    ((form: LidGeneratorForm, trialOutsideLimits: boolean | null) => Promise<void>) | undefined;
}) {
  const id = useId();
  const location = useLocation();
  // Výchozí stav platí jen pro první vykreslení – poznámka musí sedět k hodnotám ve formuláři,
  // i když se zápisník mezitím znovu načte.
  const [start] = useState(initial);
  const startForm = start?.form ?? DEFAULT_LID_GENERATOR_FORM;
  // Uložený formulář: listy jsou hned připravené (zkušební kus jen, když tak byl uložený).
  const [boot] = useState(() =>
    start?.saved ? runLidGeneration(startForm, start.trialOutsideLimits === true) : null,
  );
  const [p1, setP1] = useState(startForm.p1);
  const [backupA, setBackupA] = useState(startForm.backupA);
  const [p1BackupA, setP1BackupA] = useState(startForm.p1BackupA);
  const [d1, setD1] = useState(startForm.d1);
  const [d2, setD2] = useState(startForm.d2);
  const [lining, setLining] = useState(startForm.lining);
  const [skiveFold, setSkiveFold] = useState(startForm.skiveFold);
  const [skiveHinge, setSkiveHinge] = useState(startForm.skiveHinge);
  const [p0Fields, setP0Fields] = useState<LidP0Fields>(startForm.p0);
  const [problems, setProblems] = useState<string[]>(boot && !boot.ok ? boot.problems : []);
  const [done, setDone] = useState<{ label: string; trial: boolean } | null>(
    boot?.ok ? { label: boot.label, trial: boot.trial } : null,
  );
  // Uložený stav: co je v zápisníku (porovná se před uložením, ať se nezapisuje totéž).
  const [stored, setStored] = useState<{ form: LidGeneratorForm; trial: boolean | null } | null>(
    start?.saved ? { form: startForm, trial: start.trialOutsideLimits } : null,
  );
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  // Neprošly jen meze tloušťky: listy jde přesto vygenerovat pro zkušební kus (po potvrzení).
  // Platí jen pro hodnoty, se kterými se generovalo (`key`); po změně formuláře zmizí.
  const [limits, setLimits] = useState<{
    key: string;
    input: LidMeasuredInput;
    exceeded: LidLimitExceeded[];
  } | null>(
    boot && !boot.ok && boot.limits ? { key: JSON.stringify(startForm), ...boot.limits } : null,
  );
  const [confirming, setConfirming] = useState(false);
  const form: LidGeneratorForm = {
    p1,
    backupA,
    p1BackupA,
    d1,
    d2,
    lining,
    skiveFold,
    skiveHinge,
    p0: p0Fields,
  };
  const formKey = JSON.stringify(form);
  const override = limits?.key === formKey ? limits : null;
  const p0Filled = Object.values(startForm.p0).some((v) => v !== '');
  // Hranice přepážek z P1, L1, záloh a P0 (1,0 → 0,92; 1,1 → 0,80); počítá se po krocích 0,01.
  const dividers = useMemo(
    () =>
      dividerCheck({
        p1,
        backupA,
        p1BackupA,
        d1,
        d2,
        lining,
        skiveFold,
        skiveHinge,
        p0: p0Fields,
      }),
    [p1, backupA, p1BackupA, d1, d2, lining, skiveFold, skiveHinge, p0Fields],
  );
  const mismatch = lidBackupMismatch(form, suggestion);
  const backupProblem = lidBackupProblem(form);

  // Listy z uloženého formuláře předat stránce a posunout se k formuláři z odkazu s kotvou.
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (boot?.ok) onGenerated(toPrintSheets(baseSheets, boot));
    if (location.hash === `#${LID_SHEETS_ANCHOR}`) {
      document.getElementById(LID_SHEETS_ANCHOR)?.scrollIntoView?.({ block: 'start' });
    }
  });

  /** Uloží formulář (jen když se od uloženého liší). */
  const persist = async (next: LidGeneratorForm, trial: boolean | null) => {
    if (!onSave) return;
    if (stored?.trial === trial && stored && sameLidForm(stored.form, next)) {
      setSaveState('saved');
      return;
    }
    try {
      await onSave(next, trial);
      setStored({ form: next, trial });
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  /** Ukáže výsledek generování; vrací `true` = mimo meze, `false` = v mezích, `null` = nic. */
  const show = (run: LidRun, key: string): boolean | null => {
    setConfirming(false);
    if (run.ok) {
      setProblems([]);
      setLimits(null);
      onGenerated(toPrintSheets(baseSheets, run));
      setDone({ label: run.label, trial: run.trial });
      return run.trial;
    }
    setDone(null);
    setProblems(run.problems);
    setLimits(run.limits ? { key, ...run.limits } : null);
    return null;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSaveState('idle');
    const invalid = lidFormInvalidFields(form);
    if (invalid.length > 0) {
      setDone(null);
      setLimits(null);
      setConfirming(false);
      setProblems(invalid);
      return;
    }
    // Listy nevznikly = s těmito hodnotami zatím žádné nejsou (ani dřívější „v mezích“ neplatí);
    // zkušební kus po potvrzení uloží `true`.
    const outcome = show(runLidGeneration(form, false), formKey);
    void persist(form, outcome);
  };

  const generateTrial = () => {
    if (!override) return;
    if (show(runLidGeneration(form, true), formKey) === true) void persist(form, true);
  };

  return (
    <Card
      id={LID_SHEETS_ANCHOR}
      className="mb-8 flex scroll-mt-40 flex-col gap-4"
      aria-labelledby={`${id}-title`}
    >
      <div>
        <h2 id={`${id}-title`} className="text-h2">
          Listy pro vaši kůži
        </h2>
        <p className="mt-1 max-w-prose text-body text-ink-2">
          {typo(
            'Jediné místo pro tloušťky kůže, výsledky papírového modelu (P0), k, magnet a zálohu. Zadejte, co jste naměřili, a stiskněte „Uložit a vygenerovat listy“: hodnoty se uloží a lekce je odsud ukazují. Aplikace spočítá a nakreslí všechny 4 listy stejně jako generátor v repozitáři a zkontroluje, že střih s touto kůží platí.',
          )}
        </p>
      </div>
      {start?.takeover ? (
        <p
          role="note"
          className="rounded-control border border-forest bg-forest-tint px-4 py-3 text-body"
        >
          <span className="font-medium">
            {start.takeover.kind === 'legacy'
              ? 'Převzato ze zápisníku – zkontrolujte a uložte:'
              : 'V zápisníku jsou novější hodnoty – zkontrolujte a uložte:'}
          </span>{' '}
          {typo(start.takeover.filled.join(', '))}.
        </p>
      ) : null}
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-meta font-medium text-ink-2">
            {typo('Tloušťky kůže (lekce 1), průměr měření v místě dílu, mm')}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <ThicknessField
              id={`${id}-p1`}
              label="P1 (kaštan, useň 1,0), mm"
              value={p1}
              onChange={setP1}
              hint="Liší-li se od 1,0 o méně než 0,05 mm, platí výchozí 1,0."
            />
            <ThicknessField
              id={`${id}-lining`}
              label="Podšívka L1, mm"
              value={lining}
              onChange={setLining}
            />
            <ThicknessField
              id={`${id}-d1`}
              label="Přepážka D1, mm"
              value={d1}
              onChange={setD1}
              hint={dividers?.text ?? 'Hranice přepážek závisí na P1 (při 1,0 nejvýš 0,92 mm).'}
              warn={dividers?.ok === false}
            />
            <ThicknessField
              id={`${id}-d2`}
              label="Přepážka D2, mm"
              value={d2}
              onChange={setD2}
              hint="Do listů jde větší z D1 a D2, vybere ji aplikace. Nikde nesmí být víc než hranice u D1."
            />
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-meta font-medium text-ink-2">
            Záloha (jen podle zkoušky V12 nebo Z-2)
          </legend>
          <label className="flex min-h-touch items-start gap-3 text-body">
            <input
              type="checkbox"
              className="mt-1.5 size-4"
              checked={backupA}
              onChange={(e) => setBackupA(e.target.checked)}
            />
            <span>{typo('A – celý P1 z usně 0,8 (lekce 3)')}</span>
          </label>
          {backupA ? (
            <div className="max-w-xs pl-7">
              <ThicknessField
                id={`${id}-p1-backup-a`}
                label="P1 z usně 0,8, změřená, mm"
                value={p1BackupA}
                onChange={setP1BackupA}
                hint="Po dodání průměr měření v místech, odkud P1 vyříznete."
              />
            </div>
          ) : null}
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
            <span>{typo('B2 – ztenčit pás závěsu usně 1,0 na 0,6 mm (--skive-hinge 0.6)')}</span>
          </label>
          {backupProblem ? (
            <p className="text-meta text-cognac-deep">{typo(backupProblem)}</p>
          ) : null}
          {mismatch ? (
            <p role="note" className="text-meta text-cognac-deep">
              {typo(mismatch)}
            </p>
          ) : null}
        </fieldset>
        <details className="rounded-control border border-line px-4 py-2" open={p0Filled}>
          <summary className="min-h-touch cursor-pointer text-body font-medium">
            Výsledky P0 a jiný magnet (lekce 2, 10 a 11)
          </summary>
          <p className="mt-2 max-w-prose text-meta text-ink-2">
            {typo(
              'Vyplňte jen to, co se od modelu liší. Prázdné pole = hodnota modelu. Listy platí pro všechno najednou: tloušťky, zálohu i tyto hodnoty.',
            )}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {P0_FIELDS.map((field) => (
              <div key={field.key}>
                <Label htmlFor={`${id}-p0-${field.key}`}>{typo(field.label)}</Label>
                <Input
                  id={`${id}-p0-${field.key}`}
                  inputMode="decimal"
                  maxLength={LID_FORM_FIELD_MAX_LENGTH}
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
          <Button type="submit">Uložit a vygenerovat listy</Button>
        </div>
      </form>
      {saveState === 'saved' ? (
        <p role="status" className="text-meta text-forest">
          {typo('Uloženo. Lekce teď ukazují tyto hodnoty.')}
        </p>
      ) : saveState === 'error' ? (
        <p role="alert" className="text-meta text-cognac-deep">
          Hodnoty se neuložily. Zkuste to znovu.
        </p>
      ) : null}
      {problems.length > 0 ? (
        <div role="alert" className="text-body text-cognac-deep">
          <p className="font-medium">
            {override
              ? 'Listy nevznikly – s těmito hodnotami střih překračuje ověřené meze:'
              : 'Listy nevznikly – s těmito hodnotami střih neplatí:'}
          </p>
          <ul className="mt-1 list-disc pl-5">
            {problems.map((p) => (
              <li key={p}>{typo(p)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {override && !confirming ? (
        <div className="flex flex-col gap-2">
          <p className="max-w-prose text-meta text-ink-2">
            {typo(
              'Neprošly jen meze tloušťky. Listy můžete přesto vygenerovat pro zkušební kus – výsledek ukáže zkušební kus; finální kus jen z listů v mezích.',
            )}
          </p>
          <div>
            <Button type="button" variant="secondary" onClick={() => setConfirming(true)}>
              Přesto vygenerovat pro zkušební kus
            </Button>
          </div>
        </div>
      ) : null}
      {override && confirming ? (
        <section
          aria-labelledby={`${id}-confirm-title`}
          className="flex flex-col gap-3 rounded-control border border-cognac bg-cognac/5 px-4 py-3"
        >
          <h3 id={`${id}-confirm-title`} className="text-body font-semibold">
            Vygenerovat listy mimo ověřené meze?
          </h3>
          <p className="max-w-prose text-body">
            {typo(
              'Geometrie se spočítá pro zadané tloušťky, jen kontroly těchto mezí se vynechají. Každý list dostane pruh „MIMO OVĚŘENÉ MEZE – jen zkušební kus“.',
            )}
          </p>
          <ul className="list-disc pl-5 text-body">
            {override.exceeded.map((e) => (
              <li key={e.label}>
                <span className="font-medium">{typo(e.label)}</span>
                {' – '}
                {typo(e.consequence)}
              </li>
            ))}
          </ul>
          <p className="max-w-prose text-body font-medium">
            {typo('Finální kus jen z listů v mezích.')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={generateTrial}>
              Ano, vygenerovat pro zkušební kus
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirming(false)}>
              Zpět
            </Button>
          </div>
        </section>
      ) : null}
      {done ? (
        <p
          role="status"
          className={
            done.trial
              ? 'text-body font-medium text-cognac-deep'
              : 'text-body font-medium text-forest'
          }
        >
          {typo(
            done.trial
              ? `Listy pro zkušební kus (${done.label}) jsou připravené níže a zaškrtnuté k tisku. Jsou mimo ověřené meze – finální kus z nich nestříhejte. Po tisku zkontrolujte úsečku 50 mm a kótu P1 podle rámečku na listu 4.`
              : `Listy pro ${done.label} jsou připravené níže a zaškrtnuté k tisku. Po tisku zkontrolujte úsečku 50 mm a kótu P1 podle rámečku na listu 4.`,
          )}
        </p>
      ) : null}
    </Card>
  );
}

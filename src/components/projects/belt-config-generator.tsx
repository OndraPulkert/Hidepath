import { type FormEvent, type ReactNode, useId, useMemo, useState } from 'react';

import {
  type GeneratedPatternSheet,
  generatedSheetId,
  svgDataUrl,
} from '@/components/projects/generated-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Segment, SegmentButton } from '@/components/ui/segment';
import { Tag } from '@/components/ui/tag';
import { BELT_ILLUSTRATION, BELT_ILLUSTRATION_CAPTION } from '@/content/projects';
import { type PatternSheet, type ProjectDefinition } from '@/content/schema';
import { type BeltConfigPrefill } from '@/features/belt/belt-prefill';
import {
  type SavedBelt,
  type SavedBeltWrite,
  decideSavedBeltSave,
  newSavedBeltFieldId,
} from '@/features/belt/saved-belts';
import { useSavedBelts } from '@/features/belt/use-saved-belts';
import { formatDecimal } from '@/features/notebook/values';
import {
  BELT_LIMITS,
  type BeltConfigForm,
  type BeltConfigInput,
  type BeltConfigResult,
  type BeltTip,
  DEFAULT_BELT_FORM,
  DEFAULT_HOLE_DIAMETER_MM,
  DEFAULT_HOLE_SPACING_MM,
  type WaistSource,
  beltConfigLabel,
  beltConfigToForm,
  beltSheetsFor,
  deriveBeltConfig,
  parseBeltConfigForm,
} from '@/lib/patterns/belt-config';
import {
  OFFERED_STRAP_COLORS,
  STRAP_AVAILABILITY_LABELS,
  STRAP_COLOR_LABELS,
  type StrapOffer,
} from '@/lib/patterns/belt-strap-offers';
import { formatCzk, formatDateCs, typo } from '@/lib/utils/format';

const mm = (v: number): string => `${formatDecimal(v)} mm`;

/** Barvy barevného pásu s ověřenou nabídkou, v pořadí výběru. */
const DYED_CHOICES = OFFERED_STRAP_COLORS.filter((c) => c !== 'prirodni');

const capitalize = (s: string): string => s.charAt(0).toLocaleUpperCase('cs') + s.slice(1);

const WAIST_HINTS: Readonly<Record<WaistSource, string>> = {
  pasek: 'Na pásku, který nosíte: od ohybu u přezky (ne od konce trnu) k používané dírce.',
  metr: 'Metr provlékněte poutky kalhot, utáhněte na pohodlí a odečtěte. Je to tatáž míra.',
};

/** Výsledek formuláře: zadání a výpočet, nebo co opravit. */
function evaluate(form: BeltConfigForm) {
  const parsed = parseBeltConfigForm(form);
  if ('problems' in parsed) return { ok: false as const, problems: parsed.problems };
  const outcome = deriveBeltConfig(parsed.input);
  return outcome.ok
    ? { ok: true as const, input: parsed.input, result: outcome.result }
    : { ok: false as const, problems: outcome.problems };
}

/**
 * „Váš pásek“: šířka podle přezky, změřená tloušťka, obvod, konec a dírky. Z nich spočítá délku
 * pásu, dírky, poutko, nýty a nákup, řekne, jestli jde použít destička, a nakreslí listy A4
 * (stejný kód jako `pnpm pattern:belt-end`). Sestavy jde uložit do „Mých pásků“.
 */
export function BeltConfigGenerator({
  project,
  baseSheets,
  onGenerated,
  initial,
}: {
  project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>;
  /** Listy z obsahu – z nich se převezme název listu se stejným id. */
  baseSheets: readonly PatternSheet[];
  onGenerated: (sheets: GeneratedPatternSheet[]) => void;
  /** Předvyplnění ze zápisníku; čte se jen při prvním vykreslení. */
  initial?: BeltConfigPrefill | null | undefined;
}) {
  const id = useId();
  const [prefilled] = useState(initial);
  const [form, setForm] = useState<BeltConfigForm>(prefilled?.form ?? DEFAULT_BELT_FORM);
  const [done, setDone] = useState<string | null>(null);
  const evaluated = useMemo(() => evaluate(form), [form]);
  // Předvyplněný Ø dírky mimo meze (trn ze zápisníku): pole je v „Dírky (pokročilé)“, které
  // je jinak sbalené – uživatel by neviděl, co opravit. Jen při prvním vykreslení.
  const [holesOpenInitially] = useState(() => {
    const first = evaluate(prefilled?.form ?? DEFAULT_BELT_FORM);
    return !first.ok && first.problems.some((p) => p.startsWith('Ø dírky'));
  });
  const set =
    <K extends keyof BeltConfigForm>(key: K) =>
    (value: BeltConfigForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setDone(null);
    };

  const generate = (e: FormEvent) => {
    e.preventDefault();
    if (!evaluated.ok) return;
    const built = beltSheetsFor(evaluated.input);
    if (!built.ok) return;
    const variant = `Váš pásek: ${built.label}`;
    onGenerated(
      built.sheets.map((s) => ({
        id: generatedSheetId(s.id),
        title: s.title,
        note: typo(
          `Vygenerováno v aplikaci pro váš pásek. ${baseSheets.some((b) => b.id === s.id) ? 'Nahrazuje výchozí list.' : ''}`.trim(),
        ),
        orientation: s.orientation,
        widthMm: s.widthMm,
        heightMm: s.heightMm,
        variant,
        url: svgDataUrl(s.svg),
      })),
    );
    setDone(
      built.sheets.length === 1
        ? `List 1 pro ${built.label} je připravený níže a zaškrtnutý k tisku. List 2 se na A4 nevejde: dírky a konec značte podle čísel v tabulce. Po tisku přeměřte kalibrační čtverec 50 × 50 mm.`
        : `Listy pro ${built.label} jsou připravené níže a zaškrtnuté k tisku. Po tisku přeměřte kalibrační čtverec 50 × 50 mm.`,
    );
  };

  return (
    <Card className="mb-8 flex flex-col gap-4" aria-labelledby={`${id}-title`}>
      <div>
        <h2 id={`${id}-title`} className="text-h2">
          Váš pásek
        </h2>
        <p className="mt-1 max-w-prose text-body text-ink-2">
          {typo(
            'Zvolte šířku podle přezky, zadejte změřenou tloušťku, obvod a barvu. Aplikace spočítá délku pásu, dírky, poutko, nýty a nákup a nakreslí listy A4.',
          )}
        </p>
      </div>
      {prefilled && prefilled.filled.length > 0 ? (
        <p
          role="note"
          className="rounded-control border border-forest bg-forest-tint px-4 py-3 text-body"
        >
          <span className="font-medium">Předvyplněno ze zápisníku:</span>{' '}
          {typo(prefilled.filled.join(', '))}. Hodnoty zkontrolujte.
          {prefilled.problems.map((p) => (
            <span key={p} className="mt-1 block text-cognac-deep">
              {typo(p)}
            </span>
          ))}
        </p>
      ) : null}
      <SavedBeltsSection
        project={project}
        current={evaluated.ok ? evaluated : null}
        waistSource={form.waistSource}
        onLoad={(belt) => {
          setForm(beltConfigToForm(belt.input, belt.waistSource));
          setDone(null);
        }}
      />
      <form onSubmit={generate} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            id={`${id}-width`}
            label="Šířka = přezka, mm"
            value={form.width}
            onChange={set('width')}
            hint={`Vnitřní světlost přezky, ${BELT_LIMITS.widthMm.min}–${BELT_LIMITS.widthMm.max} mm.`}
          />
          <NumberField
            id={`${id}-thickness`}
            label="Tloušťka (změřená), mm"
            value={form.thickness}
            onChange={set('thickness')}
            hint="Posuvkou na řezu, 3,0–4,0 mm. Zadejte, co naměříte, např. 3,6."
          />
          <NumberField
            id={`${id}-waist`}
            label="Obvod, cm"
            value={form.waist}
            onChange={set('waist')}
            hint={WAIST_HINTS[form.waistSource]}
          />
        </div>
        <ChoiceRow label="Obvod jste měřili">
          {(
            [
              ['pasek', 'Na pásku, který nosíte'],
              ['metr', 'Metrem přes poutka'],
            ] as const
          ).map(([value, text]) => (
            <SegmentButton
              key={value}
              active={form.waistSource === value}
              onClick={() => set('waistSource')(value)}
            >
              {text}
            </SegmentButton>
          ))}
        </ChoiceRow>
        <WaistFigure source={form.waistSource} />
        <ChoiceRow label="Konec">
          {(
            [
              ['hrot', 'Hrot'],
              ['zaobleny', 'Zaoblený'],
            ] as const satisfies readonly (readonly [BeltTip, string])[]
          ).map(([value, text]) => (
            <SegmentButton
              key={value}
              active={form.tip === value}
              onClick={() => set('tip')(value)}
            >
              {text}
            </SegmentButton>
          ))}
        </ChoiceRow>
        <ChoiceRow label="Barva">
          <SegmentButton
            active={form.color === 'prirodni'}
            onClick={() => set('color')('prirodni')}
          >
            Přírodní
          </SegmentButton>
          <SegmentButton
            active={form.color !== 'prirodni'}
            onClick={() => {
              if (form.color === 'prirodni') set('color')('');
            }}
          >
            Barevný
          </SegmentButton>
        </ChoiceRow>
        {form.color !== 'prirodni' ? (
          <div className="flex flex-col gap-1.5">
            <ChoiceRow label="Barva pásu (vyberte)">
              {DYED_CHOICES.map((c) => (
                <SegmentButton key={c} active={form.color === c} onClick={() => set('color')(c)}>
                  {capitalize(STRAP_COLOR_LABELS[c])}
                </SegmentButton>
              ))}
            </ChoiceRow>
            <p className="max-w-prose text-meta text-ink-2">
              {typo(
                'Řezaná hrana pásu barveného jen na povrchu je světlá: před leštěním ji obarvíte barvou na hrany. Odstín vybírejte podle fotky v obchodě a barvu i balzám ověřte na odřezku.',
              )}
            </p>
          </div>
        ) : null}
        <details className="rounded-control border border-line px-4 py-2" open={holesOpenInitially}>
          <summary className="min-h-touch cursor-pointer text-body font-medium">
            Dírky (pokročilé)
          </summary>
          <p className="mt-2 max-w-prose text-meta text-ink-2">
            {typo(
              'Prázdné pole = výchozí hodnota. Destička platí jen pro 5 dírek po 25 mm s výchozím odstupem.',
            )}
          </p>
          <div className="mt-3 flex flex-col gap-4">
            <ChoiceRow label="Počet dírek">
              {BELT_LIMITS.holeCounts.map((n) => (
                <SegmentButton
                  key={n}
                  active={form.holeCount === String(n)}
                  onClick={() => set('holeCount')(String(n))}
                >
                  {n}
                </SegmentButton>
              ))}
            </ChoiceRow>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                id={`${id}-spacing`}
                label="Rozteč, mm"
                value={form.holeSpacing}
                onChange={set('holeSpacing')}
                placeholder={formatDecimal(DEFAULT_HOLE_SPACING_MM)}
                hint="Podklady mají 25 mm."
              />
              <NumberField
                id={`${id}-apex`}
                label="Konec → první dírka, mm"
                value={form.apexToFirst}
                onChange={set('apexToFirst')}
                placeholder={
                  evaluated.ok
                    ? formatDecimal(evaluated.result.holes.fromApexMm[0] ?? 0)
                    : undefined
                }
                hint={`Prázdné = jako destička. Nejvýš ${BELT_LIMITS.apexToFirstHoleMaxMm} mm.`}
              />
              <NumberField
                id={`${id}-diameter`}
                label="Ø dírky, mm"
                value={form.holeDiameter}
                onChange={set('holeDiameter')}
                placeholder={formatDecimal(DEFAULT_HOLE_DIAMETER_MM)}
                hint="Trn přezky u kořene + 0,5 mm. 4,5–6,0."
              />
            </div>
          </div>
        </details>
        {evaluated.ok ? (
          <BeltResults result={evaluated.result} />
        ) : (
          <div role="alert" className="text-body text-cognac-deep">
            <p className="font-medium">S těmito hodnotami pásek nespočítám:</p>
            <ul className="mt-1 list-disc pl-5">
              {evaluated.problems.map((p) => (
                <li key={p}>{typo(p)}</li>
              ))}
            </ul>
          </div>
        )}
        {evaluated.ok && !evaluated.result.sheets.printable ? (
          <p role="note" className="text-body text-cognac-deep">
            {typo(evaluated.result.sheets.message)}
          </p>
        ) : null}
        <div>
          <Button type="submit" variant="secondary" disabled={!evaluated.ok}>
            Vygenerovat listy A4
          </Button>
        </div>
      </form>
      {done ? (
        <p role="status" className="text-body font-medium text-forest">
          {typo(done)}
        </p>
      ) : null}
    </Card>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint: string;
  placeholder?: string | undefined;
}) {
  return (
    <div>
      <Label htmlFor={id}>{typo(label)}</Label>
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className="mt-1 text-meta text-ink-2">
        {typo(hint)}
      </p>
    </div>
  );
}

const WAIST_FIGURES = {
  pasek: { src: BELT_ILLUSTRATION.obvodNaPasku, caption: BELT_ILLUSTRATION_CAPTION.obvodNaPasku },
  metr: { src: BELT_ILLUSTRATION.obvodMetrem, caption: BELT_ILLUSTRATION_CAPTION.obvodMetrem },
} as const satisfies Readonly<Record<WaistSource, { src: string; caption: string }>>;

/** Jak se obvod měří: obrázek ke zvolenému způsobu (stejný jako v lekci 1). */
function WaistFigure({ source }: { source: WaistSource }) {
  const { src, caption } = WAIST_FIGURES[source];
  return (
    <figure className="max-w-md overflow-hidden rounded-md border border-line bg-paper">
      <img src={src} alt={caption} className="w-full bg-white" />
      <figcaption className="border-t border-line px-3 py-2 text-meta text-ink-2">
        {typo(caption)}
      </figcaption>
    </figure>
  );
}

function ChoiceRow({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={id} className="text-meta font-medium text-ink-2">
        {label}
      </span>
      <Segment role="group" aria-labelledby={id} className="self-start">
        {children}
      </Segment>
    </div>
  );
}

/** Řádek „Nýty“: rozsah dříku z přesné tloušťky a nýt, který do něj padne, nebo že žádný. */
function rivetText(r: BeltConfigResult): string {
  const { rivet } = r;
  const range = `spoj 2 × ${mm(r.input.thicknessMm)} → dřík ${formatDecimal(rivet.minMm)}–${mm(rivet.maxMm)}`;
  if (rivet.postMm === null) return `2 ks, ${range}; ověřený nýt s takovým dříkem nemáme`;
  const product = rivet.verified ?? `${rivet.options[0]!.product}, ověřte u prodejce`;
  return `2 ks, dřík ${mm(rivet.postMm)} (${range}) · ${product}`;
}

/** Tabulka výsledků, destička, nákup a co ověřit. */
function BeltResults({ result }: { result: BeltConfigResult }) {
  const r = result;
  const rows: [string, string][] = [
    [
      'Pás k nákupu',
      r.strap.minLengthCm === null
        ? `obvod + ${mm(r.strap.allowanceMm)} (zadejte obvod)`
        : `aspoň ${r.strap.minLengthCm} cm (obvod + ${mm(r.strap.allowanceMm)})`,
    ],
    [
      r.input.tip === 'hrot' ? 'Hrot' : 'Zaoblený konec',
      r.input.tip === 'hrot'
        ? `délka ${mm(r.tipLengthMm)}, vrchol r = ${mm(r.tip.noseRadiusMm)}`
        : `půlkruh r = ${mm(r.tipLengthMm)}`,
    ],
    [
      'Dírky od konce',
      `${r.holes.fromApexMm.map((v) => formatDecimal(v)).join(' / ')} mm · ${r.holes.count} × Ø ${mm(r.holes.diameterMm)}, rozteč ${mm(r.holes.spacingMm)}`,
    ],
    [
      'Prostřední dírka',
      `${mm(r.holes.middleFromApexMm)} od konce · nastavení ± ${mm(r.holes.adjustmentMm)}`,
    ],
    ['Poutko', `${mm(r.keeper.lengthMm)} × ${mm(r.keeper.widthMm)}`],
    ['Nýty', rivetText(r)],
    [
      'Ovál pro trn',
      `${formatDecimal(r.buckleEnd.slotLengthMm)} × ${mm(r.buckleEnd.slotWidthMm)}, ${formatDecimal(r.buckleEnd.slotFromEndMm[0])}–${mm(r.buckleEnd.slotFromEndMm[1])} od konce pásu; ohyb ${mm(r.buckleEnd.foldFromEndMm)}`,
    ],
    [
      'Otvory pro nýty',
      `Ø ${mm(r.buckleEnd.rivetHoleMm)}, ${r.buckleEnd.rivetHolesFromEndMm.map((v) => formatDecimal(v)).join(' / ')} mm od konce pásu`,
    ],
    [
      'Přezka',
      `${mm(r.buckle.widthMm)} jednotrnová${r.buckle.verified ? '' : ' (ověřte u prodejce)'}`,
    ],
    [
      'List 2',
      r.tipSheetOrientation === 'portrait'
        ? 'A4 na výšku'
        : r.tipSheetOrientation === 'landscape'
          ? 'A4 na šířku'
          : 'nevejde se na A4',
    ],
  ];
  return (
    <div className="flex flex-col gap-4">
      <table className="w-full text-left text-body">
        <caption className="mb-2 text-left kicker">{typo(`Vaše čísla · ${r.label}`)}</caption>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-t border-line align-top">
              <th scope="row" className="py-2 pr-4 font-medium whitespace-nowrap">
                {k}
              </th>
              <td className="py-2">{typo(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PlateBadge result={r} />
      <div>
        <p className="mb-1 font-medium">Nákup</p>
        <ul className="flex flex-col gap-2">
          {r.shopping.map((line) => (
            <li key={line.item} className="text-body">
              <span className="font-medium">
                {line.quantity > 1 ? `${line.quantity}× ` : ''}
                {typo(line.item)}
              </span>{' '}
              <Tag tone={line.status === 'overeno' ? 'ready' : 'missing'}>
                {line.status === 'overeno' ? 'v podkladech' : 'ověřte u prodejce'}
              </Tag>
              <span className="block text-meta text-ink-2">{typo(line.detail)}</span>
              {line.offers && line.offers.length > 0 ? (
                <StrapOfferList offers={line.offers} defaultOffer={line.defaultOffer ?? null} />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      {r.warnings.length > 0 ? (
        <div role="note">
          <p className="mb-1 font-medium">Ověřte na odřezku</p>
          <ul className="list-disc pl-5 text-body">
            {r.warnings.map((w) => (
              <li key={w}>{typo(w)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Pás: výchozí nabídka a „Kde jinde koupit“ od nejlevnější, se skladem a datem ověření. */
function StrapOfferList({
  offers,
  defaultOffer,
}: {
  offers: readonly StrapOffer[];
  defaultOffer: StrapOffer | null;
}) {
  const others = offers.filter((o) => o !== defaultOffer);
  const link = (o: StrapOffer) => (
    <a href={o.url} target="_blank" rel="noreferrer noopener" className="underline">
      {typo(o.shop)}
    </a>
  );
  return (
    <div className="mt-1 flex flex-col gap-2 text-meta text-ink-2">
      {defaultOffer ? (
        <p>
          Výchozí: {link(defaultOffer)}
          {typo(
            ` – ${defaultOffer.lengthCm} cm, ${formatCzk(defaultOffer.priceCents)}, ${STRAP_AVAILABILITY_LABELS[defaultOffer.availability]}`,
          )}
        </p>
      ) : null}
      {others.length > 0 ? (
        <div>
          <p className="font-medium text-ink">
            {defaultOffer ? 'Kde jinde koupit' : 'Kde koupit (ověřte u prodejce)'}
          </p>
          <ul className="flex flex-col gap-1.5">
            {others.map((o) => (
              <li key={`${o.url} ${o.variant}`}>
                {link(o)}
                {typo(
                  ` – ${o.lengthCm} cm, ${formatCzk(o.priceCents)}, ${STRAP_AVAILABILITY_LABELS[o.availability]}`,
                )}
                {o.tanningVerified ? null : (
                  <span className="text-cognac-deep">{typo(', činění neuvedeno')}</span>
                )}
                <span className="block">{typo(`${o.note}. Doprava: ${o.shipping}.`)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p>{typo(`Ceny ověřeny ${formatDateCs(offers[0]!.checkedAt)}, před nákupem ověřte.`)}</p>
    </div>
  );
}

function PlateBadge({ result }: { result: BeltConfigResult }) {
  const { plate, input, sheets } = result;
  const [buckleRow, endRow] = plate.rows;
  const badge = plate.usable
    ? 'Destička: ano'
    : buckleRow.ok
      ? 'Destička: jen řada 3'
      : sheets.printable
        ? 'Destička: ne – vytiskněte listy'
        : 'Destička: ne';
  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <Tag tone={plate.usable ? 'ready' : 'missing'}>{badge}</Tag>
      </div>
      <ul className="text-meta text-ink-2">
        {plate.rows.map((row) => (
          <li key={row.row}>
            {typo(`${row.label}: ${row.ok ? 'ano' : `ne (${row.reasons.join('; ')})`}`)}
          </li>
        ))}
        {!plate.usable && buckleRow.ok ? (
          <li>
            {typo(
              sheets.printable
                ? `Za řadu ${endRow.row} vytiskněte list 2.`
                : `Za řadu ${endRow.row} značte dírky a konec podle čísel v tabulce: list 2 se na A4 nevejde.`,
            )}
          </li>
        ) : null}
        {plate.usable && !plate.guideLine ? (
          <li>
            {typo(
              `Vodicí linku pro ${formatDecimal(input.widthMm)} mm destička nemá: hranu pásu srovnejte podle příčné stupnice na ${formatDecimal(input.widthMm / 2)} mm.`,
            )}
          </li>
        ) : null}
      </ul>
    </div>
  );
}

/**
 * „Moje pásky“: uložené sestavy, načtení, smazání a uložení té aktuální. Po načtení „Uložit“
 * přepíše načtený pásek (i s novým názvem), „Uložit jako nový“ založí další. Rozhoduje
 * `decideSavedBeltSave`; stejný název jiného pásku se potvrzuje tady na stránce.
 */
function SavedBeltsSection({
  project,
  current,
  waistSource,
  onLoad,
}: {
  project: Pick<ProjectDefinition, 'slug' | 'contentVersion'>;
  current: { input: BeltConfigInput } | null;
  waistSource: WaistSource;
  onLoad: (belt: SavedBelt) => void;
}) {
  const id = useId();
  const { belts, saveBelt, removeBelt, isSaving } = useSavedBelts(project);
  const [name, setName] = useState('');
  /** Id načteného pásku; „Uložit“ ho přepíše. */
  const [loadedFieldId, setLoadedFieldId] = useState<string | null>(null);
  const loaded = belts.find((b) => b.fieldId === loadedFieldId) ?? null;
  /** Čeká na „Přepsat / Zrušit“: pásek se stejným názvem a co se při „Přepsat“ zapíše. */
  const [pending, setPending] = useState<{ conflict: SavedBelt; write: SavedBeltWrite } | null>(
    null,
  );
  /** `undo` = právě smazaný pásek: smazání se synchronizuje na všechna zařízení, ať jde vrátit. */
  const [message, setMessage] = useState<{
    ok: boolean;
    text: string;
    undo?: SavedBelt;
  } | null>(null);

  const remove = async (belt: SavedBelt) => {
    setPending(null);
    try {
      await removeBelt(belt.fieldId);
      if (belt.fieldId === loadedFieldId) setLoadedFieldId(null);
      setMessage({ ok: true, text: `Pásek „${belt.name}“ smazán.`, undo: belt });
    } catch {
      setMessage({ ok: false, text: 'Smazání se nepovedlo. Zkuste to znovu.' });
    }
  };

  const restore = async (belt: SavedBelt) => {
    try {
      await saveBelt(belt.name, belt.input, belt.waistSource, belt.fieldId);
      setMessage({ ok: true, text: `Pásek „${belt.name}“ vrácen.` });
    } catch {
      setMessage({ ok: false, text: 'Vrácení se nepovedlo. Zkuste to znovu.' });
    }
  };

  const write = async (w: SavedBeltWrite) => {
    if (!current) return;
    setPending(null);
    const trimmed = name.trim();
    try {
      await saveBelt(trimmed, current.input, waistSource, w.fieldId);
      setLoadedFieldId(w.fieldId);
      if (w.removeFieldId) {
        try {
          await removeBelt(w.removeFieldId);
        } catch {
          setMessage({
            ok: false,
            text: `Pásek „${trimmed}“ uložen, ale druhý se stejným názvem se nesmazal. Smažte ho ručně.`,
          });
          return;
        }
      }
      setMessage({
        ok: true,
        text:
          w.outcome === 'created'
            ? `Pásek „${trimmed}“ uložen.`
            : w.outcome === 'updated'
              ? `Změny pásku „${trimmed}“ uloženy.`
              : `Pásek „${trimmed}“ přepsán.`,
      });
    } catch {
      setMessage({ ok: false, text: 'Uložení se nepovedlo. Zkuste to znovu.' });
    }
  };

  const save = (mode: 'update' | 'new') => {
    if (!current) return;
    const decision = decideSavedBeltSave({
      name,
      belts,
      mode,
      loadedFieldId,
      newFieldId: newSavedBeltFieldId(),
    });
    if (decision.kind === 'invalid') {
      setPending(null);
      setMessage({ ok: false, text: decision.problem });
    } else if (decision.kind === 'confirm-overwrite') {
      setMessage(null);
      setPending({ conflict: decision.conflict, write: decision.write });
    } else {
      void write(decision.write);
    }
  };

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-2">
      <h3 id={`${id}-title`} className="text-meta font-medium text-ink-2">
        Moje pásky
      </h3>
      {belts.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {belts.map((belt) => (
            <li key={belt.fieldId} className="flex flex-wrap items-center gap-2 text-body">
              <span className="mr-auto">
                <span className="font-medium">{belt.name}</span>{' '}
                <span className="text-meta text-ink-2">
                  {typo(beltConfigLabel(belt.input))}
                  {belt.input.waistMm !== undefined
                    ? typo(` · obvod ${formatDecimal(belt.input.waistMm / 10)} cm`)
                    : ''}
                </span>
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setName(belt.name);
                  setLoadedFieldId(belt.fieldId);
                  setPending(null);
                  setMessage(null);
                  onLoad(belt);
                }}
                aria-label={`Načíst pásek ${belt.name}`}
              >
                Načíst
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => void remove(belt)}
                aria-label={`Smazat pásek ${belt.name}`}
              >
                Smazat
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-meta text-ink-2">
          {typo('Zatím nic. Uložte si sestavu, ať ji příště nemusíte zadávat znovu.')}
        </p>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1">
          <Label htmlFor={`${id}-name`}>Název pásku</Label>
          <Input
            id={`${id}-name`}
            value={name}
            placeholder="např. Hnědý 40 mm do džínů"
            onChange={(e) => {
              setName(e.target.value);
              setPending(null);
            }}
          />
        </div>
        {loaded ? (
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={!current || isSaving}
              onClick={() => save('update')}
              aria-describedby={`${id}-loaded`}
            >
              Uložit
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={!current || isSaving}
              onClick={() => save('new')}
            >
              Uložit jako nový
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={!current || isSaving}
            onClick={() => save('new')}
          >
            Uložit do Mých pásků
          </Button>
        )}
      </div>
      {loaded ? (
        <p id={`${id}-loaded`} className="text-meta text-ink-2">
          {typo(`Upravujete pásek „${loaded.name}“. „Uložit“ ho přepíše, i s novým názvem.`)}
        </p>
      ) : null}
      {pending ? (
        <div
          role="alertdialog"
          aria-labelledby={`${id}-confirm`}
          className="flex flex-wrap items-center gap-2 rounded-control border border-cognac px-4 py-3"
        >
          <p id={`${id}-confirm`} className="mr-auto text-body">
            {typo(`Pásek „${pending.conflict.name}“ už máte. Přepsat ho?`)}
          </p>
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={() => void write(pending.write)}
          >
            Přepsat
          </Button>
          <Button type="button" variant="ghost" onClick={() => setPending(null)}>
            Zrušit
          </Button>
        </div>
      ) : null}
      {message ? (
        <p
          role={message.ok ? 'status' : 'alert'}
          className={message.ok ? 'text-meta text-forest' : 'text-meta text-cognac-deep'}
        >
          {typo(message.text)}
          {message.undo ? (
            <>
              {' '}
              <Button
                type="button"
                variant="ghost"
                disabled={isSaving}
                onClick={() => void restore(message.undo!)}
                aria-label={`Vrátit pásek ${message.undo.name}`}
              >
                Vrátit
              </Button>
            </>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}

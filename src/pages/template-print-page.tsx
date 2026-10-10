import { type CSSProperties, type ReactNode, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';

import { PRINT_SHEET_PARAM, routes } from '@/app/routes';
import { AssembledIllustration } from '@/components/illustrations/assembled';
import {
  TEMPLATE_PRINT_MARGIN_MM,
  TemplateIllustration,
} from '@/components/illustrations/template';
import { BeltConfigGenerator } from '@/components/projects/belt-config-generator';
import {
  type GeneratedPatternSheet,
  generatedSheetId,
} from '@/components/projects/generated-sheet';
import { LidWalletSheetGenerator } from '@/components/projects/lid-wallet-sheet-generator';
import { groupPatternSheets } from '@/components/projects/pattern-sheet-list';
import { Button } from '@/components/ui/button';
import { findProject } from '@/content/projects';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import {
  type PatternSheet,
  type PatternSheetsDefinition,
  type ProjectDefinition,
  type TemplateDefinition,
} from '@/content/schema';
import { typo } from '@/lib/utils/format';
import { resolveActiveBelt } from '@/features/belt/active-belt';
import { beltFormInitial } from '@/features/belt/belt-prefill';
import { lidFormInitial, resolveLidSheets } from '@/features/lid-wallet/lid-sheets-state';
import { useLidSheets } from '@/features/lid-wallet/use-lid-sheets';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { useLessonRecords } from '@/features/notebook/use-lesson-records';
import { NotFoundPage } from '@/pages/not-found-page';

/**
 * Tisková šablona 1:1. SVG má rozměry v milimetrech, takže při tisku na 100 % odpovídá
 * skutečnosti; správnost se ověří kontrolní úsečkou. Projekt má buď obdélníkovou šablonu
 * (kreslí ji aplikace), nebo listy střihu z generátoru (každý list = jedna stránka A4).
 */
export function TemplatePrintPage() {
  const { projectSlug = '' } = useParams<'projectSlug'>();
  const project = findProject(projectSlug);
  if (!project) return <NotFoundPage />;
  if (project.template) return <PiecesTemplate project={project} template={project.template} />;
  if (project.patternSheets) {
    return <PatternSheetsPrint project={project} definition={project.patternSheets} />;
  }
  return <NotFoundPage />;
}

/**
 * Cvičné listy 1:1 (`practiceSheets`): trénink na odřezku, ne díly výrobku. Vlastní trasa, aby
 * projekt s obdélníkovou šablonou (projekt 01) nepřišel o svou stránku šablony.
 */
export function PracticeSheetsPrintPage() {
  const { projectSlug = '' } = useParams<'projectSlug'>();
  const project = findProject(projectSlug);
  if (!project?.practiceSheets) return <NotFoundPage />;
  return (
    <PatternSheetsPrint
      project={project}
      definition={project.practiceSheets}
      heading="Cvičné listy 1:1"
    />
  );
}

function BackAndPrint({
  project,
  canPrint = true,
}: {
  project: ProjectDefinition;
  canPrint?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        to={routes.project(project.slug)}
        className="inline-flex min-h-touch items-center text-body"
      >
        ← {project.title}
      </Link>
      <Button onClick={() => window.print()} disabled={!canPrint}>
        Vytisknout
      </Button>
    </div>
  );
}

function PiecesTemplate({
  project,
  template,
}: {
  project: ProjectDefinition;
  template: TemplateDefinition;
}) {
  return (
    <div className="mx-auto max-w-[760px] print:max-w-none">
      {/* Okraj stránky = bezpečný okraj tiskárny, nic se netiskne blíž ke hraně papíru. */}
      <style>{`@media print { @page { size: A4 portrait; margin: ${TEMPLATE_PRINT_MARGIN_MM}mm; } svg { break-inside: avoid; page-break-inside: avoid; } }`}</style>
      <BackAndPrint project={project} />
      <h1 className="mb-2 text-[clamp(24px,3vw,32px)] print:text-[18pt]">
        Šablona 1:1 · {project.title}
      </h1>
      <p className="mb-6 max-w-prose text-body text-ink-2 print:text-[10pt]">
        {template.printNote} V dialogu tisku nechte měřítko na 100 % („Výchozí“), papír A4 a výchozí
        okraje.
      </p>
      <div className="overflow-x-auto rounded-md border border-line bg-white p-2 print:break-inside-avoid print:overflow-visible print:border-0 print:p-0">
        <TemplateIllustration
          template={template}
          title={`Šablona 1:1: ${project.title}`}
          mode="print"
        />
      </div>
      <div className="mt-6 max-w-[420px] print:hidden">
        <p className="mb-2 kicker print:text-[8pt]">Jak vypadá sestavené</p>
        <AssembledIllustration
          template={template}
          title={`Schéma hotového pouzdra: ${project.title}`}
        />
      </div>
      <p className="mt-4 text-meta text-ink-2 print:text-[9pt]">
        Návrh šablony. Před řezáním finální kůže ověřte rozměry na odřezku; rozměry karet
        85,6&nbsp;×&nbsp;54&nbsp;mm.
      </p>
    </div>
  );
}

type GeneratorKey = NonNullable<PatternSheetsDefinition['browserGenerator']>;

interface GeneratorSlotProps {
  project: ProjectDefinition;
  baseSheets: readonly PatternSheet[];
  onGenerated: (sheets: GeneratedPatternSheet[]) => void;
  /** Zápisy zápisníku projektu (načtené). */
  records: readonly LessonRecordEntry[];
}

/**
 * Formuláře, které listy vygenerují v prohlížeči. `hasPrefill` = zápisník má hodnoty, pro které
 * výchozí list nemusí platit; `render` vykreslí formulář s předvyplněním ze zápisníku. Hotové
 * listy formulář předá stránce jako další skupinu k zaškrtnutí.
 */
const sheetGenerators: Readonly<
  Record<
    GeneratorKey,
    {
      hasPrefill: (records: readonly LessonRecordEntry[], projectSlug: string) => boolean;
      render: (props: GeneratorSlotProps) => ReactNode;
    }
  >
> = {
  // Víčko: formulář je jediný zdroj tlouštěk, P0, k, magnetu a záloh; předvyplní se z uloženého
  // stavu, jinak ze starých zápisů lekcí (převod).
  'lid-wallet-thickness': {
    hasPrefill: (records, slug) => resolveLidSheets(records, slug).form !== null,
    render: (props) => <LidSheetsSlot {...props} />,
  },
  // Pásek: formulář je na vlastní stránce „Váš pásek“ (routes.beltConfig) a předvyplní se
  // z aktivního pásku – jediného zdroje parametrů.
  'belt-config': {
    hasPrefill: (records, slug) => resolveActiveBelt(records, slug).active !== null,
    render: ({ project, baseSheets, onGenerated, records }) => (
      <BeltConfigGenerator
        project={project}
        baseSheets={baseSheets}
        onGenerated={onGenerated}
        initial={beltFormInitial(resolveActiveBelt(records, project.slug))}
      />
    ),
  },
};

/** Formulář listů Víčka s uložením do zápisníku (jediný zdroj hodnot pro lekce). */
function LidSheetsSlot({ project, baseSheets, onGenerated }: GeneratorSlotProps) {
  const state = useLidSheets(project);
  return (
    <LidWalletSheetGenerator
      baseSheets={baseSheets}
      onGenerated={onGenerated}
      initial={lidFormInitial(state)}
      suggestion={state.suggestion}
      onSave={state.saveForm}
    />
  );
}

/**
 * Formulář generátoru se vykreslí, až je zápisník načtený, aby předvyplnění nepřepsalo,
 * co uživatel začal psát. Když se zápisník načíst nepodaří, formulář je prázdný.
 */
function SheetGeneratorSlot({
  generator,
  notebook,
  ...props
}: Omit<GeneratorSlotProps, 'records'> & {
  generator: GeneratorKey;
  notebook: NotebookPrefill;
}) {
  if (notebook.pending) return null;
  return sheetGenerators[generator].render({ ...props, records: notebook.records });
}

interface NotebookPrefill {
  pending: boolean;
  records: readonly LessonRecordEntry[];
  /** Zápisník má hodnoty pro formulář generátoru. */
  hasPrefill: boolean;
}

const NO_RECORDS: readonly LessonRecordEntry[] = [];

/** Zápisník pro generátor (projekt bez generátoru: nic). */
function useNotebookPrefill(
  generator: GeneratorKey | undefined,
  projectSlug: string,
): NotebookPrefill {
  const records = useLessonRecords(projectSlug);
  const data = records.data ?? NO_RECORDS;
  const hasPrefill = useMemo(
    () => (generator ? sheetGenerators[generator].hasPrefill(data, projectSlug) : false),
    [generator, data, projectSlug],
  );
  return { pending: Boolean(generator) && records.isPending, records: data, hasPrefill };
}

/**
 * Listy střihu z generátoru. Každý list je SVG přesně A4 i s vlastními okraji a kontrolní
 * úsečkou, proto se tiskne bez okrajů stránky (`margin: 0`) a s pojmenovanou stránkou podle
 * orientace. Vytiskne se jen to, co je zaškrtnuté.
 */
export function PatternSheetsPrint({
  project,
  definition,
  heading = 'Listy střihu 1:1',
  mode = 'print',
}: {
  project: ProjectDefinition;
  definition: PatternSheetsDefinition;
  heading?: string;
  /**
   * `print` = tisková stránka; formulář „Váš pásek“ tu není, jen odkaz na jeho stránku.
   * `belt-config` = stránka „Váš pásek“: nahoře nákup a formulář, pod ním listy k tisku.
   */
  mode?: 'print' | 'belt-config';
}) {
  const [searchParams] = useSearchParams();
  const [generated, setGenerated] = useState<GeneratedPatternSheet[]>([]);
  // Formulář pásku je jen na stránce „Váš pásek“; tisková stránka na něj odkáže.
  const beltPointer = mode === 'print' && definition.browserGenerator === 'belt-config';
  const generator = beltPointer ? undefined : definition.browserGenerator;
  const notebook = useNotebookPrefill(generator, project.slug);
  const urls: Readonly<Record<string, string>> = {
    ...patternSheetUrlsFor(project.slug),
    ...Object.fromEntries(generated.map((g) => [g.id, g.url])),
  };
  const sheets: readonly PatternSheet[] = [...definition.sheets, ...generated];
  const groups = groupPatternSheets(sheets);
  // `?list=<id>` (i opakovaně) předvybere k tisku konkrétní listy, např. z „Připravte si“.
  const wanted = searchParams
    .getAll(PRINT_SHEET_PARAM)
    .filter((id) => definition.sheets.some((s) => s.id === id));
  // Se změřenou kůží v zápisníku se výchozí list z odkazu nepředvybere – platí list
  // vygenerovaný pro změřené hodnoty (`generatedSheetId`).
  const awaitingGenerated = wanted.length > 0 && generated.length === 0 && notebook.hasPrefill;
  const defaultSelection = (): ReadonlySet<string> => {
    if (generated.length > 0) {
      // Vygenerovaný list může mít pokračování `<id>-…` (pásek: list 2b `spicka-zbytek`);
      // odkaz na list předvybere i je.
      const fromLink = generated
        .map((g) => g.id)
        .filter((gid) =>
          wanted.some(
            (id) => gid === generatedSheetId(id) || gid.startsWith(`${generatedSheetId(id)}-`),
          ),
        );
      return new Set(fromLink.length > 0 ? fromLink : generated.map((g) => g.id));
    }
    if (wanted.length > 0) return new Set(awaitingGenerated ? [] : wanted);
    return new Set(groups[0]?.sheets.map((s) => s.id) ?? []);
  };
  // `null` = uživatel výběr neměnil, platí výchozí výběr (mění se po vygenerování).
  const [chosen, setChosen] = useState<ReadonlySet<string> | null>(null);
  const selected = chosen ?? defaultSelection();
  const printable = sheets.filter((s) => selected.has(s.id) && urls[s.id]);
  const onGenerated = (next: GeneratedPatternSheet[]) => {
    setGenerated(next);
    // Vygenerované listy nahradí k tisku výchozí střih; výchozí jde zaškrtnout zpátky.
    setChosen(null);
  };
  const orientations = new Set(printable.map((s) => s.orientation));
  const mixedOrientation = orientations.size > 1;
  const lastOrientation = printable.at(-1)?.orientation ?? 'portrait';
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChosen(next);
  };

  return (
    <div className="mx-auto max-w-[760px] print:max-w-none">
      <style>{`@media print {
        @page { size: A4 ${lastOrientation}; margin: 0; }
        @page sheet-landscape { size: A4 landscape; margin: 0; }
        @page sheet-portrait { size: A4 portrait; margin: 0; }
        .pattern-sheet {
          break-after: page; page-break-after: always;
          width: var(--sheet-w); height: calc(var(--sheet-h) - 2mm); overflow: hidden;
        }
        .pattern-sheet img { width: var(--sheet-w); max-width: none; height: auto; }
        .pattern-sheet:last-child { break-after: auto; page-break-after: auto; }
      }`}</style>
      <BackAndPrint project={project} canPrint={printable.length > 0} />
      <div className="print:hidden">
        {mode === 'belt-config' ? (
          <>
            <h1 className="mb-2 text-[clamp(28px,4vw,40px)]">{heading}</h1>
            <p className="mb-6 max-w-prose text-body-lg text-ink-2">
              {typo(
                'Tady zadáte pásek – jediné místo pro šířku, tloušťku, obvod, konec a barvu. Podle uloženého pásku počítají lekce, „Připravte si“ i nákup. Listy A4 pro váš pásek vytisknete dole.',
              )}
            </p>
            {generator ? (
              <SheetGeneratorSlot
                generator={generator}
                notebook={notebook}
                project={project}
                baseSheets={definition.sheets}
                onGenerated={onGenerated}
              />
            ) : null}
            <h2 className="mb-2 text-h2">Listy A4 k tisku</h2>
          </>
        ) : (
          <h1 className="mb-2 text-[clamp(24px,3vw,32px)]">
            {heading} · {project.title}
          </h1>
        )}
        <p className="mb-2 max-w-prose text-body text-ink-2">{typo(definition.printNote)}</p>
        <p className="mb-3 max-w-prose text-body text-ink-2">
          V dialogu tisku nechte měřítko na 100 % („Výchozí“) a papír A4. Každý list se vytiskne na
          vlastní stránku ve správné orientaci.
        </p>
        <p role="note" className="mb-6 max-w-prose text-body font-medium text-leather">
          Po tisku změřte kontrolní úsečku na každém listu: musí mít přesně{' '}
          {definition.calibrationMm}&nbsp;mm.
          {orientations.size > 1
            ? ' Některé tiskárny otočí nebo zmenší list, který má jinou orientaci než ostatní; když úsečka nesedí, vytiskněte listy na výšku a na šířku zvlášť.'
            : ''}
        </p>
        {awaitingGenerated && chosen === null ? (
          <p role="note" className="mb-6 max-w-prose text-body font-medium text-leather">
            {typo(
              mode === 'belt-config'
                ? 'Máte uložený pásek, výchozí list pro něj nemusí platit. Nejdřív nahoře stiskněte „Vygenerovat listy A4“ – list z odkazu se pak vybere k tisku sám.'
                : 'Máte zadanou změřenou kůži, výchozí list pro ni nemusí platit. Nejdřív vygenerujte listy pro svou kůži (formulář níže) – list z odkazu se pak vybere k tisku sám.',
            )}
          </p>
        ) : printable.length === 0 ? (
          <p className="mb-6 text-meta text-ink-2">Vyberte alespoň jeden list.</p>
        ) : null}
        {beltPointer ? <BeltConfigPointer project={project} /> : null}
        {definition.variantsNote && !beltPointer ? (
          <p className="mb-6 max-w-prose text-meta text-ink-2">{typo(definition.variantsNote)}</p>
        ) : null}
        {generator && mode === 'print' ? (
          <SheetGeneratorSlot
            generator={generator}
            notebook={notebook}
            project={project}
            baseSheets={definition.sheets}
            onGenerated={onGenerated}
          />
        ) : null}
        <fieldset className="mb-8 flex flex-col gap-4">
          <legend className="mb-2 kicker">Co vytisknout</legend>
          {groups.map((group) => (
            <div key={group.variant ?? 'default'} className="flex flex-col gap-2">
              <p className="text-meta font-medium">
                {group.variant ?? definition.defaultVariantLabel ?? 'Výchozí střih'}
              </p>
              {group.sheets.map((sheet) => (
                <label key={sheet.id} className="flex min-h-touch items-start gap-3 text-body">
                  <input
                    id={`sheet-${sheet.id}`}
                    type="checkbox"
                    className="mt-1.5 size-4"
                    checked={selected.has(sheet.id)}
                    onChange={() => toggle(sheet.id)}
                  />
                  <span>
                    <span className="font-medium">{typo(sheet.title)}</span>
                    <span className="block text-meta text-ink-2">{typo(sheet.note)}</span>
                  </span>
                </label>
              ))}
            </div>
          ))}
        </fieldset>
      </div>
      <div className="flex flex-col gap-6 print:block">
        {printable.map((sheet) => (
          <section
            key={sheet.id}
            className="pattern-sheet overflow-hidden rounded-md border border-line bg-white print:rounded-none print:border-0"
            style={
              {
                // Jedna orientace: stačí výchozí @page. Pojmenované stránky jen při mixu, jinak
                // Chrome v dialogu tisku přidá za poslední list prázdnou stránku.
                ...(mixedOrientation ? { page: `sheet-${sheet.orientation}` } : {}),
                '--sheet-w': `${sheet.widthMm}mm`,
                '--sheet-h': `${sheet.heightMm}mm`,
              } as CSSProperties
            }
          >
            <img
              src={urls[sheet.id]}
              alt={`List střihu: ${sheet.title}`}
              className="block w-full"
              style={{ aspectRatio: `${sheet.widthMm} / ${sheet.heightMm}` }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * Listy střihu pásku: výchozí listy jsou jen pro 40 × 3,5 mm a hrot. Listy pro váš pásek se
 * zadávají a tisknou na stránce „Váš pásek“.
 */
function BeltConfigPointer({ project }: { project: ProjectDefinition }) {
  return (
    <div className="mb-8 flex flex-col gap-3 rounded-card border border-cognac bg-cognac-tint p-5">
      <h2 className="text-h2">Listy pro váš pásek</h2>
      <p className="max-w-prose text-body">
        {typo(
          'Tady jsou jen výchozí listy (40 mm, 3,5 mm, hrot, 5 dírek). Pro jinou šířku, tloušťku, konec nebo dírky zadejte pásek na stránce „Váš pásek“ a listy vytiskněte tam.',
        )}
      </p>
      <Button asChild className="self-start">
        <Link
          to={routes.beltConfig(project.slug)}
          className="text-white no-underline hover:text-white"
        >
          Otevřít Váš pásek <span aria-hidden>→</span>
        </Link>
      </Button>
    </div>
  );
}

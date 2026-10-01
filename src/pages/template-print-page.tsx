import { type ComponentType, type CSSProperties, useState } from 'react';
import { Link, useParams } from 'react-router';

import { routes } from '@/app/routes';
import { AssembledIllustration } from '@/components/illustrations/assembled';
import { TemplateIllustration } from '@/components/illustrations/template';
import {
  type GeneratedPatternSheet,
  LidWalletSheetGenerator,
} from '@/components/projects/lid-wallet-sheet-generator';
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
      <style>{`@media print { @page { size: A4 portrait; margin: 12mm; } svg { break-inside: avoid; page-break-inside: avoid; } }`}</style>
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

/**
 * Projekty, jejichž listy umí aplikace vygenerovat v prohlížeči pro změřenou kůži. Formulář
 * předá hotové listy stránce jako další skupinu k zaškrtnutí.
 */
const sheetGenerators: Readonly<
  Record<
    NonNullable<PatternSheetsDefinition['browserGenerator']>,
    ComponentType<{
      baseSheets: readonly PatternSheet[];
      onGenerated: (sheets: GeneratedPatternSheet[]) => void;
    }>
  >
> = {
  'lid-wallet-thickness': LidWalletSheetGenerator,
};

/**
 * Listy střihu z generátoru. Každý list je SVG přesně A4 i s vlastními okraji a kontrolní
 * úsečkou, proto se tiskne bez okrajů stránky (`margin: 0`) a s pojmenovanou stránkou podle
 * orientace. Vytiskne se jen to, co je zaškrtnuté.
 */
function PatternSheetsPrint({
  project,
  definition,
  heading = 'Listy střihu 1:1',
}: {
  project: ProjectDefinition;
  definition: PatternSheetsDefinition;
  heading?: string;
}) {
  const Generator = definition.browserGenerator
    ? sheetGenerators[definition.browserGenerator]
    : undefined;
  const [generated, setGenerated] = useState<GeneratedPatternSheet[]>([]);
  const urls: Readonly<Record<string, string>> = {
    ...patternSheetUrlsFor(project.slug),
    ...Object.fromEntries(generated.map((g) => [g.id, g.url])),
  };
  const sheets: readonly PatternSheet[] = [...definition.sheets, ...generated];
  const groups = groupPatternSheets(sheets);
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(groups[0]?.sheets.map((s) => s.id) ?? []),
  );
  const printable = sheets.filter((s) => selected.has(s.id) && urls[s.id]);
  const onGenerated = (next: GeneratedPatternSheet[]) => {
    setGenerated(next);
    // Vygenerované listy nahradí k tisku výchozí střih; výchozí jde zaškrtnout zpátky.
    setSelected(new Set(next.map((s) => s.id)));
  };
  const orientations = new Set(printable.map((s) => s.orientation));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="mx-auto max-w-[760px] print:max-w-none">
      <style>{`@media print {
        @page sheet-landscape { size: A4 landscape; margin: 0; }
        @page sheet-portrait { size: A4 portrait; margin: 0; }
        .pattern-sheet {
          break-after: page; page-break-after: always;
          width: var(--sheet-w); height: calc(var(--sheet-h) - 1mm); overflow: hidden;
        }
        .pattern-sheet img { width: var(--sheet-w); max-width: none; height: auto; }
        .pattern-sheet:last-child { break-after: auto; page-break-after: auto; }
      }`}</style>
      <BackAndPrint project={project} canPrint={printable.length > 0} />
      <div className="print:hidden">
        <h1 className="mb-2 text-[clamp(24px,3vw,32px)]">
          {heading} · {project.title}
        </h1>
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
        {printable.length === 0 ? (
          <p className="mb-6 text-meta text-ink-2">Vyberte alespoň jeden list.</p>
        ) : null}
        {definition.variantsNote ? (
          <p className="mb-6 max-w-prose text-meta text-ink-2">{typo(definition.variantsNote)}</p>
        ) : null}
        {Generator ? <Generator baseSheets={definition.sheets} onGenerated={onGenerated} /> : null}
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
                page: `sheet-${sheet.orientation}`,
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

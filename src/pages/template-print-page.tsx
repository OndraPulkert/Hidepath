import { Link, useParams } from 'react-router';

import { routes } from '@/app/routes';
import { AssembledIllustration } from '@/components/illustrations/assembled';
import { TemplateIllustration } from '@/components/illustrations/template';
import { Button } from '@/components/ui/button';
import { findProject } from '@/content/projects';
import { NotFoundPage } from '@/pages/not-found-page';

/**
 * Tisková šablona 1:1. SVG má rozměry v milimetrech, takže při tisku na 100 % odpovídá
 * skutečnosti; správnost se ověří kontrolní úsečkou. Nahrazuje samostatné PDF, dokud nebude
 * šablona ověřená na skutečné kůži.
 */
export function TemplatePrintPage() {
  const { projectSlug = '' } = useParams<'projectSlug'>();
  const project = findProject(projectSlug);
  if (!project) return <NotFoundPage />;

  return (
    <div className="mx-auto max-w-[760px] print:max-w-none">
      <style>{`@media print { @page { size: A4 portrait; margin: 12mm; } svg { break-inside: avoid; page-break-inside: avoid; } }`}</style>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to={routes.project(project.slug)}
          className="inline-flex min-h-touch items-center text-body"
        >
          ← {project.title}
        </Link>
        <Button onClick={() => window.print()}>Vytisknout</Button>
      </div>
      <h1 className="mb-2 text-[clamp(24px,3vw,32px)] print:text-[18pt]">
        Šablona 1:1 · {project.title}
      </h1>
      <p className="mb-6 max-w-prose text-body text-ink-2 print:text-[10pt]">
        {project.template.printNote} V dialogu tisku nechte měřítko na 100 % („Výchozí“), papír A4 a
        výchozí okraje.
      </p>
      <div className="overflow-x-auto rounded-md border border-line bg-white p-2 print:break-inside-avoid print:overflow-visible print:border-0 print:p-0">
        <TemplateIllustration
          template={project.template}
          title={`Šablona 1:1: ${project.title}`}
          mode="print"
        />
      </div>
      <div className="mt-6 max-w-[420px] print:hidden">
        <p className="mb-2 kicker print:text-[8pt]">Jak vypadá sestavené</p>
        <AssembledIllustration
          template={project.template}
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

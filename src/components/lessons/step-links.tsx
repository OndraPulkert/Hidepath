import { Link } from 'react-router';

import { appLinkHref } from '@/app/app-links';
import { Button } from '@/components/ui/button';
import { type LessonStep, type ProjectDefinition } from '@/content/schema';

/** Text odkazu pod krokem podle `printLink` (u pásku vede na „Váš pásek“, kde se listy tisknou). */
const printLinkLabel = (
  printLink: NonNullable<LessonStep['printLink']>,
  project: Pick<ProjectDefinition, 'patternSheets'>,
): string => {
  if (printLink === 'practice-sheets') return 'Vytisknout cvičnou šablonu 1:1';
  if (printLink === 'template') return 'Vytisknout šablonu 1:1';
  return project.patternSheets?.browserGenerator === 'belt-config'
    ? 'Váš pásek: listy A4 k tisku'
    : 'Listy střihu 1:1 k tisku';
};

/**
 * Tlačítka pod krokem na stránky aplikace: tisk (`printLink`) a další stránky (`appLinks`),
 * na které text kroku odkazuje „(odkaz pod krokem)“. Stejné v lekci i v dílenském režimu.
 */
export function StepLinks({
  step,
  project,
}: {
  step: LessonStep;
  project: Pick<ProjectDefinition, 'slug' | 'patternSheets'>;
}) {
  const links = [
    ...(step.printLink
      ? [{ to: step.printLink, label: printLinkLabel(step.printLink, project) }]
      : []),
    ...(step.appLinks ?? []),
  ];
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Button
          key={link.to}
          asChild
          variant="secondary"
          className="h-auto min-h-touch py-2 text-left whitespace-normal"
        >
          <Link to={appLinkHref(link.to, project)} className="no-underline">
            {link.label} <span aria-hidden>→</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}

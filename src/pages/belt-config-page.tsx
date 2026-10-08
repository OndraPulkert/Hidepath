import { useParams } from 'react-router';

import { findProject } from '@/content/projects';
import { isBeltConfigProject } from '@/features/belt/active-belt';
import { NotFoundPage } from '@/pages/not-found-page';
import { PatternSheetsPrint } from '@/pages/template-print-page';

/**
 * „Váš pásek“ – začátek projektu pásku a jediné místo, kde se zadávají jeho parametry: nahoře
 * souhrn nákupu, formulář s Mými pásky a pod ním listy A4 k tisku. Jen projekt
 * s `browserGenerator: 'belt-config'`.
 */
export function BeltConfigPage() {
  const { projectSlug = '' } = useParams<'projectSlug'>();
  const project = findProject(projectSlug);
  if (!project?.patternSheets || !isBeltConfigProject(project)) return <NotFoundPage />;
  return (
    <PatternSheetsPrint
      project={project}
      definition={project.patternSheets}
      heading="Váš pásek"
      mode="belt-config"
    />
  );
}

import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import kapsa from '../../../docs/generated/pouzdro-mince-kapsa.svg?url';
import kapsa50 from '../../../docs/generated/pouzdro-mince-kapsa-mince-27-5mm.svg?url';
import papirovyModel from '../../../docs/generated/pouzdro-mince-papirovy-model.svg?url';
import papirovyModel50 from '../../../docs/generated/pouzdro-mince-papirovy-model-mince-27-5mm.svg?url';
import papirovyModel12 from '../../../docs/generated/pouzdro-mince-papirovy-model-kuze-1-2mm.svg?url';
import papirovyModel5012 from '../../../docs/generated/pouzdro-mince-papirovy-model-mince-27-5mm-kuze-1-2mm.svg?url';
import postup from '../../../docs/generated/pouzdro-mince-postup.svg?url';
import sablona from '../../../docs/generated/pouzdro-mince-sablona.svg?url';
import sablona12 from '../../../docs/generated/pouzdro-mince-sablona-kuze-1-2mm.svg?url';
import sablona5012 from '../../../docs/generated/pouzdro-mince-sablona-mince-27-5mm-kuze-1-2mm.svg?url';
import sablona50 from '../../../docs/generated/pouzdro-mince-sablona-mince-27-5mm.svg?url';

/**
 * Soubory listů střihu (SVG 1:1 z generátorů v `scripts/`) podle projektu a `id` listu
 * z `patternSheets`. Stejně jako `lessonBodiesFor`: stránka šablony si soubory bere odsud
 * podle slugu z trasy, druhý generovaný projekt se přidá řádkem tady.
 */
const registry: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  [coinCardHolderProject.slug]: {
    'papirovy-model': papirovyModel,
    sablona,
    kapsa,
    postup,
    'papirovy-model-50kc': papirovyModel50,
    'sablona-50kc': sablona50,
    'kapsa-50kc': kapsa50,
    'papirovy-model-kuze-1-2': papirovyModel12,
    'sablona-kuze-1-2': sablona12,
    'papirovy-model-50kc-kuze-1-2': papirovyModel5012,
    'sablona-50kc-kuze-1-2': sablona5012,
  },
};

export function patternSheetUrlsFor(projectSlug: string): Readonly<Record<string, string>> {
  return registry[projectSlug] ?? {};
}

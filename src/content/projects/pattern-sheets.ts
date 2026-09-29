import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { lidWalletProject } from '@/content/projects/lid-wallet/project';
import vickoDily from '../../../docs/generated/penezenka-vicko-dily.svg?url';
import vickoPripravky from '../../../docs/generated/penezenka-vicko-pripravky.svg?url';
import vickoRub from '../../../docs/generated/penezenka-vicko-rub.svg?url';
import vickoSablona from '../../../docs/generated/penezenka-vicko-sablona.svg?url';
import kapsa from '../../../docs/generated/pouzdro-mince-kapsa.svg?url';
import kapsa40 from '../../../docs/generated/pouzdro-mince-kapsa-mince-40mm.svg?url';
import papirovyModel from '../../../docs/generated/pouzdro-mince-papirovy-model.svg?url';
import papirovyModel12 from '../../../docs/generated/pouzdro-mince-papirovy-model-kuze-1-2mm.svg?url';
import papirovyModel4012 from '../../../docs/generated/pouzdro-mince-papirovy-model-mince-40mm-kuze-1-2mm.svg?url';
import papirovyModel40 from '../../../docs/generated/pouzdro-mince-papirovy-model-mince-40mm.svg?url';
import postup from '../../../docs/generated/pouzdro-mince-postup.svg?url';
import sablona from '../../../docs/generated/pouzdro-mince-sablona.svg?url';
import sablona12 from '../../../docs/generated/pouzdro-mince-sablona-kuze-1-2mm.svg?url';
import sablona4012 from '../../../docs/generated/pouzdro-mince-sablona-mince-40mm-kuze-1-2mm.svg?url';
import sablona40 from '../../../docs/generated/pouzdro-mince-sablona-mince-40mm.svg?url';

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
    'papirovy-model-kuze-1-2': papirovyModel12,
    'sablona-kuze-1-2': sablona12,
    'papirovy-model-40mm': papirovyModel40,
    'sablona-40mm': sablona40,
    'kapsa-40mm': kapsa40,
    'papirovy-model-40mm-kuze-1-2': papirovyModel4012,
    'sablona-40mm-kuze-1-2': sablona4012,
  },
  [lidWalletProject.slug]: {
    sablona: vickoSablona,
    rub: vickoRub,
    dily: vickoDily,
    pripravky: vickoPripravky,
  },
};

export function patternSheetUrlsFor(projectSlug: string): Readonly<Record<string, string>> {
  return registry[projectSlug] ?? {};
}

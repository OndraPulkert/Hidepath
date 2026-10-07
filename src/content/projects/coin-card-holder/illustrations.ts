import druk from '../../../../docs/generated/pouzdro-mince-ilustrace-druk.svg?url';
import lepeniDna from '../../../../docs/generated/pouzdro-mince-ilustrace-lepeni-dna.svg?url';
import poradiOhybu from '../../../../docs/generated/pouzdro-mince-ilustrace-poradi-ohybu.svg?url';
import prenosZnacek from '../../../../docs/generated/pouzdro-mince-ilustrace-prenos-znacek.svg?url';
import prosekavaniDna from '../../../../docs/generated/pouzdro-mince-ilustrace-prosekavani-dna.svg?url';
import krok1 from '../../../../docs/generated/pouzdro-mince-postup-kuze-1-2mm-krok-1.svg?url';
import krok2 from '../../../../docs/generated/pouzdro-mince-postup-kuze-1-2mm-krok-2.svg?url';
import krok3 from '../../../../docs/generated/pouzdro-mince-postup-kuze-1-2mm-krok-3.svg?url';
import krok4 from '../../../../docs/generated/pouzdro-mince-postup-kuze-1-2mm-krok-4.svg?url';
import krok5 from '../../../../docs/generated/pouzdro-mince-postup-kuze-1-2mm-krok-5.svg?url';
import krok6 from '../../../../docs/generated/pouzdro-mince-postup-kuze-1-2mm-krok-6.svg?url';
import krok7 from '../../../../docs/generated/pouzdro-mince-postup-kuze-1-2mm-krok-7.svg?url';
import krok8 from '../../../../docs/generated/pouzdro-mince-postup-kuze-1-2mm-krok-8.svg?url';

/**
 * Obrázky k lekcím: kroky listu postupu pro výchozí kůži 1,2 mm (`buildCoinHolderProcessStepSvg`,
 * `pnpm pattern:coin-holder --thickness 1.2`) a návodné ilustrace
 * (`scripts/coin-card-holder-illustrations.ts`). Oboje generuje skript z modelu střihu.
 */
export const processStep = [krok1, krok2, krok3, krok4, krok5, krok6, krok7, krok8] as const;

export const illustration = {
  prosekavaniDna,
  poradiOhybu,
  druk,
  lepeniDna,
  prenosZnacek,
} as const;

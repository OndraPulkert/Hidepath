import jazycekMagnet from '../../../../docs/generated/penezenka-vicko-ilustrace-jazycek-magnet.svg?url';
import rezAVlozeni from '../../../../docs/generated/penezenka-vicko-ilustrace-rez-a-vlozeni.svg?url';
import vlozkaDna from '../../../../docs/generated/penezenka-vicko-ilustrace-vlozka-dna.svg?url';
import vyrezProPalec from '../../../../docs/generated/penezenka-vicko-ilustrace-vyrez-pro-palec.svg?url';
import zadaOkenka from '../../../../docs/generated/penezenka-vicko-ilustrace-zada-okenka.svg?url';
import zavesPresObsah from '../../../../docs/generated/penezenka-vicko-ilustrace-zaves-pres-obsah.svg?url';

/**
 * Návodné ilustrace k lekcím peněženky Víčko. Generuje je `scripts/lid-wallet-illustrations.ts`
 * z modelu `src/lib/geometry/lid-wallet.ts` (`pnpm pattern:wallet-lid-illustrations`).
 */
export const illustration = {
  rezAVlozeni,
  vlozkaDna,
  zavesPresObsah,
  jazycekMagnet,
  zadaOkenka,
  vyrezProPalec,
} as const;

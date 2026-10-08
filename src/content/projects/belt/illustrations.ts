import obvodMetrem from '../../../../docs/generated/opasek-ilustrace-obvod-metrem.svg?url';
import obvodNaPasku from '../../../../docs/generated/opasek-ilustrace-obvod-na-pasku.svg?url';

/**
 * Návodné ilustrace k lekcím pásku. Generuje je `scripts/belt-illustrations.ts`
 * (`pnpm pattern:belt-illustrations`).
 */
export const illustration = {
  obvodNaPasku,
  obvodMetrem,
} as const;

/** Popisky (alt i figcaption) – stejné v lekci 1 i u formuláře „Váš pásek“. */
export const illustrationCaption = {
  obvodNaPasku:
    'Obvod na pásku, který vám sedí: metr od místa ohybu u přezky ke středu dírky, kterou používáte. Ne od špičky trnu, ne k první dírce.',
  obvodMetrem:
    'Obvod bez pásku: krejčovský metr provlečený všemi poutky kalhot a utažený na pohodlí. Míru odečtěte tam, kde se metr potká s nulou.',
} as const;

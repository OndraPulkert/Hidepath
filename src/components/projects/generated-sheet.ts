import { type PatternSheet } from '@/content/schema';

/** List vygenerovaný v prohlížeči: stejná metadata jako list z obsahu a k tomu data URL SVG. */
export interface GeneratedPatternSheet extends PatternSheet {
  url: string;
}

export const svgDataUrl = (svg: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/**
 * Id vygenerovaného listu k listu z obsahu: `zmerena-<id>`. Stránka tisku podle něj nahradí
 * list z odkazu (`?list=<id>`) listem pro zadané hodnoty.
 */
export const generatedSheetId = (baseId: string): string => `zmerena-${baseId}`;

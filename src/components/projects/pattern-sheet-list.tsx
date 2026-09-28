import { type PatternSheet } from '@/content/schema';
import { typo } from '@/lib/utils/format';

/** Listy rozdělené na výchozí střih a varianty (podle `variant`), v pořadí z obsahu. */
export function groupPatternSheets(
  sheets: readonly PatternSheet[],
): { variant: string | null; sheets: PatternSheet[] }[] {
  const groups: { variant: string | null; sheets: PatternSheet[] }[] = [];
  for (const sheet of sheets) {
    const variant = sheet.variant ?? null;
    const group = groups.find((g) => g.variant === variant);
    if (group) group.sheets.push(sheet);
    else groups.push({ variant, sheets: [sheet] });
  }
  return groups;
}

/**
 * Náhled listů střihu z generátoru (na stránce projektu). Tisk 1:1 je na stránce šablony;
 * tady jen zmenšené náhledy s popisem, co na kterém listu je.
 */
export function PatternSheetList({
  sheets,
  urls,
}: {
  sheets: readonly PatternSheet[];
  urls: Readonly<Record<string, string>>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {groupPatternSheets(sheets).map((group) => (
        <div key={group.variant ?? 'default'} className="flex flex-col gap-2">
          {group.variant ? <p className="kicker">Varianta: {group.variant}</p> : null}
          <ul className="grid [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))] gap-3">
            {group.sheets.map((sheet) => {
              const url = urls[sheet.id];
              return (
                <li key={sheet.id} className="flex flex-col gap-1.5">
                  {url ? (
                    <img
                      src={url}
                      alt={`Náhled listu: ${sheet.title}`}
                      loading="lazy"
                      className="w-full rounded-control border border-line bg-white"
                      style={{ aspectRatio: `${sheet.widthMm} / ${sheet.heightMm}` }}
                    />
                  ) : null}
                  <span className="text-meta font-medium">{typo(sheet.title)}</span>
                  <span className="text-meta text-ink-2">{typo(sheet.note)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

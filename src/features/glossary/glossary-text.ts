import { GLOSSARY_GROUPS, type GlossaryEntry, type GlossaryGroup } from '@/content/schema';

/** Nadpisy skupin slovníčku na stránce projektu. */
export const GLOSSARY_GROUP_LABELS: Readonly<Record<GlossaryGroup, string>> = {
  parts: 'Díly',
  glue: 'Lepení',
  seams: 'Švy',
  tests: 'Zkoušky a zálohy',
};

/** Hesla po skupinách v pořadí `GLOSSARY_GROUPS`; prázdné skupiny vynechá. */
export function groupGlossary(
  entries: readonly GlossaryEntry[],
): { group: GlossaryGroup; label: string; entries: GlossaryEntry[] }[] {
  return GLOSSARY_GROUPS.map((group) => ({
    group,
    label: GLOSSARY_GROUP_LABELS[group],
    entries: entries.filter((e) => e.group === group),
  })).filter((g) => g.entries.length > 0);
}

/** Úsek textu: obyčejný text, nebo výskyt hesla (`entry`). */
export interface GlossarySegment {
  text: string;
  entry?: GlossaryEntry;
}

/** Písmeno, číslice nebo podtržítko (i s diakritikou) – „slovo“ nesmí pokračovat. */
const WORD_CHAR = String.raw`[\p{L}\p{N}_]`;

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matcherCache = new WeakMap<
  readonly GlossaryEntry[],
  { entry: GlossaryEntry; re: RegExp }[]
>();

function matchersFor(entries: readonly GlossaryEntry[]): { entry: GlossaryEntry; re: RegExp }[] {
  const cached = matcherCache.get(entries);
  if (cached) return cached;
  const matchers = entries
    .filter((e) => e.inline !== false)
    .map((entry) => {
      const body = entry.pattern ?? escapeRegExp(entry.term);
      return {
        entry,
        re: new RegExp(`(?<!${WORD_CHAR})(?:${body})(?!${WORD_CHAR})`, 'gu'),
      };
    });
  matcherCache.set(entries, matchers);
  return matchers;
}

/**
 * Rozdělí text na úseky s výskyty hesel slovníčku. Při překryvu vyhraje dřívější a pak delší
 * výskyt („ve stavu B“ před samotným „B“ = záda). Vyznačí se jen **první** výskyt každého hesla
 * v textu (hesla už v `seen` se přeskočí; funkce množinu doplní), další zůstanou obyčejným
 * textem, aby text kroku nebyl samý odkaz.
 */
export function splitGlossaryTerms(
  text: string,
  entries: readonly GlossaryEntry[],
  seen = new Set<string>(),
): GlossarySegment[] {
  const hits: { start: number; end: number; entry: GlossaryEntry }[] = [];
  for (const { entry, re } of matchersFor(entries)) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      if (m[0].length > 0) hits.push({ start: m.index, end: m.index + m[0].length, entry });
    }
  }
  hits.sort((a, b) => a.start - b.start || b.end - a.end);

  const segments: GlossarySegment[] = [];
  let pos = 0;
  for (const hit of hits) {
    if (hit.start < pos) continue; // překryv s už vybraným výskytem
    if (seen.has(hit.entry.term)) {
      // Obsadí místo (aby se „B“ ve „stavu B“ nevykládalo jako záda), ale nevyznačí se.
      segments.push({ text: text.slice(pos, hit.end) });
      pos = hit.end;
      continue;
    }
    seen.add(hit.entry.term);
    if (hit.start > pos) segments.push({ text: text.slice(pos, hit.start) });
    segments.push({ text: text.slice(hit.start, hit.end), entry: hit.entry });
    pos = hit.end;
  }
  if (pos < text.length || segments.length === 0) segments.push({ text: text.slice(pos) });
  return mergeText(segments);
}

/** Sousední obyčejné úseky spojí (po přeskočených výskytech). */
function mergeText(segments: GlossarySegment[]): GlossarySegment[] {
  const out: GlossarySegment[] = [];
  for (const s of segments) {
    const last = out[out.length - 1];
    if (last && !last.entry && !s.entry) last.text += s.text;
    else out.push({ ...s });
  }
  return out;
}

/** Hesla, která se v textu vyskytují (každé jednou, po vyřešení překryvů). */
export function glossaryTermsIn(text: string, entries: readonly GlossaryEntry[]): string[] {
  return splitGlossaryTerms(text, entries).flatMap((s) => (s.entry ? [s.entry.term] : []));
}

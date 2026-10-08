import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { type GlossaryEntry } from '@/content/schema';
import { splitGlossaryTerms } from '@/features/glossary/glossary-text';

/** Okraj bubliny od kraje okna (px). */
const VIEWPORT_GAP = 8;

/**
 * Zkratka v textu s vysvětlivkou: tlačítko (klepnutí / klik / Enter) otevře bublinu se jménem
 * a popisem. Zavře ji Escape, další klepnutí, klepnutí jinam nebo přechod tabulátorem dál. Jméno dílu je v přístupném
 * názvu tlačítka, takže ho čtečka přečte i bez otevření.
 */
export function GlossaryTerm({ text, entry }: { text: string; entry: GlossaryEntry }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Bublina nesmí přetéct z okna (telefon 390 px): posunout ji zpět dovnitř.
  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    if (!open || !bubble) return;
    bubble.style.transform = '';
    const rect = bubble.getBoundingClientRect();
    const maxRight = document.documentElement.clientWidth - VIEWPORT_GAP;
    let shift = 0;
    if (rect.right > maxRight) shift = maxRight - rect.right;
    if (rect.left + shift < VIEWPORT_GAP) shift = VIEWPORT_GAP - rect.left;
    if (shift !== 0) bubble.style.transform = `translateX(${Math.round(shift)}px)`;
  }, [open]);

  return (
    <span
      ref={rootRef}
      className="relative inline-block"
      onBlur={(e) => {
        // Tab na jiný prvek bublinu zavře (klávesnice), klepnutí do bubliny ne.
        if (!rootRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`${text} – ${entry.name}`}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help rounded-sm font-semibold text-inherit underline decoration-cognac decoration-dotted decoration-2 underline-offset-[3px] hover:text-cognac-deep"
      >
        {text}
      </button>
      {open ? (
        <span
          ref={bubbleRef}
          id={id}
          role="note"
          tabIndex={-1}
          className="absolute top-full left-0 z-30 mt-1.5 block w-max max-w-[min(20rem,calc(100vw-16px))] rounded-md border border-line-strong bg-paper px-3 py-2 text-left text-[15px] leading-snug font-normal text-leather shadow-lg"
        >
          <span className="block font-semibold">
            {entry.term} – {entry.name}
          </span>
          <span className="block">{entry.description}</span>
          <span className="mt-1 block text-ink-2">{entry.where}</span>
        </span>
      ) : null}
    </span>
  );
}

/**
 * Text s vyznačenými zkratkami ze slovníčku projektu (první výskyt každé zkratky v textu).
 * Bez slovníčku vrátí text beze změny.
 */
export function GlossaryText({
  text,
  entries,
}: {
  text: string;
  entries: readonly GlossaryEntry[] | undefined;
}) {
  const segments = useMemo(
    () => (entries ? splitGlossaryTerms(text, entries) : [{ text }]),
    [text, entries],
  );
  return (
    <>
      {segments.map((s, i) =>
        s.entry ? <GlossaryTerm key={i} text={s.text} entry={s.entry} /> : s.text,
      )}
    </>
  );
}

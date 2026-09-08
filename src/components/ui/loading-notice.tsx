/** Jednotný stav „načítáme“ – místo bliknutí prázdných hodnot. */
export function LoadingNotice({ label = 'Načítáme váš postup…' }: { label?: string }) {
  return (
    <p role="status" aria-live="polite" className="py-10 text-center text-body text-ink-2">
      {label}
    </p>
  );
}

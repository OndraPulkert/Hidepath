import { useState } from 'react';

import { PROJECT_GLOSSARY_ANCHOR } from '@/app/routes';
import { LidPartsDiagram } from '@/components/lid-wallet/lid-parts-diagram';
import { Card } from '@/components/ui/card';
import { type Glossary } from '@/content/schema';
import { groupGlossary } from '@/features/glossary/glossary-text';
import { typo } from '@/lib/utils/format';

/** Od této šířky je karta rozbalená hned (na telefonu sbalená, aby nezabrala celou stránku). */
const OPEN_MEDIA = '(min-width: 768px)';

function initiallyOpen(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.location.hash === `#${PROJECT_GLOSSARY_ANCHOR}`) return true;
  return window.matchMedia?.(OPEN_MEDIA).matches ?? true;
}

/**
 * Karta „Díly a zkratky“ na stránce projektu: schéma (má-li ho projekt) a seznam hesel po
 * skupinách (Díly · Lepení · Švy · Zkoušky a zálohy). Na telefonu sbalená.
 */
export function GlossaryCard({ glossary }: { glossary: Glossary }) {
  const [open, setOpen] = useState(initiallyOpen);
  const groups = groupGlossary(glossary.entries);
  return (
    <Card id={PROJECT_GLOSSARY_ANCHOR} className="scroll-mt-24">
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="group">
        <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <span className="flex flex-col">
            <span className="kicker">Díly a zkratky</span>
            <span className="font-serif text-h2 font-medium">{glossary.title}</span>
          </span>
          <span
            aria-hidden
            className="text-[20px] text-ink-2 transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <div className="mt-3 flex flex-col gap-4">
          {glossary.diagram === 'lid-wallet-strip' ? (
            <figure className="flex flex-col gap-2">
              <LidPartsDiagram className="mx-auto h-auto w-full max-w-[380px]" />
              <figcaption className="text-meta text-ink-2">
                Pás P1 rozložený, pohled na rub (výchozí střih). Čárkovaně přepážky D1 a D2 na svých
                místech.
              </figcaption>
            </figure>
          ) : null}
          {groups.map((g) => (
            <section key={g.group} aria-labelledby={`slovnicek-${g.group}`}>
              <h3
                id={`slovnicek-${g.group}`}
                className="mb-1 border-b border-line pb-1 text-[17px] font-semibold"
              >
                {g.label}
              </h3>
              <dl className="divide-y divide-dashed divide-line">
                {g.entries.map((e) => (
                  <div key={e.term} className="grid grid-cols-[6rem_1fr] gap-x-3 py-2">
                    <dt className="font-mono text-[15px] font-semibold text-cognac-deep">
                      {e.term}
                    </dt>
                    <dd className="text-body">
                      <span className="font-semibold">{typo(e.name)}</span>
                      <span className="block text-meta text-ink-2">{typo(e.description)}</span>
                      <span className="block text-meta text-ink-2">{typo(e.where)}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </details>
    </Card>
  );
}

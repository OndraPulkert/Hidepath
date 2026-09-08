import { type ReactNode } from 'react';

import { Card } from '@/components/ui/card';

export interface NoticeBoxProps {
  kind: 'mistakes' | 'safety' | 'lock' | 'checkpoint';
  title: string;
  children: ReactNode;
}

const tones = {
  mistakes: 'brass',
  safety: 'cognac',
  lock: 'dashed',
  checkpoint: 'forest',
} as const;

/** Upozornění podle styleguidu: Časté chyby (brass), Bezpečnost (cognac tint), Zámek (dashed), Kontrolní bod (forest). */
export function NoticeBox({ kind, title, children }: NoticeBoxProps) {
  return (
    <Card tone={tones[kind]} role="note" aria-label={title} className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-h2">
        {kind === 'safety' ? (
          <span
            aria-hidden
            className="inline-flex size-6 items-center justify-center rounded-full border border-cognac text-[14px] font-bold text-cognac-deep"
          >
            !
          </span>
        ) : null}
        {title}
      </h3>
      <div className="text-body [&_li+li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </Card>
  );
}

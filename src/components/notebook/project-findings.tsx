import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { routes } from '@/app/routes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Kicker } from '@/components/ui/kicker';
import { Label, Textarea } from '@/components/ui/input';
import { type ProjectDefinition } from '@/content/schema';
import {
  buildProjectFindings,
  countFindings,
  formatFindingsText,
  projectHasRecordFields,
} from '@/features/notebook/findings';
import { useLessonRecords } from '@/features/notebook/use-lesson-records';
import { formatOrdinalCode, pluralizeCs, typo } from '@/lib/utils/format';

export interface ProjectFindingsProps {
  project: ProjectDefinition;
}

/**
 * Karta „Co jsem zjistil“ na stránce projektu: zápisy ze zápisníku po lekcích s odkazem
 * na krok, a tlačítko na zkopírování všeho jako text. Projekt bez polí zápisníku kartu nemá.
 */
export function ProjectFindings({ project }: ProjectFindingsProps) {
  const records = useLessonRecords(project.slug);
  const hasFields = useMemo(() => projectHasRecordFields(project), [project]);
  const findings = useMemo(
    () => buildProjectFindings(project, records.data ?? []),
    [project, records.data],
  );
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle');
  if (!hasFields) return null;

  const count = countFindings(findings);
  const exportText = formatFindingsText(project, findings);
  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyState('copied');
    } catch {
      setCopyState('manual');
    }
  };

  return (
    <Card role="region" className="flex flex-col gap-3" aria-labelledby="project-findings-title">
      <Kicker>Zápisník</Kicker>
      <h2 id="project-findings-title" className="text-h2">
        Co jsem zjistil
      </h2>
      {records.isPending ? null : count === 0 ? (
        <p className="text-meta text-ink-2">
          Zatím nic nezapsáno. Naměřené hodnoty a volby zapisujte přímo u kroků lekcí.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {findings.map((lesson) => (
            <section key={lesson.lessonSlug} aria-labelledby={`findings-${lesson.lessonSlug}`}>
              <h3 id={`findings-${lesson.lessonSlug}`} className="text-body font-semibold">
                <Link
                  to={routes.lesson(project.slug, lesson.lessonSlug)}
                  className="inline-flex min-h-touch items-center hover:text-cognac"
                >
                  {formatOrdinalCode(lesson.lessonOrder)} · {typo(lesson.lessonTitle)}
                </Link>
              </h3>
              <dl className="flex flex-col gap-2">
                {lesson.items.map((f) => (
                  <div key={f.fieldId} className="flex flex-col">
                    <dt className="text-meta text-ink-2">{typo(f.label)}</dt>
                    <dd className="flex flex-wrap items-baseline gap-x-2 text-body">
                      <span className="font-semibold break-words">{typo(f.display)}</span>
                      {f.target === 'warn' ? (
                        <span className="text-meta text-cognac-deep">
                          mimo cíl{f.targetLabel ? ` (${typo(f.targetLabel)})` : ''}
                        </span>
                      ) : null}
                      <Link
                        to={routes.lessonFocus(project.slug, lesson.lessonSlug, f.stepNumber)}
                        className="inline-flex min-h-touch items-center text-meta text-ink-2 underline hover:text-cognac"
                        aria-label={`Krok ${f.stepNumber}: ${f.stepTitle}`}
                      >
                        krok {f.stepNumber}
                      </Link>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={exportText.length === 0}
          onClick={() => void copyAll()}
        >
          Zkopírovat zápisník
        </Button>
        {count > 0 ? (
          <span className="text-meta text-ink-2" role="status">
            {copyState === 'copied'
              ? 'Zkopírováno do schránky.'
              : pluralizeCs(count, ['zápis', 'zápisy', 'zápisů'])}
          </span>
        ) : null}
      </div>
      {copyState === 'manual' ? (
        <div>
          <Label htmlFor="project-findings-export">
            Schránka není dostupná – text zkopírujte ručně
          </Label>
          <Textarea id="project-findings-export" rows={8} readOnly value={exportText} />
        </div>
      ) : null}
    </Card>
  );
}

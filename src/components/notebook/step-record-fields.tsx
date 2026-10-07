import { type KeyboardEvent, useId, useState } from 'react';

import { type StepExtrasProps } from '@/components/lessons/step-extras';
import { Input, Label } from '@/components/ui/input';
import { Segment, SegmentButton } from '@/components/ui/segment';
import { type LessonDefinition, type ProjectDefinition, type RecordField } from '@/content/schema';
import { latestEntriesByField } from '@/features/notebook/findings';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { useLessonRecords, useSaveLessonRecord } from '@/features/notebook/use-lesson-records';
import {
  evaluateTarget,
  parseRecordInput,
  RECORD_TEXT_MAX_LENGTH,
  recordInputText,
} from '@/features/notebook/values';
import { typo } from '@/lib/utils/format';

/**
 * Pole zápisníku kroku (`step.records`): číslo s jednotkou, volba, krátký text. Číslo a text
 * se uloží při opuštění pole (nebo Enterem), volba hned po klepnutí; opětovné klepnutí na
 * vybranou možnost ji zruší. Zápisy jsou v zařízení, s účtem se synchronizují.
 */
export function StepRecordFields({ project, lesson, step }: StepExtrasProps) {
  const records = useLessonRecords(project.slug);
  if (!step.records) return null;
  const latest = latestEntriesByField(records.data ?? [], project.slug);
  return (
    <section
      aria-label={`Zápisník: ${step.title}`}
      className="flex flex-col gap-4 rounded-md border border-line bg-paper p-4"
    >
      <p className="kicker">Zapište si</p>
      {step.records.map((field) => (
        <RecordFieldInput
          key={field.id}
          project={project}
          lesson={lesson}
          field={field}
          entry={latest.get(field.id)}
        />
      ))}
    </section>
  );
}

interface RecordFieldInputProps {
  project: ProjectDefinition;
  lesson: LessonDefinition;
  field: RecordField;
  entry: LessonRecordEntry | undefined;
}

function RecordFieldInput(props: RecordFieldInputProps) {
  return props.field.kind === 'choice' ? (
    <ChoiceField {...props} field={props.field} />
  ) : (
    <TypedField {...props} />
  );
}

function SaveStatus({
  id,
  pending,
  failed,
  error,
  extra,
}: {
  id: string;
  pending: boolean;
  failed: boolean;
  error: string | null;
  extra: string | null;
}) {
  const text =
    error ??
    (pending ? 'Ukládám…' : failed ? 'Uložení se nezdařilo, hodnota zůstává v poli.' : extra);
  return (
    <p
      id={id}
      role="status"
      className={error || failed ? 'mt-1 text-meta text-cognac-deep' : 'mt-1 text-meta text-ink-2'}
    >
      {text ? typo(text) : null}
    </p>
  );
}

/** Číslo nebo krátký text. */
function TypedField({ project, lesson, field, entry }: RecordFieldInputProps) {
  const id = useId();
  const save = useSaveLessonRecord(project);
  // Rozepsaný text drží pole, dokud se uložení nepotvrdí (jako poznámky od ponku).
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stored = recordInputText(field, entry?.value);
  const value = draft ?? stored;

  const commit = () => {
    if (draft === null) return;
    const parsed = parseRecordInput(field, draft);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    if (draft.trim() === stored) {
      setDraft(null);
      return;
    }
    const committed = draft;
    save.mutate(
      { lessonSlug: lesson.slug, fieldId: field.id, value: parsed.value },
      // Co uživatel mezitím dopsal, zůstává v poli (uloží se při dalším opuštění).
      { onSuccess: () => setDraft((d) => (d === committed ? null : d)) },
    );
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  };

  const target = field.kind === 'number' ? field.target : undefined;
  const status = evaluateTarget(field, entry?.value);
  const targetText =
    draft === null && target && status !== 'unknown'
      ? status === 'ok'
        ? `Uloženo. V cíli (${target.label}).`
        : `Uloženo, ale mimo cíl (${target.label}). Vraťte se k postupu v kroku.`
      : null;
  const savedText = targetText ?? (entry && entry.value !== null ? 'Uloženo.' : null);
  const unit = field.kind === 'number' ? field.unit : '';
  const hintId = `${id}-hint`;
  const statusId = `${id}-status`;

  return (
    <div>
      <Label htmlFor={id}>{typo(field.label)}</Label>
      {field.hint ? (
        <p id={hintId} className="mb-1.5 text-meta text-ink-2">
          {typo(field.hint)}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <Input
          id={id}
          // Dolní lišta (Zpět/Další) nesmí zakrýt pole, na které přešel fokus.
          className={field.kind === 'number' ? 'max-w-40 scroll-mb-28' : 'scroll-mb-28'}
          inputMode={
            field.kind === 'number' ? (field.decimals === 0 ? 'numeric' : 'decimal') : undefined
          }
          enterKeyHint="done"
          autoComplete="off"
          maxLength={
            field.kind === 'text' ? (field.maxLength ?? RECORD_TEXT_MAX_LENGTH) : undefined
          }
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={[field.hint ? hintId : null, statusId].filter(Boolean).join(' ')}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
        {unit ? (
          <span aria-hidden className="text-body text-ink-2">
            {unit}
          </span>
        ) : null}
      </div>
      <SaveStatus
        id={statusId}
        pending={save.isPending}
        failed={save.isError}
        error={error}
        extra={savedText}
      />
    </div>
  );
}

/** Volba z několika možností: segmentová tlačítka. */
function ChoiceField({
  project,
  lesson,
  field,
  entry,
}: RecordFieldInputProps & { field: Extract<RecordField, { kind: 'choice' }> }) {
  const id = useId();
  const save = useSaveLessonRecord(project);
  // Během ukládání ukazuje klepnutou možnost hned (telefon u ponku, žádné čekání).
  const [pendingValue, setPendingValue] = useState<string | null | undefined>(undefined);
  const stored = typeof entry?.value === 'string' ? entry.value : null;
  const current = pendingValue !== undefined ? pendingValue : stored;

  const choose = (value: string) => {
    const next = current === value ? null : value;
    setPendingValue(next);
    save.mutate(
      { lessonSlug: lesson.slug, fieldId: field.id, value: next },
      { onSettled: () => setPendingValue(undefined) },
    );
  };

  const hintId = `${id}-hint`;
  const statusId = `${id}-status`;
  return (
    <div role="group" aria-labelledby={`${id}-label`} aria-describedby={statusId}>
      <p id={`${id}-label`} className="mb-1.5 text-meta font-medium text-ink-2">
        {typo(field.label)}
      </p>
      {field.hint ? (
        <p id={hintId} className="mb-1.5 text-meta text-ink-2">
          {typo(field.hint)}
        </p>
      ) : null}
      <Segment>
        {field.options.map((option) => (
          <SegmentButton
            key={option.value}
            active={current === option.value}
            className="scroll-mb-28 whitespace-normal"
            onClick={() => choose(option.value)}
          >
            {typo(option.label)}
          </SegmentButton>
        ))}
      </Segment>
      <SaveStatus
        id={statusId}
        pending={save.isPending}
        failed={save.isError}
        error={null}
        extra={current !== null ? 'Uloženo. Opětovným klepnutím volbu zrušíte.' : null}
      />
    </div>
  );
}

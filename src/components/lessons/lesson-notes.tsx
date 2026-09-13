import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label, Textarea } from '@/components/ui/input';
import { type LessonDefinition, type ProjectDefinition } from '@/content/schema';
import { countNotedLessons, formatProjectNotes } from '@/features/notes/format-notes';
import { useLessonNotes, useSaveLessonNote } from '@/features/notes/use-lesson-notes';

const timeFormat = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit' });

/**
 * Poznámky od ponku k lekci. Ukládá se při opuštění pole (telefon na stole, jedna
 * ruka na šídle – žádné tlačítko „Uložit“). Vždy dostupné, i u zamčené lekce:
 * „nemám nástroj X“ je taky poznámka.
 */
export function LessonNotes({
  project,
  lesson,
}: {
  project: ProjectDefinition;
  lesson: LessonDefinition;
}) {
  const notes = useLessonNotes(project.slug);
  const save = useSaveLessonNote(project.slug);
  const current = notes.data?.find((n) => n.lessonSlug === lesson.slug);
  // Rozepsaný text drží komponenta, dokud se uložení nepotvrdí; pak zase čte uložený.
  // Pole se při načítání nezamyká: čte se z tohoto zařízení, tedy okamžitě, a kdyby
  // uživatel začal psát dřív, rozepsaný text má přednost.
  const [draft, setDraft] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const value = draft ?? current?.text ?? '';
  const fieldId = `note-${lesson.slug}`;

  const commit = () => {
    if (draft === null || draft === (current?.text ?? '')) {
      setDraft(null);
      return;
    }
    save.mutate({ lessonSlug: lesson.slug, text: draft }, { onSuccess: () => setDraft(null) });
  };

  const all = notes.data ?? [];
  const noted = countNotedLessons(all);
  const exportText = formatProjectNotes(project, all);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyState('copied');
    } catch {
      setCopyState('manual');
    }
  };

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h2 className="text-h2">Poznámky od ponku</h2>
        <p className="mt-1 text-meta text-ink-2">
          Kde jste se zasekli, co nebylo jasné, co příště uděláte jinak. Napište i číslo kroku.
          Poznámky zůstávají v tomto zařízení; tlačítkem níž zkopírujete všechny k projektu, ať je
          můžete poslat dál.
        </p>
      </div>
      <div>
        <Label htmlFor={fieldId}>Poznámka k této lekci</Label>
        <Textarea
          id={fieldId}
          rows={4}
          value={value}
          placeholder="např. krok 3 – nevěděl jsem, kterou stranou díl otočit"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
        />
        <p className="mt-1 text-meta text-ink-2" role="status">
          {save.isPending
            ? 'Ukládám…'
            : save.isError
              ? 'Uložení se nezdařilo, text zůstává v poli.'
              : current
                ? `Uloženo ${timeFormat.format(new Date(current.updatedAt))}`
                : 'Uloží se, když z pole odejdete.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={exportText.length === 0}
          onClick={() => void copyAll()}
        >
          Zkopírovat všechny poznámky
        </Button>
        <span className="text-meta text-ink-2">
          {noted === 0
            ? 'Zatím žádná poznámka.'
            : copyState === 'copied'
              ? 'Zkopírováno do schránky.'
              : `Poznámky u ${noted} ${noted === 1 ? 'lekce' : noted < 5 ? 'lekcí' : 'lekcí'}.`}
        </span>
      </div>
      {copyState === 'manual' ? (
        <div>
          <Label htmlFor={`${fieldId}-export`}>
            Schránka není dostupná – text zkopírujte ručně
          </Label>
          <Textarea id={`${fieldId}-export`} rows={8} readOnly value={exportText} />
        </div>
      ) : null}
    </Card>
  );
}

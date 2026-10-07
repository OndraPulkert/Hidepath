import { type TimerRecord } from '@/features/timers/timers';

/**
 * Událost do kalendáře (.ics) pro dlouhé čekání (přes noc, 24 h). Zavřená PWA na telefonu
 * nespustí JavaScript, takže pípnutí nepřijde – připomínku obstará kalendář.
 */
export interface TimerIcsInput {
  timer: Pick<TimerRecord, 'id' | 'label' | 'endsAt'>;
  /** Název lekce do textu události. */
  lessonTitle: string;
  /** Absolutní adresa kroku v aplikaci. */
  url: string;
  now: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Datum a čas v UTC ve formátu iCalendar: 20261007T140500Z. */
export function icsDate(epochMs: number): string {
  const d = new Date(epochMs);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Escapování textu podle RFC 5545 (\\, ;, , a konce řádků). */
export function icsEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Zalomí řádek na 75 oktetů (UTF-8) podle RFC 5545. */
export function icsFold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const ch of line) {
    const len = encoder.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (size + len > limit) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += ch;
    size += len;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

export function buildTimerIcs({ timer, lessonTitle, url, now }: TimerIcsInput): string {
  const summary = `Hidepath: ${timer.label} – hotovo`;
  const description = `${lessonTitle}. Pokračujte dalším krokem: ${url}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hidepath//Casovac//CS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${timer.id}@hidepath`,
    `DTSTAMP:${icsDate(now)}`,
    `DTSTART:${icsDate(timer.endsAt)}`,
    `DTEND:${icsDate(timer.endsAt + 15 * 60_000)}`,
    `SUMMARY:${icsEscape(summary)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(summary)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(icsFold).join('\r\n')}\r\n`;
}

/** Název souboru bez diakritiky a mezer: „hidepath-zavadnuti-lepidla.ics“. */
export function icsFileName(label: string): string {
  const slug = label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `hidepath-${slug || 'casovac'}.ics`;
}

import { buildTimerIcs, icsDate, icsEscape, icsFileName, icsFold } from '@/features/timers/ics';

describe('ics', () => {
  it('icsDate je UTC ve formátu iCalendar', () => {
    expect(icsDate(Date.UTC(2026, 9, 7, 14, 5, 9))).toBe('20261007T140509Z');
  });

  it('icsEscape escapuje speciální znaky', () => {
    expect(icsEscape('a;b,c\\d\ne')).toBe('a\\;b\\,c\\\\d\\ne');
  });

  it('icsFold zalomí dlouhé řádky po 75 oktetech i s diakritikou', () => {
    const line = `SUMMARY:${'ž'.repeat(60)}`;
    const folded = icsFold(line);
    const parts = folded.split('\r\n');
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) expect(new TextEncoder().encode(p).length).toBeLessThanOrEqual(75);
    expect(parts.slice(1).every((p) => p.startsWith(' '))).toBe(true);
    expect(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join('')).toBe(line);
    expect(icsFold('KRATKE')).toBe('KRATKE');
  });

  it('událost začíná koncem časovače a má připomínku', () => {
    const endsAt = Date.UTC(2026, 9, 8, 6, 0, 0);
    const ics = buildTimerIcs({
      timer: { id: 'abc', label: 'Schnutí přes noc', endsAt },
      lessonTitle: 'Tvarování, lekce 6',
      url: 'https://hidepath.app/projects/x/lessons/y/focus?krok=3',
      now: Date.UTC(2026, 9, 7, 18, 0, 0),
    });
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('UID:abc@hidepath');
    expect(ics).toContain('DTSTART:20261008T060000Z');
    expect(ics).toContain('DTEND:20261008T061500Z');
    expect(ics).toContain('DTSTAMP:20261007T180000Z');
    expect(ics).toContain('SUMMARY:Hidepath: Schnutí přes noc – hotovo');
    expect(ics).toContain('Tvarování\\, lekce 6');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:PT0M');
  });

  it('icsFileName je bez diakritiky', () => {
    expect(icsFileName('Zavadnutí lepidla')).toBe('hidepath-zavadnuti-lepidla.ics');
    expect(icsFileName('!!!')).toBe('hidepath-casovac.ics');
  });
});

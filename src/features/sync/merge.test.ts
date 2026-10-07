import { mergeRemote, nextUpdatedAt } from '@/features/sync/merge';

interface Row {
  id: string;
  key: string;
  value: number;
  updatedAt: string;
}

const key = (r: Row) => r.key;
const row = (id: string, k: string, value: number, at: string): Row => ({
  id,
  key: k,
  value,
  updatedAt: `2026-10-07T${at}:00.000Z`,
});
const none = new Set<string>();

describe('mergeRemote', () => {
  it('přidá záznamy, které jsou jen na serveru', () => {
    const result = mergeRemote([], [row('s1', 'a', 1, '10:00')], key, none);
    expect(result.records).toEqual([row('s1', 'a', 1, '10:00')]);
    expect(result.changed).toBe(true);
    expect(result.resend).toEqual([]);
  });

  it('novější serverová verze přepíše lokální (last-write-wins)', () => {
    const result = mergeRemote(
      [row('l1', 'a', 1, '10:00')],
      [row('s1', 'a', 2, '11:00')],
      key,
      none,
    );
    expect(result.records).toEqual([row('s1', 'a', 2, '11:00')]);
  });

  it('při shodném čase vyhraje server', () => {
    const result = mergeRemote(
      [row('l1', 'a', 1, '10:00')],
      [row('s1', 'a', 2, '10:00')],
      key,
      none,
    );
    expect(result.records[0]?.value).toBe(2);
  });

  it('klíč s čekající lokální změnou se nepřepíše ani novějším serverem', () => {
    const result = mergeRemote(
      [row('l1', 'a', 1, '10:00')],
      [row('s1', 'a', 2, '12:00')],
      key,
      new Set(['a']),
    );
    expect(result.records).toEqual([row('l1', 'a', 1, '10:00')]);
    expect(result.changed).toBe(false);
  });

  it('čekající smazání: serverový řádek se lokálně neobnoví', () => {
    const result = mergeRemote<Row>([], [row('s1', 'a', 2, '12:00')], key, new Set(['a']));
    expect(result.records).toEqual([]);
    expect(result.changed).toBe(false);
    expect(result.resend).toEqual([]);
  });

  it('lokálně novější záznam bez čekající změny převezme id serveru a vrátí se k odeslání', () => {
    const result = mergeRemote(
      [row('l1', 'a', 5, '12:00')],
      [row('s1', 'a', 2, '10:00')],
      key,
      none,
    );
    expect(result.records).toEqual([row('s1', 'a', 5, '12:00')]);
    expect(result.resend).toEqual([row('s1', 'a', 5, '12:00')]);
  });

  it('lokální záznam bez čekající změny, který na serveru není, zůstane a vrátí se k odeslání', () => {
    // Mazání se šíří jen čekající změnou „delete“; chybějící položka outboxu (plné úložiště,
    // souběh záložek) nesmí vést ke ztrátě nového záznamu.
    const result = mergeRemote([row('l1', 'a', 1, '10:00')], [], key, none);
    expect(result.records).toEqual([row('l1', 'a', 1, '10:00')]);
    expect(result.resend).toEqual([row('l1', 'a', 1, '10:00')]);
    expect(result.changed).toBe(false);
  });

  it('lokální záznam s čekající změnou zůstane, i když ho server ještě nemá', () => {
    const result = mergeRemote([row('l1', 'a', 1, '10:00')], [], key, new Set(['a']));
    expect(result.records).toEqual([row('l1', 'a', 1, '10:00')]);
    expect(result.changed).toBe(false);
  });

  it('beze změny hlásí changed=false (bez ohledu na pořadí)', () => {
    const a = row('s1', 'a', 1, '10:00');
    const b = row('s2', 'b', 2, '10:00');
    expect(mergeRemote([a, b], [b, a], key, none).changed).toBe(false);
  });
});

describe('nextUpdatedAt', () => {
  const at = (iso: string) => Date.parse(iso);
  it('bez předchozího stavu vrátí čas zařízení', () => {
    expect(nextUpdatedAt(undefined, at('2026-10-07T12:00:00.000Z'))).toBe(
      '2026-10-07T12:00:00.000Z',
    );
  });
  it('je vždy pozdější než známý stav, i když hodiny zařízení jdou pozadu', () => {
    expect(nextUpdatedAt('2026-10-07T12:10:00.000Z', at('2026-10-07T12:05:00.000Z'))).toBe(
      '2026-10-07T12:10:00.001Z',
    );
    expect(nextUpdatedAt('2026-10-07T12:00:00.000Z', at('2026-10-07T12:05:00.000Z'))).toBe(
      '2026-10-07T12:05:00.000Z',
    );
  });
});

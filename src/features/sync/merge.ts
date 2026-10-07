/**
 * Sloučení stavu ze serveru do lokální kopie (pull). Pravidla (§10, last-write-wins):
 * - klíč s čekající lokální změnou v outboxu se nepřepíše – lokální zápis teprve odejde
 *   (u čekajícího smazání se serverový řádek lokálně neobnoví);
 * - jinak vyhraje novější `updatedAt`; při shodě server (je potvrzený);
 * - záznam jen na serveru se přidá;
 * - záznam jen lokálně bez čekající změny zůstane a znovu se odešle (`resend`): mazání se
 *   šíří jen čekající změnou „delete“, takže chybějící položka outboxu (plné úložiště, souběh
 *   záložek) nesmí vést ke ztrátě nového záznamu.
 * Lokální záznam, který vyhraje nad serverovým se stejným klíčem, převezme id serveru,
 * aby další zápis nevytvářel kolizi přirozeného klíče, a vrátí se v `resend` – bez čekající
 * změny by se na server jinak nikdy nedostal.
 */
export interface SyncRecord {
  id: string;
  updatedAt: string;
}

export interface MergeResult<T> {
  records: T[];
  /** Liší se výsledek od lokálního stavu? (pro invalidaci cache v UI) */
  changed: boolean;
  /** Lokálně novější záznamy bez čekající změny: znovu zařadit do outboxu. */
  resend: T[];
}

/**
 * Razítko `updatedAt` pro novou úpravu: čas zařízení, ale vždy později než známý stav záznamu
 * (`previous`, např. právě stažený ze serveru). LWW se řídí časem klienta – bez toho by úpravu
 * ze zařízení s hodinami pozadu tiše přebil starší zápis s razítkem „z budoucnosti“ (jiné
 * zařízení s hodinami napřed, nebo now() serveru po opakovaném odeslání).
 */
export function nextUpdatedAt(previous: string | undefined, now: number): string {
  const known = previous === undefined ? Number.NaN : Date.parse(previous);
  return new Date(Number.isNaN(known) ? now : Math.max(now, known + 1)).toISOString();
}

function time(value: string): number {
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

export function mergeRemote<T extends SyncRecord>(
  local: readonly T[],
  remote: readonly T[],
  naturalKey: (record: T) => string,
  pendingKeys: ReadonlySet<string>,
): MergeResult<T> {
  const localByKey = new Map(local.map((r) => [naturalKey(r), r]));
  const remoteByKey = new Map(remote.map((r) => [naturalKey(r), r]));
  const out: T[] = [];
  const resend: T[] = [];

  for (const [key, server] of remoteByKey) {
    const mine = localByKey.get(key);
    if (pendingKeys.has(key)) {
      // Čekající lokální změna má přednost. Chybí-li záznam lokálně, čeká jeho smazání –
      // serverový řádek se nesmí vrátit, dokud smazání neodejde.
      if (mine) out.push(mine);
    } else if (!mine) {
      out.push(server);
    } else if (time(mine.updatedAt) > time(server.updatedAt)) {
      const winner = mine.id === server.id ? mine : { ...mine, id: server.id };
      out.push(winner);
      resend.push(winner);
    } else {
      out.push(server);
    }
  }
  for (const [key, mine] of localByKey) {
    if (remoteByKey.has(key)) continue;
    out.push(mine);
    if (!pendingKeys.has(key)) resend.push(mine);
  }

  return { records: out, changed: !sameRecords(local, out, naturalKey), resend };
}

function sameRecords<T>(a: readonly T[], b: readonly T[], naturalKey: (record: T) => string) {
  if (a.length !== b.length) return false;
  const byKey = new Map(a.map((r) => [naturalKey(r), JSON.stringify(r)]));
  return b.every((r) => byKey.get(naturalKey(r)) === JSON.stringify(r));
}

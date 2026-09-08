/**
 * Vygeneruje docs/content/shot-list.md ze všech `media` slotů obsahu (ADR 001).
 * Spuštění: pnpm content:shot-list
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { equipmentList } from '../src/content/equipment/index.ts';
import { cardHolderProject } from '../src/content/projects/card-holder/project.ts';
import { type MediaSlot } from '../src/content/schema.ts';

interface Row {
  where: string;
  media: MediaSlot;
}

const rows: Row[] = [];

for (const m of cardHolderProject.media)
  rows.push({ where: `Projekt · ${cardHolderProject.title}`, media: m });
for (const lesson of cardHolderProject.lessons) {
  for (const m of lesson.media)
    rows.push({ where: `Lekce ${lesson.order} · hlavní záběr`, media: m });
  lesson.steps.forEach((step, i) => {
    for (const m of step.media)
      rows.push({ where: `Lekce ${lesson.order} · krok ${i + 1}: ${step.title}`, media: m });
  });
}
for (const e of equipmentList)
  for (const m of e.media) rows.push({ where: `Vybavení · ${e.name}`, media: m });

const kindLabel = { photo: 'foto', video: 'video', illustration: 'ilustrace' } as const;
const statusLabel = { planned: 'natočit', available: 'hotovo' } as const;

const planned = rows.filter((r) => r.media.status === 'planned');
const available = rows.filter((r) => r.media.status === 'available');

const lines = [
  '# Seznam záběrů (generováno)',
  '',
  `Zdroj: \`src/content\`. Regenerace: \`pnpm content:shot-list\`. Neupravovat ručně.`,
  '',
  `Celkem ${rows.length} slotů · k natočení ${planned.length} · hotovo ${available.length}.`,
  '',
  '## K natočení',
  '',
  '| Kde | Typ | Co má záběr zachytit | Délka |',
  '| --- | --- | --- | --- |',
  ...planned.map(
    (r) =>
      `| ${r.where} | ${kindLabel[r.media.kind]} | ${r.media.caption} | ${r.media.durationSeconds ? `~${r.media.durationSeconds} s` : ''} |`,
  ),
  '',
  '## Hotovo (ilustrace v aplikaci)',
  '',
  '| Kde | Typ | Popis | Stav |',
  '| --- | --- | --- | --- |',
  ...available.map(
    (r) =>
      `| ${r.where} | ${kindLabel[r.media.kind]} | ${r.media.caption} | ${statusLabel[r.media.status]} |`,
  ),
  '',
  '## Jak natáčet',
  '',
  '- Telefon na stativu nebo opřený, záběr shora nebo z boku podle popisu; ruce a nástroj v záběru, obličej ne.',
  '- Denní světlo zleva. Žádné filtry; „washed“ vzhled dodá aplikace.',
  '- Video 20–40 s na krok, bez střihu. Z videa se vystřihnou fotky.',
  '- Ke každému kroku, kde to dává smysl, i záběr „jak to vypadat nemá“.',
  '',
];

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/content/shot-list.md');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join('\n'));
console.log(`Zapsáno ${out} (${rows.length} slotů, ${planned.length} k natočení).`);

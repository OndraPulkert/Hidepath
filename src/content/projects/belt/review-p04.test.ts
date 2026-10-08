import { describe, expect, it } from 'vitest';

import { beltProject } from '@/content/projects/belt/project';
import { activeBeltOutcome, beltFact, resolveActiveBelt } from '@/features/belt/active-belt';
import { newSavedBeltFieldId, serializeSavedBelt } from '@/features/belt/saved-belts';
import { type LessonRecordEntry } from '@/features/notebook/types';
import {
  DEFAULT_BELT_END,
  DEFAULT_BELT_TIP,
  beltPlateLayout,
  keeperStripLengthMm,
} from '@/lib/geometry/belt-end';
import { buildBeltSheets } from '@/lib/patterns/belt-sheets';

/** Regrese z kontroly p04: pásek musí jít postavit podle lekcí bez nepravdivých kontrolních bodů. */
const pages: Record<string, string> = import.meta.glob('/public/animace/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const page = (name: string) => pages[`/public/animace/${name}.html`]!;

const lesson = (n: number) => beltProject.lessons.find((l) => l.order === n)!;
const stepOf = (n: number, id: string) => lesson(n).steps.find((s) => s.id === id)!;
const checkpoint = (n: number, slug: string) => lesson(n).checkpoints.find((c) => c.slug === slug)!;
const cz = (n: number): string => String(Math.round(n * 10) / 10).replace('.', ',');
/** Popisek kroku animace: add('X','titulek','popisek',…). */
const caption = (html: string, title: string): string =>
  new RegExp(`add\\('[A-Z]','${title}',\\s*'([^']*)'`).exec(html)?.[1] ?? '';

describe('pásek – opravy z kontroly p04', () => {
  it('L2: povinný bod balzámu jde pravdivě splnit i u barevného pásku, kterému balzám nevyhověl', () => {
    const cp = checkpoint(2, 'scrap-edge-balm');
    expect(cp.required).toBe(true);
    expect(cp.title).not.toBe('Hrana je zaleštěná a vzhled balzámu vyhovuje.');
    expect(cp.title).toContain('u barevného pásku');
    expect(cp.description).toContain('v lekcích 3 a 6 vynecháte');
  });

  it('L6: povinný bod řezu konce platí i pro zaoblený konec', () => {
    const cp = checkpoint(6, 'tip-cut');
    expect(cp.title).not.toContain('Konec je uříznutý podél ocelového pravítka');
    expect(cp.title).toContain('po rýze');
    expect(cp.title).toContain('boky hrotu podél ocelového pravítka');
  });

  it('L4: délka poutka podle skutečné tloušťky odřezku (π × tloušťka), líc pod spojem zdrsnit', () => {
    const body = stepOf(4, 'keeper').body;
    expect(body).toContain('π × tloušťka poutka');
    for (const t of [1.2, 3, 3.5]) {
      expect(body).toContain(`asi ${Math.round(Math.PI * t)} mm u odřezku ${cz(t)} mm`);
    }
    // 35 × 3,0 s odřezkem téhož pásu: 112 mm, ne 107.
    expect(keeperStripLengthMm({ ...DEFAULT_BELT_END, beltWidthMm: 35, beltThicknessMm: 3 })).toBe(
      107,
    );
    expect(
      keeperStripLengthMm({
        ...DEFAULT_BELT_END,
        beltWidthMm: 35,
        beltThicknessMm: 3,
        keeperThicknessMm: 3,
      }),
    ).toBe(112);
    expect(body).toContain('počítá s odřezkem 1,2 mm');
    expect(body).toContain('zdrsněte');
    const hint = stepOf(4, 'keeper').records!.find((r) => r.id)!.hint!;
    expect(hint).toContain('π × tloušťka poutka');
    expect(caption(page('pasek-prezka'), 'Změřte poutko proužkem')).toContain(
      'π × tloušťka poutka',
    );
  });

  it('L1: kontrola destičky obsahuje i pravítko, linky, výřez hrotu a oblouky řady 2', () => {
    const body = stepOf(1, 'plate-check').body;
    const L = beltPlateLayout(DEFAULT_BELT_END, DEFAULT_BELT_TIP);
    const arcApex = (w: number) => {
      const a = L.roundedArcs.find((r) => r.beltWidthMm === w)!;
      return a.centreX + a.radiusMm;
    };
    expect(body).toContain(`vrchol výřezu hrotu na ${cz(L.tipApexX)} mm`);
    expect(body).toContain(`oblouku 40 na ${cz(arcApex(40))} mm`);
    expect(body).toContain(`oblouku 30 na ${cz(arcApex(30))} mm`);
    expect(body).toContain('nula na levé hraně');
    expect(body).toContain(`${L.rulerLengthMm} mm`);
    expect(body).toContain('30 / 35 / 40 / 45');
    expect(body).toContain('příčná stupnice');
    expect(body).toContain('žebro');
    expect(body).toContain('křížky');
  });

  it('L2 a L3: kolmý řez konce se narýsuje a zkontroluje destičkou', () => {
    for (const [n, id] of [
      [2, 'cut'],
      [3, 'square-end'],
    ] as const) {
      const body = stepOf(n, id).body;
      expect(body, `${n}/${id}`).toContain('podél levé hrany destičky');
      expect(body, `${n}/${id}`).toContain('po celé šířce');
      expect(body, `${n}/${id}`).toContain('nikdy ne podél destičky');
    }
    expect(lesson(3).requiredEquipment).toContain('scratch-awl');
    expect(checkpoint(3, 'end-square').title).toContain('po celé šířce');
  });

  it('L2: barevný pásek jde lineárně – hrana, barva, lesk a balzám', () => {
    const ids = lesson(2).steps.map((s) => s.id);
    expect(ids.indexOf('edge-bevel')).toBeGreaterThan(-1);
    expect(ids.indexOf('edge-bevel')).toBeLessThan(ids.indexOf('try-edge-paint'));
    expect(ids.indexOf('try-edge-paint')).toBeLessThan(ids.indexOf('edges-balm'));
    expect(stepOf(2, 'edge-bevel').body).not.toContain('další krok');
    expect(stepOf(2, 'try-edge-paint').body).not.toContain('jako v předchozím kroku');
    expect(stepOf(2, 'try-edge-paint').body).toContain('přiložením k pásu');
    expect(stepOf(2, 'edges-balm').body).toContain('U barevného pásku leštěte až zaschlou barvu');
  });

  it('L4: barva na hraně oválu má časovač, připomenutí vrstev a animace ji zmiňuje', () => {
    const oval = stepOf(4, 'oval');
    expect(oval.waits?.[0]?.initialFromField).toBe('edge-paint-dry-minutes');
    expect(oval.recalls?.length).toBeGreaterThan(0);
    expect(oval.body).toContain('leštěte až zaschlou barvu');
    expect(caption(page('pasek-prezka'), 'Zaleštěte hranu oválu')).toContain('u barevného pásku');
  });

  it('šroubek nýtu jde ze strany přehnutého konce, ne „z rubu přehnutého konce“', () => {
    expect(stepOf(4, 'screws').body).not.toContain('z rubu přehnutého konce');
    expect(stepOf(4, 'screws').body).toContain('šroubek z druhé strany');
    expect(stepOf(2, 'bend').body).toContain('rubem k rubu');
    expect(stepOf(2, 'screw').body).not.toContain('šroubek z rubu');
    expect(page('pasek-prezka')).not.toContain('z rubu přehnutého konce');
    expect(page('pasek-prezka')).not.toContain("'šroubek z rubu'");
  });

  it('nýt jen „podle názvu“ je v Aktivním pásku s „ověřte u prodejce“', () => {
    const factFor = (thicknessMm: number) => {
      const entry: LessonRecordEntry = {
        id: crypto.randomUUID(),
        userId: null,
        projectSlug: 'pasek-test',
        lessonSlug: 'vas-pasek',
        fieldId: newSavedBeltFieldId(),
        value: serializeSavedBelt(
          'Hnědý',
          { widthMm: 35, thicknessMm, tip: 'zaobleny', waistMm: 900, color: 'hneda' },
          'pasek',
        ),
        contentVersion: 1,
        createdAt: '2026-10-08T10:00:00.000Z',
        updatedAt: '2026-10-08T10:00:00.000Z',
      };
      const active = resolveActiveBelt([entry], 'pasek-test').active!;
      const outcome = activeBeltOutcome(active)!;
      return beltFact('rivet', active, outcome.ok ? outcome.result : null).value;
    };
    expect(factFor(3)).toContain('ověřte u prodejce');
    expect(factFor(4)).toContain('ověřte u prodejce');
    expect(factFor(3.5)).not.toContain('ověřte');
  });

  it('list 1: poutko vyjmenuje 3 vrstvy a nemluví o zaoblení konce', () => {
    const [s1] = buildBeltSheets(DEFAULT_BELT_END, DEFAULT_BELT_TIP, 'point');
    expect(s1.svg).toContain('obepíná 3 vrstvy: přehnutý konec, pás pod ním a volný konec pásku');
    expect(s1.svg).not.toContain('zaoblení konce');
    expect(page('pasek-prezka')).not.toContain('přehnutý konec a volný konec)');
  });

  it('animace hran a konce pásku sedí na lekce pásku', () => {
    const c1 = caption(page('hrany'), 'Obarvěte hrany barvené kůže');
    expect(c1).toContain('pásek lekce 2');
    expect(c1).not.toContain('Pouzdro na karty barvu nemá');
    const spicka = page('pasek-spicka');
    expect(caption(spicka, 'Dokončete hrany')).toContain(
      'U barevného pásku je obarvěte jako v lekci 3',
    );
    expect(caption(spicka, 'Natřete balzámem')).toContain(
      'u barevného pásku jen, když balzám na odřezku vyhověl',
    );
  });

  it('L1: posuvka je povinná, L5 má jednotný název', () => {
    expect(lesson(1).requiredEquipment).toContain('digital-caliper');
    expect(lesson(1).recommendedEquipment).not.toContain('digital-caliper');
    expect(lesson(5).title).toBe('Zkouška na těle a prostřední dírka');
  });
});

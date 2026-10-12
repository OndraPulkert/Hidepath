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

  it('L4: délka poutka podle skutečné tloušťky poutka (π × tloušťka), líc pod spojem zdrsnit', () => {
    const body = stepOf(4, 'keeper').body;
    expect(body).toContain('π × tloušťka poutka');
    // Tloušťku a délku počítá kalkulačka pod krokem z aktivního pásku, text je nepíše pro každou.
    expect(stepOf(4, 'keeper').beltCalculator).toBe('keeper');
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
    // Poutko z jiné kůže: líc pod přeplátováním zdrsnit; z pásu jsou drsné ztenčené klíny.
    expect(stepOf(4, 'keeper-glue').body).toContain('Líc pod ním zdrsněte smirkem 180');
    expect(stepOf(4, 'keeper-glue').body).toContain('nic dalšího nezdrsňujte');
    const hint = stepOf(4, 'keeper').records!.find((r) => r.id)!.hint!;
    expect(hint).toContain('kalkulačka');
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
      'jen když balzám na odřezku vyhověl (jako v lekci 3)',
    );
  });

  it('L1: posuvka je povinná, L5 má jednotný název', () => {
    expect(lesson(1).requiredEquipment).toContain('digital-caliper');
    expect(lesson(1).recommendedEquipment).not.toContain('digital-caliper');
    expect(lesson(5).title).toBe('Zkouška na těle a prostřední dírka');
  });
});

describe('pásek – volitelná lekce 7 (ozdobný steh)', () => {
  const l7 = lesson(7);

  it('lekce 7 je volitelná, až za lekcí 6 a čeká jen na ni', () => {
    expect(l7.optional).toBe(true);
    expect(l7.order).toBe(7);
    expect(l7.prerequisiteLessons).toEqual([lesson(6).slug]);
    expect(l7.requires?.map((r) => r.fromLesson)).toEqual([lesson(6).slug]);
    expect(beltProject.lessons.filter((l) => l.optional).map((l) => l.order)).toEqual([7]);
  });

  it('lekce 1–6 zůstaly beze změny: slugy, pořadí a id kroků', () => {
    expect(
      beltProject.lessons
        .filter((l) => !l.optional)
        .map((l) => [l.order, l.slug, l.steps.map((s) => s.id).join(',')]),
    ).toEqual([
      [
        1,
        '01-design-and-measure',
        'waist,width-and-tip,your-belt,order,measure-strap,check-numbers,plate-check,plate-or-sheets',
      ],
      [
        2,
        '02-scrap-training',
        'get-scrap,cut,mark,punch,edge-bevel,try-edge-paint,edges-balm,bend,screw',
      ],
      [3, '03-long-edges', 'square-end,mark-30,bevel,edge-paint,burnish,balm'],
      [
        4,
        '04-buckle-end',
        // Poutko z téhož řemene (2026-10-12): proužek, hrany, klín, lepení a steh přeplátování.
        'plate-or-sheet,secure,mark,first-pair,oval,keeper,keeper-edges,keeper-skive,keeper-glue,keeper-stitch,bend,second-pair,screws',
      ],
      [5, '05-fit-and-middle-hole', 'try-on,measure,transfer,length-check'],
      [6, '06-holes-and-tip', 'row,place,mark,punch-holes,cut-tip,finish,try'],
    ]);
  });

  it('do líce se nevpichuje: koncové body jen páskou, žádné šídlo, jediné otvory jsou otvory švu', () => {
    expect(l7.requiredEquipment).not.toContain('scratch-awl');
    expect(l7.recommendedEquipment).not.toContain('scratch-awl');
    expect(stepOf(7, 'endpoints').body).toContain('papírovou pásku');
    expect(stepOf(7, 'endpoints').body).toContain('Do kůže nic nevpichujte.');
    for (const s of l7.steps) expect(s.body, s.id).not.toMatch(/šídl|propích|důlek/);
    // Linie začíná u otvoru pro nýt: začátek nitě zmizí pod přehnutým koncem, šije se jedna vrstva.
    expect(stepOf(7, 'take-apart').body).toContain('Šijete jen jednu vrstvu');
    expect(stepOf(7, 'sew').body).toContain('Zatavujte jen na rubu');
  });

  it('lekce 7 nic netiskne a nic nesuší', () => {
    expect(l7.prints).toBeUndefined();
    expect(l7.steps.flatMap((s) => s.waits ?? [])).toEqual([]);
    expect(l7.steps.some((s) => s.printLink)).toBe(false);
  });

  it('co podklady neověřují, je „ověřte na odřezku“ nebo zkouška na odřezku', () => {
    const scrap = stepOf(7, 'scrap-test').body;
    expect(scrap).toContain('na odřezku');
    expect(scrap).toContain('mělká');
    expect(scrap).toContain('světlejší než pás');
    expect(scrap).toContain('Odřel doraz zaleštěnou hranu');
    expect(scrap).toContain('Na rubu musí vyjít všechny');
    expect(stepOf(7, 'punch').body).toContain('(ověřte na odřezku)');
  });

  it('animace ozdobného stehu má popisky kroků doslova z lekce 7', () => {
    const html = page('pasek-steh');
    const body = (id: string) => stepOf(7, id).body;
    for (const [title, id] of [
      ['Nastavte drážkovač na 4 mm', 'scrap-test'],
      ['Drážka a otvory na odřezku', 'scrap-test'],
      ['Pár stehů a kontrola', 'scrap-test'],
      ['Rozšroubujte konec a sundejte poutko', 'take-apart'],
      ['Označte začátek a konec páskou', 'endpoints'],
      ['Vyrýsujte drážku', 'groove'],
      ['Prosekejte otvory', 'punch'],
      ['Dorovnejte konec linie', 'punch'],
      ['Zkontrolujte rub', 'punch'],
      ['Odměřte nit a navlékněte jehly', 'sew'],
      ['Šijte od přezky ke špičce', 'sew'],
      ['Konce na rubu', 'sew'],
      ['Zatlučte steh', 'set'],
      ['Složte konec zpět', 'reassemble'],
    ] as const) {
      const text = caption(html, title);
      expect(text, title).not.toBe('');
      expect(body(id), title).toContain(text);
    }
    const done = caption(html, 'Hotový pásek');
    for (const slug of ['stitch-line', 'stitch-reassembled']) {
      expect(done).toContain(checkpoint(7, slug).title);
    }
  });
});

describe('pásek – lekce 7: opravy z kontroly ozdobného stehu (12. 10. 2026)', () => {
  const lessonBodies: Record<string, string> = import.meta.glob(
    '/src/content/projects/belt/lessons/*.mdx',
    { query: '?raw', import: 'default', eager: true },
  );

  it('dlouhá nit: výjimka z „přes 1,5 m šev rozdělte“ je vysvětlená v lekci i v animaci délky nitě', () => {
    expect(stepOf(7, 'sew').body).toContain('Tady ho nedělte');
    expect(stepOf(7, 'sew').body).toContain('namotejte na kousek kartonu');
    expect(page('delka-nite')).toContain('Výjimka: ozdobný steh na jedné vrstvě');
  });

  it('konce nitě: jako v projektu 01, asi 2 mm od kůže, zatavit a přimáčknout', () => {
    for (const id of ['scrap-test', 'sew']) {
      expect(stepOf(7, id).body).toContain('odstřihněte asi 2 mm od kůže');
      expect(stepOf(7, id).body).toContain('hned přimáčkněte');
    }
  });

  it('odřená hrana barevného pásku se natře znovu, pak přeleští (lekce 3, část H)', () => {
    const set = stepOf(7, 'set');
    expect(set.body).toContain('natřete znovu');
    expect(set.animationLinks?.map((l) => l.href)).toEqual(
      expect.arrayContaining([expect.stringContaining('hrany.html#H3')]),
    );
    expect(lesson(7).recommendedEquipment).toContain('edge-paint');
  });

  it('povolení nýtů: hlavičku přidržet, zajišťovač nebo lak jako v lekci 4', () => {
    expect(stepOf(7, 'take-apart').body).toContain('přidržte palcem');
    expect(lesson(7).materials).toContain('zajišťovač závitů nebo lak (jako v lekci 4)');
  });

  it('konec linie: posledních 10 mm až po jednohrotu na konci drážky', () => {
    expect(stepOf(7, 'punch').body).toContain('Posledních asi 10 mm drážky vidličkou nesekejte');
    expect(stepOf(7, 'punch').body).toContain('lícem nahoru, vraťte vidličku');
  });

  it('bez nedoložené délky hrotu; MDX neopakuje pruh „Volitelná lekce“', () => {
    const chisels = beltProject.equipment.find((e) => e.equipmentSlug === 'stitching-chisels')!;
    expect(chisels.specification).not.toContain('8,5 mm');
    const mdx = lessonBodies['/src/content/projects/belt/lessons/07-decorative-stitch.mdx']!;
    expect(mdx).not.toContain('Volitelná lekce');
  });
});

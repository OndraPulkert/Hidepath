import { equipmentCatalog } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
import { exposedCardHeightMm } from '@/lib/geometry/piece-path';
import { findPlanExample, resolveShoppingPlan } from '@/features/shopping/plan';

describe('obsah – pouzdro na karty: steh', () => {
  const step = (order: number, id: string) =>
    cardHolderProject.lessons.find((l) => l.order === order)!.steps.find((s) => s.id === id)!.body;

  it('konce nitě: bez zatavení těsně u kůže, k zatavení asi 2 mm', () => {
    expect(step(4, 'finish-stitch')).toContain(
      'Když konce nezatavujete, odstřihněte je těsně u kůže',
    );
    expect(step(4, 'finish-stitch')).toContain('vyčnívaly asi 2 mm');
    expect(step(6, 'stitch')).toContain('nechte asi 2 mm dlouhé a zatavte');
  });

  it('spodní roh: řada po zaoblení 3,5 mm od hrany, ne v průsečíku rovných linií', () => {
    expect(step(6, 'punch-sides')).toContain(
      'do horního kroužku na linii stehu, 6 mm pod horní hranou kapsy',
    );
    expect(step(6, 'punch-sides')).toContain('nejblíž hornímu kroužku na tomto boku');
    expect(step(6, 'punch-sides')).toContain('i tam 3,5 mm od hrany, ne do průsečíku');
    expect(step(6, 'punch-sides')).toContain('(ověřte na odřezku)');
  });

  it('vpichy jen tam, kde zmizí: kroužky pásu pod kapsou; výřez a linie stehu bez vpichů', () => {
    const l5 = cardHolderProject.lessons.find((l) => l.order === 5)!;
    expect(l5.steps.map((s) => s.id)).not.toContain('prick-marks');
    expect(l5.checkpoints.map((c) => c.slug)).not.toContain('marks-transferred');
    expect(step(5, 'cut-parts')).toContain('z každé strany jen ke krátké čárce nad koncem výřezu');
    expect(step(5, 'cut-parts')).toContain('Nic nepropichujte');
    expect(step(5, 'thumb-cutout')).toContain(
      'kde prostřední čárka sahá na oblouk, 12 mm pod horní hranou',
    );
    for (const s of l5.steps) expect(s.body, s.id).not.toMatch(/propíchn/);
    expect(step(6, 'mark-stitch-lines')).toContain('nic nerýsujte ani nepropichujte');
    expect(step(6, 'punch-sides')).toContain('skrz přilepený papír');
    expect(step(6, 'mark-glue-area')).toContain('propíchněte čtyři kroužky na tečkované čáře pásu');
    expect(step(6, 'mark-glue-area')).toContain('kapsa je zakryje');
    const l6 = cardHolderProject.lessons.find((l) => l.order === 6)!.steps.map((s) => s.id);
    expect(l6.indexOf('mark-stitch-lines')).toBe(l6.indexOf('glue-parts') + 1);
    expect(l6.indexOf('punch-sides')).toBe(l6.indexOf('mark-stitch-lines') + 1);
    const back = cardHolderProject.template!.pieces.find((p) => p.id === 'back')!;
    expect(back.heightMark).toEqual({ fromBottomMm: 56, lengthMm: 8 });
  });

  it('lepený pás 5 mm jako v lekci 4: kapsa 100 mm nechá kartě 85,6 mm volnou šířku', () => {
    const front = cardHolderProject.template!.pieces.find((p) => p.id === 'front')!;
    const band = cardHolderProject.template!.glueBandMm!;
    expect(step(6, 'mark-glue-area')).toContain(`pás asi ${band} mm`);
    expect(step(4, 'glue')).toContain(`pás lepidla asi ${band} mm`);
    expect(front.widthMm - 2 * band).toBeGreaterThan(85.6);
    expect(step(6, 'mark-glue-area')).not.toMatch(/\b8 mm/);
    // Schéma: karta leží na pásu 5 mm → horní hrana 59 mm, ve výřezu (56 − 12) odkryje 15 mm.
    expect(exposedCardHeightMm(front.heightMm, 54 + band, front.thumbCutout)).toBe(15);
    // Páska nesmí vést k zdrsnění rohu nad kapsou (R6): u boků končí na horních kroužcích 56 − 6 = 50 mm.
    expect(front.heightMm - front.cornerRadiusMm).toBe(50);
    expect(step(6, 'mark-glue-area')).toContain('nahoře na bocích, 50 mm od spodku');
    expect(step(6, 'mark-glue-area')).toContain('těsně nad horní kroužky');
    expect(step(6, 'mark-glue-area')).not.toContain('těsně nad vpichy maskovací pásku');
  });

  it('výřez na palec: řezy začínají a končí na čáře, brousí se k rohům mezi nimi, hloubka 12 mm', () => {
    expect(step(5, 'thumb-cutout')).toContain('každý začněte i skončete přesně na čáře');
    expect(step(5, 'thumb-cutout')).not.toContain('kousek vedle čáry');
    expect(step(5, 'peel-template')).toContain('uprostřed přes roh ve dně 12 mm hluboko');
    const media = cardHolderProject.lessons
      .find((l) => l.order === 5)!
      .steps.find((s) => s.id === 'thumb-cutout')!.media;
    expect(media[0]!.caption).not.toContain('narýsovaným');
  });

  it('cvičení v lekci 2 řeže výřez stejně jako lekce 5 (krátké rovné řezy od čáry k čáře)', () => {
    expect(step(2, 'practice-template')).toContain('každý začněte i skončete přesně na čáře');
    expect(step(2, 'practice-template')).not.toContain('roh a výřez pomalu bez pravítka');
  });

  it('šití pouzdra odkazuje na zakončení i zatavení konců (E2, F2, F3)', () => {
    const stitch = cardHolderProject.lessons
      .find((l) => l.order === 6)!
      .steps.find((s) => s.id === 'stitch')!;
    expect(stitch.animationLinks!.map((l) => l.href)).toEqual([
      '/animace/sedlarsky-steh.html#E2',
      '/animace/sedlarsky-steh.html#F2',
      '/animace/sedlarsky-steh.html#F3',
    ]);
  });

  it('rub: méně pravidelný je normální, ale utažený, v řadě a bez smyček', () => {
    expect(step(4, 'compare')).toContain('stejně utažené, v jedné řadě a bez smyček');
    expect(step(4, 'compare')).toContain('vidličky nebyly při děrování kolmo (lekce 3)');
  });
});

describe('obsah – pouzdro na karty: časovače, zápisník a „Připravte si“', () => {
  const lesson = (order: number) => cardHolderProject.lessons.find((l) => l.order === order)!;
  const step = (order: number, id: string) => lesson(order).steps.find((s) => s.id === id)!;

  it('čekání jen tam, kde text říká „odvětrat podle návodu“: orientačně 10–15 min, upravitelné', () => {
    const withWaits = cardHolderProject.lessons.flatMap((l) =>
      l.steps.filter((s) => s.waits).map((s) => `${l.order}:${s.id}`),
    );
    expect(withWaits).toEqual(['4:glue', '6:glue-parts']);
    for (const [order, id] of [
      [4, 'glue'],
      [6, 'glue-parts'],
    ] as const) {
      expect(step(order, id).body).toContain('odvětrat podle návodu');
      expect(step(order, id).waits).toEqual([
        {
          id: 'glue-open',
          // S oboustrannou páskou se nečeká – časovač je jen pro lepidlo.
          label: 'Odvětrání lepidla (s páskou nečekáte)',
          minutes: 10,
          maxMinutes: 15,
          basis: 'manufacturer',
        },
      ]);
    }
  });

  it('zápisník: rozteč, kontrolní úsečky, páska a zkouška zdrsnění s cíli z textu', () => {
    const fields = cardHolderProject.lessons.flatMap((l) =>
      l.steps.flatMap((s) => (s.records ?? []).map((f) => `${l.order}:${s.id}:${f.id}`)),
    );
    expect(fields).toEqual([
      '1:check-chisels:chisel-spacing',
      '2:practice-template:practice-sheet-calibration',
      '2:practice-template:tape-mark',
      '4:glue:roughened-grip',
      '5:print-check:template-calibration',
    ]);
    const spacing = step(1, 'check-chisels').records![0]!;
    // Cíl 3,85–4 mm plus tolerance měření pravítkem (±0,5 mm / 5 mezer ≈ ±0,1 mm): vidlička 4 mm
    // naměřená jako 20,5 / 5 = 4,1 mm nesmí vyjít „mimo cíl“.
    expect(spacing).toMatchObject({ unit: 'mm', target: { min: 3.75, max: 4.1 } });
    expect(step(1, 'check-chisels').body).toContain('musí vyjít 3,85–4 mm');
    expect(step(1, 'check-chisels').body).toContain('nejdelší vidličky');
    for (const [order, id] of [
      [2, 'practice-template'],
      [5, 'print-check'],
    ] as const) {
      expect(step(order, id).body).toContain('musí mít přesně 50 mm');
      expect(step(order, id).records![0]).toMatchObject({ target: { min: 50, max: 50 } });
    }
  });

  it('páska z lekce 2 se připomene tam, kde jde na líc (lekce 6) i kde drží šablonu (lekce 5)', () => {
    expect(step(6, 'mark-glue-area').recalls).toEqual([
      { fieldId: 'tape-mark', label: 'Páska v lekci 2' },
    ]);
    expect(step(6, 'mark-glue-area').body).toContain(
      'Použijte pásku, která v lekci 2 nenechala na líci stopu',
    );
    expect(step(5, 'transfer').body).toContain(
      'Použijte pásku, která v lekci 2 nenechala na líci stopu',
    );
    expect(step(5, 'transfer').recalls).toEqual([
      { fieldId: 'tape-mark', label: 'Páska v lekci 2' },
    ]);
  });

  it('tisk: cvičná šablona v lekci 2, šablona v lekci 5, v lekci 6 jen když chybí papírový díl', () => {
    expect(lesson(2).prints).toMatchObject([
      { source: 'practice-sheets', sheetId: 'cvicna-sablona', copies: 1 },
    ]);
    expect(lesson(5).prints).toMatchObject([{ source: 'template', copies: 1 }]);
    expect(lesson(5).prints![0]!.paper).toContain('matný papír 120 g');
    expect(lesson(6).prints).toMatchObject([
      { source: 'template', copies: 1, condition: 'nemáte papírové díly z lekce 5' },
    ]);
    expect(step(6, 'mark-glue-area').body).toContain('nebo novou šablonu vystřiženou po plné čáře');
    expect(step(6, 'mark-stitch-lines').body).toContain(
      'nebo novou šablonu vystřiženou po plné čáře',
    );
    expect(step(6, 'mark-stitch-lines').printLink).toBe('template');
    for (const l of cardHolderProject.lessons) {
      expect(
        l.materials.some((m) => m.includes('vytištěn')),
        l.slug,
      ).toBe(false);
    }
  });

  it('z předchozích lekcí: proužek do lekce 4, díly a papírový zadní díl do lekce 6', () => {
    expect(lesson(4).requires!.map((r) => [r.id, r.fromLesson])).toEqual([
      ['practice-strip', '02-straight-cut'],
    ]);
    expect(step(4, 'glue').body).toContain('přilepte na něj proužek z lekce 2');
    expect(lesson(6).requires!.map((r) => [r.id, r.fromLesson])).toEqual([
      ['leather-parts', '05-transfer-and-cut'],
      ['paper-back', '05-transfer-and-cut'],
    ]);
    expect(step(5, 'peel-template').body).toContain('si schovejte na lekci 6');
    expect(step(5, 'transfer').body).not.toContain('zničí');
    expect(step(5, 'transfer').body).toContain('budete je potřebovat v lekci 6');
    expect(lesson(6).materials).not.toContain('díly z lekce 5');
  });
});

/** Příklady CraftPointu, jejichž ceny a sklad jsme znovu ověřili 8. 10. 2026. */
const RECHECKED_2026_10_08 = [
  'hovezi-kuze-licova-juchtova-trislocinena-1-2-mm',
  'trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu',
  'hovezi-licova-kuze-trislocinena-1-2-mm-whisky',
  'horizontalni-palicka-na-kuzi',
  'vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
];
const rechecked = (url: string) =>
  url.startsWith('https://craft-point.cz/') && RECHECKED_2026_10_08.some((h) => url.endsWith(h));

describe('obsah – pouzdro na karty: nákupní plán „Co koupit“', () => {
  const plan = cardHolderProject.shoppingPlan!;

  it('každý řádek míří na právě jeden ověřený příklad skladem z 29. 9. 2026 (maskovací páska z 1. 10. 2026, ceny CraftPointu znovu 8. 10. 2026)', () => {
    for (const line of plan.lines) {
      const example = findPlanExample(line, equipmentCatalog);
      expect(example, `${line.equipmentSlug} ${line.url} ${line.variant ?? ''}`).toBeDefined();
      expect(example!.availability, line.url).toBe('in_stock');
      expect(example!.checkedAt, line.url).toBe(
        line.equipmentSlug === 'masking-tape'
          ? '2026-10-01'
          : rechecked(line.url)
            ? '2026-10-08'
            : '2026-09-29',
      );
    }
  });

  it('pokryje každou nezbytnou i doporučenou položku projektu, bez vynechání', () => {
    const planned = new Set(plan.lines.map((l) => l.equipmentSlug));
    for (const req of cardHolderProject.equipment) {
      if (req.priority !== 'later')
        expect(planned.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
    }
    expect(plan.skipped).toEqual([]);
  });

  it('kůže: A4 na pouzdro a 2× A5 téže kůže 1,2 mm na trénink lekcí 1–4', () => {
    const leather = plan.lines.filter((l) => l.equipmentSlug === 'veg-tan-leather');
    expect(leather.map((l) => [l.variant, l.quantity])).toEqual([
      ['A4 (30 × 21 cm)', 1],
      ['A5 (21 × 15 cm)', 2],
    ]);
    expect(new Set(leather.map((l) => l.url)).size).toBe(1);
    expect(findPlanExample(leather[0]!, equipmentCatalog)!.title).toContain('1,2 mm');
    expect(leather[0]!.purpose).toContain('100 × 70 mm');
    expect(leather[0]!.purpose).toContain('100 × 56 mm');
    const pieces = cardHolderProject.template!.pieces;
    expect(pieces.map((p) => `${p.widthMm} × ${p.heightMm}`)).toEqual(['100 × 70', '100 × 56']);
  });

  it('údaje v popisech sedí s lekcemi: šev kolem tří stran asi 18 cm, pás 210 × 70 mm z lekce 2', () => {
    const pony = cardHolderProject.equipment.find((e) => e.equipmentSlug === 'stitching-pony')!;
    expect(pony.reason).toContain('asi 18 cm');
    expect(pony.reason).not.toContain('100 mm');
    const ponyItem = equipmentCatalog['stitching-pony']!;
    expect(ponyItem.purpose).not.toContain('nejdelší šev 100 mm');
    const a5 = plan.lines.find((l) => l.variant === 'A5 (21 × 15 cm)')!;
    expect(a5.purpose).toContain('pás asi 210 × 70 mm na rovný řez');
  });

  it('nářadí bere ze stejných příkladů jako projekt 02 (jeden košík)', () => {
    const coinLines = coinCardHolderProject.shoppingPlan!.lines;
    for (const line of plan.lines) {
      if (line.equipmentSlug === 'veg-tan-leather') continue;
      const same = coinLines.some(
        (c) =>
          c.equipmentSlug === line.equipmentSlug &&
          c.url === line.url &&
          c.variant === line.variant,
      );
      expect(same, `${line.equipmentSlug} ${line.url}`).toBe(true);
    }
  });

  it('součet po obchodech: CraftPoint 2 878 Kč + IKEA 118 Kč + OBI 139 Kč = 3 135 Kč', () => {
    const resolved = resolveShoppingPlan(cardHolderProject, equipmentCatalog, {})!;
    const lines = resolved.shops.flatMap((s) => s.lines);
    expect(lines).toHaveLength(plan.lines.length);
    expect(resolved.shops.map((s) => [s.shop, s.totalCents])).toEqual([
      ['CraftPoint', 287_800],
      ['IKEA', 11_800],
      ['OBI', 13_900],
    ]);
    expect(resolved.totalCents).toBe(313_500);
    expect(resolved.notInStockCount).toBe(0);
    expect(resolved.checkedFrom).toBe('2026-09-29');
    expect(resolved.checkedTo).toBe('2026-10-08');
  });
});

describe('obsah – pouzdro na karty: vyrobitelnost', () => {
  const lesson = (order: number) => cardHolderProject.lessons.find((l) => l.order === order)!;
  const step = (order: number, id: string) => lesson(order).steps.find((s) => s.id === id)!.body;

  it('horní hrana kapsy a výřez se dokončí před lepením, po sešití se jich nikdo nedotkne', () => {
    const l5 = lesson(5).steps.map((s) => s.id);
    expect(l5.indexOf('pocket-top-edge')).toBeGreaterThan(l5.indexOf('peel-template'));
    expect(step(6, 'edges')).toContain('Horní hranu kapsy a výřez máte hotové z lekce 5');
    expect(step(6, 'edges')).not.toContain('oblouk výřezu');
  });

  it('kontaktní lepidlo: pás vyznačený i na rubu kapsy, přikládá se od spodní hrany', () => {
    expect(step(6, 'glue-parts')).toContain('Stejný pás vyznačte na rubu kapsy');
    expect(step(6, 'glue-parts')).toContain('nejdřív přiložte spodní hranu');
  });

  it('maskovací páska je nutná tam, kde drží papír na líci a ohraničí zdrsnění', () => {
    for (const order of [2, 5, 6])
      expect(lesson(order).requiredEquipment).toContain('masking-tape');
    const tape = cardHolderProject.equipment.find((e) => e.equipmentSlug === 'masking-tape')!;
    expect(tape.priority).toBe('required');
  });

  it('nesliboval víc karet, než lekce zkouší', () => {
    expect(cardHolderProject.summary).not.toMatch(/šest|4–6/);
    expect(step(6, 'test-cards')).toContain('čtyři karty');
  });

  it('nit na pouzdro je v kroku šití, ne jen v Postupu v kostce', () => {
    expect(step(6, 'stitch')).toContain('Ustřihněte asi 1 m nitě');
  });
});

describe('obsah – pouzdro na karty: konec řady dvojhrotem', () => {
  const step = (order: number, id: string) =>
    cardHolderProject.lessons.find((l) => l.order === order)!.steps.find((s) => s.id === id)!.body;

  it('neslibuje otvor přesně na značce, řada končí nejbližším otvorem bez posouvání', () => {
    for (const [order, id] of [
      [3, 'corners'],
      [6, 'punch-sides'],
    ] as const) {
      const body = step(order, id);
      expect(body).not.toContain('přesně na značku');
      expect(body).not.toContain('ve stejné výšce');
      expect(body).toContain('nejblíž');
      expect(body).toContain('neposouvejte');
      expect(body).toContain('ověřte na odřezku');
    }
  });
});

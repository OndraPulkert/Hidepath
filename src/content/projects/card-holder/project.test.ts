import { equipmentCatalog } from '@/content/equipment';
import { cardHolderProject } from '@/content/projects/card-holder/project';
import { coinCardHolderProject } from '@/content/projects/coin-card-holder/project';
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
    expect(step(6, 'punch-sides')).toContain('asi 6 mm pod horní hranou kapsy');
    expect(step(6, 'punch-sides')).toContain('i tam 3,5 mm od hrany, ne do průsečíku');
    expect(step(6, 'punch-sides')).toContain('(ověřte na odřezku)');
  });

  it('značky ze šablony: konce výřezu v lekci 5, vpich pod čárkou 56 mm v lekci 6', () => {
    expect(step(5, 'prick-marks')).toContain('krátká čárka nad horní hranou přední kapsy');
    expect(step(6, 'mark-glue-area')).toContain('těsně pod vnitřním koncem čárky 56 mm');
    const back = cardHolderProject.template!.pieces.find((p) => p.id === 'back')!;
    expect(back.heightMark).toEqual({ fromBottomMm: 56, lengthMm: 8 });
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
          label: 'Odvětrání lepidla',
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
    expect(spacing).toMatchObject({ unit: 'mm', target: { min: 3.85, max: 4 } });
    expect(step(1, 'check-chisels').body).toContain('musí vyjít 3,85–4 mm');
    for (const [order, id] of [
      [2, 'practice-template'],
      [5, 'print-check'],
    ] as const) {
      expect(step(order, id).body).toContain('musí mít přesně 50 mm');
      expect(step(order, id).records![0]).toMatchObject({ target: { min: 50, max: 50 } });
    }
  });

  it('páska z lekce 2 se připomene tam, kde ji lekce 5 používá', () => {
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
      { source: 'template', copies: 1, condition: 'Jen když nemáte papírový zadní díl z lekce 5.' },
    ]);
    expect(step(6, 'mark-glue-area').body).toContain('nebo novou šablonu vystřiženou po plné čáře');
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
    expect(lesson(6).materials).not.toContain('díly z lekce 5');
  });
});

describe('obsah – pouzdro na karty: nákupní plán „Co koupit“', () => {
  const plan = cardHolderProject.shoppingPlan!;

  it('každý řádek míří na právě jeden ověřený příklad skladem z 29. 9. 2026 (maskovací páska z 1. 10. 2026)', () => {
    for (const line of plan.lines) {
      const example = findPlanExample(line, equipmentCatalog);
      expect(example, `${line.equipmentSlug} ${line.url} ${line.variant ?? ''}`).toBeDefined();
      expect(example!.availability, line.url).toBe('in_stock');
      expect(example!.checkedAt, line.url).toBe(
        line.equipmentSlug === 'masking-tape' ? '2026-10-01' : '2026-09-29',
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

  it('součet po obchodech: CraftPoint 2 881 Kč + IKEA 118 Kč + OBI 139 Kč = 3 138 Kč', () => {
    const resolved = resolveShoppingPlan(cardHolderProject, equipmentCatalog, {})!;
    const lines = resolved.shops.flatMap((s) => s.lines);
    expect(lines).toHaveLength(plan.lines.length);
    expect(resolved.shops.map((s) => [s.shop, s.totalCents])).toEqual([
      ['CraftPoint', 288_100],
      ['IKEA', 11_800],
      ['OBI', 13_900],
    ]);
    expect(resolved.totalCents).toBe(313_800);
    expect(resolved.notInStockCount).toBe(0);
    expect(resolved.checkedFrom).toBe('2026-09-29');
    expect(resolved.checkedTo).toBe('2026-10-01');
  });
});

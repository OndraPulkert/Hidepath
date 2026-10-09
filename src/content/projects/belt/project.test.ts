import { equipmentCatalog, equipmentList } from '@/content/equipment';
import { beltProject } from '@/content/projects/belt/project';
import { BELT_TIP_CHOICES, LEGACY_BELT_RECORD_IDS } from '@/content/projects/belt/record-ids';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import { type LessonDefinition, projectDefinitionSchema } from '@/content/schema';
import { activeBeltOutcome, resolveActiveBelt } from '@/features/belt/active-belt';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { beltShoppingPlan } from '@/features/belt/belt-shopping';
import { findPlanExample } from '@/features/shopping/plan';
import {
  CHICAGO_SCREW_OPTIONS,
  VERIFIED_BUCKLES,
  deriveBeltConfig,
} from '@/lib/patterns/belt-config';
import {
  EDGE_PAINT_URLS,
  STRAP_COLOR_LABELS,
  STRAP_COLORS,
} from '@/lib/patterns/belt-strap-offers';
import { BELT_SHEET_IDS } from '@/lib/patterns/belt-sheets';

/** Číslo tak, jak ho píše obsah (desetinná čárka). */
const cz = (n: number): string => String(n).replace('.', ',');
const cz1 = (n: number): string => n.toFixed(1).replace('.', ',');

const lesson = (order: number): LessonDefinition =>
  beltProject.lessons.find((l) => l.order === order)!;
const lessonText = (order: number): string => JSON.stringify(lesson(order));
const step = (order: number, id: string) => lesson(order).steps.find((s) => s.id === id)!;

/** Výchozí pásek, pro který lekce dávají čísla jako příklad. */
const example = (() => {
  const outcome = deriveBeltConfig({ widthMm: 40, thicknessMm: 3.5, tip: 'hrot' });
  if (!outcome.ok) throw new Error(outcome.problems.join(' '));
  return outcome.result;
})();

describe('obsah – pásek', () => {
  it('projekt odpovídá schématu', () => {
    const result = projectDefinitionSchema.safeParse(beltProject);
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
  });

  it('projekt 04 kreslí listy formulářem „Váš pásek“ a výchozí listy jsou 40 mm', () => {
    expect(beltProject.code).toBe('04');
    const sheets = beltProject.patternSheets!;
    expect(sheets.browserGenerator).toBe('belt-config');
    expect(sheets.sheets.map((s) => s.id)).toEqual([BELT_SHEET_IDS.buckle, BELT_SHEET_IDS.tip]);
    const urls = patternSheetUrlsFor(beltProject.slug);
    expect(urls[BELT_SHEET_IDS.buckle]).toMatch(/opasek-sablona-40mm-1-prezka.*\.svg/);
    expect(urls[BELT_SHEET_IDS.tip]).toMatch(/opasek-sablona-40mm-2-spicka.*\.svg/);
  });

  it('projekt odkazuje jen na existující vybavení', () => {
    const known = new Set(equipmentList.map((e) => e.slug));
    for (const req of beltProject.equipment) {
      expect(known.has(req.equipmentSlug), req.equipmentSlug).toBe(true);
    }
  });

  it('id záběrů jsou unikátní v projektu i proti katalogu vybavení', () => {
    const ids = [
      ...equipmentList.flatMap((e) => e.media.map((m) => m.id)),
      ...beltProject.media.map((m) => m.id),
      ...beltProject.lessons.flatMap((l) => [
        ...l.media.map((m) => m.id),
        ...l.steps.flatMap((s) => s.media.map((m) => m.id)),
      ]),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('obsah – pásek: čísla jsou příklad z modelu', () => {
  it('příklad 40 × 3,5 mm odpovídá výpočtu „Váš pásek“', () => {
    expect(example.keeper).toEqual({ lengthMm: 120, widthMm: 12 });
    expect(lessonText(4)).toContain(`např. ${example.keeper.lengthMm} mm pro 40 × 3,5 mm`);
    expect(lessonText(4)).toContain(`proužek ${example.keeper.widthMm} mm`);
    expect(lessonText(5)).toContain(`např. ${cz(example.holes.middleFromApexMm)} mm`);
    expect(lessonText(1)).toContain(
      `dřík ${cz1(example.rivet.minMm)}–${cz1(example.rivet.maxMm)} mm, tedy 10/6`,
    );
    expect(lessonText(6)).toContain(`např. ${cz(example.holes.diameterMm)} mm`);
  });

  it('pevný konec u přezky: otvory, ovál a ohyb jako v modelu', () => {
    const [a, b, c, d] = example.buckleEnd.rivetHolesFromEndMm;
    expect(step(4, 'first-pair').body).toContain(`(${cz(a)} a ${cz(b)} mm od konce)`);
    expect(step(1, 'plate-check').body).toContain(`${cz(a)} / ${cz(b)} / ${cz(c)} / ${cz(d)} mm`);
    const [from, to] = example.buckleEnd.slotFromEndMm;
    expect(step(1, 'plate-check').body).toContain(`ovál ${cz(from)}–${cz(to)} mm`);
    expect(step(1, 'plate-check').body).toContain(
      `značky ohybu na ${example.buckleEnd.foldFromEndMm} mm`,
    );
  });

  it('pás 130 cm stačí do obvodu 106,5 cm', () => {
    const at = (waistCm: number) => {
      const r = deriveBeltConfig({
        widthMm: 40,
        thicknessMm: 3.5,
        tip: 'hrot',
        waistMm: waistCm * 10,
      });
      return r.ok ? r.result.strap.minLengthCm : null;
    };
    expect(at(106.5)).toBe(130);
    expect(at(106.6)).toBe(131);
    expect(step(1, 'order').body).toContain('pás 130 cm stačí do obvodu 106,5 cm');
  });

  it('lekce nepíšou čísla 40 mm bez „např.“ (kromě pevného konce u přezky)', () => {
    for (const order of [4, 5, 6]) {
      const text = lessonText(order);
      expect(text, `lekce ${order}`).not.toMatch(/94,3|194,3|38,5 mm/);
    }
  });
});

describe('obsah – pásek: zápisník, „Připravte si“ a destička', () => {
  const fields = beltProject.lessons.flatMap((l) =>
    l.steps.flatMap((s) => (s.records ?? []).map((f) => ({ lesson: l, field: f }))),
  );

  it('jediný zdroj: lekce parametry pásku nezapisují, zápisník má jen výsledky zkoušek', () => {
    const ids = fields.map((f) => f.field.id);
    for (const id of Object.values(LEGACY_BELT_RECORD_IDS)) expect(ids, id).not.toContain(id);
    expect(ids).toEqual([
      'plate-check',
      'scrap-punch',
      'edge-paint-coats',
      'edge-paint-dry-minutes',
      'scrap-balm',
      'scrap-bend',
      'scrap-screw',
      'belt-keeper-length',
      'belt-fit-waist',
      'belt-fit-result',
    ]);
    // Připomínky parametrů jsou z aktivního pásku, ne ze zápisníku.
    const recalled = beltProject.lessons.flatMap((l) =>
      l.steps.flatMap((s) => (s.recalls ?? []).map((r) => r.fieldId)),
    );
    for (const id of Object.values(LEGACY_BELT_RECORD_IDS)) expect(recalled, id).not.toContain(id);
  });

  it('kroky, které potřebují čísla pásku, je berou z aktivního pásku', () => {
    expect(step(1, 'your-belt').beltRecalls).toEqual(['waist', 'width', 'tip', 'color']);
    expect(step(1, 'check-numbers').beltRecalls).toEqual(['thickness', 'holeDiameter', 'rivet']);
    expect(step(2, 'get-scrap').beltRecalls).toEqual(['strapLength']);
    expect(step(2, 'try-edge-paint').beltRecalls).toEqual(['color']);
    expect(step(4, 'keeper').beltRecalls).toEqual(['keeper']);
    expect(step(4, 'screws').beltRecalls).toEqual(['thickness', 'rivet']);
    expect(step(5, 'measure').beltRecalls).toEqual(['waist']);
    expect(step(5, 'length-check').beltRecalls).toEqual(['middleHole']);
    expect(step(6, 'row').beltRecalls).toEqual(['tip', 'marking']);
    expect(step(6, 'punch-holes').beltRecalls).toEqual(['holeDiameter']);
  });

  it('lekce 1 začíná odkazem na „Váš pásek“ a kroky se zadáním na něj odkazují', () => {
    const first = lesson(1).steps[0]!;
    expect(first.appLinks?.[0]).toEqual({ to: 'belt-config', label: 'Začněte tady: Váš pásek' });
    for (const id of ['width-and-tip', 'your-belt', 'order', 'measure-strap', 'check-numbers']) {
      const s = step(1, id);
      expect(
        s.appLinks?.map((l) => l.to),
        id,
      ).toContain('belt-config');
      expect(s.body, id).toContain('(odkaz pod krokem)');
    }
    expect(step(1, 'order').appLinks?.map((l) => l.to)).toEqual(['belt-config', 'shopping']);
  });

  it('staré zápisy lekce 1 se převedou na pásek a dají čísla', () => {
    const entry = (fieldId: string, value: number | string): LessonRecordEntry => ({
      id: crypto.randomUUID(),
      userId: null,
      projectSlug: beltProject.slug,
      lessonSlug: lesson(1).slug,
      fieldId,
      value,
      contentVersion: beltProject.contentVersion,
      createdAt: '2026-10-08T10:00:00.000Z',
      updatedAt: '2026-10-08T10:00:00.000Z',
    });
    const ids = LEGACY_BELT_RECORD_IDS;
    const { active, legacy } = resolveActiveBelt(
      [
        entry(ids.waist, 95),
        entry(ids.width, 35),
        entry(ids.tip, BELT_TIP_CHOICES.zaobleny),
        entry(ids.thickness, 3.75),
        entry(ids.prong, 4.5),
      ],
      beltProject.slug,
    );
    expect(legacy).not.toBeNull();
    expect(active?.source).toBe('notebook');
    const outcome = activeBeltOutcome(active);
    expect(outcome?.ok).toBe(true);
    if (!outcome?.ok) return;
    expect(outcome.result.input).toMatchObject({ widthMm: 35, tip: 'zaobleny', waistMm: 950 });
    expect(outcome.result.holes.diameterMm).toBe(5);
    // Zaoblený 35 mm destička nepokryje: lekce 6 pak tiskne list 2.
    expect(outcome.result.plate.usable).toBe(false);
  });

  it('listy se tisknou jen tam, kde destička nejde (lekce 4 a 6)', () => {
    const prints = beltProject.lessons.flatMap((l) =>
      (l.prints ?? []).map((p) => ({ order: l.order, ...p })),
    );
    expect(prints.map((p) => [p.order, p.sheetId])).toEqual([
      [2, BELT_SHEET_IDS.buckle],
      [4, BELT_SHEET_IDS.buckle],
      [6, BELT_SHEET_IDS.tip],
    ]);
    for (const p of prints) expect(p.condition).toMatch(/„ne“/);
  });

  it('destička a listy se volí po řadách: za řadu s „ne“ jen její list', () => {
    const body = step(1, 'plate-or-sheets').body;
    expect(body).toContain('za řadu 3 použijete list 1 (lekce 2 a 4)');
    expect(body).toContain('za řadu 1 nebo 2 list 2 (lekce 6)');
    for (const order of [2, 4, 6]) {
      for (const p of lesson(order).prints ?? [])
        expect(p.condition).toContain('kterou list nahrazuje');
    }
  });

  it('kroky s volbou destička/list ukazují, čím značíte (odvozené, nic se nezapisuje), a odkazují na listy', () => {
    for (const [order, id] of [
      [4, 'plate-or-sheet'],
      [6, 'row'],
    ] as const) {
      const s = step(order, id);
      expect(s.printLink).toBe('pattern-sheets');
      expect(s.beltRecalls).toContain('marking');
    }
    expect(step(1, 'plate-or-sheets').records).toBeUndefined();
    expect(step(1, 'plate-or-sheets').beltRecalls).toEqual(['marking']);
    expect(step(2, 'mark').beltRecalls).toEqual(['marking']);
  });

  it('lepení poutka má časovač podle návodu lepidla', () => {
    expect(step(4, 'keeper').waits).toEqual([
      expect.objectContaining({ minutes: 10, maxMinutes: 15, basis: 'manufacturer' }),
    ]);
    expect(step(4, 'keeper').body).toContain('podle návodu na obalu');
  });
});

describe('obsah – pásek: nákup', () => {
  it('každý řádek plánu má v katalogu příklad', () => {
    for (const line of beltProject.shoppingPlan!.lines) {
      expect(findPlanExample(line, equipmentCatalog), `${line.equipmentSlug} ${line.url}`).toBe(
        equipmentCatalog[line.equipmentSlug]!.examples.find(
          (e) => e.url === line.url && e.variant === line.variant,
        ),
      );
    }
  });

  it('každá položka z „Připravte si“ má v plánu řádek, nebo důvod, proč se nekupuje', () => {
    const plan = beltProject.shoppingPlan!;
    const covered = new Set([
      ...plan.lines.map((l) => l.equipmentSlug),
      ...plan.skipped.map((s) => s.equipmentSlug),
    ]);
    for (const l of beltProject.lessons) {
      for (const slug of [...l.requiredEquipment, ...l.recommendedEquipment]) {
        expect(covered.has(slug), `lekce ${l.order}: ${slug}`).toBe(true);
      }
    }
  });

  it('plán je pro 40 mm a říká, co závisí na šířce a tloušťce', () => {
    const plan = beltProject.shoppingPlan!;
    expect(plan.title).toMatch(/40 mm/);
    expect(plan.title).toMatch(/šířce závisí pás .* a přezka, na změřené tloušťce dřík nýtu/);
    expect(plan.title).toContain('„Váš pásek“');
    const strap = plan.lines.find((l) => l.equipmentSlug === 'belt-strap')!;
    expect(strap.variant).toBe('40 mm');
  });

  it('nabídky pásu ve výpočtu „Váš pásek“ sedí s katalogem a naopak', () => {
    const examples = equipmentCatalog['belt-strap']!.examples;
    const key = (url: string, variant: string | undefined) => `${url} ${variant ?? ''}`;
    const byKey = new Map(examples.map((e) => [key(e.url, e.variant), e]));
    const reached = new Set<string>();
    for (const color of STRAP_COLORS) {
      for (let widthMm = 28; widthMm <= 45; widthMm++) {
        for (const thicknessMm of [3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.75, 3.8, 3.9, 4]) {
          for (const waistMm of [900, 1000, 1070, 1150, 1250, 1450]) {
            const r = deriveBeltConfig({ widthMm, thicknessMm, tip: 'hrot', waistMm, color });
            expect(r.ok).toBe(true);
            if (!r.ok) continue;
            for (const o of r.result.shopping[0]!.offers!) {
              const k = key(o.url, o.variant);
              const e = byKey.get(k);
              expect(e, k).toBeDefined();
              expect(e!.shop, k).toBe(o.shop);
              expect(e!.priceCents, k).toBe(o.priceCents);
              expect(e!.availability, k).toBe(o.availability);
              expect(e!.checkedAt, k).toBe(o.checkedAt);
              expect(e!.color, k).toBe(STRAP_COLOR_LABELS[o.color]);
              reached.add(k);
            }
          }
        }
      }
    }
    // Každý pás v katalogu nabídne i výpočet (žádný mrtvý příklad).
    expect([...byKey.keys()].filter((k) => !reached.has(k))).toEqual([]);
  });

  it('přezky s ověřeným jedním trnem jsou v katalogu ve své šířce; „ověřená“ ve výpočtu = některá z nich', () => {
    const buckles = equipmentCatalog['belt-buckle']!.examples;
    for (const b of VERIFIED_BUCKLES) {
      const e = buckles.find((x) => x.url === b.url);
      expect(e, b.url).toBeDefined();
      expect(e!.shop).toBe(b.shop);
      expect(e!.title).toContain(`${b.widthMm} mm`);
      if (b.prong === 'fotka') expect(e!.note).toMatch(/jeden trn podle fotky/i);
    }
    // Pro 40 mm je první černý nikl z Andexnite (výběr uživatele), i první příklad v katalogu.
    expect(VERIFIED_BUCKLES[0]!.url).toBe(buckles[0]!.url);
    expect(buckles[0]!.title).toBe('Opasková přezka 40 mm, černý nikl');
    for (const widthMm of [28, 30, 35, 40, 45]) {
      const r = deriveBeltConfig({ widthMm, thicknessMm: 3.5, tip: 'hrot' });
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      expect(r.result.buckle.verified, `${widthMm} mm`).toBe(
        VERIFIED_BUCKLES.some((b) => b.widthMm === widthMm),
      );
    }
  });

  it('nýty z výpočtu jsou v katalogu; dřík v poznámce sedí s pravidlem 2t − 1,5 … 2t − 1', () => {
    const screws = equipmentCatalog['chicago-screws']!.examples;
    for (const o of CHICAGO_SCREW_OPTIONS) {
      const e = screws.find((x) => x.url === o.url && x.variant === o.variant);
      expect(e, `${o.url} ${o.variant ?? ''}`).toBeDefined();
      expect(e!.shop).toBe(o.shop);
      // Rozsah tloušťky pásu, na který nýt sedí: (dřík + 1) / 2 … (dřík + 1,5) / 2.
      const lo = Math.ceil(((o.postMm + 1) / 2) * 100 - 1e-6) / 100;
      const hi = Math.floor(((o.postMm + 1.5) / 2) * 100 + 1e-6) / 100;
      const m = /na pás (\d+(?:,\d+)?)–(\d+(?:,\d+)?) mm/.exec(e!.note ?? '');
      expect(m, o.product).not.toBeNull();
      const num = (v: string) => Number(v.replace(',', '.'));
      expect([num(m![1]!), num(m![2]!)], o.product).toEqual([lo, hi]);
    }
    // Leatory „1/4" (6 mm)“ je 6,35 mm, ne 6 mm.
    const leatory = CHICAGO_SCREW_OPTIONS.find((o) => o.shop === 'Leatory')!;
    expect(leatory).toMatchObject({ postMm: 6.35, inch: '1/4"', variant: '1/4" (6 mm)' });
  });
});

describe('pásek – pořadí poutka a ohybu (opasek-postup.md krok 7)', () => {
  it('lekce 4: poutko se vyrobí a navlékne na pás před ohnutím, posune se před značením druhé dvojice', () => {
    const ids = lesson(4).steps.map((s) => s.id);
    expect(ids.indexOf('keeper')).toBeLessThan(ids.indexOf('bend'));
    expect(ids.indexOf('bend')).toBeLessThan(ids.indexOf('second-pair'));
    const bend = step(4, 'bend').body;
    expect(bend.indexOf('Poutko navlékněte na pás')).toBeLessThan(bend.indexOf('ohněte'));
    expect(step(4, 'second-pair').body).toMatch(/^Poutko posuňte přes přehnutý konec/);
  });

  it('lekce 2: odřezek 15 cm s důvodem z geometrie, ohyb popraskaný nasucho zopakovat navlhčený', () => {
    expect(lessonText(2)).not.toMatch(/20 cm/);
    // Regrese: materiál odkazoval na „15 cm (viz první krok)“, ale krok délku neuváděl.
    expect(step(2, 'get-scrap').body).toMatch(/Odřízněte asi 15 cm/);
    expect(step(2, 'get-scrap').body).toContain('otvor 64,5 mm se po přehnutí dostane na 115,5 mm');
    expect(step(2, 'screw').body).toContain('skrz otvor 64,5 mm');
    expect(step(1, 'order').body).toContain('aspoň nejkratší délku + 15 cm');
    const bend = step(2, 'bend').records!.find((r) => r.id === 'scrap-bend')!;
    expect(bend.hint).toMatch(/^Popraskal-li nasucho, zopakujte ohyb navlhčený\./);
  });
});

describe('pásek – lekce 2: co dělat, když zkouška nevyjde', () => {
  it('každý zápis s volbou má nápovědu a povinné body bez zápisu mají popis', () => {
    for (const s of lesson(2).steps) {
      for (const r of s.records ?? []) {
        if (r.kind === 'choice') expect(r.hint, r.id).toBeTruthy();
      }
    }
    const cp = (slug: string) => lesson(2).checkpoints.find((c) => c.slug === slug)!;
    expect(cp('scrap-cut-and-punched').description).toMatch(/odlomte článek čepele/);
    expect(cp('scrap-cut-and-punched').description).toMatch(/nezačínejte pásek/);
    expect(cp('scrap-edge-balm').description).toMatch(/Tokonole/);
    const punch = step(2, 'punch').records!.find((r) => r.id === 'scrap-punch')!;
    expect(punch.hint).toMatch(/^Roztřepené: vysekněte na odřezku další otvor/);
  });
});

describe('pásek – nálezy kontroly lekcí (2026-10-08, kolo 2)', () => {
  it('poutko se měří kolem 3 vrstev: zdvojený konec a volný konec, který jím prochází', () => {
    const body = step(4, 'keeper').body;
    expect(body).toContain('obepíná 3 vrstvy');
    expect(body).toContain('Papírový proužek obtočte kolem všech 3 vrstev');
    expect(body).not.toContain('kolem obou vrstev');
    expect(body).toContain(`např. ${example.keeper.lengthMm} mm pro 40 × 3,5 mm`);
  });

  it('značka prostřední dírky se z líce propíchne na rub dřív, než se na ni přikládá', () => {
    const ids = lesson(5).steps.map((s) => s.id);
    expect(ids).toEqual(['try-on', 'measure', 'transfer', 'length-check']);
    expect(step(5, 'try-on').body).toContain('jen důlek, ne díru');
    expect(step(5, 'transfer').body).toMatch(/protlačte svisle skrz až na rub/);
    expect(step(6, 'place').body).toContain('na propíchnutou značku z lekce 5');
    expect(lesson(6).requires![0]!.label).toMatch(/propíchnutá na rub/);
  });

  it('list 2 se na značku registruje přes propíchnutou prostřední dírku', () => {
    const body = step(6, 'place').body;
    expect(body).toMatch(
      /střed prostřední dírky propíchněte šídlem\. Hrot šídla dejte do značky, list po šídle sesuňte/,
    );
  });

  it('lekce 6: svislý pohled, kroužení, nikdy neobracet, řada 2 středem slotu', () => {
    expect(step(6, 'place').body).toMatch(/dívejte svisle dolů/);
    expect(step(6, 'place').body).toContain('Destičku nikdy neobracejte.');
    expect(step(6, 'mark').body).toContain('v otvorech kružte po stěně');
    expect(step(6, 'mark').body).toContain('U řady 2 veďte šídlo středem slotu, ne po stěně');
    expect(step(4, 'mark').body).toContain('Destičku nikdy neobracejte.');
  });

  it('hrana oválu se leští v lekci 4 před ohnutím, ne v lekci 6', () => {
    const ids = lesson(4).steps.map((s) => s.id);
    expect(ids.indexOf('oval')).toBeLessThan(ids.indexOf('bend'));
    expect(step(4, 'oval').body).toMatch(
      /Vnitřní hranu oválu .* zaleštěte .* dokud je konec rovný/,
    );
    const ovalClean = lesson(4).checkpoints.find((c) => c.slug === 'oval-clean')!;
    expect(ovalClean.required).toBe(true);
    expect(ovalClean.title).toMatch(/vnitřní hrana je sražená a zaleštěná/);
    expect(lessonText(6)).not.toMatch(/oválu/);
    expect(lesson(6).checkpoints.map((c) => c.slug)).not.toContain('oval-edge');
  });

  it('ohyb rubem k rubu a spoj poutka na straně přehnutého konce, ne na líci', () => {
    expect(step(4, 'bend').body).toContain('rubem k rubu');
    expect(step(4, 'bend').body).toContain('přehnutý konec leží na rubu pásu');
    expect(step(4, 'second-pair').body).toContain('spojem na přehnutý konec');
    expect(lessonText(4)).not.toContain('spojem k pásu');
  });

  it('druhá dvojice: poutko odsunout, sekat podle značek skrz otvory, ohnout zpět, poutko vrátit', () => {
    const body = step(4, 'screws').body;
    const order = [
      'Poutko odsuňte ke špičce',
      'podle značek skrz otvory; původní značky z destičky nebo listu ignorujte',
      'Konec ohněte zpět kolem příčky',
      'poutko posuňte zpět přes přehnutý konec do kapsy',
      'Nýty sešroubujte',
    ].map((t) => body.indexOf(t));
    for (const i of order) expect(i).toBeGreaterThan(-1);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(body).not.toContain('Poutko zůstane v kapse');
  });

  it('šroubovák je v materiálu lekcí 2 a 4 a hlavička s dříkem jde na líc', () => {
    for (const order of [2, 4]) {
      expect(lesson(order).materials).toContain('plochý šroubovák podle drážky šroubku nýtu');
    }
    expect(beltProject.shoppingPlan!.alsoNeeded).toContain(
      'plochý šroubovák podle drážky šroubku nýtu (lekce 2 a 4)',
    );
    expect(step(4, 'screws').body).toContain('hlavičku s dutým dříkem z líce pásu');
    expect(step(2, 'screw').body).toContain('hlavičku s dutým dříkem z líce');
  });

  it('lekce 2 odkazuje na list 1 a má ho v „Vytisknout“', () => {
    expect(step(2, 'mark').printLink).toBe('pattern-sheets');
    expect(lesson(2).prints?.map((p) => p.sheetId)).toEqual([BELT_SHEET_IDS.buckle]);
  });
});

describe('pásek – barevný pásek (hrany a balzám)', () => {
  it('lekce 1: barva se volí ve „Váš pásek“ a krok ji připomíná z aktivního pásku', () => {
    expect(step(1, 'width-and-tip').records).toBeUndefined();
    expect(step(1, 'width-and-tip').body).toContain('Šířku, konec a barvu zvolte ve „Váš pásek“');
    expect(step(1, 'your-belt').beltRecalls).toContain('color');
  });

  it('barva na hrany: zkouška v lekci 2, v lekcích 3 a 6 podmíněně „u barevného pásku“ před leštěním', () => {
    const tryStep = step(2, 'try-edge-paint');
    expect(tryStep.body).toMatch(/^Jen u barevného pásku; u přírodního krok přeskočte\./);
    expect(tryStep.body).toContain('Po zaschnutí pokračujte dalším krokem');
    expect(tryStep.body).not.toContain('mastnoty');
    expect(tryStep.records!.map((r) => r.id)).toEqual([
      'edge-paint-coats',
      'edge-paint-dry-minutes',
    ]);
    const ids3 = lesson(3).steps.map((s) => s.id);
    expect(ids3.indexOf('bevel')).toBeLessThan(ids3.indexOf('edge-paint'));
    expect(ids3.indexOf('edge-paint')).toBeLessThan(ids3.indexOf('burnish'));
    expect(step(3, 'edge-paint').body).toMatch(/^Jen u barevného pásku/);
    expect(step(3, 'edge-paint').waits![0]!.initialFromField).toBe('edge-paint-dry-minutes');
    expect(step(3, 'balm').body).toContain('Balzám dávejte jen, když na odřezku vyhověl');
    const finish = step(6, 'finish').body;
    expect(finish.indexOf('U barevného pásku je obarvěte')).toBeLessThan(
      finish.indexOf('zaleštěte'),
    );
    expect(finish).toContain('jen když balzám na odřezku vyhověl');
    expect(step(4, 'oval').body).toContain('u barevného pásku obarvěte jako v lekci 3');
    for (const order of [2, 3, 4, 6]) {
      expect(lesson(order).recommendedEquipment, `lekce ${order}`).toContain('edge-paint');
      expect(lesson(order).requiredEquipment, `lekce ${order}`).not.toContain('edge-paint');
    }
  });

  it('plán projektu (modrý pás) barvu na hrany vynechává s důvodem: ověřenou modrou nemáme', () => {
    const plan = beltProject.shoppingPlan!;
    expect(plan.lines.some((l) => l.equipmentSlug === 'edge-paint')).toBe(false);
    expect(plan.skipped.find((s) => s.equipmentSlug === 'edge-paint')!.reason).toMatch(
      /^Jen u barevného pásku/,
    );
    const req = beltProject.equipment.find((e) => e.equipmentSlug === 'edge-paint')!;
    expect(req.priority).toBe('recommended');
    const urls = equipmentCatalog['edge-paint']!.examples.map((e) => e.url);
    for (const url of Object.values(EDGE_PAINT_URLS)) expect(urls).toContain(url);
    expect(EDGE_PAINT_URLS.modra).toBeUndefined();
    expect(plan.skipped.find((s) => s.equipmentSlug === 'edge-paint')!.reason).toContain(
      'odstín ověřte',
    );
  });

  it('plán projektu = výběr uživatele: modrý pás Andexnite, černá přezka Andexnite, černé nýty CraftPoint', () => {
    const plan = beltProject.shoppingPlan!;
    const blue = deriveBeltConfig({ widthMm: 40, thicknessMm: 3.5, tip: 'hrot', color: 'modra' });
    if (!blue.ok) throw new Error(blue.problems.join(' '));
    const computed = beltShoppingPlan(plan, blue.result, 'Modrý', equipmentCatalog);
    for (const slug of ['belt-strap', 'belt-buckle', 'chicago-screws'] as const) {
      const own = plan.lines.filter((l) => l.equipmentSlug === slug);
      const calc = computed.lines.filter((l) => l.equipmentSlug === slug);
      expect(
        own.map((l) => [l.url, l.variant, l.quantity]),
        slug,
      ).toEqual(calc.map((l) => [l.url, l.variant, l.quantity]));
    }
    expect(plan.lines.find((l) => l.equipmentSlug === 'belt-strap')!.purpose).toContain(
      'činění neuvedeno, ověřte u prodejce',
    );
  });
});

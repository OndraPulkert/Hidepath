import { equipmentCatalog, equipmentList } from '@/content/equipment';
import { beltProject } from '@/content/projects/belt/project';
import { BELT_RECORD_IDS, BELT_TIP_CHOICES } from '@/content/projects/belt/record-ids';
import { patternSheetUrlsFor } from '@/content/projects/pattern-sheets';
import { type LessonDefinition, projectDefinitionSchema, type RecordField } from '@/content/schema';
import { beltNumbersFromNotebook } from '@/features/belt/belt-prefill';
import { type LessonRecordEntry } from '@/features/notebook/types';
import { findPlanExample } from '@/features/shopping/plan';
import { deriveBeltConfig } from '@/lib/patterns/belt-config';
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
  const field = (id: string): RecordField => fields.find((f) => f.field.id === id)!.field;

  it('lekce 1 zapisuje všechna pole formuláře „Váš pásek“', () => {
    for (const id of Object.values(BELT_RECORD_IDS)) {
      const found = fields.find((f) => f.field.id === id);
      expect(found, id).toBeDefined();
      expect(found!.lesson.order, id).toBe(1);
    }
    const tip = field(BELT_RECORD_IDS.tip);
    expect(tip.kind === 'choice' && tip.options.map((o) => o.value)).toEqual(
      Object.values(BELT_TIP_CHOICES),
    );
    const waist = field(BELT_RECORD_IDS.waist);
    expect(waist.kind === 'number' && waist.unit).toBe('cm');
  });

  it('zápisy z lekce 1 předvyplní formulář a dají čísla pásku', () => {
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
    const outcome = beltNumbersFromNotebook(
      [
        entry(BELT_RECORD_IDS.waist, 95),
        entry(BELT_RECORD_IDS.width, 35),
        entry(BELT_RECORD_IDS.tip, BELT_TIP_CHOICES.zaobleny),
        entry(BELT_RECORD_IDS.thickness, 3.75),
        entry(BELT_RECORD_IDS.prong, 4.5),
      ],
      beltProject.slug,
    );
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
      for (const p of lesson(order).prints ?? []) expect(p.condition).toContain('u této řady');
    }
  });

  it('kroky s volbou destička/list připomínají, čím značíte, a odkazují na listy', () => {
    for (const [order, id] of [
      [4, 'plate-or-sheet'],
      [6, 'row'],
    ] as const) {
      const s = step(order, id);
      expect(s.printLink).toBe('pattern-sheets');
      expect(s.recalls?.map((r) => r.fieldId)).toContain('belt-marking');
    }
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
    for (let widthMm = 28; widthMm <= 45; widthMm++) {
      for (const thicknessMm of [3, 3.1, 3.4, 3.5, 3.6, 3.75, 3.8, 3.9, 4]) {
        for (const waistMm of [900, 1000, 1070, 1150, 1250, 1450]) {
          const r = deriveBeltConfig({ widthMm, thicknessMm, tip: 'hrot', waistMm });
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
            reached.add(k);
          }
        }
      }
    }
    // Každý pás v katalogu nabídne i výpočet (žádný mrtvý příklad).
    expect([...byKey.keys()].filter((k) => !reached.has(k))).toEqual([]);
  });

  it('přezka „ověřená“ ve výpočtu = katalog má mosaznou jednotrnovou z CraftPointu', () => {
    const buckles = equipmentCatalog['belt-buckle']!.examples;
    for (const widthMm of [28, 30, 35, 40, 45]) {
      const r = deriveBeltConfig({ widthMm, thicknessMm: 3.5, tip: 'hrot' });
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      const verified = buckles.some(
        (b) => b.shop === 'CraftPoint' && b.title === `Mosazná opasková přezka ${widthMm} mm`,
      );
      expect(r.result.buckle.verified, `${widthMm} mm`).toBe(verified);
    }
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

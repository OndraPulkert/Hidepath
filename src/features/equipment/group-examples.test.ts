import { getEquipment } from '@/content/equipment';
import { type ProductExample } from '@/content/schema';
import {
  commonBaseTitle,
  groupProductExamples,
  titleContainsVariant,
  variantMeasures,
} from '@/features/equipment/group-examples';

const ex = (over: Partial<ProductExample>): ProductExample => ({
  title: 'Výrobek',
  shop: 'Obchod',
  url: 'https://example.cz/vyrobek',
  priceCents: 10000,
  availability: 'in_stock',
  checkedAt: '2026-10-08',
  ...over,
});

describe('commonBaseTitle', () => {
  it('odstraní koncový úsek s šířkou', () => {
    expect(
      commonBaseTitle([
        'Řemen z přírodní kůže 3–3,5 mm, 130–140 cm, šířka 28 mm',
        'Řemen z přírodní kůže 3–3,5 mm, 130–140 cm, šířka 30 mm',
      ]),
    ).toBe('Řemen z přírodní kůže 3–3,5 mm, 130–140 cm');
  });

  it('odstraní šířku × délku i variantu v závorce', () => {
    expect(
      commonBaseTitle([
        'Řemen na opasek 3,9 mm, přírodní, 28 mm × 130 cm',
        'Řemen na opasek 3,9 mm, přírodní, 30 mm × 150 cm',
      ]),
    ).toBe('Řemen na opasek 3,9 mm, přírodní');
    expect(
      commonBaseTitle([
        'Výsečníky na kůži 2–20 mm, průměr dle výběru (varianta Ø 8 mm)',
        'Výsečníky na kůži 2–20 mm, průměr dle výběru (varianta Ø 10 mm)',
      ]),
    ).toBe('Výsečníky na kůži 2–20 mm, průměr dle výběru');
  });

  it('ponechá společné úseky na konci názvu', () => {
    expect(
      commonBaseTitle([
        'Šroubovací nýt Ø 9 × 5 mm, černý nikl, 10 ks',
        'Šroubovací nýt Ø 9,5 × 6,5 mm, černý nikl, 10 ks',
      ]),
    ).toBe('Šroubovací nýt, černý nikl, 10 ks');
  });

  it('bez čárky krátí po slovech, shodné názvy vrátí celé', () => {
    expect(
      commonBaseTitle([
        'Výsečník na konce opasku do šipky 35 mm',
        'Výsečník na konce opasku do šipky 40 mm',
      ]),
    ).toBe('Výsečník na konce opasku do šipky');
    expect(commonBaseTitle(['Brusný arch 230 × 280 mm', 'Brusný arch 230 × 280 mm'])).toBe(
      'Brusný arch 230 × 280 mm',
    );
  });
});

describe('variantMeasures / titleContainsVariant', () => {
  it('převede rozměry na mm v pořadí výskytu', () => {
    expect(variantMeasures('28 mm, 130 cm')).toEqual([28, 1300]);
    expect(variantMeasures('Ø 8 mm')).toEqual([8]);
    expect(variantMeasures('zrnitost 180')).toEqual([180]);
    expect(variantMeasures('list 0,55 m²')).toEqual([0.55]);
  });

  it('pozná variantu v názvu i s nezlomitelnou mezerou', () => {
    expect(titleContainsVariant('Řemen, šířka 28 mm', '28 mm')).toBe(true);
    expect(titleContainsVariant('Nitě Slam – béžová, 20 m', '0,6 mm')).toBe(false);
  });
});

describe('groupProductExamples', () => {
  it('varianty jedné stránky slije do jedné karty seřazené podle šířky, pak délky', () => {
    const groups = groupProductExamples([
      ex({ title: 'Řemen, přírodní, 30 mm × 130 cm', variant: '30 mm, 130 cm', priceCents: 300 }),
      ex({ title: 'Řemen, přírodní, 28 mm × 140 cm', variant: '28 mm, 140 cm', priceCents: 200 }),
      ex({ title: 'Řemen, přírodní, 28 mm × 130 cm', variant: '28 mm, 130 cm', priceCents: 100 }),
    ]);
    expect(groups).toHaveLength(1);
    const [g] = groups;
    expect(g?.title).toBe('Řemen, přírodní');
    expect(g?.url).toBe('https://example.cz/vyrobek');
    expect(g?.rows.map((r) => r.label)).toEqual([
      '28 mm, 130 cm',
      '28 mm, 140 cm',
      '30 mm, 130 cm',
    ]);
    expect([g?.minPriceCents, g?.maxPriceCents]).toEqual([100, 300]);
  });

  it('společnou poznámku a datum dá jednou, rozdílné k řádkům', () => {
    const [same] = groupProductExamples([
      ex({ title: 'A, 1 mm', variant: '1 mm', note: 'Stejná' }),
      ex({ title: 'A, 2 mm', variant: '2 mm', note: 'Stejná' }),
    ]);
    expect(same?.note).toBe('Stejná');
    expect(same?.checkedAt).toBe('2026-10-08');
    expect(same?.rows.every((r) => r.note === null)).toBe(true);

    const [diff] = groupProductExamples([
      ex({ title: 'A, 1 mm', variant: '1 mm', note: 'Jedna', checkedAt: '2026-10-01' }),
      ex({ title: 'A, 2 mm', variant: '2 mm', note: 'Druhá' }),
    ]);
    expect(diff?.note).toBeNull();
    expect(diff?.checkedAt).toBeNull();
    expect(diff?.rows.map((r) => r.note)).toEqual(['Jedna', 'Druhá']);
  });

  it('z rozdílných poznámek vytáhne společné věty, k řádku nechá jen odlišnou', () => {
    const [g] = groupProductExamples([
      ex({ title: 'A, 1 mm', variant: '1 mm', note: 'Tloušťka 4 mm. Doprava 59 Kč.' }),
      ex({
        title: 'A, 2 mm',
        variant: '2 mm',
        note: 'Tloušťka 4 mm. Košík je dražší. Doprava 59 Kč.',
      }),
    ]);
    expect(g?.note).toBe('Tloušťka 4 mm. Doprava 59 Kč.');
    expect(g?.rows.map((r) => r.note)).toEqual([null, 'Košík je dražší.']);
  });

  it('stejný název z více stránek obchodu sloučí, odkaz je pak u řádku', () => {
    const groups = groupProductExamples([
      ex({ title: 'Řemen, 28 mm', variant: '28 mm', url: 'https://example.cz/uzke' }),
      ex({ title: 'Řemen, 29 mm', variant: '29 mm', url: 'https://example.cz/uzke' }),
      ex({ title: 'Řemen, 30 mm', variant: '30 mm', url: 'https://example.cz/siroke' }),
      ex({ title: 'Řemen, 40 mm', variant: '40 mm', url: 'https://example.cz/siroke' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.url).toBeNull();
    expect(groups[0]?.rows).toHaveLength(4);
  });

  it('jiný obchod nebo jiný výrobek zůstane samostatně; vyprodané až na konci', () => {
    const groups = groupProductExamples([
      ex({ title: 'B', shop: 'X', url: 'https://x.cz/b', availability: 'unavailable' }),
      ex({ title: 'A', shop: 'Y', url: 'https://y.cz/a' }),
      ex({ title: 'A', shop: 'Z', url: 'https://z.cz/a' }),
    ]);
    expect(groups.map((g) => g.shop)).toEqual(['Y', 'Z', 'X']);
  });

  it('samostatný příklad: variantu připojí jen když už není v názvu', () => {
    const [contained] = groupProductExamples([ex({ title: 'Pravítko 30 cm', variant: '30 cm' })]);
    expect(contained?.title).toBe('Pravítko 30 cm');
    const [appended] = groupProductExamples([ex({ title: 'Nitě, 20 m', variant: '0,6 mm' })]);
    expect(appended?.title).toBe('Nitě, 20 m – 0,6 mm');
  });

  it('opakující se popisky variant rozliší zbytkem názvu', () => {
    const [g] = groupProductExamples([
      ex({ title: 'Kůže, 130 cm, 3,9 mm, 3 cm', variant: '30 mm' }),
      ex({ title: 'Kůže, 140 cm, 3,1 mm, 3 cm', variant: '30 mm' }),
    ]);
    expect(g?.title).toBe('Kůže, 3 cm');
    expect(new Set(g?.rows.map((r) => r.label)).size).toBe(2);
  });
});

describe('groupProductExamples nad katalogem', () => {
  it('řemen na pásek: karta na výrobek, bez zdvojené šířky v názvu', () => {
    const examples = getEquipment('belt-strap').examples;
    const groups = groupProductExamples(examples);
    expect(groups.length).toBeLessThan(15);
    expect(groups.flatMap((g) => g.rows)).toHaveLength(examples.length);
    const leatory = groups.filter((g) => g.shop === 'Leatory');
    expect(leatory).toHaveLength(1);
    expect(leatory[0]?.title).toBe('Řemen na opasek 3,9 mm, přírodní');
    const craft = groups.find((g) => g.shop === 'CraftPoint');
    expect(craft?.title).toBe('Řemen z přírodní kůže 3–3,5 mm, 130–140 cm');
    expect(craft?.rows[0]?.label).toBe('28 mm');
    for (const g of groups) expect(new Set(g.rows.map((r) => r.label)).size).toBe(g.rows.length);
  });
});

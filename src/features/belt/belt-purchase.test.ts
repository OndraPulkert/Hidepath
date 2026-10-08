import { describe, expect, it } from 'vitest';

import {
  SCRAP_ALLOWANCE_CM,
  beltPurchase,
  purchaseLines,
  recommendedOfferText,
} from '@/features/belt/belt-purchase';
import { type BeltConfigInput, deriveBeltConfig } from '@/lib/patterns/belt-config';
import { nearestSoldLengthCm } from '@/lib/patterns/belt-strap-offers';

const result = (input: BeltConfigInput) => {
  const outcome = deriveBeltConfig(input);
  if (!outcome.ok) throw new Error(outcome.problems.join(' '));
  return outcome.result;
};

describe('nejbližší prodávaná délka', () => {
  it('nejkratší délka, která stačí, bez ohledu na pořadí v nabídce', () => {
    expect(nearestSoldLengthCm([150, 130, 140], 134)).toBe(140);
    expect(nearestSoldLengthCm([130, 140, 150], 130)).toBe(130);
    expect(nearestSoldLengthCm([130], 131)).toBeNull();
    // Bez obvodu nejkratší prodávaná.
    expect(nearestSoldLengthCm([150, 130], null)).toBe(130);
  });
});

describe('souhrn „Koupit“', () => {
  const base = { widthMm: 40, thicknessMm: 3.5, tip: 'hrot', waistMm: 950 } as const;

  it('40 × 3,5 mm, obvod 95 cm: aspoň 119 cm → objednejte 130 cm u CraftPointu', () => {
    const p = beltPurchase(result(base));
    expect(p).toMatchObject({
      minLengthCm: 119,
      neededCm: 119,
      orderCm: 130,
      buckleWidthMm: 40,
      punchesMm: [5, 6],
      dyedColor: null,
      screws: { count: 2, postMm: 6 },
    });
    expect(p.offer?.shop).toBe('CraftPoint');
    expect(purchaseLines(p).map((l) => l.what)).toEqual([
      'Řemen',
      'Přezka',
      'Šrouby chicago',
      'Výsečník',
    ]);
    expect(purchaseLines(p)[0]!.detail).toBe(
      '40 mm široký, tloušťka 3,5 mm (postup: 3–4 mm), délka aspoň 119 cm → objednejte 130 cm',
    );
    expect(recommendedOfferText(p)).toMatch(/^Doporučeno: CraftPoint, 130 cm, 285\sKč$/);
  });

  it('odřezek na trénink: + 15 cm; objedná se nejbližší delší délka doporučené nabídky', () => {
    expect(SCRAP_ALLOWANCE_CM).toBe(15);
    const p = beltPurchase(result({ ...base, thicknessMm: 3.9 }), { scrapFromStrap: true });
    expect(p.neededCm).toBe(134);
    expect(p.offer?.shop).toBe('Leatory');
    expect(p.orderCm).toBe(140);
    expect(purchaseLines(p)[0]!.detail).toContain(
      'délka aspoň 119 cm + 15 cm na odřezek = 134 cm → objednejte 140 cm',
    );
  });

  it('bez doporučené nabídky „objednejte“ nepíše a řekne proč', () => {
    const p = beltPurchase(result(base), { scrapFromStrap: true });
    expect(p.neededCm).toBe(134);
    expect(p.offer).toBeNull();
    expect(p.orderCm).toBeNull();
    expect(purchaseLines(p)[0]!.detail).not.toContain('objednejte');
    expect(recommendedOfferText(p)).toMatch(/^Doporučený obchod není/);
  });

  it('bez obvodu: délku nespočítá; Ø 6 mm dírky = jeden výsečník; barevný pás chce barvu na hrany', () => {
    const p = beltPurchase(
      result({ widthMm: 40, thicknessMm: 3.5, tip: 'hrot', holeDiameterMm: 6, color: 'cerna' }),
    );
    expect(p.minLengthCm).toBeNull();
    expect(p.orderCm).toBeNull();
    expect(p.punchesMm).toEqual([6]);
    const lines = purchaseLines(p);
    expect(lines[0]).toEqual(expect.objectContaining({ what: 'Řemen (černá)' }));
    expect(lines[0]!.detail).toContain('délka: zadejte obvod');
    expect(lines.at(-1)).toEqual({ what: 'Barva na hrany', detail: 'černá' });
  });

  it('tloušťka bez ověřeného šroubu: rozsah dříku a „ověřte u prodejce“', () => {
    const p = beltPurchase(result({ ...base, thicknessMm: 3.4 }));
    expect(p.screws.postMm).toBeNull();
    expect(purchaseLines(p).find((l) => l.what === 'Šrouby chicago')!.detail).toBe(
      '2 ks, dřík 5,3–5,8 mm (ověřte u prodejce)',
    );
  });

  it('co podklady neověřily, souhrn řekne (přezka 45 mm, dřík jen v názvu, Ø 5,5 mm)', () => {
    const p = beltPurchase(
      result({ widthMm: 45, thicknessMm: 4, tip: 'hrot', waistMm: 950, holeDiameterMm: 5.5 }),
    );
    const detail = (what: string) => purchaseLines(p).find((l) => l.what === what)?.detail;
    expect(detail('Přezka')).toBe('45 mm, jednotrnová (ověřte u prodejce)');
    expect(detail('Šrouby chicago')).toBe('2 ks, dřík 6,5 mm (ověřte u prodejce)');
    expect(detail('Výsečník')).toBe('Ø 5,5 a Ø 6 mm (Ø 5,5 mm ověřte u prodejce)');
    // 40 × 3,5 mm má vše v podkladech: bez poznámky.
    const ok = purchaseLines(beltPurchase(result(base)));
    expect(ok.map((l) => l.detail).join(' ')).not.toContain('ověřte');
  });
});

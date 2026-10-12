import { describe, expect, it } from 'vitest';

import {
  COMMON_STRAP_LENGTHS_CM,
  SCRAP_ALLOWANCE_CM,
  beltPurchase,
  scrapCheckStrapCm,
  scrapCutCheck,
  scrapCutText,
  strapLengthPlan,
  strapLengthWarnings,
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
  // Pás samotný: poutko z jiné kůže (výchozí poutko z pásu hlídá `describe('… poutko …')`).
  const base = {
    widthMm: 40,
    thicknessMm: 3.5,
    tip: 'hrot',
    waistMm: 950,
    keeperFromStrap: false,
  } as const;

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
      'Poutko',
      'Přezka',
      'Šrouby chicago',
      'Výsečník',
    ]);
    expect(purchaseLines(p)[0]!.detail).toBe(
      '40 mm široký, tloušťka 3,5 mm (postup: 3–4 mm), délka aspoň 119 cm → objednejte 130 cm',
    );
    expect(recommendedOfferText(p)).toMatch(/^Doporučeno: CraftPoint, 130 cm, 284\sKč$/);
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
      result({
        widthMm: 40,
        thicknessMm: 3.5,
        tip: 'hrot',
        holeDiameterMm: 6,
        color: 'cerna',
        keeperFromStrap: false,
      }),
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
      result({
        widthMm: 45,
        thicknessMm: 4,
        tip: 'hrot',
        waistMm: 950,
        holeDiameterMm: 5.5,
        keeperFromStrap: false,
      }),
    );
    const detail = (what: string) => purchaseLines(p).find((l) => l.what === what)?.detail;
    expect(detail('Přezka')).toBe('45 mm, jednotrnová (ověřte u prodejce)');
    expect(detail('Šrouby chicago')).toBe(
      '2 ks, dřík 6,5 mm (rozsah 6,5–7 mm): Andexnite Ø 9,5 × 6,5 mm černý nikl (dřík jen podle názvu), ověřte u prodejce; jiný obchod než pás (Leatory), další poštovné',
    );
    expect(detail('Výsečník')).toBe('Ø 5,5 a Ø 6 mm (Ø 5,5 mm ověřte u prodejce)');
    // 40 × 3,5 mm má vše v podkladech: bez poznámky.
    const ok = purchaseLines(beltPurchase(result(base)));
    expect(ok.map((l) => l.detail).join(' ')).not.toContain('ověřte');
  });
});

describe('modrý pásek 40 mm (výběr uživatele 9. 10. 2026)', () => {
  const blue = {
    widthMm: 40,
    thicknessMm: 3.5,
    tip: 'hrot',
    waistMm: 950,
    color: 'modra',
    keeperFromStrap: false,
  } as const;

  it('výchozí je modrý pás Andexnite 130 cm za 260 Kč, i když činění stránka neuvádí', () => {
    const p = beltPurchase(result(blue));
    expect(p.offer).toMatchObject({
      shop: 'Andexnite',
      url: 'https://andexnite.cz/produkt/hovezi-kuze-na-opasek-modra-130-cm-3-5-3-7-mm/',
      variant: '40 mm',
      lengthCm: 130,
      priceCents: 26_000,
      tanningVerified: false,
      preferred: true,
      checkedAt: '2026-10-09',
    });
    expect(p.orderCm).toBe(130);
    expect(recommendedOfferText(p)).toMatch(
      /^Doporučeno: Andexnite, 130 cm, 260\sKč \(činění neuvedeno, ověřte u prodejce\)$/,
    );
    // Ostatní modré zůstanou jako další obchody, tmavě modrá 3,7–3,8 mm při 3,7 mm.
    expect(p.offers.map((o) => o.shop)).toEqual(['Andexnite']);
    const at37 = beltPurchase(result({ ...blue, thicknessMm: 3.7 }));
    expect(at37.offer?.product).toMatch(/modrá, 130 cm, 3,5–3,7 mm/);
    expect(at37.offers.map((o) => o.product)).toContain(
      'Hovězí kůže na opasek, tmavě modrá, 130 cm, 3,7–3,8 mm',
    );
  });

  it('jen 40 mm: modrý pás 35 mm sám výchozí není (činění neuvedeno)', () => {
    const p = beltPurchase(result({ ...blue, widthMm: 35 }));
    expect(p.offers.some((o) => o.priceCents === 22_500)).toBe(true);
    expect(p.offer).toBeNull();
  });

  it('přezka Andexnite černý nikl, nýty CraftPoint černý nikl z jiného obchodu, barva na hrany „odstín ověřte“', () => {
    const p = beltPurchase(result(blue));
    const detail = (what: string) => purchaseLines(p).find((l) => l.what === what)?.detail;
    expect(detail('Přezka')).toBe(
      '40 mm, jednotrnová: Andexnite 40 mm, černý nikl (jeden trn podle fotky)',
    );
    expect(detail('Šrouby chicago')).toBe(
      '2 ks, dřík 6 mm (rozsah 5,5–6 mm): CraftPoint 10/6 černý nikl, 8 Kč/ks; jiný obchod než pás (Andexnite), další poštovné',
    );
    expect(detail('Barva na hrany')).toBe(
      'modrá: ověřenou v tomto odstínu nemáme, odstín ověřte u prodejce a na odřezku',
    );
  });

  it('naměřeno 3,7 mm: CraftPoint 10/6 a sedí i Leatory 1/4" = 6,35 mm', () => {
    const p = beltPurchase(result({ ...blue, thicknessMm: 3.7 }));
    expect(p.screws.pick?.url).toBe(
      'https://craft-point.cz/products/sroubovaci-nyty-10-6mm-cerny-nikl',
    );
    expect(purchaseLines(p).find((l) => l.what === 'Šrouby chicago')!.detail).toBe(
      '2 ks, dřík 6 mm (rozsah 5,9–6,4 mm): CraftPoint 10/6 černý nikl, 8 Kč/ks; jiný obchod než pás (Andexnite), další poštovné; sedí i Leatory 1/4" = 6,35 mm',
    );
  });

  it('nikdy nýt mimo pravidlo 2t − 1,5 … 2t − 1 mm', () => {
    for (let t = 3; t <= 4.0001; t += 0.01) {
      const p = beltPurchase(result({ ...blue, thicknessMm: Math.round(t * 100) / 100 }));
      for (const o of [p.screws.pick, ...p.screws.alsoFit]) {
        if (o === null) continue;
        expect(o.postMm, `${t}`).toBeGreaterThanOrEqual(p.screws.minMm - 1e-9);
        expect(o.postMm, `${t}`).toBeLessThanOrEqual(p.screws.maxMm + 1e-9);
      }
    }
  });
});

describe('poutko z téhož řemene a odřezek: délka pásu', () => {
  // Pásek uživatele: modrý Andexnite 130 cm, 40 mm, 3,5–3,7 mm; obvod 90 cm.
  const mine = {
    widthMm: 40,
    thicknessMm: 3.5,
    tip: 'hrot',
    waistMm: 900,
    color: 'modra',
  } as const;

  it('pásek 114 cm + poutko 14 cm = 128 cm: modrý pás 130 cm stačí, zbude 2 cm', () => {
    const r = result(mine);
    const p = beltPurchase(r);
    expect(p.plan).toEqual({
      beltCm: 114,
      keeperCm: 14,
      scrapCm: 0,
      beltAndKeeperCm: 128,
      neededCm: 128,
    });
    expect(p.offer?.lengthCm).toBe(130);
    expect(p.orderCm).toBe(130);
    expect(p.lengthWarnings).toEqual([]);
    const lines = purchaseLines(p);
    expect(lines[0]!.detail).toBe(
      '40 mm široký, tloušťka 3,5 mm (postup: 3–4 mm), délka aspoň 114 cm + 14 cm na poutko = 128 cm → objednejte 130 cm',
    );
    expect(lines[1]).toEqual({
      what: 'Poutko',
      detail: 'z téhož řemene: kus 14 cm, proužek 12 × 127 mm',
    });
  });

  it('obojí se přičítá: s odřezkem 143 cm, pás 130 ani 140 cm nestačí', () => {
    expect(COMMON_STRAP_LENGTHS_CM).toEqual([130, 140]);
    const p = beltPurchase(result(mine), { scrapFromStrap: true });
    expect(p.plan).toMatchObject({ beltAndKeeperCm: 128, neededCm: 143 });
    expect(p.lengthWarnings).toEqual([
      'S odřezkem na trénink 15 cm potřebujete 143 cm: pás 130 ani 140 cm nestačí. Trénujte na samostatném odřezku (vypněte trénink na odřezku téhož řemene): na pásek a poutko stačí pás 130 cm.',
    ]);
    expect(purchaseLines(p)[0]!.detail).toContain(
      'délka aspoň 114 cm + 14 cm na poutko + 15 cm na odřezek = 143 cm → objednejte 130 cm (bez odřezku na trénink, ten se nevejde)',
    );
    // Doporučení pásu 130 cm, který na pásek a poutko stačí, se neztratí.
    expect(p.scrapDropped).toBe(true);
    expect(p.orderCm).toBe(130);
    expect(scrapCheckStrapCm(p)).toBe(130);
  });

  it('prahy 130 / 140 cm pro pásek s poutkem', () => {
    const warn = (waistMm: number) =>
      strapLengthWarnings(strapLengthPlan(result({ ...mine, waistMm })));
    // 92,5 cm: pásek 116 + 14 = 130 cm, stačí.
    expect(warn(925)).toEqual([]);
    // 92,6 cm: 117 + 14 = 131 cm.
    expect(warn(926)).toEqual([
      'Pásek 117 cm a poutko 14 cm potřebují 131 cm: pás 130 cm nestačí, 140 cm ano.',
    ]);
    // 102,5 cm: 126 + 14 = 140 cm, stačí 140.
    expect(warn(1025)).toEqual([
      'Pásek 126 cm a poutko 14 cm potřebují 140 cm: pás 130 cm nestačí, 140 cm ano.',
    ]);
    expect(warn(1026)).toEqual([
      'Pásek 127 cm a poutko 14 cm potřebují 141 cm: pás 130 ani 140 cm nestačí. Kupte delší pás, nebo poutko udělejte z jiné kůže (vypněte „Poutko z téhož řemene“).',
    ]);
    // Poutko z jiné kůže: pás se neprodlužuje, varování o poutku není.
    expect(
      strapLengthWarnings(
        strapLengthPlan(result({ ...mine, waistMm: 1026, keeperFromStrap: false })),
      ),
    ).toEqual([]);
  });

  it('lekce 2: z pásu 130 cm po pásku a poutku zbydou 2 cm, konec neřezat', () => {
    const r = result(mine);
    const check = scrapCutCheck(r, 130)!;
    expect(check).toEqual({
      strapCm: 130,
      beltCm: 114,
      keeperCm: 14,
      leftoverCm: 2,
      canCut: false,
    });
    expect(scrapCutText(check)).toBe(
      'Z pásu 130 cm po pásku 114 cm a poutku 14 cm zbývá 2 cm: konec na trénink neřežte, je na poutko. Trénujte na samostatném odřezku.',
    );
    // Bez poutka z pásu zbude 16 cm: odřezek jde.
    const other = scrapCutCheck(result({ ...mine, keeperFromStrap: false }), 130)!;
    expect(other).toMatchObject({ leftoverCm: 16, canCut: true });
    expect(scrapCutText(other)).toBe(
      'Z pásu 130 cm po pásku 114 cm zbývá 16 cm: odřezek 15 cm z konce u špičky uříznout můžete.',
    );
    // Delší pás: 150 − 128 = 22 cm.
    expect(scrapCutCheck(r, 150)).toMatchObject({ leftoverCm: 22, canCut: true });
    expect(scrapCutCheck(r, null)).toBeNull();
    expect(scrapCutCheck(result({ ...mine, waistMm: undefined }), 130)).toBeNull();
  });
});

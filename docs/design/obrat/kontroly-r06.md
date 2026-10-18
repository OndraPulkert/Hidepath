# OBRAT R06 — evidence provedených kontrol

> **Nahrazeno:** aktuální konstrukce je [R09 — zjednodušení](iterace-09-zjednoduseni.md). Tento dokument je historický.

18. 10. 2026. Platí pro aktuální soubory modelu a generátoru R06. Není záznamem fyzické výroby.

- Nový model: 13 automatických testů. Zahrnují chybové varianty, kolize kování a krytů, ztrátu prostoru lepidlem a ruční odchylkou, kapacitu konkrétních mincí a výslovné odmítnutí fyzického schválení ze samotného výpočtu.
- Celá sada aplikace: **1 829 testů prošlo, 8 přeskočeno; 124 souborů prošlo, 1 přeskočený**. Přeskočené testy nejsou vydávané za provedené. Testovací prostředí vypisovalo známá hlášení o nepodporovaném `window.scrollTo` v jsdom.
- `pnpm typecheck`: úspěch.
- ESLint nového modelu, testů a generátoru: úspěch.
- Prettier nových zdrojů a změněných dokumentů: úspěch.
- Generátor spuštěn; JSON obsahuje pozitivní kandidáty i neúspěšnou historickou kombinaci 108 mm / tři komory.
- Oba SVG výstupy jsou platné XML. Místní odkazy v podkladech OBRAT a osnově existují.
- Srovnávací kresba i A4 vzorek zobrazené v lokálním prohlížeči a vizuálně zkontrolované; popisky a výkresy nejsou oříznuté. PNG je náhled srovnávacího SVG, nikoli další rozměrový zdroj.
- A4 vzorek deklaruje skutečné jednotky mm, `viewBox 0 0 210 297`, kontrolní úsečku 50 mm a pokyn k tisku bez přizpůsobení. Skutečný tisk na uživatelově tiskárně ani fyzické změření úsečky neprovedené.
- Rozměry mincí a bankovky porovnány s primárními zdroji ČNB v dokumentu R06; opravená tloušťka 50 Kč na 2,55 mm a zahrnuté zveřejněné tolerance.

**Neprovedené:** výběr a osazení konkrétního kování v dané usni, odřezkový vzorek v kůži, celé mincovní zavírání, skutečná retence, hotový prototyp, měření celkové tloušťky, nošení a začátečnická stavba. Rozvinutí celého těla a klop není uzavřené. Výrobní animace a projekt v registru aplikace proto nejsou vydané jako ověřené.

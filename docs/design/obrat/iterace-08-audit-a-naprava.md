# OBRAT R08 — ověření auditu a provedené opravy

> **Nahrazeno:** aktuální konstrukce je [R09 — zjednodušení](iterace-09-zjednoduseni.md). Tento dokument je historický.

Audit ze snímků byl ověřen proti zdrojovým souborům. Jeho hlavní závěr je správný: současný projekt není návodem, podle kterého lze dokončit peněženku bez konstruktérského dopracování. Dřívější označení beginner a pouhé textové upozornění byly nedostatečné.

## Stav jednotlivých nálezů

| Nález                            | Ověření a náprava                                                                                                                                                                                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1 — šev víčka pod ústím         | Potvrzeno: mezi y48 a y51 není místo pro 3,5mm připojovací šev. Kandidát R08 ruší tento šev a chápe víčko jako integrální pokračování nosiče. Úplné rozvinutí včetně kořene nosiče a délky víčka stále chybí; není to vyřešený střih.                                      |
| A2 — zrcadlení nosiče            | Potvrzeno. V otevřeném vnitřním pohledu je ohyb vlevo a volný konec s A/B vpravo. Opraven nákres i přehled. Izolovaný zkušební list není pravolevý střih výrobku a nelze z něj přenášet kování.                                                                            |
| A3 — pořadí vrstev               | Potvrzeno. Zavřený řez nad mincí od zad: záda, obsah, předek hlavní kapsy, víčko mincí, předek mincí, mince, nosič. Dutiny jsou uvnitř bočního nosiče. Opraven popis i komentář modelu.                                                                                    |
| A4 — rub B a tlak proti obsahu   | Potvrzeno. Zvenčí musí být rub B vidět. Nákres jej nově ukazuje. Model eviduje samostatné zóny A/B/C s neznámou výškou kování. Není potvrzený hladký rub ani maximum tloušťky; tlak proti kartám trvá jako otevřený bod.                                                   |
| A5 — vzdálený roh víčka          | Potvrzené konstrukční riziko, nikoli doložené vypadnutí konkrétního prototypu. Jeden boční B zatím není důkaz retence. Bez celého modulu a 30 zatřesení při otevřeném A se návrh neuvolní. Druhý druk či jiné uzavření není automaticky schváleno.                         |
| A6 — C a šikmá hrana             | Potvrzeno. Model doplněn o vzestup 4 mm, C pracovní x85/y27. Kontrola nyní odečítá i linii švu. Kresba bere C z exportu modelu; staré x91,7/y29 novým testem neprojde. Změna není ověřením délky horního ohybu.                                                            |
| B1–B4 — chybějící střih a kování | Potvrzeno. Nejsou doplněny odhadem. Výrobní etapy jsou publikačně uzamčené. Konkrétní kování, montážní tloušťky, výšky, kryty a úplné přířezy zůstávají otevřené.                                                                                                          |
| B5 — vybavení                    | Doplněn požadavek na výsečník, sada druku včetně příslušného aplikátoru, pomůcky na hrany a specifické vybavení prvních pěti lekcí. Druk je required. Odkazy na sdílené animace osazování jsou v lekci 4. Příklady z katalogu nejsou potvrzenou konkrétní sadou pro OBRAT. |
| C1 — kapacita                    | Doplněna 5 Kč a reprodukovatelná enumerace všech 126 neuspořádaných čtveřic s opakováním. Při limitu dvou mincí na dutinu žádná čtveřice s 50 Kč neprojde. Audit neuvedl tento předpoklad: při povolení tří mincí v jedné dutině obálkově projde například 50              | 1+1+1. Fyzická použitelnost tohoto rozdělení potvrzená není. Lekce uvádí konkrétní skladby a pracovní zkoušku vyjímání spodní mince. |
| C2 — tloušťka                    | Čísla 12,69/13,84/15,24 jsou pouze dílčí nominální součty. Doplněny zóny A/B/C; neznámé výšky jsou null, nikoli nula. Maximum není deklarované. Auditní součty lokálních vrstev závisí na dosud neuzavřených krytech; nejsou převzaty jako skutečné měření.                |
| C3 — ohyby                       | Potvrzeno, zůstává neověřené. Nákres uvádí omezení a zablokované lekce nejsou výrobním pokynem.                                                                                                                                                                            |
| D1 — obejití kontrol             | Doplněn obecný publicationBlock do schématu lekce, vyhodnocení dostupnosti i zámkové hlášky. Lekce 6–10 jsou locked i při uloženém completed. Uživatel je neodemkne odškrtnutím.                                                                                           |
| D2 — obtížnost a čas             | Nová hodnota development zobrazuje Vývojový — neověřený ve všech místech používajících štítek. Čas výroby se u ní nahrazuje textem Doba neověřena. Dashboard neoznačuje podklady jako kompletní střih.                                                                     |
| D3–D6 — texty                    | Nedokončené konstruktérské etapy jsou zablokované, nikoli prezentované jako snadná výroba. Otevřená hrana dutin se dokončuje před šitím. Retence sjednocena na 30 zatřesení všemi směry, odlišena od testu vyjímání. MDX už neopakuje krok 1 a společný odstavec.          |
| D7 — tisk                        | Hlavička aktuální screeningové revize, odlišná čerchovaná polohová čára, legenda, orientace povrchů a svislá 50mm kalibrace vedle vodorovné. Název historického souboru zůstává kvůli odkazům.                                                                             |
| D8 — přehled                     | Opravená orientace nosiče, zobrazené otevřené víčko a rub B. Pohyb zůstává ilustrativním posunem, což stránka výslovně říká; není to mechanická simulace.                                                                                                                  |

## Rozměrový podklad 5 Kč

[ČNB — 5 Kč](https://www.cnb.cz/cs/bankovky-a-mince/mince/5-kc/) uvádí průměr 23 mm, sílu 1,85 mm, tolerance průměru ±0,1 mm a síly ±0,13 mm. Ověřeno při nápravě. Výpočty ostatních mincí navazují na již citované zdroje R06. Tolerance a obálkový vzorec neprokazují pružnost ani tření usně.

## Co je skutečně možné dělat

Přípravu, nácvik a izolované dutiny podle lekcí 1–5. Samostatná výroba celého výrobku vyžaduje doplnit celé rozvinutí, konkrétní druk a rozměry krytů, ověřit rohy víčka při otevřeném A, ohyby a úplnou sestavu. Teprve potom lze odemknout výrobní lekce změnou publikovaného obsahu a následně provést začátečnickou zkoušku.

Vzhledový směr zůstává: malý půdorys, šikmá horní klopa a samostatné C. Nový viditelný rub B je přiznaný důsledek vnitřního kování; estetická předloha jej původně nesprávně vynechávala.

## Provedené kontroly po nápravě

- TypeScript a ESLint dotčených souborů prošly.
- Celá testovací sada: 1841 prošlo, 8 přeskočeno; 126 souborů prošlo, 1 přeskočen.
- Regresní test publikačního zámku ověřuje i uložené completed pro všechny lekce.
- Regresní test C odmítá starou polohu bez rezervy od šikmé hrany a švu.
- Kapacitní test rozlišuje limit dvou mincí na dutinu od samotné obálky povolující tři.
- Lokální produkční sestavení prošlo, s obecným upozorněním na velikost balíčku.
- Vizuálně zkontrolován nový PNG nákres a otevřený mincovní oddíl při 390 px bez přetečení.
- Fyzické zkoušky nebyly provedeny. Změny nebyly nasazeny na produkci.

## Druhá kontrola auditu

Doplněny vlastní katalogové položky pro kování a přípravu otvoru OBRAT, bez konkrétních produktů, cen a textů o jazyku jiného pouzdra. Lekce 4 používá tyto položky. Označení Mám znamená dostupnou konkrétní kompatibilní sadu, nikoli povinnost koupit doporučený výrobek.

Panel 02 má lokální počátek na horní hraně přední stěny; čep C je nyní 11 mm pod ní (y27 minus y16). Model zůstává x85/y27. Sjednoceno označení R08 a odstraněna duplicitní instrukce dokončení horní hrany. Historický dokument R07 výslovně odkazuje na R08; připojený nákres představuje aktuální opravený koncept.

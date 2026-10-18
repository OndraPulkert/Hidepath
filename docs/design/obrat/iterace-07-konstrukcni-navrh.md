# OBRAT R07 — návrat vzhledu, konstrukční rozkres

> **Nahrazeno:** aktuální konstrukce je [R09 — zjednodušení](iterace-09-zjednoduseni.md). Tento dokument je historický.

> Pracovní návrh 18. 10. 2026. Navazuje na vzhledovou preferenci iterace 03 a zachovává výpočtové podklady R06. Není schváleným střihem ani doloženým fyzickým prototypem.

[Nákres](obrat-r07-konstrukcni-navrh.svg) / [PNG](obrat-r07-konstrukcni-navrh.png).

## Zapracované zkosení horní klopy

Autor schválil mírně asymetrickou spodní hranu horní klopy. Pracovní rozdíl výšek je **4 mm na šířce 108 mm** (přibližně 2,1°), v čelním pohledu pravý konec výše než levý. Tělo a mincovní pás zůstávají rovné. Klopa končí vlevo na y 42 a vpravo na y 38 při horním okraji pásu y 48: pracovní mezera tedy 6–10 mm mimo zaoblení. Není to seříznutí tloušťky usně ani požadavek na ztenčování.

Šev sleduje šikmý okraj; rohy zůstávají oblé. Nákres zobrazuje C ve stejné vodorovné poloze na obou protikusech. Při x 91,7 a y 29 zbývá k přímé spodní hraně klopy přibližně 9,6 mm, k obálce kování Ø 12 přibližně 3,6 mm před zohledněním švu. Toto není schválený montážní odstup: příruba, šev a potřebná pevnost se musejí posoudit společně podle skutečného druku. Pokud budou v konfliktu, posunout celý pár C výše, nikoli zmenšovat okrajovou rezervu.

Při naplnění je nutné ověřit překrytí ústí kapsy také na kratší pravé straně a uzavření obou rohů. Přijatý je vzhledový princip zkosení, nikoli fyzicky ověřená hodnota 4 mm či poloha děr. Reprodukovatelný generátor kresby: `python3 scripts/obrat-r07-drawing.py`.

## Co je předloženo

Tělo 108 × 90 mm, široká zaoblená horní klopa, úzká mezera nad mincovním pásem a nezávislý druk C. Vše z jedné 1,2mm usně. Karty a bankovky sdílejí hlavní kapsu, aby nevznikala další celoplošná vrstva.

Viditelný kompromis ke schválení: tři pole spodního pásu nejsou tři kapsičky. Levé užší pole je pevný lem pro kování A/B; zbývající dvě pole jsou funkční dutiny. Zachovává se přibližný rytmus předlohy, nikoli přesně její konstrukce. R07 nemění status R06 na přijatou variantu. Kresba ukazuje alternativu uvnitř preferovaného vzhledu.

C tvoří objímka v horní klopě a čep na pravém rameni hlavní kapsy. B tvoří objímka ve víčku mincí a čep na levém lemu nosiče mimo mince. A tvoří objímka na levé straně otevřeného nosiče (vnitřní pohled) a čep na levém předku hlavní kapsy; v zavřeném pohledu je vidět vnější čepička A. Kovové rubové části nesmějí zůstat proti kartám bez posouzení hladkosti či krytu. Kruhy v nákresu nejsou montážní otvory, jejich velikost je ilustrativní.

## Kontroly a jejich meze

Rozměry dutin a orientační vrstvy jsou převzaté z COMPACT_OBRAT v modelu R06, nikoli nové důkazy fyzické funkce. Dvě dutiny mají mezi švy 38 mm, využitelnou screeningovou šířku 36 mm a hloubku 34 mm. Čtyři menší mince lze v modelu rozdělit po dvou; nejde o garanci čtyř libovolných mincí. Viz [R06](iterace-06-jedna-kuze-1-2mm.md).

Přední pohledy jsou schémata se stylizovanými polohami obsahu a částečně rozevřenou klopou. Nejsou ortogonálním výrobním výkresem; nelze z nich odměřovat délky klop. Nákres neřeší kinematiku materiálu ani automaticky neověřuje vzájemné dosednutí druků.

## Neuzavřené konstrukční body

- Délka integrálního bočního ohybu přes naplněnou peněženku. Není to přímé přeložení na ostré hraně těla.
- Délka horní klopy přes obsah a poloha její objímky C: dopasovat na vzorku, ne zrcadlením souřadnic v kresbě.
- Rozvinutí víčka mincí, uzavření bočních rohů a retence nejmenší mince při třesení. Jeden levý B může dovolit zvedání vzdáleného pravého rohu; toto je důvod k testu celého modulu před finálním střihem.
- Konkrétní druky, jejich osazení v jedné vrstvě 1,2 mm, kryty a skutečná výška kování.
- Dosažitelnost všech švů při skládání: mincovní modul sešívat rozložený před hlavní kapsou; kování instalovat před znepřístupněním rubu.

## Další konkrétní ověření

Nejprve odřezkový modul včetně celého víčka a B, poté objemový model naplněného těla pro délky ohybů A/C. Až po uzavření těchto bodů sestavit tiskový střih 1:1. Papír neověří tření, pružnost usně ani pevnost osazení druků. Finální návod a výrobní animace zůstávají podmíněné koženým prototypem.

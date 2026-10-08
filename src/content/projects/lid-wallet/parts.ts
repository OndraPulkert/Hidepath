import { type Glossary, type GlossaryEntry } from '@/content/schema';
import { LID_PART_NAMES } from '@/lib/patterns/lid-wallet-sheets';

/**
 * Díly a zkratky Víčka podle legendy v `docs/zadani/penezenka-vicko.md` (oddíly 5.2–5.8, 7 a 11).
 * Jediný zdroj vysvětlivek: karta „Díly Víčka“ na stránce projektu, vysvětlivky v krocích lekcí
 * a řádek dílů v legendě listů (krátká jména dílů sdílí s listy přes `LID_PART_NAMES`).
 *
 * `pattern` mají jen hesla, u kterých by celé slovo chytilo i něco jiného: samotné „B“ jsou
 * záda, ne „stav B“, „záloha B“ ani výčet „A, B a C“; „k“ je posun víčka, ne předložka.
 */
const entries: GlossaryEntry[] = [
  // Díly
  {
    term: 'P1',
    name: LID_PART_NAMES.P1,
    description:
      'Jeden pás usně: přední stěna F, ohyb dna, záda B, závěs, pás víčka a jazýček s magnetem.',
    where: 'List 1 (líc) a list 2 (rub).',
    group: 'parts',
  },
  {
    term: 'F',
    name: LID_PART_NAMES.F,
    description: 'Začátek P1 vpředu. Nahoře výřez pro palec, na rubu plíšek K2 a přepážka D1.',
    where: 'P1 od horní hrany F po ohyb dna.',
    group: 'parts',
  },
  {
    term: 'ohyb dna',
    name: 'ohyb dna',
    description: 'Dno peněženky: P1 se tu za mokra přehne přes vložku dna, z rubu je rýha na ose.',
    where: 'P1 mezi F a B.',
    group: 'parts',
    inline: false,
  },
  {
    term: 'B',
    name: LID_PART_NAMES.B,
    description: 'Zadní stěna P1 s okénkem bankovek a dvěma okénky mincí; na rub se lepí D2.',
    where: 'P1 mezi ohybem dna a závěsem.',
    group: 'parts',
    pattern: String.raw`(?<!,|[Zz]álo[hz]\p{L}*\s|[Ss]tav\p{L}*\s|(?<!\p{L})[AC]\s?(?:,|a|i|\/)\s?|\)\s?,\s?)B(?!\s?(?:,|a|i|\/)\s?[AC](?![\p{L}\p{N}]))`,
  },
  {
    term: 'závěs',
    name: 'závěs',
    description:
      'Plochý pás se dvěma přehyby nad zády. Nelepí se ani nešije, tvaruje se zavřený přes obsah.',
    where: 'P1 mezi B a pásem víčka (pás závěsu na listu 1).',
    group: 'parts',
    inline: false,
  },
  {
    term: 'pás víčka',
    name: 'pás víčka',
    description: 'Víčko mezi závěsem a jazýčkem; zavřené přikryje ústí všech oddílů.',
    where: 'P1 za závěsem.',
    group: 'parts',
    inline: false,
  },
  {
    term: 'jazýček',
    name: 'jazýček',
    description: 'Úzký konec víčka. Na rubu nese magnet K1 pod podšívkou L1, zavřený leží na F.',
    where: 'Konec P1 (šablona konce jazýčku na listu 4).',
    group: 'parts',
    inline: false,
  },
  {
    term: 'D1',
    name: LID_PART_NAMES.D1,
    description:
      'Nebarvená kozinka. Dole přilepená na rub F a sešitá, tvoří zvednuté dno karet; horní hrana je natřená.',
    where: 'Za kartami, před bankovkami (list 3).',
    group: 'parts',
  },
  {
    term: 'D2',
    name: LID_PART_NAMES.D2,
    description: 'Čokoládová kozinka. Rubem přilepená na rub B, švy S1–S3 tvoří dva sloupce mincí.',
    where: 'Za bankovkami, před mincemi (list 3).',
    group: 'parts',
  },
  {
    term: 'L1',
    name: LID_PART_NAMES.L1,
    description:
      'Kousek kozinky přes magnet na rubu jazýčku; ořízne se s jazýčkem a obšije švem S7.',
    where: 'Rub konce jazýčku (přířez list 3, šablona list 4).',
    group: 'parts',
  },
  {
    term: 'K1',
    name: LID_PART_NAMES.K1,
    description: 'Magnet Ø 8 × 1,5 mm. Polohu určíte až na hotovém kusu a přilepíte epoxidem.',
    where: 'Rub jazýčku pod L1 (lekce 11).',
    group: 'parts',
  },
  {
    term: 'K2',
    name: LID_PART_NAMES.K2,
    description: 'Ocelový plíšek 14 × 20,5 mm, kotva magnetu. Hrany zabroušené a přelakované.',
    where: 'Rub F pod dnem karet, přelepený D1 (šablona list 4).',
    group: 'parts',
  },
  {
    term: 'vložka dna',
    name: 'vložka dna',
    description:
      'Přípravek, ne díl: 2 vrstvy starých karet (asi 1,5 mm), přes které se za mokra ohne dno.',
    where: 'Na rubu B hranou na čáře hrany vložky (list 1 a 2).',
    group: 'parts',
    inline: false,
  },
  // Lepení
  {
    term: 'G1',
    name: 'plíšek na F',
    description: 'Plíšek K2 celou plochou na rub F, až po mokrém ohybu dna.',
    where: 'Rub F pod dnem karet (list 2, lekce 8).',
    group: 'glue',
  },
  {
    term: 'G2',
    name: 'D1 na F',
    description: 'D1 rubem na rub F přes plíšek, nahoru jen po čáru dna karet.',
    where: 'Rub F dole (list 2, lekce 8).',
    group: 'glue',
  },
  {
    term: 'G2b',
    name: 'boky D1',
    description: 'Úzké pásy u boků D1 na rub F, aby karta nepřešla kolem boku k bankovkám.',
    where: 'Boky D1 nad dnem karet (list 2, lekce 8).',
    group: 'glue',
  },
  {
    term: 'G3',
    name: 'D2 na záda',
    description: 'D2 rubem na rub B: dno mincí (G3a), boky (G3b) a střed mezi sloupci (G3c).',
    where: 'Rub B (list 2 a 3, lekce 6).',
    group: 'glue',
  },
  {
    term: 'G3a',
    name: 'dno mincí',
    description: 'Pás přes celou šířku D2 dole, kousek nad čáru švu S1.',
    where: 'Spodní okraj D2 na rubu B.',
    group: 'glue',
  },
  {
    term: 'G3b',
    name: 'boky D2',
    description: 'Pásy u boků D2 nahoru po pás závěsu.',
    where: 'Boky D2 na rubu B.',
    group: 'glue',
  },
  {
    term: 'G3c',
    name: 'střed D2',
    description: 'Pás mezi sloupci mincí, jen po pás závěsu, ne k horní hraně D2.',
    where: 'Střed D2 na rubu B.',
    group: 'glue',
  },
  {
    term: 'G4',
    name: 'boky těla',
    description:
      'Rub F na líc D2 (zdrsnit) a dole rub F na rub B; drží tělo pohromadě před švy S4/S5.',
    where: 'Pásy u obou boků (lekce 9).',
    group: 'glue',
  },
  {
    term: 'G5',
    name: 'magnet na jazýček',
    description: 'Magnet K1 epoxidem na zdrsněný rub jazýčku na značce.',
    where: 'Rub konce jazýčku (lekce 11).',
    group: 'glue',
  },
  {
    term: 'G6',
    name: 'L1 na jazýček',
    description: 'Celý přířez L1 přes magnet; pak ořez s jazýčkem a šev S7.',
    where: 'Rub konce jazýčku (lekce 11).',
    group: 'glue',
  },
  // Švy
  {
    term: 'S1',
    name: 'dno mincí',
    description: 'Vodorovný šev skrz D2 + B pod sloupci mincí.',
    where: 'Dole na D2 (lekce 6).',
    group: 'seams',
  },
  {
    term: 'S2',
    name: 'levý sloupec mincí',
    description: 'Svislý šev skrz D2 + B, odděluje levý sloupec mincí od středu.',
    where: 'D2 vlevo (lekce 6).',
    group: 'seams',
  },
  {
    term: 'S3',
    name: 'pravý sloupec mincí',
    description: 'Svislý šev skrz D2 + B, odděluje pravý sloupec mincí od středu.',
    where: 'D2 vpravo (lekce 6).',
    group: 'seams',
  },
  {
    term: 'S4',
    name: 'levý bok',
    description: 'Boční šev skrz F, D2 a B (nejvýš 3 vrstvy), až po slepení G4.',
    where: 'Levý bok těla (lekce 9).',
    group: 'seams',
  },
  {
    term: 'S5',
    name: 'pravý bok',
    description: 'Jako S4 na pravém boku.',
    where: 'Pravý bok těla (lekce 9).',
    group: 'seams',
  },
  {
    term: 'S6',
    name: 'dno karet',
    description: 'Šev skrz F + D1 těsně pod čarou dna karet; uprostřed vynechá plíšek.',
    where: 'F dole (lekce 8).',
    group: 'seams',
  },
  {
    term: 'S7',
    name: 'obšití L1',
    description: 'Šev do U kolem magnetu skrz jazýček + L1, ke špičce otevřený.',
    where: 'Konec jazýčku (šablona list 4, lekce 11).',
    group: 'seams',
  },
  // Zkoušky a zálohy
  {
    term: 'P0',
    name: 'papírový model',
    description:
      'Model 1:1 z tvrdšího papíru s kartami, bankovkami a mincemi; P0-1 až P0-9 jsou jeho kontroly.',
    where: 'Lekce 2, podle listů 1–3.',
    group: 'tests',
  },
  {
    term: 'V12',
    name: 'zkouška ohybu',
    description: 'Odřezek kaštanu za mokra přehnout přes vložku; popraská-li líc, platí záloha.',
    where: 'Lekce 3, před řezem P1.',
    group: 'tests',
  },
  {
    term: 'V6',
    name: 'závěs, 10 000 cyklů',
    description: 'Volitelná: pásky usně 10 000× ohnout; V6(c) je pásek ztenčený jako záloha B2.',
    where: 'Mimo postup (důkladné ověření).',
    group: 'tests',
  },
  {
    term: 'Z-1',
    name: 'zkouška magnetu',
    description: 'Víčko drží zavřené ve stavech A, B i C a otevře se jedním prstem.',
    where: 'Zkušební kus, lekce 12.',
    group: 'tests',
  },
  {
    term: 'Z-2',
    name: 'zkouška závěsu',
    description: 'Palec udrží otevřené víčko a závěs po dnech používání nepraská.',
    where: 'Zkušební kus, lekce 12.',
    group: 'tests',
  },
  {
    term: 'Z-3',
    name: 'zkouška výřezu pro palec',
    description: 'Přední karta jde palcem vysunout, špička jazýčku se o výřez nezachytí.',
    where: 'Zkušební kus, lekce 12.',
    group: 'tests',
  },
  {
    term: 'Z-4',
    name: 'zkouška retence',
    description: 'Po zatřesení dnem vzhůru se nic nepřesune do jiného oddílu ani nevypadne.',
    where: 'Zkušební kus, lekce 12.',
    group: 'tests',
  },
  {
    term: 'k',
    name: 'posun víčka',
    description:
      'Poměr posunu víčka k délce závěsu, kterou spotřebuje obsah (k = Δy / ΔP); návrh 1,0, listy platí do 1,24.',
    where: 'Měří se na P0 (lekce 2) a na hotovém kusu (lekce 10).',
    group: 'tests',
    pattern: String.raw`k(?=\s?(?:$|[,.;:)=])|\s(?:nad|do|z|zadejte|je)(?!\p{L}))`,
  },
  {
    term: 'stav A, B, C',
    name: 'plnost peněženky',
    description:
      'A prázdná; B 2 karty, 1 bankovka, 1 mince; C plná: 6 karet, 3 bankovky, 4 × 50 Kč.',
    where: 'Zkoušky P0, k a Z-1 až Z-4.',
    group: 'tests',
    pattern: String.raw`[Ss]tav\p{L}*\s+[ABC]`,
  },
  {
    term: 'záloha A',
    name: 'P1 z usně 0,8',
    description:
      'Celý P1 z tenčí usně, nic se neztenčuje. Přednostní záloha, když V12 nebo Z-2 neprojde.',
    where: 'Formulář listů, lekce 3 a 12.',
    group: 'tests',
    pattern: String.raw`[Zz]álo[hz]\p{L}*\s+A`,
  },
  {
    term: 'záloha B',
    name: 'ztenčení na 0,6',
    description: 'Ztenčit pás ohybu dna (B1) nebo pás závěsu (B2), jen když záloha A nestačí.',
    where: 'Formulář listů, lekce 5.',
    group: 'tests',
    pattern: String.raw`[Zz]álo[hz]\p{L}*\s+B`,
  },
  {
    term: 'B1',
    name: 'záloha: ztenčený ohyb dna',
    description: 'Pás ohybu dna ztenčený na 0,6, když ve V12 popraská líc a záloha A nejde.',
    where: 'Formulář listů, lekce 3 a 5.',
    group: 'tests',
  },
  {
    term: 'B2',
    name: 'záloha: ztenčený závěs',
    description:
      'Pás závěsu ztenčený na 0,6, poslední možnost, když závěs neprojde Z-2 ani v záloze A.',
    where: 'Formulář listů, lekce 5 a 12.',
    group: 'tests',
  },
];

export const lidWalletGlossary: Glossary = {
  title: 'Díly Víčka',
  diagram: 'lid-wallet-strip',
  entries,
};

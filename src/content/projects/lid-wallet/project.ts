import { animationLink } from '@/content/animations';
import { illustration } from '@/content/projects/lid-wallet/illustrations';
import {
  type LessonDefinition,
  type MediaSlot,
  type PhaseDefinition,
  type ProjectDefinition,
} from '@/content/schema';

/**
 * Projekt 03 – Peněženka Víčko. Obsah je NÁVRH (draft), stejně jako střih sám
 * (docs/zadani/penezenka-vicko.md, po Kole 12). Čísla v textu jsou pro výchozí střih (P1 1,0 mm,
 * přepážky D1/D2 a podšívka L1 0,6 mm) a počítá je `src/lib/geometry/lid-wallet.ts`; test
 * `project.test.ts` hlídá, že odpovídají modelu. S koupenou kůží jiné tloušťky platí čísla
 * z rámečku „Čísla pro postup“ na listu 4 listů vygenerovaných pro změřenou tloušťku.
 */

export const PROJECT_SLUG = 'lid-wallet';

export const phases: readonly PhaseDefinition[] = [
  { slug: 'enroll', code: '01', name: 'Výběr projektu', kind: 'enrollment' },
  { slug: 'equipment', code: '02', name: 'Vybavení', kind: 'equipment' },
  { slug: 'prepare', code: '03', name: 'Příprava a povinné zkoušky', kind: 'lessons' },
  { slug: 'build', code: '04', name: 'Stavba peněženky', kind: 'lessons' },
  { slug: 'review', code: '05', name: 'Hodnocení', kind: 'completion' },
];

const draft = <T extends Omit<LessonDefinition, 'reviewStatus'>>(l: T): LessonDefinition => ({
  ...l,
  reviewStatus: 'draft',
});

const ill = (id: string, caption: string, src: string): MediaSlot => ({
  id,
  kind: 'illustration',
  caption,
  status: 'available',
  src,
});

const photo = (id: string, caption: string): MediaSlot => ({
  id,
  kind: 'photo',
  caption,
  status: 'planned',
});

/** Připomínka na začátek každé stavební lekce: čísla podle listů pro změřenou kůži. */
const NUMBERS_NOTE =
  'Čísla v této lekci jsou pro výchozí střih (P1 1,0 mm, přepážky a L1 0,6 mm). Pokud máte listy pro změřenou kůži nebo pro zálohu, berte čísla z rámečku „Čísla pro postup“ na listu 4 těchto listů.';

const L1 = '01-measure-and-sheets';
const L2 = '02-paper-model';
const L3 = '03-bend-test';
const L4 = '04-cut-and-mark';
const L5 = '05-crease-windows-edges';
const L6 = '06-d2-and-coin-columns';
const L7 = '07-bottom-fold';
const L8 = '08-plate-d1-card-floor';
const L9 = '09-side-seams';
const L10 = '10-hinge-forming';
const L11 = '11-magnet-lining-s7';
const L12 = '12-finish-and-tests';

export const lessons: readonly LessonDefinition[] = [
  draft({
    slug: L1,
    title: 'Změřit kůži a vytisknout listy pro její tloušťku',
    order: 1,
    phaseSlug: 'prepare',
    estimatedMinutes: 90,
    goal: 'Změřit dodanou kůži, vygenerovat v aplikaci a vytisknout listy střihu pro změřenou tloušťku, zkontrolovat tisk 1:1 a slepit vložku dna ze starých karet.',
    materials: [
      'kůže z jedné objednávky: kaštan 20 × 50 cm (P1), nebarvená kozinka (D1 a L1), čokoládová kozinka (D2)',
      'papír a tužka na zápis tlouštěk',
      'tiskárna A4, papír a tvrdší papír (čtvrtka) na papírový model a šablony',
      '4 staré karty a lepicí páska na vložku dna',
      'nůžky na karty',
    ],
    requiredEquipment: ['digital-caliper', 'veg-tan-leather-1mm', 'thin-goatskin', 'steel-ruler'],
    recommendedEquipment: [],
    prerequisiteLessons: [],
    steps: [
      {
        id: 'measure',
        title: 'Změřte tloušťku kůže',
        body: 'Posuvkou změřte na několika místech P1 (kaštan), D1 (nebarvená kozinka), D2 (čokoládová kozinka) a L1 (z nebarvené kozinky) a zapište. Tloušťka v názvu produktu (0,9–1, 0,8–1 a 0,7–0,9 mm) je jen rozsah, skutečnou určí až měření. Měřte tam, odkud díl vyříznete: přířezy si na kusu předem obkreslete (u kaštanu dva přířezy P1 110 × 240 mm vedle sebe, odřezky na zkoušky z pruhu vedle nich). Do listů zadejte průměr měření v místě dílu (doporučení, ověřit na prototypu); u přepážek zadejte větší z D1 a D2. Pro mez přepážek 0,92 mm platí největší naměřená hodnota: přepážka silnější než 0,92 mm nejde použít, díl vyřízněte z tenčího místa kusu, nebo kupte tenčí kozinku.',
        media: [photo('lw-l1-measure', 'Posuvka měří tloušťku kozinky na okraji kusu')],
      },
      {
        id: 'sheets-for-thickness',
        title: 'Získejte listy pro změřenou tloušťku',
        body: 'Předem vytištěné listy v aplikaci jsou pro výchozí střih: P1 1,0 mm, přepážky D1/D2 a podšívka L1 0,6 mm. Koupené kozinky mají skoro vždy víc (0,7–0,9 mm) a pak se mění skoro všechna čísla postupu – například při přepážkách 0,8 mm je peněženka vysoká 83,0 mm, P1 má 230,86 mm, osa ohybu je v 61,71, dno karet v 25,5 a okno pro lepení magnetu jen 11,50–11,63. Proto potřebujete listy pro svou kůži. Vygenerujete je přímo v aplikaci: na stránce Listy střihu v části „Listy pro vaši kůži“ zadejte změřenou P1, větší z D1 a D2 a L1 a stiskněte Vygenerovat listy. Aplikace je spočítá stejně jako generátor v repozitáři („pnpm pattern:wallet-lid --divider <větší z D1 a D2> --lining <L1>“, a když se P1 liší od 1,0 o 0,05 mm a víc, navíc „--p1 <změřená P1>“; menší rozdíl aplikace sama bere jako 1,0). Když kontroly neprojdou, listy nevzniknou a aplikace česky vypíše, co neplatí.',
        media: [],
      },
      {
        id: 'sheets-rule',
        title: 'Kdy listy generovat znovu',
        body: 'Listy pro změřenou kůži vytiskněte teď: podle nich slepíte i papírový model P0 (lekce 2). Znovu je generujete jen ve dvou případech: když P0 změní vstupy modelu (lekce 2, krok Zapište výsledky), nebo když zkouška ohybu V12 či zkušební kus vybere zálohu (lekce 3 a 12) – pak jedním zadáním se vším, co platí (změřené tloušťky i záloha). Pokaždé nové listy znovu zkontrolujte jako v dalším kroku.',
        media: [],
      },
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte měřítko',
        body: 'Tiskněte na A4 na výšku bez přizpůsobení velikosti (100 %). Změřte kontrolní úsečku 50 mm. Úsečka ale neodhalí chybu měřítka 0,5 % (na P1 asi 1,2 mm), proto změřte i kótu P1 na listu 1 a porovnejte ji s rámečkem „Čísla pro postup“ na listu 4 (výchozí střih 231,66 mm, tolerance ±0,5). Když nesedí, vytiskněte list znovu.',
        media: [],
      },
      {
        id: 'numbers-box',
        title: 'Čísla berte z rámečku na listu 4',
        body: 'Rámeček „Čísla pro postup“ na listu 4 obsahuje všechno, co postup potřebuje: kótu P1, osu ohybu, hranu vložky, pás závěsu, konec lepení G3, plíšek, G2 a S6, očekávanou hranu víčka, značku magnetu a okno lepení. Čísla v textu lekcí jsou jen příklad výchozího střihu. Nejcitlivější je značka magnetu: s přepážkami 0,8 je okno lepení jen 0,13 mm široké.',
        media: [],
      },
      {
        id: 'spacer',
        title: 'Slepte vložku dna ze starých karet',
        body: 'Vložka dna 111 × 25 × 1,5 mm je jediný přípravek. Slepte ji ze 4 starých karet: 2 vrstvy na sobě (2 × 0,76 = 1,52 mm), v každé vrstvě 2 karty vedle sebe kratšími hranami k sobě. Dlouhou hranu, která půjde do ohybu, odstřihněte u všech karet rovně o 4 mm, aby u spoje nezůstaly zaoblené rohy (po střihu zkontrolujte pohledem). Výšku karet nezkracujte. Každá vrstva je o 60,2 mm delší než 111: v jedné vrstvě přebytek ustřihněte zleva, v druhé zprava, aby spoje ležely proti sobě posunuté. Vrstvy slepte lepicí páskou. Stačí i jiný rovný tuhý pás 1,5 mm (tloušťku změřte posuvkou). Jestli vložka ohyb udrží rovný, ukáže zkouška ohybu V12.',
        media: [
          ill(
            'lw-l1-spacer',
            'Vložka dna na rubu zad: hrana vložky leží 1,96 mm za rýhou ohybu směrem k zádům',
            illustration.vlozkaDna,
          ),
        ],
      },
      {
        id: 'templates-later',
        title: 'Šablony vyřízněte až po papírovém modelu',
        body: 'Šablonu konce jazýčku z listu 4 a šablonu výřezu pro palec z listu 1 nalepíte na tvrdý papír a vyříznete až na konci lekce 2, po papírovém modelu: model může změnit výřez i výšku. Když je změní, vyřízněte šablony z nově vytištěných listů.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'thickness-recorded',
        title:
          'Tloušťky P1, D1, D2 a L1 jsou změřené a zapsané a žádná přepážka není silnější než 0,92 mm.',
        required: true,
      },
      {
        slug: 'sheets-checked',
        title:
          'Máte vytištěné listy pro změřenou tloušťku (nebo platí výchozí), úsečka měří 50 mm a kóta P1 sedí s rámečkem na listu 4 na ±0,5 mm.',
        required: true,
      },
      {
        slug: 'spacer-ready',
        title:
          'Vložka dna 111 × 25 × 1,5 mm je slepená a hrana, která jde do ohybu, je rovná bez zaoblených rohů.',
        required: true,
      },
    ],
    commonMistakes: [
      'Tisk s „přizpůsobit stránce“: list je pak menší a úsečka ani kóta P1 nesedí.',
      'Čísla z textu lekcí místo z rámečku „Čísla pro postup“ na listech pro změřenou kůži.',
      'Přepážka vyříznutá z tlustšího místa kozinky (nad 0,92 mm): takovou střih odmítne.',
      'Tloušťka změřená jinde, než odkud se díl pak vyřízne.',
    ],
    safety: [],
    media: [photo('lw-l1-hero', 'Vytištěné listy 1–4 peněženky Víčko, posuvka měří kótu P1')],
  }),

  draft({
    slug: L2,
    title: 'Papírový model P0',
    order: 2,
    phaseSlug: 'prepare',
    estimatedMinutes: 90,
    goal: 'Slepit papírový model 1:1 a se skutečnými kartami, bankovkami a mincemi ověřit, že se vejde 6 karet, bankovky složené napůl a 4 mince, víčko se zavře a výřez pro palec funguje.',
    materials: [
      'listy 1–3 pro změřenou kůži z lekce 1 (nebo výchozí, když platí), vytištěné 1:1 na tvrdší papír',
      'list 4 a list 1 ještě jednou na šablony, tvrdý papír (čtvrtka) a lepidlo na papír',
      'lepicí páska místo švů a lepení, nůžky, nůž a pravítko na okénka',
      '6 karet, bankovky 100–5000 Kč (které máte) a 4 mince 50 Kč',
      'papír a tužka na zápis výsledků',
    ],
    requiredEquipment: ['digital-caliper'],
    recommendedEquipment: ['steel-ruler'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'glue-model',
        title: 'Slepte model',
        body: 'Z tvrdšího papíru podle listů 1–3 vystřihněte pás P1, přepážku D1 a přepážku D2. Do P1 vyřízněte obě okénka mincí 12 × 48 mm, okénko bankovek 14 × 45 mm (skrz P1 i D2) a výřez pro palec – bez nich nejde vyzkoušet vysouvání. Přepážky lepte páskou jen tam, kde se v kůži lepí: D2 na záda v pásech G3 (dno, boky a střed mezi sloupci, list 2), D1 na přední stěnu v G2 a G2b. Sloupce mincí a kapsa karet musí zůstat volné. Boky slepte páskou místo švů S4 a S5. Dovnitř pak přijdou skutečné karty, bankovky a mince.',
        media: [photo('lw-l2-model', 'Slepený papírový model peněženky Víčko s vloženými kartami')],
      },
      {
        id: 'insert-rule',
        title: 'Kam co patří',
        body: 'Ústí jsou tři štěrbiny těsně za sebou. Karty patří do první štěrbiny u přední stěny (na straně jazýčku), před přepážku D1 s barevnou horní hranou. Kartu s magnetickým proužkem vkládejte proužkem k horní hraně (k víčku). Bankovky napůl patří mezi D1 a D2, mince za D2 do levého nebo pravého sloupce. Karta omylem v oddílu bankovek by ležela u magnetu a mohla by přijít o proužek.',
        media: [
          ill(
            'lw-l2-slots',
            'Řez peněženkou a pohled shora do ústí: karty proužkem k horní hraně, bankovky za D1, mince za D2',
            illustration.rezAVlozeni,
          ),
        ],
      },
      {
        id: 'bills',
        title: 'Bankovky (P0-1, P0-2)',
        body: 'Změřte rozměry a tloušťku 10 bankovek a zapište je: délku rozložené bankovky ocelovým pravítkem (je delší než 150 mm, posuvka ji nezměří), výšku, šířku složené bankovky a tloušťku posuvkou. Vejdou se všechny bankovky 100–5000 Kč složené napůl? Pak nízkou stokorunu posuňte ukazováčkem v okénku bankovek (14 × 45 mm uprostřed zad) nahoru a zapište, kolik mm vyčnívá nad ústí. Cíl je aspoň 15 mm, model počítá s 19 mm. Když je to méně, okénko by se muselo prodloužit dolů.',
        media: [],
      },
      {
        id: 'k',
        title: 'Poloha víčka (P0-3)',
        body: 'Na jazýček udělejte rysku. Zapište její polohu ve stavu A (prázdná), B (2 karty, 1 bankovka, 1 mince), C (6 karet, 3 bankovky, 4 × 50 Kč) a C se 2 + 2 mincemi nahoře, zvlášť nad sloupci a nad středem. Spočítejte k = (y_C − y_A) / (P(C) − P(A)). Dělitel P(C) − P(A) je v rámečku „Čísla pro postup“ na listu 4 (výchozí 8,62). Když vyjde k větší než 1,24, musí se zvednout dno karet a výška, nebo přijmout menší plnost.',
        media: [],
      },
      {
        id: 'thumb-notch',
        title: 'Výřez pro palec (P0-4)',
        body: 'S 1, 2 a 6 kartami: (a) vysuňte přední kartu palcem ve výřezu třením nahoru, (b) vytáhněte zadní kartu po vyndání předních, u obou zapište, jestli to jde a jak dlouho to trvá. Výřez slouží jen přední kartě. Zasuňte kartu s vystouplým písmem a prohnutou kartu: zachytí se o dno výřezu? Pak 20× zavřete víčko ve stavu A (bez karet), s 1 kartou, ve stavu B a C, navíc s jazýčkem posunutým o 3 mm vlevo i vpravo: zachytí se špička jazýčku o výřez, zajede pod hranu dna výřezu nebo za přední stěnu?',
        media: [
          ill(
            'lw-l2-notch',
            'Výřez pro palec U 10 × 12 v horní hraně přední stěny a jazýček, který ho přikryje i posunutý o 3 mm',
            illustration.vyrezProPalec,
          ),
        ],
      },
      {
        id: 'coins-wedge',
        title: 'Mince a zvednutí na klínu dna (P0-5, P0-6)',
        body: 'Vyzkoušejte vysunutí jedné mince okénkem sloupce a vložení mince do ústí; mince 50 Kč má ve sloupci volně klouzat. Pak změřte, o kolik výš nad čárou lepení G2 sedí spodní hrana svazku 6 karet a o kolik výš nad lepením G3a sedí sloupec 2 × 50 Kč. Model počítá s 2,28 mm u karet a 1,25 mm u mincí; jiné hodnoty zapište.',
        media: [],
      },
      {
        id: 'full-and-sequence',
        title: 'Plný stav a celý sled (P0-7, P0-8)',
        body: 'Vložte plný stav: 6 karet, 3 bankovky a 4 × 50 Kč. Pak vyzkoušejte celý sled s otevřeným víčkem. Otevřené víčko samo nestojí a pruží zpátky nad ústí – tak to má být. U bankovek a mincí ho drží palec ruky, která peněženku drží, a ukazováček téže ruky posouvá bankovku v okénku bankovek (nebo prst minci v okénku sloupce), druhá ruka bere. Víčko nepřeklápějte až na záda, stačí ho držet zhruba svisle.',
        media: [],
      },
      {
        id: 'slots-p09',
        title: 'Tři štěrbiny (P0-9)',
        body: 'Zasuňte kartu u boku za D1 a omylem do ústí bankovek. Je ústí bankovek dost vidět (barevná hrana D1, tmavá D2)? Když ne, pomůže výraznější barva hrany D1.',
        media: [],
      },
      {
        id: 'record',
        title: 'Zapište výsledky a nechte přepočítat',
        body: 'Když P0 dopadne podle modelu (bankovky se vejdou, stokoruna vyčnívá aspoň 15 mm, k vyjde do 1,24, zvednutí na klínu 2,28 a 1,25 mm, plný stav se vejde), nic se nepřepočítává a platí listy z lekce 1. Když se některá hodnota liší, formulář v aplikaci ani přepínač generátoru ji nezmění. Zapište si naměřené hodnoty (k, zvednutí na klínu, tloušťku a rozměry bankovek), formulář v aplikaci je nemá. Střih pak přepočítá ten, kdo ho udržuje (třeba v Claude Code nad repozitářem): dosadí hodnoty do výchozích hodnot modelu v src/lib/geometry/lid-wallet.ts (pole kDesign, kMax, wedgeLiftNom, wedgeLiftMax, billSheetMm a rozměry bankovek, jak je vypisuje oddíl 12.1 zadání docs/zadani/penezenka-vicko.md) a listy vygeneruje znovu. Dál pracujte až s novými listy.',
        media: [],
      },
      {
        id: 'templates',
        title: 'Vyřízněte šablonu konce jazýčku a výřezu pro palec',
        body: 'Až po P0, z platných listů (z lekce 1, nebo z nových, když P0 změnil vstupy): list 4 a list 1 nalepte na tvrdý papír a vyřízněte (1) šablonu konce jazýčku z listu 4 – obrys špičky R10, křížek středu magnetu, rysku horní hrany L1, čárkovanou hranici klínu posledních 2,5 mm a 8 otvorů S7 (propíchněte je jehlou) – a (2) šablonu výřezu pro palec z listu 1. Na variantě ze zkoušky ohybu V12 nezávisí, použijete je na zkušebním i finálním kuse: výřez v lekci 5, ořez špičky, klín a otvory S7 v lekci 11.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'p0-minimum',
        title:
          'Do modelu se vejde 6 karet, bankovky složené napůl a 4 mince, víčko se zavře a výřez pro palec funguje.',
        required: true,
      },
      {
        slug: 'p0-recorded',
        title:
          'Výsledky P0-1 až P0-9 jsou zapsané a co změnilo vstupy, je přepočítané nebo poslané k přepočtu dřív, než se tisknou listy pro kůži.',
        required: true,
      },
      {
        slug: 'templates-cut',
        title:
          'Šablona konce jazýčku (list 4) a šablona výřezu pro palec (list 1) jsou z platných listů nalepené na tvrdém papíře a vyříznuté.',
        required: true,
      },
      {
        slug: 'p0-one-hand',
        title:
          'Palec držící ruky udrží otevřené víčko a ukazováček téže ruky posune bankovku okénkem.',
        required: false,
      },
    ],
    commonMistakes: [
      'Karta s magnetickým proužkem vložená proužkem dolů nebo do štěrbiny bankovek.',
      'Čekat, že otevřené víčko zůstane stát: samo nestojí, drží ho palec.',
      'Pracovat dál se starými listy, když P0 změnil vstupy modelu.',
      'Model lepený páskou po celé ploše: zalepené sloupce mincí a kapsa karet nejdou vyzkoušet.',
    ],
    safety: [],
    media: [
      photo('lw-l2-hero', 'Papírový model s 6 kartami, bankovkami a 4 mincemi, víčko zavřené'),
    ],
  }),

  draft({
    slug: L3,
    title: 'Zkouška ohybu V12',
    order: 3,
    phaseSlug: 'prepare',
    estimatedMinutes: 10,
    goal: 'Na odřezku kaštanu ověřit, jestli líc v mokrém ohybu přes vložku 1,5 mm nepopraská, a změřit, kam padne rýha vůči vrcholu ohybu – podle toho zvolit výchozí střih nebo zálohu.',
    materials: [
      'odřezek kaštanu aspoň 30 × 40 mm ze stejné kůže, ze které bude P1: dva přířezy P1 110 × 240 mm si na kusu 20 × 50 cm nejdřív obkreslete vedle sebe a odřezek (i ten na podložku S7 v lekci 11) vyřízněte z volného pruhu asi 90 mm vedle nich, ne ze středu kusu',
      'vložka dna z lekce 1',
      'houbička a voda',
      'potravinová fólie',
      '2 hladká prkénka',
      'tupý hrot na rýhu (třeba vypsaná propiska, ověřit na odřezku), tužka',
      'lupa nebo mobil s makrem',
    ],
    requiredEquipment: ['veg-tan-leather-1mm', 'steel-ruler', 'digital-caliper'],
    recommendedEquipment: ['clamps'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'crease-and-mark',
        title: 'Orýhujte odřezek a vyznačte čáry',
        body: `${NUMBERS_NOTE} Na rubu odřezku vytlačte rýhu tupým hrotem u ocelového pravítka: nic neřežte a tlačte stejně po celé šířce. Rýhu vyznačte ryskami i na bocích. Vyznačte i čáru hrany vložky ve vzdálenosti za rýhou z rámečku na listu 4 (řádek „hrana vložky dna“, výchozí 1,96 mm), také ryskami na bocích.`,
        media: [],
      },
      {
        id: 'wet-and-fold',
        title: 'Navlhčete a přehněte přes vložku',
        body: 'Odřezek navlhčete houbičkou a počkejte, až se barva usně skoro vrátí k suché (5–10 min). Vložku položte hranou na čáru hrany vložky (z rámečku na listu 4, výchozí 1,96 mm za rýhou) a odřezek přehněte lícem ven přes vložku 1,5 mm. Mezi vlhký líc a prkénka dejte potravinovou fólii.',
        media: [
          ill(
            'lw-l3-fold',
            'Hrana vložky leží za rýhou (výchozí 1,96 mm), po přehnutí je rýha na rubu ve vrcholu ohybu',
            illustration.vlozkaDna,
          ),
        ],
      },
      {
        id: 'dry',
        title: 'Stáhněte a nechte přes noc',
        body: 'Odřezek stáhněte mezi dvěma prkénky svěrkami a nechte přes noc (12–24 h, ne u topení) vyschnout. Bez svěrek prkénka zatižte knihami nebo je stáhněte silnými gumičkami či kancelářskými klipy – tlak ověřte na odřezku.',
        media: [],
      },
      {
        id: 'inspect',
        title: 'Prohlédněte líc a změřte polohu rýhy',
        body: 'Vložku vyjměte a líc v ohybu prohlédněte lupou nebo fotkou mobilem makrem. Pak posuvkou na boku odřezku změřte, o kolik je ryska rýhy od vrcholu ohybu. Víc než 0,3 mm: čáru hrany vložky na P1 posuňte o tuto odchylku (když rýha leží od vrcholu blíž k přední stěně F, posuňte čáru k F). Do 0,3 mm nechte čáru z listu.',
        media: [
          photo('lw-l3-inspect', 'Detail líce v ohybu odřezku po vyschnutí, posuvka u rysky rýhy'),
        ],
      },
      {
        id: 'decide',
        title: 'Rozhodněte variantu střihu',
        body: 'Líc nepopraskal: výchozí střih (ohyb dna i závěs 1,0 mm, nic se neztenčuje). Líc popraskal: přednostně záloha A – celý P1 z usně 0,8 mm (listy pro změřenou useň 0,8: v aplikaci ji zadejte jako P1, v repozitáři „--p1 0.8“), zkoušku zopakujte na odřezku 0,8. Záloha B1 – ztenčit pás ohybu dna na 0,6 mm (v aplikaci zaškrtávátko B1, v repozitáři „--skive-fold 0.6“) – jen když useň 0,8 nejde sehnat nebo popraská i ona; zkoušku zopakujte na ztenčeném odřezku (lekce 5, krok Jen záloha B1 nebo B2). Zálohu B2 (ztenčení závěsu, „--skive-hinge 0.6“) V12 nevybírá, rozhoduje o ní až zkouška Z-2 zkušebního kusu. Popraská i záloha: zkusit jinou useň do P1 (ověřit), neřezat. Když ohyb po vyschnutí jen trochu odpruží, není to důvod k záloze – ohyb udrží lepení G4 a boční švy. Varianta platí pro zkušební i finální kus; pro zálohu vygenerujte listy znovu (lekce 1, krok Kdy listy generovat znovu).',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'v12-variant',
        title:
          'Odřezek je prohlédnutý a zapsaná varianta střihu: výchozí, záloha A (P1 0,8), nebo záloha B1 (ztenčený ohyb dna).',
        required: true,
      },
      {
        slug: 'v12-offset',
        title:
          'Odchylka rýhy od vrcholu ohybu je změřená a zapsaná, u odchylky nad 0,3 mm i posun čáry hrany vložky.',
        required: true,
      },
    ],
    commonMistakes: [
      'Vložka položená hranou na rýhu: hrana patří o půl oblouku (1,96 mm) za rýhu směrem k zádům.',
      'Rýha vyříznutá nožem místo vytlačená tupým hrotem.',
      'Odřezek z jiné kůže, než ze které bude P1.',
      'Odřezek vyříznutý ze středu kusu: pak se na kus nevejdou oba přířezy P1.',
    ],
    safety: [],
    media: [photo('lw-l3-hero', 'Odřezek po zkoušce ohybu V12 vedle vložky ze starých karet')],
  }),

  draft({
    slug: L4,
    title: 'Řez dílů, plíšek a značení na rub',
    order: 4,
    phaseSlug: 'build',
    estimatedMinutes: 120,
    goal: 'Lekce 4–12 projdete nejdřív celé na zkušebním kuse: vyříznout pro něj pás P1, přepážky D1 a D2, přířez podšívky L1 a jeden plíšek K2 podle platných listů a přenést na rub P1 všechny čáry a hranice lepení.',
    materials: [
      'platné listy 1–4 (po P0 a V12 případně znovu vygenerované), list 1 a list 3 navíc ještě jednou (první výtisk se při řezání rozřeže), tvrdý papír na šablony',
      'šablony konce jazýčku a výřezu pro palec z lekce 2',
      'bezbarvý lak na nehty (hrany plíšku)',
      'jehla na propichování (rýsovací šídlo z projektu 02 dělá větší vpich – jestli poslouží, ověřit na odřezku), tužka',
      'maskovací páska (na přilepení listů 1 a 3 při řezání)',
    ],
    requiredEquipment: [
      'veg-tan-leather-1mm',
      'thin-goatskin',
      'utility-knife',
      'steel-ruler',
      'cutting-mat',
      'round-punches-8-14',
      'mallet',
      'punching-board',
      'steel-sheet',
      'sandpaper',
    ],
    recommendedEquipment: ['hacksaw', 'scratch-awl', 'masking-tape'],
    prerequisiteLessons: [L2, L3],
    steps: [
      {
        id: 'test-piece-first',
        title: 'Nejdřív zkušební kus',
        body: 'Lekce 4–12 projdete nejdřív celé na zkušebním kuse. Z kůže teď vyřízněte jen díly zkušebního kusu: jeden P1, jednu D1, jednu D2, jeden přířez L1 a jeden plíšek. Druhý přířez P1, zbytek obou kozinek a plech nechte celé. P1 finálního kusu řežte až po zkouškách Z-1 až Z-4 (lekce 12) a s tím, co na zkušebním kuse fungovalo – zkušební kus může změnit variantu střihu a s ní i rozměry dílů včetně plíšku.',
        media: [],
      },
      {
        id: 'valid-sheets',
        title: 'Platné listy a šablony',
        body: `${NUMBERS_NOTE} Když P0, V12 nebo zkušební kus něco změnily, vygenerujte listy znovu jedním příkazem se vším, co platí (záloha z V12, „--divider“, „--lining“, případně „--p1“), vytiskněte a znovu zkontrolujte úsečku 50 mm a kótu P1. Tiskněte nejlépe na matný papír pro inkoustové tiskárny 120 g, jinak na obyčejný papír. List 1 a list 3 vytiskněte dvakrát: první výtisk se při řezání rozřeže (hlavní způsob níže), druhý nalepte na tvrdý papír a vyřízněte přesně jako šablonu. Přes šablonu z listu 1 se později propichují otvory švů S1–S3 (lekce 6) a S6 (lekce 8), D2 z listu 3 poslouží v lekci 6 při značení S1–S3 způsobem (b). Šablony z listu 4 (okénka, plíšek, proužek otvorů bočních švů) nalepte na tvrdý papír a vyřízněte. Šablony konce jazýčku a výřezu pro palec máte z lekce 2, na variantě z V12 nezávisí. Na finální kus vytiskněte listy 1 a 3 znovu, z listů, které po zkušebním kuse platí.`,
        media: [],
      },
      {
        id: 'tape-sheet-1',
        title: 'Hlavní způsob: list 1 přilepte na líc',
        body: 'První výtisk listu 1 vystřihněte jen nahrubo, s okrajem 1–2 cm kolem obrysu P1 – přesně po čáře ho nestříhejte, řezat se bude až nožem skrz papír i kůži. List 1 je P1 z líce, proto ho položte na LÍC usně a přilepte maskovací páskou na okrajích, mimo linii řezu, z několika stran, aby se nemohl posunout. Pásku nejdřív zkuste na odřezku usně – silnější páska může na líci nechat lesklou stopu nebo vytrhnout vlákna.',
        media: [],
      },
      {
        id: 'prick-p1',
        title: 'Před řezáním propíchněte značky P1',
        body: 'Dokud je list přilepený a nic není vyříznuté, propíchněte skrz papír: konce osy ohybu dna a obou přehybů závěsu těsně u hrany na obou bocích a středy výsečníků – Ø 8 na napojení jazýčku (vysekává se hned v dalším kroku), Ø 12 na koncích okének mincí a Ø 10 výřezu pro palec (ty se vysekávají až v lekci 5). Otvory švů S1–S3 a S6 teď nepropichujte: propichují se až v lekcích 6 a 8 přes šablonu z druhého výtisku listu 1.',
        media: [],
      },
      {
        id: 'cut-p1',
        title: 'Vyřízněte pás P1 skrz papír',
        body: 'P1 je 101 mm široký a dlouhý podle kóty z rámečku na listu 4 (výchozí 231,66 mm). Řežte skrz papír i kůži přesně po vytištěné čáře. Napojení jazýčku na pás je vyduté (R4): nejdřív výsečník Ø 8 skrz papír, pak tečné rovné řezy nožem. Rovné úseky veďte s ocelovým pravítkem položeným na čáru, na dva až tři lehké tahy, nůž kolmo; oblouky pomalu bez pravítka. Když začne řez třepit papír nebo kůži, odlomte článek čepele. Konec jazýčku nechte rovný v plné délce kóty P1 – je v ní rezerva 5 mm na ořez (list 1: „jazýček … + 5 rezerva“). Špičku R10 teď neřežte: řežete ji až v lekci 11 spolu s podšívkou L1, 7,0 mm pod značkou magnetu nalepeného na hotové peněžence. Výřez pro palec zatím nedělejte (lekce 5).',
        media: [
          photo('lw-l4-p1', 'Vyříznutý pás P1 s jazýčkem, vyduté napojení jazýčku výsečníkem Ø 8'),
        ],
      },
      {
        id: 'peel-p1',
        title: 'Sejměte list a zkontrolujte značky',
        body: 'Pásku strhávejte pomalu pod ostrým úhlem, skoro rovnoběžně s kůží. Zkontrolujte, že se přenesly všechny značky: konce osy ohybu dna a přehybů závěsu na obou bocích a středy okének mincí a výřezu pro palec. Rozřezaný list už znovu nepoužijete.',
        media: [],
      },
      {
        id: 'cut-parts',
        title: 'Přepážky D1, D2 a přířez L1',
        body: 'Pro zkušební kus po jednom kusu: D1 93 × 79,5 mm s horními rohy R3 z nebarvené kozinky, D2 103 × 64 mm z čokoládové kozinky, přířez podšívky L1 24 × 22 mm z nebarvené kozinky. Rozměry berte z listu 3 dané varianty. Stejně jako u P1: z prvního výtisku listu 3 vystřihněte každý díl nahrubo s okrajem 1–2 cm a přilepte ho maskovací páskou na rub kozinky (díly jsou souměrné, takže na straně šablony tvar nezávisí, a propíchnuté značky zůstanou na rubu). U D1 a D2 propíchněte konce osy x 50,5 na horní a spodní hraně – podle osy se přepážky později přikládají. Pak řežte skrz papír po vytištěné čáře: rovné strany s ocelovým pravítkem na čáře, rohy R3 pomalu bez pravítka. Pásku strhněte pomalu pod ostrým úhlem a zkontrolujte značky.',
        media: [],
      },
      {
        id: 'transfer-other',
        title: 'Jinak: šablona vyříznutá přesně',
        body: 'Šablonu můžete také nalepit na tvrdý papír, vyříznout přesně po čáře, přilepit na okrajích a řezat podél jejího okraje. Hlavní způsob je přesnější, protože se řeže přímo po vytištěné čáře.',
        media: [],
      },
      {
        id: 'plate',
        title: 'Plíšek K2',
        body: 'Plíšek je ve výchozím střihu 14 × 20,5 mm (jinak rozměr z listu 3 a 4 varianty, např. při přepážkách 0,8 mm 14 × 20). Vyřízněte jeden pro zkušební kus (plíšek finálního kusu až podle listů varianty, která po zkušebním kuse platí) z pozinkovaného plechu 0,5 mm, který jste v obchodě vyzkoušeli magnetem: pilovým listem na kov, nebo plech naříznete nožem u pravítka a v rýze zlomíte ohýbáním sem a tam (ověřit na odřezku plechu). Rohy R3 a otřep zabruste brusným papírem zrnitosti 120 na desce. Hrany přelakujte bezbarvým lakem na nehty – železo s vlhkou třísločiněnou usní dělá tmavé skvrny.',
        media: [
          photo('lw-l4-plate', 'Plíšek 14 × 20,5 mm se zabroušenými rohy R3 vedle tabule plechu'),
        ],
      },
      {
        id: 'mark-back',
        title: 'Značení na rub',
        body: 'Tužkou, nic nezařezávat: osa ohybu dna a pás závěsu (nelepit, nešít; výchozí v 62,21 a 142,99–150,99), hranice lepení G1–G4, čáry švů S1–S3 a S6, okénka a poloha D1 a D2. Papír se na kůži obkreslit nedá, proto list 2 nalepte na tvrdý papír, vyřízněte po obrysu a přiložte na rub. Rohy lepených ploch a konce čar propíchněte jehlou do kůže a tečky spojte tužkou u pravítka. Osu ohybu dna a přehyby závěsu (výchozí v 145,10 a 148,88) vyznačte navíc ryskami na obou bocích. Všechno je souměrné podle osy x 50,5. „L“ napište zvlášť na rub přední stěny F a na rub zad B. Otvory švů se později propichují vidličkou přes šablonu z listu 1 přiloženou na líc.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'parts-cut',
        title:
          'P1 zkušebního kusu odpovídá kótě z rámečku na ±0,5 mm (konec jazýčku rovný, bez špičky), D1, D2, L1 a plíšek jsou vyříznuté a hrany plíšku přelakované.',
        required: true,
      },
      {
        slug: 'marks-transferred',
        title:
          'Po sejmutí listů jsou vidět všechny propíchnuté značky (konce osy ohybu a přehybů závěsu na bocích P1, středy okének a výřezu, osa D1 a D2) a druhý výtisk listu 1 a 3 je vyříznutý jako šablona.',
        required: false,
      },
      {
        slug: 'back-marked',
        title:
          'Na rubu P1 je osa ohybu dna, pás závěsu, hranice G1–G4, čáry S1–S3 a S6, poloha D1 a D2 a značky L; osa ohybu a přehyby závěsu i na bocích.',
        required: true,
      },
    ],
    commonMistakes: [
      'Výřez pro palec vyříznutý hned: dělá se až v lekci 5.',
      'List 1 jen v jednom výtisku: rozřeže se při řezání P1 a na propichování S1–S3 a S6 pak nemáte šablonu. Vytiskněte ho dvakrát.',
      'Řez podél okraje papíru s nožem přitlačeným k papíru místo k pravítku: nůž uhne a hrana není rovná. Řežte po vytištěné čáře a rovné úseky podle pravítka.',
      'Páska přes linii řezu: nůž jde přes pásku a řez uhne.',
      'Špička jazýčku R10 vyříznutá hned podle obrysu: přijdete o rezervu 5 mm a poloha magnetu vůči špičce přestane platit. Konec jazýčku nechte rovný (kóta P1 včetně rezervy 5 mm), špičku R10 řežete až v lekci 11 spolu s L1, 7,0 mm pod značkou magnetu.',
      'Díly finálního kusu vyříznuté spolu se zkušebním: zkušební kus může změnit variantu a rozměry.',
      'Plíšek z nerezu: austenitická nerez je prakticky nemagnetická, plech vyzkoušejte magnetem.',
      'Nepřelakované hrany plíšku: železo s vlhkou usní dělá tmavé skvrny.',
    ],
    safety: ['Nůž veďte tahem od prstů volné ruky.'],
    media: [
      photo(
        'lw-l4-hero',
        'Vyříznuté díly zkušebního kusu P1, D1, D2, L1 a plíšek na řezací podložce',
      ),
    ],
  }),

  draft({
    slug: L5,
    title: 'Rýha ohybu, okénka mincí, výřez pro palec a hrany',
    order: 5,
    phaseSlug: 'build',
    estimatedMinutes: 120,
    goal: 'Vytlačit rýhu ohybu dna, vyseknout okénka mincí a výřez pro palec a předem dokončit hrany, na které po sestavení nedosáhnete.',
    materials: [
      'odřezek z V12 na vyzkoušení rýhy',
      'tupý hrot na rýhu, maskovací páska, párátka',
      'dřevěný kolík Ø 8–12 do akuvrtačky (leštění vydutých hran)',
      'odřezek kozinky na zkoušku barvy na hrany',
    ],
    requiredEquipment: [
      'steel-ruler',
      'round-punches-8-14',
      'mallet',
      'punching-board',
      'utility-knife',
      'sandpaper',
      'edge-paint',
    ],
    recommendedEquipment: ['edge-burnisher', 'edge-beveler', 'masking-tape'],
    prerequisiteLessons: [L4],
    steps: [
      {
        id: 'crease',
        title: 'Rýha ohybu dna',
        body: `${NUMBERS_NOTE} Na rubu vytlačte podél osy ohybu (výchozí v 62,21) rýhu tupým hrotem u ocelového pravítka. Nic neřežte, tlačte stejně po celé šířce, nejdřív na odřezku z V12. Pás závěsu se nijak neupravuje a ve výchozím střihu se nic neztenčuje (další krok je jen pro zálohu B1 nebo B2).`,
        media: [],
      },
      {
        id: 'skive-backup',
        title: 'Jen záloha B1 nebo B2: ztenčení',
        body: 'Ve výchozím střihu a v záloze A tento krok přeskočte. Záloha B1 ztenčuje pás ohybu dna (jen když ve V12 popraskal líc a záloha A nejde), záloha B2 pás závěsu – ta přichází v úvahu jen pro finální kus, když závěs zkušebního kusu neprojde zkouškou Z-2 ani v záloze A. Nejdřív vygenerujte listy se zálohou (B1 nebo B2), pás ztenčujte z rubu z 1,0 na 0,6 mm v poloze podle listu 1 dané varianty; souřadnice výchozího střihu v záloze neplatí. (a) Nejlépe v ševcovské nebo brašnářské dílně se zvonovým ztenčovačem: pás ohybu 8 × 101 mm včetně náběhů, pás závěsu 15,1 × 101 mm celý na plno a náběh 2 mm vně pásu na obou stranách. P1 předejte nařezaný s pásem vyznačeným na rubu a dílně to řekněte. (b) Když to nejde: brusným papírem zrnitosti 80 na rovném hranolku, pás ohraničte maskovací páskou. U pásu ohybu 8 mm bruste na plno jen střed 4 mm a 2 mm na každé straně nechte jako náběh. Pás závěsu 15,1 mm bruste na plno celý mezi čarami a náběh 2 mm udělejte vně čar na každé straně. Nožem jen hrubě ubírejte a nikdy ne blíž než na 0,8 mm. (c) Tloušťku hlídejte posuvkou: přijatelně 0,6–0,8 mm, okraje pásu jako náběh, ne schod. (d) Nejdřív na odřezku; stejně ztenčený odřezek poslouží k opakování zkoušky V12. Celý postup ověřit na prototypu.',
        media: [],
      },
      {
        id: 'd2-edge',
        title: 'Spodní hrana D2 do tenka',
        body: 'Spodní hranu D2 zbruste brusným papírem na hranolku do tenka (klín 3 mm), nožem ji neztenčujte. Jinak by dělala schod, o který se zachytí bankovka.',
        media: [],
      },
      {
        id: 'coin-windows',
        title: 'Okénka mincí v zádech',
        body: 'Dvě okénka mincí 12 × 48 mm v zadní stěně B: výsečníkem Ø 12 vysekněte oba konce (středy y 34 a 70), mezi nimi veďte rovné řezy nožem. Okénka zkoste z líce, konce vybruste papírem namotaným na kolíku Ø 8–10 a vyleštěte.',
        media: [
          ill(
            'lw-l5-back',
            'Záda zvenku: dvě okénka mincí 12 × 48, uprostřed okénko bankovek 14 × 45 a švy S1–S5',
            illustration.zadaOkenka,
          ),
        ],
      },
      {
        id: 'thumb-notch',
        title: 'Výřez pro palec',
        body: 'Výřez U 10 × 12 mm uprostřed horní hrany přední stěny F: výsečník Ø 10 přes šablonu se středem na ose 7,0 mm pod horní hranou F (y 55,0), pak rovné řezy nožem od hrany F k tečnám díry, zastavit přesně na tečně. Rohy ústí R1 nedělejte nožem, zaoblete je brusným papírem. Jestli výřez funguje, ověří zkušební kus.',
        media: [
          ill(
            'lw-l5-notch',
            'Výřez pro palec: výsečník Ø 10, rovné boky k tečnám, rohy R1 brusným papírem',
            illustration.vyrezProPalec,
          ),
        ],
      },
      {
        id: 'edges',
        title: 'Předběžné dokončení hran',
        body: 'Horní hrany D1 a D2, horní hranu F i s výřezem, spodní hranu a boky pásu víčka a boky jazýčku zkoste (zkosovačem hran, když ho máte z projektu 01 nebo 02; bez něj je zaoblete brusným papírem na hranolku), vybruste a vyleštěte. Výřez pro palec zaoblete z líce i z rubu, protože o rubovou hranu dna výřezu se může zachytit karta; vnitřek vybruste a vyleštěte kolíkem Ø 8 ve vrtačce.',
        media: [],
      },
      {
        id: 'd1-paint',
        title: 'Barevná horní hrana D1',
        body: 'Horní hranu D1 natřete barvou na hrany v tónu kontrastním k D1 (v tónu D2) párátkem ve 2 tenkých vrstvách, mezi vrstvami 20–30 min. Nejdřív na odřezku kozinky: přilnavost na tak tenké hraně je potřeba ověřit.',
        media: [],
      },
      {
        id: 'tokonole',
        title: 'Tokonole jen mimo lepená místa',
        body: 'Tokonole brání přilnutí lepidla, proto ho nanášejte jen mimo lepená místa a hranice lepení přelepte páskou.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'crease-done',
        title: 'Rýha ohybu dna je vytlačená podél osy po celé šířce, nic není naříznuté.',
        required: true,
      },
      {
        slug: 'windows-notch-cut',
        title:
          'Okénka mincí 12 × 48 mm a výřez pro palec 10 × 12 mm jsou vyseknuté, rohy výřezu zaoblené a hrany zkosené.',
        required: true,
      },
      {
        slug: 'edges-prefinished',
        title:
          'Horní hrany D1, D2 a F, hrany pásu víčka a jazýčku jsou vyleštěné a horní hrana D1 natřená kontrastní barvou.',
        required: true,
      },
    ],
    commonMistakes: [
      'Řez nožem za tečnu výsečníku: zářez pak pokračuje do kůže.',
      'Rohy výřezu pro palec nožem místo brusným papírem.',
      'Tokonole na místě, které se bude lepit.',
    ],
    safety: ['Nůž veďte tahem od prstů volné ruky.'],
    media: [photo('lw-l5-hero', 'Pás P1 s vyseknutými okénky mincí a výřezem pro palec')],
  }),

  draft({
    slug: L6,
    title: 'Lepení D2, okénko bankovek a sloupce mincí',
    order: 6,
    phaseSlug: 'build',
    estimatedMinutes: 150,
    goal: 'Přilepit přepážku D2 na záda jen v lepených pásech, proseknout okénko bankovek skrz obě vrstvy a ušít dno a boky sloupců mincí S1–S3.',
    materials: ['maskovací páska', 'jehla na propichování', 'odřezek D2 + B na zkoušku děrování'],
    requiredEquipment: [
      'contact-cement',
      'round-punches-8-14',
      'utility-knife',
      'stitching-chisels',
      'mallet',
      'punching-board',
      'harness-needles',
      'waxed-thread',
      'sandpaper',
    ],
    recommendedEquipment: ['edge-burnisher', 'masking-tape'],
    prerequisiteLessons: [L5],
    steps: [
      {
        id: 'g3',
        title: 'G3: D2 rubem na rub zad',
        body: `${NUMBERS_NOTE} D2 lepte rubem na rub B jen v pásech G3: dno mincí (y 18–23), boky (x 0–4 a 97–101) a střed mezi sloupci (x 35–66), boky a střed jen do y 80,57 (čára na listu 2). Sloupce mincí mezi nimi zůstávají nelepené. Horních 1,43 mm D2 nelepte – nad nimi je pás závěsu. Hranici lepení přelepte maskovací páskou. D2 přesahuje na každé straně o 1 mm. Kontaktní lepidlo naneste na obě strany, nechte zavadnout 10–15 min, spojte a přitlačte; děrovat nejdřív za 1 h.`,
        media: [],
      },
      {
        id: 'bill-window',
        title: 'Okénko bankovek skrz D2 a záda',
        body: 'Až po lepení G3: okénko bankovek 14 × 45 mm uprostřed zad (x 43,5–57,5, y 25–70). Výsečníkem Ø 14 vysekněte oba konce (středy na ose x 50,5, y 32 a 63), mezi nimi rovné řezy nožem skrz obě vrstvy. Zkoste a vyleštěte jako jeden svazek. Mince 1 Kč (Ø 20 mm) okénkem nepropadne.',
        media: [
          ill(
            'lw-l6-back',
            'Okénko bankovek 14 × 45 výsečníkem Ø 14 mezi sloupci mincí, šev S1 dna mincí a švy sloupců S2 a S3',
            illustration.zadaOkenka,
          ),
        ],
      },
      {
        id: 'mark-s1-s3',
        title: 'Otvory S1–S3 na líci D2',
        body: 'List 1 (P1 z líce) na líc D2 přiložit nejde, proto jedno ze dvou (nejdřív na odřezku D2 + B): (a) šablonu P1 z listu 1 přiložte na líc B podle obrysu a všechny otvory S1–S3 propíchněte jehlou skrz B i přilepenou D2, pak na líci D2 děrujte do vpichů; nebo (b) přiložte D2 z listu 3 na líc D2 podle hran, obkreslete čáry S1 (y 22,0), S2 a S3 (x 36 a 65) a otvory odměřte po 4 mm: S1 od osy x 50,5 na obě strany, S2 a S3 od horního otvoru y 76 dolů.',
        media: [],
      },
      {
        id: 'stitch-s1-s3',
        title: 'Děrovat a šít S1, S2, S3',
        body: 'Děrujte z líce D2 na tvrdé desce, vidlička vždy stejně natočená při pohledu na líc D2, horní hranou od sebe – tím mají šikmé otvory na zádech stejný sklon. S1 (dno mincí) má 21 otvorů od x 10,5 do 90,5, S2 a S3 (boky sloupců) po 13 otvorech od y 28 do 76. Šijte sedlovým stehem, na obou koncích 2 otvory zpět.',
        animationLinks: [animationLink('threadLength')],
        media: [
          photo('lw-l6-seams', 'Ušité švy S1–S3 na líci D2, sloupce mincí a okénko bankovek'),
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'g3-glued',
        title:
          'D2 je přilepená jen v pásech G3 (dno, boky a střed do y 80,57) a sloupce mincí zůstaly nelepené.',
        required: true,
      },
      {
        slug: 's1-s3-sewn',
        title:
          'Okénko bankovek je proseknuté skrz obě vrstvy a švy S1, S2 a S3 jsou ušité, konce 2 otvory zpět.',
        required: true,
      },
    ],
    commonMistakes: [
      'Lepidlo ve sloupcích mincí nebo nad čarou 80,57: sloupce by se zalepily, závěs vyztužil.',
      'Okénko bankovek vyseknuté před lepením G3: vrstvy pak nelícují.',
      'Vidlička pokaždé jinak natočená: šikmé otvory na zádech mají různý sklon.',
    ],
    safety: [],
    media: [photo('lw-l6-hero', 'Záda s přilepenou D2, okénky a ušitými švy sloupců mincí')],
  }),

  draft({
    slug: L7,
    title: 'Mokrý ohyb dna',
    order: 7,
    phaseSlug: 'build',
    estimatedMinutes: 30,
    goal: 'Ohnout dno za mokra přes vložku 1,5 mm tak, aby střed ohybu padl na rýhu, a nechat ho přes noc vyschnout.',
    materials: [
      'vložka dna 111 × 25 × 1,5 mm z lekce 1',
      'houbička a voda',
      'potravinová fólie',
      '2 hladká prkénka',
    ],
    requiredEquipment: [],
    recommendedEquipment: ['clamps'],
    prerequisiteLessons: [L6],
    steps: [
      {
        id: 'wet',
        title: 'Navlhčete pás ohybu',
        body: `${NUMBERS_NOTE} Pás ohybu dna navlhčete houbičkou a počkejte, až se barva usně skoro vrátí k suché (5–10 min). Ohyb se dělá před lepením plíšku, aby plíšek nebyl u vlhké usně.`,
        animationLinks: [animationLink('lidBends', 'anim-dno')],
        media: [],
      },
      {
        id: 'place-spacer',
        title: 'Vložku položte hranou na čáru hrany vložky',
        body: 'Vložku položte na rub zad B hranou na čáru hrany vložky (na listu 1 a 2, ve výchozím střihu v 64,18, tedy 1,96 mm za rýhou směrem k B; rysky na obou bocích; případně posunutou podle měření z V12). Hrana vložky míří k přední stěně F, na straně F vložka neleží. Tak padne střed ohybu na rýhu. Vložka je o 5 mm na každé straně širší než díl, aby měl ohyb oporu po celé šířce.',
        media: [
          ill(
            'lw-l7-spacer',
            'Vložka na rubu zad hranou 1,96 mm za rýhou, F přehnutá přes vložku lícem ven',
            illustration.vlozkaDna,
          ),
        ],
      },
      {
        id: 'fold-clamp',
        title: 'Přehněte a stáhněte',
        body: 'F přehněte nahoru přes vložku lícem ven. Mezi vlhký líc a prkénka dejte potravinovou fólii (jinak zůstanou otisky a skvrny od dřeva). Spodních 20 mm stáhněte mezi dvěma prkénky svěrkami a nechte vyschnout přes noc (12–24 h, ne u topení). Bez svěrek prkénka zatižte knihami nebo je stáhněte silnými gumičkami – tlak ověřte na odřezku.',
        media: [
          photo('lw-l7-clamp', 'Ohyb dna stažený mezi prkénky s fólií, vložka zasunutá v ohybu'),
        ],
      },
      {
        id: 'remove-spacer',
        title: 'Vysuňte vložku',
        body: 'Po vyschnutí vysuňte vložku bokem. Boky ještě nejsou slepené, takže F jde odklopit do asi 90° na lepení plíšku a D1 v příští lekci: F pak leží rubem nahoru na desce a B stojí nad ohybem nahoru. Když ohyb po vyschnutí trochu odpruží, udrží ho lepení G4 a boční švy.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'fold-dry',
        title: 'Ohyb dna je vyschlý, líc v ohybu nepopraskal a vložka je venku.',
        required: true,
      },
    ],
    commonMistakes: [
      'Hrana vložky položená na rýhu: střed ohybu pak leží o 1,96 mm vedle.',
      'Sušení u topení.',
      'Plíšek přilepený před mokrým ohybem.',
    ],
    safety: [],
    media: [photo('lw-l7-hero', 'Vyschlý ohyb dna z boku, rovný po celé šířce')],
  }),

  draft({
    slug: L8,
    title: 'Plíšek, přepážka D1 a šev dna karet',
    order: 8,
    phaseSlug: 'build',
    estimatedMinutes: 120,
    goal: 'Přilepit plíšek a přes něj přepážku D1 na rub přední stěny a ušít šev dna karet S6.',
    materials: ['maskovací páska, párátka', 'jehla na propichování'],
    requiredEquipment: [
      'contact-cement',
      'steel-sheet',
      'stitching-chisels',
      'mallet',
      'punching-board',
      'harness-needles',
      'waxed-thread',
      'digital-caliper',
    ],
    recommendedEquipment: ['masking-tape'],
    prerequisiteLessons: [L7],
    steps: [
      {
        id: 'g1',
        title: 'G1: plíšek na rub přední stěny',
        body: `${NUMBERS_NOTE} F (přední stěnu) položte naplocho rubem nahoru na PE desku, celou na desce, ohyb dna u hrany desky. B (zadní stěna s přišitou D2) stojí nad ohybem nahoru a ohyb dna zůstává asi 90°. Viset dolů přes hranu stolu jako u švu S6 B tady nemůže: s F rubem nahoru by se ohyb musel přehnout obráceně. Vyschlý ohyb chce B sklopit zpátky k F, proto ji zezadu opřete o knihu nebo krabičku a horní hranu k ní přichyťte kolíčkem nebo páskou, ať nespadne na lepidlo. Plíšek přilepte kontaktním lepidlem na rub F do plochy G1: x 43,5–57,5, y 3,5–24 (přilnavost lepidla k oceli ověřte na odřezku). Po tomto kroku už plíšek vyměnit nejde, magnet ano.`,
        animationLinks: [animationLink('lidMagnet', 'anim-plisek')],
        media: [],
      },
      {
        id: 'g2',
        title: 'G2 a G2b: přepážka D1',
        body: 'D1 přilepte rubem na rub F: G2 v y 2–26 (x 4–97) přes plíšek a boky G2b v x 4–5 a 96–97 do y 61. D1 má šířku přesně 93 mm bez montážní vůle, proto na D1 i na rub F vyznačte osu x 50,5 a D1 přikládejte podle osy zdola od y 2 nahoru. Pásy G2b (1 mm) ohraničte maskovací páskou z obou stran a lepidlo nanášejte párátkem, ať nepřeteče do kapsy karet. Pásky strhněte hned po nanesení lepidla, ještě než zavadne a než přiložíte D1, jinak zůstanou zalepené pod D1. Přetok nad y 26 hned setřete.',
        media: [],
      },
      {
        id: 'check-d1',
        title: 'Změřte polohu D1',
        body: 'Po přiložení změřte: kapsa karet mezi pásy G2b musí mít aspoň 90,5 mm a D1 musí být od hrany F aspoň 3,5 mm, jinak zasáhne do bočního švu S4 na x 3. Pak přitlačte paličkou přes desku položenou na D1; F leží na PE desce, takže úder má oporu.',
        media: [],
      },
      {
        id: 's6',
        title: 'Šev dna karet S6',
        body: 'Mezi lepením a S6 nechte aspoň 1 h. Díl otočte: F teď položte naplocho lícem nahoru na tvrdou desku u hrany stolu a B nechte viset přes hranu (ohyb dna na hraně desky). Otvory S6 podle šablony z listu 1 na líci F propíchněte jehlou a děrujte vidličkou: y 25 (výchozí), x 10,5 až 38,5 a 62,5 až 90,5, dvakrát 8 otvorů. Střed kolem plíšku a jazýčku šev vynechává, drží ho jen lepení G2. Vidlička natočená při pohledu na líc F horní hranou od sebe. Šijte sedlovým stehem, konce 2 otvory zpět.',
        animationLinks: [animationLink('threadLength')],
        media: [
          ill(
            'lw-l8-section',
            'Řez: plíšek na rubu přední stěny pod dnem karet, přes něj přepážka D1',
            illustration.rezAVlozeni,
          ),
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'plate-d1-glued',
        title:
          'Plíšek je přilepený v ploše G1 a D1 v G2 a G2b; kapsa karet má aspoň 90,5 mm a D1 je od hrany F aspoň 3,5 mm.',
        required: true,
      },
      {
        slug: 's6-sewn',
        title: 'Šev dna karet S6 je ušitý po obou stranách plíšku, konce 2 otvory zpět.',
        required: true,
      },
    ],
    commonMistakes: [
      'D1 přikládaná od kraje místo podle osy: chyba se nerozdělí na obě strany.',
      'Lepidlo přeteklé z G2b do kapsy karet.',
      'Maskovací páska kolem G2b nechaná na místě při přikládání D1: zůstane zalepená pod D1.',
      'Lepení na svisle odklopenou F: palička přes desku pak nemá oporu, F má ležet rubem nahoru na desce.',
      'Děrování S6 hned po lepení, bez hodinové přestávky.',
    ],
    safety: [],
    media: [photo('lw-l8-hero', 'Přední stěna s přilepenou D1 a ušitým švem dna karet S6')],
  }),

  draft({
    slug: L9,
    title: 'Složení a boční švy',
    order: 9,
    phaseSlug: 'build',
    estimatedMinutes: 150,
    goal: 'Slepit boky peněženky, ušít boční švy S4 a S5 skrz všechny vrstvy a zarovnat a vyleštit boky na šířku 101 mm.',
    materials: ['odřezek usně 1,0 mm jako podložka pod hranu F', 'tužka, maskovací páska'],
    requiredEquipment: [
      'contact-cement',
      'sandpaper',
      'stitching-chisels',
      'mallet',
      'punching-board',
      'harness-needles',
      'waxed-thread',
      'utility-knife',
      'steel-ruler',
    ],
    recommendedEquipment: ['edge-burnisher', 'wing-divider', 'edge-beveler', 'masking-tape'],
    prerequisiteLessons: [L8],
    steps: [
      {
        id: 'dry-fit',
        title: 'Nanečisto',
        body: `${NUMBERS_NOTE} Díl nejdřív nanečisto složte a zkontrolujte, teprve potom naneste lepidlo. Kontaktní lepidlo chytne hned při dotyku.`,
        media: [],
      },
      {
        id: 'g4',
        title: 'G4: boční pásy',
        body: 'Lepte boční pásy x 0–4 a 97–101: rub F na líc D2 (líc D2 zdrsněte) v y 18–62 a rub F na rub B v y 1,75–18. Přikládejte od ohybu dna nahoru a F přitom rovnejte podle boků B. Mezi okraji G4 zůstane kapsa 93 mm.',
        media: [],
      },
      {
        id: 'mark-side',
        title: 'Čára švu a otvory S4, S5',
        body: 'Na slepeném kusu narýsujte čáru švu 3,0 mm od hrany (rýsovacím kružidlem z projektu 02 nastaveným na 3,0 mm nebo rýhovačem, bez nich tužkou u pravítka podle proužku z listu 4). Otvory S4 a S5 přeneste z papírového proužku otvorů (list 4), počítáno od y 76 dolů: 18 otvorů od y 8 do 76.',
        media: [],
      },
      {
        id: 'punch-sew',
        title: 'Děrovat a šít boky',
        body: 'Mezi lepením G4 a děrováním nechte aspoň 1 h. Děrujte zepředu skrz všechny vrstvy: y 8–60 z líce F, y 64–76 z líce D2. Horní hrana F (y 62) leží přesně mezi otvory 60 a 64, proto v úseku y 56–68 děrujte po jednom otvoru a pod hranu F podložte odřezek 1,0 mm (schod F/D2). Šijte od 76 dolů, steh 60–64 zdvojte (zpevňuje ústí karet), konce 2 otvory zpět.',
        animationLinks: [animationLink('threadLength')],
        media: [],
      },
      {
        id: 'edges',
        title: 'Zarovnat a vyleštit boky',
        body: 'Boky zarovnejte nožem na 101,0 mm (D2 přečnívá). Spodní rohy nechte hranaté – nic nevyplňujte ani nezaoblujte. Boky vybruste, zkoste z obou líců (zkosovačem, když ho máte, jinak zaoblete brusným papírem na hranolku) a vyleštěte jako jeden svazek, i u ohybu dna.',
        media: [
          photo('lw-l9-edges', 'Vyleštěný bok peněženky s bočním švem a hranatým spodním rohem'),
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'side-seams',
        title: 'Boční švy S4 a S5 jsou ušité od y 76 dolů, steh 60–64 je zdvojený.',
        required: true,
      },
      {
        slug: 'width-101',
        title: 'Boky jsou zarovnané na 101 mm, zkosené a vyleštěné, spodní rohy hranaté.',
        required: true,
      },
    ],
    commonMistakes: [
      'Lepení G4 bez zkoušky nanečisto: kontaktní lepidlo nejde po dotyku posunout.',
      'Vícezubá vidlička přes hranu F v úseku y 56–68: tady se děruje po jednom otvoru.',
    ],
    safety: ['Nůž veďte tahem od prstů volné ruky.'],
    media: [photo('lw-l9-hero', 'Sešité tělo peněženky zepředu, víčko zatím otevřené')],
  }),

  draft({
    slug: L10,
    title: 'Tvarování závěsu přes obsah a měření k',
    order: 10,
    phaseSlug: 'build',
    estimatedMinutes: 45,
    goal: 'Vytvarovat závěs za mokra zavřený přes obsah stavu B a po vyschnutí změřit polohu víčka k.',
    materials: [
      '2 staré karty',
      'kancelářský papír asi 70 × 65 mm (místo bankovky), nebo bankovka zabalená ve fólii',
      'houbička a voda',
      'potravinová fólie',
      'kniha (lehká zátěž)',
      '4 mince 50 Kč, 6 karet a 3 bankovky na měření stavů',
    ],
    requiredEquipment: ['digital-caliper', 'steel-ruler'],
    recommendedEquipment: [],
    prerequisiteLessons: [L9],
    steps: [
      {
        id: 'contents-b',
        title: 'Vložte obsah stavu B',
        body: `${NUMBERS_NOTE} Do kapsy karet dejte 2 staré karty a místo bankovky papír asi 70 × 65 mm, přeložený nebo v několika vrstvách, až posuvka ukáže asi 0,7 mm (nebo skutečnou bankovku zabalenou ve fólii, aby nezvlhla). Mince ne. Obsah pod závěsem je pak 3,42 mm jako ve výpočtu.`,
        animationLinks: [animationLink('lidBends', 'anim-zaves')],
        media: [],
      },
      {
        id: 'wet-close',
        title: 'Navlhčete jen závěs a zavřete víčko',
        body: 'Houbičkou navlhčete jen pás závěsu (nenamáčejte celé). Víčko zavřete přes obsah a jazýček položte po přední stěně. Kopyto ani opěrka nejsou potřeba, formou je peněženka s obsahem.',
        media: [],
      },
      {
        id: 'overnight',
        title: 'Přes noc pod knihou',
        body: 'Mezi vlhký závěs a knihu dejte potravinovou fólii a nechte peněženku zavřenou přes noc (12–24 h, ne u topení) pod lehkou zátěží. Magnet v tu chvíli ještě není.',
        media: [
          ill(
            'lw-l10-hinge',
            'Peněženka na zádech, víčko zavřené přes 2 karty a papír, fólie a kniha navrchu přes noc',
            illustration.zavesPresObsah,
          ),
        ],
      },
      {
        id: 'measure-k',
        title: 'Změřte k',
        body: 'Změřte polohu hrany pásu víčka jako výšku y od spodní hrany ve stavech A (prázdná), B a C (6 karet, 3 bankovky, 4 × 50 Kč), zvlášť nad sloupci a nad středem. Když měříte od horní hrany F, je y = 62,0 minus naměřená vzdálenost (výchozí střih; jinak výška F z listu). Spočítejte k = (y_C − y_A) / 8,62 (dělitel P(C) − P(A) je v rámečku na listu 4). Model čeká A 53,9 / B 56,6 / C 62,5 mm, při horším k 1,24 A 53,2 a C 63,9.',
        media: [],
      },
      {
        id: 'k-too-high',
        title: 'Když vyjde k nad 1,24',
        body: 'Na zkušebním kuse k zapište a nechte přepočítat střih pro finální kus (dno karet a výška se musí zvednout). Na hotovém kuse už přepočet nic nezmění, dá se jen nosit méně.',
        media: [],
      },
      {
        id: 'lid-behaviour',
        title: 'Otevřené víčko samo nestojí',
        body: 'Po vyschnutí se víčko vrací k zavřené poloze a otevřené samo nestojí. Tak to má být: u karty to nevadí, u bankovek a mincí ho drží palec ruky, která peněženku drží. Víčko nepřeklápějte až na záda – závěs by se ohýbal opačně.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'hinge-formed',
        title:
          'Závěs je vyschlý po noci zavřený přes obsah stavu B a víčko se vrací k zavřené poloze.',
        required: true,
      },
      {
        slug: 'k-recorded',
        title: 'Hrana víčka je změřená ve stavech A, B a C a k je spočítané a zapsané.',
        required: true,
      },
    ],
    commonMistakes: [
      'Namočená celá peněženka místo jen pásu závěsu.',
      'Karta místo papíru v oddílu bankovek.',
      'Považovat samovolně zavírající se víčko za chybu.',
    ],
    safety: [],
    media: [photo('lw-l10-hero', 'Peněženka pod knihou s fólií, víčko zavřené přes obsah')],
  }),

  draft({
    slug: L11,
    title: 'Magnet, podšívka L1 a šev S7',
    order: 11,
    phaseSlug: 'build',
    estimatedMinutes: 150,
    goal: 'Najít plíšek, nalepit magnet na hotové peněžence přesně na značku, přikrýt ho podšívkou L1, oříznout špičku a obšít L1 švem S7.',
    materials: [
      'zkušební (hledací) magnet',
      'maskovací páska, tužka',
      'hladký kolík na převalování',
      'kniha na zatížení víčka',
      'podložka pod šev S7: dva odřezky usně 1,0 mm slepené na sebe (nebo odřezek desky 2 mm)',
      'jehla na propichování',
    ],
    requiredEquipment: [
      'neodymium-magnet',
      'epoxy-glue',
      'contact-cement',
      'sandpaper',
      'utility-knife',
      'round-punches-8-14',
      'stitching-chisels',
      'mallet',
      'punching-board',
      'harness-needles',
      'waxed-thread',
      'digital-caliper',
    ],
    recommendedEquipment: ['edge-burnisher', 'masking-tape'],
    prerequisiteLessons: [L10],
    steps: [
      {
        id: 'find-plate',
        title: 'Najděte plíšek a označte polohu magnetu',
        body: `${NUMBERS_NOTE} Peněženka ve stavu B: 2 staré karty, v bankovkách 1 bankovka nebo papír 0,7 mm z lekce 10 – ne karta – a bez mincí. Zkušebním magnetem najděte po líci F hrany plíšku (mají vyjít y plíšku z rámečku, výchozí 3,5 a 24,0) a páskou označte značku magnetu z rámečku (výchozí y 11,9). Okno lepení je ve výchozím střihu 11,73–12,13; s přepážkami 0,8 jen 11,50–11,63. Značku proto měřte posuvkou od spodní hrany a po nalepení pásky přeměřte. Zavřete víčko a značku přeneste ryskami na boky jazýčku.`,
        animationLinks: [animationLink('lidMagnet', 'anim-magnet')],
        media: [],
      },
      {
        id: 'magnet-dry-test',
        title: 'Nanečisto: který magnet',
        body: 'Než magnet přilepíte napevno, můžete vyzkoušet sílu nanečisto (doporučení, ověřit na prototypu): magnet s kouskem kozinky L1 přes něj přichyťte tenkou páskou na rub jazýčku na značku, víčko zavřete, zatřeste, otočte dnem vzhůru a otevřete jedním prstem za špičku – postupně pro Ø 8 × 1, 8 × 1,5 a 8 × 2. Páska přidá mezeru a výsledek je jen orientační, rozhodne až zkouška Z-1 na hotovém kuse. Když vyberete jinou tloušťku než 1,5 mm, mění se tloušťka peněženky u magnetu: podle návrhu se dosadí do magnetThicknessMm a kontroly se přepočítají (poloha magnetu, plíšek i otvory S7 zůstávají), což formulář v aplikaci neumí. Zapište si tloušťku vybraného magnetu a nechte střih přepočítat tím, kdo ho udržuje (třeba v Claude Code nad repozitářem: pole magnetThicknessMm v modelu src/lib/geometry/lid-wallet.ts, oddíl 12.1 zadání).',
        media: [],
      },
      {
        id: 'epoxy',
        title: 'Magnet epoxidem',
        body: 'Rub konce jazýčku zdrsněte. Magnet přilepte dvousložkovým epoxidem na rub jazýčku středem na značku a na osu a nechte ztuhnout (podle návodu epoxidu, orientačně 30 min – ověřit), aby se při natírání a přikládání L1 neposunul.',
        media: [],
      },
      {
        id: 'lining',
        title: 'Podšívka L1 přes magnet',
        body: 'Teprve po ztuhnutí epoxidu natřete rub jazýčku kolem magnetu a L1 kontaktním lepidlem, nechte zavadnout a L1 přiložte horní hranou na rysku 10 mm nad středem magnetu (šablona na listu 4). Přitlačte prsty nebo převalujte hladkým kolíkem. Přes magnet paličkou netlučte – neodym se může odštípnout.',
        media: [
          ill(
            'lw-l11-tongue',
            'Konec jazýčku z rubu: magnet 7 mm nad špičkou, horní hrana L1 10 mm nad středem magnetu, šev S7 do U',
            illustration.jazycekMagnet,
          ),
        ],
      },
      {
        id: 'cure',
        title: 'Nechte 24 h vytvrdit',
        body: 'Peněženku položte zády na stůl a víčko narovnejte tak, aby leželo na stole vodorovně jako prodloužení zad: ne zavřené a ne přehnuté přes záda. Pás víčka zatižte lehce knihou mimo magnet. Magnet musí být aspoň pár cm od plíšku, jinak ho plíšek přitáhne. Víčko se samo zavírá, bez zátěže ho nenechávejte. Nechte 24 h vytvrdit, teprve pak šijte S7 a zkoušejte držení víčka. Závěs při tom nenavlhčujte; jestli 24 h v rovné poloze nezmění tvar závěsu z lekce 10, ověřit na prototypu (zkouška Z-2).',
        media: [],
      },
      {
        id: 'trim-tip',
        title: 'Ořízněte špičku a boky L1',
        body: 'Špičku uřízněte 7,0 mm pod značkou (rysky) podle šablony nožem skrz jazýček i L1 najednou a zároveň seřízněte boky L1 načisto s boky jazýčku (přířez 24 mm je o 2 mm na každé straně širší než jazýček 20 mm). Střed oblouku R10 leží 10,0 mm nad špičkou, tedy 3,0 mm nad středem magnetu. Pak jen posledních 2,5 mm špičky zbruste do klínu brusným papírem na hranolku z líce i z rubu, ne nožem, a ne blíž než 2,5 mm od špičky (ryska). Stačí, když je hrana na konci asi 0,5–0,7 mm a zaoblená.',
        media: [],
      },
      {
        id: 's7',
        title: 'Šev S7 kolem magnetu',
        body: 'Šablonu konce jazýčku z listu 4 přiložte na líc jazýčku podle obrysu špičky a propíchněte jehlou 8 otvorů S7: U kolem magnetu, ke špičce otevřené. Jazýček leží rubem dolů a magnet s L1 z rubu vystupuje, proto si připravte podložku s otvorem: dva slepené odřezky usně 1,0 mm (nebo odřezek desky 2 mm) proseknuté uprostřed výsečníkem Ø 10. Magnet leží v otvoru, kůže kolem naplocho. Děrujte z líce jazýčku vidličkou 4 mm: svislé boky (x 44,5 a 56,5) dvouzubou částí svisle, horní řadu (14 mm nad špičkou) vodorovně, rohové otvory jen jedním krajním zubem nasazeným do otvoru řady. Natočení zubů na bocích zvolte tak, aby šikmé otvory měly stejný sklon jako v horní řadě – vyzkoušejte na odřezku. Náhrada: otvory předpíchnout jehlou přes šablonu a vidličkou je jen dorazit. Šijte sedlovým stehem, konce 2 otvory zpět. Pak hrany jazýčku zkoste, vybruste a vyleštěte.',
        animationLinks: [animationLink('threadLength')],
        media: [photo('lw-l11-s7', 'Šev S7 do U kolem magnetu na líci jazýčku')],
      },
    ],
    checkpoints: [
      {
        slug: 'magnet-on-mark',
        title:
          'Magnet je nalepený na značce v okně lepení z rámečku a epoxid s L1 nechal 24 h vytvrdit.',
        required: true,
      },
      {
        slug: 's7-sewn',
        title:
          'Špička je oříznutá 7,0 mm pod značkou skrz jazýček i L1, klín jen v posledních 2,5 mm a šev S7 je ušitý.',
        required: true,
      },
    ],
    commonMistakes: [
      'Značka magnetu odhadnutá okem: okno lepení má ve výchozím střihu jen 0,4 mm.',
      'L1 přiložená dřív, než epoxid ztuhne: magnet se posune z osy.',
      'Klín špičky nožem nebo delší než 2,5 mm.',
    ],
    safety: [
      'Přes magnet paličkou netlučte: neodym se může odštípnout.',
      'Vidlička i jehly jsou ocelové a magnet je přitahuje: děrujte opatrně, s jazýčkem pevně na podložce, nejdřív na odřezku.',
    ],
    media: [photo('lw-l11-hero', 'Jazýček s podšívkou L1 a švem S7, magnet pod podšívkou')],
  }),

  draft({
    slug: L12,
    title: 'Dokončení a zkoušky Z-1 až Z-4',
    order: 12,
    phaseSlug: 'build',
    estimatedMinutes: 60,
    goal: 'Dokončit peněženku, přiložit upozornění pro uživatele a na zkušebním kuse projít povinné zkoušky Z-1 až Z-4, podle kterých se řídí finální kus.',
    materials: [
      'balzám na kůži (snášenlivost ověřit na odřezku)',
      'karty, bankovky a mince na stavy A, B a C, 1 Kč na zkoušku retence',
      'papír na upozornění',
    ],
    requiredEquipment: [],
    recommendedEquipment: ['neodymium-magnet', 'leather-balm', 'epoxy-glue', 'contact-cement'],
    prerequisiteLessons: [L11],
    steps: [
      {
        id: 'balm',
        title: 'Konečná úprava',
        body: 'Balzám hlavně na závěs, snášenlivost ověřte na odřezku. Volitelně slepá značka na F vlevo dole mimo jazýček a švy.',
        media: [],
      },
      {
        id: 'user-note',
        title: 'Upozornění pro uživatele',
        body: 'Přiložte k peněžence krátce: „Karty zasouvej do první štěrbiny u přední stěny (na straně jazýčku), kartu s magnetickým proužkem proužkem k horní hraně (k víčku). Do štěrbiny za barevnou hranou patří jen bankovky: karta by tam ležela u magnetu a mohla by přijít o proužek. Při vyndávání bankovky a mince drž víčko palcem, netlač ho až na záda. Při zavírání přitlač jazýček dole u magnetu, ne uprostřed. Otevřenou peněženku neotáčej dnem vzhůru.“ Pravidlo riziko karty u magnetu jen zmenšuje, nezaručuje.',
        media: [
          ill(
            'lw-l12-slots',
            'Co kam patří: karty proužkem k víčku do první štěrbiny, bankovky za barevnou hranu D1, mince za D2',
            illustration.rezAVlozeni,
          ),
        ],
      },
      {
        id: 'z1',
        title: 'Z-1 Magnet',
        body: 'Ve stavech A, B a C víčko zavřete, zatřeste a otočte dnem vzhůru, pak ho otevřete jedním prstem za špičku jazýčku. Projde, když víčko zůstane zavřené (i proti pružení závěsu) a otevře se jedním prstem. Drží slabě nebo moc silně: vyměňte magnet za silnější nebo slabší stejného Ø 8 (další krok) a zkuste znovu. Nepomůže ani to: plíšek 0,8 do finálního kusu (ověřit).',
        media: [],
      },
      {
        id: 'magnet-swap',
        title: 'Výměna magnetu (jen když Z-1 neprojde)',
        body: 'Neověřený postup – ověřit na prototypu, napřed na zkušebním kuse. Plíšek vyměnit nejde, magnet ano: sedí jen pod L1 a švem S7. (1) Vypárejte S7: stehy na líci jazýčku přestřihněte malými nůžkami nebo páráčkem (kůži nenařízněte) a nit vytáhněte; otvory S7 zůstanou a použijí se znovu. (2) Odlepte L1 pomalu od horní hrany ke špičce a počítejte s novou L1 – ve špičce je s jazýčkem zbroušená do společného klínu a nejspíš se roztrhne. Novou vyřízněte z nebarvené kozinky (přířez 24 × 22). (3) Sundejte magnet: netlučte do něj a nepáčte ho ostrou hranou, neodym je křehký. Zbytky lepidla opatrně obruste brusným papírem a rub znovu zdrsněte. (4) Nový magnet stejného Ø 8 – silnější (vyšší třída nebo tlustší), nebo slabší (nižší třída nebo tenčí); třídu, tloušťku a sílu ověřte u prodejce. Stejný průměr nechá beze změny polohu magnetu, plíšek i otvory S7. Jiná tloušťka magnetu ale mění tloušťku peněženky u magnetu a odhad pole: podle návrhu se dosadí do magnetThicknessMm a kontroly se přepočítají. Formulář v aplikaci to neumí: tloušťku nového magnetu si zapište a přepočet nechte na tom, kdo střih udržuje (třeba v Claude Code nad repozitářem: pole magnetThicknessMm v modelu src/lib/geometry/lid-wallet.ts, oddíl 12.1 zadání). (5) Magnet epoxidem na stejné místo (osa x 50,5, 7,0 mm nad špičkou, místo ohraničují otvory S7), nechte ztuhnout, pak L1 kontaktním lepidlem (přes magnet netlučte). Novou L1 přilepte s přesahem a ořízněte podle hran hotového jazýčku (jazýček se znovu neřeže). Znovu zbruste klín posledních 2,5 mm špičky jako v lekci 11. Po 24 h vytvrzení propíchněte z líce jehlou starými otvory S7 i skrz L1 a ušijte S7 znovu; u tlustšího magnetu zesilte podložku s otvorem o rozdíl tloušťky. Nakonec hrany jazýčku znovu zkoste, vybruste a vyleštěte. Jestli staré otvory druhé šití vydrží, ověřit na prototypu.',
        media: [],
      },
      {
        id: 'z2',
        title: 'Z-2 Závěs',
        body: 'Otevřené víčko musí jít palcem držící ruky udržet tak, že bankovka jde okénkem vysunout a minci vzít; samo stát nemusí. Po několika dnech běžného používání prohlédněte líc i rub pásu závěsu. Praskliny: finální kus v záloze A (P1 0,8), až když ani ta nestačí, záloha B2 (ztenčení závěsu na 0,6 mm: v aplikaci zaškrtávátko B2, v repozitáři „--skive-hinge 0.6“, postup v lekci 5).',
        media: [],
      },
      {
        id: 'z3',
        title: 'Z-3 Výřez pro palec',
        body: 'Zopakujte gesta z papírového modelu v kůži: vysunout přední kartu, zadní po vyndání předních, zavírání ve stavu A, s 1 kartou a s jazýčkem posunutým o 3 mm. Po dnech používání se podívejte, jestli se horní hrana F u výřezu neodklápí a jestli na víčku nevzniká důlek. Když ano: upravit (zaoblit, zkosit rub dna výřezu, zúžit), nebo výřez ve finálním kusu vynechat.',
        media: [],
      },
      {
        id: 'z4',
        title: 'Z-4 Retence',
        body: 'Stav B zavřete a 30× prudce zatřeste dnem vzhůru; 1 Kč za D2 ve stavu A i B; 0 karet a 1 × 5000 Kč. Projde, když se nic nepřesune do jiného oddílu ani nevypadne.',
        media: [],
      },
      {
        id: 'final-piece',
        title: 'Finální kus',
        body: 'Finální kus postavte stejným postupem s tím, co na zkušebním kuse fungovalo (vyměněný magnet, jiná varianta, úprava výřezu). Když se varianta změnila až po zkušebním kuse, je finální kus v nové variantě neověřený – nejlépe dalším zkušebním kusem. Na finálním kuse stačí zkontrolovat, že víčko drží, otevře se jedním prstem a otevřené jde palcem udržet.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'z1-magnet',
        title:
          'Z-1: ve stavech A, B a C víčko vydrží zatřesení i otočení dnem vzhůru a otevře se jedním prstem.',
        required: true,
      },
      {
        slug: 'z2-hinge',
        title: 'Z-2: otevřené víčko jde palcem udržet a závěs je po dnech používání bez prasklin.',
        required: true,
      },
      {
        slug: 'z3-notch',
        title: 'Z-3: špička se o výřez nezachytí ani nezajede pod F a hrana F se neodklápí.',
        required: true,
      },
      {
        slug: 'z4-retention',
        title: 'Z-4: po zatřesení se nic nepřesune do jiného oddílu ani nevypadne.',
        required: true,
      },
      {
        slug: 'final-check',
        title: 'Finální kus: víčko drží, otevře se jedním prstem a otevřené jde palcem udržet.',
        required: false,
      },
    ],
    commonMistakes: [
      'Řezat finální kus dřív, než zkušební kus projde zkouškami Z-1 až Z-4.',
      'Přeplnit peněženku (plný stav a k tomu karta v bankovkách): tento stav návrh nepokrývá.',
    ],
    safety: [],
    media: [
      photo(
        'lw-l12-hero',
        'Hotová peněženka Víčko zavřená, jazýček s magnetem dole na přední stěně',
      ),
    ],
  }),
];

export const lidWalletProject: ProjectDefinition = {
  slug: PROJECT_SLUG,
  code: '03',
  title: 'Peněženka Víčko',
  summary:
    'Peněženka do zadní kapsy 101 × 83,5 mm: karty, bankovky napůl a dva sloupce mincí pod víčkem s magnetem.',
  description:
    'Třetí projekt cesty učení: jeden pás třísločiněné usně 1,0 mm, dole přeložený za mokra, vzadu vede nahoru, přes horní hranu přechází v plochý závěs a vpředu končí víčkem s jazýčkem. Uvnitř jsou dvě tenké přepážky – vpředu karty, pak bankovky složené napůl, vzadu dva sloupce mincí s okénky. Víčko drží magnet na konci jazýčku, který dosedá na plíšek zalepený v přední stěně. Celý návrh je k ověření: nejdřív papírový model, zkouška ohybu a zkušební kus, teprve pak finální kus. Časy lekcí jsou hrubý odhad.',
  difficulty: 'advanced',
  estimatedHours: { min: 14, max: 24 },
  skills: [
    'Listy střihu pro změřenou tloušťku kůže',
    'Papírový model a zkouška ohybu na odřezku',
    'Mokrý ohyb dna přes vložku',
    'Tvarování závěsu přes obsah',
    'Lepení magnetu a plíšku',
    'Šití sedlovým stehem skrz tři vrstvy',
  ],
  phases: [...phases],
  equipment: [
    {
      equipmentSlug: 'veg-tan-leather-1mm',
      priority: 'required',
      reason: 'Pás P1 zkušebního i finálního kusu a odřezky na zkoušku ohybu V12 a podložku S7.',
      specification:
        'Třísločiněná useň 0,9–1 mm, 10 dm² jako obdélník 20 × 50 cm (2 × přířez P1 110 × 240 mm). Po dodání změřit.',
    },
    {
      equipmentSlug: 'thin-goatskin',
      priority: 'required',
      reason: 'Přepážky D1 a D2 a podšívka jazýčku L1, v kontrastních barvách.',
      specification:
        'Nebarvená kozinka 5 dm² (2 × D1 93 × 79,5, 3 × L1 24 × 22) a čokoládová 5 dm² (2 × D2 103 × 64); nejvýš 0,92 mm, po dodání změřit.',
    },
    {
      equipmentSlug: 'veg-tan-leather-0-8',
      priority: 'later',
      reason: 'Jen záloha A, když ve zkoušce ohybu V12 popraská líc usně 1,0.',
      specification:
        'Pevná třísločiněná useň 0,8 mm, kus aspoň 11 × 24 cm; kupuje se až podle V12.',
    },
    {
      equipmentSlug: 'digital-caliper',
      priority: 'required',
      reason:
        'Tloušťka kůže pro listy, rozměry bankovek u papírového modelu, poloha rýhy u V12, značka magnetu.',
      specification: 'Levná digitální posuvka 150 mm.',
    },
    {
      equipmentSlug: 'utility-knife',
      priority: 'required',
      reason: 'Řez P1, D1, D2 a L1, rovné řezy okének a výřezu k tečnám výseků, ořez špičky.',
      specification: 'Odlamovací nůž 18 mm s novými čepelemi.',
    },
    {
      equipmentSlug: 'steel-ruler',
      priority: 'required',
      reason: 'Vedení nože, rýha ohybu tupým hrotem, rýsování.',
      specification: 'Ocelové 30 cm.',
    },
    {
      equipmentSlug: 'cutting-mat',
      priority: 'required',
      reason: 'Podklad pro řezání.',
      specification: 'Samohojivá A3.',
    },
    {
      equipmentSlug: 'round-punches-8-14',
      priority: 'required',
      reason:
        'Vyduté konce: napojení jazýčku (Ø 8), výřez pro palec a podložka S7 (Ø 10), okénka mincí (Ø 12), okénko bankovek (Ø 14).',
      specification: 'Duté výsečníky Ø 8, 10, 12 a 14 mm, po jednom.',
    },
    {
      equipmentSlug: 'stitching-chisels',
      priority: 'required',
      reason: 'Otvory všech švů S1–S7.',
      specification: 'Rozteč přesně 4 mm.',
    },
    {
      equipmentSlug: 'mallet',
      priority: 'required',
      reason: 'Úder do vidliček a výsečníků, přitlačení D1 přes desku.',
      specification: 'Gumová nebo plastová.',
    },
    {
      equipmentSlug: 'punching-board',
      priority: 'required',
      reason: 'Tvrdá deska pod děrování a vysekávání.',
      specification: 'HDPE deska nebo plastové prkénko.',
    },
    {
      equipmentSlug: 'harness-needles',
      priority: 'required',
      reason: 'Sedlový steh.',
      specification: 'Tupé sedlářské jehly, 2 ks.',
    },
    {
      equipmentSlug: 'waxed-thread',
      priority: 'required',
      reason: 'Švy S1–S6 a šev S7 kolem magnetu.',
      specification:
        'Tenká voskovaná nit, která projde otvory vidliček 4 mm (ověřit na odřezku); délka orientačně 4 × délka švu + 25–30 cm rezervy (2 × 15 cm na konce).',
    },
    {
      equipmentSlug: 'contact-cement',
      priority: 'required',
      reason: 'Lepení G1–G4 a podšívky L1.',
      specification:
        'Kontaktní lepidlo na kůži; na obě strany, zavadnout 10–15 min, děrovat nejdřív za 1 h.',
    },
    {
      equipmentSlug: 'sandpaper',
      priority: 'required',
      reason:
        'Rohy a otřep plíšku (120), zdrsnění lepených míst, zaoblení hran, klín špičky jazýčku a spodní hrany D2; v záloze B ztenčení (80).',
      specification:
        'Zrnitost 120 a jemnější (180/240 z projektu 02), 80 jen na zálohu B; na rovném hranolku.',
    },
    {
      equipmentSlug: 'neodymium-magnet',
      priority: 'required',
      reason: 'Zámek víčka na konci jazýčku.',
      specification:
        'Ø 8 × 1,5 mm axiální, 3 ks (zkušební, finální a hledací) + 1 silnější a 1 slabší Ø 8 na výměnu; třídu a sílu ověřit u prodejce.',
    },
    {
      equipmentSlug: 'steel-sheet',
      priority: 'required',
      reason: 'Plíšek K2 14 × 20,5 mm, na který dosedá magnet.',
      specification: 'Pozinkovaný ocelový plech 0,5 mm, v obchodě vyzkoušet magnetem.',
    },
    {
      equipmentSlug: 'epoxy-glue',
      priority: 'required',
      reason: 'Magnet na zdrsněný rub jazýčku; kontaktní lepidlo drží na niklu špatně.',
      specification: 'Rychlý dvousložkový epoxid; 24 h před zatížením.',
    },
    {
      equipmentSlug: 'hacksaw',
      priority: 'recommended',
      reason: 'Vyříznutí plíšku z plechu.',
      specification: 'Pilový list na kov v rámu nebo v ruce.',
      alternatives: ['plech naříznout nožem u pravítka a zlomit ohýbáním (ověřit na odřezku)'],
    },
    {
      equipmentSlug: 'clamps',
      priority: 'recommended',
      reason: 'Stažení prkének u mokrého ohybu dna a zkoušky V12.',
      specification: 'Dvě svěrky na prkénka.',
      alternatives: ['prkénka zatížit knihami nebo stáhnout gumičkami (tlak ověřit na odřezku)'],
    },
    {
      equipmentSlug: 'edge-burnisher',
      priority: 'recommended',
      reason: 'Leštění hran: horní hrany F, D1 a D2, výřez, pás víčka, jazýček a boky.',
      specification: 'Tokonole a leštítko (nebo dřevěný kolík ve vrtačce na nízké otáčky).',
    },
    {
      equipmentSlug: 'edge-paint',
      priority: 'required',
      reason:
        'Kontrastní horní hrana D1: je vidět, kde končí karty a začínají bankovky (riziko karty u magnetu).',
      specification: 'Barva na hrany v tónu D2, 2 tenké vrstvy párátkem; přilnavost ověřit.',
    },
    {
      equipmentSlug: 'leather-balm',
      priority: 'recommended',
      reason: 'Konečná úprava hotové peněženky, hlavně pás závěsu.',
      specification:
        'Balzám na třísločiněnou useň, nejmenší balení; snášenlivost ověřit na odřezku.',
    },
    {
      equipmentSlug: 'scratch-awl',
      priority: 'recommended',
      reason:
        'Z projektu 02: propíchnutí bodů šablony na rub a otvorů S7, když poslouží místo jehly.',
      specification: 'Rýsovací šídlo; jestli vpich není moc velký, ověřit na odřezku.',
      alternatives: ['jehla na propichování'],
    },
    {
      equipmentSlug: 'masking-tape',
      priority: 'recommended',
      reason:
        'Listy 1 a 3 při řezání P1, D1, D2 a L1 skrz papír (lekce 4), ohraničení úzkých pásů lepení G2b a G3 a lepených míst před Tokonole (lekce 5, 6 a 8), značka magnetu (lekce 11). Stejná role jako u projektů 01 a 02.',
      specification:
        'Papírová maskovací páska kolem 25 mm s nízkou lepivostí (na citlivé povrchy); na líci i rubu nejdřív zkouška na odřezku.',
    },
    {
      equipmentSlug: 'wing-divider',
      priority: 'recommended',
      reason: 'Z projektu 02: čára bočních švů 3,0 mm od hrany.',
      specification: 'Kružítko s aretací, nastavit na 3,0 mm.',
      alternatives: ['tužka u pravítka podle proužku z listu 4'],
    },
    {
      equipmentSlug: 'edge-beveler',
      priority: 'recommended',
      reason: 'Zkosení viditelných hran, když ho máte z projektu 01 nebo 02.',
      specification: 'Malá velikost na tenkou useň.',
      alternatives: ['hrany zaoblit brusným papírem na hranolku'],
    },
  ],
  lessons: [...lessons],
  patternSheets: {
    sheets: [
      {
        id: 'sablona',
        title: 'List 1 – pás P1 z líce',
        note: 'Pás P1 101 × 231,66 mm z líce: obrys s výřezem pro palec, okénka mincí, švy S1–S3 a S6, ohyb dna a přehyby závěsu, hrana vložky dna, okénko bankovek (řeže se až po lepení G3) a seznam výsečníků Ø 8, 10, 12 a 14 mm.',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
      },
      {
        id: 'rub',
        title: 'List 2 – pás P1 z rubu',
        note: 'Rub P1: lepené plochy G1–G4, poloha D1, D2 a plíšku, pořadí lepení a značky L. Nalepit na tvrdý papír a propíchnout body na rub kůže.',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
      },
      {
        id: 'dily',
        title: 'List 3 – přepážky, podšívka a plíšek',
        note: 'Přepážka D1 93 × 79,5 mm s barevnou horní hranou, přepážka D2 103 × 64 mm, přířez podšívky L1 24 × 22 mm a plíšek K2 14 × 20,5 mm.',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
      },
      {
        id: 'pripravky',
        title: 'List 4 – šablony, vložka dna a Čísla pro postup',
        note: 'Šablona konce jazýčku s magnetem a otvory S7, šablony okének a plíšku, proužek otvorů S4/S5, vložka dna 111 × 25 mm ze starých karet, tvarování závěsu přes obsah a rámeček „Čísla pro postup“, ze kterého se berou čísla pro všechny kroky.',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
      },
    ],
    calibrationMm: 50,
    printNote:
      'Tisk na A4 na výšku bez přizpůsobení velikosti (100 %). Kontrolní úsečka musí měřit 50 mm. Úsečka neodhalí chybu měřítka 0,5 %, proto změřte i kótu P1 na listu 1 (výchozí 231,66 mm) a porovnejte ji s rámečkem „Čísla pro postup“ na listu 4 (tolerance ±0,5 mm). Jak přenést listy na kůži: vystřihnout nahrubo s okrajem 1–2 cm, přilepit páskou (list 1 na líc), propíchnout značky a řezat skrz papír po čáře (lekce 4). Rozřezaný list je na jedno použití, proto list 1 a 3 tiskněte dvakrát.',
    defaultVariantLabel: 'Výchozí střih – P1 1,0 mm, přepážky D1/D2 a podšívka L1 0,6 mm',
    browserGenerator: 'lid-wallet-thickness',
    variantsNote:
      'Předem připravené jsou jen listy výchozího střihu. Koupené kozinky mají skoro vždy jinou tloušťku než 0,6 mm a pak se mění skoro všechna čísla postupu, proto potřebujete listy pro změřenou kůži: vygenerujte je níže v části „Listy pro vaši kůži“. Aplikace je spočítá stejně jako generátor v repozitáři („pnpm pattern:wallet-lid --divider <větší z D1 a D2> --lining <L1>“, a když se P1 liší od 1,0 o 0,05 mm a víc, navíc „--p1 <změřená P1>“). Zálohy podle zkoušky ohybu V12 a zkušebního kusu: záloha A = P1 ze změřené usně 0,8 („--p1 0.8“), B1 = ztenčený ohyb dna („--skive-fold 0.6“), B2 = ztenčený závěs („--skive-hinge 0.6“). Přepážky nad 0,92 mm střih odmítne. Hodnoty z papírového modelu P0 a tloušťku magnetu formulář nemění – když P0 dopadne jinak, než model čeká, nebo vyberete jiný magnet, zapište si naměřené hodnoty a střih nechte přepočítat tím, kdo ho udržuje (třeba v Claude Code nad repozitářem, model src/lib/geometry/lid-wallet.ts; lekce 2).',
  },
  shoppingPlan: {
    title:
      'Sestava: kůže z jedné objednávky (kaštan 0,9–1 mm, kozinky 0,8–1 a 0,7–0,9 mm), listy vygenerované v aplikaci pro změřenou tloušťku, zkušební i finální kus, magnet Ø 8 × 1,5, plíšek 0,5 mm',
    lines: [
      {
        equipmentSlug: 'veg-tan-leather-1mm',
        url: 'https://www.sijemezkuze.cz/trislocinena-kuze-kastan-0-9-1-mm-p4698',
        quantity: 10,
        purpose:
          '10 dm² v jednom kuse 20 × 50 cm: P1 zkušebního i finálního kusu, odřezky na V12 a podložku S7',
      },
      {
        equipmentSlug: 'thin-goatskin',
        url: 'https://www.sijemezkuze.cz/kozinka-trislocinena-nebarvena-valchovana-0-8-1-mm-p4906',
        quantity: 5,
        purpose: '5 dm²: 2 × D1 a 3 × L1, odřezek na zkoušku barvy',
      },
      {
        equipmentSlug: 'thin-goatskin',
        url: 'https://www.sijemezkuze.cz/kozinka-trislocinena-cokoladova-0-7-0-9-mm-p4851',
        quantity: 5,
        purpose: '5 dm²: 2 × D2',
      },
      {
        equipmentSlug: 'round-punches-8-14',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 8 mm',
        quantity: 1,
        purpose: 'napojení jazýčku (R4)',
      },
      {
        equipmentSlug: 'round-punches-8-14',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 10 mm',
        quantity: 1,
        purpose: 'výřez pro palec a podložka S7',
      },
      {
        equipmentSlug: 'round-punches-8-14',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 12 mm',
        quantity: 1,
        purpose: 'okénka mincí',
      },
      {
        equipmentSlug: 'round-punches-8-14',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 14 mm',
        quantity: 1,
        purpose: 'okénko bankovek',
      },
      {
        equipmentSlug: 'sandpaper',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        variant: 'zrnitost 120',
        quantity: 1,
        purpose: 'rohy a otřep plíšku; dokoupit, i když archy 180 a 240 z projektu 02 máte',
      },
      {
        equipmentSlug: 'sandpaper',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        variant: 'zrnitost 80',
        quantity: 1,
        purpose: 'jen záloha B1 nebo B2 (ztenčení brusným papírem); levné, přihoďte',
      },
      {
        equipmentSlug: 'edge-paint',
        url: 'https://craft-point.cz/products/fiebings-edge-kote-118-ml-tmave-hneda',
        quantity: 1,
        purpose: 'horní hrana D1 v tónu D2',
      },
      {
        equipmentSlug: 'leather-balm',
        url: 'https://craft-point.cz/products/fiebings-leather-balm-with-atom-wax-balzam-s-voskem-118-ml',
        quantity: 1,
        purpose: 'konečná úprava, hlavně závěs; nejdřív na odřezku',
      },
      {
        equipmentSlug: 'stitching-chisels',
        url: 'https://craft-point.cz/products/derovace-na-svy-4mm-sada-4-kusu',
        quantity: 1,
        purpose: 'z projektu 02 – rozteč 4 mm',
      },
      {
        equipmentSlug: 'mallet',
        url: 'https://craft-point.cz/products/horizontalni-palicka-na-kuzi',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'harness-needles',
        url: 'https://craft-point.cz/products/sedlarske-jehly-john-james-velikost-004',
        quantity: 2,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'waxed-thread',
        url: 'https://craft-point.cz/products/nite-slam-bezova-beige-20m',
        variant: '0,6 mm',
        quantity: 1,
        purpose: 'z projektu 02; i na šev S7',
      },
      {
        equipmentSlug: 'contact-cement',
        url: 'https://craft-point.cz/products/fiebings-leather-craft-cement-lepidlo-na-kuzi-118-ml',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'contact-cement',
        url: 'https://craft-point.cz/products/spachtle-na-nanaseni-lepidla',
        quantity: 1,
        purpose: 'z projektu 02, k lepidlu',
      },
      {
        equipmentSlug: 'edge-burnisher',
        url: 'https://craft-point.cz/products/tokonole-120-ml-2',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'edge-burnisher',
        url: 'https://craft-point.cz/products/drevene-hladitko-na-hrany',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'utility-knife',
        url: 'https://craft-point.cz/products/nuz-na-kuzi-s-odlamovaci-cepeli-18mm',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'steel-ruler',
        url: 'https://craft-point.cz/products/rezaci-pravitko-s-protiskluzovou-vlozkou-20cm-30cm',
        variant: '30 cm',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'cutting-mat',
        url: 'https://craft-point.cz/products/oboustranna-samoobnovovaci-rezaci-podlozka-a3-craftpoint',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'scratch-awl',
        url: 'https://craft-point.cz/products/sedlarske-sidlo-hruska',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'wing-divider',
        url: 'https://craft-point.cz/products/wing-divider-sedlarske-kruzitko-150-mm',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'neodymium-magnet',
        url: 'https://magnety.elidis.cz/neodymovy-magnet-valec-n35-d8x1-5mm',
        quantity: 3,
        purpose:
          'Ø 8 × 1,5: zkušební kus, finální kus a hledací magnet; axiální magnetizaci ověřit u prodejce. Ø 8 × 1,5 má z prověřených obchodů jen ELIDIS (ověřeno 29. 9. 2026)',
      },
      {
        equipmentSlug: 'neodymium-magnet',
        url: 'https://orodian.cz/magnet/valec-8x2-n38/',
        quantity: 1,
        purpose:
          'silnější Ø 8 × 2 na výměnu; druhý obchod, protože ELIDIS nemá Ø 8 × 1 a Orodian nemá Ø 8 × 1,5 (ověřeno 29. 9. 2026), takže poštovné platíte dvakrát',
      },
      {
        equipmentSlug: 'neodymium-magnet',
        url: 'https://orodian.cz/magnet/neodymovy-magnet-valec-8x1-mm-n38/',
        quantity: 1,
        purpose: 'slabší Ø 8 × 1 na výměnu; ELIDIS tento rozměr nemá',
      },
      {
        equipmentSlug: 'steel-sheet',
        url: 'https://www.obi.cz/plechy/arcansas-pozinkovany-ocelovy-plech-hladky-500-x-250-x-0-5-mm/p/6110340',
        quantity: 1,
        purpose: '2 plíšky 14 × 20,5 mm s velkou rezervou; v obchodě vyzkoušet magnetem',
      },
      {
        equipmentSlug: 'epoxy-glue',
        url: 'https://www.obi.cz/lepidla/den-braven-tekuty-kov-24-ml/p/6734214',
        quantity: 1,
        purpose: 'magnet na rub jazýčku',
      },
      {
        equipmentSlug: 'hacksaw',
        url: 'https://www.obi.cz/pilky-a-pilniky/lux-mini-pila-na-kov-250-mm-classic/p/3316536',
        quantity: 1,
        purpose: 'plíšek z plechu; jestli je list v balení, ověřit',
      },
      {
        equipmentSlug: 'clamps',
        url: 'https://www.obi.cz/upinaci-nastroje/ellix-sada-truhlarskych-sverek-2dilna/p/5400296',
        quantity: 1,
        purpose: 'z projektu 02; prkénka u ohybu dna',
      },
      {
        equipmentSlug: 'digital-caliper',
        url: 'https://unihobby.cz/meritko-digitalni-posuvne-150-mm',
        quantity: 1,
      },
      {
        equipmentSlug: 'punching-board',
        url: 'https://www.ikea.com/cz/cs/p/legitim-kuchynske-prkenko-bila-90202268/',
        quantity: 2,
        purpose: 'z projektu 02; online jen po 2 ks, v obchodním domě stačí 1',
      },
      {
        equipmentSlug: 'masking-tape',
        url: 'https://www.obi.cz/lepici-pasky/tesa-maskovaci-paska-professional-sensitive-pro-citlive-povrchy-25-m-x-25-mm/p/4754180',
        quantity: 1,
        purpose:
          'šablona P1, pásy lepení G2b a G3, značka magnetu; jedna role na všechny projekty – máte-li ji z projektu 01 nebo 02, nekupujte',
      },
    ],
    skipped: [
      {
        equipmentSlug: 'edge-beveler',
        reason:
          'Jen když ho máte z projektu 01 nebo 02; jinak hrany zaoblíte brusným papírem na hranolku.',
      },
    ],
    alsoNeeded: [
      'lepicí páska (vložka dna, papírový model)',
      'bezbarvý lak na nehty na hrany plíšku (lekce 4)',
      'tvrdší papír nebo čtvrtka na papírový model a šablony (lekce 2 a 4)',
      'dřevěný kolík Ø 8–12 mm a akuvrtačka na leštění vydutých hran (lekce 5)',
      'potravinová fólie, houbička a 2 hladká prkénka (lekce 3, 7 a 10)',
      '6 starých karet (4 na vložku dna, 2 na tvarování závěsu), párátka, jehla na propichování',
      'lupa nebo mobil s makrem na prohlídku líce (lekce 3, volitelně)',
    ],
  },
  media: [
    photo('lid-wallet-hero', 'Hotová peněženka Víčko zavřená, jazýček s magnetem na přední stěně'),
  ],
  contentVersion: 1,
  reviewStatus: 'draft',
};

import { animationLink } from '@/content/animations';
import { illustration } from '@/content/projects/lid-wallet/illustrations';
import { lidWalletGlossary } from '@/content/projects/lid-wallet/parts';
import {
  LID_RECORD_IDS,
  LID_V12_RESULTS,
  LID_Z2_RESULTS,
} from '@/content/projects/lid-wallet/record-ids';
import {
  type LessonDefinition,
  type LessonPrint,
  type MediaSlot,
  type PhaseDefinition,
  type ProjectDefinition,
  type ProjectOverview,
  type AppLink,
  type RecordField,
  type StepRecall,
  type StepWait,
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

/*
 * Časovače, zápisník a „Připravte si“. Doby čekání jsou jen z textu lekcí a z tabulky 9.1
 * zadání (docs/zadani/penezenka-vicko.md): kde je lekce neuvádí a zadání je bere „podle návodu
 * lepidla“, je `basis: 'manufacturer'`.
 */

/** Zavadnutí kontaktního lepidla 10–15 min (lekce 6; tabulka 9.1 zadání „podle návodu“). */
const tack = (id: string, label: string, basis: StepWait['basis']): StepWait => ({
  id,
  label,
  minutes: 10,
  maxMinutes: 15,
  basis,
});

/** Mezi lepením a děrováním aspoň 1 h (lekce 6, 8 a 9). */
const beforePunching = (id: string, label: string, blocksStepId: string): StepWait => ({
  id,
  label,
  minutes: 60,
  basis: 'text',
  blocksStepId,
});

/** Navlhčení: počkat, až se barva usně skoro vrátí k suché (5–10 min). */
const dampen = (label: string): StepWait => ({
  id: 'dampen',
  label,
  minutes: 5,
  maxMinutes: 10,
  basis: 'text',
});

/** Sušení přes noc (12–24 h, ne u topení). */
const overnight = (label: string, blocksStepId: string): StepWait => ({
  id: 'overnight',
  label,
  minutes: 12 * 60,
  maxMinutes: 24 * 60,
  basis: 'text',
  blocksStepId,
});

/*
 * Tloušťky P1/D1/D2/L1, výsledky P0, k, magnet a zálohy se zadávají jen ve formuláři „Listy pro
 * vaši kůži“ (jediný zdroj). Kroky, které s nimi pracují, je ukazují (`lidSheetRecalls`) i s mezí
 * spočítanou z nich (hranice přepážek podle P1, okno lepení magnetu) a mají pod sebou odkaz na
 * formulář. V zápisníku lekcí zůstávají jen výsledky zkoušek.
 */

/** Odkaz pod krokem na formulář „Listy pro vaši kůži“. */
const EDIT_SHEETS: AppLink = { to: 'lid-sheets', label: 'Upravit ve formuláři listů' };

/** Výsledek zkoušky V12 (lekce 3). Formulář listů podle něj upozorní na zálohu. */
const v12ResultField: RecordField = {
  kind: 'choice',
  id: LID_RECORD_IDS.v12Result,
  label: 'Výsledek zkoušky V12',
  options: [
    { value: LID_V12_RESULTS.ok, label: 'Líc nepopraskal: výchozí střih' },
    { value: LID_V12_RESULTS.cracked, label: 'Líc popraskal: záloha A (useň 0,8)' },
    {
      value: LID_V12_RESULTS.crackedAgain,
      label: 'Popraskala i useň 0,8, nebo nejde sehnat: záloha B1',
    },
  ],
};

/** Posun čáry hrany vložky podle V12 (lekce 3, krok inspect). */
const V12_SHIFT_ID = 'v12-shift';

/** Čára hrany vložky podle V12 – lekce 4 (značení) a 7 (pokládání vložky). */
const v12LineRecalls: StepRecall[] = [
  { fieldId: LID_RECORD_IDS.v12Offset, label: 'Odchylka rýhy od vrcholu ohybu (lekce 3)' },
  { fieldId: V12_SHIFT_ID, label: 'Čára hrany vložky podle V12' },
];

/** Výsledek zkoušky Z-1 až Z-4: prošlo, nebo co dál. */
const testResult = (
  id: string,
  label: string,
  failures: { value: string; label: string }[],
): RecordField => ({
  kind: 'choice',
  id,
  label,
  options: [{ value: 'pass', label: 'Prošlo' }, ...failures],
});

/** Papír na listy pro řez a šablony (lekce 4). */
const PLAIN_PAPER = 'nejlépe matný 120 g pro inkoustové tiskárny, jinak obyčejný';

/** Výtisk listu střihu (id listů výchozího střihu; listy pro změřenou kůži mají stejná). */
const sheet = (
  sheetId: 'sablona' | 'rub' | 'dily' | 'pripravky',
  copies: number,
  purpose: string,
  extra: Pick<LessonPrint, 'paper' | 'condition'> = {},
): LessonPrint => ({ source: 'pattern-sheets', sheetId, copies, purpose, ...extra });

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
    goal: 'Změřit kůži, vytisknout listy pro její tloušťku, zkontrolovat měřítko a slepit vložku dna ze starých karet.',
    materials: [
      'kůže: kaštan 20 × 50 cm (P1), nebarvená kozinka (D1 a L1), čokoládová kozinka (D2)',
      'papír a tužka na jednotlivá měření',
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
        body: 'Přířezy si nejdřív na kůži obkreslete: u kaštanu dva přířezy P1 110 × 240 mm za sebou podél delší strany kusu, odřezky na zkoušky z pruhu vedle nich. Posuvkou změřte tloušťku na několika místech, vždy tam, odkud díl vyříznete: P1 (kaštan), D1 a L1 (nebarvená kozinka), D2 (čokoládová kozinka). Průměr měření (doporučení, ověřte na zkušebním kuse) zadejte ve formuláři „Listy pro vaši kůži“ (odkaz pod krokem): je to jediné místo, odkud tloušťky berou listy i lekce. D1 a D2 zadejte zvlášť. Přepážka nesmí mít nikde víc než 0,92 mm (při P1 1,0; tlustší P1 hranici snižuje, hranici pro vaši P1 ukazuje souhrn pod krokem). Je-li tlustší, vyřízněte ji z tenčího místa, nebo kupte tenčí kozinku.',
        animationLinks: [
          animationLink('caliper', 'A1'),
          animationLink('caliper', 'B1'),
          animationLink('caliper', 'D1'),
        ],
        media: [photo('lw-l1-measure', 'Posuvka měří tloušťku kozinky na okraji kusu')],
        appLinks: [{ to: 'lid-sheets', label: 'Zadat tloušťky ve formuláři listů' }],
        lidSheetRecalls: ['thicknesses'],
      },
      {
        id: 'sheets-for-thickness',
        title: 'Získejte listy pro změřenou tloušťku',
        body: 'Předem vytištěné listy platí jen pro výchozí střih (P1 1,0 mm, přepážky a L1 0,6 mm). Na stránce Listy střihu (odkaz pod krokem) zkontrolujte ve formuláři „Listy pro vaši kůži“ tloušťky a stiskněte „Uložit a vygenerovat listy“. Listy k tisku jsou pod formulářem. Když střih s touto kůží neplatí, aplikace listy nevytvoří a napíše proč. Když formulář hlásí překročené meze, můžete listy vygenerovat pro zkušební kus (aplikace si to zapamatuje, souhrn pod krokem); finální kus řežte jen z listů v mezích. Takhle se listy generují pokaždé, když na to lekce odkáže.',
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['thicknesses', 'sheets'],
      },
      {
        id: 'sheets-rule',
        title: 'Kdy listy generovat znovu',
        printLink: 'pattern-sheets',
        body: 'Listy vytiskněte hned (odkaz pod krokem), podle nich slepíte papírový model (lekce 2). Znovu je vygenerujte, když P0 změní vstupy modelu (lekce 2), když V12 nebo zkušební kus vybere zálohu (lekce 3 a 12), když vyjde k nad 1,24 (lekce 10) a když vyberete magnet jiné tloušťky než 1,5 mm (lekce 11). Formulář platí vždy celý (tloušťky, P0, k, magnet i záloha): zkontrolujte ho, vygenerujte listy a zkontrolujte je jako v dalším kroku.',
        media: [],
      },
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte měřítko',
        printLink: 'pattern-sheets',
        body: 'Tiskněte na A4 na výšku v měřítku 100 % (bez přizpůsobení stránce). Kontrolní úsečka musí měřit 50 mm. Kóta P1 na listu 1 musí sedět s rámečkem „Čísla pro postup“ na listu 4 na ±0,5 mm (výchozí 231,66 mm) – samotná úsečka malou chybu měřítka neodhalí. Když něco nesedí, vytiskněte list znovu (odkaz pod krokem).',
        media: [],
      },
      {
        id: 'numbers-box',
        title: 'Značky podle legendy, čísla z rámečku na listu 4',
        body: 'Co která značka na listu znamená, říká legenda „Značky na tomto listu“ na každém listu. Lekce odkazují na značky (kroužky propíchnout, šrafy lepit) a čísla uvádějí jen tam, kde měříte nebo nastavujete. Ta berte z rámečku „Čísla pro postup“ na listu 4 (kóta P1, osa ohybu, hrana vložky, pás závěsu, okénka mincí, lepení G2, G3 a G4, švy S1–S6, plíšek, horní hranu F, hranu víčka, značku magnetu a okno lepení); čísla v textu lekcí jsou jen příklad výchozího střihu. Nejpřesněji musí sedět značka magnetu: okno lepení může mít jen asi 0,1 mm.',
        media: [],
      },
      {
        id: 'spacer',
        title: 'Slepte vložku dna ze starých karet',
        body: 'Vložka dna musí mít aspoň 111 × 25 × 1,5 mm. Slepte ji lepicí páskou ze 4 starých karet: 2 vrstvy na sobě (2 × 0,76 = 1,52 mm), v každé vrstvě 2 karty vedle sebe kratšími hranami k sobě. Dlouhou hranu, která půjde do ohybu, odstřihněte u všech karet rovně o 4 mm, ať u spoje nejsou zaoblené rohy; výšku dál nezkracujte. Přebytek délky ustřihněte v jedné vrstvě zleva a v druhé zprava, aby spoje nebyly nad sebou (list 4, „Vložka dna“). Stačí i jiný rovný tuhý pás 1,5 mm (změřte posuvkou). Jestli vložka udrží ohyb rovný, ukáže zkouška V12.',
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
        body: 'Šablony konce jazýčku (list 4) a výřezu pro palec (tečkovaný obdélník na listu 1) vyřízněte až na konci lekce 2: papírový model je může změnit.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'thickness-recorded',
        title:
          'Tloušťky P1, D1, D2 a L1 jsou zadané ve formuláři „Listy pro vaši kůži“ a žádná přepážka není nad hranicí pro vaši P1 (při P1 1,0 je to 0,92 mm), nebo jsou listy zkušebního kusu vygenerované mimo ověřené meze.',
        required: true,
      },
      {
        slug: 'sheets-checked',
        title:
          'Listy pro změřenou tloušťku (nebo výchozí) jsou vytištěné, úsečka měří 50 mm a kóta P1 sedí s rámečkem na listu 4 na ±0,5 mm.',
        required: true,
      },
      {
        slug: 'spacer-ready',
        title:
          'Vložka dna (aspoň 111 × 25 × 1,5 mm) je slepená a hrana do ohybu je rovná, bez zaoblených rohů.',
        required: true,
      },
    ],
    commonMistakes: [
      'Tisk s „přizpůsobit stránce“: úsečka ani kóta P1 pak nesedí.',
      'Čísla z textu lekcí místo z rámečku na listu 4.',
      'Přepážka z tlustšího místa kozinky (při P1 1,0 nad 0,92 mm, u tlustší P1 už méně): střih ji odmítne.',
      'Tloušťka změřená jinde, než odkud se díl vyřízne.',
    ],
    safety: [],
    prints: [
      sheet('sablona', 1, 'Kontrola měřítka (úsečka 50 mm, kóta P1) a papírový model v lekci 2', {
        paper: 'tvrdší papír (čtvrtka)',
      }),
      sheet('rub', 1, 'Papírový model v lekci 2', { paper: 'tvrdší papír (čtvrtka)' }),
      sheet('dily', 1, 'Přepážky D1 a D2 papírového modelu v lekci 2', {
        paper: 'tvrdší papír (čtvrtka)',
      }),
      sheet('pripravky', 1, 'Rámeček „Čísla pro postup“ (kóta P1) a vložka dna'),
    ],
    media: [photo('lw-l1-hero', 'Vytištěné listy 1–4 peněženky Víčko, posuvka měří kótu P1')],
  }),

  draft({
    slug: L2,
    title: 'Papírový model P0',
    order: 2,
    phaseSlug: 'prepare',
    estimatedMinutes: 90,
    goal: 'Slepit papírový model 1:1 a se skutečným obsahem ověřit, že se vejde 6 karet, bankovky napůl a 4 mince, víčko se zavře a výřez pro palec funguje.',
    materials: [
      'čtvrtka a lepidlo na papír (šablony)',
      'lepicí páska místo švů a lepení, nůžky, nůž a pravítko',
      '6 karet, bankovky 100–5000 Kč (které máte) a 4 mince 50 Kč',
      'papír a tužka na zápis výsledků',
    ],
    requiredEquipment: ['digital-caliper', 'utility-knife', 'steel-ruler', 'cutting-mat'],
    recommendedEquipment: [],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'glue-model',
        title: 'Slepte model',
        printLink: 'pattern-sheets',
        body: 'Z tvrdšího papíru vystřihněte podle listů 1–3 P1, D1 a D2. P1 přehněte na ose ohybu dna a v pásu závěsu. Vyřízněte i čárkované tvary z listu 1: obě okénka mincí, okénko bankovek (skrz P1 i D2) a výřez pro palec. Přepážky lepte páskou jen na šrafovaná místa z listu 2: D2 na záda (G3), D1 na přední stěnu (G2 a G2b). Sloupce mincí a kapsa karet musí zůstat volné. Boky slepte páskou místo švů S4 a S5.',
        media: [photo('lw-l2-model', 'Slepený papírový model peněženky Víčko s vloženými kartami')],
      },
      {
        id: 'insert-rule',
        title: 'Kam co patří',
        body: 'Ústí má tři štěrbiny za sebou. Karty patří do první u přední stěny (na straně jazýčku), před D1 s barevnou horní hranou; kartu s magnetickým proužkem vkládejte proužkem k horní hraně (k víčku). Bankovky napůl patří mezi D1 a D2, mince za D2 do levého nebo pravého sloupce. Karta v oddílu bankovek by ležela u magnetu a mohla by přijít o proužek.',
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
        body: 'Změřte 10 bankovek: délku rozložené ocelovým pravítkem, výšku, šířku složené napůl a tloušťku posuvkou. Liší-li se od modelu (69–74, napůl 70–85 a 0,1 mm), zadejte nejmenší a největší výšku a šířku napůl a tloušťku nejtlustší bankovky ve formuláři listů (odkaz pod krokem, část „Výsledky P0 a jiný magnet“). Vejdou se všechny bankovky 100–5000 Kč složené napůl? Pak posuňte nízkou stokorunu ukazováčkem v okénku bankovek nahoru a zapište, kolik mm vyčnívá nad ústí. Cíl je aspoň 15 mm (model počítá s 19 mm). Okénko prodloužit dolů nejde, končí těsně nad švem S1. Při menší hodnotě, nebo když se bankovky nevejdou (aplikace pak listy nevytvoří), zkontrolujte model a měření a z kůže neřežte.',
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['bills'],
        records: [
          {
            kind: 'choice',
            id: 'p0-bills-fit',
            label: 'Vejdou se všechny bankovky složené napůl?',
            options: [
              { value: 'yes', label: 'Ano' },
              { value: 'no', label: 'Ne' },
            ],
          },
          {
            kind: 'number',
            id: 'p0-bill-protrusion',
            label: 'Stokoruna vyčnívá nad ústí',
            hint: 'Model počítá s 19 mm.',
            unit: 'mm',
            decimals: 1,
            target: { min: 15, label: 'aspoň 15 mm' },
          },
        ],
      },
      {
        id: 'k',
        title: 'Poloha víčka (P0-3)',
        body: 'Na jazýček udělejte rysku a změřte její výšku od spodní hrany ve stavu A (prázdná), B (2 karty, 1 bankovka, 1 mince), C (6 karet, 3 bankovky, 4 × 50 Kč) a C s 2 + 2 mincemi nahoře, zvlášť nad sloupci a nad středem. Spočítejte k = (y_C − y_A) / (P(C) − P(A)); dělitel je v rámečku na listu 4. k zadejte ve formuláři listů (odkaz pod krokem, pole k). Vyjde-li k nad 1,24, musí se zvednout dno karet a výška, nebo přijmout menší plnost.',
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['k'],
      },
      {
        id: 'thumb-notch',
        title: 'Výřez pro palec (P0-4)',
        body: 'S 1, 2 a 6 kartami vysuňte přední kartu palcem ve výřezu a vytáhněte zadní kartu po vyndání předních. Zapište, jestli to jde a jak dlouho to trvá. Zkuste i kartu s vystouplým písmem a prohnutou kartu: zachytí se o dno výřezu? Pak 20× zavřete víčko ve stavu A, s 1 kartou, ve stavu B a C a s jazýčkem posunutým o 3 mm vlevo i vpravo. Zachytí se špička o výřez, nebo zajede pod dno výřezu či za přední stěnu?',
        records: [
          {
            kind: 'text',
            id: 'p0-thumb-notch',
            label: 'Výřez pro palec (P0-4): jde to, jak dlouho, co se zachytí',
            maxLength: 500,
          },
        ],
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
        body: 'Vyzkoušejte vysunutí mince okénkem sloupce a vložení mince do ústí; mince 50 Kč má ve sloupci volně klouzat. Změřte, o kolik výš nad lepením G2 sedí spodní hrana svazku 6 karet a o kolik výš nad lepením G3a sedí sloupec 2 × 50 Kč. Model počítá s 2,28 mm a 1,25 mm, jiné hodnoty zadejte ve formuláři listů (odkaz pod krokem).',
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['lifts'],
      },
      {
        id: 'full-and-sequence',
        title: 'Plný stav a celý sled (P0-7, P0-8)',
        body: 'Vložte plný stav (6 karet, 3 bankovky, 4 × 50 Kč) a vyzkoušejte celý sled s otevřeným víčkem. Otevřené víčko samo nestojí a pruží zpět – to je v pořádku. Drží ho palec ruky, která peněženku drží; ukazováček téže ruky posouvá bankovku (nebo minci) okénkem a druhá ruka bere. Víčko držte zhruba svisle, nepřeklápějte ho na záda.',
        media: [],
        records: [
          {
            kind: 'text',
            id: 'p0-full-sequence',
            label: 'Plný stav a celý sled (P0-7, P0-8): co šlo a co ne',
            maxLength: 500,
          },
        ],
      },
      {
        id: 'slots-p09',
        title: 'Tři štěrbiny (P0-9)',
        body: 'Zkuste zasunout kartu u boku za D1 a omylem do ústí bankovek. Je ústí bankovek dobře vidět? Když ne, dejte hraně D1 výraznější barvu.',
        media: [],
        records: [
          {
            kind: 'choice',
            id: 'p0-bill-slot-visible',
            label: 'Je ústí bankovek dobře vidět (P0-9)?',
            options: [
              { value: 'yes', label: 'Ano' },
              { value: 'no', label: 'Ne, hrana D1 výraznější barvou' },
            ],
          },
        ],
      },
      {
        id: 'record',
        title: 'Zkontrolujte hodnoty a nechte přepočítat',
        body: 'Když P0 dopadne podle modelu (bankovky se vejdou, stokoruna vyčnívá aspoň 15 mm, k do 1,24, zvednutí 2,28 a 1,25 mm, plný stav se vejde), platí listy z lekce 1. Když se něco liší, máte naměřené hodnoty ve formuláři (souhrn pod krokem): vygenerujte listy znovu jako v lekci 1. Dokud nemáte nové listy, nic z kůže neřežte a šablony nevyřezávejte. Zkoušku ohybu V12 (lekce 3) udělat můžete, na P0 nezávisí.',
        media: [],
        recalls: [
          { fieldId: 'p0-bills-fit', label: 'Bankovky se vejdou' },
          { fieldId: 'p0-bill-protrusion', label: 'Stokoruna vyčnívá' },
        ],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['k', 'lifts', 'bills'],
      },
      {
        id: 'templates',
        title: 'Vyřízněte šablonu konce jazýčku a výřezu pro palec',
        printLink: 'pattern-sheets',
        body: 'Z platných listů (z lekce 1, nebo nových, když P0 něco změnil) nalepte list 4 a list 1 na tvrdý papír a vyřízněte: (1) šablonu konce jazýčku z listu 4 po plném obrysu; kroužky na rysce L1 a 8 červených otvorů S7 propíchněte jehlou; (2) šablonu výřezu pro palec z listu 1 po tečkovaném obdélníku 30 × 20 mm; výřez U v ní vyřízněte a křížek středu propíchněte jehlou. Na variantě z V12 nezávisí, poslouží zkušebnímu i finálnímu kusu.',
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
          'Výsledky P0-1 až P0-9 jsou zapsané; co změnilo vstupy modelu, je zadané ve formuláři „Listy pro vaši kůži“ a listy jsou vygenerované znovu.',
        required: true,
      },
      {
        slug: 'templates-cut',
        title:
          'Šablony konce jazýčku (list 4) a výřezu pro palec (list 1) jsou z platných listů vyříznuté z tvrdého papíru.',
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
      'Pracovat se starými listy, když P0 změnil vstupy modelu.',
      'Model slepený páskou po celé ploše: sloupce mincí a kapsa karet pak nejdou vyzkoušet.',
    ],
    safety: ['Nůž veďte tahem od prstů volné ruky.'],
    prints: [
      sheet(
        'pripravky',
        1,
        'Šablona konce jazýčku (z platných listů, když P0 něco změnil, z nových): nalepit na tvrdý papír a vyříznout',
      ),
      sheet(
        'sablona',
        1,
        'Šablona výřezu pro palec (z platných listů): nalepit na tvrdý papír a vyříznout',
      ),
    ],
    requires: [
      {
        id: 'model-sheets',
        fromLesson: L1,
        label: 'Listy 1–3 pro změřenou kůži vytištěné 1:1 na tvrdší papír',
        note: 'na papírový model',
      },
    ],
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
    goal: 'Na odřezku ověřit, že líc v mokrém ohybu přes vložku 1,5 mm nepopraská, změřit polohu rýhy vůči vrcholu ohybu a zvolit variantu střihu.',
    materials: [
      'odřezek kaštanu aspoň 30 × 40 mm ze stejné kůže jako P1, z volného pruhu vedle obkreslených přířezů P1 (ne ze středu kusu)',
      'houbička a voda',
      'potravinová fólie',
      '2 hladká prkénka',
      'tupý hrot na rýhu (třeba vypsaná propiska, ověřte na odřezku), tužka',
      'lupa nebo mobil s makrem',
    ],
    requiredEquipment: ['veg-tan-leather-1mm', 'steel-ruler', 'digital-caliper'],
    recommendedEquipment: ['clamps'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'crease-and-mark',
        title: 'Orýhujte odřezek a vyznačte čáry',
        body: 'Na rubu odřezku vytlačte tupým hrotem u ocelového pravítka rýhu – nic neřežte a tlačte stejně po celé šířce. Za rýhou vyznačte čáru hrany vložky (vzdálenost z rámečku na listu 4, řádek „hrana vložky dna“, výchozí 1,96 mm). Obě čáry označte ryskami i na bocích.',
        media: [],
      },
      {
        id: 'wet-and-fold',
        title: 'Navlhčete a přehněte přes vložku',
        body: 'Odřezek navlhčete houbičkou a počkejte, až se barva usně skoro vrátí k suché (5–10 min). Vložku položte na rub hranou na čáru hrany vložky, celou na straně dál od rýhy. Volnou část odřezku přes ni přehněte lícem ven. Mezi vlhký líc a prkénka dejte potravinovou fólii.',
        waits: [dampen('Navlhčený odřezek V12')],
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
        body: 'Odřezek stáhněte mezi prkénky svěrkami a nechte přes noc vyschnout (12–24 h, ne u topení). Bez svěrek prkénka zatižte knihami nebo stáhněte silnými gumičkami či klipy (tlak ověřte na odřezku).',
        media: [],
        waits: [overnight('Schnutí odřezku V12', 'inspect')],
      },
      {
        id: 'inspect',
        title: 'Prohlédněte líc a změřte polohu rýhy',
        body: 'Vyjměte vložku a líc v ohybu prohlédněte lupou nebo mobilem s makrem. Na boku odřezku změřte posuvkou, jak daleko je ryska rýhy od vrcholu ohybu. Do 0,3 mm nechte čáru z listu. Při větší odchylce posuňte čáru hrany vložky na P1 o tuto odchylku: přehnutá část odřezku odpovídá přední stěně F, leží-li rýha blíž k ní, posuňte čáru k F.',
        records: [
          {
            kind: 'number',
            id: LID_RECORD_IDS.v12Offset,
            label: 'Odchylka rysky rýhy od vrcholu ohybu',
            unit: 'mm',
            decimals: 2,
            target: { max: 0.3, label: 'do 0,3 mm nechte čáru z listu' },
          },
          {
            kind: 'choice',
            id: V12_SHIFT_ID,
            label: 'Čára hrany vložky',
            hint: 'Posunout o odchylku, jen když je větší než 0,3 mm.',
            options: [
              { value: 'keep', label: 'Nechat z listu' },
              { value: 'toward-f', label: 'Posunout k F' },
              { value: 'toward-b', label: 'Posunout k B' },
            ],
          },
        ],
        media: [
          photo('lw-l3-inspect', 'Detail líce v ohybu odřezku po vyschnutí, posuvka u rysky rýhy'),
        ],
      },
      {
        id: 'decide',
        title: 'Rozhodněte variantu střihu',
        body: 'Líc nepopraskal: výchozí střih, nic se neztenčuje. Mírné odpružení ohybu po vyschnutí není důvod k záloze. Výsledek zapište níže; když zaškrtnutá záloha ve formuláři listů výsledku neodpovídá, formulář i souhrn pod krokem upozorní. Varianta platí pro zkušební i finální kus. Když líc popraskal: záloha A – celý P1 z usně 0,8 mm. Useň po dodání změřte posuvkou tam, odkud P1 vyříznete, ve formuláři listů (odkaz pod krokem) zaškrtněte zálohu A, zadejte změřenou tloušťku usně 0,8 a vygenerujte listy znovu; zkoušku zopakujte na odřezku 0,8. Když popraská i useň 0,8 nebo ji nejde sehnat: záloha B1 – ztenčit pás ohybu dna na 0,6 mm (ve formuláři B1, „--skive-fold 0.6“). Odřezek ztenčete podle lekce 5 (krok „Jen záloha B1 nebo B2: ztenčení“), zkoušku na něm zopakujte a teprve pak vygenerujte listy B1. Když popraská i záloha: neřežte a zkuste jinou useň do P1 (ověřte zkouškou V12). Zálohu B2 (závěs) V12 nevybírá, rozhodne o ní zkouška Z-2.',
        animationLinks: [animationLink('caliper', 'B1'), animationLink('caliper', 'D1')],
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['variant'],
        records: [v12ResultField],
      },
    ],
    checkpoints: [
      {
        slug: 'v12-variant',
        title:
          'Odřezek je prohlédnutý, výsledek V12 zapsaný a ve formuláři „Listy pro vaši kůži“ platí varianta: výchozí, záloha A (P1 z usně 0,8, změřená), nebo záloha B1 (ztenčený ohyb dna).',
        required: true,
      },
      {
        slug: 'v12-offset',
        title: 'Odchylka rýhy od vrcholu ohybu je zapsaná, nad 0,3 mm i posun čáry hrany vložky.',
        required: true,
      },
    ],
    commonMistakes: [
      'Vložka položená hranou na rýhu: hrana patří 1,96 mm za rýhu směrem k zádům.',
      'Rýha vyříznutá nožem místo vytlačená tupým hrotem.',
      'Odřezek z jiné kůže, než ze které bude P1.',
      'Odřezek ze středu kusu: nevejdou se pak oba přířezy P1.',
    ],
    safety: [],
    requires: [{ id: 'spacer', fromLesson: L1, label: 'Vložka dna ze starých karet' }],
    media: [photo('lw-l3-hero', 'Odřezek po zkoušce ohybu V12 vedle vložky ze starých karet')],
  }),

  draft({
    slug: L4,
    title: 'Řez dílů, plíšek a značení na rub',
    order: 4,
    phaseSlug: 'build',
    estimatedMinutes: 120,
    goal: 'Vyříznout díly zkušebního kusu (P1, D1, D2, přířez L1 a plíšek K2) a přenést na rub P1 čáry z listu 2.',
    materials: [
      'tvrdý papír na šablony',
      'šablony konce jazýčku a výřezu pro palec z lekce 2',
      'bezbarvý lak na nehty (hrany plíšku)',
      'jehla na propichování (rýsovací šídlo dělá větší vpich – ověřte na odřezku), tužka',
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
        body: 'Lekce 4–12 projdete nejdřív celé na zkušebním kuse. Teď vyřízněte jen jeho díly: jeden P1, D1, D2, přířez L1 a plíšek. Druhý přířez P1, zbytek kozinek a plech nechte celé. Finální kus řežte až po zkouškách Z-1 až Z-4 (lekce 12) – zkušební kus může změnit variantu i rozměry dílů.',
        media: [],
      },
      {
        id: 'valid-sheets',
        title: 'Platné listy a šablony',
        printLink: 'pattern-sheets',
        body: 'Pokud P0, V12 nebo zkušební kus něco změnily, vygenerujte listy znovu (lekce 1) a zkontrolujte úsečku 50 mm a kótu P1. Tiskněte nejlépe na matný papír 120 g pro inkoustové tiskárny, jinak na obyčejný. List 1 a list 3 vytiskněte dvakrát: první výtisk při řezání rozřežete, druhý nalepte na tvrdý papír a vyřízněte jako šablonu (otvory S1–S3 a D2 v lekci 6, S6 v lekci 8). Z listu 4 nalepte na tvrdý papír a vyřízněte šablony okének mincí a bankovek, plíšku a proužek S4/S5. Na finální kus vytiskněte listy 1 a 3 znovu z listů, které platí po zkušebním kuse. Listy s pruhem „MIMO OVĚŘENÉ MEZE“ platí jen pro zkušební kus.',
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['variant', 'sheets'],
      },
      {
        id: 'tape-sheet-1',
        title: 'List 1 přilepte na líc',
        animationLinks: [animationLink('lidP1Cut', 'A1'), animationLink('lidP1Cut', 'A2')],
        printLink: 'pattern-sheets',
        body: 'První výtisk listu 1 vystřihněte nahrubo s okrajem 1–2 cm kolem obrysu P1. List 1 je P1 z líce: položte ho na líc usně a přilepte maskovací páskou z několika stran, jen mimo čáru řezu. Pásku nejdřív vyzkoušejte na odřezku – může na líci nechat lesklou stopu nebo vytrhnout vlákna. (Jde to i podle šablony vyříznuté přesně z tvrdého papíru, řez po vytištěné čáře je ale přesnější.)',
        media: [],
      },
      {
        id: 'prick-p1',
        title: 'Před řezáním propíchněte značky P1',
        animationLinks: [animationLink('lidP1Cut', 'B1'), animationLink('lidP1Cut', 'B2')],
        body: 'Dokud je list přilepený, propíchněte jehlou skrz papír všechny kroužky a všechny křížky v kroužku na listu 1: kroužky na obou bocích (osa ohybu dna, hrana vložky a oba přehyby závěsu) a středy výsečníků – Ø 8 na napojení jazýčku, Ø 12 okének mincí, Ø 10 výřezu pro palec a Ø 14 na koncích okénka bankovek. Červené tečky švů S1–S3 a S6 teď nepropichujte (lekce 6 a 8).',
        media: [],
      },
      {
        id: 'cut-p1',
        title: 'Vyřízněte pás P1 skrz papír',
        animationLinks: [
          animationLink('lidP1Cut', 'C1'),
          animationLink('lidP1Cut', 'C2'),
          animationLink('lidP1Cut', 'C3'),
          animationLink('lidP1Cut', 'C4'),
          animationLink('lidP1Cut', 'C5'),
          animationLink('lidP1Cut', 'C6'),
        ],
        body: 'Řežte nožem skrz papír i kůži přesně po plné čáře; čárkované tvary (řez později) teď neřežte. Vyduté napojení jazýčku: nejdřív výsečník Ø 8 skrz papír, pak tečné rovné řezy nožem. Rovné úseky řežte podél ocelového pravítka na dva až tři lehké tahy, nůž kolmo; oblouky pomalu bez pravítka. Když řez začne třepit, odlomte článek čepele. Horní hranu přední stěny F řežte rovně i přes výřez pro palec – výřez se dělá až v lekci 5. Konec jazýčku nechte rovný v plné délce, je v ní rezerva 5 mm. Špičku R10 teď neřežte, řeže se v lekci 11.',
        media: [
          photo('lw-l4-p1', 'Vyříznutý pás P1 s jazýčkem, vyduté napojení jazýčku výsečníkem Ø 8'),
        ],
      },
      {
        id: 'peel-p1',
        title: 'Sejměte list a zkontrolujte značky',
        animationLinks: [animationLink('lidP1Cut', 'D1'), animationLink('lidP1Cut', 'D2')],
        body: 'Pásku strhávejte pomalu, skoro rovnoběžně s kůží. Zkontrolujte, že na kůži je vpich u každého kroužku a křížku z listu 1.',
        media: [],
      },
      {
        id: 'cut-parts',
        title: 'Přepážky D1, D2 a přířez L1',
        printLink: 'pattern-sheets',
        body: 'Pro zkušební kus po jednom: D1 z nebarvené kozinky, D2 z čokoládové kozinky a přířez L1 z nebarvené kozinky (rozměry na listu 3). Díly z prvního výtisku listu 3 vystřihněte nahrubo a přilepte páskou na rub kozinky. Propíchněte kroužky na koncích osy D1 a D2, podle ní se přepážky přikládají. Řežte skrz papír po plné čáře, rovné strany u pravítka, rohy R3 pomalu bez pravítka; čárkované okénko na D2 teď neřežte. Pásku strhněte pomalu a zkontrolujte vpichy.',
        media: [],
      },
      {
        id: 'plate',
        title: 'Plíšek K2',
        body: 'Rozměr plíšku přeneste na plech ze šablony plíšku z listu 4. Vyřízněte jeden plíšek pro zkušební kus z pozinkovaného plechu 0,5 mm, který jste v obchodě vyzkoušeli magnetem: pilkou na kov, nebo plech nařízněte nožem u pravítka a v rýze zlomte ohýbáním (ověřte na odřezku plechu). Rohy R3 a otřep zabruste brusným papírem 120 na desce. Hrany přelakujte bezbarvým lakem na nehty – železo dělá na vlhké usni tmavé skvrny. Jestli na plechu drží kontaktní lepidlo, ověří zkušební kus; chcete-li to vědět dřív, přilepte odstřižek plechu na odřezek usně a po 24 h zkuste, jestli drží.',
        waits: [
          {
            id: 'plate-glue-test',
            label: 'Zkouška lepidla na plechu (volitelná)',
            minutes: 24 * 60,
            basis: 'text',
          },
        ],
        media: [
          photo('lw-l4-plate', 'Plíšek 14 × 20,5 mm se zabroušenými rohy R3 vedle tabule plechu'),
        ],
      },
      {
        id: 'mark-back',
        title: 'Značení na rub',
        printLink: 'pattern-sheets',
        animationLinks: [
          animationLink('lidP1Cut', 'E1'),
          animationLink('lidP1Cut', 'E2'),
          animationLink('lidP1Cut', 'E3'),
          animationLink('lidP1Cut', 'E4'),
          animationLink('lidP1Cut', 'E5'),
        ],
        body: 'List 2 nalepte na tvrdý papír, vyřízněte po obrysu a přiložte na rub P1. Propíchněte jehlou všechny kroužky na listu 2 (rohy šrafovaných ploch a konce čar), šablonu sejměte a vpichy spojte tužkou u pravítka – nic nezařezávejte. Tak přenesete osu ohybu dna, čáru hrany vložky (případně posunutou podle V12, zápis pod krokem), pás závěsu, plochy lepení G1–G4, okénka mincí, polohu D1 a D2 a osu na rubu F i B (kroužky na ryskách „osa“ a na horní hraně G3c, na každé stěně dva vpichy spojte v jednu čáru). Osu ohybu, hranu vložky a oba přehyby závěsu označte i ryskami na obou bocích (v lekci 10 podle nich zkontrolujete přehyby). Na rub F a na rub B napište „L“ tam, kde je na listu 2. Čáry švů S1–S3 a S6 ani okénko bankovek na rub nekreslete: otvory švů se přenesou později z líce přes šablonu z listu 1 – propíchnou se jehlou a děrují vidličkou (S1–S3 v lekci 6, S6 v lekci 8).',
        media: [],
        recalls: v12LineRecalls,
      },
    ],
    checkpoints: [
      {
        slug: 'parts-cut',
        title:
          'P1 sedí s kótou z rámečku na ±0,5 mm a konec jazýčku je rovný; D1, D2, L1 a plíšek jsou vyříznuté a hrany plíšku přelakované.',
        required: true,
      },
      {
        slug: 'marks-transferred',
        title:
          'Vpich je u každého kroužku a křížku z listu 1 a u konců osy D1 a D2; druhý výtisk listů 1 a 3 je vyříznutý jako šablona.',
        required: false,
      },
      {
        slug: 'back-marked',
        title:
          'Na rubu P1 je tužkou vše z listu 2 (osa ohybu, hrana vložky, pás závěsu, G1–G4, okénka mincí, poloha D1 a D2, osa na F i B, značky L); osa, hrana vložky a přehyby závěsu i ryskami na bocích.',
        required: true,
      },
    ],
    commonMistakes: [
      'Výřez pro palec vyříznutý hned s obrysem: horní hrana F se teď řeže rovně, výřez až v lekci 5.',
      'List 1 jen v jednom výtisku: na propichování S1–S3 a S6 pak chybí šablona.',
      'Nůž přitlačený k okraji papíru místo k pravítku: řez uhne.',
      'Páska přes čáru řezu: řez uhne.',
      'Špička jazýčku vyříznutá hned: přijdete o rezervu 5 mm a poloha magnetu přestane sedět.',
      'Díly finálního kusu vyříznuté spolu se zkušebním: zkušební kus může změnit variantu a rozměry.',
      'Plíšek z austenitické (běžné) nerezi: magnet na ní skoro nedrží. Plech vyzkoušejte magnetem.',
      'Nepřelakované hrany plíšku: tmavé skvrny na usni.',
    ],
    safety: [
      'Nůž veďte tahem od prstů volné ruky.',
      'Uříznutý plech má ostré hrany a otřep: plíšek berte za plochu, dokud otřep a rohy nezabrousíte.',
      'Prsty držící výsečník mějte u spodku, palička dopadá na horní konec. Děrujte jen na tvrdé desce.',
    ],
    prints: [
      sheet(
        'sablona',
        2,
        'První výtisk na řez P1 skrz papír, druhý jako šablona otvorů S1–S3 a S6',
        {
          paper: PLAIN_PAPER,
        },
      ),
      sheet('rub', 1, 'Značení na rub P1: nalepit na tvrdý papír a vyříznout', {
        paper: PLAIN_PAPER,
      }),
      sheet('dily', 2, 'První výtisk na řez D1, D2 a L1 skrz papír, druhý jako šablona D2', {
        paper: PLAIN_PAPER,
      }),
      sheet(
        'pripravky',
        1,
        'Šablony okének mincí a bankovek, plíšku a proužek otvorů S4/S5: nalepit na tvrdý papír',
        { paper: PLAIN_PAPER },
      ),
    ],
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
    goal: 'Vytlačit rýhu ohybu dna (v záloze B1 ztenčit pás ohybu), vyseknout okénka mincí a výřez pro palec a dokončit hrany, na které po sestavení nedosáhnete.',
    materials: [
      'tupý hrot na rýhu, párátka',
      'dřevěný kolík Ø 8 do aku vrtačky (broušení a leštění vydutých hran)',
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
        animationLinks: [animationLink('lidBends', 'A1')],
        body: 'Na rubu vytlačte tupým hrotem u ocelového pravítka rýhu podél osy ohybu (čára z listu 2, konce u vpichů na bocích). Nic neřežte a tlačte stejně po celé šířce; nejdřív to zkuste na odřezku z V12. Pás závěsu se neupravuje. V záloze B1 rýhu nedělejte: pás ohybu se v dalším kroku ztenčuje a osu máte vyznačenou ryskami na bocích.',
        media: [],
      },
      {
        id: 'skive-backup',
        title: 'Jen záloha B1 nebo B2: ztenčení',
        body: 'Jen pro zálohu B1 (pás ohybu dna) nebo B2 (pás závěsu, jen finální kus, když závěs zkušebního kusu neprojde zkouškou Z-2 ani v záloze A). Jinak krok přeskočte. V záloze B2 je P1 z usně 1,0, useň 0,8 se neztenčuje (zkouška V6(c) počítá se ztenčenou usní 1,0); byla-li záloha A kvůli V12, ztenčete oba pásy (B1 i B2). Nejdřív vygenerujte listy se zálohou: pás ztenčujte z rubu z 1,0 na 0,6 mm tam, kde ho list 1 ohraničuje oranžově. (a) Nejlépe v ševcovské nebo brašnářské dílně zvonovým ztenčovačem: pás ohybu včetně náběhů, pás závěsu celý na plno a náběh 2 mm vně (oranžové čáry). P1 doneste s pásem vyznačeným na rubu. (b) Jinak brusným papírem 80 na rovném hranolku, pás ohraničte maskovací páskou: u ohybu bruste na plno jen střed 4 mm a 2 mm na každé straně nechte jako náběh; závěs bruste celý na plno a náběh 2 mm udělejte vně čar. Nožem jen hrubě a nikdy pod 0,8 mm. Posuvkou hlídejte 0,6–0,8 mm, okraje jako náběh, ne schod. Nejdřív na odřezku (v záloze B1 ho máte ztenčený z lekce 3). Postup je neověřený, ověřte ho na zkušebním kuse.',
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['variant'],
      },
      {
        id: 'd2-edge',
        title: 'Spodní hrana D2 do tenka',
        animationLinks: [animationLink('edges', 'G4')],
        body: 'Spodní hranu D2 zbruste brusným papírem na hranolku do tenka (klín 3 mm, oranžová čára na listu 3) z líce D2 – ze strany k bankovkám; rub D2 se lepí na B. Ne nožem. Jinak by hrana tvořila schod, o který se zachytí bankovka.',
        media: [],
      },
      {
        id: 'coin-windows',
        title: 'Okénka mincí v zádech',
        animationLinks: [
          animationLink('lidWindows', 'A2'),
          animationLink('lidWindows', 'A3'),
          animationLink('lidWindows', 'A4'),
          animationLink('lidWindows', 'A5'),
          animationLink('edges', 'G4'),
        ],
        body: 'Okénka mincí v zádech sekejte z líce B, kde máte propíchnuté středy. Díl položte lícem B nahoru na tvrdou desku. Šablonu okénka mincí (list 4) přiložte křížky na vpichy a zkontrolujte polohu; před sekáním ji sejměte. Výsečníkem Ø 12 vysekněte oba konce a mezi nimi řízněte nožem u pravítka od tečny k tečně. Konce vybruste brusným papírem na kolíku Ø 8 v aku vrtačce, okénka zkoste z líce a vyleštěte jako ostatní hrany.',
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
        animationLinks: [
          animationLink('lidWindows', 'B2'),
          animationLink('lidWindows', 'B3'),
          animationLink('lidWindows', 'B4'),
          animationLink('lidWindows', 'B5'),
          animationLink('lidWindows', 'D2'),
        ],
        body: 'Výřez pro palec sekejte z líce F. Díl položte lícem F nahoru na tvrdou desku a přiložte šablonu výřezu: horní hranu šablony na horní hranu F, křížek šablony na propíchnutý střed. Výsečník Ø 10 nasaďte přes šablonu (zůstává přiložená) na tento střed a vysekněte. Pak řízněte nožem rovně od hrany F k tečnám díry a přesně na tečně zastavte. Rohy ústí R1 zaoblete brusným papírem, ne nožem. Jestli výřez funguje, ověří zkušební kus.',
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
        animationLinks: [animationLink('edges', 'G1')],
        body: 'Horní hranu F i s výřezem, spodní hranu a boky pásu víčka a boky jazýčku vybruste smirkem 220–400 na rovné destičce, zkoste z líce (zkosovačem, nebo zaoblete brusným papírem na hranolku) a vyleštěte: navlhčete vodou nebo Tokonole (jen mimo lepená místa) a třete leštítkem nebo kusem plátna, až se hrana zaleskne. Horní hrany D1 a D2 jen vybruste a vyleštěte; horní hranu D2 lehce zaoblete, vede přes ni závěs. Výřez pro palec zaoblete z líce i z rubu, o rubovou hranu by se zachytila karta. Vnitřek výřezu vybruste a vyleštěte kolíkem Ø 8 v aku vrtačce.',
        media: [],
      },
      {
        id: 'd1-paint',
        title: 'Barevná horní hrana D1',
        animationLinks: [animationLink('edges', 'G2')],
        body: 'Horní hranu D1 natřete párátkem barvou na hrany v tónu D2, ve 2 tenkých vrstvách, mezi nimi 20–30 min. Nejdřív na odřezku kozinky: přilnavost na tak tenké hraně je neověřená.',
        media: [],
        waits: [
          {
            id: 'coat',
            label: 'Schnutí barvy na hraně D1 mezi vrstvami',
            minutes: 20,
            maxMinutes: 30,
            basis: 'text',
          },
        ],
      },
      {
        id: 'tokonole',
        title: 'Tokonole na rub pásu víčka, ne na lepená místa',
        animationLinks: [animationLink('edges', 'G2')],
        body: 'Tokonole brání přilnutí lepidla. Natřete jím rub pásu víčka jen nad čarou „Tokonole jen nad touto čarou“ na listu 2 (u kořene jazýčku). Rub jazýčku nechte bez Tokonole, v lekci 11 se na něj lepí magnet a L1. Jinde ho nanášejte jen mimo šrafovaná místa a hranice lepení přelepte páskou.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'crease-done',
        title:
          'Rýha ohybu dna je vytlačená podél osy po celé šířce, nic není naříznuté (v záloze B1 je místo rýhy ztenčený pás ohybu).',
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
          'Hrany F, pásu víčka a jazýčku jsou vybroušené, zkosené z líce a vyleštěné, horní hrany D1 a D2 vybroušené a vyleštěné a hrana D1 natřená kontrastní barvou.',
        required: true,
      },
    ],
    commonMistakes: [
      'Řez nožem za tečnu výsečníku: zářez pak pokračuje do kůže.',
      'Rohy výřezu pro palec nožem místo brusným papírem.',
      'Tokonole na místě, které se bude lepit.',
    ],
    safety: [
      'Nůž veďte tahem od prstů volné ruky.',
      'Prsty držící výsečník mějte u spodku, palička dopadá na horní konec. Děrujte jen na tvrdé desce.',
      'Aku vrtačku používejte podle návodu výrobce. Kolík s brusným papírem pevně upněte a prsty držte mimo točící se kolík.',
    ],
    requires: [
      {
        id: 'v12-scrap',
        fromLesson: L3,
        label: 'Odřezek ze zkoušky V12',
        note: 'na vyzkoušení rýhy',
      },
      {
        id: 'notch-template',
        fromLesson: L2,
        label: 'Šablona výřezu pro palec z listu 1 na tvrdém papíře',
      },
      { id: 'coin-window-template', fromLesson: L4, label: 'Šablona okénka mincí z listu 4' },
    ],
    media: [photo('lw-l5-hero', 'Pás P1 s vyseknutými okénky mincí a výřezem pro palec')],
  }),

  draft({
    slug: L6,
    title: 'Lepení D2, okénko bankovek a sloupce mincí',
    order: 6,
    phaseSlug: 'build',
    estimatedMinutes: 150,
    goal: 'Přilepit D2 na záda jen v pásech lepení, proseknout okénko bankovek skrz obě vrstvy a ušít švy sloupců mincí S1–S3.',
    materials: ['jehla na propichování', 'odřezek D2 + B na zkoušku děrování'],
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
        animationLinks: [
          animationLink('lidBackD2', 'A1'),
          animationLink('lidBackD2', 'A2'),
          animationLink('lidBackD2', 'A3'),
          animationLink('lidBackD2', 'A4'),
          animationLink('lidBackD2', 'A5'),
          animationLink('lidBackD2', 'A6'),
        ],
        body: 'D2 lepte rubem na rub B jen na šrafovaných pásech G3 (dno mincí, boky a střed mezi sloupci; list 2 a 3). Sloupce mincí a horní okraj D2 nad koncem šrafy (začíná tam závěs) nelepte. Na rubu B máte hranice z lekce 4. Na rub D2 je přeneste ze šablony D2 (2. výtisk listu 3): přiložte ji na rub D2 podle hran, rohy šrafovaných pásů propíchněte jehlou a spojte tužkou u pravítka. Hranice na B i na D2 přelepte maskovací páskou, kontaktní lepidlo naneste na obě strany a pásku hned strhněte. Nechte zavadnout 10–15 min. D2 přiložte do jejího čárkovaného obdélníku na rubu B: osa na osu, spodní hrana na spodní čáru, na každém boku přesah 1 mm. Přitlačte. Děrujte nejdřív za 1 h.',
        media: [],
        waits: [
          tack('tack', 'Zavadnutí lepidla G3', 'text'),
          beforePunching('cure', 'Lepení G3 před děrováním', 'stitch-s1-s3'),
        ],
      },
      {
        id: 'bill-window',
        title: 'Okénko bankovek skrz D2 a záda',
        animationLinks: [
          animationLink('lidWindows', 'C2'),
          animationLink('lidWindows', 'C3'),
          animationLink('lidWindows', 'C4'),
          animationLink('lidWindows', 'C5'),
          animationLink('edges', 'G4'),
        ],
        body: 'Až po lepení G3. Díl položte lícem B nahoru na tvrdou desku. Křížky šablony okénka bankovek z listu 4 přiložte na vpichy Ø 14 z lekce 4 a zkontrolujte polohu; před sekáním šablonu sejměte. Výsečníkem Ø 14 vysekněte z líce B oba konce skrz B i D2 a mezi nimi řízněte nožem u pravítka od tečny k tečně skrz obě vrstvy. Zkoste a vyleštěte jako jeden svazek.',
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
        animationLinks: [
          animationLink('lidBackD2', 'C1'),
          animationLink('lidBackD2', 'C2'),
          animationLink('lidBackD2', 'C3'),
          animationLink('lidBackD2', 'C4'),
        ],
        body: 'Otvory S1–S3 přeneste jedním ze dvou způsobů (nejdřív na odřezku D2 + B). (a) Šablonu z listu 1 přiložte na líc B podle obrysu, červené tečky S1–S3 propíchněte jehlou skrz B i D2 a na líci D2 pak děrujte do vpichů. (b) Šablonu D2 z listu 3 přiložte na líc D2 podle hran a červené tečky S1–S3 propíchněte jehlou skrz šablonu.',
        media: [],
      },
      {
        id: 'stitch-s1-s3',
        title: 'Děrovat a šít S1, S2, S3',
        body: 'Děrujte z líce D2 na tvrdé desce do vpichů, vidličku vždy stejně natočenou (při pohledu na líc D2 horní hranou od sebe) – šikmé otvory na zádech pak mají stejný sklon. S1 (dno mincí) má 21 otvorů, S2 a S3 (boky sloupců) po 13. Šijte sedlovým stehem, na obou koncích 2 otvory zpět.',
        animationLinks: [
          animationLink('lidBackD2', 'D1'),
          animationLink('lidBackD2', 'D2'),
          animationLink('lidBackD2', 'D3'),
          animationLink('lidBackD2', 'D4'),
          animationLink('saddleStitch', 'E2'),
          animationLink('threadLength'),
        ],
        media: [
          photo('lw-l6-seams', 'Ušité švy S1–S3 na líci D2, sloupce mincí a okénko bankovek'),
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'g3-glued',
        title:
          'D2 je přilepená jen na šrafovaných pásech G3 (dno, boky a střed) a sloupce mincí zůstaly nelepené.',
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
      'Lepidlo ve sloupcích mincí nebo nad koncem šrafy G3: sloupce se zalepí, závěs vyztuží.',
      'Okénko bankovek vyseknuté před lepením G3: vrstvy pak nelícují.',
      'Vidlička pokaždé jinak natočená: otvory na zádech mají různý sklon.',
    ],
    safety: [
      'Nůž veďte tahem od prstů volné ruky.',
      'Prsty držící výsečník nebo vidličku mějte u spodku, palička dopadá na horní konec. Děrujte jen na tvrdé desce.',
      'Kontaktní lepidlo používejte ve větrané místnosti a podle návodu na obalu.',
    ],
    requires: [
      {
        id: 'd2-template',
        fromLesson: L4,
        label: 'Šablona D2 z listu 3 (druhý výtisk)',
        note: 'pásy G3 a otvory S1–S3',
      },
      { id: 'bill-window-template', fromLesson: L4, label: 'Šablona okénka bankovek z listu 4' },
      {
        id: 'sheet1-template',
        fromLesson: L4,
        label: 'Šablona z listu 1 (druhý výtisk)',
        note: 'otvory S1–S3',
      },
    ],
    media: [photo('lw-l6-hero', 'Záda s přilepenou D2, okénky a ušitými švy sloupců mincí')],
  }),

  draft({
    slug: L7,
    title: 'Mokrý ohyb dna',
    order: 7,
    phaseSlug: 'build',
    estimatedMinutes: 30,
    goal: 'Ohnout dno za mokra přes vložku 1,5 mm tak, aby střed ohybu padl na rýhu, a nechat ho přes noc vyschnout.',
    materials: ['houbička a voda', 'potravinová fólie', '2 hladká prkénka'],
    requiredEquipment: [],
    recommendedEquipment: ['clamps'],
    prerequisiteLessons: [L6],
    steps: [
      {
        id: 'wet',
        title: 'Navlhčete pás ohybu',
        body: 'Pás ohybu dna navlhčete houbičkou a počkejte, až se barva usně skoro vrátí k suché (5–10 min).',
        waits: [dampen('Navlhčený pás ohybu dna')],
        animationLinks: [animationLink('lidBends', 'A2'), animationLink('lidBends', 'A3')],
        media: [],
      },
      {
        id: 'place-spacer',
        title: 'Vložku položte hranou na čáru hrany vložky',
        animationLinks: [animationLink('lidBends', 'A4')],
        body: 'Vložku položte na rub zad B hranou na čáru hrany vložky z lekce 4 (případně posunutou podle V12). Hrana vložky míří k F, na straně F vložka neleží – tak padne střed ohybu na rýhu (v záloze B1 na osu uprostřed ztenčeného pásu). Vložka přesahuje díl na každé straně o 5 mm.',
        recalls: v12LineRecalls,
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
        animationLinks: [
          animationLink('lidBends', 'A5'),
          animationLink('lidBends', 'A6'),
          animationLink('lidBends', 'A7'),
          animationLink('lidBends', 'A8'),
          animationLink('lidBends', 'A9'),
        ],
        body: 'F přehněte nahoru přes vložku lícem ven. Mezi vlhký líc a prkénka dejte potravinovou fólii. Spodních 20 mm stáhněte mezi prkénky svěrkami (bez svěrek jako v lekci 3) a nechte přes noc vyschnout (12–24 h, ne u topení).',
        waits: [overnight('Schnutí ohybu dna', 'remove-spacer')],
        media: [
          photo('lw-l7-clamp', 'Ohyb dna stažený mezi prkénky s fólií, vložka zasunutá v ohybu'),
        ],
      },
      {
        id: 'remove-spacer',
        title: 'Vysuňte vložku',
        animationLinks: [animationLink('lidBends', 'A10')],
        body: 'Po vyschnutí vysuňte vložku bokem. Boky ještě nejsou slepené, takže F jde odklopit na lepení plíšku a D1 v příští lekci. Mírné odpružení ohybu nevadí, udrží ho lepení G4 a boční švy.',
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
    requires: [
      {
        id: 'spacer',
        fromLesson: L1,
        label: 'Vložka dna ze starých karet',
        note: 'aspoň 111 × 25 × 1,5 mm, z karet asi 111 × 50',
      },
    ],
    media: [photo('lw-l7-hero', 'Vyschlý ohyb dna z boku, rovný po celé šířce')],
  }),

  draft({
    slug: L8,
    title: 'Plíšek, přepážka D1 a šev dna karet',
    order: 8,
    phaseSlug: 'build',
    estimatedMinutes: 120,
    goal: 'Přilepit plíšek a přes něj přepážku D1 na rub přední stěny a ušít šev dna karet S6.',
    materials: ['párátka', 'jehla na propichování'],
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
        body: 'F položte rubem nahoru celou na tvrdou desku, ohyb dna u hrany desky; B stojí nad ohybem nahoru. Vyschlý ohyb táhne B zpátky k F: opřete ji zezadu o knihu nebo krabičku a horní hranu přichyťte kolíčkem nebo páskou, ať nespadne na lepidlo. Plíšek přilepte kontaktním lepidlem na rub F do šrafované plochy G1 (list 2); přilnavost k oceli ověří zkušební kus. Pak už plíšek vyměnit nejde, magnet ano.',
        waits: [tack('tack', 'Zavadnutí lepidla G1 (plíšek)', 'manufacturer')],
        animationLinks: [animationLink('lidMagnet', 'A1'), animationLink('lidMagnet', 'A2')],
        media: [],
      },
      {
        id: 'g2',
        title: 'G2 a G2b: přepážka D1',
        body: 'D1 přilepte rubem na rub F do šrafovaných ploch G2 (přes plíšek) a G2b (boky 1 mm). D1 nemá žádnou vůli: přikládejte ji vpichy osy na osu rubu F z lekce 4, zdola od spodní čáry obdélníku D1. Kontaktní lepidlo jde na obě strany, hranice proto vyznačte i na rubu D1: tužkou spodní pás G2 a boční proužky G2b podle šrafy na listu 3 (v rozměrech pro vaši kůži; ve výchozím střihu G2 24 mm od spodní hrany, G2b 1 mm od boků). Plochy, které se nelepí, zakryjte maskovací páskou hranou přesně na čáru (na rubu F pásy G2b z obou stran, na D1 zevnitř), hranu pásky přejeďte nehtem. Pásku nejdřív zkuste na odřezku rubu kozinky. Lepidlo nanášejte tahy z pásky do šrafy, na proužky G2b párátkem. Pásky strhněte hned po nanesení lepidla, pomalu a směrem od lepené plochy, ještě než lepidlo zavadne a než přiložíte D1. Přetok nad G2 hned setřete.',
        waits: [
          tack('tack', 'Zavadnutí lepidla G2 (D1)', 'manufacturer'),
          beforePunching('cure', 'Lepení G1 a G2 před děrováním S6', 's6'),
        ],
        animationLinks: [animationLink('lidMagnet', 'A3'), animationLink('lidMagnet', 'A4')],
        media: [],
      },
      {
        id: 'check-d1',
        title: 'Změřte polohu D1',
        body: 'Po přiložení změřte: kapsa karet mezi pásy G2b musí mít aspoň 90,5 mm a D1 musí být od hrany F aspoň 3,5 mm, jinak zasáhne do bočního švu S4. Pak přitlačte paličkou přes desku položenou na D1.',
        records: [
          {
            kind: 'number',
            id: 'card-pocket-width',
            label: 'Kapsa karet mezi pásy G2b',
            unit: 'mm',
            decimals: 1,
            target: { min: 90.5, label: 'aspoň 90,5 mm' },
          },
          {
            kind: 'number',
            id: 'd1-from-f-edge',
            label: 'D1 od hrany F',
            unit: 'mm',
            decimals: 1,
            target: { min: 3.5, label: 'aspoň 3,5 mm' },
          },
        ],
        animationLinks: [animationLink('lidMagnet', 'A5')],
        media: [],
      },
      {
        id: 's6',
        title: 'Šev dna karet S6',
        body: 'Po lepení počkejte aspoň 1 h. F položte lícem nahoru na tvrdou desku u hrany stolu a B nechte viset přes hranu (ohyb dna na hraně desky). Šablonu z listu 1 přiložte na líc F podle obrysu a červené tečky S6 (dvakrát 8, střed kolem plíšku šev vynechává) propíchněte jehlou. Děrujte vidličkou do vpichů (při pohledu na líc F horní hranou od sebe). Šijte sedlovým stehem, konce 2 otvory zpět.',
        animationLinks: [animationLink('saddleStitch', 'E2'), animationLink('threadLength')],
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
      'D1 přikládaná od kraje místo podle osy.',
      'Lepidlo přeteklé z G2b do kapsy karet.',
      'Páska kolem G2b nechaná při přikládání D1: zůstane pod ní zalepená.',
      'Lepení na svisle odklopenou F: palička pak nemá oporu, F má ležet rubem nahoru na desce.',
      'Děrování S6 dřív než 1 h po lepení.',
    ],
    safety: [
      'Prsty držící vidličku mějte u spodku, palička dopadá na horní konec. Děrujte jen na tvrdé desce.',
      'Kontaktní lepidlo používejte ve větrané místnosti a podle návodu na obalu.',
    ],
    requires: [
      { id: 'plate', fromLesson: L4, label: 'Plíšek K2 s přelakovanými hranami' },
      {
        id: 'sheet1-template',
        fromLesson: L4,
        label: 'Šablona z listu 1 (druhý výtisk)',
        note: 'otvory S6',
      },
    ],
    media: [photo('lw-l8-hero', 'Přední stěna s přilepenou D1 a ušitým švem dna karet S6')],
  }),

  draft({
    slug: L9,
    title: 'Složení a boční švy',
    order: 9,
    phaseSlug: 'build',
    estimatedMinutes: 150,
    goal: 'Slepit boky, ušít boční švy S4 a S5 skrz všechny vrstvy a boky zarovnat na 101 mm a vyleštit.',
    materials: [
      'odřezek usně 1,0 mm na vyrovnání schodu u horní hrany F',
      'tužka, jehla na propichování',
    ],
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
        animationLinks: [animationLink('lidBodySides', 'A2')],
        body: 'Díl nejdřív složte nanečisto a zkontrolujte, že boky F a B lícují a D2 přesahuje na každém boku 1 mm. Teprve pak lepte – kontaktní lepidlo chytne hned při dotyku.',
        media: [],
      },
      {
        id: 'g4',
        title: 'G4: boční pásy',
        animationLinks: [
          animationLink('lidBodySides', 'B1'),
          animationLink('lidBodySides', 'B2'),
          animationLink('lidBodySides', 'B3'),
          animationLink('lidBodySides', 'B4'),
        ],
        body: 'Lepte šrafované boční pásy G4 z listu 2: rub F na líc D2 (líc D2 v šedě šrafovaných pásech z listu 3 zdrsněte) a pod D2 rub F na rub B. Přikládejte od ohybu dna nahoru a F rovnejte podle boků B. Mezi pásy G4 zůstane kapsa 93 mm.',
        waits: [
          tack('tack', 'Zavadnutí lepidla G4', 'manufacturer'),
          beforePunching('cure', 'Lepení G4 před děrováním boků', 'punch-sew'),
        ],
        media: [],
      },
      {
        id: 'mark-side',
        title: 'Čára švu a otvory S4, S5',
        animationLinks: [animationLink('lidBodySides', 'C1'), animationLink('lidBodySides', 'C2')],
        body: 'Narýsujte čáru švu 3,0 mm od hrany boku F a B, ne od přečnívající D2 (je o 1 mm širší a zarovná se až po sešití): rýsovacím kružidlem nastaveným na 3,0 mm nebo rýhovačem. Nad horní hranou F, kde je navrchu D2, je čára 4,0 mm od hrany D2; můžete ji tam i jen prodloužit u pravítka. Otvory přeneste z proužku S4/S5 (list 4): na proužku nejdřív propíchněte jehlou všechny červené tečky a oba kroužky, ať jsou vidět i z rubu. Proužek přiložte levou hranou na hranu boku, spodní hranou ke spodní hraně peněženky a rysku „F 62“ na horní hranu F, a tečky propíchněte jehlou do kůže. Bez kružidla propíchněte i kroužky na koncích čáry a spojte je tužkou u pravítka. Pro S4 leží proužek lícem nahoru, pro S5 (pravý bok) rubem nahoru.',
        media: [],
      },
      {
        id: 'punch-sew',
        title: 'Děrovat a šít boky',
        body: 'Po lepení G4 počkejte aspoň 1 h. Děrujte zepředu skrz všechny vrstvy na tvrdé desce do vpichů z proužku, vidlička při pohledu na líc horní hranou od sebe, ve třech úsecích podle závorek na proužku: (1) y 8–52 z líce F vícezubou vidličkou. (2) y 56–68 po jednom otvoru: 56 a 60 z líce F, 64 a 68 z líce D2. Dvouzubou vidličku nasaďte krajním zubem do posledního hotového otvoru, druhý zub prorazí jeden nový; zub pokaždé na pevnou vrstvu. Odřezek usně 1,0 mm položte na líc D2 těsně k horní hraně F: vyrovná schod F/D2, aby vidlička stála rovně, a otvory 64 a 68 jdou i skrz něj. Jak ho držet, ověřte na zkušebním kuse. (3) y 72–76 z líce D2. Šijte sedlovým stehem od 76 dolů, konce 2 otvory zpět. Steh 60–64 (silná červená čárka na proužku) zdvojte, zpevňuje ústí karet (jak přesně, ověřte na zkušebním kuse). Nit 0,6 mm odměřte 5 × délka švu + 25–30 cm, šev jde přes tři vrstvy.',
        animationLinks: [
          animationLink('lidBodySides', 'D1'),
          animationLink('lidBodySides', 'D2'),
          animationLink('lidBodySides', 'D3'),
          animationLink('lidBodySides', 'D4'),
          animationLink('lidBodySides', 'E2'),
          animationLink('lidBodySides', 'E4'),
          animationLink('saddleStitch', 'E2'),
          animationLink('threadLength'),
        ],
        media: [],
      },
      {
        id: 'edges',
        title: 'Zarovnat a vyleštit boky',
        animationLinks: [animationLink('edges', 'G3')],
        body: 'Boky zarovnejte nožem na 101,0 mm (D2 přečnívá), spodní rohy nechte hranaté. Boky dokončete jako hrany v lekci 5: vybruste, zkoste z obou líců a vyleštěte jako jeden svazek, i u ohybu dna.',
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
      'Lepení G4 bez zkoušky nanečisto: kontaktní lepidlo po dotyku nejde posunout.',
      'V úseku y 56–68 víc nových otvorů najednou: tady vždy jen jeden.',
      'Čára švu odměřená od přečnívající D2: otvory pak po zarovnání boku leží jen 2,0 mm od hrany.',
    ],
    safety: [
      'Nůž veďte tahem od prstů volné ruky.',
      'Prsty držící vidličku mějte u spodku, palička dopadá na horní konec. Děrujte jen na tvrdé desce.',
      'Kontaktní lepidlo používejte ve větrané místnosti a podle návodu na obalu.',
    ],
    requires: [{ id: 'side-strip', fromLesson: L4, label: 'Proužek otvorů S4/S5 z listu 4' }],
    media: [photo('lw-l9-hero', 'Sešité tělo peněženky zepředu, víčko zatím otevřené')],
  }),

  draft({
    slug: L10,
    title: 'Tvarování závěsu přes obsah a měření k',
    order: 10,
    phaseSlug: 'build',
    estimatedMinutes: 45,
    goal: 'Vytvarovat závěs za mokra přes obsah stavu B a po vyschnutí změřit polohu víčka k.',
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
        body: 'Do kapsy karet dejte 2 staré karty a do oddílu bankovek papír asi 70 × 65 mm, přeložený tak, aby měl asi 0,7 mm (nebo bankovku zabalenou ve fólii). Mince ne. Obsah pod závěsem pak má 3,42 mm (výchozí střih; jinak list 4, „Tvarování závěsu“).',
        animationLinks: [animationLink('lidBends', 'B1')],
        media: [],
      },
      {
        id: 'wet-close',
        title: 'Navlhčete jen závěs a zavřete víčko',
        animationLinks: [animationLink('lidBends', 'B2'), animationLink('lidBends', 'B3')],
        body: 'Houbičkou navlhčete jen pás závěsu. Víčko zavřete přes obsah a jazýček položte na přední stěnu; kopyto ani opěrka nejsou potřeba. Rysky přehybů z lekce 4 ukazují, kde přehyby čeká model, tvar ale dává obsah. Vyšly-li přehyby jinde, zapište kde (poloměr přehybů 1,0 mm je předpoklad, ověří ho zkušební kus).',
        media: [],
        records: [
          {
            kind: 'text',
            id: 'hinge-creases',
            label: 'Kde vyšly přehyby závěsu',
            hint: 'Jen když jinde než u rysek z lekce 4.',
            maxLength: 300,
          },
        ],
      },
      {
        id: 'overnight',
        title: 'Přes noc pod knihou',
        animationLinks: [animationLink('lidBends', 'B4'), animationLink('lidBends', 'B5')],
        body: 'Mezi vlhký závěs a knihu dejte potravinovou fólii a nechte peněženku zavřenou pod lehkou zátěží přes noc (12–24 h, ne u topení).',
        waits: [overnight('Schnutí závěsu pod knihou', 'measure-k')],
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
        body: 'Ve stavech A (prázdná), B a C (6 karet, 3 bankovky, 4 × 50 Kč) změřte výšku y hrany pásu víčka od spodní hrany, zvlášť nad sloupci a nad středem. Měříte-li od horní hrany F, je y výška horní hrany F (rámeček na listu 4) minus naměřená vzdálenost. Spočítejte k = (y_C − y_A) / dělitel z rámečku na listu 4 a zadejte ho ve formuláři listů (odkaz pod krokem, pole k): nahradí k z papírového modelu. Hodnoty, které model čeká, jsou v rámečku na řádku „hrana víčka A / B / C“.',
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['k'],
      },
      {
        id: 'k-too-high',
        title: 'Když vyjde k nad 1,24',
        body: 'Ukazuje-li souhrn pod krokem k nad 1,24, vygenerujte pro finální kus listy znovu jako v lekci 1: zvedne se dno karet a výška. Zkušební kus mezitím dokončete, magnet se umisťuje až na hotovém kuse. Finální kus řežte až z nových listů.',
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['k'],
      },
      {
        id: 'lid-behaviour',
        title: 'Otevřené víčko samo nestojí',
        animationLinks: [animationLink('lidBends', 'B6'), animationLink('lidBends', 'B7')],
        body: 'Po vyschnutí se víčko vrací k zavřené poloze a otevřené samo nestojí. To je v pořádku: drží ho palec ruky, která peněženku drží. Víčko nepřeklápějte na záda – závěs by se ohýbal opačně.',
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
        title:
          'Hrana víčka je změřená ve stavech A, B a C a k je spočítané a zadané ve formuláři „Listy pro vaši kůži“.',
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
    goal: 'Nalepit magnet na hotové peněžence přesně na značku, přikrýt ho podšívkou L1, oříznout špičku a ušít šev S7.',
    materials: [
      'zkušební (hledací) magnet',
      'tužka',
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
        body: 'Vložte obsah stavu B jako v lekci 10 (2 staré karty, papír 0,7 mm nebo bankovku, ne kartu, bez mincí). Zkušebním magnetem najděte po líci F hrany plíšku. Značku magnetu (rámeček na listu 4, výchozí y 11,9) odměřte posuvkou od spodní hrany, označte páskou a po nalepení pásky přeměřte. Musí ležet v okně lepení: ve výchozím střihu 11,73–12,13, pro vaše listy ho ukazuje souhrn pod krokem. Zavřete víčko a značku přeneste ryskami na boky jazýčku.',
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['magnetWindow'],
        records: [
          {
            kind: 'number',
            id: LID_RECORD_IDS.magnetMarkY,
            label: 'Značka magnetu od spodní hrany',
            hint: 'Po nalepení pásky přeměřená. Souhrn nad polem ji porovná s oknem lepení pro vaše listy.',
            unit: 'mm',
            decimals: 2,
          },
        ],
        animationLinks: [animationLink('lidMagnet', 'B1')],
        media: [],
      },
      {
        id: 'magnet-dry-test',
        title: 'Nanečisto: který magnet',
        body: 'Sílu magnetu vyzkoušejte nanečisto (orientačně, rozhodne až zkouška Z-1): magnet s kouskem kozinky přes něj přichyťte tenkou páskou na rub jazýčku na značku, víčko zavřete, zatřeste, otočte dnem vzhůru a otevřete jedním prstem za špičku. Zkuste Ø 8 × 1, 8 × 1,5 a 8 × 2; výchozí je 1,5 mm. Vyberete-li jinou tloušťku, zadejte ji ve formuláři „Listy pro vaši kůži“ (odkaz pod krokem, pole tloušťka magnetu) a vygenerujte listy znovu. Lepte, až když aplikace listy vytvoří.',
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['magnet'],
        animationLinks: [animationLink('lidMagnet', 'B2')],
        media: [],
      },
      {
        id: 'epoxy',
        title: 'Magnet epoxidem',
        body: 'Rub konce jazýčku zdrsněte. Magnet přilepte dvousložkovým epoxidem středem na spojnici rysek značky a na osu jazýčku (uprostřed jeho šířky) a nechte ztuhnout podle návodu (orientačně 30 min, ověřte), ať se při lepení L1 neposune.',
        waits: [
          {
            id: 'set',
            label: 'Ztuhnutí epoxidu pod magnetem',
            minutes: 30,
            basis: 'manufacturer',
            blocksStepId: 'lining',
          },
        ],
        animationLinks: [animationLink('lidMagnet', 'B3'), animationLink('lidMagnet', 'B4')],
        media: [],
      },
      {
        id: 'lining',
        title: 'Podšívka L1 přes magnet',
        body: 'Po ztuhnutí epoxidu přiložte na rub šablonu konce jazýčku křížkem na střed magnetu a svislou čárou na osu jazýčku. Propíchněte oba kroužky rysky L1 a spojte je tužkou. Natřete kontaktním lepidlem rub jazýčku kolem magnetu i L1, nechte zavadnout a L1 přiložte horní hranou na rysku (10 mm nad středem magnetu). Přitlačte prsty nebo převalujte kolíkem. Přes magnet paličkou netlučte – neodym se může odštípnout.',
        waits: [tack('tack', 'Zavadnutí lepidla pod L1', 'manufacturer')],
        animationLinks: [animationLink('lidMagnet', 'B5'), animationLink('lidMagnet', 'B6')],
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
        body: 'Peněženku položte zády na stůl a víčko narovnejte vodorovně jako prodloužení zad (ne zavřené, ne přehnuté přes záda). Pás víčka lehce zatižte knihou mimo magnet; magnet musí být aspoň pár cm od plíšku. Bez zátěže víčko nenechávejte, samo se zavře. Nechte 24 h vytvrdit, teprve pak šijte S7 a zkoušejte držení. Závěs nenavlhčujte (jestli rovná poloha nezmění jeho tvar, ukáže zkouška Z-2).',
        animationLinks: [animationLink('lidMagnet', 'B7')],
        waits: [
          {
            id: 'cure',
            label: 'Vytvrzení magnetu a L1',
            minutes: 24 * 60,
            basis: 'text',
            blocksStepId: 's7',
          },
        ],
        media: [],
      },
      {
        id: 'trim-tip',
        title: 'Ořízněte špičku a boky L1',
        animationLinks: [
          animationLink('lidMagnet', 'B8'),
          animationLink('lidMagnet', 'B9'),
          animationLink('edges', 'G4'),
        ],
        body: 'Magnet s L1 z rubu vystupuje: pod jazýček dejte podložku s otvorem – dva slepené odřezky usně 1,0 mm (nebo odřezek desky 2 mm) proseknuté výsečníkem Ø 10. Magnet leží v otvoru a jazýček naplocho (ověřte na zkušebním kuse). Šablonu přiložte na líc jazýčku čarou přes křížek na rysky značky a svislou čárou na osu jazýčku. Podle obrysu R10 uřízněte nožem špičku 7,0 mm pod značkou, skrz jazýček i L1 najednou, a zároveň seřízněte boky L1 načisto s boky jazýčku. Pak udělejte rysku 2,5 mm od špičky (oranžová čára na šabloně) a brusným papírem na hranolku zbruste klín z líce i z rubu jen mezi ryskou a špičkou, ne nožem. Za ryskou nebruste, magnet nesmí ležet na ztenčeném místě. Konec stačí asi 0,5–0,7 mm, zaoblený.',
        media: [],
      },
      {
        id: 's7',
        title: 'Šev S7 kolem magnetu',
        body: 'Šablonu konce jazýčku přiložte na líc jazýčku podle obrysu špičky a propíchněte jehlou 8 otvorů S7 (červené tečky, U kolem magnetu ke špičce otevřené). Pod jazýček dejte na tvrdou desku podložku s otvorem Ø 10 jako při ořezu špičky. Děrujte z líce vidličkou 4 mm do vpichů: boky dvouzubou částí svisle, horní řadu vodorovně, rohové otvory jedním krajním zubem nasazeným do otvoru řady. Zuby na bocích natočte tak, aby otvory měly stejný sklon jako horní řada (vyzkoušejte na odřezku). Šijte sedlovým stehem, konce 2 otvory zpět. Nakonec hrany jazýčku dokončete jako v lekci 5.',
        animationLinks: [
          animationLink('saddleStitch', 'E2'),
          animationLink('lidMagnet', 'B10'),
          animationLink('lidMagnet', 'B11'),
          animationLink('threadLength'),
          animationLink('edges', 'G4'),
        ],
        media: [photo('lw-l11-s7', 'Šev S7 do U kolem magnetu na líci jazýčku')],
      },
    ],
    checkpoints: [
      {
        slug: 'magnet-on-mark',
        title: 'Magnet je nalepený na značce v okně lepení z rámečku a lepení 24 h vytvrdlo.',
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
      'Dvousložkový epoxid míchejte a používejte podle návodu a bezpečnostních pokynů výrobce na obalu.',
      'Kontaktní lepidlo používejte ve větrané místnosti a podle návodu na obalu.',
      'Nůž veďte tahem od prstů volné ruky.',
      'Prsty držící výsečník nebo vidličku mějte u spodku, palička dopadá na horní konec.',
    ],
    requires: [
      {
        id: 'tongue-template',
        fromLesson: L2,
        label: 'Šablona konce jazýčku z listu 4',
        note: 'ryska L1, ořez špičky a otvory S7',
      },
      { id: 'lining-blank', fromLesson: L4, label: 'Přířez podšívky L1 24 × 22 mm' },
    ],
    media: [photo('lw-l11-hero', 'Jazýček s podšívkou L1 a švem S7, magnet pod podšívkou')],
  }),

  draft({
    slug: L12,
    title: 'Dokončení a zkoušky Z-1 až Z-4',
    order: 12,
    phaseSlug: 'build',
    estimatedMinutes: 60,
    goal: 'Dokončit peněženku a na zkušebním kuse projít povinné zkoušky Z-1 až Z-4, podle kterých se řídí finální kus.',
    materials: [
      'karty, bankovky a mince na stavy A, B a C, 1 Kč na zkoušku retence',
      'papír na upozornění',
      'jen při výměně magnetu: malé nůžky nebo páráček, kousek nebarvené kozinky na novou L1, podložka s otvorem z lekce 11, jehla na propichování',
    ],
    requiredEquipment: [],
    recommendedEquipment: [
      'leather-balm',
      'neodymium-magnet',
      'epoxy-glue',
      'contact-cement',
      'thin-goatskin',
      'utility-knife',
      'sandpaper',
      'round-punches-8-14',
      'harness-needles',
      'waxed-thread',
      'edge-burnisher',
    ],
    prerequisiteLessons: [L11],
    steps: [
      {
        id: 'balm',
        title: 'Konečná úprava',
        body: 'Naneste balzám, hlavně na závěs (snášenlivost ověřte na odřezku). Volitelně udělejte slepou značku na F vlevo dole, mimo jazýček a švy.',
        media: [],
      },
      {
        id: 'user-note',
        title: 'Upozornění pro uživatele',
        body: 'Přiložte k peněžence krátké upozornění: „Karty zasouvej do první štěrbiny u přední stěny, kartu s magnetickým proužkem proužkem k horní hraně (k víčku). Za barevnou hranu patří jen bankovky – karta by tam ležela u magnetu a mohla by přijít o proužek. Při vyndávání bankovek a mincí drž víčko palcem, netlač ho až na záda. Při zavírání přitlač jazýček dole u magnetu, ne uprostřed. Otevřenou peněženku neotáčej dnem vzhůru.“ Riziko pro kartu to jen zmenšuje, nevylučuje.',
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
        body: 'Ve stavech A, B a C víčko zavřete, zatřeste a otočte dnem vzhůru, pak ho otevřete jedním prstem za špičku. Projde, když víčko zůstane zavřené (i proti pružení závěsu) a otevře se jedním prstem. Když drží slabě nebo moc silně, vyměňte magnet za silnější nebo slabší Ø 8 (další krok) a zkuste znovu. Když nepomůže ani to, dejte do finálního kusu plíšek z pozinkovaného plechu 0,8 mm místo 0,5 (rozměr z listu 3 platí, listy se negenerují; peněženka je u magnetu o 0,3 mm tlustší). Plech 0,8 v nákupním plánu není, vyzkoušejte ho v obchodě magnetem. Na zkušebním kuse to vyzkoušet nejde – ověřte to nejlépe dalším zkušebním kusem.',
        media: [],
        records: [
          testResult('z1-result', 'Výsledek Z-1', [
            { value: 'weak', label: 'Drží slabě' },
            { value: 'strong', label: 'Drží moc silně' },
          ]),
        ],
      },
      {
        id: 'magnet-swap',
        title: 'Výměna magnetu (jen když Z-1 neprojde)',
        body: 'Postup je neověřený, zkuste ho napřed na zkušebním kuse. Plíšek vyměnit nejde, magnet ano. (1) Stehy S7 na líci přestřihněte malými nůžkami nebo páráčkem (kůži nenařízněte) a nit vytáhněte; otvory použijete znovu. (2) L1 pomalu odlepte od horní hrany ke špičce; počítejte s novou L1 z nebarvené kozinky (přířez z listu 3), stará se nejspíš roztrhne. (3) Magnet sundejte bez tlučení a bez páčení ostrou hranou, neodym je křehký. Zbytky lepidla opatrně obruste a rub znovu zdrsněte. (4) Nový magnet Ø 8: silnější (vyšší třída nebo tlustší), nebo slabší (nižší třída nebo tenčí); třídu, tloušťku a sílu ověřte u prodejce. Má-li jinou tloušťku než 1,5 mm, před lepením ji zadejte ve formuláři „Listy pro vaši kůži“ (odkaz pod krokem) a lepte, až když aplikace listy vytvoří. (5) Magnet přilepte epoxidem na stejné místo, nechte ztuhnout a přilepte novou L1 kontaktním lepidlem s přesahem (přes magnet netlučte). L1 ořízněte podle hran jazýčku (jazýček znovu neřežte) a znovu zbruste klín jen mezi ryskou a špičkou (lekce 11). (6) Po 24 h propíchněte z líce jehlou starými otvory S7 i skrz L1 a ušijte S7 znovu; u tlustšího magnetu zesilte podložku o rozdíl tloušťky. Hrany jazýčku dokončete jako v lekci 5. Pak zopakujte Z-1 a po několika dnech používání prohlédněte šev S7.',
        recalls: [{ fieldId: 'z1-result', label: 'Výsledek Z-1' }],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['magnet'],
        waits: [
          {
            id: 'set',
            label: 'Ztuhnutí epoxidu pod novým magnetem',
            minutes: 30,
            basis: 'manufacturer',
          },
          {
            id: 'cure',
            label: 'Vytvrzení nového magnetu a L1',
            minutes: 24 * 60,
            basis: 'text',
          },
        ],
        animationLinks: [
          animationLink('lidMagnet', 'vymena'),
          animationLink('saddleStitch', 'E2'),
          animationLink('threadLength'),
          animationLink('edges', 'G4'),
        ],
        media: [],
      },
      {
        id: 'z2',
        title: 'Z-2 Závěs',
        body: 'Otevřené víčko musí jít palcem držící ruky udržet tak, že bankovka jde okénkem vysunout a minci vzít; samo stát nemusí. Po několika dnech používání prohlédněte líc i rub pásu závěsu. Výsledek zapište níže: formulář i souhrn pod krokem upozorní, když záloha ve formuláři výsledku neodpovídá. Když jsou v závěsu praskliny: finální kus v záloze A (P1 z usně 0,8) – useň po dodání změřte, ve formuláři listů (odkaz pod krokem) zaškrtněte zálohu A, zadejte změřenou tloušťku a listy vygenerujte znovu. Když nestačí ani ta: záloha B2 – vraťte se k P1 z usně 1,0 a ztenčete jen pás závěsu na 0,6 mm (lekce 5, useň 0,8 neztenčujte). Ve formuláři zrušte zálohu A a zaškrtněte B2 („--skive-hinge 0.6“); byla-li záloha A už kvůli V12, zaškrtněte i B1. Palec víčko pohodlně neudrží: ve finálním kuse můžete posunout okénko bankovek mimo stopu jazýčku (např. x 27–42, stále v pásu x 27–74) a okénka mincí zkrátit shora, aby šlo víčko otevřít víc dozadu – ověřte na papírovém modelu (P0-8).',
        media: [],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['variant'],
        records: [
          testResult(LID_RECORD_IDS.z2Result, 'Výsledek Z-2', [
            { value: LID_Z2_RESULTS.cracks, label: 'Praskliny v závěsu: finální kus v záloze A' },
            {
              value: LID_Z2_RESULTS.cracksAgain,
              label: 'Praskliny i v záloze A: záloha B2 (P1 1,0)',
            },
            {
              value: LID_Z2_RESULTS.thumb,
              label: 'Palec víčko neudrží: posunout okénko bankovek',
            },
          ]),
        ],
      },
      {
        id: 'z3',
        title: 'Z-3 Výřez pro palec',
        body: 'Zopakujte v kůži gesta z papírového modelu: vysunout přední kartu, zadní po vyndání předních, zavírání ve stavu A, s 1 kartou a s jazýčkem posunutým o 3 mm. Po dnech používání zkontrolujte, jestli se horní hrana F u výřezu neodklápí a na víčku nevzniká důlek. Když ano, výřez upravte (zaoblete, zkoste rub dna výřezu, zužte), nebo ho ve finálním kusu vynechte.',
        media: [],
        records: [
          testResult('z3-result', 'Výsledek Z-3', [
            { value: 'adjust', label: 'Výřez upravit' },
            { value: 'omit', label: 'Ve finálním kusu vynechat' },
          ]),
        ],
      },
      {
        id: 'z4',
        title: 'Z-4 Retence',
        body: 'Stav B zavřete a 30× prudce zatřeste dnem vzhůru. Pak totéž s 1 Kč za D2 ve stavu A i B a s 0 kartami a 1 × 5000 Kč. Projde, když se nic nepřesune do jiného oddílu ani nevypadne. Bankovka přeleze D1: ve finálním kuse zvyšte D1 o 0,5 mm (až na strop, D1 dosedne na závěs). Mince přeleze D2: ve finálním kuse prodlužte D2 o 0,5 mm nahoru, aby dosedala na závěs. Listy to samy nespočítají – ověřte na finálním kuse. Jiný přesun nebo vypadnutí: ověřte.',
        media: [],
        records: [
          testResult('z4-result', 'Výsledek Z-4', [
            { value: 'bill-over-d1', label: 'Bankovka přelezla D1: D1 o 0,5 mm výš' },
            { value: 'coin-over-d2', label: 'Mince přelezla D2: D2 o 0,5 mm výš' },
            { value: 'both', label: 'Obojí: D1 i D2 o 0,5 mm výš' },
            { value: 'fail', label: 'Jiný přesun nebo vypadnutí (ověřte)' },
          ]),
        ],
      },
      {
        id: 'final-piece',
        title: 'Finální kus',
        body: 'Finální kus postavte stejným postupem s tím, co na zkušebním kuse fungovalo (vyměněný magnet, jiná varianta, upravený výřez, D1 nebo D2 o 0,5 mm výš, posunuté okénko bankovek). Když se varianta změnila až po zkušebním kuse, je v ní finální kus neověřený – nejlépe postavte další zkušební kus; useň na další přířez P1 110 × 240 mm nákupní plán nepočítá. V záloze A useň 0,8 změřte, zadejte ve formuláři listů a listy vygenerujte znovu. Byly-li listy zkušebního kusu mimo ověřené meze (lekce 1), řežte finální kus jen z listů v mezích. Na finálním kuse stačí zkontrolovat, že víčko drží, otevře se jedním prstem a otevřené jde palcem udržet.',
        media: [],
        recalls: [
          { fieldId: 'z1-result', label: 'Z-1 magnet' },
          { fieldId: LID_RECORD_IDS.z2Result, label: 'Z-2 závěs' },
          { fieldId: 'z3-result', label: 'Z-3 výřez pro palec' },
          { fieldId: 'z4-result', label: 'Z-4 retence' },
        ],
        appLinks: [EDIT_SHEETS],
        lidSheetRecalls: ['variant', 'sheets', 'magnet'],
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
    safety: [
      'Jen při výměně magnetu: magnet sundávejte bez tlučení a páčení, neodym se může odštípnout.',
      'Dvousložkový epoxid míchejte a používejte podle návodu a bezpečnostních pokynů výrobce na obalu.',
      'Kontaktní lepidlo používejte ve větrané místnosti a podle návodu na obalu.',
      'Nůž veďte tahem od prstů volné ruky.',
    ],
    media: [
      photo(
        'lw-l12-hero',
        'Hotová peněženka Víčko zavřená, jazýček s magnetem dole na přední stěně',
      ),
    ],
  }),
];

/**
 * „Postup v kostce“: celá stavba v krátkých bodech, každý s odkazem na krok lekce. Jen výtah
 * z lekcí výše, nic nového; počty výtisků bod 1 bere z `prints` lekcí 1, 2 a 4.
 */
const overview: ProjectOverview = {
  intro:
    'Celá stavba v krátkých bodech. Podrobnosti, čísla a značky jsou v lekci, na kterou bod odkazuje.',
  sections: [
    {
      title: 'Příprava',
      note: 'Papírový model a zkouška ohybu na odřezku. Díly z kůže zatím neřežte.',
      points: [
        {
          id: 'prints',
          lessonSlug: L1,
          stepId: 'sheets-rule',
          printsFrom: [L1, L2, L4],
          text: 'Listy 1–4 tiskněte až v lekci, která je chce: P0 a V12 je mohou změnit. A4 na výšku, 100 %, úsečka musí měřit 50 mm. Výpis platí pro model a zkušební kus, na finální kus vytiskněte listy 1 a 3 znovu.',
        },
        {
          id: 'measure',
          lessonSlug: L1,
          stepId: 'measure',
          text: 'Na kaštanu obkreslete dva přířezy P1 110 × 240 mm. Posuvkou změřte P1 (kaštan), D1 a L1 (nebarvená kozinka) a D2 (čokoládová kozinka) tam, odkud díly vyříznete, a zadejte je ve formuláři „Listy pro vaši kůži“.',
        },
        {
          id: 'sheets',
          lessonSlug: L1,
          stepId: 'print-check',
          text: 'Vygenerujte listy a vytiskněte listy 1–4 (1–3 na čtvrtku). Kóta P1 na listu 1 musí sedět s rámečkem na listu 4.',
        },
        {
          id: 'spacer',
          lessonSlug: L1,
          stepId: 'spacer',
          text: 'Ze 4 starých karet slepte páskou vložku dna (aspoň 111 × 25 × 1,5 mm).',
        },
        {
          id: 'paper-model',
          lessonSlug: L2,
          stepId: 'glue-model',
          text: 'Ze čtvrtky vystřihněte podle listů 1–3 P1, D1 a D2 a slepte papírový model P0 páskou.',
        },
        {
          id: 'p0-test',
          lessonSlug: L2,
          stepId: 'record',
          text: 'Vyzkoušejte model s 6 kartami, bankovkami napůl a 4 mincemi. Co se liší, zadejte do formuláře a listy vygenerujte znovu.',
        },
        {
          id: 'templates',
          lessonSlug: L2,
          stepId: 'templates',
          text: 'List 4 a list 1 nalepte na tvrdý papír. Vyřízněte šablonu konce jazýčku a šablonu výřezu pro palec.',
        },
        {
          id: 'v12',
          lessonSlug: L3,
          stepId: 'crease-and-mark',
          text: 'Zkouška ohybu V12: odřezek kaštanu orýhujte, navlhčete, přehněte přes vložku a nechte přes noc. Prohlédněte líc, změřte polohu rýhy a zvolte variantu střihu.',
        },
      ],
    },
    {
      title: 'Zkušební kus',
      note: 'Lekce 4–12 nejdřív celé na zkušebním kuse. Druhý přířez P1, zbytek kozinek a plech nechte celé.',
      points: [
        {
          id: 'cut-prints',
          lessonSlug: L4,
          stepId: 'valid-sheets',
          text: 'Vytiskněte listy pro řez (bod 1, lekce 4). Druhý výtisk listů 1 a 3 a list 4 nalepte na tvrdý papír a vyřízněte jako šablony.',
        },
        {
          id: 'tape-sheet-1',
          lessonSlug: L4,
          stepId: 'tape-sheet-1',
          text: 'První výtisk listu 1 vystřihněte s okrajem 1–2 cm. Položte ho na líc kaštanu a přilepte maskovací páskou mimo čáru řezu.',
        },
        {
          id: 'prick-p1',
          lessonSlug: L4,
          stepId: 'prick-p1',
          text: 'Jehlou propíchněte skrz papír všechny kroužky a křížky v kroužku.',
          later: 'červené tečky švů S1–S3 a S6 (lekce 6 a 8).',
        },
        {
          id: 'cut-p1',
          lessonSlug: L4,
          stepId: 'cut-p1',
          text: 'Vyřízněte P1 nožem skrz papír po plné čáře. List sejměte a zkontrolujte vpichy.',
          later:
            'čárkované tvary: okénka mincí a výřez pro palec (lekce 5), okénko bankovek (lekce 6), špička jazýčku (lekce 11).',
        },
        {
          id: 'cut-parts',
          lessonSlug: L4,
          stepId: 'cut-parts',
          text: 'Díly z prvního výtisku listu 3 přilepte páskou na rub kozinky: D1 a přířez L1 z nebarvené kozinky a D2 z čokoládové. Propíchněte kroužky na koncích osy D1 a D2 a řežte skrz papír.',
          later: 'okénko na D2 (lekce 6).',
        },
        {
          id: 'plate',
          lessonSlug: L4,
          stepId: 'plate',
          text: 'Plíšek K2 vyřízněte z plechu 0,5 mm podle šablony z listu 4. Rohy zabruste, hrany přelakujte.',
        },
        {
          id: 'mark-back',
          lessonSlug: L4,
          stepId: 'mark-back',
          text: 'List 2 nalepte na tvrdý papír, vyřízněte a přiložte na rub P1. Propíchněte kroužky a vpichy spojte tužkou: ohyb dna, hrana vložky, závěs, plochy lepení G1–G4, poloha D1 a D2.',
          later: 'otvory švů – z líce přes šablonu z listu 1 (lekce 6 a 8).',
        },
        {
          id: 'crease-windows',
          lessonSlug: L5,
          stepId: 'crease',
          text: 'Vytlačte rýhu ohybu dna. Vysekněte okénka mincí a výřez pro palec a dokončete hrany.',
        },
        {
          id: 'd2-seams',
          lessonSlug: L6,
          stepId: 'g3',
          text: 'D2 přilepte na rub zad jen v pásech G3. Prosekněte okénko bankovek skrz obě vrstvy a ušijte S1–S3.',
        },
        {
          id: 'bottom-fold',
          lessonSlug: L7,
          stepId: 'wet',
          text: 'Dno ohněte za mokra přes vložku a nechte přes noc stažené mezi prkénky.',
        },
        {
          id: 'plate-d1',
          lessonSlug: L8,
          stepId: 'g1',
          text: 'Na rub F přilepte plíšek (G1) a přes něj D1 (G2, G2b). Podle šablony z listu 1 ušijte S6.',
        },
        {
          id: 'side-seams',
          lessonSlug: L9,
          stepId: 'dry-fit',
          text: 'Slepte boky (G4). Podle proužku z listu 4 děrujte a ušijte S4 a S5, boky zarovnejte na 101 mm.',
        },
        {
          id: 'hinge',
          lessonSlug: L10,
          stepId: 'contents-b',
          text: 'Navlhčete závěs, zavřete víčko přes obsah stavu B a nechte přes noc pod knihou. Pak změřte k a zadejte ho do formuláře.',
        },
        {
          id: 'magnet',
          lessonSlug: L11,
          stepId: 'find-plate',
          text: 'Najděte plíšek a vyznačte značku magnetu. Na rub jazýčku přilepte magnet a přes něj L1. Po 24 h ořízněte špičku a ušijte S7.',
        },
        {
          id: 'tests',
          lessonSlug: L12,
          stepId: 'balm',
          text: 'Naneste balzám. Projděte zkoušky Z-1 až Z-4 (Z-2 a Z-3 i po dnech používání) a výsledky zapište.',
        },
      ],
    },
    {
      title: 'Finální kus',
      points: [
        {
          id: 'final-piece',
          lessonSlug: L12,
          stepId: 'final-piece',
          text: 'Lekce 4–12 zopakujte na druhém přířezu P1 s tím, co na zkušebním kuse fungovalo. Řežte jen z listů, které platí po zkušebním kuse. Změnila-li se varianta, postavte raději další zkušební kus.',
        },
      ],
    },
  ],
};

export const lidWalletProject: ProjectDefinition = {
  slug: PROJECT_SLUG,
  code: '03',
  title: 'Peněženka Víčko',
  summary:
    'Peněženka do zadní kapsy 101 × 83,5 mm: karty, bankovky napůl a dva sloupce mincí pod víčkem s magnetem.',
  description:
    'Třetí projekt: peněženka z jednoho pásu třísločiněné usně 1,0 mm. Dole je přeložený za mokra, vzadu vede nahoru, přes horní hranu přechází v závěs a vpředu končí víčkem s jazýčkem. Uvnitř jsou dvě tenké přepážky: vpředu karty, uprostřed bankovky napůl, vzadu dva sloupce mincí s okénky. Víčko drží magnet v jazýčku, který dosedá na plíšek v přední stěně. Návrh je neověřený: nejdřív papírový model, zkouška ohybu a zkušební kus, až pak finální kus. Časy lekcí jsou hrubý odhad.',
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
        'Nebarvená kozinka nejvýš 0,9 mm, celý list (2 × D1 93 × 79,5, 3 × L1 24 × 22), a čokoládová 5 dm² (2 × D2 103 × 64); přepážky nejvýš 0,92 mm (při P1 1,0, u tlustší P1 méně), po dodání změřit.',
    },
    {
      equipmentSlug: 'veg-tan-leather-0-8',
      priority: 'later',
      reason:
        'Jen záloha A, když ve zkoušce ohybu V12 popraská líc usně 1,0: P1 zkušebního i finálního kusu a odřezek na zopakování V12.',
      specification:
        'Pevná třísločiněná useň 0,8 mm jako u usně 1,0 v jednom kuse 20 × 50 cm (2 × přířez P1 110 × 240 mm za sebou podél delší strany, odřezek 30 × 40 mm na V12 z pruhu vedle nich); kupuje se až podle V12.',
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
      specification: 'Tupé nebo poloostré sedlářské jehly, 2 ks.',
    },
    {
      equipmentSlug: 'waxed-thread',
      priority: 'required',
      reason: 'Švy S1–S6 a šev S7 kolem magnetu.',
      specification:
        'Voskovaná nit 0,6 mm (podle návrhu peněženky; že projde otvory vidliček 4 mm, ověřit na odřezku); délka orientačně 4 × délka švu + 25–30 cm rezervy (2 × 15 cm na konce), u bočních švů S4 a S5 (v úseku y 20–60 tři vrstvy F + D2 + B) podle návodu „Jak odměřit nit“ 5 × délka švu.',
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
        'Zrnitost 120 a jemnější (180/240 z projektu 02; na hrany 220–400 jako u projektu 01), 80 jen na zálohu B; na rovném hranolku nebo destičce.',
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
      specification: 'Tokonole a leštítko (nebo dřevěný kolík v aku vrtačce na nízké otáčky).',
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
      reason: 'Zkosení viditelných hran, pokud ho máte; jinak brusným papírem na hranolku.',
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
        note: 'Šablona konce jazýčku s magnetem a otvory S7, šablony okének a plíšku, proužek otvorů S4/S5, vložka dna aspoň 111 × 25 mm ze starých karet, tvarování závěsu přes obsah a rámeček „Čísla pro postup“, ze kterého se berou čísla pro všechny kroky.',
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
      'Předem připravené jsou jen listy výchozího střihu. Koupené kozinky mají skoro vždy jinou tloušťku než 0,6 mm a pak se mění skoro všechna čísla, proto si níže v části „Listy pro vaši kůži“ vygenerujte listy pro změřenou kůži. Aplikace je spočítá stejně jako generátor v repozitáři („pnpm pattern:wallet-lid --divider <větší z D1 a D2> --lining <L1>“, při P1 odlišné od 1,0 o 0,05 mm a víc navíc „--p1 <změřená P1>“). Zálohy podle zkoušky ohybu V12 a zkušebního kusu: A = P1 z usně 0,8 („--p1 0.8“), B1 = ztenčený ohyb dna („--skive-fold 0.6“), B2 = ztenčený závěs („--skive-hinge 0.6“). Přepážky nad 0,92 mm (při P1 1,0; u tlustší P1 méně, hranici ukáže formulář) střih odmítne. Výsledky papírového modelu P0 (k, zvednutí na klínu, bankovky) a jinou tloušťku magnetu zadejte v témže formuláři pod „Výsledky P0 a jiný magnet“ (lekce 2, 10 a 11).',
  },
  shoppingPlan: {
    title:
      'Sestava: kůže ze dvou obchodů (hnědá třísločiněná useň pull-up 0,8–1,2 mm a čokoládová kozinka 0,7–0,9 mm ze Šijeme z kůže, nebarvená kozinka 0,6–0,8 mm z Lederversand Berlin), listy vygenerované v aplikaci pro změřenou tloušťku, zkušební i finální kus, magnet Ø 8 × 1,5, plíšek 0,5 mm',
    lines: [
      {
        equipmentSlug: 'veg-tan-leather-1mm',
        url: 'https://www.sijemezkuze.cz/pull-up-crazy-horse-trislocineny-0-8-1-2-mm-hnedy-top-kvalita-od-5-dm2-nebo-cely-kus-za-zvyhodnenou-cenu-p4777-8033',
        quantity: 10,
        purpose:
          '10 dm² v jednom kuse 20 × 50 cm: P1 zkušebního i finálního kusu, odřezky na V12 a podložku S7; tloušťku po dodání změřit (0,8–1,2 mm)',
      },
      {
        equipmentSlug: 'thin-goatskin',
        url: 'https://www.lederversand-berlin.de/Ziegennappa-z125',
        variant: 'list 0,55 m²',
        quantity: 1,
        purpose:
          'celý list (jinak se neprodává): 2 × D1 a 3 × L1, odřezek na zkoušku barvy; levnější 2. jakost #z125b v katalogu',
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
          'Jen pokud ho máte (v projektech 01 a 02 je volitelný); jinak hrany zaoblíte brusným papírem na hranolku.',
      },
    ],
    alsoNeeded: [
      'lepicí páska (vložka dna, papírový model)',
      'bezbarvý lak na nehty na hrany plíšku (lekce 4)',
      'tvrdší papír nebo čtvrtka na papírový model a šablony (lekce 2 a 4)',
      'dřevěný kolík Ø 8 mm a aku vrtačka na broušení a leštění vydutých hran (lekce 5)',
      'potravinová fólie, houbička a 2 hladká prkénka (lekce 3, 7 a 10)',
      '6 starých karet (4 na vložku dna, 2 na tvarování závěsu), párátka, jehla na propichování',
      'tupý hrot na rýhu, třeba vypsaná propiska (lekce 3 a 5)',
      'kniha na zatížení a hladký kolík na převalování L1 (lekce 10 a 11)',
      'lupa nebo mobil s makrem na prohlídku líce (lekce 3, volitelně)',
    ],
  },
  glossary: lidWalletGlossary,
  overview,
  media: [
    photo('lid-wallet-hero', 'Hotová peněženka Víčko zavřená, jazýček s magnetem na přední stěně'),
  ],
  contentVersion: 1,
  reviewStatus: 'draft',
};

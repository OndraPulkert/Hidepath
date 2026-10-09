import { animationLink } from '@/content/animations';
import { illustration, illustrationCaption } from '@/content/projects/belt/illustrations';
import { BELT_PLATE_CHECK, BELT_PLATE_CHECK_ID } from '@/content/projects/belt/record-ids';
import {
  type LessonDefinition,
  type LessonPrint,
  type MediaSlot,
  type PhaseDefinition,
  type ProjectDefinition,
  type ProjectOverview,
  type StepRecall,
} from '@/content/schema';

/**
 * Projekt 04 – Pásek. Pásek je parametrický: šířku (= přezka), tloušťku, obvod, konec a barvu
 * zadává uživatel jen na stránce „Váš pásek“ (`browserGenerator: 'belt-config'`, výpočet
 * `src/lib/patterns/belt-config.ts`) a uloží je jako pásek. Lekce parametry nezapisují: hodnoty
 * aktivního pásku ukazují přes `beltRecalls`, do zápisníku jdou jen výsledky zkoušek. Čísla
 * pro 40 × 3,5 mm, hrot a 5 dírek dávají jen jako příklad („např.“);
 * `project.test.ts` hlídá, že příklady odpovídají modelu. Postup je z docs/zadani/opasek-postup.md,
 * meze z docs/zadani/opasek-parametry.md. Nikdo pásek podle postupu zatím nepostavil: obsah je
 * NÁVRH (draft) a co podklady neověřují, je v textu „ověřte na odřezku“.
 */

export const PROJECT_SLUG = 'belt';

export const phases: readonly PhaseDefinition[] = [
  { slug: 'enroll', code: '01', name: 'Výběr projektu', kind: 'enrollment' },
  { slug: 'equipment', code: '02', name: 'Vybavení', kind: 'equipment' },
  { slug: 'prepare', code: '03', name: 'Míry a trénink', kind: 'lessons' },
  { slug: 'build', code: '04', name: 'Stavba pásku', kind: 'lessons' },
  { slug: 'review', code: '05', name: 'Hodnocení', kind: 'completion' },
];

const draft = <T extends Omit<LessonDefinition, 'reviewStatus'>>(l: T): LessonDefinition => ({
  ...l,
  reviewStatus: 'draft',
});

const photo = (id: string, caption: string): MediaSlot => ({
  id,
  kind: 'photo',
  caption,
  status: 'planned',
});

/** Kde uživatel najde svá čísla (stránka „Váš pásek“, `routes.beltConfig`). */
const TABLE = 'tabulka „Váš pásek“';
/** Tvar pro „v …“. */
const IN_TABLE = 'v tabulce „Váš pásek“';

/** Příklad délky poutka pro 40 × 3,5 mm (tabulka „Váš pásek“; `project.test.ts` hlídá model). */
const KEEPER_EXAMPLE_MM = 120;

/** Délka poutka změřená papírovým proužkem (lekce 4). */
const KEEPER_LENGTH_ID = 'belt-keeper-length';

/** Obvod změřený na pásku při zkoušce na těle (lekce 5). */
const FIT_WAIST_ID = 'belt-fit-waist';

/** Barva na hrany vyzkoušená na odřezku (lekce 2, jen barevný pásek). */
const EDGE_PAINT_COATS_ID = 'edge-paint-coats';
const EDGE_PAINT_DRY_ID = 'edge-paint-dry-minutes';

/** Schnutí vrstvy barvy na hrany: CraftPoint u Fiebing's Edge Kote uvádí druhou vrstvu asi po 15 min. */
const edgePaintWait = (fromNotebook: boolean) => ({
  id: 'edge-paint-dry',
  label: 'Schnutí barvy na hrany',
  minutes: 15,
  basis: 'manufacturer' as const,
  ...(fromNotebook ? { initialFromField: EDGE_PAINT_DRY_ID } : {}),
});

const edgePaintRecalls: StepRecall[] = [
  { fieldId: EDGE_PAINT_COATS_ID, label: 'Vrstvy barvy na hrany (lekce 2)' },
  { fieldId: EDGE_PAINT_DRY_ID, label: 'Schnutí barvy na hrany (lekce 2)' },
];

/** Podmínka tisku listů: destička pro tuto sestavu nejde. */
const SHEETS_CONDITION =
  'tabulka „Váš pásek“ ukazuje u řady destičky, kterou list nahrazuje, „ne“, nebo destička v lekci 1 neprošla kontrolou';

/** Odkaz pod krokem na stránku „Váš pásek“. */
const YOUR_BELT = { to: 'belt-config', label: 'Váš pásek' } as const;

/** List střihu pásku (id podle `BELT_SHEET_IDS`; vygenerované listy mají stejný základ). */
const sheet = (sheetId: 'prezka' | 'spicka', purpose: string): LessonPrint => ({
  source: 'pattern-sheets',
  sheetId,
  copies: 1,
  purpose,
  paper: 'obyčejný papír A4, 100 %',
  condition: SHEETS_CONDITION,
});

const KNIFE = 'Nůž veďte tahem od prstů volné ruky.';
const PUNCH =
  'Prsty držící výsečník mějte u spodku, palička dopadá na horní konec. Děrujte jen na tvrdé desce.';

const L1 = '01-design-and-measure';
const L2 = '02-scrap-training';
const L3 = '03-long-edges';
const L4 = '04-buckle-end';
const L5 = '05-fit-and-middle-hole';
const L6 = '06-holes-and-tip';

export const lessons: readonly LessonDefinition[] = [
  draft({
    slug: L1,
    title: 'Návrh pásku a míry',
    order: 1,
    phaseSlug: 'prepare',
    estimatedMinutes: 60,
    goal: 'Změřit obvod, vybrat šířku, konec a barvu a uložit je ve „Váš pásek“, objednat podle souhrnu „Koupit“, po dodání změřit pás a trn a zkontrolovat destičku.',
    materials: [
      'pásek, který nosíte, nebo krejčovský metr a kalhoty, ve kterých budete pásek nosit',
      'destička MK Plexi',
    ],
    requiredEquipment: ['digital-caliper'],
    recommendedEquipment: ['steel-ruler'],
    prerequisiteLessons: [],
    steps: [
      {
        id: 'waist',
        title: 'Změřte obvod',
        body: 'Obvod tu není obvod pasu z krejčovské tabulky. Je to délka od ohybu u přezky k dírce, kterou nosíte. Máte pásek, který sedí: změřte ho od ohybu u přezky (ne od konce trnu) k používané dírce. Nemáte: provlékněte krejčovský metr poutky kalhot, ve kterých pásek nosíte, utáhněte na pohodlí a odečtěte. Je to tatáž míra. Obvod zadejte ve „Váš pásek“ (odkaz pod krokem) a zvolte, jak jste měřili.',
        appLinks: [{ to: 'belt-config', label: 'Začněte tady: Váš pásek' }],
        media: [
          {
            id: 'ilustrace-obvod-na-pasku-l1',
            kind: 'illustration',
            caption: illustrationCaption.obvodNaPasku,
            status: 'available',
            src: illustration.obvodNaPasku,
          },
          {
            id: 'ilustrace-obvod-metrem-l1',
            kind: 'illustration',
            caption: illustrationCaption.obvodMetrem,
            status: 'available',
            src: illustration.obvodMetrem,
          },
          photo('belt-l1-waist', 'Metr na pásku od ohybu u přezky k používané dírce'),
        ],
      },
      {
        id: 'width-and-tip',
        title: 'Vyberte šířku, konec a barvu',
        body: 'Šířka pásu = vnitřní světlost přezky: přezka 40 mm, pás 40 mm. Aplikace počítá 28–45 mm. Jednotrnovou přezku s ověřeným typem trnu má katalog pro 30, 35 a 40 mm; 45 mm má jen Andexnite. Konec vyberte: hrot, nebo zaoblený. Destička má zaoblený konec jen pro 30 a 40 mm, pro jiné šířky se konec tiskne na list 2. Barvu vyberte: přírodní pás natřete balzámem, barevný pás bývá na řezu světlý a hranu obarvíte barvou na hrany (lekce 2, 3, 4 a 6). Šířku, konec a barvu zvolte ve „Váš pásek“ (odkaz pod krokem).',
        appLinks: [YOUR_BELT],
        animationLinks: [
          animationLink('beltWidthTip', 'A1'),
          animationLink('beltWidthTip', 'B1'),
          animationLink('beltWidthTip', 'C1'),
          animationLink('beltWidthTip', 'D1'),
        ],
        media: [],
      },
      {
        id: 'your-belt',
        title: 'Uložte „Váš pásek“',
        body: `Ve „Váš pásek“ (odkaz pod krokem) zkontrolujte obvod, šířku, konec a barvu. Tloušťku zatím nechte 3,5 mm, změříte ji po dodání. Pásek pojmenujte a uložte do „Moje pásky“. Uložený pásek je aktivní: podle něj počítají všechny lekce, „Připravte si“ i nákup. Hodnoty pro 40 × 3,5 mm v lekcích jsou jen příklad.`,
        appLinks: [YOUR_BELT],
        media: [],
        beltRecalls: ['waist', 'width', 'tip', 'color'],
      },
      {
        id: 'order',
        title: 'Objednejte podle souhrnu „Koupit“',
        body: `Nahoře ve „Váš pásek“ (odkaz pod krokem) je souhrn „Koupit“: řemen, délka, kterou objednat, přezka, šrouby, výsečníky a doporučený obchod. „Co koupit“ v Nákupech (odkaz pod krokem) počítá s týmž páskem. Pás musí mít aspoň nejkratší délku: pás 130 cm stačí do obvodu 106,5 cm (5 dírek po 25 mm). Chcete-li v lekci 2 trénovat na odřezku téhož pásu, zaškrtněte „Trénink na odřezku téhož řemene“ a pásek znovu uložte: pás pak musí mít aspoň nejkratší délku + 15 cm. Jinak si připravte samostatný odřezek třísločiněné kůže podobné tloušťky. K pásu napište do poznámky „prosím blíž k 3,5 mm“. Nýt 10/6 sedí jen na pás 3,5–3,75 mm: když pás přijde jiný, nýt podle změřené tloušťky dokoupíte.`,
        appLinks: [
          { to: 'belt-config', label: 'Váš pásek: Koupit' },
          { to: 'shopping', label: 'Co koupit' },
        ],
        media: [],
        beltRecalls: ['strapLength'],
      },
      {
        id: 'measure-strap',
        title: 'Po dodání změřte pás a trn',
        body: 'Posuvkou změřte tloušťku pásu na řezu na několika místech. Průměr měření zadejte ve „Váš pásek“ (odkaz pod krokem) tak, jak vyšel (např. 3,6 mm): dřík nýtu se počítá z přesné hodnoty. Pak změřte trn přezky u kořene a zadejte ho pod „Dírky (pokročilé)“. Ø dírek se vyplní samo: trn + 0,5 mm, nejméně 4,5 mm; u přezky 40 mm vychází 4,5 nebo 5 mm. Výsečníky jsou 4,5–6 mm, trn tedy nejvýš 5,5 mm. Pásek uložte.',
        appLinks: [YOUR_BELT],
        animationLinks: [
          animationLink('caliper', 'A1'),
          animationLink('caliper', 'B1'),
          animationLink('caliper', 'D1'),
        ],
        media: [photo('belt-l1-thickness', 'Posuvka měří tloušťku pásu na řezu')],
      },
      {
        id: 'check-numbers',
        title: 'Zkontrolujte nýt a výsečník',
        body: `Pod krokem je, co ukazuje aktivní pásek. Šrouby ukážou potřebný dřík (např. pro 3,5 mm dřík 5,5–6,0 mm, tedy 10/6). Když objednaný nýt nesedí, objednejte jiný. Výsečník na dírky vyberte podle Ø dírek. Podrobnosti jsou ve „Váš pásek“ (odkaz pod krokem).`,
        appLinks: [YOUR_BELT],
        media: [],
        beltRecalls: ['thickness', 'holeDiameter', 'rivet'],
      },
      {
        id: 'plate-check',
        title: 'Zkontrolujte destičku',
        body: 'Měřte ocelovým pravítkem nebo posuvkou od levé krátké hrany. Obrys 215 × 184 mm (± 0,5 mm), zkosený roh vlevo nahoře. Kóta 50 mm měří 50 mm. Čísla řad a linek nejsou zrcadlená. Pravítko u horní hrany: nula na levé hraně, čitelné do 145 mm (podle něj měříte poutko). Ve všech třech řadách jsou vodicí linky 30 / 35 / 40 / 45 s čísly a příčná stupnice po 1 mm. Řada 3: 4 otvory v jedné přímce na 16,8 / 64,5 / 115,5 / 163,2 mm, ovál 77,5–102,5 mm, 2 značky ohybu na 90 mm. Řady 1 a 2: otvory na 10 / 35 / 60 / 85 / 110 mm, nad a pod prostředním (60 mm) dva křížky. Řada 1: vrchol výřezu hrotu na 204,3 mm. Řada 2: vrchol oblouku 40 na 204,3 mm, oblouku 30 na 199,3 mm, konec každého oblouku leží na lince své šířky; oba sloty jsou průchozí a žebro mezi nimi je celé. Šídlo projde všemi otvory Ø 2 mm. Odchylku vyfoťte s měřidlem, napište řezárně a destičku zatím nepoužívejte.',
        media: [photo('belt-l1-plate', 'Destička na stole, ocelové pravítko u řady 3')],
        records: [
          {
            kind: 'choice',
            id: BELT_PLATE_CHECK_ID,
            label: 'Kontrola destičky',
            options: [
              { value: BELT_PLATE_CHECK.ok, label: 'Sedí' },
              { value: BELT_PLATE_CHECK.deviation, label: 'Odchylka – nepoužívat' },
            ],
          },
        ],
      },
      {
        id: 'plate-or-sheets',
        title: 'Rozhodněte: destička, nebo listy',
        body: `Pod štítkem „Destička“ ${IN_TABLE} (odkaz pod krokem) je u každé řady „ano“, nebo „ne“. Řada s „ano“: značíte destičkou. Řada s „ne“: značíte listem, list 1 za řadu 3 (lekce 2, 3 a 4), list 2 za řadu 1 nebo 2 (lekce 6); vygenerujete a vytisknete ho v lekci, která ho chce. Destička neprošla kontrolou: značíte jen listy. Čím značíte kterou řadu, ukazuje souhrn pod krokem: aplikace to bere z kontroly destičky a z tabulky, nic dalšího nezapisujete.`,
        appLinks: [YOUR_BELT],
        media: [],
        beltRecalls: ['marking'],
      },
    ],
    checkpoints: [
      {
        slug: 'waist-recorded',
        title: 'Obvod je změřený od ohybu u přezky k používané dírce a zadaný ve „Váš pásek“.',
        required: true,
      },
      {
        slug: 'belt-chosen',
        title:
          'Šířka, konec a barva jsou zadané a pásek je uložený v „Moje pásky“; pás je aspoň tak dlouhý jako nejkratší délka z „Váš pásek“.',
        required: true,
      },
      {
        slug: 'strap-measured',
        title:
          'Změřená tloušťka a trn jsou uložené ve „Váš pásek“; nýt i výsečník sedí na čísla z tabulky.',
        required: true,
      },
      {
        slug: 'marking-decided',
        title:
          'Destička je zkontrolovaná a výsledek zapsaný; souhrn ukazuje, kterou řadu značíte destičkou a kterou listem.',
        required: true,
      },
    ],
    commonMistakes: [
      'Obvod pasu z krejčovské tabulky místo délky od ohybu u přezky k dírce.',
      'Obvod měřený od konce trnu, ne od ohybu.',
      'Pás objednaný kratší, než je nejkratší délka z tabulky.',
      'Nýt 10/6 k pásu, který nemá 3,5–3,75 mm.',
    ],
    safety: [],
    media: [photo('belt-l1-hero', 'Přezka, pás a tabulka Váš pásek v telefonu vedle destičky')],
  }),

  draft({
    slug: L2,
    title: 'Trénink na odřezku řemene',
    order: 2,
    phaseSlug: 'prepare',
    estimatedMinutes: 90,
    goal: 'Na odřezku stejného pásu vyzkoušet řez, značení, výsečníky, ovál, ohyb, nýt, hrany, u barevného pásku barvu na hrany a balzám dřív, než se pustíte do pásku.',
    materials: [
      'odřezek pásu asi 15 cm (viz první krok)',
      'oboustranná lepicí páska a dvě lišty nebo odřezky stejně silné jako pás',
      'voda a houbička',
      'plátno na leštění',
      'plochý šroubovák podle drážky šroubku nýtu',
    ],
    requiredEquipment: [
      'belt-strap',
      'belt-buckle',
      'chicago-screws',
      'hole-punch-5mm',
      'hole-punch-6mm',
      'scratch-awl',
      'steel-ruler',
      'utility-knife',
      'cutting-mat',
      'mallet',
      'punching-board',
      'edge-burnisher',
      'sandpaper',
      'leather-balm',
    ],
    recommendedEquipment: ['edge-beveler', 'edge-paint'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'get-scrap',
        title: 'Odřízněte odřezek',
        body: `Trénujte na odřezku téhož pásu. Odřízněte asi 15 cm z konce, kde bude špička, jen když pás bude i bez nich aspoň tak dlouhý jako nejkratší délka (pod krokem). 15 cm stačí na ohyb 90 mm a jeden nýt: otvor 64,5 mm se po přehnutí dostane na 115,5 mm. Když pás na odřezek nestačí, trénujte na samostatném odřezku třísločiněné kůže co nejbližší tloušťky (např. zbytky třísločiněné hlazenice, tloušťku ověřte u prodejce); nýt pak vyzkoušejte až na pásku.`,
        media: [],
        beltRecalls: ['strapLength'],
      },
      {
        id: 'cut',
        title: 'Kolmý řez',
        body: 'Konec odřezku srovnejte kolmo. Odřezek položte rubem nahoru. Destičku přiložte kousek od konce, hrany odřezku na linky vaší šířky (šířka bez linky: podle příčné stupnice), přidržte ji rukou nad pásem a šídlem narýsujte čáru podél levé hrany destičky přes celou šířku. Destičku odložte, ocelové pravítko přiložte na čáru a řízněte ve 2–3 tazích, nůž svisle; nikdy ne podél destičky, čepel by akrylát poškodila. Kontrola: destičku přiložte znovu, hrany odřezku na linky: levá hrana destičky se konce dotýká po celé šířce, bez mezery v rohu. S listem 1: vytiskněte ho na 100 % (odkaz pod krokem), zkontrolujte kalibrační čtverec 50 × 50 mm a vystřihněte ho po obrysu pásu; boky listu přiložte na hrany odřezku a čáru veďte podél spodní hrany listu.',
        printLink: 'pattern-sheets',
        printSheetId: 'prezka',
        media: [],
      },
      {
        id: 'mark',
        title: 'Značení destičkou',
        body: 'Odřezek a dvě podložky stejně silné jako pás přilepte k desce oboustrannou páskou, rubem nahoru. Destičku přiložte řadou 3 levou hranou na konec odřezku a hrany odřezku na linky vaší šířky (šířka bez linky: podle příčné stupnice). Šídlem označte dva otvory pro nýty blíž ke konci, 2 značky ohybu (šídlo v obou nakloněné stejným směrem) a obtáhněte ovál. V otvoru kružte šídlem po stěně, tlačte svisle a dívejte se svisle dolů. Destičku nikdy neobracejte. Bez destičky použijte list 1 (odkaz pod krokem): propíchněte středy 2 černých otvorů u konce, oba křížky oválu a oba červené kroužky na čáře ohybu. Šedé otvory nepropichujte.',
        printLink: 'pattern-sheets',
        printSheetId: 'prezka',
        animationLinks: [
          animationLink('beltBuckleEnd', 'B1'),
          animationLink('beltBuckleEnd', 'B2'),
        ],
        media: [
          photo(
            'belt-l2-mark',
            'Destička řadou 3 na odřezku, podložky po stranách, šídlo v otvoru',
          ),
        ],
        beltRecalls: ['marking'],
      },
      {
        id: 'punch',
        title: 'Výsečníky a ovál',
        body: 'Na tvrdé desce vysekněte Ø 6 mm oba otvory pro nýty a oba konce oválu: výsečník zarovnejte na obtažené oblouky, ne doprostřed rýhy (s listem 1 středem na propíchnutý křížek). Boky oválu řízněte nožem tečně k oběma otvorům. Obtažený ovál je o 0,3 mm z každé strany menší než 25 × 6 mm. Vedle vysekněte zkušební dírku pro trn výsečníkem z tabulky (např. Ø 5 mm). Prohlédněte okraje otvorů.',
        animationLinks: [
          animationLink('beltBuckleEnd', 'C2'),
          animationLink('beltBuckleEnd', 'C3'),
        ],
        media: [],
        records: [
          {
            kind: 'choice',
            id: 'scrap-punch',
            label: 'Okraje otvorů',
            hint: 'Roztřepené: vysekněte na odřezku další otvor, na tvrdé desce a výsečník kolmo. Když to nepomůže, nezačínejte pásek: tento případ podklady neřeší.',
            options: [
              { value: 'clean', label: 'Čisté' },
              { value: 'frayed', label: 'Roztřepené' },
            ],
          },
        ],
      },
      {
        id: 'edge-bevel',
        title: 'Srazte hranu',
        body: 'Na kousku hrany vyzkoušejte zkosení ořezávačem (velikost pro váš pás ověřte na odřezku), nebo zaoblení brusným papírem na hranolku.',
        animationLinks: [animationLink('edges', 'H1')],
        media: [],
      },
      {
        id: 'try-edge-paint',
        title: 'Barva na hrany (jen barevný pásek)',
        body: 'Jen u barevného pásku; u přírodního krok přeskočte. Řezaná hrana barevného pásu bývá světlá. Na sražené hraně odřezku vyzkoušejte barvu na hrany: hranu přebruste dohladka, barvu naneste podle návodu na obalu v tenkých vrstvách a mezi nimi nechte zaschnout. Zkontrolujte, že barva nezatekla na líc a že odstín k pásu sedí; samostatný odřezek (ne z pásu) porovnejte přiložením k pásu. Zapište si počet vrstev a dobu schnutí: podle nich postupujte v lekcích 3, 4 a 6. Po zaschnutí pokračujte dalším krokem.',
        animationLinks: [animationLink('edges', 'H2')],
        media: [],
        waits: [edgePaintWait(false)],
        beltRecalls: ['color'],
        records: [
          {
            kind: 'number',
            id: EDGE_PAINT_COATS_ID,
            label: 'Počet vrstev barvy na hrany',
            unit: '×',
            min: 1,
            decimals: 0,
          },
          {
            kind: 'number',
            id: EDGE_PAINT_DRY_ID,
            label: 'Doba schnutí barvy na hrany',
            unit: 'min',
            min: 1,
            decimals: 0,
          },
        ],
      },
      {
        id: 'edges-balm',
        title: 'Lesk a balzám',
        body: 'Hranu navlhčete Tokonole a třete leštítkem nebo plátnem, dokud se nezaleskne. U barevného pásku leštěte až zaschlou barvu. Na líc odřezku naneste balzám podle návodu na obalu a nechte ho vsáknout. Prohlédněte, jak změnil barvu. U barevného pásku na samostatném odřezku (ne z pásu) vzhled balzámu o pásu nevypovídá: když si nejste jistí, balzám v lekcích 3 a 6 vynechte.',
        animationLinks: [animationLink('edges', 'H3')],
        media: [],
        records: [
          {
            kind: 'choice',
            id: 'scrap-balm',
            label: 'Balzám na odřezku',
            hint: 'Nevyhovuje: na pásek ho nedávejte. U přírodního pásku jiný přípravek (např. sedlářský tuk) nejdřív vyzkoušejte na odřezku; u barevného pásku balzám v lekcích 3 a 6 vynecháte.',
            options: [
              { value: 'ok', label: 'Vzhled vyhovuje' },
              { value: 'no', label: 'Nevyhovuje' },
            ],
          },
        ],
      },
      {
        id: 'bend',
        title: 'Ohyb kolem příčky',
        body: 'Značky ohybu spojte na rubu pravítkem: na této čáře ohýbejte (uprostřed oválu, 90 mm od konce). Navlhčete zónu ohybu a ohněte ji přes rub, rubem k rubu (líc zůstane venku, jako později na pásku), kolem příčky přezky, ne přes hranu. Nasucho do malého rádiusu může silná kůže popraskat. Prohlédněte líc v ohybu.',
        animationLinks: [
          animationLink(
            'beltBuckleEnd',
            'E1',
            'Krok E1 – Ohněte konec kolem příčky (na pásku, poutko až v lekci 4)',
          ),
        ],
        media: [photo('belt-l2-bend', 'Navlhčený odřezek ohnutý kolem příčky přezky, líc v ohybu')],
        records: [
          {
            kind: 'choice',
            id: 'scrap-bend',
            label: 'Líc v ohybu',
            hint: 'Popraskal-li nasucho, zopakujte ohyb navlhčený. Popraská-li i navlhčený, nezačínejte pásek: tento případ podklady neřeší.',
            options: [
              { value: 'ok', label: 'Bez prasklin' },
              { value: 'cracked', label: 'Popraskal' },
            ],
          },
        ],
      },
      {
        id: 'screw',
        title: 'Zkouška nýtu',
        body: 'Ohnutý odřezek stáhněte k sobě a druhou vrstvu označte šídlem skrz otvor 64,5 mm (ten blíž k ohybu). Otvor 16,8 mm na 15cm odřezku protějšek nemá. Odřezek rozložte, otvor vysekněte Ø 6 mm, ohněte zpět a prostrčte nýt: hlavičku s dutým dříkem z líce, šroubek z druhé strany (na přehnutém konci), utáhněte plochým šroubovákem. Hlavička musí přitlačit kůži a nýt se nesmí viklat.',
        animationLinks: [
          animationLink(
            'beltBuckleEnd',
            'E3',
            'Krok E3 – Označte druhou dvojici skrz otvory (na pásku, poutko až v lekci 4)',
          ),
          animationLink(
            'beltBuckleEnd',
            'E4',
            'Krok E4 – Vysekněte druhou dvojici (na pásku, poutko až v lekci 4)',
          ),
          animationLink(
            'beltBuckleEnd',
            'E6',
            'Krok E6 – Sešroubujte nýty (na pásku, poutko až v lekci 4)',
          ),
        ],
        media: [],
        records: [
          {
            kind: 'choice',
            id: 'scrap-screw',
            label: 'Nýt ve dvou vrstvách',
            hint: 'Viklá se nebo nedosáhne: objednejte nýt s dříkem podle tabulky Váš pásek.',
            options: [
              { value: 'tight', label: 'Drží pevně' },
              { value: 'wobbles', label: 'Viklá se (dřík dlouhý)' },
              { value: 'short', label: 'Nedosáhne do závitu (dřík krátký)' },
            ],
          },
        ],
        beltRecalls: ['thickness', 'rivet'],
      },
    ],
    checkpoints: [
      {
        slug: 'scrap-cut-and-punched',
        title: 'Řez je kolmý, otvory Ø 6 mm a dírka pro trn mají čisté okraje, ovál má rovné boky.',
        description:
          'Šikmý nebo trhaný řez: odlomte článek čepele a řízněte znovu, nůž svisle. Křivé boky oválu: zkuste znovu na odřezku; když to nejde, nezačínejte pásek a ověřte proč.',
        required: true,
      },
      {
        slug: 'scrap-bend-ok',
        title: 'Navlhčený ohyb kolem příčky nepopraskal.',
        required: true,
      },
      {
        slug: 'scrap-screw-ok',
        title: 'Nýt ve dvou vrstvách drží pevně a neviklá se (jen s odřezkem téhož pásu).',
        required: false,
      },
      {
        slug: 'scrap-edge-paint',
        title: 'U barevného pásku je barva na hrany vyzkoušená a zapsaná (vrstvy, doba schnutí).',
        description:
          'Barva zatekla na líc: příště nanášejte méně a jen na hranu. Odstín nesedí: zkuste jiný odstín na odřezku.',
        required: false,
      },
      {
        slug: 'scrap-edge-balm',
        title:
          'Hrana je zaleštěná a balzám je vyzkoušený: vyhovuje, nebo u barevného pásku nevyhověl a vynecháte ho.',
        description:
          'Hrana se neleskne: navlhčete ji znovu Tokonole a třete dál. Balzám nevyhovuje u přírodního pásku: na pásek ho nedávejte, jiný přípravek nejdřív na odřezku. U barevného pásku ho v lekcích 3 a 6 vynecháte.',
        required: true,
      },
    ],
    commonMistakes: [
      'Odřezek z pásu, který pak na délku nestačí.',
      'Výsečník na konci oválu doprostřed rýhy: ovál vyjde menší a trn se dře.',
      'Ohyb nasucho nebo přes hranu příčky.',
    ],
    safety: [KNIFE, PUNCH],
    prints: [sheet('prezka', 'List 1: značení odřezku místo řady 3 destičky')],
    media: [photo('belt-l2-hero', 'Odřezek pásu s oválem, otvory a nýtem vedle přezky')],
  }),

  draft({
    slug: L3,
    title: 'Hrany dlouhého řemene',
    order: 3,
    phaseSlug: 'build',
    estimatedMinutes: 120,
    goal: 'Srovnat konec u přezky, zkosit, u barevného pásku obarvit a zaleštit dlouhé hrany kromě posledních 30 cm a pás natřít balzámem.',
    materials: [
      'destička MK Plexi, nebo vytištěný list 1',
      'plátno na leštění',
      'kousek papírové pásky delší, než je šířka pásu, na značku 30 cm',
    ],
    requiredEquipment: [
      'belt-strap',
      'scratch-awl',
      'steel-ruler',
      'utility-knife',
      'cutting-mat',
      'edge-burnisher',
      'sandpaper',
      'leather-balm',
    ],
    recommendedEquipment: ['edge-beveler', 'edge-paint'],
    prerequisiteLessons: [L2],
    requires: [
      {
        id: 'sheet-1',
        fromLesson: L2,
        label: 'List 1 vystřižený po obrysu pásu',
        note: 'Jen když značíte listem místo řady 3 destičky.',
      },
    ],
    steps: [
      {
        id: 'square-end',
        title: 'Srovnejte konec u přezky',
        body: 'Vyberte konec, kde bude přezka; druhý konec bude špička. Pás položte rubem nahoru. Destičku přiložte kousek od konce, hrany pásu na linky vaší šířky (šířka bez linky: podle příčné stupnice), přidržte ji rukou nad pásem a šídlem narýsujte čáru podél levé hrany destičky přes celou šířku. Destičku odložte, ocelové pravítko přiložte na čáru a řízněte ve 2–3 tazích, nůž svisle; nikdy ne podél destičky, čepel by akrylát poškodila. Kontrola: destičku přiložte znovu, hrany pásu na linky: levá hrana destičky se konce dotýká po celé šířce, bez mezery v rohu. S listem 1 z lekce 2: boky listu na hrany pásu, čáru veďte podél spodní hrany listu. O tuto hranu se opírá řada 3 destičky i list 1.',
        media: [],
      },
      {
        id: 'mark-30',
        title: 'Označte posledních 30 cm',
        body: 'Na konci se špičkou odměřte od konce 30 cm. Tam nalepte napříč na rub kousek papírové pásky tak, aby přečníval přes obě hrany: je vidět i shora a rub tu zůstane skrytý. Do kůže nic nevpichujte. Tyto hrany zatím neopracovávejte: konec odříznete v lekci 6. Pásku nechte do lekce 6.',
        media: [],
      },
      {
        id: 'bevel',
        title: 'Srazte hrany',
        body: 'Pás rozložte naplocho. Hrany na líci i rubu srazte ořezávačem (velikost ověřená na odřezku v lekci 2), nebo zaoblete brusným papírem na hranolku. Volitelně hranu přebruste postupně 320 → 400 → 600 → 800: lesk bude hladší.',
        animationLinks: [animationLink('edges', 'H1')],
        media: [],
      },
      {
        id: 'edge-paint',
        title: 'Obarvěte hrany (jen barevný pásek)',
        body: 'Jen u barevného pásku; u přírodního krok přeskočte. Hrany přebruste dohladka a naneste barvu na hrany, jak jste ji vyzkoušeli na odřezku v lekci 2: stejný počet vrstev a mezi nimi nechte zaschnout. Hlídejte, ať barva nezateče na líc. Posledních 30 cm zatím vynechte. Vyzkoušenou barvu nemáte: nejdřív ji ověřte na odřezku.',
        animationLinks: [animationLink('edges', 'H2')],
        media: [],
        waits: [edgePaintWait(true)],
        recalls: edgePaintRecalls,
      },
      {
        id: 'burnish',
        title: 'Zaleštěte hrany',
        body: 'Hranu navlhčete Tokonole a třete leštítkem nebo plátnem, dokud se nezhutní a nezaleskne. U barevného pásku leštěte až zaschlou barvu. Hran je dvakrát délka pásu: pracujte po úsecích.',
        animationLinks: [
          animationLink('edges', 'H3'),
          animationLink('edges', 'D1'),
          animationLink('edges', 'D3'),
        ],
        media: [
          photo('belt-l3-burnish', 'Leštítko na hraně pásu, vlevo matná, vpravo lesklá část'),
        ],
      },
      {
        id: 'balm',
        title: 'Natřete pás balzámem',
        body: 'Teď, ne později: po ohnutí a sešroubování se pod ohyb nedostanete. Balzám naneste podle návodu na obalu, stejně jako na odřezku v lekci 2. Posledních 30 cm zatím vynechte: k pásce ho rozetřete do ztracena, ne do ostré hranice, ať v lekci 6 nenavazujete na viditelný přechod. Balzám dávejte jen, když na odřezku vyhověl. Nevyhověl: u přírodního pásku nejdřív vyzkoušejte jiný přípravek na odřezku, u barevného krok přeskočte.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'end-square',
        title:
          'Konec u přezky je kolmý: s hranami pásu na linkách se ho levá hrana destičky dotýká po celé šířce.',
        required: true,
      },
      {
        slug: 'edges-done',
        title:
          'Dlouhé hrany jsou sražené a zaleštěné; posledních 30 cm u špičky zůstalo neopracované.',
        required: true,
      },
      {
        slug: 'edges-painted',
        title: 'U barevného pásku jsou hrany obarvené před leštěním a barva nezatekla na líc.',
        required: false,
      },
      {
        slug: 'balm-done',
        title:
          'Pás je natřený balzámem kromě posledních 30 cm (jen když balzám na odřezku vyhověl).',
        required: true,
      },
    ],
    commonMistakes: [
      'Opracované hrany v posledních 30 cm, které se pak odříznou.',
      'Leštění dřív, než jsou hrany sražené nebo zaoblené.',
      'Balzám až po sešroubování konce.',
      'U barevného pásku leštit hranu dřív, než barva zcela zaschne.',
    ],
    safety: [KNIFE],
    media: [photo('belt-l3-hero', 'Pás rozložený na stole se zaleštěnými hranami a značkou 30 cm')],
  }),

  draft({
    slug: L4,
    title: 'Konec s přezkou',
    order: 4,
    phaseSlug: 'build',
    estimatedMinutes: 120,
    goal: 'Označit a vyseknout konec u přezky, vyrobit poutko a přezku přišroubovat dvěma nýty.',
    materials: [
      'oboustranná lepicí páska a dvě lišty nebo odřezky stejně silné jako pás',
      'odřezek kůže na poutko, klidně tenčí než pás',
      'papírový proužek na změření poutka',
      'papírová páska na přelepení poutka mimo přeplátování',
      'voda a houbička',
      'zajišťovač závitů nebo lak',
      'plátno na leštění',
      'plochý šroubovák podle drážky šroubku nýtu',
    ],
    requiredEquipment: [
      'belt-strap',
      'belt-buckle',
      'chicago-screws',
      'hole-punch-6mm',
      'scratch-awl',
      'steel-ruler',
      'utility-knife',
      'cutting-mat',
      'mallet',
      'punching-board',
      'contact-cement',
      'edge-burnisher',
      'sandpaper',
    ],
    recommendedEquipment: ['edge-beveler', 'edge-paint'],
    prerequisiteLessons: [L3],
    steps: [
      {
        id: 'plate-or-sheet',
        title: 'Řada 3, nebo list 1',
        printLink: 'pattern-sheets',
        printSheetId: 'prezka',
        body: `Řada 3 destičky platí pro šířky 28–45 mm. Když ${TABLE} ukazuje u řady 3 „ne“, nebo destička neprošla kontrolou, vytiskněte list 1 pro váš pásek na 100 % (odkaz pod krokem). Kalibrační čtverec musí měřit 50 × 50 mm.`,
        animationLinks: [
          animationLink('beltBuckleEnd', 'A1'),
          animationLink('beltBuckleEnd', 'A2'),
        ],
        media: [],
        beltRecalls: ['width', 'marking'],
      },
      {
        id: 'secure',
        title: 'Upevněte pás a destičku',
        body: 'Pás položte rubem nahoru. Po obou stranách pásu dejte lišty nebo odřezky stejně silné jako pás, aby se destička nepřeklopila. Pás i podložky přilepte k desce oboustrannou páskou.',
        animationLinks: [animationLink('beltBuckleEnd', 'B1')],
        media: [
          photo('belt-l4-secure', 'Pás a dvě podložky přilepené k desce, destička leží rovně'),
        ],
      },
      {
        id: 'mark',
        title: 'Označte konec u přezky',
        body: 'Destičku přiložte levou hranou přesně na konec pásu, hrany pásu na pár linek vaší šířky (šířka bez linky: podle příčné stupnice). Šídlem označte jen 2 otvory pro nýty blíž ke konci, 2 značky ohybu a obtáhněte ovál. Druhé 2 otvory v přímce neznačte: druhou dvojici označíte po ohnutí skrz první. V otvorech kružte po stěně, u obou značek ohybu nakloňte šídlo stejným směrem. Dívejte se svisle. Destičku nikdy neobracejte. Dva otvory mimo přímku jsou značky ohybu: do nich nic nesekejte. S listem 1: list vystřihněte po obrysu pásu, spodní hranu přiložte přesně na konec pásu, boky na hrany pásu a přilepte páskou. Šídlem propíchněte středy 2 černých otvorů u konce, oba křížky oválu a oba červené kroužky na čáře ohybu. Šedé otvory nepropichujte.',
        animationLinks: [
          animationLink('beltBuckleEnd', 'B2'),
          animationLink('beltBuckleEnd', 'B3'),
          animationLink('beltBuckleEnd', 'B4'),
          animationLink('beltBuckleEnd', 'B5'),
          animationLink('beltBuckleEnd', 'B6'),
        ],
        media: [photo('belt-l4-mark', 'Řada 3 destičky na konci pásu, šídlo v otvoru pro nýt')],
      },
      {
        id: 'first-pair',
        title: 'Vysekněte první dvojici',
        body: 'Výsečníkem Ø 6 mm vysekněte oba označené otvory (16,8 a 64,5 mm od konce). Značky ohybu spojte na rubu pravítkem.',
        animationLinks: [animationLink('beltBuckleEnd', 'C1')],
        media: [],
      },
      {
        id: 'oval',
        title: 'Vyřízněte ovál',
        body: 'Oba konce oválu vysekněte Ø 6 mm zarovnané na obtažené oblouky, ne doprostřed rýhy. S listem 1 postavte výsečník středem na propíchnutý křížek. Boky řízněte nožem tečně k oběma otvorům: obtažený ovál je o 0,3 mm z každé strany menší (24,4 × 5,4 místo 25 × 6 mm) a trn by se dřel. Vnitřní hranu oválu (přes ni jezdí trn) srazte brusným papírem, u barevného pásku obarvěte jako v lekci 3 (stejný počet vrstev, mezi nimi nechte zaschnout) a leštěte až zaschlou barvu. Pak ji zaleštěte Tokonole kulatým leštítkem nebo kolíčkem teď, dokud je konec rovný: po ohnutí kolem příčky se k ní nedostanete.',
        animationLinks: [
          animationLink('beltBuckleEnd', 'C2'),
          animationLink('beltBuckleEnd', 'C3'),
          animationLink('beltBuckleEnd', 'C4'),
        ],
        media: [],
        waits: [edgePaintWait(true)],
        recalls: edgePaintRecalls,
      },
      {
        id: 'keeper',
        title: 'Vyrobte poutko',
        body: `Poutkem bude procházet i volný konec pásku, takže obepíná 3 vrstvy. Konec pásu přeložte volně na dvojo, zatím bez ohybu kolem příčky, a přiložte k němu třetí vrstvu: druhý konec pásu nebo odřezek z lekce 2. Papírový proužek obtočte kolem všech 3 vrstev, označte, kde se potká se svým začátkem, a obvod odečtěte na pravítku destičky (nula vlevo) nebo na ocelovém pravítku. Délka poutka = obvod + tloušťka poutka v ohybech (π × tloušťka poutka: asi 4 mm u odřezku 1,2 mm, asi 9 mm u odřezku 3 mm, asi 11 mm u odřezku 3,5 mm) + 15 mm přeplátování. Porovnejte s délkou poutka aktivního pásku pod krokem (např. ${KEEPER_EXAMPLE_MM} mm pro 40 × 3,5 mm): ta počítá s odřezkem 1,2 mm, se silnějším odřezkem vyjde delší. Z odřezku vyřízněte proužek 12 mm × tuto délku: na rubu ho narýsujte šídlem podél ocelového pravítka a řežte přesně po rýhách, odpadnou s řezem. V přeplátování 15 mm leží rub jednoho konce na líci druhého: líc pod ním zdrsněte smirkem 180, z hladkého líce lepidlo pouští. Hranici 15 mm na kůži neznačte: papírovou páskou přelepte líc tak, aby od konce zůstalo volných 15 mm (odměřte pravítkem; na listu 1 jsou to šrafy), a stejně rub druhého konce. Zdrsněte a kontaktním lepidlem natřete jen volná místa, pásku hned sundejte, nechte zavadnout podle návodu na obalu a slepte. Délka poutka je spočítaná, ne vyzkoušená: ověřte ji proužkem.`,
        animationLinks: [
          animationLink('beltBuckleEnd', 'D1'),
          animationLink('beltBuckleEnd', 'D2'),
        ],
        media: [],
        records: [
          {
            kind: 'number',
            id: KEEPER_LENGTH_ID,
            label: 'Délka poutka změřená proužkem',
            hint: 'Obvod 3 vrstev + π × tloušťka poutka + 15 mm. Poutko aktivního pásku počítá s odřezkem 1,2 mm.',
            unit: 'mm',
            decimals: 0,
          },
        ],
        beltRecalls: ['keeper'],
        waits: [
          {
            id: 'keeper-glue',
            label: 'Zavadnutí lepidla na poutku',
            minutes: 10,
            maxMinutes: 15,
            basis: 'manufacturer',
          },
        ],
      },
      {
        id: 'bend',
        title: 'Navlékněte poutko a ohněte konec',
        body: 'Poutko navlékněte na pás od konce u přezky a posuňte ho dál, než po ohnutí dosáhne konec pásu (180 mm od konce). Teď, dokud je konec rovný: po ohnutí by šlo poutko navléknout jen z druhého konce pásu. Trn přezky prostrčte oválem: přezku nasaďte ozdobnou stranou na stranu líce pásu, trn pak leží na rámu přezky zvenku. Zónu ohybu navlhčete a konec ohněte nahoru přes rub, rubem k rubu, kolem příčky přezky, ne přes hranu, tak jako na odřezku v lekci 2. Líc zůstane venku a přehnutý konec leží na rubu pásu (při nošení u těla).',
        animationLinks: [
          animationLink('beltBuckleEnd', 'D3'),
          animationLink('beltBuckleEnd', 'E1'),
        ],
        media: [
          photo('belt-l4-bend', 'Konec pásu ohnutý kolem příčky přezky, trn prochází oválem'),
        ],
      },
      {
        id: 'second-pair',
        title: 'Posuňte poutko a označte druhou dvojici',
        body: 'Poutko posuňte přes přehnutý konec do kapsy mezi vyseknuté otvory, spojem na přehnutý konec (na rubu, při nošení k tělu): na líci spoj není vidět a nedře o něj volný konec. Přehnutý konec zatáhněte směrem od přezky a druhou dvojici otvorů označte šídlem skrz už vyseknuté otvory. Tohle je nejdůležitější krok: chyba 1 mm na značce dá po přehnutí 2 mm rozdíl a dřík Ø 6 mm do otvoru Ø 6 mm neprojde. Značení skrz hotový otvor tuhle chybu ruší.',
        animationLinks: [
          animationLink('beltBuckleEnd', 'E2'),
          animationLink('beltBuckleEnd', 'E3'),
        ],
        media: [
          photo(
            'belt-l4-second',
            'Šídlo značí druhou vrstvu skrz vyseknutý otvor, poutko mezi otvory',
          ),
        ],
      },
      {
        id: 'screws',
        title: 'Vysekněte a sešroubujte',
        body: 'Poutko odsuňte ke špičce dál než 180 mm od konce, pak konec rozložte. Druhou dvojici vysekněte Ø 6 mm podle značek skrz otvory. Konec ohněte zpět kolem příčky s trnem v oválu a poutko posuňte zpět přes přehnutý konec do kapsy, spojem na přehnutý konec. Nýty sešroubujte: hlavičku s dutým dříkem z líce pásu, šroubek z druhé strany, na přehnutém konci (strana k tělu), utáhněte plochým šroubovákem. Na závit dejte kapku zajišťovače závitů nebo laku: nýty v nejzatíženějším místě se povolují. Poutko je v kapse mezi nýty.',
        animationLinks: [
          animationLink('beltBuckleEnd', 'E4'),
          animationLink('beltBuckleEnd', 'E5'),
          animationLink('beltBuckleEnd', 'E6'),
          animationLink('beltBuckleEnd', 'E7'),
        ],
        media: [],
        beltRecalls: ['thickness', 'rivet'],
      },
    ],
    checkpoints: [
      {
        slug: 'marked-row3',
        title:
          'Na rubu jsou označené 2 otvory u konce, značky ohybu a ovál; značky ohybu nejsou proseknuté.',
        required: true,
      },
      {
        slug: 'oval-clean',
        title:
          'Ovál má rovné boky tečné k oběma otvorům, jeho vnitřní hrana je sražená a zaleštěná a trn jím projde bez dření.',
        required: true,
      },
      {
        slug: 'pairs-aligned',
        title: 'Druhá dvojice je označená skrz první a oba nýty prošly bez násilí.',
        required: true,
      },
      {
        slug: 'buckle-fixed',
        title: 'Oba nýty jsou utažené, neviklají se a poutko je uvězněné mezi nimi.',
        required: true,
      },
    ],
    commonMistakes: [
      'Proseknutá značka ohybu: otvor Ø 6 mm uprostřed pásu nejde opravit.',
      'Všechny čtyři otvory vyseknuté najednou: druhá dvojice nesedí.',
      'Poutko nenavlečené před ohnutím.',
      'Poutko změřené jen kolem 2 vrstev: volný konec pásku se do něj nevejde.',
      'Druhá dvojice propíchnutá z destičky nebo listu: značí se jen skrz vyseknuté otvory.',
      'Destička přiložená na šikmo uříznutý konec pásu.',
    ],
    safety: [
      KNIFE,
      PUNCH,
      'Kontaktní lepidlo používejte ve větrané místnosti a podle návodu na obalu.',
    ],
    prints: [sheet('prezka', 'List 1: konec u přezky místo řady 3 destičky')],
    requires: [
      {
        id: 'strap-edged',
        fromLesson: L3,
        label:
          'Pás se zaleštěnými (u barevného obarvenými) hranami a balzámem (bez posledních 30 cm)',
      },
    ],
    media: [photo('belt-l4-hero', 'Přezka přišroubovaná dvěma nýty, poutko mezi nimi')],
  }),

  draft({
    slug: L5,
    title: 'Zkouška na těle a prostřední dírka',
    order: 5,
    phaseSlug: 'build',
    estimatedMinutes: 20,
    goal: 'Na sobě označit prostřední dírku a ověřit, že pás na dírky a špičku stačí.',
    materials: [
      'kalhoty, ve kterých budete pásek nosit',
      'krejčovský metr',
      'kousek papírové pásky a tužka',
    ],
    requiredEquipment: ['scratch-awl', 'steel-ruler', 'punching-board'],
    recommendedEquipment: [],
    prerequisiteLessons: [L4],
    steps: [
      {
        id: 'try-on',
        title: 'Vyzkoušejte pásek na sobě',
        body: 'Na líc pásku, kam zhruba dosáhne trn, nalepte kousek papírové pásky. Pásek provlékněte poutky kalhot a utáhněte na pohodlí. Přidržte prstem a tužkou udělejte na pásce tečku, kam tlačí hrot trnu. To je prostřední dírka. Šídlem teď do kůže nic nevpichujte: důlek, který by nevyšel, by na líci zůstal.',
        animationLinks: [animationLink('beltHolesTip', 'A1')],
        media: [photo('belt-l5-fit', 'Pásek v poutkách kalhot, prst drží místo pod hrotem trnu')],
      },
      {
        id: 'measure',
        title: 'Změřte a porovnejte',
        body: 'Změřte od ohybu u přezky k tečce na pásce a zapište. Porovnejte s obvodem aktivního pásku pod krokem. Platí značka, ne obvod.',
        animationLinks: [animationLink('beltHolesTip', 'A2')],
        media: [],
        records: [
          {
            kind: 'number',
            id: FIT_WAIST_ID,
            label: 'Ohyb u přezky → značka',
            unit: 'cm',
            decimals: 1,
          },
        ],
        beltRecalls: ['waist'],
      },
      {
        id: 'transfer',
        title: 'Propíchněte značku na rub',
        body: 'Značí se na rubu, ale tečka je na pásce na líci. Pásek sundejte a položte lícem nahoru na tvrdou desku. Kontrola: od ohybu u přezky k tečce musí vyjít zapsaná míra. Nesedí: vyzkoušejte pásek na sobě znovu a tečku opravte na pásce, kůže zůstane celá. Sedí: šídlo dejte do tečky a protlačte svisle skrz až na rub. Je to jediný vpich do líce a zmizí ve vyseknuté prostřední dírce. Pásku sundejte; propíchnutý bod na rubu je značka prostřední dírky.',
        animationLinks: [animationLink('beltHolesTip', 'A3')],
        media: [photo('belt-l5-transfer', 'Šídlo propíchnuté důlkem z líce, hrot vychází na rubu')],
        recalls: [{ fieldId: FIT_WAIST_ID, label: 'Ohyb u přezky → značka (tato lekce)' }],
      },
      {
        id: 'length-check',
        title: 'Stačí pás?',
        body: `Od značky ke konci pásu musí zbýt aspoň vzdálenost prostřední dírky od konce (např. 144,3 mm; vaše číslo je pod krokem). Když nezbývá, ve „Váš pásek“ (odkaz pod krokem) pod „Dírky (pokročilé)“ zkuste menší počet dírek nebo kratší odstup první dírky; aplikace hlídá meze. Pak ale značíte listem 2, ne destičkou.`,
        appLinks: [YOUR_BELT],
        animationLinks: [animationLink('beltHolesTip', 'A4')],
        media: [],
        beltRecalls: ['middleHole'],
      },
    ],
    checkpoints: [
      {
        slug: 'middle-marked',
        title:
          'Prostřední dírka je označená na sobě, ne podle obvodu, a značka je propíchnutá na rub.',
        required: true,
      },
      {
        slug: 'length-enough',
        title: 'Od značky ke konci zbývá aspoň vzdálenost prostřední dírky od konce z tabulky.',
        required: true,
      },
    ],
    commonMistakes: [
      'Prostřední dírka podle obvodu z lekce 1 místo zkoušky na sobě.',
      'Zkouška v jiných kalhotách, než ve kterých budete pásek nosit.',
      'Důlek nebo vpich šídlem do líce mimo konečnou značku: zůstane vidět.',
      'Značka zůstala jen na líci: na rubu pak destičku ani list není kam přiložit.',
    ],
    safety: [],
    requires: [
      { id: 'buckle-end', fromLesson: L4, label: 'Pás s přišroubovanou přezkou a poutkem' },
    ],
    media: [photo('belt-l5-hero', 'Značka prostřední dírky na pásku, metr od ohybu u přezky')],
  }),

  draft({
    slug: L6,
    title: 'Dírky a špička',
    order: 6,
    phaseSlug: 'build',
    estimatedMinutes: 90,
    goal: 'V jednom přiložení označit dírky a konec, vyseknout je, uříznout konec a dokončit hrany.',
    materials: [
      'oboustranná lepicí páska a dvě lišty nebo odřezky stejně silné jako pás',
      'plátno na leštění',
    ],
    requiredEquipment: [
      'hole-punch-5mm',
      'scratch-awl',
      'steel-ruler',
      'utility-knife',
      'cutting-mat',
      'mallet',
      'punching-board',
      'edge-burnisher',
      'sandpaper',
      'leather-balm',
    ],
    recommendedEquipment: ['corner-template', 'edge-beveler', 'belt-end-punch', 'edge-paint'],
    prerequisiteLessons: [L5],
    steps: [
      {
        id: 'row',
        title: 'Řada 1 nebo 2, nebo list 2',
        printLink: 'pattern-sheets',
        printSheetId: 'spicka',
        body: `Hrot: řada 1. Zaoblený konec: řada 2, oblouk je jen pro 40 a 30 mm. Když ${TABLE} ukazuje u této řady „ne“ (šířka bez oblouku, jiný počet dírek, rozteč nebo odstup), nebo destička neprošla kontrolou, vytiskněte list 2 pro váš pásek na 100 % (odkaz pod krokem) a zkontrolujte kalibrační čtverec 50 × 50 mm. Řádek „List 2“ ${IN_TABLE} ukazuje, jestli list vyjde na výšku, na šířku, nebo když se na jeden list nevejde, na 2 listy na šířku (2a a 2b).`,
        animationLinks: [animationLink('beltHolesTip', 'B1'), animationLink('beltHolesTip', 'D1')],
        media: [],
        beltRecalls: ['tip', 'marking'],
      },
      {
        id: 'place',
        title: 'Přiložte na prostřední dírku',
        body: 'Pás a podložky přilepte jako v lekci 4, rubem nahoru. Prostřední otvor destičky (mezi dvěma křížky) položte na propíchnutou značku z lekce 5, hrany pásu na linky vaší šířky (šířka bez linky: podle příčné stupnice). Na linky se dívejte svisle dolů: linky jsou pod 3 mm akrylátu a při pohledu šikmo se zdají posunuté. Destičku nikdy neobracejte. Zkontrolujte, že obtahovaný tvar končí přesně na obou hranách pásu. Když přesahuje nebo nedosahuje, máte špatný oblouk nebo linku. S listem 2: list vystřihněte po obrysu konce a střed prostřední dírky propíchněte šídlem. Hrot šídla dejte do značky, list po šídle sesuňte na pás, boky srovnejte na hrany pásu a list přilepte páskou. Listy 2a a 2b mají prostřední dírku oba: přiložte je tak každý zvlášť.',
        animationLinks: [
          animationLink('beltHolesTip', 'B2'),
          animationLink('beltHolesTip', 'C1'),
          animationLink('beltHolesTip', 'D2'),
        ],
        media: [photo('belt-l6-place', 'Řada 1 destičky, prostřední otvor mezi křížky na značce')],
      },
      {
        id: 'mark',
        title: 'Označte v jednom přiložení',
        body: 'Označte zbylé dírky a obtáhněte tvar konce, aniž byste destičku nebo list zvedli. Přiložit je znovu na už vyseknutou dírku je nepřesné. Šídlem tlačte svisle a v otvorech kružte po stěně. U řady 1 obtahujte jen k hraně pásu, dál je výřez širší. U řady 2 veďte šídlo středem slotu, ne po stěně: jen střed slotu končí na hranách pásu a navazuje na ně. S listem 2 středy dírek propíchněte a obrys obtáhněte šídlem po okraji listu.',
        animationLinks: [
          animationLink('beltHolesTip', 'B3'),
          animationLink('beltHolesTip', 'C2'),
          animationLink('beltHolesTip', 'D2'),
        ],
        media: [],
      },
      {
        id: 'punch-holes',
        title: 'Vysekněte dírky',
        body: 'Dírky vysekněte výsečníkem s Ø dírek z aktivního pásku (např. 5 mm, vaše číslo je pod krokem).',
        animationLinks: [animationLink('beltHolesTip', 'E1')],
        media: [],
        beltRecalls: ['holeDiameter'],
      },
      {
        id: 'cut-tip',
        title: 'Uřízněte konec',
        body: 'Rovné boky hrotu řežte podél ocelového pravítka, nikdy podél destičky: čepel by akrylát poškodila. Nůž veďte tak, aby rýhu odebral. Vrchol R4 řízněte od ruky; s ocelovou rohovou šablonou přiložte lob Ø 8 mm na obtažený oblouk vrcholu a veďte nůž po oceli, ve 2–3 tazích. Zaoblený konec řežte od ruky po rýze v několika tazích (ověřte na odřezku), nebo výsečníkem na konec opasku.',
        animationLinks: [
          animationLink('beltHolesTip', 'E2'),
          animationLink('beltHolesTip', 'E3'),
          animationLink('beltHolesTip', 'E4'),
        ],
        media: [photo('belt-l6-cut', 'Nůž u ocelového pravítka řeže bok hrotu, destička odložená')],
      },
      {
        id: 'finish',
        title: 'Dokončete hrany',
        body: 'Pásku z rubu (značka 30 cm z lekce 3) sundejte. Srazte hrany posledních 30 cm a hranu nového konce. U barevného pásku je obarvěte jako v lekci 3 a nechte zaschnout. Pak je zaleštěte a natřete balzámem zbytek pásu, přes přechod z lekce 3 do ztracena, jen když balzám na odřezku vyhověl (jako v lekci 3).',
        animationLinks: [
          animationLink('beltHolesTip', 'F1'),
          animationLink('beltHolesTip', 'F2'),
          animationLink('edges', 'H1'),
          animationLink('edges', 'H2'),
          animationLink('edges', 'H3'),
        ],
        media: [],
        waits: [edgePaintWait(true)],
        recalls: edgePaintRecalls,
      },
      {
        id: 'try',
        title: 'Vyzkoušejte všechny dírky',
        body: 'Zapněte pásek na prostřední dírku, pak na krajní.',
        animationLinks: [animationLink('beltHolesTip', 'F3')],
        media: [],
        records: [
          {
            kind: 'choice',
            id: 'belt-fit-result',
            label: 'Prostřední dírka',
            options: [
              { value: 'ok', label: 'Sedí' },
              { value: 'off', label: 'Nesedí' },
            ],
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'one-placement',
        title: 'Dírky a tvar konce jsou označené v jednom přiložení a tvar končí na obou hranách.',
        required: true,
      },
      {
        slug: 'tip-cut',
        title:
          'Konec je uříznutý po rýze (boky hrotu podél ocelového pravítka, ne podél destičky) a hrany jsou zaleštěné.',
        required: true,
      },
      {
        slug: 'fits',
        title: 'Pásek sedí na prostřední dírce.',
        required: true,
      },
    ],
    commonMistakes: [
      'Řez podél destičky místo ocelového pravítka.',
      'Dírky a tvar konce ve dvou přiloženích.',
      'Zapomenutá hrana nového konce.',
      'Linky vyrovnané při pohledu šikmo, nebo obrácená destička.',
      'U řady 2 obtažená stěna slotu místo jeho středu: konec nenavazuje na hrany pásu.',
    ],
    safety: [KNIFE, PUNCH],
    prints: [
      sheet(
        'spicka',
        'List 2: dírky a konec místo řady 1 nebo 2 destičky (případně 2 listy, 2a a 2b)',
      ),
    ],
    requires: [
      { id: 'middle-mark', fromLesson: L5, label: 'Značka prostřední dírky propíchnutá na rub' },
    ],
    media: [photo('belt-l6-hero', 'Hotový pásek: hrot, pět dírek, přezka na dvou nýtech')],
  }),
];

/**
 * „Postup v kostce“: celá stavba v krátkých bodech, každý s odkazem na krok lekce. Jen výtah
 * z lekcí výše, nic nového. Čísla, která závisí na pásku (délka, dírky, poutko, šrouby), přehled
 * neopisuje: odkazuje na „Váš pásek“. Výtisky bod 6 bere z `prints` lekcí 2, 4 a 6.
 */
const overview: ProjectOverview = {
  intro:
    'Celá stavba v krátkých bodech. Čísla pro váš pásek (délka, dírky, poutko, šrouby) jsou ve „Váš pásek“, podrobnosti v lekci, na kterou bod odkazuje.',
  sections: [
    {
      title: 'Příprava',
      note: 'Lekce 1: míry, „Váš pásek“, nákup a destička. Pás zatím neřežte.',
      points: [
        {
          id: 'waist',
          lessonSlug: L1,
          stepId: 'waist',
          appLinks: [YOUR_BELT],
          text: 'Změřte obvod: na pásku, který nosíte, od ohybu u přezky (ne od konce trnu) k používané dírce, nebo krejčovským metrem přes poutka kalhot. Ve „Váš pásek“ ho zadejte spolu se šířkou podle přezky, koncem (hrot, nebo zaoblený) a barvou.',
          later: 'tloušťku pásu a trn přezky změříte, až pás přijde.',
        },
        {
          id: 'save-belt',
          lessonSlug: L1,
          stepId: 'your-belt',
          appLinks: [YOUR_BELT],
          text: 'Tloušťku zatím nechte 3,5 mm. Pásek pojmenujte a uložte do „Moje pásky“: podle aktivního pásku počítají lekce, „Připravte si“ i nákup.',
        },
        {
          id: 'order',
          lessonSlug: L1,
          stepId: 'order',
          appLinks: [
            { to: 'belt-config', label: 'Váš pásek: Koupit' },
            { to: 'shopping', label: 'Co koupit' },
          ],
          text: 'Chcete-li trénovat na odřezku téhož řemene, zaškrtněte ve „Váš pásek“ „Trénink na odřezku téhož řemene“ a pásek znovu uložte; jinak si připravte samostatný odřezek třísločiněné kůže podobné tloušťky. Pak objednejte vše ze souhrnu „Koupit“ nahoře ve „Váš pásek“, řemen v délce, kterou souhrn ukáže. K pásu napište do poznámky „prosím blíž k 3,5 mm“.',
        },
        {
          id: 'measure-strap',
          lessonSlug: L1,
          stepId: 'measure-strap',
          appLinks: [YOUR_BELT],
          text: 'Po dodání změřte posuvkou tloušťku pásu na řezu na několika místech a trn přezky u kořene; ve „Váš pásek“ zadejte průměr tloušťky, jak vyšel, a trn a pásek uložte. Trn smí mít nejvýš 5,5 mm. Když objednaný nýt nebo výsečník na dírky nesedí na čísla ve „Váš pásek“, objednejte jiný.',
        },
        {
          id: 'plate-check',
          lessonSlug: L1,
          stepId: 'plate-check',
          text: 'Destičku MK Plexi přeměřte podle kroku v lekci a výsledek zapište. Při odchylce ji vyfoťte s měřidlem, napište řezárně a značte jen listy.',
        },
        {
          id: 'sheets',
          lessonSlug: L1,
          stepId: 'plate-or-sheets',
          printsFrom: [L2, L4, L6],
          appLinks: [YOUR_BELT],
          text: 'U každé řady destičky ukazuje „Váš pásek“ „ano“, nebo „ne“; za řadu s „ne“ tisknete list: list 1 za řadu 3, list 2 za řadu 1 nebo 2. Vygenerované listy se neukládají: v lekci, která list chce, stiskněte ve „Váš pásek“ „Vygenerovat listy A4“ a tiskněte A4 na 100 %, kalibrační čtverec musí měřit 50 × 50 mm. Když se list 2 nevejde na jeden list A4, vyjde na 2 listy (2a a 2b), každý se přikládá prostřední dírkou na značku.',
        },
      ],
    },
    {
      title: 'Trénink na odřezku',
      note: 'Lekce 2: řez, značení, otvory, hrany, ohyb a nýt nejdřív na odřezku. Pásek zatím neřežte.',
      points: [
        {
          id: 'scrap',
          lessonSlug: L2,
          stepId: 'get-scrap',
          appLinks: [YOUR_BELT],
          text: 'Odřízněte asi 15 cm z konce, kde bude špička, jen když pás i bez nich stačí na nejkratší délku ve „Váš pásek“. Jinak trénujte na samostatném odřezku; nýt pak vyzkoušíte až na pásku.',
        },
        {
          id: 'scrap-cut',
          lessonSlug: L2,
          stepId: 'cut',
          text: 'Odřezek položte rubem nahoru a konec srovnejte kolmo: šídlem narýsujte čáru podél levé hrany destičky (s listem 1 podél spodní hrany listu). Řízněte podél ocelového pravítka, nikdy podél destičky.',
        },
        {
          id: 'scrap-mark',
          lessonSlug: L2,
          stepId: 'mark',
          text: 'Odřezek a podložky stejně silné jako pás přilepte k desce rubem nahoru. Řadu 3 destičky přiložte levou hranou na konec, hrany odřezku na linky vaší šířky (bez linky podle příčné stupnice), nebo použijte list 1. Šídlem označte dva otvory pro nýty blíž ke konci, 2 značky ohybu a obtáhněte ovál (s listem 1 propíchněte 2 černé otvory u konce, oba křížky oválu a oba červené kroužky ohybu).',
        },
        {
          id: 'scrap-punch',
          lessonSlug: L2,
          stepId: 'punch',
          text: 'Na tvrdé desce vysekněte Ø 6 mm oba otvory a oba konce oválu, výsečník na obtažené oblouky (s listem 1 středem na propíchnutý křížek). Boky oválu řízněte tečně a vedle vysekněte zkušební dírku pro trn. Roztřepené okraje: zkuste další otvor, výsečník kolmo; když to nepomůže, pásek nezačínejte.',
        },
        {
          id: 'scrap-edges',
          lessonSlug: L2,
          stepId: 'edge-bevel',
          text: 'Na hraně vyzkoušejte sražení, u barevného pásku barvu na hrany (zapište vrstvy a dobu schnutí), pak lesk s Tokonole, u barevného pásku až na zaschlou barvu. Na líc naneste balzám a zapište, jestli vzhled vyhovuje.',
        },
        {
          id: 'scrap-bend',
          lessonSlug: L2,
          stepId: 'bend',
          text: 'Značky ohybu spojte pravítkem a navlhčený odřezek na té čáře ohněte kolem příčky přezky, rubem k rubu; líc nesmí popraskat. Popraská-li i navlhčený, pásek nezačínejte.',
        },
        {
          id: 'scrap-screw',
          lessonSlug: L2,
          stepId: 'screw',
          appLinks: [YOUR_BELT],
          text: 'Skrz otvor blíž k ohybu označte druhou vrstvu, odřezek rozložte, vysekněte ji a nýt sešroubujte: nesmí se viklat. Viklá se nebo nedosáhne do závitu: objednejte nýt s dříkem podle „Váš pásek“.',
        },
      ],
    },
    {
      title: 'Stavba pásku',
      note: 'Lekce 3–6 na pásu. Hrany teď, dokud je pás rovný; dírky a konec až podle zkoušky na sobě.',
      points: [
        {
          id: 'square-end',
          lessonSlug: L3,
          stepId: 'square-end',
          text: 'Vyberte konec pro přezku, pás položte rubem nahoru a konec srovnejte kolmo jako na odřezku.',
          later: 'konec se špičkou uříznete v lekci 6.',
        },
        {
          id: 'mark-30',
          lessonSlug: L3,
          stepId: 'mark-30',
          text: 'Na konci se špičkou označte posledních 30 cm páskou na rubu, přečnívající přes hrany, bez vpichu do kůže; jejich hrany zatím neopracovávejte.',
        },
        {
          id: 'long-edges',
          lessonSlug: L3,
          stepId: 'bevel',
          text: 'Dlouhé hrany srazte a zaleštěte; u barevného pásku je předtím obarvěte jako na odřezku a leštěte až zaschlou barvu. Pás natřete balzámem teď, po ohnutí se pod ohyb nedostanete, ale jen když balzám na odřezku vyhověl; k pásce 30 cm ho rozetřete do ztracena. Nevyhověl: u přírodního pásku nejdřív vyzkoušejte jiný přípravek na odřezku, u barevného balzám vynechte.',
          later: 'hrany a balzám posledních 30 cm (lekce 6).',
        },
        {
          id: 'buckle-mark',
          lessonSlug: L4,
          stepId: 'mark',
          text: 'Pás s podložkami přilepte k desce rubem nahoru. Řadu 3 přiložte levou hranou přesně na konec, hrany pásu na linky vaší šířky (bez linky podle příčné stupnice), nebo použijte list 1. Šídlem označte 2 otvory pro nýty blíž ke konci, 2 značky ohybu a ovál; druhou dvojici neznačte (s listem 1 šedé otvory nepropichujte).',
        },
        {
          id: 'first-pair',
          lessonSlug: L4,
          stepId: 'first-pair',
          text: 'Vysekněte Ø 6 mm oba označené otvory. Značky ohybu nesekejte, spojte je na rubu pravítkem.',
          later: 'druhou dvojici otvorů až po ohnutí, skrz vyseknuté otvory.',
        },
        {
          id: 'oval',
          lessonSlug: L4,
          stepId: 'oval',
          text: 'Konce oválu vysekněte Ø 6 mm na obtažené oblouky (s listem 1 na křížek) a boky řízněte tečně jako na odřezku. Vnitřní hranu oválu srazte a zaleštěte teď, dokud je konec rovný; u barevného pásku ji předtím obarvěte a leštěte až zaschlou barvu.',
        },
        {
          id: 'keeper',
          lessonSlug: L4,
          stepId: 'keeper',
          appLinks: [YOUR_BELT],
          text: 'Papírovým proužkem změřte obvod 3 vrstev pásu; délka poutka = obvod + π × tloušťka poutka + 15 mm přeplátování, porovnejte ji s délkou ve „Váš pásek“. Z odřezku vyřízněte proužek 12 mm × tuto délku, rýhy na rubu po pravítku. Poutko mimo přeplátování 15 mm přelepte páskou (líc jednoho konce, rub druhého), volná místa zdrsněte a natřete kontaktním lepidlem, pásku sundejte, nechte zavadnout a slepte.',
        },
        {
          id: 'bend',
          lessonSlug: L4,
          stepId: 'bend',
          text: 'Poutko navlékněte na pás teď, před ohnutím, a posuňte ho dál než 180 mm od konce. Přezku nasaďte ozdobnou stranou k líci pásu a trn prostrčte oválem. Zónu ohybu navlhčete a konec ohněte kolem příčky rubem k rubu.',
        },
        {
          id: 'second-pair',
          lessonSlug: L4,
          stepId: 'second-pair',
          text: 'Poutko posuňte do kapsy mezi otvory, spojem na přehnutý konec. Přehnutý konec zatáhněte od přezky a druhou dvojici označte šídlem skrz už vyseknuté otvory.',
        },
        {
          id: 'screws',
          lessonSlug: L4,
          stepId: 'screws',
          text: 'Poutko odsuňte ke špičce dál než 180 mm od konce, konec rozložte a druhou dvojici vysekněte Ø 6 mm podle značek skrz otvory. Konec ohněte zpět s trnem v oválu a poutko vraťte do kapsy, spojem na přehnutý konec. Nýty sešroubujte hlavičkou z líce, s kapkou zajišťovače závitů.',
        },
        {
          id: 'fit',
          lessonSlug: L5,
          stepId: 'try-on',
          appLinks: [YOUR_BELT],
          text: 'Pásek provlékněte poutky kalhot, ve kterých ho budete nosit, utáhněte na pohodlí a tužkou udělejte tečku na pásce nalepené na líci, kam tlačí hrot trnu: to je prostřední dírka. Změřte ji od ohybu; když sedí, tečku jednou propíchněte šídlem na rub a ověřte, že od značky ke konci zbývá aspoň vzdálenost prostřední dírky od konce z „Váš pásek“. Nezbývá: ve „Váš pásek“ pod „Dírky (pokročilé)“ zkuste méně dírek nebo kratší odstup první dírky a značte listem 2.',
        },
        {
          id: 'holes-mark',
          lessonSlug: L6,
          stepId: 'place',
          text: 'Řadu 1 (hrot) nebo 2 (zaoblený konec), nebo list 2, přiložte prostředním otvorem na značku, hrany pásu na linky vaší šířky (bez linky podle příčné stupnice). Dírky a tvar konce označte v jednom přiložení.',
        },
        {
          id: 'punch-cut',
          lessonSlug: L6,
          stepId: 'punch-holes',
          appLinks: [YOUR_BELT],
          text: 'Vysekněte dírky výsečníkem podle „Váš pásek“. Rovné boky hrotu uřízněte podél ocelového pravítka, nikdy podél destičky. Vrchol R4 a zaoblený konec řežte od ruky po rýze, nebo vrchol podle ocelové rohové šablony a zaoblený konec výsečníkem na konec opasku.',
        },
        {
          id: 'finish',
          lessonSlug: L6,
          stepId: 'finish',
          text: 'Pásku 30 cm sundejte, hrany posledních 30 cm a nového konce srazte a zaleštěte; u barevného pásku je předtím obarvěte jako v lekci 3 a leštěte až zaschlou barvu. Zbytek pásu natřete balzámem do ztracena přes přechod, jen když na odřezku vyhověl (jako v lekci 3), a vyzkoušejte všechny dírky.',
        },
      ],
    },
  ],
};

export const beltProject: ProjectDefinition = {
  slug: PROJECT_SLUG,
  code: '04',
  title: 'Pásek',
  summary:
    'Pásek z hotového pásu třísločiněné kůže: šířku, tloušťku, délku a konec si volíte, čísla a listy spočítá aplikace.',
  description:
    'Čtvrtý projekt: pásek bez šití z hotového pásu 3–4 mm. Přezka drží na dvou šroubovacích nýtech, poutko je z odřezku, konec je hrot nebo zaoblený. Pásek není jeden výrobek: ve formuláři „Váš pásek“ zadáte šířku podle přezky, změřenou tloušťku, obvod a konec a aplikace spočítá délku pásu, dírky, poutko, nýt, nákup a řekne, jestli stačí destička, nebo si vytisknete listy. Nikdo pásek podle tohoto postupu zatím nepostavil: co podklady neověřují, vyzkoušejte na odřezku. Časy lekcí jsou hrubý odhad.',
  difficulty: 'intermediate',
  estimatedHours: { min: 6, max: 10 },
  skills: [
    'Míry pásku z obvodu a volba šířky, tloušťky a konce',
    'Značení destičkou nebo listy 1:1',
    'Výsečníky a ovál pro trn v silné kůži',
    'Ohyb silné kůže a registrace otvorů skrz přehnutí',
    'Šroubovací nýty podle tloušťky',
    'Hrany dlouhého pásu',
  ],
  phases: [...phases],
  equipment: [
    {
      equipmentSlug: 'belt-strap',
      priority: 'required',
      reason: 'Celý pásek; odřezek na trénink, jen když je pás o 15 cm delší než nejkratší délka.',
      specification:
        'Třísločiněný pás 3,0–4,0 mm, přírodní nebo barevný, v šířce přezky, aspoň nejkratší délka z tabulky „Váš pásek“ (+ 15 cm na odřezek k tréninku). Po dodání změřit.',
    },
    {
      equipmentSlug: 'belt-buckle',
      priority: 'required',
      reason: 'Zapínání pásku.',
      specification: 'Jednotrnová, vnitřní světlost = šířka pásu.',
    },
    {
      equipmentSlug: 'chicago-screws',
      priority: 'required',
      reason: 'Dva nýty drží přezku na přehnutém konci.',
      specification:
        '2 ks, hlavička Ø 10 mm, dřík podle tabulky „Váš pásek“ (10/6 na pás 3,5–3,75 mm).',
    },
    {
      equipmentSlug: 'hole-punch-5mm',
      priority: 'required',
      reason: 'Dírky pro trn.',
      specification: 'Ø = trn u kořene + 0,5 mm; u přezky 40 mm 4,5 nebo 5 mm.',
    },
    {
      equipmentSlug: 'hole-punch-6mm',
      priority: 'required',
      reason: 'Čtyři otvory pro nýty a oba konce oválu.',
      specification: 'Dutý výsečník Ø 6 mm.',
    },
    {
      equipmentSlug: 'scratch-awl',
      priority: 'required',
      reason: 'Značení na rubu skrz otvory destičky nebo list.',
      specification: 'Kulaté šídlo, které projde otvorem Ø 2 mm destičky (ověřit).',
    },
    {
      equipmentSlug: 'steel-ruler',
      priority: 'required',
      reason: 'Vedení nože u konce pásu a hrotu, spojení značek ohybu.',
      specification: 'Ocelové 30 cm.',
    },
    {
      equipmentSlug: 'utility-knife',
      priority: 'required',
      reason: 'Konec pásu, boky oválu, hrot, poutko.',
      specification: 'Odlamovací nůž 18 mm s novými čepelemi.',
    },
    {
      equipmentSlug: 'cutting-mat',
      priority: 'required',
      reason: 'Podklad pro řezání.',
      specification: 'Samohojivá A3.',
    },
    {
      equipmentSlug: 'mallet',
      priority: 'required',
      reason: 'Úder do výsečníků.',
      specification: 'Gumová nebo plastová.',
    },
    {
      equipmentSlug: 'punching-board',
      priority: 'required',
      reason: 'Tvrdá deska pod vysekávání.',
      specification: 'HDPE deska nebo plastové prkénko.',
    },
    {
      equipmentSlug: 'digital-caliper',
      priority: 'required',
      reason: 'Tloušťka pásu (podle ní dřík nýtu) a trn přezky (podle něj Ø dírek).',
      specification: 'Posuvka 150 mm, digitální nebo analogová (s noniem).',
    },
    {
      equipmentSlug: 'edge-burnisher',
      priority: 'required',
      reason: 'Leštění dlouhých hran, oválu a nového konce.',
      specification: 'Tokonole a leštítko, nebo plátno.',
    },
    {
      equipmentSlug: 'sandpaper',
      priority: 'required',
      reason: 'Zaoblení hran bez ořezávače.',
      specification: 'Zrnitost 180–240 na hranolku; volitelně jemnější 320–800.',
    },
    {
      equipmentSlug: 'contact-cement',
      priority: 'required',
      reason: 'Přeplátování poutka.',
      specification: 'Kontaktní lepidlo na kůži, na obě strany, zavadnout podle návodu.',
    },
    {
      equipmentSlug: 'leather-balm',
      priority: 'required',
      reason: 'Přírodní pás se bez úpravy hned ušpiní. U barevného jen, když na odřezku vyhoví.',
      specification: 'Balzám na třísločiněnou kůži; vzhled ověřit na odřezku.',
    },
    {
      equipmentSlug: 'edge-paint',
      priority: 'recommended',
      reason:
        'Jen u barevného pásku: řezaná hrana bývá světlá a před leštěním se obarví (zkouška v lekci 2, hrany v lekcích 3, 4 a 6).',
      specification:
        "Barva na hrany v odstínu pásu; odstín a přilnavost ověřit na odřezku. Ověřené příklady v katalogu jsou Fiebing's Edge Kote hnědá, tmavě hnědá a černá.",
    },
    {
      equipmentSlug: 'edge-beveler',
      priority: 'recommended',
      reason: 'Sražení hran 3,5 mm kůže, máte-li ho.',
      specification: 'Velikost pro 3,5 mm není ověřená; vyzkoušet na odřezku.',
      alternatives: ['hrany zaoblit brusným papírem na hranolku'],
    },
    {
      equipmentSlug: 'corner-template',
      priority: 'recommended',
      reason: 'Vrchol hrotu R4 podle ocelového lobu Ø 8 mm.',
      specification: 'Ocelová „květina“; akrylová se jako vodítko nože nehodí.',
      alternatives: ['vrchol R4 říznout od ruky'],
    },
    {
      equipmentSlug: 'belt-end-punch',
      priority: 'later',
      reason: 'Konec jedním úderem, až budete dělat víc pásků.',
      specification: 'V šířce pásu; tvar hrotu ověřit proti destičce.',
    },
  ],
  lessons: [...lessons],
  patternSheets: {
    sheets: [
      {
        id: 'prezka',
        title: 'List 1 – konec u přezky a poutko',
        note: 'Ovál pro trn 25 × 6 mm, 4 otvory pro 2 nýty, ohyb 90 mm od konce a pásek na poutko. Místo řady 3 destičky (lekce 2, 3 a 4).',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
      },
      {
        id: 'spicka',
        title: 'List 2 – špička a dírky',
        note: 'Dírky s prostřední dírkou a tvar konce. Místo řady 1 nebo 2 destičky (lekce 6).',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
      },
    ],
    calibrationMm: 50,
    printNote:
      'Tisk na A4 na 100 % (bez přizpůsobení stránce). Kalibrační čtverec musí měřit 50 × 50 mm. Listy jsou záloha za destičku: tiskněte jen list za řadu, u které tabulka „Váš pásek“ ukáže „ne“.',
    defaultVariantLabel: 'Výchozí: 40 mm, 3,5 mm, hrot, 5 dírek po 25 mm',
    browserGenerator: 'belt-config',
    variantsNote:
      'Předem připravené jsou jen listy pro 40 mm, 3,5 mm a hrot. Pro jinou šířku, tloušťku, zaoblený konec nebo jiné dírky vyplňte „Váš pásek“ a stiskněte „Vygenerovat listy A4“. Stejné listy kreslí generátor v repozitáři („pnpm pattern:belt-end“).',
  },
  shoppingPlan: {
    title:
      'Výchozí sestava (váš výběr): modrý pásek 40 mm z pásu Andexnite 3,5–3,7 mm, černá přezka Andexnite a černé nýty z CraftPointu. Na šířce závisí pás (varianta šířky) a přezka, na změřené tloušťce dřík nýtu, na trnu přezky výsečník dírek. Uložte pásek na stránce „Váš pásek“ a plán se přepočítá podle něj.',
    lines: [
      {
        equipmentSlug: 'belt-strap',
        url: 'https://andexnite.cz/produkt/hovezi-kuze-na-opasek-modra-130-cm-3-5-3-7-mm/',
        variant: '40 mm',
        quantity: 1,
        purpose:
          'modrý pás 40 mm, 130 cm (poslední kus 9. 10. 2026); činění neuvedeno, ověřte u prodejce. 130 cm stačí do obvodu 106,5 cm. Andexnite: doprava do 500 Kč 120 Kč, od 501 Kč 80 Kč, od 1 500 Kč zdarma',
      },
      {
        equipmentSlug: 'belt-buckle',
        url: 'https://andexnite.cz/produkt/opaskova-prezka-40-mm-cerny-nikl-2/',
        quantity: 1,
        purpose:
          'přezka = šířka pásu, černý nikl, jeden trn podle fotky; stejný obchod a zásilka jako pás',
      },
      {
        equipmentSlug: 'chicago-screws',
        url: 'https://craft-point.cz/products/sroubovaci-nyty-10-6mm-cerny-nikl',
        quantity: 2,
        purpose:
          '10/6 černý nikl k černé přezce, jen na pás 3,5–3,75 mm; při 3,7 mm sedí i Leatory 1/4" (6,35 mm). Jiný obchod než pás (CraftPoint, doprava 150 Kč), zásilka spolu s výsečníkem a balzámem',
      },
      {
        equipmentSlug: 'hole-punch-6mm',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        variant: 'Ø 6 mm',
        quantity: 1,
        purpose: 'otvory pro nýty a konce oválu',
      },
      {
        equipmentSlug: 'hole-punch-5mm',
        url: 'https://www.enaradinastroje.cz/kruhovy-vysecnik-format-5mm/',
        quantity: 1,
        purpose:
          'dírky pro trn; Ø = trn + 0,5 mm. U CraftPointu je 5 mm vyprodaný; sada 2–5 mm, která 5 mm obsahuje, ušetří druhou zásilku',
      },
      {
        equipmentSlug: 'leather-balm',
        url: 'https://craft-point.cz/products/fiebings-leather-balm-with-atom-wax-balzam-s-voskem-118-ml',
        quantity: 1,
        purpose: 'barevný pás: jen když na odřezku vyhoví vzhled (lekce 2)',
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
        equipmentSlug: 'sandpaper',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        variant: 'zrnitost 180',
        quantity: 1,
        purpose: 'z projektu 02; zaoblení hran',
      },
      {
        equipmentSlug: 'contact-cement',
        url: 'https://craft-point.cz/products/fiebings-leather-craft-cement-lepidlo-na-kuzi-118-ml',
        quantity: 1,
        purpose: 'z projektu 02; přeplátování poutka',
      },
      {
        equipmentSlug: 'scratch-awl',
        url: 'https://craft-point.cz/products/sedlarske-sidlo-hruska',
        quantity: 1,
        purpose: 'z projektu 02; že projde otvorem Ø 2 mm destičky, ověřte',
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
        equipmentSlug: 'mallet',
        url: 'https://craft-point.cz/products/horizontalni-palicka-na-kuzi',
        quantity: 1,
        purpose: 'z projektu 02',
      },
      {
        equipmentSlug: 'punching-board',
        url: 'https://www.ikea.com/cz/cs/p/legitim-kuchynske-prkenko-bila-90202268/',
        quantity: 2,
        purpose: 'z projektu 02; online jen po 2 ks, v obchodním domě stačí 1',
      },
      {
        equipmentSlug: 'digital-caliper',
        url: 'https://unihobby.cz/meritko-digitalni-posuvne-150-mm',
        quantity: 1,
        purpose: 'z projektu 03',
      },
    ],
    skipped: [
      {
        equipmentSlug: 'edge-beveler',
        reason:
          'Jen pokud ho máte; velikost pro 3,5 mm není ověřená. Hrany zaoblíte i brusným papírem na hranolku.',
      },
      {
        equipmentSlug: 'corner-template',
        reason: 'Jen pokud ji máte; vrchol hrotu R4 jde říznout od ruky.',
      },
      {
        equipmentSlug: 'belt-end-punch',
        reason:
          'Pro jeden pásek se nevyplatí: konec uříznete nožem podle destičky nebo listu 2. Tvar hrotu výsečníku ověřte proti destičce.',
      },
      {
        equipmentSlug: 'edge-paint',
        reason:
          'Jen u barevného pásku. Ověřenou modrou barvu na hrany nemáme: odstín ověřte u prodejce a na odřezku. U hnědé, tmavě hnědé a černé ji „Připravte si“ a „Co koupit“ přidají podle barvy z „Váš pásek“.',
      },
    ],
    alsoNeeded: [
      'destička MK Plexi (máte ji), nebo tiskárna A4 na listy 1 a 2',
      'krejčovský metr, když nemáte pásek na změření obvodu',
      'oboustranná lepicí páska a dvě lišty nebo odřezky stejně silné jako pás (lekce 2, 4 a 6)',
      'odřezek kůže na poutko a papírový proužek na jeho změření (lekce 4)',
      'papírová páska a tužka na značky bez vpichu (lekce 3, 4 a 5)',
      'zajišťovač závitů nebo lak na nýty (lekce 4)',
      'plochý šroubovák podle drážky šroubku nýtu (lekce 2 a 4)',
      'voda a houbička na ohyb, plátno na leštění',
    ],
  },
  overview,
  media: [photo('belt-hero', 'Hotový pásek s přezkou na dvou nýtech, poutkem a hrotem')],
  contentVersion: 1,
  reviewStatus: 'draft',
};

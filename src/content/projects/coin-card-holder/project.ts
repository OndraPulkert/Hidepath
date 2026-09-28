import {
  type LessonDefinition,
  type PhaseDefinition,
  type ProjectDefinition,
} from '@/content/schema';

/**
 * Projekt 02 – Pouzdro na karty s vsazenou mincí. Obsah je NÁVRH (draft), stejně jako střih
 * samotný (docs/zadani/pouzdro-mince.md, v4.8). Druhý projekt podle ADR 002: staví na
 * dovednostech pouzdra na karty (rovný řez, děrování vidličkami, sedlářský steh, hrany) a
 * trénuje jen to, co je nové – mokré tvarování, ztenčení kůže, kování a šití třemi vrstvami.
 * Forma na tvarování: docs/zadani/pouzdro-mince-forma.md.
 */

export const PROJECT_SLUG = 'coin-card-holder';

export const phases: readonly PhaseDefinition[] = [
  { slug: 'enroll', code: '01', name: 'Výběr projektu', kind: 'enrollment' },
  { slug: 'equipment', code: '02', name: 'Vybavení', kind: 'equipment' },
  { slug: 'practice', code: '03', name: 'Trénink nových technik', kind: 'lessons' },
  { slug: 'build', code: '04', name: 'Výroba pouzdra', kind: 'lessons' },
  { slug: 'review', code: '05', name: 'Hodnocení', kind: 'completion' },
];

const draft = <T extends Omit<LessonDefinition, 'reviewStatus'>>(l: T): LessonDefinition => ({
  ...l,
  reviewStatus: 'draft',
});

const L1 = '01-paper-model';
const L2 = '02-wet-forming-coin';
const L3 = '03-skiving-and-hardware';
const L4 = '04-fold-and-stitch-scrap';
const L5 = '05-strip-and-skive-marks';
const L6 = '06-coin-pocket-and-hardware';
const L7 = '07-fold-glue-stitch-bottom';
const L8 = '08-snap-cap-tongue-edges';

export const lessons: readonly LessonDefinition[] = [
  draft({
    slug: L1,
    title: 'Papírový model',
    order: 1,
    phaseSlug: 'practice',
    estimatedMinutes: 30,
    goal: 'Poskládat papírový model se skutečnými kartami a bankovkami a zapsat, co ukázal, dřív než se řízne do kůže.',
    materials: [
      'vytištěný list PAPÍROVÝ MODEL na papír 160 g (zkontrolovaná kalibrační úsečka 50 mm)',
      'tenká lepenka na podlepení (krabice od cereálií)',
      'nůžky a lepidlo v tyčince',
      'karty a bankovky, které opravdu nosíte',
      'tužka a papír na zapsání výsledků',
    ],
    requiredEquipment: [],
    recommendedEquipment: ['steel-ruler'],
    prerequisiteLessons: [],
    steps: [
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte list',
        body: 'Tisk na A4 bez přizpůsobení velikosti („skutečná velikost“, 100 %). Změřte kalibrační úsečku: musí mít přesně 50 mm. Papírový model prokáže polohu jazyka a kloboučku, výřez, průchodku, vytahování karty a místo pro kapsu – neprokáže ale přídavek ohybů, protože papír je tenčí než kůže.',
        media: [],
      },
      {
        id: 'glue-and-cut',
        title: 'Nalepte na lepenku a vystřihněte',
        body: 'Výtisk nalepte na tenkou lepenku (stačí krabice od cereálií), aby model držel tvar, a vystřihněte podle obrysu.',
        media: [
          {
            id: 'cch-l1-cut',
            kind: 'photo',
            caption: 'Papírový model nalepený na tenké lepence, nůžky vedle vystřiženého obrysu',
            status: 'planned',
          },
        ],
      },
      {
        id: 'fold-loop',
        title: 'Ohyby jen přehněte do smyčky',
        body: 'Oba ohyby jen přehněte do měkké smyčky, nepřekládejte je na ostro. Skutečný přídavek ohybu stejně papír neprokáže, protože je tenčí než kůže.',
        media: [],
      },
      {
        id: 'insert-contents',
        title: 'Vložte karty a bankovky',
        body: 'Vložte karty i bankovky, které opravdu nosíte, přehněte jazyk přes horní hranu a přiložte ho přes vytištěnou značku patice. Šídlem tam propíchněte skrz obě vrstvy, abyste si na jazyku zaznamenali přesné místo – papír na rozdíl od kůže obtisk sám neukáže.',
        media: [
          {
            id: 'cch-l1-contents',
            kind: 'photo',
            caption:
              'Do papírového modelu vložené karty a bankovky, jazyk přehnutý přes horní hranu',
            status: 'planned',
          },
        ],
      },
      {
        id: 'checklist',
        title: 'Projděte kontrolní seznam a zapište výsledky',
        body: 'Zapište: (1) o kolik mm a kterým směrem se propíchnuté místo liší od vytištěné značky patice a kolik jazyka zbývá za ním (cíl 11 mm + rezerva); (2) kolik mm karty je vidět ve výřezu (cíl 19 mm) a jestli jde palcem vysunout; (3) je celý kroužek průchodky vidět zepředu i zezadu; (4) které bankovky jdou napůl a kolik mm přečnívají nahoře a v boku; (5) konec jazyka vůči horní hraně kapsy po zkrácení (cíl asi 15 mm nad ní); (6) skutečný počet karet a tloušťku bankovek, které opravdu nosíte, oproti výchozím 4 × 0,76 mm a 2 mm. Pokud se liší, střih by bylo potřeba přepočítat – to zatím aplikace neumí.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'model-folded',
        title:
          'Papírový model je slepený, ohyby přehnuté do smyčky (ne na ostro) a karty i bankovky se do něj vejdou.',
        required: true,
      },
      {
        slug: 'checklist-recorded',
        title:
          'Všech šest bodů kontrolního seznamu je zapsaných, včetně skutečného počtu karet a tloušťky bankovek.',
        required: true,
      },
      {
        slug: 'cards-visible',
        title: 'Ve výřezu je vidět asi 19 mm karty a jde palcem vysunout.',
        required: false,
      },
    ],
    commonMistakes: [
      'Přeložení ohybu na ostro místo do smyčky: ohyby se jen přehýbají do smyčky, nepřekládají na ostro.',
      'Přeskočení zápisu výsledků: bez čísel z modelu se počet karet a tloušťka bankovek, které opravdu nosíte, jen odhadují.',
    ],
    safety: ['Nůžky odkládejte hroty od sebe, ne přes okraj stolu.'],
    media: [
      {
        id: 'cch-l1-hero',
        kind: 'photo',
        caption: 'Poskládaný papírový model pouzdra s vloženými kartami a bankovkami',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L2,
    title: 'Tvarování důlku za mokra na odřezku',
    order: 2,
    phaseSlug: 'practice',
    estimatedMinutes: 30,
    goal: 'Vyvrtat formu na tvarování, vytvarovat na ní za mokra důlek na minci do odřezku kůže a poznat, jak vypadá dost hluboký důlek.',
    materials: [
      'vytištěný list KAPSA (zkontrolovaná kalibrační úsečka 50 mm)',
      'dvě desky na formu a víko (překližka nebo tvrdý plast, aspoň 8 mm) a odpadní prkno pod vrtání',
      'aku vrtačka s vykružovací pilou nebo Forstnerovým vrtákem podle průměru otvoru',
      'odřezek třísločiněné kůže 1,2 mm, aspoň 70 × 70 mm',
      'mince, na kterou stavíte střih',
      'potravinová fólie',
      'houbička a voda',
      'smirkový papír na zaoblení hrany vyvrtaného otvoru',
    ],
    requiredEquipment: [
      'veg-tan-leather',
      'coin-forming-block',
      'clamps',
      'scratch-awl',
      'sandpaper',
    ],
    recommendedEquipment: [],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'drill-form',
        title: 'Vyvrtejte formu',
        body: 'Vytiskněte list KAPSA na 100 % (zkontrolujte úsečku 50 mm), vystřihněte kružnici otvoru formy a nalepte na desku. Desku upněte svěrkou ke stolu, pod ni dejte odpadní prkno. Vrtejte na první rychlost, bez příklepu, netlačte silou, s nabitou baterií. Vykružovací pilou provrtejte do půlky, desku otočte a dokončete z druhé strany podle dírky středicího vrtáku. Forstnerovým vrtákem (sukovníkem) místo toho vrtejte rovnou skrz a průběžně ho vytahujte, ať se zbaví pilin. Nakonec zaoblete horní hranu otvoru smirkovým papírem.',
        media: [],
      },
      {
        id: 'mark-outline',
        title: 'Orýsujte obrys a střed',
        body: 'Na odřezek orýsujte obrys kapsy a střed (křížek) podle listu KAPSA – podle křížku forma vystředíte. Otvory švu na tréninkovém odřezku dělat nemusíte, jde jen o důlek.',
        media: [],
      },
      {
        id: 'wrap-coin',
        title: 'Zabalte minci do fólie',
        body: 'Minci zabalte do potravinové fólie. Mokrá třísločiněná kůže se od kovu může tmavě zabarvit.',
        media: [],
      },
      {
        id: 'wet',
        title: 'Navlhčete kůži',
        body: 'Kůži navlhčete houbičkou, nemáčejte ji. Počkejte, až povrch začne zase mírně světlat – to je správná chvíle na tvarování.',
        media: [],
      },
      {
        id: 'press-and-clamp',
        title: 'Vtlačte do formy a stáhněte svěrkami',
        body: 'Kůži lícem dolů položte na formu, křížek (střed) nad středem otvoru. Zabalenou minci položte na rub nad otvor, přiklopte víkem a dvěma svěrkami proti sobě rovnoměrně stáhněte, aby se víko nenaklonilo.',
        media: [
          {
            id: 'cch-l2-clamped',
            kind: 'photo',
            caption:
              'Odřezek kůže stažený dvěma svěrkami mezi formou a víkem, mince na rubu nad otvorem',
            status: 'planned',
          },
        ],
      },
      {
        id: 'dry-and-inspect',
        title: 'Nechte zaschnout a prohlédněte důlek',
        body: 'Nechte úplně zaschnout, jistější je přes noc. Pak rozepněte a zkontrolujte: důlek má být dost hluboký a bez zvrásnění na okraji; mince do něj má jít zasunout i vysunout, forma počítá se záměrnou vůlí.',
        media: [
          {
            id: 'cch-l2-dimple',
            kind: 'photo',
            caption: 'Hotový vytvarovaný důlek na odřezku s vloženou mincí, detail hladkého okraje',
            status: 'planned',
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'form-drilled',
        title: 'Forma má vyvrtaný otvor podle listu KAPSA, hrana otvoru je zaoblená smirkem.',
        required: true,
      },
      {
        slug: 'dimple-even',
        title:
          'Důlek je dost hluboký a bez zvrásnění na okraji; mince do něj jde zasunout i vysunout.',
        required: true,
      },
      {
        slug: 'second-try',
        title: 'Druhý pokus vyšel lépe než první.',
        required: false,
      },
    ],
    commonMistakes: [
      'Mělký nebo na okraji zvrásněný důlek: kůže byla málo vlhká, nebo svěrky utažené slabě.',
      'Kůže v důlku moc ztenčená: byla moc mokrá, nebo svěrky přetažené.',
      'Svěrky utažené jen z jedné strany: víko se nakloní.',
      'Mince bez fólie: mokrá třísločiněná kůže se od kovu může tmavě zabarvit.',
    ],
    safety: ['Celý postup nejdřív zkuste na odřezku, ne na finální kapse.'],
    media: [
      {
        id: 'cch-l2-hero',
        kind: 'photo',
        caption: 'Forma se svěrkami a vytvarovaný odřezek s důlkem na minci vedle sebe',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L3,
    title: 'Ztenčení ohybu a kování naplocho na odřezku',
    order: 3,
    phaseSlug: 'practice',
    estimatedMinutes: 35,
    goal: 'Ztenčit pásmo ohybu na odřezku na 1 mm a naplocho osadit druk i průchodku, než to zkusíte na finálním pásu.',
    materials: [
      '2–3 odřezky třísločiněné kůže na osazení kování; na trénink ztenčení odřezek silnější než 1,3 mm – při kůži 1,2 mm (Verde) se ztenčení i tenhle krok přeskakuje',
      'kus dřeva nebo tvrdé desky pod osazování kování',
    ],
    requiredEquipment: [
      'scratch-awl',
      'snap-fastener',
      'grommet',
      'hole-punch-5mm',
      'mallet',
      'punching-board',
    ],
    recommendedEquipment: ['veg-tan-leather', 'safety-skiver'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení',
        body: 'Odřezek nemá vyznačené čáry ohybu – narýsujte si tedy dvě rovnoběžné čáry asi 10 mm od sebe (tolik má na pásu ohyb B, přesně 9,92 mm), budou zastupovat obě čáry ohybu. Šídlem propíchněte oba jejich konce skrz, na rubu je spojte a od každé čáry odsaďte dalších 3 mm ven. Ztenčovat se bude celé pásmo mezi čarami plus tento přesah na obou stranách – asi 16 mm celkem.',
        media: [],
      },
      {
        id: 'skive',
        title: 'Ztenčete z rubu na 1 mm',
        body: 'Bezpečnostním ztenčovačem odebírejte tenké hobliny, čepel veďte skoro naplocho, ne kolmo. Průběžně kontrolujte tloušťku – cíl je asi 1 mm, ne proříznutí naskrz. Na finálním pásu z kůže 1,2 mm (Verde) se tenhle krok přeskakuje – ztenčení tam není potřeba.',
        media: [
          {
            id: 'cch-l3-skive',
            kind: 'video',
            caption:
              'Bezpečnostní ztenčovač odebírá tenké hobliny z rubu kůže v odsazeném pásu ohybu',
            status: 'planned',
            durationSeconds: 40,
          },
        ],
      },
      {
        id: 'punch-post-hole',
        title: 'Vysekněte otvor pro dřík druku',
        body: 'Výsečníkem na dřík, který je součástí sady druku, vysekněte otvor pro dřík patice. Dřík je stavěný na 2 × 1,5 mm kůže (dvě vrstvy) – to je jeho délka, ne velikost otvoru, který jen odpovídá průměru dříku.',
        media: [],
      },
      {
        id: 'set-snap-post',
        title: 'Osaďte patici druku',
        body: 'Patici osaďte naplocho osazovačem a jedním pevným úderem paličky, přesně na značku. Zkontrolujte, že sedí naplocho a pevně.',
        media: [
          {
            id: 'cch-l3-snap',
            kind: 'photo',
            caption: 'Osazovač druku nad patici na odřezku, palička ve výchozí poloze nad ním',
            status: 'planned',
          },
        ],
      },
      {
        id: 'punch-grommet-hole',
        title: 'Vysekněte otvor pro průchodku',
        body: 'Výsečníkem Ø 5 mm na tvrdé podložce vysekněte otvor pro průchodku.',
        media: [],
      },
      {
        id: 'set-grommet',
        title: 'Osaďte průchodku',
        body: 'Obě půlky průchodky s podložkou osaďte naplocho osazovačem, přesně na značku. Zkontrolujte, že sedí naplocho a pevně.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'skive-clean',
        title:
          'Ztenčené pásmo má rovnoměrnou tloušťku asi 1 mm, bez proříznutí naskrz. U kůže 1,2 mm (Verde) se tenhle krok přeskakuje.',
        required: false,
      },
      {
        slug: 'hardware-set',
        title: 'Patice druku i průchodka sedí naplocho, pevně a přesně na značce.',
        required: true,
      },
    ],
    commonMistakes: [
      'Ztenčovač skoro kolmo místo naplocho: prořízne kůži naskrz.',
      'Otvor pro dřík moc velký: patice se v kůži viklá.',
      'Úder osazovače šikmo: kování nesedne souose a drží volně.',
    ],
    safety: ['Čepel vyměňte, jakmile začne trhat místo řezat.'],
    media: [
      {
        id: 'cch-l3-hero',
        kind: 'photo',
        caption:
          'Odřezek s viditelně ztenčeným pásmem ohybu a naplocho osazeným drukem i průchodkou',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L4,
    title: 'Skládání a šev tří vrstev na odřezku',
    order: 4,
    phaseSlug: 'practice',
    estimatedMinutes: 45,
    goal: 'Naplocho prosekat otvory zrcadlené přes ohyby, poskládat proužek do dvou ohybů kolem skutečného obsahu a sešít tři vrstvy dohromady, dřív než to uděláte na finálním pásu.',
    materials: [
      'jeden souvislý proužek kůže se třemi panely a dvěma ohyby (dost velký odřezek)',
      'pár karet zabalených v potravinové fólii jako náhrada obsahu',
      'houbička a voda na navlhčení ohybů',
      'kostěná rozhrnovačka (bone folder) nebo hrana pravítka',
      'sponky s podložkou na sepnutí ohybů při schnutí',
      'nit asi 1 m',
    ],
    requiredEquipment: [
      'veg-tan-leather',
      'stitching-chisels',
      'mallet',
      'punching-board',
      'harness-needles',
      'waxed-thread',
      'steel-ruler',
      'contact-cement',
      'sandpaper',
    ],
    recommendedEquipment: ['scratch-awl', 'wing-divider'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'mark-mirrored-dots',
        title: 'Vyznačte otvory dna zrcadlené přes ohyby',
        body: 'Na plochém, ještě nepřeloženém proužku narýsujte linii švu 3,5 mm od dolní hrany na všech třech panelech. Polohu otvorů odměřte od obou čar ohybu tak, aby byly na sousedních panelech zrcadlené kolem ohybu – jen tak budou po složení lícovat.',
        media: [],
      },
      {
        id: 'punch-flat',
        title: 'Prosekejte otvory naplocho',
        body: 'Prosekejte vidličkami otvory dna na plochém proužku, panel po panelu – přesně jako to čeká finální pás. Naplocho, ještě nepřeložené, se to prosekává čistěji než skrz už složené vrstvy.',
        media: [],
      },
      {
        id: 'wet-fold-zones',
        title: 'Navlhčete pásma ohybů',
        body: 'Obě pásma ohybů navlhčete houbičkou, ne kůži plošně.',
        media: [],
      },
      {
        id: 'fold-around-content',
        title: 'Přeložte kolem obsahu',
        body: 'Přeložte proužek kolem zabalených karet, přejeďte rozhrnovačkou nebo hranou pravítka a sepněte sponkami přes podložku. Než necháte zaschnout, zkontrolujte, že se naplocho prosekané otvory na sousedních panelech po složení lícují. Ohyb A se neztenčuje, jen se přeloží – pokud je na odřezku moc tuhý, zapište si to do poznámek z tréninku. Nasucho nebo na ostro přeložený líc nejspíš praská – proto je navlhčení a smyčka místo ostrého přehybu klíčové.',
        media: [
          {
            id: 'cch-l4-fold',
            kind: 'photo',
            caption:
              'Navlhčený proužek přeložený kolem zabalených karet, sepnutý sponkami přes podložku',
            status: 'planned',
          },
        ],
      },
      {
        id: 'saddle-stitch-reminder',
        title: 'Připomeňte si sedlářský steh',
        body: 'Steh je stejný jako u pouzdra na karty: dvě jehly proti sobě, vždy stejné pořadí a stejné utažení. Pokud si nejste jistí rytmem, vraťte se ke cvičení v lekci 4 prvního projektu.',
        media: [
          {
            id: 'cch-l4-saddle-stitch',
            kind: 'illustration',
            caption: 'Schéma sedlářského stehu: dvě jehly procházejí každým otvorem proti sobě',
            status: 'available',
            illustration: 'saddle-stitch',
          },
        ],
      },
      {
        id: 'unfold-roughen-glue',
        title: 'Rozepněte, zdrsněte a slepte',
        body: 'Ohyby rozepněte, aby šlo lepidlo nanést naplocho na rovnou kůži. V pruhu 0–3,5 mm od hrany (pod čárou švu – lepidlo výš by ubralo místo, kde má obsah vůli) zdrsněte smirkem plochy, které se budou lepit. Lepidlo naneste naplocho na oba spoje, nechte odvětrat podle návodu na obalu, přeložte zpátky a před přitlačením zarovnejte jehlami přes otvory.',
        media: [],
      },
      {
        id: 'stitch-through-layers',
        title: 'Přitiskněte a sešijte tři vrstvy',
        body: 'Přitiskněte slepené vrstvy k sobě a sešijte sedlářským stehem skrz všechny tři vrstvy předem prosekanými otvory a zkontrolujte rub – steh má být stejně rovný jako na líci.',
        media: [
          {
            id: 'cch-l4-stitch',
            kind: 'photo',
            caption:
              'Sedlářský steh procházející třemi přeloženými vrstvami jednoho proužku, obě jehly v jednom otvoru',
            status: 'planned',
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'holes-aligned',
        title: 'Naplocho prosekané otvory na všech třech panelech se po složení lícují.',
        required: true,
      },
      {
        slug: 'fold-clean',
        title: 'Oba ohyby drží tvar smyčky, líc bez prasklin.',
        required: true,
      },
      {
        slug: 'stitch-through-three',
        title: 'Steh prochází čistě všemi třemi vrstvami; na líci mají všechny stehy stejný sklon.',
        required: true,
      },
      {
        slug: 'fold-a-stiffness-noted',
        title: 'Zapsali jste si, jak moc tuhý je ohyb A na odřezku (ztenčuje se jen ohyb B).',
        required: false,
      },
    ],
    commonMistakes: [
      'Otvory odměřené jen od hrany, ne zrcadlené od ohybu: po složení nelícují.',
      'Ohyb nasucho nebo na ostro: líc praská.',
      'Lepidlo výš než na čáru švu: vrstvy se slepí naplocho tam, kde má zůstat vůle pro obsah.',
    ],
    safety: ['Vidličky držte pevně u spodku, palička dopadá na horní konec, ne na prsty.'],
    media: [
      {
        id: 'cch-l4-hero',
        kind: 'photo',
        caption: 'Přeložený a sešitý proužek tří vrstev kolem zabalených karet',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L5,
    title: 'Pás: vystřižení a přenesení ztenčení',
    order: 5,
    phaseSlug: 'build',
    estimatedMinutes: 50,
    goal: 'Vyříznout pás podle šablony na líc kůže, přenést ztenčení ohybu B a proseknout otvory dna.',
    materials: [
      'přířez třísločiněné kůže 1,5 mm (nebo 1,2 mm Verde – pak ztenčení ohybu B odpadá) na pás, aspoň A4',
      'vytištěná šablona PÁS (zkontrolovaná úsečka 50 mm; pro kůži 1,2 mm vytiskněte variantu pro 1,2 mm)',
      'přípravek na zapečetění rubu (Tokonole nebo gum tragacanth – stejná pasta jako u leštění hran)',
    ],
    requiredEquipment: [
      'veg-tan-leather',
      'utility-knife',
      'steel-ruler',
      'cutting-mat',
      'scratch-awl',
      'stitching-chisels',
      'mallet',
      'punching-board',
    ],
    recommendedEquipment: ['wing-divider', 'corner-template', 'edge-burnisher', 'safety-skiver'],
    prerequisiteLessons: [L2, L3, L4],
    steps: [
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte šablonu',
        body: 'Tisk na A4 bez přizpůsobení velikosti (100 %). Kalibrační úsečka musí měřit přesně 50 mm.',
        media: [],
      },
      {
        id: 'transfer-face',
        title: 'Přeneste obrys na líc',
        body: 'Šablonu obkreslete na LÍC kůže, ne na rub – kresba je pohled zvenku, přední panel je nakreslený tak, jak bude vidět. To je rozdíl oproti pouzdru na karty, kde se obkreslovalo na rub.',
        media: [],
      },
      {
        id: 'cut-strip',
        title: 'Vyřízněte pás',
        body: 'Rovné strany řežte podle pravítka na dva až tři lehké tahy, výřez na prst řežte plynule bez pravítka.',
        media: [
          {
            id: 'cch-l5-cut',
            kind: 'photo',
            caption: 'Vyříznutý pás tří panelů ležící na papírové šabloně, kůže obtažená na líci',
            status: 'planned',
          },
        ],
      },
      {
        id: 'mark-hardware-centres',
        title: 'Propíchněte středy druku a průchodky',
        body: 'Šablonu ještě jednou přiložte na pás a šídlem propíchněte střed patice druku (na předním panelu) a střed průchodky (na vnitřním panelu) skrz – tenká dírka po šídle udrží přesnou polohu pro osazení kování v lekci 6.',
        media: [],
      },
      {
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení ohybu B',
        body: 'Pokud šijete z kůže tenčí než 1,3 mm (Verde 1,2 mm), tenhle krok i ztenčení přeskočte. U kůže 1,5 mm: šídlem propíchněte oba konce obou čar ohybu B skrz, na rubu je spojte a od každé čáry odsaďte dalších 3 mm ven – ztenčovat se bude celé pásmo ohybu B plus tento přesah na obou stranách (asi 16 mm celkem). Ohyb A se ztenčovat nebude.',
        media: [],
      },
      {
        id: 'skive-fold-b',
        title: 'Ztenčete ohyb B',
        body: 'U kůže 1,5 mm: v odsazeném pásu ztenčete kůži z rubu na 1 mm bezpečnostním ztenčovačem, stejně jako v tréninkové lekci.',
        media: [],
      },
      {
        id: 'punch-bottom-holes',
        title: 'Prosekejte otvory dna',
        body: 'Naplocho prosekejte vidličkami otvory dna na všech třech panelech (tečky, rozteč 4 mm).',
        media: [],
      },
      {
        id: 'burnish-inner-edges',
        title: 'Zaleštěte vnitřní hrany a zapečeťte rub',
        body: 'Zaleštěte hrany, které po složení zůstanou uvnitř: horní hranu vnitřního panelu, oblouk výřezu a jazyk. Rub vnitřního panelu zapečeťte (Tokonole nebo gum tragacanth) – po složení je vidět výřezem nad kartami.',
        media: [
          {
            id: 'cch-l5-sealed',
            kind: 'photo',
            caption:
              'Rub vnitřního panelu s naneseným přípravkem na zapečetění, zaleštěná horní hrana',
            status: 'planned',
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'strip-cut-clean',
        title: 'Pás je vyříznutý podle šablony na líci kůže, výkus je plynulý oblouk, bez zubu.',
        required: true,
      },
      {
        slug: 'skive-transferred',
        title:
          'U kůže 1,5 mm je ztenčené pásmo ohybu B vidět z rubu, asi 1 mm silné, asi 16 mm široké (ohyb B plus 3 mm přesahu za každou čárou). U kůže 1,2 mm se ztenčení přeskakuje.',
        required: true,
      },
      {
        slug: 'inner-edges-burnished',
        title: 'Vnitřní hrany jsou zaleštěné a rub vnitřního panelu je zapečetěný.',
        required: false,
      },
    ],
    commonMistakes: [
      'Obtažení na rub místo na líc: přední panel vyjde zrcadlově obráceně.',
      'Záměna ohybů: u kůže 1,5 mm se ztenčuje jen ohyb B (šrafa); ohyb A se neztenčuje.',
      'Zapomenutý zapečetěný rub vnitřního panelu: je vidět výřezem nad kartami.',
    ],
    safety: ['Volná ruka drží kůži u výřezu za okraj dílu, daleko od čepele.'],
    media: [
      {
        id: 'cch-l5-hero',
        kind: 'photo',
        caption: 'Hotový vyříznutý pás s vyznačeným ztenčeným pásmem ohybu B',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L6,
    title: 'Kapsa s mincí a kování naplocho',
    order: 6,
    phaseSlug: 'build',
    estimatedMinutes: 60,
    goal: 'Vytvarovat kapsu s mincí ze samostatné kůže 1,2 mm, vyseknout okno, přišít ji na přední panel a naplocho osadit patici druku a průchodku do vnitřního panelu.',
    materials: [
      'kůže 1,2 mm na kapsu, aspoň 70 × 70 mm (i když je pás z 1,5 mm)',
      'vytištěná šablona KAPSA',
      'mince, potravinová fólie',
      'nit asi 0,8 m na šev kapsy',
    ],
    requiredEquipment: [
      'veg-tan-leather',
      'coin-forming-block',
      'clamps',
      'round-punch-32mm',
      'utility-knife',
      'cutting-mat',
      'stitching-chisels',
      'mallet',
      'punching-board',
      'harness-needles',
      'waxed-thread',
      'contact-cement',
      'snap-fastener',
      'grommet',
      'hole-punch-5mm',
      'scratch-awl',
      'steel-ruler',
    ],
    recommendedEquipment: ['corner-template', 'sandpaper'],
    prerequisiteLessons: [L5],
    steps: [
      {
        id: 'trace-and-punch-pocket',
        title: 'Orýsujte kapsu a prosekněte otvory švu',
        body: 'Na samostatný kus kůže 1,2 mm orýsujte obrys kapsy podle listu KAPSA a prosekněte otvory švu – oboje ještě před navlhčením.',
        media: [],
      },
      {
        id: 'form-dimple',
        title: 'Vytvarujte důlek na formě',
        body: 'Kůži navlhčete, položte lícem dolů na formu vystředěnou na křížek, minci zabalenou ve fólii na rub nad otvor, přiklopte deskou a dvěma svěrkami proti sobě rovnoměrně stáhněte, aby se víko nenaklonilo. Nechte zaschnout, jistější je přes noc.',
        media: [
          {
            id: 'cch-l6-form',
            kind: 'photo',
            caption:
              'Navlhčená kůže kapsy lícem dolů na formě vystředěná podle křížku, svěrky stažené z obou stran',
            status: 'planned',
          },
        ],
      },
      {
        id: 'cut-outline-and-window',
        title: 'Vyřízněte obrys a vysekněte okno',
        body: 'Vyřízněte obrys kapsy podle orýsování z prvního kroku – forma vystředěná na křížek zajistí, že důlek sedí s otvory švu. Okno Ø 32 mm vysekněte na formě: kapsu položte lícem dolů zpátky na formu a pod důlek podložte špalík, aby měl důlek při úderu pevnou oporu.',
        media: [
          {
            id: 'cch-l6-window',
            kind: 'photo',
            caption: 'Kruhový výsečník nad okrajem důlku na formě, kapsa lícem dolů',
            status: 'planned',
          },
        ],
      },
      {
        id: 'glue-pocket',
        title: 'Nalepte kapsu na přední panel',
        body: 'Kapsu kontaktním lepidlem nalepte na vyznačené místo na předním panelu: 35,55 mm pod horní hranou, 8,5 mm od obou boků. Horní hranu kapsy, kterou se bude zasouvat mince, nelepte.',
        media: [],
      },
      {
        id: 'stitch-pocket',
        title: 'Prosekněte a přišijte kapsu',
        body: 'Kapsa má otvory švu prosekané už v prvním kroku, ještě před tvarováním. Naplocho na děrovací desce teď vidličkami projeďte znovu přes tytéž otvory, tentokrát skrz obě vrstvy najednou – kapsu i přední panel pod ní. Pak kapsu sedlářským stehem přišijte, horní hrana zůstává volná.',
        media: [],
      },
      {
        id: 'set-snap-post',
        title: 'Osaďte patici druku',
        body: 'Patici druku osaďte naplocho do předního panelu na značku propíchnutou v lekci 5 (9,5 mm pod horní hranou na ose jazyka) – ještě před složením pásu, v hotovém pouzdru už na ni nedosáhnete.',
        media: [],
      },
      {
        id: 'set-grommet',
        title: 'Osaďte průchodku',
        body: 'Průchodku osaďte naplocho do vnitřního panelu na značku propíchnutou v lekci 5: 9 mm od horní hrany a 9 mm od volného (vnějšího bočního) konce panelu – stejně jako patici, ještě před složením.',
        media: [
          {
            id: 'cch-l6-hardware',
            kind: 'photo',
            caption:
              'Přední panel s přišitou kapsou a osazenou paticí druku, vnitřní panel s průchodkou',
            status: 'planned',
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'pocket-formed',
        title:
          'Kapsa má dost hluboký důlek bez zvrásnění na okraji; mince do ní jde zasunout i vysunout.',
        required: true,
      },
      {
        slug: 'window-cut',
        title: 'Okno Ø 32 mm je vyseknuté a kolem mince zůstává prstenec asi 4 mm.',
        required: true,
      },
      {
        slug: 'pocket-stitched',
        title:
          'Kapsa je nalepená a přišitá na přední panel na správném místě, horní hrana zůstává otevřená.',
        required: true,
      },
      {
        slug: 'hardware-flat-set',
        title: 'Patice druku i průchodka jsou osazené naplocho, oboje ještě před složením.',
        required: true,
      },
    ],
    commonMistakes: [
      'Kapsa vystřižená bez orýsování z formy: obrys neodpovídá poloze důlku.',
      'Patice nebo průchodka osazené až po složení: v uzavřeném pásu už na ně nedosáhnete.',
    ],
    safety: ['Výsečník tlučte kolmo, ruka mimo dráhu paličky.'],
    media: [
      {
        id: 'cch-l6-hero',
        kind: 'photo',
        caption: 'Přední panel s hotovou kapsou, oknem a mincí zasunutou zezadu',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L7,
    title: 'Skládání, lepení dna a šití',
    order: 7,
    phaseSlug: 'build',
    estimatedMinutes: 70,
    goal: 'Poskládat pás kolem karet a bankovek, slepit a sešít dno skrz tři vrstvy.',
    materials: [
      'pás z lekce 6 s přišitou kapsou a osazeným kováním',
      'karty a bankovky, které nosíte, zabalené v potravinové fólii',
      'houbička a voda na navlhčení ohybů',
      'kostěná rozhrnovačka (bone folder) nebo hrana pravítka',
      'sponky s podložkou na sepnutí ohybů při schnutí',
      'nit asi 0,6 m na šev dna (ověřit na odřezku)',
    ],
    requiredEquipment: ['contact-cement', 'sandpaper', 'harness-needles', 'waxed-thread'],
    recommendedEquipment: ['wing-divider', 'scratch-awl'],
    prerequisiteLessons: [L6],
    steps: [
      {
        id: 'wet-fold-zones',
        title: 'Navlhčete pásma obou ohybů',
        body: 'Navlhčete houbičkou pásma obou ohybů, ne celou plochu pásu.',
        media: [],
      },
      {
        id: 'fold-inner-b',
        title: 'Přeložte vnitřní panel ohybem B',
        body: 'Nejdřív přeložte vnitřní panel ohybem B za přední panel.',
        media: [],
      },
      {
        id: 'fold-back-a',
        title: 'Přeložte zadní panel ohybem A',
        body: 'Pak přeložte zadní panel ohybem A přes všechno – kolem skutečného obsahu zabaleného v potravinové fólii, ne naprázdno.',
        media: [
          {
            id: 'cch-l7-fold',
            kind: 'video',
            caption:
              'Postupné přeložení vnitřního panelu ohybem B a zadního panelu ohybem A kolem obsahu',
            status: 'planned',
            durationSeconds: 60,
          },
        ],
      },
      {
        id: 'press-and-clamp',
        title: 'Přitiskněte a nechte zaschnout',
        body: 'Přejeďte rozhrnovačkou, sepněte sponkami přes podložku a nechte zaschnout. Nasucho nebo na ostro přeložený líc v tomto kroku nejspíš praská.',
        media: [],
      },
      {
        id: 'roughen-and-glue-bottom',
        title: 'Rozepněte, zdrsněte a slepte dno',
        body: 'Oba zaschlé ohyby rozepněte, aby šlo lepidlo nanést naplocho na rovnou kůži. V pruhu 0–3,5 mm od hrany (pod čárou švu; karty i bankovky stojí na švu, lepidlo výš by jim ubralo hloubku) zdrsněte smirkem slepované plochy ve spodním proužku – jsou to dva spoje, přední panel s vnitřním a vnitřní panel se zadním; přední a zadní panel se přímo nedotýkají, mezi nimi je pořád vnitřní panel. Lepidlo naneste naplocho na oba spoje, nechte odvětrat podle návodu na obalu a ohyby znovu přeložte.',
        media: [],
      },
      {
        id: 'align-and-press',
        title: 'Zarovnejte jehlami a přitiskněte',
        body: 'Před přitlačením zarovnejte díly jehlami přes otvory – kontaktní lepidlo po dotyku už nejde posunout. Pak přitiskněte.',
        media: [],
      },
      {
        id: 'stitch-bottom',
        title: 'Prošijte dno',
        body: 'Prošijte dno skrz všechny tři vrstvy (17 otvorů na panel, rozteč 4 mm, 3,5 mm od hrany). Začátek i konec zajistěte zpětnými stehy.',
        media: [
          {
            id: 'cch-l7-stitch',
            kind: 'illustration',
            caption: 'Schéma linie stehu dna 3,5 mm od hrany, rozteč otvorů 4 mm skrz tři vrstvy',
            status: 'available',
            illustration: 'stitch-offset',
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'folds-hold',
        title: 'Oba ohyby drží tvar smyčky, líc bez prasklin.',
        required: true,
      },
      {
        slug: 'bottom-glued-aligned',
        title: 'Dno je slepené a zarovnané, otvory na všech vrstvách lícují.',
        required: true,
      },
      {
        slug: 'bottom-stitched',
        title: 'Dno je prošité skrz tři vrstvy, začátek i konec zajištěný zpětnými stehy.',
        required: true,
      },
    ],
    commonMistakes: [
      'Ohyb nasucho: líc v ohybu praská.',
      'Lepidlo výš než 3,5 mm od hrany: karty ztratí místo, kde stojí na švu.',
      'Přitlačení bez zarovnání jehlami: hotové otvory na jednotlivých vrstvách se po slepení rozejdou a jehla jimi neprojde rovně.',
    ],
    safety: ['Kontaktní lepidlo na rozpouštědlové bázi používejte ve větrané místnosti.'],
    media: [
      {
        id: 'cch-l7-hero',
        kind: 'photo',
        caption: 'Poskládané a prošité dno pouzdra skrz tři vrstvy kůže',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L8,
    title: 'Klobouček druku, zkrácení jazyka a hrany',
    order: 8,
    phaseSlug: 'build',
    estimatedMinutes: 50,
    goal: 'Vložit obsah, osadit klobouček druku podle obtisku, zkrátit jazyk a zaleštit vnější hrany.',
    materials: [
      'hotové tělo pouzdra z lekce 7',
      'karty a bankovky, které nosíte',
      'barva na hrany (barvená kůže má světlý řez)',
    ],
    requiredEquipment: [
      'snap-fastener',
      'utility-knife',
      'cutting-mat',
      'sandpaper',
      'mallet',
      'punching-board',
    ],
    recommendedEquipment: ['edge-beveler', 'corner-template', 'edge-burnisher'],
    prerequisiteLessons: [L7],
    steps: [
      {
        id: 'insert-content',
        title: 'Vložte obsah a přehněte jazyk',
        body: 'Vložte karty i bankovky, které nosíte, a přehněte jazyk přes horní hranu.',
        media: [],
      },
      {
        id: 'imprint-cap-position',
        title: 'Obtiskněte polohu kloboučku',
        body: 'Přeložený jazyk přitiskněte přes patici, aby se na kůži obtiskla. Zjistěte, o kolik mm od původní značky a kterým směrem se obtisk posunul: pás je nastřižený na nejhorší případ, ve skutečnosti druk okraj stáhne, takže jazyk vyjde delší, než ukazoval papírový model.',
        media: [],
      },
      {
        id: 'punch-cap-hole',
        title: 'Prosekněte otvor pro klobouček',
        body: 'Výsečníkem na dřík ze sady druku proražte otvor pro klobouček přesně v obtisknutém místě na jazyku.',
        media: [],
      },
      {
        id: 'set-cap',
        title: 'Osaďte klobouček',
        body: 'Klobouček 12,5 mm osaďte přesně na obtisknuté místo osazovačem a paličkou, ne podle původní odhadované značky.',
        media: [
          {
            id: 'cch-l8-cap',
            kind: 'photo',
            caption:
              'Osazovač druku nad obtisknutým místem na jazyku, klobouček připravený k osazení',
            status: 'planned',
          },
        ],
      },
      {
        id: 'shorten-tongue',
        title: 'Zkraťte jazyk a zaoblete rohy',
        body: 'Jazyk zkraťte 11 mm za střed kloboučku a rohy znovu zaoblete na R10 – rohovou šablonou (lob 20), nebo obtažením mince či víčka stejné velikosti.',
        media: [],
      },
      {
        id: 'sand-flat-bottom',
        title: 'Přebruste dno do roviny',
        body: 'Dno přebruste smirkem do jedné roviny přes všechny tři vrstvy a srazte hrany.',
        media: [],
      },
      {
        id: 'dye-and-burnish-edges',
        title: 'Obarvěte a zaleštěte vnější hrany',
        body: 'U barvené kůže je řez světlý – obarvěte ho barvou na hrany. Všechny vnější hrany pak zaleštěte jako u pouzdra na karty.',
        media: [
          {
            id: 'cch-l8-edges',
            kind: 'photo',
            caption: 'Zaleštěná vnější hrana pouzdra po obarvení řezu',
            status: 'planned',
          },
        ],
      },
      {
        id: 'thread-cord',
        title: 'Protáhněte šňůrku průchodkou',
        body: 'Pokud šňůrku používáte, protáhněte ji teď průchodkou.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'cap-fits',
        title:
          'Druk drží a jazyk po zkrácení končí asi 15 mm nad horní hranou kapsy, nezasahuje do ní.',
        required: true,
      },
      {
        slug: 'edges-finished',
        title: 'Vnější hrany jsou srovnané, obarvené (u barvené kůže) a zaleštěné.',
        required: true,
      },
      {
        slug: 'photo-taken',
        title: 'Hotové pouzdro je vyfocené.',
        required: false,
      },
    ],
    commonMistakes: [
      'Klobouček osazený přesně na původní značku bez ohledu na obtisk: druk nedosedne a jazyk je nakřivo.',
      'Zkrácení jazyka bez zaoblení rohů: hrana zůstane hranatá a odlišná od zbytku pouzdra.',
      'Leštění hran před srovnáním dna: nerovnosti tří vrstev zůstanou vidět.',
    ],
    safety: ['Nůž na zkrácení jazyka veďte tahem od prstů volné ruky.'],
    media: [
      {
        id: 'cch-l8-hero',
        kind: 'photo',
        caption: 'Hotové pouzdro na karty s vsazenou mincí, jazyk zapnutý drukem, detail průchodky',
        status: 'planned',
      },
    ],
  }),
];

export const coinCardHolderProject: ProjectDefinition = {
  slug: PROJECT_SLUG,
  code: '02',
  title: 'Pouzdro na karty s vsazenou mincí',
  summary: 'Pouzdro na karty a bankovky se skutečnou mincí vsazenou do vytvarované kapsy.',
  description:
    'Druhý projekt cesty učení: pás tří panelů ohýbaný na obou bocích, šitý jen ve dně, s kapsou na karty a kapsou na bankovky a s mincí vsazenou do vytvarované kapsy s kruhovým okénkem. Staví na tom, co umíte z pouzdra na karty (rovný řez, děrování, sedlářský steh, hrany), a přidává mokré tvarování kůže, ztenčení ohybu, osazení druku a průchodky a šití třemi vrstvami. Čas výroby je hrubý odhad a celý střih je návrh k ověření na papíru a odřezku.',
  difficulty: 'intermediate',
  estimatedHours: { min: 10, max: 16 },
  skills: [
    'Práce s papírovým modelem',
    'Mokré tvarování kůže do formy',
    'Ztenčení kůže (skiving) v ohybu',
    'Osazení druku',
    'Osazení průchodky',
    'Šití sedlářským stehem skrz tři vrstvy',
    'Skládání pásu do dvou ohybů',
  ],
  phases: [...phases],
  equipment: [
    // Pořadí = pořadí nákupu: nejdřív vybavení na trénink (lekce 1–4), pak kůže a kování na
    // finální pouzdro (lekce 5–8). Vybavení sdílené s pouzdrem na karty je zkráceně
    // přeformulované pro tento projekt; celý popis nástroje je ve sdíleném katalogu.
    {
      equipmentSlug: 'veg-tan-leather',
      priority: 'required',
      reason:
        'Pás těla (lekce 5–7) i samostatný list kapsy s mincí (lekce 6) potřebují jiný kus kůže než pouzdro na karty.',
      specification:
        'Tělo: třísločiněná lícová 1,5 mm, přířez A4 (nebo 1,2 mm Verde – ztenčení ohybu B pak odpadá). Kapsa: samostatný kus 1,2 mm, aspoň 70 × 70 mm, i když je tělo z 1,5 mm. K tomu odřezky na trénink v lekcích 2–4.',
    },
    {
      equipmentSlug: 'utility-knife',
      priority: 'required',
      reason: 'Vyříznutí pásu a zkrácení jazyka po osazení kloboučku.',
      specification: 'Odlamovací nůž 18 mm s novými čepelemi.',
    },
    {
      equipmentSlug: 'steel-ruler',
      priority: 'required',
      reason: 'Vedení nože, rýsování a měření odsazení při zkoušce papírového modelu.',
      specification: 'Ocelové 30 cm.',
    },
    {
      equipmentSlug: 'cutting-mat',
      priority: 'required',
      reason: 'Podklad pro řezání pásu.',
      specification: 'Samohojivá A3.',
    },
    {
      equipmentSlug: 'punching-board',
      priority: 'required',
      reason: 'Podklad pod děrování a osazování kování.',
      specification: 'HDPE deska nebo plastové prkénko.',
    },
    {
      equipmentSlug: 'stitching-chisels',
      priority: 'required',
      reason:
        'Otvory dna se prosekají naplocho přes všechny tři panely pásu, dřív než se pás složí, a pak se jimi šije; stejnými vidličkami se v lekci 6 prosekává i šev kapsy skrz obě vrstvy.',
      specification: 'Rozteč 3,85–4 mm, sada 2 + 4/6 hrotů (stejné jako u prvního pouzdra).',
    },
    {
      equipmentSlug: 'mallet',
      priority: 'required',
      reason: 'Úder do vidliček i do osazovačů kování.',
      specification: 'Gumová nebo plastová.',
    },
    {
      equipmentSlug: 'harness-needles',
      priority: 'required',
      reason: 'Sedlářský steh dna i kapsy.',
      specification: 'Tupé sedlářské, k niti 0,6 mm, 4 ks.',
    },
    {
      equipmentSlug: 'waxed-thread',
      priority: 'required',
      reason: 'Šev dna (skrz tři vrstvy) a šev kapsy.',
      specification:
        'Voskovaný polyester 0,6–0,8 mm. Orientačně asi 4× délka švu: dno (64 mm skrz 4,5 mm kůže) ≈ 0,6 m, kapsa (31 otvorů) ≈ 0,8 m – ověřit na odřezku.',
    },
    {
      equipmentSlug: 'contact-cement',
      priority: 'required',
      reason:
        'Přilepí kapsu na přední panel v lekci 6 a přidrží dno před prošitím skrz tři vrstvy v lekci 7.',
      specification: 'U dna se nanáší jen do pruhu 0–3,5 mm od hrany pod čárou švu.',
    },
    {
      equipmentSlug: 'sandpaper',
      priority: 'required',
      reason: 'Zdrsnění lepené plochy dna a srovnání hran po sešití, přebroušení dna do roviny.',
      specification: 'Zrnitost 180–240 na zdrsnění, 220–400 na srovnání hran.',
    },
    {
      equipmentSlug: 'safety-skiver',
      priority: 'recommended',
      reason:
        'U kůže 1,5 mm se ohyb B ztenčuje na 1 mm z rubu, aby protažení líce kleslo z asi 26 % na 16 %. Při kůži 1,2 mm (Verde) se ztenčení přeskakuje, takže ztenčovač není nutný.',
      specification:
        'Safety skiver s vyměnitelnou čepelí; ztenčuje se celé pásmo ohybu B plus 3 mm přesahu za každou jeho čárou (asi 16 mm celkem).',
    },
    {
      equipmentSlug: 'coin-forming-block',
      priority: 'required',
      reason: 'Tvarování důlku na minci za mokra (lekce 2 a 6).',
      specification:
        'Dvoudílná forma z překližky, otvor Ø 44 mm pro výchozí minci 40 mm (Ø 31,5–32 mm pro minci 50 Kč).',
    },
    {
      equipmentSlug: 'clamps',
      priority: 'required',
      reason: 'Stažení formy s kůží a mincí při schnutí.',
      specification: 'Dvě svěrky proti sobě, vyložení aspoň na střed formy 8 × 8 cm.',
    },
    {
      equipmentSlug: 'snap-fastener',
      priority: 'required',
      reason:
        'Zapínání jazyka drukem, patice naplocho v lekci 6, klobouček podle obtisku v lekci 8.',
      specification:
        'Klobouček 12,5 mm, dřík na 2 × 1,5 mm kůže, s osazovačem a průbojníkem na dřík.',
    },
    {
      equipmentSlug: 'grommet',
      priority: 'required',
      reason: 'Očko v rohu vnitřního panelu pro šňůrku, osazuje se naplocho v lekci 6.',
      specification: 'Průchodka Ø 5 mm, dvoudílná s podložkou, s osazovačem.',
    },
    {
      equipmentSlug: 'round-punch-32mm',
      priority: 'required',
      reason: 'Okno kapsy, kterým je vidět mince.',
      specification: 'Kruhový dutý výsečník Ø 32 mm.',
    },
    {
      equipmentSlug: 'hole-punch-5mm',
      priority: 'required',
      reason: 'Otvor pro průchodku.',
      specification: 'Kruhový dutý výsečník Ø 5 mm.',
    },
    {
      equipmentSlug: 'scratch-awl',
      priority: 'required',
      reason:
        'Orýsování obrysu kapsy, vyznačení pásma ztenčení, propíchnutí středů kování a odsazení kování.',
      specification: 'Kulaté rýsovací šídlo s hruškovitou rukojetí.',
    },
    {
      equipmentSlug: 'wing-divider',
      priority: 'recommended',
      reason: 'Rychlejší rýsování linie stehu dna.',
      specification: 'Kružítko s aretací.',
    },
    {
      equipmentSlug: 'edge-burnisher',
      priority: 'recommended',
      reason: 'Zaleštění vnitřních hran v lekci 5 a vnějších hran v lekci 8.',
      specification: 'Pasta na hrany + dřevěné leštítko.',
    },
    {
      equipmentSlug: 'edge-beveler',
      priority: 'recommended',
      reason:
        'Sešitá hrana dna má tři vrstvy (asi 3,6–4,5 mm) – tady je efekt zaobleného ořezu vidět víc než na jedné vrstvě pouzdra na karty.',
      specification: 'Velikost 0–1.',
    },
    {
      equipmentSlug: 'corner-template',
      priority: 'recommended',
      reason: 'Stejný poloměr na konci jazyka (R10) a rozích kapsy (R10 nahoře, R6 dole).',
      specification: 'Lob 20 = R10, lob 12 = R6. Nepovinné – nahradí obtažení mince nebo víčka.',
    },
    {
      equipmentSlug: 'stitching-pony',
      priority: 'later',
      reason:
        'Volitelná pomůcka při šití dna a kapsy; nejdelší šev pouzdra jde ušít i mezi koleny.',
      specification: 'Čelisti od 6 cm, potažené kůží.',
    },
  ],
  lessons: [...lessons],
  patternSheets: {
    sheets: [
      {
        id: 'papirovy-model',
        title: 'Papírový model',
        note: 'Stejný obrys jako pás, bez otvorů; čísla kroků u ohybů, rámeček karty, místo pro kapsu, čára švu a seznam k zapsání při zkoušce. Vytiskněte a projděte jako první, ještě před řezáním kůže.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
      },
      {
        id: 'sablona',
        title: 'Pás (šablona)',
        note: 'Tři panely a dva ohyby v jednom kuse, 242,6 × 104,1 mm plus jazyk. Obkreslujte na líc kůže, ne na rub.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
      },
      {
        id: 'kapsa',
        title: 'Kapsa s mincí a otvor formy',
        note: 'List kapsy 55 × 54,5 mm a kružnice na vyvrtání otvoru formy pro tvarování důlku.',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
      },
      {
        id: 'postup',
        title: 'Postup skládání',
        note: 'Přehled skládání v 8 krocích jako ilustrace. Není 1:1, podle tohoto listu se neměří rozměry.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
      },
      {
        id: 'papirovy-model-50kc',
        title: 'Papírový model – mince 50 Kč',
        note: 'Stejný list jako výchozí papírový model, přepočítaný pro minci 50 Kč (27,5 mm).',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 27,5 mm (50 Kč)',
      },
      {
        id: 'sablona-50kc',
        title: 'Pás – mince 50 Kč',
        note: 'Stejný list jako výchozí pás, přepočítaný pro minci 50 Kč (27,5 mm).',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 27,5 mm (50 Kč)',
      },
      {
        id: 'kapsa-50kc',
        title: 'Kapsa – mince 50 Kč',
        note: 'Stejný list jako výchozí kapsa, otvor formy přepočítaný pro minci 50 Kč (27,5 mm → otvor 31,5 mm).',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
        variant: 'mince 27,5 mm (50 Kč)',
      },
      {
        id: 'papirovy-model-kuze-1-2',
        title: 'Papírový model – kůže 1,2 mm (Verde)',
        note: 'Stejný obrys jako výchozí papírový model, přepočítaný pro kůži 1,2 mm bez ztenčení ohybu B: pás 240,35 × 104,1 mm, ohyb A 15,69 mm, ohyb B 8,66 mm, jazyk 43,07 mm.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'kůže 1,2 mm (Verde), bez ztenčování',
      },
      {
        id: 'sablona-kuze-1-2',
        title: 'Pás (šablona) – kůže 1,2 mm (Verde)',
        note: 'Stejný list jako výchozí pás, přepočítaný pro kůži 1,2 mm bez ztenčení ohybu B: pás 240,35 × 104,1 mm, ohyb A 15,69 mm, ohyb B 8,66 mm, jazyk 43,07 mm. List KAPSA je stejný jako výchozí – kapsa se vždycky dělá z kůže 1,2 mm bez ohledu na tloušťku těla.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'kůže 1,2 mm (Verde), bez ztenčování',
      },
    ],
    calibrationMm: 50,
    printNote:
      'Tisk na A4 bez přizpůsobení velikosti (100 %). Kontrolní úsečka na okraji musí měřit 50 mm.',
    variantsNote:
      'V aplikaci jsou listy pro výchozí minci 40 mm, pro minci 50 Kč (27,5 mm) a pro kůži 1,2 mm (Verde). Jiná mince, jiný počet karet nebo jiná tloušťka kůže v aplikaci zatím nejsou, protože se s nimi mění ohyby, jazyk i otvor formy.',
  },
  media: [
    {
      id: 'coin-card-holder-hero',
      kind: 'photo',
      caption: 'Hotové pouzdro na karty s vsazenou mincí, kruhové okénko v přední kapse',
      status: 'planned',
    },
  ],
  contentVersion: 1,
  reviewStatus: 'draft',
};

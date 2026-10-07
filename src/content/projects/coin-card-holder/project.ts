import { animationLink } from '@/content/animations';
import { illustration, processStep } from '@/content/projects/coin-card-holder/illustrations';
import {
  type LessonDefinition,
  type PhaseDefinition,
  type ProjectDefinition,
} from '@/content/schema';

/**
 * Projekt 02 – Pouzdro na karty s vsazenou mincí. Obsah je NÁVRH (draft), stejně jako střih
 * samotný (docs/zadani/pouzdro-mince.md, v4.12; výchozí mince 50 Kč, kůže těla 1,2 mm, okno Ø 20 mm, druk 12 mm, bez průchodky). Druhý projekt podle ADR 002: staví na
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
    goal: 'Složit papírový model se skutečným obsahem a zapsat výsledky, než začnete řezat kůži.',
    materials: [
      'list Papírový model na papíře 160 g (výchozí je pro minci 50 Kč a kůži 1,2 mm; jiné varianty viz první krok)',
      'tenká lepenka (krabice od cereálií)',
      'nůžky, lepidlo v tyčince a lepicí páska',
      'karty a bankovky, které opravdu nosíte',
      'tužka a papír na zápis',
    ],
    requiredEquipment: ['steel-ruler', 'scratch-awl'],
    recommendedEquipment: [],
    prerequisiteLessons: [],
    steps: [
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte list',
        body: 'Na stránce Listy střihu (odkaz pod krokem) vytiskněte Papírový model na A4 ve skutečné velikosti (100 %). Předem zaškrtnutý list je pro minci 50 Kč a kůži těla 1,2 mm. U kůže 1,5 mm vytiskněte místo něj Papírový model – kůže 1,5 mm, u mince 40 mm Papírový model – mince 40 mm, u kůže 1,5 mm s mincí 40 mm Papírový model – mince 40 mm, kůže 1,5 mm. Změřte kalibrační úsečku: musí mít přesně 50 mm.',
        printLink: 'pattern-sheets',
        media: [],
      },
      {
        id: 'glue-and-cut',
        title: 'Nalepte na lepenku a vystřihněte',
        body: 'Výtisk nalepte lepidlem v tyčince na tenkou lepenku a nůžkami vystřihněte podle obrysu.',
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
        title: 'Přehněte ohyby do smyčky',
        body: 'Nejdřív přehněte vnitřní panel za přední (ohyb B, na listu ①), pak zadní přes všechno (ohyb A, ②). Ohyby jen přehněte do měkké smyčky, nepřekládejte je na ostro.',
        media: [],
      },
      {
        id: 'tape-bottom',
        title: 'Slepte dno páskou',
        body: 'Dno modelu slepte lepicí páskou podél čáry švu.',
        media: [],
      },
      {
        id: 'insert-contents',
        title: 'Vložte karty a bankovky',
        body: 'Vložte karty a bankovky, které opravdu nosíte. Karty patří za přední panel, bankovky napůl za vnitřní panel. Jazyk přehněte přes horní hranu a přiložte přes vytištěnou značku patice. Šídlem v místě značky patice propíchněte jazyk i přední panel – tím si na jazyku označíte skutečné místo patice.',
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
        title: 'Zapište výsledky',
        body: 'Zapište: (1) o kolik mm a kterým směrem je propíchnuté místo od vytištěné značky patice a kolik jazyka za ním zbývá (cíl 11 mm + rezerva); (2) kolik mm karty je vidět ve výřezu (cíl 19 mm) a jestli jde palcem vysunout; (3) které bankovky jdou napůl a kolik mm přečnívají nahoře a v boku; (4) jak daleko nad horní hranou kapsy končí jazyk – cíl asi 16 mm, u mince 40 mm asi 10 mm (jazyk je zatím nezkrácený; v kůži po zkrácení to bude asi 21 mm, u mince 40 mm asi 15 mm); (5) kolik karet a jak silné bankovky opravdu nosíte, oproti výchozím 4 × 0,76 mm a 2 mm.',
        media: [],
      },
      {
        id: 'decide',
        title: 'Rozhodněte, jestli pokračovat',
        body: 'Když se obsah nevejde, karta nejde palcem vysunout nebo jazyk nedosáhne přes značku patice, kůži neřežte a zapište, co nesedí a o kolik mm. Nejdřív vylučte chybu tisku: znovu změřte úsečku (50 mm) a zkontrolujte, že máte list pro svou kůži a minci; případně vytiskněte list znovu a model složte znovu. Když model nesedí ani tak, střih pro svůj obsah nepoužívejte – jiný počet karet ani tloušťku bankovek aplikace zatím přepočítat neumí. Pokračujte, až model se vším, co nosíte, sedí.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'model-folded',
        title:
          'Model je slepený, ohyby přehnuté do smyčky, dno slepené páskou a karty i bankovky se vejdou.',
        required: true,
      },
      {
        slug: 'checklist-recorded',
        title: 'Všech pět bodů je zapsaných, včetně počtu karet a tloušťky bankovek.',
        required: true,
      },
      {
        slug: 'cards-visible',
        title: 'Ve výřezu je vidět asi 19 mm karty a jde palcem vysunout.',
        required: false,
      },
    ],
    commonMistakes: [
      'Ohyb přeložený na ostro: na modelu se ohyby jen přehýbají do smyčky.',
      'Nezapsané výsledky: bez čísel z modelu jen odhadujete, jestli se obsah vejde.',
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
    goal: 'Vyvrtat formu, vytvarovat na odřezku důlek na minci a vyzkoušet, že prstenec 3,75 mm kolem okna Ø 20 mm minci udrží.',
    materials: [
      'list KAPSA ve 3 výtiscích (u mince 40 mm varianta pro 40 mm): na vrtání formy, na značky na líci a na šablonu na rub; když zkouška okna Ø 20 mm nevyjde, ještě list Kapsa – záložní okno Ø 18 mm',
      'dvě desky na formu a víko, aspoň 61,5 × 61,5 mm (ideálně 8 × 8 cm; u mince 40 mm aspoň 74 × 74 mm) a aspoň 8 mm silné (překližka, tvrdý plast nebo bukové prkénko asi 1,5 cm, např. Orion), a odpadní prkno pod vrtání',
      'aku vrtačka s vykružovací pilou Ø 32 mm (např. Wolfcraft bimetal), u mince 40 mm Ø 44 nebo 45 mm; Forstnerův vrták jen Ø 32 mm (30 ani 35 mm ze sady nesedí)',
      '2 odřezky třísločiněné kůže 1,2 mm, každý aspoň 57,5 × 57,5 mm (u mince 40 mm 70 × 70 mm); druhý na případné opakování zkoušky okna',
      'mince, na kterou stavíte (výchozí 50 Kč)',
      'potravinová fólie',
      'houbička a voda',
      'smirkový papír 180',
      'tužka HB nebo 2B',
      'kruhový výsečník Ø 20 mm (u mince 40 mm Ø 32 mm)',
      'špalík pod důlek s rovným koncem: užší než otvor formy (pod 31,5 mm, u mince 40 mm pod 44 mm) a širší než okno (přes 20 mm, u mince 40 mm přes 32 mm); u mince 50 Kč třeba kus kulaté tyčky o průměru 21–31 mm (průměr změřte), zkrácený tak, aby se dna důlku na formě jen dotýkal (ověřte na odřezku)',
    ],
    requiredEquipment: [
      'veg-tan-leather',
      'coin-forming-block',
      'clamps',
      'scratch-awl',
      'sandpaper',
      'stitching-chisels',
      'mallet',
      'punching-board',
      'round-punch-32mm',
      'utility-knife',
      'steel-ruler',
      'masking-tape',
    ],
    recommendedEquipment: [],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'drill-form',
        title: 'Vyvrtejte formu',
        body: 'Vytiskněte list KAPSA (odkaz pod krokem) 3× na 100 % a zkontrolujte úsečku 50 mm: výtisk na formu, výtisk na značky a výtisk na šablonu. Z výtisku na formu: výkres „OTVOR FORMY PRO DŮLEK“ (kružnice Ø 31,5 mm s osami) vystřihněte jako čtverec asi 7 × 7 cm, kružnici nevystřihujte. Čtverec přilepte na desku doprostřed šířky, střed asi 4–5 cm od konce (naproti rukojeti, má-li ji), osy rovnoběžně s okraji. Osy protáhněte tužkou podle pravítka až k okrajům desky – podle nich budete zarovnávat kůži. Desku upněte svěrkou ke stolu přes odpadní prkno a středicí vrták nasaďte do křížku os. Vrtejte vykružovací pilou Ø 32 mm (u mince 40 mm Ø 44 mm) na 1. rychlost, bez příklepu a bez tlaku: do půlky, pak desku otočte, znovu upněte a dokončete z druhé strany podle dírky středicího vrtáku. Forstnerův vrták průběžně vytahujte kvůli pilinám. Papír sundejte. Horní hranu otvoru (stranu pro kůži, označte si ji tužkou) srazte smirkem 180 namotaným na prstu do oblouku asi 1 mm; průměr nezvětšujte. Stěnu otvoru jen lehce začistěte a plochu kolem přebruste naplocho. Hrana nesmí řezat ani drhnout a mince zabalená s odřezkem kůže musí jít do otvoru volně. Setřené osy obtáhněte znovu.',
        printLink: 'pattern-sheets',
        animationLinks: [animationLink('kapsa', 'A1')],
        media: [],
      },
      {
        id: 'mark-outline',
        title: 'Přeneste značky na líc a prosekejte šev',
        body: 'Výtisk na značky vystřihněte nahrubo s okrajem 1–2 cm a přilepte ho maskovací páskou na LÍC odřezku, jen na okrajích mimo obrys (pásku nejdřív zkuste na kousku téže kůže). Šídlem propíchněte všechny tečky švu a 4 konce os. Pásku strhněte pomalu pod ostrým úhlem a zkontrolujte, že jsou propíchnuté všechny značky. Na líc nic nekreslete – čára by na hotové kapse zůstala vidět. Vidličkami 4 mm prosekejte naplocho na děrovací desce otvory švu z líce podle teček.',
        animationLinks: [animationLink('kapsa', 'B1')],
        media: [],
      },
      {
        id: 'trace-template',
        title: 'Narýsujte osy a obrys na rub',
        body: 'Kůži otočte rubem nahoru. Protilehlé konce os spojte tužkou HB nebo 2B podle pravítka a osy lehce protáhněte až k okrajům kůže (když tužka není vidět, lehce šídlem). Výtisk na šablonu vystřihněte přesně po obrysu kapsy (plná čára se zaoblenými rohy). Na děrovací desce do něj vysekněte okno výsečníkem Ø 20 mm (u mince 40 mm Ø 32 mm), břit přesně na vytištěné kružnici. Šablonu položte na RUB, zarovnejte na osy a obrys obtáhněte šídlem nebo tužkou. Tužkou lehce objeďte i vnitřní hranu okna – podle této kružnice pak okno vystředíte. Obrys teď neřežte. Orýsujte všechno teď – přes vytvarovaný důlek už šablona neleží rovně. Šablonu si schovejte: po tvarování podle ní jen obtáhnete rozmazané čáry, a když zkouška okna vyjde, použijete ji i na kapsu v lekci 6.',
        animationLinks: [animationLink('kapsa', 'C1')],
        media: [],
      },
      {
        id: 'wrap-coin',
        title: 'Zabalte minci do fólie',
        body: 'Minci zabalte do potravinové fólie – od kovu se mokrá kůže může tmavě zabarvit.',
        media: [],
      },
      {
        id: 'wet',
        title: 'Navlhčete kůži',
        body: 'Kůži navlhčete houbičkou, nemáčejte ji. Tvarujte, až povrch začne znovu mírně světlat.',
        animationLinks: [animationLink('kapsa', 'D1')],
        media: [],
      },
      {
        id: 'press-and-clamp',
        title: 'Vtlačte do formy a stáhněte svěrkami',
        body: 'Kůži položte lícem dolů na formu (zaoblenou hranou otvoru nahoru) a osy na rubu zarovnejte s osami na desce. Zabalenou minci položte na rub nad otvor, přiklopte víkem a stáhněte dvěma svěrkami proti sobě rovnoměrně, aby se víko nenaklonilo.',
        animationLinks: [animationLink('kapsa', 'D2')],
        media: [
          {
            id: 'postup-2',
            kind: 'illustration',
            caption:
              'Kůže lícem dolů na formě, mince na rubu, přiklopit deskou a stáhnout svěrkami (krok 2 listu postupu)',
            status: 'available',
            src: processStep[1],
          },
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
        body: 'Nechte úplně zaschnout, nejlépe přes noc. Rozepněte a zkontrolujte: okraj důlku je bez zvrásnění a mince jde zasunout i vysunout. Hloubka: odřezek položte rubem nahoru a minci vložte do důlku – nesmí vyčnívat nad okolní rub, má být v rovině nebo níž. Když vyčnívá, je důlek mělký: kůže byla málo vlhká nebo svěrky slabě utažené. Zkušební otvory švu mají zůstat kulaté, ne protažené nebo potrhané.',
        animationLinks: [animationLink('kapsa', 'D4')],
        media: [
          {
            id: 'cch-l2-dimple',
            kind: 'photo',
            caption: 'Hotový vytvarovaný důlek na odřezku s vloženou mincí, detail hladkého okraje',
            status: 'planned',
          },
        ],
      },
      {
        id: 'test-window-retention',
        title: 'Vysekněte zkušební okno a vyzkoušejte, že mince drží',
        body: 'Zaschlý odřezek položte lícem dolů zpátky na formu: důlek do otvoru, osy na osy. Rozmazané čáry nejdřív obtáhněte podle šablony. Obrys vyřízněte nožem 2–3 lehkými tahy, kůži přidržujte na rovné části (desku můžete chránit kartonem s otvorem Ø 32 mm, u mince 40 mm Ø 44 mm). Formu položte na děrovací desku a do otvoru pod důlek postavte špalík. Výsečník Ø 20 mm (u mince 40 mm Ø 32 mm) postavte na narýsovanou kružnici, zkontrolujte, že prstenec kolem důlku je po celém obvodu stejně široký, a vysekněte okno. Vyzkoušejte: (1) minci vložte z rubu, odřezek otočte oknem dolů a zatřeste – nesmí vypadnout; (2) zatlačte na ni z rubu palcem – nesmí oknem projít; (3) prstenec nesmí být natržený. Když mince projde, Ø 20 mm do kapsy nesekejte. Nejdřív zkontrolujte hloubku důlku – mělký důlek vytvarujte znovu (ověřte na odřezku). Pak na druhém odřezku zopakujte orýsování, tvarování a schnutí a vysekněte okno Ø 18 mm (prstenec 4,75 mm). Jako šablonu na rub vytiskněte list Kapsa – záložní okno Ø 18 mm (odkaz pod krokem), vystřihněte ho přesně po obrysu a vysekněte do něj okno Ø 18 mm; výtisk na značky (s dírkami) použijte znovu. Do kapsy pak sekejte průměrem, se kterým zkouška vyšla.',
        printLink: 'pattern-sheets',
        animationLinks: [animationLink('kapsa', 'E1')],
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'form-drilled',
        title: 'Forma má otvor podle listu KAPSA se zaoblenou horní hranou.',
        required: true,
      },
      {
        slug: 'dimple-even',
        title:
          'Důlek je dost hluboký (mince nad rub nevyčnívá) a bez zvrásnění; mince jde zasunout i vysunout.',
        required: true,
      },
      {
        slug: 'window-retention-tested',
        title:
          'Mince v důlku s vyseknutým oknem drží: při zatřesení nevypadne, při zatlačení z rubu oknem neprojde a prstenec je všude stejně široký (okno Ø 20 mm, u mince 40 mm Ø 32 mm; když nevyjde, menší okno na druhém odřezku).',
        required: true,
      },
      {
        slug: 'second-try',
        title: 'Druhý pokus vyšel lépe než první.',
        required: false,
      },
      {
        slug: 'seam-holes-ok',
        title: 'Zkušební otvory švu zůstaly po tvarování kulaté.',
        required: false,
      },
    ],
    commonMistakes: [
      'Mělký nebo zvrásněný důlek: kůže byla málo vlhká nebo svěrky slabě utažené.',
      'Moc ztenčená kůže v důlku: kůže byla moc mokrá nebo svěrky přetažené.',
      'Svěrky utažené jen z jedné strany: víko se nakloní.',
      'Mince bez fólie: kůže se od kovu může tmavě zabarvit.',
      'Čáry na líci kapsy: zůstanou vidět. Osy se kreslí jen na rub.',
      'Kůže nevystředěná podle os: otvory švu jsou jen asi 2 mm od dna důlku, i malý posun je zatáhne do důlku.',
      'Vynechaná zkouška okna: jestli úzký prstenec 3,75 mm minci udrží, ukáže jen odřezek.',
      'Okno mimo střed: na užší straně prstence mince projde snáz.',
    ],
    safety: [
      'Aku vrtačku používejte podle návodu výrobce. Desku vždy upněte svěrkou ke stolu, nedržte ji v ruce; prsty mimo vrták.',
      'Nůž veďte tahem od prstů volné ruky.',
      'Prsty držící výsečník nebo vidličku mějte u spodku, palička dopadá na horní konec. Děrujte jen na tvrdé desce.',
    ],
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
    goal: 'Vyzkoušet osazení druku na odřezku stejné kůže jako tělo; u kůže 1,5 mm navíc ztenčit ohyb na 1 mm.',
    materials: [
      '2–3 odřezky stejné kůže jako tělo, u kůže 1,5 mm ještě jeden na ztenčení; u sestavy z nákupního plánu si na kusu Blu A5 nejdřív obkreslete vedle sebe podél jedné hrany kapsu 57,5 × 57,5 mm a cvičný proužek 130 × 40 mm a odřezky berte ze zbytku',
      'druk s aplikátorem (u Prym Anorak 12 mm je v balení) a návod z obalu',
      'výsečník 2 mm, případně 3 mm – jen když návod druku vyžaduje otvor',
      'kus dřeva nebo tvrdé desky pod kování',
      'posuvné měřítko, pokud ho máte (jinak ocelové pravítko)',
      'tužka HB nebo 2B (jen u kůže 1,5 mm, na pásmo ztenčení)',
    ],
    requiredEquipment: ['scratch-awl', 'snap-fastener', 'mallet', 'punching-board'],
    recommendedEquipment: ['veg-tan-leather', 'safety-skiver', 'small-hole-punch', 'steel-ruler'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení',
        body: 'Jen u kůže těla 1,5 mm – u kůže 1,2 mm tenhle i další krok přeskočte. Na rub odřezku narýsujte tužkou podle pravítka dvě rovnoběžné čáry 9,9 mm od sebe (šířka ohybu B, přesně 9,92 mm) a od každé odsaďte 3 mm ven. Ztenčuje se celé toto pásmo, asi 16 mm.',
        media: [],
      },
      {
        id: 'skive',
        title: 'Ztenčete z rubu na 1 mm',
        body: 'Jen u kůže 1,5 mm. Bezpečnostním ztenčovačem odebírejte z rubu tenké hobliny, čepel veďte skoro naplocho. Průběžně kontrolujte tloušťku – cíl je asi 1 mm, ne proříznutí.',
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
        id: 'why-scrap-first',
        title: 'Připravte si druk a návod',
        body: 'Druk nejdřív celý vyzkoušejte na odřezku: obchod ho uvádí pro jemnou kůži a třísločiněná je tužší (ověřte na odřezku). Mějte po ruce návod z obalu. Druk je čtyřdílný: dřík a hlavička jdou na přední panel, zdířka a klobouček na jazyk (skladbu ověřte podle obalu). Každá polovina svírá jen jednu vrstvu kůže.',
        animationLinks: [animationLink('snap', 'A1')],
        media: [],
      },
      {
        id: 'punch-post-hole',
        title: 'Otvor pro dřík druku (pokud ho návod vyžaduje)',
        body: 'Šídlem označte na odřezku bod 9,5 mm od okraje – stejně daleko bude dřík od horní hrany předního panelu. Když návod vyžaduje otvor, řiďte se jím. Když velikost neuvádí, vysekněte otvor výsečníkem 2 mm a přiložte dřík: má projít těsně. Když neprojde, zkuste 3 mm. V moc velkém otvoru se dřík viklá.',
        animationLinks: [animationLink('snap', 'A2')],
        media: [],
      },
      {
        id: 'set-snap-post',
        title: 'Osaďte dřík druku',
        body: 'Dřík s hlavičkou osaďte na značku aplikátorem a paličkou na tvrdé podložce, kolmo: dřík z rubu, hlavička na líci; pořadí dílů podle návodu. Zkontrolujte, že sedí naplocho a pevně a kůže kolem nepopraskala. Když ne, zkuste to na dalším odřezku (v balení je 10 ks). Když to nevyjde ani napodruhé, tento druk na pás neosazujte a vyzkoušejte alternativu z vybavení (Stoklasa Ø 13,5 mm, ověřte na odřezku).',
        animationLinks: [animationLink('snap', 'A4')],
        media: [
          {
            id: 'cch-l3-snap',
            kind: 'photo',
            caption: 'Aplikátor druku nad dříkem na odřezku, palička ve výchozí poloze nad ním',
            status: 'planned',
          },
        ],
      },
      {
        id: 'practice-imprint',
        title: 'Vyzkoušejte obtisk patice na druhém odřezku',
        body: 'Druhý odřezek položte rubem na hlavičku osazenou na prvním a pevně přitiskněte, aby se na rubu obtiskla. Střed obtisku propíchněte šídlem skrz, aby byl vidět i na líci – tam půjde klobouček. Jak silně přitlačit, zjistíte jen zkouškou. Stejně budete v lekci 8 hledat místo kloboučku na jazyku.',
        media: [],
      },
      {
        id: 'practice-snap-cap',
        title: 'Osaďte kloboučkovou polovinu',
        body: 'Na druhém odřezku osaďte klobouček se zdířkou do propíchnutého bodu, aplikátorem a paličkou jako dřík: klobouček na líc, zdířku na rub. Když návod vyžaduje otvor a neuvádí velikost, začněte výsečníkem 2 mm, a jen když trn neprojde, vezměte 3 mm. Zacvakněte druk na dřík a zkontrolujte, že drží, jde zavřít i otevřít a okraje odřezků sedí jako při obtisku. Zapište si, který výsečník sedl (nebo žádný).',
        animationLinks: [animationLink('snap', 'A5')],
        media: [
          {
            id: 'ilustrace-druk-l3',
            kind: 'illustration',
            caption:
              'Čtyři díly druku: klobouček a zdířka na jazyk, hlavička a dřík na přední panel, každá polovina svírá jednu vrstvu',
            status: 'available',
            src: illustration.druk,
          },
        ],
      },
      {
        id: 'measure-flange',
        title: 'Změřte přírubu patice',
        body: 'Na rubu prvního odřezku změřte průměr příruby dříku (měřítkem nebo pravítkem). Smí mít nejvýš 11 mm, jinak by na rubu tlačila na karty. Když má víc, střih s tímto drukem nepoužívejte.',
        animationLinks: [animationLink('snap', 'A7')],
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'skive-clean',
        title: 'Jen u kůže 1,5 mm: ztenčené pásmo má rovnoměrně asi 1 mm a nikde není proříznuté.',
        required: false,
      },
      {
        slug: 'hardware-set',
        title: 'Dřík sedí na odřezku naplocho, pevně a přesně na značce.',
        required: true,
      },
      {
        slug: 'imprint-tried',
        title: 'Obtisk hlavičky je vyzkoušený a jeho střed propíchnutý na líc.',
        required: false,
      },
      {
        slug: 'snap-opens-closes',
        title: 'Druk na odřezcích jde zavřít i znovu otevřít.',
        required: true,
      },
      {
        slug: 'flange-measured',
        title: 'Příruba dříku je změřená a má nejvýš Ø 11 mm.',
        required: true,
      },
    ],
    commonMistakes: [
      'Ztenčovač skoro kolmo: prořízne kůži.',
      'Moc velký otvor: dřík se viklá.',
      'Šikmý úder na aplikátor: kování nesedne rovně a drží volně.',
      'Druk poprvé až na pásu: jestli v tuhé kůži drží, ukáže jen zkouška na odřezku.',
    ],
    safety: [
      'Ztenčovač držte skoro naplocho, prsty volné ruky mimo dráhu čepele. Čepel vyměňte, jakmile začne trhat místo řezat.',
      'Prsty držící aplikátor nebo výsečník mějte u spodku, palička dopadá na horní konec. Pracujte na tvrdé desce.',
    ],
    media: [
      {
        id: 'cch-l3-hero',
        kind: 'photo',
        caption: 'Odřezek s viditelně ztenčeným pásmem ohybu a naplocho osazeným drukem',
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
    goal: 'Na odřezku prosekat zrcadlené otvory, složit proužek do dvou ohybů kolem obsahu a sešít tři vrstvy.',
    materials: [
      'kus stejné kůže jako pás, asi 130 × 40 mm: tři panely po 30 mm plus ohyby (u kůže 1,2 mm A 15,7 mm a B 8,7 mm, u kůže 1,5 mm A 16,6 mm a B 9,9 mm), tedy u kůže 1,2 mm asi 114 mm a u kůže 1,5 mm asi 117 mm; zbytek je rezerva',
      'pár karet zabalených v potravinové fólii a přeložený papír asi 2 mm silný místo bankovek',
      'houbička a voda',
      'kostěná rozhrnovačka nebo hrana pravítka',
      'sponky s podložkou',
      'nit 0,6 mm, asi 0,8 m – na krátký šev odřezku stačí asi 0,4 m, 0,8 m nechává začátečníkovi rezervu',
      'tužka HB nebo 2B',
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
      'utility-knife',
      'cutting-mat',
      'scratch-awl',
    ],
    recommendedEquipment: [
      'masking-tape',
      'wing-divider',
      'safety-skiver',
      'edge-paint',
      'edge-burnisher',
    ],
    prerequisiteLessons: [L1, L3],
    steps: [
      {
        id: 'cut-practice-strip',
        title: 'Vyřízněte cvičný proužek',
        animationLinks: [
          animationLink('stripTransfer', 'A2'),
          animationLink('stripTransfer', 'A3'),
          animationLink('stripTransfer', 'B1'),
          animationLink('stripTransfer', 'D3'),
        ],
        printLink: 'practice-sheets',
        body: 'Na stránce Cvičné listy vytiskněte list „Cvičný proužek pro lekci 4“ pro svou tloušťku kůže na 100 % a zkontrolujte úsečku 50 mm. Vystřihněte ho nahrubo s okrajem 1–2 cm, jen dole přesně po plné čáře. Dolní hranu listu přiložte na líc přesně na rovnou dolní hranu kůže a obrys vystřeďte po délce. List přilepte páskou jen na okrajích, mimo čáru řezu. Pravítkem zkontrolujte, že kroužky na koncích linie švu leží 3,5 mm od dolní hrany. Šídlem propíchněte kroužky na koncích čar ohybů A i B a linie švu a všechny tečky dna, pak na řezací podložce řežte nožem podle ocelového pravítka skrz papír po obrysu. Na rubu spojte konce čar ohybů tužkou podle pravítka. Bez listu: na rub narýsujte uprostřed panel 30 mm, vedle něj ohyb A (u kůže 1,2 mm 15,7 mm, u 1,5 mm 16,6 mm), z druhé strany ohyb B (u kůže 1,2 mm 8,7 mm, u 1,5 mm 9,9 mm) a za nimi panely po 30 mm.',
        media: [],
      },
      {
        id: 'mark-mirrored-dots',
        title: 'Vyznačte otvory dna zrcadlené přes ohyby',
        animationLinks: [animationLink('bottomHoles', 'E1'), animationLink('bottomHoles', 'A2')],
        body: 'S cvičným listem máte tečky hotové – krok přeskočte. Bez listu narýsujte linii švu 3,5 mm od dolní hrany. Otvory odměřte od čar ohybu, zrcadlově na obou sousedních panelech – jen tak po složení lícují. Od čáry ohybu i od hrany nechte aspoň 3,5 mm: na panelu 30 mm s roztečí 4 mm vyjde 5 mezer, tedy 6 otvorů, krajní (30 − 5 × 4) / 2 = 5 mm od čáry ohybu i od hrany. Na listu PÁS vyjde stejným výpočtem z panelu 72 mm 17 otvorů, krajní (72 − 16 × 4) / 2 = 4 mm od čar ohybů i od hran. Při jiné délce panelu počet přepočítejte.',
        media: [],
      },
      {
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení ohybu B',
        body: 'Jen u kůže 1,5 mm (u 1,2 mm přeskočte). Na rubu vyznačte pásmo ohybu B, asi 9,9 mm (s cvičným listem spojte propíchnuté konce), a od obou čar odsaďte 3 mm ven – celkem asi 16 mm, jako v lekci 3.',
        media: [],
      },
      {
        id: 'skive-fold-b',
        title: 'Ztenčete ohyb B',
        body: 'Jen u kůže 1,5 mm: pásmo ztenčete z rubu na 1 mm bezpečnostním ztenčovačem, jako v lekci 3.',
        media: [],
      },
      {
        id: 'punch-flat',
        title: 'Prosekejte otvory naplocho',
        animationLinks: [
          animationLink('bottomHoles', 'E1'),
          animationLink('bottomHoles', 'A3'),
          animationLink('bottomHoles', 'D2'),
        ],
        body: 'Vidličkami 4 mm prosekejte na děrovací desce otvory dna podle teček na plochém proužku: prostřední panel (přední) z líce, oba krajní (zadní a vnitřní) z rubu. Ohyb panel převrátí – otvory ze stejné strany by se po složení zkřížily.',
        media: [
          {
            id: 'ilustrace-prosekavani-l4',
            kind: 'illustration',
            caption:
              'Přední panel prosekat z líce, zadní a vnitřní z rubu – po složení pak šikmé otvory lícují',
            status: 'available',
            src: illustration.prosekavaniDna,
          },
        ],
      },
      {
        id: 'wet-fold-zones',
        title: 'Navlhčete pásma ohybů',
        body: 'Houbičkou navlhčete jen pásma ohybů, ne celou kůži.',
        animationLinks: [animationLink('pouchFold', 'B1')],
        media: [],
      },
      {
        id: 'fold-around-content',
        title: 'Přeložte kolem obsahu',
        body: 'Zabalené karty položte na rub předního (prostředního) panelu a přeložte přes ně vnitřní panel ohybem B. Na líc vnitřního panelu položte přeložený papír místo bankovek a přes všechno přeložte zadní panel ohybem A (pořadí: přední – karty – vnitřní – bankovky – zadní). Ohyby tvarujte do smyčky, ne na ostro – nasucho nebo na ostro líc praská. Přejeďte rozhrnovačkou a sepněte sponkami přes podložku. Než necháte zaschnout, zkontrolujte, že otvory na sousedních panelech lícují. Když ne, dokud je kůže vlhká, ohyb rozevřete a přeložte se smyčkou posunutou tak, aby seděly; malý zbytek srovnáte při lepení jehlami. Když nesedí ani pak, zapište si, o kolik mm a u kterého ohybu (příčinou bývá odměření teček; co s větším posunem, ověřte na odřezku). Zapište si i, jak tuhý je ohyb A. Nechte zaschnout.',
        animationLinks: [animationLink('pouchFold', 'B2'), animationLink('bottomHoles', 'E2')],
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
        id: 'unfold-roughen-glue',
        title: 'Zdrsněte a slepte, spoj po spoji',
        body: 'Vyjměte obsah. Zaschlé ohyby rozevřete jen zhruba do pravého úhlu, ne úplně naplocho – suchý ohyb A by mohl prasknout. Dva spoje lepte po jednom. Nejdřív přední s vnitřním: zdrsněte smirkem rub předního a rub vnitřního panelu v pruhu 0–3,5 mm od hrany (ne výš než čára švu), naneste lepidlo v tenké rovnoměrné vrstvě a nechte odvětrat podle návodu. Přeložte zpátky, zarovnejte jehlami přes otvory a přitiskněte. Pak stejně vnitřní se zadním: líc vnitřního a rub zadního panelu.',
        animationLinks: [animationLink('pouchFold', 'C1')],
        media: [],
      },
      {
        id: 'saddle-stitch-reminder',
        title: 'Připomeňte si sedlářský steh',
        animationLinks: [animationLink('saddleStitch', 'D1')],
        body: 'Steh je stejný jako u pouzdra na karty: dvě jehly proti sobě, stále stejné pořadí a utažení. Rytmus si případně zopakujte v lekci 4 prvního projektu.',
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
        id: 'stitch-through-layers',
        title: 'Sešijte tři vrstvy',
        body: 'Sešijte sedlářským stehem skrz všechny tři vrstvy hotovými otvory, na začátku i na konci dva zpětné stehy. Zkontrolujte rub: bývá trochu méně pravidelný než líc, to je normální. Stehy na rubu ale musí být stejně utažené, v jedné řadě a bez smyček. Křivé otvory na rubu znamenají, že vidličky nebyly kolmo.',
        animationLinks: [
          animationLink('pouchFold', 'D2'),
          animationLink('saddleStitch', 'E2'),
          animationLink('saddleStitch', 'G2'),
          animationLink('threadLength'),
        ],
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
      {
        id: 'try-edge-paint',
        title: 'Vyzkoušejte barvu na hrany na odřezku',
        body: 'Jen u barvené kůže (sestava z nákupního plánu Blu). Na hraně odřezku vyzkoušejte barvu na hrany: hranu srovnejte smirkem, barvu naneste podle návodu, nechte zaschnout a zaleštěte. Zkontrolujte, že nezatekla na líc. Zapište si počet vrstev a dobu schnutí – podle toho postupujte v lekcích 5, 6 a 8.',
        animationLinks: [animationLink('edges', 'C1'), animationLink('edges', 'D1')],
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'holes-aligned',
        title: 'Otvory na všech třech panelech po složení lícují.',
        required: true,
      },
      {
        slug: 'fold-clean',
        title: 'Oba ohyby drží tvar smyčky, líc bez prasklin.',
        required: true,
      },
      {
        slug: 'stitch-through-three',
        title: 'Steh prochází všemi třemi vrstvami, stehy na líci mají stejný sklon.',
        required: true,
      },
      {
        slug: 'edge-paint-tried',
        title: 'U barvené kůže je barva vyzkoušená a zapsaná (vrstvy, doba schnutí).',
        required: false,
      },
      {
        slug: 'fold-a-stiffness-noted',
        title: 'Máte zapsané, jak tuhý je ohyb A.',
        required: false,
      },
      {
        slug: 'skive-band-even',
        title:
          'Jen u kůže 1,5 mm: ztenčené pásmo ohybu B má rovnoměrně asi 1 mm. U kůže 1,2 mm se přeskakuje.',
        required: false,
      },
    ],
    commonMistakes: [
      'Otvory odměřené jen od hrany, ne zrcadlově od ohybu: po složení nelícují.',
      'Sousední panely prosekané ze stejné strany: otvory se po složení zkříží.',
      'Ohyb nasucho nebo na ostro: líc praská.',
      'Lepidlo nad čárou švu: vrstvy se slepí tam, kde má mít obsah vůli.',
      'Oba spoje slepené najednou: hůř se zarovnají jehlami.',
    ],
    safety: [
      'Nůž veďte tahem od prstů volné ruky.',
      'Vidličky držte pevně u spodku, palička dopadá na horní konec, ne na prsty. Děrujte jen na tvrdé desce.',
      'Kontaktní lepidlo na rozpouštědlové bázi používejte ve větrané místnosti.',
      'Jen u kůže 1,5 mm: ztenčovač držte skoro naplocho, prsty volné ruky mimo dráhu čepele.',
    ],
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
    goal: 'Vyříznout pás podle šablony na líci, narýsovat čáry ohybů (u kůže 1,5 mm i ztenčení) a prosekat otvory dna.',
    materials: [
      'kůže na pás, aspoň A4: třísločiněná 1,2 mm (výchozí, např. Blu nebo Verde), nebo 1,5 mm (pak se ohyb B ztenčuje)',
      'šablona PÁS pro vaši kůži a minci (viz první krok)',
      'tužka HB nebo 2B',
      'Tokonole nebo gum tragacanth na zapečetění rubu',
      'barva na hrany (u barvené kůže)',
      'maskovací páska',
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
      'masking-tape',
    ],
    recommendedEquipment: ['corner-template', 'edge-burnisher', 'edge-paint', 'safety-skiver'],
    prerequisiteLessons: [L2, L3, L4],
    steps: [
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte šablonu',
        body: 'Na stránce Listy střihu (odkaz pod krokem) vytiskněte šablonu PÁS na A4 na 100 %, nejlépe na matný papír 120 g. Úsečka musí měřit přesně 50 mm. Předem zaškrtnutý list je pro minci 50 Kč a kůži 1,2 mm; u kůže 1,5 mm vytiskněte Pás (šablona) – kůže 1,5 mm, u mince 40 mm Pás – mince 40 mm, u kůže 1,5 mm s mincí 40 mm Pás (šablona) – mince 40 mm, kůže 1,5 mm. Popis dole na listu uvádí minci a tloušťku kůže – zkontrolujte, že odpovídají vašim.',
        printLink: 'pattern-sheets',
        media: [],
      },
      {
        id: 'transfer-face',
        title: 'Přilepte šablonu na líc',
        animationLinks: [
          animationLink('stripTransfer', 'A2'),
          animationLink('stripTransfer', 'A1'),
        ],
        body: 'Šablonu vystřihněte nahrubo s okrajem 1–2 cm. Položte ji na LÍC kůže – jinak než u pouzdra na karty, kde ležela na rubu. Přilepte ji maskovací páskou z několika stran, jen na okrajích mimo čáru řezu. Pásku nejdřív zkuste na odřezku – na líci může nechat stopu. Šablona se rozřeže, na každý pás vytiskněte novou.',
        media: [],
      },
      {
        id: 'transfer-marks-awl',
        title: 'Před řezáním propíchněte značky',
        animationLinks: [animationLink('stripTransfer', 'A3'), animationLink('pocketAttach', 'A2')],
        body: 'Než začnete řezat, propíchněte šídlem skrz papír: konce obou čar ohybů A i B (asi 1 mm od hrany pásu), rohy místa pro kapsu (asi 1 mm dovnitř od zaobleného rohu, aby značku zakryla kapsa), střed dříku druku a všechny tečky dna.',
        media: [
          {
            id: 'ilustrace-prenos-znacek',
            kind: 'illustration',
            caption:
              'Kam šídlem propíchnout list: konce čar ohybů, rohy kapsy, střed patice, tečky dna',
            status: 'available',
            src: illustration.prenosZnacek,
          },
        ],
      },
      {
        id: 'cut-strip',
        title: 'Vyřízněte pás skrz papír',
        animationLinks: [
          animationLink('stripTransfer', 'B1'),
          animationLink('stripTransfer', 'C1'),
          animationLink('stripTransfer', 'C2'),
          animationLink('stripTransfer', 'C3'),
          animationLink('stripTransfer', 'B3'),
        ],
        body: 'Na řezací podložce řežte skrz papír i kůži přesně po čáře. Rovné strany podle ocelového pravítka 2–3 lehkými tahy, nůž kolmo; pravítko leží na pásu, ne na odpadu. Malé vypouklé zaoblení R2,5, kde výřez R34 potkává horní hranu, vyřízněte po čáře, nebo nechte pravý úhel a zaoblete ho smirkem. Oblouk výřezu (R34 vepředu, čtvrtelipsa vzadu) a zaoblené rohy (2× R10 na konci jazyka, 3× R6) řežte pomalu bez pravítka, krátkými tahy. Konec jazyka je zatím orientační, zkrátí se v lekci 8. Když řez začne třepit, odlomte článek čepele.',
        media: [
          {
            id: 'postup-1',
            kind: 'illustration',
            caption:
              'Pás přenesený na líc a vyříznutý, stranou kus kůže na kapsu (krok 1 listu postupu)',
            status: 'available',
            src: processStep[0],
          },
          {
            id: 'cch-l5-cut',
            kind: 'photo',
            caption:
              'Pás tří panelů vyříznutý skrz šablonu přilepenou páskou na líci, šablona ještě na kůži',
            status: 'planned',
          },
        ],
      },
      {
        id: 'peel-template',
        title: 'Sejměte šablonu a zkontrolujte značky',
        animationLinks: [animationLink('stripTransfer', 'D1')],
        body: 'Pásku strhávejte pomalu pod ostrým úhlem. Zkontrolujte, že jsou vidět všechny značky: konce čar ohybů, rohy kapsy, střed dříku a tečky dna.',
        media: [],
      },
      {
        id: 'transfer-other',
        title: 'Jinak: obkreslení',
        body: 'Šablonu můžete také vystřihnout přesně po čáře, obkreslit na líc a značky propíchnout přes znovu přiloženou šablonu. Řez skrz papír je ale přesnější.',
        media: [],
      },
      {
        id: 'draw-fold-lines',
        title: 'Narýsujte čáry ohybů na rub',
        animationLinks: [
          animationLink('stripTransfer', 'D3'),
          animationLink('stripTransfer', 'D2'),
        ],
        body: 'Pás otočte rubem nahoru. Propíchnuté konce čar ohybů spojte tužkou HB nebo 2B lehce podle pravítka – vzniknou 4 čáry, dvě u ohybu A a dvě u ohybu B. Na líc nic nekreslete.',
        media: [],
      },
      {
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení ohybu B',
        body: 'Jen u kůže 1,5 mm (u 1,2 mm přeskočte). Od obou čar ohybu B odsaďte na rubu 3 mm ven – pásmo ztenčení má asi 16 mm. Ohyb A se neztenčuje.',
        media: [],
      },
      {
        id: 'skive-fold-b',
        title: 'Ztenčete ohyb B',
        body: 'Jen u kůže 1,5 mm: pásmo ztenčete z rubu na 1 mm bezpečnostním ztenčovačem, jako v lekci 3.',
        media: [],
      },
      {
        id: 'punch-bottom-holes',
        title: 'Prosekejte otvory dna',
        animationLinks: [
          animationLink('bottomHoles', 'B1'),
          animationLink('bottomHoles', 'C1'),
          animationLink('bottomHoles', 'D1'),
          animationLink('bottomHoles', 'D2'),
        ],
        body: 'Vidličkami s roztečí přesně 4 mm prosekejte naplocho na děrovací desce otvory dna podle teček na všech třech panelech: přední z líce, zadní a vnitřní z rubu. Ze stejné strany by se otvory po složení zkřížily.',
        media: [
          {
            id: 'ilustrace-prosekavani-l5',
            kind: 'illustration',
            caption:
              'Přední panel prosekat z líce, zadní a vnitřní z rubu – po složení pak šikmé otvory lícují',
            status: 'available',
            src: illustration.prosekavaniDna,
          },
        ],
      },
      {
        id: 'dye-burnish-and-seal',
        title: 'Dokončete skryté hrany a zapečeťte rub',
        animationLinks: [animationLink('edges', 'F1')],
        body: 'Hrany, na které po složení nedosáhnete, teď obarvěte (u barvené kůže, jak jste zkoušeli v lekci 4) a zaleštěte: horní a volnou svislou hranu vnitřního panelu, celý oblouk výřezu na prst a jazyk. Pak zapečeťte rub vnitřního panelu – je vidět výřezem. Pruh 0–3,5 mm od dolní hrany nechte volný, bude se lepit: přelepte maskovací páskou, horní okraj pásky na čáru švu. Pastu (Tokonole nebo gum tragacanth) naneste na rub v tenké vrstvě a přetřete leštítkem (hustotu a počet vrstev ověřte na odřezku). Na líc ji nedávejte – nechá lesklou skvrnu. Po zaschnutí pásku pomalu strhněte.',
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
        title: 'Pás je vyříznutý podle šablony na líci, výřez je plynulý oblouk bez zubu.',
        required: true,
      },
      {
        slug: 'marks-transferred',
        title:
          'Jsou vidět všechny propíchnuté značky: konce čar ohybů, rohy kapsy, střed dříku a tečky dna.',
        required: false,
      },
      {
        slug: 'fold-lines-drawn',
        title: 'Na rubu jsou narýsované 4 čáry ohybů.',
        required: false,
      },
      {
        slug: 'skive-transferred',
        title:
          'Jen u kůže 1,5 mm: pásmo ohybu B je z rubu ztenčené na asi 1 mm, asi 16 mm široké. U kůže 1,2 mm se ztenčení přeskakuje.',
        required: true,
      },
      {
        slug: 'inner-edges-burnished',
        title:
          'Hrany, na které po složení nedosáhnete, jsou obarvené (u barvené kůže) a zaleštěné; rub vnitřního panelu je zapečetěný mimo pruh pod čárou švu.',
        required: false,
      },
    ],
    commonMistakes: [
      'Šablona na rubu místo na líci: přední panel vyjde zrcadlově.',
      'Nůž vedený po okraji papíru místo po pravítku: uhne a hrana není rovná.',
      'Páska přes čáru řezu: řez uhne.',
      'Značky propíchnuté až po vyříznutí: rozřezaná šablona už přesně nedosedne.',
      'Ztenčený ohyb A: u kůže 1,5 mm se ztenčuje jen ohyb B (šrafa).',
      'Sousední panely prosekané ze stejné strany: otvory se po složení zkříží.',
      'Nezapečetěný rub vnitřního panelu: je vidět výřezem.',
      'Zapečetěný pruh pod čárou švu: lepidlo v lekci 7 na něm nedrží.',
    ],
    safety: [
      'Volná ruka drží kůži u výřezu za okraj dílu, daleko od čepele. Nůž veďte tahem od prstů.',
      'Vidličky držte u spodku, palička dopadá na horní konec. Děrujte jen na tvrdé desce.',
      'Jen u kůže 1,5 mm: ztenčovač držte skoro naplocho, prsty volné ruky mimo dráhu čepele.',
    ],
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
    goal: 'Vytvarovat kapsu s mincí z kůže 1,2 mm, vyseknout okno, přišít kapsu na přední panel a osadit dřík druku.',
    materials: [
      'kůže 1,2 mm na kapsu, aspoň 57,5 × 57,5 mm (u mince 40 mm 70 × 70 mm), i když je pás z 1,5 mm',
      'list KAPSA (u mince 40 mm varianta pro 40 mm): 1 výtisk na značky na líci, další na formu a šablonu s oknem jen tehdy, když je nemáte z lekce 2 (pro okno Ø 18 mm list Kapsa – záložní okno Ø 18 mm)',
      'barva na hrany (u barvené kůže)',
      'mince (výchozí 50 Kč) a potravinová fólie',
      'nit 0,6 mm, asi 0,8 m (23 otvorů, u mince 40 mm 31)',
      'tužka HB nebo 2B',
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
      'scratch-awl',
      'steel-ruler',
      'masking-tape',
    ],
    recommendedEquipment: [
      'corner-template',
      'sandpaper',
      'small-hole-punch',
      'edge-paint',
      'edge-burnisher',
    ],
    prerequisiteLessons: [L5],
    steps: [
      {
        id: 'trace-and-punch-pocket',
        title: 'Přeneste značky na líc a prosekejte šev',
        body: 'Postup je stejný jako v lekci 2. Výtisk listu KAPSA na značky (odkaz pod krokem) vystřihněte nahrubo a přilepte maskovací páskou na LÍC kůže 1,2 mm, jen na okrajích mimo obrys. Šídlem propíchněte tečky švu a 4 konce os. Pásku pomalu strhněte a zkontrolujte, že jsou vidět všechny značky. Na líc nic nekreslete. Vidličkami prosekejte naplocho na děrovací desce otvory švu z líce – při přišívání budete sekat ze stejné strany.',
        printLink: 'pattern-sheets',
        animationLinks: [animationLink('kapsa', 'B1')],
        media: [],
      },
      {
        id: 'trace-pocket-template',
        title: 'Narýsujte osy a obrys na rub',
        body: 'Kůži otočte. Konce os spojte na rubu tužkou podle pravítka a osy protáhněte až k okrajům kůže. Vezměte šablonu s oknem z lekce 2 v průměru, kterým budete sekat (Ø 20 mm nebo Ø 18 mm, u mince 40 mm Ø 32 mm). Když ji nemáte, vytiskněte list znovu (odkaz pod krokem), vystřihněte ho přesně po obrysu kapsy a vysekněte do něj okno výsečníkem postaveným na vytištěnou kružnici. Šablonu položte na RUB a zarovnejte na osy. Obrys obtáhněte šídlem nebo tužkou, vnitřní hranu okna lehce tužkou. Obrys teď neřežte. Všechno udělejte před navlhčením.',
        printLink: 'pattern-sheets',
        animationLinks: [animationLink('kapsa', 'C1')],
        media: [],
      },
      {
        id: 'form-dimple',
        title: 'Vytvarujte důlek na formě',
        body: 'Jako v lekci 2: minci zabalte do fólie, kůži navlhčete houbičkou a počkejte, až povrch začne znovu mírně světlat. Položte ji lícem dolů na formu (zaoblenou hranou otvoru nahoru), osy na rubu na osy desky, a minci na rub nad otvor. Přiklopte víkem a rovnoměrně stáhněte dvěma svěrkami proti sobě. Nechte úplně zaschnout, nejlépe přes noc. Zkontrolujte: okraj důlku je bez zvrásnění a mince vložená z rubu nad okolní rub nevyčnívá.',
        animationLinks: [animationLink('kapsa', 'D1')],
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
        body: 'Zaschlou kapsu položte lícem dolů zpátky na formu: důlek do otvoru, osy na osy. Rozmazané čáry nejdřív obtáhněte podle šablony. Obrys vyřízněte nožem 2–3 lehkými tahy, kůži přidržujte na rovné části (desku můžete chránit kartonem s otvorem Ø 32 mm, u mince 40 mm Ø 44 mm). Formu položte na děrovací desku a do otvoru pod důlek postavte špalík z lekce 2 – dna se jen dotýká, nenadzvedává ho. Výsečník postavte na narýsovanou kružnici, zkontrolujte, že prstenec je po celém obvodu stejně široký, a vysekněte okno. Ø 20 mm (u mince 40 mm Ø 32 mm) sekejte jen tehdy, když vám zkouška v lekci 2 vyšla – jinak průměrem, se kterým vyšla. Pak vložte minci a vyzkoušejte, že oknem nepropadne.',
        animationLinks: [animationLink('kapsa', 'E1')],
        media: [
          {
            id: 'postup-3',
            kind: 'illustration',
            caption:
              'Vyříznutý obrys kapsy a vyseknuté okno s prstencem kolem mince (krok 3 listu postupu)',
            status: 'available',
            src: processStep[2],
          },
          {
            id: 'cch-l6-window',
            kind: 'photo',
            caption: 'Kruhový výsečník nad okrajem důlku na formě, kapsa lícem dolů',
            status: 'planned',
          },
        ],
      },
      {
        id: 'dye-burnish-pocket-edges',
        title: 'Obarvěte a zaleštěte hrany kapsy',
        animationLinks: [animationLink('edges', 'F2')],
        body: 'Hrany kapsy (okno i vnější obrys) obarvěte (u barvené kůže, jak jste zkoušeli v lekci 4) a zaleštěte. Po přišití už na ně nedosáhnete.',
        media: [],
      },
      {
        id: 'glue-pocket',
        title: 'Nalepte kapsu na přední panel',
        animationLinks: [animationLink('pocketAttach', 'B1'), animationLink('pocketAttach', 'B2')],
        body: 'Kapsu nasucho přiložte otevřenou hranou nahoru na 4 propíchnuté značky rohů na předním panelu a pravítkem zkontrolujte polohu: 41,8 mm pod horní hranou a 14,75 mm od boků (u mince 40 mm 35,55 mm a 8,5 mm). Na předním panelu lehce zdrsněte smirkem jen líc pod okrajem kapsy, zbytek nechte hladký. Kontaktní lepidlo naneste jen do úzkého pruhu u okraje, na rub kapsy i na zdrsněné místo. Horní hranu kapsy nelepte – tudy se zasouvá mince. Po odvětrání kapsu přitiskněte přesně na značky; pak už nejde posunout.',
        media: [],
      },
      {
        id: 'stitch-pocket',
        title: 'Prosekněte a přišijte kapsu',
        body: 'Na děrovací desce projeďte vidličkami znovu stejné otvory z líce kapsy, tentokrát skrz kapsu i přední panel. Kapsu přišijte sedlářským stehem, na začátku i na konci dva zpětné stehy. Horní hrana zůstává volná.',
        animationLinks: [
          animationLink('pocketAttach', 'C1'),
          animationLink('saddleStitch', 'D1'),
          animationLink('saddleStitch', 'E2'),
          animationLink('threadLength'),
        ],
        media: [
          {
            id: 'postup-4',
            kind: 'illustration',
            caption:
              'Kapsa přišitá na přední panel, horní hrana otevřená; patice naplocho (krok 4 listu postupu)',
            status: 'available',
            src: processStep[3],
          },
        ],
      },
      {
        id: 'punch-post-hole',
        title: 'Otvor pro dřík (pokud ho návod vyžaduje)',
        body: 'Když návod vyžaduje otvor, vysekněte ho do předního panelu na značku dříku (9,5 mm pod horní hranou) výsečníkem, který vám sedl v lekci 3.',
        animationLinks: [animationLink('snap', 'B2')],
        media: [],
      },
      {
        id: 'set-snap-post',
        title: 'Osaďte dřík druku',
        body: 'Dřík s hlavičkou osaďte na značku aplikátorem a paličkou na tvrdé podložce, jako v lekci 3. Dřík jde z rubu předního panelu, hlavička zůstane na jeho líci. Udělejte to teď – po složení pásu už na něj nedosáhnete.',
        animationLinks: [animationLink('snap', 'B3')],
        media: [
          {
            id: 'ilustrace-druk-l6',
            kind: 'illustration',
            caption:
              'Čtyři díly druku: hlavička a dřík na přední panel, klobouček a zdířka později na jazyk',
            status: 'available',
            src: illustration.druk,
          },
          {
            id: 'cch-l6-hardware',
            kind: 'photo',
            caption: 'Přední panel s přišitou kapsou a osazenou paticí druku',
            status: 'planned',
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'pocket-formed',
        title: 'Důlek je dost hluboký a bez zvrásnění; mince jde zasunout i vysunout.',
        required: true,
      },
      {
        slug: 'window-cut',
        title:
          'Okno je vyseknuté, prstenec kolem mince je všude stejně široký (u Ø 20 mm asi 3,75 mm, u Ø 18 mm 4,75 mm, u mince 40 mm 4 mm) a mince oknem nepropadne.',
        required: true,
      },
      {
        slug: 'pocket-stitched',
        title: 'Kapsa je přilepená a přišitá na správném místě, horní hrana je otevřená.',
        required: true,
      },
      {
        slug: 'pocket-edges-finished',
        title: 'Hrany kapsy jsou obarvené (u barvené kůže) a zaleštěné.',
        required: false,
      },
      {
        slug: 'hardware-flat-set',
        title: 'Dřík druku je osazený naplocho ještě před složením.',
        required: true,
      },
    ],
    commonMistakes: [
      'Obrys kapsy vyříznutý bez orýsování: nesedí na polohu důlku.',
      'Čáry nebo škrábnutí na líci kapsy: zůstanou vidět. Osy i obrys patří na rub.',
      'Šev při přišití prosekaný z opačné strany než poprvé: otvory nelícují.',
      'Lepidlo přes celou plochu kapsy: rozteče se na viditelný líc.',
      'Špalík širší než otvor formy: nadzvedne důlek.',
      'Dřík osazený až po složení: už na něj nedosáhnete.',
      'Okno Ø 20 mm bez zkoušky na odřezku: úzký prstenec nemusí minci udržet.',
    ],
    safety: [
      'Nůž veďte tahem od prstů volné ruky.',
      'Výsečník, vidličky i aplikátor držte u spodku a tlučte kolmo, ruka mimo dráhu paličky. Děrujte jen na tvrdé desce.',
      'Kontaktní lepidlo na rozpouštědlové bázi používejte ve větrané místnosti.',
    ],
    media: [
      {
        id: 'cch-l6-hero',
        kind: 'photo',
        caption: 'Přední panel s hotovou kapsou, oknem a mincí zasunutou shora',
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
      'pás z lekce 6 s přišitou kapsou a dříkem',
      'karty a bankovky, které nosíte, a potravinová fólie na zabalení',
      'houbička a voda',
      'kostěná rozhrnovačka nebo hrana pravítka',
      'sponky s podložkou',
      'nit 0,6 mm, asi 0,8 m – šev dna 64 mm přes tři vrstvy vyjde asi na 0,6 m; 0,8 m nechává začátečníkovi rezervu',
    ],
    requiredEquipment: ['contact-cement', 'sandpaper', 'harness-needles', 'waxed-thread'],
    recommendedEquipment: ['steel-ruler'],
    prerequisiteLessons: [L6],
    steps: [
      {
        id: 'wet-fold-zones',
        title: 'Navlhčete pásma obou ohybů',
        body: 'Houbičkou navlhčete jen pásma obou ohybů, ne celý pás. Na rubu je ohraničují čáry narýsované tužkou v lekci 5.',
        animationLinks: [animationLink('pouchFold', 'B1')],
        media: [],
      },
      {
        id: 'fold-inner-b',
        title: 'Přeložte vnitřní panel ohybem B',
        body: 'Zabalené karty položte na rub předního panelu a přeložte přes ně vnitřní panel ohybem B.',
        animationLinks: [animationLink('pouchFold', 'B2')],
        media: [],
      },
      {
        id: 'fold-back-a',
        title: 'Přeložte zadní panel ohybem A',
        body: 'Zabalené bankovky položte na líc vnitřního panelu. Přes všechno přeložte zadní panel ohybem A. Pořadí vrstev odpředu: přední – karty – vnitřní – bankovky – zadní.',
        animationLinks: [animationLink('pouchFold', 'B3')],
        media: [
          {
            id: 'ilustrace-poradi-ohybu',
            kind: 'illustration',
            caption:
              'Pořadí ohybů v řezu: nejdřív vnitřní za přední (ohyb B), pak zadní přes všechno (ohyb A)',
            status: 'available',
            src: illustration.poradiOhybu,
          },
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
        body: 'Přejeďte rozhrnovačkou. Sponky s podložkou nasaďte na panely těsně vedle obou ohybů, ne na smyčku. Než necháte zaschnout, zkontrolujte, že se otvory dna na sousedních panelech po složení lícují. Když ne, dokud je kůže vlhká, ohyb rozevřete a přeložte se smyčkou posunutou tak, aby seděly (stále mezi čarami z lekce 5). Malý zbytek srovnáte při lepení jehlami. Když se otvory nesrovnají ani tak, nelepte naslepo – postup ověřte na odřezku z lekce 4. Nechte zaschnout.',
        animationLinks: [animationLink('pouchFold', 'B4')],
        media: [
          {
            id: 'postup-5',
            kind: 'illustration',
            caption:
              'Složený pás v řezu: vrstvy přední, karty, vnitřní, bankovky, zadní (krok 5 listu postupu)',
            status: 'available',
            src: processStep[4],
          },
        ],
      },
      {
        id: 'roughen-and-glue-bottom',
        title: 'Zdrsněte a slepte dno, spoj po spoji',
        body: 'Vyjměte obsah. Zaschlé ohyby rozevřete jen zhruba do pravého úhlu, ne úplně naplocho – suchý ohyb A by mohl prasknout. Dva spoje lepte po jednom. Nejdřív přední s vnitřním: v pruhu 0–3,5 mm od hrany (ne výš než čára švu) zdrsněte rub předního a rub vnitřního panelu, naneste lepidlo v tenké rovnoměrné vrstvě a nechte odvětrat podle návodu. Přeložte, zarovnejte jehlami přes otvory a přitiskněte – po dotyku už nejde posunout. Pak stejně spoj vnitřní se zadním: líc vnitřního a rub zadního panelu.',
        animationLinks: [animationLink('pouchFold', 'C1')],
        media: [
          {
            id: 'ilustrace-lepeni-dna',
            kind: 'illustration',
            caption:
              'Lepení dna po jednom spoji, ohyb rozevřený jen asi do pravého úhlu, lepidlo 0–3,5 mm od hrany',
            status: 'available',
            src: illustration.lepeniDna,
          },
        ],
      },
      {
        id: 'stitch-bottom',
        title: 'Prošijte dno',
        body: 'Prošijte dno sedlářským stehem skrz všechny tři vrstvy (17 otvorů na panel, rozteč 4 mm, 3,5 mm od hrany). Na začátku i na konci ušijte dva zpětné stehy. Zkontrolujte rub (zadní panel): bývá trochu méně pravidelný než líc, to je normální. Stehy ale musí být stejně utažené, v jedné řadě a bez smyček. Křivé otvory na rubu znamenají, že vidličky nebyly kolmo.',
        animationLinks: [
          animationLink('pouchFold', 'D2'),
          animationLink('saddleStitch', 'E2'),
          animationLink('threadLength'),
        ],
        media: [
          {
            id: 'postup-6',
            kind: 'illustration',
            caption: 'Dno prošité skrz všechny tři vrstvy (krok 6 listu postupu)',
            status: 'available',
            src: processStep[5],
          },
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
      'Ohyb nasucho nebo na ostro: líc praská.',
      'Sponky na smyčce ohybu: nedrží obsah přitisknutý.',
      'Lepidlo výš než 3,5 mm od hrany: karty ztratí hloubku.',
      'Oba spoje slepené najednou: hůř se zarovnají jehlami.',
      'Přitlačení bez zarovnání jehlami: otvory se rozejdou a jehla jimi neprojde rovně.',
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
      'barva na hrany (u barvené kůže)',
    ],
    requiredEquipment: [
      'snap-fastener',
      'utility-knife',
      'cutting-mat',
      'sandpaper',
      'mallet',
      'punching-board',
      'steel-ruler',
      'scratch-awl',
    ],
    recommendedEquipment: [
      'edge-beveler',
      'corner-template',
      'edge-burnisher',
      'edge-paint',
      'small-hole-punch',
    ],
    prerequisiteLessons: [L7],
    steps: [
      {
        id: 'insert-content',
        title: 'Vložte obsah a přehněte jazyk',
        body: 'Vložte karty i bankovky, které nosíte, a přehněte jazyk přes horní hranu.',
        animationLinks: [animationLink('snap', 'C1')],
        media: [],
      },
      {
        id: 'imprint-cap-position',
        title: 'Obtiskněte polohu kloboučku',
        body: 'Jazyk přitiskněte přes hlavičku na předním panelu, aby se obtiskla na jeho rub. Střed obtisku je střed kloboučku – kružnice na šabloně PÁS je jen orientační a nevadí, když obtisk vyjde jinde. Střed obtisku propíchněte šídlem skrz jazyk, aby byl vidět i na líci (ověřte na odřezku).',
        animationLinks: [animationLink('snap', 'C2')],
        media: [],
      },
      {
        id: 'punch-cap-hole',
        title: 'Otvor pro klobouček (pokud ho návod vyžaduje)',
        body: 'Když návod vyžaduje otvor: jazyk narovnejte nahoru do roviny zadního panelu a pouzdro položte zadním panelem na děrovací desku, aby pod jazykem nebyl přední panel. Otvor vysekněte přesně v obtisknutém místě výsečníkem, který vám sedl v lekci 3.',
        animationLinks: [animationLink('snap', 'C3')],
        media: [],
      },
      {
        id: 'set-cap',
        title: 'Osaďte klobouček',
        body: 'Jazyk narovnejte nahoru a pouzdro položte zadním panelem na tvrdou desku, aby pod jazykem nebyl přední panel. Klobouček se zdířkou osaďte přesně na obtisknuté místo aplikátorem a paličkou. Klobouček jde na líc jazyka, zdířka na jeho rub (k přednímu panelu); pořadí dílů podle návodu, jako v lekci 3.',
        animationLinks: [animationLink('snap', 'C4')],
        media: [
          {
            id: 'ilustrace-druk-l8',
            kind: 'illustration',
            caption:
              'Klobouček na líc jazyka, zdířka na jeho rub; zdířka cvakne na hlavičku na předním panelu',
            status: 'available',
            src: illustration.druk,
          },
          {
            id: 'cch-l8-cap',
            kind: 'photo',
            caption:
              'Aplikátor druku nad obtisknutým místem na jazyku, klobouček připravený k osazení',
            status: 'planned',
          },
        ],
      },
      {
        id: 'shorten-tongue',
        title: 'Zkraťte jazyk a zaoblete rohy',
        body: 'Jazyk narovnejte lícem nahoru na řezací podložku. Pravítkem odměřte na líci jazyka 11 mm od středu kloboučku směrem ke konci jazyka a vyznačte lehkým vpichem šídla po obou stranách kloboučku. Pravítko přiložte přes obě značky a jazyk podle něj uřízněte kolmo k bokům. Rohy zaoblete na R10 rohovou šablonou (lob 20), nebo obtáhněte kulatý předmět Ø 20 mm (minci, víčko) a řízněte po čáře.',
        animationLinks: [animationLink('snap', 'C5')],
        media: [
          {
            id: 'postup-7',
            kind: 'illustration',
            caption:
              'Hotové pouzdro zepředu se zapnutým jazykem a kartou ve výřezu (krok 7 listu postupu)',
            status: 'available',
            src: processStep[6],
          },
        ],
      },
      {
        id: 'sand-flat-bottom',
        title: 'Přebruste dno do roviny',
        animationLinks: [animationLink('edges', 'F3'), animationLink('edges', 'B1')],
        body: 'Dno přebruste smirkem 220–400 na rovné destičce do jedné roviny přes všechny tři vrstvy. Hrany dna zaoblete z obou vnějších stran (přední i zadní panel) brusným papírem na hranolku, nebo ořezávačem hran, máte-li ho.',
        media: [],
      },
      {
        id: 'dye-and-burnish-edges',
        title: 'Obarvěte a zaleštěte vnější hrany',
        animationLinks: [animationLink('edges', 'F3'), animationLink('edges', 'C1')],
        body: 'U barvené kůže obarvěte řez barvou na hrany jako v lekci 4 a nechte zaschnout. Pak zaleštěte všechny vnější hrany včetně nového konce jazyka, jako u pouzdra na karty.',
        media: [
          {
            id: 'cch-l8-edges',
            kind: 'photo',
            caption: 'Zaleštěná vnější hrana pouzdra po obarvení řezu',
            status: 'planned',
          },
          {
            id: 'postup-8',
            kind: 'illustration',
            caption: 'Hotové pouzdro zezadu, výřez naproti jazyku (krok 8 listu postupu)',
            status: 'available',
            src: processStep[7],
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'cap-fits',
        title:
          'Druk drží a jde znovu rozepnout; zkrácený jazyk končí asi 21 mm nad horní hranou kapsy (u mince 40 mm asi 15 mm).',
        required: true,
      },
      {
        slug: 'edges-finished',
        title:
          'Vnější hrany včetně konce jazyka jsou srovnané, obarvené (u barvené kůže) a zaleštěné.',
        required: true,
      },
      {
        slug: 'photo-taken',
        title: 'Hotové pouzdro je vyfocené.',
        required: false,
      },
    ],
    commonMistakes: [
      'Klobouček podle kružnice na šabloně místo podle obtisku: druk nedosedne a jazyk je nakřivo.',
      'Zkrácený jazyk bez zaoblení rohů: konec je hranatý.',
      'Leštění před srovnáním dna: nerovnosti vrstev zůstanou vidět.',
    ],
    safety: [
      'Nůž na zkrácení jazyka veďte tahem od prstů volné ruky.',
      'Výsečník i aplikátor držte u spodku, palička dopadá na horní konec. Pracujte na tvrdé desce.',
    ],
    media: [
      {
        id: 'cch-l8-hero',
        kind: 'photo',
        caption:
          'Hotové pouzdro na karty s vsazenou mincí, jazyk zapnutý drukem, detail okénka s mincí',
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
    'Druhý projekt cesty učení: pás tří panelů ohnutý na obou bocích a šitý jen ve dně, s kapsou na karty, kapsou na bankovky a mincí ve vytvarované kapse s kruhovým okénkem. Navazuje na pouzdro na karty a přidává mokré tvarování, ztenčení ohybu, osazení druku a šití tří vrstev. Čas výroby je hrubý odhad, střih je návrh k ověření na papíru a odřezku.',
  difficulty: 'intermediate',
  estimatedHours: { min: 10, max: 16 },
  skills: [
    'Práce s papírovým modelem',
    'Mokré tvarování kůže do formy',
    'Ztenčení kůže (skiving) v ohybu',
    'Osazení druku',
    'Šití sedlářským stehem skrz tři vrstvy',
    'Skládání pásu do dvou ohybů',
  ],
  phases: [...phases],
  equipment: [
    {
      equipmentSlug: 'veg-tan-leather',
      priority: 'required',
      reason:
        'Pás těla (lekce 5–7) i samostatný list kapsy s mincí (lekce 6) potřebují jiný kus kůže než pouzdro na karty.',
      specification:
        'Tělo: třísločiněná lícová 1,2 mm (výchozí, např. Blu nebo Verde – bez ztenčení ohybu B), přířez A4; nebo 1,5 mm, pak se ohyb B ztenčuje. Kapsa: samostatný kus 1,2 mm, aspoň 57,5 × 57,5 mm (u mince 40 mm 70 × 70 mm), i když je tělo z 1,5 mm. K tomu odřezky na trénink v lekcích 2–4.',
    },
    {
      equipmentSlug: 'coin-forming-block',
      priority: 'required',
      reason: 'Tvarování důlku na minci za mokra (lekce 2 a 6).',
      specification:
        'Dvoudílná forma z překližky (jako forma poslouží i bukové kuchyňské prkénko asi 1,5 cm silné, např. Orion), otvor Ø 31,5 mm pro výchozí minci 50 Kč (vykružovací pila 32 mm – ověřit na odřezku; Forstnerův vrták jen 32 mm); Ø 44 mm pro minci 40 mm.',
    },
    {
      equipmentSlug: 'clamps',
      priority: 'required',
      reason: 'Stažení formy s kůží a mincí při schnutí.',
      specification: 'Dvě svěrky proti sobě, vyložení aspoň na střed formy 8 × 8 cm.',
    },
    {
      equipmentSlug: 'scratch-awl',
      priority: 'required',
      reason:
        'Orýsování obrysu kapsy, vyznačení pásma ztenčení, propíchnutí středů kování a odsazení kování.',
      specification: 'Kulaté rýsovací šídlo s hruškovitou rukojetí.',
    },
    {
      equipmentSlug: 'masking-tape',
      priority: 'required',
      reason:
        'Přidrží šablonu PÁS na líci, zatímco propichujete značky a řežete skrz papír po vytištěné čáře (hlavní způsob v lekci 5), list KAPSA při propichování (lekce 2 a 6) a cvičný list v lekci 4; v lekci 5 navíc ohraničí pruh pod čárou švu, který se nepečetí. Stejná role jako u projektu 01 a 03.',
      specification:
        'Papírová maskovací páska kolem 25 mm s nízkou lepivostí (na citlivé povrchy); na líci nejdřív zkouška na odřezku.',
      alternatives: ['Šablonu vystřihnout přesně, přidržet rukou nebo závažím a obkreslit'],
    },
    {
      equipmentSlug: 'sandpaper',
      priority: 'required',
      reason: 'Zdrsnění lepené plochy dna a srovnání hran po sešití, přebroušení dna do roviny.',
      specification: 'Zrnitost 180–240 na zdrsnění, 220–400 na srovnání hran.',
    },
    {
      equipmentSlug: 'stitching-chisels',
      priority: 'required',
      reason:
        'Otvory dna se prosekají naplocho přes všechny tři panely pásu, dřív než se pás složí, a pak se jimi šije; stejnými vidličkami se v lekci 6 prosekává i šev kapsy skrz obě vrstvy.',
      specification:
        'Rozteč přesně 4 mm (s 3,85 mm by otvory dna po složení nelícovaly), sada 2 + 4/6 hrotů.',
    },
    {
      equipmentSlug: 'mallet',
      priority: 'required',
      reason: 'Úder do vidliček, výsečníků i do aplikátoru druku.',
      specification: 'Gumová nebo plastová.',
    },
    {
      equipmentSlug: 'punching-board',
      priority: 'required',
      reason: 'Podklad pod děrování a osazování kování.',
      specification: 'HDPE deska nebo plastové prkénko.',
    },
    {
      equipmentSlug: 'safety-skiver',
      priority: 'recommended',
      reason:
        'Jen u kůže těla 1,5 mm: ohyb B se ztenčuje na 1 mm z rubu, aby protažení líce kleslo z asi 26 % na 16 %. Při kůži 1,2 mm se ztenčení přeskakuje a ztenčovač není potřeba.',
      specification:
        'Safety skiver s vyměnitelnou čepelí; ztenčuje se celé pásmo ohybu B plus 3 mm přesahu za každou jeho čárou (asi 16 mm celkem).',
    },
    {
      equipmentSlug: 'snap-fastener',
      priority: 'required',
      reason:
        'Zapínání jazyka drukem: nejdřív zkouška na odřezku v lekci 3, pak dřík s hlavičkou naplocho do předního panelu v lekci 6 a klobouček se zdířkou podle obtisku na jazyk v lekci 8.',
      specification:
        'Klobouček Ø 12 mm – doporučený Prym Anorak 12 mm s aplikátorem v balení, osazuje se paličkou. Dřík + hlavička na přední panel, zdířka + klobouček na jazyk; každá polovina jen na jednu vrstvu kůže 1,2–1,5 mm. Velikost otvoru obchod neuvádí: podle návodu v balení, nebo zkouška na odřezku od nejmenšího výsečníku (2 mm, pak 3 mm), pokud návod otvor vyžaduje. Obchod uvádí „jemnou kůži“ – na třísločiněné kůži nejdřív vyzkoušet na odřezku. Příruba patice na rubu nejvýš Ø 11 mm (po nákupu změřit). Osazovač Tandy je jen alternativa k drukům WUK 5/6.',
    },
    {
      equipmentSlug: 'small-hole-punch',
      priority: 'recommended',
      reason:
        'Jen pokud návod Prym Anorak vyžaduje otvor: otvor pro dřík (lekce 3 na odřezku, lekce 6 v předním panelu) a pro trn kloboučku (lekce 8 v jazyku).',
      specification:
        'Dutý výsečník 2 mm (CraftPoint, 29 Kč), 3 mm jen když dřík otvorem 2 mm neprojde; přihoďte do stejné objednávky jako výsečník okna.',
    },
    {
      equipmentSlug: 'harness-needles',
      priority: 'required',
      reason: 'Sedlářský steh dna i kapsy.',
      specification: 'Tupé nebo poloostré sedlářské, k niti 0,6 mm, 4 ks.',
    },
    {
      equipmentSlug: 'waxed-thread',
      priority: 'required',
      reason: 'Šev dna (skrz tři vrstvy) a šev kapsy.',
      specification:
        'Voskovaný polyester 0,6 mm – tlustší nit 0,8 mm do otvorů vidliček 4 mm nejde (karta vybavení Voskovaná nit). Délka podle návodu „Jak odměřit nit“: 4 × délka švu + 25–30 cm rezervy, přes tři vrstvy 5 ×: dno (64 mm skrz tři vrstvy) ≈ 0,6 m, raději 0,8 m; kapsa 23 otvorů (u mince 40 mm 31) – 0,8 m vystačí s rezervou. Krátký šev odřezku v lekci 4 délku nitě pro dno ani kapsu neprokáže, proto 0,8 m s rezervou.',
    },
    {
      equipmentSlug: 'steel-ruler',
      priority: 'required',
      reason: 'Vedení nože, rýsování a měření odsazení při zkoušce papírového modelu.',
      specification: 'Ocelové 30 cm.',
    },
    {
      equipmentSlug: 'contact-cement',
      priority: 'required',
      reason:
        'Přilepí kapsu na přední panel v lekci 6 a přidrží dno před prošitím skrz tři vrstvy v lekci 7.',
      specification:
        'U kapsy jen do úzkého pruhu při okraji, u dna jen do pruhu 0–3,5 mm od hrany pod čárou švu.',
    },
    {
      equipmentSlug: 'utility-knife',
      priority: 'required',
      reason: 'Vyříznutí pásu a zkrácení jazyka po osazení kloboučku.',
      specification: 'Odlamovací nůž 18 mm s novými čepelemi.',
    },
    {
      equipmentSlug: 'cutting-mat',
      priority: 'required',
      reason: 'Podklad pro řezání pásu.',
      specification: 'Samohojivá A3.',
    },
    {
      equipmentSlug: 'round-punch-32mm',
      priority: 'required',
      reason:
        'Okno kapsy, kterým je vidět mince; nejdřív zkušební okno na odřezku z tvarovací zkoušky v lekci 2.',
      specification:
        'Kruhový dutý výsečník Ø 20 mm pro výchozí minci 50 Kč, prstenec 3,75 mm – držení mince ověřit na odřezku (Ø 32 mm jen pro minci 40 mm). Volitelně záložní Ø 18 mm (CraftPoint, 58 Kč, stejná nabídka) pro případ, že zkouška Ø 20 mm nevyjde – stojí za to přihodit do stejné objednávky.',
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
      reason:
        'Zaleštění hran, na které se po složení špatně dostane, v lekci 5 a vnějších hran v lekci 8.',
      specification: 'Pasta na hrany + dřevěné leštítko.',
    },
    {
      equipmentSlug: 'edge-paint',
      priority: 'recommended',
      reason:
        'Jen u barvené kůže (výchozí sestava Blu): řez je světlý a před leštěním se obarví – nejdřív zkouška na odřezku v lekci 4, pak hrany, na které se po složení nedostanete (lekce 5), hrany kapsy (lekce 6) a vnější hrany (lekce 8).',
      specification:
        "Barva na hrany v odstínu ke kůži, naneste podle návodu na obalu; přilnavost a vzhled ověřit na odřezku (lekce 4). Ověřené příklady v katalogu jsou jen Fiebing's Edge Kote hnědá, tmavě hnědá a černá – odstín k modré Blu jsme neověřovali, jeho cena je neověřená.",
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
    // Výchozí skupina (bez varianty) je pro kůži 1,2 mm: tu stránka Listy střihu předem zaškrtne.
    // Id a soubory listů zůstávají podle generátoru (bez přípony = jeho výchozí 1,5 mm).
    sheets: [
      {
        id: 'papirovy-model-kuze-1-2',
        title: 'Papírový model',
        note: 'Stejný obrys jako pás, bez otvorů; čísla kroků u ohybů, rámeček karty, místo pro kapsu, čára švu a seznam k zapsání při zkoušce. Mince 50 Kč (27,5 mm), kůže 1,2 mm bez ztenčení ohybu B: pás 240,35 × 104,1 mm, ohyb A 15,69 mm, ohyb B 8,66 mm, jazyk 43,07 mm. Vytiskněte a projděte jako první, ještě před řezáním kůže.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
      },
      {
        id: 'sablona-kuze-1-2',
        title: 'Pás (šablona)',
        note: 'Tři panely a dva ohyby v jednom kuse, 240,35 × 104,1 mm plus jazyk 43,07 mm (ohyb A 15,69 mm, ohyb B 8,66 mm); mince 50 Kč (27,5 mm), kůže 1,2 mm bez ztenčení ohybu B, bez otvoru pro průchodku. Přilepte páskou na líc kůže, ne na rub, propíchněte značky a řežte skrz papír (lekce 5).',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
      },
      {
        id: 'kapsa',
        title: 'Kapsa s mincí a otvor formy',
        note: 'List kapsy pro minci 50 Kč (27,5 mm): kapsa 42,5 × 42 mm, okno Ø 20 mm (prstenec 3,75 mm – držení mince ověřit na odřezku), kružnice na vyvrtání otvoru formy Ø 31,5 mm pro tvarování důlku. Platí pro obě tloušťky těla – kapsa se vždycky dělá z kůže 1,2 mm.',
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
        id: 'kapsa-okno-18',
        title: 'Kapsa – záložní okno Ø 18 mm',
        note: 'Stejný list jako Kapsa s mincí a otvor formy (mince 50 Kč), jen s kružnicí okna Ø 18 mm (prstenec 4,75 mm). Jen když v lekci 2 okno Ø 20 mm minci neudrží: šablona na rub s vyseknutým oknem Ø 18 mm (lekce 2 a 6).',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
        variant: 'záložní okno Ø 18 mm – mince 50 Kč',
      },
      {
        id: 'papirovy-model',
        title: 'Papírový model – kůže 1,5 mm',
        note: 'Stejný list jako výchozí papírový model (mince 50 Kč), přepočítaný pro kůži 1,5 mm se ztenčením ohybu B – pás je delší: 242,55 × 104,1 mm, ohyb A 16,63 mm, ohyb B 9,92 mm, jazyk 44,49 mm.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'kůže 1,5 mm se ztenčením ohybu B – mince 50 Kč',
      },
      {
        id: 'sablona',
        title: 'Pás (šablona) – kůže 1,5 mm',
        note: 'Tři panely a dva ohyby v jednom kuse, 242,55 × 104,1 mm plus jazyk 44,49 mm; mince 50 Kč (27,5 mm), kůže 1,5 mm se ztenčením ohybu B (jen u této tloušťky), bez otvoru pro průchodku. Přilepte páskou na líc kůže, ne na rub. List KAPSA je stejný jako výchozí – kapsa se vždycky dělá z kůže 1,2 mm.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'kůže 1,5 mm se ztenčením ohybu B – mince 50 Kč',
      },
      {
        id: 'papirovy-model-40mm-kuze-1-2',
        title: 'Papírový model – mince 40 mm',
        note: 'Stejný list jako výchozí papírový model (kůže 1,2 mm), přepočítaný pro minci 40 mm z předlohy: kapsa začíná výš, ohyby a jazyk se nemění (pás 240,35 × 104,1 mm, ohyb A 15,69 mm, ohyb B 8,66 mm, jazyk 43,07 mm).',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 40 mm (předloha)',
      },
      {
        id: 'sablona-40mm-kuze-1-2',
        title: 'Pás – mince 40 mm',
        note: 'Stejný list jako výchozí pás (kůže 1,2 mm), přepočítaný pro minci 40 mm z předlohy: kapsa 35,55 mm pod horní hranou a 8,5 mm od boků, ohyby a jazyk se nemění (pás 240,35 × 104,1 mm, ohyb A 15,69 mm, ohyb B 8,66 mm, jazyk 43,07 mm).',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 40 mm (předloha)',
      },
      {
        id: 'kapsa-40mm',
        title: 'Kapsa – mince 40 mm',
        note: 'Stejný list jako výchozí kapsa, přepočítaný pro minci 40 mm: okno Ø 32 mm, kapsa 55 × 54,5 mm, otvor formy 44 mm. Platí pro obě tloušťky těla.',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
        variant: 'mince 40 mm (předloha)',
      },
      {
        id: 'papirovy-model-40mm',
        title: 'Papírový model – mince 40 mm, kůže 1,5 mm',
        note: 'Papírový model pro minci 40 mm a kůži 1,5 mm se ztenčením ohybu B: pás 242,55 × 104,1 mm, ohyb A 16,63 mm, ohyb B 9,92 mm, jazyk 44,49 mm.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 40 mm (předloha), kůže 1,5 mm se ztenčením ohybu B',
      },
      {
        id: 'sablona-40mm',
        title: 'Pás (šablona) – mince 40 mm, kůže 1,5 mm',
        note: 'Pás pro minci 40 mm a kůži 1,5 mm se ztenčením ohybu B: kapsa 35,55 mm pod horní hranou a 8,5 mm od boků, pás 242,55 × 104,1 mm. List KAPSA je kapsa-40mm (okno Ø 32 mm, kapsa 55 × 54,5 mm, otvor formy 44 mm) – kapsa se vždycky dělá z kůže 1,2 mm.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 40 mm (předloha), kůže 1,5 mm se ztenčením ohybu B',
      },
    ],
    calibrationMm: 50,
    printNote:
      'Tisk na A4 bez přizpůsobení velikosti (100 %). Kontrolní úsečka na okraji musí měřit 50 mm. Předem zaškrtnutý výchozí střih je pro minci 50 Kč a kůži těla 1,2 mm (bez ztenčení ohybu B); listy pro kůži 1,5 mm jsou varianta níže. Jak přenést šablonu PÁS na kůži: vystřihnout nahrubo s okrajem 1–2 cm, přilepit páskou na líc, propíchnout značky a řezat skrz papír po čáře (lekce 5). Šablona je na jedno použití, na každý pás vytiskněte novou. List KAPSA vytiskněte 3×: 1 na vrtání formy, 1 na orýsování značek na líci (lekce 2 a 6), 1 na šablonu na rub – vystřihne se přesně po obrysu kapsy a vysekne se do ní okno (lekce 2 a 6). Když v lekci 2 přejdete na menší okno Ø 18 mm, vytiskněte ještě list Kapsa – záložní okno Ø 18 mm na šablonu s oknem Ø 18 mm.',
    defaultVariantLabel: 'Výchozí střih – mince 50 Kč, kůže 1,2 mm (bez ztenčení)',
    variantsNote:
      'V aplikaci jsou listy pro výchozí minci 50 Kč s kůží 1,2 mm (např. Blu nebo Verde; platí pro třísločiněnou kůži 1,2 mm z jakékoli nabídky), záložní list kapsy s oknem Ø 18 mm, listy pro kůži 1,5 mm se ztenčením ohybu B a pro minci 40 mm z předlohy s oběma tloušťkami. Jiná mince mění jen místo kapsy, okno a otvor formy, ne ohyby ani jazyk; tloušťka kůže naopak mění ohyby i jazyk. Jiný počet karet ani jiná tloušťka kůže než 1,2 a 1,5 mm v aplikaci zatím nejsou.',
  },
  practiceSheets: {
    // Výchozí skupina (bez varianty) je pro kůži 1,2 mm jako u listů střihu; čísla z modelu pásu
    // (scripts/coin-card-holder-practice.ts, src/lib/geometry/coin-card-holder-practice.ts).
    sheets: [
      {
        id: 'cvicny-prouzek-kuze-1-2',
        title: 'Cvičný proužek pro lekci 4',
        note: 'Proužek 114,35 × 40 mm na odřezek k lekci 4, ne díl pouzdra: tři panely po 30 mm, ohyb A 15,69 mm a ohyb B 8,66 mm (stejně jako list Pás pro kůži 1,2 mm), čára švu 3,5 mm od dolní hrany a 6 zrcadlených otvorů na panel, krajní 5 mm od čáry ohybu i od konce. Kůže 1,2 mm, ohyby se neztenčují.',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
      },
      {
        id: 'cvicny-prouzek',
        title: 'Cvičný proužek pro lekci 4 – kůže 1,5 mm',
        note: 'Stejný proužek pro kůži 1,5 mm: 116,55 × 40 mm, ohyb A 16,63 mm, ohyb B 9,92 mm a šrafa pásma ztenčení ohybu B (ohyb a 3 mm na obě strany).',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
        variant: 'kůže 1,5 mm se ztenčením ohybu B',
      },
    ],
    calibrationMm: 50,
    printNote:
      'Tisk na A4 bez přizpůsobení velikosti (100 %), kontrolní úsečka musí měřit 50 mm. Vytiskněte list pro tloušťku své kůže (předem zaškrtnutý je pro kůži 1,2 mm). Proužek se vejde na kus asi 130 × 40 mm z lekce 4, na koncích zbude rezerva. Přenos jako u listu Pás v lekci 5: vystřihnout nahrubo s okrajem 1–2 cm, přilepit páskou na líc, propíchnout značky a řezat skrz papír po čáře.',
    defaultVariantLabel: 'Kůže 1,2 mm (bez ztenčení)',
  },
  shoppingPlan: {
    title:
      'Sestava: mince 50 Kč, kůže 1,2 mm (bez ztenčení ohybu B), okno Ø 20 mm, druk Prym Anorak 12 mm, bez průchodky',
    lines: [
      {
        equipmentSlug: 'veg-tan-leather',
        url: 'https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu',
        variant: 'A4 (30 × 21 cm)',
        quantity: 1,
        purpose: 'pás těla 240,35 × 104,1 mm (list Pás – kůže 1,2 mm)',
      },
      {
        equipmentSlug: 'veg-tan-leather',
        url: 'https://craft-point.cz/products/trislocinena-hovezi-kuze-licova-usen-1-2-mm-blu',
        variant: 'A5 (21 × 15 cm)',
        quantity: 1,
        purpose:
          'ze stejné kůže jako pás: kapsa 57,5 × 57,5 mm (lekce 6) a cvičný proužek na ohyby asi 130 × 40 mm (lekce 4) vedle sebe podél jedné hrany (zaberou 187,5 × 57,5 mm), ze zbylého pruhu asi 210 × 92 mm odřezky na zkoušku druku a obtisku patice (lekce 3) a barvy na hrany (lekce 4)',
      },
      {
        equipmentSlug: 'veg-tan-leather',
        url: 'https://craft-point.cz/products/hovezi-kuze-licova-juchtova-trislocinena-1-2-mm',
        variant: 'A5 (21 × 15 cm)',
        quantity: 1,
        purpose:
          'trénink: dva odřezky 57,5 × 57,5 mm na tvarovací zkoušku a zkušební okno (lekce 2)',
      },
      {
        equipmentSlug: 'utility-knife',
        url: 'https://craft-point.cz/products/nuz-na-kuzi-s-odlamovaci-cepeli-18mm',
        quantity: 1,
      },
      {
        equipmentSlug: 'steel-ruler',
        url: 'https://craft-point.cz/products/rezaci-pravitko-s-protiskluzovou-vlozkou-20cm-30cm',
        variant: '30 cm',
        quantity: 1,
      },
      {
        equipmentSlug: 'cutting-mat',
        url: 'https://craft-point.cz/products/oboustranna-samoobnovovaci-rezaci-podlozka-a3-craftpoint',
        quantity: 1,
      },
      {
        equipmentSlug: 'scratch-awl',
        url: 'https://craft-point.cz/products/sedlarske-sidlo-hruska',
        quantity: 1,
      },
      {
        equipmentSlug: 'wing-divider',
        url: 'https://craft-point.cz/products/wing-divider-sedlarske-kruzitko-150-mm',
        quantity: 1,
      },
      {
        equipmentSlug: 'stitching-chisels',
        url: 'https://craft-point.cz/products/derovace-na-svy-4mm-sada-4-kusu',
        quantity: 1,
        purpose: 'rozteč přesně 4 mm',
      },
      {
        equipmentSlug: 'mallet',
        url: 'https://craft-point.cz/products/horizontalni-palicka-na-kuzi',
        quantity: 1,
      },
      {
        equipmentSlug: 'round-punch-32mm',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        quantity: 1,
        purpose: 'varianta 20 mm – okno kapsy',
      },
      {
        equipmentSlug: 'small-hole-punch',
        url: 'https://craft-point.cz/products/vysecniky-na-kuzi-2-20mm-prumer-dle-vyberu',
        quantity: 1,
        purpose: 'varianta 2 mm – jen pokud návod Prym Anorak vyžaduje otvor; levné, přihoďte',
      },
      {
        equipmentSlug: 'harness-needles',
        url: 'https://craft-point.cz/products/sedlarske-jehly-john-james-velikost-004',
        quantity: 4,
      },
      {
        equipmentSlug: 'waxed-thread',
        url: 'https://craft-point.cz/products/nite-slam-bezova-beige-20m',
        variant: '0,6 mm',
        quantity: 1,
        purpose: '20 m vystačí na šev dna i kapsy s velkou rezervou',
      },
      {
        equipmentSlug: 'contact-cement',
        url: 'https://craft-point.cz/products/fiebings-leather-craft-cement-lepidlo-na-kuzi-118-ml',
        quantity: 1,
      },
      {
        equipmentSlug: 'contact-cement',
        url: 'https://craft-point.cz/products/spachtle-na-nanaseni-lepidla',
        quantity: 1,
        purpose: 'k lepidlu, na úzký pruh u hrany',
      },
      {
        equipmentSlug: 'sandpaper',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        variant: 'zrnitost 180',
        quantity: 1,
        purpose: 'zdrsnění lepené plochy',
      },
      {
        equipmentSlug: 'sandpaper',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        variant: 'zrnitost 240',
        quantity: 1,
        purpose: 'srovnání hran',
      },
      {
        equipmentSlug: 'edge-burnisher',
        url: 'https://craft-point.cz/products/tokonole-120-ml-2',
        quantity: 1,
      },
      {
        equipmentSlug: 'edge-burnisher',
        url: 'https://craft-point.cz/products/drevene-hladitko-na-hrany',
        quantity: 1,
      },
      {
        equipmentSlug: 'snap-fastener',
        url: 'https://www.raj-siti.cz/knoflik-stiskaci-anorak-s-aplikatorem-prym_z77891/',
        quantity: 1,
        purpose: 'varianta 12 mm (nikl nebo zlatá); balení 10 ks s aplikátorem',
      },
      {
        equipmentSlug: 'punching-board',
        url: 'https://www.ikea.com/cz/cs/p/legitim-kuchynske-prkenko-bila-90202268/',
        quantity: 2,
        purpose: 'online jen po 2 ks; v obchodním domě stačí 1',
      },
      {
        equipmentSlug: 'coin-forming-block',
        url: 'https://www.hornbach.cz/shop/Bimetalovy-vykruzovak-Wolfcraft-32-mm/7416284/artikl.html',
        quantity: 1,
        purpose:
          'bimetal Ø 32 mm na otvor formy Ø 31,5 mm, středicí vrták v balení, šestihranná stopka 9,5 mm rovnou do sklíčidla (bez unášecího talíře); vyřízne otvor aspoň o 0,5 mm větší než model (vůle kolem zabalené mince asi 2,1 mm místo 1,6 mm) – tvarování to nezkazí, jen okraj důlku bude o něco měkčí; ověříte na zkoušce v lekci 2',
      },
      {
        equipmentSlug: 'clamps',
        url: 'https://www.obi.cz/upinaci-nastroje/ellix-sada-truhlarskych-sverek-2dilna/p/5400296',
        quantity: 1,
        purpose: 'sada 2 svěrek proti sobě',
      },
      {
        equipmentSlug: 'coin-forming-block',
        url: 'https://www.hornbach.cz/p/preklizka-borova-10-x-600-x-1200-mm/6571171/',
        quantity: 1,
        purpose:
          'dvě desky 61,5 × 61,5 mm (ideálně 8 × 8 cm) na formu a víko; celá deska je zbytečně velká – levnější je odřezek z přířezu nebo kus překližky, který už máte',
      },
      {
        equipmentSlug: 'masking-tape',
        url: 'https://www.obi.cz/lepici-pasky/tesa-maskovaci-paska-professional-sensitive-pro-citlive-povrchy-25-m-x-25-mm/p/4754180',
        quantity: 1,
        purpose:
          'šablona PÁS na líci (lekce 5); jedna role na všechny projekty – máte-li ji z projektu 01, nekupujte',
      },
    ],
    skipped: [
      {
        equipmentSlug: 'safety-skiver',
        reason: 'Kůže těla 1,2 mm – ztenčení ohybu B odpadá.',
      },
      {
        equipmentSlug: 'edge-paint',
        reason:
          "Do součtu ne: odstín k modré kůži Blu v katalogu ověřený nemáme (ověřená je jen Fiebing's Edge Kote hnědá, tmavě hnědá a černá) – u barvené kůže ji ale potřebujete, viz níže; cena neověřena.",
      },
      {
        equipmentSlug: 'edge-beveler',
        reason: 'Tentokrát ne: hrany se srovnají a zaoblí brusným archem a zaleští.',
      },
      {
        equipmentSlug: 'corner-template',
        reason: 'Tentokrát ne: R10 a R6 obtáhnete podle mince nebo víčka.',
      },
    ],
    alsoNeeded: [
      'barva na hrany v odstínu ke kůži Blu (barvená kůže má světlý řez; lekce 4, 5, 6 a 8) – cena neověřena',
      'potravinová fólie a houbička (lekce 2, 4, 6 a 7)',
      'kostěná rozhrnovačka, nebo stačí hrana ocelového pravítka (lekce 4 a 7)',
      'sponky s podložkou na sepnutí ohybů při schnutí (lekce 4 a 7)',
      'tužka HB nebo 2B na rub kůže (lekce 2, 5 a 6)',
    ],
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

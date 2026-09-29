import { illustration, processStep } from '@/content/projects/coin-card-holder/illustrations';
import {
  type LessonDefinition,
  type PhaseDefinition,
  type ProjectDefinition,
} from '@/content/schema';

/**
 * Projekt 02 – Pouzdro na karty s vsazenou mincí. Obsah je NÁVRH (draft), stejně jako střih
 * samotný (docs/zadani/pouzdro-mince.md, v4.11; výchozí mince 50 Kč, okno Ø 20 mm, druk 12 mm, bez průchodky). Druhý projekt podle ADR 002: staví na
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
      'vytištěný list PAPÍROVÝ MODEL na papír 160 g (zkontrolovaná kalibrační úsečka 50 mm); výchozí list je pro minci 50 Kč a kůži 1,5 mm; u kůže 1,2 mm vytiskněte místo něj Papírový model – kůže 1,2 mm, u mince 40 mm Papírový model – mince 40 mm (viz první krok)',
      'tenká lepenka na podlepení (krabice od cereálií)',
      'nůžky, lepidlo v tyčince a lepicí páska (na slepení dna podél čáry švu)',
      'karty a bankovky, které opravdu nosíte',
      'tužka a papír na zapsání výsledků',
    ],
    requiredEquipment: [],
    recommendedEquipment: ['steel-ruler', 'scratch-awl'],
    prerequisiteLessons: [],
    steps: [
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte list',
        body: 'Tisk na A4 bez přizpůsobení velikosti („skutečná velikost“, 100 %). Výchozí list je pro minci 50 Kč (27,5 mm). Pokud stavíte na minci 40 mm (jako předloha), vytiskněte variantu pro 40 mm – mění se jí jen místo kapsy a je na ní větší otvor formy a okno; ohyby a jazyk zůstávají stejné. Pokud stavíte na kůži 1,2 mm (např. Verde), vytiskněte tu variantu – ta naopak mění ohyby i jazyk (ztenčení ohybu B odpadá). Na stránce Listy střihu jsou předem zaškrtnuté jen listy výchozí skupiny (mince 50 Kč, kůže 1,5 mm). U kůže 1,2 mm odškrtněte Papírový model a Pás (šablona) a zaškrtněte Papírový model – kůže 1,2 mm a Pás (šablona) – kůže 1,2 mm; Kapsa s mincí a otvor formy a Postup skládání zůstávají zaškrtnuté z výchozí skupiny. U mince 40 mm stejně odškrtněte výchozí Papírový model, Pás i Kapsu s mincí a otvor formy a zaškrtněte listy ze skupiny mince 40 mm. Změřte kalibrační úsečku: musí mít přesně 50 mm. Papírový model prokáže polohu jazyka a kloboučku, výřez, vytahování karty a místo pro kapsu – neprokáže ale přídavek ohybů, protože papír je tenčí než kůže.',
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
        id: 'tape-bottom',
        title: 'Slepte dno páskou',
        body: 'Lepicí páskou spojte dno modelu podél čáry švu, aby model při vkládání a vytahování obsahu držel tvar.',
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
        body: 'Zapište: (1) o kolik mm a kterým směrem se propíchnuté místo liší od vytištěné značky patice a kolik jazyka zbývá za ním (cíl 11 mm + rezerva); (2) kolik mm karty je vidět ve výřezu (cíl 19 mm) a jestli jde palcem vysunout; (3) které bankovky jdou napůl a kolik mm přečnívají nahoře a v boku; (4) konec jazyka (na papíru ještě nezkráceného) vůči horní hraně kapsy – cíl je asi 16 mm u výchozí mince 50 Kč, asi 10 mm u mince 40 mm (kapsa u ní začíná výš), protože jazyk na modelu není zkrácený; v kůži po zkrácení podle kloboučku to bude asi 21 mm (u mince 40 mm asi 15 mm); (5) skutečný počet karet a tloušťku bankovek, které opravdu nosíte, oproti výchozím 4 × 0,76 mm a 2 mm. Pokud se liší, střih by bylo potřeba přepočítat – to zatím aplikace neumí.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'model-folded',
        title:
          'Papírový model je slepený, ohyby přehnuté do smyčky (ne na ostro), dno je slepené páskou podél čáry švu a karty i bankovky se do něj vejdou.',
        required: true,
      },
      {
        slug: 'checklist-recorded',
        title:
          'Všech pět bodů kontrolního seznamu je zapsaných, včetně skutečného počtu karet a tloušťky bankovek.',
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
    goal: 'Vyvrtat formu na tvarování, vytvarovat na ní za mokra důlek na minci do odřezku kůže, poznat, jak vypadá dost hluboký důlek, a na odřezku s vyseknutým oknem Ø 20 mm ověřit, že prstenec 3,75 mm minci udrží.',
    materials: [
      'vytištěný list KAPSA (zkontrolovaná kalibrační úsečka 50 mm; výchozí list je pro minci 50 Kč, u mince 40 mm vytiskněte variantu pro 40 mm – mění se jí otvor formy)',
      'dvě desky na formu a víko (překližka nebo tvrdý plast, aspoň 8 mm) a odpadní prkno pod vrtání',
      'aku vrtačka s vykružovací pilou 32 mm (např. ze sady LUX-TOOLS) pro výchozí minci 50 Kč (otvor 31,5 mm); Forstnerův vrták jen v průměru 32 mm – v ověřené sadě 15–35 mm je jen 30 mm (menší než otvor) a 35 mm; u mince 40 mm vykružovací pila 45 nebo 44 mm',
      '2 odřezky třísločiněné kůže 1,2 mm, každý aspoň 57,5 × 57,5 mm (u mince 40 mm aspoň 70 × 70 mm) – druhý pro případné opakování zkoušky okna',
      'mince, na kterou stavíte střih (výchozí 50 Kč)',
      'potravinová fólie',
      'houbička a voda',
      'smirkový papír na zaoblení hrany vyvrtaného otvoru',
      'kruhový výsečník Ø 20 mm na zkušební okno (u mince 40 mm Ø 32 mm) a špalík pod důlek: užší než otvor formy (pod 31,5 mm, u mince 40 mm pod 44 mm) a širší než okno (přes 20 mm, u mince 40 mm přes 32 mm)',
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
    ],
    recommendedEquipment: [],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'drill-form',
        title: 'Vyvrtejte formu',
        body: 'Vytiskněte list KAPSA na 100 % (zkontrolujte úsečku 50 mm), vystřihněte kružnici otvoru formy a nalepte na desku. Desku upněte svěrkou ke stolu, pod ni dejte odpadní prkno. Vrtejte na první rychlost, bez příklepu, netlačte silou, s nabitou baterií. Vykružovací pilou provrtejte do půlky, desku otočte a dokončete z druhé strany podle dírky středicího vrtáku. Forstnerovým vrtákem (sukovníkem) ho místo toho průběžně vytahujte, ať se zbaví pilin. Nakonec zaoblete horní hranu otvoru smirkovým papírem. Na desku narýsujte obě osy otvoru (vodorovnou i svislou), protažené až k jejím okrajům – podle nich pak na formě zarovnáte osy narýsované na kůži.',
        media: [],
      },
      {
        id: 'mark-outline',
        title: 'Orýsujte obrys a prosekejte otvory švu',
        body: 'List KAPSA přiložte na LÍC odřezku a šídlem propíchněte skrz: tečky švu, konce obou os a rohy obrysu kapsy. Vidličkami s roztečí 4 mm naplocho na desce prosekejte otvory švu z líce podle propíchnutých teček, stejně jako u skutečné kapsy, která se děruje ještě před navlhčením. Pak na rub podle propíchnutých míst narýsujte obrys kapsy, obě osy (protažené až k okraji kůže) a kružnici okna – podle ní vystředíte zkušební okno na konci lekce. Otvory švu leží jen asi 2 mm vně dna důlku, proto na přesném vystředění záleží; tady si tu kombinaci vyzkoušíte na odřezku.',
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
        body: 'Kůži lícem dolů položte na formu; rub je teď nahoře, zarovnejte na něm narýsované osy s osami narýsovanými na okraji desky. Zabalenou minci položte na rub nad otvor, přiklopte víkem a dvěma svěrkami proti sobě rovnoměrně stáhněte, aby se víko nenaklonilo.',
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
        body: 'Nechte úplně zaschnout, jistější je přes noc. Pak rozepněte a zkontrolujte: důlek má být dost hluboký a bez zvrásnění na okraji; mince do něj má jít zasunout i vysunout, forma počítá se záměrnou vůlí. Podívejte se i na zkušební otvory u kraje – mají zůstat kulaté, ne protažené nebo potrhané.',
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
        body: 'Okno Ø 20 mm nechává kolem mince 50 Kč prstenec kůže jen 3,75 mm (dřív střih počítal se 4 mm), a právě ten má minci držet, aby oknem nevypadla. Že to na vaší kůži stačí, se musí ověřit tady, na odřezku, ne až na hotové kapse. Zaschlý odřezek položte lícem dolů zpátky na formu (osy na kůži na osy desky), pod důlek podložte špalík (užší než otvor formy, širší než okno) a výsečníkem Ø 20 mm (u mince 40 mm Ø 32 mm) vystředěným podle narýsované kružnice okna vysekněte okno. Pak zkoušejte: (1) minci vložte z rubu do důlku, odřezek otočte oknem dolů a zatřeste – mince nesmí vypadnout; (2) na minci z rubu zatlačte palcem směrem k oknu – nesmí oknem projít ani prstenec vytlačit ven; (3) prstenec zkontrolujte po celém obvodu – má být stejně široký, bez natržení. Když mince oknem projde, zapište to a Ø 20 mm do skutečné kapsy nesekejte. Nejdřív zkontrolujte hloubku důlku: mělký důlek může být příčina, pak tvarování zopakujte (ověřit na odřezku). Potom na druhém odřezku zopakujte kroky 2–6 (orýsování, zabalení mince, navlhčení, tvarování ve formě a schnutí přes noc) a vysekněte menší okno Ø 18 mm (CraftPoint, stejná nabídka výsečníků 2–20 mm, 29. 9. 2026 za 58 Kč skladem; 19 mm v nabídce není). Prstenec je pak 4,75 mm a z mince je v okně vidět o něco méně. List KAPSA se použije dál na vystředění (osy jsou stejné), jen výsečník je menší než narýsovaná kružnice okna; list s kružnicí Ø 18 mm vytiskne `pnpm pattern:coin-holder --window 18`. Do skutečné kapsy pak sekejte tím průměrem, se kterým vám zkouška vyšla.',
        media: [],
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
        slug: 'window-retention-tested',
        title:
          'Na odřezku s vyseknutým oknem Ø 20 mm (u mince 40 mm Ø 32 mm; když Ø 20 mm minci neudrží, s menším oknem na druhém odřezku) mince v důlku drží: při zatřesení oknem dolů nevypadne a při zatlačení z rubu oknem neprojde; prstenec je po celém obvodu stejně široký.',
        required: true,
      },
      {
        slug: 'second-try',
        title: 'Druhý pokus vyšel lépe než první.',
        required: false,
      },
      {
        slug: 'seam-holes-ok',
        title: 'Zkušební otvory podél linie švu zůstaly po tvarování kulaté, nepotrhaly se.',
        required: false,
      },
    ],
    commonMistakes: [
      'Mělký nebo na okraji zvrásněný důlek: kůže byla málo vlhká, nebo svěrky utažené slabě.',
      'Kůže v důlku moc ztenčená: byla moc mokrá, nebo svěrky přetažené.',
      'Svěrky utažené jen z jedné strany: víko se nakloní.',
      'Mince bez fólie: mokrá třísločiněná kůže se od kovu může tmavě zabarvit.',
      'Kůže špatně vystředěná podle os: otvory švu jsou od dna důlku jen asi 2 mm, i malé posunutí je zatáhne do důlku nebo je moc oddálí.',
      'Přeskočená zkouška okna na odřezku: prstenec 3,75 mm je úzký a jestli minci udrží, se pozná až s vyseknutým oknem.',
      'Okno vyseknuté mimo střed: prstenec je na jedné straně užší a mince tam oknem projde snáz.',
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
    goal: 'Ztenčit pásmo ohybu na odřezku na 1 mm a naplocho osadit a vyzkoušet druk na odřezku stejné kůže, než ho osadíte na finální pás.',
    materials: [
      '2–3 odřezky třísločiněné kůže stejné tloušťky jako tělo (1,2 nebo 1,5 mm) na zkoušku druku; na trénink ztenčení odřezek silnější než 1,3 mm – u kůže 1,2 mm kroky 1–2 (ztenčení) přeskočte, odřezek na ztenčování nepotřebujete',
      'druk s aplikátorem (u Prym Anorak 12 mm je aplikátor s nástavci v balení) a návod z obalu',
      'malý výsečník 2 mm, případně 3 mm – jen pokud návod druku vyžaduje otvor (velikost otvoru obchod neuvádí); např. CraftPoint, výsečník 2 mm, 29 Kč (skladem 29. 9. 2026)',
      'kus dřeva nebo tvrdé desky pod osazování kování',
      'posuvné měřítko, pokud ho máte (na kontrolu tloušťky při ztenčení a na změření příruby patice); na přírubu stačí i ocelové pravítko',
    ],
    requiredEquipment: ['scratch-awl', 'snap-fastener', 'mallet', 'punching-board'],
    recommendedEquipment: ['veg-tan-leather', 'safety-skiver', 'small-hole-punch'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení',
        body: 'Odřezek nemá vyznačené čáry ohybu – narýsujte si tedy dvě rovnoběžné čáry asi 10 mm od sebe (tolik má na pásu z kůže 1,5 mm ohyb B, přesně 9,92 mm; u kůže 1,2 mm se ztenčení přeskakuje), budou zastupovat obě čáry ohybu. Šídlem propíchněte oba jejich konce skrz, na rubu je spojte a od každé čáry odsaďte dalších 3 mm ven. Ztenčovat se bude celé pásmo mezi čarami plus tento přesah na obou stranách – asi 16 mm celkem.',
        media: [],
      },
      {
        id: 'skive',
        title: 'Ztenčete z rubu na 1 mm',
        body: 'Bezpečnostním ztenčovačem odebírejte tenké hobliny, čepel veďte skoro naplocho, ne kolmo. Průběžně kontrolujte tloušťku – cíl je asi 1 mm, ne proříznutí naskrz. Na finálním pásu z kůže 1,2 mm se tenhle krok přeskakuje – ztenčení tam není potřeba.',
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
        title: 'Proč druk nejdřív na odřezku',
        body: 'Druk se na finální pás osazuje až v lekci 6 a na jazyk v lekci 8 – nejdřív ho celý vyzkoušejte tady, na odřezku stejné kůže jako tělo. Obchod u Prym Anorak uvádí „textilie vyrobené z jemné kůže“, třísločiněná kůže 1,2–1,5 mm je tužší. Jestli dřík v jedné vrstvě dobře roznýtuje a druk jde zavřít i otevřít, ukáže jen zkouška – ověřit na odřezku. Návod z obalu mějte po ruce: je na něm, jak se konkrétní druk osazuje.',
        media: [],
      },
      {
        id: 'punch-post-hole',
        title: 'Otvor pro dřík druku (pokud ho návod vyžaduje)',
        body: 'Šídlem propíchněte na odřezku bod 9,5 mm od okraje (jako střed dříku na předním panelu, 9,5 mm pod horní hranou) – to je značka pro dřík a zároveň si ověříte, jak se druk chová u hrany. Velikost otvoru pro dřík obchod neuvádí. Řiďte se návodem v balení druku. Když návod otvor vyžaduje a velikost neuvádí, začněte nejmenším výsečníkem (2 mm) a dřík přiložte – má otvorem projít těsně; když neprojde, zkuste o krok větší (3 mm). Moc velký otvor a dřík se v kůži viklá. Druk je čtyřdílný: dřík a hlavička jdou na přední panel, zdířka a klobouček na jazyk (skladbu dílů ověřte podle obalu). Každá polovina svírá jen jednu vrstvu kůže těla (1,2 nebo 1,5 mm).',
        media: [],
      },
      {
        id: 'set-snap-post',
        title: 'Osaďte dřík druku',
        body: 'Dřík s hlavičkou osaďte naplocho aplikátorem z balení druku a paličkou na tvrdé podložce, kolmo a přesně na značku – pořadí dílů a stranu aplikátoru podle návodu na obalu. Zkontrolujte, že sedí naplocho a pevně a že kůže kolem dříku nepopraskala. Když dřík neroznýtuje, viklá se nebo kůže kolem praskne, zopakujte to na dalším odřezku (balení Prym Anorak má 10 ks). Když to nevyjde ani napodruhé, na pás druk neosazujte a vyzkoušejte na odřezku alternativu z vybavení (Stoklasa Ø 13,5 mm na silné látky – na kůži ověřit na odřezku).',
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
        id: 'practice-snap-cap',
        title: 'Vyzkoušejte i kloboučkovou polovinu druku',
        body: 'Na druhém odřezku osaďte kloboučkovou polovinu druku. Pokud návod vyžaduje otvor, postupujte stejně jako u dříku: nejmenší výsečník (2 mm), a teprve když trn kloboučku neprojde, o krok větší (3 mm) – průměr ověřte na odřezku, ne až na jazyku. Klobouček se zdířkou osaďte aplikátorem a paličkou stejným způsobem jako dřík. Zacvakněte ho na osazený dřík a zkontrolujte, že druk jde zavřít i znovu otevřít a drží – v hotovém pouzdru už tuhle kombinaci nezkusíte dřív, než bude jazyk zkrácený. Zapište si, který výsečník (nebo žádný) sedl.',
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
        body: 'Na rubu odřezku změřte posuvným měřítkem průměr příruby osazené patice (dříku); když ho nemáte, stačí ocelové pravítko – jde jen o to, jestli je příruba do 11 mm. Smí mít nejvýš 11 mm: střed patice je na předním panelu 9,5 mm pod horní hranou a karty začínají 15 mm pod ní, takže větší příruba by na rubu tlačila na karty. Když má víc, střih s tímhle drukem nepoužívejte a zapište si to.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'skive-clean',
        title:
          'Ztenčené pásmo má rovnoměrnou tloušťku asi 1 mm, bez proříznutí naskrz. U kůže 1,2 mm se tenhle krok přeskakuje.',
        required: false,
      },
      {
        slug: 'hardware-set',
        title:
          'Dřík druku sedí na odřezku stejné kůže jako tělo naplocho, pevně a přesně na značce.',
        required: true,
      },
      {
        slug: 'snap-opens-closes',
        title: 'Klobouček se zdířkou zacvaknutý na osazený dřík jde zavřít i znovu otevřít.',
        required: true,
      },
      {
        slug: 'flange-measured',
        title: 'Příruba patice na rubu je změřená a má nejvýš Ø 11 mm.',
        required: true,
      },
    ],
    commonMistakes: [
      'Ztenčovač skoro kolmo místo naplocho: prořízne kůži naskrz.',
      'Otvor pro dřík moc velký: dřík se v kůži viklá.',
      'Úder na aplikátor šikmo: kování nesedne souose a drží volně.',
      'Druk poprvé až na finálním pásu: jestli roznýtuje v tuhé třísločiněné kůži, se pozná jen zkouškou na odřezku.',
    ],
    safety: ['Čepel vyměňte, jakmile začne trhat místo řezat.'],
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
    goal: 'Naplocho prosekat otvory zrcadlené přes ohyby, poskládat proužek do dvou ohybů kolem skutečného obsahu a sešít tři vrstvy dohromady, dřív než to uděláte na finálním pásu.',
    materials: [
      'jeden kus stejné kůže jako na finální pás, asi 130 × 40 mm: tři panely po asi 30 mm (3 × 30 = 90 mm) a oba ohyby – u kůže 1,5 mm ohyb A asi 16,6 mm a ohyb B asi 9,9 mm, u kůže 1,2 mm ohyb A asi 15,7 mm a ohyb B asi 8,7 mm (obojí z modelu) – dohromady asi 117 mm, plus rezerva na konce asi 130 mm',
      'pár karet zabalených v potravinové fólii jako náhrada obsahu, a kus přeloženého papíru asi 2 mm silný jako náhrada bankovek',
      'houbička a voda na navlhčení ohybů',
      'kostěná rozhrnovačka (bone folder) nebo hrana pravítka',
      'sponky s podložkou na sepnutí ohybů při schnutí',
      'nit asi 0,8 m',
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
    recommendedEquipment: ['scratch-awl', 'wing-divider', 'safety-skiver'],
    prerequisiteLessons: [L1, L3],
    steps: [
      {
        id: 'mark-mirrored-dots',
        title: 'Vyznačte otvory dna zrcadlené přes ohyby',
        body: 'Na plochém, ještě nepřeloženém proužku narýsujte linii švu 3,5 mm od dolní hrany na všech třech panelech. Polohu otvorů odměřte od obou čar ohybu tak, aby byly na sousedních panelech zrcadlené kolem ohybu – jen tak budou po složení lícovat. Na panel dlouhý asi 30 mm s roztečí 4 mm a okrajem 3,5 mm vyjde 6 otvorů: (30 − 2 × 3,5) / 4 = 5,75, tedy 5 celých mezer a 6 otvorů – stejný výpočet jako na listu PÁS, kde z panelu 72 mm vyjde 17 otvorů. Přesný počet upravte podle skutečné délky vašeho panelu.',
        media: [],
      },
      {
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení ohybu B',
        body: 'U kůže 1,5 mm narýsujte mezi prostředním a jedním krajním panelem pásmo ohybu B asi 9,9 mm široké a odsaďte 3 mm na obě strany (asi 16 mm celkem), stejně jako v lekci 3. U kůže 1,2 mm tenhle krok i ztenčení přeskočte.',
        media: [],
      },
      {
        id: 'skive-fold-b',
        title: 'Ztenčete ohyb B',
        body: 'U kůže 1,5 mm ztenčete v odsazeném pásu kůži z rubu na 1 mm bezpečnostním ztenčovačem, stejně jako v lekci 3. U kůže 1,2 mm se ztenčení přeskakuje.',
        media: [],
      },
      {
        id: 'punch-flat',
        title: 'Prosekejte otvory naplocho',
        body: 'Prosekejte vidličkami otvory dna na plochém proužku, panel po panelu: prostřední panel (zastupuje přední) z líce, oba krajní panely (zastupují zadní a vnitřní) z rubu – přesně jako to čeká finální pás. Ohyb panel zrcadlově převrátí, takže šikmé otvory prosekané ze stejné strany by se po složení zkřížily a jehla by jimi neprošla.',
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
        body: 'Obě pásma ohybů navlhčete houbičkou, ne kůži plošně.',
        media: [],
      },
      {
        id: 'fold-around-content',
        title: 'Přeložte kolem obsahu',
        body: 'Karty zabalené v potravinové fólii položte mezi prostřední panel (zastupuje přední) a přiléhající krajní panel (zastupuje vnitřní), pak přeložte ohyb B. Jako náhradu bankovek použijte přeložený papír silný asi 2 mm a položte ho mezi krajní panel, který zastupuje vnitřní, a druhý krajní panel (zastupuje zadní) – stejné pořadí vrstev jako u finálního pásu (přední – karty – vnitřní – bankovky – zadní). Teprve pak přeložte ohyb A přes všechno. Přejeďte rozhrnovačkou nebo hranou pravítka a sepněte sponkami přes podložku. Než necháte zaschnout, zkontrolujte, že se naplocho prosekané otvory na sousedních panelech po složení lícují. Ohyb A se neztenčuje, jen se přeloží – pokud je na odřezku moc tuhý, zapište si to do poznámek z tréninku. Nasucho nebo na ostro přeložený líc nejspíš praská – proto je navlhčení a smyčka místo ostrého přehybu klíčové.',
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
        title: 'Zdrsněte a slepte, spoj po spoji',
        body: 'Zaschlé ohyby rozevřete jen tolik, aby šel proužek natřít – zhruba do pravého úhlu, ne úplně naplocho (suchý neztenčený ohyb A by mohl na líci prasknout). Spoje jsou dva a lepí se po jednom, ne najednou: v pruhu 0–3,5 mm od hrany (pod čárou švu – lepidlo výš by ubralo místo, kde má obsah vůli) zdrsněte smirkem plochy prvního spoje, naneste lepidlo naplocho, nechte odvětrat podle návodu na obalu, přeložte zpátky, zarovnejte jehlami přes otvory a přitiskněte. Teprve pak stejně zopakujte druhý spoj.',
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
      {
        slug: 'skive-band-even',
        title:
          'U kůže 1,5 mm je ztenčené pásmo ohybu B rovnoměrné, asi 1 mm. U kůže 1,2 mm se přeskakuje.',
        required: false,
      },
    ],
    commonMistakes: [
      'Otvory odměřené jen od hrany, ne zrcadlené od ohybu: po složení nelícují.',
      'Otvory prosekané ze stejné strany na sousedních panelech: po složení se šikmé otvory zkříží a jehla jimi neprojde.',
      'Ohyb nasucho nebo na ostro: líc praská.',
      'Lepidlo výš než na čáru švu: vrstvy se slepí naplocho tam, kde má zůstat vůle pro obsah.',
      'Oba spoje slepené najednou místo po jednom: hůř se zarovnávají jehlami před zaschnutím lepidla.',
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
      'přířez třísločiněné kůže 1,5 mm (nebo 1,2 mm, např. Verde – pak ztenčení ohybu B odpadá) na pás, aspoň A4',
      'vytištěná šablona PÁS (zkontrolovaná úsečka 50 mm; výchozí list je pro minci 50 Kč a kůži 1,5 mm; u kůže 1,2 mm vytiskněte místo něj Pás (šablona) – kůže 1,2 mm, u mince 40 mm Pás – mince 40 mm; viz první krok)',
      'přípravek na zapečetění rubu (Tokonole nebo gum tragacanth – stejná pasta jako u leštění hran)',
      'barva na hrany (u barvené kůže)',
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
    recommendedEquipment: ['corner-template', 'edge-burnisher', 'safety-skiver'],
    prerequisiteLessons: [L2, L3, L4],
    steps: [
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte šablonu',
        body: 'Tisk na A4 bez přizpůsobení velikosti (100 %). Kalibrační úsečka musí měřit přesně 50 mm. Na stránce Listy střihu jsou předem zaškrtnuté jen listy výchozí skupiny (mince 50 Kč, kůže 1,5 mm). U kůže 1,2 mm odškrtněte Papírový model a Pás (šablona) a zaškrtněte Papírový model – kůže 1,2 mm a Pás (šablona) – kůže 1,2 mm; Kapsa s mincí a otvor formy a Postup skládání zůstávají zaškrtnuté z výchozí skupiny. Popis dole na listu PÁS uvádí průměr mince a tloušťku kůže těla – před obkreslením zkontrolujte, že sedí na vaši kůži.',
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
        body: 'Rovné strany řežte podle pravítka na dva až tři lehké tahy. Malé zaoblení R2,5 na předním panelu, kde oblouk výřezu R34 potkává horní hranu, je vypouklé (ven z kůže) – vyřízněte ho nožem podle vyznačené čáry na šabloně. Když si nejste jistí, nechte tam raději pravý úhel a zaoblete ho až smirkovým papírem. Zbytek výřezu na prst (oblouk R34 vepředu, čtvrtelipsa vzadu) řežte plynule bez pravítka.',
        media: [
          {
            id: 'postup-1',
            kind: 'illustration',
            caption:
              'Pás obkreslený na líc a vyříznutý, stranou kus kůže na kapsu (krok 1 listu postupu)',
            status: 'available',
            src: processStep[0],
          },
          {
            id: 'cch-l5-cut',
            kind: 'photo',
            caption: 'Vyříznutý pás tří panelů ležící na papírové šabloně, kůže obtažená na líci',
            status: 'planned',
          },
        ],
      },
      {
        id: 'transfer-marks-awl',
        title: 'Přeneste značky šídlem',
        body: 'Šablonu ještě jednou přiložte na pás a šídlem propíchněte skrz: konce obou čar ohybu A i B (asi 1 mm od hrany pásu, ne přesně na ní), rohy místa pro kapsu (asi 1 mm dovnitř od zaobleného rohu, ne v jeho pomyslném ostrém vrcholu – jinak by značka zůstala vidět na líci mimo přišitou kapsu), střed dříku druku (na předním panelu) a všechny tečky dna. Propíchnutá dírka je vidět z obou stran, takže tím zároveň dostanete tečky na rub zadního a vnitřního panelu, odkud se budou prosekávat.',
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
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení ohybu B',
        body: 'Pokud šijete z kůže tenčí než 1,3 mm (např. 1,2 mm), tenhle krok i ztenčení přeskočte. U kůže 1,5 mm: na rubu spojte čárou konce obou čar ohybu B propíchnuté v předchozím kroku a od každé čáry odsaďte dalších 3 mm ven – ztenčovat se bude celé pásmo ohybu B plus tento přesah na obou stranách (asi 16 mm celkem). Ohyb A se ztenčovat nebude.',
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
        body: 'Naplocho prosekejte vidličkami otvory dna podle propíchnutých teček na všech třech panelech (rozteč přesně 4 mm): přední panel z líce, zadní a vnitřní panel z rubu. Ohyb panel zrcadlově převrátí, takže šikmé otvory prosekané ze stejné strany by se po složení zkřížily a jehla by jimi neprošla.',
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
        title:
          'Obarvěte a zaleštěte hrany, na které se po složení špatně dostanete, a zapečeťte rub',
        body: 'Hrany, na které se po složení špatně dostanete (horní hrana vnitřního panelu, jeho volná svislá hrana – skončí uvnitř smyčky ohybu A, je vidět výřezem, ale nedosáhnete na ni –, oblouk výřezu a jazyk), teď obarvěte (barva na hrany, u barvené kůže) a zaleštěte – v hotovém pouzdru už na ně nedosáhnete. Rub vnitřního panelu zapečeťte (Tokonole nebo gum tragacanth) kromě spodního proužku 0–3,5 mm od hrany (pod čárou švu) – ten se v lekci 7 lepí, na zapečetěném povrchu by lepidlo nedrželo. Zapečetěný rub je po složení vidět výřezem nad kartami.',
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
        title:
          'Hrany, na které se po složení špatně dostanete (včetně volné svislé hrany vnitřního panelu), jsou obarvené (u barvené kůže) a zaleštěné a rub vnitřního panelu je zapečetěný (kromě pruhu pod čárou švu).',
        required: false,
      },
    ],
    commonMistakes: [
      'Obtažení na rub místo na líc: přední panel vyjde zrcadlově obráceně.',
      'Záměna ohybů: u kůže 1,5 mm se ztenčuje jen ohyb B (šrafa); ohyb A se neztenčuje.',
      'Otvory dna prosekané ze stejné strany na sousedních panelech: po složení se zkříží a jehla jimi neprojde – přední panel je z líce, zadní a vnitřní z rubu.',
      'Zapomenutý zapečetěný rub vnitřního panelu: je vidět výřezem nad kartami.',
      'Zapečetěný rub i v pruhu pod čárou švu: lepidlo v lekci 7 na takovém povrchu nedrží.',
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
    goal: 'Vytvarovat kapsu s mincí ze samostatné kůže 1,2 mm, vyseknout okno Ø 20 mm (nebo menší průměr, se kterým vám vyšla zkouška v lekci 2), přišít ji na přední panel a naplocho osadit patici druku.',
    materials: [
      'kůže 1,2 mm na kapsu, aspoň 57,5 × 57,5 mm (i když je pás z 1,5 mm; u mince 40 mm aspoň 70 × 70 mm, podle listu KAPSA)',
      'vytištěná šablona KAPSA (výchozí pro minci 50 Kč; u mince 40 mm vytiskněte variantu pro 40 mm)',
      'mince (výchozí 50 Kč), potravinová fólie',
      'nit asi 0,8 m na šev kapsy (23 otvorů; u mince 40 mm 31 otvorů)',
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
    ],
    recommendedEquipment: ['corner-template', 'sandpaper', 'small-hole-punch'],
    prerequisiteLessons: [L5],
    steps: [
      {
        id: 'trace-and-punch-pocket',
        title: 'Orýsujte kapsu a prosekněte otvory švu z líce',
        body: 'List KAPSA přiložte na LÍC kůže 1,2 mm a šídlem propíchněte skrz: tečky švu, konce obou os a rohy obrysu kapsy. Vidličkami prosekněte otvory švu z líce podle propíchnutých teček – kapsa bude na předním panelu sedět lícem ven, proto se švové otvory prosekávají z líce; při opětovném prosekávání skrz obě vrstvy v pozdějším kroku musí vidličky vstupovat do stejné strany, aby si otvory lícovaly. Pak na rub podle propíchnutých míst narýsujte obrys kapsy, obě osy (protažené až k okraji kůže) a kružnici okna – podle ní budete okno v pozdějším kroku vystřeďovat. Oboje udělejte ještě před navlhčením.',
        media: [],
      },
      {
        id: 'form-dimple',
        title: 'Vytvarujte důlek na formě',
        body: 'Kůži navlhčete, položte lícem dolů na formu a zarovnejte narýsované osy na kůži s osami narýsovanými na desce, minci zabalenou ve fólii položte na rub nad otvor, přiklopte deskou a dvěma svěrkami proti sobě rovnoměrně stáhněte, aby se víko nenaklonilo. Nechte zaschnout, jistější je přes noc.',
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
        body: 'Vyřízněte obrys kapsy podle orýsování z prvního kroku. Okno vysekněte na formě: kapsu položte lícem dolů zpátky na formu (osy na kůži na osy desky) a pod důlek podložte špalík užší než otvor formy (pod 31,5 mm, u mince 40 mm pod 44 mm) a zároveň širší než okno (přes 20 mm, u mince 40 mm přes 32 mm) – má se dotýkat jen dna důlku zespodu, ne ho nadzvedávat. Výsečník vystřeďte podle kružnice okna narýsované na rubu v prvním kroku, nebo zkontrolujte, že prstenec kůže kolem důlku je stejně široký po celém obvodu, a teprve pak Ø 20 mm (u mince 40 mm Ø 32 mm) okno vysekněte. Prstenec 3,75 mm je úzký: okno Ø 20 mm sekejte jen tehdy, když vám zkouška držení mince na odřezku v lekci 2 vyšla (jinak menší výsečník, se kterým zkouška vyšla). Než kapsu přišijete, vložte do ní minci a zkuste, že oknem nepropadne.',
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
        body: 'Hrany kapsy (oblouk okna i vnější obrys) teď obarvěte (barva na hrany, u barvené kůže) a zaleštěte, stejně jako v lekci 5 – po přišití na přední panel už na vnější obrys nedosáhnete a na okno jen omezeně.',
        media: [],
      },
      {
        id: 'glue-pocket',
        title: 'Nalepte kapsu na přední panel',
        body: 'Na předním panelu smirkem lehce zdrsněte jen plochu pod okrajem kapsy (tam, kam přijde lepidlo), zbytek líc nechte hladký. Kontaktní lepidlo naneste jen do úzkého pruhu při okraji kapsy (do šířky švového okraje, ne přes celou plochu) na rub kapsy a na odpovídající zdrsněné místo na předním panelu – 41,8 mm pod horní hranou, 14,75 mm od obou boků (u mince 40 mm 35,55 mm pod horní hranou, 8,5 mm od obou boků) – ať se nerozteče na viditelný líc kolem kapsy. Horní hranu kapsy, kterou se bude zasouvat mince, nelepte.',
        media: [],
      },
      {
        id: 'stitch-pocket',
        title: 'Prosekněte a přišijte kapsu',
        body: 'Kapsa má otvory švu prosekané už v prvním kroku z líce, ještě před tvarováním. Naplocho na děrovací desce teď vidličkami projeďte znovu přes tytéž otvory ze stejné strany (z líce kapsy), tentokrát skrz obě vrstvy najednou – kapsu i přední panel pod ní; jen tak si otvory po prosekání lícují. Pak kapsu sedlářským stehem přišijte, horní hrana zůstává volná.',
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
        body: 'Pokud návod druku vyžaduje otvor, vysekněte ho výsečníkem, který vám na odřezku v lekci 3 sedl na dřík (začínali jste nejmenším, 2 mm), v předním panelu na značku propíchnutou v lekci 5 (9,5 mm pod horní hranou na ose jazyka).',
        media: [],
      },
      {
        id: 'set-snap-post',
        title: 'Osaďte dřík druku',
        body: 'Dřík s hlavičkou osaďte naplocho na značku v předním panelu aplikátorem z balení a paličkou na tvrdé podložce, stejně jako na odřezku v lekci 3 – ještě před složením pásu, v hotovém pouzdru už na něj nedosáhnete.',
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
        title:
          'Kapsa má dost hluboký důlek bez zvrásnění na okraji; mince do ní jde zasunout i vysunout.',
        required: true,
      },
      {
        slug: 'window-cut',
        title:
          'Okno Ø 20 mm (u mince 40 mm Ø 32 mm), nebo menší průměr, se kterým vám vyšla zkouška v lekci 2, je vyseknuté a kolem mince zůstává stejně široký prstenec (u Ø 20 mm asi 3,75 mm, u Ø 18 mm 4,75 mm, u mince 40 mm 4 mm); mince oknem nepropadne.',
        required: true,
      },
      {
        slug: 'pocket-stitched',
        title:
          'Kapsa je nalepená a přišitá na přední panel na správném místě, horní hrana zůstává otevřená.',
        required: true,
      },
      {
        slug: 'pocket-edges-finished',
        title: 'Hrany kapsy (okno i vnější obrys) jsou obarvené (u barvené kůže) a zaleštěné.',
        required: false,
      },
      {
        slug: 'hardware-flat-set',
        title: 'Dřík druku je osazený naplocho ještě před složením.',
        required: true,
      },
    ],
    commonMistakes: [
      'Kapsa vystřižená bez orýsování z formy: obrys neodpovídá poloze důlku.',
      'Otvory švu kapsy prosekané při přišití z opačné strany, než byly poprvé: šikmé otvory si nelícují a jehla jimi neprojde.',
      'Kontaktní lepidlo nanesené přes celou plochu kapsy: rozteče se i na viditelný líc kolem ní.',
      'Špalík širší než otvor formy: nadzvedává důlek místo aby ho jen podepřel.',
      'Dřík osazený až po složení: v uzavřeném pásu už na něj nedosáhnete.',
      'Okno Ø 20 mm vyseknuté bez zkoušky držení mince na odřezku: úzký prstenec nemusí minci udržet.',
    ],
    safety: ['Výsečník tlučte kolmo, ruka mimo dráhu paličky.'],
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
      'pás z lekce 6 s přišitou kapsou a osazeným kováním',
      'karty a bankovky, které nosíte, zabalené v potravinové fólii',
      'houbička a voda na navlhčení ohybů',
      'kostěná rozhrnovačka (bone folder) nebo hrana pravítka',
      'sponky s podložkou na sepnutí ohybů při schnutí',
      'nit asi 0,8 m na šev dna (raději víc – ověřit na odřezku)',
    ],
    requiredEquipment: ['contact-cement', 'sandpaper', 'harness-needles', 'waxed-thread'],
    recommendedEquipment: [],
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
        body: 'Karty zabalené v potravinové fólii položte na rub předního panelu (tam, kde po přeložení sedne vnitřní panel) a přeložte přes ně vnitřní panel ohybem B.',
        media: [],
      },
      {
        id: 'fold-back-a',
        title: 'Přeložte zadní panel ohybem A',
        body: 'Bankovky zabalené v potravinové fólii položte na líc vnitřního panelu – vrstvy odpředu jsou přední – karty – vnitřní – bankovky – zadní. Pak přeložte zadní panel ohybem A přes všechno, kolem skutečného obsahu, ne naprázdno.',
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
        body: 'Přejeďte rozhrnovačkou. Sponky s podložkou nasaďte na panely těsně vedle obou ohybů, přes obsah, ne na samotnou smyčku ohybu. Nechte zaschnout. Nasucho nebo na ostro přeložený líc v tomto kroku nejspíš praská.',
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
        body: 'Vyjměte zabalené karty i bankovky. Zaschlé ohyby rozevřete jen tolik, aby šel spodní proužek natřít – zhruba do pravého úhlu, ne úplně naplocho (suchý neztenčený ohyb A by mohl na líci prasknout). Spoje jsou dva – přední panel s vnitřním a vnitřní panel se zadním; přední a zadní panel se přímo nedotýkají, mezi nimi je pořád vnitřní panel – a lepí se po jednom, ne najednou: nejdřív spoj přední↔vnitřní, pak vnitřní↔zadní. V pruhu 0–3,5 mm od hrany (pod čárou švu; karty i bankovky stojí na švu, lepidlo výš by jim ubralo hloubku) zdrsněte smirkem plochy spoje přední↔vnitřní, naneste lepidlo naplocho, nechte odvětrat podle návodu na obalu, přeložte, zarovnejte jehlami přes otvory a přitiskněte – kontaktní lepidlo po dotyku už nejde posunout. Teprve pak stejně zopakujte spoj vnitřní↔zadní.',
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
        body: 'Prošijte dno skrz všechny tři vrstvy (17 otvorů na panel, rozteč 4 mm, 3,5 mm od hrany). Začátek i konec zajistěte zpětnými stehy.',
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
      'Ohyb nasucho: líc v ohybu praská.',
      'Sponky nasazené na smyčku ohybu místo na panel vedle ní: nedrží obsah přitisknutý.',
      'Lepidlo výš než 3,5 mm od hrany: karty ztratí místo, kde stojí na švu.',
      'Oba spoje slepené najednou: hůř se zarovnávají jehlami, než lepidlo zatuhne.',
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
    recommendedEquipment: ['edge-beveler', 'corner-template', 'edge-burnisher', 'small-hole-punch'],
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
        body: 'Přeložený jazyk přitiskněte přes hlavičku na předním panelu, aby se na kůži obtiskla. Zjistěte, o kolik mm od původní značky a kterým směrem se obtisk posunul: pás je nastřižený na nejhorší případ, ve skutečnosti druk okraj stáhne, takže jazyk vyjde delší, než ukazoval papírový model.',
        media: [],
      },
      {
        id: 'punch-cap-hole',
        title: 'Otvor pro klobouček (pokud ho návod vyžaduje)',
        body: 'Pokud návod druku vyžaduje otvor pro klobouček, proražte ho výsečníkem, který vám v lekci 3 na odřezku sedl na trn kloboučku, přesně v obtisknutém místě na jazyku.',
        media: [],
      },
      {
        id: 'set-cap',
        title: 'Osaďte klobouček',
        body: 'Klobouček se zdířkou osaďte přesně na obtisknuté místo aplikátorem z balení a paličkou, ne podle původní odhadované značky. Klobouček (Ø 12 mm u Prym Anorak 12 mm) jde na líc jazyka (ven, viditelný po zapnutí), zdířka na rub jazyka pod ním, obrácená k přednímu panelu – pořadí dílů podle návodu na obalu, stejně jako na odřezku v lekci 3.',
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
        body: 'Jazyk zkraťte 11 mm za střed kloboučku a rohy znovu zaoblete na R10 – rohovou šablonou (lob 20), nebo obtažením mince či víčka stejné velikosti.',
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
          'Druk drží a jazyk po zkrácení končí asi 21 mm nad horní hranou kapsy (u mince 40 mm asi 15 mm), nezasahuje do ní.',
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
    'Druhý projekt cesty učení: pás tří panelů ohýbaný na obou bocích, šitý jen ve dně, s kapsou na karty a kapsou na bankovky a s mincí vsazenou do vytvarované kapsy s kruhovým okénkem. Staví na tom, co umíte z pouzdra na karty (rovný řez, děrování, sedlářský steh, hrany), a přidává mokré tvarování kůže, ztenčení ohybu, osazení druku a šití třemi vrstvami. Čas výroby je hrubý odhad a celý střih je návrh k ověření na papíru a odřezku.',
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
        'Tělo: třísločiněná lícová 1,5 mm, přířez A4 (nebo 1,2 mm, např. Verde – ztenčení ohybu B pak odpadá). Kapsa: samostatný kus 1,2 mm, aspoň 57,5 × 57,5 mm (u mince 40 mm 70 × 70 mm), i když je tělo z 1,5 mm. K tomu odřezky na trénink v lekcích 2–4.',
    },
    {
      equipmentSlug: 'coin-forming-block',
      priority: 'required',
      reason: 'Tvarování důlku na minci za mokra (lekce 2 a 6).',
      specification:
        'Dvoudílná forma z překližky, otvor Ø 31,5 mm pro výchozí minci 50 Kč (vykružovací pila 32 mm – ověřit na odřezku; Forstnerův vrták jen 32 mm); Ø 44 mm pro minci 40 mm.',
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
      specification: 'Tupé sedlářské, k niti 0,6 mm, 4 ks.',
    },
    {
      equipmentSlug: 'waxed-thread',
      priority: 'required',
      reason: 'Šev dna (skrz tři vrstvy) a šev kapsy.',
      specification:
        'Voskovaný polyester 0,6–0,8 mm. Orientačně asi 4× délka švu: dno (64 mm skrz 4,5 mm kůže) ≈ 0,6 m, raději 0,8 m; kapsa 23 otvorů (u mince 40 mm 31) – 0,8 m vystačí s rezervou; ověřit na odřezku.',
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
        note: 'Stejný obrys jako pás, bez otvorů; čísla kroků u ohybů, rámeček karty, místo pro kapsu, čára švu a seznam k zapsání při zkoušce. Výchozí mince 50 Kč (27,5 mm), kůže 1,5 mm. Vytiskněte a projděte jako první, ještě před řezáním kůže.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
      },
      {
        id: 'sablona',
        title: 'Pás (šablona)',
        note: 'Tři panely a dva ohyby v jednom kuse, 242,55 × 104,1 mm plus jazyk 44,49 mm; výchozí mince 50 Kč (27,5 mm), kůže 1,5 mm se ztenčením ohybu B, bez otvoru pro průchodku. Obkreslujte na líc kůže, ne na rub.',
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
        id: 'papirovy-model-kuze-1-2',
        title: 'Papírový model – kůže 1,2 mm',
        note: 'Stejný list jako výchozí papírový model (mince 50 Kč), přepočítaný pro kůži 1,2 mm bez ztenčení ohybu B – pás je kratší: 240,35 × 104,1 mm, ohyb A 15,69 mm, ohyb B 8,66 mm, jazyk 43,07 mm.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'kůže 1,2 mm (např. Verde), bez ztenčování – mince 50 Kč',
      },
      {
        id: 'sablona-kuze-1-2',
        title: 'Pás (šablona) – kůže 1,2 mm',
        note: 'Stejný list jako výchozí pás (mince 50 Kč), přepočítaný pro kůži 1,2 mm bez ztenčení ohybu B – pás je kratší: 240,35 × 104,1 mm, ohyb A 15,69 mm, ohyb B 8,66 mm, jazyk 43,07 mm. List KAPSA je stejný jako výchozí – kapsa se vždycky dělá z kůže 1,2 mm bez ohledu na tloušťku těla.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'kůže 1,2 mm (např. Verde), bez ztenčování – mince 50 Kč',
      },
      {
        id: 'papirovy-model-40mm',
        title: 'Papírový model – mince 40 mm',
        note: 'Stejný list jako výchozí papírový model, přepočítaný pro minci 40 mm z předlohy: kapsa začíná výš, ohyby a jazyk se nemění.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 40 mm (předloha)',
      },
      {
        id: 'sablona-40mm',
        title: 'Pás – mince 40 mm',
        note: 'Stejný list jako výchozí pás, přepočítaný pro minci 40 mm z předlohy: kapsa 35,55 mm pod horní hranou a 8,5 mm od boků, ohyby a jazyk se nemění.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 40 mm (předloha)',
      },
      {
        id: 'kapsa-40mm',
        title: 'Kapsa – mince 40 mm',
        note: 'Stejný list jako výchozí kapsa, přepočítaný pro minci 40 mm: okno Ø 32 mm, kapsa 55 × 54,5 mm, otvor formy 44 mm.',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
        variant: 'mince 40 mm (předloha)',
      },
      {
        id: 'papirovy-model-40mm-kuze-1-2',
        title: 'Papírový model – mince 40 mm, kůže 1,2 mm',
        note: 'Stejný list jako výchozí papírový model, přepočítaný pro minci 40 mm a kůži 1,2 mm bez ztenčení ohybu B: pás 240,35 × 104,1 mm, ohyb A 15,69 mm, ohyb B 8,66 mm, jazyk 43,07 mm.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 40 mm (předloha), kůže 1,2 mm (např. Verde)',
      },
      {
        id: 'sablona-40mm-kuze-1-2',
        title: 'Pás (šablona) – mince 40 mm, kůže 1,2 mm',
        note: 'Stejný list jako výchozí pás, přepočítaný pro minci 40 mm a kůži 1,2 mm bez ztenčení ohybu B: pás 240,35 × 104,1 mm, ohyb A 15,69 mm, ohyb B 8,66 mm, jazyk 43,07 mm. List KAPSA je kapsa-40mm (okno Ø 32 mm, kapsa 55 × 54,5 mm, otvor formy 44 mm) – kapsa se vždycky dělá z kůže 1,2 mm bez ohledu na tloušťku těla.',
        orientation: 'landscape',
        widthMm: 297,
        heightMm: 210,
        variant: 'mince 40 mm (předloha), kůže 1,2 mm (např. Verde)',
      },
    ],
    calibrationMm: 50,
    printNote:
      'Tisk na A4 bez přizpůsobení velikosti (100 %). Kontrolní úsečka na okraji musí měřit 50 mm.',
    defaultVariantLabel: 'Výchozí střih – mince 50 Kč, kůže 1,5 mm',
    variantsNote:
      'V aplikaci jsou listy pro výchozí minci 50 Kč (27,5 mm), pro kůži 1,2 mm (např. Verde; platí pro třísločiněnou kůži 1,2 mm z jakékoli nabídky), pro minci 40 mm z předlohy a pro kombinaci mince 40 mm s kůží 1,2 mm. Jiná mince mění jen místo kapsy, okno a otvor formy, ne ohyby ani jazyk; tloušťka kůže naopak mění ohyby i jazyk. Jiný počet karet ani jiná tloušťka kůže než 1,5 a 1,2 mm v aplikaci zatím nejsou.',
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
          'kapsa 57,5 × 57,5 mm (lekce 6) a zkušební proužek na ohyby asi 130 × 40 mm (lekce 4) ze stejné kůže jako pás',
      },
      {
        equipmentSlug: 'veg-tan-leather',
        url: 'https://craft-point.cz/products/hovezi-kuze-licova-juchtova-trislocinena-1-2-mm',
        variant: 'A5 (21 × 15 cm)',
        quantity: 1,
        purpose:
          'trénink: dva odřezky 57,5 × 57,5 mm na tvarovací zkoušku a zkušební okno (lekce 2) a odřezky na zkoušku druku (lekce 3)',
      },
      {
        equipmentSlug: 'utility-knife',
        url: 'https://craft-point.cz/products/nuz-na-kuzi-s-odlamovaci-cepeli-18mm',
        quantity: 1,
      },
      {
        equipmentSlug: 'steel-ruler',
        url: 'https://craft-point.cz/products/rezaci-pravitko-s-protiskluzovou-vlozkou-20cm-30cm',
        quantity: 1,
        purpose: 'varianta 30 cm',
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
        quantity: 1,
        purpose: 'varianta 0,6 mm; 20 m vystačí na šev dna i kapsy s velkou rezervou',
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
        url: 'https://www.obi.cz/vykruzovaci-pily/lux-sada-vykruzovacich-pil-7-ks/p/1698885',
        quantity: 1,
        purpose:
          'obsahuje 32 mm na otvor formy Ø 31,5 mm; vyřízne otvor aspoň o 0,5 mm větší než model (vůle kolem zabalené mince asi 2,1 mm místo 1,6 mm) – tvarování to nezkazí, jen okraj důlku bude o něco měkčí; ověříte na zkoušce v lekci 2',
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
    ],
    skipped: [
      {
        equipmentSlug: 'safety-skiver',
        reason: 'Kůže těla 1,2 mm – ztenčení ohybu B odpadá.',
      },
      {
        equipmentSlug: 'edge-beveler',
        reason: 'Tentokrát ne: hrany se jen srovnají brusným archem a zaleští.',
      },
      {
        equipmentSlug: 'corner-template',
        reason: 'Tentokrát ne: R10 a R6 obtáhnete podle mince nebo víčka.',
      },
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

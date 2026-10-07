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
    goal: 'Poskládat papírový model se skutečnými kartami a bankovkami a zapsat, co ukázal, dřív než se řízne do kůže.',
    materials: [
      'vytištěný list PAPÍROVÝ MODEL na papír 160 g (zkontrolovaná kalibrační úsečka 50 mm); výchozí list je pro minci 50 Kč a kůži 1,2 mm; u kůže 1,5 mm vytiskněte místo něj Papírový model – kůže 1,5 mm, u mince 40 mm Papírový model – mince 40 mm (viz první krok)',
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
        body: 'Vytiskněte list ze stránky Listy střihu (odkaz pod krokem). Tisk na A4 bez přizpůsobení velikosti („skutečná velikost“, 100 %). Výchozí listy jsou pro minci 50 Kč (27,5 mm) a kůži těla 1,2 mm (např. Blu nebo Verde) – bez ztenčení ohybu B. Pokud stavíte na kůži 1,5 mm, vytiskněte variantu pro 1,5 mm – mění ohyby i jazyk (ohyb B se u ní ztenčuje). Pokud stavíte na minci 40 mm (jako předloha), vytiskněte variantu pro 40 mm – mění se jí jen místo kapsy a je na ní větší otvor formy a okno; ohyby a jazyk zůstávají stejné. Na stránce Listy střihu jsou předem zaškrtnuté jen listy výchozí skupiny (mince 50 Kč, kůže 1,2 mm). U kůže 1,5 mm odškrtněte Papírový model a Pás (šablona) a zaškrtněte Papírový model – kůže 1,5 mm a Pás (šablona) – kůže 1,5 mm; Kapsa s mincí a otvor formy a Postup skládání zůstávají zaškrtnuté z výchozí skupiny. U mince 40 mm stejně odškrtněte výchozí Papírový model, Pás i Kapsu s mincí a otvor formy a zaškrtněte listy ze skupiny mince 40 mm. Změřte kalibrační úsečku: musí mít přesně 50 mm. Papírový model prokáže polohu jazyka a kloboučku, výřez, vytahování karty a místo pro kapsu – neprokáže ale přídavek ohybů, protože papír je tenčí než kůže.',
        printLink: 'pattern-sheets',
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
      {
        id: 'decide',
        title: 'Rozhodněte, jestli pokračovat',
        body: 'Když se karty nebo bankovky, které nosíte, do modelu nevejdou, karta ve výřezu nejde palcem vysunout nebo jazyk nedosáhne přes značku patice, zastavte se a kůži zatím neřežte. Zapište, co přesně nesedí a o kolik mm. Nejdřív vylučte chybu tisku: změřte znovu kalibrační úsečku (přesně 50 mm) a zkontrolujte, že jste vytiskli list pro svou tloušťku kůže a minci; když něco nesedí, vytiskněte list znovu a model složte ještě jednou. Když model nesedí ani se správným tiskem, tenhle střih pro váš obsah nepoužívejte – jiný počet karet ani jinou tloušťku bankovek aplikace zatím přepočítat neumí. Pokračujte, až když model se vším, co nosíte, sedí.',
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
      'list KAPSA ve 3 výtiscích (zkontrolovaná kalibrační úsečka 50 mm; výchozí list je pro minci 50 Kč, u mince 40 mm vytiskněte variantu pro 40 mm – mění se jí otvor formy): 1 na vrtání formy, 1 na orýsování značek na líci, 1 na šablonu na rub – vystřihne se přesně po obrysu kapsy a vysekne se do ní okno; když zkouška okna Ø 20 mm nevyjde, ještě 1 výtisk listu Kapsa – záložní okno Ø 18 mm na šablonu s oknem Ø 18 mm',
      'dvě desky na formu a víko (překližka nebo tvrdý plast, aspoň 8 mm; jako forma poslouží i bukové kuchyňské prkénko asi 1,5 cm silné, např. Orion) a odpadní prkno pod vrtání',
      'aku vrtačka s vykružovací pilou 32 mm (např. Wolfcraft bimetal Ø 32 mm) pro výchozí minci 50 Kč (otvor 31,5 mm); Forstnerův vrták jen v průměru 32 mm – v ověřené sadě 15–35 mm je jen 30 mm (menší než otvor) a 35 mm; u mince 40 mm vykružovací pila 45 nebo 44 mm',
      '2 odřezky třísločiněné kůže 1,2 mm, každý aspoň 57,5 × 57,5 mm (u mince 40 mm aspoň 70 × 70 mm) – druhý pro případné opakování zkoušky okna',
      'mince, na kterou stavíte střih (výchozí 50 Kč)',
      'potravinová fólie',
      'houbička a voda',
      'smirkový papír na zaoblení hrany vyvrtaného otvoru',
      'tužka HB nebo 2B na osy na rubu kůže',
      'kruhový výsečník Ø 20 mm na zkušební okno (u mince 40 mm Ø 32 mm) a špalík pod důlek: užší než otvor formy (pod 31,5 mm, u mince 40 mm pod 44 mm) a širší než okno (přes 20 mm, u mince 40 mm přes 32 mm), s rovným koncem. Tip – ověřit: u mince 50 Kč poslouží kus kulaté dřevěné tyčky nebo násady o průměru asi 21–31 mm (průměr změřte), na konci zaříznutý rovně a zkrácený tak, aby se dna důlku na formě jen dotýkal',
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
    ],
    recommendedEquipment: ['masking-tape'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'drill-form',
        title: 'Vyvrtejte formu',
        body: 'Vytiskněte list KAPSA ze stránky Listy střihu (odkaz pod krokem) na 100 % (zkontrolujte úsečku 50 mm). Formou je deska z překližky nebo tvrdého plastu, poslouží i bukové kuchyňské prkénko asi 1,5 cm silné (např. Orion). Na listu je samostatný výkres „OTVOR FORMY PRO DŮLEK“ – kružnice Ø 31,5 mm s osami. Vystřihněte ho jako čtverec asi 7 × 7 cm, s okrajem asi 2 cm kolem kružnice, aby na papíru zůstaly celé osy. Samotnou kružnici nevystřihujte. Čtverec položte na desku doprostřed její šířky, střed otvoru asi 4–5 cm od konce naproti rukojeti (má-li deska rukojeť), osy rovnoběžně s okraji desky. Přilepte ho lepicí tyčinkou nebo páskou na okrajích. Ještě před vrtáním protáhněte obě osy tužkou podle pravítka až k okrajům desky – podle nich pak na formě zarovnáte osy narýsované na kůži. Desku upněte svěrkou ke stolu, pod ni dejte odpadní prkno. Středicí vrták nasaďte do křížku os. Otvor pro výchozí minci 50 Kč vrtejte vykružovací pilou Ø 32 mm (u mince 40 mm Ø 44 mm), na 1. rychlost, bez příklepu, netlačte silou, s nabitou baterií. Vykružovací pilou provrtejte do půlky, desku otočte a dokončete z druhé strany podle dírky středicího vrtáku. Forstnerovým vrtákem (sukovníkem) ho místo toho průběžně vytahujte, ať se zbaví pilin. Pak papír sundejte. Nakonec zaoblete horní hranu otvoru (stranu, na kterou budete pokládat kůži – označte si ji tužkou): smirkový papír 180 oviňte kolem prstu nebo tužky a hranu po celém obvodu sražte šikmo asi pod 45° do malého oblouku kolem 1 mm. Průměr otvoru nezvětšujte. Stěnu otvoru jen lehce přejeďte, aby netrčely třísky, a plochu kolem otvoru přebruste naplocho. Hrana nesmí pod prstem řezat ani drhnout; zabalená mince s odřezkem kůže musí jít do otvoru volně. Pokud se osy při broušení setřely, obtáhněte je znovu až k okrajům desky.',
        printLink: 'pattern-sheets',
        animationLinks: [animationLink('kapsa', 'A1')],
        media: [],
      },
      {
        id: 'mark-outline',
        title: 'Orýsujte obrys a prosekejte otvory švu',
        body: 'Použijete dva výtisky listu KAPSA. 1. výtisk vystřihněte nahrubo s okrajem 1–2 cm, položte na LÍC odřezku a přilepte maskovací páskou na okrajích, mimo obrys, z několika stran (pásku nejdřív zkuste na kousku téže kůže). Šídlem propíchněte skrz tečky švu a 4 konce os – čtyři body, kde končí čerchované osy (vlevo, vpravo, nahoře, dole). Pásku strhněte pomalu pod ostrým úhlem, list sundejte a zkontrolujte, že se přenesly všechny značky. Na líci nic nekreslete – zůstanou na něm jen propíchnuté dírky: tečky švu a 4 konce os. Konce os leží vně obrysu kapsy a při řezu obrysu odpadnou; čára přes kapsu na líci by na hotové kapse zůstala vidět mezi oknem a obrysem. Vidličkami s roztečí 4 mm naplocho na desce prosekejte otvory švu z líce podle propíchnutých teček, stejně jako u skutečné kapsy, která se děruje ještě před navlhčením. Pak kůži otočte: propíchnuté konce os (i proseknuté otvory švu) jsou vidět na RUBU. Na rubu spojte protilehlé konce os podle pravítka a osy narýsujte tužkou HB nebo 2B, lehce (když tužka na kůži není vidět, lehce šídlem), až k okrajům kůže. 2. výtisk vystřihněte přesně po obrysu kapsy (plná čára se zaoblenými rohy) a ještě než ho položíte na kůži, vysekněte do něj okno: papír položte na desku na sekání, výsečník Ø 20 mm (u mince 40 mm Ø 32 mm) postavte přesně na vytištěnou kružnici okna – břit na čáře dokola, k vystředění pomůžou vytištěné osy – a udeřte paličkou. Pak 2. výtisk položte na RUB, zarovnejte na osy a obrys obtáhněte šídlem nebo tužkou. Na rub, ne na líc: škrábnutí na líci třísločiněné kůže zůstane vidět. Potom tužkou HB nebo 2B, lehce, objeďte vnitřní hranu otvoru v papíru – na rubu vznikne celá kružnice okna přesně ve velikosti výsečníku; podle ní vystředíte zkušební okno na konci lekce. Obrys se teď neřeže, odřezek se po něm řízne až po vytvarování. 2. výtisk s oknem si schovejte: když se čára při tvarování rozmaže, obtáhnete obrys i kružnici okna podle něj znovu. Přes vytvarovaný důlek ale papír neleží úplně rovně, proto orýsujte všechno teď na rovné kůži a obtažení po tvarování berte jen jako pomoc. Když vám zkouška okna Ø 20 mm vyjde, stejnou šablonu použijete i na skutečnou kapsu v lekci 6. Otvory švu leží jen asi 2 mm vně dna důlku, proto na přesném vystředění záleží; tady si tu kombinaci vyzkoušíte na odřezku.',
        animationLinks: [animationLink('kapsa', 'B1')],
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
        animationLinks: [animationLink('kapsa', 'D1')],
        media: [],
      },
      {
        id: 'press-and-clamp',
        title: 'Vtlačte do formy a stáhněte svěrkami',
        body: 'Kůži lícem dolů položte na formu; rub je teď nahoře, zarovnejte na něm narýsované osy s osami narýsovanými na okraji desky. Zabalenou minci položte na rub nad otvor, přiklopte víkem a dvěma svěrkami proti sobě rovnoměrně stáhněte, aby se víko nenaklonilo.',
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
        body: 'Nechte úplně zaschnout, jistější je přes noc. Pak rozepněte a zkontrolujte: důlek má být dost hluboký a bez zvrásnění na okraji; mince do něj má jít zasunout i vysunout, forma počítá se záměrnou vůlí. Jak poznat dost hluboký důlek, aplikace v milimetrech neříká (tloušťku mince model nepočítá). Pomůže pohled: odřezek položte rubem nahoru a minci vložte do důlku – celá má v důlku ležet a nad okolní rovný rub kůže nemá vyčnívat; její plocha má být s ním zhruba v rovině nebo pod ní (ověřit na odřezku). Kdyby vyčnívala, tlačila by po přišití kapsy do předního panelu. Podívejte se i na zkušební otvory u kraje – mají zůstat kulaté, ne protažené nebo potrhané.',
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
        body: 'Okno Ø 20 mm nechává kolem mince 50 Kč prstenec kůže jen 3,75 mm (dřív střih počítal se 4 mm), a právě ten má minci držet, aby oknem nevypadla. Že to na vaší kůži stačí, se musí ověřit tady, na odřezku, ne až na hotové kapse. Zaschlý odřezek položte lícem dolů zpátky na formu: důlek do otvoru, osy na rubu kůže na osy desky. Důlek visí v otvoru volně, nic ho nemačká. Nejdřív si na formě vyzkoušejte řez obrysu jako u skutečné kapsy: obrys vede asi 5 mm vně důlku, nad dřevem, takže nůž řeže na desce, ne nad důlkem. Řežte 2–3 lehkými tahy a kůži přidržujte na rovné části (je-li čára rozmazaná, obtáhněte obrys i kružnici okna znovu podle 2. výtisku s oknem). Desku můžete chránit kouskem kartonu s otvorem Ø 32 mm (u mince 40 mm Ø 44 mm) položeným na formu. Pak na formě pod důlek podložte špalík (užší než otvor formy, širší než okno) a výsečníkem Ø 20 mm (u mince 40 mm Ø 32 mm) vystředěným podle narýsované kružnice okna vysekněte okno – kružnice má přesně velikost výsečníku, břit postavte na čáru dokola. Rozhoduje ale prstenec: před úderem zkontrolujte, že prstenec kůže kolem důlku je po celém obvodu stejně široký, kružnice je jen vodítko. Pak zkoušejte: (1) minci vložte z rubu do důlku, odřezek otočte oknem dolů a zatřeste – mince nesmí vypadnout; (2) na minci z rubu zatlačte palcem směrem k oknu – nesmí oknem projít ani prstenec vytlačit ven; (3) prstenec zkontrolujte po celém obvodu – má být stejně široký, bez natržení. Když mince oknem projde, zapište to a Ø 20 mm do skutečné kapsy nesekejte. Nejdřív zkontrolujte hloubku důlku: mělký důlek může být příčina, pak tvarování zopakujte (ověřit na odřezku). Potom na druhém odřezku zopakujte kroky 2–6 (orýsování, zabalení mince, navlhčení, tvarování ve formě a schnutí přes noc) a vysekněte menší okno Ø 18 mm (CraftPoint, stejná nabídka výsečníků 2–20 mm, 29. 9. 2026 za 58 Kč skladem; 19 mm v nabídce není). Prstenec je pak 4,75 mm a z mince je v okně vidět o něco méně. 1. výtisk s propíchnutými značkami použijte znovu (osy i šev jsou stejné). Na rub ale potřebujete šablonu s otvorem Ø 18 mm – do 2. výtisku s otvorem Ø 20 mm menší okno nevyseknete. Na stránce Listy střihu (odkaz pod krokem) proto zaškrtněte a vytiskněte list Kapsa – záložní okno Ø 18 mm: je stejný jako list KAPSA, jen s kružnicí okna Ø 18 mm. Vystřihněte ho přesně po obrysu kapsy a otvor do něj vysekněte na desce na sekání výsečníkem Ø 18 mm postaveným přesně na vytištěnou kružnici, k vystředění pomůžou osy. Podle nové šablony obtáhnete na rubu kružnici Ø 18 mm a vystředíte podle ní okno; stejnou šablonu pak použijete i na skutečnou kapsu v lekci 6. Do skutečné kapsy pak sekejte tím průměrem, se kterým vám zkouška vyšla.',
        printLink: 'pattern-sheets',
        animationLinks: [animationLink('kapsa', 'E1')],
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
          'Důlek je dost hluboký (mince vložená z rubu nad okolní rub nevyčnívá) a bez zvrásnění na okraji; mince do něj jde zasunout i vysunout.',
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
      'Osy nebo jiné čáry nakreslené na líci kapsy – zůstanou vidět. Na líci jsou jen propíchnuté dírky, osy se kreslí na rubu.',
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
    goal: 'Naplocho osadit a vyzkoušet druk na odřezku stejné kůže jako tělo, než ho osadíte na finální pás; u kůže těla 1,5 mm navíc ztenčit pásmo ohybu na odřezku na 1 mm.',
    materials: [
      '2–3 odřezky stejné kůže jako tělo (výchozí 1,2 mm, nebo 1,5 mm) na zkoušku druku a obtisku patice – u sestavy z nákupního plánu z kusu Blu A5: kapsu 57,5 × 57,5 mm a cvičný proužek 130 × 40 mm si na něm nejdřív obkreslete vedle sebe podél jedné hrany a odřezky berte ze zbylého pruhu asi 210 × 92 mm; jen u kůže 1,5 mm navíc odřezek na trénink ztenčení (u výchozí 1,2 mm kroky 1–2 přeskočte)',
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
        body: 'Jen u kůže těla 1,5 mm – u výchozí kůže 1,2 mm tenhle i další krok přeskočte. Odřezek nemá vyznačené čáry ohybu – narýsujte si tedy dvě rovnoběžné čáry asi 10 mm od sebe (tolik má na pásu z kůže 1,5 mm ohyb B, přesně 9,92 mm; u kůže 1,2 mm se ztenčení přeskakuje), budou zastupovat obě čáry ohybu. Šídlem propíchněte oba jejich konce skrz, na rubu je spojte a od každé čáry odsaďte dalších 3 mm ven. Ztenčovat se bude celé pásmo mezi čarami plus tento přesah na obou stranách – asi 16 mm celkem.',
        media: [],
      },
      {
        id: 'skive',
        title: 'Ztenčete z rubu na 1 mm',
        body: 'Jen u kůže 1,5 mm. Bezpečnostním ztenčovačem odebírejte tenké hobliny, čepel veďte skoro naplocho, ne kolmo. Průběžně kontrolujte tloušťku – cíl je asi 1 mm, ne proříznutí naskrz. Na finálním pásu z kůže 1,2 mm se tenhle krok přeskakuje – ztenčení tam není potřeba.',
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
        body: 'Druk se na finální pás osazuje až v lekci 6 a na jazyk v lekci 8 – nejdřív ho celý vyzkoušejte tady, na odřezku stejné kůže jako tělo. Obchod u Prym Anorak uvádí „textilie vyrobené z jemné kůže“, třísločiněná kůže 1,2–1,5 mm je tužší. Jestli dřík v jedné vrstvě dobře roznýtuje a druk jde zavřít i otevřít, ukáže jen zkouška – ověřit na odřezku. Návod z obalu mějte po ruce: je na něm, jak se konkrétní druk osazuje. Druk je čtyřdílný: dřík a hlavička jdou na přední panel, zdířka a klobouček na jazyk (skladbu dílů ověřte podle obalu). Každá polovina svírá jen jednu vrstvu kůže těla (1,2 nebo 1,5 mm).',
        animationLinks: [animationLink('snap', 'A1')],
        media: [],
      },
      {
        id: 'punch-post-hole',
        title: 'Otvor pro dřík druku (pokud ho návod vyžaduje)',
        body: 'Šídlem propíchněte na odřezku bod 9,5 mm od okraje (jako střed dříku na předním panelu, 9,5 mm pod horní hranou) – to je značka pro dřík a zároveň si ověříte, jak se druk chová u hrany. Velikost otvoru pro dřík obchod neuvádí. Řiďte se návodem v balení druku. Když návod otvor vyžaduje a velikost neuvádí, začněte nejmenším výsečníkem (2 mm) a dřík přiložte – má otvorem projít těsně; když neprojde, zkuste o krok větší (3 mm). Moc velký otvor a dřík se v kůži viklá.',
        animationLinks: [animationLink('snap', 'A2')],
        media: [],
      },
      {
        id: 'set-snap-post',
        title: 'Osaďte dřík druku',
        body: 'Dřík s hlavičkou osaďte naplocho aplikátorem z balení druku a paličkou na tvrdé podložce, kolmo a přesně na značku – pořadí dílů a stranu aplikátoru podle návodu na obalu. Zkontrolujte, že sedí naplocho a pevně a že kůže kolem dříku nepopraskala. Když dřík neroznýtuje, viklá se nebo kůže kolem praskne, zopakujte to na dalším odřezku (balení Prym Anorak má 10 ks). Když to nevyjde ani napodruhé, na pás druk neosazujte a vyzkoušejte na odřezku alternativu z vybavení (Stoklasa Ø 13,5 mm na silné látky – na kůži ověřit na odřezku).',
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
        body: 'Než osadíte klobouček, vyzkoušejte si, jak v lekci 8 najdete jeho místo. Druhý odřezek položte rubem dolů na osazenou hlavičku na prvním odřezku a pevně ho přitiskněte, aby se hlavička na rubu obtiskla – stejně jako se v lekci 8 obtiskne na rub jazyka. Odřezek otočte a najděte střed obtisku. Ten propíchněte šídlem skrz, aby byl bod vidět i na líci: tam půjde klobouček. Jak silně je potřeba přitlačit, aby byl obtisk zřetelný, zjistíte jen tady – ověřit na odřezku.',
        media: [],
      },
      {
        id: 'practice-snap-cap',
        title: 'Vyzkoušejte i kloboučkovou polovinu druku',
        body: 'Na druhém odřezku osaďte kloboučkovou polovinu druku do bodu propíchnutého podle obtisku v předchozím kroku. Pokud návod vyžaduje otvor, postupujte stejně jako u dříku: nejmenší výsečník (2 mm), a teprve když trn kloboučku neprojde, o krok větší (3 mm) – průměr ověřte na odřezku, ne až na jazyku. Klobouček se zdířkou osaďte aplikátorem a paličkou stejným způsobem jako dřík. Zacvakněte ho na osazený dřík a zkontrolujte, že druk jde zavřít i znovu otevřít a drží a že okraje obou odřezků po zapnutí sedí tak, jak ležely při obtisku – v hotovém pouzdru už tuhle kombinaci nezkusíte dřív, než bude jazyk zkrácený. Zapište si, který výsečník (nebo žádný) sedl.',
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
        body: 'Na rubu odřezku změřte posuvným měřítkem průměr příruby osazené patice (dříku); když ho nemáte, stačí ocelové pravítko – jde jen o to, jestli je příruba do 11 mm. Smí mít nejvýš 11 mm: střed patice je na předním panelu 9,5 mm pod horní hranou a karty začínají 15 mm pod ní, takže větší příruba by na rubu tlačila na karty. Když má víc, střih s tímhle drukem nepoužívejte a zapište si to.',
        animationLinks: [animationLink('snap', 'A7')],
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'skive-clean',
        title:
          'Jen u kůže 1,5 mm: ztenčené pásmo má rovnoměrnou tloušťku asi 1 mm, bez proříznutí naskrz. U kůže 1,2 mm se tenhle krok přeskakuje.',
        required: false,
      },
      {
        slug: 'hardware-set',
        title:
          'Dřík druku sedí na odřezku stejné kůže jako tělo naplocho, pevně a přesně na značce.',
        required: true,
      },
      {
        slug: 'imprint-tried',
        title:
          'Na druhém odřezku je vyzkoušený obtisk hlavičky a jeho střed je propíchnutý na líc.',
        required: false,
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
      'jeden kus stejné kůže jako na finální pás (u sestavy z nákupního plánu z kusu Blu A5), asi 130 × 40 mm: tři panely po asi 30 mm (3 × 30 = 90 mm) a oba ohyby – u kůže 1,5 mm ohyb A asi 16,6 mm a ohyb B asi 9,9 mm, u kůže 1,2 mm ohyb A asi 15,7 mm a ohyb B asi 8,7 mm (obojí z modelu) – dohromady u kůže 1,5 mm asi 117 mm (90 + 16,6 + 9,9), u kůže 1,2 mm asi 114 mm (90 + 15,7 + 8,7), s rezervou na konce asi 130 mm',
      'pár karet zabalených v potravinové fólii jako náhrada obsahu, a kus přeloženého papíru asi 2 mm silný jako náhrada bankovek',
      'houbička a voda na navlhčení ohybů',
      'kostěná rozhrnovačka (bone folder) nebo hrana pravítka',
      'sponky s podložkou na sepnutí ohybů při schnutí',
      'nit asi 0,8 m – podle návodu „Jak odměřit nit“ (přes tři vrstvy 5 × délka švu + 25–30 cm rezervy) stačí na krátký šev odřezku (6 otvorů, asi 20 mm) asi 0,4 m; 0,8 m nechává začátečníkovi rezervu',
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
    recommendedEquipment: [
      'scratch-awl',
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
        title: 'Vyřízněte cvičný proužek a vyznačte ohyby a otvory',
        animationLinks: [
          animationLink('stripTransfer', 'A2'),
          animationLink('stripTransfer', 'A3'),
          animationLink('stripTransfer', 'B1'),
          animationLink('stripTransfer', 'D3'),
        ],
        printLink: 'practice-sheets',
        body: 'Proužek vyřízněte ze stejné kůže jako pás. Nejjednodušší je cvičný list: na stránce Cvičné listy vytiskněte list „Cvičný proužek pro lekci 4“ na 100 % (zkontrolujte úsečku 50 mm a že tloušťka kůže uvedená na listu sedí na vaši kůži). Vystřihněte ho nahrubo s okrajem 1–2 cm, přilepte maskovací páskou na líc odřezku (páska jen na okrajích, mimo čáru řezu) a stejně jako u pásu v lekci 5 propíchněte šídlem skrz papír kroužky na koncích čar obou ohybů A a B a na koncích linie švu a všechny tečky dna; pak řežte skrz papír po obrysu. Obrys vystřeďte na kusu asi 130 × 40 mm, na koncích zbude rezerva. Na rubu pak spojte propíchnuté konce čar ohybů tužkou podle pravítka. Bez listu proužek odměřte ručně: vyřízněte asi 130 × 40 mm a na rubu narýsujte tužkou uprostřed délky prostřední panel 30 mm, z jedné strany vedle něj pásmo ohybu A (u kůže 1,2 mm 15,7 mm, u kůže 1,5 mm 16,6 mm), z druhé strany pásmo ohybu B (u kůže 1,2 mm 8,7 mm, u kůže 1,5 mm 9,9 mm) a za nimi krajní panely po 30 mm; co zbude na koncích, je rezerva. Linii švu 3,5 mm od dolní hrany a zrcadlené tečky pak vyznačte podle dalšího kroku.',
        media: [],
      },
      {
        id: 'mark-mirrored-dots',
        title: 'Vyznačte otvory dna zrcadlené přes ohyby',
        animationLinks: [animationLink('bottomHoles', 'E1'), animationLink('bottomHoles', 'A2')],
        body: 'S cvičným listem máte tečky propíchnuté z předchozího kroku – tady si jen podle výpočtu ověřte, proč leží tam, kde leží. Bez listu: na plochém, ještě nepřeloženém proužku narýsujte linii švu 3,5 mm od dolní hrany na všech třech panelech. Polohu otvorů odměřte od obou čar ohybu tak, aby byly na sousedních panelech zrcadlené kolem ohybu – jen tak budou po složení lícovat. Počet otvorů spočítejte stejně jako list PÁS: od čáry ohybu i od boční hrany nechte aspoň 3,5 mm (stejně jako od dolní hrany), takže na panel dlouhý asi 30 mm s roztečí 4 mm vyjde (30 − 2 × 3,5) / 4 = 5,75, tedy 5 celých mezer a 6 otvorů. Řadu pak na panelu vystřeďte: krajní otvory leží (30 − 5 × 4) / 2 = 5 mm od čáry ohybu i od hrany. Na listu PÁS vyjde stejným výpočtem z panelu 72 mm 17 otvorů a krajní leží (72 − 16 × 4) / 2 = 4 mm od čar ohybů i od hran. Přesný počet a krajní odstup upravte podle skutečné délky vašeho panelu.',
        media: [],
      },
      {
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení ohybu B',
        body: 'Jen u kůže 1,5 mm: narýsujte mezi prostředním a jedním krajním panelem pásmo ohybu B asi 9,9 mm široké a odsaďte 3 mm na obě strany (asi 16 mm celkem), stejně jako v lekci 3. S cvičným listem pro kůži 1,5 mm je pásmo na listu vyšrafované a konce čar ohybu B máte propíchnuté: na rubu je spojte a odsaďte 3 mm na obě strany. U kůže 1,2 mm tenhle krok i ztenčení přeskočte.',
        media: [],
      },
      {
        id: 'skive-fold-b',
        title: 'Ztenčete ohyb B',
        body: 'Jen u kůže 1,5 mm: ztenčete v odsazeném pásu kůži z rubu na 1 mm bezpečnostním ztenčovačem, stejně jako v lekci 3. U kůže 1,2 mm se ztenčení přeskakuje.',
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
        animationLinks: [animationLink('pouchFold', 'B1')],
        media: [],
      },
      {
        id: 'fold-around-content',
        title: 'Přeložte kolem obsahu',
        body: 'Karty zabalené v potravinové fólii položte mezi prostřední panel (zastupuje přední) a přiléhající krajní panel (zastupuje vnitřní), pak přeložte ohyb B. Jako náhradu bankovek použijte přeložený papír silný asi 2 mm a položte ho mezi krajní panel, který zastupuje vnitřní, a druhý krajní panel (zastupuje zadní) – stejné pořadí vrstev jako u finálního pásu (přední – karty – vnitřní – bankovky – zadní). Teprve pak přeložte ohyb A přes všechno. Přejeďte rozhrnovačkou nebo hranou pravítka a sepněte sponkami přes podložku. Než necháte zaschnout, zkontrolujte, že se naplocho prosekané otvory na sousedních panelech po složení lícují. Když nelícují, dokud je kůže ještě vlhká, sponky sundejte, ohyb rozevřete a přeložte znovu, smyčku posunutou tak, aby otvory seděly, a zkontrolujte znovu. Malý zbylý posun se při lepení srovná jehlami přes otvory (krok lepení). Když nelícují ani po přeložení, zapište si, o kolik mm a u kterého ohybu – příčinou bývá odměření teček (viz časté chyby); co dělat s větším posunem, ověřit na odřezku. Ohyb A se neztenčuje, jen se přeloží – pokud je na odřezku moc tuhý, zapište si to do poznámek z tréninku. Nasucho nebo na ostro přeložený líc nejspíš praská – proto je navlhčení a smyčka místo ostrého přehybu klíčové.',
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
        id: 'saddle-stitch-reminder',
        title: 'Připomeňte si sedlářský steh',
        animationLinks: [animationLink('saddleStitch', 'D1')],
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
        body: 'Zaschlé ohyby rozevřete jen tolik, aby šel proužek natřít – zhruba do pravého úhlu, ne úplně naplocho (suchý neztenčený ohyb A by mohl na líci prasknout). Spoje jsou dva a lepí se po jednom, ne najednou: v pruhu 0–3,5 mm od hrany (pod čárou švu – lepidlo výš by ubralo místo, kde má obsah vůli) zdrsněte smirkem plochy prvního spoje, naneste lepidlo v tenké rovnoměrné vrstvě, nechte odvětrat podle návodu na obalu, přeložte zpátky, zarovnejte jehlami přes otvory a přitiskněte. Teprve pak stejně zopakujte druhý spoj.',
        animationLinks: [animationLink('pouchFold', 'C1')],
        media: [],
      },
      {
        id: 'stitch-through-layers',
        title: 'Přitiskněte a sešijte tři vrstvy',
        body: 'Přitiskněte slepené vrstvy k sobě a sešijte sedlářským stehem skrz všechny tři vrstvy předem prosekanými otvory, na začátku i na konci dva zpětné stehy. Pak zkontrolujte rub. Rub je u sedlářského stehu vždy trochu méně pravidelný než líc, to je normální. Stehy na rubu ale musí být stejně utažené, v jedné řadě a bez smyček. Otvory na rubu mají být stejně rovné jako na líci; když nejsou, vidličky nebyly při děrování kolmo (lekce 3 pouzdra na karty).',
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
        body: 'Jen u barvené kůže (u sestavy z nákupního plánu Blu). Než barvu na hrany použijete na pásu v lekci 5, vyzkoušejte ji na hraně odřezku ze stejné kůže (rezerva proužku nebo zbytek kusu): hranu srovnejte smirkem, barvu naneste podle návodu na obalu, nechte zaschnout a hranu zaleštěte. Zkontrolujte, jestli barva nezatekla na líc a jak hrana vypadá po zaleštění, a zapište si, kolik vrstev bylo potřeba a jak dlouho schla – podle toho pak postupujte v lekcích 5, 6 a 8.',
        animationLinks: [animationLink('edges', 'C1'), animationLink('edges', 'D1')],
        media: [],
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
        slug: 'edge-paint-tried',
        title:
          'U barvené kůže je barva na hrany vyzkoušená na odřezku a zapsaná (vrstvy, doba schnutí).',
        required: false,
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
      'přířez třísločiněné kůže 1,2 mm na pás (výchozí, např. Blu nebo Verde – bez ztenčení ohybu B), nebo 1,5 mm (pak se ohyb B ztenčuje), aspoň A4',
      'vytištěná šablona PÁS (zkontrolovaná úsečka 50 mm; výchozí list je pro minci 50 Kč a kůži 1,2 mm; u kůže 1,5 mm vytiskněte místo něj Pás (šablona) – kůže 1,5 mm, u mince 40 mm Pás – mince 40 mm; viz první krok)',
      'tužka HB nebo 2B na čáry ohybů na rubu',
      'přípravek na zapečetění rubu (Tokonole nebo gum tragacanth – stejná pasta jako u leštění hran)',
      'barva na hrany (u barvené kůže; vyzkoušená na odřezku v lekci 4)',
      'maskovací páska (na přilepení šablony a na ohraničení pruhu pod čárou švu při pečetění rubu)',
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
        body: 'Vytiskněte šablonu ze stránky Listy střihu (odkaz pod krokem). Tisk na A4 bez přizpůsobení velikosti (100 %). Kalibrační úsečka musí měřit přesně 50 mm. Na stránce Listy střihu jsou předem zaškrtnuté jen listy výchozí skupiny (mince 50 Kč, kůže 1,2 mm). U kůže 1,5 mm odškrtněte Papírový model a Pás (šablona) a zaškrtněte Papírový model – kůže 1,5 mm a Pás (šablona) – kůže 1,5 mm; Kapsa s mincí a otvor formy a Postup skládání zůstávají zaškrtnuté z výchozí skupiny. Popis dole na listu PÁS uvádí průměr mince a tloušťku kůže těla – před přilepením zkontrolujte, že sedí na vaši kůži. Tiskněte nejlépe na matný papír pro inkoustové tiskárny 120 g, jinak na obyčejný papír.',
        printLink: 'pattern-sheets',
        media: [],
      },
      {
        id: 'transfer-face',
        title: 'Hlavní způsob: přilepte šablonu na líc',
        animationLinks: [
          animationLink('stripTransfer', 'A2'),
          animationLink('stripTransfer', 'A1'),
        ],
        body: 'Šablonu PÁS vystřihněte jen nahrubo, s okrajem 1–2 cm kolem obrysu – přesně po čáře ji nestříhejte, řezat se bude až nožem skrz papír i kůži. Položte ji na LÍC kůže, ne na rub – kresba je pohled zvenku, přední panel je nakreslený tak, jak bude vidět. To je rozdíl oproti pouzdru na karty, kde šablona ležela na rubu. Přilepte ji maskovací páskou na okrajích, mimo linii řezu, z několika stran, aby se nemohla posunout. Na líci pásku nejdřív zkuste na odřezku téže kůže – silnější páska může nechat lesklou stopu nebo vytrhnout vlákna; případně použijte pásku na citlivé povrchy. Šablona se rozřeže a je na jedno použití: na každý další pás vytiskněte novou.',
        media: [],
      },
      {
        id: 'transfer-marks-awl',
        title: 'Před řezáním propíchněte značky',
        animationLinks: [animationLink('stripTransfer', 'A3'), animationLink('pocketAttach', 'A2')],
        body: 'Dokud je šablona přilepená a nic není vyříznuté, propíchněte šídlem skrz papír: konce obou čar ohybu A i B (asi 1 mm od hrany pásu, ne přesně na ní), rohy místa pro kapsu (asi 1 mm dovnitř od zaobleného rohu, ne v jeho pomyslném ostrém vrcholu – jinak by značka zůstala vidět na líci mimo přišitou kapsu), střed dříku druku (na předním panelu) a všechny tečky dna. Propíchnutá dírka je vidět z obou stran, takže tím zároveň dostanete tečky na rub zadního a vnitřního panelu, odkud se budou prosekávat.',
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
          animationLink('stripTransfer', 'B3'),
        ],
        body: 'Řežte skrz papír i kůži přesně po vytištěné čáře obrysu. Rovné strany s ocelovým pravítkem položeným na čáru, na dva až tři lehké tahy, nůž kolmo. Malé zaoblení R2,5 na předním panelu, kde oblouk výřezu R34 potkává horní hranu, je vypouklé (ven z kůže) – vyřízněte ho nožem po čáře na šabloně. Když si nejste jistí, nechte tam raději pravý úhel a zaoblete ho až smirkovým papírem. Zbytek výřezu na prst (oblouk R34 vepředu, čtvrtelipsa vzadu) řežte pomalu a plynule bez pravítka. Když začne řez třepit papír nebo kůži, odlomte článek čepele.',
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
        body: 'Pásku strhávejte pomalu pod ostrým úhlem, skoro rovnoběžně s kůží. Zkontrolujte, že se přenesly všechny značky z předchozích kroků: konce čar obou ohybů, rohy kapsy, střed dříku a tečky dna. Chybějící značku už přes rozřezanou šablonu přesně nedoplníte.',
        media: [],
      },
      {
        id: 'transfer-other',
        title: 'Jinak: obkreslení',
        body: 'Šablonu můžete vystřihnout i přesně po čáře, obkreslit ji na líc nebo řezat podél okraje papíru a značky pak propíchnout přes znovu přiloženou šablonu. Hlavní způsob výše je přesnější, protože se řeže přímo po vytištěné čáře a značky se propíchnou dřív, než se šablona hne.',
        media: [],
      },
      {
        id: 'draw-fold-lines',
        title: 'Narýsujte čáry ohybů na rub',
        animationLinks: [
          animationLink('stripTransfer', 'D3'),
          animationLink('stripTransfer', 'D2'),
        ],
        body: 'Pás otočte rubem nahoru. Propíchnuté konce čar ohybů jsou vidět i na rubu: každý ohyb (A i B) má dvě čáry a každá čára dva konce – u dolní a u horní hrany pásu (u ohybu A nahoře u oblouku výřezu na prst). Na rubu je spojte tužkou HB nebo 2B, lehce, podle ocelového pravítka – vzniknou 4 čáry, dvě ohraničují pásmo ohybu A a dvě pásmo ohybu B. Podle nich v lekci 7 navlhčíte jen pásma ohybů a přeložíte pás na správném místě. Na líc nic nekreslete. U kůže 1,2 mm tím je tahle část hotová; u kůže 1,5 mm jsou čáry ohybu B zároveň základem pásma ztenčení v dalším kroku.',
        media: [],
      },
      {
        id: 'mark-skive-band',
        title: 'Vyznačte pásmo ztenčení ohybu B',
        body: 'Jen u kůže 1,5 mm – u kůže tenčí než 1,3 mm (výchozí 1,2 mm) tenhle krok i ztenčení přeskočte. U kůže 1,5 mm: od obou čar ohybu B narýsovaných na rubu v předchozím kroku odsaďte dalších 3 mm ven – ztenčovat se bude celé pásmo ohybu B plus tento přesah na obou stranách (asi 16 mm celkem). Ohyb A se ztenčovat nebude.',
        media: [],
      },
      {
        id: 'skive-fold-b',
        title: 'Ztenčete ohyb B',
        body: 'Jen u kůže 1,5 mm (u výchozí 1,2 mm přeskočte): v odsazeném pásu ztenčete kůži z rubu na 1 mm bezpečnostním ztenčovačem, stejně jako v tréninkové lekci.',
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
        animationLinks: [animationLink('edges', 'F1')],
        body: 'Hrany, na které se po složení špatně dostanete (horní hrana vnitřního panelu, jeho volná svislá hrana – skončí uvnitř smyčky ohybu A, je vidět výřezem, ale nedosáhnete na ni –, oblouk výřezu na prst a jazyk), teď obarvěte (barva na hrany, u barvené kůže; naneste ji podle návodu na obalu a před leštěním ji nechte zaschnout – tak, jak jste si to vyzkoušeli na odřezku v lekci 4) a zaleštěte – v hotovém pouzdru už na ně nedosáhnete. Oblouk výřezu na prst je celý výkus ve tvaru U přes pásmo ohybu A: čtvrtkruh R34 na předním panelu, přechod přes ohyb A a čtvrtelipsa na zadním panelu. Pak zapečeťte rub vnitřního panelu (Tokonole nebo gum tragacanth) – zapečetěný rub je po složení vidět výřezem nad kartami. Spodní proužek 0–3,5 mm od hrany (pod čárou švu) nechte volný: ten se v lekci 7 lepí a na zapečetěném povrchu by lepidlo nedrželo. Proto ho nejdřív přelepte maskovací páskou, horní okraj pásky přesně na čáru švu 3,5 mm od hrany (podle propíchnutých teček dna). Pastu naneste na rub v tenké vrstvě a přetřete ji leštítkem nebo hladkou plochou – stejně jako na hraně se třením zhutní a uhladí (jak hustě a kolik vrstev, ověřit na odřezku). Na líc ji nedávejte: na líci zanechá lesklou skvrnu. Po zaschnutí pásku strhněte pomalu pod ostrým úhlem.',
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
        slug: 'marks-transferred',
        title:
          'Po sejmutí šablony jsou vidět všechny propíchnuté značky: konce čar ohybů A i B, rohy kapsy, střed dříku a tečky dna.',
        required: false,
      },
      {
        slug: 'fold-lines-drawn',
        title:
          'Na rubu jsou tužkou narýsované 4 čáry ohybů (dvě u ohybu A, dvě u ohybu B), spojené od propíchnutého konce ke konci.',
        required: false,
      },
      {
        slug: 'skive-transferred',
        title:
          'Jen u kůže 1,5 mm: ztenčené pásmo ohybu B je vidět z rubu, asi 1 mm silné, asi 16 mm široké (ohyb B plus 3 mm přesahu za každou čárou). U kůže 1,2 mm se ztenčení přeskakuje.',
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
      'Šablona přilepená na rub místo na líc: přední panel vyjde zrcadlově obráceně.',
      'Řez podél okraje papíru s nožem přitlačeným k papíru místo k pravítku: nůž uhne a hrana není rovná. Řežte po vytištěné čáře a rovné strany podle pravítka.',
      'Páska přes linii řezu: nůž jde přes pásku a řez uhne.',
      'Značky propíchnuté až po vyříznutí: rozřezaná šablona už na pás přesně nedosedne.',
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
      'list KAPSA ve 3 výtiscích (výchozí pro minci 50 Kč; u mince 40 mm vytiskněte variantu pro 40 mm): 1 na vrtání formy (odpadá, pokud máte formu z lekce 2), 1 na orýsování značek na líci, 1 na šablonu na rub s vyseknutým oknem (odpadá, pokud máte z lekce 2 šablonu s oknem toho průměru, kterým budete sekat okno kapsy; u okna Ø 18 mm je to list Kapsa – záložní okno Ø 18 mm)',
      'barva na hrany (u barvené kůže; vyzkoušená na odřezku v lekci 4)',
      'mince (výchozí 50 Kč), potravinová fólie',
      'nit asi 0,8 m na šev kapsy (23 otvorů; u mince 40 mm 31 otvorů)',
      'tužka HB nebo 2B na osy na rubu kůže',
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
    recommendedEquipment: [
      'corner-template',
      'sandpaper',
      'small-hole-punch',
      'masking-tape',
      'edge-paint',
      'edge-burnisher',
    ],
    prerequisiteLessons: [L5],
    steps: [
      {
        id: 'trace-and-punch-pocket',
        title: 'Orýsujte kapsu a prosekněte otvory švu z líce',
        body: 'Použijete dva výtisky listu KAPSA, stejně jako v lekci 2. 1. výtisk vystřihněte nahrubo s okrajem 1–2 cm, položte na LÍC kůže 1,2 mm a přilepte maskovací páskou na okrajích, mimo obrys, z několika stran (na líci nejdřív zkouška na odřezku). Šídlem propíchněte skrz tečky švu a 4 konce os – čtyři body, kde končí čerchované osy (vlevo, vpravo, nahoře, dole). Pásku strhněte pomalu pod ostrým úhlem, list sundejte a zkontrolujte, že se přenesly všechny značky. Na líci nic nekreslete – zůstanou na něm jen propíchnuté dírky: tečky švu a 4 konce os. Konce os leží vně obrysu kapsy a při řezu obrysu odpadnou; čára přes kapsu na líci by na hotové kapse zůstala vidět mezi oknem a obrysem. Vidličkami prosekněte otvory švu z líce podle propíchnutých teček – kapsa bude na předním panelu sedět lícem ven, proto se švové otvory prosekávají z líce; při opětovném prosekávání skrz obě vrstvy v pozdějším kroku musí vidličky vstupovat do stejné strany, aby si otvory lícovaly. Pak kůži otočte: propíchnuté konce os (i proseknuté otvory švu) jsou vidět na RUBU. Na rubu spojte protilehlé konce os podle pravítka a osy narýsujte tužkou HB nebo 2B, lehce (když tužka na kůži není vidět, lehce šídlem), až k okrajům kůže. Jako 2. výtisk poslouží šablona z lekce 2 – vystřižená přesně po obrysu kapsy, s oknem vyseknutým výsečníkem, kterým budete sekat okno kapsy (Ø 20 mm, nebo Ø 18 mm, když jste v lekci 2 přešli na menší okno; u mince 40 mm Ø 32 mm). Když ji nemáte, vytiskněte nový list ze stránky Listy střihu (odkaz pod krokem; pro okno Ø 18 mm list Kapsa – záložní okno Ø 18 mm), vystřihněte ho přesně po obrysu kapsy (plná čára se zaoblenými rohy) a ještě než ho položíte na kůži, vysekněte do něj okno: papír na desku na sekání, výsečník postavte přesně na vytištěnou kružnici okna, k vystředění pomůžou vytištěné osy. Šablonu položte na RUB, zarovnejte na osy a obrys obtáhněte šídlem nebo tužkou. Na rub, ne na líc: škrábnutí na líci třísločiněné kůže zůstane vidět. Potom tužkou HB nebo 2B, lehce, objeďte vnitřní hranu otvoru v papíru – na rubu vznikne celá kružnice okna přesně ve velikosti výsečníku; podle ní budete okno v pozdějším kroku vystřeďovat. Obrys se teď neřeže – kapsa se řeže až po vytvarování. Šablonu si schovejte: když se čára při tvarování rozmaže, obtáhnete obrys i kružnici okna podle ní znovu. Přes vytvarovaný důlek ale papír neleží úplně rovně, proto orýsujte všechno teď na rovné kůži a obtažení po tvarování berte jen jako pomoc. Všechno udělejte ještě před navlhčením.',
        printLink: 'pattern-sheets',
        animationLinks: [animationLink('kapsa', 'B1')],
        media: [],
      },
      {
        id: 'form-dimple',
        title: 'Vytvarujte důlek na formě',
        body: 'Kůži navlhčete, položte lícem dolů na formu a zarovnejte osy narýsované na rubu kůže s osami narýsovanými na desce, minci zabalenou ve fólii položte na rub nad otvor, přiklopte deskou a dvěma svěrkami proti sobě rovnoměrně stáhněte, aby se víko nenaklonilo. Nechte zaschnout, jistější je přes noc.',
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
        body: 'Obrys i okno se dělají na formě. Zaschlou kapsu položte lícem dolů zpátky na formu: důlek do otvoru, osy na rubu kůže na osy desky. Důlek visí v otvoru volně, nic ho nemačká. Obrys vede asi 5 mm vně důlku, nad dřevem, takže nůž řeže na desce, ne nad důlkem. Vyřízněte ho podle orýsování na rubu 2–3 lehkými tahy a kůži přitom přidržujte na rovné části; je-li čára po tvarování rozmazaná, nejdřív obrys i kružnici okna obtáhněte znovu podle 2. výtisku s oknem. Desku můžete chránit kouskem kartonu s otvorem Ø 32 mm (u mince 40 mm Ø 44 mm) položeným na formu. Pak na formě vysekněte okno: pod důlek podložte špalík užší než otvor formy (pod 31,5 mm, u mince 40 mm pod 44 mm) a zároveň širší než okno (přes 20 mm, u mince 40 mm přes 32 mm), s rovným koncem (tip na špalík je v lekci 2) – má se dotýkat jen dna důlku zespodu, ne ho nadzvedávat. Výsečník vystřeďte podle kružnice okna narýsované na rubu v prvním kroku – má přesně jeho velikost, břit postavte na čáru dokola. Rozhoduje ale prstenec: před úderem zkontrolujte, že prstenec kůže kolem důlku je po celém obvodu stejně široký (kružnice je jen vodítko), a teprve pak Ø 20 mm (u mince 40 mm Ø 32 mm) okno vysekněte. Prstenec 3,75 mm je úzký: okno Ø 20 mm sekejte jen tehdy, když vám zkouška držení mince na odřezku v lekci 2 vyšla (jinak menší výsečník, se kterým zkouška vyšla). Než kapsu přišijete, vložte do ní minci a zkuste, že oknem nepropadne.',
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
        body: 'Hrany kapsy (oblouk okna i vnější obrys) teď obarvěte (barva na hrany, u barvené kůže; naneste ji podle návodu na obalu a před leštěním ji nechte zaschnout – tak, jak jste si to vyzkoušeli na odřezku v lekci 4) a zaleštěte, stejně jako v lekci 5 – po přišití na přední panel už na vnější obrys nedosáhnete a na okno jen omezeně.',
        media: [],
      },
      {
        id: 'glue-pocket',
        title: 'Nalepte kapsu na přední panel',
        animationLinks: [animationLink('pocketAttach', 'B1'), animationLink('pocketAttach', 'B2')],
        body: 'Kapsu nejdřív nasucho přiložte na 4 značky rohů místa pro kapsu, propíchnuté na předním panelu v lekci 5, a podívejte se, kam přesně sedne. Na předním panelu smirkem lehce zdrsněte jen plochu pod okrajem kapsy (tam, kam přijde lepidlo), zbytek líc nechte hladký. Kontaktní lepidlo naneste jen do úzkého pruhu při okraji kapsy (do šířky švového okraje, ne přes celou plochu) na rub kapsy a na odpovídající zdrsněné místo na předním panelu – 41,8 mm pod horní hranou, 14,75 mm od obou boků (u mince 40 mm 35,55 mm pod horní hranou, 8,5 mm od obou boků) – ať se nerozteče na viditelný líc kolem kapsy. Horní hranu kapsy, kterou se bude zasouvat mince, nelepte. Po odvětrání lepidla kapsu přitiskněte přesně na 4 značky – kontaktní lepidlo po dotyku už nejde posunout.',
        media: [],
      },
      {
        id: 'stitch-pocket',
        title: 'Prosekněte a přišijte kapsu',
        body: 'Kapsa má otvory švu prosekané už v prvním kroku z líce, ještě před tvarováním. Naplocho na děrovací desce teď vidličkami projeďte znovu přes tytéž otvory ze stejné strany (z líce kapsy), tentokrát skrz obě vrstvy najednou – kapsu i přední panel pod ní; jen tak si otvory po prosekání lícují. Pak kapsu sedlářským stehem přišijte, na začátku i na konci dva zpětné stehy; horní hrana zůstává volná.',
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
        body: 'Pokud návod druku vyžaduje otvor, vysekněte ho výsečníkem, který vám na odřezku v lekci 3 sedl na dřík (začínali jste nejmenším, 2 mm), v předním panelu na značku propíchnutou v lekci 5 (9,5 mm pod horní hranou na ose jazyka).',
        animationLinks: [animationLink('snap', 'B2')],
        media: [],
      },
      {
        id: 'set-snap-post',
        title: 'Osaďte dřík druku',
        body: 'Dřík s hlavičkou osaďte naplocho na značku v předním panelu aplikátorem z balení a paličkou na tvrdé podložce, stejně jako na odřezku v lekci 3 – ještě před složením pásu, v hotovém pouzdru už na něj nedosáhnete. Dřík jde z rubu předního panelu, hlavička zůstane na jeho líci (vybavení Druk).',
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
      'Osy nebo jiné čáry nakreslené na líci kapsy – zůstanou vidět mezi oknem a obrysem. Na líci jsou jen propíchnuté dírky, osy se kreslí tužkou na rubu.',
      'Obrys kapsy obtažený šídlem na líci místo na rubu: škrábnutí na líci třísločiněné kůže zůstane vidět.',
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
      'potravinová fólie',
      'houbička a voda na navlhčení ohybů',
      'kostěná rozhrnovačka (bone folder) nebo hrana pravítka',
      'sponky s podložkou na sepnutí ohybů při schnutí',
      'nit asi 0,8 m na šev dna – podle návodu „Jak odměřit nit“ vyjde šev 64 mm přes tři vrstvy (5 × délka švu + 25–30 cm rezervy) asi na 0,6 m; 0,8 m nechává začátečníkovi rezervu nad tento výpočet. Na odřezku se délka nitě pro dno ověřit nedá – šev odřezku v lekci 4 má jen asi 20 mm, proto raději s rezervou',
    ],
    requiredEquipment: ['contact-cement', 'sandpaper', 'harness-needles', 'waxed-thread'],
    recommendedEquipment: ['steel-ruler'],
    prerequisiteLessons: [L6],
    steps: [
      {
        id: 'wet-fold-zones',
        title: 'Navlhčete pásma obou ohybů',
        body: 'Navlhčete houbičkou pásma obou ohybů – na rubu je ohraničují čáry narýsované tužkou v lekci 5 (dvě u ohybu A, dvě u ohybu B) –, ne celou plochu pásu.',
        animationLinks: [animationLink('pouchFold', 'B1')],
        media: [],
      },
      {
        id: 'fold-inner-b',
        title: 'Přeložte vnitřní panel ohybem B',
        body: 'Karty zabalené v potravinové fólii položte na rub předního panelu (tam, kde po přeložení sedne vnitřní panel) a přeložte přes ně vnitřní panel ohybem B.',
        animationLinks: [animationLink('pouchFold', 'B2')],
        media: [],
      },
      {
        id: 'fold-back-a',
        title: 'Přeložte zadní panel ohybem A',
        body: 'Bankovky zabalené v potravinové fólii položte na líc vnitřního panelu – vrstvy odpředu jsou přední – karty – vnitřní – bankovky – zadní. Pak přeložte zadní panel ohybem A přes všechno, kolem skutečného obsahu, ne naprázdno.',
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
        body: 'Přejeďte rozhrnovačkou. Sponky s podložkou nasaďte na panely těsně vedle obou ohybů, přes obsah, ne na samotnou smyčku ohybu. Než necháte zaschnout, zkontrolujte, že se otvory dna na sousedních panelech po složení lícují (stejně jako v lekci 4). Když nelícují, dokud je kůže ještě vlhká, sponky sundejte, ohyb rozevřete a přeložte znovu se smyčkou posunutou tak, aby otvory seděly (ohyby přitom držte mezi čarami z lekce 5), a zkontrolujte znovu. Malý zbylý posun srovnáte při lepení dna jehlami přes otvory (další krok). Co dělat, když se otvory nesrovnají ani tak, aplikace zatím neříká – nelepte naslepo, ověřit na odřezku z lekce 4. Nechte zaschnout. Nasucho nebo na ostro přeložený líc v tomto kroku nejspíš praská.',
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
        body: 'Vyjměte zabalené karty i bankovky. Zaschlé ohyby rozevřete jen tolik, aby šel spodní proužek natřít – zhruba do pravého úhlu, ne úplně naplocho (suchý neztenčený ohyb A by mohl na líci prasknout). Spoje jsou dva – přední panel s vnitřním a vnitřní panel se zadním; přední a zadní panel se přímo nedotýkají, mezi nimi je pořád vnitřní panel – a lepí se po jednom, ne najednou: nejdřív spoj přední↔vnitřní, pak vnitřní↔zadní. V pruhu 0–3,5 mm od hrany (pod čárou švu; karty i bankovky stojí na švu, lepidlo výš by jim ubralo hloubku) zdrsněte smirkem obě plochy spoje přední↔vnitřní – rub předního a rub vnitřního panelu –, naneste lepidlo v tenké rovnoměrné vrstvě, nechte odvětrat podle návodu na obalu, přeložte, zarovnejte jehlami přes otvory a přitiskněte – kontaktní lepidlo po dotyku už nejde posunout. Teprve pak stejně zopakujte spoj vnitřní↔zadní – tady se lepí líc vnitřního a rub zadního panelu.',
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
        body: 'Prošijte dno sedlářským stehem skrz všechny tři vrstvy (17 otvorů na panel, rozteč 4 mm, 3,5 mm od hrany). Na začátku i na konci ušijte dva zpětné stehy. Pak zkontrolujte rub švu (stranu zadního panelu). Rub je u sedlářského stehu vždy trochu méně pravidelný než líc, to je normální. Stehy na rubu ale musí být stejně utažené, v jedné řadě a bez smyček. Otvory na rubu mají být stejně rovné jako na líci; když nejsou, vidličky nebyly při děrování kolmo (lekce 3 pouzdra na karty).',
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
      'barva na hrany (barvená kůže má světlý řez; vyzkoušená na odřezku v lekci 4)',
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
        body: 'Přeložený jazyk přitiskněte přes hlavičku na předním panelu, aby se na rubu jazyka obtiskla. Střed obtisku je střed kloboučku – podle něj se klobouček osazuje. Kružnice kloboučku na šabloně PÁS je jen orientační a na kůži se nepřenáší; že obtisk vyjde jinde, je v pořádku: pás je nastřižený na nejhorší případ, ve skutečnosti druk okraj stáhne, takže jazyk vyjde delší, než ukazoval papírový model. Obtisk je na rubu jazyka, klobouček ale jde na líc: doporučujeme propíchnout střed obtisku šídlem skrz jazyk, aby byl střed vidět i na líci – ověřit na odřezku.',
        animationLinks: [animationLink('snap', 'C2')],
        media: [],
      },
      {
        id: 'punch-cap-hole',
        title: 'Otvor pro klobouček (pokud ho návod vyžaduje)',
        body: 'Pokud návod druku vyžaduje otvor pro klobouček, proražte ho výsečníkem, který vám v lekci 3 na odřezku sedl na trn kloboučku, přesně v obtisknutém místě na jazyku.',
        animationLinks: [animationLink('snap', 'C3')],
        media: [],
      },
      {
        id: 'set-cap',
        title: 'Osaďte klobouček',
        body: 'Klobouček se zdířkou osaďte přesně na obtisknuté místo aplikátorem z balení a paličkou, ne podle orientační kružnice ze šablony PÁS. Klobouček (Ø 12 mm u Prym Anorak 12 mm) jde na líc jazyka (ven, viditelný po zapnutí), zdířka na rub jazyka pod ním, obrácená k přednímu panelu – pořadí dílů podle návodu na obalu, stejně jako na odřezku v lekci 3.',
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
        body: 'Ocelovým pravítkem odměřte na líci jazyka 11 mm od středu kloboučku a jazyk tam zkraťte. Rohy znovu zaoblete na R10 – rohovou šablonou (lob 20), nebo obtažením mince či víčka stejné velikosti.',
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
        body: 'Dno přebruste smirkem 220–400 na rovné destičce do jedné roviny přes všechny tři vrstvy. Pak hrany dna srazte z obou vnějších líců (přední i zadní panel): zaoblete je brusným papírem na hranolku, ořezávačem hran jen pokud ho máte (nákupní sestava pouzdra ho nemá).',
        media: [],
      },
      {
        id: 'dye-and-burnish-edges',
        title: 'Obarvěte a zaleštěte vnější hrany',
        animationLinks: [animationLink('edges', 'F3'), animationLink('edges', 'C1')],
        body: 'U barvené kůže je řez světlý – obarvěte ho barvou na hrany; naneste ji podle návodu na obalu a před leštěním ji nechte zaschnout – tak, jak jste si to vyzkoušeli na odřezku v lekci 4. Všechny vnější hrany – včetně nového konce jazyka po zkrácení a zaoblení rohů na R10 – pak zaleštěte jako u pouzdra na karty.',
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
          'Druk drží a jde znovu rozepnout (stejně jako na odřezku v lekci 3); jazyk po zkrácení končí asi 21 mm nad horní hranou kapsy (u mince 40 mm asi 15 mm), nezasahuje do ní.',
        required: true,
      },
      {
        slug: 'edges-finished',
        title:
          'Vnější hrany včetně zkráceného konce jazyka jsou srovnané, obarvené (u barvené kůže) a zaleštěné.',
        required: true,
      },
      {
        slug: 'photo-taken',
        title: 'Hotové pouzdro je vyfocené.',
        required: false,
      },
    ],
    commonMistakes: [
      'Klobouček osazený podle orientační kružnice ze šablony PÁS bez ohledu na obtisk: druk nedosedne a jazyk je nakřivo.',
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

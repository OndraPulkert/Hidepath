import { animationLink } from '@/content/animations';
import {
  type LessonDefinition,
  type PhaseDefinition,
  type ProjectDefinition,
} from '@/content/schema';

/**
 * Projekt 01 – Pouzdro na karty. Obsah je NÁVRH (draft); odborné údaje (rozteč 3,85–4 mm,
 * nit 0,6 mm, kůže 1,2–1,5 mm, steh 3,5 mm od hrany) projdou korekturou před publikací.
 * Osnova lekcí: docs/milestones/02-plan.md, média: docs/decisions/001-media-v-lekcich.md.
 */

export const PROJECT_SLUG = 'card-holder';

export const phases: readonly PhaseDefinition[] = [
  { slug: 'choose-project', code: '01', name: 'Výběr projektu', kind: 'enrollment' },
  { slug: 'equipment', code: '02', name: 'Vybavení', kind: 'equipment' },
  { slug: 'workspace', code: '03', name: 'Příprava místa', kind: 'lessons' },
  { slug: 'practice', code: '04', name: 'Trénink na odřezku', kind: 'lessons' },
  { slug: 'build', code: '05', name: 'Výroba pouzdra', kind: 'lessons' },
  { slug: 'review', code: '06', name: 'Hodnocení', kind: 'completion' },
];

const draft = <T extends Omit<LessonDefinition, 'reviewStatus'>>(l: T): LessonDefinition => ({
  ...l,
  reviewStatus: 'draft',
});

const L1 = '01-prepare-workspace';
const L2 = '02-straight-cut';
const L3 = '03-stitching-chisels';
const L4 = '04-saddle-stitch';
const L5 = '05-transfer-and-cut';
const L6 = '06-assemble-card-holder';

export const lessons: readonly LessonDefinition[] = [
  draft({
    slug: L1,
    title: 'Příprava pracovního místa a seznámení s nástroji',
    order: 1,
    phaseSlug: 'workspace',
    estimatedMinutes: 20,
    goal: 'Připravit stůl, na kterém se dá bezpečně řezat a děrovat, a vyzkoušet si každý nástroj.',
    materials: [
      'odřezek kůže: roh druhé tréninkové A5 (první A5 nechte celou na lekci 2)',
      'složený ručník pod desku',
      'dobré světlo',
    ],
    requiredEquipment: ['cutting-mat', 'punching-board'],
    recommendedEquipment: ['stitching-chisels', 'harness-needles', 'waxed-thread', 'mallet'],
    prerequisiteLessons: [],
    steps: [
      {
        id: 'clear-table',
        title: 'Uvolněte stůl a položte podložky',
        body: 'Uvolněte plochu aspoň 60 × 40 cm. Vlevo položte řezací podložku, vpravo tvrdou desku pod děrování na složeném ručníku. Stůl nesmí pružit (kuchyňský stůl je lepší než stolek na kolečkách).',
        media: [
          {
            id: 'l1-table-layout',
            kind: 'photo',
            caption:
              'Stůl shora: vlevo řezací podložka s pravítkem a nožem, vpravo HDPE deska na ručníku s vidličkami a paličkou',
            status: 'planned',
          },
        ],
      },
      {
        id: 'light-and-chair',
        title: 'Nastavte světlo a sezení',
        body: 'Světlo mějte zepředu nebo zleva, ne za zády, aby ruka nestínila řez. Seďte tak, abyste při řezu tlačili shora, ne z boku.',
        media: [],
      },
      {
        id: 'check-chisels',
        title: 'Zkontrolujte vidličky (pokud už je máte)',
        body: 'Kroky 3 až 5 udělejte, až budete mít vidličky, jehly a nit doma; do té doby pokračujte lekcí 2. Přiložte vidličky hroty na odřezek a přitiskněte rukou, bez paličky. Pravítkem změřte vzdálenost první a poslední značky a vydělte ji počtem mezer mezi značkami: musí vyjít 3,85–4 mm.',
        records: [
          {
            kind: 'number',
            id: 'chisel-spacing',
            label: 'Rozteč vidliček',
            hint: 'Vzdálenost první a poslední značky vydělená počtem mezer.',
            unit: 'mm',
            decimals: 2,
            target: { min: 3.85, max: 4, label: 'cíl 3,85–4 mm' },
          },
        ],
        media: [
          {
            id: 'l1-chisel-marks',
            kind: 'photo',
            caption:
              'Detail odřezku s řadou drobných značek po přitisknutí vidliček, vedle pravítko s milimetry',
            status: 'planned',
          },
        ],
      },
      {
        id: 'thread-needles',
        title: 'Navlékněte nit do obou jehel',
        animationLinks: [animationLink('saddleStitch', 'A1')],
        body: 'Ustřihněte asi 60 cm nitě. Konec zploštěte mezi prsty a protáhněte očkem jehly. Jehlou propíchněte nit asi 3 cm od konce a smyčku přetáhněte přes jehlu, aby nit nevyklouzla. Totéž udělejte s druhou jehlou na druhém konci.',
        media: [
          {
            id: 'l1-thread-needle',
            kind: 'video',
            caption:
              'Zblízka: navlečení voskované nitě do sedlářské jehly a zajištění propíchnutím nitě',
            status: 'planned',
          },
        ],
      },
      {
        id: 'first-strike',
        title: 'Zkuste jeden úder',
        body: 'Odřezek položte lícem nahoru na tvrdou desku, vidličky postavte kolmo, držte je u spodku a jednou pevně udeřte paličkou. Hroty musí projít skrz. Jde jen o to vyzkoušet, kolik síly je potřeba.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'table-ready',
        title: 'Stůl nepruží, mám na něm řezací podložku i tvrdou desku pod děrování.',
        required: true,
      },
      {
        slug: 'chisels-checked',
        description: 'Až budete mít vidličky doma.',
        title: 'Vidličky zanechaly na odřezku rovnou řadu značek ve stejné vzdálenosti.',
        required: false,
      },
      {
        slug: 'needles-threaded',
        description: 'Až budete mít jehly a nit doma.',
        title: 'Mám nit navlečenou v obou jehlách a drží, když za ni lehce zatáhnu.',
        required: false,
      },
      {
        slug: 'first-strike-done',
        title: 'Jedním úderem prošly hroty skrz odřezek.',
        required: false,
      },
    ],
    commonMistakes: [
      'Děrování na řezací podložce místo tvrdé desky: podložka se zničí a hroty neprojdou čistě.',
      'Stůl u okna se světlem za zády: ruka stíní řez.',
    ],
    safety: [
      'Nůž nechte zavřený, řezat budete až v lekci 2.',
      'Hroty vidliček jsou ostré. Odkládejte je hroty od sebe, ne přes okraj stolu.',
      'Při úderu držte vidličky u spodku, prsty mimo dráhu paličky.',
    ],
    media: [
      {
        id: 'l1-hero',
        kind: 'photo',
        caption:
          'Připravený pracovní stůl s rozloženým vybavením pro pouzdro na karty, přirozené světlo zleva',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L2,
    title: 'Rovný řez kůže',
    order: 2,
    phaseSlug: 'practice',
    estimatedMinutes: 40,
    goal: 'Uříznout rovný proužek 20 mm široký s kolmou hranou na dva až tři lehké tahy a vyzkoušet řez podle přilepené šablony.',
    materials: [
      'první tréninková A5: podél delší strany z ní odřízněte pás 70 mm na proužky (řežte jako v krocích 1–3), zbylý pás asi 210 × 80 mm nechte celý na cvičnou šablonu',
      'nová čepel v noži',
      'nůžky',
    ],
    prints: [
      {
        source: 'practice-sheets',
        sheetId: 'cvicna-sablona',
        copies: 1,
        purpose:
          'Tři cvičné tvary na řez podle přilepené šablony (krok 5). Tiskněte bez přizpůsobení velikosti (100 %), kontrolní úsečka musí měřit 50 mm.',
        paper: 'A4',
      },
    ],
    requiredEquipment: ['utility-knife', 'steel-ruler', 'cutting-mat'],
    recommendedEquipment: ['scratch-awl', 'masking-tape'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'mark-line',
        title: 'Narýsujte linii',
        body: 'Na rub pásu 70 mm odměřte na obou koncích 20 mm od rovné hrany a značky spojte podél pravítka. Rýsujte lehce šídlem, tupou jehlou nebo tužkou.',
        media: [],
      },
      {
        id: 'place-ruler',
        title: 'Přiložte pravítko',
        body: 'Hranu pravítka položte přesně na linii, pravítkem zakryjte díl, který chcete zachovat. Když nůž ujede, poškodí jen odpad. Pravítko přitlačte roztaženými prsty, daleko od hrany.',
        media: [
          {
            id: 'l2-ruler-hand',
            kind: 'photo',
            caption:
              'Ruka přitlačuje ocelové pravítko roztaženými prsty, hrana pravítka na narýsované linii, druhá ruka drží nůž',
            status: 'planned',
          },
        ],
      },
      {
        id: 'cut',
        title: 'Řežte na dva až tři tahy',
        body: 'Čepel opřete o hranu pravítka. Nůž sklopte asi na 45° ve směru tahu, do strany ho nenaklánějte. První tah veďte lehce, jen prořízne líc. Druhým, případně třetím tahem dořízněte. Řežte od volné ruky, nikdy k prstům na pravítku.',
        media: [
          {
            id: 'l2-cut-video',
            kind: 'video',
            caption:
              'Ruka vede odlamovací nůž podél ocelového pravítka na kůži, dva tahy, čepel kolmo k podložce',
            status: 'planned',
            durationSeconds: 60,
          },
          {
            id: 'l2-blade-angle',
            kind: 'illustration',
            caption: 'Schéma úhlu čepele: 45° ve směru řezu, 90° k podložce',
            status: 'available',
            illustration: 'blade-angle',
          },
        ],
      },
      {
        id: 'check-edge',
        title: 'Zkontrolujte hranu',
        body: 'Postavte proužek na hranu. Řez má být kolmý, ne zkosený, a bez schodu mezi tahy. Uřízněte tak tři proužky.',
        media: [
          {
            id: 'l2-good-bad-edge',
            kind: 'photo',
            caption:
              'Dva proužky vedle sebe na hraně: vlevo kolmý čistý řez, vpravo zkosený řez se schodem',
            status: 'planned',
          },
        ],
      },
      {
        id: 'practice-template',
        title: 'Vyzkoušejte řez podle přilepené šablony',
        body: 'Takhle budete v lekci 5 řezat díly pouzdra. Cvičnou šablonu vytiskněte na A4 bez přizpůsobení velikosti (100 %) a změřte kontrolní úsečku: musí mít přesně 50 mm. Tři tvary vystřihněte nůžkami po čárkované čáře (okraj asi 1,5 cm). Tvary dělejte jeden po druhém na pásu 80 mm, vedle sebe podél delší strany, 5 mm od kraje a 10 mm od sebe. Tvar položte na rub pásu a přilepte maskovací páskou z několika stran, jen na okrajích mimo plnou čáru. U tvaru 3 propíchněte šídlem obě tečky skrz papír do kůže; po sejmutí šablony musí být na rubu vidět. Pak řežte skrz papír i kůži po plné čáře na dva až tři lehké tahy: rovné strany podle ocelového pravítka položeného na čáru, roh a výřez pomalu bez pravítka. Pásku strhávejte pomalu, skoro rovnoběžně s kůží. Nakonec nalepte kousek pásky na líc odřezku, strhněte ho a zkontrolujte, že nenechal lesklou stopu.',
        records: [
          {
            kind: 'number',
            id: 'practice-sheet-calibration',
            label: 'Kontrolní úsečka na cvičné šabloně',
            unit: 'mm',
            decimals: 1,
            target: { min: 50, max: 50, label: 'cíl přesně 50 mm' },
          },
          {
            kind: 'choice',
            id: 'tape-mark',
            label: 'Páska na líci odřezku',
            hint: 'Když nechala stopu, sežeňte před lekcí 5 jinou, s nižší lepivostí.',
            options: [
              { value: 'clean', label: 'Bez stopy' },
              { value: 'mark', label: 'Nechala stopu' },
            ],
          },
        ],
        media: [],
        printLink: 'practice-sheets',
      },
    ],
    checkpoints: [
      {
        slug: 'strip-cut',
        title: 'Proužek 20 mm široký je uříznutý na dva až tři lehké tahy.',
        required: true,
      },
      {
        slug: 'edge-square',
        title: 'Hrana řezu je kolmá, ne zkosená, bez schodu.',
        required: true,
      },
      {
        slug: 'three-strips',
        title: 'Mám tři proužky a poslední je lepší než první.',
        required: false,
      },
      // Nepovinný jako `marks-transferred` v lekci 5: povinný bod by změnil stav už dokončených lekcí.
      {
        slug: 'practice-template-cut',
        title:
          'Hrana cvičných tvarů vede po vytištěné čáře, tečky jsou propíchnuté a páska nenechala na líci stopu.',
        description:
          'Když páska na líci nechala stopu, sežeňte před lekcí 5 jinou, s nižší lepivostí.',
        required: false,
      },
    ],
    commonMistakes: [
      'Jeden silový tah: čepel se ohne a uteče od pravítka.',
      'Nůž nakloněný do strany: hrana je zkosená a díly pak nelícují.',
      'Pravítko na straně odpadu: když nůž ujede, poškodí díl.',
      'Páska přes čáru řezu: nůž jde přes pásku a řez uhne.',
    ],
    safety: [
      'Prsty volné ruky mějte vždy mimo dráhu čepele. Nikdy nedržte kůži před čepelí.',
      'Otupenou čepel hned odlomte. Tupý nůž potřebuje sílu a klouže.',
      'Nůž po každém řezu zasuňte nebo odložte čepelí od sebe.',
    ],
    media: [
      {
        id: 'l2-hero',
        kind: 'photo',
        caption: 'Ruka vede odlamovací nůž podél ocelového pravítka na kůži',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L3,
    title: 'Děrování vidličkami',
    order: 3,
    phaseSlug: 'practice',
    estimatedMinutes: 20,
    goal: 'Vyrazit rovnou řadu otvorů s roztečí 3,85–4 mm, 3,5 mm od hrany, bez vynechání a zdvojení.',
    materials: ['proužek z lekce 2 nebo jiný odřezek', 'složený ručník pod tvrdou desku'],
    requiredEquipment: ['stitching-chisels', 'mallet', 'punching-board', 'steel-ruler'],
    recommendedEquipment: ['wing-divider', 'scratch-awl'],
    prerequisiteLessons: [L2],
    steps: [
      {
        id: 'mark-stitch-line',
        title: 'Narýsujte linii stehu',
        body: 'Na líc proužku narýsujte lehkou linii 3,5 mm od hrany, podle ní pak přiložíte vidličky. S kružítkem: nastavte 3,5 mm podle pravítka a jeden hrot veďte po hraně. Bez kružítka odměřte 3,5 mm od hrany na obou koncích proužku a značky spojte podél pravítka tupou jehlou.',
        media: [
          {
            id: 'l3-stitch-offset',
            kind: 'illustration',
            caption: 'Schéma: hrana kůže, linie stehu 3,5 mm od hrany, otvory v rozteči 3,85–4 mm',
            status: 'available',
            illustration: 'stitch-offset',
          },
        ],
      },
      {
        id: 'first-punch',
        title: 'Prorazte první otvory',
        body: 'Na linii si označte začátek a konec řady, 3,5 mm od obou konců proužku. Kůži položte lícem nahoru na tvrdou desku. Vidličky se 4 nebo 6 hroty postavte první hrot na značku začátku, ostatní na linii, kolmo ve všech směrech, a držte je pevně u spodku. Jednou pevně udeřte paličkou. Když všechny hroty neprošly, udeřte ještě jednou, bez pohnutí vidliček.',
        media: [
          {
            id: 'l3-punch-video',
            kind: 'video',
            caption:
              'Vidličky kolmo na linii, ruka drží u spodku, palička udeří jednou; pohled z boku, aby byl vidět úhel',
            status: 'planned',
            durationSeconds: 45,
          },
        ],
      },
      {
        id: 'continue-row',
        title: 'Navazujte řadu',
        body: 'Vidličky posuňte tak, aby první hrot zapadl do posledního hotového otvoru. Tak zůstane rozteč stejná a řada rovná. Zkontrolujte kolmost a udeřte.',
        media: [
          {
            id: 'l3-overlap',
            kind: 'photo',
            caption:
              'Detail: první hrot vidliček zasunutý do posledního proraženého otvoru, ostatní hroty na linii',
            status: 'planned',
          },
        ],
      },
      {
        id: 'corners',
        title: 'Dokončete řadu dvojhrotem',
        body: 'U konce proužku dokončete řadu vidličkami se 2 hroty, aby poslední otvor vyšel přesně na značku konce. Dvojhrot použijete i v lekci 6 na koncích řady a v zaoblených rozích.',
        media: [],
      },
      {
        id: 'inspect',
        title: 'Prohlédněte rub',
        body: 'Otočte proužek. Otvory na rubu mají být stejně rovné jako na líci. Šikmé otvory znamenají, že vidličky nebyly kolmo.',
        media: [
          {
            id: 'l3-good-bad-row',
            kind: 'photo',
            caption:
              'Dva proužky: rovná řada otvorů se stálou roztečí vs. řada s vlnou a zdvojeným otvorem',
            status: 'planned',
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'row-straight',
        title: 'Řada otvorů je rovná a leží 3,5 mm od hrany.',
        required: true,
      },
      { slug: 'no-doubles', title: 'V řadě není vynechaný ani zdvojený otvor.', required: true },
      {
        slug: 'back-clean',
        title: 'Na rubu jsou otvory stejně rovné jako na líci.',
        required: true,
      },
    ],
    commonMistakes: [
      'Vidličky nakloněné: otvory na rubu utíkají a steh pak vypadá vlnitě.',
      'Mnoho lehkých úderů místo jednoho pevného: hroty se v kůži pootočí.',
      'První hrot mimo poslední otvor: rozteč se rozjede a steh má skok.',
    ],
    safety: [
      'Vidličky držte u spodku, palička dopadá na horní konec. Nikdy je nedržte za horní konec.',
      'Děrujte jen na tvrdé desce, ne na řezací podložce ani holém stole.',
    ],
    media: [
      {
        id: 'l3-hero',
        kind: 'photo',
        caption: 'Děrovací vidličky přiložené na linii stehu na odřezku, palička ve výchozí poloze',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L4,
    title: 'Lepení, děrování dvou vrstev a sedlářský steh',
    order: 4,
    phaseSlug: 'practice',
    estimatedMinutes: 45,
    goal: 'Slepit dva odřezky, proděrovat je najednou a sešít sedlářským stehem, který je na obou stranách rovný.',
    materials: [
      'ze druhé tréninkové A5: 3 odřezky asi 40 × 80 mm (jeden na zkoušku zdrsnění)',
      'nit asi 60 cm',
      'lepidlo nebo oboustranná páska',
    ],
    requiredEquipment: [
      'stitching-chisels',
      'mallet',
      'punching-board',
      'harness-needles',
      'waxed-thread',
      'steel-ruler',
    ],
    recommendedEquipment: ['contact-cement', 'wing-divider', 'scratch-awl', 'sandpaper'],
    prerequisiteLessons: [L3],
    requires: [
      {
        id: 'practice-strip',
        fromLesson: L2,
        label: 'Proužek z lekce 2',
        note: 'Na zkoušku zdrsnění v kroku 1.',
      },
    ],
    steps: [
      {
        id: 'glue',
        title: 'Slepte díly podél hrany',
        body: 'Slepte odřezky jako na pouzdru: rub horního na líc spodního, jen podél jedné delší hrany. Na líci spodního odřezku tento pás nejdřív zdrsněte smirkem 180, z hladkého líce lepidlo pouští. Stěrkou naneste na obě plochy tenký pás lepidla asi 5 mm široký. Nechte ho odvětrat podle návodu a hrany přitiskněte přesně na sebe. S oboustrannou páskou: nalepte pás na rub horního odřezku, sejměte krycí fólii a přitiskněte; zdrsňovat pak nemusíte. Lepidlo drží díly jen pomocně. Rozdíl vyzkoušejte na třetím odřezku: zdrsněte jen polovinu pásu, přilepte na něj proužek z lekce 2 a po zaschnutí ho zkuste na obou polovinách odtrhnout.',
        waits: [
          {
            id: 'glue-open',
            label: 'Odvětrání lepidla (s páskou nečekáte)',
            minutes: 10,
            maxMinutes: 15,
            basis: 'manufacturer',
          },
        ],
        records: [
          {
            kind: 'choice',
            id: 'roughened-grip',
            label: 'Zdrsněná polovina pásu drží',
            hint: 'Zkouška na třetím odřezku po zaschnutí. S oboustrannou páskou vynechte.',
            options: [
              { value: 'better', label: 'Lépe' },
              { value: 'same', label: 'Stejně' },
              { value: 'worse', label: 'Hůř' },
            ],
          },
        ],
        media: [
          {
            id: 'l4-glue-strip',
            kind: 'photo',
            caption:
              'Rub odřezku s tenkým pásem lepidla podél hrany, druhý odřezek připravený vedle',
            status: 'planned',
          },
        ],
      },
      {
        id: 'punch-two-layers',
        title: 'Proděrujte obě vrstvy najednou',
        body: 'Na líc horního odřezku narýsujte podél slepené hrany linii stehu 3,5 mm od hrany. Děrujte z líce jako v lekci 3, jen pevnějším úderem. Pak pečlivě zkontrolujte rub.',
        media: [],
      },
      {
        id: 'hold-work',
        title: 'Uchyťte si díl',
        animationLinks: [animationLink('saddleStitch', 'B1')],
        body: 'Šijete dvěma jehlami, takže díl musí držet sám. Nejjednodušší je sevřít ho mezi kolena, linií otvorů nahoru. Pohodlnější je sevřít ho mezi dvě dřevěné destičky a upnout truhlářskou svěrkou ke stolu. Sedlářský koník (ve vybavení v části „Kup později“) na pouzdro nepotřebujete. Díl se mezi stehy nesmí posouvat, jinak nebudou stehy stejně utažené.',
        media: [
          {
            id: 'l4-hold-work',
            kind: 'photo',
            caption:
              'Odřezek sevřený mezi koleny s linií otvorů nahoru a vedle varianta se dvěma destičkami ve svěrce',
            status: 'planned',
          },
        ],
      },
      {
        id: 'start-stitch',
        title: 'Začněte steh',
        body: 'Jehlu protáhněte prvním otvorem tak, aby na obou stranách zůstala stejná délka nitě. Máte jednu jehlu vpředu a jednu vzadu. Na odřezku začněte bez zpětných stehů; na pouzdře v lekci 6 je přidáte i na začátek.',
        animationLinks: [animationLink('saddleStitch', 'C1'), animationLink('threadLength')],
        media: [
          {
            id: 'l4-saddle-stitch',
            kind: 'illustration',
            caption:
              'Schéma sedlářského stehu: dvě jehly procházejí každým otvorem proti sobě, pořadí a směr',
            status: 'available',
            illustration: 'saddle-stitch',
          },
        ],
      },
      {
        id: 'stitch-rhythm',
        title: 'Šijte stále stejně',
        animationLinks: [animationLink('saddleStitch', 'D1')],
        body: 'Přední jehlu prostrčte dalším otvorem dozadu a nit protáhněte. Zadní jehlu prostrčte stejným otvorem dopředu, nad nití, která už v otvoru je, ne pod ní. Obě nitě utáhněte stejnou silou. Dodržujte vždy stejné pořadí, jinak nebudou stehy stejně skloněné.',
        media: [
          {
            id: 'l4-stitch-video',
            kind: 'video',
            caption:
              'Zblízka: pět stehů sedlářského stehu, obě jehly, vždy stejné pořadí a utažení',
            status: 'planned',
            durationSeconds: 90,
          },
        ],
      },
      {
        id: 'finish-stitch',
        title: 'Ukončete steh',
        animationLinks: [animationLink('saddleStitch', 'E1'), animationLink('saddleStitch', 'F1')],
        body: 'Na konci řady prošijte zpět dva otvory a oba konce vyveďte na rub. Když konce nezatavujete, odstřihněte je těsně u kůže a přimáčkněte; voskovaná nit drží bez uzlu. Polyesterovou nit můžete zatavit: konce odstřihněte tak, aby vyčnívaly asi 2 mm, krátce je přibližte k plameni zapalovače a hned přimáčkněte. Zatavujte jen na rubu, plamen nikdy k líci.',
        media: [
          {
            id: 'l4-backstitch',
            kind: 'photo',
            caption: 'Rub odřezku s ukončením stehu: dva zpětné stehy a odstřižené konce nitě',
            status: 'planned',
          },
        ],
      },
      {
        id: 'compare',
        title: 'Porovnejte líc a rub',
        animationLinks: [animationLink('saddleStitch', 'G1')],
        body: 'Na líci mají být všechny stehy stejně skloněné a stejně utažené. Rub bývá méně pravidelný, to je normální. Stehy na rubu ale musí být stejně utažené, v jedné řadě a bez smyček. Když otvory na rubu nejsou rovné, vidličky nebyly při děrování kolmo (lekce 3).',
        media: [
          {
            id: 'l4-good-bad-stitch',
            kind: 'photo',
            caption:
              'Dva vzorky vedle sebe: pravidelný skloněný steh vs. steh s přeskočeným pořadím a nerovným utažením',
            status: 'planned',
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'glued-flush',
        title: 'Díly jsou slepené a hrany lícují bez posunu.',
        required: true,
      },
      {
        slug: 'stitch-straight',
        title: 'Steh na líci má všechny stehy stejně skloněné.',
        required: true,
      },
      {
        slug: 'tension-even',
        title: 'Stehy jsou stejně utažené, žádný netvoří smyčku.',
        required: true,
      },
      {
        slug: 'finished-clean',
        title: 'Konec je ukončený zpětnými stehy a nit odstřižená na rubu.',
        required: true,
      },
    ],
    commonMistakes: [
      'Prohození pořadí jehel v jednom otvoru: steh tam leží obráceně a je to vidět.',
      'Nestejné utažení: jedna strana má smyčky.',
      'Propíchnutá nit druhou jehlou: nit se zasekne a roztřepí. Zadní jehla jde vždy nad přední nití.',
    ],
    safety: [
      'Lepidlo s rozpouštědlem používejte ve větrané místnosti.',
      'Jehly odkládejte zapíchnuté do odřezku, ne volně na stůl.',
      'Při zatavování konců nitě držte zapalovač dál od kůže i od zbytku nitě; stačí zlomek sekundy.',
    ],
    media: [
      {
        id: 'l4-hero',
        kind: 'photo',
        caption: 'Dvě ruce se dvěma jehlami uprostřed sedlářského stehu na slepených odřezcích',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L5,
    title: 'Přenesení šablony a řezání dílů',
    order: 5,
    phaseSlug: 'build',
    estimatedMinutes: 40,
    goal: 'Mít dva přesné díly pouzdra vyříznuté podle šablony 1:1.',
    materials: [
      'nůžky na vystřižení šablony nahrubo (s okrajem 1–2 cm)',
      'kůže A4 na pouzdro (1,2–1,5 mm)',
    ],
    requiredEquipment: [
      'veg-tan-leather',
      'utility-knife',
      'steel-ruler',
      'cutting-mat',
      'sandpaper',
    ],
    recommendedEquipment: ['scratch-awl', 'masking-tape'],
    prerequisiteLessons: [L2, L3, L4],
    prints: [
      {
        source: 'template',
        copies: 1,
        purpose:
          'Oba díly pouzdra k přilepení na rub kůže (krok 1). Tiskněte bez přizpůsobení velikosti (100 %), kontrolní úsečka musí měřit 50 mm.',
        paper: 'A4, nejlépe matný papír 120 g pro inkoustové tiskárny, jinak obyčejný',
      },
    ],
    steps: [
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte šablonu',
        printLink: 'template',
        body: 'Šablonu otevřete odkazem pod tímto krokem. Tiskněte na A4 bez přizpůsobení velikosti („skutečná velikost“, 100 %), nejlépe na matný papír 120 g pro inkoustové tiskárny, jinak na obyčejný. Změřte kontrolní úsečku: musí mít přesně 50 mm. Když nemá, upravte nastavení tisku a tiskněte znovu.',
        records: [
          {
            kind: 'number',
            id: 'template-calibration',
            label: 'Kontrolní úsečka na šabloně',
            unit: 'mm',
            decimals: 1,
            target: { min: 50, max: 50, label: 'cíl přesně 50 mm' },
          },
        ],
        media: [
          {
            id: 'l5-template',
            kind: 'illustration',
            caption:
              'Šablona 1:1: zadní díl 100 × 70 mm, přední kapsa 100 × 56 mm s výřezem na palec, linie stehu 3,5 mm, čárky k propíchnutí, kontrolní úsečka 50 mm',
            status: 'available',
            illustration: 'template',
          },
        ],
      },
      {
        id: 'choose-area',
        title: 'Vyberte místo na kůži',
        body: 'Prohlédněte kůži proti světlu a vyberte plochu bez jizev, žilek a měkkých míst. Oba díly položte delší stranou stejným směrem.',
        media: [],
      },
      {
        id: 'transfer',
        title: 'Přilepte šablonu na rub',
        body: 'Každý díl šablony vystřihněte zvlášť a jen nahrubo, s okrajem 1–2 cm (mezi díly střihněte středem mezery). Po plné čáře budete řezat až nožem. Čárkovaná čára je linie stehu, tu nestříhejte ani neřežte. Díl položte na rub kůže a přilepte maskovací páskou z několika stran, jen na okrajích mimo plnou čáru. Použijte pásku, která v lekci 2 nenechala na líci stopu. Šablona se řezáním zničí, na každý další díl nebo pouzdro vytiskněte novou.',
        recalls: [{ fieldId: 'tape-mark', label: 'Páska v lekci 2' }],
        media: [
          {
            id: 'l5-transfer',
            kind: 'photo',
            caption:
              'Papírová šablona vystřižená s okrajem 1–2 cm, přilepená maskovací páskou za okraje na rubu kůže',
            status: 'planned',
          },
        ],
      },
      {
        id: 'transfer-other',
        title: 'Jiný způsob: obkreslení',
        body: 'Šablonu vystřihněte přesně po plné čáře, přilepte na rub a obkreslete obrys šídlem, tupou jehlou nebo tužkou. Pak řežte po obkreslené čáře, rovné strany podle pravítka. Řez skrz papír po vytištěné čáře je ale přesnější.',
        media: [],
      },
      {
        id: 'prick-marks',
        title: 'Před řezáním propíchněte značky',
        body: 'Dokud je šablona přilepená, propíchněte šídlem skrz papír do kůže oba konce oblouku výřezu na palec. Na šabloně je u každého krátká čárka nad horní hranou přední kapsy, propíchněte místo, kde čárka končí na plné čáře. Podle nich výřez dorovnáte. Po vyříznutí už šablona přesně nedosedne.',
        media: [],
      },
      {
        id: 'cut-parts',
        title: 'Řežte skrz papír po čáře',
        body: 'Řežte skrz papír i kůži přesně po plné čáře, nůž do strany nenaklánějte, vždy na dva až tři lehké tahy. Výřez na palec zatím vynechte. Rovné strany řežte podle ocelového pravítka položeného na čáru (jako v lekci 2), zaoblené rohy pomalu bez pravítka, krátkými tahy. Když řez začne třepit papír nebo kůži, odlomte článek čepele.',
        media: [
          {
            id: 'l5-corner-cut',
            kind: 'video',
            caption:
              'Řezání zaobleného rohu skrz šablonu krátkými tahy, nůž kolmo k podložce, druhá ruka otáčí kůží',
            status: 'planned',
            durationSeconds: 40,
          },
        ],
      },
      {
        id: 'thumb-cutout',
        title: 'Vyřízněte výřez na palec',
        body: 'Výřez je jen na přední kapse, uprostřed horní hrany: 40 mm široký a 12 mm hluboký. Řežte ho s přilepenou šablonou. Oblouk nasekejte pěti až šesti krátkými rovnými řezy kousek vedle čáry v odpadu (uvnitř výřezu), nůž kolmo, volnou rukou otáčejte kůží. Dorovnáte ho smirkem v dalším kroku.',
        media: [
          {
            id: 'l5-thumb-cutout',
            kind: 'photo',
            caption:
              'Přední kapsa s narýsovaným obloukem výřezu, vedle ní hotový výřez dobroušený smirkem na tužce',
            status: 'planned',
          },
        ],
      },
      {
        id: 'peel-template',
        title: 'Sejměte šablonu a zkontrolujte značky',
        body: 'Pásku strhávejte pomalu, skoro rovnoběžně s kůží. Zkontrolujte, že jsou vidět všechny propíchnuté značky. Výřez na palec dobruste smirkem 240 omotaným kolem tužky nebo tenkého dřívka do plynulého oblouku mezi propíchnutými značkami. Papírový zadní díl s čárkami 56 mm na bocích si schovejte na lekci 6.',
        media: [],
      },
      {
        id: 'compare-parts',
        title: 'Porovnejte díly',
        body: 'Přiložte přední díl lícem nahoru na líc zadního a srovnejte spodek a boky. Rozdíl větší než asi půl milimetru zbruste smirkem na rovné destičce nebo lehce seřízněte.',
        media: [],
      },
    ],
    checkpoints: [
      {
        slug: 'calibration-ok',
        title: 'Kontrolní úsečka na vytištěné šabloně měří 50 mm.',
        required: true,
      },
      { slug: 'two-parts', title: 'Mám dva díly podle šablony s kolmými hranami.', required: true },
      {
        slug: 'marks-transferred',
        title: 'Po sejmutí šablony jsou na rubu vidět všechny propíchnuté značky.',
        required: false,
      },
      {
        slug: 'parts-match',
        title: 'Přední díl přiložený na zadní lícuje na bocích i dole.',
        required: true,
      },
      {
        slug: 'cutout-smooth',
        title: 'Výřez na palec je plynulý oblouk bez schodů.',
        description: 'Přejeďte po něm prstem – nesmí drhnout.',
        required: true,
      },
    ],
    commonMistakes: [
      'Tisk s přizpůsobením na stránku: šablona je o pár procent menší a karty se nevejdou.',
      'Šablona přilepená na líc místo na rub: propíchnuté značky zůstanou na hotovém pouzdru vidět.',
      'Řez podél okraje papíru s nožem opřeným o papír místo o pravítko: nůž uhne a hrana není rovná.',
      'Páska přes čáru řezu: nůž jde přes pásku a řez uhne.',
      'Rohy řezané podle pravítka: zůstanou hranaté.',
      'Výřez řezaný jedním obloukem: nůž uhne a hrana má schody.',
    ],
    safety: [
      'Prsty, které drží pravítko, mějte mimo dráhu čepele a řežte směrem od nich.',
      'U rohů držte kůži volnou rukou daleko od čepele a otáčejte kůží, ne nožem.',
    ],
    media: [
      {
        id: 'l5-hero',
        kind: 'photo',
        caption: 'Dva vyříznuté díly pouzdra ležící na papírové šabloně',
        status: 'planned',
      },
    ],
  }),

  draft({
    slug: L6,
    title: 'Sestavení pouzdra: lepení, děrování, šití a hrany',
    order: 6,
    phaseSlug: 'build',
    estimatedMinutes: 90,
    goal: 'Sešít oba díly po třech stranách sedlářským stehem a zaleštit hrany: pouzdro na 4–6 karet.',
    materials: ['nit asi 1 m', 'lepidlo nebo páska', 'čistý hadřík', 'trochu vody'],
    requiredEquipment: [
      'veg-tan-leather',
      'stitching-chisels',
      'mallet',
      'punching-board',
      'harness-needles',
      'waxed-thread',
      'steel-ruler',
      'sandpaper',
    ],
    recommendedEquipment: [
      'contact-cement',
      'edge-burnisher',
      'wing-divider',
      'scratch-awl',
      'masking-tape',
    ],
    prerequisiteLessons: [L5],
    prints: [
      {
        source: 'template',
        copies: 1,
        purpose: 'Zadní díl vystřižený po plné čáře k vyznačení lepené plochy (krok 2).',
        condition: 'Jen když nemáte papírový zadní díl z lekce 5.',
      },
    ],
    requires: [
      { id: 'leather-parts', fromLesson: L5, label: 'Dva vyříznuté díly pouzdra' },
      {
        id: 'paper-back',
        fromLesson: L5,
        label: 'Papírový zadní díl s čárkami 56 mm',
        note: 'Na vyznačení lepené plochy (krok 2). Když ho nemáte, vytiskněte novou šablonu.',
      },
    ],
    steps: [
      {
        id: 'mark-stitch-lines',
        title: 'Narýsujte linii stehu na přední díl',
        body: 'Na líc předního dílu narýsujte jako v lekci 3 linii 3,5 mm od hrany po obou bocích a dole. Ve spodních rozích veďte linii po zaoblení, i tam 3,5 mm od hrany; kružítko vedené po hraně to udělá samo. Horní hrana zůstane bez stehu, tudy se vkládají karty.',
        media: [],
      },
      {
        id: 'mark-glue-area',
        title: 'Vyznačte lepenou plochu na zadním dílu',
        body: 'Na líci zadního dílu se lepí jen pás asi 8 mm podél spodku a obou boků (tvar U, vrch volný), aby lepidlo drželo po obou stranách linie stehu. Papírový zadní díl z lekce 5 (nebo novou šablonu vystřiženou po plné čáře) přiložte na líc zadního dílu, hrany na hrany. Na obou bocích udělejte šídlem drobný vpich těsně pod vnitřním koncem čárky 56 mm (horní hrana kapsy); kapsa ho zakryje. Nad vpichy nezdrsňujte, škrábance by zůstaly vidět. U samého boku končete asi o 6 mm níž, roh kapsy je zaoblený. Šířku 8 mm stačí odměřit nahrubo kružítkem nebo tužkou. Pro jistotu nalepte těsně nad vpichy maskovací pásku a zdrsňujte jen k ní.',
        media: [
          {
            id: 'l6-glue-area',
            kind: 'photo',
            caption:
              'Zadní díl z líce s vyznačeným pásem 8 mm podél spodku a boků, končícím u vpichů pod výškou kapsy 56 mm; nad nimi čistá kůže',
            status: 'planned',
          },
        ],
      },
      {
        id: 'glue-parts',
        title: 'Slepte díly',
        body: 'Vyznačený pás na zadním dílu zdrsněte smirkem 180, z hladkého líce lepidlo pouští. Smirek omotejte kolem hranolku asi 1–2 cm širokého, pás tak udržíte v mezích lépe než prsty. Stěrkou naneste tenký pás lepidla na zdrsněný pás i na stejný pás na rubu kapsy a nechte odvětrat podle návodu. Kapsu přiložte lícem nahoru, spodek a boky přesně na hrany zadního dílu, a přitiskněte přes hadřík. Střed nechte suchý, jinak se kapsa slepí a karta do ní nevejde. Oboustrannou pásku nalepte jen na rub kapsy, zdrsňovat pak nemusíte.',
        waits: [
          {
            id: 'glue-open',
            label: 'Odvětrání lepidla (s páskou nečekáte)',
            minutes: 10,
            maxMinutes: 15,
            basis: 'manufacturer',
          },
        ],
        media: [
          {
            id: 'l6-assembled-scheme',
            kind: 'illustration',
            caption:
              'Schéma sestavení: přední kapsa lícem ven na zadním dílu, steh po bocích a dole, vrch otevřený',
            status: 'available',
            illustration: 'assembled',
          },

          {
            id: 'l6-glued',
            kind: 'photo',
            caption:
              'Slepené díly pouzdra z líce: přední kapsa lícuje s boky a spodkem zadního dílu, nahoře přesah',
            status: 'planned',
          },
        ],
      },
      {
        id: 'punch-sides',
        title: 'Děrujte boky a spodek',
        body: 'Děrujte z líce kapsy na tvrdé desce, jen tam, kde kapsa leží na zadním dílu; horní část zadního dílu zůstane bez otvorů. První otvor dejte na linii stehu asi 6 mm pod horní hranou kapsy, kde je bok pod zaoblením už rovný. Pokračujte dolů. Spodní roh je zaoblený: veďte řadu po zaoblené linii, i tam 3,5 mm od hrany, ne do průsečíku rovných linií (ten je jen asi 2,5 mm od hrany). Zatáčku děrujte dvojhrotem po jednom otvoru, první hrot vždy v posledním otvoru (ověřte na odřezku). Stejně pokračujte po spodku a druhým rohem. Druhý bok děrujte nahoru a u horního konce řadu dorovnejte dvojhrotem, aby poslední otvor ležel ve stejné výšce jako první otvor na prvním boku.',
        media: [
          {
            id: 'l6-corner-punch',
            kind: 'photo',
            caption: 'Detail spodního rohu: řada otvorů zatáčí po zaoblení, všude 3,5 mm od hrany',
            status: 'planned',
          },
        ],
      },
      {
        id: 'stitch',
        title: 'Sešijte tři strany',
        animationLinks: [
          animationLink('saddleStitch', 'E2'),
          animationLink('saddleStitch', 'F2'),
          animationLink('saddleStitch', 'F3'),
        ],
        body: 'Díl uchyťte jako v lekci 4. Začněte dvěma zpětnými stehy u horní hrany kapsy: nit vyrovnejte ve třetím otvoru od horního konce, ušijte dva stehy zpět k prvnímu otvoru a pak šijte dopředu přes ně, souvisle bok, spodek, bok. Otvory v rozích prošijte jako všechny ostatní. Na konci udělejte dva zpětné stehy. Konce vyveďte na rub a odstřihněte těsně u kůže, nebo je jako v lekci 4 nechte asi 2 mm dlouhé a zatavte.',
        media: [
          {
            id: 'l6-stitch-video',
            kind: 'video',
            caption:
              'Šití rohu pouzdra: průchod otvory v zatáčce a pokračování po spodní hraně, obě jehly',
            status: 'planned',
            durationSeconds: 60,
          },
        ],
      },
      {
        id: 'edges',
        title: 'Srovnejte a zalešte hrany',
        animationLinks: [animationLink('edges', 'A2'), animationLink('edges', 'D1')],
        body: 'Sešité hrany srovnejte do jedné roviny smirkem 220–400 na rovné destičce. Hranu navlhčete vodou nebo pastou a třete leštítkem nebo plátnem, dokud se nezaleskne. Stejně upravte horní hrany obou dílů a oblouk výřezu.',
        media: [
          {
            id: 'l6-edges',
            kind: 'photo',
            caption: 'Hrana pouzdra napůl zaleštěná: vlevo matná srovnaná, vpravo hladká a lesklá',
            status: 'planned',
          },
        ],
      },
      {
        id: 'test-cards',
        title: 'Vložte karty',
        body: 'Vložte čtyři karty a palcem je výřezem vysuňte. Zpočátku půjdou těsně, kůže se během několika dní přizpůsobí.',
        media: [
          {
            id: 'l6-final',
            kind: 'photo',
            caption:
              'Hotové pouzdro na karty v ruce, vložené karty, detail stehu a zaleštěné hrany',
            status: 'planned',
          },
        ],
      },
    ],
    checkpoints: [
      {
        slug: 'punched-all',
        title:
          'Otvory jdou souvisle po obou bocích i spodku, v rozích po zaoblení 3,5 mm od hrany.',
        required: true,
      },
      {
        slug: 'stitched-all',
        title: 'Tři strany jsou sešité, začátek i konec zajištěný zpětnými stehy.',
        required: true,
      },
      {
        slug: 'edges-finished',
        title: 'Hrany včetně oblouku výřezu jsou srovnané a zaleštěné.',
        required: true,
      },
      {
        slug: 'cards-fit',
        title: 'Vejdou se čtyři karty a jdou palcem vysunout výřezem.',
        required: true,
      },
      { slug: 'photo-taken', title: 'Hotové pouzdro je vyfocené.', required: false },
    ],
    commonMistakes: [
      'Steh přes horní hranu předního dílu: pouzdro se nedá otevřít.',
      'Otvor v rohu na průsečíku rovných linií: je jen asi 2,5 mm od zaoblené hrany.',
      'Leštění před srovnáním hran: nerovnosti zůstanou.',
      'Zdrsnění líce nad kapsou: matné škrábance se nedají odstranit.',
      'Lepidlo i uprostřed kapsy: kapsa se slepí a karta do ní nejde vsunout.',
    ],
    safety: [
      'Lepidlo s rozpouštědlem používejte ve větrané místnosti.',
      'Úder do dvou vrstev je pevnější, prsty držte u spodku vidliček, mimo dráhu paličky.',
      'Při zatavování konců nitě držte zapalovač dál od kůže i od zbytku nitě; stačí zlomek sekundy.',
    ],
    media: [
      {
        id: 'l6-hero',
        kind: 'photo',
        caption: 'Hotové pouzdro na karty z přírodní třísločiněné kůže, sedlářský steh, detail',
        status: 'planned',
      },
    ],
  }),
];

export const cardHolderProject: ProjectDefinition = {
  slug: PROJECT_SLUG,
  code: '01',
  title: 'Pouzdro na karty',
  summary: 'Kapsa na čtyři až šest karet, ručně šitá sedlářským stehem.',
  description:
    'Kapsa na čtyři až šest karet, ručně šitá sedlářským stehem. Naučíte se na ní rovný řez, děrování, sedlářský steh a úpravu hran, tedy základ pro peněženku nebo pásek.',
  difficulty: 'beginner',
  estimatedHours: { min: 4, max: 6 },
  skills: [
    'Rovný řez',
    'Rýsování linie stehu',
    'Děrování vidličkami',
    'Sedlářský steh',
    'Lepení dílů',
    'Úprava hran',
  ],
  phases: [...phases],
  equipment: [
    // Pořadí = pořadí nákupu: řezání a děrování na odřezcích (lekce 1–4) nejdřív, kůže na pouzdro až před lekcí 5.
    {
      equipmentSlug: 'cutting-mat',
      priority: 'required',
      reason: 'Podklad pro řezání.',
      specification: 'Samohojivá A3.',
    },
    {
      equipmentSlug: 'punching-board',
      priority: 'required',
      reason: 'Podklad pod děrování, chrání hroty i řezací podložku.',
      specification: 'HDPE deska nebo plastové prkénko, případně silný odřezek kůže.',
      alternatives: ['Plastové kuchyňské prkénko', 'Silný odřezek kůže na tvrdém podkladu'],
    },
    {
      equipmentSlug: 'utility-knife',
      priority: 'required',
      reason: 'Všechny řezy dílů.',
      specification: 'Odlamovací nůž 18 mm s novými čepelemi.',
    },
    {
      equipmentSlug: 'steel-ruler',
      priority: 'required',
      reason: 'Vedení nože a rýsování linie stehu.',
      specification: 'Ocelové 30 cm.',
    },
    {
      equipmentSlug: 'stitching-chisels',
      priority: 'required',
      reason: 'Otvory pro sedlářský steh.',
      specification: 'Rozteč 3,85–4 mm, sada 2 + 4/6 hrotů.',
      alternatives: ['Půjčené vidličky se stejnou roztečí'],
    },
    {
      equipmentSlug: 'mallet',
      priority: 'required',
      reason: 'Úder do vidliček.',
      specification: 'Gumová nebo plastová.',
    },
    {
      equipmentSlug: 'harness-needles',
      priority: 'required',
      reason: 'Sedlářský steh dvěma jehlami.',
      specification: 'Tupé nebo poloostré sedlářské, k niti 0,6 mm, 4 ks.',
    },
    {
      equipmentSlug: 'waxed-thread',
      priority: 'required',
      reason: 'Steh.',
      specification: 'Voskovaný polyester 0,6 mm, 20 m.',
    },
    {
      equipmentSlug: 'veg-tan-leather',
      priority: 'required',
      reason: 'Finální díly pouzdra (lekce 5 a 6). Na trénink v lekcích 1–4 stačí levné odřezky.',
      specification:
        'Třísločiněná lícová kůže 1,2–1,5 mm, přířez A4; na trénink 2× A5 téže kůže nebo levné odřezky.',
    },
    {
      equipmentSlug: 'sandpaper',
      priority: 'required',
      reason:
        'Zdrsnění lepené plochy (lekce 4 a 6), dorovnání výřezu na palec (lekce 5) a srovnání hran (lekce 6).',
      specification:
        'Zrnitost 180–240 na zdrsnění lepené plochy a 220–400 na srovnání hran; po jednom archu.',
      alternatives: ['Jemný pilník na nehty'],
    },
    {
      equipmentSlug: 'scratch-awl',
      priority: 'recommended',
      reason: 'Propíchnutí značek přes šablonu (lekce 2 a 5) a rýsování linií (lekce 2, 3 a 6).',
      specification: 'Kulaté rýsovací šídlo s hruškovitou rukojetí.',
      alternatives: ['Tupá sedlářská jehla', 'Tužka na rub kůže'],
    },
    {
      equipmentSlug: 'masking-tape',
      priority: 'recommended',
      reason:
        'Drží šablonu na rubu kůže při propichování a řezání (lekce 2 a 5). Jedna role vystačí i na projekty 02 a 03.',
      specification:
        'Papírová maskovací páska kolem 25 mm, nejlépe s nízkou lepivostí (na citlivé povrchy).',
      alternatives: ['Svorky nebo závaží na šablonu'],
    },
    {
      equipmentSlug: 'contact-cement',
      priority: 'recommended',
      reason: 'Přidrží díly před děrováním.',
      specification: 'Malá tuba, nebo oboustranná páska 5 mm.',
      alternatives: ['Oboustranná páska 5 mm'],
    },
    {
      equipmentSlug: 'wing-divider',
      priority: 'recommended',
      reason: 'Rychlejší rýsování linie stehu.',
      specification: 'Kružítko s aretací.',
      alternatives: ['Pravítko a tupá jehla'],
    },
    {
      equipmentSlug: 'edge-burnisher',
      priority: 'recommended',
      reason: 'Zaleštění hran v lekci 6.',
      specification: 'Pasta na hrany + dřevěné leštítko.',
      alternatives: ['Voda a kus plátna'],
    },
    {
      equipmentSlug: 'edge-beveler',
      priority: 'later',
      reason: 'U tenké kůže malý efekt; až na pásek nebo peněženku.',
      specification: 'Velikost 0–1.',
    },
    {
      equipmentSlug: 'safety-skiver',
      priority: 'later',
      reason: 'Na pouzdru se nepoužívá. Hodí se až u přehybů a lepených okrajů peněženky.',
      specification: 'Safety skiver s vyměnitelnou čepelí, 3 čepele v balení + 10 náhradních.',
    },
    {
      equipmentSlug: 'stitching-pony',
      priority: 'later',
      reason: 'Drží díl při šití. Pouzdro (nejdelší šev 100 mm) jde ušít i mezi koleny.',
      specification: 'Čelisti od 6 cm, potažené kůží.',
      alternatives: [
        'Mezi koleny',
        'Truhlářská svěrka a dvě dřevěné destičky',
        'Velký kancelářský klip na hraně stolu',
      ],
    },
  ],
  lessons: [...lessons],
  template: {
    // Zadní díl 100 × 70; boky šité jen po výšku přední kapsy. Přední kapsa 56 mm drží kartu
    // (54 mm) celou uvnitř, ven se vysouvá mělkým výřezem na palec (40 × 12 mm), který odkryje
    // asi 13 mm karty. NÁVRH – ověřit na papírovém modelu a odřezku.
    pieces: [
      {
        id: 'back',
        name: 'Zadní díl',
        widthMm: 100,
        heightMm: 70,
        cornerRadiusMm: 6,
        stitchOffsetMm: 3.5,
        openEdge: 'top',
        stitchUpToMm: 56,
        // Čárky 8 mm (šířka lepeného pásu v lekci 6): vpich u vnitřního konce kapsa zakryje i u svého zaobleného rohu.
        heightMark: { fromBottomMm: 56, lengthMm: 8 },
        quantity: 1,
      },
      {
        id: 'front',
        name: 'Přední kapsa',
        widthMm: 100,
        heightMm: 56,
        cornerRadiusMm: 6,
        stitchOffsetMm: 3.5,
        openEdge: 'top',
        thumbCutout: { widthMm: 40, depthMm: 12 },
        quantity: 1,
      },
    ],
    stitchSpacingLabel: 'rozteč 3,85–4 mm',
    threadLabel: 'nit 0,6 mm',
    calibrationMm: 50,
    printNote:
      'Tisk na A4 bez přizpůsobení velikosti (100 %). Kontrolní úsečka na okraji musí měřit 50 mm. Šablonu vystřihněte nahrubo s okrajem 1–2 cm, přilepte páskou na rub, propíchněte značky a řežte skrz papír po čáře (lekce 5). Na každý kus vytiskněte novou šablonu.',
  },
  practiceSheets: {
    sheets: [
      {
        id: 'cvicna-sablona',
        title: 'Cvičná šablona: řez podle přilepené šablony',
        note: 'Tři tvary 60 × 40 mm na odřezek k lekci 2: rovné řezy, roh R10 a výřez 20 × 12 mm s tečkami k propíchnutí. Nejsou to díly pouzdra.',
        orientation: 'portrait',
        widthMm: 210,
        heightMm: 297,
      },
    ],
    calibrationMm: 50,
    printNote:
      'Tisk na A4 bez přizpůsobení velikosti (100 %), kontrolní úsečka musí měřit 50 mm. Tři tvary se vejdou na zbytek juchtové A5 asi 210 × 80 mm: vedle sebe po delší straně zaberou 210 × 40 mm, s papírovým okrajem 70 mm na výšku. Cvičení je v lekci 2; postup je stejný jako u šablony pouzdra v lekci 5.',
    defaultVariantLabel: 'Na odřezek k lekci 2',
  },
  shoppingPlan: {
    title:
      'Sestava: juchtová kůže 1,2 mm (A4 na pouzdro, 2× A5 na trénink), nářadí z CraftPointu, prkénko z IKEA',
    lines: [
      {
        equipmentSlug: 'veg-tan-leather',
        url: 'https://craft-point.cz/products/hovezi-kuze-licova-juchtova-trislocinena-1-2-mm',
        variant: 'A4 (30 × 21 cm)',
        quantity: 1,
        purpose: 'zadní díl 100 × 70 mm a přední kapsa 100 × 56 mm (lekce 5 a 6), s rezervou',
      },
      {
        equipmentSlug: 'veg-tan-leather',
        url: 'https://craft-point.cz/products/hovezi-kuze-licova-juchtova-trislocinena-1-2-mm',
        variant: 'A5 (21 × 15 cm)',
        quantity: 2,
        purpose:
          'trénink lekcí 1–4 ze stejné kůže: zkušební údery, odřezek aspoň 60 × 120 mm na rovný řez, zbytek asi 210 × 80 mm na cvičnou šablonu a tři odřezky asi 40 × 80 mm na lepení a steh',
      },
      {
        equipmentSlug: 'cutting-mat',
        url: 'https://craft-point.cz/products/oboustranna-samoobnovovaci-rezaci-podlozka-a3-craftpoint',
        quantity: 1,
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
        equipmentSlug: 'stitching-chisels',
        url: 'https://craft-point.cz/products/derovace-na-svy-4mm-sada-4-kusu',
        quantity: 1,
        purpose: 'rozteč 4 mm',
      },
      {
        equipmentSlug: 'mallet',
        url: 'https://craft-point.cz/products/horizontalni-palicka-na-kuzi',
        quantity: 1,
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
        purpose: '20 m vystačí na trénink i pouzdro',
      },
      {
        equipmentSlug: 'sandpaper',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        variant: 'zrnitost 180',
        quantity: 1,
        purpose: 'zdrsnění lepené plochy (lekce 4 a 6)',
      },
      {
        equipmentSlug: 'sandpaper',
        url: 'https://craft-point.cz/products/brusny-arch-na-platne-230x280-mm-ruzne-zrnitosti',
        variant: 'zrnitost 240',
        quantity: 1,
        purpose: 'srovnání hran a výřezu na palec',
      },
      {
        equipmentSlug: 'scratch-awl',
        url: 'https://craft-point.cz/products/sedlarske-sidlo-hruska',
        quantity: 1,
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
        purpose: 'k lepidlu, na úzký pás u hrany',
      },
      {
        equipmentSlug: 'wing-divider',
        url: 'https://craft-point.cz/products/wing-divider-sedlarske-kruzitko-150-mm',
        quantity: 1,
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
        equipmentSlug: 'punching-board',
        url: 'https://www.ikea.com/cz/cs/p/legitim-kuchynske-prkenko-bila-90202268/',
        quantity: 2,
        purpose: 'online jen po 2 ks; v obchodním domě stačí 1',
      },
      {
        equipmentSlug: 'masking-tape',
        url: 'https://www.obi.cz/lepici-pasky/tesa-maskovaci-paska-professional-sensitive-pro-citlive-povrchy-25-m-x-25-mm/p/4754180',
        quantity: 1,
        purpose:
          'šablona na kůži (cvičení v lekci 2, lekce 5); jedna role na všechny projekty – stačí i podobná páska z papírnictví nebo hobby marketu',
      },
    ],
    skipped: [],
  },
  media: [
    {
      id: 'card-holder-assembled',
      kind: 'illustration',
      caption:
        'Schéma hotového pouzdra: přední kapsa 56 mm s výřezem na palec na zadním dílu 100 × 70 mm, steh po bocích a dole',
      status: 'available',
      illustration: 'assembled',
    },
    {
      id: 'card-holder-hero',
      kind: 'photo',
      caption: 'Hotové pouzdro na karty, přírodní třísločiněná kůže, sedlářský steh',
      status: 'planned',
    },
  ],
  contentVersion: 1,
  reviewStatus: 'draft',
};

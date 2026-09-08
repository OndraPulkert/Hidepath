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
    goal: 'Mít stůl, na kterém se dá bezpečně řezat a bušit, a jednou si sáhnout na každý nástroj.',
    materials: [
      '1–2 odřezky kůže (stačí levná štípenka)',
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
        body: 'Potřebujete plochu aspoň 60 × 40 cm. Vlevo řezací podložka, vpravo tvrdá deska pod děrování na složeném ručníku. Stůl nesmí pružit; kuchyňský stůl je lepší než psací stolek na kolečkách.',
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
        title: 'Světlo a sezení',
        body: 'Světlo zepředu nebo zleva, ne za zády, aby ruka nestínila řez. Seďte tak, abyste při řezu tlačili shora, ne od boku.',
        media: [],
      },
      {
        id: 'check-chisels',
        title: 'Zkontrolujte vidličky (pokud už je máte)',
        body: 'Kroky 3 až 5 udělejte, až budete mít vidličky, jehly a nit doma. Pokud jsou teprve na cestě, pokračujte lekcí 2 a vraťte se k nim později. Přiložte vidličky hroty na odřezek a lehce přitiskněte rukou, bez paličky. Zůstane řada stejně vzdálených značek. Pokud máte pravítko s milimetry, ověřte, že mezi značkami je 3,85–4 mm.',
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
        body: 'Ustřihněte asi 60 cm nitě. Konec zploštěte mezi prsty a protáhněte očkem, pak jehlou propíchněte nit asi 3 cm od konce a přetáhněte smyčku přes jehlu. Nit tak drží a nevyklouzne. Totéž na druhém konci.',
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
        title: 'Jeden zkušební úder',
        body: 'Odřezek na tvrdou desku, vidličky kolmo, jeden pevný úder paličkou. Hroty musí projít skrz. Nejde o výsledek, jde o to slyšet a cítit, jak to zní a jak moc síly je potřeba.',
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
      'Děrování na řezací podložce místo tvrdé desky. Podložka se zničí a hroty neprojdou čistě.',
      'Stůl u okna se světlem za zády: ruka stíní řez.',
    ],
    safety: [
      'Nůž nechte zatím zavřený. Řezání přijde v další lekci.',
      'Hroty vidliček jsou ostré. Odkládejte je hroty od sebe, ne přes okraj stolu.',
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
    estimatedMinutes: 20,
    goal: 'Uříznout rovný proužek 20 × 100 mm na dva až tři lehké tahy s kolmou hranou.',
    materials: ['odřezek kůže aspoň 60 × 120 mm (stačí levná štípenka)', 'nová čepel v noži'],
    requiredEquipment: ['utility-knife', 'steel-ruler', 'cutting-mat'],
    recommendedEquipment: ['scratch-awl'],
    prerequisiteLessons: [L1],
    steps: [
      {
        id: 'mark-line',
        title: 'Narýsujte linii',
        body: 'Na rubovou stranu odřezku narýsujte rýsovacím šídlem, tupou jehlou nebo tužkou linii 20 mm od rovné hrany. Rýsujte lehce, jen stopu.',
        media: [],
      },
      {
        id: 'place-ruler',
        title: 'Přiložte pravítko',
        body: 'Pravítko položte tak, aby jeho hrana ležela přesně na linii a zbytek pravítka zakrýval díl, který chcete zachovat. Když nůž ujede, poškodí odpad, ne díl. Přitlačte prsty roztažené, daleko od hrany.',
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
        body: 'Čepel opřete o hranu pravítka, sklopte nůž asi na 45° ve směru tahu a držte ho kolmo k podložce, ne nakloněný do strany. První tah lehce, jen prořízne líc a vytvoří drážku. Druhý tah silněji dořízne. Řežte plynule směrem od volné ruky, nikdy k prstům, které drží pravítko.',
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
        body: 'Postavte proužek na hranu. Řez má být kolmý, ne zkosený, a bez „schodu“ tam, kde na sebe navazovaly tahy. Zkuste to třikrát; třetí proužek bývá znatelně lepší než první.',
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
    ],
    checkpoints: [
      {
        slug: 'strip-cut',
        title: 'Proužek 20 × 100 mm je uříznutý na dva až tři lehké tahy.',
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
    ],
    commonMistakes: [
      'Jeden silový tah: čepel se ohne a uteče od pravítka.',
      'Nůž nakloněný do strany: hrana je zkosená a díly pak nelícují.',
      'Pravítko na straně odpadu: když nůž ujede, poškodí díl.',
    ],
    safety: [
      'Prsty volné ruky vždy mimo dráhu čepele, i kdyby ujela. Nikdy nedržte kůži před čepelí.',
      'Otupenou čepel odlomte hned. Tupý nůž vyžaduje sílu a klouže.',
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
    materials: ['proužek z lekce 2 nebo jiný odřezek', 'tvrdá deska na ručníku'],
    requiredEquipment: ['stitching-chisels', 'mallet', 'punching-board', 'steel-ruler'],
    recommendedEquipment: ['wing-divider', 'scratch-awl'],
    prerequisiteLessons: [L2],
    steps: [
      {
        id: 'mark-stitch-line',
        title: 'Narýsujte linii stehu',
        body: 'Na líc proužku narýsujte linii 3,5 mm od hrany (na líc proto, že podle ní přiložíte vidličky shora). Bez kružítka to jde pravítkem a tupou jehlou: opřete pravítko o hranu a lehce táhněte hrotem podél druhé strany. Linie musí být lehká, po šití bude vidět jen steh.',
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
        title: 'První úder širokými vidličkami',
        body: 'Kůži na tvrdou desku. Vidličky se 4 nebo 6 hroty postavte hroty na linii, kolmo ve všech směrech. Držte je pevně u spodku, jeden pevný úder paličkou. Zkontrolujte, že všechny hroty prošly; pokud ne, ještě jeden úder bez pohnutí.',
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
        body: 'Vidličky posuňte tak, aby první hrot zapadl do posledního hotového otvoru. Tím drží rozteč a řada je rovná. Znovu zkontrolujte kolmost, pak úder.',
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
        title: 'Roh dvojhrotem',
        body: 'Kde se řada blíží ke konci nebo k rohu, dokončete ji vidličkami se 2 hroty, aby otvory vyšly na roh přesně. Rohy jsou v lekci 6, tady si jen zkuste dokončit řadu u konce proužku.',
        media: [],
      },
      {
        id: 'inspect',
        title: 'Prohlédněte rub',
        body: 'Otočte proužek. Na rubu mají být otvory stejně rovné jako na líci. Šikmé otvory na rubu znamenají, že vidličky nebyly kolmo.',
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
      'Nepřekrytí posledního otvoru: rozteč se rozjede a steh má „skok“.',
    ],
    safety: [
      'Prsty držící vidličky mějte u spodku, palička dopadá na horní konec. Nikdy nedržte vidličky za horní konec.',
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
      '2 odřezky zhruba 40 × 80 mm, ideálně třísločiněné',
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
    recommendedEquipment: ['contact-cement', 'wing-divider', 'scratch-awl'],
    prerequisiteLessons: [L3],
    steps: [
      {
        id: 'glue',
        title: 'Slepte díly podél hrany',
        body: 'Na rub obou odřezků naneste tenký pás lepidla asi 5 mm široký podél jedné delší hrany, nechte podle návodu odvětrat a přitiskněte hrany přesně na sebe. S páskou: nalepte pás na jeden díl, odlepte krycí fólii a přitiskněte druhý díl. Lepidlo drží jen pomocně.',
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
        body: 'Linii stehu 3,5 mm od hrany rýsujte na díl, který bude vidět. Děrujte jako v lekci 3, jen počítejte s větší tloušťkou: úder je pevnější a kontrola rubu důležitější.',
        media: [],
      },
      {
        id: 'start-stitch',
        title: 'Začněte steh',
        body: 'Jehlu protáhněte prvním otvorem tak, aby na obou stranách zůstala stejná délka nitě. Teď máte jednu jehlu vpředu, jednu vzadu.',
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
        title: 'Rytmus stehu',
        body: 'Přední jehlu prostrčte dalším otvorem dozadu a nit protáhněte. Zadní jehlu prostrčte stejným otvorem dopředu, ale nad nití, která už v otvoru je, ne pod ní. Obě nitě utáhněte stejnou silou. Vždy stejné pořadí a stejná strana: jen tak jsou stehy na obou stranách stejně skloněné.',
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
        title: 'Ukončení',
        body: 'Na konci řady prošijte zpět dva otvory, oba konce vyveďte na rub, těsně u kůže odstřihněte a zbytek přimáčkněte. Voskovaná nit drží bez uzlu. Polyesterové nitě se dají navíc zajistit: konec dlouhý asi 2 mm krátce přiblížit k plamenu zapalovače a hned přimáčknout; roztaví se do kuličky, která z otvoru nevyklouzne. Jen na rubu a opatrně, plamen nikdy k líci kůže.',
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
        body: 'Steh na líci má mít všechny stehy stejně skloněné a stejně utažené. Rub je u sedlářského stehu vždy trochu méně pravidelný, to je normální.',
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
      'Propíchnutí nitě druhou jehlou: nit se zasekne a roztřepí. Zadní jehla jde vždy nad přední nití.',
    ],
    safety: [
      'Lepidlo na rozpouštědlové bázi používejte ve větrané místnosti.',
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
      'vytištěná šablona 1:1 (zkontrolovaná úsečka 50 mm)',
      'nůžky na vystřižení šablony',
      'finální kůže 1,2–1,5 mm',
      'lepicí páska nebo svorky',
    ],
    requiredEquipment: [
      'veg-tan-leather',
      'utility-knife',
      'steel-ruler',
      'cutting-mat',
      'sandpaper',
    ],
    recommendedEquipment: ['scratch-awl'],
    prerequisiteLessons: [L2, L3, L4],
    steps: [
      {
        id: 'print-check',
        title: 'Vytiskněte a zkontrolujte šablonu',
        body: 'Tisk na A4 bez přizpůsobení velikosti („skutečná velikost“, 100 %). Změřte kontrolní úsečku: musí mít přesně 50 mm. Když ne, upravte nastavení tisku a tiskněte znovu.',
        media: [
          {
            id: 'l5-template',
            kind: 'illustration',
            caption:
              'Šablona 1:1: zadní díl 100 × 70 mm, přední kapsa 100 × 56 mm s výřezem na palec, linie stehu 3,5 mm, kontrolní úsečka 50 mm',
            status: 'available',
            illustration: 'template',
          },
        ],
      },
      {
        id: 'choose-area',
        title: 'Vyberte místo na kůži',
        body: 'Prohlédněte kůži proti světlu a najděte plochu bez jizev, žilek a měkkých míst. Díly umístěte tak, aby delší strana šla stejným směrem u obou.',
        media: [],
      },
      {
        id: 'transfer',
        title: 'Přeneste obrys',
        body: 'Šablonu vystřihněte, položte na rub kůže a přilepte páskou. Obrys obtáhněte rýsovacím šídlem, tupou jehlou nebo tužkou. Rohy označte tečkou, zaoblení dokreslíte podle šablony.',
        media: [
          {
            id: 'l5-transfer',
            kind: 'photo',
            caption:
              'Papírová šablona přilepená páskou na rubu kůže, ruka obtahuje obrys tupou jehlou',
            status: 'planned',
          },
        ],
      },
      {
        id: 'cut-parts',
        title: 'Vyřízněte díly',
        body: 'Rovné strany řežte podle pravítka jako v lekci 2, na dva až tři lehké tahy. Zaoblené rohy řežte krátkými tahy bez pravítka, nůž kolmo. Nejdřív hrubě vyřízněte celý díl s rezervou, pak přesně.',
        media: [
          {
            id: 'l5-corner-cut',
            kind: 'video',
            caption:
              'Řezání zaobleného rohu krátkými tahy, nůž kolmo k podložce, druhá ruka otáčí kůží',
            status: 'planned',
            durationSeconds: 40,
          },
        ],
      },
      {
        id: 'thumb-cutout',
        title: 'Vyřízněte výřez na palec',
        body: 'Výřez je jen na přední kapse, uprostřed horní hrany: 40 mm široký a 12 mm hluboký. Oblouk neřežte jedním tahem. Nasekejte ho pěti až šesti krátkými rovnými řezy kousek vedle linie, nůž kolmo, volná ruka otáčí kůží. Zbytek do linie dobruste smirkovým papírem 220 omotaným kolem tužky nebo tenkého dřívka. Finální tvar dělá smirek, ne nůž, takže oblouk nemusíte trefit napoprvé.',
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
        id: 'compare-parts',
        title: 'Porovnejte díly',
        body: 'Přiložte přední díl na zadní a srovnejte spodní hranu a boky. Rozdíl větší než asi půl milimetru zbruste smirkovým papírem na rovné destičce nebo lehce seřízněte.',
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
      'Obtahování na líc kůže: rýha zůstane vidět.',
      'Rohy řezané podle pravítka „nahrubo“: zůstanou hranaté.',
      'Snaha vyříznout výřez jedním obloukem: nůž uhne a hrana má schody. Krátké řezy a smirek jsou rychlejší.',
    ],
    safety: ['U rohů drží volná ruka kůži za díl daleko od čepele a otáčí kůží, ne nožem.'],
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
    goal: 'Sešít oba díly po třech stranách sedlářským stehem a zaleštit hrany. Výsledek je pouzdro na 4–6 karet.',
    materials: [
      'díly z lekce 5',
      'nit asi 1 m',
      'lepidlo nebo páska',
      'čistý hadřík',
      'trochu vody',
    ],
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
    recommendedEquipment: ['contact-cement', 'edge-burnisher', 'wing-divider', 'scratch-awl'],
    prerequisiteLessons: [L5],
    steps: [
      {
        id: 'mark-stitch-lines',
        title: 'Linie stehu na přední díl',
        body: 'Na líc předního dílu narýsujte linii 3,5 mm od hrany po obou bocích a dole. Linie stehu se rýsuje na líc, protože podle ní se děruje shora; obrys dílů se naopak kreslil na rub, aby na hotové věci nebyl vidět. Horní hrana zůstává bez stehu, tou se vkládají karty.',
        media: [],
      },
      {
        id: 'glue-parts',
        title: 'Slepte díly',
        body: 'Tenký pás lepidla nebo pásky na rub předního dílu podél boků a spodku. Přiložte na zadní díl tak, aby spodní hrana a boky lícovaly; zadní díl přesahuje nahoře. Přitiskněte přes hadřík.',
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
        body: 'Děruje se jen tam, kde přední kapsa leží na zadním dílu; horní část zadního dílu zůstává bez otvorů. Začněte v horním rohu předního dílu a pokračujte dolů. U spodního rohu dokončete řadu dvojhrotem tak, aby poslední otvor ležel na průsečíku obou linií. Spodní stranu začněte tímto rohovým otvorem.',
        media: [
          {
            id: 'l6-corner-punch',
            kind: 'photo',
            caption:
              'Detail rohu: řada otvorů podél boku končí přesně v rohovém otvoru, odkud pokračuje spodní řada',
            status: 'planned',
          },
        ],
      },
      {
        id: 'stitch',
        title: 'Sešijte tři strany',
        body: 'Začněte dvěma zpětnými stehy v horním rohu, aby byl začátek zpevněný, a šijte souvisle bok, spodek, bok. Rohový otvor prošijte jako každý jiný. Na konci dva zpětné stehy, odstřihněte na rubu a případně konce zatavte jako v lekci 4.',
        media: [
          {
            id: 'l6-stitch-video',
            kind: 'video',
            caption:
              'Šití rohu pouzdra: průchod rohovým otvorem a pokračování po spodní hraně, obě jehly',
            status: 'planned',
            durationSeconds: 60,
          },
        ],
      },
      {
        id: 'edges',
        title: 'Srovnejte a zalešte hrany',
        body: 'Smirkovým papírem 220–400 na rovné destičce srovnejte sešité hrany do jedné roviny. Navlhčete hranu vodou nebo pastou a třete leštítkem či kusem plátna, dokud se nezhutní a nezaleskne. Horní hrany obou dílů a oblouk výřezu udělejte také – po výřezu jezdí prsty při každém vytažení karty.',
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
        body: 'Vložte čtyři karty a palcem je ve výřezu vysuňte. Napoprvé půjdou těsně; třísločiněná kůže se během několika dní přizpůsobí.',
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
        title: 'Otvory jdou souvisle po obou bocích i spodku, rohy končí na průsečíku linií.',
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
      'Rohový otvor mimo průsečík linií: roh má skok.',
      'Leštění před srovnáním hran: nerovnosti zůstanou.',
    ],
    safety: [
      'Při děrování dvou vrstev je úder pevnější; prsty držte u spodku vidliček, mimo dráhu paličky.',
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
    'Kapsa na čtyři až šest karet, ručně šitá sedlářským stehem. Malý projekt, na kterém se naučíte všechno, co potřebujete pro peněženku nebo pásek: rovný řez, děrování, sedlářský steh a úpravu hran.',
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
      specification: 'Tupé sedlářské, k niti 0,6 mm, 4 ks.',
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
        'Třísločiněná lícová kůže 1,2–1,5 mm, přířez A4; k tomu balíček odřezků na trénink.',
    },
    {
      equipmentSlug: 'sandpaper',
      priority: 'required',
      reason: 'Srovnání hran po sešití (lekce 5 a 6).',
      specification: 'Zrnitost 220–400, jeden arch.',
      alternatives: ['Jemný pilník na nehty'],
    },
    {
      equipmentSlug: 'scratch-awl',
      priority: 'recommended',
      reason: 'Obkreslení šablony a rýsování linie stehu (lekce 3, 5 a 6).',
      specification: 'Kulaté rýsovací šídlo s hruškovitou rukojetí.',
      alternatives: ['Tupá sedlářská jehla', 'Tužka na rub kůže'],
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
      'Tisk na A4 bez přizpůsobení velikosti (100 %). Kontrolní úsečka na okraji musí měřit 50 mm.',
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

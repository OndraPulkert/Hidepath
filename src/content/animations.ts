import { type AnimationLink } from '@/content/schema';

/**
 * Animace postupu: samostatné HTML stránky v `public/animace`. Build je zkopíruje do `dist/`,
 * service worker je precachuje (fungují offline v nainstalované PWA) a Worker je servíruje
 * přímo jako soubor, ne jako SPA. Kroky lekcí na ně odkazují přes `animationLinks`.
 *
 * `sections` = kotvy, které stránka umí otevřít, s popiskem pro tlačítko v kroku:
 * - kapsa-postup: `#A`–`#E` skočí na první krok dané části a přehrává od ní,
 * - kapsa-prisiti: `#A`–`#D` otevře první krok dané části (zastavený, přehrání tlačítkem),
 * - kapsa-skladani (`#A`–`#E`) a kapsa-druk (`#A`–`#D`): stejně jako kapsa-prisiti,
 * - sedlarsky-steh a hrany (`#A`–`#G`): stejně jako kapsa-prisiti, společné pro všechny projekty,
 * - Víčko: `#anim-…` posune stránku na danou animaci (spustí se, když je vidět).
 *
 * `steps` = názvy kroků každé části ve stejném pořadí jako na stránce (`add('B', 'název', …)`).
 * Stránky kapsy umí otevřít i jednotlivý krok: `#B3` = třetí krok části B, stejně jako ho
 * stránka čísluje v popisku kroku. Test hlídá, že se názvy shodují se stránkou.
 */
export const animationPages = {
  kapsa: {
    path: '/animace/kapsa-postup.html',
    title: 'Kapsa na minci krok za krokem',
    sections: {
      A: 'Část A – forma',
      B: 'Část B – 1. výtisk na líc',
      C: 'Část C – osy a 2. výtisk na rub',
      D: 'Část D – tvarování',
      E: 'Část E – řez a okno na formě',
    },
    steps: {
      A: [
        'Vystřihněte výkres OTVOR FORMY',
        'Položte čtverec na desku',
        'Protáhněte osy až k okrajům desky',
        'Vyvrtejte otvor Ø 32 mm',
        'Sundejte papír, obruste a zaoblete hranu',
      ],
      B: [
        'Vystřihněte 1. výtisk nahrubo',
        'Přilepte ho maskovací páskou na LÍC',
        'Šídlem propíchněte 23 teček a 4 konce os',
        'Pásku strhněte pomalu',
        'Zkontrolujte, že se přenesly všechny značky',
        'Na líci jen dírky – nic nekreslete',
        'Prosekejte otvory švu z líce',
      ],
      C: [
        'Otočte kůži a narýsujte osy na rubu',
        'Vysekněte okno do 2. výtisku',
        'Položte 2. výtisk na rub a zarovnejte na osy',
        'Obtáhněte obrys šídlem nebo tužkou',
        'Obtáhněte kružnici okna v otvoru papíru',
        'Obrys se teď neřeže',
      ],
      D: [
        'Navlhčete kůži',
        'Lícem dolů na formu, osy na osy, mince na rub',
        'Přiklopte víkem a stáhněte dvěma svěrkami',
        'Nechte zaschnout přes noc',
        'Rozepněte: důlek vystupuje do otvoru',
      ],
      E: [
        'Zaschlou kůži zpátky na formu, lícem dolů',
        'Vyřízněte obrys 2–3 lehkými tahy nad dřevem',
        'Špalík pod důlek a vysekněte okno Ø 20',
        'Zkouška: mince nepropadne',
      ],
    },
  },
  pocketAttach: {
    path: '/animace/kapsa-prisiti.html',
    title: 'Přišití kapsy na pouzdro',
    sections: {
      A: 'Část A – značky ze šablony',
      B: 'Část B – lepení',
      C: 'Část C – prosekání skrz obě vrstvy',
      D: 'Část D – šití',
    },
    steps: {
      A: [
        'Šablona PÁS přilepená na LÍC',
        'Šídlem propíchněte rohy místa pro kapsu',
        'Po vyříznutí: 4 značky kapsy na předním panelu',
      ],
      B: [
        'Přiložte kapsu na 4 značky',
        'Zdrsněte jen pruh pod okrajem kapsy',
        'Kontaktní lepidlo do úzkého pruhu',
        'Nechte lepidlo odvětrat',
        'Přitiskněte kapsu přesně na značky',
      ],
      C: [
        'Kapsa už má otvory švu',
        'Naplocho na děrovací desku',
        'Vidličkami znovu přes tytéž otvory, skrz obě vrstvy',
        'Řez: otvory lícují skrz obě vrstvy',
      ],
      D: [
        'Připravte nit asi 0,8 m',
        'Přišijte kapsu sedlářským stehem',
        'Hotovo: kapsa s mincí na předním panelu',
      ],
    },
  },
  pouchFold: {
    path: '/animace/kapsa-skladani.html',
    title: 'Složení pouzdra a šev dna',
    sections: {
      A: 'Část A – pás a otvory dna',
      B: 'Část B – ohyby za mokra',
      C: 'Část C – lepení dna',
      D: 'Část D – šev dna',
      E: 'Část E – kontrola',
    },
    steps: {
      A: ['Pás po lekci 6: tři panely, dva ohyby', 'Otvory dna jsou zrcadlené přes ohyby'],
      B: [
        'Navlhčete pásma obou ohybů',
        'Karty ve fólii na rub předního, přes ně ohyb B',
        'Bankovky na líc vnitřního, zadní ohybem A přes všechno',
        'Rozhrnovačka, sponky vedle ohybů, zaschnout',
      ],
      C: [
        'Vyjměte obsah a rozevřete jen do pravého úhlu',
        'Spoj 1: přední ↔ vnitřní – zdrsnit a natřít',
        'Odvětrat, přeložit, zarovnat jehlami, přitisknout',
        'Spoj 2: vnitřní ↔ zadní – stejně',
        'Přeložit zadní, zarovnat jehlami skrz tři vrstvy',
      ],
      D: [
        'Nit na šev dna',
        'Prošijte dno skrz tři vrstvy',
        'Konec zajistěte zpětnými stehy, zkontrolujte druhou stranu',
      ],
      E: ['Kontrolní body lekce 7'],
    },
  },
  snap: {
    path: '/animace/kapsa-druk.html',
    title: 'Druk krok za krokem',
    sections: {
      A: 'Část A – zkouška na odřezku',
      B: 'Část B – dřík naplocho',
      C: 'Část C – klobouček a zkrácení jazyka',
      D: 'Část D – zavřít a otevřít',
    },
    steps: {
      A: [
        'Druk má čtyři díly',
        'Značka pro dřík 9,5 mm od okraje',
        'Otvor jen podle návodu: od 2 mm',
        'Osaďte dřík s hlavičkou',
        'Klobouček se zdířkou na druhém odřezku',
        'Zacvakněte, zavřete a znovu otevřete',
        'Změřte přírubu patice: nejvýš Ø 11 mm',
      ],
      B: [
        'Značka středu dříku na předním panelu',
        'Otvor pro dřík (pokud ho návod vyžaduje)',
        'Dřík z rubu, hlavička na líci – naplocho',
        'Kontrola: dřík naplocho před složením',
      ],
      C: [
        'Vložte obsah a přehněte jazyk',
        'Obtiskněte polohu kloboučku',
        'Otvor pro klobouček (pokud ho návod vyžaduje)',
        'Osaďte klobouček se zdířkou',
        'Zkraťte jazyk 11 mm za střed kloboučku',
      ],
      D: ['Kontrola: druk drží', 'Kontrola: jazyk končí asi 21 mm nad kapsou'],
    },
  },
  saddleStitch: {
    path: '/animace/sedlarsky-steh.html',
    title: 'Sedlářský steh',
    buttonText: 'Jak šít sedlářský steh',
    sections: {
      A: 'Část A – nit a jehly',
      B: 'Část B – uchycení dílu',
      C: 'Část C – začátek',
      D: 'Část D – rytmus stehu',
      E: 'Část E – zpětné stehy',
      F: 'Část F – konce nitě',
      G: 'Část G – kontrola',
    },
    steps: {
      A: [
        'Odměřte nit',
        'Konec zploštěte a protáhněte očkem',
        'Propíchněte nit 3 cm od konce a přetáhněte smyčku',
        'Totéž na druhém konci a zkouška tahem',
      ],
      B: ['Mezi koleny, linie otvorů nahoru', 'Nebo destičky a svěrka ke stolu'],
      C: ['První otvor: stejná délka nitě na obou stranách'],
      D: [
        '1. Přední jehla dalším otvorem dozadu',
        '2. Zadní jehla stejným otvorem dopředu – nad nití',
        '3. Obě nitě utáhněte stejnou silou',
        'Opakujte: vždy stejné pořadí a stejná strana',
        'Řez: dvě nitě se v každém otvoru kříží',
      ],
      E: ['Na konci prošijte zpět dva otvory', 'Zpětné stehy na začátku i na konci švu'],
      F: [
        'Oba konce vyveďte na rub',
        'Odstřihněte těsně u kůže a přimáčkněte',
        'Polyester navíc zatavit – jen na rubu',
      ],
      G: [
        'Líc: všechny stehy stejně skloněné a stejně utažené',
        'Rub: rovná řada',
        'Kontrolní body lekce 4',
      ],
    },
  },
  edges: {
    path: '/animace/hrany.html',
    title: 'Dokončení hran',
    buttonText: 'Jak na hrany',
    sections: {
      A: 'Část A – srovnání',
      B: 'Část B – zkosení',
      C: 'Část C – barva',
      D: 'Část D – zaleštění',
      E: 'Část E – kontrola',
      F: 'Část F – pouzdro s mincí',
      G: 'Část G – Víčko',
    },
    steps: {
      A: [
        'Které hrany: boky, dno, horní hrany a výřez',
        'Srovnejte hrany smirkem 220–400 na rovné destičce',
      ],
      B: [
        'Zkosení: pouzdro na karty ne, pouzdro s mincí srazí hrany dna',
        'Víčko: zkosovačem, nebo brusným papírem na hranolku',
      ],
      C: ['Barva na hrany – jen u barvené kůže'],
      D: [
        'Navlhčete hranu vodou nebo pastou',
        'Třete leštítkem, dokud se hrana nezhutní a nezaleskne',
        'Bez leštítka: kus plátna',
      ],
      E: [
        'Chyba: leštění před srovnáním hran',
        'Kontrolní bod: hrany srovnané a zaleštěné, včetně oblouku výřezu',
      ],
      F: [
        'Lekce 5: nejdřív hrany, na které se po složení nedostanete',
        'Lekce 6: hrany kapsy ještě před přišitím',
        'Lekce 8: dno do roviny, srazit, obarvit, zaleštit',
      ],
      G: [
        'Víčko, lekce 5: hrany předem, před sestavením',
        'Lekce 5: barevná horní hrana D1, Tokonole jen mimo lepená místa',
        'Lekce 9: boky zarovnat na 101,0 mm a vyleštit jako jeden svazek',
        'Další hrany Víčka: okénka a jazýček',
      ],
    },
  },
  threadLength: {
    path: '/animace/delka-nite.html',
    title: 'Kolik nitě na šev',
    buttonText: 'Jak odměřit nit',
    sections: {},
  },
  lidBends: {
    path: '/animace/vicko-ohyby.html',
    title: 'Ohyby peněženky Víčko',
    sections: {
      'anim-dno': 'Ohyb dna krok za krokem',
      'anim-zaves': 'Závěs krok za krokem',
    },
  },
  lidMagnet: {
    path: '/animace/vicko-magnet.html',
    title: 'Magnet ve Víčku',
    sections: {
      'anim-plisek': 'Plíšek mezi F a D1',
      'anim-magnet': 'Magnet a podšívka L1 na jazýčku',
    },
  },
} as const satisfies Record<
  string,
  {
    path: `/animace/${string}.html`;
    title: string;
    /** Text tlačítka v kroku; bez něj „Animace postupu“. */
    buttonText?: string;
    sections: Record<string, string>;
    steps?: Record<string, readonly string[]>;
  }
>;

export type AnimationPageKey = keyof typeof animationPages;
type PageDef<P extends AnimationPageKey> = (typeof animationPages)[P];
type SectionOf<P extends AnimationPageKey> = keyof PageDef<P>['sections'] & string;
/** Kotva kroku, např. `B3`; jen u stránek se seznamem kroků. Číslo hlídá `animationLink` za běhu. */
type StepAnchorOf<P extends AnimationPageKey> =
  PageDef<P> extends { steps: infer S } ? `${keyof S & string}${number}` : never;
export type AnimationAnchor<P extends AnimationPageKey> = SectionOf<P> | StepAnchorOf<P>;

const STEP_ANCHOR = /^([A-Z])([1-9][0-9]*)$/;

/** Název kroku pro kotvu `B3`, nebo `undefined`, když stránka takový krok nemá. */
export function animationStepTitle(page: AnimationPageKey, anchor: string): string | undefined {
  const match = STEP_ANCHOR.exec(anchor);
  const def = animationPages[page];
  if (!match || !('steps' in def)) return undefined;
  const steps: Readonly<Record<string, readonly string[]>> = def.steps;
  return steps[match[1]!]?.[Number(match[2]) - 1];
}

/**
 * Text tlačítka v kroku podle stránky, na kterou odkaz míří: stránka může mít vlastní
 * `buttonText` (návod na délku nitě, sedlářský steh, hrany), jinak „Animace postupu“.
 */
export function animationButtonText(href: string): string {
  const path = href.split('#')[0];
  const page = Object.values(animationPages).find((p) => p.path === path);
  return page && 'buttonText' in page ? page.buttonText : 'Animace postupu';
}

/**
 * Odkaz z kroku lekce na animaci; bez `section` se stránka otevře od začátku. `section` je
 * buď část (`B`, `anim-dno`), nebo krok (`B3`) – popisek pak nese číslo a název kroku.
 */
export function animationLink<P extends AnimationPageKey>(
  page: P,
  section?: AnimationAnchor<P>,
): AnimationLink {
  const def = animationPages[page];
  if (section === undefined) return { href: def.path, label: def.title };
  const sections: Readonly<Record<string, string>> = def.sections;
  const sectionLabel = sections[section];
  if (sectionLabel !== undefined) return { href: `${def.path}#${section}`, label: sectionLabel };
  const stepTitle = animationStepTitle(page, section);
  if (stepTitle === undefined) {
    throw new Error(`Animace ${def.path} nemá kotvu #${section}.`);
  }
  return { href: `${def.path}#${section}`, label: `Krok ${section} – ${stepTitle}` };
}

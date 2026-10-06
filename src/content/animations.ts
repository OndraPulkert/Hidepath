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
        'Položte 2. výtisk na rub a zarovnejte na osy',
        'Obtáhněte obrys šídlem nebo tužkou',
        'Přeneste kružnici okna',
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
  threadLength: {
    path: '/animace/delka-nite.html',
    title: 'Kolik nitě na šev',
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

/** Text tlačítka v kroku: návod s kalkulačkou délky nitě není animace. */
export function animationButtonText(href: string): string {
  return href.startsWith(animationPages.threadLength.path) ? 'Jak odměřit nit' : 'Animace postupu';
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

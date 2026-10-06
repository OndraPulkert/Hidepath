import { type AnimationLink } from '@/content/schema';

/**
 * Animace postupu: samostatné HTML stránky v `public/animace`. Build je zkopíruje do `dist/`,
 * service worker je precachuje (fungují offline v nainstalované PWA) a Worker je servíruje
 * přímo jako soubor, ne jako SPA. Kroky lekcí na ně odkazují přes `animationLinks`.
 *
 * `sections` = kotvy, které stránka umí otevřít, s popiskem pro tlačítko v kroku:
 * - kapsa-postup: `#A`–`#E` skočí na první krok dané části a přehrává od ní,
 * - kapsa-prisiti: `#A`–`#D` otevře první krok dané části (zastavený, přehrání tlačítkem),
 * - Víčko: `#anim-…` posune stránku na danou animaci (spustí se, když je vidět).
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
  { path: `/animace/${string}.html`; title: string; sections: Record<string, string> }
>;

export type AnimationPageKey = keyof typeof animationPages;
type SectionOf<P extends AnimationPageKey> = keyof (typeof animationPages)[P]['sections'] & string;

/** Text tlačítka v kroku: návod s kalkulačkou délky nitě není animace. */
export function animationButtonText(href: string): string {
  return href.startsWith(animationPages.threadLength.path) ? 'Jak odměřit nit' : 'Animace postupu';
}

/** Odkaz z kroku lekce na animaci; bez `section` se stránka otevře od začátku. */
export function animationLink<P extends AnimationPageKey>(
  page: P,
  section?: SectionOf<P>,
): AnimationLink {
  const def = animationPages[page];
  if (section === undefined) return { href: def.path, label: def.title };
  const sections: Readonly<Record<string, string>> = def.sections;
  return { href: `${def.path}#${section}`, label: sections[section] ?? def.title };
}

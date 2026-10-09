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
 * - pas-prenos-rez a pas-otvory-dna (obě `#A`–`#E`): stejně jako kapsa-prisiti,
 * - sedlarsky-steh a hrany (`#A`–`#G`): stejně jako kapsa-prisiti, společné pro všechny projekty,
 * - vicko-ohyby (`#A` ohyb dna, `#B` závěs): stejně jako kapsa-prisiti; staré `#anim-dno`
 *   a `#anim-zaves` stránka dál bere jako `#A` a `#B`,
 * - vicko-magnet (`#A`–`#B`): stejně jako kapsa-prisiti; `#vymena` posune na rámeček výměny
 *   magnetu, staré `#anim-plisek` a `#anim-magnet` stránka dál bere jako `#A` a `#B`,
 * - vicko-p1-rez (`#A`–`#E`), vicko-okenka (`#A`–`#D`), vicko-d2-zada (`#A`–`#D`)
 *   a vicko-telo-s4s5 (`#A`–`#E`): stejně jako kapsa-prisiti,
 * - pasek-prezka (`#A`–`#E`) a pasek-spicka (`#A`–`#F`): stejně jako kapsa-prisiti; kresba je
 *   příklad 40 × 3,5 mm, čísla pro vlastní pásek jsou v tabulce „Váš pásek“,
 * - vrtani-formy (`#A`–`#E`): stejně jako kapsa-prisiti; korunka Ø 32 na unášeči, vrtačka,
 *   upnutí desky a vrtání formy z lekce 2 pouzdra s mincí.
 * - pasek-sirka-konec (`#A`–`#D`): stejně jako kapsa-prisiti; šířka podle přezky, hrot, nebo
 *   zaoblený konec, co zvládne destička a zadání na stránce „Váš pásek“ (lekce 1 pásku).
 * - posuvka (`#A`–`#D`): stejně jako kapsa-prisiti; analogová posuvka s noniem 0,1 mm, měření
 *   tloušťky kůže a průměr z více míst (příklad z Víčka). Odkazují na ni kroky, kde se posuvkou
 *   měří tloušťka kůže, a pole tloušťky ve „Váš pásek“.
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
      B: 'Část B – značky na líc',
      C: 'Část C – osy a šablona na rub',
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
        'Vystřihněte výtisk na značky nahrubo',
        'Přilepte ho maskovací páskou na LÍC',
        'Šídlem propíchněte 23 teček a 4 konce os',
        'Pásku strhněte pomalu',
        'Zkontrolujte, že se přenesly všechny značky',
        'Na líc nic nekreslete',
        'Prosekejte otvory švu z líce',
      ],
      C: [
        'Otočte kůži a narýsujte osy na rubu',
        'Vysekněte okno do výtisku na šablonu',
        'Položte šablonu na rub a zarovnejte na osy',
        'Obtáhněte obrys šídlem nebo tužkou',
        'Obtáhněte kružnici okna v otvoru papíru',
        'Obrys teď neřežte',
      ],
      D: [
        'Navlhčete kůži',
        'Položte kůži lícem dolů na formu',
        'Přiklopte víkem a stáhněte dvěma svěrkami',
        'Nechte zaschnout přes noc',
        'Rozepněte a zkontrolujte důlek',
      ],
      E: [
        'Vraťte kůži lícem dolů na formu',
        'Vyřízněte obrys 2–3 lehkými tahy',
        'Podložte důlek, vysekněte okno Ø 20',
        'Vyzkoušejte, že mince nepropadne',
      ],
    },
  },
  pocketAttach: {
    path: '/animace/kapsa-prisiti.html',
    title: 'Přišití kapsy na pouzdro',
    sections: {
      A: 'Část A – šablona s okénkem',
      B: 'Část B – lepení',
      C: 'Část C – prosekání skrz obě vrstvy',
      D: 'Část D – šití',
    },
    steps: {
      A: ['Vystřihněte okénko z 2. výtisku PÁS', 'Přilepte šablonu na pás, hrany na hrany'],
      B: [
        'Vložte kapsu do okénka',
        'Propíchněte čáru švu do panelu',
        'Zdrsněte pruh po čáru švu',
        'Naneste lepidlo do pruhu po čáru švu',
        'Nechte lepidlo odvětrat',
        'Přitiskněte kapsu a sejměte šablonu',
      ],
      C: [
        'Výchozí stav: otvory jen v kapse',
        'Položte pás na děrovací desku',
        'Prosekejte tytéž otvory skrz obě vrstvy',
        'Řez: otvory lícují skrz obě vrstvy',
      ],
      D: [
        'Připravte nit asi 0,8 m',
        'Přišijte kapsu sedlářským stehem',
        'Kontrola: kapsa přišitá, horní hrana volná',
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
      A: ['Přehled: tři panely, dva ohyby', 'Přehled: otvory dna zrcadlené přes ohyby'],
      B: [
        'Navlhčete pásma obou ohybů',
        'Přeložte vnitřní panel ohybem B',
        'Přeložte zadní panel ohybem A',
        'Přitiskněte a nechte zaschnout',
      ],
      C: [
        'Vyjměte obsah a rozevřete jen do pravého úhlu',
        'Zdrsněte a natřete spoj 1',
        'Přeložte, zarovnejte a přitiskněte',
        'Stejně připravte spoj 2',
        'Přeložte zadní panel a přitiskněte',
      ],
      D: [
        'Připravte nit na šev dna',
        'Prošijte dno skrz tři vrstvy',
        'Zajistěte konec a zkontrolujte rub',
      ],
      E: ['Kontrola: ohyby, lepení a šev'],
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
        'Připravte si druk a návod',
        'Označte dřík 9,5 mm od okraje',
        'Vysekněte otvor, pokud ho návod vyžaduje',
        'Osaďte dřík s hlavičkou',
        'Osaďte klobouček na druhém odřezku',
        'Zacvakněte, zavřete a znovu otevřete',
        'Změřte přírubu patice: nejvýš Ø 11 mm',
      ],
      B: [
        'Najděte značku středu dříku',
        'Vysekněte otvor pro dřík, pokud ho návod vyžaduje',
        'Osaďte dřík naplocho, hlavičkou na líc',
        'Kontrola: dřík naplocho před složením',
      ],
      C: [
        'Vložte obsah a přehněte jazyk',
        'Obtiskněte polohu kloboučku',
        'Vysekněte otvor pro klobouček, pokud ho návod vyžaduje',
        'Osaďte klobouček se zdířkou',
        'Zkraťte jazyk 11 mm za střed kloboučku',
      ],
      D: ['Kontrola: druk drží', 'Kontrola: jazyk končí asi 21 mm nad kapsou'],
    },
  },
  stripTransfer: {
    path: '/animace/pas-prenos-rez.html',
    title: 'Přenos a řez pásu',
    sections: {
      A: 'Část A – šablona a značky',
      B: 'Část B – čáry ohybů na rubu',
      C: 'Část C – rovné řezy',
      D: 'Část D – výkus a rohy',
      E: 'Část E – sejmutí a kontrola',
    },
    steps: {
      A: [
        'Šablonu PÁS vystřihněte nahrubo',
        'Přilepte šablonu na LÍC',
        'Propíchněte šídlem všechny značky',
      ],
      B: ['Otočte kůži i se šablonou rubem nahoru', 'Spojte kroužky tužkou podle pravítka'],
      C: [
        'Řežte rovně podle pravítka',
        'Prořízněte všechny rovné strany',
        'Třepí se řez? Odlomte článek čepele',
      ],
      D: ['Vyřízněte zaoblení R2,5', 'Řežte výřez na prst bez pravítka', 'Vyřízněte rohy R10 a R6'],
      E: ['Sejměte šablonu a zkontrolujte značky', 'Kontrola: pás a čáry ohybů na rubu'],
    },
  },
  bottomHoles: {
    path: '/animace/pas-otvory-dna.html',
    title: 'Otvory dna naplocho',
    sections: {
      A: 'Část A – příprava',
      B: 'Část B – přední z líce',
      C: 'Část C – zadní a vnitřní z rubu',
      D: 'Část D – kontrola',
      E: 'Část E – lekce 4: proužek',
    },
    steps: {
      A: [
        'Položte pás lícem nahoru na desku',
        'Poloha otvorů dna',
        'Postavte vidličky kolmo a udeřte',
      ],
      B: [
        'Prosekejte přední panel z líce',
        'Navazujte řadu do posledního otvoru',
        'Dokončete řadu dvojhrotem',
      ],
      C: [
        'Pás otočte rubem nahoru',
        'Prosekejte zadní panel z rubu',
        'Prosekejte vnitřní panel z rubu',
      ],
      D: ['Kontrola: sklon a počet otvorů', 'Proč sekat z obou stran'],
      E: ['Prosekejte cvičný proužek stejně', 'Po složení zkontrolujte otvory'],
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
        'Navlékněte druhou jehlu a zatáhněte',
      ],
      B: ['Sevřete díl mezi koleny', 'Nebo ho upněte svěrkou'],
      C: ['Vyrovnejte nit v prvním otvoru'],
      D: [
        '1. Přední jehlu prostrčte dozadu',
        '2. Zadní jehlu prostrčte dopředu nad nití',
        '3. Obě nitě utáhněte stejnou silou',
        'Opakujte vždy ve stejném pořadí',
        'Řez: dvě nitě se v každém otvoru kříží',
      ],
      E: ['Na konci prošijte zpět dva otvory', 'Zajistěte začátek i konec švu'],
      F: [
        'Oba konce vyveďte na rub',
        'Odstřihněte těsně u kůže a přimáčkněte',
        'Polyester zatavte jen na rubu',
      ],
      G: [
        'Kontrola: stehy na líci',
        'Kontrola: rovná řada na rubu',
        'Kontrola: slepené díly a šev',
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
      H: 'Část H – pásek',
    },
    steps: {
      A: ['Přehled hran', 'Srovnejte hrany smirkem'],
      B: ['Zaoblete hrany dna', 'Zkoste nebo zaoblete hrany'],
      C: ['Obarvěte hrany barvené kůže'],
      D: [
        'Navlhčete hranu vodou nebo pastou',
        'Zaleštěte hranu leštítkem',
        'Bez leštítka použijte plátno',
      ],
      E: ['Chyba: leštění před srovnáním hran', 'Kontrola: zaleštěné hrany i výřez'],
      F: [
        'Dokončete skryté hrany a zapečeťte rub',
        'Obarvěte a zaleštěte hrany kapsy',
        'Přebruste a zaoblete dno, zaleštěte hrany',
      ],
      G: [
        'Dokončete hrany před sestavením',
        'Obarvěte horní hranu D1',
        'Zarovnejte a vyleštěte boky',
        'Dokončete hrany okének, D2 a jazýčku',
      ],
      H: [
        'Zkoste nebo zaoblete hrany pásu',
        'Obarvěte hrany pásu (jen barevný pásek)',
        'Zaleštěte hrany pásu',
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
      A: 'Ohyb dna krok za krokem',
      B: 'Závěs krok za krokem',
    },
    steps: {
      A: [
        'Výchozí stav: rýha na rubu',
        'Navlhčete pás ohybu',
        'Počkejte, až se barva skoro vrátí k suché',
        'Položte vložku hranou na čáru',
        'Přehněte F lícem ven přes vložku',
        'Vložte fólii na vlhký líc',
        'Vložte spodních 20 mm mezi prkénka',
        'Stáhněte svěrkami',
        'Nechte vyschnout přes noc',
        'Vysuňte vložku bokem',
        'Kontrola: F jde odklopit',
      ],
      B: [
        'Vložte obsah stavu B',
        'Navlhčete jen pás závěsu',
        'Zavřete víčko přes obsah',
        'Vložte fólii mezi závěs a knihu',
        'Nechte přes noc pod knihou',
        'Kontrola: víčko se samo zavírá',
        'Otevřené víčko samo nestojí',
      ],
    },
  },
  lidMagnet: {
    path: '/animace/vicko-magnet.html',
    title: 'Magnet ve Víčku',
    sections: {
      A: 'Část A – plíšek mezi F a D1',
      B: 'Část B – magnet a podšívka L1 na jazýčku',
      vymena: 'Výměna magnetu',
    },
    steps: {
      A: [
        'Položte F rubem nahoru na desku',
        'G1: přilepte plíšek na rub F',
        'G2 a G2b: naneste lepidlo',
        'Přilepte D1 rubem na rub F',
        'Změřte polohu D1 a přitlačte paličkou',
        'Pozor: plíšek už nevyměníte',
      ],
      B: [
        'Najděte plíšek a označte polohu magnetu',
        'Nanečisto: který magnet',
        'Zdrsněte rub konce jazýčku',
        'Přilepte magnet epoxidem',
        'Doraz ze šablony, páska a lepidlo',
        'Přiložte L1 k pásce',
        'Nechte 24 h vytvrdit',
        'Ořízněte špičku R10 a boky L1',
        'Zbruste klín v posledních 2,5 mm',
        'Propíchněte a děrujte S7',
        'Ušijte S7, pak dokončete hrany',
        'Kontrola: magnet drží přes L1 a F',
      ],
    },
  },
  lidP1Cut: {
    path: '/animace/vicko-p1-rez.html',
    title: 'Přenos a řez pásu P1',
    sections: {
      A: 'Část A – list 1 na líc',
      B: 'Část B – propíchnout značky',
      C: 'Část C – řez P1',
      D: 'Část D – sejmout list',
      E: 'Část E – rub podle listu 2',
    },
    steps: {
      A: ['List 1 vystřihněte nahrubo', 'Přilepte list 1 na LÍC'],
      B: ['Propíchněte středy výsečníků'],
      C: [
        'Vysekněte napojení jazýčku Ø 8',
        'Řízněte tečné řezy u pravítka',
        'Prořízněte dlouhé boky P1',
        'Řežte oblouky bez pravítka',
        'Řízněte horní hranu F rovně',
        'Konec jazýčku nechte rovný',
      ],
      D: ['Strhněte pásku a sejměte list', 'Zkontrolujte značky a kótu P1'],
      E: [
        'Vyřízněte šablonu z listu 2',
        'Přiložte šablonu na rub P1',
        'Propíchněte rohy ploch a konce čar',
        'Spojte tečky tužkou u pravítka',
        'Narýsujte rysky a napište „L“',
      ],
    },
  },
  lidWindows: {
    path: '/animace/vicko-okenka.html',
    title: 'Okénka a výřez pro palec',
    sections: {
      A: 'Část A – okénka mincí',
      B: 'Část B – výřez pro palec',
      C: 'Část C – okénko bankovek',
      D: 'Část D – chyba: řez za tečnu',
    },
    steps: {
      A: [
        'Poloha okének mincí',
        'Přiložte šablonu na propíchnuté středy',
        'Vysekněte oba konce Ø 12',
        'Řízněte od tečny k tečně',
        'Druhé okénko stejně, dobruste konce',
      ],
      B: [
        'Poloha výřezu pro palec',
        'Přiložte šablonu výřezu na osu',
        'Vysekněte Ø 10 přes šablonu',
        'Řízněte od hrany F k tečnám',
        'Zaoblete rohy a hrany výřezu',
      ],
      C: [
        'Okénko dělejte až po lepení G3',
        'Přiložte šablonu křížky na středy',
        'Vysekněte Ø 14 skrz B i D2',
        'Řízněte rovně skrz obě vrstvy',
        'Zkoste a vyleštěte jako svazek',
      ],
      D: ['Správně: řez končí na tečně', 'Chyba: nůž přejede tečnu', 'Proč zastavit na tečně'],
    },
  },
  lidBackD2: {
    path: '/animace/vicko-d2-zada.html',
    title: 'D2 na záda a švy S1–S3',
    sections: {
      A: 'Část A – G3: D2 na rub zad',
      B: 'Část B – okénko bankovek',
      C: 'Část C – S1–S3 na líc D2',
      D: 'Část D – děrovat a šít',
    },
    steps: {
      A: [
        'Výchozí stav: rub B s čarami',
        'Hranici lepení přelepte maskovací páskou',
        'Naneste lepidlo jen do pásů',
        'Nechte zavadnout 10–15 min',
        'Přiložte D2 rubem na rub B',
        'Přitlačte, děrujte nejdřív za 1 h',
      ],
      B: [
        'Přiložte šablonu na propíchnuté středy',
        'Vysekněte okénko skrz obě vrstvy',
        'Zkoste a vyleštěte okénko',
      ],
      C: [
        'Způsob (a): propíchněte přes list 1',
        'Způsob (a): otočte na líc D2',
        'Způsob (b): propíchněte tečky šablony D2',
        'Způsob (b): vpichy jsou na líci D2',
      ],
      D: [
        'Děrujte z líce D2',
        'Děrujte S1: 21 otvorů',
        'Děrujte S2 a S3: po 13 otvorech',
        'Šijte sedlovým stehem, konce 2 otvory zpět',
        'Kontrola: lepení, okénko a švy',
      ],
    },
  },
  lidBodySides: {
    path: '/animace/vicko-telo-s4s5.html',
    title: 'Složení těla a boční švy',
    sections: {
      A: 'Část A – nanečisto',
      B: 'Část B – lepení G4',
      C: 'Část C – čára a otvory',
      D: 'Část D – děrování',
      E: 'Část E – šití',
    },
    steps: {
      A: ['Výchozí stav: řez bokem', 'Nanečisto složte a zkontrolujte'],
      B: [
        'Zdrsněte líc D2',
        'Naneste lepidlo a nechte zavadnout',
        'Přikládejte od ohybu dna nahoru',
        'Kontrola: kapsa 93 mm',
      ],
      C: ['Přeneste otvory z proužku', 'Narýsujte čáru švu mezi otvory'],
      D: [
        'Před děrováním počkejte aspoň 1 h',
        'Děrujte y 8–52 z líce F',
        'Děrujte y 56–68 po jednom',
        'Děrujte y 72–76 z líce D2',
      ],
      E: [
        'Odměřte nit: 5 × šev + 25–30 cm',
        'Začněte u y 76, 2 otvory zpět',
        'Šijte dolů k horní hraně F',
        'Steh 60–64 zdvojte',
        'Došijte k y 8, 2 otvory zpět',
        'Zkontrolujte a ušijte druhý bok',
      ],
    },
  },
  beltBuckleEnd: {
    path: '/animace/pasek-prezka.html',
    title: 'Pásek: konec s přezkou',
    sections: {
      A: 'Část A – destička, nebo list',
      B: 'Část B – značení na rubu',
      C: 'Část C – výsek',
      D: 'Část D – poutko',
      E: 'Část E – ohyb a nýty',
    },
    steps: {
      A: ['Řada 3, nebo list 1', 'List 1: přeměřte čtverec'],
      B: [
        'Upevněte pás a destičku',
        'Přiložte řadu 3',
        'Označte 2 otvory pro nýty',
        'Značky ohybu a ovál',
        'Zkontrolujte značky',
        'S listem 1',
      ],
      C: [
        'Vysekněte první dvojici',
        'Konce oválu Ø 6',
        'Boky oválu nožem',
        'Zaleštěte hranu oválu',
      ],
      D: ['Změřte poutko proužkem', 'Vyřízněte a slepte poutko', 'Navlékněte poutko na pás'],
      E: [
        'Ohněte konec kolem příčky',
        'Posuňte poutko na přehnutý konec',
        'Označte druhou dvojici skrz otvory',
        'Vysekněte druhou dvojici',
        'Ohněte zpět a vraťte poutko',
        'Sešroubujte nýty',
        'Hotový konec v řezu',
      ],
    },
  },
  beltHolesTip: {
    path: '/animace/pasek-spicka.html',
    title: 'Pásek: dírky a špička',
    sections: {
      A: 'Část A – prostřední dírka',
      B: 'Část B – hrot, řada 1',
      C: 'Část C – zaoblený, řada 2',
      D: 'Část D – list 2',
      E: 'Část E – dírky a konec',
      F: 'Část F – hrany a zkouška',
    },
    steps: {
      A: [
        'Vyzkoušejte pásek na sobě',
        'Změřte a porovnejte',
        'Propíchněte značku na rub',
        'Stačí pás?',
      ],
      B: [
        'Řada 1 nebo 2, nebo list 2',
        'Přiložte na prostřední dírku',
        'Označte v jednom přiložení',
      ],
      C: ['Přiložte řadu 2 na prostřední dírku', 'Označte v jednom přiložení'],
      D: ['Vytiskněte list 2', 'Přiložte list a propíchněte'],
      E: [
        'Vysekněte dírky',
        'Uřízněte boky hrotu',
        'Uřízněte vrchol R4',
        'Uřízněte zaoblený konec',
      ],
      F: ['Dokončete hrany', 'Natřete balzámem', 'Vyzkoušejte všechny dírky'],
    },
  },
  beltWidthTip: {
    path: '/animace/pasek-sirka-konec.html',
    title: 'Pásek: šířka a konec',
    sections: {
      A: 'Část A – přezka = šířka',
      B: 'Část B – hrot, nebo zaoblený',
      C: 'Část C – co umí destička',
      D: 'Část D – kde to zadat',
    },
    steps: {
      A: [
        'Velikost přezky = vnitřní světlost',
        'Pás je stejně široký jako přezka',
        'Aplikace počítá 28–45 mm',
      ],
      B: ['Hrot, nebo zaoblený', 'Délka konce podle šířky'],
      C: ['Co umí destička', 'Zaoblený jinak než 30 a 40 mm: list 2', 'Rychlé rozhodnutí'],
      D: [
        'Zadejte šířku, konec a barvu ve „Váš pásek“',
        'Štítek „Destička“ pod zadáním',
        'Nahoře souhrn „Koupit“',
      ],
    },
  },
  caliper: {
    path: '/animace/posuvka.html',
    title: 'Jak měřit posuvkou',
    buttonText: 'Jak měřit posuvkou',
    sections: {
      A: 'Část A – posuvka',
      B: 'Část B – měření kůže',
      C: 'Část C – čtení',
      D: 'Část D – průměr a zadání',
    },
    steps: {
      A: ['Poznejte svou posuvku', 'Zkontrolujte nulu', 'Ověřte si nonius: spočítejte čárky'],
      B: ['Vložte kůži mezi velké čelisti', 'Zajistěte a dívejte se zpříma'],
      C: [
        'Celé milimetry',
        'Desetiny milimetru',
        'Příklad: kozinka 0,9 mm',
        'Příklad: kaštan 1,1 mm',
        'Příklad: přesně 1,0 mm',
      ],
      D: ['Změřte víc míst a spočítejte průměr'],
    },
  },
  drillForm: {
    path: '/animace/vrtani-formy.html',
    title: 'Vykružovací korunka na vrtačku',
    sections: {
      A: 'Část A – díly sady',
      B: 'Část B – korunka na unášeč',
      C: 'Část C – do vrtačky',
      D: 'Část D – upnutí desky',
      E: 'Část E – vrtání',
    },
    steps: {
      A: ['Poznejte díly unášeče', 'Korunka Ø 32 a červený kroužek', 'Než začnete: bezpečnost'],
      B: [
        'Nastavte středicí vrták',
        'Sundejte matici',
        'Nasuňte korunku ze strany stopky',
        'Našroubujte a dotáhněte matici',
        'Zkontrolujte upnutí',
      ],
      C: ['Upněte stopku do sklíčidla', 'Nastavte vrtačku'],
      D: [
        'Připravte stůl, odpadní prkno a 2 svěrky',
        'Položte odpadní prkno a na něj desku',
        'Upněte desku dvěma svěrkami',
        'Zkontrolujte upnutí',
        'Druhá strana: otočte a znovu upněte',
      ],
      E: [
        'Nasaďte středicí vrták do křížku',
        'Vrtejte, dokud středicí vrták neprojde',
        'Otočte desku a dokončete z druhé strany',
        'Vypáčte špunt z korunky',
        'Zaoblete hranu otvoru',
      ],
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
 * `label` popisek nahradí (kotvu stránka dál ověří), např. když krok lekce otevírá několik
 * částí jedné stránky a každé tlačítko má říct, co ukazuje.
 */
export function animationLink<P extends AnimationPageKey>(
  page: P,
  section?: AnimationAnchor<P>,
  label?: string,
): AnimationLink {
  const link = defaultAnimationLink(page, section);
  return label === undefined ? link : { ...link, label };
}

function defaultAnimationLink<P extends AnimationPageKey>(
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

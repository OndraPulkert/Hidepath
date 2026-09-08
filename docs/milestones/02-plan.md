# Milník 2 – plán (statický vertikální řez)

Stav: hotovo 2026-09-07, viz [shrnutí](./02-staticky-vertikalni-rez.md). Navazuje na ADR 001 a poznámky k obsahu vybavení.

1. **Typy a schémata** (`src/content/schema.ts`): `EquipmentDefinition`, `EquipmentRequirement`,
   `LessonDefinition` se `steps[]`, `CheckpointDefinition`, `MediaSlot`, `ProjectDefinition`,
   `Phase`. Zod validace obsahu při buildu i v testu.
2. **Obsah pouzdra na karty** (`src/content/projects/card-holder/`): 12 položek vybavení
   (nezbytné / doporučené / později) s detailem podle prototypu, 6 lekcí ve 3 fázích s kroky,
   kontrolními body a `media` sloty s popisky záběrů. Rozteč „3,85–4 mm“. Vše označeno
   `reviewStatus: 'draft'`.

   Osnova lekcí (upraveno 2026-09-04 po diskusi s autorem – vše se nejdřív trénuje na
   odřezcích, na finální díly se sahá až od lekce 5):

   | #   | Lekce                                                | Fáze               | Materiál                        | Nově oproti prototypu                                                                                                 |
   | --- | ---------------------------------------------------- | ------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
   | 1   | Příprava pracovního místa **a seznámení s nástroji** | Příprava místa     | odřezek                         | kontrola nástrojů (rozteč vidliček, navlečení nití do obou jehel, první přitisknutí vidliček), bez ambice na výsledek |
   | 2   | Rovný řez kůže                                       | Trénink na odřezku | odřezek                         | –                                                                                                                     |
   | 3   | Děrování vidličkami                                  | Trénink na odřezku | odřezek                         | výslovně: HDPE deska pod kůži, ne řezací podložka                                                                     |
   | 4   | **Lepení, děrování dvou vrstev a sedlářský steh**    | Trénink na odřezku | 2 odřezky, ideálně třísločiněné | celá sekvence lepit → děrovat → šít v malém; dosud se lepení poprvé objevilo až v lekci 6                             |
   | 5   | Přenesení šablony a řezání dílů                      | Výroba pouzdra     | finální kůže                    | –                                                                                                                     |
   | 6   | Sestavení pouzdra (lepení, děrování, šití, hrany)    | Výroba pouzdra     | finální kůže                    | –                                                                                                                     |

   Lekce 5 a 6 jsou zamčené, dokud nejsou dokončené kontrolní body lekcí 2–4. Samostatná
   „nultá lekce vyzkoušej všechno“ se nezavádí – zdvojovala by lekce 2–4 bez návodu, jak poznat
   dobrý výsledek. Doporučení k materiálu v lekci 1: koupit víc odřezků, poslední trénink
   (lekce 4) dělat na třísločiněné kůži podobné tloušťky jako finální díly.

3. **Seznam záběrů**: skript `pnpm content:shot-list` vygeneruje `docs/content/shot-list.md`
   ze všech `media` slotů (lekce · krok · typ · popis · stav).
4. **Doménové funkce** (`src/features/…`, čisté, testované): připravenost vybavení, blokování
   jen nezbytnými položkami, odemykání lekcí (prerekvizity + vybavení), aktuální lekce, postup
   celé cesty a fáze z kontrolních bodů, zbývající rozpočet (nezbytné / doporučené zvlášť,
   objednané zůstává v nákladech s označením), evidované náklady dílny.
5. **Lokální stav** pro proklik před Supabase: inventář a postup v React Query s persistencí
   do localStorage (adaptér s rozhraním, které v M3/M4 nahradí Supabase + Dexie).
6. **Obrazovky podle prototypu**: dashboard s fázovou lištou a tmavou next-action kartou,
   nákupní seznam se segmentem stavu a filtry, detail položky, dílna s „Evidované náklady“,
   přehled projektu s náhledem šablony, mobilní lekce s kroky, kontrolními body, zámkem s
   odkazem na chybějící položku a spodní lištou.
7. **Ilustrace geometrie** (inline SVG): šablona 1:1 s kótami, vzdálenost stehu od hrany,
   úhel čepele, směr jehel sedlářského stehu.
8. **Ověření**: unit testy pravidel podle §13, screenshoty 390/1280, ergonomie lekce na
   telefonu (cíle ≥ 44 px, lišta nepřekrývá obsah).

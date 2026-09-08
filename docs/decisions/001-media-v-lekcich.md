# ADR 001 – Obrázky a videa v lekcích

Datum: 2026-09-04 · Stav: přijato

## Kontext

Textový návod nestačí úplnému začátečníkovi na motorické úkony (držení nože, vedení
vidliček, sedlářský steh). Prototyp má v každé lekci obrazový slot s popiskem a v lekci 2
tlačítko „Video postupu“. Specifikace počítá s fotografiemi „až budou k dispozici“ a s videem
pouze online (network only), bez offline stahování a bez AI hodnocení fotek. Žádné fotky ani
videa zatím neexistují a implementující agent je nevyrobí.

## Rozhodnutí

1. **Každý krok lekce má definovaný záběr.** Obsah lekce (MDX / typované objekty) nese pro
   každý krok pole `media` s typem (`photo` | `video` | `illustration`), popiskem toho, co má
   záběr zachytit, a stavem (`planned` | `available`). Dokud není záběr k dispozici, UI ukáže
   slot s popiskem, ne prázdné místo ani cizí obrázek.
2. **Seznam záběrů je generovaný z obsahu.** Z definic lekcí vznikne strojově přehled všech
   plánovaných záběrů (`docs/content/shot-list.md`), který slouží jako scénář k natočení.
3. **Zdrojem prvních záběrů je autor při vlastním tréninku.** Telefonem natočené kroky na
   odřezku; z videa se vystřihnou fotky a klipy 20–40 s. Autentické záběry prvního pokusu
   odpovídají cílové skupině.
4. **Video se hostuje mimo aplikaci** (YouTube unlisted nebo Supabase Storage) a vkládá
   odkazem / embedem. Odpovídá pravidlu „video network only“, nezvětšuje offline balík a dá se
   vyměnit bez nové verze obsahu.
5. **Geometrie se kreslí, ne fotí.** Šablona 1:1, úhel čepele, vzdálenost stehu od hrany,
   směr jehel v sedlářském stehu – čárové ilustrace ve stylu prototypu (SVG), které agent umí
   vytvořit a které jsou pro začátečníka čitelnější než fotka.
6. **Správně vs. špatně.** Kde to dává smysl, má krok dvojici záběrů: jak výsledek má vypadat a
   jak vypadat nemá (rovný vs. šikmý steh, kolmá vs. zkosená hrana).
7. **Externí videa jen jako dočasná berlička**, vždy označená jako externí zdroj, a pouze po
   ověření konkrétního odkazu. Žádné odkazy se nevymýšlejí.

## Důsledky

- Typ `LessonStep` dostane `media: MediaSlot[]`; komponenta `MediaSlot` umí stav planned /
  photo / video (embed) / illustration (inline SVG).
- Do Milníku 2 přibývá práce na ilustracích geometrie; fotky a videa zůstávají mimo kritickou
  cestu MVP a doplňují se průběžně.
- Offline stahování projektu (Milník 4) zahrnuje fotky a ilustrace, nikdy video.

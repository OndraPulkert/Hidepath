# Hostovaný Supabase projekt

Založeno přes CLI 2026-09-07 (`supabase projects create`).

| Položka     | Hodnota                                                     |
| ----------- | ----------------------------------------------------------- |
| Název       | hidepath                                                    |
| Project ref | `wbniutsavsyqrmokbdlj`                                      |
| Region      | eu-central-1 (Frankfurt)                                    |
| Dashboard   | https://supabase.com/dashboard/project/wbniutsavsyqrmokbdlj |
| API URL     | `https://wbniutsavsyqrmokbdlj.supabase.co`                  |
| Organizace  | OndraPulkert's Org                                          |

Heslo databáze bylo vygenerováno při založení a **není v repozitáři** – bylo předáno jednou v konverzaci,
uložte ho do správce hesel. Potřebujete ho jen pro `supabase link` na jiném stroji a přímý přístup k DB;
`supabase db push` ho vyžaduje také (`--password`). Reset: Dashboard → Project Settings → Database.

## Stav

- Migrace `20260907120000_init.sql` aplikovaná (`supabase db push`).
- Ověřeno integračními testy RLS proti hostované instanci (`pnpm vitest run src/features/data/supabase-rls.test.ts`
  s `HIDEPATH_TEST_SUPABASE_*` mířícími na hostovaný projekt): izolace uživatelů, granty, CHECK, trigger profilu.
  Testovací účty se po testu mažou.
- Auth konfigurace pushnutá z `supabase/config.toml` (`supabase config push`):
  Site URL `http://localhost:5173`, Redirect URLs pro localhost 5173/4173. **Po nasazení doplnit doménu
  aplikace** (`https://<domena>/**`) do `additional_redirect_urls` a `site_url`, pak `supabase config push`.
- E-mailový limit 1 odkaz / minutu (`[auth.email] max_frequency`). Výchozí SMTP Supabase má nízký denní limit;
  pro reálné uživatele nastavit vlastní SMTP (Dashboard → Authentication → SMTP).

## Klíče

Veřejné klíče (`anon` / `publishable`) vypíše `supabase projects api-keys --project-ref wbniutsavsyqrmokbdlj`.
Do prostředí nasazení patří jen:

```
VITE_SUPABASE_URL=https://wbniutsavsyqrmokbdlj.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

`service_role` / `secret` klíč nikdy do klienta, CI proměnných frontendu ani do repozitáře.

## Běžné operace

```bash
supabase link --project-ref wbniutsavsyqrmokbdlj   # jednou na stroji (ptá se na heslo DB)
supabase db push                                     # aplikuje nové migrace
supabase config push                                 # propíše změny auth/api konfigurace
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

## Checklist před spuštěním pro veřejnost (po bezpečnostním review 2026-09-07)

1. **Doména**: v `supabase/config.toml` nastavit `site_url = "https://<domena>"` a
   `additional_redirect_urls = ["https://<domena>/**"]`, localhost položky odebrat, `supabase config push`.
   Dnes hostovaný projekt povoluje jen localhost (pro vývoj proti cloudu).
2. **Vlastní SMTP** (Resend, Postmark, …) a poté zapnout českou šablonu
   `supabase/templates/magic_link.html` (odkomentovat `[auth.email.template.magic_link]`). Šablona
   obsahuje i `{{ .Token }}`, aby šlo do aplikace doplnit zadání kódu pro případ, že se odkaz otevře
   v jiném prohlížeči (instalovaná PWA). Free tier bez vlastního SMTP šablonu nepovolí.
3. **Captcha** na `signInWithOtp` (`[auth.captcha]`, Turnstile) proti zneužití odesílání e-mailů.
4. **Rate limity**: `max_frequency = "1m0s"` je nastaveno; s vlastním SMTP nastavit `email_sent`.
5. **Hesla**: `minimum_password_length = 12` + požadavky – aplikace hesla nepoužívá, platí jen pro
   testovací účty.
6. **Testovací účty**: `pnpm test:db` běží jen proti lokální instanci (remote vyžaduje
   `HIDEPATH_TEST_ALLOW_REMOTE=1`), heslo je náhodné per běh, účty se po testu mažou.
7. **Build**: `pnpm build` odmítne produkční build bez `VITE_SUPABASE_*` nebo s localhost URL;
   lokální ověření buildu přes `pnpm build:local`.
8. **Smazání účtu / export dat** (GDPR) – zatím chybí, plán M5.

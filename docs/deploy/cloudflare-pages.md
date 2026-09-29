# Nasazení na Cloudflare Pages

Hidepath je statická PWA (Vite). Data a přihlášení řeší Supabase (`docs/deploy/supabase.md`),
Cloudflare Pages jen servíruje soubory z `dist/`. Plán Free: neomezený přenos a požadavky na statické
soubory, 500 buildů měsíčně, 1 build najednou (ověřeno 29. 9. 2026,
https://developers.cloudflare.com/pages/platform/limits/).

## Založení projektu (jednou, v prohlížeči)

1. https://dash.cloudflare.com → Workers & Pages → Create → Pages → **Connect to Git** → repozitář
   `OndraPulkert/Hidepath`, větev `main`.
2. Build settings:
   - Framework preset: **None** (nebo Vite)
   - Build command: `pnpm build`
   - Build output directory: `dist`
3. Environment variables (Production):

   | Název                    | Hodnota                                                                                      |
   | ------------------------ | -------------------------------------------------------------------------------------------- |
   | `VITE_SUPABASE_URL`      | `https://wbniutsavsyqrmokbdlj.supabase.co`                                                   |
   | `VITE_SUPABASE_ANON_KEY` | veřejný `anon` klíč – vypíše `supabase projects api-keys --project-ref wbniutsavsyqrmokbdlj` |
   | `PNPM_VERSION`           | `10.33.0`                                                                                    |

   Verzi Node bere build z `.node-version` (22.23.2). **Nikdy** sem nedávat `service_role` / `secret` klíč.

4. Save and Deploy. Adresa bude `https://<projekt>.pages.dev`.

Směrování SPA: v `dist/` není `404.html`, takže Pages vrací `index.html` pro neznámé cesty (režim SPA).

## Po prvním nasazení

1. Do `supabase/config.toml` doplnit adresu aplikace: `site_url = "https://<projekt>.pages.dev"` a
   `additional_redirect_urls` o `"https://<projekt>.pages.dev/**"` (localhost položky nechat pro vývoj),
   pak `supabase config push`. Bez toho odkaz z přihlašovacího e-mailu nepovede zpět do aplikace.
2. Otevřít aplikaci v mobilu, přihlásit se odkazem z e-mailu, zkusit instalaci (Přidat na plochu).

Každý push do `main` spustí nový build. Náhledy z jiných větví jsou na `https://<větev>.<projekt>.pages.dev`.

## Před zveřejněním pro další lidi

Platí checklist v `docs/deploy/supabase.md` (vlastní SMTP, captcha, limity). Bez nich je aplikace
vhodná pro vlastní použití: výchozí SMTP Supabase má nízký limit e-mailů a přihlašování nechrání captcha.

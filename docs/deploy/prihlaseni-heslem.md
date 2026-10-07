# Přihlášení heslem (iPhone, aplikace na ploše)

## Proč

Instalovaná PWA na iPhonu odkaz z e-mailu nepoužije: Mail ho otevře v Safari, které má oddělené
úložiště, takže se přihlásí Safari, ne aplikace. Heslo funguje přímo v aplikaci a nepotřebuje
vlastní SMTP ani úpravu e-mailových šablon. **V Supabase se nic nenastavuje** – přihlášení heslem
(provider Email) je zapnuté ve výchozím stavu.

## Jak to funguje

1. Účet vzniká jen **odkazem e-mailem** (`signInWithOtp`). Registrace heslem na přihlašovací stránce
   záměrně není (žádné potvrzovací e-maily navíc).
2. Po přihlášení odkazem (v prohlížeči) si uživatel nastaví heslo: **Účet → Heslo**
   (`supabase.auth.updateUser({ password })`).
3. V aplikaci na ploše se pak přihlásí **E-mail a heslo** (`supabase.auth.signInWithPassword`).
   Pole mají `autocomplete` `username` / `current-password` / `new-password`, takže heslo nabídne
   a uloží Klíčenka iOS.

Chybová hláška při přihlášení neprozrazuje, jestli účet existuje (špatné heslo, neexistující účet
i účet bez hesla dostanou stejný text s radou „Ještě nemáte heslo? …“).

Kód: `src/features/auth/password.ts` (pravidla, české chyby), `src/pages/login-page.tsx`,
`src/components/account/password-form.tsx`, `src/pages/account-page.tsx`.

## Pravidla hesla

Hostovaný projekt má z `supabase/config.toml` (pushnuto dřív, viz [supabase.md](supabase.md)):
`minimum_password_length = 12`, `password_requirements = "lower_upper_letters_digits"`,
`[auth.email] secure_password_change = false`. Aplikace kontroluje totéž předem
(`PASSWORD_MIN_LENGTH`; test hlídá shodu s `config.toml`). Při změně `config.toml` upravte i konstantu.

`secure_password_change = false` znamená, že přihlášený uživatel heslo změní bez znovuověření.
Kdyby se zapnulo, Supabase vrátí `reauthentication_needed` a aplikace řekne „Přihlaste se znovu
odkazem a hned heslo nastavte“ (čerstvé přihlášení do 24 h stačí).

## Ověření

1. V prohlížeči se přihlaste odkazem → Účet → nastavte heslo → „Heslo uloženo…“.
2. Na iPhonu otevřete Hidepath z plochy → „E-mail a heslo“ → přihlásit.
3. Špatné heslo → „E-mail nebo heslo nesedí…“.

## Zdroje (ověřeno 7. 10. 2026)

- `signInWithPassword` (chyba nerozlišuje neexistující účet a špatné heslo):
  https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- `updateUser` (heslo, volitelný `nonce`): https://supabase.com/docs/reference/javascript/auth-updateuser
- Hesla – změna heslem po přihlášení přes `updateUser`: https://supabase.com/docs/guides/auth/passwords
- Síla hesla, požadované znaky, „méně než 8 znaků se nedoporučuje“, „recently logged in“ = relace
  mladší 24 h, únik hesel jen od Pro plánu: https://supabase.com/docs/guides/auth/password-security
- Kódy chyb `invalid_credentials`, `weak_password`, `same_password`, `reauthentication_needed`,
  `email_not_confirmed`: https://supabase.com/docs/guides/auth/debugging/error-codes
- `reauthenticate()` (pošle kód e-mailem): https://supabase.com/docs/reference/javascript/auth-reauthenticate
- Minimum 6, doporučeno 8+: komentář u `minimum_password_length` v `supabase/config.toml`
  (šablona Supabase CLI).

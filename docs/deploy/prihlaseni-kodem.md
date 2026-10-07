# Přihlášení kódem z e-mailu (hostovaný Supabase)

## Proč

Instalovaná PWA na iPhonu odkaz z e-mailu nedostane: Mail ho otevře v Safari, které má oddělené
úložiště od aplikace na ploše, takže se přihlásí Safari, ne aplikace. Aplikace proto po odeslání
e-mailu ukáže krok **„Opište kód z e-mailu“** a kód ověří přes
`supabase.auth.verifyOtp({ email, token, type: 'email' })`. Odkaz v e-mailu dál funguje v prohlížeči.

Kód (`{{ .Token }}`) se do e-mailu dostane jen z vlastní šablony. Výchozí šablony Supabase obsahují
jen odkaz. Pozor na **nové uživatele**: když je v projektu zapnuté **Confirm email** (na hostovaném
Supabase výchozí), dostane člověk při prvním přihlášení e-mail ze šablony **Confirm signup**, ne
Magic Link. Kód proto musí být v obou šablonách (krok 2). `verifyOtp` s `type: 'email'` ověří kód
z obou.

Kód aplikace: `src/pages/login-page.tsx`, pravidla v `src/features/auth/email-code.ts`.
Šablona: `supabase/templates/magic_link.html`. Lokálně ji zapíná `[auth.email.template.magic_link]`
v `supabase/config.toml` (e-maily uvidíte v Mailpitu, `http://127.0.0.1:54324`).

## Proč nejdřív vlastní SMTP

Od 3. 6. 2026 nové projekty na free tieru s výchozím odesílatelem Supabase **nemohou upravovat
e-mailové šablony**; s vlastním SMTP to jde dál. Projekt Hidepath vznikl 7. 9. 2026, týká se ho to.
Výchozí odesílatel navíc doručuje jen adresám členů týmu projektu a má limit 2 e-maily za hodinu,
pro reálné uživatele tedy vlastní SMTP potřebujete tak jako tak.

## Postup

Projekt: https://supabase.com/dashboard/project/wbniutsavsyqrmokbdlj

Nepoužívejte `supabase config push` jen kvůli šabloně: propsal by celý `config.toml` (včetně
localhost adres v `additional_redirect_urls`). Nastavte vše v Dashboardu.

### 1. Vlastní SMTP

1. Zvolte poskytovatele, např. **Resend**, **Brevo** (oba Supabase uvádí v dokumentaci), nebo Gmail
   s heslem aplikace. Aktuální limity a ceny ověřte přímo u poskytovatele, tady je neuvádíme.
2. U poskytovatele ověřte odesílací doménu nebo adresu (SPF/DKIM podle jeho návodu) a vytvořte
   SMTP přihlašovací údaje.
3. **Supabase Dashboard → Authentication → Emails → SMTP Settings** → zapněte vlastní SMTP a vyplňte:
   - **Host**: SMTP server poskytovatele,
   - **Port**: podle poskytovatele (obvykle 587 s STARTTLS nebo 465 s TLS),
   - **Username**: SMTP uživatel,
   - **Password**: SMTP heslo nebo API klíč (jen sem, nikdy do repozitáře ani do klienta),
   - **Sender email**: odesílací adresa, např. `prihlaseni@<vaše-doména>`,
   - **Sender name**: `Hidepath`.
4. Uložte. Po zapnutí vlastního SMTP nastaví Supabase nízký limit 30 e-mailů za hodinu; podle potřeby
   ho upravte v **Authentication → Rate Limits**.

### 2. Šablony Magic Link a Confirm signup

1. **Supabase Dashboard → Authentication → Emails → Templates → Magic Link**.
2. **Subject**: `Přihlášení do Hidepath`
3. **Message body**: vložte celý obsah souboru `supabase/templates/magic_link.html`.
   Musí obsahovat `{{ .Token }}` (kód) i `{{ .ConfirmationURL }}` (odkaz).
4. Uložte.
5. Totéž (stejný předmět i obsah) udělejte v šabloně **Confirm signup** – tu dostane člověk, který
   se přihlašuje poprvé. Bez toho by nový uživatel na iPhonu kód nedostal.

### 3. Délka a platnost kódu

**Authentication → Sign In / Providers → Email**:

- **Email OTP Length**: nechte `6` (výchozí; Supabase povoluje 6–10 číslic). Aplikace přijme 6–10
  číslic, takže jinou délku zvládne také.
- **Email OTP Expiration**: `3600` s (1 hodina, výchozí). Text v aplikaci i v e-mailu počítá s hodinou;
  když to změníte, upravte i `CODE_EXPIRY_SECONDS` v `src/features/auth/email-code.ts` a texty.

Limit „jeden e-mail za 60 s pro stejného uživatele“ je výchozí. Aplikace podle něj odpočítává tlačítko
„Poslat nový kód“ a při chybě se řídí počtem sekund, který vrátí Supabase.

### 4. Ověření

1. Na iPhonu otevřete Hidepath z plochy → Přihlášení → zadejte e-mail.
2. V Mailu musí být **„Kód pro přihlášení:“** s číslicemi nad tlačítkem s odkazem.
3. Opište kód do aplikace → „Přihlásit“ → aplikace otevře dílnu (nebo stránku, ze které jste šli
   na přihlášení).
4. Na počítači zkuste i odkaz – musí dál přihlásit v prohlížeči.
5. Pošlete si nový kód: platí jen kód z posledního e-mailu, starší vrátí „Kód nesedí…“.
6. Zkuste i úplně novou adresu (nový účet): e-mail musí také obsahovat kód.

## Zdroje (ověřeno 7. 10. 2026)

- Passwordless e-mail (OTP přes šablonu Magic Link s `{{ .Token }}`, `verifyOtp` s `type: 'email'`,
  platnost 1 h, limit 1× za 60 s): https://supabase.com/docs/guides/auth/auth-email-passwordless
- Šablony a proměnné (`{{ .Token }}`, `{{ .ConfirmationURL }}`), stránka Email Templates:
  https://supabase.com/docs/guides/auth/auth-email-templates
- Změna šablon na free tieru od 3. 6. 2026:
  https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier
- Vlastní SMTP (pole, výchozí limit 2/h, jen členové týmu, 30/h po zapnutí, poskytovatelé):
  https://supabase.com/docs/guides/auth/auth-smtp
- Confirm signup a `{{ .Token }}` i v něm:
  https://supabase.com/docs/guides/auth/auth-email-templates (dokumentace výslovně neříká, kterou
  šablonu dostane nový uživatel z `signInWithOtp`; že je to Confirm signup, plyne z chování Supabase
  Auth při zapnutém Confirm email – ověřte krokem 4.6)
- Rate limits (60 s na uživatele, přihlášení a ověření 30 za 5 min na IP):
  https://supabase.com/docs/guides/auth/rate-limits
- `verifyOtp`: https://supabase.com/docs/reference/javascript/auth-verifyotp
- `otp_length` 6–10, `otp_expiry`, `max_frequency`, šablony v `config.toml`:
  https://supabase.com/docs/guides/local-development/cli/config

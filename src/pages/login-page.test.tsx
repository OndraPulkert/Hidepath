import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { PENDING_LOGIN_KEY } from '@/features/auth/email-code';
import { SessionProvider } from '@/features/auth/session-provider';
import { LoginPage } from '@/pages/login-page';

type Listener = (event: string, session: unknown) => void;
interface AuthResult {
  error: { message: string; code?: string; status?: number } | null;
}

const auth = vi.hoisted(() => ({
  listener: null as Listener | null,
  signInWithOtp: vi.fn(),
  signInWithPassword: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: auth.signInWithOtp,
      signInWithPassword: auth.signInWithPassword,
      verifyOtp: auth.verifyOtp,
      signOut: async () => Promise.resolve({ error: null }),
      onAuthStateChange: (listener: Listener) => {
        auth.listener = listener;
        listener('INITIAL_SESSION', null);
        return { data: { subscription: { unsubscribe: () => undefined } } };
      },
    },
  },
}));

const EMAIL = 'ondra@example.com';
const SIGNED_IN = { user: { id: 'u1', email: EMAIL } };
const EXPIRED = { message: 'Token has expired or is invalid', code: 'otp_expired', status: 403 };

function renderLogin(url = '/login?returnTo=%2Fworkshop') {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/workshop', element: <h1>Moje dílna</h1> },
    ],
    { initialEntries: [url] },
  );
  const view = render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
  return { router, ...view };
}

type User = ReturnType<typeof userEvent.setup>;

async function sendLink(user: User) {
  await user.click(screen.getByRole('button', { name: 'Poslat odkaz e-mailem' }));
  await user.type(screen.getByLabelText('E-mail'), EMAIL);
  await user.click(screen.getByRole('button', { name: 'Poslat odkaz' }));
}

async function requestCode(user: User) {
  await sendLink(user);
  await screen.findByRole('heading', { name: 'Opište kód z e-mailu' });
}

beforeEach(() => {
  localStorage.clear();
  auth.listener = null;
  auth.signInWithOtp.mockReset();
  auth.signInWithOtp.mockResolvedValue({ error: null } satisfies AuthResult);
  auth.signInWithPassword.mockReset();
  auth.verifyOtp.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('LoginPage – e-mail a heslo (výchozí)', () => {
  it('je výchozí způsob; pole mají autocomplete pro Klíčenku iOS', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: 'E-mail a heslo' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Heslo')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByLabelText('Heslo')).toHaveAttribute('type', 'password');
  });

  it('správné heslo přihlásí a přesměruje na návratovou adresu', async () => {
    auth.signInWithPassword.mockImplementation(async () => {
      auth.listener?.('SIGNED_IN', SIGNED_IN);
      return Promise.resolve({ data: { session: SIGNED_IN }, error: null });
    });
    const user = userEvent.setup();
    const { router } = renderLogin();
    await user.type(screen.getByLabelText('E-mail'), EMAIL);
    await user.type(screen.getByLabelText('Heslo'), 'Tajne-Heslo-123');
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: EMAIL,
      password: 'Tajne-Heslo-123',
    });
    expect(await screen.findByRole('heading', { name: 'Moje dílna' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/workshop');
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('špatné údaje: obecná česká chyba, neprozradí, jestli účet existuje, a poradí odkaz', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials', code: 'invalid_credentials', status: 400 },
    });
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText('E-mail'), EMAIL);
    await user.type(screen.getByLabelText('Heslo'), 'spatne');
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('E-mail nebo heslo nesedí.');
    expect(alert).toHaveTextContent(
      'Ještě nemáte heslo? Přihlaste se odkazem a nastavte si ho v Účtu.',
    );
    expect(screen.queryByText(/Invalid login credentials/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Přihlásit' })).toBeEnabled();
  });

  it('chyba sítě: řekne, ať zkontrolujete připojení', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Failed to fetch', name: 'AuthRetryableFetchError', status: 0 },
    });
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText('E-mail'), EMAIL);
    await user.type(screen.getByLabelText('Heslo'), 'Tajne-Heslo-123');
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Zkontrolujte připojení/);
  });

  it('výjimka klienta (offline) se hlásí jako chyba sítě', async () => {
    auth.signInWithPassword.mockRejectedValue(new TypeError('Load failed'));
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText('E-mail'), EMAIL);
    await user.type(screen.getByLabelText('Heslo'), 'Tajne-Heslo-123');
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Zkontrolujte připojení/);
  });

  it('bez hesla nebo s neplatným e-mailem nic neodešle', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText('E-mail'), 'neni-email');
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Zadejte platnou e-mailovou adresu.');
    await user.clear(screen.getByLabelText('E-mail'));
    await user.type(screen.getByLabelText('E-mail'), EMAIL);
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Zadejte heslo.');
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });
});

describe('LoginPage – odkaz e-mailem, krok s kódem vypnutý (výchozí)', () => {
  it('po odeslání jen oznámí odkaz; krok s kódem se neukáže ani po reloadu', async () => {
    const user = userEvent.setup();
    const first = renderLogin();
    await user.click(screen.getByRole('button', { name: 'Poslat odkaz e-mailem' }));
    expect(screen.getByText(/odkaz se otevře v Safari/)).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('autocomplete', 'email');
    expect(screen.queryByLabelText('Heslo')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('E-mail'), EMAIL);
    await user.click(screen.getByRole('button', { name: 'Poslat odkaz' }));

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: EMAIL,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?returnTo=%2Fworkshop`,
        shouldCreateUser: true,
      },
    });
    expect(await screen.findByRole('heading', { name: 'Odkaz jsme poslali' })).toBeInTheDocument();
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
    expect(screen.queryByLabelText('Kód z e-mailu')).not.toBeInTheDocument();
    expect(localStorage.getItem(PENDING_LOGIN_KEY)).toBeNull();

    first.unmount();
    renderLogin();
    expect(screen.queryByRole('heading', { name: 'Opište kód z e-mailu' })).not.toBeInTheDocument();
  });

  it('ignoruje rozpracovaný krok s kódem z dřívějška', () => {
    localStorage.setItem(
      PENDING_LOGIN_KEY,
      JSON.stringify({ email: EMAIL, sentAt: Date.now(), resendAt: Date.now() }),
    );
    renderLogin();
    expect(screen.queryByLabelText('Kód z e-mailu')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Heslo')).toBeInTheDocument();
  });

  it('limit e-mailů neradí kód, který v e-mailu není', async () => {
    auth.signInWithOtp.mockResolvedValue({
      error: { message: 'email rate limit exceeded', code: 'over_email_send_rate_limit' },
    } satisfies AuthResult);
    const user = userEvent.setup();
    renderLogin();
    await sendLink(user);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/příliš mnoho e-mailů/);
    expect(alert).not.toHaveTextContent(/kód/);
  });
});

describe('LoginPage – přihlášení kódem z e-mailu (VITE_AUTH_EMAIL_CODE=1)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_AUTH_EMAIL_CODE', '1');
  });

  it('po odeslání ukáže krok s kódem; odkaz dál míří na callback s návratovou adresou', async () => {
    const user = userEvent.setup();
    renderLogin();
    await requestCode(user);

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: EMAIL,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?returnTo=%2Fworkshop`,
        shouldCreateUser: true,
      },
    });
    const input = screen.getByLabelText('Kód z e-mailu');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    expect(screen.getByText(/odkaz se otevře v Safari/)).toBeInTheDocument();
  });

  it('správný kód (i s mezerou) přihlásí a přesměruje jako odkaz', async () => {
    auth.verifyOtp.mockImplementation(async () => {
      auth.listener?.('SIGNED_IN', SIGNED_IN);
      return Promise.resolve({ data: { session: SIGNED_IN }, error: null });
    });
    const user = userEvent.setup();
    const { router } = renderLogin();
    await requestCode(user);

    await user.type(screen.getByLabelText('Kód z e-mailu'), ' 123 456 ');
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));

    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: EMAIL, token: '123456', type: 'email' });
    expect(await screen.findByRole('heading', { name: 'Moje dílna' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/workshop');
    expect(localStorage.getItem(PENDING_LOGIN_KEY)).toBeNull();
  });

  it('dvojí odeslání kódu volá ověření jen jednou a do přesměrování drží „Ověřujeme…“', async () => {
    let finish: (value: AuthResult) => void = () => undefined;
    auth.verifyOtp.mockImplementation(
      async () =>
        new Promise<AuthResult>((resolve) => {
          finish = resolve;
        }),
    );
    const user = userEvent.setup();
    renderLogin();
    await requestCode(user);

    const input = screen.getByLabelText('Kód z e-mailu');
    await user.type(input, '123456');
    const form = input.closest('form');
    if (!form) throw new Error('chybí formulář');
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(auth.verifyOtp).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish({ error: null });
      await Promise.resolve();
    });
    expect(screen.getByRole('button', { name: 'Ověřujeme…' })).toBeDisabled();
  });

  it('přijme i osmimístný kód', async () => {
    auth.verifyOtp.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    renderLogin();
    await requestCode(user);
    await user.type(screen.getByLabelText('Kód z e-mailu'), '12345678');
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: EMAIL, token: '12345678', type: 'email' });
  });

  it('neúplný kód neodešle a řekne proč', async () => {
    const user = userEvent.setup();
    renderLogin();
    await requestCode(user);
    await user.type(screen.getByLabelText('Kód z e-mailu'), '123');
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Opište celý kód z e-mailu, jen číslice.');
    expect(auth.verifyOtp).not.toHaveBeenCalled();
  });

  it('špatný kód: česká chyba, zůstává na kroku s kódem', async () => {
    auth.verifyOtp.mockResolvedValue({ data: {}, error: EXPIRED });
    const user = userEvent.setup();
    renderLogin();
    await requestCode(user);
    await user.type(screen.getByLabelText('Kód z e-mailu'), '000000');
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Kód nesedí. Zkontrolujte ho; platí jen kód z posledního e-mailu.',
    );
    expect(screen.getByLabelText('Kód z e-mailu')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Token has expired or is invalid')).not.toBeInTheDocument();
  });

  it('vypršelý kód: po hodině od odeslání řekne, že kód vypršel', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    auth.verifyOtp.mockResolvedValue({ data: {}, error: EXPIRED });
    const user = userEvent.setup();
    renderLogin();
    await requestCode(user);
    vi.setSystemTime(Date.now() + 59 * 60_000 + 59_000);
    await user.type(screen.getByLabelText('Kód z e-mailu'), '123456');
    vi.setSystemTime(Date.now() + 2_000);
    await user.click(screen.getByRole('button', { name: 'Přihlásit' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Kód už vypršel. Nechte si poslat nový.',
    );
  });

  it('nový kód jde poslat až po 60 s a odpočet běží', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    const user = userEvent.setup();
    renderLogin();
    await requestCode(user);

    expect(screen.getByRole('button', { name: 'Poslat nový kód (za 60 s)' })).toBeDisabled();
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByRole('button', { name: 'Poslat nový kód (za 30 s)' })).toBeDisabled();
    act(() => vi.advanceTimersByTime(30_000));
    const resend = screen.getByRole('button', { name: 'Poslat nový kód' });
    expect(resend).toBeEnabled();

    await user.click(resend);
    expect(auth.signInWithOtp).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(/Poslali jsme nový kód/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Poslat nový kód (za 60 s)' })).toBeDisabled();
  });

  it('limit Supabase („after N seconds“) nastaví odpočet podle serveru', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    const user = userEvent.setup();
    renderLogin();
    await requestCode(user);
    act(() => vi.advanceTimersByTime(60_000));
    auth.signInWithOtp.mockResolvedValueOnce({
      error: {
        message: 'For security purposes, you can only request this after 17 seconds.',
        code: 'over_email_send_rate_limit',
        status: 429,
      },
    } satisfies AuthResult);
    await user.click(screen.getByRole('button', { name: 'Poslat nový kód' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail jsme posílali před chvílí. Nový můžete poslat za 17 s.',
    );
    expect(screen.getByRole('button', { name: 'Poslat nový kód (za 17 s)' })).toBeDisabled();
  });

  it('po reloadu (přepnutí do Mailu a zpět) zůstane krok s kódem i odpočet', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const user = userEvent.setup();
    const first = renderLogin();
    await requestCode(user);
    first.unmount();

    vi.setSystemTime(Date.now() + 20_000);
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Opište kód z e-mailu' })).toBeInTheDocument();
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Poslat nový kód (za 40 s)' })).toBeDisabled();
  });

  it('„Změnit e-mail“ vrátí formulář s předvyplněnou adresou a zapomene krok s kódem', async () => {
    const user = userEvent.setup();
    renderLogin();
    await requestCode(user);
    await user.click(screen.getByRole('button', { name: 'Změnit e-mail' }));
    await user.click(screen.getByRole('button', { name: 'Poslat odkaz e-mailem' }));
    expect(screen.getByLabelText('E-mail')).toHaveValue(EMAIL);
    expect(localStorage.getItem(PENDING_LOGIN_KEY)).toBeNull();
  });

  it('chyba odeslání se zobrazí česky a krok s kódem se neotevře', async () => {
    auth.signInWithOtp.mockResolvedValue({
      error: { message: 'email rate limit exceeded', code: 'over_email_send_rate_limit' },
    } satisfies AuthResult);
    const user = userEvent.setup();
    renderLogin();
    await sendLink(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(/použijte kód/);
    expect(screen.queryByLabelText('Kód z e-mailu')).not.toBeInTheDocument();
  });
});

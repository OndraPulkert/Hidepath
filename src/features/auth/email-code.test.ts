import { createMemoryStorage } from '@/features/data/local-collection';
import {
  CODE_EXPIRY_SECONDS,
  clearPendingLogin,
  describeSendError,
  describeVerifyError,
  isValidCode,
  normalizeCode,
  PENDING_LOGIN_KEY,
  readPendingLogin,
  readRetryAfterSeconds,
  savePendingLogin,
  secondsUntil,
} from '@/features/auth/email-code';

describe('kód z e-mailu', () => {
  it('odstraní mezery a pomlčky', () => {
    expect(normalizeCode(' 123 456\n')).toBe('123456');
    expect(normalizeCode('1234-5678')).toBe('12345678');
  });

  it('přijme 6–10 číslic, nic jiného', () => {
    expect(isValidCode('123456')).toBe(true);
    expect(isValidCode('12345678')).toBe(true);
    expect(isValidCode('1234567890')).toBe(true);
    expect(isValidCode('12345')).toBe(false);
    expect(isValidCode('12345678901')).toBe(false);
    expect(isValidCode('12a456')).toBe(false);
    expect(isValidCode('')).toBe(false);
  });
});

describe('odpočet a limity', () => {
  it('secondsUntil zaokrouhlí nahoru a nikdy není záporné', () => {
    expect(secondsUntil(10_000, 0)).toBe(10);
    expect(secondsUntil(10_000, 9_001)).toBe(1);
    expect(secondsUntil(10_000, 20_000)).toBe(0);
  });

  it('přečte dobu čekání ze zprávy Supabase', () => {
    expect(
      readRetryAfterSeconds('For security purposes, you can only request this after 42 seconds.'),
    ).toBe(42);
    expect(readRetryAfterSeconds('email rate limit exceeded')).toBeNull();
  });

  it('describeSendError rozliší krátký odpočet, hodinový limit, síť a obecnou chybu', () => {
    expect(describeSendError({ message: 'you can only request this after 9 seconds' })).toEqual({
      kind: 'cooldown',
      retryAfterSeconds: 9,
      message: 'E-mail jsme posílali před chvílí. Nový můžete poslat za 9 s.',
    });
    expect(
      describeSendError({
        message: 'email rate limit exceeded',
        code: 'over_email_send_rate_limit',
      }).message,
    ).toMatch(/příliš mnoho e-mailů/);
    expect(
      describeSendError({ message: 'Failed to fetch', name: 'AuthRetryableFetchError' }).message,
    ).toMatch(/připojení/);
    expect(describeSendError({ message: 'Volejte 800 123 456' }).message).toBe(
      'E-mail se nepodařilo odeslat. Zkuste to prosím za chvíli.',
    );
  });

  it('describeVerifyError: špatný vs. vypršelý kód podle času odeslání', () => {
    const error = { message: 'Token has expired or is invalid', code: 'otp_expired' };
    expect(describeVerifyError(error, 0, 60_000)).toMatch(/^Kód nesedí/);
    expect(describeVerifyError(error, 0, CODE_EXPIRY_SECONDS * 1000)).toBe(
      'Kód už vypršel. Nechte si poslat nový.',
    );
    expect(
      describeVerifyError(
        { message: 'Request rate limit reached', code: 'over_request_rate_limit' },
        0,
        1,
      ),
    ).toMatch(/Příliš mnoho pokusů/);
  });
});

describe('rozpracované přihlášení v úložišti', () => {
  const pending = { email: 'a@b.cz', sentAt: 1_000, resendAt: 61_000 };

  it('uloží, přečte a smaže', () => {
    const storage = createMemoryStorage();
    savePendingLogin(storage, pending);
    expect(readPendingLogin(storage, 2_000)).toEqual(pending);
    clearPendingLogin(storage);
    expect(readPendingLogin(storage, 2_000)).toBeNull();
  });

  it('po vypršení kódu nebo s poškozenými daty vrátí null', () => {
    const storage = createMemoryStorage();
    savePendingLogin(storage, pending);
    expect(readPendingLogin(storage, 1_000 + CODE_EXPIRY_SECONDS * 1000)).toBeNull();
    storage.setItem(PENDING_LOGIN_KEY, '{"email":5}');
    expect(readPendingLogin(storage, 2_000)).toBeNull();
    storage.setItem(PENDING_LOGIN_KEY, 'nejson');
    expect(readPendingLogin(storage, 2_000)).toBeNull();
  });

  it('bez úložiště nespadne', () => {
    expect(() => savePendingLogin(null, pending)).not.toThrow();
    expect(readPendingLogin(null, 0)).toBeNull();
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(() => savePendingLogin(throwing, pending)).not.toThrow();
    expect(() => clearPendingLogin(throwing)).not.toThrow();
    expect(readPendingLogin(throwing, 0)).toBeNull();
  });
});

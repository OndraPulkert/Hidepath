import {
  describeSignInError,
  describeUpdatePasswordError,
  PASSWORD_MIN_LENGTH,
  validateNewPassword,
} from '@/features/auth/password';

import supabaseConfig from '../../../supabase/config.toml?raw';

describe('password – pravidla', () => {
  it('minimum odpovídá supabase/config.toml (pushnuto na hostovaný projekt)', () => {
    const config = supabaseConfig;
    expect(config).toMatch(new RegExp(`^minimum_password_length = ${PASSWORD_MIN_LENGTH}$`, 'm'));
    expect(config).toMatch(/^password_requirements = "lower_upper_letters_digits"$/m);
  });

  it('validateNewPassword: prázdné, krátké, slabé, neshodné, v pořádku', () => {
    expect(validateNewPassword('', '')).toBe('Zadejte nové heslo.');
    expect(validateNewPassword('Abc12345678', 'Abc12345678')).toMatch(/^Heslo je krátké/);
    expect(validateNewPassword('abcdefgh1234', 'abcdefgh1234')).toMatch(/^Heslo je slabé/);
    expect(validateNewPassword('ABCDEFGHijkl', 'ABCDEFGHijkl')).toMatch(/^Heslo je slabé/);
    expect(validateNewPassword('Abcdefgh1234', 'Abcdefgh1235')).toBe('Hesla se neshodují.');
    expect(validateNewPassword('Abcdefgh1234', 'Abcdefgh1234')).toBeNull();
  });

  it('describeSignInError: stejná hláška pro špatné heslo i neexistující účet', () => {
    const wrong = describeSignInError({
      message: 'Invalid login credentials',
      code: 'invalid_credentials',
    });
    const unconfirmed = describeSignInError({
      message: 'Email not confirmed',
      code: 'email_not_confirmed',
    });
    expect(wrong).toBe(unconfirmed);
    expect(wrong).toMatch(/Ještě nemáte heslo\?/);
    expect(describeSignInError({ message: 'x', code: 'over_request_rate_limit' })).toMatch(
      /Příliš mnoho pokusů/,
    );
  });

  it('describeUpdatePasswordError: slabé, stejné, znovu přihlásit, obecné', () => {
    expect(
      describeUpdatePasswordError({
        message: 'weak',
        name: 'AuthWeakPasswordError',
        code: 'weak_password',
      }),
    ).toMatch(/^Heslo je slabé/);
    expect(describeUpdatePasswordError({ message: 'x', code: 'same_password' })).toMatch(/jiné/);
    for (const code of ['reauthentication_needed', 'reauthentication_not_valid']) {
      expect(describeUpdatePasswordError({ message: 'x', code })).toMatch(
        /Přihlaste se znovu odkazem a hned heslo nastavte/,
      );
    }
    expect(
      describeUpdatePasswordError({
        message: 'Auth session missing!',
        name: 'AuthSessionMissingError',
      }),
    ).toMatch(/Přihlaste se znovu odkazem/);
    expect(describeUpdatePasswordError({ message: 'Volejte 800 123 456' })).toBe(
      'Heslo se nepodařilo uložit. Zkuste to prosím za chvíli.',
    );
  });
});

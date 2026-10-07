import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PasswordForm } from '@/components/account/password-form';
import { type AuthErrorLike } from '@/features/auth/auth-errors';

const EMAIL = 'ondra@example.com';
const GOOD = 'Kozena-Dilna-2026';

function renderForm(result: AuthErrorLike | null = null) {
  const onSave = vi.fn(async (_password: string) => Promise.resolve(result));
  render(<PasswordForm email={EMAIL} onSave={onSave} />);
  return { onSave, user: userEvent.setup() };
}

async function fill(user: ReturnType<typeof userEvent.setup>, password: string, confirm: string) {
  await user.type(screen.getByLabelText('Nové heslo'), password);
  await user.type(screen.getByLabelText('Heslo znovu'), confirm);
  await user.click(screen.getByRole('button', { name: 'Uložit heslo' }));
}

describe('PasswordForm – nastavení hesla', () => {
  it('pole mají autocomplete new-password a skryté username s e-mailem (Klíčenka iOS)', () => {
    const { container } = render(<PasswordForm email={EMAIL} onSave={vi.fn()} />);
    expect(screen.getByLabelText('Nové heslo')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('Heslo znovu')).toHaveAttribute('autocomplete', 'new-password');
    const username = container.querySelector('input[autocomplete="username"]');
    expect(username).toHaveValue(EMAIL);
  });

  it('Zobrazit/Skrýt přepne viditelnost a při odeslání heslo znovu skryje', async () => {
    const { user } = renderForm();
    const input = screen.getByLabelText('Nové heslo');
    const [toggle] = screen.getAllByRole('button', { name: 'Zobrazit heslo' });
    await user.click(toggle!);
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Uložit heslo' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('neshodná hesla neodešle', async () => {
    const { onSave, user } = renderForm();
    await fill(user, GOOD, `${GOOD}x`);
    expect(screen.getByRole('alert')).toHaveTextContent('Hesla se neshodují.');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('krátké heslo neodešle a řekne pravidla', async () => {
    const { onSave, user } = renderForm();
    await fill(user, 'Kratke1', 'Kratke1');
    expect(screen.getByRole('alert')).toHaveTextContent(/Heslo je krátké\. Aspoň 12 znaků/);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('úspěch: uloží, vyprázdní pole a řekne, jak se přihlásit v aplikaci na ploše', async () => {
    const { onSave, user } = renderForm(null);
    await fill(user, GOOD, GOOD);
    expect(onSave).toHaveBeenCalledWith(GOOD);
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Heslo uloženo – v aplikaci na ploše se teď přihlaste e-mailem a heslem.',
    );
    expect(screen.getByLabelText('Nové heslo')).toHaveValue('');
    expect(screen.getByLabelText('Heslo znovu')).toHaveValue('');
  });

  it('nutné znovu přihlášení: poradí přihlásit se odkazem a hned heslo nastavit', async () => {
    const { user } = renderForm({
      message: 'Password update requires reauthentication',
      code: 'reauthentication_needed',
      status: 400,
    });
    await fill(user, GOOD, GOOD);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Přihlaste se znovu odkazem a hned heslo nastavte\./,
    );
    expect(screen.queryByText(/requires reauthentication/)).not.toBeInTheDocument();
  });

  it('stejné heslo jako dosud: česká chyba', async () => {
    const { user } = renderForm({
      message: 'New password should be different',
      code: 'same_password',
    });
    await fill(user, GOOD, GOOD);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nové heslo musí být jiné než současné.',
    );
  });
});

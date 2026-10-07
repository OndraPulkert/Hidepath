import { type FormEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { type AuthErrorLike } from '@/features/auth/auth-errors';
import {
  describeUpdatePasswordError,
  PASSWORD_RULES_HINT,
  PASSWORD_SAVED_MESSAGE,
  validateNewPassword,
} from '@/features/auth/password';

type FormState =
  { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string };

export interface PasswordFormProps {
  /** E-mail účtu – skryté pole `username`, aby Klíčenka iOS uložila heslo ke správnému účtu. */
  email: string;
  /** Uloží heslo (`supabase.auth.updateUser({ password })`); vrací chybu nebo `null`. */
  onSave: (password: string) => Promise<AuthErrorLike | null>;
}

/** Nastavení / změna hesla přihlášeného uživatele. Pravidla jsou v `features/auth/password`. */
export function PasswordForm({ email, onSave }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState<FormState>({ kind: 'idle' });
  const inFlight = useRef(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const invalid = validateNewPassword(password, confirm);
    if (invalid) {
      setState({ kind: 'error', message: invalid });
      return;
    }
    inFlight.current = true;
    setState({ kind: 'saving' });
    const error = await onSave(password);
    inFlight.current = false;
    if (error) {
      setState({ kind: 'error', message: describeUpdatePasswordError(error) });
      return;
    }
    setPassword('');
    setConfirm('');
    setState({ kind: 'saved' });
  };

  const invalid = state.kind === 'error';

  return (
    <form onSubmit={(event) => void submit(event)} noValidate className="flex flex-col gap-4">
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      <div>
        <Label htmlFor="new-password">Nové heslo</Label>
        <PasswordInput
          id="new-password"
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={invalid ? true : undefined}
          aria-describedby="password-rules"
        />
        <p id="password-rules" className="mt-1.5 text-meta text-ink-2">
          {PASSWORD_RULES_HINT}
        </p>
      </div>
      <div>
        <Label htmlFor="confirm-password">Heslo znovu</Label>
        <PasswordInput
          id="confirm-password"
          name="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          aria-invalid={invalid ? true : undefined}
        />
      </div>
      {state.kind === 'error' ? (
        <p role="alert" className="text-body text-cognac-deep">
          {state.message}
        </p>
      ) : null}
      {state.kind === 'saved' ? (
        <p role="status" className="text-body text-forest">
          {PASSWORD_SAVED_MESSAGE}
        </p>
      ) : null}
      <Button type="submit" disabled={state.kind === 'saving'} className="w-full sm:w-auto">
        {state.kind === 'saving' ? 'Ukládáme…' : 'Uložit heslo'}
      </Button>
    </form>
  );
}

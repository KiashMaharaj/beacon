'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/client';
import { Wordmark } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { FieldError, FieldLabel, Input } from '@/components/ui/Field';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PawPrint } from '@/components/illustrations/Pets';

export default function ResetPasswordPage() {
  const router = useRouter();
  const client = useMemo(() => getBrowserClient(), []);
  const [phase, setPhase] = useState<'checking' | 'ready' | 'invalid' | 'done'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // The reset email links here with a recovery code; exchange it for a session
  // so updateUser can set the new password.
  useEffect(() => {
    if (!client) {
      setPhase('invalid');
      return;
    }

    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const get = (k: string) => search.get(k) ?? hash.get(k);

    // Supabase redirected here with an error (e.g. an already-consumed link).
    if (get('error') || get('error_code')) {
      setPhase('invalid');
      return;
    }

    let resolved = false;
    const ready = () => {
      if (!resolved) {
        resolved = true;
        setPhase('ready');
      }
    };
    const invalid = () => {
      if (!resolved) {
        resolved = true;
        setPhase('invalid');
      }
    };

    // token_hash flow (works across devices, no code verifier needed).
    const tokenHash = get('token_hash');
    if (tokenHash && get('type') === 'recovery') {
      client.auth
        .verifyOtp({ type: 'recovery', token_hash: tokenHash })
        .then(({ error: err }) => (err ? invalid() : ready()))
        .catch(invalid);
      return;
    }

    // PKCE (?code=) and implicit (#access_token=) links are handled
    // automatically by the client; wait for the recovery session to appear.
    // (We must NOT also exchange the code ourselves - that double-consumes it
    // and produces a false "link expired".)
    const { data: sub } = client.auth.onAuthStateChange((event, sess) => {
      if (event === 'PASSWORD_RECOVERY' || sess) ready();
    });
    client.auth.getSession().then(({ data }) => {
      if (data.session) ready();
    });
    const timer = setTimeout(invalid, 6000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [client]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Those passwords don’t match.');
      return;
    }
    setBusy(true);
    try {
      const { error: err } = await client!.auth.updateUser({ password });
      if (err) throw err;
      setPhase('done');
      setTimeout(() => router.replace('/home'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your password.');
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Wordmark />
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          <PawPrint className="mx-auto mb-4 h-10 w-10 text-beacon-400" />
          <h1 className="font-display text-2xl font-extrabold text-ink dark:text-cream-50">
            {phase === 'done' ? 'Password updated' : 'Set a new password'}
          </h1>
        </div>

        {phase === 'checking' && (
          <p className="text-center text-sm text-ink-muted dark:text-stone-400">Checking your link…</p>
        )}

        {phase === 'invalid' && (
          <div className="text-center">
            <p className="text-sm text-ink-muted dark:text-stone-400">
              This reset link is invalid or has expired. Please request a new one from the login
              screen.
            </p>
            <Link href="/welcome" className="mt-6 block">
              <Button fullWidth>Back to login</Button>
            </Link>
          </div>
        )}

        {phase === 'done' && (
          <p className="text-center text-sm text-ink-muted dark:text-stone-400">
            All set - taking you into Beacon…
          </p>
        )}

        {phase === 'ready' && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <FieldLabel htmlFor="password" required>
                New password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="confirm" required>
                Confirm password
              </FieldLabel>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" fullWidth size="lg" loading={busy}>
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useBeacon } from '@/lib/store';
import { Wordmark } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { FieldError, FieldLabel, Input } from '@/components/ui/Field';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PawPrint } from '@/components/illustrations/Pets';
import { BellIcon, CheckIcon } from '@/components/ui/icons';

type Phase = 'account' | 'alerts';

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7A21.99 21.99 0 0 0 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18A13.2 13.2 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7Z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.94 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07Z"
      />
    </svg>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const {
    isLive,
    signInDemo,
    signUpWithEmail,
    subscribeNewsletter,
    signInWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    completeOnboarding,
    enableAlerts,
  } = useBeacon();

  const [phase, setPhase] = useState<Phase>('account');
  const [alertState, setAlertState] = useState<'idle' | 'requesting' | 'done'>('idle');

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'auth' || window.location.search.includes('error=auth')) {
      setError('That sign-in did not complete. Please try again.');
    }
    // The landing page links here with ?mode=login or ?mode=signup.
    const m = params.get('mode');
    if (m === 'login' || m === 'signup') setMode(m);
  }, []);

  const finish = () => {
    completeOnboarding();
    setTimeout(() => router.replace('/home'), 350);
  };

  const validate = (): string | null => {
    if (mode === 'signup' && name.trim().length < 1) return 'What should we call you?';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (isLive && password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const submitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    // Demo mode: no backend, just enter the app.
    if (!isLive) {
      if (mode === 'signup' && marketing) void subscribeNewsletter(email, 'signup');
      signInDemo(name || 'Neighbour');
      setPhase('alerts');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const { needsConfirmation } = await signUpWithEmail({ name, email, password });
        // Record the marketing opt-in (only when they ticked the box).
        if (marketing) void subscribeNewsletter(email, 'signup');
        if (needsConfirmation) {
          setInfo('Almost there! Check your email to confirm your account, then log in.');
          setMode('login');
          return;
        }
      } else {
        await signInWithEmail({ email, password });
      }
      setPhase('alerts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter your email above first, then tap “Forgot password”.');
      return;
    }
    setBusy(true);
    try {
      await sendPasswordReset(email);
      setInfo('Check your email for a link to reset your password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset email.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      // Live: redirects to Google and back via /auth/callback.
      // Demo: signs in immediately, so continue to the alerts step.
      if (!isLive) setPhase('alerts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in.');
      setBusy(false);
    }
  };

  const handleEnableAlerts = async () => {
    setAlertState('requesting');
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        await Notification.requestPermission();
      }
    } catch {
      /* permission APIs vary by platform: non-fatal */
    }
    await enableAlerts();
    setAlertState('done');
    finish();
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Beacon home">
          <Wordmark />
        </Link>
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'account' && (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-1 flex-col justify-center"
          >
            <div className="mb-6 text-center">
              <PawPrint className="mx-auto mb-4 h-10 w-10 text-beacon-400 animate-paw-bounce" />
              <h1 className="font-display text-2xl font-extrabold text-ink dark:text-cream-50">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-2 text-[15px] text-ink-muted dark:text-stone-400">
                Join your neighbourhood watch for pets.
              </p>
            </div>

            {isLive && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  size="lg"
                  loading={busy}
                  onClick={handleGoogle}
                >
                  <GoogleGlyph className="h-5 w-5" />
                  Continue with Google
                </Button>
                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                  <span className="text-xs font-medium text-ink-muted">or</span>
                  <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                </div>
              </>
            )}

            <form onSubmit={submitAccount} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <FieldLabel htmlFor="name" required>
                    Your name
                  </FieldLabel>
                  <Input
                    id="name"
                    placeholder="Alex Rivera"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <FieldLabel htmlFor="email" required>
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {isLive && (
                <div>
                  <FieldLabel htmlFor="password" required>
                    Password
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {mode === 'signup' && (
                <label className="flex cursor-pointer items-start gap-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-beacon-500 focus:ring-beacon-400 dark:border-stone-600 dark:bg-stone-800"
                  />
                  <span className="text-[13px] leading-snug text-ink-muted dark:text-stone-400">
                    Send me occasional Beacon updates, safety tips and news by email. Optional, and
                    you can unsubscribe any time.
                  </span>
                </label>
              )}

              <FieldError>{error}</FieldError>
              {info && (
                <p className="rounded-2xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {info}
                </p>
              )}

              <Button type="submit" fullWidth size="lg" loading={busy}>
                {mode === 'signup' ? 'Create account' : 'Log in'}
              </Button>
            </form>

            {isLive && mode === 'login' && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="mt-3 w-full text-center text-sm font-semibold text-beacon-600 hover:text-beacon-700 dark:text-beacon-400"
              >
                Forgot password?
              </button>
            )}

            {isLive ? (
              <button
                onClick={() => {
                  setMode((m) => (m === 'signup' ? 'login' : 'signup'));
                  setError(null);
                  setInfo(null);
                }}
                className="mt-4 w-full text-sm font-semibold text-ink-muted hover:text-ink-soft dark:text-stone-500"
              >
                {mode === 'signup'
                  ? 'Already have an account? Log in'
                  : 'New to Beacon? Create an account'}
              </button>
            ) : (
              <p className="mt-3 text-center text-xs text-ink-muted">
                By continuing you agree to be a kind neighbour. 🐾
              </p>
            )}
          </motion.div>
        )}

        {phase === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-1 flex-col justify-center text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-4xl bg-beacon-gradient shadow-glow">
              <BellIcon className="h-11 w-11 text-white" />
            </div>
            <h1 className="text-balance font-display text-2xl font-extrabold text-ink dark:text-cream-50">
              Enable nearby pet alerts
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-balance text-[15px] leading-relaxed text-ink-muted dark:text-stone-400">
              We&apos;ll let you know if a pet goes missing near a place you care about, so you can
              keep an eye out. You choose the areas and how close is &ldquo;nearby&rdquo;.
            </p>

            <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
              {[
                'Only alerts near your saved areas',
                'No continuous background tracking, ever',
                'Turn it off anytime in settings',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-ink-soft dark:text-stone-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-3">
              <Button
                fullWidth
                size="lg"
                loading={alertState === 'requesting'}
                onClick={handleEnableAlerts}
              >
                Enable alerts
              </Button>
              <button
                onClick={finish}
                className="w-full text-sm font-semibold text-ink-muted hover:text-ink-soft dark:text-stone-500"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

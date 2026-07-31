'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useBeacon } from '@/lib/store';
import { authSchema, type AuthForm } from '@/lib/schemas';
import { Wordmark } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { FieldError, FieldLabel, Input } from '@/components/ui/Field';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PawPrint } from '@/components/illustrations/Pets';
import {
  NeighbourhoodIllustration,
} from '@/components/illustrations/Scenery';
import { DogIllustration, CatIllustration } from '@/components/illustrations/Pets';
import { BellIcon, CheckIcon } from '@/components/ui/icons';

const slides = [
  {
    illo: <NeighbourhoodIllustration className="max-w-xs" />,
    title: 'Beacon helps neighbours reunite lost pets',
    body: 'When a pet goes missing, every extra pair of eyes matters. Beacon rallies your neighbourhood to bring them home.',
  },
  {
    illo: <DogIllustration className="h-52 w-52 animate-float" />,
    title: 'Report a missing pet in seconds',
    body: 'Share a photo, last-seen spot and a few details. Nearby neighbours are gently alerted so the search starts right away.',
  },
  {
    illo: <CatIllustration className="h-52 w-52 animate-float" />,
    title: 'Found a pet? Help them home',
    body: 'Report a found pet and Beacon automatically suggests likely matches from nearby missing pets — then notifies the owner.',
  },
];

type Phase = 'intro' | 'account' | 'alerts';

export default function WelcomePage() {
  const router = useRouter();
  const { signIn, completeOnboarding, enableAlerts } = useBeacon();
  const [phase, setPhase] = useState<Phase>('intro');
  const [slide, setSlide] = useState(0);
  const [alertState, setAlertState] = useState<'idle' | 'requesting' | 'done'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>({ resolver: zodResolver(authSchema) });

  const next = () => {
    if (slide < slides.length - 1) setSlide((s) => s + 1);
    else setPhase('account');
  };

  const onCreate = (data: AuthForm) => {
    signIn(data.name);
    setPhase('alerts');
  };

  const handleEnableAlerts = async () => {
    setAlertState('requesting');
    // Only NOW do we request the OS notification permission — after the user opts in.
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        await Notification.requestPermission();
      }
    } catch {
      /* permission APIs vary by platform — non-fatal */
    }
    enableAlerts();
    setAlertState('done');
    finish();
  };

  const finish = () => {
    completeOnboarding();
    setTimeout(() => router.replace('/home'), 350);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <Wordmark />
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key={`slide-${slide}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
            className="flex flex-1 flex-col"
          >
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-8 flex min-h-[240px] items-center justify-center">{slides[slide].illo}</div>
              <h1 className="text-balance font-display text-2xl font-extrabold leading-tight text-ink dark:text-cream-50">
                {slides[slide].title}
              </h1>
              <p className="mt-3 max-w-sm text-balance text-[15px] leading-relaxed text-ink-muted dark:text-stone-400">
                {slides[slide].body}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === slide ? 'w-6 bg-beacon-500' : 'w-2 bg-stone-300 dark:bg-stone-700'
                  }`}
                />
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <Button fullWidth size="lg" onClick={next}>
                {slide < slides.length - 1 ? 'Continue' : 'Get started'}
              </Button>
              <button
                onClick={() => setPhase('account')}
                className="w-full text-sm font-semibold text-ink-muted hover:text-ink-soft dark:text-stone-500"
              >
                Skip intro
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'account' && (
          <motion.form
            key="account"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit(onCreate)}
            className="flex flex-1 flex-col justify-center"
          >
            <div className="mb-8 text-center">
              <PawPrint className="mx-auto mb-4 h-10 w-10 text-beacon-400 animate-paw-bounce" />
              <h1 className="font-display text-2xl font-extrabold text-ink dark:text-cream-50">
                Create your account
              </h1>
              <p className="mt-2 text-[15px] text-ink-muted dark:text-stone-400">
                Join your neighbourhood watch for pets.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <FieldLabel htmlFor="name" required>
                  Your name
                </FieldLabel>
                <Input id="name" placeholder="Alex Rivera" autoComplete="name" {...register('name')} />
                <FieldError>{errors.name?.message}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="email" required>
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </div>
            </div>

            <div className="mt-8">
              <Button type="submit" fullWidth size="lg">
                Create account
              </Button>
              <p className="mt-3 text-center text-xs text-ink-muted">
                By continuing you agree to be a kind neighbour. 🐾
              </p>
            </div>
          </motion.form>
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
              We&apos;ll let you know if a pet goes missing near a place you care about — so you can
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

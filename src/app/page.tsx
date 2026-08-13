'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBeacon } from '@/lib/store';
import { LogoMark, Wordmark } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NeighbourhoodIllustration } from '@/components/illustrations/Scenery';
import { DogIllustration, CatIllustration, PawPrint } from '@/components/illustrations/Pets';
import {
  CameraIcon,
  BellIcon,
  HeartIcon,
  SparkleIcon,
  MapPinIcon,
  EyeIcon,
  ShieldIcon,
  PhoneIcon,
  CheckCircleIcon,
} from '@/components/ui/icons';

const CONTACT_EMAIL = 'kiash.maharaj@gmail.com';

const primaryCta =
  'inline-flex h-14 items-center justify-center rounded-2xl bg-beacon-gradient px-7 text-base font-semibold text-white shadow-glow transition-all duration-200 hover:brightness-105 active:scale-[0.98]';
const outlineCta =
  'inline-flex h-14 items-center justify-center rounded-2xl border border-beacon-200 bg-white/70 px-7 text-base font-semibold text-ink transition-all duration-200 hover:bg-beacon-50 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-800/60 dark:text-cream-50 dark:hover:bg-stone-800';

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-3xl border border-beacon-100/70 bg-white/70 p-6 shadow-soft dark:border-stone-800 dark:bg-stone-900/50">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-beacon-gradient text-white shadow-glow">
        {icon}
      </div>
      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-beacon-500">
        Step {n}
      </div>
      <h3 className="font-display text-lg font-bold text-ink dark:text-cream-50">{title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted dark:text-stone-400">{body}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-beacon-50 text-beacon-600 dark:bg-beacon-500/10 dark:text-beacon-400">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-[17px] font-bold text-ink dark:text-cream-50">{title}</h3>
        <p className="mt-1 text-[15px] leading-relaxed text-ink-muted dark:text-stone-400">{body}</p>
      </div>
    </div>
  );
}

function NewsletterSignup() {
  const { subscribeNewsletter } = useBeacon();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('busy');
    const ok = await subscribeNewsletter(email, 'landing');
    setStatus(ok ? 'done' : 'error');
  };

  if (status === 'done') {
    return (
      <p className="text-center text-[15px] font-semibold text-beacon-600 dark:text-beacon-400">
        You&apos;re on the list — thanks for joining the pack! 🐾
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-md flex-col gap-2.5 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="h-12 flex-1 rounded-2xl border border-beacon-200 bg-white/80 px-4 text-[15px] text-ink outline-none focus:ring-2 focus:ring-beacon-400 dark:border-stone-700 dark:bg-stone-800/70 dark:text-cream-50"
      />
      <button
        type="submit"
        disabled={status === 'busy'}
        className="inline-flex h-12 items-center justify-center rounded-2xl bg-beacon-gradient px-6 text-[15px] font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
      >
        {status === 'busy' ? 'Joining…' : 'Subscribe'}
      </button>
    </form>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { ready, signedIn } = useBeacon();
  // Uses the rich hero render at /hero.jpg when present, otherwise falls back to
  // the built-in illustration so the page never breaks if the file is missing.
  const [heroImgOk, setHeroImgOk] = useState(true);

  // Signed-in visitors don't need the marketing page - send them to the app.
  useEffect(() => {
    if (ready && signedIn) router.replace('/home');
  }, [ready, signedIn, router]);

  if (ready && signedIn) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <LogoMark className="h-14 w-14 animate-float" />
        <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-beacon-200 border-t-beacon-500" />
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-cream-50 dark:bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-beacon-100/60 bg-cream-50/80 backdrop-blur-md dark:border-stone-800/70 dark:bg-stone-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Wordmark />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/welcome?mode=login"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-soft hover:text-ink dark:text-stone-300 dark:hover:text-cream-50"
            >
              Log in
            </Link>
            <Link
              href="/welcome?mode=signup"
              className="hidden rounded-xl bg-beacon-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow hover:brightness-105 sm:inline-flex"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-8 pt-12 sm:pt-16">
        <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-beacon-50 px-3 py-1 text-xs font-semibold text-beacon-600 dark:bg-beacon-500/10 dark:text-beacon-400">
              <PawPrint className="h-3.5 w-3.5" />
              Neighbourhood lost &amp; found for pets
            </span>
            <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.1] text-ink dark:text-cream-50 sm:text-5xl">
              Bring lost pets home, together.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-balance text-lg leading-relaxed text-ink-muted dark:text-stone-400 sm:mx-0">
              When a pet goes missing, every extra pair of eyes matters. Beacon rallies your
              neighbourhood with a photo, a location and a gentle nearby alert, so the search starts
              right away.
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link href="/welcome?mode=signup" className={primaryCta}>
                Get started free
              </Link>
              <Link href="/welcome?mode=login" className={outlineCta}>
                I already have an account
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            {heroImgOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/hero.jpg"
                alt="A glowing golden puppy stands inside a beacon signal ring on a neighbourhood street at dusk while neighbours nearby receive alerts on their phones and a trail of light leads home."
                width={1245}
                height={1245}
                onError={() => setHeroImgOk(false)}
                className="w-full max-w-md rounded-[2rem] shadow-glow"
              />
            ) : (
              <div className="relative">
                <NeighbourhoodIllustration className="w-full max-w-sm" />
                <DogIllustration className="absolute -bottom-4 -left-2 h-24 w-24 animate-float" />
                <CatIllustration className="absolute -right-1 top-2 h-20 w-20 animate-float" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-extrabold text-ink dark:text-cream-50">
            How Beacon works
          </h2>
          <p className="mt-2 text-ink-muted dark:text-stone-400">
            Three simple steps from lost to found.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Step
            n={1}
            icon={<CameraIcon className="h-6 w-6" />}
            title="Report the pet"
            body="Share a photo, the last-seen spot on the map and a few details. It takes under a minute."
          />
          <Step
            n={2}
            icon={<BellIcon className="h-6 w-6" />}
            title="Neighbours get alerted"
            body="People nearby who opted in are gently notified, so the whole street can keep an eye out."
          />
          <Step
            n={3}
            icon={<HeartIcon className="h-6 w-6" />}
            title="Reunite them"
            body="Sightings and matches point the way home. Mark the pet reunited and celebrate together."
          />
        </div>
      </section>

      {/* Smart matching & alerts */}
      <section className="border-y border-beacon-100/60 bg-white/50 py-14 dark:border-stone-800/70 dark:bg-stone-900/30">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-9 text-center">
            <h2 className="font-display text-3xl font-extrabold text-ink dark:text-cream-50">
              Smart matching &amp; nearby alerts
            </h2>
            <p className="mt-2 text-ink-muted dark:text-stone-400">
              Beacon does the watching for you.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <Feature
              icon={<SparkleIcon className="h-5 w-5" />}
              title="Found &harr; missing matching"
              body="Report a found pet and Beacon automatically surfaces likely matches from nearby missing reports, then notifies the owner."
            />
            <Feature
              icon={<BellIcon className="h-5 w-5" />}
              title="Alerts for your saved areas"
              body="Choose the places you care about and how close counts as nearby. You'll only hear about pets in range."
            />
            <Feature
              icon={<MapPinIcon className="h-5 w-5" />}
              title="Real maps &amp; location search"
              body="Drop a precise last-seen pin, search any address, and see how far each pet is from you."
            />
            <Feature
              icon={<EyeIcon className="h-5 w-5" />}
              title="Community sightings"
              body="Anyone can add a sighting with a note and location, building a trail that leads the pet home."
            />
          </div>
        </div>
      </section>

      {/* Privacy & safety */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
          <div className="order-2 flex justify-center sm:order-1">
            <div className="flex h-40 w-40 items-center justify-center rounded-[2.5rem] bg-beacon-gradient shadow-glow">
              <ShieldIcon className="h-20 w-20 text-white" />
            </div>
          </div>
          <div className="order-1 sm:order-2">
            <h2 className="font-display text-3xl font-extrabold text-ink dark:text-cream-50">
              Private and safe by design
            </h2>
            <ul className="mt-5 space-y-4">
              <li className="flex gap-3">
                <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-beacon-500" />
                <span className="text-[15px] leading-relaxed text-ink-soft dark:text-stone-300">
                  <strong className="text-ink dark:text-cream-50">Your contact stays private.</strong>{' '}
                  Details are only revealed when you choose to share them on a report.
                </span>
              </li>
              <li className="flex gap-3">
                <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-beacon-500" />
                <span className="text-[15px] leading-relaxed text-ink-soft dark:text-stone-300">
                  <strong className="text-ink dark:text-cream-50">POPIA rights respected.</strong> See,
                  correct or delete your data any time, and delete your account from the app.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-beacon-500" />
                <span className="text-[15px] leading-relaxed text-ink-soft dark:text-stone-300">
                  <strong className="text-ink dark:text-cream-50">Moderated community.</strong> Anyone
                  can report a post, and admins can remove anything unsafe.
                </span>
              </li>
            </ul>
            <Link
              href="/privacy"
              className="mt-5 inline-block text-sm font-semibold text-beacon-600 underline dark:text-beacon-400"
            >
              Read our privacy policy
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="rounded-[2rem] bg-beacon-gradient px-6 py-12 text-center shadow-glow">
          <h2 className="text-balance font-display text-3xl font-extrabold text-white">
            Ready to help bring a pet home?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-balance text-white/90">
            Join your neighbourhood watch for pets. It&apos;s free, and it only takes a minute to
            start.
          </p>
          <Link
            href="/welcome?mode=signup"
            className="mt-7 inline-flex h-14 items-center justify-center rounded-2xl bg-white px-8 text-base font-bold text-beacon-600 shadow-soft transition-all hover:bg-cream-50 active:scale-[0.98]"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-beacon-100/60 py-14 dark:border-stone-800/70">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="font-display text-2xl font-extrabold text-ink dark:text-cream-50">
            Stay in the loop
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-muted dark:text-stone-400">
            Occasional Beacon updates, safety tips and reunion stories. No spam, unsubscribe any
            time.
          </p>
          <div className="mt-6">
            <NewsletterSignup />
          </div>
          <p className="mt-3 text-xs text-ink-muted/70">
            By subscribing you agree to receive marketing emails from Beacon. See our{' '}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-beacon-100/60 py-8 dark:border-stone-800/70">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <Wordmark />
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-muted dark:text-stone-400">
            <Link href="/privacy" className="hover:text-ink dark:hover:text-cream-50">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink dark:hover:text-cream-50">
              Terms
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink dark:hover:text-cream-50">
              Contact
            </a>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-ink-muted/70">
          Beacon &middot; Helping neighbours bring pets home
        </p>
      </footer>
    </main>
  );
}

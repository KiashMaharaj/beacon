import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Logo';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Beacon collects, uses and protects your information.',
};

// Contact address shown on the policy; Google requires a working privacy contact.
const CONTACT_EMAIL = 'kiash.maharaj@gmail.com';
const LAST_UPDATED = '1 August 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-bold text-ink dark:text-cream-50">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink-soft dark:text-stone-300">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/">
          <Wordmark />
        </Link>
        <Link href="/home" className="text-sm font-semibold text-beacon-600 dark:text-beacon-400">
          Back to app
        </Link>
      </div>

      <h1 className="font-display text-3xl font-extrabold text-ink dark:text-cream-50">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-ink-muted dark:text-stone-400">Last updated: {LAST_UPDATED}</p>

      <p className="mt-6 text-[15px] leading-relaxed text-ink-soft dark:text-stone-300">
        Beacon (&ldquo;we&rdquo;, &ldquo;us&rdquo;) helps neighbours reunite lost pets with their
        owners. This policy explains what information we collect, how we use it, and the choices you
        have. By using Beacon you agree to this policy.
      </p>

      <Section title="Information we collect">
        <p>We collect only what we need to run the lost-and-found service:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Account information</strong>: your name and email address. If you sign in with
            Google, we receive your name, email and profile photo from Google.
          </li>
          <li>
            <strong>Pet reports</strong>: photos, descriptions and the locations you choose to share
            when you report a missing or found pet.
          </li>
          <li>
            <strong>Sightings</strong>: notes, optional photos and locations you add when reporting a
            sighting.
          </li>
          <li>
            <strong>Saved alert areas &amp; preferences</strong>: the areas you save and your
            notification settings.
          </li>
          <li>
            <strong>Approximate location</strong>: only when you tap &ldquo;Use my location&rdquo;, we
            request a single device location to place a pin or compute distances. Beacon never tracks
            your location continuously or in the background.
          </li>
        </ul>
      </Section>

      <Section title="How we use your information">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>To publish and display lost and found pet reports to your neighbourhood.</li>
          <li>To match found pets against nearby missing pets and notify likely owners.</li>
          <li>To send the alerts you opt into, based on your saved areas and filters.</li>
          <li>To operate, secure and improve the service.</li>
        </ul>
        <p>We do not sell your personal information, and we do not use it for advertising.</p>
      </Section>

      <Section title="What other people can see">
        <p>
          Beacon is a community board, so <strong>pet reports and sightings are visible to other
          users</strong> - that is how neighbours help bring pets home. Your contact details are kept
          private until you choose to share them through the app. Please avoid including sensitive
          personal information in free-text fields or photos.
        </p>
      </Section>

      <Section title="Service providers">
        <p>We rely on a small number of processors to run Beacon:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Supabase</strong> - authentication, database and photo storage.
          </li>
          <li>
            <strong>Google</strong> - optional sign-in.
          </li>
          <li>
            <strong>OpenStreetMap / Nominatim</strong> - maps and place search. Location text you
            search may be sent to the geocoding provider to return results.
          </li>
          <li>
            <strong>Vercel</strong> - application hosting.
          </li>
        </ul>
      </Section>

      <Section title="Data retention & your choices">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>You can mark reports as reunited and edit or remove content you created.</li>
          <li>
            You can request deletion of your account and associated data by contacting us at the
            address below; we will remove it within a reasonable period, subject to legal
            obligations.
          </li>
          <li>You can turn alerts off at any time in the app&rsquo;s settings.</li>
        </ul>
      </Section>

      <Section title="Children">
        <p>
          Beacon is not directed to children under 13, and we do not knowingly collect personal
          information from them.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy from time to time. Material changes will be reflected by the
          &ldquo;Last updated&rdquo; date above.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions or requests? Email us at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-beacon-600 underline dark:text-beacon-400"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <p className="mt-10 text-center text-xs text-ink-muted/70">
        Beacon · Helping neighbours bring pets home ·{' '}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>
      </p>
    </main>
  );
}

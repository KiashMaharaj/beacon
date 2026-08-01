import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Logo';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms for using Beacon.',
};

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

export default function TermsPage() {
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
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-ink-muted dark:text-stone-400">Last updated: {LAST_UPDATED}</p>

      <Section title="Using Beacon">
        <p>
          Beacon is a community tool for reporting lost and found pets and sharing sightings. You
          agree to use it lawfully, to provide accurate information, and to treat other neighbours
          with kindness and respect.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          You keep ownership of the photos and text you post. By posting, you grant Beacon a licence
          to display that content to other users so the service can function. Do not post content
          that is unlawful, misleading, abusive, or that infringes someone else&rsquo;s rights, and
          do not share other people&rsquo;s personal information without consent.
        </p>
      </Section>

      <Section title="No emergency service">
        <p>
          Beacon is a neighbourly, best-effort service. It is not a substitute for veterinary care,
          animal control, microchip registries or emergency services, and we cannot guarantee that a
          pet will be found or that any report is accurate.
        </p>
      </Section>

      <Section title="Acceptable use">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Do not misuse contact details obtained through the app.</li>
          <li>Do not spam, harass, or impersonate others.</li>
          <li>Do not attempt to disrupt or reverse-engineer the service.</li>
        </ul>
        <p>We may remove content or suspend accounts that break these terms.</p>
      </Section>

      <Section title="Disclaimer & liability">
        <p>
          Beacon is provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest
          extent permitted by law, we are not liable for any indirect or consequential loss arising
          from your use of the service.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Email{' '}
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
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
      </p>
    </main>
  );
}

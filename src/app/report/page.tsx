'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Guard } from '@/components/layout/Guard';
import { Card } from '@/components/ui/Card';
import { ChevronRightIcon } from '@/components/ui/icons';
import { DogIllustration, CatIllustration } from '@/components/illustrations/Pets';

function ReportChooser() {
  return (
    <AppShell title="Report a pet">
      <p className="mt-1 text-sm text-ink-muted dark:text-stone-400">
        Whether you&apos;ve lost a pet or found one, you can start here.
      </p>

      <div className="mt-6 space-y-4">
        <Link href="/report/missing">
          <Card className="flex items-center gap-4 overflow-hidden p-4 transition hover:-translate-y-0.5 hover:shadow-float">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-beacon-100 to-amber-200 dark:from-beacon-500/20 dark:to-amber-500/10">
              <DogIllustration className="h-16 w-16" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-bold text-ink dark:text-cream-50">
                My pet is missing
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted dark:text-stone-400">
                Alert nearby neighbours and start the search right away.
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
          </Card>
        </Link>

        <Link href="/report/found">
          <Card className="flex items-center gap-4 overflow-hidden p-4 transition hover:-translate-y-0.5 hover:shadow-float">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-harbor-100 to-teal-200 dark:from-harbor-500/20 dark:to-teal-500/10">
              <CatIllustration className="h-16 w-16" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-bold text-ink dark:text-cream-50">
                I found a pet
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted dark:text-stone-400">
                We&apos;ll suggest likely matches and notify worried owners.
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
          </Card>
        </Link>
      </div>
    </AppShell>
  );
}

export default function ReportPage() {
  return (
    <Guard>
      <ReportChooser />
    </Guard>
  );
}

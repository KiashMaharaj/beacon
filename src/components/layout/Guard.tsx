'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useBeacon } from '@/lib/store';
import { LogoMark } from '@/components/brand/Logo';

/** Ensures the user has completed onboarding before viewing in-app screens. */
export function Guard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { ready, signedIn } = useBeacon();

  useEffect(() => {
    if (ready && !signedIn) router.replace('/welcome');
  }, [ready, signedIn, router]);

  if (!ready || !signedIn) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <LogoMark className="h-14 w-14 animate-float" />
        <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-beacon-200 border-t-beacon-500" />
      </div>
    );
  }
  return <>{children}</>;
}

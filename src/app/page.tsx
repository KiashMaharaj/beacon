'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBeacon } from '@/lib/store';
import { LogoMark } from '@/components/brand/Logo';

export default function RootGate() {
  const router = useRouter();
  const { ready, onboarded, signedIn } = useBeacon();

  useEffect(() => {
    if (!ready) return;
    if (onboarded && signedIn) router.replace('/home');
    else router.replace('/welcome');
  }, [ready, onboarded, signedIn, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <LogoMark className="h-16 w-16 animate-float" />
      <span className="font-display text-lg font-bold text-ink dark:text-cream-50">Beacon</span>
      <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-beacon-200 border-t-beacon-500" />
    </div>
  );
}

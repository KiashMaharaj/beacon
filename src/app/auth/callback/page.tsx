'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBeacon } from '@/lib/store';
import { LogoMark } from '@/components/brand/Logo';

/**
 * OAuth / magic-link callback (client-side).
 *
 * Google (and magic links) return here with a PKCE `?code=` in the URL. We ask
 * the store to finish sign-in with *its own* Supabase client, so the provider's
 * session state updates and the app sees us as signed in (a separate client
 * instance wouldn't notify the provider, which is what left users bouncing back
 * to /welcome). Then we route into the app, or back to login on failure.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { ready, completeOAuth } = useBeacon();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    let cancelled = false;
    completeOAuth()
      .then((ok) => {
        if (cancelled) return;
        if (ok) router.replace('/home');
        else {
          setFailed(true);
          router.replace('/welcome?error=auth');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        router.replace('/welcome?error=auth');
      });
    return () => {
      cancelled = true;
    };
  }, [ready, completeOAuth, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <LogoMark className="h-16 w-16 animate-float" />
      <span className="font-display text-lg font-bold text-ink dark:text-cream-50">
        {failed ? 'That sign-in did not complete' : 'Signing you in…'}
      </span>
      {!failed && (
        <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-beacon-200 border-t-beacon-500" />
      )}
    </div>
  );
}

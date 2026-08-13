'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBeacon } from '@/lib/store';
import { LogoMark } from '@/components/brand/Logo';

/**
 * OAuth / magic-link callback (client-side).
 *
 * Google (and magic links) return here with a PKCE `?code=` in the URL. We let
 * the browser Supabase client exchange it - the same client that started the
 * sign-in and holds the code verifier, and the same mechanism the password
 * reset page relies on (detectSessionInUrl). As soon as the store reports a
 * session we head into the app. Doing this on the client (rather than a server
 * route) keeps Google consistent with the working email flow, so the session
 * lands exactly where the app reads it.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { ready, signedIn } = useBeacon();

  // Provider returned an explicit error - don't sit spinning.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('error') || p.get('error_description') || p.get('error_code')) {
      router.replace('/welcome?error=auth');
    }
  }, [router]);

  // Session established - go into the app.
  useEffect(() => {
    if (signedIn) router.replace('/home');
  }, [signedIn, router]);

  // Safety net: if the code never resolves into a session, return the user to
  // the login screen rather than leaving them on a spinner.
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      if (!signedIn) router.replace('/welcome?error=auth');
    }, 8000);
    return () => clearTimeout(timer);
  }, [ready, signedIn, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <LogoMark className="h-16 w-16 animate-float" />
      <span className="font-display text-lg font-bold text-ink dark:text-cream-50">
        Signing you in…
      </span>
      <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-beacon-200 border-t-beacon-500" />
    </div>
  );
}

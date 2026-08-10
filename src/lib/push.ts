'use client';

// Beacon - client-side push registration via Firebase Cloud Messaging.
// No-ops gracefully when Firebase env vars are absent (demo / not configured),
// so the app works everywhere and only wires push when set up.

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function isPushConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      vapidKey,
  );
}

function firebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/**
 * Ask for notification permission (if not already decided), register the FCM
 * service worker, and return this device's push token - or null if push is not
 * configured, unsupported, or the user declined.
 */
export async function registerForPush(): Promise<string | null> {
  if (!isPushConfigured() || typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return null;
  try {
    if (!(await isSupported())) return null;

    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const params = new URLSearchParams({
      apiKey: firebaseConfig.apiKey as string,
      projectId: firebaseConfig.projectId as string,
      messagingSenderId: firebaseConfig.messagingSenderId as string,
      appId: firebaseConfig.appId as string,
    });
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${params.toString()}`,
    );

    const messaging = getMessaging(firebaseApp());
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch {
    return null;
  }
}

/** Subscribe to messages that arrive while the app is in the foreground. */
export async function listenForForegroundPush(
  handler: (n: { title: string; body: string; url?: string }) => void,
): Promise<() => void> {
  if (!isPushConfigured() || typeof window === 'undefined') return () => {};
  try {
    if (!(await isSupported())) return () => {};
    const messaging = getMessaging(firebaseApp());
    return onMessage(messaging, (payload) => {
      const d = payload.data ?? {};
      handler({ title: d.title || 'Beacon', body: d.body || '', url: d.url });
    });
  } catch {
    return () => {};
  }
}

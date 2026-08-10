'use client';

import { useEffect } from 'react';
import { listenForForegroundPush } from '@/lib/push';

/** Shows a notification for pushes that arrive while the app is in focus. */
export function PushListener() {
  useEffect(() => {
    let cleanup = () => {};
    listenForForegroundPush(async ({ title, body, url }) => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      try {
        // Prefer the service worker's showNotification: the Notification
        // constructor throws on Android Chrome, which silently swallowed
        // foreground pushes before.
        const registration =
          (await navigator.serviceWorker?.getRegistration()) ??
          (await navigator.serviceWorker?.ready);
        if (registration) {
          await registration.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url: url || '/home' },
          });
        } else {
          const notification = new Notification(title, { body, icon: '/icon-192.png' });
          if (url) notification.onclick = () => (window.location.href = url);
        }
      } catch {
        /* ignore */
      }
    }).then((unsub) => {
      cleanup = unsub;
    });
    return () => cleanup();
  }, []);

  return null;
}

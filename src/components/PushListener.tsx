'use client';

import { useEffect } from 'react';
import { listenForForegroundPush } from '@/lib/push';

/** Shows a notification for pushes that arrive while the app is in focus. */
export function PushListener() {
  useEffect(() => {
    let cleanup = () => {};
    listenForForegroundPush(({ title, body, url }) => {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(title, { body, icon: '/icon-192.png' });
          if (url) {
            notification.onclick = () => {
              window.focus();
              window.location.href = url;
            };
          }
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

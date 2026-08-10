/* Beacon - Firebase Cloud Messaging background service worker.
 * Config is passed as query params at registration time (all public values),
 * so nothing sensitive is hard-coded here. */
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const params = new URL(self.location).searchParams;
const projectId = params.get('projectId');

if (params.get('apiKey') && projectId) {
  firebase.initializeApp({
    apiKey: params.get('apiKey'),
    projectId,
    messagingSenderId: params.get('messagingSenderId'),
    appId: params.get('appId'),
  });

  const messaging = firebase.messaging();

  // Data-only messages: we control how the notification looks.
  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    self.registration.showNotification(data.title || 'Beacon', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'beacon',
      data: { url: data.url || '/home' },
    });
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/home';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    }),
  );
});

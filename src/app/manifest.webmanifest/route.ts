import { NextResponse } from 'next/server';

// PWA manifest, served as a route so we avoid a static asset build step.
// Tuned for installability and for wrapping as a Google Play TWA (Bubblewrap).
export function GET() {
  return NextResponse.json({
    id: '/',
    name: 'Beacon: Helping neighbours bring pets home',
    short_name: 'Beacon',
    description:
      'Beacon helps neighbours reunite lost pets. Report missing or found pets, get nearby alerts, share sightings and celebrate reunions.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'en-GB',
    dir: 'ltr',
    background_color: '#fff7ed',
    theme_color: '#f97316',
    categories: ['social', 'lifestyle', 'utilities'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    shortcuts: [
      {
        name: 'Report a missing pet',
        short_name: 'Missing',
        url: '/report/missing?source=shortcut',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Report a found pet',
        short_name: 'Found',
        url: '/report/found?source=shortcut',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  });
}

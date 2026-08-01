import { NextResponse } from 'next/server';

// PWA manifest, served as a route so we avoid a static asset build step.
export function GET() {
  return NextResponse.json({
    name: 'Beacon',
    short_name: 'Beacon',
    description: 'Helping neighbours bring pets home.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff7ed',
    theme_color: '#f97316',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  });
}

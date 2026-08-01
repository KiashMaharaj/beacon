import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BeaconProvider } from '@/lib/store';
import { ThemeScript } from '@/components/ThemeScript';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beacon-six-chi.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'Beacon: Helping neighbours bring pets home',
    template: '%s · Beacon',
  },
  description:
    'Beacon is a neighbourhood community app that helps neighbours reunite lost pets with their owners.',
  applicationName: 'Beacon',
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Beacon' },
  openGraph: {
    type: 'website',
    siteName: 'Beacon',
    title: 'Beacon: Helping neighbours bring pets home',
    description: 'Report lost or found pets, get nearby alerts, and reunite pets with their families.',
    url: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff7ed' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans">
        <BeaconProvider>{children}</BeaconProvider>
      </body>
    </html>
  );
}

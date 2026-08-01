import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BeaconProvider } from '@/lib/store';
import { ThemeScript } from '@/components/ThemeScript';

export const metadata: Metadata = {
  title: 'Beacon: Helping neighbours bring pets home',
  description:
    'Beacon is a neighbourhood community app that helps neighbours reunite lost pets with their owners.',
  applicationName: 'Beacon',
  metadataBase: new URL('https://beacon.local'),
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Beacon' },
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

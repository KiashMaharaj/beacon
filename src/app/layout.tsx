import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BeaconProvider } from '@/lib/store';
import { ThemeScript } from '@/components/ThemeScript';
import { PushListener } from '@/components/PushListener';
import { siteUrl } from '@/lib/config';

export const metadata: Metadata = {
  title: {
    default: 'Beacon: Helping neighbours bring pets home',
    template: '%s · Beacon',
  },
  description:
    'Beacon is a free neighbourhood lost-and-found app for pets. Report a missing or found dog, cat or pet, get nearby alerts, share sightings, and reunite lost pets with their families.',
  applicationName: 'Beacon',
  keywords: [
    'lost pets',
    'found pets',
    'lost and found pets',
    'missing pet',
    'lost dog',
    'lost cat',
    'found dog',
    'found cat',
    'reunite lost pets',
    'pet alerts',
    'neighbourhood pets',
    'South Africa',
    'Beacon',
  ],
  authors: [{ name: 'Beacon' }],
  creator: 'Beacon',
  publisher: 'Beacon',
  category: 'lifestyle',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Beacon - helping neighbours bring lost pets home',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beacon: Helping neighbours bring pets home',
    description: 'Report lost or found pets, get nearby alerts, and reunite pets with their families.',
    images: ['/og-home.jpg'],
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

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Beacon',
      url: siteUrl,
      logo: `${siteUrl}/icon-512.png`,
      email: 'support@usebeacon.co.za',
      description: 'A free neighbourhood lost-and-found app for pets.',
      areaServed: 'ZA',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Beacon',
      inLanguage: 'en',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'WebApplication',
      name: 'Beacon',
      url: siteUrl,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, Android',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ZAR' },
      description:
        'Report lost or found pets, get nearby alerts, and reunite pets with their families.',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans">
        <BeaconProvider>{children}</BeaconProvider>
        <PushListener />
      </body>
    </html>
  );
}

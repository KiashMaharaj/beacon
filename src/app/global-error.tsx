'use client';

// Catches errors thrown during React rendering of the root layout and reports
// them to Sentry (inert unless a DSN is configured). This replaces the whole
// document when it fires, so it needs its own <html>/<body>.
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: '#fff7ed',
          color: '#1c1917',
        }}
      >
        <div style={{ maxWidth: '28rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.75, marginBottom: '1.5rem' }}>
            Beacon hit an unexpected error. Try again — if it keeps happening, let us know at
            support@usebeacon.co.za.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#ea580c',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.6rem 1.4rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}

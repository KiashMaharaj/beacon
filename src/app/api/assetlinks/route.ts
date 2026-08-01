import { NextResponse } from 'next/server';

// Digital Asset Links for the Google Play TWA. Served at
// /.well-known/assetlinks.json via a rewrite (see next.config.mjs).
//
// The fingerprint(s) come from your Android signing key. With Play App
// Signing, copy the SHA-256 from Play Console -> Setup -> App integrity, or
// use the value Bubblewrap prints. Set these on Vercel then redeploy:
//   ANDROID_PACKAGE_NAME            e.g. app.beacon.twa
//   ANDROID_SHA256_FINGERPRINTS     comma-separated SHA-256 fingerprints
export function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME ?? '';
  const fingerprints = (process.env.ANDROID_SHA256_FINGERPRINTS ?? '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  // Until configured, return an empty (valid) array so the route always works.
  if (!packageName || fingerprints.length === 0) {
    return NextResponse.json([]);
  }

  return NextResponse.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]);
}

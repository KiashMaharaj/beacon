// Beacon - generate PNG app icons (regular, maskable, apple-touch, Play listing)
// from on-brand SVGs. Run: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });

// Standard app icon: rounded cream tile with the Beacon pin + paw.
const appIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#f97316"/><stop offset="55%" stop-color="#fb923c"/><stop offset="100%" stop-color="#fbbf24"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="14" fill="#fff7ed"/>
  <path d="M32 10c-10.5 0-19 8.2-19 18.6 0 12.9 15.9 26 18.1 27.8a1.4 1.4 0 0 0 1.8 0C35.1 54.6 51 41.5 51 28.6 51 18.2 42.5 10 32 10Z" fill="url(#g)"/>
  <circle cx="32" cy="28" r="12.5" fill="#fff7ed"/>
  <g fill="#ea580c">
    <ellipse cx="32" cy="31.5" rx="5" ry="4.2"/>
    <ellipse cx="25.5" cy="26.5" rx="2.5" ry="3.1"/>
    <ellipse cx="32" cy="23.5" rx="2.6" ry="3.2"/>
    <ellipse cx="38.5" cy="26.5" rx="2.5" ry="3.1"/>
  </g>
</svg>`;

// Maskable icon: full-bleed gradient so Android can crop to any shape,
// with the motif kept inside the central safe zone.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#f97316"/><stop offset="55%" stop-color="#fb923c"/><stop offset="100%" stop-color="#fbbf24"/>
  </linearGradient></defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <circle cx="256" cy="238" r="118" fill="#fff7ed"/>
  <g fill="#ea580c" transform="translate(256 246)">
    <ellipse cx="0" cy="18" rx="46" ry="39"/>
    <ellipse cx="-60" cy="-28" rx="23" ry="29"/>
    <ellipse cx="0" cy="-46" rx="24" ry="30"/>
    <ellipse cx="60" cy="-28" rx="23" ry="29"/>
  </g>
</svg>`;

const buf = Buffer.from(appIcon);
const mbuf = Buffer.from(maskable);

await sharp(buf).resize(192, 192).png().toFile('public/icon-192.png');
await sharp(buf).resize(512, 512).png().toFile('public/icon-512.png');
await sharp(mbuf).resize(512, 512).png().toFile('public/maskable-512.png');
// Opaque variants (Apple + Play listing require no transparency).
await sharp(buf).resize(180, 180).flatten({ background: '#fff7ed' }).png().toFile('public/apple-touch-icon.png');
await sharp(buf).resize(512, 512).flatten({ background: '#fff7ed' }).png().toFile('public/play-store-icon-512.png');

console.log('icons generated in public/');

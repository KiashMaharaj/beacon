// App icon served as SVG.
export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f97316"/><stop offset="55%" stop-color="#fb923c"/><stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
  </defs>
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
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  });
}

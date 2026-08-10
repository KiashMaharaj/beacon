// Beacon - notify-nearby Edge Function (Deno).
//
// Triggered by a Supabase Database Webhook on INSERT into public.pet_reports.
// For a new *missing* report it finds neighbours whose active saved area
// overlaps the last-seen location (via the nearby_push_targets SQL function)
// and sends each a push via Firebase Cloud Messaging (HTTP v1).
//
// Secrets to set (supabase secrets set ...):
//   FCM_SERVICE_ACCOUNT   full service-account JSON (single line)
//   APP_URL               e.g. https://beacon-six-chi.vercel.app
//   WEBHOOK_SECRET        optional shared secret; if set, the webhook must send
//                         it as the x-webhook-secret header
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// deno-lint-ignore-file no-explicit-any

function b64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function getAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${b64url(sig)}`;

  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`token exchange failed: ${JSON.stringify(json)}`);
  return json.access_token as string;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('ok');

  const secret = Deno.env.get('WEBHOOK_SECRET');
  if (secret && req.headers.get('x-webhook-secret') !== secret) {
    return new Response('unauthorized', { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  const record = payload?.record;
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  if (!record) return json({ skipped: true });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const sa = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT')!);
  const projectId = sa.project_id;
  const appUrl = Deno.env.get('APP_URL') ?? 'https://beacon-six-chi.vercel.app';

  const restHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  const callRpc = async (fn: string, args: Record<string, unknown>): Promise<any[]> => {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: restHeaders,
      body: JSON.stringify(args),
    });
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  };

  const sendToTokens = async (
    tokens: string[],
    data: Record<string, string>,
  ): Promise<number> => {
    const accessToken = await getAccessToken(sa);
    let sent = 0;
    await Promise.all(
      tokens.map(async (token) => {
        const res = await fetch(
          `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: {
                token,
                data,
                webpush: { headers: { Urgency: 'high' }, fcmOptions: { link: data.url } },
              },
            }),
          },
        );
        if (res.ok) {
          sent += 1;
        } else if (res.status === 404 || res.status === 400) {
          await fetch(
            `${supabaseUrl}/rest/v1/notification_prefs?push_token=eq.${encodeURIComponent(token)}`,
            { method: 'PATCH', headers: { ...restHeaders, Prefer: 'return=minimal' }, body: JSON.stringify({ push_token: null }) },
          );
        }
      }),
    );
    return sent;
  };

  // --- Branch A: a smart match was recorded -> notify the missing pet's owner.
  if (record.missing_report_id && record.found_report_id) {
    const missingId = record.missing_report_id;
    const targets = await callRpc('report_owner_targets', { p_report: missingId });
    const tokens = targets.map((r) => r.push_token).filter(Boolean);
    if (tokens.length === 0) return json({ sent: 0, targeted: 0, kind: 'match' });

    const repRes = await fetch(
      `${supabaseUrl}/rest/v1/pet_reports?id=eq.${missingId}&select=name`,
      { headers: restHeaders },
    );
    const rep = (await repRes.json())?.[0];
    const name = rep?.name || 'your pet';
    const data = {
      title: `A found pet might be ${name}!`,
      body: `Someone reported finding a pet that could be ${name}. Tap to see if it's a match.`,
      url: `${appUrl}/pets/${missingId}`,
      tag: `match-${record.id}`,
    };
    const sent = await sendToTokens(tokens, data);
    return json({ sent, targeted: tokens.length, kind: 'match' });
  }

  // --- Branch B: a new missing report -> notify nearby neighbours.
  if (
    record.kind !== 'missing' ||
    record.status !== 'active' ||
    record.last_seen_lat == null ||
    record.last_seen_lng == null
  ) {
    return json({ skipped: true });
  }

  const targets = await callRpc('nearby_push_targets', {
    p_lat: record.last_seen_lat,
    p_lng: record.last_seen_lng,
    p_species: record.species,
    p_exclude: record.reporter_id,
  });
  const tokens = targets.map((r) => r.push_token).filter(Boolean);
  if (tokens.length === 0) return json({ sent: 0, targeted: 0 });

  const name = record.name || 'A pet';
  const detail = [record.breed, record.colour].filter(Boolean).join(' · ') || record.species;
  const data = {
    title: `${name} is missing nearby`,
    body: `${detail} last seen ${record.location_label || 'near you'}. Tap to help bring them home.`,
    url: `${appUrl}/pets/${record.id}`,
    tag: `report-${record.id}`,
  };
  const sent = await sendToTokens(tokens, data);
  return json({ sent, targeted: tokens.length });
});

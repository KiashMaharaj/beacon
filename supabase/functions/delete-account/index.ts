// Beacon - delete-account Edge Function (Deno).
//
// Lets a signed-in user permanently delete their own account. Deleting the
// auth user cascades to their profile -> reports, saved areas and prefs (FKs
// are ON DELETE CASCADE); sightings/flags they filed have their reporter
// nulled. Also removes their uploaded photos.
//
// Deploy WITH JWT verification on (default) so only an authenticated user can
// call it. SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are
// injected automatically.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401, headers: cors });

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Identify the caller from their token.
  const asUser = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await asUser.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401, headers: cors });

  const admin = createClient(url, serviceKey);

  // Best-effort: remove the user's uploaded photos (their storage folder).
  try {
    const { data: files } = await admin.storage.from('pet-photos').list(user.id, { limit: 1000 });
    if (files && files.length > 0) {
      await admin.storage.from('pet-photos').remove(files.map((f) => `${user.id}/${f.name}`));
    }
  } catch {
    /* non-fatal */
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ deleted: true }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});

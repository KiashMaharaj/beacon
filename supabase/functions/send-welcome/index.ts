// Beacon - send-welcome Edge Function (Deno).
//
// Triggered by a Supabase Database Webhook on INSERT into public.profiles
// (a profile row is created for every new user - email and Google alike, via the
// handle_new_user trigger). Sends a warm, on-brand welcome email through Resend.
//
// Secrets to set:
//   RESEND_API_KEY   a Resend API key (Resend dashboard -> API Keys)
//   MAIL_FROM        optional, e.g. "Beacon <no-reply@usebeacon.co.za>"
//   APP_URL          optional, e.g. https://www.usebeacon.co.za
//   WEBHOOK_SECRET   optional shared secret; if set, the webhook must send it as
//                    the x-webhook-secret header
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// deno-lint-ignore-file no-explicit-any

const APP_URL = Deno.env.get('APP_URL') ?? 'https://www.usebeacon.co.za';
const MAIL_FROM = Deno.env.get('MAIL_FROM') ?? 'Beacon <no-reply@usebeacon.co.za>';

function welcomeHtml(firstName: string): string {
  const hi = firstName ? `, ${firstName}` : '';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="color-scheme" content="light" /><title>Welcome to Beacon</title></head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 34px rgba(234,88,12,0.10);">
        <tr><td bgcolor="#f97316" style="background:linear-gradient(135deg,#f97316,#fbbf24);padding:28px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;"><img src="${APP_URL}/icon-192.png" width="40" height="40" alt="" style="display:block;border-radius:10px;" /></td>
            <td style="vertical-align:middle;padding-left:12px;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">Beacon</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:36px 32px 8px;">
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#1c1917;">Welcome to Beacon${hi}! &#128062;</h1>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#57534e;">
            You&rsquo;ve just joined your neighbourhood watch for pets &mdash; a community that helps
            lost pets find their way home. Thank you for being here. Every extra pair of eyes matters.
          </p>
          <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#1c1917;font-weight:700;">Here&rsquo;s how you can help:</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
            <tr><td style="padding:6px 0;font-size:15px;line-height:1.5;color:#57534e;">&#128205;&nbsp;&nbsp;<strong>Report a missing or found pet</strong> in under a minute.</td></tr>
            <tr><td style="padding:6px 0;font-size:15px;line-height:1.5;color:#57534e;">&#128276;&nbsp;&nbsp;<strong>Save your areas</strong> to get gentle alerts when a pet goes missing nearby.</td></tr>
            <tr><td style="padding:6px 0;font-size:15px;line-height:1.5;color:#57534e;">&#128149;&nbsp;&nbsp;<strong>Share sightings</strong> and help reunite a pet with their family.</td></tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td align="center" bgcolor="#f97316" style="border-radius:16px;">
              <a href="${APP_URL}/home" style="display:inline-block;padding:15px 34px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:16px;background:linear-gradient(135deg,#f97316,#fb923c);">Open Beacon</a>
            </td>
          </tr></table>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#78716c;">
            Welcome to the family &mdash; let&rsquo;s bring some pets home together.
          </p>
        </td></tr>
        <tr><td style="padding:28px 32px 32px;border-top:1px solid #f5f5f4;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#a8a29e;">
            Beacon &middot; Helping neighbours bring pets home<br />
            <a href="${APP_URL}" style="color:#a8a29e;">usebeacon.co.za</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('ok');

  const secret = Deno.env.get('WEBHOOK_SECRET');
  if (secret && req.headers.get('x-webhook-secret') !== secret) {
    console.warn('[send-welcome] rejected: x-webhook-secret did not match WEBHOOK_SECRET');
    return new Response('unauthorized', { status: 401 });
  }

  const json = (body: unknown, status = 200) => {
    console.log('[send-welcome] result', JSON.stringify(body));
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  };

  const payload = await req.json().catch(() => null);
  const record = payload?.record;
  if (!record?.id) return json({ skipped: 'no profile record' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return json({ error: 'RESEND_API_KEY not set' }, 500);

  // The profile row has the name; the email lives on the auth user.
  const userRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${record.id}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  const user = await userRes.json().catch(() => null);
  const email = user?.email as string | undefined;
  if (!email) return json({ skipped: 'no email for user', id: record.id });

  const fullName = (record.full_name as string | null) ?? (user?.user_metadata?.full_name as string | undefined) ?? '';
  const firstName = fullName.trim().split(/\s+/)[0] ?? '';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [email],
      subject: 'Welcome to Beacon \u{1F43E}',
      html: welcomeHtml(firstName),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.warn(`[send-welcome] Resend failed status=${res.status} body=${errText.slice(0, 300)}`);
    return json({ sent: false, status: res.status }, 200);
  }
  return json({ sent: true, to: email });
});

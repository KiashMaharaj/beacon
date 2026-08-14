# send-welcome

Sends a branded "welcome to Beacon" email to every new user (email **and** Google
sign-ups), via Resend. Triggered by a Database Webhook when a `public.profiles`
row is created (the `handle_new_user` trigger makes one for each new auth user).

## One-time setup

### 1. Get a Resend API key
Resend dashboard → **API Keys** → **Create API Key** (Sending access). Copy it.
Your sending domain (`usebeacon.co.za`) is already verified from the SMTP setup,
so `no-reply@usebeacon.co.za` can send.

### 2. Add secrets (Edge Functions → Secrets)
- `RESEND_API_KEY` = the key from step 1
- `MAIL_FROM` = `Beacon <no-reply@usebeacon.co.za>` (optional; this is the default)
- `WEBHOOK_SECRET` = any random string (optional but recommended; must match the
  header in step 4)

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically.

### 3. Deploy the function
Edge Functions → **Deploy a new function** → name it `send-welcome` → paste
`index.ts` → **Deploy**.

### 4. Create the Database Webhook
Database (or Integrations) → **Webhooks** → **Create a new hook**:
- **Table**: `public.profiles`
- **Events**: `Insert`
- **Type**: Supabase Edge Function → `send-welcome`
- **HTTP Headers**: add `x-webhook-secret` = the same value as `WEBHOOK_SECRET`
  (skip if you didn't set that secret)

Save.

## Test
Create a brand-new account (or sign in with a Google account you haven't used).
You should receive the welcome email within a few seconds. Check
**Edge Functions → send-welcome → Logs** for `[send-welcome] result {"sent":true…}`.

## Notes
- Fires once per new user (a profile is created once). For email/password signups
  with confirmation on, it arrives alongside the confirmation email — that's fine.
- If `RESEND_API_KEY` is missing the function no-ops with a 500 and logs it; it
  never blocks sign-up.

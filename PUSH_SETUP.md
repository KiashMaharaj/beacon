# 🔔 Push notifications setup (Firebase Cloud Messaging)

Push is **free** (FCM has no send costs) and works on the web app and the Android
TWA. It stays completely off until you add the Firebase config, so the app is
unaffected until you finish this.

There are two halves:
- **Device registration** (already built): tapping *Enable alerts* asks for
  permission, registers a Firebase token for the device, and saves it.
- **Sender** (already built): a Supabase Edge Function that, on a new missing-pet
  report, notifies everyone whose saved area overlaps.

You provide the Firebase project + credentials; the code does the rest.

---

## 1. Create a Firebase project (~3 min)

1. Go to the [Firebase console](https://console.firebase.google.com) → **Add project** (a free Spark plan is fine).
2. Inside the project, click the **Web** icon (`</>`) to **add a web app** → give it a nickname → Register. Copy the `firebaseConfig` values.
3. **Project settings → Cloud Messaging → Web configuration → Web Push certificates → Generate key pair.** Copy the key (this is your VAPID key).

## 2. Add the web config to Vercel

Vercel → project → **Settings → Environment Variables** → add (from the config in step 1):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...   (from step 1.3)
```
**Redeploy.** Now *Enable alerts* will prompt for notifications and save a device token to `notification_prefs.push_token`.

### ✅ Verify the device half works (no sender needed yet)
1. On your phone, open the app, **Enable alerts**, allow the prompt.
2. In Supabase → **Table Editor → notification_prefs**, copy your row's `push_token`.
3. Firebase console → **Cloud Messaging → Send your first message → Send test message** → paste the token → **Test**. You should get a notification. 🎉

---

## 3. Deploy the sender (Supabase Edge Function)

1. **Service account:** Firebase console → **Project settings → Service accounts → Generate new private key** → downloads a JSON file.
2. Install the Supabase CLI and link your project (`npm i -g supabase`, `supabase link --project-ref <ref>`).
3. Set secrets and deploy:
   ```bash
   supabase secrets set FCM_SERVICE_ACCOUNT="$(cat path/to/service-account.json)"
   supabase secrets set APP_URL="https://beacon-six-chi.vercel.app"
   supabase secrets set WEBHOOK_SECRET="$(openssl rand -hex 16)"   # optional but recommended
   supabase functions deploy notify-nearby --no-verify-jwt
   ```
   (`--no-verify-jwt` because it's called by a database webhook, not a signed-in user.)
4. Make sure the `nearby_push_targets` function exists — it's in migration
   `0009_nearby_targets.sql` (and in `supabase/setup.sql`). Run it if you haven't.

## 4. Fire the sender on new reports (Database Webhook)

Supabase → **Database → Webhooks → Create a new hook**:
- Table: **`pet_reports`**, Events: **Insert**
- Type: **HTTP Request → POST**
- URL: your function URL — `https://<project-ref>.supabase.co/functions/v1/notify-nearby`
- HTTP Headers: add `x-webhook-secret: <the WEBHOOK_SECRET you set>` (if you used one)
- Save.

---

## 5. Test end to end

Use two accounts (or two devices):
1. Account A: **Alerts → add a saved area** somewhere, keep alerts on.
2. Account B: **Report a missing pet** with a last-seen location **inside** A's radius and matching the area's species filter.
3. Account A gets a push: *"<name> is missing nearby…"* that opens the pet page.

Check the function logs in Supabase (**Edge Functions → notify-nearby → Logs**) if anything's off — it returns `{ sent, targeted }`.

---

## Notes
- Web push needs **HTTPS** (Vercel is) and, on desktop, the app doesn't need to be open. On Android/TWA these arrive as native notifications.
- Invalid/expired tokens are cleared automatically when a send fails.
- iOS Safari supports web push only for **installed** PWAs (Add to Home Screen) on iOS 16.4+.
- No ongoing cost: FCM is free; the Edge Function runs on Supabase's free tier for typical volumes.

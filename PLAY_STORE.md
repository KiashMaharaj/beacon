# 📱 Publishing Beacon to the Google Play Store

Beacon is a PWA. The standard, Google-endorsed way to ship it to Play is a
**Trusted Web Activity (TWA)** — a thin Android wrapper around your live site
(`https://beacon-six-chi.vercel.app`) built with **Bubblewrap**. The app opens
full-screen with no browser URL bar and installs like any native app.

Everything in the repo is already prepared:

- ✅ Installable web manifest with `id`, `scope`, shortcuts and theme colours
- ✅ PNG icons (192, 512), a **maskable** icon, apple-touch icon, and a 512 Play listing icon in `public/`
- ✅ Digital Asset Links endpoint at `/.well-known/assetlinks.json` (env-driven)
- ✅ Privacy Policy (`/privacy`) and Terms (`/terms`) pages — Play requires a privacy URL
- ✅ `twa-manifest.json` pre-filled for Bubblewrap

What only you can do: create the Play Developer account, build/sign the app on
your machine, and complete the Console forms. This guide walks all of it.

---

## 0. One-time prerequisites

- **Google Play Developer account** — one-time US $25 at
  [play.google.com/console](https://play.google.com/console/signup).
- **Node 18+** and a **JDK 17** installed.
- **Bubblewrap CLI**: `npm install -g @bubblewrap/cli`
  (On first `build` it offers to download the Android SDK/JDK for you — accept.)

---

## 1. Before you build: update two placeholders

- **Privacy contact email** — edit `CONTACT_EMAIL` in `src/app/privacy/page.tsx`
  to an address you monitor, then redeploy. Google checks the privacy policy.
- **Package name** — `app.beacon.twa` in `twa-manifest.json` is fine, but it is
  **permanent** once published. Change it now if you want something else
  (reverse-domain style, e.g. `com.yourname.beacon`).

---

## 2. Build the Android app bundle (.aab)

From the repo root:

```bash
bubblewrap init --manifest https://beacon-six-chi.vercel.app/manifest.webmanifest
# (or reuse the committed config)
bubblewrap build
```

- On first run it **creates a signing keystore** (`android.keystore`) and asks
  for passwords — **save these somewhere safe**; you need the same key for every
  future update. **Do not commit the keystore.**
- Output: **`app-release-bundle.aab`** (upload this) and `app-release-signed.apk`
  (handy for local testing).

> Tip: prefer **Play App Signing** (default in Console). You upload your
> `.aab`; Google manages the final signing key. You will then use **Google's**
> signing certificate SHA-256 for Digital Asset Links (next step).

---

## 3. Wire up Digital Asset Links (removes the URL bar)

The TWA only runs full-screen if your site vouches for the app.

1. Get the **SHA-256 fingerprint** of the signing cert:
   - With Play App Signing: **Play Console → your app → Setup → App integrity →
     App signing key certificate → SHA-256**.
   - Or locally: `keytool -list -v -keystore android.keystore -alias beacon`.
2. In **Vercel → your project → Settings → Environment Variables**, add:
   ```
   ANDROID_PACKAGE_NAME=app.beacon.twa
   ANDROID_SHA256_FINGERPRINTS=AA:BB:CC:...   (paste the SHA-256; comma-separate if more than one)
   ```
3. **Redeploy** so the change takes effect.
4. Verify it serves correctly:
   ```
   https://beacon-six-chi.vercel.app/.well-known/assetlinks.json
   ```
   It should now return your package + fingerprint (not an empty `[]`).

---

## 4. Create the app in Play Console

**Play Console → Create app**: name `Beacon`, App, Free, accept declarations.

Then complete the **Dashboard** setup tasks (see copy below), and under
**Release → Testing → Internal testing**, create a release, upload your
`app-release-bundle.aab`, and roll it out to yourself first. Once it looks good,
promote to **Production**.

---

## 5. Store listing copy (ready to paste)

**App name:** `Beacon: Lost & Found Pets`

**Short description** (max 80 chars):
> Reunite lost pets with their families. Report, get nearby alerts, share sightings.

**Full description:**
> Beacon helps neighbours help each other bring lost pets home.
>
> When a pet goes missing, every extra pair of eyes matters. Beacon rallies your
> neighbourhood so the search starts right away.
>
> • Report a missing pet in seconds — photo, details, and the exact spot on a map.
> • Found a pet? Report it, and Beacon automatically suggests likely matches from
>   nearby missing pets, then notifies the owner.
> • Browse a beautiful feed of nearby missing and found pets, with search and filters.
> • Share a sighting — "I saw this pet" — to guide an owner closer to home.
> • Get nearby alerts for the areas you care about (home, work, family), with no
>   continuous background location tracking, ever.
> • Celebrate every reunion.
>
> Beacon is designed to grow into a broader neighbourhood platform, but version 1
> is focused entirely on one thing: helping reunite lost pets.
>
> Helping neighbours bring pets home. 🐾

**Category:** Lifestyle (alternative: Social)
**Tags:** pets, lost and found, community, neighbourhood
**Contact email:** your monitored address
**Privacy Policy URL:** `https://beacon-six-chi.vercel.app/privacy`

---

## 6. Graphics checklist

| Asset | Spec | Where |
|---|---|---|
| App icon | 512×512 PNG, 32-bit | `public/play-store-icon-512.png` (ready) |
| Feature graphic | 1024×500 PNG/JPG | **you create** — required |
| Phone screenshots | 2–8, PNG/JPG, min 320px, 16:9 or 9:16 | **you capture** — required |
| Tablet screenshots | optional | optional |

Capture screenshots from the live app on your phone (welcome, home, a pet
detail with the map, report flow, reunion celebration). For the feature graphic,
a simple banner with the logo + "Helping neighbours bring pets home" works well.

---

## 7. Data safety form (fill in Console → App content → Data safety)

Beacon **does** collect data, it **is** encrypted in transit, and users **can**
request deletion. Suggested answers:

| Data type | Collected | Purpose | Shared |
|---|---|---|---|
| Name | Yes | Account, app functionality | No |
| Email address | Yes | Account | No |
| Photos | Yes | App functionality (pet reports) | Visible to other users in the app |
| Approximate location | Yes (optional, in use only) | App functionality | Visible to other users via reports |
| App activity (reports/sightings) | Yes | App functionality | Visible to other users in the app |

- Location is **only** used while the app is in use (one-shot on request); mark
  it **not** collected in the background.
- Encryption in transit: **Yes** (HTTPS). Users can request deletion: **Yes**
  (points to your privacy contact).

---

## 8. Other required sections

- **Privacy policy:** `https://beacon-six-chi.vercel.app/privacy`
- **App access:** the app requires an account — provide test credentials (create
  a demo account and paste its email/password) so reviewers can sign in.
- **Content rating:** complete the questionnaire (Beacon is a social/utility app
  with user-generated content; expect an "Everyone/PEGI 3" style rating).
- **Target audience:** 13+ (not designed for children).
- **Ads:** No.

---

## 9. Updating later

Bump `appVersionCode` (and `appVersionName`) in `twa-manifest.json`, rebuild
with Bubblewrap using the **same keystore**, and upload the new `.aab`. Because
Beacon loads your live site, most content/UX changes ship instantly via Vercel
with **no new Play release needed** — you only re-release for native shell
changes (icon, name, permissions, version).

---

### Quick reference

| Thing | Value |
|---|---|
| Live site | `https://beacon-six-chi.vercel.app` |
| Web manifest | `/manifest.webmanifest` |
| Asset links | `/.well-known/assetlinks.json` |
| Privacy policy | `/privacy` |
| Package id | `app.beacon.twa` (change before first publish if desired) |
| Play listing icon | `public/play-store-icon-512.png` |

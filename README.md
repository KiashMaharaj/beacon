# 🐾 Beacon

**Helping neighbours bring pets home.**

Beacon is a mobile-first neighbourhood community app. Version 1 is laser-focused on the best
possible **lost & found pet** experience — reporting missing pets, reporting found pets, smart
matching, sightings, and celebrating reunions — with an architecture intentionally built to grow
into a broader neighbourhood platform (safety alerts, estate notices, local services and more).

<p align="center"><em>Apple-quality polish, Airbnb warmth.</em></p>

---

## ✨ Highlights

- **Polished onboarding** that explains the value _before_ asking for notification permission
  (permission is only requested after the user taps **Enable alerts**).
- **A home screen that feels alive** — friendly greeting, nearby missing pets, recently reunited
  pets, helpful tips, quick actions and a floating action button.
- **Report a missing pet** with photo, full details, tap-to-place map location, alert radius and a
  preview-before-publish step.
- **Report a found pet** with **automatic smart matching** against nearby missing pets, ranked by a
  transparent confidence score, with one-tap "notify owner".
- **Nearby feed** with search, species filters (dogs / cats / other), status tabs (missing / found /
  reunited) and sorting (nearest / recent / longest missing).
- **Pet detail** with hero image, map, timeline, sightings, share, contact owner, "I saw this pet"
  and **Mark found** with a delightful reunion celebration.
- **Notifications & saved areas** — choose a radius (1/3/5/10 km), species filter, and multiple
  saved areas (Home, Work, Parents, Holiday home, custom). Owners are only alerted when a pet's
  last-seen location overlaps a saved area. **No continuous background tracking, ever.**
- **Beautiful dark mode**, generous spacing, subtle motion, and **original hand-crafted SVG
  illustrations and logo** (a beacon + location pin + paw print).
- **Accessible**: semantic landmarks, focus rings, `aria` roles/labels, reduced-motion support,
  keyboard-dismissable dialogs.

## 🧱 Tech stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | **Next.js 14** (App Router) + **TypeScript**       |
| Styling        | **Tailwind CSS** (custom warm theme, dark mode)    |
| Forms          | **React Hook Form** + **Zod** validation           |
| Animation      | **Framer Motion** + Tailwind keyframes             |
| Backend        | **Supabase** (Postgres, Auth, Storage, Realtime, RLS) |
| Push (arch.)   | **Firebase Cloud Messaging** architecture          |
| Maps           | Stylised SVG map, swappable for MapTiler/Mapbox    |
| Testing        | **Jest** + **Testing Library**                     |

## 🚀 Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

**Beacon runs out of the box with zero backend configuration.** When Supabase environment variables
are absent it starts in **demo mode**, backed by a seeded in-memory store (persisted to
`localStorage`), so you can explore the entire journey immediately. Add Supabase credentials to
switch persistence to the real backend (see below).

### Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Production build                     |
| `npm start`         | Run the production build             |
| `npm run lint`      | ESLint                               |
| `npm run typecheck` | TypeScript type-check                |
| `npm test`          | Run the unit tests                   |

## 🗄️ Supabase setup (production)

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Run the migrations** in order (SQL editor or `supabase db push`):
   - `supabase/migrations/0001_init.sql` — tables, enums, indexes, triggers, helpers
   - `supabase/migrations/0002_rls.sql` — Row Level Security policies
   - `supabase/migrations/0003_storage.sql` — `pet-photos` storage bucket + policies
3. **Copy env vars** into `.env.local` (see `.env.example`):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```

4. **Regenerate types** (optional, kept in `src/lib/database.types.ts`):

   ```bash
   supabase gen types typescript --project-id <id> > src/lib/database.types.ts
   ```

### Data model

- `profiles` — one per auth user (auto-created on signup via trigger).
- `pet_reports` — a single table for both **missing** and **found** reports (`kind` discriminator,
  `status` lifecycle: `active → reunited`).
- `sightings` — "I saw this pet" reports linked to a report.
- `alert_areas` — a user's saved areas (Home/Work/…), each with radius & species filter.
- `notification_prefs` — per-user alert settings and FCM push token.
- `matches` — smart-match suggestions between found and missing reports.

**Security:** reports & sightings are community-readable (that is the point), but only owners can
mutate their own rows. Saved areas and notification prefs are strictly private. All enforced with
Row Level Security — see `0002_rls.sql`. A `distance_km()` SQL helper enables radius queries without
a PostGIS dependency.

## 🔔 Notifications architecture (FCM)

Beacon is designed around **Firebase Cloud Messaging**:

1. On opt-in, the client registers an FCM token stored in `notification_prefs.push_token`.
2. When a missing-pet report is created, a Supabase Edge Function (or database webhook) computes
   which users have a **saved area overlapping** the pet's last-seen location (`distance_km`).
3. Only those users are sent a push — matching their radius and species filter.

This is a **fan-out-on-write** design that never requires background location tracking. FCM env vars
are documented in `.env.example`; the client wiring lives behind the notification preferences UI.

## 🧠 Smart matching

`src/lib/matching.ts` is a pure, fully unit-tested scoring engine. When a found pet is reported it
scores each active missing pet (species, distance, colour, size, breed, recency) into a 0–100
confidence with human-readable reasons, then surfaces likely matches and offers to notify owners. It
runs client-side in demo mode and can run in a Supabase Edge Function in production without change.

## 🎨 Design system

- Warm **beacon** (amber/orange) primary + calm **harbor** (teal) accent, on cream / warm-dark
  surfaces.
- Rounded cards, soft shadows, gradient accents, tasteful motion.
- **All illustrations are original SVG** (`src/components/illustrations`, `src/components/brand`) —
  dogs, cats, small pets, paw prints, neighbourhood houses, maps, parks, trees and the Beacon logo.

## ♿ Accessibility & quality

- Mobile-first, responsive, safe-area aware.
- Semantic HTML, focus-visible rings, `aria` roles and labels, `prefers-reduced-motion` support.
- Excellent loading skeletons, empty states, and error boundaries (`error.tsx`, `not-found.tsx`).
- Clean ESLint, strict TypeScript, passing tests and production build.

## 🧪 Testing

```bash
npm test
```

Covers the geospatial helpers, the smart-matching engine, formatting utilities, and a component
render test. Extend with Playwright E2E for the full journey (onboarding → report → sighting →
reunion) as needed.

## 📦 Deploy

Beacon is a standard Next.js app and deploys anywhere Next runs.

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKiashMaharaj%2Fbeacon)

1. Go to [vercel.com/new](https://vercel.com/new) and **Import** the existing `KiashMaharaj/beacon` repo
   (or use the button above).
2. Vercel auto-detects Next.js — no build settings to change.
3. **Environment variables are optional.** With none set, Beacon deploys in fully-interactive
   *demo mode* (seeded in-memory data). To connect a real backend, add the values from
   `.env.example` (Supabase + FCM).
4. Click **Deploy** — Vercel runs `npm run build` and gives you a live `*.vercel.app` URL.

### Docker / self-host

```bash
npm run build
npm start   # serves on $PORT (default 3000)
```

### Google Play (TWA)

Beacon ships a web app manifest (`/manifest.webmanifest`) and icons, making it ready to wrap as a
**Trusted Web Activity** with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) for a
Play Store submission:

```bash
npx @bubblewrap/cli init --manifest https://<your-domain>/manifest.webmanifest
npx @bubblewrap/cli build
```

## 🌱 Future expansion

The navigation, branding and data model are built to welcome — without disrupting V1 — community
safety alerts, estate notifications, local recommendations, found items, nearby services, community
announcements and a marketplace. The **Alerts** screen already previews what's coming next.

---

<p align="center">Built with care, so someone can smile when their pet comes home. 🏡🐕🐈</p>

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { distanceKm } from './geo';
import { uid } from './id';
import { findMatches, type ScoredMatch } from './matching';
import { DEMO_USER, demoAreas, demoPrefs, demoReports } from './demo-data';
import { getBrowserClient } from './supabase/client';
import * as repo from './supabase/repo';
import { registerForPush } from './push';
import { supabaseAnonKey, supabaseUrl } from './config';
import type {
  AlertArea,
  Flag,
  NotificationPrefs,
  PetReport,
  Sighting,
  SpeciesFilter,
} from './types';
import type { NewReportInput } from './store-types';

export type { NewReportInput };

const DEMO_KEY = 'beacon.state.v1';
const ONBOARD_KEY = 'beacon.onboarded.v1';

interface Viewer {
  id: string;
  name: string;
  avatarUrl?: string | null;
  email?: string | null;
  isAdmin?: boolean;
}

interface DemoState {
  reports: PetReport[];
  areas: AlertArea[];
  prefs: NotificationPrefs;
  signedIn: boolean;
}

function defaultPrefs(userId: string): NotificationPrefs {
  return { userId, alertsEnabled: false, defaultRadiusKm: 3, speciesFilter: 'all' };
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

interface BeaconContextValue {
  ready: boolean;
  isLive: boolean;
  user: Viewer;
  signedIn: boolean;
  isAdmin: boolean;
  onboarded: boolean;
  reports: PetReport[];
  areas: AlertArea[];
  prefs: NotificationPrefs;
  viewerLocation: { lat: number; lng: number } | null;

  // derived
  withDistance: (reports: PetReport[]) => PetReport[];
  getReport: (id: string) => PetReport | undefined;

  // auth
  signInDemo: (name?: string) => void;
  signUpWithEmail: (input: SignUpInput) => Promise<{ needsConfirmation: boolean }>;
  signInWithEmail: (input: { email: string; password: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  completeOAuth: () => Promise<boolean>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  completeOnboarding: () => void;
  setViewerLocation: (loc: { lat: number; lng: number } | null) => void;

  // reports & sightings
  createReport: (input: NewReportInput) => Promise<PetReport>;
  addSighting: (
    reportId: string,
    s: Omit<Sighting, 'id' | 'reportId' | 'createdAt'>,
  ) => Promise<void>;
  markReunited: (reportId: string) => Promise<void>;
  updateReport: (reportId: string, input: Partial<NewReportInput>) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  deleteSighting: (reportId: string, sightingId: string) => Promise<void>;
  matchesForFound: (found: PetReport) => ScoredMatch[];
  notifyOwnerOfMatch: (foundId: string, missingId: string, score: number) => Promise<void>;

  // moderation
  flagReport: (reportId: string, reason: string) => Promise<void>;
  fetchFlags: () => Promise<Flag[]>;
  dismissFlag: (flagId: string) => Promise<void>;

  // alerts
  updatePrefs: (patch: Partial<NotificationPrefs>) => Promise<void>;
  enableAlerts: () => Promise<void>;
  addArea: (area: Omit<AlertArea, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateArea: (id: string, patch: Partial<AlertArea>) => Promise<void>;
  removeArea: (id: string) => Promise<void>;
}

const BeaconContext = createContext<BeaconContextValue | null>(null);

export function BeaconProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => getBrowserClient(), []);
  const isLive = client !== null;

  const [reports, setReports] = useState<PetReport[]>(isLive ? [] : demoReports);
  const [areas, setAreas] = useState<AlertArea[]>(isLive ? [] : demoAreas);
  const [prefs, setPrefs] = useState<NotificationPrefs>(isLive ? defaultPrefs('') : demoPrefs);
  const [viewer, setViewer] = useState<Viewer>(DEMO_USER);
  const [session, setSession] = useState<Session | null>(null);
  const [demoSignedIn, setDemoSignedIn] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);
  const [viewerLocation, setViewerLocationState] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const signedIn = isLive ? session != null : demoSignedIn;

  // Load a signed-in user's profile and data from Supabase.
  const loadLive = useCallback(
    async (s: Session) => {
      if (!client) return;
      const userId = s.user.id;
      const meta = s.user.user_metadata ?? {};
      const profile = await repo.fetchProfile(client, userId);
      setViewer({
        id: userId,
        name:
          profile?.full_name ??
          (meta.full_name as string | undefined) ??
          (meta.name as string | undefined) ??
          s.user.email?.split('@')[0] ??
          'Neighbour',
        avatarUrl: profile?.avatar_url ?? (meta.avatar_url as string | undefined) ?? null,
        email: s.user.email,
        isAdmin: profile?.is_admin ?? false,
      });
      const [rep, ar, pr] = await Promise.all([
        repo.fetchReports(client),
        repo.fetchAreas(client, userId),
        repo.fetchPrefs(client, userId),
      ]);
      setReports(rep);
      setAreas(ar);
      setPrefs(pr ?? defaultPrefs(userId));
    },
    [client],
  );

  // Boot: read onboarding flag, then either hydrate the demo store or resolve
  // the Supabase session.
  useEffect(() => {
    try {
      setOnboarded(window.localStorage.getItem(ONBOARD_KEY) === '1');
    } catch {
      /* storage unavailable */
    }

    if (!client) {
      try {
        const raw = window.localStorage.getItem(DEMO_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<DemoState>;
          if (parsed.reports) setReports(parsed.reports);
          if (parsed.areas) setAreas(parsed.areas);
          if (parsed.prefs) setPrefs(parsed.prefs);
          if (parsed.signedIn) setDemoSignedIn(true);
        }
      } catch {
        /* ignore corrupt storage */
      }
      setReady(true);
      return;
    }

    let active = true;
    client.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) await loadLive(data.session);
      setReady(true);
    });
    const { data: sub } = client.auth.onAuthStateChange(async (event, s) => {
      // A password-recovery link may land anywhere (root/home) and log the user
      // in; whenever we detect it, send them to the reset form instead.
      if (
        event === 'PASSWORD_RECOVERY' &&
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/auth/reset')
      ) {
        window.location.replace('/auth/reset');
        return;
      }
      setSession(s);
      if (s) {
        await loadLive(s);
      } else {
        setReports([]);
        setAreas([]);
        setViewer(DEMO_USER);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [client, loadLive]);

  // Persist the demo store between visits (demo mode only).
  useEffect(() => {
    if (isLive || !ready) return;
    try {
      const snapshot: DemoState = { reports, areas, prefs, signedIn: demoSignedIn };
      window.localStorage.setItem(DEMO_KEY, JSON.stringify(snapshot));
    } catch {
      /* private mode: non-fatal */
    }
  }, [isLive, ready, reports, areas, prefs, demoSignedIn]);

  // Realtime: keep the community feed fresh while signed in.
  //
  // We refetch on any change but *reconcile* the result into the existing list,
  // reusing the previous object for reports that haven't changed. That keeps
  // React keys and object identity stable, so only the card that actually
  // changed re-renders - the rest (and the map markers) stay put instead of
  // flashing on every update. Keyed on the user id (not the whole session
  // object) so a routine token refresh doesn't tear down the subscription.
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (!client || !userId) return;
    let timer: ReturnType<typeof setTimeout>;
    const reconcile = (prev: PetReport[], next: PetReport[]): PetReport[] => {
      const prevById = new Map(prev.map((r) => [r.id, r]));
      let changed = prev.length !== next.length;
      const merged = next.map((n) => {
        const old = prevById.get(n.id);
        if (
          old &&
          old.updatedAt === n.updatedAt &&
          old.status === n.status &&
          old.photoUrl === n.photoUrl &&
          (old.sightings?.length ?? 0) === (n.sightings?.length ?? 0)
        ) {
          return old;
        }
        changed = true;
        return n;
      });
      return changed ? merged : prev;
    };
    const refetch = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        repo
          .fetchReports(client)
          .then((fresh) => setReports((prev) => reconcile(prev, fresh)))
          .catch(() => {});
      }, 600);
    };
    const channel = client
      .channel('beacon-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pet_reports' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sightings' }, refetch)
      .subscribe();
    return () => {
      clearTimeout(timer);
      client.removeChannel(channel);
    };
  }, [client, userId]);

  const setViewerLocation = useCallback((loc: { lat: number; lng: number } | null) => {
    setViewerLocationState(loc);
  }, []);

  const withDistance = useCallback(
    (list: PetReport[]): PetReport[] => {
      if (!viewerLocation) return list.map((r) => ({ ...r, distanceKm: null }));
      return list.map((r) => ({
        ...r,
        distanceKm: r.location ? distanceKm(viewerLocation, r.location) : null,
      }));
    },
    [viewerLocation],
  );

  const getReport = useCallback((id: string) => reports.find((r) => r.id === id), [reports]);

  // ----- Auth ------------------------------------------------------------
  const signInDemo = useCallback((name?: string) => {
    setDemoSignedIn(true);
    if (name) {
      DEMO_USER.name = name;
      setViewer((v) => ({ ...v, name }));
    }
  }, []);

  const signUpWithEmail = useCallback(
    async ({ name, email, password }: SignUpInput) => {
      if (!client) {
        signInDemo(name);
        return { needsConfirmation: false };
      }
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { needsConfirmation: data.session == null };
    },
    [client, signInDemo],
  );

  const signInWithEmail = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      if (!client) {
        signInDemo();
        return;
      }
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    [client, signInDemo],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!client) {
      signInDemo();
      return;
    }
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }, [client, signInDemo]);

  // Finish an OAuth / magic-link redirect. Runs on /auth/callback: exchanges the
  // PKCE `?code=` for a session using *this* client, so our own onAuthStateChange
  // fires and the provider's session state updates (a separate client instance
  // wouldn't notify us, leaving Guard to bounce the user back to /welcome).
  // Returns true once a session exists.
  const completeOAuth = useCallback(async (): Promise<boolean> => {
    if (!client) return false;
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (params.get('error') || hashParams.get('error')) return false;

    // Already have a session (e.g. auto-detected)? Use it.
    const existing = await client.auth.getSession();
    if (existing.data.session) {
      setSession(existing.data.session);
      return true;
    }

    const code = params.get('code');
    if (code) {
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (data?.session) {
        setSession(data.session);
        return true;
      }
      // Another init path may have consumed the code first - re-check.
      if (error) {
        const again = await client.auth.getSession();
        if (again.data.session) {
          setSession(again.data.session);
          return true;
        }
        return false;
      }
    }

    // Implicit flow (#access_token=) or a slightly delayed session write: poll
    // briefly rather than failing immediately.
    for (let i = 0; i < 6; i += 1) {
      await new Promise((r) => setTimeout(r, 500));
      const s = await client.auth.getSession();
      if (s.data.session) {
        setSession(s.data.session);
        return true;
      }
    }
    return false;
  }, [client]);

  const signOut = useCallback(async () => {
    if (client) await client.auth.signOut();
    setDemoSignedIn(false);
    setSession(null);
  }, [client]);

  const sendPasswordReset = useCallback(
    async (email: string) => {
      if (!client) return;
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (error) throw error;
    },
    [client],
  );

  const deleteAccount = useCallback(async () => {
    if (client && session) {
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: supabaseAnonKey,
        },
      });
      if (!res.ok) throw new Error('Could not delete your account. Please try again.');
      await client.auth.signOut();
    }
    setDemoSignedIn(false);
    setSession(null);
  }, [client, session]);

  const completeOnboarding = useCallback(() => {
    setOnboarded(true);
    try {
      window.localStorage.setItem(ONBOARD_KEY, '1');
    } catch {
      /* non-fatal */
    }
  }, []);

  // ----- Reports & sightings --------------------------------------------
  const createReport = useCallback(
    async (input: NewReportInput): Promise<PetReport> => {
      if (client && session) {
        const profileLike = {
          id: viewer.id,
          full_name: viewer.name,
          avatar_url: viewer.avatarUrl ?? null,
          phone: null,
          is_admin: viewer.isAdmin ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const report = await repo.insertReport(client, profileLike, input);
        setReports((s) => [report, ...s]);
        return report;
      }

      const iso = new Date().toISOString();
      const report: PetReport = {
        id: uid('r'),
        reporterId: viewer.id,
        reporter: { id: viewer.id, name: viewer.name, avatarUrl: viewer.avatarUrl },
        kind: input.kind,
        status: 'active',
        name: input.name ?? null,
        species: input.species,
        breed: input.breed ?? null,
        colour: input.colour ?? null,
        age: input.age ?? null,
        size: input.size ?? null,
        description: input.description ?? null,
        photoUrl: input.photoUrl ?? null,
        lastSeenAt: input.lastSeenAt ?? iso,
        location: input.location ?? null,
        alertRadiusKm: input.alertRadiusKm ?? 3,
        stillHasPet: input.stillHasPet ?? null,
        notes: input.notes ?? null,
        contactPref: input.contactPref,
        contactValue: input.contactValue ?? null,
        createdAt: iso,
        updatedAt: iso,
        sightings: [],
      };
      setReports((s) => [report, ...s]);
      return report;
    },
    [client, session, viewer],
  );

  const addSighting = useCallback(
    async (reportId: string, s: Omit<Sighting, 'id' | 'reportId' | 'createdAt'>) => {
      if (client && session) {
        const saved = await repo.insertSighting(client, reportId, viewer.id, {
          seenAt: s.seenAt,
          location: s.location ?? null,
          photoUrl: s.photoUrl ?? null,
          notes: s.notes ?? null,
        });
        const withReporter: Sighting = {
          ...saved,
          reporter: { id: viewer.id, name: viewer.name },
        };
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? { ...r, sightings: [withReporter, ...(r.sightings ?? [])], updatedAt: saved.createdAt }
              : r,
          ),
        );
        return;
      }

      const sighting: Sighting = {
        ...s,
        id: uid('s'),
        reportId,
        createdAt: new Date().toISOString(),
      };
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, sightings: [sighting, ...(r.sightings ?? [])], updatedAt: sighting.createdAt }
            : r,
        ),
      );
    },
    [client, session, viewer],
  );

  const markReunited = useCallback(
    async (reportId: string) => {
      if (client && session) await repo.setReportStatus(client, reportId, 'reunited');
      const iso = new Date().toISOString();
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: 'reunited', reunitedAt: iso, updatedAt: iso } : r,
        ),
      );
    },
    [client, session],
  );

  const deleteReport = useCallback(
    async (reportId: string) => {
      if (client && session) await repo.deleteReport(client, reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    },
    [client, session],
  );

  const deleteSighting = useCallback(
    async (reportId: string, sightingId: string) => {
      if (client && session) await repo.deleteSighting(client, sightingId);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, sightings: (r.sightings ?? []).filter((s) => s.id !== sightingId) }
            : r,
        ),
      );
    },
    [client, session],
  );

  const updateReport = useCallback(
    async (id: string, input: Partial<NewReportInput>) => {
      let resolvedPhoto = input.photoUrl;
      if (client && session) {
        const updated = await repo.updateReport(client, viewer.id, id, input);
        resolvedPhoto = updated.photoUrl;
      }
      const pick = <T,>(next: T | undefined, current: T): T => (next !== undefined ? next : current);
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                name: pick(input.name, r.name),
                species: pick(input.species, r.species),
                breed: pick(input.breed, r.breed),
                colour: pick(input.colour, r.colour),
                age: pick(input.age, r.age),
                size: pick(input.size, r.size),
                description: pick(input.description, r.description),
                notes: pick(input.notes, r.notes),
                stillHasPet: pick(input.stillHasPet, r.stillHasPet),
                contactPref: pick(input.contactPref, r.contactPref),
                contactValue: pick(input.contactValue, r.contactValue),
                alertRadiusKm: pick(input.alertRadiusKm, r.alertRadiusKm),
                lastSeenAt: pick(input.lastSeenAt, r.lastSeenAt),
                location: pick(input.location, r.location),
                photoUrl: input.photoUrl !== undefined ? resolvedPhoto ?? null : r.photoUrl,
                updatedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
    },
    [client, session, viewer.id],
  );

  const flagReport = useCallback(
    async (reportId: string, reason: string) => {
      if (client && session) {
        try {
          await repo.insertFlag(client, reportId, viewer.id, reason);
        } catch {
          /* best-effort */
        }
      }
    },
    [client, session, viewer.id],
  );

  const fetchFlags = useCallback(async (): Promise<Flag[]> => {
    if (client && session) {
      try {
        return await repo.fetchFlags(client);
      } catch {
        return [];
      }
    }
    return [];
  }, [client, session]);

  const dismissFlag = useCallback(
    async (flagId: string) => {
      if (client && session) {
        try {
          await repo.deleteFlag(client, flagId);
        } catch {
          /* best-effort */
        }
      }
    },
    [client, session],
  );

  const matchesForFound = useCallback(
    (found: PetReport) => findMatches(found, reports),
    [reports],
  );

  const notifyOwnerOfMatch = useCallback(
    async (foundId: string, missingId: string, score: number) => {
      if (client && session) {
        try {
          await repo.insertMatch(client, foundId, missingId, Math.round(score));
        } catch {
          /* best-effort: the finder still sees the confirmation */
        }
      }
    },
    [client, session],
  );

  // ----- Alerts ----------------------------------------------------------
  const updatePrefs = useCallback(
    async (patch: Partial<NotificationPrefs>) => {
      setPrefs((p) => ({ ...p, ...patch }));
      if (client && session) {
        try {
          await repo.upsertPrefs(client, viewer.id, patch);
        } catch {
          /* non-fatal */
        }
      }
    },
    [client, session, viewer.id],
  );

  const enableAlerts = useCallback(async () => {
    await updatePrefs({ alertsEnabled: true });
    // Register this device for push and store its token (no-op if push isn't
    // configured or the user declines the permission prompt).
    try {
      const token = await registerForPush();
      if (token) await updatePrefs({ pushToken: token });
    } catch {
      /* non-fatal */
    }
  }, [updatePrefs]);

  const addArea = useCallback(
    async (area: Omit<AlertArea, 'id' | 'userId' | 'createdAt'>) => {
      if (client && session) {
        const saved = await repo.insertArea(client, viewer.id, area);
        setAreas((s) => [...s, saved]);
        return;
      }
      const newArea: AlertArea = {
        ...area,
        id: uid('a'),
        userId: viewer.id,
        createdAt: new Date().toISOString(),
      };
      setAreas((s) => [...s, newArea]);
    },
    [client, session, viewer.id],
  );

  const updateArea = useCallback(
    async (id: string, patch: Partial<AlertArea>) => {
      setAreas((s) => s.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      if (client && session) {
        try {
          await repo.updateAreaRow(client, id, patch);
        } catch {
          /* non-fatal */
        }
      }
    },
    [client, session],
  );

  const removeArea = useCallback(
    async (id: string) => {
      setAreas((s) => s.filter((a) => a.id !== id));
      if (client && session) {
        try {
          await repo.deleteAreaRow(client, id);
        } catch {
          /* non-fatal */
        }
      }
    },
    [client, session],
  );

  const value = useMemo<BeaconContextValue>(
    () => ({
      ready,
      isLive,
      user: viewer,
      signedIn,
      isAdmin: viewer.isAdmin === true,
      onboarded,
      reports,
      areas,
      prefs,
      viewerLocation,
      withDistance,
      getReport,
      signInDemo,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      completeOAuth,
      signOut,
      sendPasswordReset,
      deleteAccount,
      completeOnboarding,
      setViewerLocation,
      createReport,
      addSighting,
      markReunited,
      updateReport,
      deleteReport,
      deleteSighting,
      matchesForFound,
      notifyOwnerOfMatch,
      flagReport,
      fetchFlags,
      dismissFlag,
      updatePrefs,
      enableAlerts,
      addArea,
      updateArea,
      removeArea,
    }),
    [
      ready,
      isLive,
      viewer,
      signedIn,
      onboarded,
      reports,
      areas,
      prefs,
      viewerLocation,
      withDistance,
      getReport,
      signInDemo,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      completeOAuth,
      signOut,
      sendPasswordReset,
      deleteAccount,
      completeOnboarding,
      setViewerLocation,
      createReport,
      addSighting,
      markReunited,
      updateReport,
      deleteReport,
      deleteSighting,
      matchesForFound,
      notifyOwnerOfMatch,
      flagReport,
      fetchFlags,
      dismissFlag,
      updatePrefs,
      enableAlerts,
      addArea,
      updateArea,
      removeArea,
    ],
  );

  return <BeaconContext.Provider value={value}>{children}</BeaconContext.Provider>;
}

export function useBeacon(): BeaconContextValue {
  const ctx = useContext(BeaconContext);
  if (!ctx) throw new Error('useBeacon must be used within a BeaconProvider');
  return ctx;
}

export type { SpeciesFilter };

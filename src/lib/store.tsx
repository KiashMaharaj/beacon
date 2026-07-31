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
import { distanceKm } from './geo';
import { uid } from './id';
import { findMatches, type ScoredMatch } from './matching';
import {
  DEMO_USER,
  demoAreas,
  demoPrefs,
  demoReports,
} from './demo-data';
import type {
  AlertArea,
  NotificationPrefs,
  PetReport,
  Sighting,
  SpeciesFilter,
} from './types';

const STORAGE_KEY = 'beacon.state.v1';

interface PersistedState {
  reports: PetReport[];
  areas: AlertArea[];
  prefs: NotificationPrefs;
  onboarded: boolean;
  signedIn: boolean;
}

function initialState(): PersistedState {
  return {
    reports: demoReports,
    areas: demoAreas,
    prefs: demoPrefs,
    onboarded: false,
    signedIn: false,
  };
}

export interface NewReportInput {
  kind: 'missing' | 'found';
  name?: string | null;
  species: PetReport['species'];
  breed?: string | null;
  colour?: string | null;
  age?: string | null;
  size?: PetReport['size'];
  description?: string | null;
  photoUrl?: string | null;
  lastSeenAt?: string | null;
  location?: PetReport['location'];
  alertRadiusKm?: number | null;
  stillHasPet?: boolean | null;
  notes?: string | null;
  contactPref: PetReport['contactPref'];
}

interface BeaconContextValue {
  ready: boolean;
  user: typeof DEMO_USER;
  signedIn: boolean;
  onboarded: boolean;
  reports: PetReport[];
  areas: AlertArea[];
  prefs: NotificationPrefs;
  viewerLocation: { lat: number; lng: number } | null;

  // derived
  withDistance: (reports: PetReport[]) => PetReport[];
  getReport: (id: string) => PetReport | undefined;

  // actions
  signIn: (name?: string) => void;
  signOut: () => void;
  completeOnboarding: () => void;
  setViewerLocation: (loc: { lat: number; lng: number } | null) => void;

  createReport: (input: NewReportInput) => PetReport;
  addSighting: (reportId: string, s: Omit<Sighting, 'id' | 'reportId' | 'createdAt'>) => void;
  markReunited: (reportId: string) => void;
  matchesForFound: (found: PetReport) => ScoredMatch[];

  updatePrefs: (patch: Partial<NotificationPrefs>) => void;
  enableAlerts: () => void;
  addArea: (area: Omit<AlertArea, 'id' | 'userId' | 'createdAt'>) => void;
  updateArea: (id: string, patch: Partial<AlertArea>) => void;
  removeArea: (id: string) => void;
}

const BeaconContext = createContext<BeaconContextValue | null>(null);

export function BeaconProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [ready, setReady] = useState(false);
  const [viewerLocation, setViewerLocationState] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        setState((prev) => ({
          reports: parsed.reports ?? prev.reports,
          areas: parsed.areas ?? prev.areas,
          prefs: parsed.prefs ?? prev.prefs,
          onboarded: parsed.onboarded ?? prev.onboarded,
          signedIn: parsed.signedIn ?? prev.signedIn,
        }));
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  // Persist on change (after hydration).
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage may be unavailable (private mode) — non-fatal
    }
  }, [state, ready]);

  const setViewerLocation = useCallback((loc: { lat: number; lng: number } | null) => {
    setViewerLocationState(loc);
  }, []);

  const withDistance = useCallback(
    (reports: PetReport[]): PetReport[] => {
      if (!viewerLocation) return reports.map((r) => ({ ...r, distanceKm: null }));
      return reports.map((r) => ({
        ...r,
        distanceKm: r.location ? distanceKm(viewerLocation, r.location) : null,
      }));
    },
    [viewerLocation],
  );

  const getReport = useCallback(
    (id: string) => state.reports.find((r) => r.id === id),
    [state.reports],
  );

  const signIn = useCallback((name?: string) => {
    setState((s) => ({ ...s, signedIn: true }));
    if (name) DEMO_USER.name = name;
  }, []);

  const signOut = useCallback(() => {
    setState((s) => ({ ...s, signedIn: false }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) => ({ ...s, onboarded: true }));
  }, []);

  const createReport = useCallback((input: NewReportInput): PetReport => {
    const iso = new Date().toISOString();
    const report: PetReport = {
      id: uid('r'),
      reporterId: DEMO_USER.id,
      reporter: { id: DEMO_USER.id, name: DEMO_USER.name, avatarUrl: DEMO_USER.avatarUrl },
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
      createdAt: iso,
      updatedAt: iso,
      sightings: [],
    };
    setState((s) => ({ ...s, reports: [report, ...s.reports] }));
    return report;
  }, []);

  const addSighting = useCallback(
    (reportId: string, s: Omit<Sighting, 'id' | 'reportId' | 'createdAt'>) => {
      const sighting: Sighting = {
        ...s,
        id: uid('s'),
        reportId,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        reports: prev.reports.map((r) =>
          r.id === reportId
            ? { ...r, sightings: [sighting, ...(r.sightings ?? [])], updatedAt: sighting.createdAt }
            : r,
        ),
      }));
    },
    [],
  );

  const markReunited = useCallback((reportId: string) => {
    const iso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      reports: prev.reports.map((r) =>
        r.id === reportId ? { ...r, status: 'reunited', reunitedAt: iso, updatedAt: iso } : r,
      ),
    }));
  }, []);

  const matchesForFound = useCallback(
    (found: PetReport) => findMatches(found, state.reports),
    [state.reports],
  );

  const updatePrefs = useCallback((patch: Partial<NotificationPrefs>) => {
    setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
  }, []);

  const enableAlerts = useCallback(() => {
    setState((s) => ({ ...s, prefs: { ...s.prefs, alertsEnabled: true } }));
  }, []);

  const addArea = useCallback((area: Omit<AlertArea, 'id' | 'userId' | 'createdAt'>) => {
    const newArea: AlertArea = {
      ...area,
      id: uid('a'),
      userId: DEMO_USER.id,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, areas: [...s.areas, newArea] }));
  }, []);

  const updateArea = useCallback((id: string, patch: Partial<AlertArea>) => {
    setState((s) => ({
      ...s,
      areas: s.areas.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const removeArea = useCallback((id: string) => {
    setState((s) => ({ ...s, areas: s.areas.filter((a) => a.id !== id) }));
  }, []);

  const value = useMemo<BeaconContextValue>(
    () => ({
      ready,
      user: DEMO_USER,
      signedIn: state.signedIn,
      onboarded: state.onboarded,
      reports: state.reports,
      areas: state.areas,
      prefs: state.prefs,
      viewerLocation,
      withDistance,
      getReport,
      signIn,
      signOut,
      completeOnboarding,
      setViewerLocation,
      createReport,
      addSighting,
      markReunited,
      matchesForFound,
      updatePrefs,
      enableAlerts,
      addArea,
      updateArea,
      removeArea,
    }),
    [
      ready,
      state,
      viewerLocation,
      withDistance,
      getReport,
      signIn,
      signOut,
      completeOnboarding,
      setViewerLocation,
      createReport,
      addSighting,
      markReunited,
      matchesForFound,
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

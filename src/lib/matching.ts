// Beacon - smart matching engine.
// Compares a "found" pet report against active "missing" reports and scores
// likely matches. Pure & deterministic so it is fully unit-testable and can
// run on the client (demo mode) or server (production, via an Edge Function).

import { distanceKm } from './geo';
import type { PetReport } from './types';

export interface ScoredMatch {
  report: PetReport;
  score: number; // 0..100
  reasons: string[];
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function daysBetween(a?: string | null, b?: string | null): number | null {
  if (!a || !b) return null;
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return ms / (1000 * 60 * 60 * 24);
}

function normalise(text?: string | null): string {
  return (text ?? '').toLowerCase().trim();
}

function colourOverlap(a?: string | null, b?: string | null): boolean {
  const wordsA = normalise(a).split(/[\s,/]+/).filter(Boolean);
  const wordsB = new Set(normalise(b).split(/[\s,/]+/).filter(Boolean));
  return wordsA.some((w) => wordsB.has(w));
}

/**
 * Score a single missing report against a found report.
 * Weighting (max 100):
 *   species    30  (hard signal - a mismatch heavily penalises)
 *   distance   25  (closer last-seen / found location)
 *   colour     20
 *   size       10
 *   breed      10
 *   recency     5  (found shortly after going missing)
 */
export function scoreMatch(found: PetReport, missing: PetReport): ScoredMatch {
  const reasons: string[] = [];
  let score = 0;

  // Species - the strongest discriminator.
  if (found.species === missing.species) {
    score += 30;
    reasons.push('Same species');
  } else {
    // Different species is almost certainly not a match.
    score -= 20;
  }

  // Distance between found location and last-seen location.
  if (found.location && missing.location) {
    const d = distanceKm(found.location, missing.location);
    const proximity = clamp(1 - d / 15, 0, 1); // full marks within ~0km, zero at 15km+
    const pts = Math.round(proximity * 25);
    score += pts;
    if (d <= 1) reasons.push('Found very close to where it went missing');
    else if (d <= 5) reasons.push(`Found ~${d.toFixed(1)} km away`);
  }

  // Colour.
  if (colourOverlap(found.colour, missing.colour)) {
    score += 20;
    reasons.push('Matching colour');
  }

  // Size.
  if (found.size && missing.size && found.size === missing.size) {
    score += 10;
    reasons.push('Same size');
  }

  // Breed (fuzzy contains).
  const fb = normalise(found.breed);
  const mb = normalise(missing.breed);
  if (fb && mb && (fb.includes(mb) || mb.includes(fb))) {
    score += 10;
    reasons.push('Similar breed');
  }

  // Recency - found close in time to when it went missing.
  const gap = daysBetween(found.lastSeenAt, missing.lastSeenAt);
  if (gap != null && gap <= 7) {
    score += 5;
    if (gap <= 1) reasons.push('Timing lines up');
  }

  return { report: missing, score: clamp(Math.round(score), 0, 100), reasons };
}

/**
 * Find likely matches for a found report among active missing reports.
 * Returns matches at/above `threshold`, best first.
 */
export function findMatches(
  found: PetReport,
  missingReports: PetReport[],
  threshold = 45,
): ScoredMatch[] {
  return missingReports
    .filter((m) => m.kind === 'missing' && m.status === 'active')
    .map((m) => scoreMatch(found, m))
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

/** Confidence label for a score, for friendly UI copy. */
export function confidenceLabel(score: number): 'Strong' | 'Possible' | 'Weak' {
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Possible';
  return 'Weak';
}

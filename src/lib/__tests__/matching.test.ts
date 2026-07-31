import { scoreMatch, findMatches, confidenceLabel } from '../matching';
import type { PetReport } from '../types';

function report(overrides: Partial<PetReport>): PetReport {
  return {
    id: overrides.id ?? 'x',
    reporterId: 'u',
    kind: 'missing',
    status: 'active',
    species: 'dog',
    contactPref: 'in_app',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const base = { lat: 51.5074, lng: -0.1278 };

describe('scoreMatch', () => {
  it('scores a strong match highly', () => {
    const found = report({
      kind: 'found',
      species: 'dog',
      colour: 'black and white',
      size: 'medium',
      breed: 'Border Collie',
      location: base,
      lastSeenAt: new Date().toISOString(),
    });
    const missing = report({
      id: 'm',
      species: 'dog',
      colour: 'black and white',
      size: 'medium',
      breed: 'Border Collie',
      location: { lat: base.lat + 0.001, lng: base.lng + 0.001 },
      lastSeenAt: new Date().toISOString(),
    });
    const { score } = scoreMatch(found, missing);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(confidenceLabel(score)).toBe('Strong');
  });

  it('penalises a different species', () => {
    const found = report({ kind: 'found', species: 'dog', colour: 'ginger', location: base });
    const missing = report({ id: 'm', species: 'cat', colour: 'ginger', location: base });
    const { score } = scoreMatch(found, missing);
    expect(score).toBeLessThan(45);
  });

  it('rewards colour overlap and proximity', () => {
    const found = report({ kind: 'found', species: 'cat', colour: 'orange white', location: base });
    const near = report({ id: 'near', species: 'cat', colour: 'orange', location: base });
    const far = report({
      id: 'far',
      species: 'cat',
      colour: 'orange',
      location: { lat: base.lat + 0.2, lng: base.lng + 0.2 },
    });
    expect(scoreMatch(found, near).score).toBeGreaterThan(scoreMatch(found, far).score);
  });

  it('surfaces human-readable reasons', () => {
    const found = report({ kind: 'found', species: 'dog', colour: 'golden', size: 'large', location: base });
    const missing = report({ id: 'm', species: 'dog', colour: 'golden', size: 'large', location: base });
    const { reasons } = scoreMatch(found, missing);
    expect(reasons).toContain('Same species');
    expect(reasons).toContain('Matching colour');
    expect(reasons).toContain('Same size');
  });
});

describe('findMatches', () => {
  const found = report({
    kind: 'found',
    species: 'dog',
    colour: 'golden',
    size: 'large',
    location: base,
  });
  const candidates: PetReport[] = [
    report({ id: 'good', species: 'dog', colour: 'golden', size: 'large', location: base }),
    report({ id: 'catish', species: 'cat', colour: 'golden', location: base }),
    report({ id: 'resolved', species: 'dog', colour: 'golden', location: base, status: 'reunited' }),
  ];

  it('returns only active missing reports above threshold, best first', () => {
    const matches = findMatches(found, candidates);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].report.id).toBe('good');
    expect(matches.find((m) => m.report.id === 'resolved')).toBeUndefined();
  });

  it('excludes weak/other-species matches by default threshold', () => {
    const matches = findMatches(found, candidates);
    expect(matches.find((m) => m.report.id === 'catish')).toBeUndefined();
  });
});

describe('confidenceLabel', () => {
  it('maps score ranges', () => {
    expect(confidenceLabel(80)).toBe('Strong');
    expect(confidenceLabel(60)).toBe('Possible');
    expect(confidenceLabel(50)).toBe('Weak');
  });
});

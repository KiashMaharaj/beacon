import { distanceKm, isWithinRadius, formatDistance } from '../geo';

describe('geo', () => {
  const london = { lat: 51.5074, lng: -0.1278 };
  const greenwich = { lat: 51.4779, lng: -0.0015 };

  it('returns ~0 for identical points', () => {
    expect(distanceKm(london, london)).toBeCloseTo(0, 5);
  });

  it('computes a known distance (London → Greenwich ≈ 9-10 km)', () => {
    const d = distanceKm(london, greenwich);
    expect(d).toBeGreaterThan(8);
    expect(d).toBeLessThan(11);
  });

  it('is symmetric', () => {
    expect(distanceKm(london, greenwich)).toBeCloseTo(distanceKm(greenwich, london), 6);
  });

  it('isWithinRadius respects the boundary', () => {
    expect(isWithinRadius(london, london, 1)).toBe(true);
    expect(isWithinRadius(london, greenwich, 5)).toBe(false);
    expect(isWithinRadius(london, greenwich, 15)).toBe(true);
  });

  it('formats distances in metres under 1km', () => {
    expect(formatDistance(0.4)).toBe('400 m away');
  });

  it('formats distances with one decimal under 10km', () => {
    expect(formatDistance(3.25)).toBe('3.3 km away');
  });

  it('rounds large distances', () => {
    expect(formatDistance(12.6)).toBe('13 km away');
  });

  it('handles nullish input', () => {
    expect(formatDistance(null)).toBe('');
    expect(formatDistance(undefined)).toBe('');
  });
});

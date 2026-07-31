'use client';

import { useEffect } from 'react';
import { useBeacon } from '@/lib/store';
import { appConfig } from '@/lib/config';

/**
 * Best-effort one-shot geolocation used to compute distances in the feed.
 * Falls back to the first saved area, then the app default centre. Never tracks
 * continuously — a single position request only.
 */
export function useViewerLocation() {
  const { viewerLocation, setViewerLocation, areas } = useBeacon();

  useEffect(() => {
    if (viewerLocation) return;
    // Fall back to a saved area immediately so distances render without waiting.
    const home = areas.find((a) => a.label.toLowerCase() === 'home') ?? areas[0];
    if (home) setViewerLocation({ lat: home.lat, lng: home.lng });
    else setViewerLocation({ ...appConfig.defaultCenter });

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setViewerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 6000, maximumAge: 300000 },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return viewerLocation;
}

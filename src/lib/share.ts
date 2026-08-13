// Beacon - share a pet report as a single clean link.
//
// We deliberately share ONLY the deep link (no title, no promo copy). Messaging
// apps then unfurl it into one rich Open Graph card - the pet's photo, name and
// details - and the whole card becomes the tappable link. That reads far cleaner
// than a wall of text plus a raw URL, and it's what turns a share into a visitor.

import type { PetReport } from './types';
import { siteUrl } from './config';

export function reportShareUrl(report: PetReport): string {
  const origin = (typeof window !== 'undefined' && window.location.origin) || siteUrl;
  return `${origin}/pets/${report.id}`;
}

export async function shareReport(report: PetReport): Promise<'shared' | 'copied' | 'cancelled'> {
  const url = reportShareUrl(report);
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ url });
      return 'shared';
    }
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'cancelled';
  }
}

// Beacon - build and trigger a shareable payload for a pet report.
// Produces a deep link to the pet on Beacon plus friendly copy, so a share
// turns into a preview card (via the page's Open Graph tags) and a new visitor.

import type { PetReport } from './types';
import { speciesLabel } from './format';
import { siteUrl } from './config';

export function reportShare(report: PetReport): { title: string; text: string; url: string } {
  const origin = (typeof window !== 'undefined' && window.location.origin) || siteUrl;
  const name =
    report.name ?? (report.kind === 'found' ? `found ${speciesLabel(report.species).toLowerCase()}` : 'a lost pet');
  const url = `${origin}/pets/${report.id}`;
  const details = [report.breed, report.colour, report.location?.label].filter(Boolean).join(' · ');
  const text =
    report.kind === 'found'
      ? `Found a ${speciesLabel(report.species).toLowerCase()} on Beacon${details ? ` (${details})` : ''}. Do you know whose pet this is?`
      : `Help find ${name} on Beacon${details ? `: ${details}` : ''}. Have you seen them?`;
  return { title: `Beacon · ${report.name ?? 'Lost & found pets'}`, text, url };
}

export async function shareReport(report: PetReport): Promise<'shared' | 'copied' | 'cancelled'> {
  const { title, text, url } = reportShare(report);
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, text, url });
      return 'shared';
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    return 'copied';
  } catch {
    return 'cancelled';
  }
}

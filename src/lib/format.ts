import { formatDistanceToNowStrict, format } from 'date-fns';

export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  try {
    return `${formatDistanceToNowStrict(new Date(iso))} ago`;
  } catch {
    return '';
  }
}

export function timeMissing(iso?: string | null): string {
  if (!iso) return '';
  try {
    return formatDistanceToNowStrict(new Date(iso));
  } catch {
    return '';
  }
}

export function prettyDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    return format(new Date(iso), 'd MMM yyyy, HH:mm');
  } catch {
    return '';
  }
}

export function speciesLabel(species: string): string {
  if (species === 'dog') return 'Dog';
  if (species === 'cat') return 'Cat';
  return 'Other pet';
}

export function sizeLabel(size?: string | null): string {
  if (!size) return '';
  return size.charAt(0).toUpperCase() + size.slice(1);
}

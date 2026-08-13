import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import type { PetReport } from '@/lib/types';

type Tone = 'beacon' | 'harbor' | 'success';

function statusMeta(report: PetReport): { label: string; tone: Tone } {
  if (report.status === 'reunited') return { label: 'Reunited 🎉', tone: 'success' };
  if (report.kind === 'found') return { label: 'Found pet', tone: 'harbor' };
  return { label: 'Missing', tone: 'beacon' };
}

// Softer, frosted styling for badges sitting on top of a photo, so they read as
// a gentle overlay rather than a solid block covering the image.
const overlayTone: Record<Tone, string> = {
  beacon: 'text-beacon-700 dark:text-beacon-200',
  harbor: 'text-harbor-700 dark:text-harbor-200',
  success: 'text-emerald-700 dark:text-emerald-200',
};

export function StatusBadge({ report, overlay = false }: { report: PetReport; overlay?: boolean }) {
  const { label, tone } = statusMeta(report);

  if (!overlay) return <Badge tone={tone}>{label}</Badge>;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        'bg-white/65 shadow-sm ring-1 ring-black/5 backdrop-blur-md',
        'dark:bg-stone-900/55 dark:ring-white/10',
        overlayTone[tone],
      )}
    >
      {label}
    </span>
  );
}

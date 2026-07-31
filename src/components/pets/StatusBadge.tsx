import { Badge } from '@/components/ui/Badge';
import type { PetReport } from '@/lib/types';

export function StatusBadge({ report }: { report: PetReport }) {
  if (report.status === 'reunited') return <Badge tone="success">Reunited 🎉</Badge>;
  if (report.kind === 'found') return <Badge tone="harbor">Found pet</Badge>;
  return <Badge tone="beacon">Missing</Badge>;
}

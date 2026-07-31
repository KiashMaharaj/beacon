import { LogoMark } from '@/components/brand/Logo';

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <LogoMark className="h-14 w-14 animate-float" />
      <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-beacon-200 border-t-beacon-500" />
    </div>
  );
}

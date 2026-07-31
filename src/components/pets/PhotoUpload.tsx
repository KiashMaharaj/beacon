'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { CameraIcon } from '@/components/ui/icons';

/**
 * Photo picker. In demo mode the image is read as a data URL for instant
 * preview; wired to Supabase Storage in production (see docs).
 */
export function PhotoUpload({
  value,
  onChange,
  className,
}: {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image is too large (max 8MB).');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition',
          value
            ? 'border-transparent'
            : 'border-beacon-200 bg-beacon-50/60 hover:bg-beacon-50 dark:border-stone-700 dark:bg-stone-800/40',
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Selected pet" className="h-full w-full object-cover" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <CameraIcon className="h-4 w-4" /> Change
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-beacon-500">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-beacon-100 text-beacon-600 transition group-hover:scale-105 dark:bg-beacon-500/15">
              <CameraIcon className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold">Add a photo</span>
            <span className="text-xs text-ink-muted">A clear photo helps neighbours help you</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 text-xs font-semibold text-ink-muted underline hover:text-rose-500"
        >
          Remove photo
        </button>
      )}
    </div>
  );
}

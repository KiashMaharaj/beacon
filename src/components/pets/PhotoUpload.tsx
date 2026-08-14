'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { CameraIcon } from '@/components/ui/icons';

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Photo picker. Offers two explicit choices - take a photo (camera) or upload
 * from the gallery - because relying on a single file input lets the device pick
 * a default handler (e.g. jumping straight to Google Photos with no camera). The
 * image is read as a data URL; the store handles uploading to Supabase Storage.
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
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
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

  const actionBtn =
    'inline-flex items-center justify-center gap-2 rounded-2xl border border-beacon-200 bg-white/70 px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-beacon-50 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-800/60 dark:text-cream-50 dark:hover:bg-stone-800';

  return (
    <div className={className}>
      <div
        className={cn(
          'relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed',
          value
            ? 'border-transparent'
            : 'border-beacon-200 bg-beacon-50/60 dark:border-stone-700 dark:bg-stone-800/40',
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Selected pet" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center text-beacon-500">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-beacon-100 text-beacon-600 dark:bg-beacon-500/15">
              <CameraIcon className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold">Add a photo</span>
            <span className="text-xs text-ink-muted">A clear photo helps neighbours help you</span>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" className={actionBtn} onClick={() => cameraRef.current?.click()}>
          <CameraIcon className="h-4 w-4" />
          Take photo
        </button>
        <button type="button" className={actionBtn} onClick={() => galleryRef.current?.click()}>
          <GalleryIcon className="h-4 w-4" />
          {value ? 'Change' : 'Upload'}
        </button>
      </div>

      {/* Camera: capture hint opens the device camera directly. */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {/* Gallery: no capture, so the user picks an existing photo. */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
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

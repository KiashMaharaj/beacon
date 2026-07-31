'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Modal({
  open,
  onClose,
  children,
  title,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-4xl bg-cream-50 p-6 shadow-float animate-scale-in',
          'dark:bg-stone-900 sm:rounded-4xl',
          className,
        )}
      >
        {title && (
          <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-cream-50">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const baseField =
  'w-full rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-[15px] text-ink placeholder:text-ink-muted/70 ' +
  'shadow-sm transition focus:border-beacon-400 focus:outline-none focus:ring-2 focus:ring-beacon-200 ' +
  'dark:border-stone-700 dark:bg-stone-900/70 dark:text-cream-50 dark:placeholder:text-stone-500 dark:focus:ring-beacon-500/30';

export function FieldLabel({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between">
      <span className="text-sm font-semibold text-ink-soft dark:text-stone-300">
        {children}
        {required && <span className="ml-0.5 text-beacon-500">*</span>}
      </span>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-rose-500">{children}</p>;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(baseField, className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(baseField, 'min-h-[96px] resize-y', className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(baseField, 'appearance-none pr-10', className)} {...props}>
        {children}
      </select>
    );
  },
);

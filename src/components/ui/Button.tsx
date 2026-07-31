import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-beacon-gradient text-white shadow-glow hover:brightness-105 active:brightness-95 focus-visible:ring-beacon-400',
  secondary:
    'bg-harbor-600 text-white shadow-soft hover:bg-harbor-700 active:bg-harbor-800 focus-visible:ring-harbor-400',
  outline:
    'border border-beacon-200 bg-white/70 text-ink hover:bg-beacon-50 dark:border-stone-700 dark:bg-stone-800/60 dark:text-cream-50 dark:hover:bg-stone-800 focus-visible:ring-beacon-400',
  ghost:
    'text-ink-soft hover:bg-beacon-50 dark:text-stone-300 dark:hover:bg-stone-800 focus-visible:ring-beacon-300',
  danger:
    'bg-rose-500 text-white shadow-soft hover:bg-rose-600 active:bg-rose-700 focus-visible:ring-rose-300',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-14 px-7 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, fullWidth, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        'disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
});

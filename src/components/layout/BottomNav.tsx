'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { BellIcon, HomeIcon, PlusIcon, SearchIcon, UserIcon } from '@/components/ui/icons';

const items = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/nearby', label: 'Nearby', icon: SearchIcon },
  { href: '/report', label: 'Report', icon: PlusIcon, primary: true },
  { href: '/alerts', label: 'Alerts', icon: BellIcon },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Primary"
    >
      <div className="flex items-center justify-around rounded-3xl border border-white/60 bg-white/85 px-2 py-2 shadow-float backdrop-blur-lg dark:border-stone-800 dark:bg-stone-900/85">
        {items.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className="relative -mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-beacon-gradient text-white shadow-glow transition active:scale-95"
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-semibold transition',
                active ? 'text-beacon-600 dark:text-beacon-400' : 'text-ink-muted dark:text-stone-500',
              )}
            >
              <Icon className={cn('h-5 w-5 transition', active && 'scale-110')} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

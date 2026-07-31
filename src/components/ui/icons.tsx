import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: p.className ?? 'h-5 w-5',
});

export const HomeIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </svg>
);

export const BellIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const MapPinIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const CameraIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const ShareIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);

export const HeartIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M12 20s-7-4.5-9.3-9A5 5 0 0 1 12 6a5 5 0 0 1 9.3 5c-2.3 4.5-9.3 9-9.3 9Z" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const CheckCircleIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </svg>
);

export const ChevronRightIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const ArrowLeftIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const FilterIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M3 5h18l-7 8v5l-4 2v-7Z" />
  </svg>
);

export const EyeIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const PhoneIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 2 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const SparkleIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const UserIcon = (p: P) => (
  <svg {...base(p)} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

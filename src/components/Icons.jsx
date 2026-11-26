const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const UserIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>
);
export const BagIcon = (p) => (
  <svg {...base} {...p}><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const HeartIcon = ({ filled, ...p }) => (
  <svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </svg>
);
export const TruckIcon = (p) => (
  <svg {...base} width={34} height={34} {...p}>
    <path d="M2 6h11v10H2zM13 9h4l3 3.5V16h-7" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" />
    <path d="M0 9h4M0 12h3" />
  </svg>
);
export const ShieldIcon = (p) => (
  <svg {...base} width={34} height={34} {...p}><path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const GiftIcon = (p) => (
  <svg {...base} width={34} height={34} {...p}>
    <rect x="3" y="8" width="18" height="4" /><path d="M5 12v9h14v-9M12 8v13" />
    <path d="M12 8c-1-3-5-4-5-1.5S10 8 12 8zM12 8c1-3 5-4 5-1.5S14 8 12 8z" />
  </svg>
);
export const HeadsetIcon = (p) => (
  <svg {...base} width={34} height={34} {...p}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" />
    <path d="M19 19c0 1.5-2 2.5-5 2.5" />
  </svg>
);
export const ArrowLeft = (p) => (
  <svg {...base} width={18} height={18} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const CloseIcon = (p) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const MenuIcon = (p) => (
  <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const InstagramIcon = (p) => (
  <svg {...base} width={20} height={20} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>
);
export const TiktokIcon = (p) => (
  <svg {...base} width={20} height={20} {...p}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.8 2.5 4.6 5 4.8" /></svg>
);
export const SnapIcon = (p) => (
  <svg {...base} width={20} height={20} {...p}>
    <path d="M12 3c3 0 5 2.2 5 5v2.5l2 .8-1.8 1.4c.6 2 2.2 3 3.3 3.3-1 .9-2.6.8-3.2 1.6-.3.6-.2 1.4-.8 1.4-1 0-1.8-.6-3.2.1-.7.4-1 .9-1.3.9s-.6-.5-1.3-.9c-1.4-.7-2.2-.1-3.2-.1-.6 0-.5-.8-.8-1.4-.6-.8-2.2-.7-3.2-1.6 1.1-.3 2.7-1.3 3.3-3.3L5 11.3l2-.8V8c0-2.8 2-5 5-5z" />
  </svg>
);

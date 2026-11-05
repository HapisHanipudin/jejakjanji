// One stroke icon set on a 24px grid (2px stroke, currentColor), drawn in the Lucide style the
// Figma Redesign components use (node 143:49362). Decorative only: the surrounding text always
// carries the meaning.
const CIRCLE = 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z';
const FILE = 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v4a2 2 0 0 0 2 2h4';

const PATHS = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M18 6 6 18M6 6l12 12',
  arrow: 'M5 12h14M12 5l7 7-7 7',
  'arrow-up-right': 'M7 7h10v10M7 17 17 7',
  check: 'M20 6 9 17l-5-5',
  'chevron-left': 'm15 18-6-6 6-6',
  'chevron-right': 'm9 18 6-6-6-6',
  'chevron-down': 'm6 9 6 6 6-6',
  play: 'M6 3l14 9-14 9z',
  pause: 'M8 4v16M16 4v16',
  calendar:
    'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM3 10h18M8 2v4M16 2v4',
  'map-pin':
    'M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0zM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  search: 'M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0zM21 21l-4.3-4.3',
  file: FILE,
  'file-text': `${FILE}M10 9H8M16 13H8M16 17H8`,
  'file-check': `${FILE}M9 15l2 2 4-4`,
  files:
    'M20 7h-3a2 2 0 0 1-2-2V2M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2zM3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8',
  wallet:
    'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4',
  'circle-help': `${CIRCLE}M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01`,
  'circle-check': `${CIRCLE}M9 12l2 2 4-4`,
  info: `${CIRCLE}M12 16v-4M12 8h.01`,
  clock: `${CIRCLE}M12 6v6l4 2`,
  'folder-open':
    'm6 14 1.5-2.9A2 2 0 0 1 9.2 10H20a2 2 0 0 1 1.9 2.5l-1.5 6a2 2 0 0 1-2 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.7.9l.8 1.2a2 2 0 0 0 1.7.9H18a2 2 0 0 1 2 2v2',
  'cloud-off':
    'M2 2l20 20M5.8 5.8A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.3-.2M21.5 16.5A4.5 4.5 0 0 0 17.5 10h-1.8A7 7 0 0 0 9.5 5.1',
  'hard-drive':
    'M22 12H2M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1zM6 16h.01M10 16h.01',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

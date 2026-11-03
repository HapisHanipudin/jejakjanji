// One stroke icon set (16px grid, 1.6px stroke, currentColor), matching the Figma calendar and
// chevron assets. Decorative only: the surrounding text always carries the meaning.
const PATHS = {
  close: 'M4.5 4.5l7 7M11.5 4.5l-7 7',
  arrow: 'M3 8h10M9 4l4 4-4 4',
  check: 'M3.5 8.5l3 3 6-7',
  'chevron-left': 'M10 4L6 8l4 4',
  'chevron-right': 'M6 4l4 4-4 4',
  calendar:
    'M4 3.5h8a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 12V5A1.5 1.5 0 014 3.5zM2.5 6.5h11M5.5 2v3M10.5 2v3',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

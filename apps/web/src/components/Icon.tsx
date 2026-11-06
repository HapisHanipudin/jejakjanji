import type { CSSProperties } from 'react';

// Icons used across the UI. Names that exist in the Figma set are the Figma SVG files in
// public/ikon/figma, drawn as a CSS mask so they take the surrounding text colour (currentColor).
// The remaining names keep the in-house 16px/1.6px stroke glyphs (Figma has no calendar-month arrows).
// Decorative only: the surrounding text always carries the meaning.
const FIGMA_FILES = {
  close: 'x',
  arrow: 'arrow-right',
  check: 'check',
  calendar: 'calendar',
  'chevron-down': 'chevron-down',
  'map-pin': 'map-pin',
  'circle-check': 'circle-check',
  'circle-help': 'circle-help',
  'arrow-up-right': 'arrow-up-right',
  'file-text': 'file-text',
  'files-lg': 'files-lg',
  'file-text-md': 'file-text-md',
  'wallet-md': 'wallet-md',
  'files-md': 'files-md',
  search: 'search',
  'file-check': 'file-check',
  'file-check-md': 'file-check-md',
  'hard-drive': 'hard-drive',
  'folder-open': 'folder-open',
} as const;

const PATHS = {
  'chevron-left': 'M10 4L6 8l4 4',
  'chevron-right': 'M6 4l4 4-4 4',
} as const;

export type IconName = keyof typeof FIGMA_FILES | keyof typeof PATHS;

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  if (name in FIGMA_FILES) {
    const file = FIGMA_FILES[name as keyof typeof FIGMA_FILES];
    return (
      <span
        className="icon icon-mask"
        style={
          { width: size, height: size, '--icon': `url(/ikon/figma/${file}.svg)` } as CSSProperties
        }
        aria-hidden="true"
      />
    );
  }
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
      <path d={PATHS[name as keyof typeof PATHS]} />
    </svg>
  );
}

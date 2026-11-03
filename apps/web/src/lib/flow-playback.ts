export type DemoAction =
  | 'open-program'
  | 'highlight-program'
  | 'select-program'
  | 'open-detail'
  | 'show-budget'
  | 'show-implementation'
  | 'next'
  | 'finish';

const scenes: readonly (readonly [number, DemoAction][])[] = [
  [
    [800, 'open-program'],
    [1800, 'highlight-program'],
    [3000, 'select-program'],
    [6200, 'next'],
  ],
  [
    [1200, 'open-detail'],
    [6200, 'next'],
  ],
  [
    [1400, 'show-budget'],
    [3000, 'show-implementation'],
    [6200, 'next'],
  ],
  [
    [700, 'show-budget'],
    [2700, 'show-implementation'],
    [6200, 'next'],
  ],
  [
    [1200, 'open-detail'],
    [6200, 'finish'],
  ],
];

/** Playback only changes demo state; cancelling clears every pending action. */
export function scheduleFlowPlayback(step: number, act: (action: DemoAction) => void) {
  const timers = (scenes[step] ?? []).map(([delay, action]) =>
    setTimeout(() => act(action), delay),
  );
  return () => timers.forEach(clearTimeout);
}

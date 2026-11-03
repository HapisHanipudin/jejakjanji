import { afterEach, expect, it, vi } from 'vitest';
import { scheduleFlowPlayback } from './flow-playback';

afterEach(() => vi.useRealTimers());

it('opens, highlights and selects before advancing; pause cancels remaining actions', () => {
  vi.useFakeTimers();
  const act = vi.fn();
  const cancel = scheduleFlowPlayback(0, act);
  vi.advanceTimersByTime(3000);
  expect(act.mock.calls.map(([action]) => action)).toEqual([
    'open-program',
    'highlight-program',
    'select-program',
  ]);
  cancel();
  vi.runAllTimers();
  expect(act).toHaveBeenCalledTimes(3);
});

it('demonstrates both radio choices and finishes the last scene without looping', () => {
  vi.useFakeTimers();
  const act = vi.fn();
  scheduleFlowPlayback(3, act);
  vi.runAllTimers();
  expect(act.mock.calls.map(([action]) => action)).toEqual([
    'show-budget',
    'show-implementation',
    'next',
  ]);
  act.mockClear();
  scheduleFlowPlayback(4, act);
  vi.runAllTimers();
  expect(act.mock.calls.map(([action]) => action)).toEqual(['open-detail', 'finish']);
  expect(vi.getTimerCount()).toBe(0);
});

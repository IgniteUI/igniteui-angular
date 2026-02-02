import { vi } from 'vitest';

declare global {
  function tick(ms?: number): void;
  function flush(): void;
  function flushMicrotasks(): Promise<void>;
}

export function customFakeAsync(testFn: () => void | Promise<void>) {
  return async () => {
    vi.useFakeTimers();

    // tick(ms?): Advancing time or running pending tasks
    (globalThis as any).tick = (ms?: number) => {
      if (ms !== undefined) {
        vi.advanceTimersByTime(ms);
      } else {
        vi.runOnlyPendingTimers();
      }
    };

    // flush(): Exhausting the entire timer queue
    (globalThis as any).flush = () => {
      return vi.runAllTimers();
    };

    // flushMicrotasks(): Process pending microtasks (Promises)
    (globalThis as any).flushMicrotasks = async () => {
      await vi.runAllTicks();
    };

    try {
      await testFn();
    } finally {
      delete (globalThis as any).tick;
      delete (globalThis as any).flush;
      delete (globalThis as any).flushMicrotasks;
      vi.useRealTimers();
    }
  };
}
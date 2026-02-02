import { vi } from 'vitest';

export function customFakeAsync(testFn: () => void | Promise<void>) {
  return async () => {
    vi.useFakeTimers();

    // 1. tick(ms?): Advancing time or running pending tasks
    (globalThis as any).tick = (ms?: number) => {
      if (ms !== undefined) {
        vi.advanceTimersByTime(ms);
      } else {
        // Equivalent to running only what is currently in the queue
        vi.runOnlyPendingTimers();
      }
    };

    // 2. flush(): Exhausting the entire timer queue
    (globalThis as any).flush = () => {
      return vi.runAllTimers();
    };

    try {
      await testFn();
    } finally {
      // Cleanup to prevent global pollution in other test files
      delete (globalThis as any).tick;
      delete (globalThis as any).flush;
      vi.useRealTimers();
    }
  };
}
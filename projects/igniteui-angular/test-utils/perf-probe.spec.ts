// Opt-in performance probe for the library specs, browser half (node half: perf-probe.node.ts).
// test-setup.ts loads it only when IGX_PERF_PROBE is set; a normal run never imports it.
//
// Per test:  wait    real ms spent sleeping in the shared `wait(ms)` helper
//            stable  real ms spent in ComponentFixture.whenStable(), i.e. waiting for in-zone timers
// Per file:  timer call sites (count, requested delay, real elapsed, share scheduled inside the Angular zone),
//            the in-zone timers whenStable() waited on, and elements left in <body> between tests.
//
//   setTimeout / setInterval / rAF ──wrap──▶ site stats ─┐
//   ComponentFixture.whenStable ────wrap──▶ blockers   ─┼─afterAll─▶ commands.probe ─▶ node half
//   <body> children before each test ─────▶ leftovers  ─┘

import { ComponentFixture } from '@angular/core/testing';
import { afterAll, afterEach, beforeAll, beforeEach, expect, inject, vi } from 'vitest';
import { commands } from 'vitest/browser';

declare module 'vitest' {
    interface ProvidedContext {
        perfProbe: boolean;
        perfProbeWaitCap: string;
    }
}

declare module 'vitest/browser' {
    interface BrowserCommands {
        probe: (label: string, data: unknown) => Promise<void>;
    }
}

interface TimerRecord {
    site: string;
    delay: number;
    start: number;
    inZone: boolean;
    fromWait: boolean;
}

interface SiteStats {
    count: number;
    delay: number;
    elapsed: number;
    inZone: number;
}

/** Function-name frames kept per call site, after dropping library noise. */
const SITE_DEPTH = 4;
/** Deep enough to get past zone.js and rxjs frames. */
const STACK_LIMIT = 50;
/** Sites / blockers sent per file. */
const TOP_SITES = 60;
/** whenStable() calls shorter than this are plain flushes, not waits. */
const STABLE_NOISE_MS = 2;
/** The shared sleep helper; esbuild may suffix the name on collisions. */
const WAIT_FRAME = /^wait\d*$/;
/** zone.js, rxjs and probe internals that say nothing about who scheduled the timer. */
const NOISE = /Zone|zone|Subscriber|Subject|Observable|Scheduler|Action|Provider|errorContext|probe|^(?:track|new|invokeTask|globalCallback|runWithCancel)$|^Object\.|^Array\.|^Promise|^Generator|^Function\.|:\/\//;
const FRAME = /^\s*at (?:async )?([^\s(]+)/;

const timeouts = new Map<number, TimerRecord>();
const intervals = new Map<number, TimerRecord>();
const frames = new Map<number, TimerRecord>();
const sites = new Map<string, SiteStats>();
const blockers = new Map<string, { count: number; ms: number }>();

let tests: { name: string; wait: number; stable: number }[] = [];
let leftovers: string[] = [];
let testWait = 0;
let testStable = 0;
let fileStart = 0;
let patched = false;

const zoneName = () => (globalThis as { Zone?: { current: { name: string } } }).Zone?.current.name;

/** Who scheduled the timer: the first non-library function names of the current stack. */
const siteOf = (stack: string) => {
    const names: string[] = [];
    let fromWait = false;

    for (const line of stack.split('\n').slice(1)) {
        const name = FRAME.exec(line)?.[1];

        if (!name) {
            continue;
        }
        if (WAIT_FRAME.test(name)) {
            fromWait = true;
            continue;
        }
        if (NOISE.test(name)) {
            continue;
        }

        names.push(name);
        if (names.length === SITE_DEPTH) {
            break;
        }
    }

    return { site: names.join(' < ') || '(unknown)', fromWait };
};

const track = (delay: number): TimerRecord => ({
    ...siteOf(new Error().stack ?? ''),
    delay,
    start: performance.now(),
    inZone: zoneName() === 'angular'
});

const settle = (record: TimerRecord) => {
    const elapsed = performance.now() - record.start;
    const stats = sites.get(record.site) ?? { count: 0, delay: 0, elapsed: 0, inZone: 0 };

    stats.count++;
    stats.delay += record.delay;
    stats.elapsed += elapsed;
    stats.inZone += record.inZone ? 1 : 0;
    sites.set(record.site, stats);

    if (record.fromWait) {
        testWait += elapsed;
    }
};

/** The pending in-zone timer expected to fire last: what whenStable() is about to wait for. */
const blockerOf = () => {
    let site = '(none pending)';
    let due = -Infinity;

    for (const pending of [timeouts, intervals, frames]) {
        for (const record of pending.values()) {
            if (record.inZone && record.start + record.delay > due) {
                due = record.start + record.delay;
                site = record.site;
            }
        }
    }

    return site;
};

const patchTimers = (waitCap: string) => {
    const { setTimeout: nativeTimeout, clearTimeout: nativeClearTimeout } = window;
    const { setInterval: nativeInterval, clearInterval: nativeClearInterval } = window;
    const { requestAnimationFrame: nativeFrame, cancelAnimationFrame: nativeCancelFrame } = window;

    window.setTimeout = function probeTimeout(handler: TimerHandler, delay = 0, ...args: unknown[]) {
        if (typeof handler !== 'function') {
            return nativeTimeout(handler, delay, ...args);
        }

        const record = track(delay);

        // Experiment E1: does the spec really need this sleep, or would one frame do?
        if (record.fromWait && waitCap === 'frame' && delay > 0) {
            return nativeFrame(() => {
                settle(record);
                handler(...args);
            });
        }

        const id = nativeTimeout(() => {
            timeouts.delete(id);
            settle(record);
            handler(...args);
        }, delay);

        timeouts.set(id, record);
        return id;
    } as typeof window.setTimeout;

    window.clearTimeout = function probeClearTimeout(id?: number) {
        if (id !== undefined) {
            timeouts.delete(id);
        }
        nativeClearTimeout(id);
    } as typeof window.clearTimeout;

    window.setInterval = function probeInterval(handler: TimerHandler, delay = 0, ...args: unknown[]) {
        if (typeof handler !== 'function') {
            return nativeInterval(handler, delay, ...args);
        }

        const record = track(delay);
        const id = nativeInterval(() => {
            settle(record);
            record.start = performance.now();
            handler(...args);
        }, delay);

        intervals.set(id, record);
        return id;
    } as typeof window.setInterval;

    window.clearInterval = function probeClearInterval(id?: number) {
        if (id !== undefined) {
            intervals.delete(id);
        }
        nativeClearInterval(id);
    } as typeof window.clearInterval;

    window.requestAnimationFrame = function probeFrame(callback: FrameRequestCallback) {
        const record = track(0);
        const id = nativeFrame(time => {
            frames.delete(id);
            settle(record);
            callback(time);
        });

        frames.set(id, record);
        return id;
    };

    window.cancelAnimationFrame = function probeCancelFrame(id: number) {
        frames.delete(id);
        nativeCancelFrame(id);
    };
};

const patchWhenStable = () => {
    const nativeWhenStable = ComponentFixture.prototype.whenStable;

    ComponentFixture.prototype.whenStable = async function probeWhenStable(this: ComponentFixture<unknown>) {
        const start = performance.now();
        const blocker = blockerOf();
        const result = await nativeWhenStable.call(this);
        const elapsed = performance.now() - start;

        testStable += elapsed;
        if (elapsed >= STABLE_NOISE_MS) {
            const stats = blockers.get(blocker) ?? { count: 0, ms: 0 };
            stats.count++;
            stats.ms += elapsed;
            blockers.set(blocker, stats);
        }

        return result;
    };
};

const top = <T>(map: Map<string, T>, by: (value: T) => number) =>
    Array.from(map, ([site, value]) => ({ site, ...value }))
        .sort((a, b) => by(b) - by(a))
        .slice(0, TOP_SITES);

/** e.g. `div.igx-overlay`, to spot what a spec left attached to the page. */
const describeEl = (el: Element) => `${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''}`;

/**
 * Hooks are registered on every call (test-setup.ts runs once per spec file);
 * timers and whenStable are patched only once per page.
 */
export const registerProbe = () => {
    if (!patched) {
        Error.stackTraceLimit = STACK_LIMIT;
        patchTimers(inject('perfProbeWaitCap'));
        patchWhenStable();
        patched = true;

        // Baseline row for this page: CDP counters are cumulative from here on.
        beforeAll(() => commands.probe('start', null));
    }

    beforeAll(() => {
        sites.clear();
        blockers.clear();
        tests = [];
        leftovers = [];
        fileStart = performance.now();
    });

    // Runs before test-setup.ts sweeps the body, so it sees what the previous test left behind.
    beforeEach(() => {
        leftovers.push(...Array.from(document.body.children, describeEl));
        testWait = 0;
        testStable = 0;
    });

    afterEach(() => {
        tests.push({ name: expect.getState().currentTestName ?? '', wait: Math.round(testWait), stable: Math.round(testStable) });
    });

    afterAll(async () => {
        await commands.probe('file', {
            ms: Math.round(performance.now() - fileStart),
            wait: Math.round(tests.reduce((sum, t) => sum + t.wait, 0)),
            stable: Math.round(tests.reduce((sum, t) => sum + t.stable, 0)),
            fakeTimers: vi.isFakeTimers(),
            leftovers,
            tests,
            sites: top(sites, s => s.elapsed),
            blockers: top(blockers, b => b.ms)
        });
    });
};

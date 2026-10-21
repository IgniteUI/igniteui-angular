// Global Vitest setup for the library's browser tests (see `setupFiles` in angular.json).

import { TestBed } from '@angular/core/testing';
import { INPUT_DEBOUNCE_TIME } from 'igniteui-angular/grids/core';
import { afterEach, beforeEach, expect, inject, vi } from 'vitest';
import { SCROLL_THROTTLE_TIME_MULTIPLIER } from './grids/grid/src/grid-base.directive';

declare module 'vitest' {
    interface ProvidedContext {
        longStacks: boolean;
    }
}

// The unit-test builder loads zone.js/testing (the library target has no polyfills), and dev-mode NgZone then
// forks the long-stack-trace zone, which captures an Error stack for every async task (~12 % of the run time).
// Run with IGX_LONG_STACKS=1 (see vitest.config.ts) to keep it while debugging an async failure.
if (!inject('longStacks')) {
    delete (globalThis as { Zone?: Record<string, unknown> }).Zone?.['longStackTraceZoneSpec'];
}

// Opt-in perf probe (IGX_PERF_PROBE=1, see test-utils/perf-probe.node.ts). Registered first, so its
// beforeEach sees what the previous test left in <body> before the sweep below removes it.
if (inject('perfProbe')) {
    const { registerProbe } = await import('./test-utils/perf-probe.spec');
    registerProbe();
}

// Test files are not isolated (the unit-test builder's `isolate` defaults to false), so they share one page.
// Reset the page scroll before every test, so a spec that scrolls the document cannot shift the
// positions measured by tests that run after it (overlay/tooltip placement, drag coordinates, etc.).
beforeEach(() => {
    // TestBed removes fixture hosts by their `rootN` id. A component that host-binds its own `id` replaces it,
    // so its host is never removed and keeps growing the shared page (shifting positions in later spec files).
    // The previous test's fixtures are destroyed by now, so any root component host left in the body is a leak.
    document.body.querySelectorAll(':scope > [ng-version]').forEach(host => host.remove());
    window.scrollTo(0, 0);
    vi.spyOn(console, 'warn');
});

// Grid timing defaults for every spec: no filter-row input debounce and no scroll throttling, so specs can
// wait a frame instead of the production delays. A spec that tests a delay provides its own value, which wins.
beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            { provide: INPUT_DEBOUNCE_TIME, useValue: 0 },
            { provide: SCROLL_THROTTLE_TIME_MULTIPLIER, useValue: 0 }
        ]
    });
});

// A fake clock left installed by a spec would freeze every later spec file on the same page.
// Registered before the hook below, so it runs after it (and after the specs' own afterEach hooks).
afterEach(() => {
    vi.useRealTimers();
});

// Fail any test that triggers Angular's @for track warnings. Registered here (not in a shared test helper)
// so it applies to every spec file: a helper module is evaluated once and its hooks would only cover the first file.
afterEach(() => {
    expect(console.warn, 'Components & tests should be free of @for track duplicated keys warnings').not.toHaveBeenCalledWith(expect.stringContaining('NG0955'));
    expect(console.warn, 'Components & tests should be free of @for track DOM re-creation warnings').not.toHaveBeenCalledWith(expect.stringContaining('NG0956'));
});

//
// vitest.config.ts injects the web font stylesheets the specs were written against. Wait for
// them and their font faces before any spec runs, so size-dependent assertions (autosizing,
// column widths) measure the real glyphs instead of fallback text. Gives up after a timeout
// so an offline run degrades to fallback fonts instead of hanging.

const FONT_LOAD_TIMEOUT = 5000;

const stylesheetLoaded = (link: HTMLLinkElement) => new Promise<void>(resolve => {
    if (link.sheet) {
        resolve();
        return;
    }
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => resolve(), { once: true });
});

const fontsReady = async () => {
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href*="fonts.googleapis.com"]'));
    await Promise.all(links.map(stylesheetLoaded));
    await Promise.all([
        document.fonts.load('24px "Material Icons"'),
        document.fonts.load('16px "Titillium Web"')
    ]);
};

await Promise.race([
    fontsReady().catch(() => undefined),
    new Promise(resolve => setTimeout(resolve, FONT_LOAD_TIMEOUT))
]);

export {};

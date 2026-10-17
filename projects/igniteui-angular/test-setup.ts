// Global Vitest setup for the library's browser tests (see `setupFiles` in angular.json).

import { beforeEach } from 'vitest';

// Test files are not isolated (the unit-test builder's `isolate` defaults to false), so they share one page.
// Reset the page scroll before every test, so a spec that scrolls the document cannot shift the
// positions measured by tests that run after it (overlay/tooltip placement, drag coordinates, etc.).
beforeEach(() => {
    window.scrollTo(0, 0);
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

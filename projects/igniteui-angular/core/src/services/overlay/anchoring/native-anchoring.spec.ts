import { afterEach, describe, expect, it } from 'vitest';

/**
 * Gate tests for native CSS anchor positioning in `IgxOverlayService` (#17765).
 *
 * These tests use no service code. Each test builds the overlay DOM the service creates
 * (`div.igx-overlay__wrapper[popover=manual]` > `div.igx-overlay__content`), writes the inline
 * declarations that the native engine will write, and measures what the browser does.
 * They prove that the browser supports the design, and they stay in the suite as regression
 * tests for the browser capabilities the native engine depends on.
 *
 * The comment above each test says what to change in the design if the test fails.
 */

const AUTO_FALLBACKS = 'flip-block, flip-inline, flip-block flip-inline';
/** Native positions are not rounded. */
const TOLERANCE = 1;

interface Box { top: number; left: number; width: number; height: number; }

interface ConnectedOptions {
    /** `true` for the `AutoPositionStrategy` fallbacks, `false` for `ConnectedPositioningStrategy`. */
    auto?: boolean;
    margin?: string;
    visibility?: 'always' | 'anchors-visible';
}

let nameCounter = 0;
const createdNodes: HTMLElement[] = [];

function nextAnchorName(): string {
    return `--igx-gate-anchor-${nameCounter++}`;
}

/** Waits for the given number of animation frames, so that layout and anchor fallbacks resolve. */
async function frames(count = 2): Promise<void> {
    for (let i = 0; i < count; i++) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
}

function track<T extends HTMLElement>(element: T, parent: Node): T {
    parent.appendChild(element);
    if (parent === document.body) {
        createdNodes.push(element);
    }
    return element;
}

/** Creates a fixed box that acts as an overlay target. */
function addTarget(box: Box, anchorName: string, parent: Node = document.body): HTMLElement {
    const target = document.createElement('div');
    Object.assign(target.style, {
        position: 'fixed',
        top: `${box.top}px`,
        left: `${box.left}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        background: 'gold'
    });
    target.style.setProperty('anchor-name', anchorName);
    return track(target, parent);
}

/**
 * Creates and shows the overlay DOM. `updateSize()` in the service writes an explicit pixel width,
 * so the content gets one here too.
 */
function openOverlay(
    size: { width: number; height: number },
    declarations: Record<string, string>,
    parent: Node = document.body
): { wrapper: HTMLElement; content: HTMLElement } {
    const wrapper = document.createElement('div');
    wrapper.classList.add('igx-overlay__wrapper');
    wrapper.setAttribute('popover', 'manual');

    const content = document.createElement('div');
    content.classList.add('igx-overlay__content');
    content.style.width = `${size.width}px`;
    content.style.height = `${size.height}px`;
    content.style.background = 'steelblue';
    for (const [property, value] of Object.entries(declarations)) {
        content.style.setProperty(property, value);
    }

    wrapper.appendChild(content);
    track(wrapper, parent);
    wrapper.showPopover();
    return { wrapper, content };
}

/** The declarations of the native-connected engine, in the order of §7.4 of the plan. */
function connected(anchorName: string, area: string, justifySelf: string, alignSelf: string, options: ConnectedOptions = {}) {
    return {
        'position': 'fixed',
        'inset': 'auto',
        'margin': options.margin ?? '0px 0px 0px 0px',
        'position-anchor': anchorName,
        'position-area': area,
        'justify-self': justifySelf,
        'align-self': alignSelf,
        'position-try-fallbacks': options.auto ? AUTO_FALLBACKS : 'none',
        'position-visibility': options.visibility ?? 'always'
    };
}

function expectNear(actual: number, expected: number, label: string): void {
    expect(Math.abs(actual - expected), `${label}: ${actual} instead of ${expected}`).toBeLessThanOrEqual(TOLERANCE);
}

/** `checkVisibility()` and computed styles do not report the `position-visibility` state, so hit-test. */
function isHitTestable(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return !!hit && element.contains(hit);
}

describe('Native CSS anchor positioning gate tests', () => {
    afterEach(() => {
        // Removing an open popover from the document also hides it.
        while (createdNodes.length) {
            createdNodes.pop()!.remove();
        }
    });

    it('the test browser supports the final property names', () => {
        expect(CSS.supports('anchor-name', '--igx-probe')).toBe(true);
        expect(CSS.supports('position-anchor', '--igx-probe')).toBe(true);
        expect(CSS.supports('position-area', 'bottom span-right')).toBe(true);
        expect(CSS.supports('position-try-fallbacks', 'flip-block, flip-inline')).toBe(true);
        expect(CSS.supports('top', 'anchor(top)')).toBe(true);
        expect(CSS.supports('justify-self', 'anchor-center')).toBe(true);
        expect(CSS.supports('position-visibility', 'anchors-visible')).toBe(true);
    });

    // If it fails: stop. The explicit anchor name design is invalid. Plan B is the implicit anchor
    // (`showPopover({ source })`) with the popover moved from the wrapper to the content.
    it('content in the top layer wrapper anchors to a target in the page', async () => {
        const name = nextAnchorName();
        const target = addTarget({ top: 100, left: 100, width: 100, height: 30 }, name);
        const { content } = openOverlay({ width: 200, height: 150 }, connected(name, 'bottom span-right', 'left', 'normal'));
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        expectNear(c.top, t.bottom, 'content top');
        expectNear(c.left, t.left, 'content left');
    });

    // If it fails: a target inside `.igx-overlay__content` / `.igx-overlay__content--modal` uses the script engine.
    it.each([
        ['the body', false],
        ['the outer overlay content', true]
    ])('content anchors to a target inside another open overlay (inner wrapper in %s)', async (_, insideOuter) => {
        const outer = openOverlay({ width: 300, height: 200 }, { top: '200px', left: '300px' });
        const name = nextAnchorName();
        const target = document.createElement('div');
        Object.assign(target.style, { position: 'absolute', top: '20px', left: '20px', width: '100px', height: '30px' });
        target.style.setProperty('anchor-name', name);
        outer.content.appendChild(target);

        const parent = insideOuter ? outer.content : document.body;
        const { content } = openOverlay({ width: 200, height: 150 }, connected(name, 'bottom span-right', 'left', 'normal'), parent);
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        expectNear(c.top, t.bottom, 'content top');
        expectNear(c.left, t.left, 'content left');
    });

    // If it fails: stop and escalate.
    it('Auto flips above a target near the bottom edge', async () => {
        const name = nextAnchorName();
        const target = addTarget({ top: innerHeight - 120, left: 100, width: 100, height: 30 }, name);
        const { content } = openOverlay({ width: 200, height: 150 },
            connected(name, 'bottom span-right', 'left', 'normal', { auto: true }));
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        expectNear(c.bottom, t.top, 'content bottom');
        expectNear(c.left, t.left, 'content left');
    });

    // If it fails: re-run with `justify-self: normal` on spanning pairs. If that passes, change the tables
    // in §7.3 to `normal` for spanning pairs. If not, escalate.
    it('Auto flips a spanning column to the left of a target near the right edge', async () => {
        const name = nextAnchorName();
        const target = addTarget({ top: 100, left: innerWidth - 80, width: 60, height: 30 }, name);
        const { content } = openOverlay({ width: 200, height: 150 },
            connected(name, 'bottom span-right', 'left', 'normal', { auto: true }));
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        expectNear(c.right, t.right, 'content right (justify-self flipped with the area)');
        expectNear(c.top, t.bottom, 'content top');
    });

    // Vertical counterpart of the spanning column flip, for `align-self: self-start` on a spanning row.
    it('Auto flips a spanning row above a target near the bottom edge', async () => {
        const name = nextAnchorName();
        const target = addTarget({ top: innerHeight - 100, left: 100, width: 100, height: 60 }, name);
        const { content } = openOverlay({ width: 200, height: 150 },
            connected(name, 'span-bottom right', 'normal', 'self-start', { auto: true }));
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        expectNear(c.bottom, t.bottom, 'content bottom (align-self flipped with the area)');
        expectNear(c.left, t.right, 'content left');
    });

    // If it fails: escalate.
    it('Auto flips both axes for a target in the bottom right corner', async () => {
        const name = nextAnchorName();
        const target = addTarget({ top: innerHeight - 70, left: innerWidth - 80, width: 60, height: 30 }, name);
        const { content } = openOverlay({ width: 200, height: 150 },
            connected(name, 'bottom span-right', 'left', 'normal', { auto: true }));
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        expectNear(c.right, t.right, 'content right');
        expectNear(c.bottom, t.top, 'content bottom');
    });

    // Amends §7.3: a centered pair maps to `span-all` with `anchor-center`, not to `center` (see the `center` area test below).
    // If it fails: Auto overlays with exactly one centered axis use the script engine
    // (affects the grid cell error tooltip and the extras tabs menu).
    describe('a centered axis (span-all, anchor-center)', () => {
        it('flips the other axis and shifts into the viewport', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: innerHeight - 120, left: 20, width: 40, height: 30 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'bottom span-all', 'anchor-center', 'normal', { auto: true }));
            await frames();

            const t = target.getBoundingClientRect();
            const c = content.getBoundingClientRect();
            expectNear(c.bottom, t.top, 'content bottom');
            expect(c.left, `content left: ${c.left}`).toBeGreaterThanOrEqual(-0.5);
        });

        it('stays centered on the target after a horizontal-centered flip', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: innerHeight - 120, left: 600, width: 40, height: 30 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'bottom span-all', 'anchor-center', 'normal', { auto: true }));
            await frames();

            const t = target.getBoundingClientRect();
            const c = content.getBoundingClientRect();
            expectNear(c.bottom, t.top, 'content bottom');
            expectNear(c.left + c.width / 2, t.left + t.width / 2, 'horizontal center');
        });

        it('flips inline for a vertically centered pair near the right edge', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: 300, left: innerWidth - 80, width: 60, height: 30 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'span-all right', 'normal', 'anchor-center', { auto: true }));
            await frames();

            const t = target.getBoundingClientRect();
            const c = content.getBoundingClientRect();
            expectNear(c.right, t.left, 'content right');
            expectNear(c.top + c.height / 2, t.top + t.height / 2, 'vertical center');
        });
    });

    // Informative. Why §7.3 does not use `center`: the `center` area is only as wide as the target, so wider
    // content overflows it in every fallback and the browser keeps the base option, shifted over the target.
    // If it fails, the browser now flips a `center` area: the centered axis tests still hold; this test can go.
    it('a `center` area does not flip content wider than the target', async () => {
        const name = nextAnchorName();
        const target = addTarget({ top: innerHeight - 120, left: 600, width: 40, height: 30 }, name);
        const { content } = openOverlay({ width: 200, height: 150 },
            connected(name, 'bottom center', 'anchor-center', 'normal', { auto: true }));
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        expect(Math.abs(c.bottom - t.top), 'flipped above the target').toBeGreaterThan(TOLERANCE);
    });

    // Content that fits on neither side of the target: taller than the space above and below it.
    const tallContent = () => ({ width: 200, height: innerHeight - 200 });
    const midTarget: Box = { top: 300, left: 100, width: 100, height: 30 };

    // Measured: with `normal` alignment the browser pushes the content into the viewport on the outside
    // axis, for Auto and for Connected. #17765 requires Auto to flip only, so the engine writes `unsafe`
    // alignment on outside axes for both. This test records why `normal` is not used there.
    // If it fails: the browser no longer pushes; `unsafe` is still correct.
    it.each([
        ['Auto', true],
        ['Connected', false]
    ])('%s with normal alignment pushes content that fits on neither side into the viewport', async (_, auto) => {
        const name = nextAnchorName();
        const target = addTarget(midTarget, name);
        const { content } = openOverlay(tallContent(), connected(name, 'bottom span-right', 'left', 'normal', { auto }));
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        expect(c.top, 'pushed up over the target').toBeLessThan(t.bottom - TOLERANCE);
        expectNear(c.bottom, innerHeight, 'content bottom at the viewport edge');
    });

    // An `unsafe` alignment turns the push off and keeps the flip. The engine uses it on outside axes:
    // Connected keeps script parity (no push) and Auto flips only (#17765).
    // If it fails: the push cannot be turned off; Auto and Connected would push, against #17765.
    describe('unsafe alignment on the outside axis', () => {
        it.each([
            ['Auto', true],
            ['Connected', false]
        ])('%s keeps content that fits on neither side at the target', async (_, auto) => {
            const name = nextAnchorName();
            const target = addTarget(midTarget, name);
            const { content } = openOverlay(tallContent(), connected(name, 'bottom span-right', 'left', 'unsafe start', { auto }));
            await frames();

            expectNear(content.getBoundingClientRect().top, target.getBoundingClientRect().bottom, 'content top');
        });

        it('Auto still flips', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: innerHeight - 120, left: 100, width: 100, height: 30 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'bottom span-right', 'left', 'unsafe start', { auto: true }));
            await frames();

            expectNear(content.getBoundingClientRect().bottom, target.getBoundingClientRect().top, 'content bottom');
        });
    });

    // Connected keeps script parity: the script never moves Connected content, so every axis uses an `unsafe`
    // alignment and the browser never shifts the content into the viewport.
    // If it fails: Connected content can shift; document it in §17 as a behavioral change.
    describe('Connected with unsafe alignment never shifts the content', () => {
        it('Top → Top stays above a target when it fits on neither side', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: innerHeight - 330, left: 100, width: 100, height: 30 }, name);
            const { content } = openOverlay(tallContent(), connected(name, 'top span-right', 'unsafe left', 'unsafe end'));
            await frames();

            expectNear(content.getBoundingClientRect().bottom, target.getBoundingClientRect().top, 'content bottom');
        });

        it('Left → Left stays left of a target when it fits on neither side', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: 100, left: 500, width: 100, height: 30 }, name);
            const { content } = openOverlay({ width: innerWidth - 500, height: 150 },
                connected(name, 'span-bottom left', 'unsafe right', 'unsafe self-start'));
            await frames();

            expectNear(content.getBoundingClientRect().right, target.getBoundingClientRect().left, 'content right');
        });

        it('Right → Right stays right of a target when it fits on neither side', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: 100, left: 500, width: 100, height: 30 }, name);
            const { content } = openOverlay({ width: innerWidth - 500, height: 150 },
                connected(name, 'span-bottom right', 'unsafe left', 'unsafe self-start'));
            await frames();

            expectNear(content.getBoundingClientRect().left, target.getBoundingClientRect().right, 'content left');
        });

        it('a spanning axis keeps the edge alignment at the right edge of the viewport', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: 100, left: innerWidth - 80, width: 60, height: 30 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'bottom span-right', 'unsafe left', 'unsafe start'));
            await frames();

            expectNear(content.getBoundingClientRect().left, target.getBoundingClientRect().left, 'content left');
        });

        it('a vertical spanning axis keeps the edge alignment at the bottom of the viewport', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: innerHeight - 100, left: 100, width: 100, height: 60 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'span-bottom right', 'unsafe left', 'unsafe self-start'));
            await frames();

            expectNear(content.getBoundingClientRect().top, target.getBoundingClientRect().top, 'content top');
        });

        it('Right → Left keeps the edge alignment at the left edge of the viewport', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: 100, left: 20, width: 60, height: 30 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'bottom span-left', 'unsafe right', 'unsafe start'));
            await frames();

            expectNear(content.getBoundingClientRect().right, target.getBoundingClientRect().right, 'content right');
        });

        it('Bottom → Top keeps the edge alignment at the top of the viewport', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: 20, left: 100, width: 100, height: 60 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'span-top right', 'unsafe left', 'unsafe self-end'));
            await frames();

            expectNear(content.getBoundingClientRect().bottom, target.getBoundingClientRect().bottom, 'content bottom');
        });

        it('a centered axis stays centered on a target at the left edge', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: 100, left: 20, width: 40, height: 30 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'bottom span-all', 'unsafe anchor-center', 'unsafe start'));
            await frames();

            const t = target.getBoundingClientRect();
            const c = content.getBoundingClientRect();
            expectNear(c.left + c.width / 2, t.left + t.width / 2, 'horizontal center');
        });

        it('both centered axes (span-all span-all) center on the target', async () => {
            const name = nextAnchorName();
            const target = addTarget({ top: 200, left: 300, width: 400, height: 300 }, name);
            const { content } = openOverlay({ width: 200, height: 150 },
                connected(name, 'span-all span-all', 'unsafe anchor-center', 'unsafe anchor-center'));
            await frames();

            const t = target.getBoundingClientRect();
            const c = content.getBoundingClientRect();
            expectNear(c.left + c.width / 2, t.left + t.width / 2, 'horizontal center');
            expectNear(c.top + c.height / 2, t.top + t.height / 2, 'vertical center');
        });
    });

    // Auto keeps the safe defaults on centered axes, so it may shift into the viewport there.
    it('Auto with both centered axes (span-all span-all) centers on the target', async () => {
        const name = nextAnchorName();
        const target = addTarget({ top: 200, left: 300, width: 400, height: 300 }, name);
        const { content } = openOverlay({ width: 200, height: 150 },
            connected(name, 'span-all span-all', 'anchor-center', 'anchor-center', { auto: true }));
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        expectNear(c.left + c.width / 2, t.left + t.width / 2, 'horizontal center');
        expectNear(c.top + c.height / 2, t.top + t.height / 2, 'vertical center');
    });

    // If it fails: escalate.
    it('an offset becomes a gap on the target side, before and after a flip', async () => {
        const options: ConnectedOptions = { auto: true, margin: '6px 0px 6px 0px' };
        const belowName = nextAnchorName();
        const below = addTarget({ top: 100, left: 100, width: 100, height: 30 }, belowName);
        const belowOverlay = openOverlay({ width: 200, height: 150 }, connected(belowName, 'bottom span-right', 'left', 'normal', options));

        const aboveName = nextAnchorName();
        const above = addTarget({ top: innerHeight - 120, left: 400, width: 100, height: 30 }, aboveName);
        const aboveOverlay = openOverlay({ width: 200, height: 150 }, connected(aboveName, 'bottom span-right', 'left', 'normal', options));
        await frames();

        expectNear(belowOverlay.content.getBoundingClientRect().top, below.getBoundingClientRect().bottom + 6, 'top below the target');
        expectNear(aboveOverlay.content.getBoundingClientRect().bottom, above.getBoundingClientRect().top - 6, 'bottom above the target');
        expectNear(aboveOverlay.content.getBoundingClientRect().left, above.getBoundingClientRect().left, 'left above the target');
    });

    // If it fails: `ContainerPositionStrategy` uses the script engine (agreed fallback); record why here.
    it('a container wrapper covers its container div and follows it on scroll, with no observer', async () => {
        const scroller = document.createElement('div');
        Object.assign(scroller.style, { position: 'fixed', top: '100px', left: '100px', width: '400px', height: '300px', overflow: 'auto' });
        track(scroller, document.body);

        const box = document.createElement('div');
        Object.assign(box.style, { position: 'relative', marginTop: '100px', width: '300px', height: '200px' });
        scroller.appendChild(box);
        const spacer = document.createElement('div');
        spacer.style.height = '1000px';
        scroller.appendChild(spacer);

        // The div that `insertWrapperInContainer()` creates.
        const name = nextAnchorName();
        const container = document.createElement('div');
        Object.assign(container.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
        container.style.setProperty('anchor-name', name);
        box.appendChild(container);

        const wrapper = document.createElement('div');
        wrapper.classList.add('igx-overlay__wrapper');
        wrapper.setAttribute('popover', 'manual');
        const declarations: Record<string, string> = {
            'position-anchor': name,
            'top': 'anchor(top)',
            'right': 'anchor(right)',
            'bottom': 'anchor(bottom)',
            'left': 'anchor(left)',
            'position-visibility': 'always'
        };
        for (const [property, value] of Object.entries(declarations)) {
            wrapper.style.setProperty(property, value);
        }
        container.appendChild(wrapper);
        wrapper.showPopover();
        await frames();

        const expectCovers = (when: string) => {
            const d = container.getBoundingClientRect();
            const w = wrapper.getBoundingClientRect();
            expectNear(w.top, d.top, `${when}: top`);
            expectNear(w.left, d.left, `${when}: left`);
            expectNear(w.width, d.width, `${when}: width`);
            expectNear(w.height, d.height, `${when}: height`);
        };

        expectCovers('before scroll');
        const topBefore = container.getBoundingClientRect().top;

        scroller.scrollTop = 50;
        await frames();

        expectNear(container.getBoundingClientRect().top, topBefore - 50, 'the container div moved');
        expectCovers('after scroll');
    });

    describe('position-visibility', () => {
        /** A target inside a scroll container, low enough that the content stays in the viewport when it is clipped. */
        function setup(visibility: 'always' | 'anchors-visible') {
            const scroller = document.createElement('div');
            Object.assign(scroller.style, { position: 'fixed', top: '400px', left: '100px', width: '300px', height: '100px', overflow: 'auto' });
            track(scroller, document.body);

            const name = nextAnchorName();
            const target = document.createElement('div');
            Object.assign(target.style, { marginTop: '10px', width: '100px', height: '30px', background: 'gold' });
            target.style.setProperty('anchor-name', name);
            scroller.appendChild(target);
            const spacer = document.createElement('div');
            spacer.style.height = '1000px';
            scroller.appendChild(spacer);

            const { content } = openOverlay({ width: 200, height: 60 }, connected(name, 'bottom span-right', 'left', 'normal', { visibility }));
            return { scroller, target, content };
        }

        // If it fails: `HideScrollStrategy` always uses the IntersectionObserver fallback.
        it('anchors-visible hides the content while the target is fully clipped', async () => {
            const { scroller, target, content } = setup('anchors-visible');
            await frames();
            expect(isHitTestable(content), 'visible before scroll').toBe(true);

            // The target ends 20px above the visible area of the scroller.
            scroller.scrollTop = 60;
            await frames();
            expect(target.getBoundingClientRect().bottom).toBeLessThan(scroller.getBoundingClientRect().top);
            expect(isHitTestable(content), 'hidden while the target is clipped').toBe(false);

            scroller.scrollTop = 0;
            await frames();
            expect(isHitTestable(content), 'visible again').toBe(true);
        });

        it('always keeps the content visible while the target is fully clipped', async () => {
            const { scroller, content } = setup('always');
            await frames();

            scroller.scrollTop = 60;
            await frames();
            expect(isHitTestable(content)).toBe(true);
        });
    });

    // Informative. Proves that the native engine needs the same-tree rule (R3).
    // If it fails, the browser resolves anchor names across shadow roots: delete this test.
    it('an anchor name inside a shadow root does not anchor content in the light DOM', async () => {
        const host = document.createElement('div');
        track(host, document.body);
        const shadowRoot = host.attachShadow({ mode: 'open' });

        const name = nextAnchorName();
        const target = addTarget({ top: 300, left: 400, width: 100, height: 30 }, name, shadowRoot);
        const { content } = openOverlay({ width: 200, height: 150 }, connected(name, 'bottom span-right', 'left', 'normal'));
        await frames();

        const t = target.getBoundingClientRect();
        const c = content.getBoundingClientRect();
        const anchored = Math.abs(c.top - t.bottom) <= TOLERANCE && Math.abs(c.left - t.left) <= TOLERANCE;
        expect(anchored).toBe(false);
    });
});

// DISCUSS(#17765): plan §14.2 puts these tests in a 'Native anchoring' group in overlay.spec.ts. Here they are a
// separate file; overlay.spec.ts runs all its existing groups under both engines (D9). Plan case C5 (grid loading
// overlay, snackbar container) is covered by those components' own suites.
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { scaleInVerBottom, scaleInVerTop, scaleOutVerBottom, scaleOutVerTop } from 'igniteui-angular/animations';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IgxOverlayService } from '../overlay';
import { AutoPositionStrategy } from '../position/auto-position-strategy';
import { ConnectedPositioningStrategy } from '../position/connected-positioning-strategy';
import { ContainerPositionStrategy } from '../position/container-position-strategy';
import { GlobalPositionStrategy } from '../position/global-position-strategy';
import { AbsoluteScrollStrategy } from '../scroll/absolute-scroll-strategy';
import { HideScrollStrategy } from '../scroll/hide-scroll-strategy';
import { NoOpScrollStrategy } from '../scroll/NoOpScrollStrategy';
import { HorizontalAlignment, OverlaySettings, Point, PositionSettings, Util, VerticalAlignment } from '../utilities';
import { anchorVisibleKeyword, provideOverlayAnchoring } from './anchoring';
import { AUTO_FALLBACKS } from './native-engine';

const TOLERANCE = 1;
const NO_ANIMATIONS: PositionSettings = { openAnimation: null, closeAnimation: null };

const frames = async (count = 2) => {
    for (let i = 0; i < count; i++) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
};

const expectNear = (actual: number, expected: number) =>
    expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(TOLERANCE);

const isHitTestable = (element: HTMLElement) => {
    const r = element.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && element.contains(hit);
};

/** `position-area` keywords in a fixed order: browsers serialize the row and column in different orders. */
const sortedArea = (value: string) => value.split(/\s+/).sort().join(' ');
const area = (element: HTMLElement) => sortedArea(element.style.getPropertyValue('position-area'));

interface Box { top: number; left: number; width: number; height: number }

describe('igxOverlay native anchoring', () => {
    let overlay: IgxOverlayService;
    let nodes: HTMLElement[];
    // Restore only our own spies: the global setup keeps a console.warn spy that it asserts on after each test.
    const spies: Array<{ mockRestore(): void }> = [];
    const spyOn = ((...args: unknown[]) => {
        const spy = (vi.spyOn as (...a: unknown[]) => { mockRestore(): void })(...args);
        spies.push(spy);
        return spy;
    }) as typeof vi.spyOn;

    // Engine selection is driven by feature detection, which runs lazily on the first show() of each service.
    const realSupports = CSS.supports.bind(CSS) as (property: string, value?: string) => boolean;
    /** No CSS anchor positioning: every overlay uses the script engine, as in Safari 18. */
    const useScriptEngine = () => spyOn(CSS, 'supports').mockReturnValue(false);
    /** Anchor positioning without `position-visibility`, as in Safari 26.0 and 26.1. */
    const withoutPositionVisibility = () => spyOn(CSS, 'supports').mockImplementation(
        ((property: string, value?: string) => property !== 'position-visibility' &&
            (value === undefined ? realSupports(property) : realSupports(property, value))) as typeof CSS.supports);

    const track = <T extends HTMLElement>(el: T): T => {
        nodes.push(el);
        return el;
    };

    /** A fixed-position target at the given viewport box. */
    const addTarget = (box: Box, parent: HTMLElement = document.body) => {
        const el = track(document.createElement('div'));
        Object.assign(el.style, {
            position: 'fixed', top: `${box.top}px`, left: `${box.left}px`,
            width: `${box.width}px`, height: `${box.height}px`, background: 'gray'
        });
        parent.appendChild(el);
        return el;
    };

    /** Element shown in the overlay; in the DOM before attach so its size is known. */
    const addElement = (width = 100, height = 50, parent: HTMLElement = document.body) => {
        const el = track(document.createElement('div'));
        Object.assign(el.style, { width: `${width}px`, height: `${height}px`, background: 'red' });
        parent.appendChild(el);
        return el;
    };

    const content = (id: string): HTMLElement => overlay.getOverlayById(id).elementRef!.nativeElement.parentElement;

    const open = async (element: HTMLElement, settings: OverlaySettings) => {
        const id = overlay.attach(new ElementRef(element), { modal: false, closeOnOutsideClick: false, ...settings });
        overlay.show(id);
        await frames();
        return id;
    };

    const configure = async (providers: any[] = []) => {
        await TestBed.configureTestingModule({ imports: [NoopAnimationsModule], providers }).compileComponents();
        overlay = TestBed.inject(IgxOverlayService);
    };

    beforeEach(() => {
        nodes = [];
        document.documentElement.scrollTop = 0;
    });

    afterEach(() => {
        overlay?.detachAll();
        nodes.forEach(n => n.remove());
        spies.splice(0).forEach(s => s.mockRestore());
    });

    describe('engine selection', () => {
        beforeEach(() => configure());

        it('uses the native engine for exact Connected and Auto strategies and the script engine for their subclasses', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            for (const Strategy of [ConnectedPositioningStrategy, AutoPositionStrategy]) {
                const id = await open(addElement(), { target, positionStrategy: new Strategy(NO_ANIMATIONS) });
                const el = content(id);
                expect(overlay.getOverlayById(id).engine).toBe('native-connected');
                expect(el.style.getPropertyValue('position-anchor')).toMatch(/^--igx-overlay-anchor-/);
                const r = el.getBoundingClientRect();
                expectNear(r.top, 130);
                expectNear(r.left, 100);
                overlay.detach(id);
            }

            class MyAuto extends AutoPositionStrategy { }
            const id = await open(addElement(), { target, positionStrategy: new MyAuto(NO_ANIMATIONS) });
            expect(overlay.getOverlayById(id).engine).toBe('script');
            expect(content(id).style.getPropertyValue('position-anchor')).toBe('');
            expect(content(id).style.top).not.toBe('');
        });

        it('uses the script engine for Point, detached and SVG targets', async () => {
            const point = await open(addElement(), { target: new Point(10, 10), positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            expect(overlay.getOverlayById(point).engine).toBe('script');

            const detachedTarget = document.createElement('div');
            const detached = await open(addElement(), { target: detachedTarget, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            expect(overlay.getOverlayById(detached).engine).toBe('script');

            const svg = track(document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as HTMLElement);
            document.body.appendChild(svg);
            const svgId = await open(addElement(), { target: svg, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            expect(overlay.getOverlayById(svgId).engine).toBe('script');
        });

        it('uses the script engine for a target in a shadow root the overlay is not in', async () => {
            const host = track(document.createElement('div'));
            document.body.appendChild(host);
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 }, host.attachShadow({ mode: 'open' }) as unknown as HTMLElement);
            const id = await open(addElement(), { target, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            expect(overlay.getOverlayById(id).engine).toBe('script');
        });

        it('uses the native engine for a target and overlay in the same shadow root', async () => {
            const host = track(document.createElement('div'));
            document.body.appendChild(host);
            // A direct child of a shadow root has no parentElement, and the service would append the overlay to <body>.
            const root = document.createElement('div');
            host.attachShadow({ mode: 'open' }).appendChild(root);
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 }, root);
            const id = await open(addElement(100, 50, root), { target, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            expect(overlay.getOverlayById(id).engine).toBe('native-connected');
            const r = content(id).getBoundingClientRect();
            expectNear(r.top, 130);
            expectNear(r.left, 100);
        });

        it('uses the script engine for a pair position-area cannot express', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const id = await open(addElement(), {
                target,
                positionStrategy: new ConnectedPositioningStrategy({
                    ...NO_ANIMATIONS, horizontalStartPoint: HorizontalAlignment.Center, horizontalDirection: HorizontalAlignment.Left
                })
            });
            expect(overlay.getOverlayById(id).engine).toBe('script');
        });

        it('uses the script engine without browser support and detects support once per service', async () => {
            const supports = spyOn(CSS, 'supports').mockReturnValue(false);
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS) });
            expect(overlay.getOverlayById(id).engine).toBe('script');
            const calls = supports.mock.calls.length;
            overlay.hide(id);
            overlay.show(id);
            expect(supports.mock.calls.length).toBe(calls);
        });

        it('clears the script styles and keeps the setOffset translation when switching from script to native', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const id = await open(addElement(), { target: new Point(20, 20), positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            expect(content(id).style.top).not.toBe('');
            overlay.setOffset(id, 10, 20);
            overlay.hide(id);
            overlay.show(id, { target });
            await frames();
            const el = content(id);
            expect(overlay.getOverlayById(id).engine).toBe('native-connected');
            expect(el.style.top).toBe('auto');
            expect(el.style.left).toBe('auto');
            expect(el.style.getPropertyValue('position-anchor')).not.toBe('');
            expect(el.style.transform).toBe('translate(10px, 20px)');
        });
    });

    describe('provideOverlayAnchoring', () => {
        it('"script" keeps every overlay on the script engine', async () => {
            await configure([provideOverlayAnchoring('script')]);
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS) });
            expect(overlay.getOverlayById(id).engine).toBe('script');
            expect(content(id).style.getPropertyValue('position-anchor')).toBe('');
        });

        it('the script engine writes no native property', async () => {
            await configure();
            useScriptEngine();
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS) });
            expect(content(id).getAttribute('style')).not.toMatch(/position-anchor|position-area|anchor-name/);
            expect(target.getAttribute('style')).not.toMatch(/anchor-name/);
        });
    });

    describe('connected and auto', () => {
        beforeEach(() => configure());

        it('sets anchor-name on the target only while the overlay is open and keeps the author value', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            target.style.setProperty('anchor-name', '--author');
            const a = await open(addElement(), { target, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            const b = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS) });
            const nameA = overlay.getOverlayById(a).anchorName;
            const nameB = overlay.getOverlayById(b).anchorName;
            expect(target.style.getPropertyValue('anchor-name')).toBe(`--author, ${nameA}, ${nameB}`);

            overlay.hide(a);
            expect(target.style.getPropertyValue('anchor-name')).toBe(`--author, ${nameB}`);
            overlay.hide(b);
            expect(target.style.getPropertyValue('anchor-name')).toBe('--author');
        });

        it('moves the anchor name when shown with another target', async () => {
            const first = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const second = addTarget({ top: 300, left: 300, width: 80, height: 30 });
            const id = await open(addElement(), { target: first, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            overlay.show(id, { target: second });
            await frames();
            expect(first.style.getPropertyValue('anchor-name')).toBe('');
            expect(second.style.getPropertyValue('anchor-name')).toBe(overlay.getOverlayById(id).anchorName);
            expectNear(content(id).getBoundingClientRect().top, 330);
        });

        it('writes the declarations for the default, Auto, offset and toolbar settings', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const connected = content(await open(addElement(), { target, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) }));
            expect(area(connected)).toBe(sortedArea('bottom span-right'));
            expect(connected.style.getPropertyValue('justify-self')).toBe('unsafe left');
            expect(connected.style.getPropertyValue('align-self')).toBe('unsafe start');
            expect(connected.style.getPropertyValue('position-try-fallbacks')).toBe('none');
            expect(connected.style.getPropertyValue('position-visibility')).toBe('always');

            const auto = content(await open(addElement(), { target, positionStrategy: new AutoPositionStrategy({ ...NO_ANIMATIONS, offset: 6 }) }));
            expect(auto.style.getPropertyValue('justify-self')).toBe('left');
            expect(auto.style.getPropertyValue('position-try-fallbacks')).toBe(AUTO_FALLBACKS);
            expect(auto.style.margin).toBe('6px 0px');
            expectNear(auto.getBoundingClientRect().top, 136);

            const toolbar = content(await open(addElement(), {
                target,
                positionStrategy: new AutoPositionStrategy({
                    ...NO_ANIMATIONS, horizontalStartPoint: HorizontalAlignment.Right, horizontalDirection: HorizontalAlignment.Left
                })
            }));
            expect(area(toolbar)).toBe(sortedArea('bottom span-left'));
            expect(toolbar.style.getPropertyValue('justify-self')).toBe('right');
            expectNear(toolbar.getBoundingClientRect().right, 180);
        });

        it('reposition applies settings changes without reading layout', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const strategy = new AutoPositionStrategy(NO_ANIMATIONS);
            const id = await open(addElement(), { target, positionStrategy: strategy });
            const el = content(id);
            const contentRect = spyOn(el, 'getBoundingClientRect');
            const targetRect = spyOn(target, 'getBoundingClientRect');

            strategy.settings.verticalStartPoint = VerticalAlignment.Top;
            strategy.settings.verticalDirection = VerticalAlignment.Top;
            overlay.reposition(id);
            expect(area(el)).toBe(sortedArea('top span-right'));
            expect(contentRect).not.toHaveBeenCalled();
            expect(targetRect).not.toHaveBeenCalled();
        });

        it('reposition moves the anchor to a new target', async () => {
            const first = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const second = addTarget({ top: 300, left: 300, width: 80, height: 30 });
            const id = await open(addElement(), { target: first, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            const info = overlay.getOverlayById(id);

            info.settings.target = second;
            overlay.reposition(id);
            await frames();
            expect(info.engine).toBe('native-connected');
            expect(first.style.getPropertyValue('anchor-name')).toBe('');
            expect(second.style.getPropertyValue('anchor-name')).toBe(info.anchorName);
            const r = content(id).getBoundingClientRect();
            expectNear(r.top, 330);
            expectNear(r.left, 300);
        });

        it('reposition switches to the script engine when the settings change to a pair position-area cannot express', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const strategy = new ConnectedPositioningStrategy(NO_ANIMATIONS);
            const id = await open(addElement(), { target, positionStrategy: strategy });
            expect(overlay.getOverlayById(id).engine).toBe('native-connected');

            strategy.settings.horizontalDirection = HorizontalAlignment.Center;
            expect(() => overlay.reposition(id)).not.toThrow();
            const el = content(id);
            expect(overlay.getOverlayById(id).engine).toBe('script');
            expect(el.getAttribute('style')).not.toMatch(/position-anchor|position-area/);
            expect(target.style.getPropertyValue('anchor-name')).toBe('');
            const r = el.getBoundingClientRect();
            expectNear(r.top, 130);
            expectNear(r.left, 50);

            overlay.hide(id);
            strategy.settings.horizontalDirection = HorizontalAlignment.Right;
            overlay.show(id);
            await frames();
            expect(overlay.getOverlayById(id).engine).toBe('native-connected');
            expectNear(content(id).getBoundingClientRect().left, 100);
        });

        it('Auto flips above a target near the bottom edge and reverses the animations', async () => {
            const target = addTarget({ top: window.innerHeight - 60, left: 100, width: 80, height: 30 });
            const strategy = new AutoPositionStrategy({ openAnimation: scaleInVerTop, closeAnimation: scaleOutVerTop });
            const id = await open(addElement(100, 200), { target, positionStrategy: strategy });
            const info = overlay.getOverlayById(id);

            expectNear(content(id).getBoundingClientRect().bottom, window.innerHeight - 60);
            expect(info.builtOpenAnimation).toBe(scaleInVerBottom);
            expect(info.builtCloseAnimation).toBe(scaleOutVerBottom);
            expect(strategy.settings.openAnimation).toBe(scaleInVerTop);
            expect(strategy.settings.verticalDirection).toBe(VerticalAlignment.Bottom);
        });

        it('the close animation follows a flip that happened while the overlay was open', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const strategy = new AutoPositionStrategy({ openAnimation: scaleInVerTop, closeAnimation: scaleOutVerTop });
            const id = await open(addElement(100, 200), { target, positionStrategy: strategy });
            const info = overlay.getOverlayById(id);
            expect(info.builtCloseAnimation).toBe(scaleOutVerTop);
            // Let the open animation finish so hide() resolves the close animation again.
            await new Promise(resolve => setTimeout(resolve, 400));

            target.style.top = `${window.innerHeight - 60}px`;
            await frames();
            expectNear(content(id).getBoundingClientRect().bottom, window.innerHeight - 60);

            overlay.hide(id);
            expect(info.builtCloseAnimation).toBe(scaleOutVerBottom);
            expect(strategy.settings.closeAnimation).toBe(scaleOutVerTop);
        });

        it('disposes the close animation player it replaces after a flip, without closing early', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const strategy = new AutoPositionStrategy({ openAnimation: null, closeAnimation: scaleOutVerTop });
            const id = await open(addElement(100, 200), { target, positionStrategy: strategy });
            const info = overlay.getOverlayById(id);
            const replaced = info.closeAnimationPlayer!;
            const destroy = spyOn(replaced, 'destroy');
            const closeAnimationDone = spyOn(overlay as any, 'closeAnimationDone');

            target.style.top = `${window.innerHeight - 60}px`;
            await frames();
            overlay.hide(id);

            expect(info.closeAnimationPlayer).not.toBe(replaced);
            expect(destroy).toHaveBeenCalled();
            expect(replaced.animationEnd.observed).toBe(false);
            await new Promise(resolve => setTimeout(resolve, 400));
            expect(closeAnimationDone).toHaveBeenCalledTimes(1);
        });

        it('Auto starts from the configured settings after a script flip, when a later show uses the native engine', async () => {
            const strategy = new AutoPositionStrategy({ openAnimation: scaleInVerTop, closeAnimation: null });
            const id = await open(addElement(100, 200), { target: new Point(100, window.innerHeight - 20), positionStrategy: strategy });
            expect(overlay.getOverlayById(id).engine).toBe('script');
            expect(strategy.settings.verticalDirection).toBe(VerticalAlignment.Top);
            await new Promise(resolve => setTimeout(resolve, 400));
            overlay.hide(id);

            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            overlay.show(id, { target, positionStrategy: strategy });
            await frames();
            const info = overlay.getOverlayById(id);
            expect(info.engine).toBe('native-connected');
            expect(strategy.settings.verticalDirection).toBe(VerticalAlignment.Bottom);
            expectNear(content(id).getBoundingClientRect().top, 130);
            expect(info.builtOpenAnimation).toBe(scaleInVerTop);
        });

        it('a close animation removed while the open animation plays closes at once', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const strategy = new AutoPositionStrategy({ openAnimation: scaleInVerTop, closeAnimation: scaleOutVerTop });
            const id = overlay.attach(new ElementRef(addElement(100, 50)), { target, modal: false, closeOnOutsideClick: false, positionStrategy: strategy });
            overlay.show(id);
            expect(overlay.getOverlayById(id).engine).toBe('native-connected');
            expect(overlay.getOverlayById(id).openAnimationPlayer!.hasStarted()).toBe(true);
            const closed = vi.fn();
            overlay.closed.subscribe(closed);

            strategy.settings.closeAnimation = null;
            overlay.hide(id);
            expect(closed).toHaveBeenCalledTimes(1);
        });

        it('a setOffset translation is not mistaken for a flip', async () => {
            const target = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const strategy = new AutoPositionStrategy({ openAnimation: null, closeAnimation: scaleOutVerTop });
            const id = await open(addElement(100, 50), { target, positionStrategy: strategy });
            overlay.setOffset(id, 0, -100);
            expectNear(content(id).getBoundingClientRect().bottom, 80);

            overlay.hide(id);
            expect(overlay.getOverlayById(id).builtCloseAnimation).toBe(scaleOutVerTop);
        });

        it('Auto flips a spanning pair at the right edge so the right edges meet', async () => {
            const target = addTarget({ top: 100, left: window.innerWidth - 90, width: 80, height: 30 });
            const id = await open(addElement(200, 50), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS) });
            expectNear(content(id).getBoundingClientRect().right, window.innerWidth - 10);
        });

        describe('Auto flips only and never pushes on an outside axis', () => {
            it('keeps content taller than the space above and below at the target', async () => {
                const target = addTarget({ top: 300, left: 100, width: 80, height: 30 });
                const id = await open(addElement(100, Math.max(window.innerHeight - 200, 320)), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS) });
                expectNear(content(id).getBoundingClientRect().top, 330);
            });

            it('keeps content wider than the space on both sides next to the target', async () => {
                const target = addTarget({ top: 100, left: 500, width: 80, height: 30 });
                const id = await open(addElement(Math.max(window.innerWidth - 400, 520), 50), {
                    target,
                    positionStrategy: new AutoPositionStrategy({
                        ...NO_ANIMATIONS, horizontalStartPoint: HorizontalAlignment.Right, horizontalDirection: HorizontalAlignment.Right
                    })
                });
                expectNear(content(id).getBoundingClientRect().left, 580);
            });

            it('flips Top → Top below a target near the top edge', async () => {
                const target = addTarget({ top: 40, left: 100, width: 80, height: 30 });
                const id = await open(addElement(100, 100), {
                    target,
                    positionStrategy: new AutoPositionStrategy({
                        ...NO_ANIMATIONS, verticalStartPoint: VerticalAlignment.Top, verticalDirection: VerticalAlignment.Top
                    })
                });
                expectNear(content(id).getBoundingClientRect().top, 70);
            });

            it('flips Left → Left to the right of a target near the left edge', async () => {
                const target = addTarget({ top: 100, left: 40, width: 80, height: 30 });
                const id = await open(addElement(100, 50), {
                    target,
                    positionStrategy: new AutoPositionStrategy({
                        ...NO_ANIMATIONS, horizontalStartPoint: HorizontalAlignment.Left, horizontalDirection: HorizontalAlignment.Left
                    })
                });
                expectNear(content(id).getBoundingClientRect().left, 120);
            });

            it('flips Right → Right to the left of a target near the right edge', async () => {
                const target = addTarget({ top: 100, left: window.innerWidth - 120, width: 80, height: 30 });
                const id = await open(addElement(100, 50), {
                    target,
                    positionStrategy: new AutoPositionStrategy({
                        ...NO_ANIMATIONS, horizontalStartPoint: HorizontalAlignment.Right, horizontalDirection: HorizontalAlignment.Right
                    })
                });
                expectNear(content(id).getBoundingClientRect().right, window.innerWidth - 120);
            });
        });

        it('Connected never flips or shifts, as with the script engine', async () => {
            const target = addTarget({ top: 100, left: window.innerWidth - 90, width: 80, height: 30 });
            const id = await open(addElement(200, 50), { target, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            const r = content(id).getBoundingClientRect();
            expectNear(r.left, window.innerWidth - 90);
            expectNear(r.top, 130);
        });

        it('centered pairs stay centered on the target', async () => {
            const target = addTarget({ top: 200, left: 300, width: 80, height: 40 });
            const id = await open(addElement(200, 100), {
                target,
                positionStrategy: new ConnectedPositioningStrategy({
                    ...NO_ANIMATIONS,
                    horizontalStartPoint: HorizontalAlignment.Center, horizontalDirection: HorizontalAlignment.Center,
                    verticalStartPoint: VerticalAlignment.Middle, verticalDirection: VerticalAlignment.Middle
                })
            });
            const r = content(id).getBoundingClientRect();
            expectNear(r.left + r.width / 2, 340);
            expectNear(r.top + r.height / 2, 220);
        });

        it('content follows its target on scroll with NoOpScrollStrategy, without reposition', async () => {
            const scroller = track(document.createElement('div'));
            Object.assign(scroller.style, { position: 'fixed', top: '50px', left: '50px', width: '300px', height: '300px', overflow: 'auto' });
            const spacer = document.createElement('div');
            spacer.style.height = '2000px';
            const target = document.createElement('div');
            Object.assign(target.style, { position: 'absolute', top: '100px', left: '20px', width: '80px', height: '30px' });
            scroller.append(target, spacer);
            document.body.appendChild(scroller);

            const reposition = spyOn(overlay, 'reposition');
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS), scrollStrategy: new NoOpScrollStrategy() });
            expectNear(content(id).getBoundingClientRect().top, target.getBoundingClientRect().bottom);

            scroller.scrollTop = 50;
            await frames();
            expectNear(content(id).getBoundingClientRect().top, target.getBoundingClientRect().bottom);
            expect(reposition).not.toHaveBeenCalled();
        });

        it('honors settings changed between shows', async () => {
            const target = addTarget({ top: 200, left: 300, width: 80, height: 30 });
            const strategy = new AutoPositionStrategy({
                ...NO_ANIMATIONS, horizontalStartPoint: HorizontalAlignment.Right, horizontalDirection: HorizontalAlignment.Right
            });
            const id = await open(addElement(), { target, positionStrategy: strategy });
            expectNear(content(id).getBoundingClientRect().left, 380);
            overlay.hide(id);

            strategy.settings.horizontalStartPoint = HorizontalAlignment.Left;
            strategy.settings.horizontalDirection = HorizontalAlignment.Left;
            overlay.show(id);
            await frames();
            expectNear(content(id).getBoundingClientRect().right, 300);
        });

        it('anchors to a target inside another overlay', async () => {
            const outerTarget = addTarget({ top: 100, left: 100, width: 80, height: 30 });
            const outerElement = addElement(200, 100);
            const innerTarget = document.createElement('button');
            Object.assign(innerTarget.style, { display: 'block', width: '60px', height: '20px', marginTop: '40px' });
            outerElement.appendChild(innerTarget);
            await open(outerElement, { target: outerTarget, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });

            const inner = await open(addElement(), { target: innerTarget, positionStrategy: new ConnectedPositioningStrategy(NO_ANIMATIONS) });
            const t = innerTarget.getBoundingClientRect();
            const r = content(inner).getBoundingClientRect();
            expectNear(r.top, t.bottom);
            expectNear(r.left, t.left);
        });
    });

    describe('container', () => {
        beforeEach(() => configure());

        const addHost = () => {
            const scroller = track(document.createElement('div'));
            Object.assign(scroller.style, { position: 'fixed', top: '40px', left: '40px', width: '400px', height: '300px', overflow: 'auto' });
            const host = document.createElement('div');
            Object.assign(host.style, { position: 'relative', margin: '30px', width: '200px', height: '150px' });
            const spacer = document.createElement('div');
            spacer.style.height = '1000px';
            scroller.append(host, spacer);
            document.body.appendChild(scroller);
            return { scroller, host };
        };

        it('the wrapper covers the container and follows it on scroll, with no observer', async () => {
            const { scroller, host } = addHost();
            const observer = spyOn(Util, 'setupIntersectionObserver');
            const id = await open(addElement(50, 20, host), { positionStrategy: new ContainerPositionStrategy(NO_ANIMATIONS) });
            const info = overlay.getOverlayById(id);
            const wrapper = info.wrapperElement!;

            expect(info.engine).toBe('native-container');
            expect(observer).not.toHaveBeenCalled();
            expect(info.containerElement!.style.getPropertyValue('anchor-name')).toBe(info.anchorName);
            expect(wrapper.classList).toContain('igx-overlay__wrapper--flex-container');
            expect(content(id).classList).toContain('igx-overlay__content--relative');
            expect(wrapper.style.getPropertyValue('top')).toBe('anchor(top)');

            const check = () => {
                const w = wrapper.getBoundingClientRect();
                const c = info.containerElement!.getBoundingClientRect();
                expectNear(w.top, c.top);
                expectNear(w.left, c.left);
                expectNear(w.width, c.width);
                expectNear(w.height, c.height);
            };
            check();
            scroller.scrollTop = 60;
            await frames();
            check();
        });

        it('reposition applies alignment changes', async () => {
            const { host } = addHost();
            const strategy = new ContainerPositionStrategy(NO_ANIMATIONS);
            const id = await open(addElement(50, 20, host), { positionStrategy: strategy });
            const wrapper = overlay.getOverlayById(id).wrapperElement!;
            expect(wrapper.style.justifyContent).toBe('center');

            strategy.settings.horizontalDirection = HorizontalAlignment.Left;
            strategy.settings.verticalDirection = VerticalAlignment.Bottom;
            overlay.reposition(id);
            expect(overlay.getOverlayById(id).engine).toBe('native-container');
            expect(wrapper.style.justifyContent).toBe('flex-start');
            expect(wrapper.style.alignItems).toBe('flex-end');
        });

        it('the script observer stops writing the wrapper when a later show uses the native engine', async () => {
            const { host } = addHost();
            let callback: () => void = () => undefined;
            spyOn(Util, 'setupIntersectionObserver').mockImplementation((_el, _doc, cb) => {
                callback = cb;
                return null;
            });
            const id = await open(addElement(50, 20, host), { positionStrategy: new ContainerPositionStrategy(NO_ANIMATIONS) });
            const info = overlay.getOverlayById(id);
            const container = info.containerElement!;
            container.remove();
            overlay.reposition(id);
            expect(info.engine).toBe('script');

            host.appendChild(container);
            overlay.hide(id);
            overlay.show(id);
            await frames();
            expect(info.engine).toBe('native-container');
            callback();
            expect(info.wrapperElement!.style.getPropertyValue('top')).toBe('anchor(top)');
        });

        it('the script observer does not throw after detach (#16988)', async () => {
            useScriptEngine();
            const { host } = addHost();
            let callback: () => void = () => undefined;
            spyOn(Util, 'setupIntersectionObserver').mockImplementation((_el, _doc, cb) => {
                callback = cb;
                return null;
            });
            const id = await open(addElement(50, 20, host), { positionStrategy: new ContainerPositionStrategy(NO_ANIMATIONS) });
            expect(overlay.getOverlayById(id).engine).toBe('script');
            overlay.detach(id);
            expect(() => callback()).not.toThrow();
        });

        it('uses the script engine when switching to Container on show after attaching with Global', async () => {
            const { host } = addHost();
            const element = addElement(50, 20, host);
            const id = overlay.attach(new ElementRef(element), { modal: false, positionStrategy: new GlobalPositionStrategy(NO_ANIMATIONS) });
            overlay.show(id, { positionStrategy: new ContainerPositionStrategy(NO_ANIMATIONS) });
            await frames();
            const info = overlay.getOverlayById(id);
            expect(info.containerElement).toBeUndefined();
            expect(info.engine).toBe('script');
        });
    });

    describe('HideScrollStrategy', () => {
        beforeEach(() => configure());

        const addScroller = () => {
            const scroller = track(document.createElement('div'));
            Object.assign(scroller.style, { position: 'fixed', top: '50px', left: '50px', width: '300px', height: '200px', overflow: 'auto' });
            const target = document.createElement('div');
            Object.assign(target.style, { height: '30px', width: '80px', marginTop: '20px', background: 'gray' });
            const spacer = document.createElement('div');
            spacer.style.height = '2000px';
            scroller.append(target, spacer);
            document.body.appendChild(scroller);
            return { scroller, target };
        };

        const scrollAndSettle = async (scroller: HTMLElement, top: number) => {
            scroller.scrollTop = top;
            await frames(3);
        };

        it('native: hides the content while the target is scrolled out, without closing', async () => {
            const { scroller, target } = addScroller();
            const closed = vi.fn();
            overlay.closed.subscribe(closed);
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS), scrollStrategy: new HideScrollStrategy() });
            const el = content(id);
            expect(el.style.getPropertyValue('position-visibility')).toBe(anchorVisibleKeyword(window));
            expect(isHitTestable(el)).toBe(true);

            await scrollAndSettle(scroller, 200);
            expect(isHitTestable(el)).toBe(false);
            expect(overlay.getOverlayById(id).visible).toBe(true);

            await scrollAndSettle(scroller, 0);
            expect(isHitTestable(el)).toBe(true);
            expect(closed).not.toHaveBeenCalled();
        });

        it('native without position-visibility: the observer hides the content', async () => {
            withoutPositionVisibility();
            const { scroller, target } = addScroller();
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS), scrollStrategy: new HideScrollStrategy() });
            const el = content(id);
            expect(el.style.getPropertyValue('position-visibility')).toBe('always');

            await scrollAndSettle(scroller, 200);
            expect(el.style.visibility).toBe('hidden');
            await scrollAndSettle(scroller, 0);
            expect(el.style.visibility).toBe('');
        });

        it('script: repositions like Absolute and hides the content through the observer', async () => {
            useScriptEngine();
            const { scroller, target } = addScroller();
            const reposition = spyOn(overlay, 'reposition');
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS), scrollStrategy: new HideScrollStrategy() });
            await scrollAndSettle(scroller, 200);
            expect(reposition).toHaveBeenCalled();
            expect(content(id).style.visibility).toBe('hidden');
        });

        it('never hides the content of a Point target', async () => {
            const { scroller } = addScroller();
            const id = await open(addElement(), { target: new Point(60, 60), positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS), scrollStrategy: new HideScrollStrategy() });
            await scrollAndSettle(scroller, 200);
            expect(content(id).style.visibility).toBe('');
        });

        it('hide and detach clear the hidden state', async () => {
            withoutPositionVisibility();
            const { scroller, target } = addScroller();
            const strategy = new HideScrollStrategy();
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS), scrollStrategy: strategy });
            const el = content(id);
            await scrollAndSettle(scroller, 200);
            expect(el.style.visibility).toBe('hidden');

            overlay.hide(id);
            expect(el.style.visibility).toBe('');

            overlay.show(id);
            await scrollAndSettle(scroller, 210);
            expect(el.style.visibility).toBe('hidden');
            const disconnect = spyOn(IntersectionObserver.prototype, 'disconnect');
            overlay.detach(id);
            expect(disconnect).toHaveBeenCalled();
            expect(el.style.visibility).toBe('');
        });

        it('replacing the scroll strategy on show clears the hidden state', async () => {
            withoutPositionVisibility();
            const { scroller, target } = addScroller();
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS), scrollStrategy: new HideScrollStrategy() });
            await scrollAndSettle(scroller, 200);
            expect(content(id).style.visibility).toBe('hidden');
            overlay.hide(id);
            overlay.show(id, { scrollStrategy: new AbsoluteScrollStrategy() });
            await scrollAndSettle(scroller, 210);
            expect(content(id).style.visibility).toBe('');
        });

        it('Esc closes an overlay whose content is hidden', async () => {
            const { scroller, target } = addScroller();
            const id = await open(addElement(), {
                target, closeOnEscape: true,
                positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS), scrollStrategy: new HideScrollStrategy()
            });
            await scrollAndSettle(scroller, 200);
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            expect(overlay.getOverlayById(id).visible).toBe(false);
        });

        it('native: the observer hides the content after reposition switches to the script engine', async () => {
            const { scroller, target } = addScroller();
            const strategy = new ConnectedPositioningStrategy(NO_ANIMATIONS);
            const id = await open(addElement(), { target, positionStrategy: strategy, scrollStrategy: new HideScrollStrategy() });
            strategy.settings.horizontalDirection = HorizontalAlignment.Center;
            overlay.reposition(id);
            expect(overlay.getOverlayById(id).engine).toBe('script');

            await scrollAndSettle(scroller, 200);
            expect(content(id).style.visibility).toBe('hidden');
            await scrollAndSettle(scroller, 0);
            expect(content(id).style.visibility).toBe('');
        });

        it('native without position-visibility: the observer follows a target changed through reposition', async () => {
            withoutPositionVisibility();
            const { scroller, target } = addScroller();
            const id = await open(addElement(), { target, positionStrategy: new AutoPositionStrategy(NO_ANIMATIONS), scrollStrategy: new HideScrollStrategy() });
            const fixedTarget = addTarget({ top: 400, left: 400, width: 80, height: 30 });
            overlay.getOverlayById(id).settings.target = fixedTarget;
            overlay.reposition(id);

            await scrollAndSettle(scroller, 200);
            expect(content(id).style.visibility).toBe('');
        });

        it('ignores a notification queued for an observer that is no longer active', () => {
            const notify: IntersectionObserverCallback[] = [];
            const RealObserver = window.IntersectionObserver;
            spyOn(window, 'IntersectionObserver').mockImplementation(function (callback: IntersectionObserverCallback) {
                notify.push(callback);
                return new RealObserver(() => { /* driven by the test */ });
            } as any);
            const strategy = new HideScrollStrategy();
            const el = addElement();
            const out = [{ isIntersecting: false } as IntersectionObserverEntry];

            strategy._onShown(addTarget({ top: 0, left: 0, width: 10, height: 10 }), el, true);
            strategy._onHidden();
            notify[0](out, null!);
            expect(el.style.visibility).toBe('');

            strategy._onShown(addTarget({ top: 0, left: 0, width: 10, height: 10 }), el, true);
            strategy._onShown(addTarget({ top: 20, left: 0, width: 10, height: 10 }), el, true);
            notify[1](out, null!);
            expect(el.style.visibility).toBe('');
            notify[2](out, null!);
            expect(el.style.visibility).toBe('hidden');
            strategy.detach();
        });

        it('Container: native writes the anchor-visible keyword on the wrapper', async () => {
            const { target: host } = addScroller();
            host.style.position = 'relative';
            const id = await open(addElement(50, 20, host), { positionStrategy: new ContainerPositionStrategy(NO_ANIMATIONS), scrollStrategy: new HideScrollStrategy() });
            expect(overlay.getOverlayById(id).wrapperElement!.style.getPropertyValue('position-visibility')).toBe(anchorVisibleKeyword(window));
        });
    });
});

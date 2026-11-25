import { scaleInHorLeft, scaleInHorRight, scaleInVerBottom, scaleInVerTop, fadeIn } from 'igniteui-angular/animations';
import { afterEach, describe, expect, it } from 'vitest';
import { HorizontalAlignment as H, PositionSettings, VerticalAlignment as V } from '../utilities';
import { acquireAnchorName, addAnchorName, removeAnchorName } from './anchor-names';
import { supportsNativeAnchoring, supportsPositionVisibility } from './anchoring';
import {
    AUTO_FALLBACKS,
    connectedDeclarations,
    containerDeclarations,
    flipAnimation,
    isExpressible,
    resolveFlippedAxes
} from './native-engine';

const HORIZONTAL = [H.Left, H.Center, H.Right];
const VERTICAL = [V.Top, V.Middle, V.Bottom];

const settings = (hs: H, hd: H, vs: V, vd: V, extra: PositionSettings = {}): PositionSettings => ({
    horizontalStartPoint: hs, horizontalDirection: hd, verticalStartPoint: vs, verticalDirection: vd, ...extra
});

const asMap = (declarations: ReadonlyArray<readonly [string, string]>) => Object.fromEntries(declarations);

const rect = (left: number, top: number, width: number, height: number) =>
    ({ left, top, right: left + width, bottom: top + height });

describe('Overlay anchoring (pure)', () => {
    describe('isExpressible', () => {
        const expressible = (start: number, direction: number) =>
            start === direction || (start !== -0.5 && direction !== -0.5);

        for (const hs of HORIZONTAL) {
            for (const hd of HORIZONTAL) {
                for (const vs of VERTICAL) {
                    for (const vd of VERTICAL) {
                        const expected = expressible(hs, hd) && expressible(vs, vd);
                        it(`${hs}→${hd}, ${vs}→${vd} is ${expected ? '' : 'not '}expressible`, () => {
                            expect(isExpressible(settings(hs, hd, vs, vd))).toBe(expected);
                        });
                    }
                }
            }
        }

        it('is false when a value is missing', () => {
            expect(isExpressible({ horizontalDirection: H.Right })).toBe(false);
        });
    });

    describe('connectedDeclarations', () => {
        const horizontal: [H, H, string, string, string][] = [
            [H.Left, H.Left, 'left', 'normal', 'unsafe right'],
            [H.Left, H.Right, 'span-right', 'left', 'unsafe left'],
            [H.Center, H.Center, 'span-all', 'anchor-center', 'unsafe anchor-center'],
            [H.Right, H.Left, 'span-left', 'right', 'unsafe right'],
            [H.Right, H.Right, 'right', 'normal', 'unsafe left']
        ];
        const vertical: [V, V, string, string, string][] = [
            [V.Top, V.Top, 'top', 'normal', 'unsafe end'],
            [V.Top, V.Bottom, 'span-bottom', 'self-start', 'unsafe self-start'],
            [V.Middle, V.Middle, 'span-all', 'anchor-center', 'unsafe anchor-center'],
            [V.Bottom, V.Top, 'span-top', 'self-end', 'unsafe self-end'],
            [V.Bottom, V.Bottom, 'bottom', 'normal', 'unsafe start']
        ];

        for (const [hs, hd, column, hAuto, hConnected] of horizontal) {
            for (const [vs, vd, row, vAuto, vConnected] of vertical) {
                it(`maps ${hs}→${hd}, ${vs}→${vd} to "${row} ${column}"`, () => {
                    const s = settings(hs, hd, vs, vd);
                    const auto = asMap(connectedDeclarations(s, true, '--a', false));
                    const connected = asMap(connectedDeclarations(s, false, '--a', false));

                    expect(auto['position-area']).toBe(`${row} ${column}`);
                    expect(auto['justify-self']).toBe(hAuto);
                    expect(auto['align-self']).toBe(vAuto);
                    expect(auto['position-try-fallbacks']).toBe(AUTO_FALLBACKS);
                    expect(connected['position-area']).toBe(`${row} ${column}`);
                    expect(connected['justify-self']).toBe(hConnected);
                    expect(connected['align-self']).toBe(vConnected);
                    expect(connected['position-try-fallbacks']).toBe('none');
                });
            }
        }

        it('writes the fixed base declarations in order', () => {
            const declarations = connectedDeclarations(settings(H.Left, H.Right, V.Bottom, V.Bottom), false, '--a', false);
            expect(declarations.map(([p]) => p)).toEqual([
                'position', 'inset', 'margin', 'position-anchor', 'position-area',
                'justify-self', 'align-self', 'position-try-fallbacks', 'position-visibility'
            ]);
            const map = asMap(declarations);
            expect(map.position).toBe('fixed');
            expect(map.inset).toBe('auto');
            expect(map['position-anchor']).toBe('--a');
            expect(map['position-visibility']).toBe('always');
            expect(map.margin).toBe('0px 0px 0px 0px');
        });

        it('applies the offset as margins on outside axes only', () => {
            const bottomBottom = asMap(connectedDeclarations(settings(H.Left, H.Right, V.Bottom, V.Bottom, { offset: 6 }), true, '--a', false));
            expect(bottomBottom.margin).toBe('6px 0px 6px 0px');

            const rightRight = asMap(connectedDeclarations(settings(H.Right, H.Right, V.Top, V.Bottom, { offset: 4 }), true, '--a', false));
            expect(rightRight.margin).toBe('0px 4px 0px 4px');

            const centered = asMap(connectedDeclarations(settings(H.Center, H.Center, V.Middle, V.Middle, { offset: 4 }), true, '--a', false));
            expect(centered.margin).toBe('0px 0px 0px 0px');
        });

        it('writes anchors-visible only when hiding', () => {
            const s = settings(H.Left, H.Right, V.Bottom, V.Bottom);
            expect(asMap(connectedDeclarations(s, true, '--a', true))['position-visibility']).toBe('anchors-visible');
            expect(asMap(connectedDeclarations(s, true, '--a', false))['position-visibility']).toBe('always');
        });
    });

    describe('containerDeclarations', () => {
        it('anchors all four insets to the container', () => {
            expect(asMap(containerDeclarations('--c', false))).toEqual({
                'position-anchor': '--c',
                top: 'anchor(top)',
                right: 'anchor(right)',
                bottom: 'anchor(bottom)',
                left: 'anchor(left)',
                'position-visibility': 'always'
            });
            expect(asMap(containerDeclarations('--c', true))['position-visibility']).toBe('anchors-visible');
        });
    });

    describe('resolveFlippedAxes', () => {
        const target = rect(100, 100, 50, 20); // right 150, bottom 120

        it('detects an unflipped and a flipped vertical outside pair', () => {
            const s = settings(H.Left, H.Right, V.Bottom, V.Bottom);
            expect(resolveFlippedAxes(s, rect(100, 120, 80, 40), target)).toEqual({ horizontal: false, vertical: false });
            expect(resolveFlippedAxes(s, rect(100, 60, 80, 40), target)).toEqual({ horizontal: false, vertical: true });
        });

        it('accounts for the offset on outside axes', () => {
            const s = settings(H.Left, H.Right, V.Bottom, V.Bottom, { offset: 6 });
            expect(resolveFlippedAxes(s, rect(100, 126, 80, 40), target).vertical).toBe(false);
            expect(resolveFlippedAxes(s, rect(100, 54, 80, 40), target).vertical).toBe(true);
        });

        it('detects a flipped horizontal spanning pair', () => {
            const s = settings(H.Left, H.Right, V.Bottom, V.Bottom);
            // Left → Right flipped is Right → Left: right edges meet.
            expect(resolveFlippedAxes(s, rect(70, 120, 80, 40), target).horizontal).toBe(true);
        });

        it('detects both outside axes flipped', () => {
            const s = settings(H.Right, H.Right, V.Bottom, V.Bottom);
            expect(resolveFlippedAxes(s, rect(20, 60, 80, 40), target)).toEqual({ horizontal: true, vertical: true });
        });

        it('never flips centered axes', () => {
            const s = settings(H.Center, H.Center, V.Middle, V.Middle);
            expect(resolveFlippedAxes(s, rect(0, 0, 10, 10), target)).toEqual({ horizontal: false, vertical: false });
        });

        it('counts a tie as not flipped', () => {
            // Content as tall as the space: equally far from both placements.
            const s = settings(H.Left, H.Right, V.Bottom, V.Bottom);
            expect(resolveFlippedAxes(s, rect(100, 110, 80, 0), target).vertical).toBe(false);
        });
    });

    describe('flipAnimation', () => {
        it('reverses vertical animations on a vertical flip only', () => {
            expect(flipAnimation(scaleInVerTop, { horizontal: false, vertical: true })).toBe(scaleInVerBottom);
            expect(flipAnimation(scaleInVerTop, { horizontal: true, vertical: false })).toBe(scaleInVerTop);
        });

        it('reverses horizontal animations on a horizontal flip only', () => {
            expect(flipAnimation(scaleInHorLeft, { horizontal: true, vertical: false })).toBe(scaleInHorRight);
            expect(flipAnimation(scaleInHorLeft, { horizontal: false, vertical: true })).toBe(scaleInHorLeft);
        });

        it('keeps animations without a direction and missing animations', () => {
            expect(flipAnimation(fadeIn, { horizontal: true, vertical: true })).toBe(fadeIn);
            expect(flipAnimation(undefined, { horizontal: true, vertical: true })).toBeUndefined();
        });
    });

    describe('anchor names', () => {
        const elements: HTMLElement[] = [];
        const element = () => {
            const el = document.createElement('div');
            document.body.appendChild(el);
            elements.push(el);
            return el;
        };

        afterEach(() => elements.splice(0).forEach(e => e.remove()));

        it('acquires unique names', () => {
            const names = new Set([acquireAnchorName(), acquireAnchorName(), acquireAnchorName()]);
            expect(names.size).toBe(3);
            names.forEach(n => expect(n).toMatch(/^--igx-overlay-anchor-\d+$/));
        });

        it('adds and removes names, leaving nothing behind', () => {
            const el = element();
            addAnchorName(el, '--one');
            addAnchorName(el, '--two');
            addAnchorName(el, '--two');
            expect(el.style.getPropertyValue('anchor-name')).toBe('--one, --two');
            removeAnchorName(el, '--one');
            expect(el.style.getPropertyValue('anchor-name')).toBe('--two');
            removeAnchorName(el, '--two');
            expect(el.getAttribute('style') ?? '').toBe('');
        });

        it('keeps an author stylesheet value in the list', () => {
            const el = element();
            el.id = 'igx-anchor-author';
            const style = document.createElement('style');
            style.textContent = '#igx-anchor-author { anchor-name: --author; }';
            document.head.appendChild(style);
            try {
                addAnchorName(el, '--one');
                expect(el.style.getPropertyValue('anchor-name')).toBe('--author, --one');
                removeAnchorName(el, '--one');
                expect(el.style.getPropertyValue('anchor-name')).toBe('');
            } finally {
                style.remove();
            }
        });

        it('restores an author inline value exactly', () => {
            const el = element();
            el.style.setProperty('anchor-name', '--inline');
            addAnchorName(el, '--one');
            expect(el.style.getPropertyValue('anchor-name')).toBe('--inline, --one');
            removeAnchorName(el, '--one');
            expect(el.style.getPropertyValue('anchor-name')).toBe('--inline');
        });

        it('ignores removing an unknown name', () => {
            const el = element();
            expect(() => removeAnchorName(el, '--never')).not.toThrow();
        });
    });

    describe('feature detection', () => {
        it('detects support in this browser and none without a window', () => {
            expect(supportsNativeAnchoring(window)).toBe(true);
            expect(supportsPositionVisibility(window)).toBe(true);
            expect(supportsNativeAnchoring(null)).toBe(false);
            expect(supportsPositionVisibility(undefined)).toBe(false);
        });
    });
});

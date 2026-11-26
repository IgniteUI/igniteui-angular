import { AnimationReferenceMetadata } from '@angular/animations';
import { AnimationUtil } from 'igniteui-angular/animations';
import { HorizontalAlignment, PositionSettings, VerticalAlignment } from '../utilities';
import type { AnchorVisibleKeyword } from './anchoring';

/** @hidden @internal */
export type OverlayEngine = 'script' | 'native-connected' | 'native-container';

/** @hidden @internal Ordered list of inline declarations. */
export type NativeDeclarations = ReadonlyArray<readonly [property: string, value: string]>;

/** @hidden @internal Inline properties the script engine writes on the content element. */
export const SCRIPT_CONTENT_PROPS = ['top', 'right', 'bottom', 'left', 'transform'] as const;
/** @hidden @internal Inline properties the native engine writes on the content element. */
export const NATIVE_CONTENT_PROPS = [
    'position', 'inset', 'margin', 'position-anchor', 'position-area',
    'justify-self', 'align-self', 'position-try-fallbacks', 'position-visibility'
] as const;
/** @hidden @internal Inline properties the script engine writes on the wrapper element. */
export const SCRIPT_WRAPPER_PROPS = ['top', 'left', 'width', 'height'] as const;
/** @hidden @internal Inline properties the native engine writes on the wrapper element. */
export const NATIVE_WRAPPER_PROPS = ['position-anchor', 'top', 'right', 'bottom', 'left', 'position-visibility'] as const;

/** @hidden @internal Fallbacks for `AutoPositionStrategy`: each axis flips independently, then both. */
export const AUTO_FALLBACKS = 'flip-block, flip-inline, flip-block flip-inline';

interface AxisMapping {
    /** `position-area` track on this axis. */
    area: string;
    /**
     * Self-alignment for Auto. On an outside axis it is `unsafe`: Auto flips only and is never pushed along the
     * viewport edge after a failed flip (#17765). On a spanning or centered axis the browser's default overflow
     * alignment may shift the content into view.
     */
    auto: string;
    /** Self-alignment for Connected: `unsafe`, so the content never shifts, as with the script engine. */
    connected: string;
    /** The content lies wholly outside the target on this axis; only these axes get `offset`. */
    outside: boolean;
}

const pairKey = (start: number | undefined, direction: number | undefined) => `${start}|${direction}`;

const H = HorizontalAlignment;
const V = VerticalAlignment;

// DISCUSS(#17765): these tables differ from the approved plan (§7.3, D13, Appendix A), following the gate
// tests (option 1): centered pairs use `span-all` instead of `center`, Connected uses `unsafe` alignment
// so it never shifts, and Auto uses it on outside axes so it flips only (see the centered axis and `unsafe`
// alignment tests in native-anchoring.spec.ts). §15 requires the amended spec to be re-approved.
//
// DISCUSS(#17765): only these 5 pairs per axis go native. Start points default to Left/Bottom, so code that
// sets only a direction (e.g. `horizontalDirection: Center` → `Left → Center`, `verticalDirection: Middle`
// → `Bottom → Middle`) silently stays on the script engine. The drop-down demo's top/bottom/left/right
// placements all do. Decide whether that is acceptable or whether `anchor()` insets should cover the other pairs.

/**
 * Horizontal pairs (`horizontalStartPoint → horizontalDirection`).
 * Centered pairs use `span-all`: a `center` track is only as wide as the target, so wider content
 * would overflow it on both sides and never flip.
 */
const HORIZONTAL = new Map<string, AxisMapping>([
    [pairKey(H.Left, H.Left), { area: 'left', auto: 'unsafe right', connected: 'unsafe right', outside: true }],
    [pairKey(H.Left, H.Right), { area: 'span-right', auto: 'left', connected: 'unsafe left', outside: false }],
    [pairKey(H.Center, H.Center), { area: 'span-all', auto: 'anchor-center', connected: 'unsafe anchor-center', outside: false }],
    [pairKey(H.Right, H.Left), { area: 'span-left', auto: 'right', connected: 'unsafe right', outside: false }],
    [pairKey(H.Right, H.Right), { area: 'right', auto: 'unsafe left', connected: 'unsafe left', outside: true }]
]);

/** Vertical pairs (`verticalStartPoint → verticalDirection`). */
const VERTICAL = new Map<string, AxisMapping>([
    [pairKey(V.Top, V.Top), { area: 'top', auto: 'unsafe end', connected: 'unsafe end', outside: true }],
    [pairKey(V.Top, V.Bottom), { area: 'span-bottom', auto: 'self-start', connected: 'unsafe self-start', outside: false }],
    [pairKey(V.Middle, V.Middle), { area: 'span-all', auto: 'anchor-center', connected: 'unsafe anchor-center', outside: false }],
    [pairKey(V.Bottom, V.Top), { area: 'span-top', auto: 'self-end', connected: 'unsafe self-end', outside: false }],
    [pairKey(V.Bottom, V.Bottom), { area: 'bottom', auto: 'unsafe start', connected: 'unsafe start', outside: true }]
]);

const horizontalOf = (s: PositionSettings) => HORIZONTAL.get(pairKey(s.horizontalStartPoint, s.horizontalDirection));
const verticalOf = (s: PositionSettings) => VERTICAL.get(pairKey(s.verticalStartPoint, s.verticalDirection));

/**
 * @hidden @internal
 * Whether both axes of the settings map to `position-area`.
 */
export function isExpressible(settings: PositionSettings): boolean {
    return !!horizontalOf(settings) && !!verticalOf(settings);
}

/**
 * @hidden @internal
 * The inline declarations for a native Connected or Auto overlay content element.
 * Call only with expressible settings.
 */
export function connectedDeclarations(
    settings: PositionSettings, isAuto: boolean, anchorName: string, hide: AnchorVisibleKeyword | null
): NativeDeclarations {
    const h = horizontalOf(settings)!;
    const v = verticalOf(settings)!;
    const offset = settings.offset ?? 0;
    const mv = v.outside ? offset : 0;
    const mh = h.outside ? offset : 0;
    return [
        ['position', 'fixed'],
        ['inset', 'auto'],
        ['margin', `${mv}px ${mh}px ${mv}px ${mh}px`],
        ['position-anchor', anchorName],
        ['position-area', `${v.area} ${h.area}`],
        ['justify-self', isAuto ? h.auto : h.connected],
        ['align-self', isAuto ? v.auto : v.connected],
        ['position-try-fallbacks', isAuto ? AUTO_FALLBACKS : 'none'],
        ['position-visibility', hide ?? 'always']
    ];
}

/**
 * @hidden @internal
 * The inline declarations for a native Container overlay wrapper element.
 *
 * DISCUSS(#17765): likely obsolete. `vkombov/fix-17986` (#17986, 22.3.1) takes Container overlays out of
 * the top layer, so the container clips and scrolls them with no positioning code. Native Container
 * (D11, D12, §8.2, PR 3) would then be unnecessary;
 */
export function containerDeclarations(anchorName: string, hide: AnchorVisibleKeyword | null): NativeDeclarations {
    return [
        ['position-anchor', anchorName],
        ['top', 'anchor(top)'],
        ['right', 'anchor(right)'],
        ['bottom', 'anchor(bottom)'],
        ['left', 'anchor(left)'],
        ['position-visibility', hide ?? 'always']
    ];
}

interface Edges { top: number; right: number; bottom: number; left: number }

/**
 * Distance from the content to where the pair would put it, on one axis.
 * `start`/`end` are the start point and direction as -1 (left/top) or 0 (right/bottom).
 */
function deviation(start: number, direction: number, content: Edges, target: Edges, offset: number, horizontal: boolean): number {
    const [cStart, cEnd, tStart, tEnd] = horizontal
        ? [content.left, content.right, target.left, target.right]
        : [content.top, content.bottom, target.top, target.bottom];
    const before = start === -1;
    const forward = direction === 0;
    if (before && !forward) {   // Left → Left, Top → Top
        return Math.abs(cEnd - (tStart - offset));
    }
    if (before && forward) {    // Left → Right, Top → Bottom
        return Math.abs(cStart - tStart);
    }
    if (!before && !forward) {  // Right → Left, Bottom → Top
        return Math.abs(cEnd - tEnd);
    }
    return Math.abs(cStart - (tEnd + offset)); // Right → Right, Bottom → Bottom
}

/** Swaps -1 (left/top) and 0 (right/bottom); keeps the center value. */
const flipValue = (value: number) => value === -1 ? 0 : value === 0 ? -1 : value;

/**
 * @hidden @internal
 * Decides per axis whether the browser chose a flipped position option, from the rendered rectangles.
 * Centered axes never flip. A tie counts as not flipped.
 */
export function resolveFlippedAxes(
    settings: PositionSettings, contentRect: Edges, targetRect: Edges
): { horizontal: boolean; vertical: boolean } {
    const offset = settings.offset ?? 0;
    const axis = (start: number | undefined, direction: number | undefined, horizontal: boolean, mapping?: AxisMapping) => {
        if (start === undefined || direction === undefined || start === -0.5 || direction === -0.5) {
            return false;
        }
        const o = mapping?.outside ? offset : 0;
        const configured = deviation(start, direction, contentRect, targetRect, o, horizontal);
        const flipped = deviation(flipValue(start), flipValue(direction), contentRect, targetRect, o, horizontal);
        return flipped < configured;
    };
    return {
        horizontal: axis(settings.horizontalStartPoint, settings.horizontalDirection, true, horizontalOf(settings)),
        vertical: axis(settings.verticalStartPoint, settings.verticalDirection, false, verticalOf(settings))
    };
}

/**
 * @hidden @internal
 * Reverses an animation on each flipped axis it animates along, as `AutoPositionStrategy` does.
 */
export function flipAnimation(
    animation: AnimationReferenceMetadata | null | undefined,
    flipped: { horizontal: boolean; vertical: boolean }
): AnimationReferenceMetadata | null | undefined {
    const util = AnimationUtil.instance();
    let result = animation;
    if (result && flipped.horizontal && util.isHorizontalAnimation(result)) {
        result = util.reverseAnimationResolver(result);
    }
    if (result && flipped.vertical && util.isVerticalAnimation(result)) {
        result = util.reverseAnimationResolver(result);
    }
    return result;
}

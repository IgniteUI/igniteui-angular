import { flipBottom, flipHorBck, flipHorFwd, flipLeft, flipRight, flipTop, flipVerBck, flipVerFwd } from './flip';
import { growVerIn, growVerOut } from './grow';
import { pulsateBck, pulsateFwd } from './misc';
import { rotateInBl, rotateInBottom, rotateInBr, rotateInLeft, rotateInRight, rotateInTl, rotateInTop, rotateInTr, rotateOutBl, rotateOutBottom, rotateOutBr, rotateOutLeft, rotateOutRight, rotateOutTl, rotateOutTop, rotateOutTr } from './rotate';
import { scaleInBl, scaleInBottom, scaleInBr, scaleInHorLeft, scaleInHorRight, scaleInLeft, scaleInRight, scaleInTl, scaleInTop, scaleInTr, scaleInVerBottom, scaleInVerTop, scaleOutBl, scaleOutBottom, scaleOutBr, scaleOutHorLeft, scaleOutHorRight, scaleOutLeft, scaleOutRight, scaleOutTl, scaleOutTop, scaleOutTr, scaleOutVerBottom, scaleOutVerTop } from './scale';
import { slideInTop, slideInBottom, slideOutTop, slideOutBottom, slideInRight, slideInLeft, slideOutRight, slideOutLeft, slideInTr, slideInBl, slideOutTr, slideOutBl, slideInBr, slideInTl, slideOutBr, slideOutTl } from './slide';
import { swingInTopFwd, swingInBottomFwd, swingOutTopFwd, swingOutBottomFwd, swingInRightFwd, swingInLeftFwd, swingOutRightFwd, swingOutLefttFwd, swingInTopBck, swingInBottomBck, swingOutTopBck, swingOutBottomBck, swingInRightBck, swingInLeftBck, swingOutRightBck, swingOutLeftBck } from './swing';
import { AnimationInput, AnimationPreset, isPreset, isPresetAnimation } from './types';

type Pair = [AnimationPreset, AnimationPreset];

/** Mirror pairs, listed once per direction; `bothWays` adds the reverse entries. */
const MIRRORS: Pair[] = [
    [flipTop, flipBottom],
    [flipRight, flipLeft],
    [flipHorFwd, flipHorBck],
    [flipVerFwd, flipVerBck],
    [pulsateFwd, pulsateBck],
    [rotateInTop, rotateInBottom],
    [rotateOutTop, rotateOutBottom],
    [rotateInRight, rotateInLeft],
    [rotateOutRight, rotateOutLeft],
    [rotateInTr, rotateInBl],
    [rotateOutTr, rotateOutBl],
    [rotateInBr, rotateInTl],
    [rotateOutBr, rotateOutTl],
    [scaleInTop, scaleInBottom],
    [scaleOutTop, scaleOutBottom],
    [scaleInRight, scaleInLeft],
    [scaleOutRight, scaleOutLeft],
    [scaleInTr, scaleInBl],
    [scaleOutTr, scaleOutBl],
    [scaleInBr, scaleInTl],
    [scaleOutBr, scaleOutTl],
    [scaleInVerTop, scaleInVerBottom],
    [scaleOutVerTop, scaleOutVerBottom],
    [scaleInHorLeft, scaleInHorRight],
    [scaleOutHorLeft, scaleOutHorRight],
    [slideInTop, slideInBottom],
    [slideOutTop, slideOutBottom],
    [slideInRight, slideInLeft],
    [slideOutRight, slideOutLeft],
    [slideInTr, slideInBl],
    [slideOutTr, slideOutBl],
    [slideInBr, slideInTl],
    [slideOutBr, slideOutTl],
    [swingInTopFwd, swingInBottomFwd],
    [swingOutTopFwd, swingOutBottomFwd],
    [swingInRightFwd, swingInLeftFwd],
    [swingOutRightFwd, swingOutLefttFwd],
    [swingInTopBck, swingInBottomBck],
    [swingOutTopBck, swingOutBottomBck],
    [swingInRightBck, swingInLeftBck],
    [swingOutRightBck, swingOutLeftBck],
];

/** Corner presets move along both axes. */
const CORNERS: AnimationPreset[] = [
    rotateInTr, rotateOutTr, rotateInBr, rotateOutBr, rotateInBl, rotateOutBl, rotateInTl, rotateOutTl,
    scaleInTr, scaleOutTr, scaleInBr, scaleOutBr, scaleInBl, scaleOutBl, scaleInTl, scaleOutTl,
    slideInTr, slideOutTr, slideInBr, slideOutBr, slideInBl, slideOutBl, slideInTl, slideOutTl,
];

const HORIZONTAL: AnimationPreset[] = [
    ...CORNERS,
    flipRight, flipLeft, flipVerFwd, flipVerBck,
    rotateInRight, rotateOutRight, rotateInLeft, rotateOutLeft,
    scaleInRight, scaleOutRight, scaleInLeft, scaleOutLeft,
    scaleInHorLeft, scaleOutHorLeft, scaleInHorRight, scaleOutHorRight,
    slideInRight, slideOutRight, slideInLeft, slideOutLeft,
    swingInRightFwd, swingOutRightFwd, swingInLeftFwd, swingOutLefttFwd,
    swingInRightBck, swingOutRightBck, swingInLeftBck, swingOutLeftBck,
];

const VERTICAL: AnimationPreset[] = [
    ...CORNERS,
    flipTop, flipBottom, flipHorFwd, flipHorBck,
    growVerIn, growVerOut,
    rotateInTop, rotateOutTop, rotateInBottom, rotateOutBottom,
    scaleInTop, scaleOutTop, scaleInBottom, scaleOutBottom,
    scaleInVerTop, scaleOutVerTop, scaleInVerBottom, scaleOutVerBottom,
    slideInTop, slideOutTop, slideInBottom, slideOutBottom,
    swingInTopFwd, swingOutTopFwd, swingInBottomFwd, swingOutBottomFwd,
    swingInTopBck, swingOutTopBck, swingInBottomBck, swingOutBottomBck,
];

const bothWays = (pairs: Pair[]): Map<AnimationPreset, AnimationPreset> => {
    const map = new Map<AnimationPreset, AnimationPreset>();

    for (const [a, b] of pairs) {
        map.set(a, b);
        map.set(b, a);
    }

    return map;
};

const mirrors = /*@__PURE__*/bothWays(MIRRORS);
const horizontal = /*@__PURE__*/new Set(HORIZONTAL);
const vertical = /*@__PURE__*/new Set(VERTICAL);

/** Preset behind an input, if any. Custom metadata has none. */
function presetOf(input: AnimationInput): AnimationPreset | undefined {
    if (isPreset(input)) {
        return input;
    }

    if (isPresetAnimation(input)) {
        return input.preset;
    }

    return undefined;
}

/**
 * Mirrored counterpart with the same overrides, e.g. slideInLeft({ duration: 1000 })
 * becomes slideInRight({ duration: 1000 }). Unknown inputs come back unchanged.
 */
export function reverseAnimation(input: AnimationInput): AnimationInput {
    const preset = presetOf(input);
    const mirror = preset && mirrors.get(preset);

    if (!mirror) {
        return input;
    }

    if (isPreset(input)) {
        return mirror;
    }

    return mirror(isPresetAnimation(input) ? input.params : undefined);
}

export function isHorizontalAnimation(input: AnimationInput): boolean {
    const preset = presetOf(input);

    return !!preset && horizontal.has(preset);
}

export function isVerticalAnimation(input: AnimationInput): boolean {
    const preset = presetOf(input);

    return !!preset && vertical.has(preset);
}

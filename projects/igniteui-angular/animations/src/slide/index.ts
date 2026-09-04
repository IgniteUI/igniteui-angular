import { EaseIn, EaseOut } from '../easings';
import { AnimationParams, AnimationPreset, definePreset } from '../types';

export interface SlideParams extends AnimationParams {
    startOpacity: number;
    endOpacity: number;
    /** CSS transform, e.g. `translateY(-500px)` */
    fromPosition: string;
    toPosition: string;
}

const steps = (p: SlideParams): Keyframe[] => [
    { opacity: p.startOpacity, transform: p.fromPosition },
    { opacity: p.endOpacity, transform: p.toPosition }
];

const slideIn = (name: string, fromPosition: string, toPosition: string): AnimationPreset<SlideParams> =>
    definePreset<SlideParams>(name, {
        delay: 0,
        duration: 350,
        easing: EaseOut.Quad,
        startOpacity: 0,
        endOpacity: 1,
        fromPosition,
        toPosition
    }, steps);

const slideOut = (name: string, fromPosition: string, toPosition: string): AnimationPreset<SlideParams> =>
    definePreset<SlideParams>(name, {
        delay: 0,
        duration: 350,
        easing: EaseIn.Quad,
        startOpacity: 1,
        endOpacity: 0,
        fromPosition,
        toPosition
    }, steps);

const ORIGIN = 'translateY(0)';
const ORIGIN_2D = 'translateY(0) translateX(0)';

export const slideInTop = /*@__PURE__*/slideIn('slideInTop', 'translateY(-500px)', ORIGIN);
export const slideInLeft = /*@__PURE__*/slideIn('slideInLeft', 'translateX(-500px)', ORIGIN);
export const slideInRight = /*@__PURE__*/slideIn('slideInRight', 'translateX(500px)', ORIGIN);
export const slideInBottom = /*@__PURE__*/slideIn('slideInBottom', 'translateY(500px)', ORIGIN);
export const slideInTr = /*@__PURE__*/slideIn('slideInTr', 'translateY(-500px) translateX(500px)', ORIGIN_2D);
export const slideInTl = /*@__PURE__*/slideIn('slideInTl', 'translateY(-500px) translateX(-500px)', ORIGIN_2D);
export const slideInBr = /*@__PURE__*/slideIn('slideInBr', 'translateY(500px) translateX(500px)', ORIGIN_2D);
export const slideInBl = /*@__PURE__*/slideIn('slideInBl', 'translateY(500px) translateX(-500px)', ORIGIN_2D);

export const slideOutTop = /*@__PURE__*/slideOut('slideOutTop', ORIGIN, 'translateY(-500px)');
export const slideOutRight = /*@__PURE__*/slideOut('slideOutRight', ORIGIN, 'translateX(500px)');
export const slideOutBottom = /*@__PURE__*/slideOut('slideOutBottom', ORIGIN, 'translateY(500px)');
export const slideOutLeft = /*@__PURE__*/slideOut('slideOutLeft', ORIGIN, 'translateX(-500px)');
export const slideOutTr = /*@__PURE__*/slideOut('slideOutTr', ORIGIN_2D, 'translateY(-500px) translateX(500px)');
export const slideOutBr = /*@__PURE__*/slideOut('slideOutBr', ORIGIN_2D, 'translateY(500px) translateX(500px)');
export const slideOutBl = /*@__PURE__*/slideOut('slideOutBl', ORIGIN_2D, 'translateY(500px) translateX(-500px)');
export const slideOutTl = /*@__PURE__*/slideOut('slideOutTl', ORIGIN_2D, 'translateY(-500px) translateX(-500px)');

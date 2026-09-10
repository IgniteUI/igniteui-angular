import { EaseOut } from '../easings';
import { AnimationParams, AnimationPreset, definePreset } from '../types';

export interface FlipParams extends AnimationParams {
    startAngle: number;
    endAngle: number;
    /** CSS length, e.g. `170px` */
    startDistance: string;
    endDistance: string;
    /** rotate3d axis vector */
    rotateX: number;
    rotateY: number;
    rotateZ: number;
}

// WAAPI has no separate initial style, so the 3D setup rides on every keyframe.
const flipStyle = { backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' };

const steps = (p: FlipParams): Keyframe[] => [
    {
        ...flipStyle,
        offset: 0,
        transform: `translateZ(${p.startDistance}) rotate3d(${p.rotateX}, ${p.rotateY}, ${p.rotateZ}, ${p.startAngle}deg)`
    },
    {
        ...flipStyle,
        offset: 1,
        transform: `translateZ(${p.endDistance}) rotate3d(${p.rotateX}, ${p.rotateY}, ${p.rotateZ}, ${p.endAngle}deg)`
    }
];

const NO_DISTANCE = '0px';
const FWD_DISTANCE = '170px';
const BCK_DISTANCE = '-170px';
const HALF_TURN = 180;

const flip = (name: string, rotateX: number, rotateY: number, endAngle: number, endDistance: string): AnimationPreset<FlipParams> =>
    definePreset<FlipParams>(name, {
        delay: 0,
        duration: 600,
        easing: EaseOut.Quad,
        startAngle: 0,
        endAngle,
        startDistance: NO_DISTANCE,
        endDistance,
        rotateX,
        rotateY,
        rotateZ: 0
    }, steps);

export const flipTop = /*@__PURE__*/flip('flipTop', 1, 0, HALF_TURN, NO_DISTANCE);
export const flipBottom = /*@__PURE__*/flip('flipBottom', 1, 0, -HALF_TURN, NO_DISTANCE);
export const flipLeft = /*@__PURE__*/flip('flipLeft', 0, 1, HALF_TURN, NO_DISTANCE);
export const flipRight = /*@__PURE__*/flip('flipRight', 0, 1, -HALF_TURN, NO_DISTANCE);

export const flipHorFwd = /*@__PURE__*/flip('flipHorFwd', 1, 0, HALF_TURN, FWD_DISTANCE);
export const flipHorBck = /*@__PURE__*/flip('flipHorBck', 1, 0, HALF_TURN, BCK_DISTANCE);
export const flipVerFwd = /*@__PURE__*/flip('flipVerFwd', 0, 1, HALF_TURN, FWD_DISTANCE);
export const flipVerBck = /*@__PURE__*/flip('flipVerBck', 0, 1, HALF_TURN, BCK_DISTANCE);

import { AnimationParams, definePreset } from '../types';

export interface PulsateParams extends AnimationParams {
    fromScale: number;
    toScale: number;
}

export interface BlinkParams extends AnimationParams {
    fromScale: number;
    midScale: number;
    toScale: number;
}

const EASING = 'ease-in-out';
const CENTER = 'center center';

const pulsateSteps = (p: PulsateParams): Keyframe[] => [
    { offset: 0, transform: `scale(${p.fromScale})` },
    { offset: 0.5, transform: `scale(${p.toScale})` },
    { offset: 1, transform: `scale(${p.fromScale})` }
];

// Each keyframe eases on its own.
// The final keyframe holds scale(1) until the end; WAAPI does not do that implicitly.
const heartbeatSteps = (): Keyframe[] => [
    { offset: 0, transform: 'scale(1)', transformOrigin: CENTER, easing: 'ease-out' },
    { offset: 0.1, transform: 'scale(0.91)', easing: 'ease-in' },
    { offset: 0.17, transform: 'scale(0.98)', easing: 'ease-out' },
    { offset: 0.33, transform: 'scale(0.87)', easing: 'ease-in' },
    { offset: 0.45, transform: 'scale(1)', easing: 'ease-out' },
    { offset: 1, transform: 'scale(1)', transformOrigin: CENTER }
];

const blinkSteps = (p: BlinkParams): Keyframe[] => [
    { offset: 0, opacity: .8, transform: `scale(${p.fromScale})` },
    { offset: 0.8, opacity: 0, transform: `scale(${p.midScale})` },
    { offset: 1, opacity: 0, transform: `scale(${p.toScale})` }
];

export const pulsateFwd = /*@__PURE__*/definePreset<PulsateParams>('pulsateFwd', {
    delay: 0,
    duration: 500,
    easing: EASING,
    fromScale: 1,
    toScale: 1.1
}, pulsateSteps);

export const pulsateBck = /*@__PURE__*/definePreset<PulsateParams>('pulsateBck', {
    delay: 0,
    duration: 500,
    easing: EASING,
    fromScale: 1,
    toScale: .9
}, pulsateSteps);

export const heartbeat = /*@__PURE__*/definePreset<AnimationParams>('heartbeat', {
    delay: 0,
    duration: 1500,
    easing: EASING
}, heartbeatSteps);

export const blink = /*@__PURE__*/definePreset<BlinkParams>('blink', {
    delay: 0,
    duration: 800,
    easing: EASING,
    fromScale: .2,
    midScale: 1.2,
    toScale: 2.2
}, blinkSteps);

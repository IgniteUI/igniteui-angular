import { EaseOut } from '../easings';
import { AnimationParams, definePreset } from '../types';

export interface FadeParams extends AnimationParams {
    startOpacity: number;
    endOpacity: number;
}

const steps = (p: FadeParams): Keyframe[] => [
    { opacity: p.startOpacity },
    { opacity: p.endOpacity }
];

export const fadeIn = /*@__PURE__*/definePreset<FadeParams>('fadeIn', {
    delay: 0,
    duration: 350,
    easing: EaseOut.Sine,
    endOpacity: 1,
    startOpacity: 0
}, steps);

export const fadeOut = /*@__PURE__*/definePreset<FadeParams>('fadeOut', {
    delay: 0,
    duration: 350,
    easing: EaseOut.Sine,
    endOpacity: 0,
    startOpacity: 1
}, steps);

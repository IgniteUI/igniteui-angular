import { EaseOut } from '../easings';
import { AnimationParams, definePreset } from '../types';

/**
 * `'auto'` height is measured on the element when the animation is created.
 * An omitted padding is filled in by the browser from the computed style.
 */
export interface GrowParams extends AnimationParams {
    startOpacity: number;
    endOpacity: number;
    startHeight: string;
    endHeight: string;
    startPadding?: string;
    endPadding?: string;
}

const steps = (p: GrowParams): Keyframe[] => [
    { opacity: p.startOpacity, height: p.startHeight, paddingBlock: p.startPadding },
    { opacity: p.endOpacity, height: p.endHeight, paddingBlock: p.endPadding }
];

export const growVerIn = /*@__PURE__*/definePreset<GrowParams>('growVerIn', {
    delay: 0,
    duration: 350,
    easing: EaseOut.Quad,
    startOpacity: 0,
    endOpacity: 1,
    startHeight: '0px',
    endHeight: 'auto',
    startPadding: '0px'
}, steps);

export const growVerOut = /*@__PURE__*/definePreset<GrowParams>('growVerOut', {
    delay: 0,
    duration: 350,
    easing: EaseOut.Quad,
    startOpacity: 1,
    endOpacity: 0,
    startHeight: 'auto',
    endHeight: '0px',
    endPadding: '0px'
}, steps);

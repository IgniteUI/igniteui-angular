import { EaseIn, EaseOut } from '../easings';
import { AnimationParams, AnimationPreset, definePreset } from '../types';

export interface SwingParams extends AnimationParams {
    startOpacity: number;
    endOpacity: number;
    startAngle: number;
    endAngle: number;
    /** Rotation axis, `X` or `Y` */
    direction: string;
    /** transform-origin keywords */
    xPos: string;
    yPos: string;
}

const steps = (p: SwingParams): Keyframe[] => [
    {
        opacity: p.startOpacity,
        transform: `rotate${p.direction}(${p.startAngle}deg)`,
        transformOrigin: `${p.xPos} ${p.yPos}`
    },
    {
        opacity: p.endOpacity,
        transform: `rotate${p.direction}(${p.endAngle}deg)`,
        transformOrigin: `${p.xPos} ${p.yPos}`
    }
];

type Edge = 'top' | 'right' | 'bottom' | 'left';
type Hinge = Pick<SwingParams, 'direction' | 'xPos' | 'yPos'>;

// Rotation axis and transform origin for a swing hinged on an edge.
const HINGE: Record<Edge, Hinge> = {
    top: { direction: 'X', xPos: 'top', yPos: 'center' },
    right: { direction: 'Y', xPos: 'center', yPos: 'right' },
    bottom: { direction: 'X', xPos: 'bottom', yPos: 'center' },
    left: { direction: 'Y', xPos: 'center', yPos: 'left' }
};

const swingIn = (name: string, edge: Edge, duration: number, startAngle: number): AnimationPreset<SwingParams> =>
    definePreset<SwingParams>(name, {
        delay: 0,
        duration,
        easing: EaseOut.Back,
        startOpacity: 0,
        endOpacity: 1,
        startAngle,
        endAngle: 0,
        ...HINGE[edge]
    }, steps);

const swingOut = (name: string, edge: Edge, duration: number, endAngle: number): AnimationPreset<SwingParams> =>
    definePreset<SwingParams>(name, {
        delay: 0,
        duration,
        easing: EaseIn.Back,
        startOpacity: 1,
        endOpacity: 0,
        startAngle: 0,
        endAngle,
        ...HINGE[edge]
    }, steps);

const IN_FWD = 500;
const IN_BCK = 600;
const OUT_FWD = 550;
const OUT_BCK = 450;

export const swingInTopFwd = /*@__PURE__*/swingIn('swingInTopFwd', 'top', IN_FWD, -100);
export const swingInRightFwd = /*@__PURE__*/swingIn('swingInRightFwd', 'right', IN_FWD, -100);
export const swingInBottomFwd = /*@__PURE__*/swingIn('swingInBottomFwd', 'bottom', IN_FWD, 100);
export const swingInLeftFwd = /*@__PURE__*/swingIn('swingInLeftFwd', 'left', IN_FWD, 100);

export const swingInTopBck = /*@__PURE__*/swingIn('swingInTopBck', 'top', IN_BCK, 70);
export const swingInRightBck = /*@__PURE__*/swingIn('swingInRightBck', 'right', IN_BCK, 70);
export const swingInBottomBck = /*@__PURE__*/swingIn('swingInBottomBck', 'bottom', IN_BCK, -70);
export const swingInLeftBck = /*@__PURE__*/swingIn('swingInLeftBck', 'left', IN_BCK, -70);

export const swingOutTopFwd = /*@__PURE__*/swingOut('swingOutTopFwd', 'top', OUT_FWD, 70);
export const swingOutRightFwd = /*@__PURE__*/swingOut('swingOutRightFwd', 'right', OUT_FWD, 70);
export const swingOutBottomFwd = /*@__PURE__*/swingOut('swingOutBottomFwd', 'bottom', OUT_FWD, -70);
// Name keeps the historical typo, consumers look it up by it.
export const swingOutLefttFwd = /*@__PURE__*/swingOut('swingOutLefttFwd', 'left', OUT_FWD, -70);

export const swingOutTopBck = /*@__PURE__*/swingOut('swingOutTopBck', 'top', OUT_BCK, -100);
export const swingOutRightBck = /*@__PURE__*/swingOut('swingOutRightBck', 'right', OUT_BCK, -100);
export const swingOutBottomBck = /*@__PURE__*/swingOut('swingOutBottomBck', 'bottom', OUT_BCK, 100);
export const swingOutLeftBck = /*@__PURE__*/swingOut('swingOutLeftBck', 'left', OUT_BCK, 100);

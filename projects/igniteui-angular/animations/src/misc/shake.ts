import { EaseInOut } from '../easings';
import { AnimationParams, AnimationPreset, definePreset } from '../types';

export interface ShakeParams extends AnimationParams {
    startAngle: number;
    endAngle: number;
    /** CSS length, e.g. `10px` */
    startDistance: string;
    endDistance: string;
    /** Translate axis: `X` or `Y` */
    direction: string;
    /** transform-origin parts */
    xPos: string;
    yPos: string;
}

const steps = (p: ShakeParams): Keyframe[] => {
    const rest = `rotate(0deg) translate${p.direction}(0)`;
    const origin = `${p.xPos} ${p.yPos}`;

    // Alternating swings: rotate one way while translating the other.
    const fwd = (angle: number, distance: string): string =>
        `rotate(${angle}deg) translate${p.direction}(-${distance})`;
    const back = (angle: number, distance: string): string =>
        `rotate(-${angle}deg) translate${p.direction}(${distance})`;

    return [
        { offset: 0, transform: rest, transformOrigin: origin },
        { offset: 0.1, transform: fwd(p.endAngle, p.startDistance) },
        { offset: 0.2, transform: back(p.startAngle, p.startDistance) },
        { offset: 0.3, transform: fwd(p.startAngle, p.startDistance) },
        { offset: 0.4, transform: back(p.startAngle, p.startDistance) },
        { offset: 0.5, transform: fwd(p.startAngle, p.startDistance) },
        { offset: 0.6, transform: back(p.startAngle, p.startDistance) },
        { offset: 0.7, transform: fwd(p.startAngle, p.startDistance) },
        { offset: 0.8, transform: back(p.endAngle, p.endDistance) },
        { offset: 0.9, transform: fwd(p.endAngle, p.endDistance) },
        { offset: 1, transform: rest, transformOrigin: origin }
    ];
};

type ShakeShape = Omit<ShakeParams, keyof AnimationParams>;

const shake = (name: string, shape: ShakeShape): AnimationPreset<ShakeParams> =>
    definePreset<ShakeParams>(name, {
        delay: 0,
        duration: 800,
        easing: EaseInOut.Quad,
        ...shape
    }, steps);

// Translation only, no rotation.
const SLIDE = {
    endAngle: 0,
    endDistance: '8px',
    startAngle: 0,
    startDistance: '10px',
    xPos: 'center',
    yPos: 'center'
};

// Rotation around an anchor, no translation.
const TILT = {
    direction: 'Y',
    endAngle: 2,
    endDistance: '0',
    startAngle: 4,
    startDistance: '0'
};

export const shakeHor = /*@__PURE__*/shake('shakeHor', { ...SLIDE, direction: 'X' });
export const shakeVer = /*@__PURE__*/shake('shakeVer', { ...SLIDE, direction: 'Y' });

export const shakeTop = /*@__PURE__*/shake('shakeTop', { ...TILT, direction: 'X', xPos: 'center', yPos: 'top' });
export const shakeBottom = /*@__PURE__*/shake('shakeBottom', { ...TILT, xPos: 'center', yPos: 'bottom' });
export const shakeRight = /*@__PURE__*/shake('shakeRight', { ...TILT, xPos: 'right', yPos: 'center' });
export const shakeLeft = /*@__PURE__*/shake('shakeLeft', { ...TILT, xPos: 'left', yPos: 'center' });
export const shakeCenter = /*@__PURE__*/shake('shakeCenter', { ...TILT, endAngle: 8, startAngle: 10, xPos: 'center', yPos: 'center' });
export const shakeTr = /*@__PURE__*/shake('shakeTr', { ...TILT, xPos: 'right', yPos: 'top' });
export const shakeBr = /*@__PURE__*/shake('shakeBr', { ...TILT, xPos: 'right', yPos: 'bottom' });
export const shakeBl = /*@__PURE__*/shake('shakeBl', { ...TILT, xPos: 'left', yPos: 'bottom' });
export const shakeTl = /*@__PURE__*/shake('shakeTl', { ...TILT, xPos: 'left', yPos: 'top' });

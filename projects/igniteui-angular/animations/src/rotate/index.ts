import { EaseIn, EaseOut } from '../easings';
import { AnimationParams, AnimationPreset, definePreset } from '../types';

export interface RotateParams extends AnimationParams {
    startOpacity: number;
    endOpacity: number;
    /** Degrees */
    startAngle: number;
    endAngle: number;
    /** rotate3d axis vector */
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    /** CSS transform-origin, e.g. `center`, `left`, `50%` */
    xPos: string;
    yPos: string;
}

type Axis = [rotateX: number, rotateY: number, rotateZ: number];

const steps = (p: RotateParams): Keyframe[] => [
    {
        opacity: p.startOpacity,
        transform: `rotate3d(${p.rotateX},${p.rotateY},${p.rotateZ},${p.startAngle}deg)`,
        transformOrigin: `${p.xPos} ${p.yPos}`
    },
    {
        opacity: p.endOpacity,
        transform: `rotate3d(${p.rotateX},${p.rotateY},${p.rotateZ},${p.endAngle}deg)`,
        transformOrigin: `${p.xPos} ${p.yPos}`
    }
];

const Z_AXIS: Axis = [0, 0, 1];
const CENTER = 'center';

const rotateIn = (name: string, xPos: string, yPos: string, [rotateX, rotateY, rotateZ]: Axis = Z_AXIS): AnimationPreset<RotateParams> =>
    definePreset<RotateParams>(name, {
        delay: 0,
        duration: 600,
        easing: EaseOut.Quad,
        startOpacity: 0,
        endOpacity: 1,
        startAngle: -360,
        endAngle: 0,
        rotateX,
        rotateY,
        rotateZ,
        xPos,
        yPos
    }, steps);

const rotateOut = (name: string, xPos: string, yPos: string, [rotateX, rotateY, rotateZ]: Axis = Z_AXIS): AnimationPreset<RotateParams> =>
    definePreset<RotateParams>(name, {
        delay: 0,
        duration: 600,
        easing: EaseIn.Quad,
        startOpacity: 1,
        endOpacity: 0,
        startAngle: -360,
        endAngle: 0,
        rotateX,
        rotateY,
        rotateZ,
        xPos,
        yPos
    }, steps);

// Edge presets carry the edge in xPos.
export const rotateInCenter = /*@__PURE__*/rotateIn('rotateInCenter', CENTER, CENTER);
export const rotateOutCenter = /*@__PURE__*/rotateOut('rotateOutCenter', CENTER, CENTER);
export const rotateInTop = /*@__PURE__*/rotateIn('rotateInTop', 'top', CENTER);
export const rotateOutTop = /*@__PURE__*/rotateOut('rotateOutTop', 'top', CENTER);
export const rotateInRight = /*@__PURE__*/rotateIn('rotateInRight', 'right', CENTER);
export const rotateOutRight = /*@__PURE__*/rotateOut('rotateOutRight', 'right', CENTER);
export const rotateInBottom = /*@__PURE__*/rotateIn('rotateInBottom', 'bottom', CENTER);
export const rotateOutBottom = /*@__PURE__*/rotateOut('rotateOutBottom', 'bottom', CENTER);
export const rotateInLeft = /*@__PURE__*/rotateIn('rotateInLeft', 'left', CENTER);
export const rotateOutLeft = /*@__PURE__*/rotateOut('rotateOutLeft', 'left', CENTER);

export const rotateInTr = /*@__PURE__*/rotateIn('rotateInTr', 'right', 'top');
export const rotateOutTr = /*@__PURE__*/rotateOut('rotateOutTr', 'right', 'top');
export const rotateInBr = /*@__PURE__*/rotateIn('rotateInBr', 'right', 'bottom');
export const rotateOutBr = /*@__PURE__*/rotateOut('rotateOutBr', 'right', 'bottom');
export const rotateInBl = /*@__PURE__*/rotateIn('rotateInBl', 'left', 'bottom');
export const rotateOutBl = /*@__PURE__*/rotateOut('rotateOutBl', 'left', 'bottom');
export const rotateInTl = /*@__PURE__*/rotateIn('rotateInTl', 'left', 'top');
export const rotateOutTl = /*@__PURE__*/rotateOut('rotateOutTl', 'left', 'top');

export const rotateInDiagonal1 = /*@__PURE__*/rotateIn('rotateInDiagonal1', CENTER, CENTER, [1, 1, 0]);
export const rotateOutDiagonal1 = /*@__PURE__*/rotateOut('rotateOutDiagonal1', CENTER, CENTER, [1, 1, 0]);
export const rotateInDiagonal2 = /*@__PURE__*/rotateIn('rotateInDiagonal2', CENTER, CENTER, [-1, 1, 0]);
export const rotateOutDiagonal2 = /*@__PURE__*/rotateOut('rotateOutDiagonal2', CENTER, CENTER, [-1, 1, 0]);
export const rotateInHor = /*@__PURE__*/rotateIn('rotateInHor', CENTER, CENTER, [0, 1, 0]);
export const rotateOutHor = /*@__PURE__*/rotateOut('rotateOutHor', CENTER, CENTER, [0, 1, 0]);
export const rotateInVer = /*@__PURE__*/rotateIn('rotateInVer', CENTER, CENTER, [1, 0, 0]);
export const rotateOutVer = /*@__PURE__*/rotateOut('rotateOutVer', CENTER, CENTER, [1, 0, 0]);

import { EaseOut } from '../easings';
import { AnimationParams, AnimationPreset, definePreset } from '../types';

export type ScaleDirection = '' | 'X' | 'Y';

export interface ScaleParams extends AnimationParams {
    startOpacity: number;
    endOpacity: number;
    fromScale: number;
    toScale: number;
    /** Suffix of the scale function: `scale`, `scaleX`, `scaleY` */
    direction: ScaleDirection;
    /** CSS transform-origin, e.g. `50%`, `0`, `100%` */
    xPos: string;
    yPos: string;
}

const steps = (p: ScaleParams): Keyframe[] => [
    {
        opacity: p.startOpacity,
        transform: `scale${p.direction}(${p.fromScale})`,
        transformOrigin: `${p.xPos} ${p.yPos}`
    },
    {
        opacity: p.endOpacity,
        transform: `scale${p.direction}(${p.toScale})`,
        transformOrigin: `${p.xPos} ${p.yPos}`
    }
];

// Single-axis presets collapse further than uniform ones.
const IN_FROM = { uniform: .5, axis: .4 };
const OUT_TO = { uniform: .5, axis: .3 };

const scaleIn = (name: string, xPos: string, yPos: string, direction: ScaleDirection = ''): AnimationPreset<ScaleParams> =>
    definePreset<ScaleParams>(name, {
        delay: 0,
        duration: 350,
        easing: EaseOut.Quad,
        startOpacity: 0,
        endOpacity: 1,
        fromScale: direction ? IN_FROM.axis : IN_FROM.uniform,
        toScale: 1,
        direction,
        xPos,
        yPos
    }, steps);

const scaleOut = (name: string, xPos: string, yPos: string, direction: ScaleDirection = ''): AnimationPreset<ScaleParams> =>
    definePreset<ScaleParams>(name, {
        delay: 0,
        duration: 350,
        easing: EaseOut.Sine,
        startOpacity: 1,
        endOpacity: 0,
        fromScale: 1,
        toScale: direction ? OUT_TO.axis : OUT_TO.uniform,
        direction,
        xPos,
        yPos
    }, steps);

const START = '0';
const MID = '50%';
const END = '100%';

export const scaleInCenter = /*@__PURE__*/scaleIn('scaleInCenter', MID, MID);
export const scaleInBl = /*@__PURE__*/scaleIn('scaleInBl', START, END);
export const scaleInVerCenter = /*@__PURE__*/scaleIn('scaleInVerCenter', MID, MID, 'Y');
export const scaleInTop = /*@__PURE__*/scaleIn('scaleInTop', MID, START);
export const scaleInLeft = /*@__PURE__*/scaleIn('scaleInLeft', START, MID);
export const scaleInVerTop = /*@__PURE__*/scaleIn('scaleInVerTop', END, START, 'Y');
export const scaleInTr = /*@__PURE__*/scaleIn('scaleInTr', END, START);
export const scaleInTl = /*@__PURE__*/scaleIn('scaleInTl', START, START);
export const scaleInVerBottom = /*@__PURE__*/scaleIn('scaleInVerBottom', START, END, 'Y');
export const scaleInRight = /*@__PURE__*/scaleIn('scaleInRight', END, MID);
export const scaleInHorCenter = /*@__PURE__*/scaleIn('scaleInHorCenter', MID, MID, 'X');
export const scaleInBr = /*@__PURE__*/scaleIn('scaleInBr', END, END);
export const scaleInHorLeft = /*@__PURE__*/scaleIn('scaleInHorLeft', START, START, 'X');
export const scaleInBottom = /*@__PURE__*/scaleIn('scaleInBottom', MID, END);
export const scaleInHorRight = /*@__PURE__*/scaleIn('scaleInHorRight', END, END, 'X');

export const scaleOutCenter = /*@__PURE__*/scaleOut('scaleOutCenter', MID, MID);
export const scaleOutBl = /*@__PURE__*/scaleOut('scaleOutBl', START, END);
export const scaleOutBr = /*@__PURE__*/scaleOut('scaleOutBr', END, END);
export const scaleOutVerCenter = /*@__PURE__*/scaleOut('scaleOutVerCenter', MID, MID, 'Y');
export const scaleOutVerTop = /*@__PURE__*/scaleOut('scaleOutVerTop', END, START, 'Y');
export const scaleOutVerBottom = /*@__PURE__*/scaleOut('scaleOutVerBottom', START, END, 'Y');
export const scaleOutTop = /*@__PURE__*/scaleOut('scaleOutTop', MID, START);
export const scaleOutLeft = /*@__PURE__*/scaleOut('scaleOutLeft', START, MID);
export const scaleOutTr = /*@__PURE__*/scaleOut('scaleOutTr', END, START);
export const scaleOutTl = /*@__PURE__*/scaleOut('scaleOutTl', START, START);
export const scaleOutRight = /*@__PURE__*/scaleOut('scaleOutRight', END, MID);
export const scaleOutBottom = /*@__PURE__*/scaleOut('scaleOutBottom', MID, END);
export const scaleOutHorCenter = /*@__PURE__*/scaleOut('scaleOutHorCenter', MID, MID, 'X');
export const scaleOutHorLeft = /*@__PURE__*/scaleOut('scaleOutHorLeft', START, START, 'X');
export const scaleOutHorRight = /*@__PURE__*/scaleOut('scaleOutHorRight', END, END, 'X');

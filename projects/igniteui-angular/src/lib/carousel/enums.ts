import { mkenum } from '../core/utils';

export const HorizontalAnimationType = /*@__PURE__*/mkenum({
    none: 'none',
    slide: 'slide',
    fade: 'fade'
});
export type HorizontalAnimationType = (typeof HorizontalAnimationType)[keyof typeof HorizontalAnimationType];

export const CarouselIndicatorsOrientation = /*@__PURE__*/mkenum({
    bottom: 'bottom',
    top: 'top'
});
export type CarouselIndicatorsOrientation = (typeof CarouselIndicatorsOrientation)[keyof typeof CarouselIndicatorsOrientation];

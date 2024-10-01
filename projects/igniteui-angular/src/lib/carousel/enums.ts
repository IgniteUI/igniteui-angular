import { mkenum } from '../core/utils';

export const CarouselAnimationType = /*@__PURE__*/mkenum({
    none: 'none',
    slide: 'slide',
    fade: 'fade'
});
export type CarouselAnimationType = (typeof CarouselAnimationType)[keyof typeof CarouselAnimationType];

export const CarouselIndicatorsOrientation = /*@__PURE__*/mkenum({
    bottom: 'bottom',
    top: 'top'
});
export type CarouselIndicatorsOrientation = (typeof CarouselIndicatorsOrientation)[keyof typeof CarouselIndicatorsOrientation];

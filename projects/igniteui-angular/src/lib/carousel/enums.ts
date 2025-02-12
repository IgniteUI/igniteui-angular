import { mkenum } from '../core/utils';

export const CarouselAnimationType = /*@__PURE__*/mkenum({
    none: 'none',
    slide: 'slide',
    fade: 'fade'
});
export type CarouselAnimationType = (typeof CarouselAnimationType)[keyof typeof CarouselAnimationType];

export const CarouselIndicatorsOrientation = /*@__PURE__*/mkenum({
    /**
     * @deprecated in version 19.1.0. Use `end` instead.
     */
    bottom: 'bottom',
    /**
     * @deprecated in version 19.1.0. Use `start` instead.
     */
    top: 'top',
    start: 'start',
    end: 'end'
});
export type CarouselIndicatorsOrientation = (typeof CarouselIndicatorsOrientation)[keyof typeof CarouselIndicatorsOrientation];

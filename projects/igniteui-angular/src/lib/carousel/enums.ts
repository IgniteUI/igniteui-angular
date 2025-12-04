
export const CarouselAnimationType = {
    none: 'none',
    slide: 'slide',
    fade: 'fade'
} as const;
export type CarouselAnimationType = (typeof CarouselAnimationType)[keyof typeof CarouselAnimationType];

export const CarouselIndicatorsOrientation = {
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
} as const;
export type CarouselIndicatorsOrientation = (typeof CarouselIndicatorsOrientation)[keyof typeof CarouselIndicatorsOrientation];


export const CarouselAnimationType = {
    none: 'none',
    slide: 'slide',
    fade: 'fade'
} as const;
export type CarouselAnimationType = (typeof CarouselAnimationType)[keyof typeof CarouselAnimationType];

export const CarouselIndicatorsOrientation = {
    start: 'start',
    end: 'end'
} as const;
export type CarouselIndicatorsOrientation = (typeof CarouselIndicatorsOrientation)[keyof typeof CarouselIndicatorsOrientation];

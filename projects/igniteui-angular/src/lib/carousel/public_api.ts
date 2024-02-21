import { IgxCarouselComponent } from './carousel.component';
import { IgxCarouselIndicatorDirective, IgxCarouselNextButtonDirective, IgxCarouselPrevButtonDirective } from './carousel.directives';
import { IgxSlideComponent } from './slide.component';

export { Direction, CarouselAnimationSettings } from './carousel-base';
export * from './carousel.component';
export * from './slide.component';
export * from './carousel.directives';
export { CarouselIndicatorsOrientation, HorizontalAnimationType } from './token';

/* NOTE: Carousel directives collection for ease-of-use import in standalone components scenario */
export const IGX_CAROUSEL_DIRECTIVES = [
    IgxCarouselComponent,
    IgxSlideComponent,
    IgxCarouselIndicatorDirective,
    IgxCarouselNextButtonDirective,
    IgxCarouselPrevButtonDirective
] as const;

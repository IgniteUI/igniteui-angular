import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Bulgarian resource strings for IgxCarousel
 */
export const CarouselResourceStringsBG = {
    igx_carousel_of: 'от',
    igx_carousel_slide: 'слайд',
    igx_carousel_previous_slide: 'предишен слайд',
    igx_carousel_next_slide: 'следващ слайд'
} satisfies MakeRequired<ICarouselResourceStrings>;

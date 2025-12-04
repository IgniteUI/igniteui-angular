import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Spanish resource strings for IgxCarousel
 */
export const CarouselResourceStringsES = {
    igx_carousel_of: 'de',
    igx_carousel_slide: 'diapositiva',
    igx_carousel_previous_slide: 'diapositiva anterior',
    igx_carousel_next_slide: 'diapositiva siguiente'
} satisfies MakeRequired<ICarouselResourceStrings>;

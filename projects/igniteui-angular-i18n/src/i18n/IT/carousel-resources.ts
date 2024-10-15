import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Italian resource strings for IgxCarousel
 */
export const CarouselResourceStringsIT = {
    igx_carousel_of: 'di',
    igx_carousel_slide: 'diapositiva',
    igx_carousel_previous_slide: 'diapositiva precedente',
    igx_carousel_next_slide: 'diapositiva successiva'
} satisfies MakeRequired<ICarouselResourceStrings>;

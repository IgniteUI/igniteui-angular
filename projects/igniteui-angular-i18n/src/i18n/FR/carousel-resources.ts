import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * French resource strings for IgxCarousel
 */
export const CarouselResourceStringsFR = {
    igx_carousel_of: 'de',
    igx_carousel_slide: 'diapositive',
    igx_carousel_previous_slide: 'diapositive précédente',
    igx_carousel_next_slide: 'diapositive suivante'
} satisfies MakeRequired<ICarouselResourceStrings>;

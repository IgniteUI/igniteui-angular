import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * German resource strings for IgxCarousel
 */
export const CarouselResourceStringsDE = {
    igx_carousel_of: 'von',
    igx_carousel_slide: 'Folie',
    igx_carousel_previous_slide: 'Vorherige Folie',
    igx_carousel_next_slide: 'Nächste Folie'
} satisfies MakeRequired<ICarouselResourceStrings>;

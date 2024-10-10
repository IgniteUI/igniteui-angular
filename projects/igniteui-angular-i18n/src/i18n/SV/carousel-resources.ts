import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Swedish resource strings for IgxCarousel
 */
export const CarouselResourceStringsSV = {
    igx_carousel_of: 'av',
    igx_carousel_slide: 'bild',
    igx_carousel_previous_slide: 'föregående bild',
    igx_carousel_next_slide: 'nästa bild'
} satisfies MakeRequired<ICarouselResourceStrings>;

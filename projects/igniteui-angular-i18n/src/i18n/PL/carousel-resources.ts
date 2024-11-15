import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Polish resource strings for IgxCarousel
 */
export const CarouselResourceStringsPL = {
    igx_carousel_of: 'z',
    igx_carousel_slide: 'slajd',
    igx_carousel_previous_slide: 'poprzedni slajd',
    igx_carousel_next_slide: 'następny slajd'
} satisfies MakeRequired<ICarouselResourceStrings>;

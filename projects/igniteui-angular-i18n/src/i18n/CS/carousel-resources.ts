import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Czech resource strings for IgxCarousel
 */
export const CarouselResourceStringsCS = {
    igx_carousel_of: 'z',
    igx_carousel_slide: 'skluzavka',
    igx_carousel_previous_slide: 'předchozí snímek',
    igx_carousel_next_slide: 'další snímek'
} satisfies MakeRequired<ICarouselResourceStrings>;

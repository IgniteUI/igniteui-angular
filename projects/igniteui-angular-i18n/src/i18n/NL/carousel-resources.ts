import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Dutch resource strings for IgxCarousel
 */
export const CarouselResourceStringsNL = {
    igx_carousel_of: 'van',
    igx_carousel_slide: 'dia',
    igx_carousel_previous_slide: 'vorige dia',
    igx_carousel_next_slide: 'volgende dia'
} satisfies MakeRequired<ICarouselResourceStrings>;

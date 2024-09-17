import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Norwegian resource strings for IgxCarousel
 */
export const CarouselResourceStringsNB = {
    igx_carousel_of: 'av',
    igx_carousel_slide: 'lysbilde',
    igx_carousel_previous_slide: 'forrige lysbilde',
    igx_carousel_next_slide: 'neste lysbilde'
} satisfies MakeRequired<ICarouselResourceStrings>;

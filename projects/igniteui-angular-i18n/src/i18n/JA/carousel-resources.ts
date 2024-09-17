import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Japanese resource strings for IgxCarousel
 */
export const CarouselResourceStringsJA = {
    igx_carousel_of: '/',
    igx_carousel_slide: 'スライド',
    igx_carousel_previous_slide: '前のスライド',
    igx_carousel_next_slide: '次のスライド'
} satisfies MakeRequired<ICarouselResourceStrings>;

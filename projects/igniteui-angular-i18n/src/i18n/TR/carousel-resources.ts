import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Turkish resource strings for IgxCarousel
 */
export const CarouselResourceStringsTR = {
    igx_carousel_of: '/',
    igx_carousel_slide: 'slayt',
    igx_carousel_previous_slide: 'önceki slayt',
    igx_carousel_next_slide: 'sonraki slayt'
} satisfies MakeRequired<ICarouselResourceStrings>;

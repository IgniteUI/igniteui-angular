import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Hungarian resource strings for IgxCarousel
 */
export const CarouselResourceStringsHU = {
    igx_carousel_of: '/',
    igx_carousel_slide: 'dia',
    igx_carousel_previous_slide: 'előző dia',
    igx_carousel_next_slide: 'következő dia'
} satisfies MakeRequired<ICarouselResourceStrings>;

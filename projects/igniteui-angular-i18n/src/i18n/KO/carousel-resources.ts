import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Korean resource strings for IgxCarousel
 */
export const CarouselResourceStringsKO = {
    igx_carousel_of: '의',
    igx_carousel_slide: '슬라이드',
    igx_carousel_previous_slide: '이전 슬라이드',
    igx_carousel_next_slide: '다음 슬라이드'
} satisfies MakeRequired<ICarouselResourceStrings>;

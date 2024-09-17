import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Traditional Chinese (zh-Hant) resource strings for IgxCarousel
 */
export const CarouselResourceStringsZHHANT = {
    igx_carousel_of: '的',
    igx_carousel_slide: '投影片',
    igx_carousel_previous_slide: '上一張投影片',
    igx_carousel_next_slide: '下一張投影片'
} satisfies MakeRequired<ICarouselResourceStrings>;

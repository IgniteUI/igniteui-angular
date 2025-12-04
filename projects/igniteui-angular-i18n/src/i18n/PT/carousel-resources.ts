import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Portuguese resource strings for IgxCarousel
 */
export const CarouselResourceStringsPT = {
    igx_carousel_of: 'de',
    igx_carousel_slide: 'deslizar',
    igx_carousel_previous_slide: 'diapositivo anterior',
    igx_carousel_next_slide: 'próximo diapositivo'
} satisfies MakeRequired<ICarouselResourceStrings>;

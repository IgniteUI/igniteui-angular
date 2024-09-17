import { ICarouselResourceStrings } from 'igniteui-angular';

// only use `satisfies` operator so export is typed by its schema
/**
 * Romanian resource strings for IgxCarousel
 */
export const CarouselResourceStringsRO = {
    igx_carousel_of: 'din',
    igx_carousel_slide: 'alunecare',
    igx_carousel_previous_slide: 'diapozitivul anterior',
    igx_carousel_next_slide: 'următorul diapozitiv'
} satisfies MakeRequired<ICarouselResourceStrings>;

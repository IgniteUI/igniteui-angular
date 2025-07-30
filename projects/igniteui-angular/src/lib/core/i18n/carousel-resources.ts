import { CarouselResourceStringsEN as ACarouselResourceStrings } from 'igniteui-i18n-core';
import { convertToIgxResource } from './resources';

export interface ICarouselResourceStrings {
    igx_carousel_of?: string;
    igx_carousel_slide?: string;
    igx_carousel_previous_slide?: string;
    igx_carousel_next_slide?: string;
}

export const CarouselResourceStringsEN: ICarouselResourceStrings = convertToIgxResource(ACarouselResourceStrings);

import {
    type ICarouselResourceStrings as IACarouselResourceStrings,
    CarouselResourceStringsEN as ACarouselResourceStrings,
    type PrefixedResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type ICarouselResourceStrings = PrefixedResourceStrings<IACarouselResourceStrings, typeof IGX_PREFIX>;

export const CarouselResourceStringsEN: ICarouselResourceStrings = prefixResource(IGX_PREFIX, ACarouselResourceStrings);

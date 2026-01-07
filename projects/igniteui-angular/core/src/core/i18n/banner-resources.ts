import {
    type IBannerResourceStrings as IABannerResourceStrings,
    type PrefixedResourceStrings,
    BannerResourceStringsEN as ABannerResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type IBannerResourceStrings = PrefixedResourceStrings<IABannerResourceStrings, typeof IGX_PREFIX>;

export const BannerResourceStringsEN: IBannerResourceStrings = prefixResource(IGX_PREFIX, ABannerResourceStrings);

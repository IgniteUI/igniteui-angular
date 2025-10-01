import {
    type IGridResourceStrings as IAGridResourceStrings,
    type PrefixedResourceStrings,
    GridResourceStringsEN as AGridResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type IGridResourceStrings = PrefixedResourceStrings<IAGridResourceStrings, typeof IGX_PREFIX>;

export const GridResourceStringsEN: IGridResourceStrings = prefixResource(IGX_PREFIX, AGridResourceStrings);

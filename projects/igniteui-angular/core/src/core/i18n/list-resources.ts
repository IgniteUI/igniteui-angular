import {
    type IListResourceStrings as IAListResourceStrings,
    type PrefixedResourceStrings,
    ListResourceStringsEN as AListResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type IListResourceStrings = PrefixedResourceStrings<IAListResourceStrings, typeof IGX_PREFIX>;

export const ListResourceStringsEN: IListResourceStrings = prefixResource(IGX_PREFIX, AListResourceStrings);

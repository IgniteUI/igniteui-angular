import {
    type IPaginatorResourceStrings as IAPaginatorResourceStrings,
    type PrefixedResourceStrings,
    IGX_PREFIX,
    PaginatorResourceStringsEN as APaginatorResourceStrings,
    prefixResource
} from 'igniteui-i18n-core';

export type IPaginatorResourceStrings = PrefixedResourceStrings<IAPaginatorResourceStrings, typeof IGX_PREFIX>;

export const PaginatorResourceStringsEN: IPaginatorResourceStrings = prefixResource(IGX_PREFIX, APaginatorResourceStrings);

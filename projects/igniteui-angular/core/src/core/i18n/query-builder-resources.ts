import {
    type IQueryBuilderResourceStrings as IAQueryBuilderResourceStrings,
    type PrefixedResourceStrings,
    IGX_PREFIX,
    QueryBuilderResourceStringsEN as AQueryBuilderResourceStrings,
    prefixResource
} from 'igniteui-i18n-core';

export type IQueryBuilderResourceStrings = PrefixedResourceStrings<IAQueryBuilderResourceStrings, typeof IGX_PREFIX>;

export const QueryBuilderResourceStringsEN: IQueryBuilderResourceStrings = prefixResource(IGX_PREFIX, AQueryBuilderResourceStrings);

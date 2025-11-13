import {
    type IDateRangePickerResourceStrings as IADateRangePickerResourceStrings,
    type PrefixedResourceStrings,
    DateRangePickerResourceStringsEN as ADateRangePickerResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type IDateRangePickerResourceStrings = PrefixedResourceStrings<IADateRangePickerResourceStrings, typeof IGX_PREFIX>;

export const DateRangePickerResourceStringsEN: IDateRangePickerResourceStrings = prefixResource(IGX_PREFIX, ADateRangePickerResourceStrings);

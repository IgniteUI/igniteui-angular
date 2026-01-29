import {
    type IDatePickerResourceStrings as IADatePickerResourceStrings,
    type PrefixedResourceStrings,
    DatePickerResourceStringsEN as ADatePickerResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type IDatePickerResourceStrings = PrefixedResourceStrings<IADatePickerResourceStrings, typeof IGX_PREFIX>;

export const DatePickerResourceStringsEN: IDatePickerResourceStrings = prefixResource(IGX_PREFIX, ADatePickerResourceStrings);

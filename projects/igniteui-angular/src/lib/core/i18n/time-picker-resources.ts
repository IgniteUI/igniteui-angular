import {
    type ITimePickerResourceStrings as IATimePickerResourceStrings,
    type PrefixedResourceStrings,
    IGX_PREFIX,
    TimePickerResourceStringsEN as ATimePickerResourceStrings,
    prefixResource
} from 'igniteui-i18n-core';

export type ITimePickerResourceStrings = PrefixedResourceStrings<IATimePickerResourceStrings, typeof IGX_PREFIX>;

export const TimePickerResourceStringsEN: ITimePickerResourceStrings = prefixResource(IGX_PREFIX, ATimePickerResourceStrings);

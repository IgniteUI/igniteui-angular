import {
    type ICalendarResourceStrings as IACalendarResourceStrings,
    CalendarResourceStringsEN as ACalendarResourceStrings,
    type PrefixedResourceStrings,
    IGX_PREFIX,
    prefixResource
} from 'igniteui-i18n-core';

export type ICalendarResourceStrings = PrefixedResourceStrings<IACalendarResourceStrings, typeof IGX_PREFIX>;

export const CalendarResourceStringsEN: ICalendarResourceStrings = prefixResource(IGX_PREFIX, ACalendarResourceStrings);

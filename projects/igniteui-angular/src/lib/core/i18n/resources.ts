import { IGridResourceStrings, GridResourcesStringsEN } from './grid-resources';
import { ITimePickerResourceStrings, TimePickerResourcesStringsEN } from './time-picker-resources';
import { ICalendarResourceStrings, CalendarResourcesStringsEN } from './calendar-resources';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings, ICalendarResourceStrings {}


export const DefaultResourceStrings = {
    strings: Object.assign({}, GridResourcesStringsEN, TimePickerResourcesStringsEN, CalendarResourcesStringsEN)
};

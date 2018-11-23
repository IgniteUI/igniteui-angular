import { IGridResourceStrings, GridResourceStringsEN } from './grid-resources';
import { ITimePickerResourceStrings, TimePickerResourceStringsEN } from './time-picker-resources';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings {}


const CurrentResourceStrings = {
    ...GridResourceStringsEN,
    ...TimePickerResourceStringsEN
};

export function Changei18n(resourceStrings: IResourceStrings) {
    Object.assign(CurrentResourceStrings, resourceStrings);
}
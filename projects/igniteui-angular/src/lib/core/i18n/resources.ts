import { IGridResourceStrings, GridResourceStringsEN } from './grid-resources';
import { ITimePickerResourceStrings, TimePickerResourceStringsEN } from './time-picker-resources';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings {}


export const CurrentResourceStrings = {
    ...GridResourceStringsEN,
    ...TimePickerResourceStringsEN
};

/**
 * Changes the resource strings for all components in the application
 * ```
 * @param resourceStrings to be applied
 */
export function Changei18n(resourceStrings: IResourceStrings) {
    Object.assign(CurrentResourceStrings, resourceStrings);
}

import { IGridResourceStrings, GridResourceStringsEN } from './grid-resources';
import { ITimePickerResourceStrings, TimePickerResourceStringsEN } from './time-picker-resources';
import { cloneValue } from '../utils';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings {}

/**
 * @hidden
 */
export const CurrentResourceStrings = {
    GridResStrings: cloneValue(GridResourceStringsEN),
    TimePickerResStrings: cloneValue(TimePickerResourceStringsEN)
};

function updateResourceStrings(currentStrings: IResourceStrings, newStrings: IResourceStrings ) {
    for (const key of Object.keys(newStrings)) {
        if (key in currentStrings) {
            currentStrings[key] = newStrings[key];
        }
    }
}

/**
 * Changes the resource strings for all components in the application
 * ```
 * @param resourceStrings to be applied
 */
export function changei18n(resourceStrings: IResourceStrings) {
    for (const key of Object.keys(CurrentResourceStrings)) {
        updateResourceStrings(CurrentResourceStrings[key], resourceStrings);
    }
}

/**
 * Returns current resource strings for all components
 */
export function getCurrentResourceStrings(): IResourceStrings {
    return {
            ...CurrentResourceStrings.GridResStrings,
            ...CurrentResourceStrings.TimePickerResStrings
    };
}

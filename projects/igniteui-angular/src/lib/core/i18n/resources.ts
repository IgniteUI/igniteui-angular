import { IGridResourceStrings, GridResourceStringsEN } from './grid-resources';
import { ITimePickerResourceStrings, TimePickerResourceStringsEN } from './time-picker-resources';
import { cloneValue } from '../utils';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings {}

/**
 * @hidden
 */
export const CurrentResourceStrings = {
    GridResStrings: cloneValue(GridResourceStringsEN),
    TimePickerResStrings: cloneValue(GridResourceStringsEN)
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
export function Changei18n(resourceStrings: IResourceStrings) {
    for (const key of Object.keys(CurrentResourceStrings)) {
        updateResourceStrings(CurrentResourceStrings[key], resourceStrings);
    }
}

export function getCurrentResourceStrings() {
    return {
            ...CurrentResourceStrings.GridResStrings,
            ...CurrentResourceStrings.TimePickerResStrings
    };
}
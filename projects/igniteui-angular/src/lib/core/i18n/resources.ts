import { DateRangePickerResourceStringsEN, IDateRangePickerResourceStrings } from './date-range-picker-resources';
import { IGridResourceStrings, GridResourceStringsEN } from './grid-resources';
import { ITimePickerResourceStrings, TimePickerResourceStringsEN } from './time-picker-resources';
import { IPaginatorResourceStrings, PaginatorResourceStringsEN } from './paginator-resources';
import { cloneValue } from '../utils';
import { ICarouselResourceStrings, CarouselResourceStringsEN } from './carousel-resources';
import { IListResourceStrings, ListResourceStringsEN } from './list-resources';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings, ICarouselResourceStrings,
    IDateRangePickerResourceStrings, IListResourceStrings, IPaginatorResourceStrings { }

/**
 * @hidden
 */
export const CurrentResourceStrings = {
    GridResStrings: cloneValue(GridResourceStringsEN),
    PaginatorResStrings: cloneValue(PaginatorResourceStringsEN),
    TimePickerResStrings: cloneValue(TimePickerResourceStringsEN),
    DateRangePickerResStrings: cloneValue(DateRangePickerResourceStringsEN),
    CarouselResStrings: cloneValue(CarouselResourceStringsEN),
    ListResStrings: cloneValue(ListResourceStringsEN),
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
        ...CurrentResourceStrings.CarouselResStrings,
        ...CurrentResourceStrings.DateRangePickerResStrings,
        ...CurrentResourceStrings.GridResStrings,
        ...CurrentResourceStrings.ListResStrings,
        ...CurrentResourceStrings.PaginatorResStrings,
        ...CurrentResourceStrings.TimePickerResStrings
    };
}

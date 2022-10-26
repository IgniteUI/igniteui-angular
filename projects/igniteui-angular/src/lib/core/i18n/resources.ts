import { DatePickerResourceStringsEN, IDatePickerResourceStrings } from './date-picker-resources';
import { DateRangePickerResourceStringsEN, IDateRangePickerResourceStrings } from './date-range-picker-resources';
import { IGridResourceStrings, GridResourceStringsEN } from './grid-resources';
import { ITimePickerResourceStrings, TimePickerResourceStringsEN } from './time-picker-resources';
import { IPaginatorResourceStrings, PaginatorResourceStringsEN } from './paginator-resources';
import { cloneValue } from '../utils';
import { ICarouselResourceStrings, CarouselResourceStringsEN } from './carousel-resources';
import { IChipResourceStrings, ChipResourceStringsEN } from './chip-resources';
import { IListResourceStrings, ListResourceStringsEN } from './list-resources';
import { CalendarResourceStringsEN, ICalendarResourceStrings } from './calendar-resources';
import { IInputResourceStrings, InputResourceStringsEN } from './input-resources';
import { ITreeResourceStrings, TreeResourceStringsEN } from './tree-resources';
import { IActionStripResourceStrings, ActionStripResourceStringsEN } from './action-strip-resources';
import { IQueryBuilderResourceStrings, QueryBuilderResourceStringsEN } from './query-builder-resources';
import { ComboResourceStringsEN, IComboResourceStrings } from './combo-resources';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings, ICalendarResourceStrings,
    ICarouselResourceStrings, IChipResourceStrings, IComboResourceStrings, IInputResourceStrings, IDatePickerResourceStrings,
    IDateRangePickerResourceStrings, IListResourceStrings, IPaginatorResourceStrings, ITreeResourceStrings,
    IActionStripResourceStrings, IQueryBuilderResourceStrings { }

/**
 * @hidden
 * IF YOU EDIT THIS OBJECT, DO NOT FORGET TO UPDATE
 * projects/igniteui-angular-i18n as well (create the appropriately named files,
 * containing the new/updated component string keys and EN strings for values + create a separate issue + pending-localization label)
 *
 * TODO Add automation tests:
 * 1) each of the folders/languages under \projects\igniteui-angular-i18n\src\ contain resources.ts file with matching components count.
 *    \projects\igniteui-angular-i18n\src\BG\resources.ts contains IgxResourceStringsBG.count matching this.CurrentResourceStrings.count
 * 2) \igniteui-angular\projects\igniteui-angular\src\public_api.ts --> Check if the new interface is added
 *    to IInputResourceStrings (just a proxy as it is later on imported in the angular-i18n package)
 */
export const CurrentResourceStrings = {
    GridResStrings: cloneValue(GridResourceStringsEN),
    PaginatorResStrings: cloneValue(PaginatorResourceStringsEN),
    TimePickerResStrings: cloneValue(TimePickerResourceStringsEN),
    CalendarResStrings: cloneValue(CalendarResourceStringsEN),
    ChipResStrings: cloneValue(ChipResourceStringsEN),
    ComboResStrings: cloneValue(ComboResourceStringsEN),
    DatePickerResourceStrings: cloneValue(DatePickerResourceStringsEN),
    DateRangePickerResStrings: cloneValue(DateRangePickerResourceStringsEN),
    CarouselResStrings: cloneValue(CarouselResourceStringsEN),
    ListResStrings: cloneValue(ListResourceStringsEN),
    InputResStrings: cloneValue(InputResourceStringsEN),
    TreeResStrings: cloneValue(TreeResourceStringsEN),
    ActionStripResourceStrings: cloneValue(ActionStripResourceStringsEN),
    QueryBuilderResStrings: cloneValue(QueryBuilderResourceStringsEN)
};

const updateResourceStrings = (currentStrings: IResourceStrings, newStrings: IResourceStrings) => {
    for (const key of Object.keys(newStrings)) {
        if (key in currentStrings) {
            currentStrings[key] = newStrings[key];
        }
    }
};

/**
 * Changes the resource strings for all components in the application
 * ```
 * @param resourceStrings to be applied
 */
export const changei18n = (resourceStrings: IResourceStrings) => {
    for (const key of Object.keys(CurrentResourceStrings)) {
        updateResourceStrings(CurrentResourceStrings[key], resourceStrings);
    }
};

/**
 * Returns current resource strings for all components
 */
export const getCurrentResourceStrings = (): IResourceStrings => ({
    ...CurrentResourceStrings.CalendarResStrings,
    ...CurrentResourceStrings.CarouselResStrings,
    ...CurrentResourceStrings.ChipResStrings,
    ...CurrentResourceStrings.ComboResStrings,
    ...CurrentResourceStrings.DatePickerResourceStrings,
    ...CurrentResourceStrings.DateRangePickerResStrings,
    ...CurrentResourceStrings.GridResStrings,
    ...CurrentResourceStrings.InputResStrings,
    ...CurrentResourceStrings.ListResStrings,
    ...CurrentResourceStrings.PaginatorResStrings,
    ...CurrentResourceStrings.TimePickerResStrings,
    ...CurrentResourceStrings.TreeResStrings,
    ...CurrentResourceStrings.ActionStripResourceStrings,
    ...CurrentResourceStrings.QueryBuilderResStrings
});

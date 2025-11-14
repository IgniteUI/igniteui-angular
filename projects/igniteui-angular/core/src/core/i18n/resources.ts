import { IDatePickerResourceStrings } from './date-picker-resources';
import { IDateRangePickerResourceStrings } from './date-range-picker-resources';
import { IGridResourceStrings } from './grid-resources';
import { ITimePickerResourceStrings } from './time-picker-resources';
import { IPaginatorResourceStrings } from './paginator-resources';
import { ICarouselResourceStrings } from './carousel-resources';
import { IChipResourceStrings } from './chip-resources';
import { IListResourceStrings } from './list-resources';
import { ICalendarResourceStrings } from './calendar-resources';
import { IInputResourceStrings } from './input-resources';
import { ITreeResourceStrings } from './tree-resources';
import { IActionStripResourceStrings } from './action-strip-resources';
import { IQueryBuilderResourceStrings } from './query-builder-resources';
import { IComboResourceStrings } from './combo-resources';
import { IBannerResourceStrings } from './banner-resources';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings, ICalendarResourceStrings,
    ICarouselResourceStrings, IChipResourceStrings, IComboResourceStrings, IInputResourceStrings, IDatePickerResourceStrings,
    IDateRangePickerResourceStrings, IListResourceStrings, IPaginatorResourceStrings, ITreeResourceStrings,
    IActionStripResourceStrings, IQueryBuilderResourceStrings, IBannerResourceStrings { }

export class igxI18N {
    private static _instance: igxI18N;

    private _currentResourceStrings: IResourceStrings = { };

    private constructor() { }

    public static instance() {
        return this._instance || (this._instance = new this());
    }

    /**
     * Changes the resource strings for all components in the application
     * ```
     * @param resourceStrings to be applied
     */
    public changei18n(resourceStrings: IResourceStrings) {
        for (const key of Object.keys(resourceStrings)) {
            this._currentResourceStrings[key] = resourceStrings[key];
        }
    }

    public getCurrentResourceStrings(en: IResourceStrings): IResourceStrings {
        for (const key of Object.keys(en)) {
            if (!this._currentResourceStrings[key]) {
                this._currentResourceStrings[key] = en[key];
            }
        }
        return this._currentResourceStrings;
    }
}

export function getCurrentResourceStrings(en: IResourceStrings) {
    return igxI18N.instance().getCurrentResourceStrings(en);
}

export function changei18n(resourceStrings: IResourceStrings) {
    igxI18N.instance().changei18n(resourceStrings);
}

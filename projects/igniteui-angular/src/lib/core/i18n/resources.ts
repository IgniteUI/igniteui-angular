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
import {
    registerI18n,
    getCurrentResourceStrings as getCurrentResourceStringsCore,
    IResourceStrings as IResourceStringsCore,
    setCurrentI18n
} from 'igniteui-i18n-core';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings, ICalendarResourceStrings,
    ICarouselResourceStrings, IChipResourceStrings, IComboResourceStrings, IInputResourceStrings, IDatePickerResourceStrings,
    IDateRangePickerResourceStrings, IListResourceStrings, IPaginatorResourceStrings, ITreeResourceStrings,
    IActionStripResourceStrings, IQueryBuilderResourceStrings, IBannerResourceStrings { }


function igxRegisterI18n(resourceStrings: IResourceStrings)  {
    // Remove `igx_` prefix for compatibility with older versions.
    const genericResourceStrings: IResourceStringsCore = {};
    for (const key of Object.keys(resourceStrings)) {
        let stringKey = key;
        if (stringKey.startsWith("igx_")) {
            stringKey = stringKey.replace("igx_", "");
        }
        genericResourceStrings[stringKey] = resourceStrings[key];
    }
    registerI18n(genericResourceStrings);
}

export function convertToIgxResource<T>(inObject: T) {
    const result: any = {};
    const memberNames = Object.getOwnPropertyNames(inObject);
    for (const memberName of memberNames) {
        result['igx_' + memberName] = inObject[memberName];
    }
    return result;
}

/** Get current resource strings based on default. Result is truncated result, containing only relevant locale strings. */
export function getCurrentResourceStrings<T>(defaultEN: T, init = true) {
    const igxResourceStringKeys = Object.keys(defaultEN);
    if (init) {
        igxRegisterI18n(defaultEN);
    }

    // Append back `igx_` prefix for compatibility with older versions.
    const resourceStrings = getCurrentResourceStringsCore();
    const normalizedResourceStrings: T = {} as T;
    const resourceStringsKeys = Object.keys(resourceStrings);
    for (const key of resourceStringsKeys) {
        let stringKey = key;
        if (!stringKey.startsWith("igx_")) {
            stringKey = "igx_" + stringKey;
        }
        if (igxResourceStringKeys.includes(stringKey)) {
            normalizedResourceStrings[stringKey] = resourceStrings[key];
        }
    }

    return normalizedResourceStrings;
}

export function changei18n(resourceStrings: IResourceStrings) {
    igxRegisterI18n(resourceStrings);
}

export function initi18n(locale: string) {
    if (locale !== 'en-US') {
        //Default
        setCurrentI18n(locale);
    }
}

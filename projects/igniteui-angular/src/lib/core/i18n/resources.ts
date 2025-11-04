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
    IResourceChangeEventArgs,
    IResourceStrings as IResourceStringsCore,
    getI18nManager
} from 'igniteui-i18n-core';
import { Subject } from 'rxjs/internal/Subject';
import { DestroyRef, ɵR3Injector as R3Injector } from '@angular/core';

export const DEFAULT_LOCALE = 'en-US';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings, ICalendarResourceStrings,
    ICarouselResourceStrings, IChipResourceStrings, IComboResourceStrings, IInputResourceStrings, IDatePickerResourceStrings,
    IDateRangePickerResourceStrings, IListResourceStrings, IPaginatorResourceStrings, ITreeResourceStrings,
    IActionStripResourceStrings, IQueryBuilderResourceStrings, IBannerResourceStrings { }


function igxRegisterI18n(resourceStrings: IResourceStrings, locale: string) {
    // Remove `igx_` prefix for compatibility with older versions.
    const genericResourceStrings: IResourceStringsCore = {};
    for (const key of Object.keys(resourceStrings)) {
        let stringKey = key;
        if (stringKey.startsWith("igx_")) {
            stringKey = stringKey.replace("igx_", "");
        }
        genericResourceStrings[stringKey] = resourceStrings[key];
    }
    getI18nManager().registerI18n(genericResourceStrings, locale);
}

/** Get current resource strings based on default. Result is truncated result, containing only relevant locale strings. */
export function getCurrentResourceStrings<T>(defaultEN: T, init = true, locale?: string) {
    const igxResourceStringKeys = Object.keys(defaultEN);
    if (init) {
        igxRegisterI18n(defaultEN, getI18nManager().defaultLocale);
    }

    // Append back `igx_` prefix for compatibility with older versions.
    const resourceStrings = getI18nManager().getCurrentResourceStrings(locale);
    const normalizedResourceStrings: T = {} as T;
    const resourceStringsKeys = Object.keys(resourceStrings);
    for (const igxKey of igxResourceStringKeys) {
        let coreKey = igxKey;
        if (coreKey.startsWith("igx_")) {
            coreKey = coreKey.replace("igx_", "");
        }
        if (resourceStringsKeys.includes(coreKey)) {
            normalizedResourceStrings[igxKey] = resourceStrings[coreKey];
        } else {
            normalizedResourceStrings[igxKey] = defaultEN[igxKey];
        }
    }

    return normalizedResourceStrings;
}

/**
 * Bind to the i18n manager's onResourceChange event
 * @param destroyObj Object responsible for signaling destruction of the handling object
 * @param context Reference to the object's this context
 */
export function onResourceChangeHandle(destroyObj: Subject<any> | DestroyRef, callback: (event?: CustomEvent<IResourceChangeEventArgs>) => void, context: any) {
    const onResourceChangeHandler = callback.bind(context);
    getI18nManager().addEventListener("onResourceChange", onResourceChangeHandler);

    // Handle removal of listener on context destroy
    const removeHandler = () => {
        getI18nManager().removeEventListener("onResourceChange", onResourceChangeHandler);
    }
    if (destroyObj instanceof DestroyRef || destroyObj instanceof R3Injector) {
        // R3Injector is for tests only
        destroyObj.onDestroy(() => removeHandler());
    } else if (destroyObj) {
        destroyObj.subscribe({
            complete: () => removeHandler()
        });
    }
}

/**
 * Change resource strings for all components globally. The locale is not taken into account and this method should be called when the locale is changed.
 */
export function changei18n(resourceStrings: IResourceStrings) {
    igxRegisterI18n(resourceStrings, getI18nManager().defaultLocale);
}

export function registerI18n(resourceStrings: IResourceStrings, locale?: string) {
    igxRegisterI18n(resourceStrings, locale);
}

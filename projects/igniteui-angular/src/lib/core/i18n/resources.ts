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
    getCurrentResourceStrings as getCurrentResourceStringsCore,
    IResourceStrings as IResourceStringsCore,
    getI18nManager
} from 'igniteui-i18n-core';

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
export function getCurrentResourceStrings<T>(defaultEN: T, init = true) {
    const igxResourceStringKeys = Object.keys(defaultEN);
    if (init) {
        igxRegisterI18n(defaultEN, getI18nManager().defaultLocale);
    }

    // Append back `igx_` prefix for compatibility with older versions.
    const resourceStrings = getCurrentResourceStringsCore();
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
 * Change resource strings for all components globally. The locale is not taken into account and this method should be called when the locale is changed.
 * @deprecated Please use the new `registerI18n` and `setCurrentI18n` methods instead.
 */
export function changei18n(resourceStrings: IResourceStrings) {
    igxRegisterI18n(resourceStrings, getI18nManager().defaultLocale);
}

const angularLocalizationProp = Symbol.for('igx.i18n.angularLocalization');

/** Toggle Angular's localization and formatting in favor of our Intl implementation.
 * @enable If should be enabled(true) or disabled(false). True by default.
 * @returns If is now enabled or disabled.
 */
export function toggleIgxAngularLocalization(enable?: boolean): boolean {
  globalThis[angularLocalizationProp] = enable != null ? enable : !globalThis[angularLocalizationProp];
  return globalThis[angularLocalizationProp];
}

/** Get if the Angular's localization and formatting is enabled. It is true by default. */
export function isIgxAngularLocalizationEnabled(): boolean {
    if (globalThis[angularLocalizationProp] == null) {
        globalThis[angularLocalizationProp] = true;
    }
    return globalThis[angularLocalizationProp];
}

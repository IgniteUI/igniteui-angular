import {
    formatDate as ngFormatDate,
    getLocaleCurrencyCode,
    getLocaleFirstDayOfWeek as ngGetLocaleFirstDayOfWeek,
    formatNumber as ngFormatNumber,
    formatPercent as ngFormatPercent,
    getCurrencySymbol as ngGetCurrencySymbol,
    CurrencyPipe
} from '@angular/common';
import { InjectionToken } from '@angular/core';
import { getCurrentI18n, getDateFormatter } from 'igniteui-i18n-core';

/**
 * Injection token that allows for retrieving the i18n formatter for the IgniteUI components.
 */
export const I18N_FORMATTER = new InjectionToken<BaseFormatter>('IgniteFormattingToken',{
    providedIn: 'root',
    factory: () => new BaseFormatter(),
});

export class BaseFormatter {
    protected IntlDateTimeStyleValues = {
        full: 'Full',
        long: 'Long',
        medium: 'Medium',
        short: 'Short'
    };
    private _currencyPipe = new CurrencyPipe('en-US', 'USD');

    public getSizeFromDisplayFormat(displayFormat: string | null | undefined) {
        const formatKeys = Object.keys(this.IntlDateTimeStyleValues) as (keyof typeof this.IntlDateTimeStyleValues)[];
        const targetFormat = displayFormat?.toLowerCase().replace('date', '');
        return  targetFormat ? formatKeys.find(k => k === targetFormat) : null;
    }

    /**
     * Returns the date and time format based on a provided locale and options.
     */
    public getLocaleDateTimeFormat(locale: string, forceLeadingZero = false, options?: Intl.DateTimeFormatOptions): string {
        return getDateFormatter().getLocaleDateTimeFormat(locale, forceLeadingZero, options);
    }

    /**
     * Format provided date to reflect locales format. Similar to Angular's formatDate.
     */
    public formatDate(value: Date | string | number | null | undefined, format: string, locale: string, timezone?: string): string {
        return value != null ? ngFormatDate(value, format, locale, timezone) : '';
    }

    /** Format number value based on locale */
    public formatNumber(value: number | string | null | undefined, locale: string, digitsInfo?: string): string {
        if (typeof value === "string") {
            value = parseFloat(value);
        }
        return value != null ? ngFormatNumber(value, locale, digitsInfo) : '';
    }

    /** Format number value as percent based on locale */
    public formatPercent(value: number | string | null | undefined, locale: string, digitsInfo?: string): string {
        if (typeof value === "string") {
            value = parseFloat(value);
        }
        return value != null ? ngFormatPercent(value, locale, digitsInfo) : '';
    }

    /** Format number as a currency based on locale */
    public formatCurrency(value: number | string | null | undefined, locale?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string, currencyCode?: string, digitsInfo?: string): string {
        if (typeof value === "string") {
            value = parseFloat(value);
        }

        return value != null ? this._currencyPipe.transform(value, currencyCode, display, digitsInfo, locale ?? getCurrentI18n()) : '';
    }

    /**
     * Retrieve the currency code of the locale provided.
     * Angular provides locale data for them, if using that.
     * When using Intl, it should be user defined and defaults to USD.
     */
    public getCurrencyCode(locale: string, overrideCode?: string): string {
        if (overrideCode) {
            return overrideCode;
        }
        return getLocaleCurrencyCode(locale);
    }


    /** Get the currency symbol based on a currency code. */
    public getCurrencySymbol(currencyCode: string, locale: string, currencyDisplay: keyof Intl.NumberFormatOptionsCurrencyDisplayRegistry = "symbol"): string {
        let format: 'wide' | 'narrow' = 'wide';
        if (currencyDisplay === 'narrowSymbol') {
            format = 'narrow';
        }
        return ngGetCurrencySymbol(currencyCode, format, locale);
    }

    /**
     * Get first day of the week.
     * Angular's default: 0...6.
     * Intl default: 1...7.
     */
    public getLocaleFirstDayOfWeek(locale: string): number {
        // Angular returns 0 for Sunday...
        return ngGetLocaleFirstDayOfWeek(locale);
    }
}

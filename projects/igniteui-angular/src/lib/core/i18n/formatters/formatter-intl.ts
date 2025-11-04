import {
    getNumberFormatter,
    getDateFormatter
} from 'igniteui-i18n-core';
import { BaseFormatter, I18N_FORMATTER } from './formatter-base';
import { Provider } from '@angular/core';

/** Set up provider for Ignite UI components to use Intl formatting, replacing the default Angular's one. */
export function provideIgniteIntl() {
    const providers: Provider[] = [{provide: I18N_FORMATTER, useValue: new IntlFormatter()}];
    return providers;
}

export class IntlFormatter extends BaseFormatter {
    public override getLocaleDateFormat(locale: string, displayFormat?: string): string {
        const formatKeys = Object.keys(this.IntlDateTimeStyleValues) as (keyof typeof this.IntlDateTimeStyleValues)[];
        const targetKey = formatKeys.find(k => k === displayFormat?.toLowerCase().replace('date', ''));
        if (!targetKey) {
            // if displayFormat is not shortDate, longDate, etc.
            // or if it is not set by the user
            return displayFormat;
        }

        return getDateFormatter().getLocaleDateTimeFormat(locale, false, { dateStyle: targetKey });
    }

    public override getLocaleDateTimeFormat(locale: string, displayFormat?: string): string {
        const formatKeys = Object.keys(this.IntlDateTimeStyleValues) as (keyof typeof this.IntlDateTimeStyleValues)[];
        const targetKey = formatKeys.find(k => k === displayFormat?.toLowerCase().replace('date', ''));
        if (!targetKey) {
            // if displayFormat is not shortDate, longDate, etc.
            // or if it is not set by the user
            return displayFormat;
        }
        return getDateFormatter().getLocaleDateTimeFormat(locale, false, { dateStyle: targetKey, timeStyle: targetKey });
    }

    public override formatDate(value: Date | string | number | null | undefined, format: string, locale: string, timezone?: string): string {
        if (value === null || value === undefined || value === '') {
            return '';
        }
        if (typeof value === "string" || typeof value === "number") {
            value = getDateFormatter().createDateFromValue(value);
        }
        let dateStyle = undefined, timeStyle = undefined;
        if (format === 'short' || format === 'medium' || format === 'long' || format === 'full') {
            dateStyle = format;
            timeStyle = format;
        } else if (format?.includes('Date')) {
            dateStyle = format.replace('Date', '');
        } else if (format?.includes('Time')) {
            timeStyle = format.replace('Time', '');
        } else if (format) {
            return getDateFormatter().formatDateCustomFormat(value, format, { locale, timezone });
        }
        const options: Intl.DateTimeFormatOptions = {
            dateStyle,
            timeStyle,
            timeZone: timezone
        };

        return getDateFormatter().formatDateTime(value, locale, options);
    }

    public override formatNumber(value: number | string | null | undefined, locale?: string, digitsInfo?: string): string {
        return this.formatNumberGeneric(value, "decimal", locale, digitsInfo);
    }

    public override formatPercent(value: number | string | null | undefined, locale?: string, digitsInfo?: string) {
        return this.formatNumberGeneric(value, "percent", locale, digitsInfo);
    }

    public override formatCurrency(value: number | string | null | undefined, locale?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string, currencyCode?: string, digitsInfo?: string): string {
        return this.formatNumberGeneric(value, "currency", locale, digitsInfo, currencyCode, display);
    }

    public override getCurrencyCode(locale: string, overrideCode?: string): string {
        if (overrideCode) {
            return overrideCode;
        }
        return 'USD';
    }

    public override getCurrencySymbol(currencyCode: string, locale?: string, currencyDisplay: keyof Intl.NumberFormatOptionsCurrencyDisplayRegistry = "symbol"): string {
        return getNumberFormatter().getCurrencySymbol(currencyCode, locale, currencyDisplay);
    }

    public override getLocaleFirstDayOfWeek(locale?: string): number {
        return getDateFormatter().getFirstDayOfWeek(locale);
    }

    private parseDigitsInfo(value?: string) {
        let minIntegerDigits = undefined, minFractionDigits = undefined, maxFractionDigits = undefined;
        if (value) {
            const parts = value.split("-");
            const innerParts = parts[0].split(".");
            if (innerParts.length > 0) {
                minIntegerDigits = parseInt(innerParts[0]);
            }
            if (innerParts.length == 2) {
                minFractionDigits = parseInt(innerParts[1]);
            }
            if (parts.length == 2) {
                maxFractionDigits = parseInt(parts[1]);
            }
        }
        return { minIntegerDigits, minFractionDigits, maxFractionDigits };
    }

    private formatNumberGeneric(value: number | string | null | undefined, style?: 'decimal' | 'percent' | 'currency', locale?: string, digitsInfo?: string, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string): string {
        if (value === null || value === undefined || value === '') {
            return '';
        }
        if (typeof value === "string") {
            value = parseFloat(value);
        }
        const parsedDigitsInfo = this.parseDigitsInfo(digitsInfo);
        let currencyDisplay: keyof Intl.NumberFormatOptionsCurrencyDisplayRegistry;
        if (display !== 'code' && display !== 'symbol' && display !== 'symbol-narrow' && display !== 'narrowSymbol' && display !== "name") {
            currencyDisplay = 'symbol';
        } else if (display === 'symbol-narrow') {
            currencyDisplay = 'narrowSymbol';
        } else {
            currencyDisplay = display || undefined;
        }
        const options: Intl.NumberFormatOptions = {
            style: style,
            currency: currencyCode,
            currencyDisplay: currencyDisplay,
            minimumIntegerDigits: parsedDigitsInfo.minIntegerDigits,
            minimumFractionDigits: parsedDigitsInfo.minFractionDigits,
            maximumFractionDigits: parsedDigitsInfo.maxFractionDigits
        };
        return getNumberFormatter().formatNumber(value, locale, options);
    }
}

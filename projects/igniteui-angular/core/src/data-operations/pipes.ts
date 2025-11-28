import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { BaseFormatter, I18N_FORMATTER } from '../core/i18n/formatters/formatter-base';

@Pipe({
    name: 'date',
    standalone: true
})
export class IgxDateFormatterPipe implements PipeTransform {

    constructor(
        @Inject(I18N_FORMATTER) private i18nFormatter: BaseFormatter,
        @Inject(LOCALE_ID) private locale_ID
    ) { }

    public transform(value: Date | string | number | null | undefined, format?: string, timezone?: string, locale?: string) {
        return this.i18nFormatter.formatDate(value, format, locale ?? this.locale_ID, timezone);
    }
}

@Pipe({
    name: 'number',
    standalone: true
})
export class IgxNumberFormatterPipe implements PipeTransform {

    constructor(@Inject(I18N_FORMATTER) private i18nFormatter: BaseFormatter) { }

    public transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string) {
        return this.i18nFormatter.formatNumber(value, locale, digitsInfo);
    }
}

@Pipe({
    name: 'percent',
    standalone: true
})
export class IgxPercentFormatterPipe implements PipeTransform {

    constructor(@Inject(I18N_FORMATTER) private i18nFormatter: BaseFormatter) { }

    public transform(value: number | string | null | undefined, digitsInfo?: string, locale?: string) {
        return this.i18nFormatter.formatPercent(value, locale, digitsInfo);
    }
}

@Pipe({
    name: 'currency',
    standalone: true
})
export class IgxCurrencyFormatterPipe implements PipeTransform {

    constructor(@Inject(I18N_FORMATTER) private i18nFormatter: BaseFormatter) { }

    public transform(value: number | string | null | undefined, currencyCode?: string, display?: 'code' | 'symbol' | 'symbol-narrow' | string , digitsInfo?: string, locale?: string) {

        return this.i18nFormatter.formatCurrency(value, locale, display, currencyCode, digitsInfo);
    }
}

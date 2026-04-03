import { IntlFormatter } from './formatter-intl';

describe('Localization', () => {
    const i18nFormatter = new IntlFormatter();

    describe('number formatting', () => {
        it('should format number correctly', () => {
            expect(i18nFormatter.formatNumber(1.25, 'en')).toEqual('1.25');
            expect(i18nFormatter.formatNumber(125, 'en')).toEqual('125');
            expect(i18nFormatter.formatNumber(1250, 'en')).toEqual('1,250');
            expect(i18nFormatter.formatNumber(12500, 'en')).toEqual('12,500');

            expect(i18nFormatter.formatNumber(1.25, 'bg')).toEqual('1,25');
            expect(i18nFormatter.formatNumber(125, 'bg')).toEqual('125');
            expect(i18nFormatter.formatNumber(1250, 'bg')).toEqual('1250');
            expect(i18nFormatter.formatNumber(12500, 'bg')).toEqual('12 500');

            expect(i18nFormatter.formatNumber(1.25, 'de')).toEqual('1,25');
            expect(i18nFormatter.formatNumber(125, 'de')).toEqual('125');
            expect(i18nFormatter.formatNumber(1250, 'de')).toEqual('1.250');
            expect(i18nFormatter.formatNumber(12500, 'de')).toEqual('12.500');
        });

        it('should format percent correctly', () => {
            expect(i18nFormatter.formatPercent(1.25, 'en')).toEqual('125%');
            expect(i18nFormatter.formatPercent(125, 'en')).toEqual('12,500%');
            expect(i18nFormatter.formatPercent(1.25, 'bg')).toEqual('125%');
            expect(i18nFormatter.formatPercent(125, 'bg')).toEqual('12 500%');
        });

        it('should format currency correctly', () => {
            expect(i18nFormatter.formatCurrency(12345, 'en', 'symbol', 'EUR')).toEqual('€12,345.00');
            expect(i18nFormatter.formatCurrency(12345, 'en', 'symbol', 'EUR', '1.0-3')).toEqual('€12,345');
            expect(i18nFormatter.formatCurrency('12345.33', 'en', 'symbol', 'EUR', '1.0-3')).toEqual('€12,345.33');
            expect(i18nFormatter.formatCurrency(12345, 'en', 'symbol', 'EUR', '1.1-3')).toEqual('€12,345.0');
            expect(i18nFormatter.formatCurrency('12345', 'en', 'symbol', 'EUR', '1.1-3')).toEqual('€12,345.0');
        });
    })

    describe('date formatting', () => {
        it('should format string to dateTime using Intl', () => {
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00+02:00', 'short', 'en-US', "Europe/Sofia")).toEqual('1/25/25, 2:15 PM');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00+02:00', 'medium', 'en-US', "Europe/Sofia")).toEqual('Jan 25, 2025, 2:15:00 PM');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00+02:00', 'long', 'en-US', "Europe/Sofia")).toEqual('January 25, 2025 at 2:15:00 PM GMT+2');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00+02:00', 'full', 'en-US', "Europe/Sofia")).toEqual('Saturday, January 25, 2025 at 2:15:00 PM Eastern European Standard Time');
        });


        it('should format string to time using Intl', () => {
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00+02:00', 'shortTime', 'en-US', "Europe/Sofia")).toEqual('2:15 PM');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00+02:00', 'mediumTime', 'en-US', "Europe/Sofia")).toEqual('2:15:00 PM');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00+02:00', 'longTime', 'en-US', "Europe/Sofia")).toEqual('2:15:00 PM GMT+2');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00+02:00', 'fullTime', 'en-US', "Europe/Sofia")).toEqual('2:15:00 PM Eastern European Standard Time');
        });

        it('should return correct date format per locale', () => {
            expect(i18nFormatter.getLocaleDateTimeFormat('it', false)).toEqual('dd/MM/yyyy');
            expect(i18nFormatter.getLocaleDateTimeFormat('it', false, { dateStyle: 'short' })).toEqual('dd/MM/yy');
            expect(i18nFormatter.getLocaleDateTimeFormat('it', false, { dateStyle: 'medium' })).toEqual('d MMM yyyy');
            expect(i18nFormatter.getLocaleDateTimeFormat('it', false, { dateStyle: 'long' })).toEqual(`d MMMM yyyy`);
            expect(i18nFormatter.getLocaleDateTimeFormat('it', false, { dateStyle: 'full' })).toEqual(`EEEE d MMMM yyyy`);
        });

        it('should return correct date and time format per locale', () => {
            expect(i18nFormatter.getLocaleDateTimeFormat('it', false, { dateStyle: 'short', timeStyle: 'short' })).toEqual('dd/MM/yy, HH:mm');
            expect(i18nFormatter.getLocaleDateTimeFormat('it', false, { dateStyle: 'medium', timeStyle: 'medium' })).toEqual('d MMM yyyy, HH:mm:ss');
            expect(i18nFormatter.getLocaleDateTimeFormat('it', false, { dateStyle: 'long', timeStyle: 'long' })).toEqual(`d MMMM yyyy alle ore HH:mm:ss z`);
            expect(i18nFormatter.getLocaleDateTimeFormat('it', false, { dateStyle: 'full', timeStyle: 'full' })).toEqual(`EEEE d MMMM yyyy alle ore HH:mm:ss zzzz`);
        });
    });

    describe('other', () => {
        it('getCurrencyCode should return default USD as currency code for locale', () => {
            expect(i18nFormatter.getCurrencyCode('en-US')).toEqual('USD');
            expect(i18nFormatter.getCurrencyCode('it')).toEqual('USD');
        });

        it('getCurrencySymbol should return correct currency symbol', () => {
            expect(i18nFormatter.getCurrencySymbol('USD', 'en-US')).toEqual('$');
            expect(i18nFormatter.getCurrencySymbol('EUR', 'de')).toEqual('€');
            expect(i18nFormatter.getCurrencySymbol('EUR', 'it')).toEqual('€');
        });

        it('getLocaleFirstDayOfWeek should return correct values per locale', () => {
            expect(i18nFormatter.getLocaleFirstDayOfWeek('en-US')).toEqual(7);
            expect(i18nFormatter.getLocaleFirstDayOfWeek('bg')).toEqual(1);
            expect(i18nFormatter.getLocaleFirstDayOfWeek('de')).toEqual(1);
            expect(i18nFormatter.getLocaleFirstDayOfWeek('it')).toEqual(1);
        });
    });
});

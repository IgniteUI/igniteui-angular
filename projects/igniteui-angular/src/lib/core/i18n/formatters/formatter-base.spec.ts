import { BaseFormatter } from './formatter-base';

describe('Localization', () => {
    const i18nFormatter = new BaseFormatter();

    describe('number formatting', () => {
        it('should format number correctly', () => {
            expect(i18nFormatter.formatNumber(1.25, 'en')).toEqual('1.25');
            expect(i18nFormatter.formatNumber(125, 'en')).toEqual('125');
            expect(i18nFormatter.formatNumber(1250, 'en')).toEqual('1,250');
            expect(i18nFormatter.formatNumber(12500, 'en')).toEqual('12,500');

            expect(i18nFormatter.formatNumber(1.25, 'bg')).toEqual('1,25');
            expect(i18nFormatter.formatNumber(125, 'bg')).toEqual('125');
            expect(i18nFormatter.formatNumber(1250, 'bg')).toEqual('1 250');
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
        it('should format string to dateTime using Angular', () => {
            // Angular expects time to be already in local time so we don't exact check timezone...
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'short', 'en-US')).toEqual('1/25/25, 2:15 PM');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'medium', 'en-US')).toEqual('Jan 25, 2025, 2:15:00 PM');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'long', 'en-US')).toContain('January 25, 2025 at 2:15:00 PM GMT');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'full', 'en-US')).toContain('Saturday, January 25, 2025 at 2:15:00 PM GMT');
        });

        it('should format string to date using Angular', () => {
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'shortDate', 'en-US', "Europe/Sofia")).toEqual('1/25/25');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'mediumDate', 'en-US', "Europe/Sofia")).toEqual('Jan 25, 2025');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'longDate', 'en-US', "Europe/Sofia")).toEqual('January 25, 2025');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'fullDate', 'en-US', "Europe/Sofia")).toEqual('Saturday, January 25, 2025');
        });

        it('should format string to time using Angular', () => {
            // Angular expects time to be already in local time so we don't exact check timezone...
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'shortTime', 'en-US')).toEqual('2:15 PM');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'mediumTime', 'en-US')).toEqual('2:15:00 PM');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'longTime', 'en-US')).toContain('2:15:00 PM GMT');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'fullTime', 'en-US')).toContain('2:15:00 PM GMT');
        });

        it('should format string to custom format', () => {
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'ex: hh:mm GGG', 'en-US')).toEqual('ex: 02:15 AD');
            expect(i18nFormatter.formatDate('2025-01-25T14:15:00', 'ex: HH:mm GGG', 'en-US')).toEqual('ex: 14:15 AD');
        });

        it('should return correct date format per locale', () => {
            // Defaults to Angular's one because they are registered in tests
            expect(i18nFormatter.getLocaleDateFormat('en', 'short')).toEqual('M/d/yy');
            expect(i18nFormatter.getLocaleDateFormat('en', 'medium')).toEqual('MMM d, y');
            expect(i18nFormatter.getLocaleDateFormat('en', 'long')).toEqual('MMMM d, y');
            expect(i18nFormatter.getLocaleDateFormat('en', 'full')).toEqual('EEEE, MMMM d, y');

            expect(i18nFormatter.getLocaleDateFormat('de', 'short')).toEqual('dd.MM.yy');
            expect(i18nFormatter.getLocaleDateFormat('de', 'medium')).toEqual('dd.MM.y');
            expect(i18nFormatter.getLocaleDateFormat('de', 'long')).toEqual('d. MMMM y');
            expect(i18nFormatter.getLocaleDateFormat('de', 'full')).toEqual('EEEE, d. MMMM y');
        });

        it('should return correct datetime format per locale', () => {
            // Defaults to Angular's one because they are registered in tests
            expect(i18nFormatter.getLocaleDateTimeFormat('en', 'short')).toEqual('{1}, {0}');
            expect(i18nFormatter.getLocaleDateTimeFormat('en', 'medium')).toEqual('{1}, {0}');
            expect(i18nFormatter.getLocaleDateTimeFormat('en', 'long')).toEqual(`{1} 'at' {0}`);
            expect(i18nFormatter.getLocaleDateTimeFormat('en', 'full')).toEqual(`{1} 'at' {0}`);

            expect(i18nFormatter.getLocaleDateTimeFormat('de', 'short')).toEqual('{1}, {0}');
            expect(i18nFormatter.getLocaleDateTimeFormat('de', 'medium')).toEqual('{1}, {0}');
            expect(i18nFormatter.getLocaleDateTimeFormat('de', 'long')).toEqual(`{1} 'um' {0}`);
            expect(i18nFormatter.getLocaleDateTimeFormat('de', 'full')).toEqual(`{1} 'um' {0}`);
        });
    });

    describe('other', () => {
        it('getCurrencyCode should return default USD as currency code for locale, if no Angular is defined', () => {
            expect(i18nFormatter.getCurrencyCode('en-US')).toEqual('USD');

            // Registered in tests, that's why they are available
            expect(i18nFormatter.getCurrencyCode('bg')).toEqual('BGN');
            expect(i18nFormatter.getCurrencyCode('de')).toEqual('EUR');
        });

        it('getCurrencySymbol should return correct currency symbol', () => {
            expect(i18nFormatter.getCurrencySymbol('USD', 'en-US')).toEqual('$');
            expect(i18nFormatter.getCurrencySymbol('BGN', 'bg')).toEqual('лв.');
            expect(i18nFormatter.getCurrencySymbol('EUR', 'de')).toEqual('€');
        });

        it('getLocaleFirstDayOfWeek should return correct values per locale', () => {
            expect(i18nFormatter.getLocaleFirstDayOfWeek('en-US')).toEqual(0); // This is Angular's default
            expect(i18nFormatter.getLocaleFirstDayOfWeek('bg')).toEqual(1);
            expect(i18nFormatter.getLocaleFirstDayOfWeek('de')).toEqual(1);
        });
    });
});

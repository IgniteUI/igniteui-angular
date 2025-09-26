import { cloneValue, isObject, isDate, getCurrencyCode, getCurrencySymbol, getLocaleFirstDayOfWeek, formatDate, formatCurrency, formatPercent, formatNumber, getLocaleDateFormat, getLocaleDateTimeFormat } from './utils';
import { SampleTestData } from '../test-utils/sample-test-data.spec';

describe('Utils', () => {
    const complexObject = {
        Number: 0,
        String: 'Some string',
        Boolean: true,
        Date: new Date(0),
        Object10: {
            Number: 10,
            String: 'Some second level string 10',
            Boolean: false,
            Date: new Date(10 * 1000 * 60 * 60 * 24),
            Object100: {
                Number: 100,
                String: 'Some third level string 100',
                Boolean: false,
                Date: new Date(100 * 1000 * 60 * 60 * 24),
            },
            Object101: {
                Number: 101,
                String: 'Some third level string 101',
                Boolean: false,
                Date: new Date(101 * 1000 * 60 * 60 * 24),
            }
        },
        Object11: {
            Number: 11,
            String: 'Some second level string 11',
            Boolean: false,
            Date: new Date(11 * 1000 * 60 * 60 * 24),
            Object110: {
                Number: 110,
                String: 'Some third level string 110',
                Boolean: false,
                Date: new Date(110 * 1000 * 60 * 60 * 24),
            },
            Object111: {
                Number: 111,
                String: 'Some third level string 111',
                Boolean: false,
                Date: new Date(111 * 1000 * 60 * 60 * 24),
            }
        }
    };

    describe('Utils - cloneValue() unit tests', () => {
        it('Should return primitive values', () => {
            let input: any = 10;
            let expected: any = 10;
            expect(cloneValue(input)).toBe(expected);

            input = 0;
            expected = 0;
            expect(cloneValue(input)).toBe(expected);

            input = Infinity;
            expected = Infinity;
            expect(cloneValue(input)).toBe(expected);

            input = '';
            expected = '';
            expect(cloneValue(input)).toBe(expected);

            input = true;
            expected = true;
            expect(cloneValue(input)).toBe(expected);

            input = false;
            expected = false;
            expect(cloneValue(input)).toBe(expected);

            input = null;
            expected = null;
            expect(cloneValue(input)).toBe(expected);

            input = undefined;
            expected = undefined;
            expect(cloneValue(input)).toBe(expected);
        });

        it('Should not clone Map or Set', () => {
            const mapInput: Map<string, number> = new Map();
            mapInput.set('a', 0);
            mapInput.set('b', 1);
            mapInput.set('c', 2);
            const mapClone = cloneValue(mapInput);
            expect(mapInput).toBe(mapClone);

            const setInput: Set<number> = new Set();
            setInput.add(0);
            setInput.add(1);
            setInput.add(2);
            const setClone = cloneValue(setInput);
            expect(setInput).toBe(setClone);
        });

        it('Should clone correctly dates', () => {
            const input: Date = new Date(0);
            const clone: Date = cloneValue(input);
            expect(clone).not.toBe(input);
            expect(clone.getTime()).toBe(input.getTime());

            //  change of the input should not change the clone
            input.setDate(10);
            expect(clone.getTime()).not.toBe(input.getTime());
        });

        it('Should create shallow copy of array', () => {
            const input: { Number: any; String: any; Boolean: any; Date: any }[] = SampleTestData.differentTypesData();
            const clone: { Number: any; String: any; Boolean: any; Date: any }[] = cloneValue(input);
            expect(clone).not.toBe(input);
            expect(clone.length).toBe(input.length);
            expect(clone).toEqual(input);

            input[0].String = input[0].String + ' some additional value';
            input[0].Boolean = !input[0].Boolean;
            input[0].Number *= 1000;
            expect(clone).toEqual(input);
        });

        it('Should correctly deep clone objects', () => {
            const input = complexObject;
            const clone = cloneValue(input);
            expect(input).toEqual(clone);
            expect(input.Object10).toEqual(clone.Object10);
            expect(input.Object11).toEqual(clone.Object11);

            expect(input.Date).toEqual(clone.Date);
            expect(input.Date).not.toBe(clone.Date);
            expect(input.Date.getTime()).toBe(clone.Date.getTime());

            expect(input.Object10.Date).toEqual(clone.Object10.Date);
            expect(input.Object10.Date).not.toBe(clone.Object10.Date);
            expect(input.Object10.Date.getTime()).toBe(clone.Object10.Date.getTime());

            expect(input.Object11.Object111.Date).toEqual(clone.Object11.Object111.Date);
            expect(input.Object11.Object111.Date).not.toBe(clone.Object11.Object111.Date);
            expect(input.Object11.Object111.Date.getTime()).toBe(clone.Object11.Object111.Date.getTime());

            expect(input.Number).toBe(clone.Number);
            expect(input.Object10.Number).toBe(clone.Object10.Number);
            expect(input.Object11.Object111.Number).toBe(clone.Object11.Object111.Number);

            expect(input.String).toBe(clone.String);
            expect(input.Object10.String).toBe(clone.Object10.String);
            expect(input.Object11.Object111.String).toBe(clone.Object11.Object111.String);

            expect(input.Boolean).toBe(clone.Boolean);
            expect(input.Object10.Boolean).toBe(clone.Object10.Boolean);
            expect(input.Object11.Object111.Boolean).toBe(clone.Object11.Object111.Boolean);
        });

        it('Should correctly deep clone object with special values', () => {
            const objectWithSpecialValues = {};
            objectWithSpecialValues['Null'] = null;
            objectWithSpecialValues['Undefined'] = undefined;
            const clone = cloneValue(objectWithSpecialValues);

            expect(clone.Null).toBeNull();
            expect(clone.undefined).toBeUndefined();
        });

        it('Should correctly handle null and undefined values', () => {
            const nullClone = cloneValue(null);
            expect(nullClone).toBeNull();

            const undefinedClone = cloneValue(undefined);
            expect(undefinedClone).toBeUndefined();
        });
    });

    describe('Utils - isObject() unit tests', () => {
        it('Should correctly determine if variable is Object', () => {
            let variable: any = {};
            expect(isObject(variable)).toBeTruthy();

            variable = 10;
            expect(isObject(variable)).toBeFalsy();

            variable = 'Some string';
            expect(isObject(variable)).toBeFalsy();

            variable = '';
            expect(isObject(variable)).toBeFalsy();

            variable = true;
            expect(isObject(variable)).toBeFalsy();

            variable = false;
            expect(isObject(variable)).toBeFalsy();

            variable = new Date(0);
            expect(isObject(variable)).toBeFalsy();

            variable = null;
            expect(isObject(variable)).toBeFalsy();

            variable = undefined;
            expect(isObject(variable)).toBeFalsy();

            variable = [];
            expect(isObject(variable)).toBeFalsy();

            variable = new Map();
            expect(isObject(variable)).toBeFalsy();

            variable = new Set();
            expect(isObject(variable)).toBeFalsy();
        });
    });

    describe('Utils - isDate() unit tests', () => {
        it('Should correctly determine if variable is Date', () => {
            let variable: any = new Date(0);
            expect(isDate(variable)).toBeTruthy();

            variable = new Date('wrong date parameter');
            expect(isDate(variable)).toBeTruthy();

            variable = 10;
            expect(isDate(variable)).toBeFalsy();

            variable = 'Some string';
            expect(isDate(variable)).toBeFalsy();

            variable = '';
            expect(isDate(variable)).toBeFalsy();

            variable = true;
            expect(isDate(variable)).toBeFalsy();

            variable = false;
            expect(isDate(variable)).toBeFalsy();

            variable = {};
            expect(isDate(variable)).toBeFalsy();

            variable = null;
            expect(isDate(variable)).toBeFalsy();

            variable = undefined;
            expect(isDate(variable)).toBeFalsy();

            variable = [];
            expect(isDate(variable)).toBeFalsy();

            variable = new Map();
            expect(isDate(variable)).toBeFalsy();

            variable = new Set();
            expect(isDate(variable)).toBeFalsy();
        });
    });

    describe('Localization', () => {
        describe('number formatting', () => {
            it('should format number correctly', () => {
                expect(formatNumber(1.25, 'en')).toEqual('1.25');
                expect(formatNumber(125, 'en')).toEqual('125');
                expect(formatNumber(1250, 'en')).toEqual('1,250');
                expect(formatNumber(12500, 'en')).toEqual('12,500');

                expect(formatNumber(1.25, 'bg')).toEqual('1,25');
                expect(formatNumber(125, 'bg')).toEqual('125');
                expect(formatNumber(1250, 'bg')).toEqual('1250');
                expect(formatNumber(12500, 'bg')).toEqual('12 500');

                expect(formatNumber(1.25, 'de')).toEqual('1,25');
                expect(formatNumber(125, 'de')).toEqual('125');
                expect(formatNumber(1250, 'de')).toEqual('1.250');
                expect(formatNumber(12500, 'de')).toEqual('12.500');
            });

            it('should format percent correctly', () => {
                expect(formatPercent(1.25, 'en')).toEqual('125%');
                expect(formatPercent(125, 'en')).toEqual('12,500%');
                expect(formatPercent(1.25, 'bg')).toEqual('125%');
                expect(formatPercent(125, 'bg')).toEqual('12 500%');
            });

            it('should format currency correctly', () => {
                expect(formatCurrency(12345, 'en', 'symbol', 'EUR')).toEqual('€12,345.00');
                expect(formatCurrency(12345, 'en', 'symbol', 'EUR', '1.0-3')).toEqual('€12,345');
                expect(formatCurrency('12345.33', 'en', 'symbol', 'EUR', '1.0-3')).toEqual('€12,345.33');
                expect(formatCurrency(12345, 'en', 'symbol', 'EUR', '1.1-3')).toEqual('€12,345.0');
                expect(formatCurrency('12345', 'en', 'symbol', 'EUR', '1.1-3')).toEqual('€12,345.0');
            });
        })

        describe('date formatting', () => {
            it('should format string to dateTime', () => {
                expect(formatDate('2025-01-25T14:15:00', 'short', 'en-US', "Europe/Sofia")).toEqual('1/25/25, 2:15 PM');
                expect(formatDate('2025-01-25T14:15:00', 'medium', 'en-US', "Europe/Sofia")).toEqual('Jan 25, 2025, 2:15:00 PM');
                expect(formatDate('2025-01-25T14:15:00', 'long', 'en-US', "Europe/Sofia")).toEqual('January 25, 2025 at 2:15:00 PM GMT+2');
                expect(formatDate('2025-01-25T14:15:00', 'full', 'en-US', "Europe/Sofia")).toEqual('Saturday, January 25, 2025 at 2:15:00 PM GMT+02:00');
            });

            it('should format string to date', () => {
                expect(formatDate('2025-01-25T14:15:00', 'shortDate', 'en-US', "Europe/Sofia")).toEqual('1/25/25');
                expect(formatDate('2025-01-25T14:15:00', 'mediumDate', 'en-US', "Europe/Sofia")).toEqual('Jan 25, 2025');
                expect(formatDate('2025-01-25T14:15:00', 'longDate', 'en-US', "Europe/Sofia")).toEqual('January 25, 2025');
                expect(formatDate('2025-01-25T14:15:00', 'fullDate', 'en-US', "Europe/Sofia")).toEqual('Saturday, January 25, 2025');
            });

            it('should format string to time', () => {
                expect(formatDate('2025-01-25T14:15:00', 'shortTime', 'en-US', "Europe/Sofia")).toEqual('2:15 PM');
                expect(formatDate('2025-01-25T14:15:00', 'mediumTime', 'en-US', "Europe/Sofia")).toEqual('2:15:00 PM');
                expect(formatDate('2025-01-25T14:15:00', 'longTime', 'en-US', "Europe/Sofia")).toEqual('2:15:00 PM GMT+2');
                expect(formatDate('2025-01-25T14:15:00', 'fullTime', 'en-US', "Europe/Sofia")).toEqual('2:15:00 PM GMT+02:00');
            });

            it('should format string to custom format', () => {
                expect(formatDate('2025-01-25T14:15:00', 'ex: hh:mm bbb GGG', 'en-US')).toEqual('ex: 02:15 in th. af. AD');
                expect(formatDate('2025-01-25T14:15:00', 'ex: HH:mm bbb GGG', 'en-US')).toEqual('ex: 14:15 in th. af. AD');
            });

            it('should return correct date format per locale', () => {
                // Defaults to Angular's one because they are registered in tests
                expect(getLocaleDateFormat('en', 'short')).toEqual('M/d/yy');
                expect(getLocaleDateFormat('en', 'medium')).toEqual('MMM d, y');
                expect(getLocaleDateFormat('en', 'long')).toEqual('MMMM d, y');
                expect(getLocaleDateFormat('en', 'full')).toEqual('EEEE, MMMM d, y');

                expect(getLocaleDateFormat('de', 'short')).toEqual('dd.MM.yy');
                expect(getLocaleDateFormat('de', 'medium')).toEqual('dd.MM.y');
                expect(getLocaleDateFormat('de', 'long')).toEqual('d. MMMM y');
                expect(getLocaleDateFormat('de', 'full')).toEqual('EEEE, d. MMMM y');

                // There's no registered locale for IT in tests, so use new API
                expect(getLocaleDateFormat('it', 'short')).toEqual('dd/MM/yy');
                expect(getLocaleDateFormat('it', 'medium')).toEqual('d MMM yyyy');
                expect(getLocaleDateFormat('it', 'long')).toEqual(`d MMMM yyyy`);
                expect(getLocaleDateFormat('it', 'full')).toEqual(`EEEE d MMMM yyyy`);
            });

            it('should return correct datetime format per locale', () => {
                // Defaults to Angular's one because they are registered in tests
                expect(getLocaleDateTimeFormat('en', 'short')).toEqual('{1}, {0}');
                expect(getLocaleDateTimeFormat('en', 'medium')).toEqual('{1}, {0}');
                expect(getLocaleDateTimeFormat('en', 'long')).toEqual(`{1} 'at' {0}`);
                expect(getLocaleDateTimeFormat('en', 'full')).toEqual(`{1} 'at' {0}`);

                expect(getLocaleDateTimeFormat('de', 'short')).toEqual('{1}, {0}');
                expect(getLocaleDateTimeFormat('de', 'medium')).toEqual('{1}, {0}');
                expect(getLocaleDateTimeFormat('de', 'long')).toEqual(`{1} 'um' {0}`);
                expect(getLocaleDateTimeFormat('de', 'full')).toEqual(`{1} 'um' {0}`);

                // There's no registered locale for IT in tests, so use new API
                expect(getLocaleDateTimeFormat('it', 'short')).toEqual('dd/MM/yy, HH:mm');
                expect(getLocaleDateTimeFormat('it', 'medium')).toEqual('d MMM yyyy, HH:mm:ss');
                expect(getLocaleDateTimeFormat('it', 'long')).toEqual(`d MMMM yyyy alle ore HH:mm:ss z`);
                expect(getLocaleDateTimeFormat('it', 'full')).toEqual(`EEEE d MMMM yyyy alle ore HH:mm:ss zzzz`);
            });
        });

        describe('other', () => {
            it('getCurrencyCode should return default USD as currency code for locale, if no Angular is defined', () => {
                expect(getCurrencyCode('en-US')).toEqual('USD');

                // Registered in tests, that's why they are available
                expect(getCurrencyCode('bg')).toEqual('BGN');
                expect(getCurrencyCode('de')).toEqual('EUR');

                // This is not registered in tests yet
                expect(getCurrencyCode('it')).toEqual('USD');
            });

            it('getCurrencySymbol should return correct currency symbol', () => {
                expect(getCurrencySymbol('USD', 'en-US')).toEqual('$');
                expect(getCurrencySymbol('BGN', 'bg')).toEqual('лв.');
                expect(getCurrencySymbol('EUR', 'de')).toEqual('€');
                expect(getCurrencySymbol('EUR', 'it')).toEqual('€');
            });

            it('getLocaleFirstDayOfWeek should return correct values per locale', () => {
                expect(getLocaleFirstDayOfWeek('en-US')).toEqual(0); // This is Angular's default
                expect(getLocaleFirstDayOfWeek('bg')).toEqual(1);
                expect(getLocaleFirstDayOfWeek('de')).toEqual(1);
                expect(getLocaleFirstDayOfWeek('it')).toEqual(1);
            });
        });
    });
});

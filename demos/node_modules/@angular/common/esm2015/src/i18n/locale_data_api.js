/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import localeEn from './locale_en';
import { LOCALE_DATA } from './locale_data';
import { CURRENCIES_EN } from './currencies';
/** @enum {number} */
const NumberFormatStyle = {
    Decimal: 0,
    Percent: 1,
    Currency: 2,
    Scientific: 3,
};
export { NumberFormatStyle };
NumberFormatStyle[NumberFormatStyle.Decimal] = "Decimal";
NumberFormatStyle[NumberFormatStyle.Percent] = "Percent";
NumberFormatStyle[NumberFormatStyle.Currency] = "Currency";
NumberFormatStyle[NumberFormatStyle.Scientific] = "Scientific";
/** @enum {number} */
const Plural = {
    Zero: 0,
    One: 1,
    Two: 2,
    Few: 3,
    Many: 4,
    Other: 5,
};
export { Plural };
Plural[Plural.Zero] = "Zero";
Plural[Plural.One] = "One";
Plural[Plural.Two] = "Two";
Plural[Plural.Few] = "Few";
Plural[Plural.Many] = "Many";
Plural[Plural.Other] = "Other";
/** @enum {number} */
const FormStyle = {
    Format: 0,
    Standalone: 1,
};
export { FormStyle };
FormStyle[FormStyle.Format] = "Format";
FormStyle[FormStyle.Standalone] = "Standalone";
/** @enum {number} */
const TranslationWidth = {
    Narrow: 0,
    Abbreviated: 1,
    Wide: 2,
    Short: 3,
};
export { TranslationWidth };
TranslationWidth[TranslationWidth.Narrow] = "Narrow";
TranslationWidth[TranslationWidth.Abbreviated] = "Abbreviated";
TranslationWidth[TranslationWidth.Wide] = "Wide";
TranslationWidth[TranslationWidth.Short] = "Short";
/** @enum {number} */
const FormatWidth = {
    Short: 0,
    Medium: 1,
    Long: 2,
    Full: 3,
};
export { FormatWidth };
FormatWidth[FormatWidth.Short] = "Short";
FormatWidth[FormatWidth.Medium] = "Medium";
FormatWidth[FormatWidth.Long] = "Long";
FormatWidth[FormatWidth.Full] = "Full";
/** @enum {number} */
const NumberSymbol = {
    Decimal: 0,
    Group: 1,
    List: 2,
    PercentSign: 3,
    PlusSign: 4,
    MinusSign: 5,
    Exponential: 6,
    SuperscriptingExponent: 7,
    PerMille: 8,
    Infinity: 9,
    NaN: 10,
    TimeSeparator: 11,
    CurrencyDecimal: 12,
    CurrencyGroup: 13,
};
export { NumberSymbol };
NumberSymbol[NumberSymbol.Decimal] = "Decimal";
NumberSymbol[NumberSymbol.Group] = "Group";
NumberSymbol[NumberSymbol.List] = "List";
NumberSymbol[NumberSymbol.PercentSign] = "PercentSign";
NumberSymbol[NumberSymbol.PlusSign] = "PlusSign";
NumberSymbol[NumberSymbol.MinusSign] = "MinusSign";
NumberSymbol[NumberSymbol.Exponential] = "Exponential";
NumberSymbol[NumberSymbol.SuperscriptingExponent] = "SuperscriptingExponent";
NumberSymbol[NumberSymbol.PerMille] = "PerMille";
NumberSymbol[NumberSymbol.Infinity] = "Infinity";
NumberSymbol[NumberSymbol.NaN] = "NaN";
NumberSymbol[NumberSymbol.TimeSeparator] = "TimeSeparator";
NumberSymbol[NumberSymbol.CurrencyDecimal] = "CurrencyDecimal";
NumberSymbol[NumberSymbol.CurrencyGroup] = "CurrencyGroup";
/** @enum {number} */
const WeekDay = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};
export { WeekDay };
WeekDay[WeekDay.Sunday] = "Sunday";
WeekDay[WeekDay.Monday] = "Monday";
WeekDay[WeekDay.Tuesday] = "Tuesday";
WeekDay[WeekDay.Wednesday] = "Wednesday";
WeekDay[WeekDay.Thursday] = "Thursday";
WeekDay[WeekDay.Friday] = "Friday";
WeekDay[WeekDay.Saturday] = "Saturday";
/**
 * The locale id for the chosen locale (e.g `en-GB`).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleId(locale) {
    return findLocaleData(locale)[0 /* LocaleId */];
}
/**
 * Periods of the day (e.g. `[AM, PM]` for en-US).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleDayPeriods(locale, formStyle, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ amPmData = /** @type {?} */ ([data[1 /* DayPeriodsFormat */], data[2 /* DayPeriodsStandalone */]]);
    const /** @type {?} */ amPm = getLastDefinedValue(amPmData, formStyle);
    return getLastDefinedValue(amPm, width);
}
/**
 * Days of the week for the Gregorian calendar (e.g. `[Sunday, Monday, ... Saturday]` for en-US).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleDayNames(locale, formStyle, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ daysData = /** @type {?} */ ([data[3 /* DaysFormat */], data[4 /* DaysStandalone */]]);
    const /** @type {?} */ days = getLastDefinedValue(daysData, formStyle);
    return getLastDefinedValue(days, width);
}
/**
 * Months of the year for the Gregorian calendar (e.g. `[January, February, ...]` for en-US).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleMonthNames(locale, formStyle, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ monthsData = /** @type {?} */ ([data[5 /* MonthsFormat */], data[6 /* MonthsStandalone */]]);
    const /** @type {?} */ months = getLastDefinedValue(monthsData, formStyle);
    return getLastDefinedValue(months, width);
}
/**
 * Eras for the Gregorian calendar (e.g. AD/BC).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleEraNames(locale, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ erasData = /** @type {?} */ (data[7 /* Eras */]);
    return getLastDefinedValue(erasData, width);
}
/**
 * First day of the week for this locale, based on english days (Sunday = 0, Monday = 1, ...).
 * For example in french the value would be 1 because the first day of the week is Monday.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleFirstDayOfWeek(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[8 /* FirstDayOfWeek */];
}
/**
 * Range of days in the week that represent the week-end for this locale, based on english days
 * (Sunday = 0, Monday = 1, ...).
 * For example in english the value would be [6,0] for Saturday to Sunday.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleWeekEndRange(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[9 /* WeekendRange */];
}
/**
 * Date format that depends on the locale.
 *
 * There are four basic date formats:
 * - `full` should contain long-weekday (EEEE), year (y), long-month (MMMM), day (d).
 *
 *  For example, English uses `EEEE, MMMM d, y`, corresponding to a date like
 *  "Tuesday, September 14, 1999".
 *
 * - `long` should contain year, long-month, day.
 *
 *  For example, `MMMM d, y`, corresponding to a date like "September 14, 1999".
 *
 * - `medium` should contain year, abbreviated-month (MMM), day.
 *
 *  For example, `MMM d, y`, corresponding to a date like "Sep 14, 1999".
 *  For languages that do not use abbreviated months, use the numeric month (MM/M). For example,
 *  `y/MM/dd`, corresponding to a date like "1999/09/14".
 *
 * - `short` should contain year, numeric-month (MM/M), and day.
 *
 *  For example, `M/d/yy`, corresponding to a date like "9/14/99".
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleDateFormat(locale, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    return getLastDefinedValue(data[10 /* DateFormat */], width);
}
/**
 * Time format that depends on the locale.
 *
 * The standard formats include four basic time formats:
 * - `full` should contain hour (h/H), minute (mm), second (ss), and zone (zzzz).
 * - `long` should contain hour, minute, second, and zone (z)
 * - `medium` should contain hour, minute, second.
 * - `short` should contain hour, minute.
 *
 * Note: The patterns depend on whether the main country using your language uses 12-hour time or
 * not:
 * - For 12-hour time, use a pattern like `hh:mm a` using h to mean a 12-hour clock cycle running
 * 1 through 12 (midnight plus 1 minute is 12:01), or using K to mean a 12-hour clock cycle
 * running 0 through 11 (midnight plus 1 minute is 0:01).
 * - For 24-hour time, use a pattern like `HH:mm` using H to mean a 24-hour clock cycle running 0
 * through 23 (midnight plus 1 minute is 0:01), or using k to mean a 24-hour clock cycle running
 * 1 through 24 (midnight plus 1 minute is 24:01).
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleTimeFormat(locale, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    return getLastDefinedValue(data[11 /* TimeFormat */], width);
}
/**
 * Date-time format that depends on the locale.
 *
 * The date-time pattern shows how to combine separate patterns for date (represented by {1})
 * and time (represented by {0}) into a single pattern. It usually doesn't need to be changed.
 * What you want to pay attention to are:
 * - possibly removing a space for languages that don't use it, such as many East Asian languages
 * - possibly adding a comma, other punctuation, or a combining word
 *
 * For example:
 * - English uses `{1} 'at' {0}` or `{1}, {0}` (depending on date style), while Japanese uses
 *  `{1}{0}`.
 * - An English formatted date-time using the combining pattern `{1}, {0}` could be
 *  `Dec 10, 2010, 3:59:49 PM`. Notice the comma and space between the date portion and the time
 *  portion.
 *
 * There are four formats (`full`, `long`, `medium`, `short`); the determination of which to use
 * is normally based on the date style. For example, if the date has a full month and weekday
 * name, the full combining pattern will be used to combine that with a time. If the date has
 * numeric month, the short version of the combining pattern will be used to combine that with a
 * time. English uses `{1} 'at' {0}` for full and long styles, and `{1}, {0}` for medium and short
 * styles.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} width
 * @return {?}
 */
export function getLocaleDateTimeFormat(locale, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ dateTimeFormatData = /** @type {?} */ (data[12 /* DateTimeFormat */]);
    return getLastDefinedValue(dateTimeFormatData, width);
}
/**
 * Number symbol that can be used to replace placeholders in number formats.
 * See {\@link NumberSymbol} for more information.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} symbol
 * @return {?}
 */
export function getLocaleNumberSymbol(locale, symbol) {
    const /** @type {?} */ data = findLocaleData(locale);
    const /** @type {?} */ res = data[13 /* NumberSymbols */][symbol];
    if (typeof res === 'undefined') {
        if (symbol === NumberSymbol.CurrencyDecimal) {
            return data[13 /* NumberSymbols */][NumberSymbol.Decimal];
        }
        else if (symbol === NumberSymbol.CurrencyGroup) {
            return data[13 /* NumberSymbols */][NumberSymbol.Group];
        }
    }
    return res;
}
/**
 * Number format that depends on the locale.
 *
 * Numbers are formatted using patterns, like `#,###.00`. For example, the pattern `#,###.00`
 * when used to format the number 12345.678 could result in "12'345,67". That would happen if the
 * grouping separator for your language is an apostrophe, and the decimal separator is a comma.
 *
 * <b>Important:</b> The characters `.` `,` `0` `#` (and others below) are special placeholders;
 * they stand for the decimal separator, and so on, and are NOT real characters.
 * You must NOT "translate" the placeholders; for example, don't change `.` to `,` even though in
 * your language the decimal point is written with a comma. The symbols should be replaced by the
 * local equivalents, using the Number Symbols for your language.
 *
 * Here are the special characters used in number patterns:
 *
 * | Symbol | Meaning |
 * |--------|---------|
 * | . | Replaced automatically by the character used for the decimal point. |
 * | , | Replaced by the "grouping" (thousands) separator. |
 * | 0 | Replaced by a digit (or zero if there aren't enough digits). |
 * | # | Replaced by a digit (or nothing if there aren't enough). |
 * | ¤ | This will be replaced by a currency symbol, such as $ or USD. |
 * | % | This marks a percent format. The % symbol may change position, but must be retained. |
 * | E | This marks a scientific format. The E symbol may change position, but must be retained. |
 * | ' | Special characters used as literal characters are quoted with ASCII single quotes. |
 *
 * You can find more information
 * [on the CLDR website](http://cldr.unicode.org/translation/number-patterns)
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} type
 * @return {?}
 */
export function getLocaleNumberFormat(locale, type) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[14 /* NumberFormats */][type];
}
/**
 * The symbol used to represent the currency for the main country using this locale (e.g. $ for
 * the locale en-US).
 * The symbol will be `null` if the main country cannot be determined.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleCurrencySymbol(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[15 /* CurrencySymbol */] || null;
}
/**
 * The name of the currency for the main country using this locale (e.g. USD for the locale
 * en-US).
 * The name will be `null` if the main country cannot be determined.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleCurrencyName(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[16 /* CurrencyName */] || null;
}
/**
 * Returns the currency values for the locale
 * @param {?} locale
 * @return {?}
 */
function getLocaleCurrencies(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[17 /* Currencies */];
}
/**
 * The locale plural function used by ICU expressions to determine the plural case to use.
 * See {\@link NgPlural} for more information.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocalePluralCase(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    return data[18 /* PluralCase */];
}
/**
 * @param {?} data
 * @return {?}
 */
function checkFullData(data) {
    if (!data[19 /* ExtraData */]) {
        throw new Error(`Missing extra locale data for the locale "${data[0 /* LocaleId */]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
    }
}
/**
 * Rules used to determine which day period to use (See `dayPeriods` below).
 * The rules can either be an array or a single value. If it's an array, consider it as "from"
 * and "to". If it's a single value then it means that the period is only valid at this exact
 * value.
 * There is always the same number of rules as the number of day periods, which means that the
 * first rule is applied to the first day period and so on.
 * You should fallback to AM/PM when there are no rules available.
 *
 * Note: this is only available if you load the full locale data.
 * See the {\@linkDocs guide/i18n#i18n-pipes "I18n guide"} to know how to import additional locale
 * data.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function getLocaleExtraDayPeriodRules(locale) {
    const /** @type {?} */ data = findLocaleData(locale);
    checkFullData(data);
    const /** @type {?} */ rules = data[19 /* ExtraData */][2 /* ExtraDayPeriodsRules */] || [];
    return rules.map((rule) => {
        if (typeof rule === 'string') {
            return extractTime(rule);
        }
        return [extractTime(rule[0]), extractTime(rule[1])];
    });
}
/**
 * Day Periods indicate roughly how the day is broken up in different languages (e.g. morning,
 * noon, afternoon, midnight, ...).
 * You should use the function {\@link getLocaleExtraDayPeriodRules} to determine which period to
 * use.
 * You should fallback to AM/PM when there are no day periods available.
 *
 * Note: this is only available if you load the full locale data.
 * See the {\@linkDocs guide/i18n#i18n-pipes "I18n guide"} to know how to import additional locale
 * data.
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @param {?} formStyle
 * @param {?} width
 * @return {?}
 */
export function getLocaleExtraDayPeriods(locale, formStyle, width) {
    const /** @type {?} */ data = findLocaleData(locale);
    checkFullData(data);
    const /** @type {?} */ dayPeriodsData = /** @type {?} */ ([
        data[19 /* ExtraData */][0 /* ExtraDayPeriodFormats */],
        data[19 /* ExtraData */][1 /* ExtraDayPeriodStandalone */]
    ]);
    const /** @type {?} */ dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
    return getLastDefinedValue(dayPeriods, width) || [];
}
/**
 * Returns the first value that is defined in an array, going backwards.
 *
 * To avoid repeating the same data (e.g. when "format" and "standalone" are the same) we only
 * add the first one to the locale data arrays, the other ones are only defined when different.
 * We use this function to retrieve the first defined value.
 *
 * \@experimental i18n support is experimental.
 * @template T
 * @param {?} data
 * @param {?} index
 * @return {?}
 */
function getLastDefinedValue(data, index) {
    for (let /** @type {?} */ i = index; i > -1; i--) {
        if (typeof data[i] !== 'undefined') {
            return data[i];
        }
    }
    throw new Error('Locale data API: locale data undefined');
}
/**
 * Extract the hours and minutes from a string like "15:45"
 * @param {?} time
 * @return {?}
 */
function extractTime(time) {
    const [h, m] = time.split(':');
    return { hours: +h, minutes: +m };
}
/**
 * Finds the locale data for a locale id
 *
 * \@experimental i18n support is experimental.
 * @param {?} locale
 * @return {?}
 */
export function findLocaleData(locale) {
    const /** @type {?} */ normalizedLocale = locale.toLowerCase().replace(/_/g, '-');
    let /** @type {?} */ match = LOCALE_DATA[normalizedLocale];
    if (match) {
        return match;
    }
    // let's try to find a parent locale
    const /** @type {?} */ parentLocale = normalizedLocale.split('-')[0];
    match = LOCALE_DATA[parentLocale];
    if (match) {
        return match;
    }
    if (parentLocale === 'en') {
        return localeEn;
    }
    throw new Error(`Missing locale data for the locale "${locale}".`);
}
/**
 * Returns the currency symbol for a given currency code, or the code if no symbol available
 * (e.g.: format narrow = $, format wide = US$, code = USD)
 * If no locale is provided, it uses the locale "en" by default
 *
 * \@experimental i18n support is experimental.
 * @param {?} code
 * @param {?} format
 * @param {?=} locale
 * @return {?}
 */
export function getCurrencySymbol(code, format, locale = 'en') {
    const /** @type {?} */ currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
    const /** @type {?} */ symbolNarrow = currency[1 /* SymbolNarrow */];
    if (format === 'narrow' && typeof symbolNarrow === 'string') {
        return symbolNarrow;
    }
    return currency[0 /* Symbol */] || code;
}
// Most currencies have cents, that's why the default is 2
const /** @type {?} */ DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
/**
 * Returns the number of decimal digits for the given currency.
 * Its value depends upon the presence of cents in that particular currency.
 *
 * \@experimental i18n support is experimental.
 * @param {?} code
 * @return {?}
 */
export function getNumberOfCurrencyDigits(code) {
    let /** @type {?} */ digits;
    const /** @type {?} */ currency = CURRENCIES_EN[code];
    if (currency) {
        digits = currency[2 /* NbOfDigits */];
    }
    return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsZV9kYXRhX2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sUUFBUSxNQUFNLGFBQWEsQ0FBQztBQUNuQyxPQUFPLEVBQUMsV0FBVyxFQUF1RCxNQUFNLGVBQWUsQ0FBQztBQUNoRyxPQUFPLEVBQUMsYUFBYSxFQUFvQixNQUFNLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlJOUQsTUFBTSxzQkFBc0IsTUFBYztJQUN4QyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxrQkFBMEIsQ0FBQztDQUN6RDs7Ozs7Ozs7OztBQU9ELE1BQU0sOEJBQ0YsTUFBYyxFQUFFLFNBQW9CLEVBQUUsS0FBdUI7SUFDL0QsdUJBQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyx1QkFBTSxRQUFRLHFCQUVSLENBQUMsSUFBSSwwQkFBa0MsRUFBRSxJQUFJLDhCQUFzQyxDQUFDLENBQUEsQ0FBQztJQUMzRix1QkFBTSxJQUFJLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDekM7Ozs7Ozs7Ozs7QUFPRCxNQUFNLDRCQUNGLE1BQWMsRUFBRSxTQUFvQixFQUFFLEtBQXVCO0lBQy9ELHVCQUFNLElBQUksR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsdUJBQU0sUUFBUSxxQkFDSSxDQUFDLElBQUks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MUIsTUFBTSxDQUFDLFFBQVEsQ0FBQztLQUNqQjtJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLE1BQU0sSUFBSSxDQUFDLENBQUM7Q0FDcEU7Ozs7Ozs7Ozs7OztBQVNELE1BQU0sNEJBQTRCLElBQVksRUFBRSxNQUF5QixFQUFFLE1BQU0sR0FBRyxJQUFJO0lBQ3RGLHVCQUFNLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hGLHVCQUFNLFlBQVksR0FBRyxRQUFRLHNCQUE0QixDQUFDO0lBRTFELEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM1RCxNQUFNLENBQUMsWUFBWSxDQUFDO0tBQ3JCO0lBRUQsTUFBTSxDQUFDLFFBQVEsZ0JBQXNCLElBQUksSUFBSSxDQUFDO0NBQy9DOztBQUdELHVCQUFNLDZCQUE2QixHQUFHLENBQUMsQ0FBQzs7Ozs7Ozs7O0FBUXhDLE1BQU0sb0NBQW9DLElBQVk7SUFDcEQscUJBQUksTUFBTSxDQUFDO0lBQ1gsdUJBQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2IsTUFBTSxHQUFHLFFBQVEsb0JBQTBCLENBQUM7S0FDN0M7SUFDRCxNQUFNLENBQUMsT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDO0NBQzVFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgbG9jYWxlRW4gZnJvbSAnLi9sb2NhbGVfZW4nO1xuaW1wb3J0IHtMT0NBTEVfREFUQSwgTG9jYWxlRGF0YUluZGV4LCBFeHRyYUxvY2FsZURhdGFJbmRleCwgQ3VycmVuY3lJbmRleH0gZnJvbSAnLi9sb2NhbGVfZGF0YSc7XG5pbXBvcnQge0NVUlJFTkNJRVNfRU4sIEN1cnJlbmNpZXNTeW1ib2xzfSBmcm9tICcuL2N1cnJlbmNpZXMnO1xuXG4vKipcbiAqIFRoZSBkaWZmZXJlbnQgZm9ybWF0IHN0eWxlcyB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcHJlc2VudCBudW1iZXJzLlxuICogVXNlZCBieSB0aGUgZnVuY3Rpb24ge0BsaW5rIGdldExvY2FsZU51bWJlckZvcm1hdH0uXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZW51bSBOdW1iZXJGb3JtYXRTdHlsZSB7XG4gIERlY2ltYWwsXG4gIFBlcmNlbnQsXG4gIEN1cnJlbmN5LFxuICBTY2llbnRpZmljXG59XG5cbi8qKiBAZXhwZXJpbWVudGFsICovXG5leHBvcnQgZW51bSBQbHVyYWwge1xuICBaZXJvID0gMCxcbiAgT25lID0gMSxcbiAgVHdvID0gMixcbiAgRmV3ID0gMyxcbiAgTWFueSA9IDQsXG4gIE90aGVyID0gNSxcbn1cblxuLyoqXG4gKiBTb21lIGxhbmd1YWdlcyB1c2UgdHdvIGRpZmZlcmVudCBmb3JtcyBvZiBzdHJpbmdzIChzdGFuZGFsb25lIGFuZCBmb3JtYXQpIGRlcGVuZGluZyBvbiB0aGVcbiAqIGNvbnRleHQuXG4gKiBUeXBpY2FsbHkgdGhlIHN0YW5kYWxvbmUgdmVyc2lvbiBpcyB0aGUgbm9taW5hdGl2ZSBmb3JtIG9mIHRoZSB3b3JkLCBhbmQgdGhlIGZvcm1hdCB2ZXJzaW9uIGlzIGluXG4gKiB0aGUgZ2VuaXRpdmUuXG4gKiBTZWUgW3RoZSBDTERSIHdlYnNpdGVdKGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL3RyYW5zbGF0aW9uL2RhdGUtdGltZSkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZW51bSBGb3JtU3R5bGUge1xuICBGb3JtYXQsXG4gIFN0YW5kYWxvbmVcbn1cblxuLyoqXG4gKiBNdWx0aXBsZSB3aWR0aHMgYXJlIGF2YWlsYWJsZSBmb3IgdHJhbnNsYXRpb25zOiBuYXJyb3cgKDEgY2hhcmFjdGVyKSwgYWJicmV2aWF0ZWQgKDMgY2hhcmFjdGVycyksXG4gKiB3aWRlIChmdWxsIGxlbmd0aCksIGFuZCBzaG9ydCAoMiBjaGFyYWN0ZXJzLCBvbmx5IGZvciBkYXlzKS5cbiAqXG4gKiBGb3IgZXhhbXBsZSB0aGUgZGF5IGBTdW5kYXlgIHdpbGwgYmU6XG4gKiAtIE5hcnJvdzogYFNgXG4gKiAtIFNob3J0OiBgU3VgXG4gKiAtIEFiYnJldmlhdGVkOiBgU3VuYFxuICogLSBXaWRlOiBgU3VuZGF5YFxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGVudW0gVHJhbnNsYXRpb25XaWR0aCB7XG4gIE5hcnJvdyxcbiAgQWJicmV2aWF0ZWQsXG4gIFdpZGUsXG4gIFNob3J0XG59XG5cbi8qKlxuICogTXVsdGlwbGUgd2lkdGhzIGFyZSBhdmFpbGFibGUgZm9yIGZvcm1hdHM6IHNob3J0IChtaW5pbWFsIGFtb3VudCBvZiBkYXRhKSwgbWVkaXVtIChzbWFsbCBhbW91bnRcbiAqIG9mIGRhdGEpLCBsb25nIChjb21wbGV0ZSBhbW91bnQgb2YgZGF0YSksIGZ1bGwgKGNvbXBsZXRlIGFtb3VudCBvZiBkYXRhIGFuZCBleHRyYSBpbmZvcm1hdGlvbikuXG4gKlxuICogRm9yIGV4YW1wbGUgdGhlIGRhdGUtdGltZSBmb3JtYXRzIGZvciB0aGUgZW5nbGlzaCBsb2NhbGUgd2lsbCBiZTpcbiAqICAtIGAnc2hvcnQnYDogYCdNL2QveXksIGg6bW0gYSdgIChlLmcuIGA2LzE1LzE1LCA5OjAzIEFNYClcbiAqICAtIGAnbWVkaXVtJ2A6IGAnTU1NIGQsIHksIGg6bW06c3MgYSdgIChlLmcuIGBKdW4gMTUsIDIwMTUsIDk6MDM6MDEgQU1gKVxuICogIC0gYCdsb25nJ2A6IGAnTU1NTSBkLCB5LCBoOm1tOnNzIGEgeidgIChlLmcuIGBKdW5lIDE1LCAyMDE1IGF0IDk6MDM6MDEgQU0gR01UKzFgKVxuICogIC0gYCdmdWxsJ2A6IGAnRUVFRSwgTU1NTSBkLCB5LCBoOm1tOnNzIGEgenp6eidgIChlLmcuIGBNb25kYXksIEp1bmUgMTUsIDIwMTUgYXRcbiAqIDk6MDM6MDEgQU0gR01UKzAxOjAwYClcbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBlbnVtIEZvcm1hdFdpZHRoIHtcbiAgU2hvcnQsXG4gIE1lZGl1bSxcbiAgTG9uZyxcbiAgRnVsbFxufVxuXG4vKipcbiAqIE51bWJlciBzeW1ib2wgdGhhdCBjYW4gYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBudW1iZXIgcGF0dGVybnMuXG4gKiBUaGUgcGxhY2Vob2xkZXJzIGFyZSBiYXNlZCBvbiBlbmdsaXNoIHZhbHVlczpcbiAqXG4gKiB8IE5hbWUgICAgICAgICAgICAgICAgICAgfCBFeGFtcGxlIGZvciBlbi1VUyB8IE1lYW5pbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXxcbiAqIHwgZGVjaW1hbCAgICAgICAgICAgICAgICB8IDIsMzQ1YC5gNjcgICAgICAgIHwgZGVjaW1hbCBzZXBhcmF0b3IgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGdyb3VwICAgICAgICAgICAgICAgICAgfCAyYCxgMzQ1LjY3ICAgICAgICB8IGdyb3VwaW5nIHNlcGFyYXRvciwgdHlwaWNhbGx5IGZvciB0aG91c2FuZHMgfFxuICogfCBwbHVzU2lnbiAgICAgICAgICAgICAgIHwgYCtgMjMgICAgICAgICAgICAgfCB0aGUgcGx1cyBzaWduIHVzZWQgd2l0aCBudW1iZXJzICAgICAgICAgICAgIHxcbiAqIHwgbWludXNTaWduICAgICAgICAgICAgICB8IGAtYDIzICAgICAgICAgICAgIHwgdGhlIG1pbnVzIHNpZ24gdXNlZCB3aXRoIG51bWJlcnMgICAgICAgICAgICB8XG4gKiB8IHBlcmNlbnRTaWduICAgICAgICAgICAgfCAyMy40YCVgICAgICAgICAgICB8IHRoZSBwZXJjZW50IHNpZ24gKG91dCBvZiAxMDApICAgICAgICAgICAgICAgfFxuICogfCBwZXJNaWxsZSAgICAgICAgICAgICAgIHwgMjM0YOKAsGAgICAgICAgICAgICB8IHRoZSBwZXJtaWxsZSBzaWduIChvdXQgb2YgMTAwMCkgICAgICAgICAgICAgfFxuICogfCBleHBvbmVudGlhbCAgICAgICAgICAgIHwgMS4yYEVgMyAgICAgICAgICAgfCB1c2VkIGluIGNvbXB1dGVycyBmb3IgMS4yw5cxMMKzLiAgICAgICAgICAgICAgfFxuICogfCBzdXBlcnNjcmlwdGluZ0V4cG9uZW50IHwgMS4yYMOXYDEwMyAgICAgICAgIHwgaHVtYW4tcmVhZGFibGUgZm9ybWF0IG9mIGV4cG9uZW50aWFsICAgICAgICB8XG4gKiB8IGluZmluaXR5ICAgICAgICAgICAgICAgfCBg4oieYCAgICAgICAgICAgICAgIHwgdXNlZCBpbiAr4oieIGFuZCAt4oieLiAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBuYW4gICAgICAgICAgICAgICAgICAgIHwgYE5hTmAgICAgICAgICAgICAgfCBcIm5vdCBhIG51bWJlclwiLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCB0aW1lU2VwYXJhdG9yICAgICAgICAgIHwgMTBgOmA1MiAgICAgICAgICAgfCBzeW1ib2wgdXNlZCBiZXR3ZWVuIHRpbWUgdW5pdHMgICAgICAgICAgICAgIHxcbiAqIHwgY3VycmVuY3lEZWNpbWFsICAgICAgICB8ICQyLDM0NWAuYDY3ICAgICAgIHwgZGVjaW1hbCBzZXBhcmF0b3IsIGZhbGxiYWNrIHRvIFwiZGVjaW1hbFwiICAgIHxcbiAqIHwgY3VycmVuY3lHcm91cCAgICAgICAgICB8ICQyYCxgMzQ1LjY3ICAgICAgIHwgZ3JvdXBpbmcgc2VwYXJhdG9yLCBmYWxsYmFjayB0byBcImdyb3VwXCIgICAgIHxcbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBlbnVtIE51bWJlclN5bWJvbCB7XG4gIERlY2ltYWwsXG4gIEdyb3VwLFxuICBMaXN0LFxuICBQZXJjZW50U2lnbixcbiAgUGx1c1NpZ24sXG4gIE1pbnVzU2lnbixcbiAgRXhwb25lbnRpYWwsXG4gIFN1cGVyc2NyaXB0aW5nRXhwb25lbnQsXG4gIFBlck1pbGxlLFxuICBJbmZpbml0eSxcbiAgTmFOLFxuICBUaW1lU2VwYXJhdG9yLFxuICBDdXJyZW5jeURlY2ltYWwsXG4gIEN1cnJlbmN5R3JvdXBcbn1cblxuLyoqXG4gKiBUaGUgdmFsdWUgZm9yIGVhY2ggZGF5IG9mIHRoZSB3ZWVrLCBiYXNlZCBvbiB0aGUgZW4tVVMgbG9jYWxlXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZW51bSBXZWVrRGF5IHtcbiAgU3VuZGF5ID0gMCxcbiAgTW9uZGF5LFxuICBUdWVzZGF5LFxuICBXZWRuZXNkYXksXG4gIFRodXJzZGF5LFxuICBGcmlkYXksXG4gIFNhdHVyZGF5XG59XG5cbi8qKlxuICogVGhlIGxvY2FsZSBpZCBmb3IgdGhlIGNob3NlbiBsb2NhbGUgKGUuZyBgZW4tR0JgKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVJZChsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBmaW5kTG9jYWxlRGF0YShsb2NhbGUpW0xvY2FsZURhdGFJbmRleC5Mb2NhbGVJZF07XG59XG5cbi8qKlxuICogUGVyaW9kcyBvZiB0aGUgZGF5IChlLmcuIGBbQU0sIFBNXWAgZm9yIGVuLVVTKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXlQZXJpb2RzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGFtUG1EYXRhID0gPFtcbiAgICBzdHJpbmcsIHN0cmluZ1xuICBdW11bXT5bZGF0YVtMb2NhbGVEYXRhSW5kZXguRGF5UGVyaW9kc0Zvcm1hdF0sIGRhdGFbTG9jYWxlRGF0YUluZGV4LkRheVBlcmlvZHNTdGFuZGFsb25lXV07XG4gIGNvbnN0IGFtUG0gPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGFtUG1EYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShhbVBtLCB3aWR0aCk7XG59XG5cbi8qKlxuICogRGF5cyBvZiB0aGUgd2VlayBmb3IgdGhlIEdyZWdvcmlhbiBjYWxlbmRhciAoZS5nLiBgW1N1bmRheSwgTW9uZGF5LCAuLi4gU2F0dXJkYXldYCBmb3IgZW4tVVMpLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURheU5hbWVzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBkYXlzRGF0YSA9XG4gICAgICA8c3RyaW5nW11bXVtdPltkYXRhW0xvY2FsZURhdGFJbmRleC5EYXlzRm9ybWF0XSwgZGF0YVtMb2NhbGVEYXRhSW5kZXguRGF5c1N0YW5kYWxvbmVdXTtcbiAgY29uc3QgZGF5cyA9IGdldExhc3REZWZpbmVkVmFsdWUoZGF5c0RhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheXMsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBNb250aHMgb2YgdGhlIHllYXIgZm9yIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIgKGUuZy4gYFtKYW51YXJ5LCBGZWJydWFyeSwgLi4uXWAgZm9yIGVuLVVTKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVNb250aE5hbWVzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBtb250aHNEYXRhID1cbiAgICAgIDxzdHJpbmdbXVtdW10+W2RhdGFbTG9jYWxlRGF0YUluZGV4Lk1vbnRoc0Zvcm1hdF0sIGRhdGFbTG9jYWxlRGF0YUluZGV4Lk1vbnRoc1N0YW5kYWxvbmVdXTtcbiAgY29uc3QgbW9udGhzID0gZ2V0TGFzdERlZmluZWRWYWx1ZShtb250aHNEYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShtb250aHMsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBFcmFzIGZvciB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyIChlLmcuIEFEL0JDKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVFcmFOYW1lcyhsb2NhbGU6IHN0cmluZywgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGVyYXNEYXRhID0gPFtzdHJpbmcsIHN0cmluZ11bXT5kYXRhW0xvY2FsZURhdGFJbmRleC5FcmFzXTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZXJhc0RhdGEsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBGaXJzdCBkYXkgb2YgdGhlIHdlZWsgZm9yIHRoaXMgbG9jYWxlLCBiYXNlZCBvbiBlbmdsaXNoIGRheXMgKFN1bmRheSA9IDAsIE1vbmRheSA9IDEsIC4uLikuXG4gKiBGb3IgZXhhbXBsZSBpbiBmcmVuY2ggdGhlIHZhbHVlIHdvdWxkIGJlIDEgYmVjYXVzZSB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrIGlzIE1vbmRheS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVGaXJzdERheU9mV2Vlayhsb2NhbGU6IHN0cmluZyk6IFdlZWtEYXkge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4LkZpcnN0RGF5T2ZXZWVrXTtcbn1cblxuLyoqXG4gKiBSYW5nZSBvZiBkYXlzIGluIHRoZSB3ZWVrIHRoYXQgcmVwcmVzZW50IHRoZSB3ZWVrLWVuZCBmb3IgdGhpcyBsb2NhbGUsIGJhc2VkIG9uIGVuZ2xpc2ggZGF5c1xuICogKFN1bmRheSA9IDAsIE1vbmRheSA9IDEsIC4uLikuXG4gKiBGb3IgZXhhbXBsZSBpbiBlbmdsaXNoIHRoZSB2YWx1ZSB3b3VsZCBiZSBbNiwwXSBmb3IgU2F0dXJkYXkgdG8gU3VuZGF5LlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZVdlZWtFbmRSYW5nZShsb2NhbGU6IHN0cmluZyk6IFtXZWVrRGF5LCBXZWVrRGF5XSB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVtMb2NhbGVEYXRhSW5kZXguV2Vla2VuZFJhbmdlXTtcbn1cblxuLyoqXG4gKiBEYXRlIGZvcm1hdCB0aGF0IGRlcGVuZHMgb24gdGhlIGxvY2FsZS5cbiAqXG4gKiBUaGVyZSBhcmUgZm91ciBiYXNpYyBkYXRlIGZvcm1hdHM6XG4gKiAtIGBmdWxsYCBzaG91bGQgY29udGFpbiBsb25nLXdlZWtkYXkgKEVFRUUpLCB5ZWFyICh5KSwgbG9uZy1tb250aCAoTU1NTSksIGRheSAoZCkuXG4gKlxuICogIEZvciBleGFtcGxlLCBFbmdsaXNoIHVzZXMgYEVFRUUsIE1NTU0gZCwgeWAsIGNvcnJlc3BvbmRpbmcgdG8gYSBkYXRlIGxpa2VcbiAqICBcIlR1ZXNkYXksIFNlcHRlbWJlciAxNCwgMTk5OVwiLlxuICpcbiAqIC0gYGxvbmdgIHNob3VsZCBjb250YWluIHllYXIsIGxvbmctbW9udGgsIGRheS5cbiAqXG4gKiAgRm9yIGV4YW1wbGUsIGBNTU1NIGQsIHlgLCBjb3JyZXNwb25kaW5nIHRvIGEgZGF0ZSBsaWtlIFwiU2VwdGVtYmVyIDE0LCAxOTk5XCIuXG4gKlxuICogLSBgbWVkaXVtYCBzaG91bGQgY29udGFpbiB5ZWFyLCBhYmJyZXZpYXRlZC1tb250aCAoTU1NKSwgZGF5LlxuICpcbiAqICBGb3IgZXhhbXBsZSwgYE1NTSBkLCB5YCwgY29ycmVzcG9uZGluZyB0byBhIGRhdGUgbGlrZSBcIlNlcCAxNCwgMTk5OVwiLlxuICogIEZvciBsYW5ndWFnZXMgdGhhdCBkbyBub3QgdXNlIGFiYnJldmlhdGVkIG1vbnRocywgdXNlIHRoZSBudW1lcmljIG1vbnRoIChNTS9NKS4gRm9yIGV4YW1wbGUsXG4gKiAgYHkvTU0vZGRgLCBjb3JyZXNwb25kaW5nIHRvIGEgZGF0ZSBsaWtlIFwiMTk5OS8wOS8xNFwiLlxuICpcbiAqIC0gYHNob3J0YCBzaG91bGQgY29udGFpbiB5ZWFyLCBudW1lcmljLW1vbnRoIChNTS9NKSwgYW5kIGRheS5cbiAqXG4gKiAgRm9yIGV4YW1wbGUsIGBNL2QveXlgLCBjb3JyZXNwb25kaW5nIHRvIGEgZGF0ZSBsaWtlIFwiOS8xNC85OVwiLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXRhW0xvY2FsZURhdGFJbmRleC5EYXRlRm9ybWF0XSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIFRpbWUgZm9ybWF0IHRoYXQgZGVwZW5kcyBvbiB0aGUgbG9jYWxlLlxuICpcbiAqIFRoZSBzdGFuZGFyZCBmb3JtYXRzIGluY2x1ZGUgZm91ciBiYXNpYyB0aW1lIGZvcm1hdHM6XG4gKiAtIGBmdWxsYCBzaG91bGQgY29udGFpbiBob3VyIChoL0gpLCBtaW51dGUgKG1tKSwgc2Vjb25kIChzcyksIGFuZCB6b25lICh6enp6KS5cbiAqIC0gYGxvbmdgIHNob3VsZCBjb250YWluIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBhbmQgem9uZSAoeilcbiAqIC0gYG1lZGl1bWAgc2hvdWxkIGNvbnRhaW4gaG91ciwgbWludXRlLCBzZWNvbmQuXG4gKiAtIGBzaG9ydGAgc2hvdWxkIGNvbnRhaW4gaG91ciwgbWludXRlLlxuICpcbiAqIE5vdGU6IFRoZSBwYXR0ZXJucyBkZXBlbmQgb24gd2hldGhlciB0aGUgbWFpbiBjb3VudHJ5IHVzaW5nIHlvdXIgbGFuZ3VhZ2UgdXNlcyAxMi1ob3VyIHRpbWUgb3JcbiAqIG5vdDpcbiAqIC0gRm9yIDEyLWhvdXIgdGltZSwgdXNlIGEgcGF0dGVybiBsaWtlIGBoaDptbSBhYCB1c2luZyBoIHRvIG1lYW4gYSAxMi1ob3VyIGNsb2NrIGN5Y2xlIHJ1bm5pbmdcbiAqIDEgdGhyb3VnaCAxMiAobWlkbmlnaHQgcGx1cyAxIG1pbnV0ZSBpcyAxMjowMSksIG9yIHVzaW5nIEsgdG8gbWVhbiBhIDEyLWhvdXIgY2xvY2sgY3ljbGVcbiAqIHJ1bm5pbmcgMCB0aHJvdWdoIDExIChtaWRuaWdodCBwbHVzIDEgbWludXRlIGlzIDA6MDEpLlxuICogLSBGb3IgMjQtaG91ciB0aW1lLCB1c2UgYSBwYXR0ZXJuIGxpa2UgYEhIOm1tYCB1c2luZyBIIHRvIG1lYW4gYSAyNC1ob3VyIGNsb2NrIGN5Y2xlIHJ1bm5pbmcgMFxuICogdGhyb3VnaCAyMyAobWlkbmlnaHQgcGx1cyAxIG1pbnV0ZSBpcyAwOjAxKSwgb3IgdXNpbmcgayB0byBtZWFuIGEgMjQtaG91ciBjbG9jayBjeWNsZSBydW5uaW5nXG4gKiAxIHRocm91Z2ggMjQgKG1pZG5pZ2h0IHBsdXMgMSBtaW51dGUgaXMgMjQ6MDEpLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXRhW0xvY2FsZURhdGFJbmRleC5UaW1lRm9ybWF0XSwgd2lkdGgpO1xufVxuXG4vKipcbiAqIERhdGUtdGltZSBmb3JtYXQgdGhhdCBkZXBlbmRzIG9uIHRoZSBsb2NhbGUuXG4gKlxuICogVGhlIGRhdGUtdGltZSBwYXR0ZXJuIHNob3dzIGhvdyB0byBjb21iaW5lIHNlcGFyYXRlIHBhdHRlcm5zIGZvciBkYXRlIChyZXByZXNlbnRlZCBieSB7MX0pXG4gKiBhbmQgdGltZSAocmVwcmVzZW50ZWQgYnkgezB9KSBpbnRvIGEgc2luZ2xlIHBhdHRlcm4uIEl0IHVzdWFsbHkgZG9lc24ndCBuZWVkIHRvIGJlIGNoYW5nZWQuXG4gKiBXaGF0IHlvdSB3YW50IHRvIHBheSBhdHRlbnRpb24gdG8gYXJlOlxuICogLSBwb3NzaWJseSByZW1vdmluZyBhIHNwYWNlIGZvciBsYW5ndWFnZXMgdGhhdCBkb24ndCB1c2UgaXQsIHN1Y2ggYXMgbWFueSBFYXN0IEFzaWFuIGxhbmd1YWdlc1xuICogLSBwb3NzaWJseSBhZGRpbmcgYSBjb21tYSwgb3RoZXIgcHVuY3R1YXRpb24sIG9yIGEgY29tYmluaW5nIHdvcmRcbiAqXG4gKiBGb3IgZXhhbXBsZTpcbiAqIC0gRW5nbGlzaCB1c2VzIGB7MX0gJ2F0JyB7MH1gIG9yIGB7MX0sIHswfWAgKGRlcGVuZGluZyBvbiBkYXRlIHN0eWxlKSwgd2hpbGUgSmFwYW5lc2UgdXNlc1xuICogIGB7MX17MH1gLlxuICogLSBBbiBFbmdsaXNoIGZvcm1hdHRlZCBkYXRlLXRpbWUgdXNpbmcgdGhlIGNvbWJpbmluZyBwYXR0ZXJuIGB7MX0sIHswfWAgY291bGQgYmVcbiAqICBgRGVjIDEwLCAyMDEwLCAzOjU5OjQ5IFBNYC4gTm90aWNlIHRoZSBjb21tYSBhbmQgc3BhY2UgYmV0d2VlbiB0aGUgZGF0ZSBwb3J0aW9uIGFuZCB0aGUgdGltZVxuICogIHBvcnRpb24uXG4gKlxuICogVGhlcmUgYXJlIGZvdXIgZm9ybWF0cyAoYGZ1bGxgLCBgbG9uZ2AsIGBtZWRpdW1gLCBgc2hvcnRgKTsgdGhlIGRldGVybWluYXRpb24gb2Ygd2hpY2ggdG8gdXNlXG4gKiBpcyBub3JtYWxseSBiYXNlZCBvbiB0aGUgZGF0ZSBzdHlsZS4gRm9yIGV4YW1wbGUsIGlmIHRoZSBkYXRlIGhhcyBhIGZ1bGwgbW9udGggYW5kIHdlZWtkYXlcbiAqIG5hbWUsIHRoZSBmdWxsIGNvbWJpbmluZyBwYXR0ZXJuIHdpbGwgYmUgdXNlZCB0byBjb21iaW5lIHRoYXQgd2l0aCBhIHRpbWUuIElmIHRoZSBkYXRlIGhhc1xuICogbnVtZXJpYyBtb250aCwgdGhlIHNob3J0IHZlcnNpb24gb2YgdGhlIGNvbWJpbmluZyBwYXR0ZXJuIHdpbGwgYmUgdXNlZCB0byBjb21iaW5lIHRoYXQgd2l0aCBhXG4gKiB0aW1lLiBFbmdsaXNoIHVzZXMgYHsxfSAnYXQnIHswfWAgZm9yIGZ1bGwgYW5kIGxvbmcgc3R5bGVzLCBhbmQgYHsxfSwgezB9YCBmb3IgbWVkaXVtIGFuZCBzaG9ydFxuICogc3R5bGVzLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB3aWR0aDogRm9ybWF0V2lkdGgpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgZGF0ZVRpbWVGb3JtYXREYXRhID0gPHN0cmluZ1tdPmRhdGFbTG9jYWxlRGF0YUluZGV4LkRhdGVUaW1lRm9ybWF0XTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF0ZVRpbWVGb3JtYXREYXRhLCB3aWR0aCk7XG59XG5cbi8qKlxuICogTnVtYmVyIHN5bWJvbCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIG51bWJlciBmb3JtYXRzLlxuICogU2VlIHtAbGluayBOdW1iZXJTeW1ib2x9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGU6IHN0cmluZywgc3ltYm9sOiBOdW1iZXJTeW1ib2wpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgcmVzID0gZGF0YVtMb2NhbGVEYXRhSW5kZXguTnVtYmVyU3ltYm9sc11bc3ltYm9sXTtcbiAgaWYgKHR5cGVvZiByZXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHN5bWJvbCA9PT0gTnVtYmVyU3ltYm9sLkN1cnJlbmN5RGVjaW1hbCkge1xuICAgICAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4Lk51bWJlclN5bWJvbHNdW051bWJlclN5bWJvbC5EZWNpbWFsXTtcbiAgICB9IGVsc2UgaWYgKHN5bWJvbCA9PT0gTnVtYmVyU3ltYm9sLkN1cnJlbmN5R3JvdXApIHtcbiAgICAgIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtOdW1iZXJTeW1ib2wuR3JvdXBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIE51bWJlciBmb3JtYXQgdGhhdCBkZXBlbmRzIG9uIHRoZSBsb2NhbGUuXG4gKlxuICogTnVtYmVycyBhcmUgZm9ybWF0dGVkIHVzaW5nIHBhdHRlcm5zLCBsaWtlIGAjLCMjIy4wMGAuIEZvciBleGFtcGxlLCB0aGUgcGF0dGVybiBgIywjIyMuMDBgXG4gKiB3aGVuIHVzZWQgdG8gZm9ybWF0IHRoZSBudW1iZXIgMTIzNDUuNjc4IGNvdWxkIHJlc3VsdCBpbiBcIjEyJzM0NSw2N1wiLiBUaGF0IHdvdWxkIGhhcHBlbiBpZiB0aGVcbiAqIGdyb3VwaW5nIHNlcGFyYXRvciBmb3IgeW91ciBsYW5ndWFnZSBpcyBhbiBhcG9zdHJvcGhlLCBhbmQgdGhlIGRlY2ltYWwgc2VwYXJhdG9yIGlzIGEgY29tbWEuXG4gKlxuICogPGI+SW1wb3J0YW50OjwvYj4gVGhlIGNoYXJhY3RlcnMgYC5gIGAsYCBgMGAgYCNgIChhbmQgb3RoZXJzIGJlbG93KSBhcmUgc3BlY2lhbCBwbGFjZWhvbGRlcnM7XG4gKiB0aGV5IHN0YW5kIGZvciB0aGUgZGVjaW1hbCBzZXBhcmF0b3IsIGFuZCBzbyBvbiwgYW5kIGFyZSBOT1QgcmVhbCBjaGFyYWN0ZXJzLlxuICogWW91IG11c3QgTk9UIFwidHJhbnNsYXRlXCIgdGhlIHBsYWNlaG9sZGVyczsgZm9yIGV4YW1wbGUsIGRvbid0IGNoYW5nZSBgLmAgdG8gYCxgIGV2ZW4gdGhvdWdoIGluXG4gKiB5b3VyIGxhbmd1YWdlIHRoZSBkZWNpbWFsIHBvaW50IGlzIHdyaXR0ZW4gd2l0aCBhIGNvbW1hLiBUaGUgc3ltYm9scyBzaG91bGQgYmUgcmVwbGFjZWQgYnkgdGhlXG4gKiBsb2NhbCBlcXVpdmFsZW50cywgdXNpbmcgdGhlIE51bWJlciBTeW1ib2xzIGZvciB5b3VyIGxhbmd1YWdlLlxuICpcbiAqIEhlcmUgYXJlIHRoZSBzcGVjaWFsIGNoYXJhY3RlcnMgdXNlZCBpbiBudW1iZXIgcGF0dGVybnM6XG4gKlxuICogfCBTeW1ib2wgfCBNZWFuaW5nIHxcbiAqIHwtLS0tLS0tLXwtLS0tLS0tLS18XG4gKiB8IC4gfCBSZXBsYWNlZCBhdXRvbWF0aWNhbGx5IGJ5IHRoZSBjaGFyYWN0ZXIgdXNlZCBmb3IgdGhlIGRlY2ltYWwgcG9pbnQuIHxcbiAqIHwgLCB8IFJlcGxhY2VkIGJ5IHRoZSBcImdyb3VwaW5nXCIgKHRob3VzYW5kcykgc2VwYXJhdG9yLiB8XG4gKiB8IDAgfCBSZXBsYWNlZCBieSBhIGRpZ2l0IChvciB6ZXJvIGlmIHRoZXJlIGFyZW4ndCBlbm91Z2ggZGlnaXRzKS4gfFxuICogfCAjIHwgUmVwbGFjZWQgYnkgYSBkaWdpdCAob3Igbm90aGluZyBpZiB0aGVyZSBhcmVuJ3QgZW5vdWdoKS4gfFxuICogfCDCpCB8IFRoaXMgd2lsbCBiZSByZXBsYWNlZCBieSBhIGN1cnJlbmN5IHN5bWJvbCwgc3VjaCBhcyAkIG9yIFVTRC4gfFxuICogfCAlIHwgVGhpcyBtYXJrcyBhIHBlcmNlbnQgZm9ybWF0LiBUaGUgJSBzeW1ib2wgbWF5IGNoYW5nZSBwb3NpdGlvbiwgYnV0IG11c3QgYmUgcmV0YWluZWQuIHxcbiAqIHwgRSB8IFRoaXMgbWFya3MgYSBzY2llbnRpZmljIGZvcm1hdC4gVGhlIEUgc3ltYm9sIG1heSBjaGFuZ2UgcG9zaXRpb24sIGJ1dCBtdXN0IGJlIHJldGFpbmVkLiB8XG4gKiB8ICcgfCBTcGVjaWFsIGNoYXJhY3RlcnMgdXNlZCBhcyBsaXRlcmFsIGNoYXJhY3RlcnMgYXJlIHF1b3RlZCB3aXRoIEFTQ0lJIHNpbmdsZSBxdW90ZXMuIHxcbiAqXG4gKiBZb3UgY2FuIGZpbmQgbW9yZSBpbmZvcm1hdGlvblxuICogW29uIHRoZSBDTERSIHdlYnNpdGVdKGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL3RyYW5zbGF0aW9uL251bWJlci1wYXR0ZXJucylcbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVOdW1iZXJGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHR5cGU6IE51bWJlckZvcm1hdFN0eWxlKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5OdW1iZXJGb3JtYXRzXVt0eXBlXTtcbn1cblxuLyoqXG4gKiBUaGUgc3ltYm9sIHVzZWQgdG8gcmVwcmVzZW50IHRoZSBjdXJyZW5jeSBmb3IgdGhlIG1haW4gY291bnRyeSB1c2luZyB0aGlzIGxvY2FsZSAoZS5nLiAkIGZvclxuICogdGhlIGxvY2FsZSBlbi1VUykuXG4gKiBUaGUgc3ltYm9sIHdpbGwgYmUgYG51bGxgIGlmIHRoZSBtYWluIGNvdW50cnkgY2Fubm90IGJlIGRldGVybWluZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlQ3VycmVuY3lTeW1ib2wobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVtMb2NhbGVEYXRhSW5kZXguQ3VycmVuY3lTeW1ib2xdIHx8IG51bGw7XG59XG5cbi8qKlxuICogVGhlIG5hbWUgb2YgdGhlIGN1cnJlbmN5IGZvciB0aGUgbWFpbiBjb3VudHJ5IHVzaW5nIHRoaXMgbG9jYWxlIChlLmcuIFVTRCBmb3IgdGhlIGxvY2FsZVxuICogZW4tVVMpLlxuICogVGhlIG5hbWUgd2lsbCBiZSBgbnVsbGAgaWYgdGhlIG1haW4gY291bnRyeSBjYW5ub3QgYmUgZGV0ZXJtaW5lZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeU5hbWUobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVtMb2NhbGVEYXRhSW5kZXguQ3VycmVuY3lOYW1lXSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbmN5IHZhbHVlcyBmb3IgdGhlIGxvY2FsZVxuICovXG5mdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jaWVzKGxvY2FsZTogc3RyaW5nKToge1tjb2RlOiBzdHJpbmddOiBDdXJyZW5jaWVzU3ltYm9sc30ge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4LkN1cnJlbmNpZXNdO1xufVxuXG4vKipcbiAqIFRoZSBsb2NhbGUgcGx1cmFsIGZ1bmN0aW9uIHVzZWQgYnkgSUNVIGV4cHJlc3Npb25zIHRvIGRldGVybWluZSB0aGUgcGx1cmFsIGNhc2UgdG8gdXNlLlxuICogU2VlIHtAbGluayBOZ1BsdXJhbH0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlUGx1cmFsQ2FzZShsb2NhbGU6IHN0cmluZyk6ICh2YWx1ZTogbnVtYmVyKSA9PiBQbHVyYWwge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4LlBsdXJhbENhc2VdO1xufVxuXG5mdW5jdGlvbiBjaGVja0Z1bGxEYXRhKGRhdGE6IGFueSkge1xuICBpZiAoIWRhdGFbTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBNaXNzaW5nIGV4dHJhIGxvY2FsZSBkYXRhIGZvciB0aGUgbG9jYWxlIFwiJHtkYXRhW0xvY2FsZURhdGFJbmRleC5Mb2NhbGVJZF19XCIuIFVzZSBcInJlZ2lzdGVyTG9jYWxlRGF0YVwiIHRvIGxvYWQgbmV3IGRhdGEuIFNlZSB0aGUgXCJJMThuIGd1aWRlXCIgb24gYW5ndWxhci5pbyB0byBrbm93IG1vcmUuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSdWxlcyB1c2VkIHRvIGRldGVybWluZSB3aGljaCBkYXkgcGVyaW9kIHRvIHVzZSAoU2VlIGBkYXlQZXJpb2RzYCBiZWxvdykuXG4gKiBUaGUgcnVsZXMgY2FuIGVpdGhlciBiZSBhbiBhcnJheSBvciBhIHNpbmdsZSB2YWx1ZS4gSWYgaXQncyBhbiBhcnJheSwgY29uc2lkZXIgaXQgYXMgXCJmcm9tXCJcbiAqIGFuZCBcInRvXCIuIElmIGl0J3MgYSBzaW5nbGUgdmFsdWUgdGhlbiBpdCBtZWFucyB0aGF0IHRoZSBwZXJpb2QgaXMgb25seSB2YWxpZCBhdCB0aGlzIGV4YWN0XG4gKiB2YWx1ZS5cbiAqIFRoZXJlIGlzIGFsd2F5cyB0aGUgc2FtZSBudW1iZXIgb2YgcnVsZXMgYXMgdGhlIG51bWJlciBvZiBkYXkgcGVyaW9kcywgd2hpY2ggbWVhbnMgdGhhdCB0aGVcbiAqIGZpcnN0IHJ1bGUgaXMgYXBwbGllZCB0byB0aGUgZmlyc3QgZGF5IHBlcmlvZCBhbmQgc28gb24uXG4gKiBZb3Ugc2hvdWxkIGZhbGxiYWNrIHRvIEFNL1BNIHdoZW4gdGhlcmUgYXJlIG5vIHJ1bGVzIGF2YWlsYWJsZS5cbiAqXG4gKiBOb3RlOiB0aGlzIGlzIG9ubHkgYXZhaWxhYmxlIGlmIHlvdSBsb2FkIHRoZSBmdWxsIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSB7QGxpbmtEb2NzIGd1aWRlL2kxOG4jaTE4bi1waXBlcyBcIkkxOG4gZ3VpZGVcIn0gdG8ga25vdyBob3cgdG8gaW1wb3J0IGFkZGl0aW9uYWwgbG9jYWxlXG4gKiBkYXRhLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXMobG9jYWxlOiBzdHJpbmcpOiAoVGltZSB8IFtUaW1lLCBUaW1lXSlbXSB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjaGVja0Z1bGxEYXRhKGRhdGEpO1xuICBjb25zdCBydWxlcyA9IGRhdGFbTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV1bRXh0cmFMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXlQZXJpb2RzUnVsZXNdIHx8IFtdO1xuICByZXR1cm4gcnVsZXMubWFwKChydWxlOiBzdHJpbmcgfCBbc3RyaW5nLCBzdHJpbmddKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBydWxlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGV4dHJhY3RUaW1lKHJ1bGUpO1xuICAgIH1cbiAgICByZXR1cm4gW2V4dHJhY3RUaW1lKHJ1bGVbMF0pLCBleHRyYWN0VGltZShydWxlWzFdKV07XG4gIH0pO1xufVxuXG4vKipcbiAqIERheSBQZXJpb2RzIGluZGljYXRlIHJvdWdobHkgaG93IHRoZSBkYXkgaXMgYnJva2VuIHVwIGluIGRpZmZlcmVudCBsYW5ndWFnZXMgKGUuZy4gbW9ybmluZyxcbiAqIG5vb24sIGFmdGVybm9vbiwgbWlkbmlnaHQsIC4uLikuXG4gKiBZb3Ugc2hvdWxkIHVzZSB0aGUgZnVuY3Rpb24ge0BsaW5rIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXN9IHRvIGRldGVybWluZSB3aGljaCBwZXJpb2QgdG9cbiAqIHVzZS5cbiAqIFlvdSBzaG91bGQgZmFsbGJhY2sgdG8gQU0vUE0gd2hlbiB0aGVyZSBhcmUgbm8gZGF5IHBlcmlvZHMgYXZhaWxhYmxlLlxuICpcbiAqIE5vdGU6IHRoaXMgaXMgb25seSBhdmFpbGFibGUgaWYgeW91IGxvYWQgdGhlIGZ1bGwgbG9jYWxlIGRhdGEuXG4gKiBTZWUgdGhlIHtAbGlua0RvY3MgZ3VpZGUvaTE4biNpMThuLXBpcGVzIFwiSTE4biBndWlkZVwifSB0byBrbm93IGhvdyB0byBpbXBvcnQgYWRkaXRpb25hbCBsb2NhbGVcbiAqIGRhdGEuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzKFxuICAgIGxvY2FsZTogc3RyaW5nLCBmb3JtU3R5bGU6IEZvcm1TdHlsZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGRhdGEgPSBmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjaGVja0Z1bGxEYXRhKGRhdGEpO1xuICBjb25zdCBkYXlQZXJpb2RzRGF0YSA9IDxzdHJpbmdbXVtdW10+W1xuICAgIGRhdGFbTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV1bRXh0cmFMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXlQZXJpb2RGb3JtYXRzXSxcbiAgICBkYXRhW0xvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW0V4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kU3RhbmRhbG9uZV1cbiAgXTtcbiAgY29uc3QgZGF5UGVyaW9kcyA9IGdldExhc3REZWZpbmVkVmFsdWUoZGF5UGVyaW9kc0RhdGEsIGZvcm1TdHlsZSkgfHwgW107XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheVBlcmlvZHMsIHdpZHRoKSB8fCBbXTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCB2YWx1ZSB0aGF0IGlzIGRlZmluZWQgaW4gYW4gYXJyYXksIGdvaW5nIGJhY2t3YXJkcy5cbiAqXG4gKiBUbyBhdm9pZCByZXBlYXRpbmcgdGhlIHNhbWUgZGF0YSAoZS5nLiB3aGVuIFwiZm9ybWF0XCIgYW5kIFwic3RhbmRhbG9uZVwiIGFyZSB0aGUgc2FtZSkgd2Ugb25seVxuICogYWRkIHRoZSBmaXJzdCBvbmUgdG8gdGhlIGxvY2FsZSBkYXRhIGFycmF5cywgdGhlIG90aGVyIG9uZXMgYXJlIG9ubHkgZGVmaW5lZCB3aGVuIGRpZmZlcmVudC5cbiAqIFdlIHVzZSB0aGlzIGZ1bmN0aW9uIHRvIHJldHJpZXZlIHRoZSBmaXJzdCBkZWZpbmVkIHZhbHVlLlxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZnVuY3Rpb24gZ2V0TGFzdERlZmluZWRWYWx1ZTxUPihkYXRhOiBUW10sIGluZGV4OiBudW1iZXIpOiBUIHtcbiAgZm9yIChsZXQgaSA9IGluZGV4OyBpID4gLTE7IGktLSkge1xuICAgIGlmICh0eXBlb2YgZGF0YVtpXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBkYXRhW2ldO1xuICAgIH1cbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBkYXRhIEFQSTogbG9jYWxlIGRhdGEgdW5kZWZpbmVkJyk7XG59XG5cbi8qKlxuICogQSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGltZSB3aXRoIGhvdXJzIGFuZCBtaW51dGVzXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgdHlwZSBUaW1lID0ge1xuICBob3VyczogbnVtYmVyLFxuICBtaW51dGVzOiBudW1iZXJcbn07XG5cbi8qKlxuICogRXh0cmFjdCB0aGUgaG91cnMgYW5kIG1pbnV0ZXMgZnJvbSBhIHN0cmluZyBsaWtlIFwiMTU6NDVcIlxuICovXG5mdW5jdGlvbiBleHRyYWN0VGltZSh0aW1lOiBzdHJpbmcpOiBUaW1lIHtcbiAgY29uc3QgW2gsIG1dID0gdGltZS5zcGxpdCgnOicpO1xuICByZXR1cm4ge2hvdXJzOiAraCwgbWludXRlczogK219O1xufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBsb2NhbGUgZGF0YSBmb3IgYSBsb2NhbGUgaWRcbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTG9jYWxlRGF0YShsb2NhbGU6IHN0cmluZyk6IGFueSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRMb2NhbGUgPSBsb2NhbGUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9fL2csICctJyk7XG5cbiAgbGV0IG1hdGNoID0gTE9DQUxFX0RBVEFbbm9ybWFsaXplZExvY2FsZV07XG4gIGlmIChtYXRjaCkge1xuICAgIHJldHVybiBtYXRjaDtcbiAgfVxuXG4gIC8vIGxldCdzIHRyeSB0byBmaW5kIGEgcGFyZW50IGxvY2FsZVxuICBjb25zdCBwYXJlbnRMb2NhbGUgPSBub3JtYWxpemVkTG9jYWxlLnNwbGl0KCctJylbMF07XG4gIG1hdGNoID0gTE9DQUxFX0RBVEFbcGFyZW50TG9jYWxlXTtcblxuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4gbWF0Y2g7XG4gIH1cblxuICBpZiAocGFyZW50TG9jYWxlID09PSAnZW4nKSB7XG4gICAgcmV0dXJuIGxvY2FsZUVuO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIGxvY2FsZSBkYXRhIGZvciB0aGUgbG9jYWxlIFwiJHtsb2NhbGV9XCIuYCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVuY3kgc3ltYm9sIGZvciBhIGdpdmVuIGN1cnJlbmN5IGNvZGUsIG9yIHRoZSBjb2RlIGlmIG5vIHN5bWJvbCBhdmFpbGFibGVcbiAqIChlLmcuOiBmb3JtYXQgbmFycm93ID0gJCwgZm9ybWF0IHdpZGUgPSBVUyQsIGNvZGUgPSBVU0QpXG4gKiBJZiBubyBsb2NhbGUgaXMgcHJvdmlkZWQsIGl0IHVzZXMgdGhlIGxvY2FsZSBcImVuXCIgYnkgZGVmYXVsdFxuICpcbiAqIEBleHBlcmltZW50YWwgaTE4biBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbmN5U3ltYm9sKGNvZGU6IHN0cmluZywgZm9ybWF0OiAnd2lkZScgfCAnbmFycm93JywgbG9jYWxlID0gJ2VuJyk6IHN0cmluZyB7XG4gIGNvbnN0IGN1cnJlbmN5ID0gZ2V0TG9jYWxlQ3VycmVuY2llcyhsb2NhbGUpW2NvZGVdIHx8IENVUlJFTkNJRVNfRU5bY29kZV0gfHwgW107XG4gIGNvbnN0IHN5bWJvbE5hcnJvdyA9IGN1cnJlbmN5W0N1cnJlbmN5SW5kZXguU3ltYm9sTmFycm93XTtcblxuICBpZiAoZm9ybWF0ID09PSAnbmFycm93JyAmJiB0eXBlb2Ygc3ltYm9sTmFycm93ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzeW1ib2xOYXJyb3c7XG4gIH1cblxuICByZXR1cm4gY3VycmVuY3lbQ3VycmVuY3lJbmRleC5TeW1ib2xdIHx8IGNvZGU7XG59XG5cbi8vIE1vc3QgY3VycmVuY2llcyBoYXZlIGNlbnRzLCB0aGF0J3Mgd2h5IHRoZSBkZWZhdWx0IGlzIDJcbmNvbnN0IERFRkFVTFRfTkJfT0ZfQ1VSUkVOQ1lfRElHSVRTID0gMjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZGVjaW1hbCBkaWdpdHMgZm9yIHRoZSBnaXZlbiBjdXJyZW5jeS5cbiAqIEl0cyB2YWx1ZSBkZXBlbmRzIHVwb24gdGhlIHByZXNlbmNlIG9mIGNlbnRzIGluIHRoYXQgcGFydGljdWxhciBjdXJyZW5jeS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROdW1iZXJPZkN1cnJlbmN5RGlnaXRzKGNvZGU6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBkaWdpdHM7XG4gIGNvbnN0IGN1cnJlbmN5ID0gQ1VSUkVOQ0lFU19FTltjb2RlXTtcbiAgaWYgKGN1cnJlbmN5KSB7XG4gICAgZGlnaXRzID0gY3VycmVuY3lbQ3VycmVuY3lJbmRleC5OYk9mRGlnaXRzXTtcbiAgfVxuICByZXR1cm4gdHlwZW9mIGRpZ2l0cyA9PT0gJ251bWJlcicgPyBkaWdpdHMgOiBERUZBVUxUX05CX09GX0NVUlJFTkNZX0RJR0lUUztcbn1cbiJdfQ==
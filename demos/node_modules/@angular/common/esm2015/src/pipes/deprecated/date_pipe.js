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
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { ISO8601_DATE_REGEX, isoStringToDate } from '../../i18n/format_date';
import { invalidPipeArgumentError } from '../invalid_pipe_argument_error';
import { DateFormatter } from './intl';
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Formats a date according to locale rules.
 *
 * Where:
 * - `expression` is a date object or a number (milliseconds since UTC epoch) or an ISO string
 * (https://www.w3.org/TR/NOTE-datetime).
 * - `format` indicates which date/time components to include. The format can be predefined as
 *   shown below or custom as shown in the table.
 *   - `'medium'`: equivalent to `'yMMMdjms'` (e.g. `Sep 3, 2010, 12:05:08 PM` for `en-US`)
 *   - `'short'`: equivalent to `'yMdjm'` (e.g. `9/3/2010, 12:05 PM` for `en-US`)
 *   - `'fullDate'`: equivalent to `'yMMMMEEEEd'` (e.g. `Friday, September 3, 2010` for `en-US`)
 *   - `'longDate'`: equivalent to `'yMMMMd'` (e.g. `September 3, 2010` for `en-US`)
 *   - `'mediumDate'`: equivalent to `'yMMMd'` (e.g. `Sep 3, 2010` for `en-US`)
 *   - `'shortDate'`: equivalent to `'yMd'` (e.g. `9/3/2010` for `en-US`)
 *   - `'mediumTime'`: equivalent to `'jms'` (e.g. `12:05:08 PM` for `en-US`)
 *   - `'shortTime'`: equivalent to `'jm'` (e.g. `12:05 PM` for `en-US`)
 *
 *
 *  | Component | Symbol | Narrow | Short Form   | Long Form         | Numeric   | 2-digit   |
 *  |-----------|:------:|--------|--------------|-------------------|-----------|-----------|
 *  | era       |   G    | G (A)  | GGG (AD)     | GGGG (Anno Domini)| -         | -         |
 *  | year      |   y    | -      | -            | -                 | y (2015)  | yy (15)   |
 *  | month     |   M    | L (S)  | MMM (Sep)    | MMMM (September)  | M (9)     | MM (09)   |
 *  | day       |   d    | -      | -            | -                 | d (3)     | dd (03)   |
 *  | weekday   |   E    | E (S)  | EEE (Sun)    | EEEE (Sunday)     | -         | -         |
 *  | hour      |   j    | -      | -            | -                 | j (13)    | jj (13)   |
 *  | hour12    |   h    | -      | -            | -                 | h (1 PM)  | hh (01 PM)|
 *  | hour24    |   H    | -      | -            | -                 | H (13)    | HH (13)   |
 *  | minute    |   m    | -      | -            | -                 | m (5)     | mm (05)   |
 *  | second    |   s    | -      | -            | -                 | s (9)     | ss (09)   |
 *  | timezone  |   z    | -      | -            | z (Pacific Standard Time)| -  | -         |
 *  | timezone  |   Z    | -      | Z (GMT-8:00) | -                 | -         | -         |
 *  | timezone  |   a    | -      | a (PM)       | -                 | -         | -         |
 *
 * In javascript, only the components specified will be respected (not the ordering,
 * punctuations, ...) and details of the formatting will be dependent on the locale.
 *
 * Timezone of the formatted text will be the local system timezone of the end-user's machine.
 *
 * When the expression is a ISO string without time (e.g. 2016-09-19) the time zone offset is not
 * applied and the formatted text will have the same day, month and year of the expression.
 *
 * WARNINGS:
 * - this pipe is marked as pure hence it will not be re-evaluated when the input is mutated.
 *   Instead users should treat the date as an immutable object and change the reference when the
 *   pipe needs to re-run (this is to avoid reformatting the date on every change detection run
 *   which would be an expensive operation).
 * - this pipe uses the Internationalization API. Therefore it is only reliable in Chrome and Opera
 *   browsers.
 *
 * ### Examples
 *
 * Assuming `dateObj` is (year: 2010, month: 9, day: 3, hour: 12 PM, minute: 05, second: 08)
 * in the _local_ time and locale is 'en-US':
 *
 * {\@example common/pipes/ts/date_pipe.ts region='DeprecatedDatePipe'}
 *
 *
 */
export class DeprecatedDatePipe {
    /**
     * @param {?} _locale
     */
    constructor(_locale) {
        this._locale = _locale;
    }
    /**
     * @param {?} value
     * @param {?=} pattern
     * @return {?}
     */
    transform(value, pattern = 'mediumDate') {
        if (value == null || value === '' || value !== value)
            return null;
        let /** @type {?} */ date;
        if (typeof value === 'string') {
            value = value.trim();
        }
        if (isDate(value)) {
            date = value;
        }
        else if (!isNaN(value - parseFloat(value))) {
            date = new Date(parseFloat(value));
        }
        else if (typeof value === 'string' && /^(\d{4}-\d{1,2}-\d{1,2})$/.test(value)) {
            /**
             * For ISO Strings without time the day, month and year must be extracted from the ISO String
             * before Date creation to avoid time offset and errors in the new Date.
             * If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
             * date, some browsers (e.g. IE 9) will throw an invalid Date error
             * If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the
             * timeoffset
             * is applied
             * Note: ISO months are 0 for January, 1 for February, ...
             */
            const [y, m, d] = value.split('-').map((val) => parseInt(val, 10));
            date = new Date(y, m - 1, d);
        }
        else {
            date = new Date(value);
        }
        if (!isDate(date)) {
            let /** @type {?} */ match;
            if ((typeof value === 'string') && (match = value.match(ISO8601_DATE_REGEX))) {
                date = isoStringToDate(match);
            }
            else {
                throw invalidPipeArgumentError(DeprecatedDatePipe, value);
            }
        }
        return DateFormatter.format(date, this._locale, DeprecatedDatePipe._ALIASES[pattern] || pattern);
    }
}
/**
 * \@internal
 */
DeprecatedDatePipe._ALIASES = {
    'medium': 'yMMMdjms',
    'short': 'yMdjm',
    'fullDate': 'yMMMMEEEEd',
    'longDate': 'yMMMMd',
    'mediumDate': 'yMMMd',
    'shortDate': 'yMd',
    'mediumTime': 'jms',
    'shortTime': 'jm'
};
DeprecatedDatePipe.decorators = [
    { type: Pipe, args: [{ name: 'date', pure: true },] }
];
/** @nocollapse */
DeprecatedDatePipe.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
];
function DeprecatedDatePipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    DeprecatedDatePipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    DeprecatedDatePipe.ctorParameters;
    /**
     * \@internal
     * @type {?}
     */
    DeprecatedDatePipe._ALIASES;
    /** @type {?} */
    DeprecatedDatePipe.prototype._locale;
}
/**
 * @param {?} value
 * @return {?}
 */
function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9kZXByZWNhdGVkL2RhdGVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzNFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlFckMsTUFBTTs7OztJQWFKLFlBQXVDO1FBQUEsWUFBTyxHQUFQLE9BQU87S0FBWTs7Ozs7O0lBRTFELFNBQVMsQ0FBQyxLQUFVLEVBQUUsVUFBa0IsWUFBWTtRQUNsRCxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFbEUscUJBQUksSUFBVSxDQUFDO1FBRWYsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUM5QixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3RCO1FBRUQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixJQUFJLEdBQUcsS0FBSyxDQUFDO1NBQ2Q7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDcEM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7O1lBV2hGLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0UsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzlCO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIscUJBQUksS0FBNEIsQ0FBQztZQUNqQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMvQjtZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sd0JBQXdCLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDM0Q7U0FDRjtRQUVELE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUM7S0FDMUU7Ozs7OzhCQXREMEM7SUFDekMsUUFBUSxFQUFFLFVBQVU7SUFDcEIsT0FBTyxFQUFFLE9BQU87SUFDaEIsVUFBVSxFQUFFLFlBQVk7SUFDeEIsVUFBVSxFQUFFLFFBQVE7SUFDcEIsWUFBWSxFQUFFLE9BQU87SUFDckIsV0FBVyxFQUFFLEtBQUs7SUFDbEIsWUFBWSxFQUFFLEtBQUs7SUFDbkIsV0FBVyxFQUFFLElBQUk7Q0FDbEI7O1lBWkYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDOzs7OzRDQWNqQixNQUFNLFNBQUMsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThDL0IsZ0JBQWdCLEtBQVU7SUFDeEIsTUFBTSxDQUFDLEtBQUssWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Q0FDekQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiogQGxpY2Vuc2VcbiogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4qXG4qIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4qIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAgKi9cblxuaW1wb3J0IHtJbmplY3QsIExPQ0FMRV9JRCwgUGlwZSwgUGlwZVRyYW5zZm9ybX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0lTTzg2MDFfREFURV9SRUdFWCwgaXNvU3RyaW5nVG9EYXRlfSBmcm9tICcuLi8uLi9pMThuL2Zvcm1hdF9kYXRlJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXJyb3InO1xuaW1wb3J0IHtEYXRlRm9ybWF0dGVyfSBmcm9tICcuL2ludGwnO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBkYXRlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogV2hlcmU6XG4gKiAtIGBleHByZXNzaW9uYCBpcyBhIGRhdGUgb2JqZWN0IG9yIGEgbnVtYmVyIChtaWxsaXNlY29uZHMgc2luY2UgVVRDIGVwb2NoKSBvciBhbiBJU08gc3RyaW5nXG4gKiAoaHR0cHM6Ly93d3cudzMub3JnL1RSL05PVEUtZGF0ZXRpbWUpLlxuICogLSBgZm9ybWF0YCBpbmRpY2F0ZXMgd2hpY2ggZGF0ZS90aW1lIGNvbXBvbmVudHMgdG8gaW5jbHVkZS4gVGhlIGZvcm1hdCBjYW4gYmUgcHJlZGVmaW5lZCBhc1xuICogICBzaG93biBiZWxvdyBvciBjdXN0b20gYXMgc2hvd24gaW4gdGhlIHRhYmxlLlxuICogICAtIGAnbWVkaXVtJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TU1NZGptcydgIChlLmcuIGBTZXAgMywgMjAxMCwgMTI6MDU6MDggUE1gIGZvciBgZW4tVVNgKVxuICogICAtIGAnc2hvcnQnYDogZXF1aXZhbGVudCB0byBgJ3lNZGptJ2AgKGUuZy4gYDkvMy8yMDEwLCAxMjowNSBQTWAgZm9yIGBlbi1VU2ApXG4gKiAgIC0gYCdmdWxsRGF0ZSdgOiBlcXVpdmFsZW50IHRvIGAneU1NTU1FRUVFZCdgIChlLmcuIGBGcmlkYXksIFNlcHRlbWJlciAzLCAyMDEwYCBmb3IgYGVuLVVTYClcbiAqICAgLSBgJ2xvbmdEYXRlJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TU1NTWQnYCAoZS5nLiBgU2VwdGVtYmVyIDMsIDIwMTBgIGZvciBgZW4tVVNgKVxuICogICAtIGAnbWVkaXVtRGF0ZSdgOiBlcXVpdmFsZW50IHRvIGAneU1NTWQnYCAoZS5nLiBgU2VwIDMsIDIwMTBgIGZvciBgZW4tVVNgKVxuICogICAtIGAnc2hvcnREYXRlJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TWQnYCAoZS5nLiBgOS8zLzIwMTBgIGZvciBgZW4tVVNgKVxuICogICAtIGAnbWVkaXVtVGltZSdgOiBlcXVpdmFsZW50IHRvIGAnam1zJ2AgKGUuZy4gYDEyOjA1OjA4IFBNYCBmb3IgYGVuLVVTYClcbiAqICAgLSBgJ3Nob3J0VGltZSdgOiBlcXVpdmFsZW50IHRvIGAnam0nYCAoZS5nLiBgMTI6MDUgUE1gIGZvciBgZW4tVVNgKVxuICpcbiAqXG4gKiAgfCBDb21wb25lbnQgfCBTeW1ib2wgfCBOYXJyb3cgfCBTaG9ydCBGb3JtICAgfCBMb25nIEZvcm0gICAgICAgICB8IE51bWVyaWMgICB8IDItZGlnaXQgICB8XG4gKiAgfC0tLS0tLS0tLS0tfDotLS0tLS06fC0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS18LS0tLS0tLS0tLS18XG4gKiAgfCBlcmEgICAgICAgfCAgIEcgICAgfCBHIChBKSAgfCBHR0cgKEFEKSAgICAgfCBHR0dHIChBbm5vIERvbWluaSl8IC0gICAgICAgICB8IC0gICAgICAgICB8XG4gKiAgfCB5ZWFyICAgICAgfCAgIHkgICAgfCAtICAgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IHkgKDIwMTUpICB8IHl5ICgxNSkgICB8XG4gKiAgfCBtb250aCAgICAgfCAgIE0gICAgfCBMIChTKSAgfCBNTU0gKFNlcCkgICAgfCBNTU1NIChTZXB0ZW1iZXIpICB8IE0gKDkpICAgICB8IE1NICgwOSkgICB8XG4gKiAgfCBkYXkgICAgICAgfCAgIGQgICAgfCAtICAgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IGQgKDMpICAgICB8IGRkICgwMykgICB8XG4gKiAgfCB3ZWVrZGF5ICAgfCAgIEUgICAgfCBFIChTKSAgfCBFRUUgKFN1bikgICAgfCBFRUVFIChTdW5kYXkpICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICB8XG4gKiAgfCBob3VyICAgICAgfCAgIGogICAgfCAtICAgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IGogKDEzKSAgICB8IGpqICgxMykgICB8XG4gKiAgfCBob3VyMTIgICAgfCAgIGggICAgfCAtICAgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IGggKDEgUE0pICB8IGhoICgwMSBQTSl8XG4gKiAgfCBob3VyMjQgICAgfCAgIEggICAgfCAtICAgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IEggKDEzKSAgICB8IEhIICgxMykgICB8XG4gKiAgfCBtaW51dGUgICAgfCAgIG0gICAgfCAtICAgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IG0gKDUpICAgICB8IG1tICgwNSkgICB8XG4gKiAgfCBzZWNvbmQgICAgfCAgIHMgICAgfCAtICAgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IHMgKDkpICAgICB8IHNzICgwOSkgICB8XG4gKiAgfCB0aW1lem9uZSAgfCAgIHogICAgfCAtICAgICAgfCAtICAgICAgICAgICAgfCB6IChQYWNpZmljIFN0YW5kYXJkIFRpbWUpfCAtICB8IC0gICAgICAgICB8XG4gKiAgfCB0aW1lem9uZSAgfCAgIFogICAgfCAtICAgICAgfCBaIChHTVQtODowMCkgfCAtICAgICAgICAgICAgICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICB8XG4gKiAgfCB0aW1lem9uZSAgfCAgIGEgICAgfCAtICAgICAgfCBhIChQTSkgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICB8XG4gKlxuICogSW4gamF2YXNjcmlwdCwgb25seSB0aGUgY29tcG9uZW50cyBzcGVjaWZpZWQgd2lsbCBiZSByZXNwZWN0ZWQgKG5vdCB0aGUgb3JkZXJpbmcsXG4gKiBwdW5jdHVhdGlvbnMsIC4uLikgYW5kIGRldGFpbHMgb2YgdGhlIGZvcm1hdHRpbmcgd2lsbCBiZSBkZXBlbmRlbnQgb24gdGhlIGxvY2FsZS5cbiAqXG4gKiBUaW1lem9uZSBvZiB0aGUgZm9ybWF0dGVkIHRleHQgd2lsbCBiZSB0aGUgbG9jYWwgc3lzdGVtIHRpbWV6b25lIG9mIHRoZSBlbmQtdXNlcidzIG1hY2hpbmUuXG4gKlxuICogV2hlbiB0aGUgZXhwcmVzc2lvbiBpcyBhIElTTyBzdHJpbmcgd2l0aG91dCB0aW1lIChlLmcuIDIwMTYtMDktMTkpIHRoZSB0aW1lIHpvbmUgb2Zmc2V0IGlzIG5vdFxuICogYXBwbGllZCBhbmQgdGhlIGZvcm1hdHRlZCB0ZXh0IHdpbGwgaGF2ZSB0aGUgc2FtZSBkYXksIG1vbnRoIGFuZCB5ZWFyIG9mIHRoZSBleHByZXNzaW9uLlxuICpcbiAqIFdBUk5JTkdTOlxuICogLSB0aGlzIHBpcGUgaXMgbWFya2VkIGFzIHB1cmUgaGVuY2UgaXQgd2lsbCBub3QgYmUgcmUtZXZhbHVhdGVkIHdoZW4gdGhlIGlucHV0IGlzIG11dGF0ZWQuXG4gKiAgIEluc3RlYWQgdXNlcnMgc2hvdWxkIHRyZWF0IHRoZSBkYXRlIGFzIGFuIGltbXV0YWJsZSBvYmplY3QgYW5kIGNoYW5nZSB0aGUgcmVmZXJlbmNlIHdoZW4gdGhlXG4gKiAgIHBpcGUgbmVlZHMgdG8gcmUtcnVuICh0aGlzIGlzIHRvIGF2b2lkIHJlZm9ybWF0dGluZyB0aGUgZGF0ZSBvbiBldmVyeSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1blxuICogICB3aGljaCB3b3VsZCBiZSBhbiBleHBlbnNpdmUgb3BlcmF0aW9uKS5cbiAqIC0gdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSS4gVGhlcmVmb3JlIGl0IGlzIG9ubHkgcmVsaWFibGUgaW4gQ2hyb21lIGFuZCBPcGVyYVxuICogICBicm93c2Vycy5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBBc3N1bWluZyBgZGF0ZU9iamAgaXMgKHllYXI6IDIwMTAsIG1vbnRoOiA5LCBkYXk6IDMsIGhvdXI6IDEyIFBNLCBtaW51dGU6IDA1LCBzZWNvbmQ6IDA4KVxuICogaW4gdGhlIF9sb2NhbF8gdGltZSBhbmQgbG9jYWxlIGlzICdlbi1VUyc6XG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9kYXRlX3BpcGUudHMgcmVnaW9uPSdEZXByZWNhdGVkRGF0ZVBpcGUnfVxuICpcbiAqXG4gKi9cbkBQaXBlKHtuYW1lOiAnZGF0ZScsIHB1cmU6IHRydWV9KVxuZXhwb3J0IGNsYXNzIERlcHJlY2F0ZWREYXRlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfQUxJQVNFUzoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgJ21lZGl1bSc6ICd5TU1NZGptcycsXG4gICAgJ3Nob3J0JzogJ3lNZGptJyxcbiAgICAnZnVsbERhdGUnOiAneU1NTU1FRUVFZCcsXG4gICAgJ2xvbmdEYXRlJzogJ3lNTU1NZCcsXG4gICAgJ21lZGl1bURhdGUnOiAneU1NTWQnLFxuICAgICdzaG9ydERhdGUnOiAneU1kJyxcbiAgICAnbWVkaXVtVGltZSc6ICdqbXMnLFxuICAgICdzaG9ydFRpbWUnOiAnam0nXG4gIH07XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBwYXR0ZXJuOiBzdHJpbmcgPSAnbWVkaXVtRGF0ZScpOiBzdHJpbmd8bnVsbCB7XG4gICAgaWYgKHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT09ICcnIHx8IHZhbHVlICE9PSB2YWx1ZSkgcmV0dXJuIG51bGw7XG5cbiAgICBsZXQgZGF0ZTogRGF0ZTtcblxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgZGF0ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAoIWlzTmFOKHZhbHVlIC0gcGFyc2VGbG9hdCh2YWx1ZSkpKSB7XG4gICAgICBkYXRlID0gbmV3IERhdGUocGFyc2VGbG9hdCh2YWx1ZSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAvXihcXGR7NH0tXFxkezEsMn0tXFxkezEsMn0pJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgIC8qKlxuICAgICAgICogRm9yIElTTyBTdHJpbmdzIHdpdGhvdXQgdGltZSB0aGUgZGF5LCBtb250aCBhbmQgeWVhciBtdXN0IGJlIGV4dHJhY3RlZCBmcm9tIHRoZSBJU08gU3RyaW5nXG4gICAgICAgKiBiZWZvcmUgRGF0ZSBjcmVhdGlvbiB0byBhdm9pZCB0aW1lIG9mZnNldCBhbmQgZXJyb3JzIGluIHRoZSBuZXcgRGF0ZS5cbiAgICAgICAqIElmIHdlIG9ubHkgcmVwbGFjZSAnLScgd2l0aCAnLCcgaW4gdGhlIElTTyBTdHJpbmcgKFwiMjAxNSwwMSwwMVwiKSwgYW5kIHRyeSB0byBjcmVhdGUgYSBuZXdcbiAgICAgICAqIGRhdGUsIHNvbWUgYnJvd3NlcnMgKGUuZy4gSUUgOSkgd2lsbCB0aHJvdyBhbiBpbnZhbGlkIERhdGUgZXJyb3JcbiAgICAgICAqIElmIHdlIGxlYXZlIHRoZSAnLScgKFwiMjAxNS0wMS0wMVwiKSBhbmQgdHJ5IHRvIGNyZWF0ZSBhIG5ldyBEYXRlKFwiMjAxNS0wMS0wMVwiKSB0aGVcbiAgICAgICAqIHRpbWVvZmZzZXRcbiAgICAgICAqIGlzIGFwcGxpZWRcbiAgICAgICAqIE5vdGU6IElTTyBtb250aHMgYXJlIDAgZm9yIEphbnVhcnksIDEgZm9yIEZlYnJ1YXJ5LCAuLi5cbiAgICAgICAqL1xuICAgICAgY29uc3QgW3ksIG0sIGRdID0gdmFsdWUuc3BsaXQoJy0nKS5tYXAoKHZhbDogc3RyaW5nKSA9PiBwYXJzZUludCh2YWwsIDEwKSk7XG4gICAgICBkYXRlID0gbmV3IERhdGUoeSwgbSAtIDEsIGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXRlID0gbmV3IERhdGUodmFsdWUpO1xuICAgIH1cblxuICAgIGlmICghaXNEYXRlKGRhdGUpKSB7XG4gICAgICBsZXQgbWF0Y2g6IFJlZ0V4cE1hdGNoQXJyYXl8bnVsbDtcbiAgICAgIGlmICgodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgJiYgKG1hdGNoID0gdmFsdWUubWF0Y2goSVNPODYwMV9EQVRFX1JFR0VYKSkpIHtcbiAgICAgICAgZGF0ZSA9IGlzb1N0cmluZ1RvRGF0ZShtYXRjaCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoRGVwcmVjYXRlZERhdGVQaXBlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIERhdGVGb3JtYXR0ZXIuZm9ybWF0KFxuICAgICAgICBkYXRlLCB0aGlzLl9sb2NhbGUsIERlcHJlY2F0ZWREYXRlUGlwZS5fQUxJQVNFU1twYXR0ZXJuXSB8fCBwYXR0ZXJuKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0RhdGUodmFsdWU6IGFueSk6IHZhbHVlIGlzIERhdGUge1xuICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBEYXRlICYmICFpc05hTih2YWx1ZS52YWx1ZU9mKCkpO1xufVxuIl19
/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
  */
import * as tslib_1 from "tslib";
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { ISO8601_DATE_REGEX, isoStringToDate } from '../../i18n/format_date';
import { invalidPipeArgumentError } from '../invalid_pipe_argument_error';
import { DateFormatter } from './intl';
/**
 * @ngModule CommonModule
 * @description
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
 * {@example common/pipes/ts/date_pipe.ts region='DeprecatedDatePipe'}
 *
 *
 */
var DeprecatedDatePipe = /** @class */ (function () {
    function DeprecatedDatePipe(_locale) {
        this._locale = _locale;
    }
    DeprecatedDatePipe.prototype.transform = function (value, pattern) {
        if (pattern === void 0) { pattern = 'mediumDate'; }
        if (value == null || value === '' || value !== value)
            return null;
        var date;
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
            var _a = tslib_1.__read(value.split('-').map(function (val) { return parseInt(val, 10); }), 3), y = _a[0], m = _a[1], d = _a[2];
            date = new Date(y, m - 1, d);
        }
        else {
            date = new Date(value);
        }
        if (!isDate(date)) {
            var match = void 0;
            if ((typeof value === 'string') && (match = value.match(ISO8601_DATE_REGEX))) {
                date = isoStringToDate(match);
            }
            else {
                throw invalidPipeArgumentError(DeprecatedDatePipe, value);
            }
        }
        return DateFormatter.format(date, this._locale, DeprecatedDatePipe._ALIASES[pattern] || pattern);
    };
    /** @internal */
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
    DeprecatedDatePipe.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [LOCALE_ID,] },] },
    ]; };
    return DeprecatedDatePipe;
}());
export { DeprecatedDatePipe };
function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9kZXByZWNhdGVkL2RhdGVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzNFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUE4RW5DLDRCQUF1QztRQUFBLFlBQU8sR0FBUCxPQUFPO0tBQVk7SUFFMUQsc0NBQVMsR0FBVCxVQUFVLEtBQVUsRUFBRSxPQUE4QjtRQUE5Qix3QkFBQSxFQUFBLHNCQUE4QjtRQUNsRCxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFbEUsSUFBSSxJQUFVLENBQUM7UUFFZixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzlCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDdEI7UUFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksR0FBRyxLQUFLLENBQUM7U0FDZDtRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUNwQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7WUFXaEYsZ0dBQU8sU0FBQyxFQUFFLFNBQUMsRUFBRSxTQUFDLENBQTZEO1lBQzNFLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM5QjtRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksS0FBSyxTQUF1QixDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQy9CO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSx3QkFBd0IsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUMzRDtTQUNGO1FBRUQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQztLQUMxRTs7a0NBdEQwQztRQUN6QyxRQUFRLEVBQUUsVUFBVTtRQUNwQixPQUFPLEVBQUUsT0FBTztRQUNoQixVQUFVLEVBQUUsWUFBWTtRQUN4QixVQUFVLEVBQUUsUUFBUTtRQUNwQixZQUFZLEVBQUUsT0FBTztRQUNyQixXQUFXLEVBQUUsS0FBSztRQUNsQixZQUFZLEVBQUUsS0FBSztRQUNuQixXQUFXLEVBQUUsSUFBSTtLQUNsQjs7Z0JBWkYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDOzs7O2dEQWNqQixNQUFNLFNBQUMsU0FBUzs7NkJBekYvQjs7U0E0RWEsa0JBQWtCO0FBMkQvQixnQkFBZ0IsS0FBVTtJQUN4QixNQUFNLENBQUMsS0FBSyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztDQUN6RCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuKiBAbGljZW5zZVxuKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbipcbiogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICAqL1xuXG5pbXBvcnQge0luamVjdCwgTE9DQUxFX0lELCBQaXBlLCBQaXBlVHJhbnNmb3JtfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7SVNPODYwMV9EQVRFX1JFR0VYLCBpc29TdHJpbmdUb0RhdGV9IGZyb20gJy4uLy4uL2kxOG4vZm9ybWF0X2RhdGUnO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4uL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5pbXBvcnQge0RhdGVGb3JtYXR0ZXJ9IGZyb20gJy4vaW50bCc7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIGRhdGUgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBXaGVyZTpcbiAqIC0gYGV4cHJlc3Npb25gIGlzIGEgZGF0ZSBvYmplY3Qgb3IgYSBudW1iZXIgKG1pbGxpc2Vjb25kcyBzaW5jZSBVVEMgZXBvY2gpIG9yIGFuIElTTyBzdHJpbmdcbiAqIChodHRwczovL3d3dy53My5vcmcvVFIvTk9URS1kYXRldGltZSkuXG4gKiAtIGBmb3JtYXRgIGluZGljYXRlcyB3aGljaCBkYXRlL3RpbWUgY29tcG9uZW50cyB0byBpbmNsdWRlLiBUaGUgZm9ybWF0IGNhbiBiZSBwcmVkZWZpbmVkIGFzXG4gKiAgIHNob3duIGJlbG93IG9yIGN1c3RvbSBhcyBzaG93biBpbiB0aGUgdGFibGUuXG4gKiAgIC0gYCdtZWRpdW0nYDogZXF1aXZhbGVudCB0byBgJ3lNTU1kam1zJ2AgKGUuZy4gYFNlcCAzLCAyMDEwLCAxMjowNTowOCBQTWAgZm9yIGBlbi1VU2ApXG4gKiAgIC0gYCdzaG9ydCdgOiBlcXVpdmFsZW50IHRvIGAneU1kam0nYCAoZS5nLiBgOS8zLzIwMTAsIDEyOjA1IFBNYCBmb3IgYGVuLVVTYClcbiAqICAgLSBgJ2Z1bGxEYXRlJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TU1NTUVFRUVkJ2AgKGUuZy4gYEZyaWRheSwgU2VwdGVtYmVyIDMsIDIwMTBgIGZvciBgZW4tVVNgKVxuICogICAtIGAnbG9uZ0RhdGUnYDogZXF1aXZhbGVudCB0byBgJ3lNTU1NZCdgIChlLmcuIGBTZXB0ZW1iZXIgMywgMjAxMGAgZm9yIGBlbi1VU2ApXG4gKiAgIC0gYCdtZWRpdW1EYXRlJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TU1NZCdgIChlLmcuIGBTZXAgMywgMjAxMGAgZm9yIGBlbi1VU2ApXG4gKiAgIC0gYCdzaG9ydERhdGUnYDogZXF1aXZhbGVudCB0byBgJ3lNZCdgIChlLmcuIGA5LzMvMjAxMGAgZm9yIGBlbi1VU2ApXG4gKiAgIC0gYCdtZWRpdW1UaW1lJ2A6IGVxdWl2YWxlbnQgdG8gYCdqbXMnYCAoZS5nLiBgMTI6MDU6MDggUE1gIGZvciBgZW4tVVNgKVxuICogICAtIGAnc2hvcnRUaW1lJ2A6IGVxdWl2YWxlbnQgdG8gYCdqbSdgIChlLmcuIGAxMjowNSBQTWAgZm9yIGBlbi1VU2ApXG4gKlxuICpcbiAqICB8IENvbXBvbmVudCB8IFN5bWJvbCB8IE5hcnJvdyB8IFNob3J0IEZvcm0gICB8IExvbmcgRm9ybSAgICAgICAgIHwgTnVtZXJpYyAgIHwgMi1kaWdpdCAgIHxcbiAqICB8LS0tLS0tLS0tLS18Oi0tLS0tLTp8LS0tLS0tLS18LS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLXwtLS0tLS0tLS0tLXxcbiAqICB8IGVyYSAgICAgICB8ICAgRyAgICB8IEcgKEEpICB8IEdHRyAoQUQpICAgICB8IEdHR0cgKEFubm8gRG9taW5pKXwgLSAgICAgICAgIHwgLSAgICAgICAgIHxcbiAqICB8IHllYXIgICAgICB8ICAgeSAgICB8IC0gICAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgeSAoMjAxNSkgIHwgeXkgKDE1KSAgIHxcbiAqICB8IG1vbnRoICAgICB8ICAgTSAgICB8IEwgKFMpICB8IE1NTSAoU2VwKSAgICB8IE1NTU0gKFNlcHRlbWJlcikgIHwgTSAoOSkgICAgIHwgTU0gKDA5KSAgIHxcbiAqICB8IGRheSAgICAgICB8ICAgZCAgICB8IC0gICAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgZCAoMykgICAgIHwgZGQgKDAzKSAgIHxcbiAqICB8IHdlZWtkYXkgICB8ICAgRSAgICB8IEUgKFMpICB8IEVFRSAoU3VuKSAgICB8IEVFRUUgKFN1bmRheSkgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgIHxcbiAqICB8IGhvdXIgICAgICB8ICAgaiAgICB8IC0gICAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgaiAoMTMpICAgIHwgamogKDEzKSAgIHxcbiAqICB8IGhvdXIxMiAgICB8ICAgaCAgICB8IC0gICAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgaCAoMSBQTSkgIHwgaGggKDAxIFBNKXxcbiAqICB8IGhvdXIyNCAgICB8ICAgSCAgICB8IC0gICAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgSCAoMTMpICAgIHwgSEggKDEzKSAgIHxcbiAqICB8IG1pbnV0ZSAgICB8ICAgbSAgICB8IC0gICAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgbSAoNSkgICAgIHwgbW0gKDA1KSAgIHxcbiAqICB8IHNlY29uZCAgICB8ICAgcyAgICB8IC0gICAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgcyAoOSkgICAgIHwgc3MgKDA5KSAgIHxcbiAqICB8IHRpbWV6b25lICB8ICAgeiAgICB8IC0gICAgICB8IC0gICAgICAgICAgICB8IHogKFBhY2lmaWMgU3RhbmRhcmQgVGltZSl8IC0gIHwgLSAgICAgICAgIHxcbiAqICB8IHRpbWV6b25lICB8ICAgWiAgICB8IC0gICAgICB8IFogKEdNVC04OjAwKSB8IC0gICAgICAgICAgICAgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgIHxcbiAqICB8IHRpbWV6b25lICB8ICAgYSAgICB8IC0gICAgICB8IGEgKFBNKSAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgIHxcbiAqXG4gKiBJbiBqYXZhc2NyaXB0LCBvbmx5IHRoZSBjb21wb25lbnRzIHNwZWNpZmllZCB3aWxsIGJlIHJlc3BlY3RlZCAobm90IHRoZSBvcmRlcmluZyxcbiAqIHB1bmN0dWF0aW9ucywgLi4uKSBhbmQgZGV0YWlscyBvZiB0aGUgZm9ybWF0dGluZyB3aWxsIGJlIGRlcGVuZGVudCBvbiB0aGUgbG9jYWxlLlxuICpcbiAqIFRpbWV6b25lIG9mIHRoZSBmb3JtYXR0ZWQgdGV4dCB3aWxsIGJlIHRoZSBsb2NhbCBzeXN0ZW0gdGltZXpvbmUgb2YgdGhlIGVuZC11c2VyJ3MgbWFjaGluZS5cbiAqXG4gKiBXaGVuIHRoZSBleHByZXNzaW9uIGlzIGEgSVNPIHN0cmluZyB3aXRob3V0IHRpbWUgKGUuZy4gMjAxNi0wOS0xOSkgdGhlIHRpbWUgem9uZSBvZmZzZXQgaXMgbm90XG4gKiBhcHBsaWVkIGFuZCB0aGUgZm9ybWF0dGVkIHRleHQgd2lsbCBoYXZlIHRoZSBzYW1lIGRheSwgbW9udGggYW5kIHllYXIgb2YgdGhlIGV4cHJlc3Npb24uXG4gKlxuICogV0FSTklOR1M6XG4gKiAtIHRoaXMgcGlwZSBpcyBtYXJrZWQgYXMgcHVyZSBoZW5jZSBpdCB3aWxsIG5vdCBiZSByZS1ldmFsdWF0ZWQgd2hlbiB0aGUgaW5wdXQgaXMgbXV0YXRlZC5cbiAqICAgSW5zdGVhZCB1c2VycyBzaG91bGQgdHJlYXQgdGhlIGRhdGUgYXMgYW4gaW1tdXRhYmxlIG9iamVjdCBhbmQgY2hhbmdlIHRoZSByZWZlcmVuY2Ugd2hlbiB0aGVcbiAqICAgcGlwZSBuZWVkcyB0byByZS1ydW4gKHRoaXMgaXMgdG8gYXZvaWQgcmVmb3JtYXR0aW5nIHRoZSBkYXRlIG9uIGV2ZXJ5IGNoYW5nZSBkZXRlY3Rpb24gcnVuXG4gKiAgIHdoaWNoIHdvdWxkIGJlIGFuIGV4cGVuc2l2ZSBvcGVyYXRpb24pLlxuICogLSB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJLiBUaGVyZWZvcmUgaXQgaXMgb25seSByZWxpYWJsZSBpbiBDaHJvbWUgYW5kIE9wZXJhXG4gKiAgIGJyb3dzZXJzLlxuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIEFzc3VtaW5nIGBkYXRlT2JqYCBpcyAoeWVhcjogMjAxMCwgbW9udGg6IDksIGRheTogMywgaG91cjogMTIgUE0sIG1pbnV0ZTogMDUsIHNlY29uZDogMDgpXG4gKiBpbiB0aGUgX2xvY2FsXyB0aW1lIGFuZCBsb2NhbGUgaXMgJ2VuLVVTJzpcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2RhdGVfcGlwZS50cyByZWdpb249J0RlcHJlY2F0ZWREYXRlUGlwZSd9XG4gKlxuICpcbiAqL1xuQFBpcGUoe25hbWU6ICdkYXRlJywgcHVyZTogdHJ1ZX0pXG5leHBvcnQgY2xhc3MgRGVwcmVjYXRlZERhdGVQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9BTElBU0VTOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHtcbiAgICAnbWVkaXVtJzogJ3lNTU1kam1zJyxcbiAgICAnc2hvcnQnOiAneU1kam0nLFxuICAgICdmdWxsRGF0ZSc6ICd5TU1NTUVFRUVkJyxcbiAgICAnbG9uZ0RhdGUnOiAneU1NTU1kJyxcbiAgICAnbWVkaXVtRGF0ZSc6ICd5TU1NZCcsXG4gICAgJ3Nob3J0RGF0ZSc6ICd5TWQnLFxuICAgICdtZWRpdW1UaW1lJzogJ2ptcycsXG4gICAgJ3Nob3J0VGltZSc6ICdqbSdcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIHBhdHRlcm46IHN0cmluZyA9ICdtZWRpdW1EYXRlJyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycgfHwgdmFsdWUgIT09IHZhbHVlKSByZXR1cm4gbnVsbDtcblxuICAgIGxldCBkYXRlOiBEYXRlO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUudHJpbSgpO1xuICAgIH1cblxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICBkYXRlID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmICghaXNOYU4odmFsdWUgLSBwYXJzZUZsb2F0KHZhbHVlKSkpIHtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShwYXJzZUZsb2F0KHZhbHVlKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIC9eKFxcZHs0fS1cXGR7MSwyfS1cXGR7MSwyfSkkLy50ZXN0KHZhbHVlKSkge1xuICAgICAgLyoqXG4gICAgICAgKiBGb3IgSVNPIFN0cmluZ3Mgd2l0aG91dCB0aW1lIHRoZSBkYXksIG1vbnRoIGFuZCB5ZWFyIG11c3QgYmUgZXh0cmFjdGVkIGZyb20gdGhlIElTTyBTdHJpbmdcbiAgICAgICAqIGJlZm9yZSBEYXRlIGNyZWF0aW9uIHRvIGF2b2lkIHRpbWUgb2Zmc2V0IGFuZCBlcnJvcnMgaW4gdGhlIG5ldyBEYXRlLlxuICAgICAgICogSWYgd2Ugb25seSByZXBsYWNlICctJyB3aXRoICcsJyBpbiB0aGUgSVNPIFN0cmluZyAoXCIyMDE1LDAxLDAxXCIpLCBhbmQgdHJ5IHRvIGNyZWF0ZSBhIG5ld1xuICAgICAgICogZGF0ZSwgc29tZSBicm93c2VycyAoZS5nLiBJRSA5KSB3aWxsIHRocm93IGFuIGludmFsaWQgRGF0ZSBlcnJvclxuICAgICAgICogSWYgd2UgbGVhdmUgdGhlICctJyAoXCIyMDE1LTAxLTAxXCIpIGFuZCB0cnkgdG8gY3JlYXRlIGEgbmV3IERhdGUoXCIyMDE1LTAxLTAxXCIpIHRoZVxuICAgICAgICogdGltZW9mZnNldFxuICAgICAgICogaXMgYXBwbGllZFxuICAgICAgICogTm90ZTogSVNPIG1vbnRocyBhcmUgMCBmb3IgSmFudWFyeSwgMSBmb3IgRmVicnVhcnksIC4uLlxuICAgICAgICovXG4gICAgICBjb25zdCBbeSwgbSwgZF0gPSB2YWx1ZS5zcGxpdCgnLScpLm1hcCgodmFsOiBzdHJpbmcpID0+IHBhcnNlSW50KHZhbCwgMTApKTtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZSh5LCBtIC0gMSwgZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKCFpc0RhdGUoZGF0ZSkpIHtcbiAgICAgIGxldCBtYXRjaDogUmVnRXhwTWF0Y2hBcnJheXxudWxsO1xuICAgICAgaWYgKCh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSAmJiAobWF0Y2ggPSB2YWx1ZS5tYXRjaChJU084NjAxX0RBVEVfUkVHRVgpKSkge1xuICAgICAgICBkYXRlID0gaXNvU3RyaW5nVG9EYXRlKG1hdGNoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihEZXByZWNhdGVkRGF0ZVBpcGUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gRGF0ZUZvcm1hdHRlci5mb3JtYXQoXG4gICAgICAgIGRhdGUsIHRoaXMuX2xvY2FsZSwgRGVwcmVjYXRlZERhdGVQaXBlLl9BTElBU0VTW3BhdHRlcm5dIHx8IHBhdHRlcm4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRGF0ZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgRGF0ZSB7XG4gIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIERhdGUgJiYgIWlzTmFOKHZhbHVlLnZhbHVlT2YoKSk7XG59XG4iXX0=
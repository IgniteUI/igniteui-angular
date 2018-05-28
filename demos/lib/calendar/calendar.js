var MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var FEBRUARY = 1;
export function range(start, stop, step) {
    if (start === void 0) { start = 0; }
    if (step === void 0) { step = 1; }
    var res = [];
    var cur = (stop === undefined) ? 0 : start;
    var max = (stop === undefined) ? start : stop;
    for (var i = cur; step < 0 ? i > max : i < max; i += step) {
        res.push(i);
    }
    return res;
}
export function isLeap(year) {
    return (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0));
}
export function weekDay(year, month, day) {
    return new Date(year, month, day).getDay();
}
export function monthRange(year, month) {
    if ((month < 0) || (month > 11)) {
        throw new Error("Invalid month specified");
    }
    var day = weekDay(year, month, 1);
    var nDays = MDAYS[month];
    if ((month === FEBRUARY) && (isLeap(year))) {
        nDays++;
    }
    return [day, nDays];
}
export var WEEKDAYS;
(function (WEEKDAYS) {
    WEEKDAYS[WEEKDAYS["SUNDAY"] = 0] = "SUNDAY";
    WEEKDAYS[WEEKDAYS["MONDAY"] = 1] = "MONDAY";
    WEEKDAYS[WEEKDAYS["TUESDAY"] = 2] = "TUESDAY";
    WEEKDAYS[WEEKDAYS["WEDNESDAY"] = 3] = "WEDNESDAY";
    WEEKDAYS[WEEKDAYS["THURSDAY"] = 4] = "THURSDAY";
    WEEKDAYS[WEEKDAYS["FRIDAY"] = 5] = "FRIDAY";
    WEEKDAYS[WEEKDAYS["SATURDAY"] = 6] = "SATURDAY";
})(WEEKDAYS || (WEEKDAYS = {}));
var Calendar = (function () {
    function Calendar(firstWeekDay) {
        if (firstWeekDay === void 0) { firstWeekDay = WEEKDAYS.SUNDAY; }
        this._firstWeekDay = firstWeekDay;
    }
    Object.defineProperty(Calendar.prototype, "firstWeekDay", {
        get: function () {
            return this._firstWeekDay % 7;
        },
        set: function (value) {
            this._firstWeekDay = value;
        },
        enumerable: true,
        configurable: true
    });
    Calendar.prototype.weekdays = function () {
        var res = [];
        for (var _i = 0, _a = range(this.firstWeekDay, this.firstWeekDay + 7); _i < _a.length; _i++) {
            var i = _a[_i];
            res.push(i % 7);
        }
        return res;
    };
    Calendar.prototype.monthdates = function (year, month, extraWeek) {
        if (extraWeek === void 0) { extraWeek = false; }
        var date = new Date(year, month, 1, 12, 0, 0, 0);
        var days = (date.getDay() - this.firstWeekDay) % 7;
        if (days < 0) {
            days = 7 - Math.abs(days);
        }
        date = this.timedelta(date, "day", -days);
        var res = [];
        var value;
        while (true) {
            value = this.generateICalendarDate(date, year, month);
            res.push(value);
            date = this.timedelta(date, "day", 1);
            if ((date.getMonth() !== month) && (date.getDay() === this.firstWeekDay)) {
                if (extraWeek && res.length <= 35) {
                    for (var _i = 0, _a = range(0, 7); _i < _a.length; _i++) {
                        var i = _a[_i];
                        value = this.generateICalendarDate(date, year, month);
                        res.push(value);
                        date = this.timedelta(date, "day", 1);
                    }
                }
                break;
            }
        }
        return res;
    };
    Calendar.prototype.monthdatescalendar = function (year, month, extraWeek) {
        if (extraWeek === void 0) { extraWeek = false; }
        var dates = this.monthdates(year, month, extraWeek);
        var res = [];
        for (var _i = 0, _a = range(0, dates.length, 7); _i < _a.length; _i++) {
            var i = _a[_i];
            res.push(dates.slice(i, i + 7));
        }
        return res;
    };
    Calendar.prototype.timedelta = function (date, interval, units) {
        var ret = new Date(date);
        var checkRollover = function () {
            if (ret.getDate() !== date.getDate()) {
                ret.setDate(0);
            }
        };
        switch (interval.toLowerCase()) {
            case "year":
                ret.setFullYear(ret.getFullYear() + units);
                checkRollover();
                break;
            case "quarter":
                ret.setMonth(ret.getMonth() + 3 * units);
                checkRollover();
                break;
            case "month":
                ret.setMonth(ret.getMonth() + units);
                checkRollover();
                break;
            case "week":
                ret.setDate(ret.getDate() + 7 * units);
                break;
            case "day":
                ret.setDate(ret.getDate() + units);
                break;
            case "hour":
                ret.setTime(ret.getTime() + units * 3600000);
                break;
            case "minute":
                ret.setTime(ret.getTime() + units * 60000);
                break;
            case "second":
                ret.setTime(ret.getTime() + units * 1000);
                break;
            default:
                throw new Error("Invalid interval specifier");
        }
        return ret;
    };
    Calendar.prototype.formatToParts = function (date, locale, options, parts) {
        var formatter = new Intl.DateTimeFormat(locale, options);
        var result = {
            date: date,
            full: formatter.format(date)
        };
        if (formatter.formatToParts) {
            var formattedParts_1 = formatter.formatToParts(date);
            var toType = function (partType) {
                var index = formattedParts_1.findIndex(function (_a) {
                    var type = _a.type;
                    return type === partType;
                });
                var o = { value: "", literal: "", combined: "" };
                if (partType === "era" && index > -1) {
                    o.value = formattedParts_1[index].value;
                    return o;
                }
                else if (partType === "era" && index === -1) {
                    return o;
                }
                o.value = formattedParts_1[index].value;
                o.literal = formattedParts_1[index + 1] ? formattedParts_1[index + 1].value : "";
                o.combined = [o.value, o.literal].join("");
                return o;
            };
            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                var each = parts_1[_i];
                result[each] = toType(each);
            }
        }
        else {
            for (var _a = 0, parts_2 = parts; _a < parts_2.length; _a++) {
                var each = parts_2[_a];
                result[each] = { value: "", literal: "", combined: "" };
            }
        }
        return result;
    };
    Calendar.prototype.generateICalendarDate = function (date, year, month) {
        return {
            date: date,
            isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
            isNextMonth: this.isNextMonth(date, year, month),
            isPrevMonth: this.isPreviousMonth(date, year, month)
        };
    };
    Calendar.prototype.isPreviousMonth = function (date, year, month) {
        if (date.getFullYear() === year) {
            return date.getMonth() < month;
        }
        return date.getFullYear() < year;
    };
    Calendar.prototype.isNextMonth = function (date, year, month) {
        if (date.getFullYear() === year) {
            return date.getMonth() > month;
        }
        return date.getFullYear() > year;
    };
    return Calendar;
}());
export { Calendar };

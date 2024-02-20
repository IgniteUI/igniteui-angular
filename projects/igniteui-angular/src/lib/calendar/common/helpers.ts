import {
    CalendarDay,
    CalendarRangeParams,
    DayParameter,
    daysInWeek,
    toCalendarDay,
} from "./model";
import { DateRangeDescriptor, DateRangeType, WeekDays } from "./types";
import { first, last, modulo } from "../../core/utils";

/* Constants */

export const MONTHS_PER_ROW = 3;
export const YEARS_PER_ROW = 3;

const DaysMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};

interface IFormattedParts {
    value: string;
    literal: string;
    combined: string;
}

/* Converter functions */

export function dateFromISOString(value: string | null) {
    return value ? new Date(value) : null;
}

export function datesFromISOStrings(value: string | null) {
    return value
        ? value
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v)
              .map((v) => new Date(v))
        : null;
}

export function getWeekDayNumber(value: WeekDays) {
    return DaysMap[value];
}

export function areSameMonth(
    firstMonth: DayParameter,
    secondMonth: DayParameter,
) {
    const [a, b] = [toCalendarDay(firstMonth), toCalendarDay(secondMonth)];
    return a.year === b.year && a.month === b.month;
}

export function isNextMonth(target: DayParameter, origin: DayParameter) {
    const [a, b] = [toCalendarDay(target), toCalendarDay(origin)];
    return a.year === b.year ? a.month > b.month : a.year > b.year;
}

export function isPreviousMonth(target: DayParameter, origin: DayParameter) {
    const [a, b] = [toCalendarDay(target), toCalendarDay(origin)];
    return a.year === b.year ? a.month < b.month : a.year < b.year;
}

/** Returns the next date starting from `start` that does not match the `disabled` descriptors */
export function getNextActiveDate(
    start: CalendarDay,
    disabled: DateRangeDescriptor[] = [],
) {
    while (isDateInRanges(start, disabled)) {
        start = start.add("day", 1);
    }

    return start;
}

/** Returns the previous date starting from `start` that does not match the `disabled` descriptors */
export function getPreviousActiveDate(
    start: CalendarDay,
    disabled: DateRangeDescriptor[] = [],
) {
    while (isDateInRanges(start, disabled)) {
        start = start.add("day", -1);
    }

    return start;
}

export function getClosestActiveDate(
    start: CalendarDay,
    delta: number,
    disabled: DateRangeDescriptor[] = [],
): CalendarDay {
    const range = getLargestRange(disabled)?.dateRange;
    const maxAttempts = Math.max(Math.abs(delta), (range ?? []).length);
    let date = start;
    let attempts = 0;

    while (attempts < maxAttempts) {
        date = start.add("day", delta * (attempts + 1));

        if (!isDateInRanges(date, disabled)) {
            return date;
        }

        attempts++;
    }

    return date;
}

/**
 * Returns a generator yielding day values between `start` and `end` (non-inclusive)
 * by a given `unit` as a step.
 *
 * @remarks
 * By default, `unit` is set to 'day'.
 */
export function* calendarRange(options: CalendarRangeParams) {
    let low = toCalendarDay(options.start);
    const unit = options.unit ?? "day";
    const high =
        typeof options.end === "number"
            ? low.add(unit, options.end)
            : toCalendarDay(options.end);

    const reverse = high.lessThan(low);
    const step = reverse ? -1 : 1;

    while (!reverse ? low.lessThan(high) : low.greaterThan(high)) {
        yield low;
        low = low.add(unit, step);
    }
}

export function* generateMonth(value: DayParameter, firstWeekDay: number) {
    const { year, month } = toCalendarDay(value);

    const start = new CalendarDay({ year, month });
    const offset = modulo(start.day - firstWeekDay, daysInWeek);
    yield* calendarRange({
        start: start.add("day", -offset),
        end: 42,
    });
}

export function getYearRange(current: DayParameter, range: number) {
    const year = toCalendarDay(current).year;
    const start = Math.floor(year / range) * range;
    return { start, end: start + range - 1 };
}

export function getLargestRange(ranges: DateRangeDescriptor[] = []) {
    return ranges.reduce(
        (prev, current) => {
            const c = current?.dateRange ?? [];
            const p = prev?.dateRange ?? [];
            return c.length > p.length ? current : prev;
        },
        [] as unknown as DateRangeDescriptor,
    );
}

export function isDateInRanges(
    date: DayParameter,
    ranges: DateRangeDescriptor[],
) {
    const value = toCalendarDay(date);

    return ranges.some((range) => {
        const days = (range.dateRange ?? []).map((day) => toCalendarDay(day));

        switch (range.type) {
            case DateRangeType.After:
                return value.greaterThan(first(days));

            case DateRangeType.Before:
                return value.lessThan(first(days));

            case DateRangeType.Between: {
                const min = Math.min(
                    first(days).timestamp,
                    last(days).timestamp,
                );
                const max = Math.max(
                    first(days).timestamp,
                    last(days).timestamp,
                );
                return value.timestamp >= min && value.timestamp <= max;
            }

            case DateRangeType.Specific:
                return days.some((day) => day.equalTo(value));

            case DateRangeType.Weekdays:
                return !value.weekend;

            case DateRangeType.Weekends:
                return value.weekend;

            default:
                return false;
        }
    });
}

export function formatToParts(
    date: Date,
    locale: string,
    options: Intl.DateTimeFormatOptions,
    parts: string[],
): Record<string, any> {
    const formatter = new Intl.DateTimeFormat(locale, options);
    const result: Record<string, any> = {
        date,
        full: formatter.format(date),
    };

    const getFormattedPart = (
        formattedParts: Intl.DateTimeFormatPart[],
        partType: string,
    ): IFormattedParts => {
        const part = formattedParts.find(({ type }) => type === partType);
        const nextPart = formattedParts[formattedParts.indexOf(part) + 1];
        const value = part?.value || "";
        const literal = nextPart?.type === "literal" ? nextPart.value : "";
        return {
            value,
            literal,
            combined: value + literal,
        };
    };

    if ("formatToParts" in formatter) {
        const formattedParts = formatter.formatToParts(date);
        parts.forEach(
            (part) => (result[part] = getFormattedPart(formattedParts, part)),
        );
    } else {
        parts.forEach(
            (part) => (result[part] = { value: "", literal: "", combined: "" }),
        );
    }

    return result;
}

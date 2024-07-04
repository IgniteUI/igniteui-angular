import { mkenum } from '../core/utils';

/**
 * Sets the selection type - single, multi or range.
 */
export const CalendarSelection = /*@__PURE__*/mkenum({
    SINGLE: 'single',
    MULTI: 'multi',
    RANGE: 'range'
});
export type CalendarSelection = (typeof CalendarSelection)[keyof typeof CalendarSelection];

export const enum ScrollDirection {
    PREV = 'prev',
    NEXT = 'next',
    NONE = 'none'
}

export interface IViewDateChangeEventArgs {
    previousValue: Date;
    currentValue: Date;
}

export const IgxCalendarView = /*@__PURE__*/mkenum({
    Month: 'month',
    Year: 'year',
    Decade: 'decade'
});

/**
 * Determines the Calendar active view - days, months or years.
 */
export type IgxCalendarView = (typeof IgxCalendarView)[keyof typeof IgxCalendarView];

const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const FEBRUARY = 1;

export const range = (start = 0, stop: number, step = 1) => {
    const res = [];
    const cur = (stop === undefined) ? 0 : start;
    const max = (stop === undefined) ? start : stop;
    for (let i = cur; step < 0 ? i > max : i < max; i += step) {
        res.push(i);
    }
    return res;
};

/**
 * Returns true for leap years, false for non-leap years.
 *
 * @export
 * @param year
 * @returns
 */
export const isLeap = (year: number): boolean => (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0));

export const weekDay = (year: number, month: number, day: number): number => new Date(year, month, day).getDay();

/**
 * Return weekday and number of days for year, month.
 *
 * @export
 * @param year
 * @param month
 * @returns
 */
export const monthRange = (year: number, month: number): number[] => {
    if ((month < 0) || (month > 11)) {
        throw new Error('Invalid month specified');
    }
    const day = weekDay(year, month, 1);
    let nDays = MDAYS[month];
    if ((month === FEBRUARY) && (isLeap(year))) {
        nDays++;
    }
    return [day, nDays];
};

export interface IFormattedParts {
    value: string;
    literal?: string;
    combined: string;
}

export interface IFormattingOptions {
    day?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    weekday?: 'long' | 'short' | 'narrow';
    year?: 'numeric' | '2-digit';
}

export interface IFormattingViews {
    day?: boolean;
    month?: boolean;
    year?: boolean;
}

export enum WEEKDAYS {
    SUNDAY,
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY
}

export class Calendar {
    public timedelta(date: Date, interval: string, units: number): Date {
        const ret = new Date(date);

        const checkRollover = () => {
            if (ret.getDate() !== date.getDate()) {
                ret.setDate(0);
            }
        };

        switch (interval.toLowerCase()) {
            case 'year':
                ret.setFullYear(ret.getFullYear() + units);
                checkRollover();
                break;
            case 'quarter':
                ret.setMonth(ret.getMonth() + 3 * units);
                checkRollover();
                break;
            case 'month':
                ret.setMonth(ret.getMonth() + units);
                checkRollover();
                break;
            case 'week':
                ret.setDate(ret.getDate() + 7 * units);
                break;
            case 'day':
                ret.setDate(ret.getDate() + units);
                break;
            case 'hour':
                ret.setTime(ret.getTime() + units * 3600000);
                break;
            case 'minute':
                ret.setTime(ret.getTime() + units * 60000);
                break;
            case 'second':
                ret.setTime(ret.getTime() + units * 1000);
                break;
            default:
                throw new Error('Invalid interval specifier');
        }

        return ret;
    }
}

import { DateRangeDescriptor, DateRangeType } from '../core/dates';
import { mkenum } from '../core/utils';

/**
 * Sets the selection type - single, multi or range.
 */
export const CalendarSelection = mkenum({
    SINGLE: 'single',
    MULTI: 'multi',
    RANGE: 'range'
});
export type CalendarSelection = (typeof CalendarSelection)[keyof typeof CalendarSelection];

export enum ScrollDirection {
    PREV = 'prev',
    NEXT = 'next',
    NONE = 'none'
}

export interface IViewDateChangeEventArgs {
    previousValue: Date;
    currentValue: Date;
}

export const IgxCalendarView = mkenum({
    Month: 'month',
    Year: 'year',
    Decade: 'decade'
});

/**
 * Determines the Calendar active view - days, months or years.
 */
export type IgxCalendarView = (typeof IgxCalendarView)[keyof typeof IgxCalendarView];

/**
 * @hidden
 */
enum TimeDeltaInterval {
    Month = 'month',
    Year = 'year'
}

const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const FEBRUARY = 1;

const YEARS_PER_PAGE = 15;
const YEARS_PER_ROW = 3;

export const range = (start = 0, stop, step = 1) => {
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

export const isDateInRanges = (date: Date, ranges: DateRangeDescriptor[]): boolean => {
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateInMs = date.getTime();

    if (!ranges) {
        return false;
    }

    for (const descriptor of ranges) {
        const dRanges = descriptor.dateRange ? descriptor.dateRange.map(
            r => new Date(r.getFullYear(), r.getMonth(), r.getDate())) : undefined;
        switch (descriptor.type) {
            case (DateRangeType.After):
                if (dateInMs > dRanges[0].getTime()) {
                    return true;
                }

                break;
            case (DateRangeType.Before):
                if (dateInMs < dRanges[0].getTime()) {
                    return true;
                }

                break;
            case (DateRangeType.Between):
                const dRange = dRanges.map(d => d.getTime());
                const min = Math.min(dRange[0], dRange[1]);
                const max = Math.max(dRange[0], dRange[1]);
                if (dateInMs >= min && dateInMs <= max) {
                    return true;
                }

                break;
            case (DateRangeType.Specific):
                const datesInMs = dRanges.map(d => d.getTime());
                for (const specificDateInMs of datesInMs) {
                    if (dateInMs === specificDateInMs) {
                        return true;
                    }
                }

                break;
            case (DateRangeType.Weekdays):
                const day = date.getDay();
                if (day % 6 !== 0) {
                    return true;
                }

                break;
            case (DateRangeType.Weekends):
                const weekday = date.getDay();
                if (weekday % 6 === 0) {
                    return true;
                }

                break;
            default:
                return false;
        }
    }

    return false;
};

export interface ICalendarDate {
    date: Date;
    isCurrentMonth: boolean;
    isPrevMonth: boolean;
    isNextMonth: boolean;
    isDisabled: boolean;
}

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
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6
}

export class Calendar {

    private _firstWeekDay: WEEKDAYS | number;
    private _disabledDates: DateRangeDescriptor[];

    constructor(firstWeekDay: WEEKDAYS = WEEKDAYS.SUNDAY) {
        this._firstWeekDay = firstWeekDay;
    }

    public get firstWeekDay(): number {
        return this._firstWeekDay % 7;
    }

    public set firstWeekDay(value: number) {
        this._firstWeekDay = value;
    }

    public get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }

    public set disabledDates(value: DateRangeDescriptor[]) {
        this._disabledDates = value;
    }

    /**
     * Returns an array of weekdays for one week starting
     * with the currently set `firstWeekDay`
     *
     * this.firstWeekDay = 0 (Sunday) --> [0, 1, 2, 3, 4, 5, 6]
     * this.firstWeekDay = 1 (Monday) --> [1, 2, 3, 4, 5, 6, 0]
     *
     * @returns
     *
     * @memberof Calendar
     */
    public weekdays(): number[] {
        const res = [];
        for (const i of range(this.firstWeekDay, this.firstWeekDay + 7)) {
            res.push(i % 7);
        }
        return res;
    }

    /**
     * Returns the date values for one month. It will always iterate throught
     * complete weeks, so it will contain dates outside the specified month.
     *
     * @param year
     * @param month
     * @param boolean
     * @returns
     *
     * @memberof Calendar
     */
    public monthDates(year: number, month: number, extraWeek = false): ICalendarDate[] {
        let date = new Date(year, month, 1);
        let days = (date.getDay() - this.firstWeekDay) % 7;
        if (days < 0) {
            days = 7 - Math.abs(days);
        }
        date = this.timedelta(date, 'day', -days);
        const res = [];
        let value: ICalendarDate;

        // eslint-disable-next-line no-constant-condition
        while (true) {

            value = this.generateICalendarDate(date, year, month);
            res.push(value);

            date = this.timedelta(date, 'day', 1);

            if ((date.getMonth() !== month) && (date.getDay() === this.firstWeekDay)) {
                if (extraWeek && res.length <= 35) {
                    for (const _ of range(0, 7)) {
                        value = this.generateICalendarDate(date, year, month);
                        res.push(value);
                        date = this.timedelta(date, 'day', 1);
                    }
                }
                break;
            }
        }
        return res;
    }

	public yearDates(date: Date) {
		const result: Date[] = [];
		const year = date.getFullYear();
		const month = date.getMonth();
		const start = Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;
		const rows = YEARS_PER_PAGE / YEARS_PER_ROW;

		for (let i = 0; i < rows; i++) {
			const row: Date[] = [];

			for (let j = 0; j < YEARS_PER_ROW; j++) {
				const _year = start + i * YEARS_PER_ROW + j;
				const _date = new Date(_year, month, 1);
				_date.setFullYear(_year);
				row.push(_date);
			}

			result.push(...row);
		}

		return result;
	}

    /**
     * Returns a matrix (array of arrays) representing a month's calendar.
     * Each row represents a full week; week entries are ICalendarDate objects.
     *
     * @param year
     * @param month
     * @returns
     *
     * @memberof Calendar
     */
    public monthDatesCalendar(year: number, month: number, extraWeek = false): ICalendarDate[][] {
        const dates = this.monthDates(year, month, extraWeek);
        const result = [];

        for (const i of range(0, dates.length, 7)) {
            result.push(dates.slice(i, i + 7));
        }

        return result;
    }

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

    public formatToParts(date: Date, locale: string, options: any, parts: string[]) {
        const formatter = new Intl.DateTimeFormat(locale, options);
        const result = {
            date,
            full: formatter.format(date)
        };

        if ((formatter as any).formatToParts) {
            const formattedParts = (formatter as any).formatToParts(date);

            const toType = (partType: string) => {
                const index = formattedParts.findIndex(({ type }) => type === partType);
                const o: IFormattedParts = { value: '', literal: '', combined: '' };

                if (partType === 'era' && index > -1) {
                    o.value = formattedParts[index].value;
                    return o;
                } else if (partType === 'era' && index === -1) {
                    return o;
                }

                o.value = formattedParts[index].value;
                o.literal = formattedParts[index + 1] ? formattedParts[index + 1].value : '';
                o.combined = [o.value, o.literal].join('');
                return o;
            };

            for (const each of parts) {
                result[each] = toType(each);
            }
        } else {
            for (const each of parts) {
                result[each] = { value: '', literal: '', combined: '' };
            }
        }
        return result;
    }

    public getFirstViewDate(date: Date, interval: string, activeViewIdx: number) {
        return this.timedelta(date, interval, -activeViewIdx);
    }

    public getDateByView(date: Date, interval: string, activeViewIdx: number) {
        return this.timedelta(date, interval, activeViewIdx);
    }

    public getNextMonth(date: Date) {
        return this.timedelta(date, TimeDeltaInterval.Month, 1);
    }

    public getPrevMonth(date: Date) {
        return this.timedelta(date, TimeDeltaInterval.Month, -1);
    }

    public getNextYear(date: Date) {
        return this.timedelta(date, TimeDeltaInterval.Year, 1);
    }

    public getPrevYear(date: Date) {
        return this.timedelta(date, TimeDeltaInterval.Year, -1);
    }

    public getNextYears(date: Date) {
        return this.timedelta(date, TimeDeltaInterval.Year, 15);
    }

    public getPrevYears(date: Date) {
        return this.timedelta(date, TimeDeltaInterval.Year, -15);
    }

    public getWeekNumber(date: Date, weekStart: WEEKDAYS | number) {
        // current year
        const yearStart = new Date(date.getFullYear(), 0, 1);
        // first day number of the current year
        let firstDayOfTheYear = yearStart.getDay() - weekStart;
        firstDayOfTheYear = firstDayOfTheYear >= 0 ? firstDayOfTheYear : firstDayOfTheYear + 7;
        const dayInMilSeconds = 86400000;
        // day number in the year
        const dayNumber = Math.floor((date.getTime() - yearStart.getTime() -
        (date.getTimezoneOffset() - yearStart.getTimezoneOffset()) * 60000) / dayInMilSeconds) + 1;
        let weekNumber: number;
        // if 01 Jan is Monday to Thursday, is considered 1st week of the year
        // if 01 Jan starts Friday to Sunday, is considered last week of previous year
        if (firstDayOfTheYear < 4) {
            // when calculating the week number we add 1 for the 1st week
            weekNumber = Math.floor((dayNumber + firstDayOfTheYear - 1) / 7) + 1;
        } else {
            // calculating the week number
            weekNumber = Math.floor((dayNumber + firstDayOfTheYear - 1) / 7);
        }
        // if the week number is greater than week 52
        if (weekNumber > 52) {
            // next year
            const nextYear = new Date(date.getFullYear() + 1, 0, 1);
            // first day of the next year
            let nextYearFirstDay = nextYear.getDay() - weekStart;
            nextYearFirstDay = nextYearFirstDay >= 0 ? nextYearFirstDay : nextYearFirstDay + 7;
            // if 01 Jan of the next year is Monday to Thursday, is considered 1st week of the next year
            // if 01 Jan is Friday to Sunday, is considered 53rd week of the current year
            weekNumber = nextYearFirstDay < 4 ? 1 : 53;
        }
        return weekNumber;
    }

    public getClosestDate(dates: ICalendarDate[], target: Date, delta: number): Date | null {
        let counter = 0;

        while (counter < dates.length) {
            const nextDate = new Date(target);
            nextDate.setDate(nextDate.getDate() + delta * (counter + 1));
            nextDate.setHours(0, 0, 0, 0);

            for (const day of dates) {
                const compareDate = new Date(day.date);
                compareDate.setHours(0, 0, 0, 0);

                if (compareDate.getTime() === nextDate.getTime()) {
                    if (!day.isDisabled) return day.date;
                    else break; // Found disabled target date, adjust and try again
                }
            }

            counter++;
        }

        return null;
    }

    private generateICalendarDate(date: Date, year: number, month: number): ICalendarDate {
        return {
            date,
            isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
            isNextMonth: this.isNextMonth(date, year, month),
            isPrevMonth: this.isPreviousMonth(date, year, month),
            isDisabled: this.isDisabled(date)
        };
    }

    private isPreviousMonth(date: Date, year: number, month: number): boolean {
        if (date.getFullYear() === year) {
            return date.getMonth() < month;
        }
        return date.getFullYear() < year;
    }

    private isNextMonth(date: Date, year: number, month: number): boolean {
        if (date.getFullYear() === year) {
            return date.getMonth() > month;
        }

        return date.getFullYear() > year;
    }

    private isDisabled(date: Date): boolean {
        return isDateInRanges(date, this.disabledDates);
    }
}

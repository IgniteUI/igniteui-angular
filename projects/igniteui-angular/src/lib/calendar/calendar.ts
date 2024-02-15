import { DateRangeDescriptor } from '../core/dates';
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
}

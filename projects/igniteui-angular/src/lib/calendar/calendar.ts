
const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const FEBRUARY = 1;

export function range(start = 0, stop, step = 1) {
    const res = [];
    const cur = (stop === undefined) ? 0 : start;
    const max = (stop === undefined) ? start : stop;
    for (let i = cur; step < 0 ? i > max : i < max; i += step) {
        res.push(i);
    }
    return res;
}

/**
 * Returns true for leap years, false for non-leap years.
 *
 * @export
 * @param year
 * @returns
 */
export function isLeap(year: number): boolean {
    return (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0));
}

export function weekDay(year: number, month: number, day: number): number {
    return new Date(year, month, day).getDay();
}

/**
 * Return weekday and number of days for year, month.
 *
 * @export
 * @param year
 * @param month
 * @returns
 */
export function monthRange(year: number, month: number): number[] {
    if ((month < 0) || (month > 11)) {
        throw new Error('Invalid month specified');
    }
    const day = weekDay(year, month, 1);
    let nDays = MDAYS[month];
    if ((month === FEBRUARY) && (isLeap(year))) {
        nDays++;
    }
    return [day, nDays];
}

export interface ICalendarDate {
    date: Date;
    isCurrentMonth: boolean;
    isPrevMonth: boolean;
    isNextMonth: boolean;
}

export interface IFormattedParts {
    value: string;
    literal?: string;
    combined: string;
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

    private _firstWeekDay: number | WEEKDAYS;

    constructor(firstWeekDay: number | WEEKDAYS = WEEKDAYS.SUNDAY) {
        this._firstWeekDay = firstWeekDay;
    }

    public get firstWeekDay(): number {
        return this._firstWeekDay % 7;
    }

    public set firstWeekDay(value: number) {
        this._firstWeekDay = value;
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
    public monthdates(year: number, month: number, extraWeek: boolean = false): ICalendarDate[] {
        let date = new Date(year, month, 1);
        let days = (date.getDay() - this.firstWeekDay) % 7;
        if (days < 0) {
            days = 7 - Math.abs(days);
        }
        date = this.timedelta(date, 'day', -days);
        const res = [];
        let value: ICalendarDate;

        while (true) {

            value = this.generateICalendarDate(date, year, month);
            res.push(value);
            date = this.timedelta(date, 'day', 1);

            if ((date.getMonth() !== month) && (date.getDay() === this.firstWeekDay)) {
                if (extraWeek && res.length <= 35) {
                    for (const i of range(0, 7)) {
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
    public monthdatescalendar(year: number, month: number, extraWeek: boolean = false): ICalendarDate[][] {
        const dates = this.monthdates(year, month, extraWeek);
        const res = [];
        for (const i of range(0, dates.length, 7)) {
            res.push(dates.slice(i, i + 7));
        }
        return res;
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
                const o: IFormattedParts = { value: '', literal: '', combined: ''};

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
                result[each] = { value: '', literal: '', combined: ''};
            }
        }
        return result;
    }

    private generateICalendarDate(date: Date, year: number, month: number): ICalendarDate {
        return {
            date,
            isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
            isNextMonth: this.isNextMonth(date, year, month),
            isPrevMonth: this.isPreviousMonth(date, year, month)
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
}

export const IGX_CALENDAR_COMPONENT = 'IgxCalendarComponentToken';

export interface IgxCalendarBase {
    value: Date | Date[];
    selection: string;
    isCurrentYear(value: Date): boolean;
    isCurrentMonth(value: Date): boolean;
    isDateDisabled(value: Date): boolean;
    isDateSpecial(value: Date): boolean;
}

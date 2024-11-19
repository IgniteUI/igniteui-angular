import { isDate } from "../../core/utils";

/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type DayParameter = CalendarDay | Date;

export type CalendarRangeParams = {
    start: DayParameter;
    end: DayParameter | number;
    unit?: DayInterval;
};

type CalendarDayParams = {
    year: number;
    month: number;
    date?: number;
};

export type DayInterval = "year" | "quarter" | "month" | "week" | "day";

export const daysInWeek = 7;
const millisecondsInDay = 86400000;

export function toCalendarDay(date: DayParameter) {
    return isDate(date) ? CalendarDay.from(date) : date;
}

function checkRollover(original: CalendarDay, modified: CalendarDay) {
    return original.date !== modified.date
        ? modified.set({ date: 0 })
        : modified;
}

export class CalendarDay {
    private _date!: Date;

    /** Constructs and returns the current day. */
    public static get today() {
        return CalendarDay.from(new Date());
    }

    /** Constructs a new CalendarDay instance from a Date object. */
    public static from(date: Date) {
        return new CalendarDay({
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
        });
    }

    constructor(args: CalendarDayParams) {
        this._date = new Date(args.year, args.month, args.date ?? 1);
    }

    /** Returns a copy of this instance. */
    public clone() {
        return CalendarDay.from(this._date);
    }

    /**
     * Returns a new instance with values replaced.
     */
    public set(args: Partial<CalendarDayParams>) {
        return new CalendarDay({
            year: args.year ?? this.year,
            month: args.month ?? this.month,
            date: args.date ?? this.date,
        });
    }

    public add(unit: DayInterval, value: number) {
        const result = this.clone();
        switch (unit) {
            case "year":
                result._date.setFullYear(result.year + value);
                return checkRollover(this, result);
            case "quarter":
                result._date.setMonth(result.month + 3 * value);
                return checkRollover(this, result);
            case "month":
                result._date.setMonth(result.month + value);
                return checkRollover(this, result);
            case "week":
                result._date.setDate(result.date + 7 * value);
                return result;
            case "day":
                result._date.setDate(result.date + value);
                return result;
            default:
                throw new Error("Invalid interval");
        }
    }

    /** Returns the day of the week (Sunday = 0). */
    public get day() {
        return this._date.getDay();
    }

    /** Returns the full year. */
    public get year() {
        return this._date.getFullYear();
    }

    /** Returns the month. */
    public get month() {
        return this._date.getMonth();
    }

    /** Returns the date */
    public get date() {
        return this._date.getDate();
    }

    /** Returns the timestamp since epoch in milliseconds. */
    public get timestamp() {
        return this._date.getTime();
    }

    /** Returns the current week number. */
    public get week() {
        const firstDay = new CalendarDay({ year: this.year, month: 0 })
            .timestamp;
        const currentDay =
            (this.timestamp - firstDay + millisecondsInDay) / millisecondsInDay;
        return Math.ceil(currentDay / daysInWeek);
    }

    /** Returns the underlying native date instance. */
    public get native() {
        return new Date(this._date);
    }

    /**
     * Whether the current date is a weekend day.
     *
     * @remarks
     * This is naive, since it does not account for locale specifics.
     */
    public get weekend() {
        return this.day < 1 || this.day > 5;
    }

    public equalTo(value: DayParameter) {
        return this.timestamp === toCalendarDay(value).timestamp;
    }

    public greaterThan(value: DayParameter) {
        return this.timestamp > toCalendarDay(value).timestamp;
    }

    public lessThan(value: DayParameter) {
        return this.timestamp < toCalendarDay(value).timestamp;
    }

    public toString() {
        return `${this.native}`;
    }
}

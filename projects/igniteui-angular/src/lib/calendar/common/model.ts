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

    /** Returns the ISO 8601 week number. */
    public get week() {
        return this.getWeekNumber();
    }

    /**
     * Gets the week number using ISO 8601 - Week 1 contains the first Thursday of the year.
     */
    public getWeekNumber(weekStart: number = 1): number {
        const currentThursday = this.getThursdayOfWeek(weekStart);
        const firstWeekThursday = this.getFirstWeekThursday(currentThursday.year, weekStart);

        const weeksDifference = this.getWeeksDifference(currentThursday, firstWeekThursday);
        const weekNumber = weeksDifference + 1;

        // Handle dates that belong to the previous year's last week
        if (weekNumber <= 0) {
            return this.getPreviousYearLastWeek(currentThursday.year - 1, weekStart);
        }

        return weekNumber;
    }

    /**
     * Gets the Thursday of the current date's week.
     */
    private getThursdayOfWeek(weekStart: number): CalendarDay {
        const dayOffset = (this.day - weekStart + 7) % 7;
        const thursdayOffset = (4 - weekStart + 7) % 7; // Thursday is day 4
        return this.add('day', thursdayOffset - dayOffset);
    }

    /**
     * Gets the Thursday of the first week of the given year (Week 1).
     */
    private getFirstWeekThursday(year: number, weekStart: number): CalendarDay {
        const january4th = new CalendarDay({ year, month: 0, date: 4 });
        const dayOffset = (january4th.day - weekStart + 7) % 7;
        const thursdayOffset = (4 - weekStart + 7) % 7;
        return january4th.add('day', thursdayOffset - dayOffset);
    }

    /**
     * Calculates the number of weeks between two Thursday dates.
     */
    private getWeeksDifference(currentThursday: CalendarDay, firstWeekThursday: CalendarDay): number {
        const daysDifference = Math.floor((currentThursday.timestamp - firstWeekThursday.timestamp) / millisecondsInDay);
        return Math.floor(daysDifference / 7);
    }

    /**
     * Gets the last week number of the previous year.
     */
    private getPreviousYearLastWeek(previousYear: number, weekStart: number): number {
        const december31st = new CalendarDay({ year: previousYear, month: 11, date: 31 });
        const lastWeekThursday = december31st.getThursdayOfWeek(weekStart);
        const firstWeekThursday = this.getFirstWeekThursday(previousYear, weekStart);

        return this.getWeeksDifference(lastWeekThursday, firstWeekThursday) + 1;
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

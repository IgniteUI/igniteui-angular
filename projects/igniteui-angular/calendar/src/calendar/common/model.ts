import { isDate } from "../../core/utils";

/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type DayParameter = CalendarDay | Date;

export type CalendarRangeParams = {
    start: DayParameter;
    end: DayParameter | number;
    unit?: DayInterval;
    inclusive?: boolean;
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
     * Gets the week number based on week start day.
     * Uses ISO 8601 (first Thursday rule) only when weekStart is Monday (1).
     * For other week starts, uses simple counting from January 1st.
     */
    public getWeekNumber(weekStart: number = 1): number {
        if (weekStart === 1) {
            return this.calculateISO8601WeekNumber();
        } else {
            return this.calculateSimpleWeekNumber(weekStart);
        }
    }

    /**
     * Calculates week number using ISO 8601 standard (Monday start, first Thursday rule).
     */
    private calculateISO8601WeekNumber(): number {
        const currentThursday = this.getThursdayOfWeek();
        const firstWeekThursday = this.getFirstWeekThursday(currentThursday.year);

        const weeksDifference = this.getWeeksDifference(currentThursday, firstWeekThursday);
        const weekNumber = weeksDifference + 1;

        // Handle dates that belong to the previous year's last week
        if (weekNumber <= 0) {
            return this.getPreviousYearLastWeek(currentThursday.year - 1);
        }

        return weekNumber;
    }

    /**
     * Calculates week number using simple counting from January 1st.
     */
    private calculateSimpleWeekNumber(weekStart: number): number {
        const yearStart = new CalendarDay({ year: this.year, month: 0, date: 1 });
        const yearStartDay = yearStart.day;

        const daysUntilFirstWeek = (weekStart - yearStartDay + 7) % 7;

        if (daysUntilFirstWeek > 0) {
            const firstWeekStart = yearStart.add('day', daysUntilFirstWeek);

            if (this.timestamp < firstWeekStart.timestamp) {
                const prevYear = this.year - 1;
                const prevYearDec31 = new CalendarDay({ year: prevYear, month: 11, date: 31 });
                return prevYearDec31.calculateSimpleWeekNumber(weekStart);
            }

            const daysSinceFirstWeek = Math.floor((this.timestamp - firstWeekStart.timestamp) / millisecondsInDay);
            return Math.floor(daysSinceFirstWeek / 7) + 1;
        } else {
            const daysSinceYearStart = Math.floor((this.timestamp - yearStart.timestamp) / millisecondsInDay);
            return Math.floor(daysSinceYearStart / 7) + 1;
        }
    }

    /**
     * Gets the Thursday of the current date's week (ISO 8601 helper).
     */
    private getThursdayOfWeek(): CalendarDay {
        const dayOffset = (this.day - 1 + 7) % 7; // Monday start
        const thursdayOffset = 3; // Thursday is 3 days from Monday
        return this.add('day', thursdayOffset - dayOffset);
    }

    /**
     * Gets the Thursday of the first week of the given year (ISO 8601 helper).
     */
    private getFirstWeekThursday(year: number): CalendarDay {
        const january4th = new CalendarDay({ year, month: 0, date: 4 });
        const dayOffset = (january4th.day - 1 + 7) % 7; // Monday start
        const thursdayOffset = 3; // Thursday is 3 days from Monday
        return january4th.add('day', thursdayOffset - dayOffset);
    }

    /**
     * Calculates the number of weeks between two Thursday dates (ISO 8601 helper).
     */
    private getWeeksDifference(currentThursday: CalendarDay, firstWeekThursday: CalendarDay): number {
        const daysDifference = Math.floor((currentThursday.timestamp - firstWeekThursday.timestamp) / millisecondsInDay);
        return Math.floor(daysDifference / 7);
    }

    /**
     * Gets the last week number of the previous year (ISO 8601 helper).
     */
    private getPreviousYearLastWeek(previousYear: number): number {
        const december31st = new CalendarDay({ year: previousYear, month: 11, date: 31 });
        const lastWeekThursday = december31st.getThursdayOfWeek();
        const firstWeekThursday = this.getFirstWeekThursday(previousYear);

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
    public greaterThanOrEqual(value: DayParameter) {
        return this.timestamp >= toCalendarDay(value).timestamp;
    }

    public lessThan(value: DayParameter) {
        return this.timestamp < toCalendarDay(value).timestamp;
    }

    public lessThanOrEqual(value: DayParameter) {
        return this.timestamp <= toCalendarDay(value).timestamp;
    }

    public toString() {
        return `${this.native}`;
    }
}

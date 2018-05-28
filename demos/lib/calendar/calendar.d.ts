export declare function range(start: number, stop: any, step?: number): any[];
export declare function isLeap(year: number): boolean;
export declare function weekDay(year: number, month: number, day: number): number;
export declare function monthRange(year: number, month: number): number[];
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
export declare enum WEEKDAYS {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
}
export declare class Calendar {
    private _firstWeekDay;
    constructor(firstWeekDay?: number | WEEKDAYS);
    firstWeekDay: number;
    weekdays(): number[];
    monthdates(year: number, month: number, extraWeek?: boolean): ICalendarDate[];
    monthdatescalendar(year: number, month: number, extraWeek?: boolean): ICalendarDate[][];
    timedelta(date: Date, interval: string, units: number): Date;
    formatToParts(date: Date, locale: string, options: any, parts: string[]): {
        date: Date;
        full: string;
    };
    private generateICalendarDate(date, year, month);
    private isPreviousMonth(date, year, month);
    private isNextMonth(date, year, month);
}

export interface IgxDateTimeEditorEventArgs {
    oldValue: Date | string;
    newValue: Date | string;
}

export enum DatePart {
    Date = 'date',
    Month = 'month',
    Year = 'year',
    Hours = 'hours',
    Minutes = 'minutes',
    Seconds = 'seconds',
    AmPm = 'ampm'
}

export interface DatePartInfo {
    type: DatePart;
    start: number;
    end: number;
    format: string;
}

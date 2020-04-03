export interface IgxDateTimeEditorEventArgs {
    oldValue: Date | string;
    newValue: Date | string;
}

/**
* An @Enum that allows you to specify a particular date, time or AmPm part.
*/
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

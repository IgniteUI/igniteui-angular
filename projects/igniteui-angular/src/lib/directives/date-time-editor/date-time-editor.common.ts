export interface IgxDateTimeEditorEventArgs {
    oldValue: Date;
    newValue: Date;
    userInput: string;
}

/**
 * An @Enum that allows you to specify a particular date, time or AmPm part.
 */
export enum DatePart {
    Date = 'date',
    Month = 'month',
    Year = 'year',
    Hours = 'hour',
    Minutes = 'minute',
    Seconds = 'second',
    AmPm = 'ampm',
    Literal = 'literal'
}

export interface DatePartInfo {
    type: DatePart;
    start: number;
    end: number;
    format: string;
}

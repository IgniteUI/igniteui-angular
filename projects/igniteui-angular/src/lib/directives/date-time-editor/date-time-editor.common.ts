export interface IgxDateTimeEditorEventArgs {
    readonly oldValue?: Date;
    newValue?: Date;
    readonly userInput: string;
}

/**
 * Specify a particular date, time or AmPm part.
 */
export enum DatePart {
    Date = 'date',
    Month = 'month',
    Year = 'year',
    Hours = 'hours',
    Minutes = 'minutes',
    Seconds = 'seconds',
    FractionalSeconds = 'fractionalSeconds',
    AmPm = 'ampm',
    Literal = 'literal'
}

/** @hidden @internal */
export interface DatePartInfo {
    type: DatePart;
    start: number;
    end: number;
    format: string;
}

/** Delta values used for spin actions. */
export interface DatePartDeltas {
    date?: number;
    month?: number;
    year?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    fractionalSeconds?: number;
}

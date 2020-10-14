import { IgxColumnComponent } from './column.component';

/**
 * @hidden
 * @internal
 */
export interface MRLColumnSizeInfo {
    ref: IgxColumnComponent;
    width: number;
    colSpan: number;
    colEnd: number;
    widthSetByUser: boolean;
}

/**
 * @hidden
 * @internal
 */
export interface MRLResizeColumnInfo {
    target: IgxColumnComponent;
    spanUsed: number;
}

export interface IColumnPipeArgs {
    /** The date/time components that a date column will display, using predefined options or a custom format string. */
    format?: string;
    /** A timezone offset (such as '+0430'), or a standard UTC/GMT or continental US timezone abbreviation. */
    timezone?: string;
    /**
     * Decimal representation options, specified by a string in the following format:
     * `{minIntegerDigits}`.`{minFractionDigits}`-`{maxFractionDigits}`.
     * `minIntegerDigits`: The minimum number of integer digits before the decimal point. Default is 1.
     * `minFractionDigits`: The minimum number of digits after the decimal point. Default is 0.
     * `maxFractionDigits`: The maximum number of digits after the decimal point. Default is 3.
     */
    digitsInfo?: string;
}

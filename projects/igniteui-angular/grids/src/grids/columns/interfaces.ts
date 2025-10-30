import { ColumnType } from '../common/grid.interface';
import { WEEKDAYS } from "../../calendar/calendar";

/**
 * @hidden
 * @internal
 */
export interface MRLColumnSizeInfo {
    ref: ColumnType;
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
    target: ColumnType;
    spanUsed: number;
}

export interface IFieldPipeArgs {
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
    /** The currency code of type string, default value undefined */
    currencyCode?: string;
    /**
     * Allow us to display currency 'symbol' or 'code' or 'symbol-narrow' or our own string.
     * The value is of type string. By default is set to 'symbol'
     */
    display?: string;

    /** The first week day to be displayed in calendar when filtering or editing a date column */
    weekStart?: WEEKDAYS | number;
}

// D.P. Can't use `export type IColumnPipeArgs = IFieldPipeArgs` because TypeScripts Compiler API optimizes it away completely
 
export interface IColumnPipeArgs extends IFieldPipeArgs {}

export interface IFieldEditorOptions {
    /**
     * A custom input format string used for the built-in editors of date/time columns.
     * See the Editing section under https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/column-types#datetime-date-and-time
     */
    dateTimeFormat?: string;
}

export interface IColumnEditorOptions extends IFieldEditorOptions {}

export interface ISortingOptions {
    mode: 'single' | 'multiple';
}

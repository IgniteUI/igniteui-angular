/**
 * @hidden
 */
export interface IMonthView {
    value: Date | Date[];
    viewDate: Date;
}

/**
 * @hidden
 */
export interface IViewChangedArgs {
    date: Date;
    delta: number;
    moveToFirst?: boolean;
}

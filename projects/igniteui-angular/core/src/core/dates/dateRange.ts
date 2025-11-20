export interface DateRangeDescriptor {
    type: DateRangeType;
    dateRange?: Date[];
}

export enum DateRangeType {
    After,
    Before,
    Between,
    Specific,
    Weekdays,
    Weekends
}

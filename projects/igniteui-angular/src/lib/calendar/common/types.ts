export enum DateRangeType {
  After,
  Before,
  Between,
  Specific,
  Weekdays,
  Weekends,
}

/* creationType: DateRangeDescriptor */
export interface DateRangeDescriptor {
  type: DateRangeType;
  dateRange?: Date[];
}

export type WeekDays =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface IgcCalendarBaseEventMap {
  igcChange: CustomEvent<Date | Date[]>;
}

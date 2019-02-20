/** @hidden */
export const IGX_DATE_PICKER_COMPONENT = 'IgxDatePickerComponentToken';

/** @hidden */
export interface IDatePicker {
    value: Date;
    mask: string;
    inputMask: string;
    rawDateString: string;
    dateFormatParts: any[];
    invalidDate: string;
}

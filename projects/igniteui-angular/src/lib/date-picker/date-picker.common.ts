import { IBaseEventArgs } from '../core/utils';
import { IgxDatePickerComponent } from './date-picker.component';

/**
 * Provides information about date picker reference and its current value
 * when onDisabledDate event is fired.
 */
export interface IDatePickerDisabledDateEventArgs extends IBaseEventArgs {
    datePicker: IgxDatePickerComponent;
    currentValue: Date;
}

/**
 * Provides information about date picker reference and its previously valid value
 * when onValidationFailed event is fired.
 */
export interface IDatePickerValidationFailedEventArgs extends IBaseEventArgs {
    prevValue: Date;
}

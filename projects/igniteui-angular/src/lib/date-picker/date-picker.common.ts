import { IBaseEventArgs } from '../core/utils';

/**
 * Provides information about date picker reference and its previously valid value
 * when onValidationFailed event is fired.
 */
export interface IDatePickerValidationFailedEventArgs extends IBaseEventArgs {
    prevValue: Date | string;
    currentValue: Date | string;
}

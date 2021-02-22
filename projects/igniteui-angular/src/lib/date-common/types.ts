import { IBaseCancelableBrowserEventArgs, mkenum } from '../core/utils';
import { DateRange } from '../date-range-picker/public_api';

/** Header orientation in `dialog` mode. */
export const HeaderOrientation = mkenum({
    Horizontal: 'horizontal',
    Vertical: 'vertical'
});
export type HeaderOrientation = (typeof HeaderOrientation)[keyof typeof HeaderOrientation];

export interface PickerCancelableEventArgs extends IBaseCancelableBrowserEventArgs {
    oldValue: Date | DateRange;
    newValue: Date | DateRange;
}

import { mkenum } from '../core/utils';
/** Header orientation in `dialog` mode. */
export const PickerHeaderOrientation = mkenum({
    Horizontal: 'horizontal',
    Vertical: 'vertical'
});
export type PickerHeaderOrientation = (typeof PickerHeaderOrientation)[keyof typeof PickerHeaderOrientation];

/**
 * This enumeration is used to configure whether the date/time picker has an editable input with drop down
 * or is readonly - the date/time is selected only through a dialog.
 */
export const PickerInteractionMode = mkenum({
    DropDown: 'dropdown',
    Dialog: 'dialog'
});
export type PickerInteractionMode = (typeof PickerInteractionMode)[keyof typeof PickerInteractionMode];

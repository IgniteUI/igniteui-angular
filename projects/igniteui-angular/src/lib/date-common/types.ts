/** Header orientation in `dialog` mode. */
export const PickerHeaderOrientation = {
    Horizontal: 'horizontal',
    Vertical: 'vertical'
} as const;
export type PickerHeaderOrientation = (typeof PickerHeaderOrientation)[keyof typeof PickerHeaderOrientation];

/** Calendar orientation. */
export const PickerCalendarOrientation = {
    Horizontal: 'horizontal',
    Vertical: 'vertical'
} as const;
export type PickerCalendarOrientation = (typeof PickerCalendarOrientation)[keyof typeof PickerCalendarOrientation];

/**
 * This enumeration is used to configure whether the date/time picker has an editable input with drop down
 * or is readonly - the date/time is selected only through a dialog.
 */
export const PickerInteractionMode = {
    DropDown: 'dropdown',
    Dialog: 'dialog'
} as const;
export type PickerInteractionMode = (typeof PickerInteractionMode)[keyof typeof PickerInteractionMode];

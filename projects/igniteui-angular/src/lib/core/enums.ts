import { mkenum } from './utils';
/**
 * This enumeration is used to configure whether the date/time picker has an editable input with drop down
 * or is readonly - the date/time is selected only through a dialog.
 */
export const InteractionMode = mkenum({
    DropDown: 'dropdown',
    Dialog: 'dialog'
});
export type InteractionMode = (typeof InteractionMode)[keyof typeof InteractionMode];

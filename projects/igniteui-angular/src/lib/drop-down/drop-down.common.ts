import { CancelableEventArgs } from '../core/utils';
import { IDropDownItem } from './drop-down-utils';

/** @hidden */
export enum Navigate {
    Up = -1,
    Down = 1
}

/**
 * Interface that encapsulates onSelection event arguments - old selection, new selection and cancel selection.
 * @export
 */
export interface ISelectionEventArgs extends CancelableEventArgs {
    oldSelection: IDropDownItem;
    newSelection: IDropDownItem;
}

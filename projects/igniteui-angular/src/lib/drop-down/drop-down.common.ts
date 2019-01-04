import { CancelableEventArgs } from '../core/utils';
import { IgxDropDownItemBase } from './drop-down-item.base';

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
    oldSelection: IgxDropDownItemBase;
    newSelection: IgxDropDownItemBase;
}

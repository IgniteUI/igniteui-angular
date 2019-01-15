import { CancelableEventArgs } from '../../core/utils';

/**
 * Interface that encapsulates onItemSelection event arguments - old selection, new selection and cancel selection.
 * @export
 */
export interface IAutocompleteItemSelectionEventArgs extends CancelableEventArgs {
    value: string;
}

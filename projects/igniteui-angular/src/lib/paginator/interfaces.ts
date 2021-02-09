import { IBaseEventArgs, CancelableBrowserEventArgs } from '../core/utils';

/**
 * The event arguments after a page is changed.
 * `oldPage` is the last active page, `newPage` is the current page.
 */
export interface IPagingDoneEventArgs extends IBaseEventArgs {
    oldPage: number;
    newPage: number;
}

/**
 * The event arguments before a page is changed.
 * `oldPage` is the currently active page, `newPage` is the page that will be active if the operation completes succesfully.
 */
export interface IPagingEventArgs extends CancelableBrowserEventArgs, IPagingDoneEventArgs { }

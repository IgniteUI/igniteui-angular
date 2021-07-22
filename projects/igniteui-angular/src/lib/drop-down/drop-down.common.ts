import { CancelableEventArgs, CancelableBrowserEventArgs, IBaseEventArgs, mkenum } from '../core/utils';
import { IgxDropDownItemBaseDirective } from './drop-down-item.base';
import { IToggleView } from '../core/navigation/IToggleView';
import { EventEmitter, InjectionToken } from '@angular/core';
import { DisplayDensityBase } from '../core/density';

/** @hidden */
export enum Navigate {
    Up = -1,
    Down = 1
}

/** Key actions that have designated handlers in IgxDropDownComponent */
export const DropDownActionKey = mkenum({
    ESCAPE: 'escape',
    ENTER: 'enter',
    SPACE: 'space'
});
export type DropDownActionKey = (typeof DropDownActionKey)[keyof typeof DropDownActionKey];

/**
 * Interface that encapsulates selecting event arguments - old selection, new selection and cancel selection.
 *
 * @export
 */
export interface ISelectionEventArgs extends CancelableEventArgs, IBaseEventArgs {
    oldSelection: IgxDropDownItemBaseDirective;
    newSelection: IgxDropDownItemBaseDirective;
}

/**
 * Interface for an instance of IgxDropDownNavigationDirective
 *
 * @export
 */
export interface IDropDownNavigationDirective {
    target: any;
    handleKeyDown(event: KeyboardEvent): void;
    onArrowDownKeyDown(event?: KeyboardEvent): void;
    onArrowUpKeyDown(event?: KeyboardEvent): void;
    onEndKeyDown(event?: KeyboardEvent): void;
    onHomeKeyDown(event?: KeyboardEvent): void;
}

export const IGX_DROPDOWN_BASE = new InjectionToken<IDropDownBase>('IgxDropDownBaseToken');

/**
 * @hidden
 */
export interface IDropDownList extends DisplayDensityBase {
    selecting: EventEmitter<ISelectionEventArgs>;
    width: string;
    height: string;
    id: string;
    maxHeight: string;
    collapsed: boolean;
    items: IgxDropDownItemBaseDirective[];
    headers: IgxDropDownItemBaseDirective[];
    focusedItem: IgxDropDownItemBaseDirective;
    navigateFirst(): void;
    navigateLast(): void;
    navigateNext(): void;
    navigatePrev(): void;
    navigateItem(newIndex: number, direction?: Navigate): void;
    onItemActionKey(key: DropDownActionKey, event?: Event): void;
}

/**
 * @hidden
 */
export interface IDropDownBase extends IDropDownList, IToggleView {
    selectedItem: any;
    opening: EventEmitter<CancelableEventArgs>;
    opened: EventEmitter<void>;
    closing: EventEmitter<CancelableBrowserEventArgs>;
    closed: EventEmitter<void>;
    allowItemsFocus?: boolean;
    setSelectedItem(index: number): void;
    selectItem(item: IgxDropDownItemBaseDirective, event?: Event): void;
}


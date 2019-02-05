import { CancelableEventArgs } from '../core/utils';
import { IgxDropDownItemBase } from './drop-down-item.base';
import { IToggleView } from '../core/navigation/IToggleView';
import { OnInit, EventEmitter } from '@angular/core';

/** @hidden */
export enum Navigate {
    Up = -1,
    Down = 1
}

/** Key actions that have designated handlers in IgxDropDownComponent */
export enum DropDownActionKey {
    ESCAPE = 'escape',
    ENTER = 'enter',
    SPACE = 'space'
}

/**
 * Interface that encapsulates onSelection event arguments - old selection, new selection and cancel selection.
 * @export
 */
export interface ISelectionEventArgs extends CancelableEventArgs {
    oldSelection: IgxDropDownItemBase;
    newSelection: IgxDropDownItemBase;
}

/**
 * Interface for an instance of IgxDropDownNavigationDirective
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

export const IGX_DROPDOWN_BASE = 'IgxDropDownBaseToken';

/**
 * @hidden
 */
export interface IDropDownList {
    onSelection: EventEmitter<ISelectionEventArgs>;
    width: string;
    height: string;
    id: string;
    maxHeight: string;

    collapsed: boolean;

    items: IgxDropDownItemBase[];
    headers: IgxDropDownItemBase[];
    focusedItem: IgxDropDownItemBase;
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
    onOpening: EventEmitter<CancelableEventArgs>;
    onOpened: EventEmitter<void>;
    onClosing: EventEmitter<CancelableEventArgs>;
    onClosed: EventEmitter<void>;

    selectedItem: any;
    allowItemsFocus?: boolean;
    setSelectedItem(index: number): void;
    selectItem(item: IgxDropDownItemBase, event?: Event): void;
}


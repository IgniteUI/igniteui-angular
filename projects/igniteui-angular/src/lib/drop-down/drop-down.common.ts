import { CancelableEventArgs } from '../core/utils';
import { IgxDropDownItemBase } from './drop-down-item.base';
import { IToggleView } from '../core/navigation/IToggleView';
import { OnInit, EventEmitter } from '@angular/core';
import { DropDownActionKey } from './drop-down-navigation.directive';

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
export interface IDropDownList extends IToggleView, OnInit {
    onOpening: EventEmitter<CancelableEventArgs>;
    onOpened: EventEmitter<void>;
    onClosing: EventEmitter<CancelableEventArgs>;
    onClosed: EventEmitter<void>;
    onSelection: EventEmitter<ISelectionEventArgs>;
    width: string;
    height: string;
    id: string;
    cssClass: string;
    maxHeight: string;
    collapsed: boolean;
    items: IgxDropDownItemBase[];
    headers: IgxDropDownItemBase[];
    focusedItem: IgxDropDownItemBase;
    navigateFirst(): void;
    navigateLast(): void;
    navigateNext(): void;
    navigatePrev(): void;
    onToggleOpening(e: CancelableEventArgs): void;
    onToggleOpened(): void;
    onToggleClosing(e: CancelableEventArgs): void;
    onToggleClosed(): void;
    navigateItem(newIndex: number, direction?: Navigate): void;
    handleKeyDown(key: DropDownActionKey, event?: Event): void;
}

/**
 * @hidden
 */
export interface IDropDownBase extends IDropDownList {
    selectedItem: any;
    allowItemsFocus?: boolean;
    setSelectedItem(index: number): void;
    selectItem(item: IgxDropDownItemBase, event?: Event): void;
}


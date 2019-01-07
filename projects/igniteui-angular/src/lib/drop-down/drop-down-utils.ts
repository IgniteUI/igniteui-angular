import { IToggleView } from '../core/navigation/IToggleView';
import { OnInit, EventEmitter, ElementRef } from '@angular/core';
import { ISelectionEventArgs, Navigate } from './drop-down.common';
import { CancelableEventArgs } from '../core/utils';
import { DropDownActionKeys } from './drop-down-navigation.directive';
import { IgxDropDownItemBase } from './drop-down-item.base';

export interface DropDownNavigationDirective {
    target: any;
    handleKeyDown(event: KeyboardEvent): void;
    onArrowDownKeyDown(event?: KeyboardEvent): void;
    onArrowUpKeyDown(event?: KeyboardEvent): void;
    onEndKeyDown(event?: KeyboardEvent): void;
    onHomeKeyDown(event?: KeyboardEvent): void;
}

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
    handleKeyDown(key: DropDownActionKeys, event?: Event);
}


export const IGX_DROPDOWN_BASE = 'IgxDropDownBaseToken';
export interface IDropDownBase extends IDropDownList {
    selectedItem: any;
    allowItemsFocus?: boolean;
    items: IgxDropDownItemBase[];
    headers: IgxDropDownItemBase[];
    setSelectedItem(index: number): void;
    selectItem(item: IgxDropDownItemBase, event?: Event): void;
}

import { IToggleView } from '../core/navigation/IToggleView';
import { OnInit, EventEmitter, ElementRef } from '@angular/core';
import { ISelectionEventArgs, Navigate } from './drop-down.common';
import { CancelableEventArgs } from '../core/utils';
import { IgxComboBase } from '../combo/combo.common';

export interface ListNavigationDirective {
    target: any;
    handleKeyDown(event: KeyboardEvent): void;
    onArrowDownKeyDown(event?: KeyboardEvent): void;
    onArrowUpKeyDown(event?: KeyboardEvent): void;
    onEndKeyDown(event?: KeyboardEvent): void;
    onHomeKeyDown(event?: KeyboardEvent): void;
}
export interface DropDownNavigationDirective extends ListNavigationDirective {
    target: IDropDownBase;
    onEscapeKeyDown(event?: KeyboardEvent): void;
    onEnterKeyDown(event?: KeyboardEvent): void;
    onSpaceKeyDown(event?: KeyboardEvent): void;
}

export interface IDropDownList extends IToggleView, OnInit {
    onOpening: EventEmitter<CancelableEventArgs>;
    onOpened: EventEmitter<void>;
    onClosing: EventEmitter<CancelableEventArgs>;
    onClosed: EventEmitter<void>;
    width: string;
    height: string;
    id: string;
    cssClass: string;
    maxHeight: string;
    collapsed: boolean;
    items: IDropDownItem[];
    focusedItem: IDropDownItem;
    navigateFirst(): void;
    navigateLast(): void;
    navigateNext(): void;
    navigatePrev(): void;
    onToggleOpening(e: CancelableEventArgs): void;
    onToggleOpened(): void;
    onToggleClosing(e: CancelableEventArgs): void;
    onToggleClosed(): void;
    navigateItem(newIndex: number, direction?: Navigate): void;
}


export const IGX_DROPDOWN_BASE = 'IgxDropDownBaseToken';
export interface IDropDownBase extends IDropDownList {
    onSelection: EventEmitter<ISelectionEventArgs>;
    combo?: IgxComboBase;
    allowItemsFocus: boolean;
    selectedItem: any;
    items: IDropDownItem[];
    headers: IDropDownItem[];
    setSelectedItem(index: number): void;
    selectItem(item: IDropDownItem, event?: Event): void;
}

export interface IDropDownItem {
    itemID: any;
    value: any;
    itemStyle: boolean;
    itemHeight?: string | number;
    isSelected: boolean;
    selectedStyle: boolean;
    isFocused: boolean;
    isHeader: boolean;
    disabled: boolean;
    setTabIndex: number;
    index: number;
    elementHeight: number;
    element: ElementRef;
    clicked(event: Event): void;
}

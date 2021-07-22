import { ElementRef, EventEmitter, InjectionToken } from '@angular/core';
import { CancelableEventArgs, CancelableBrowserEventArgs, IBaseEventArgs } from '../core/utils';

export const IGX_COMBO_COMPONENT = new InjectionToken<IgxComboBase>('IgxComboComponentToken');

/** @hidden @internal TODO: Evaluate */
export interface IgxComboBase {
    id: string;
    data: any[] | null;
    valueKey: string;
    groupKey: string;
    isRemote: boolean;
    filteredData: any[] | null;
    totalItemCount: number;
    itemsMaxHeight: number;
    itemHeight: number;
    searchValue: string;
    searchInput: ElementRef<HTMLInputElement>;
    comboInput: ElementRef<HTMLInputElement>;
    onOpened: EventEmitter<IBaseEventArgs>;
    onOpening: EventEmitter<CancelableBrowserEventArgs>;
    onClosing: EventEmitter<CancelableBrowserEventArgs>;
    onClosed: EventEmitter<IBaseEventArgs>;
    focusSearchInput(opening?: boolean): void;
    triggerCheck(): void;
    addItemToCollection(): void;
    isAddButtonVisible(): boolean;
    handleInputChange(event?: string): void;
    isItemSelected(itemID: any): boolean;
    selectItems(itemIDs: any[], clearSelection?: boolean, event?: Event): void;
    deselectItems(itemIDs: any[], event?: Event): void;
}

import { ElementRef, EventEmitter, QueryList } from '@angular/core';
import { CancelableEventArgs } from '../core/utils';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IgxDropDownItemBase } from '../drop-down/drop-down.base';

export const IGX_COMBO_COMPONENT = 'IgxComboComponentToken';

/** @hidden @internal TODO: Evaluate */
export interface IgxComboBase {
    id: string;
    children: QueryList<IgxDropDownItemBase>;
    data: any[];
    valueKey: string;
    groupKey: string;
    isRemote: boolean;
    filteredData: any[];
    filteringExpressions: IFilteringExpression[];
    totalItemCount: number;
    itemsMaxHeight: number;
    itemHeight: number;
    searchValue: string;
    searchInput: ElementRef<HTMLInputElement>;
    comboInput: ElementRef<HTMLInputElement>;
    onOpened: EventEmitter<void>;
    onOpening: EventEmitter<CancelableEventArgs>;
    onClosing: EventEmitter<CancelableEventArgs>;
    onClosed: EventEmitter<void>;

    focusSearchInput(opening?: boolean): void;
    triggerCheck();
    setSelectedItem(itemID: any, select?: boolean);
    isItemSelected(item: any): boolean;
    addItemToCollection();
    isAddButtonVisible(): boolean;
    handleInputChange(event?);
}

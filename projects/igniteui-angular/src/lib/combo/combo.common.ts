import { ElementRef, EventEmitter, QueryList } from '@angular/core';
import { CancelableEventArgs } from '../core/utils';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IDropDownItem, IDropDownBase } from '../drop-down/drop-down-utils';

export const IGX_COMBO_COMPONENT = 'IgxComboComponentToken';

/** @hidden @internal TODO: Evaluate */
export interface IgxComboBase {
    id: string;
    dropdown?: IDropDownBase;
    children: QueryList<IDropDownItem>;
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
    addItemToCollection();
    isAddButtonVisible(): boolean;
    handleInputChange(event?);
}

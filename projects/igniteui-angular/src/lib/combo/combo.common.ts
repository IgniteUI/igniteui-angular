import { ElementRef, EventEmitter, QueryList } from '@angular/core';
import { CancelableEventArgs } from '../core/utils';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IgxComboDropDownComponent } from './combo-dropdown.component';
import { IgxComboItemComponent } from './combo-item.component';

export const IGX_COMBO_COMPONENT = 'IgxComboComponentToken';

/** @hidden @internal TODO: Evaluate */
export interface IgxComboBase {
    id: string;
    dropdown: IgxComboDropDownComponent;
    children: QueryList<IgxComboItemComponent>;
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
    addItemToCollection();
    isAddButtonVisible(): boolean;
    handleInputChange(event?);
}

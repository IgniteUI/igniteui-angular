import { ComboToggleState, IgxComboBase } from './combo.common';
import { Injectable } from '@angular/core';

/**
 * @hidden
 */
@Injectable()
export class IgxComboAPIService {
    public disableTransitions = false;
    protected combo!: IgxComboBase;

    public get valueKey() {
        return this.combo.valueKey !== null && this.combo.valueKey !== undefined ? this.combo.valueKey : null;
    }

    public get item_focusable(): boolean {
        return false;
    }
    public get isRemote(): boolean {
        return this.combo.isRemote;
    }

    public get comboID(): string {
        return this.combo.id;
    }

    public register(combo: IgxComboBase) {
        this.combo = combo;
    }

    public clear(): void {
        this.combo = null!;
    }

    public add_custom_item(): void {
        if (!this.combo) {
            return;
        }
        this.combo.addItemToCollection();
    }

    public set_selected_item(itemID: any, event?: Event): void {
        const selected = this.combo.isItemSelected(itemID);
        if (itemID === undefined) {
            return;
        }
        if (!selected) {
            this.combo.select([itemID], false, event);
        } else {
            this.combo.deselect([itemID], event);
        }
    }

    public is_item_selected(itemID: any): boolean {
        return this.combo.isItemSelected(itemID);
    }

    /**
     * Whether the record is the "Select all" option or a group header option.
     *
     * @param record The record of a row in the list.
     * @returns `true` for the "Select all" option and the group header options of `groupSelection`.
     * @example
     * ```typescript
     * const isToggle = this.comboAPI.is_toggle(item.value);
     * ```
     */
    public is_toggle(record: any): boolean {
        return !!this.combo?.isToggleRecord(record);
    }

    /**
     * Whether all, some or none of the items of a toggle option are selected.
     *
     * @param record The record of the "Select all" option or of a group header option.
     * @returns `'all'`, `'some'` or `'none'`.
     * @example
     * ```typescript
     * const indeterminate = this.comboAPI.toggle_state(item.value) === 'some';
     * ```
     */
    public toggle_state(record: any): ComboToggleState {
        return this.combo.toggleRecordState(record);
    }

    /**
     * Selects or deselects the row of a record: the items of a toggle option, or the item
     * with `itemID`.
     *
     * @param record The record of the row.
     * @param itemID The value key of the record, or the record itself without a `valueKey`.
     * @param event The user interaction that selects the row, if any.
     * @returns Nothing.
     * @example
     * ```typescript
     * this.comboAPI.select_record(item.value, item.itemID, event);
     * ```
     */
    public select_record(record: any, itemID: any, event?: Event): void {
        if (this.is_toggle(record)) {
            this.combo.toggleRecord(record, event);
        } else {
            this.set_selected_item(itemID, event);
        }
    }
}

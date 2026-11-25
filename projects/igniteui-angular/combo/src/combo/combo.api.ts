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

    /** Whether the record is the "Select all" option or a group header option. */
    public is_toggle(record: any): boolean {
        return !!this.combo?.isToggleRecord(record);
    }

    public toggle_state(record: any): ComboToggleState {
        return this.combo.toggleRecordState(record);
    }

    /**
     * Selects or deselects the row of a record: the items of a toggle option, or the item
     * with `itemID`.
     */
    public select_record(record: any, itemID: any, event?: Event): void {
        if (this.is_toggle(record)) {
            this.combo.toggleRecord(record, event);
        } else {
            this.set_selected_item(itemID, event);
        }
    }
}

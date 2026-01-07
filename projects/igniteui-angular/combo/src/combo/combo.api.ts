import { IgxComboBase } from './combo.common';
import { Injectable } from '@angular/core';

/**
 * @hidden
 */
@Injectable()
export class IgxComboAPIService {
    public disableTransitions = false;
    protected combo: IgxComboBase;

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
        this.combo = null;
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
}

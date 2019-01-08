import { IgxComboBase } from './combo.common';

/**
 * @hidden
 */
export class IgxComboAPIService {
    protected combo: IgxComboBase;

    public disableTransitions = false;

    public register(combo: IgxComboBase) {
        this.combo = combo;
    }


    public clear(): void {
        this.combo = null;
    }


    public get item_focusable(): boolean {
        return false;
    }
    public get isRemote(): boolean {
        return this.combo.isRemote;
    }

    public add_custom_item(): void {
        if (!this.combo) {
            return;
        }
        this.combo.addItemToCollection();
    }

    public get comboID(): string {
        return this.combo.id;
    }

    public set_selected_item(itemID: any, event?: Event): void {
        const selected = this.combo.isItemSelected(itemID);
        if (itemID === null || itemID === undefined) {
            return;
        }
        if (!selected) {
            this.combo.selectItems([itemID], false, event);
        } else {
            this.combo.deselectItems([itemID], event);
        }
    }

    public is_item_selected(itemID: any): boolean {
        return this.combo.isItemSelected(itemID);
    }
}

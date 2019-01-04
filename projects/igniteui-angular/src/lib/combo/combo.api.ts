import { IgxComboBase } from './combo.common';

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
}

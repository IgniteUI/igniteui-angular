import { EventEmitter } from '@angular/core';
import { IgxDropDownAPIService } from '../drop-down/drop-down.api';
import { IgxComboBase } from './combo.common';

export class IgxComboAPIService extends IgxDropDownAPIService {
    constructor(protected combo: IgxComboBase) {
        super(combo.dropdown);
    }
    public onAddItem = new EventEmitter<any>();
    public get item_focusable(): boolean {
        return false;
    }
    public get isRemote(): boolean {
        return this.combo.isRemote;
    }

    public add_custom_item(item: any): void {
        this.onAddItem.emit({
            item
        });
    }
}

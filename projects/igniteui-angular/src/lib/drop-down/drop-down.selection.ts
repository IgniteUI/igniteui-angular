import { IDropDownItem } from './drop-down-utils';
import { EventEmitter } from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';

export interface IDropDownServiceArgs {
    item: IDropDownItem;
    itemID: any;
}
export class IgxDropDownSelectionService extends IgxSelectionAPIService {
    set_selected_item(componentID: string, itemID: any) {
        const selected = this.is_item_selected(componentID, itemID);
        if (!selected) {
            this.select_item(componentID, itemID);
        } else {
            this.deselect_item(componentID, itemID);
        }
    }
}

import {
    Component,
    Input,
    DoCheck
} from '@angular/core';
import { IgxDropDownItemBase } from './drop-down-item.base';

@Component({
    selector: 'igx-drop-down-item',
    templateUrl: 'drop-down-item.component.html'
})
export class IgxDropDownItemComponent extends IgxDropDownItemBase implements DoCheck {
    ngDoCheck(): void {
        if (this.isSelected) {
            const dropDownSelectedItem = this.selection.first_item();
            if (!dropDownSelectedItem || this !== dropDownSelectedItem) {
                this.selection.select_item(this.itemID);
            }
        }
    }
}

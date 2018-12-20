import {
    Component,
    Input,
    DoCheck,
    HostListener
} from '@angular/core';
import { IgxDropDownItemBase } from './drop-down-item.base';
import { IDropDownServiceArgs } from './drop-down.selection';

@Component({
    selector: 'igx-drop-down-item',
    templateUrl: 'drop-down-item.component.html'
})
export class IgxDropDownItemComponent extends IgxDropDownItemBase implements DoCheck {
    @HostListener('click')
    clicked() {
        if (this.disabled || this.isHeader) {
            const focusedItem = this.dropDown.items.find((item) => item.isFocused);
            if (this.dropDown.allowItemsFocus && focusedItem) {
                focusedItem.element.nativeElement.focus({ preventScroll: true });
            }
            return;
        }
        if (this.selection) {
            this.selection.set_selected_item(this.dropDown.id, this.itemID);
        }
    }
}

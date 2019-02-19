import { IgxDropDownItemComponent } from './../drop-down/drop-down-item.component';
import { Component, HostBinding, Input, DoCheck } from '@angular/core';

@Component({
    selector: 'igx-select-item',
    template: '<ng-content></ng-content>'
})
export class IgxSelectItemComponent extends IgxDropDownItemComponent implements DoCheck {

    /** @hidden @internal */
    public get itemText() {
        return this.elementRef.nativeElement.innerText.trim();
    }

    /**
     * Sets/Gets if the item is the currently selected one in the select
     *
     * ```typescript
     *  let mySelectedItem = this.select.selectedItem;
     *  let isMyItemSelected = mySelectedItem.selected; // true
     * ```
     */
    public get selected() {
        return !this.isHeader && !this.disabled && this.selection.is_item_selected(this.dropDown.id, this);
    }

    public set selected(value: any) {
        if (value && !this.isHeader && !this.disabled) {
            this.dropDown.selectItem(this);
        }
    }

    /** @hidden @internal */
    public isHeader: boolean;

    ngDoCheck(): void {
    }
}

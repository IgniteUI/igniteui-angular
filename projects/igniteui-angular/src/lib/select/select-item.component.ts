import { IgxDropDownItemComponent } from './../drop-down/drop-down-item.component';
import { Component, HostBinding, Input, DoCheck } from '@angular/core';

let NEXT_ID = 0;

@Component({
    selector: 'igx-select-item',
    templateUrl: 'select-item.component.html'
})
export class IgxSelectItemComponent extends IgxDropDownItemComponent implements DoCheck {

    /**
     * @hidden
     */
    @HostBinding('attr.aria-disabled')
    public get ariaDisabled() {
        return this.disabled;
    }

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public get ariaRole() {
        return 'option';
    }

    /**
     * Sets/gets the `id` of the item.
     * ```html
     * <igx-select-item [id] = 'select-item-0'></igx-select-item>
     * ```
     * ```typescript
     * let itemId =  this.item.id;
     * ```
     * @memberof IgxSelectItemComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-drop-down-item-${NEXT_ID++}`;

    /**
     * @hidden
     */
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
    @Input()
    public get selected() {
        return !this.isHeader && !this.disabled && this.selection.is_item_selected(this.dropDown.id, this);
    }

    public set selected(value: any) {
        if (value && !this.isHeader && !this.disabled) {
            this.dropDown.selectItem(this);
        }
    }

    ngDoCheck(): void {
    }
}

import {
    Component,
    ElementRef,
    Input,
    DoCheck
} from '@angular/core';
import { IgxDropDownBase, IgxDropDownItemBase } from './drop-down.base';

@Component({
    selector: 'igx-drop-down-item',
    templateUrl: 'drop-down-item.component.html'
})
export class IgxDropDownItemComponent extends IgxDropDownItemBase implements DoCheck {
    /**
     * @hidden
     */
    protected _isSelected = false;

    constructor(
        public dropDown: IgxDropDownBase,
        protected elementRef: ElementRef
    ) {
        super(dropDown, elementRef);
    }

    /**
     * Sets/Gets if the item is the currently selected one in the dropdown
     *
     * ```typescript
     *  let mySelectedItem = this.dropdown.selectedItem;
     *  let isMyItemSelected = mySelectedItem.isSelected; // true
     * ```
     */
    get isSelected() {
        return this._isSelected;
    }
    @Input()
    set isSelected(value: boolean) {
        if (this.isHeader) {
            return;
        }

        this._isSelected = value;
    }

    ngDoCheck(): void {
        if (this.isSelected) {
            const dropDownSelectedItem = this.dropDown.selectedItem;
            if (!dropDownSelectedItem || this !== dropDownSelectedItem) {
                this.dropDown.selectItem(this);
            }
        }
    }
}

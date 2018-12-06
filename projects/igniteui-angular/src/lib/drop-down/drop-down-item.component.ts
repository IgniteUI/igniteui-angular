import {
    Component,
    ElementRef,
    Input,
    DoCheck,
    Inject
} from '@angular/core';
import { IgxDropDownItemBase } from './drop-down-item.base';
import { IgxDropDownComponent } from './drop-down.component';
import { IGX_DROPDOWN_BASE, IDropDownBase } from './drop-down-utils';
import { IgxSelectionAPIService } from '../core/selection';

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
        @Inject(IGX_DROPDOWN_BASE) public dropDown: IDropDownBase,
        protected elementRef: ElementRef,
        protected selection: IgxSelectionAPIService
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

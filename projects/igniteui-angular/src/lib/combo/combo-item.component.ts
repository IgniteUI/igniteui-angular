import {
    Component,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input
} from '@angular/core';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxDropDownItemBase } from '../drop-down/drop-down-item.component';
import { IgxComboDropDownComponent } from './combo.component';

@Component({
    selector: 'igx-combo-item',
    templateUrl: 'combo-item.component.html'
})
export class IgxComboItemComponent extends IgxDropDownItemBase {
    /**
     * Gets if the item is the currently selected one in the dropdown
     */

    @Input()
    public itemData;

    public get itemID() {
        return this.itemData;
    }

    constructor(
        @Inject(forwardRef(() => IgxComboDropDownComponent)) public parentElement: IgxComboDropDownComponent,
        protected elementRef: ElementRef,
        protected selectionAPI: IgxSelectionAPIService
    ) {
        super(parentElement, elementRef);
    }

    get isSelected() {
        return this.parentElement.selectedItem.indexOf(this.itemID) > -1;
    }

    @HostListener('click', ['$event'])
    clicked(event) {
        if (this.isDisabled || this.isHeader) {
            const focusedItem = this.parentElement.focusedItem;
            focusedItem.element.nativeElement.focus({ preventScroll: true });
            return;
        }
        // this.parentElement.parentElement.searchInput.nativeElement.focus();
        this.parentElement.selectItem(this);
    }
}

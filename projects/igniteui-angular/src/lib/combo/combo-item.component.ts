import {
    Component,
    ElementRef,
    forwardRef,
    HostListener,
    HostBinding,
    Inject,
    Input
} from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxDropDownBase, IgxDropDownItemBase } from '../drop-down/drop-down.base';
import { IGX_COMBO_COMPONENT, IgxComboBase } from './combo.common';

/** @hidden */
@Component({
    selector: 'igx-combo-item',
    templateUrl: 'combo-item.component.html'
})
export class IgxComboItemComponent extends IgxDropDownItemBase {

    /**
     * Gets the height of a list item
     */
    @HostBinding('style.height.px')
    get itemHeight() {
        return this.combo.itemHeight;
    }

    /**
     * @hidden
     */
    public get itemID() {
        return this.combo.isRemote ? JSON.stringify(this.value) : this.value;
    }

    constructor(
        @Inject(IGX_COMBO_COMPONENT) private combo: IgxComboBase,
        public dropDown: IgxDropDownBase,
        protected elementRef: ElementRef,
        protected selection: IgxSelectionAPIService
    ) {
        super(dropDown, elementRef);
    }

    /**
     * @hidden
     */
    get isSelected() {
        return this.combo.isItemSelected(this.itemID);
    }

    /**
     * @hidden
     */
    @HostListener('click', ['$event'])
    clicked(event) {
        this.dropDown.disableTransitions = false;
        if (this.disabled || this.isHeader) {
            const focusedItem = this.dropDown.focusedItem;
            if (focusedItem) {
                focusedItem.element.nativeElement.focus({ preventScroll: true });
            }
            return;
        }
        this.dropDown.selectItem(this, event);
    }
}

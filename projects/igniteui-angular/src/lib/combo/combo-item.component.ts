import {
    Component,
    ElementRef,
    HostBinding,
    Inject,
    Input,
    DoCheck,
    Host,
    HostListener
} from '@angular/core';
import { IgxDropDownItemComponent } from '../drop-down/drop-down-item.component';
import { IGX_DROPDOWN_BASE, IDropDownBase } from '../drop-down/drop-down.common';
import { IgxComboAPIService } from './combo.api';
import { IgxSelectionAPIService } from '../core/selection';

/** @hidden */
@Component({
    selector: 'igx-combo-item',
    templateUrl: 'combo-item.component.html'
})
export class IgxComboItemComponent extends IgxDropDownItemComponent implements DoCheck {

    /**
     * Gets the height of a list item
     * @hidden
     */
    @Input()
    @HostBinding('style.height.px')
    public itemHeight = '';

    /**
     * @hidden
     */
    public get itemID() {
        return this.comboAPI.isRemote ? JSON.stringify(this.value) : this.value;
    }

    /**
     * @hidden
     */
    public get comboID() {
        return this.comboAPI.comboID;
    }

    /**
     * @hidden
     * @internal
     */
    public get disableTransitions() {
        return this.comboAPI.disableTransitions;
    }

    constructor(
        protected comboAPI: IgxComboAPIService,
        @Inject(IGX_DROPDOWN_BASE) protected dropDown: IDropDownBase,
        protected elementRef: ElementRef,
        @Inject(IgxSelectionAPIService) protected selection: IgxSelectionAPIService
    ) {
        super(dropDown, elementRef, selection);
    }

    /**
     * @hidden
     */
    get selected(): boolean {
        return this.comboAPI.is_item_selected(this.itemID);
    }

    set selected(value: boolean) {
        if (this.isHeader) {
            return;
        }
        this._isSelected = value;
    }

    @HostListener('click', ['$event'])
    clicked(event) {
        this.comboAPI.disableTransitions = false;
        if (this.disabled || this.isHeader) {
            const focusedItem = this.dropDown.items.find((item) => item.focused);
            if (this.dropDown.allowItemsFocus && focusedItem) {
                focusedItem.element.nativeElement.focus({ preventScroll: true });
            }
            return;
        }
        this.dropDown.navigateItem(this.itemIndex);
        this.comboAPI.set_selected_item(this.itemID, event);
    }

    ngDoCheck() {
    }
}

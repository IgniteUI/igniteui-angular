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
import { IDropDownBase, IGX_DROPDOWN_BASE } from '../drop-down/drop-down-utils';
import { IgxDropDownSelectionService } from '../drop-down/drop-down.selection';
import { IgxComboAPIService } from './combo.api';

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
        return this.comboAPI.isRemote(this.comboID) ? JSON.stringify(this.value) : this.value;
    }

    /**
     * @hidden
     */
    public get comboID() {
        return this.dropDown.comboID;
    }

    /**
     * @hidden
     * @internal
     */
    public get disableTransitions() {
        return this.dropDown.disableTransitions;
    }

    constructor(
        protected comboAPI: IgxComboAPIService,
        @Inject(IGX_DROPDOWN_BASE) protected dropDown: IDropDownBase,
        protected elementRef: ElementRef,
        @Inject(IgxDropDownSelectionService) protected selection: IgxDropDownSelectionService
    ) {
        super(dropDown, elementRef, selection);
    }

    /**
     * @hidden
     */
    get isSelected(): boolean {
        return this.selection.is_item_selected(this.comboID, this.itemID);
    }

    set isSelected(value: boolean) {
        if (this.isHeader) {
            return;
        }
        this._isSelected = value;
    }

    @HostListener('click')
    clicked() {
        this.dropDown.navigateItem(this.index);
        this.selection.set_selected_item(this.comboID, this.itemID);
    }

    ngDoCheck() {
    }
}

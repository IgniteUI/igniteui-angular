import {
    Component,
    ElementRef,
    HostBinding,
    Inject,
    Input,
    DoCheck,
    Host
} from '@angular/core';
import { IGX_COMBO_COMPONENT, IgxComboBase } from './combo.common';
import { IgxDropDownItemComponent } from '../drop-down/drop-down-item.component';
import { IDropDownBase, IGX_DROPDOWN_BASE } from '../drop-down/drop-down-utils';
import { IgxDropDownSelectionService } from '../core/drop-down.selection';

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
        return this.combo.isRemote ? JSON.stringify(this.value) : this.value;
    }

    constructor(
        @Inject(IGX_COMBO_COMPONENT) private combo: IgxComboBase,
        @Inject(IGX_DROPDOWN_BASE) public dropDown: IDropDownBase,
        protected elementRef: ElementRef,
        protected selection: IgxDropDownSelectionService
    ) {
        super(dropDown, elementRef, selection);
    }

    /**
     * @hidden
     */
    get isSelected(): boolean {
        return this.combo.isItemSelected(this.itemID);
    }

    set isSelected(value: boolean) {
        if (this.isHeader) {
            return;
        }
        this._isSelected = value;
    }

    ngDoCheck(): void {
    }
}

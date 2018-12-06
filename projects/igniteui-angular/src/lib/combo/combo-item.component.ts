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
import { IGX_COMBO_COMPONENT, IgxComboBase } from './combo.common';
import { IgxDropDownItemComponent } from '../drop-down/drop-down-item.component';
import { IDropDownBase, IGX_DROPDOWN_BASE } from '../drop-down/drop-down-utils';

/** @hidden */
@Component({
    selector: 'igx-combo-item',
    templateUrl: 'combo-item.component.html'
})
export class IgxComboItemComponent extends IgxDropDownItemComponent {

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
        protected selection: IgxSelectionAPIService
    ) {
        super(dropDown, elementRef, selection);
    }

    /**
     * @hidden
     */
    get isSelected(): boolean {
        return this._isSelected;
    }

    set isSelected(value: boolean) {
        this._isSelected = value;
    }
}

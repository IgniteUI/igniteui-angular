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
import { IGX_DROPDOWN_BASE, IDropDownBase, Navigate } from '../drop-down/drop-down.common';
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
        const valueKey = this.comboAPI.valueKey;
        return this.comboAPI.valueKey !== null ? this.value[valueKey] : this.value;
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
        super(dropDown, elementRef, null, selection);
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
        this._selected = value;
    }

    /**
     * @hidden
     */
    isVisible(direction: Navigate): boolean {
        const rect = this.element.nativeElement.getBoundingClientRect();
        const parentDiv = this.element.nativeElement.parentElement.parentElement.getBoundingClientRect();
        if (direction === Navigate.Down) {
            return rect.y + rect.height <= parentDiv.y + parentDiv.height;
        }
        return rect.y >= parentDiv.y;
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
        this.dropDown.navigateItem(this.index);
        this.comboAPI.set_selected_item(this.itemID, event);
    }

    /**
     * @hidden
     * @internal
     * The event that is prevented is the click on the checkbox label element.
     * That is the only visible element that a user can interact with.
     * The click propagates to the host and the preventDefault is to stop it from
     * switching focus to the input it's base on.
     * The toggle happens in an internal handler in the drop-down on the next task queue cycle.
     */
    disableCheck(event: MouseEvent) {
        event.preventDefault();
    }

    ngDoCheck() {
    }
}

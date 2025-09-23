import { Component, HostBinding, Input, booleanAttribute, inject } from '@angular/core';
import { IgxDropDownItemComponent } from '../drop-down/drop-down-item.component';
import { Navigate } from '../drop-down/drop-down.common';
import { IgxComboAPIService } from './combo.api';
import { rem } from '../core/utils';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';

/** @hidden */
@Component({
    selector: 'igx-combo-item',
    templateUrl: 'combo-item.component.html',
    imports: [IgxCheckboxComponent]
})
export class IgxComboItemComponent extends IgxDropDownItemComponent {
    protected comboAPI = inject(IgxComboAPIService);


    /**
     * Gets the height of a list item
     *
     * @hidden
     */
    @Input()
    public itemHeight: string | number = '';

    /** @hidden @internal */
    @HostBinding('style.height.rem')
    public get _itemHeightToRem() {
        if (this.itemHeight) {
            return rem(this.itemHeight);
        }
    }

    @HostBinding('attr.aria-label')
    @Input()
    public override get ariaLabel(): string {
        const valueKey = this.comboAPI.valueKey;
        return (valueKey !== null && this.value != null) ? this.value[valueKey] : this.value;
    }

    /** @hidden @internal */
    @Input({ transform: booleanAttribute })
    public singleMode: boolean;

    /**
     * @hidden
     */
    public override get itemID() {
        const valueKey = this.comboAPI.valueKey;
        return valueKey !== null ? this.value[valueKey] : this.value;
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

    /**
     * @hidden
     */
    public override get selected(): boolean {
        return this.comboAPI.is_item_selected(this.itemID);
    }

    public override set selected(value: boolean) {
        if (this.isHeader) {
            return;
        }
        this._selected = value;
    }

    /**
     * @hidden
     */
    public isVisible(direction: Navigate): boolean {
        const rect = this.element.nativeElement.getBoundingClientRect();
        const parentDiv = this.element.nativeElement.parentElement.parentElement.getBoundingClientRect();
        if (direction === Navigate.Down) {
            return rect.y + rect.height <= parentDiv.y + parentDiv.height;
        }
        return rect.y >= parentDiv.y;
    }

    public override clicked(event): void {
        this.comboAPI.disableTransitions = false;
        if (!this.isSelectable) {
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
    public disableCheck(event: MouseEvent) {
        event.preventDefault();
    }
}

import {
  Component,
  HostBinding,
  Input,
  booleanAttribute,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { IgxComboAPIService } from './combo.api';
import { COMBO_SELECT_ALL_RECORD } from './combo.common';
import { rem } from 'igniteui-angular/core';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { IgxDropDownItemComponent } from 'igniteui-angular/drop-down';

/** @hidden */
@Component({
    selector: 'igx-combo-item',
    templateUrl: 'combo-item.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
        if (this.value === COMBO_SELECT_ALL_RECORD) {
            // The option is named by its text.
            return null!;
        }
        const valueKey = this.comboAPI.valueKey;
        return (valueKey !== null && this.value != null) ? this.value[valueKey] : this.value;
    }

    /**
     * @hidden @internal
     * The checked state of a toggle option, as the "Select all" option and a group header
     * option check all, some or none of their items.
     */
    @HostBinding('attr.aria-checked')
    protected get ariaChecked(): 'true' | 'false' | 'mixed' | null {
        if (!this._isToggle) {
            return null;
        }
        return this._selected ? 'true' : this._indeterminate ? 'mixed' : 'false';
    }

    /** @hidden @internal */
    @Input({ transform: booleanAttribute })
    public singleMode!: boolean;

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
    public override ngDoCheck(): void {
        // Sync state from services once per CD cycle so template bindings return stable field values
        this._isToggle = !this.isHeader && this.comboAPI.is_toggle(this.value);
        if (this._isToggle) {
            const state = this.comboAPI.toggle_state(this.value);
            this._selected = state === 'all';
            this._indeterminate = state === 'some';
        } else {
            this._selected = !this.isHeader && this.value != null && this.comboAPI.is_item_selected(this.itemID);
            this._indeterminate = false;
        }
        this._disableTransitions = this.comboAPI.disableTransitions;
    }

    /**
     * @hidden @internal
     * Whether only some of the items of a toggle option are selected.
     */
    protected get indeterminate(): boolean {
        return this._indeterminate;
    }

    /**
     * @hidden
     */
    public override get selected(): boolean {
        return this._selected;
    }

    public override set selected(value: boolean) {
        if (this.isHeader) {
            return;
        }
        this._selected = value;
    }

    /**
     * @hidden
     * @internal
     */
    public get disableTransitions() {
        return this._disableTransitions;
    }

    private _disableTransitions = false;
    private _isToggle = false;
    private _indeterminate = false;

    public override clicked(event: MouseEvent): void {
        this.comboAPI.disableTransitions = false;
        if (!this.isSelectable) {
            return;
        }
        this.dropDown.navigateItem(this.index);
        this.comboAPI.select_record(this.value, this.itemID, event);
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

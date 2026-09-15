import {
  Component,
  Input,
  booleanAttribute,
  inject,
  linkedSignal,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { IgxComboAPIService } from './combo.api';
import { rem } from 'igniteui-angular/core';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { IgxDropDownItemComponent, Navigate } from 'igniteui-angular/drop-down';

/** @hidden */
@Component({
    selector: 'igx-combo-item',
    templateUrl: 'combo-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.height.rem]': '_itemHeightToRem',
        '[attr.aria-label]': 'ariaLabel'
    },
    imports: [IgxCheckboxComponent]
})
export class IgxComboItemComponent extends IgxDropDownItemComponent {
    protected comboAPI = inject(IgxComboAPIService);
    private readonly _itemHeight = signal<string | number>('');
    private readonly _singleMode = signal<boolean>(undefined!);
    private readonly _selectionState = linkedSignal(() =>
        this.value != null && this.comboAPI.is_item_selected(this.itemID));

    /**
     * Gets the height of a list item
     *
     * @hidden
     */
    @Input()
    public get itemHeight(): string | number {
        return this._itemHeight();
    }

    public set itemHeight(value: string | number) {
        this._itemHeight.set(value);
    }

    /** @hidden @internal */
    public get _itemHeightToRem() {
        if (this.itemHeight) {
            return rem(this.itemHeight);
        }
    }

    @Input()
    public override get ariaLabel(): string {
        const valueKey = this.comboAPI.valueKey;
        return (valueKey !== null && this.value != null) ? this.value[valueKey] : this.value;
    }

    /** @hidden @internal */
    @Input({ transform: booleanAttribute })
    public get singleMode(): boolean {
        return this._singleMode();
    }

    public set singleMode(value: boolean) {
        this._singleMode.set(value);
    }

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
        // Re-resolved on each check, since keys can change in place; skips the base reconciliation.
        this._selectionState.set(!this.isHeader && this.value != null && this.comboAPI.is_item_selected(this.itemID));
    }

    /**
     * @hidden
     */
    public override get selected(): boolean {
        return !this.isHeader && this._selectionState();
    }

    public override set selected(value: boolean) {
        if (this.isHeader) {
            return;
        }
        this._selectionState.set(value);
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
    public isVisible(direction: Navigate): boolean {
        const rect = this.element.nativeElement.getBoundingClientRect();
        const parentDiv = this.element.nativeElement.parentElement.parentElement.getBoundingClientRect();
        if (direction === Navigate.Down) {
            return rect.y + rect.height <= parentDiv.y + parentDiv.height;
        }
        return rect.y >= parentDiv.y;
    }

    public override clicked(event: MouseEvent): void {
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

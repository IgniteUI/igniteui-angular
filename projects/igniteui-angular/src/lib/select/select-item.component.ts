import { IgxDropDownItemComponent } from './../drop-down/drop-down-item.component';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'igx-select-item',
	templateUrl: 'select-item.component.html',
    standalone: true
})
export class IgxSelectItemComponent extends IgxDropDownItemComponent {
    /** @hidden @internal */
    public override isHeader: boolean;

    private _text: any;

    /**
     * Gets/Sets the item's text to be displayed in the select component's input when the item is selected.
     *
     * ```typescript
     *  //get
     *  let mySelectedItem = this.dropDown.selectedItem;
     *  let selectedItemText = mySelectedItem.text;
     * ```
     *
     * ```html
     * // set
     * <igx-select-item [text]="'London'"></igx-select-item>
     * ```
     */
    @Input()
    public get text(): string {
        return this._text;
    }

    public set text(text: string) {
        this._text = text;
    }

    /** @hidden @internal */
    public get itemText() {
        if (this._text !== undefined) {
            return this._text;
        }
        // If text @Input is undefined, try extract a meaningful item text out of the item template
        return this.elementRef.nativeElement.textContent.trim();
    }

    /**
     * Sets/Gets if the item is the currently selected one in the select
     *
     * ```typescript
     *  let mySelectedItem = this.select.selectedItem;
     *  let isMyItemSelected = mySelectedItem.selected; // true
     * ```
     */
    public override get selected() {
        return !this.isHeader && !this.disabled && this.selection.is_item_selected(this.dropDown.id, this);
    }

    public override set selected(value: any) {
        if (value && !this.isHeader && !this.disabled) {
            this.dropDown.selectItem(this);
        }
    }
}

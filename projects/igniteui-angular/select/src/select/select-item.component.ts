import { Component, Input, ChangeDetectionStrategy, signal } from '@angular/core';
import { IgxDropDownItemComponent } from 'igniteui-angular/drop-down';

@Component({
    selector: 'igx-select-item',
	templateUrl: 'select-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class IgxSelectItemComponent extends IgxDropDownItemComponent {
    /** @hidden @internal */
    public override get isHeader(): boolean {
        return super.isHeader;
    }
    public override set isHeader(value: boolean) {
        super.isHeader = value;
    }

    private readonly _text = signal<any>(undefined);

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
        return this._text();
    }

    public set text(text: string) {
        this._text.set(text);
    }

    /** @hidden @internal */
    public get itemText() {
        const text = this._text();
        if (text !== undefined) {
            return text;
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
        return !this.isHeader && !this.disabled && this.dropDown.selectedItem === this;
    }

    public override set selected(value: any) {
        if (value && !this.isHeader && !this.disabled) {
            this.dropDown.selectItem(this);
        }
    }
}

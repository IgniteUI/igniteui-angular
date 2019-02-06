import { IgxDropDownItemComponent } from './../drop-down/drop-down-item.component';
import { Component, ElementRef, Inject, HostBinding, Input, DoCheck, Optional } from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IGX_DROPDOWN_BASE, IDropDownBase } from '../drop-down/drop-down.common';
import { IgxDropDownGroupComponent, IgxDropDownItemBase } from '../drop-down';

let NEXT_ID = 0;

@Component({
    selector: 'igx-select-item',
    templateUrl: 'select-item.component.html',
    providers: [{
        provide: IgxDropDownItemComponent, useExisting: IgxSelectItemComponent
    }]
})
export class IgxSelectItemComponent extends IgxDropDownItemComponent implements DoCheck {

    // constructor(
    //     @Inject(IGX_DROPDOWN_BASE) protected dropDown: IDropDownBase,
    //     protected elementRef: ElementRef,
    //     protected selection: IgxSelectionAPIService,
    //     @Optional() protected group: IgxDropDownGroupComponent
    // ) {
    //     super(dropDown, elementRef, group);
    // }

    @HostBinding('attr.aria-disabled')
    public get ariaDisabled() {
        return this.disabled;
    }

    @HostBinding('attr.role')
    public get ariaRole() {
        return 'option';
    }

    /**
     * Sets/gets the `id` of the item.
     * ```html
     * <igx-select-item [id] = 'select-item-0'></igx-select-item>
     * ```
     * ```typescript
     * let itemId =  this.item.id;
     * ```
     * @memberof IgxSelectItemComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-drop-down-item-${NEXT_ID++}`;

    public get itemText() {
        return this.elementRef.nativeElement.innerText.trim();
    }

    public get selected() {
        return !this.isHeader && !this.disabled && this.selection.is_item_selected(this.dropDown.id, this.value);
    }

    public set selected(value: any) {
        if (value && !this.isHeader && !this.disabled) {
            this.dropDown.selectItem(this);
        }
    }

    ngDoCheck(): void {
    }
}

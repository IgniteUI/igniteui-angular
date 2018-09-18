
import { Directive } from '@angular/core';
import { ColumnChooserItemBase } from './column-chooser-item-base';

@Directive({
    selector: '[igxColumnHidingItem]'
})
export class IgxColumnHidingItemDirective extends ColumnChooserItemBase {

    constructor() {
        super('hidden');
    }

    get disabled() {
        return this.column.disableHiding;
    }
}

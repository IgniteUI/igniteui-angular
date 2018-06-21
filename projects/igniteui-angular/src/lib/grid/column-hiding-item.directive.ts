
import { Directive } from '@angular/core';
import { ColumnItemBase } from './column-chooser-item-base';

export interface IColumnVisibilityChangedEventArgs {
    column: any;
    newValue: boolean;
}

@Directive({
    selector: '[igxColumnHidingItem]'
})
export class IgxColumnHidingItemDirective extends ColumnItemBase {

    constructor() {
        super('hidden');
    }

    get disabled() {
        return this.column.disableHiding;
    }
}

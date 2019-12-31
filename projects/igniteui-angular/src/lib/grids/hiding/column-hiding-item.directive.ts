
import { Directive } from '@angular/core';
import { ColumnChooserItemBase } from '../column-chooser-item-base';
import { IBaseEventArgs } from '../../core/utils';

export interface IColumnVisibilityChangedEventArgs extends IBaseEventArgs {
    column: any;
    newValue: boolean;
}

/** @hidden */
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

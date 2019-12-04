
import { Directive } from '@angular/core';
import { ColumnChooserItemBaseDirective } from '../column-chooser-item-base';
import { IBaseEventArgs } from '../../core/utils';

export interface IColumnVisibilityChangedEventArgs extends IBaseEventArgs {
    column: any;
    newValue: boolean;
}

/** @hidden */
@Directive({
    selector: '[igxColumnHidingItem]'
})
export class IgxColumnHidingItemDirective extends ColumnChooserItemBaseDirective {

    constructor() {
        super('hidden');
    }

    get disabled() {
        return this.column.disableHiding;
    }
}

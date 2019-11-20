
import { Component, ChangeDetectorRef } from '@angular/core';
import { ColumnChooserBaseDirective } from '../column-chooser-base';
import { IgxColumnPinningItemDirective } from './pinning.directive';



@Component({
    preserveWhitespaces: false,
    selector: 'igx-column-pinning',
    templateUrl: './column-pinning.component.html'
})
export class IgxColumnPinningComponent extends ColumnChooserBaseDirective {

    constructor(public cdr: ChangeDetectorRef) {
        super(cdr);
    }

    /**
     * @hidden
     */
    createColumnItem(container: any, column: any) {
        if (column.level !== 0 || column.disablePinning) {
            return null;
        }
        const item = new IgxColumnPinningItemDirective();
        item.container = container;
        item.column = column;
        return item;
    }

    /**
     * @hidden
     */
    public checkboxValueChange(event, columnItem: IgxColumnPinningItemDirective) {
        if (event.checked && !columnItem.pinnable) {
            event.checkbox.checked = false;
            return false;
        }
        columnItem.value = !columnItem.value;
    }
}


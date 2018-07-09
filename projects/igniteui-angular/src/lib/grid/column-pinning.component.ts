
import { CommonModule } from '@angular/common';
import { Directive, Component, EventEmitter, Output, NgModule, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { ColumnChooserBase } from './column-chooser-base';
import { ColumnChooserItemBase } from './column-chooser-item-base';
import { IgxInputGroupModule } from '../input-group/input-group.component';

@Directive({
    selector: '[igxColumnPinningItem]'
})
export class IgxColumnPinningItemDirective extends ColumnChooserItemBase {

    constructor() {
        super('pinned');
    }

    get pinnable() {
        if (this.column.grid.getUnpinnedWidth(true) - this.column.width < this.column.grid.unpinnedAreaMinWidth) {
            return false;
        }
        return true;
    }
}

@Component({
    preserveWhitespaces: false,
    selector: 'igx-column-pinning',
    templateUrl: './column-pinning.component.html'
})
export class IgxColumnPinningComponent extends ColumnChooserBase {

    constructor(public cdr: ChangeDetectorRef) {
        super(cdr);
    }

    createColumnItem(container: any, column: any) {
        if (column.level !== 0) {
            return null;
        }
        const item = new IgxColumnPinningItemDirective();
        item.container = container;
        item.column = column;
        return item;
    }

    public checkboxValueChange(event, columnItem: IgxColumnPinningItemDirective) {
        if (event.checked && !columnItem.pinnable) {
            event.checkbox.checked = false;
            return false;
        }
        columnItem.value = !columnItem.value;
    }
}

@NgModule({
    declarations: [IgxColumnPinningComponent, IgxColumnPinningItemDirective],
    exports: [IgxColumnPinningComponent],
    imports: [
        IgxCheckboxModule,
        IgxInputGroupModule,
        CommonModule,
        FormsModule
    ]
})
export class IgxColumnPinningModule {
}

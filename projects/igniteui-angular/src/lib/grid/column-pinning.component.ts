
import { CommonModule } from '@angular/common';
import { Directive, Component, EventEmitter, Output, NgModule, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxColumnChooser } from './column-chooser-base';
import { ColumnItemBase } from './column-chooser-item-base';
import { IPinColumnEventArgs } from './grid.component';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxColumnComponent } from '../../public_api';

export interface IColumnPinnedChangedEventArgs {
    column: any;
    newValue: boolean;
}

@Directive({
    selector: '[igxColumnPinningItem]'
})
export class IgxColumnPinningItemDirective extends ColumnItemBase {

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
export class IgxColumnPinningComponent extends IgxColumnChooser {

    constructor(public cdr: ChangeDetectorRef) {
        super(cdr);
    }
    @Output()
    public onColumnPinning = new EventEmitter<IPinColumnEventArgs>();

    createColumnItem(container: any, column: any) {
        const item = new IgxColumnPinningItemDirective();
        item.container = container;
        item.column = column;
        item.valueChanged.subscribe((args) => {
            this.columnPinning({ column: item.column, newValue: item.value });
        });
        return item;
    }

    public checkboxValueChange(event, columnItem: IgxColumnPinningItemDirective) {
        if (event.checked && !columnItem.pinnable) {
            event.checkbox.checked = false;
            return false;
        }
        columnItem.value = !columnItem.value;
    }
    public columnPinning(args: IColumnPinnedChangedEventArgs) {
        console.log(args.column.grid.pinnedColumns.length);
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

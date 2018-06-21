import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    NgModule,
    Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IColumnVisibilityChangedEventArgs, IgxColumnHidingItemDirective } from './column-hiding-item.directive';
import { IgxInputGroupModule } from '../input-group/input-group.component';
import { ColumnChooserBase } from './column-chooser-base';

@Component({
    preserveWhitespaces: false,
    selector: 'igx-column-hiding',
    templateUrl: './column-hiding.component.html'
})
export class IgxColumnHidingComponent extends ColumnChooserBase {

    @Input()
    get disableHideAll(): boolean {
        if (!this.columnItems || this.columnItems.length < 1 ||
            this.hiddenColumnsCount === this.columns.length) {
            return true;
        } else if (this.hidableColumns.length < 1 ||
            this.hidableColumns.length === this.hidableColumns.filter((col) => col.value).length) {
            return true;
        } else {
            return false;
        }
    }

    @Input()
    get disableShowAll(): boolean {
        if (!this.columnItems || this.columnItems.length < 1 ||
            this.hiddenColumnsCount < 1 || this.hidableColumns.length < 1) {
            return true;
        } else if (this.hidableColumns.length === this.hidableColumns.filter((col) => !col.value).length) {
            return true;
        } else {
            return false;
        }
    }

    @Input()
    public showAllText = 'Show All';

    @Input()
    public hideAllText = 'Hide All';

    @Output()
    public onColumnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    public get hiddenColumnsCount() {
        return (this.columns) ? this.columns.filter((col) => col.hidden).length : 0;
    }

    constructor(public cdr: ChangeDetectorRef) {
        super(cdr);
    }

    private get hidableColumns() {
        return this.columnItems.filter((col) => !col.disabled);
    }

    protected createColumnItem(container: any, column: any) {
        const item = new IgxColumnHidingItemDirective();
        item.container = container;
        item.column = column;
        item.valueChanged.subscribe((args) => {
            this.onVisibilityChanged({ column: item.column, newValue: args.newValue });
        });
        return item;
    }

    public showAllColumns() {
        for (const col of this.hidableColumns) {
            col.value = false;
        }
    }

    public hideAllColumns() {
        for (const col of this.hidableColumns) {
            col.value = true;
        }
    }

    public onVisibilityChanged(args: IColumnVisibilityChangedEventArgs) {
        this.onColumnVisibilityChanged.emit(args);
    }
}

@NgModule({
    declarations: [IgxColumnHidingComponent, IgxColumnHidingItemDirective],
    exports: [IgxColumnHidingComponent],
    imports: [
        IgxButtonModule,
        IgxCheckboxModule,
        IgxInputGroupModule,
        CommonModule,
        FormsModule,
    ]
})
export class IgxColumnHidingModule {
}

import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    OnDestroy,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { DataUtil } from '../data-operations/data-util';
import { IgxStringFilteringOperand } from '../data-operations/filtering-condition';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IColumnVisibilityChangedEventArgs, IgxColumnHidingItemDirective } from './column-hiding-item.directive';
import { IgxInputGroupComponent, IgxInputGroupModule } from '../input-group/input-group.component';
import { IgxInputDirective } from '../directives/input/input.directive';

export enum ColumnDisplayOrder {
    Alphabetical,
    DisplayOrder
}

@Component({
    preserveWhitespaces: false,
    selector: 'igx-column-hiding',
    templateUrl: './column-hiding.component.html'
})
export class IgxColumnHidingComponent implements OnDestroy {
    @Input()
    get columns() {
        return this._gridColumns;
    }

    set columns(value) {
        if (value) {
            this._gridColumns = value;
            this.createColumnItems();
        }
    }

    @Input()
    get title() {
        return this._title;
    }

    set title(value) {
        this._title = (value) ? value : '';
    }

    @Input()
    get filterColumnsPrompt() {
        return this._filterColumnsPrompt;
    }

    set filterColumnsPrompt(value) {
        this._filterColumnsPrompt = (value && value !== null) ? value : '';
    }

    @Input()
    get columnItems() {
        return this._currentColumns;
    }

    @Input()
    get filterCriteria() {
        return this._filterCriteria;
    }

    set filterCriteria(value) {
        if (!value || value.length === 0) {
            this.clearFiltering();
            this._filterCriteria = '';
            this.cdr.detectChanges();
            return;
        } else if (this._filterCriteria && this._filterCriteria.length > value.length) {
            this.clearFiltering();
        }

        this._filterCriteria = value;
        this.filter();
        this.cdr.detectChanges();
    }

    @Input()
    get disableHideAll(): boolean {
        if (!this._currentColumns || this._currentColumns.length < 1 ||
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
        if (!this._currentColumns || this._currentColumns.length < 1 ||
            this.hiddenColumnsCount < 1 || this.hidableColumns.length < 1) {
            return true;
        } else if (this.hidableColumns.length === this.hidableColumns.filter((col) => !col.value).length) {
            return true;
        } else {
            return false;
        }
    }

    @Input()
    get columnDisplayOrder() {
        return this._columnDisplayOrder;
    }

    set columnDisplayOrder(value: ColumnDisplayOrder) {
        if (value !== undefined) {
            this.orderColumns(value);
        }
    }

    @Input()
    public showAllText = 'Show All';

    @Input()
    public hideAllText = 'Hide All';

    @Input()
    public columnsAreaMaxHeight = '500px';

    @Output()
    public onColumnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    @HostBinding('attr.class')
    public cssClass = 'igx-column-hiding';

    @ViewChild('columnChooserToggle', { read: TemplateRef })
    protected columnChooserToggle: TemplateRef<any>;

    @ViewChild('columnChooserInline', { read: TemplateRef })
    protected columnChooserInline: TemplateRef<any>;

    private _currentColumns = [];
    private _gridColumns = [];
    private _rawColumns = [];
    private _togglable = true;
    private _columnDisplayOrder = ColumnDisplayOrder.DisplayOrder;
    private _filterCriteria = '';
    private _filterColumnsPrompt = '';
    private _title = '';

    public get hiddenColumnsCount() {
        return (this._gridColumns) ? this._gridColumns.filter((col) => col.hidden).length : 0;
    }

    // public get template(): TemplateRef<any> {
    //     if (this.togglable) {
    //         return this.columnChooserToggle;
    //     } else {
    //         return this.columnChooserInline;
    //     }
    // }

    constructor(public cdr: ChangeDetectorRef) {
    }

    ngOnDestroy() {
        for (const item of this._currentColumns) {
            item.valueChanged.unsubscribe();
        }
    }

    private get hidableColumns() {
        return this._currentColumns.filter((col) => !col.disabled);
    }

    private createColumnItems() {
        if (this._gridColumns.length > 0) {
            this._rawColumns = [];
            this._gridColumns.forEach((column) => {
                this._rawColumns.push(this.createColumnHidingItem(this, column));
            });
            this._currentColumns = this._rawColumns.slice(0);
        }
    }

    private createColumnHidingItem(container: any, column: any): IgxColumnHidingItemDirective {
        const item = new IgxColumnHidingItemDirective();
        item.container = container;
        item.column = column;
        item.valueChanged.subscribe((args) => {
            this.onVisibilityChanged({ column: item.column, newValue: args.newValue });
        });
        return item;
    }

    private orderColumns(value) {
        this._columnDisplayOrder = value;
        if (value === ColumnDisplayOrder[ColumnDisplayOrder.Alphabetical] ||
            value === ColumnDisplayOrder.Alphabetical) {
            this._currentColumns = this._rawColumns.slice(0).sort((current, next) => {
                return current.name.toLowerCase().localeCompare(next.name.toLowerCase());
            });
        } else {
            this._currentColumns = this._rawColumns;
        }
    }

    protected filter() {
        this._currentColumns = DataUtil.filter(this._currentColumns, {
            expressions: [
                {
                    condition: IgxStringFilteringOperand.instance().condition('contains'),
                    fieldName: 'name',
                    ignoreCase: true,
                    searchVal: this._filterCriteria
                }]
        });
    }

    protected clearFiltering() {
        this.createColumnItems();
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

    // public toggleDropDown() {
    //     if (this.togglable) {
    //         this.dropDown.toggle();
    //     }
    // }
}

@NgModule({
    declarations: [IgxColumnHidingComponent, IgxColumnHidingItemDirective],
    exports: [IgxColumnHidingComponent],
    imports: [
        IgxButtonModule,
        IgxCheckboxModule,
        // IgxDropDownModule,
        IgxInputGroupModule,
        CommonModule,
        FormsModule,
    ]
})
export class IgxColumnHidingModule {
}

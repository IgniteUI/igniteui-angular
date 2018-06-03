import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    NgModule,
    OnDestroy,
    Output,
    TemplateRef,
    ViewChild,
    OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { DataUtil } from '../data-operations/data-util';
import { IFilteringOperation, IgxStringFilteringOperand } from '../data-operations/filtering-condition';
import { filteringStateDefaults } from '../data-operations/filtering-state.interface';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxToggleDirective, IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IColumnVisibilityChangedEventArgs, IgxColumnHidingItemDirective } from './column-hiding-item.directive';
import { IgxColumnComponent } from './column.component';

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
        this._title = (value && value !== null) ? value : '';
    }

    @Input()
    get filterColumnsPrompt() {
        return  this._filterColumnsPrompt;
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
    get togglable() {
        return this._togglable;
    }

    set togglable(value) {
        this._togglable = value;
        this.cdr.markForCheck();
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

    @Output()
    public onColumnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    @ViewChild(IgxToggleDirective)
    public toggle: IgxToggleDirective;

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

    public dialogShowing = false;
    public dialogPosition = 'igx-filtering__options--to-right';

    public get hiddenColumnsCount() {
        return (this._gridColumns) ? this._gridColumns.filter((col) => col.hidden).length : 0;
    }

    public get template(): TemplateRef<any> {
        if (this.togglable) {
            return this.columnChooserToggle;
        } else {
            return this.columnChooserInline;
        }
    }

    constructor(public cdr: ChangeDetectorRef) {
    }

    ngOnDestroy() {
        for (const item of this._currentColumns) {
            item.valueChanged.unsubscribe();
        }
    }

    private get hidableColumns() {
        return this._currentColumns.filter((col) => !col.disableHiding);
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

    public refresh() {
        this.dialogShowing = !this.dialogShowing;
    }

    public onVisibilityChanged(args: IColumnVisibilityChangedEventArgs) {
        this.onColumnVisibilityChanged.emit(args);
    }
}

@NgModule({
    declarations: [ IgxColumnHidingComponent, IgxColumnHidingItemDirective ],
    exports: [IgxColumnHidingComponent],
    imports: [
        IgxButtonModule,
        IgxCheckboxModule,
        IgxToggleModule,
        CommonModule,
        FormsModule
    ]
})
export class IgxColumnHidingModule {
}

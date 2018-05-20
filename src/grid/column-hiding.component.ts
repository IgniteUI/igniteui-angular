import { CommonModule } from "@angular/common";
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxCheckboxModule } from "../checkbox/checkbox.component";
import { DataUtil } from "../data-operations/data-util";
import { FilteringCondition } from "../data-operations/filtering-condition";
import { filteringStateDefaults } from "../data-operations/filtering-state.interface";
import { IgxButtonModule } from "../directives/button/button.directive";
import { IgxToggleDirective, IgxToggleModule } from "../directives/toggle/toggle.directive";
import { IColumnVisibilityChangedEventArgs, IgxColumnHidingItemDirective } from "./column-hiding-item.component";
import { IgxColumnComponent } from "./column.component";

export enum ColumnDisplayOrder {
    Alphabetical,
    DisplayOrder
}

@Component({
    preserveWhitespaces: false,
    selector: "igx-column-hiding",
    templateUrl: "./column-hiding.component.html"
})
export class IgxColumnHidingComponent implements OnInit, OnDestroy {

    @Input()
    public showHiddenColumnsCount = true;

    @Input()
    get columns() {
        return this._gridColumns;
    }

    set columns(value) {
        if (value) {
            this._gridColumns = value;
            this.createColumnItems();
            this.cdr.markForCheck();
        }
    }

    @Input()
    get title() {
        return this._title;
    }

    set title(value) {
        this._title = (value && value !== null) ? value : "";
        this.cdr.markForCheck();
    }

    @Input()
    get filterColumnsPrompt() {
        return  this._filterColumnsPrompt;
    }

    set filterColumnsPrompt(value) {
        this._filterColumnsPrompt = (value && value !== null) ? value : "";
        this.cdr.markForCheck();
    }

    @Input()
    get columnItems() {
        return this._currentColumns;
    }

    get filterCriteria() {
        return this._filterCriteria;
    }

    @Input()
    set filterCriteria(value) {
        if (!value || value.length === 0) {
            this.clearFiltering();
            this._filterCriteria = "";
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
    public get disableHideAll(): boolean {
        if (!this._currentColumns || this._currentColumns.length < 1 ||
                this._hiddenColumnsCount === this.columns.length) {
            return true;
        } else if (this.hidableColumns.length < 1 ||
                this.hidableColumns.length === this.hidableColumns.filter((col) => col.value).length) {
            return true;
        } else {
            return false;
        }
    }

    @Input()
    public get disableShowAll(): boolean {
        if (!this._currentColumns || this._currentColumns.length < 1 ||
            this._hiddenColumnsCount < 1 || this.hidableColumns.length < 1) {
            return true;
        } else if (this.hidableColumns.length === this.hidableColumns.filter((col) => !col.value).length) {
            return true;
        } else {
            return false;
        }
    }

    get togglable() {
        return this._togglable;
    }

    @Input()
    set togglable(value) {
        this._togglable = value;
        this.cdr.markForCheck();
    }

    @Input()
    public get columnDisplayOrder() {
        return this._columnDisplayOrder;
    }

    public set columnDisplayOrder(value: ColumnDisplayOrder) {
        this._columnDisplayOrder = value;
        this.cdr.markForCheck();
    }

    @Input()
    public showAllText = "Show All";

    @Input()
    public hideAllText = "Hide All";

    @Output()
    public onColumnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    @ViewChild(IgxToggleDirective)
    public toggle: IgxToggleDirective;

    @ViewChild("columnChooserToggle", { read: TemplateRef })
    protected columnChooserToggle: TemplateRef<any>;

    @ViewChild("columnChooserInline", { read: TemplateRef })
    protected columnChooserInline: TemplateRef<any>;

    private _currentColumns = [];
    private _gridColumns = [];
    private _togglable = true;
    private _filterCriteria = "";
    private _filterColumnsPrompt = ""; // "Filter columns list ..."
    private _showHiddenColumnsOnly = false;
    private _hiddenColumnsCount = 0;
    private _title = ""; // no default value
    private _columnDisplayOrder = ColumnDisplayOrder.DisplayOrder;

    public dialogShowing = false;
    public dialogPosition = "igx-filtering__options--to-right";

    constructor(public cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.cdr.markForCheck();
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
        if (this._gridColumns !== undefined) {
            this._currentColumns = [];
            this._hiddenColumnsCount = this._gridColumns.filter((col) => col.hidden).length;
            this._gridColumns.forEach((column) => {
                this._currentColumns.push(this.createColumnHidingItem(this, column));
            });

            if (this._columnDisplayOrder.toString() === ColumnDisplayOrder[ColumnDisplayOrder.Alphabetical]) {
                this._currentColumns = this._currentColumns.sort((current, next) => {
                    return current.name.toLowerCase().localeCompare(next.name.toLowerCase());
                });
            }
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

    protected filter() {
        this._currentColumns = DataUtil.filter(this._currentColumns, {
            expressions: [
                {
                    condition: FilteringCondition.string.contains,
                    fieldName: "name",
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
        this._hiddenColumnsCount = 0;
    }

    public hideAllColumns() {
        for (const col of this.hidableColumns) {
            col.value = true;
        }
        this._hiddenColumnsCount = this._gridColumns.filter((col) => col.hidden).length;
    }

    public refresh() {
        this.dialogShowing = !this.dialogShowing;
    }

    public get template(): TemplateRef<any> {
        if (this.togglable) {
            return this.columnChooserToggle;
        } else {
            return this.columnChooserInline;
        }
    }

    public onVisibilityChanged(args: IColumnVisibilityChangedEventArgs) {
        if (args.newValue) {
           this._hiddenColumnsCount += 1;
        } else {
            this._hiddenColumnsCount -= 1;
        }
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

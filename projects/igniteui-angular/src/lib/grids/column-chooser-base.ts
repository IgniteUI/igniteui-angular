import { ChangeDetectorRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { DataUtil } from '../data-operations/data-util';
import { IgxStringFilteringOperand } from '../data-operations/filtering-condition';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { FilteringStrategy } from '../data-operations/filtering-strategy';
import { ColumnChooserItemBase } from './column-chooser-item-base';

export enum ColumnDisplayOrder {
    Alphabetical = 'Alphabetical',
    DisplayOrder = 'DisplayOrder'
}

/** @hidden */
export abstract class ColumnChooserBase implements OnDestroy {
    /**
     * Gets the grid columns that are going to be manipulated.
     * ```typescript
     * let gridColumns = this.columnHidingUI.columns;
     * ```
     * @memberof ColumnChooserBase
     */

    @Input()
    get columns() {
        return this._gridColumns;
    }
    /**
     * Sets the the grid columns that are going to be manipulated.
     * ```html
     * <igx-column-hiding [columns]="grid.columns"></igx-column-hiding>
     * ```
     * @memberof ColumnChooserBase
     */
    set columns(value) {
        if (value) {
            this._gridColumns = value;
            this.createColumnItems();
            if (this.filterCriteria) {
                this.filter();
            }
        }
    }
    /**
     * Sets/gets the title of the column chooser.
     * ```typescript
     * let title =  this.columnHidingUI.title;
     * ```
     * @memberof ColumnChooserBase
     */
    @Input()
    get title() {
        return this._title;
    }
    /**
     * ```html
     * <igx-column-hiding [title]="'IgxColumnHidingComponent Title'"></igx-column-hiding>
     * ```
     * @memberof ColumnChooserBase
     */
    set title(value) {
        this._title = (value) ? value : '';
    }
    /**
     * Gets the prompt that is displayed in the filter input.
     * ```typescript
     * let filterColumnsPrompt =  this.columnHidingUI.filterColumnsPrompt;
     * ```
     * @memberof ColumnChooserBase
     */
    @Input()
    get filterColumnsPrompt() {
        return this._filterColumnsPrompt;
    }
    /**
     * Sets the prompt that is going to be displayed in the filter input.
     * ```html
     * <igx-column-hiding [filterColumnsPrompt]="'Type here to search'"></igx-column-hiding>
     * ```
     * @memberof ColumnChooserBase
     */
    set filterColumnsPrompt(value) {
        this._filterColumnsPrompt = (value) ? value : '';
    }
    /**
     * Gets the items of the selected columns.
     * ```typescript
     * let columnItems =  this.columnHidingUI.columnItems;
     * ```
     * @memberof ColumnChooserBase
     */
    @Input()
    get columnItems() {
        return this._currentColumns;
    }
    /**
     * Gets the value which filters the columns list.
     * ```typescript
     * let filterCriteria =  this.columnHidingUI.filterCriteria;
     * ```
     * @memberof ColumnChooserBase
     */
    @Input()
    get filterCriteria() {
        return this._filterCriteria;
    }

    /**
     * Sets the value which filters the columns list.
     * ```html
     *  <igx-column-hiding [filterCriteria]="'ID'"></igx-column-hiding>
     * ```
     * @memberof ColumnChooserBase
     */
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
    /**
     * Gets the display order of the columns.
     * ```typescript
     * let columnDisplayOrder  =  this.columnHidingUI.columnDisplayOrder;
     * ```
     * @memberof ColumnChooserBase
     */
    @Input()
    get columnDisplayOrder() {
        return this._columnDisplayOrder;
    }
    /**
     * Sets the display order of the columns.
     * ```typescript
     * this.columnHidingUI.columnDisplayOrder = ColumnDisplayOrder.Alphabetical;
     * ```
     * @memberof ColumnChooserBase
     */
    set columnDisplayOrder(value: ColumnDisplayOrder) {
        if (value !== undefined) {
            this.orderColumns(value);
            if (this._filterCriteria.length > 0) {
                this.filter();
            }
        }
    }
    /**
     * Access to the columnHidingUI:
     * ```typescript
     * @ViewChild('column-hiding-component')
     *  public columnHidingUI: IgxColumnHidingComponent;
     * ```
     * Sets/gets the max height of the column area.
     * ```typescript
     * let columnsAreaMaxHeight =  this.columnHidingUI.columnsAreaMaxHeight;
     * ```
     *
     * ```html
     * <igx-column-hiding [columnsAreaMaxHeight]="200px"></igx-column-hiding>
     * ```
     * @memberof ColumnChooserBase
     */
    @Input()
    public columnsAreaMaxHeight = '100%';
    /**
     * Sets/Gets the css class selector.
     * By default the value of the `class` attribute is `"igx-column-hiding"`.
     * ```typescript
     * let cssCLass =  this.columnHidingUI.cssClass;
     * ```
     * ```typescript
     * this.columnHidingUI.cssClass = 'column-chooser';
     * ```
     * @memberof ColumnChooserBase
     */
    @HostBinding('attr.class')
    public cssClass = 'igx-column-hiding';
    /**
     *@hidden
     */
    private _currentColumns = [];
    /**
     *@hidden
     */
    private _gridColumns = [];
    /**
     *@hidden
     */
    private _rawColumns = [];
    /**
     *@hidden
     */
    private _columnDisplayOrder = ColumnDisplayOrder.DisplayOrder;
    /**
     *@hidden
     */
    private _filterCriteria = '';
    /**
     *@hidden
     */
    private _filterColumnsPrompt = '';
    /**
     *@hidden
     */
    private _title = '';

    constructor(public cdr: ChangeDetectorRef) {
    }
    /**
     *@hidden
     */
    ngOnDestroy() {
        for (const item of this._currentColumns) {
            item.valueChanged.unsubscribe();
        }
    }
    /**
     *@hidden
     */
    private createColumnItems() {
        if (this._gridColumns.length > 0) {
            this._rawColumns = [];
            this._gridColumns.forEach((column) => {
                const item = this.createColumnItem(this, column);
                if (item) {
                    this._rawColumns.push(item);
                }
            });
            this._currentColumns = this._rawColumns.slice(0);
            this.orderColumns(this._columnDisplayOrder);
        }
    }
    /**
     *@hidden
     */
    protected abstract createColumnItem(container: any, column: any);
    /**
     *@hidden
     */
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
    /**
     *@hidden
     */
    protected filter() {
        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.Or);
        filteringExpressionsTree.filteringOperands.push(this.createFilteringExpression('name'));
        filteringExpressionsTree.filteringOperands.push(this.createFilteringExpression('field'));
        filteringExpressionsTree.filteringOperands.push(this.createFilteringExpression('header'));

        const strategy = new CustomFilteringStrategy();
        this._currentColumns = strategy.filter(this._currentColumns, filteringExpressionsTree);
    }
    /**
     *@hidden
     */
    protected createFilteringExpression(fieldName: string): IFilteringExpression {
        return {
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            fieldName: fieldName,
            ignoreCase: true,
            searchVal: this._filterCriteria
        };
    }
    /**
     *@hidden
     */
    protected clearFiltering() {
        this.createColumnItems();
    }
}

class CustomFilteringStrategy extends FilteringStrategy {
    public filter(data: any[], expressionsTree: IFilteringExpressionsTree): any[] {
        const res: ColumnChooserItemBase[] = [];
        data.forEach((item: ColumnChooserItemBase) => {
            if (this.matchRecord(item, expressionsTree.filteringOperands[0] as IFilteringExpression)) {
                res.push(item);
            } else if (item.column.columnGroup) {
                if (item.column.allChildren.findIndex((child) =>
                    this.matchRecord(child, expressionsTree.filteringOperands[1] as IFilteringExpression) ||
                    this.matchRecord(child, expressionsTree.filteringOperands[2] as IFilteringExpression)) > -1) {
                    res.push(item);
                }
            }
        });

        return res;
    }
}

import { ChangeDetectorRef, HostBinding, Input,  OnDestroy } from '@angular/core';
import { DataUtil } from '../data-operations/data-util';
import { IgxStringFilteringOperand } from '../data-operations/filtering-condition';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { FilteringStrategy } from '../data-operations/filtering-strategy';
import { ColumnChooserItemBase } from './column-chooser-item-base';

export enum ColumnDisplayOrder {
    Alphabetical,
    DisplayOrder
}

export abstract class ColumnChooserBase implements OnDestroy {
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
        this._filterColumnsPrompt = (value) ? value : '';
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
    get columnDisplayOrder() {
        return this._columnDisplayOrder;
    }

    set columnDisplayOrder(value: ColumnDisplayOrder) {
        if (value !== undefined) {
            this.orderColumns(value);
            if (this._filterCriteria.length > 0) {
                this.filter();
            }
        }
    }

    @Input()
    public columnsAreaMaxHeight = '100%';

    @HostBinding('attr.class')
    public cssClass = 'igx-column-hiding';

    private _currentColumns = [];
    private _gridColumns = [];
    private _rawColumns = [];
    private _columnDisplayOrder = ColumnDisplayOrder.DisplayOrder;
    private _filterCriteria = '';
    private _filterColumnsPrompt = '';
    private _title = '';

    constructor(public cdr: ChangeDetectorRef) {
    }

    ngOnDestroy() {
        for (const item of this._currentColumns) {
            item.valueChanged.unsubscribe();
        }
    }

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

    protected abstract createColumnItem(container: any, column: any);

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
        const filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.Or);
        filteringExpressionsTree.filteringOperands.push(this.createFilteringExpression('name'));
        filteringExpressionsTree.filteringOperands.push(this.createFilteringExpression('field'));
        filteringExpressionsTree.filteringOperands.push(this.createFilteringExpression('header'));

        const strategy = new CustomFilteringStrategy();
        this._currentColumns = strategy.filter(this._currentColumns, filteringExpressionsTree);
    }

    protected createFilteringExpression(fieldName: string): IFilteringExpression {
        return {
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            fieldName: fieldName,
            ignoreCase: true,
            searchVal: this._filterCriteria
        };
    }

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

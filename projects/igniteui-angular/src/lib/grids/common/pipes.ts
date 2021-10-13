import { Pipe, PipeTransform, Inject } from '@angular/core';
import { DataUtil } from '../../data-operations/data-util';
import { cloneArray, resolveNestedPath } from '../../core/utils';
import { ColumnType, GridType, IGX_GRID_BASE, RowType } from './grid.interface';
import { ColumnDisplayOrder } from './enums';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxAddRow } from './crud.service';
import { IgxSummaryOperand, IgxSummaryResult } from '../summaries/grid-summary';
import { IgxGridRow } from '../grid-public-row';

interface GridStyleCSSProperty {
    [prop: string]: any;
}

/**
 * @hidden
 * @internal
 */
@Pipe({ name: 'igxCellStyleClasses' })
export class IgxGridCellStyleClassesPipe implements PipeTransform {

    public transform(cssClasses: GridStyleCSSProperty, _: any, data: any, field: string, index: number, __: number): string {
        if (!cssClasses) {
            return '';
        }

        const result = [];

        for (const cssClass of Object.keys(cssClasses)) {
            const callbackOrValue = cssClasses[cssClass];
            const apply = typeof callbackOrValue === 'function' ?
                callbackOrValue(data, field, resolveNestedPath(data, field), index) : callbackOrValue;
            if (apply) {
                result.push(cssClass);
            }
        }

        return result.join(' ');
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxCellStyles'
})
export class IgxGridCellStylesPipe implements PipeTransform {

    public transform(styles: GridStyleCSSProperty, _: any, data: any, field: string, index: number, __: number):
        GridStyleCSSProperty {
        const css = {};
        if (!styles) {
            return css;
        }

        for (const prop of Object.keys(styles)) {
            const res = styles[prop];
            css[prop] = typeof res === 'function' ? res(data, field, resolveNestedPath(data, field), index) : res;
        }

        return css;
    }
}


/**
 * @hidden
 * @internal
 */
@Pipe({ name: 'igxGridRowClasses' })
export class IgxGridRowClassesPipe implements PipeTransform {
    public row: RowType;

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) {
        this.row = new IgxGridRow(this.grid as any, -1, {});
    }

    public transform(
        cssClasses: GridStyleCSSProperty,
        row: RowType,
        editMode: boolean,
        selected: boolean,
        dirty: boolean,
        deleted: boolean,
        dragging: boolean,
        index: number,
        mrl: boolean,
        filteredOut: boolean,
        _: number
    ) {
        const result = new Set(['igx-grid__tr', index % 2 ? row.grid.evenRowCSS : row.grid.oddRowCSS]);
        const mapping = [
            [selected, 'igx-grid__tr--selected'],
            [editMode, 'igx-grid__tr--edit'],
            [dirty, 'igx-grid__tr--edited'],
            [deleted, 'igx-grid__tr--deleted'],
            [dragging, 'igx-grid__tr--drag'],
            [mrl, 'igx-grid__tr--mrl'],
            // Tree grid only
            [filteredOut, 'igx-grid__tr--filtered']
        ];

        for (const [state, _class] of mapping) {
            if (state) {
                result.add(_class as string);
            }
        }

        for (const cssClass of Object.keys(cssClasses ?? {})) {
            const callbackOrValue = cssClasses[cssClass];
            this.row.index = index;
            (this.row as any)._data = row.rowData;
            const apply = typeof callbackOrValue === 'function' ? callbackOrValue(this.row) : callbackOrValue;
            if (apply) {
                result.add(cssClass);
            }
        }
        return result;
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({ name: 'igxGridRowStyles' })
export class IgxGridRowStylesPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(styles: GridStyleCSSProperty, rowData: any, index: number, __: number): GridStyleCSSProperty {
        const css = {};
        if (!styles) {
            return css;
        }
        for (const prop of Object.keys(styles)) {
            const cb = styles[prop];
            const row = new IgxGridRow((this.grid as any), index, rowData);
            css[prop] = typeof cb === 'function' ? cb(row) : cb;
        }
        return css;
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxNotGrouped'
})
export class IgxGridNotGroupedPipe implements PipeTransform {

    public transform(value: any[]): any[] {
        return value.filter(item => !item.columnGroup);
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'igxTopLevel'
})
export class IgxGridTopLevelColumns implements PipeTransform {

    public transform(value: any[]): any[] {
        return value.filter(item => item.level === 0);
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({
    name: 'filterCondition',
    pure: true
})
export class IgxGridFilterConditionPipe implements PipeTransform {

    public transform(value: string): string {
        return value.split(/(?=[A-Z])/).join(' ');
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({ name: 'gridTransaction' })
export class IgxGridTransactionPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any[], _id: string, _pipeTrigger: number) {

        if (this.grid.transactions.enabled) {
            const result = DataUtil.mergeTransactions(
                cloneArray(collection),
                this.grid.transactions.getAggregatedChanges(true),
                this.grid.primaryKey);
            return result;
        }
        return collection;
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({ name: 'paginatorOptions' })
export class IgxGridPaginatorOptionsPipe implements PipeTransform {
    public transform(values: Array<number>) {
        return Array.from(new Set([...values])).sort((a, b) => a - b);
    }
}

/**
 * @hidden
 * @internal
 */
@Pipe({ name: 'visibleColumns' })
export class IgxHasVisibleColumnsPipe implements PipeTransform {
    public transform(values: any[], hasVisibleColumns) {
        if (!(values && values.length)) {
            return values;
        }
        return hasVisibleColumns ? values : [];
    }

}

/**
 * @hidden
 */
@Pipe({ name: 'gridRowPinning' })
export class IgxGridRowPinningPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any[], id: string, isPinned = false, _pipeTrigger: number) {

        if (this.grid.hasPinnedRecords && isPinned) {
            const result = collection.filter(rec => !this.grid.isSummaryRow(rec) && this.grid.isRecordPinned(rec));
            result.sort((rec1, rec2) => this.grid.getInitialPinnedIndex(rec1) - this.grid.getInitialPinnedIndex(rec2));
            return result;
        }

        this.grid.unpinnedRecords = collection;
        if (!this.grid.hasPinnedRecords) {
            this.grid.pinnedRecords = [];
            return isPinned ? [] : collection;
        }

        return collection.map((rec) => !this.grid.isSummaryRow(rec) &&
            this.grid.isRecordPinned(rec) ? { recordRef: rec, ghostRecord: true } : rec);
    }
}

@Pipe({ name: 'columnActionEnabled' })
export class IgxColumnActionEnabledPipe implements PipeTransform {

    constructor(@Inject(IgxColumnActionsComponent) protected columnActions: IgxColumnActionsComponent) { }

    public transform(
        collection: ColumnType[],
        actionFilter: (value: ColumnType, index: number, array: ColumnType[]) => boolean,
        _pipeTrigger: number
    ): ColumnType[] {
        if (!collection) {
            return collection;
        }
        let copy = collection.slice(0);
        if (copy.length && copy[0].grid.hasColumnLayouts) {
            copy = copy.filter(c => c.columnLayout);
        }
        if (actionFilter) {
            copy = copy.filter(actionFilter);
        }
        // Preserve the actionable collection for use in the component
        this.columnActions.actionableColumns = copy as any;
        return copy;
    }
}

@Pipe({ name: 'filterActionColumns' })
export class IgxFilterActionColumnsPipe implements PipeTransform {

    constructor(@Inject(IgxColumnActionsComponent) protected columnActions: IgxColumnActionsComponent) { }

    public transform(collection: ColumnType[], filterCriteria: string, _pipeTrigger: number): ColumnType[] {
        if (!collection) {
            return collection;
        }
        let copy = collection.slice(0);
        if (filterCriteria && filterCriteria.length > 0) {
            const filterFunc = (c) => {
                const filterText = c.header || c.field;
                if (!filterText) {
                    return false;
                }
                return filterText.toLocaleLowerCase().indexOf(filterCriteria.toLocaleLowerCase()) >= 0 ||
                    (c.children?.some(filterFunc) ?? false);
            };
            copy = collection.filter(filterFunc);
        }
        // Preserve the filtered collection for use in the component
        this.columnActions.filteredColumns = copy as any;
        return copy;
    }
}

@Pipe({ name: 'sortActionColumns' })
export class IgxSortActionColumnsPipe implements PipeTransform {

    public transform(collection: ColumnType[], displayOrder: ColumnDisplayOrder, _pipeTrigger: number): ColumnType[] {
        if (displayOrder === ColumnDisplayOrder.Alphabetical) {
            return collection.sort((a, b) => (a.header || a.field).localeCompare(b.header || b.field));
        }
        return collection;
    }
}

@Pipe({ name: 'dataMapper' })
export class IgxGridDataMapperPipe implements PipeTransform {

    public transform(data: any[], field: string, _: number, val: any, isNestedPath: boolean) {
        return isNestedPath ? resolveNestedPath(data, field) : val;
    }
}

@Pipe({ name: 'igxStringReplace' })
export class IgxStringReplacePipe implements PipeTransform {

    public transform(value: string, search: string | RegExp, replacement: string): string {
        return value.replace(search, replacement);
    }
}

@Pipe({ name: 'transactionState' })
export class IgxGridTransactionStatePipe implements PipeTransform {

    public transform(row_id: any, field: string, rowEditable: boolean, transactions: any, _: any, __: any, ___: any) {
        if (rowEditable) {
            const rowCurrentState = transactions.getAggregatedValue(row_id, false);
            if (rowCurrentState) {
                const value = resolveNestedPath(rowCurrentState, field);
                return value !== undefined && value !== null;
            }
        } else {
            const transaction = transactions.getState(row_id);
            const value = resolveNestedPath(transaction?.value ?? {}, field);
            return transaction && transaction.value && (value || value === 0 || value === false);
        }
    }
}

@Pipe({ name: 'columnFormatter' })
export class IgxColumnFormatterPipe implements PipeTransform {

    public transform(value: any, formatter: (v: any, data: any) => any, rowData: any) {
        return formatter(value, rowData);
    }
}

@Pipe({ name: 'summaryFormatter' })
export class IgxSummaryFormatterPipe implements PipeTransform {

    public transform(summaryResult: IgxSummaryResult, summaryOperand: IgxSummaryOperand,
        summaryFormatter: (s: IgxSummaryResult, o: IgxSummaryOperand) => any) {
        return summaryFormatter(summaryResult, summaryOperand);
    }
}

@Pipe({ name: 'gridAddRow' })
export class IgxGridAddRowPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    public transform(collection: any, isPinned = false, _pipeTrigger: number) {
        if (!this.grid.rowEditable || !this.grid.crudService.row || this.grid.crudService.row.getClassName() !== IgxAddRow.name ||
            !this.grid.crudService.addRowParent || isPinned !== this.grid.crudService.addRowParent.isPinned) {
            return collection;
        }
        const copy = collection.slice(0);
        const rec = (this.grid.crudService.row as IgxAddRow).recordRef;
        copy.splice(this.grid.crudService.row.index, 0, rec);
        return copy;
    }
}

@Pipe({ name: 'igxHeaderGroupWidth' })
export class IgxHeaderGroupWidthPipe implements PipeTransform {

    public transform(width: any, minWidth: any, hasLayout: boolean) {
        return hasLayout ? '' : `${Math.max(parseFloat(width), minWidth)}px`;
    }
}

@Pipe({ name: 'igxHeaderGroupStyle' })
export class IgxHeaderGroupStylePipe implements PipeTransform {

    public transform(styles: { [prop: string]: any }, column: ColumnType, _: number): { [prop: string]: any } {
        const css = {};

        if (!styles) {
            return css;
        }

        for (const prop of Object.keys(styles)) {
            const res = styles[prop];
            css[prop] = typeof res === 'function' ? res(column) : res;
        }

        return css;
    }
}

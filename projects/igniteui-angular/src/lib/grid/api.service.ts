import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { cloneArray } from '../core/utils';
import { DataUtil } from '../data-operations/data-util';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IGridEditEventArgs, IgxGridComponent } from './grid.component';
import { IgxGridRowComponent } from './row.component';
import { IFilteringOperation } from '../../public_api';

@Injectable()
export class IgxGridAPIService {

    public change: Subject<any> = new Subject<any>();
    protected state: Map<string, IgxGridComponent> = new Map<string, IgxGridComponent>();
    protected editCellState: Map<string, any> = new Map<string, any>();
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, any[]>>();

    public register(grid: IgxGridComponent) {
        this.state.set(grid.id, grid);
    }

    public get(id: string): IgxGridComponent {
        return this.state.get(id);
    }

    public unset(id: string) {
        this.state.delete(id);
        this.summaryCacheMap.delete(id);
        this.editCellState.delete(id);
    }

    public get_column_by_name(id: string, name: string): IgxColumnComponent {
        return this.get(id).columnList.find((col) => col.field === name);
    }

    public set_summary_by_column_name(id: string, name: string) {
        if (!this.summaryCacheMap.get(id)) {
            this.summaryCacheMap.set(id, new Map<string, any[]>());
        }
        const column = this.get_column_by_name(id, name);
        if (this.get(id).filteredData && this.get(id).filteredData.length >= 0) {
            this.calculateSummaries(id, column, this.get(id).filteredData.map((rec) => rec[column.field]));
        } else {
            if (this.get(id).data) {
                this.calculateSummaries(id, column, this.get(id).data.map((rec) => rec[column.field]));
            }
        }
    }

    public get_summaries(id: string) {
        return this.summaryCacheMap.get(id);
    }

    public remove_summary(id: string, name?: string) {
        if (this.summaryCacheMap.has(id)) {
            if (!name) {
                this.summaryCacheMap.delete(id);
            } else {
                this.summaryCacheMap.get(id).delete(name);
            }
        }
    }

    public set_cell_inEditMode(gridId: string, cell,  editMode: boolean) {
        if (!this.editCellState.has(gridId)) {
            this.editCellState.set(gridId, null);
        }
        if (!this.get_cell_inEditMode(gridId) && editMode) {
            this.editCellState.set(gridId, {cellID: cell.cellID, cell: Object.assign({}, cell)});
        }
    }

    public escape_editMode(gridId, cellId) {
        const editableCell = this.get_cell_inEditMode(gridId);
        if (editableCell && cellId.rowID === editableCell.cellID.rowID &&
            cellId.columnID === editableCell.cellID.columnID) {
            this.editCellState.delete(gridId);
        }
    }


    public get_cell_inEditMode(gridId) {
        const editCellId = this.editCellState.get(gridId);
        if (editCellId) {
            return editCellId;
        } else {
            return null;
        }

    }

    public get_row_by_key(id: string, rowSelector: any): IgxGridRowComponent {
        const primaryKey = this.get(id).primaryKey;
        if (primaryKey !== undefined && primaryKey !== null) {
            return this.get(id).rowList.find((row) => row.rowData[primaryKey] === rowSelector);
        }
        return this.get(id).rowList.find((row) => row.index === rowSelector);
    }

    public get_row_by_index(id: string, rowIndex: number): IgxGridRowComponent {
        return this.get(id).rowList.find((row) => row.index === rowIndex);
    }

    public get_cell_by_field(id: string, rowSelector: any, field: string): IgxGridCellComponent {
        const row = this.get_row_by_key(id, rowSelector);
        if (row) {
            return row.cells.find((cell) => cell.column.field === field);
        }
    }

    public notify(id: string) {
        this.get(id).eventBus.next(true);
    }

    public get_cell_by_index(id: string, rowIndex: number, columnIndex: number): IgxGridCellComponent {
        const row = this.get_row_by_index(id, rowIndex);
        if (row) {
            return row.cells.find((cell) => cell.columnIndex === columnIndex);
        }
    }

    public get_cell_by_visible_index(id: string, rowIndex: number, columnIndex: number): IgxGridCellComponent {
        const row = this.get_row_by_index(id, rowIndex);
        if (row) {
            return row.cells.find((cell) => cell.visibleColumnIndex === columnIndex);
        }
    }

    public submit_value(gridId) {
        const editableCell = this.get_cell_inEditMode(gridId);
        if (editableCell) {
            if (!editableCell.cell.column.inlineEditorTemplate && editableCell.cell.column.dataType === 'number') {
                if (!this.get_cell_inEditMode(gridId).cell.editValue) {
                    this.update_cell(gridId, editableCell.cellID.rowIndex, editableCell.cellID.columnID, 0);
                } else {
                    const val = parseFloat(this.get_cell_inEditMode(gridId).cell.editValue);
                    if (!isNaN(val) || isFinite(val)) {
                        this.update_cell(gridId, editableCell.cellID.rowIndex, editableCell.cellID.columnID, val);
                    }
                }
            } else {
                this.update_cell(gridId, editableCell.cellID.rowIndex, editableCell.cellID.columnID, editableCell.cell.editValue);
            }
        }
    }

    public update_cell(id: string, rowSelector, columnID, editValue) {
        const row = this.get_row_by_key(id, rowSelector);
        if (row) {
            const rowIndex = row.index;
            let cellObj = this.get(id).columnList.toArray()[columnID].cells[rowIndex];
            if (!cellObj && this.get_cell_inEditMode(id)) {
                cellObj = this.get_cell_inEditMode(id).cell;
            }
            if (cellObj) {
                const args: IGridEditEventArgs = { row: cellObj.row, cell: cellObj,
                    currentValue: cellObj.value, newValue: editValue };
                this.get(id).onEditDone.emit(args);
                const column =  this.get(id).columnList.toArray()[columnID];
                this.get(id).data[rowIndex][column.field] = args.newValue;
                this.get(id).refreshSearch();
            }
        }
    }

    public update_row(value: any, id: string, row: IgxGridRowComponent): void {
        const index = this.get(id).data.indexOf(row.rowData);
        const args: IGridEditEventArgs = { row, cell: null, currentValue: this.get(id).data[index], newValue: value };
        this.get(id).onEditDone.emit(args);
        this.get(id).data[index] = args.newValue;
    }

    public sort(id: string, fieldName: string, dir: SortingDirection, ignoreCase: boolean): void {
        const sortingState = cloneArray(this.get(id).sortingExpressions, true);

        this.prepare_sorting_expression(sortingState, fieldName, dir, ignoreCase);
        this.get(id).sortingExpressions = sortingState;
    }

    public sort_multiple(id: string, expressions: ISortingExpression[]): void {
        const sortingState = cloneArray(this.get(id).sortingExpressions, true);

        for (const each of expressions) {
            this.prepare_sorting_expression(sortingState, each.fieldName, each.dir, each.ignoreCase);
        }

        this.get(id).sortingExpressions = sortingState;
    }

    public filter(id: string, fieldName: string, term, condition: IFilteringOperation, ignoreCase: boolean) {
        const filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }
        this.prepare_filtering_expression(filteringState, fieldName, term, condition, ignoreCase);
        this.get(id).filteringExpressions = filteringState;
    }

    public filter_multiple(id: string, expressions: IFilteringExpression[]) {
        const filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }

        for (const each of expressions) {
            this.prepare_filtering_expression(filteringState, each.fieldName,
                                              each.searchVal, each.condition, each.ignoreCase);
        }
        this.get(id).filteringExpressions = filteringState;
    }

    public filter_global(id, term, condition, ignoreCase) {
        const filteringState = this.get(id).filteringExpressions;
        if (this.get(id).paging) {
            this.get(id).page = 0;
        }

        for (const column of this.get(id).columns) {
            this.prepare_filtering_expression(filteringState, column.field, term,
                condition || column.filteringCondition, ignoreCase || column.filteringIgnoreCase);
        }
        this.get(id).filteringExpressions = filteringState;
    }

    public clear_filter(id, fieldName) {
        const filteringState = this.get(id).filteringExpressions;
        const index = filteringState.findIndex((expr) => expr.fieldName === fieldName);
        if (index > -1) {
            filteringState.splice(index, 1);
            this.get(id).filteringExpressions = filteringState;
        }
        this.get(id).filteredData = null;
    }

    protected calculateSummaries(id: string, column, data) {
        if (!this.summaryCacheMap.get(id).get(column.field)) {
            this.summaryCacheMap.get(id).set(column.field,
                column.summaries.operate(data));
        }
    }

    public clear_sort(id, fieldName) {
        const sortingState = this.get(id).sortingExpressions;
        const index = sortingState.findIndex((expr) => expr.fieldName === fieldName);
        if (index > -1) {
            sortingState.splice(index, 1);
            this.get(id).sortingExpressions = sortingState;
        }
    }

    protected prepare_filtering_expression(state, fieldName: string, searchVal, condition: IFilteringOperation, ignoreCase: boolean) {

        const expression = state.find((expr) => expr.fieldName === fieldName);
        const newExpression: IFilteringExpression = { fieldName, searchVal, condition, ignoreCase };
        if (!expression) {
            state.push(newExpression);
        } else {
            Object.assign(expression, newExpression);
        }
    }

    protected prepare_sorting_expression(state, fieldName, dir, ignoreCase) {

        if (dir === SortingDirection.None) {
            state.splice(state.findIndex((expr) => expr.fieldName === fieldName), 1);
            return;
        }

        const expression = state.find((expr) => expr.fieldName === fieldName);

        if (!expression) {
            state.push({ fieldName, dir, ignoreCase });
        } else {
            Object.assign(expression, { fieldName, dir, ignoreCase });
        }
    }
}

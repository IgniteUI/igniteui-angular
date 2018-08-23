import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { cloneArray } from '../core/utils';
import { IFilteringExpression, FilteringLogic } from '../data-operations/filtering-expression.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IgxRowBaseComponent } from './row-base.component';
import { IFilteringOperation, FilteringExpressionsTree, IFilteringExpressionsTree } from '../../public_api';
import { IGridEditEventArgs, IGridComponent } from './grid-interfaces';

/**
 *@hidden
 */
@Injectable()
export abstract class IGridAPIService <T extends IGridComponent> {

    public change: Subject<any> = new Subject<any>();
    protected state: Map<string, T> = new Map<string, T>();
    protected editCellState: Map<string, any> = new Map<string, any>();
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, any[]>>();

    public register(grid: IGridComponent) {
        this.state.set(grid.id, grid as T);
    }

    public unsubscribe(grid: IGridComponent) {
        this.state.delete(grid.id);
    }

    public get(id: string): T {
        return this.state.get(id);
    }

    public unset(id: string) {
        this.state.delete(id);
        this.summaryCacheMap.delete(id);
        this.editCellState.delete(id);
    }

    public get_column_by_name(id: string, name: string): IgxColumnComponent {
        return this.get(id).columns.find((col) => col.field === name);
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

    public set_cell_inEditMode(gridId: string, cell, editMode: boolean) {
        if (!this.editCellState.has(gridId)) {
            this.editCellState.set(gridId, null);
        }
        if (!this.get_cell_inEditMode(gridId) && editMode) {
            const cellCopy = Object.assign({}, cell);
            cellCopy.row = Object.assign({}, cell.row);
            this.editCellState.set(gridId, { cellID: cell.cellID, cell: cellCopy });
        }
    }

    public escape_editMode(gridId, cellId?) {
        const editableCell = this.get_cell_inEditMode(gridId);
        if (editableCell) {
            if (cellId) {
                if (cellId.rowID === editableCell.cellID.rowID &&
                    cellId.columnID === editableCell.cellID.columnID) {
                    this.editCellState.delete(gridId);
                }
            } else {
                this.editCellState.delete(gridId);
            }
        }

        this.refreshSearch(gridId);
    }

    public get_cell_inEditMode(gridId) {
        const editCellId = this.editCellState.get(gridId);
        if (editCellId) {
            return editCellId;
        } else {
            return null;
        }
    }

    public get_row_by_key(id: string, rowSelector: any): IgxRowBaseComponent<IGridComponent>  {
        const primaryKey = this.get(id).primaryKey;
        if (primaryKey !== undefined && primaryKey !== null) {
            return this.get(id).dataRowList.find((row) => row.rowData[primaryKey] === rowSelector);
        } else {
            return this.get(id).dataRowList.find((row) => row.rowData === rowSelector);
        }
    }

    public get_row_by_index(id: string, rowIndex: number): IgxRowBaseComponent<IGridComponent> {
        return this.get(id).rowList.find((row) => row.index === rowIndex);
    }

    public get_cell_by_key(id: string, rowSelector: any, field: string): IgxGridCellComponent {
        const row = this.get_row_by_key(id, rowSelector);
        if (row && row.cells) {
            return row.cells.find((cell) => cell.column.field === field);
        }
    }

    public get_cell_by_index(id: string, rowIndex: number, columnIndex: number): IgxGridCellComponent {
        const row = this.get_row_by_index(id, rowIndex);
        if (row && row.cells) {
            return row.cells.find((cell) => cell.columnIndex === columnIndex);
        }
    }

    public get_cell_by_visible_index(id: string, rowIndex: number, columnIndex: number): IgxGridCellComponent {
        const row = this.get_row_by_index(id, rowIndex);
        if (row && row.cells) {
            return row.cells.find((cell) => cell.visibleColumnIndex === columnIndex);
        }
    }

    public submit_value(gridId) {
        const editableCell = this.get_cell_inEditMode(gridId);
        if (editableCell) {
            if (!editableCell.cell.column.inlineEditorTemplate && editableCell.cell.column.dataType === 'number') {
                if (!this.get_cell_inEditMode(gridId).cell.editValue) {
                    this.update_cell(gridId, editableCell.cellID.rowID, editableCell.cellID.columnID, 0);
                } else {
                    const val = parseFloat(this.get_cell_inEditMode(gridId).cell.editValue);
                    if (!isNaN(val) || isFinite(val)) {
                        this.update_cell(gridId, editableCell.cellID.rowID, editableCell.cellID.columnID, val);
                    }
                }
            } else {
                this.update_cell(gridId, editableCell.cellID.rowID, editableCell.cellID.columnID, editableCell.cell.editValue);
            }
            this.escape_editMode(gridId, editableCell.cellID);
            this.get(gridId).cdr.detectChanges();
        }
    }

    public update_cell(id: string, rowID, columnID, editValue) {
        const grid = this.get(id);
        const isRowSelected = grid.selectionAPI.is_item_selected(id, rowID);
        const editableCell = this.get_cell_inEditMode(id);
        const column = grid.columns[columnID];
        const cellObj = (editableCell && editableCell.cellID.rowID === rowID && editableCell.cellID.columnID === columnID) ?
        editableCell.cell : grid.columns[columnID].cells.find((cell) => cell.cellID.rowID === rowID);
        const rowIndex = grid.primaryKey ? grid.data.map((record) => record[grid.primaryKey]).indexOf(rowID) :
        grid.data.indexOf(rowID);
        if (rowIndex !== -1) {
            const args: IGridEditEventArgs = {
                row: cellObj ? cellObj.row : null, cell: cellObj,
                currentValue: grid.data[rowIndex][column.field], newValue: editValue
            };
            grid.onEditDone.emit(args);
            grid.data[rowIndex][column.field] = args.newValue;
            if (grid.primaryKey === column.field && isRowSelected) {
                grid.selectionAPI.set_selection(id, grid.selectionAPI.deselect_item(id, rowID));
                grid.selectionAPI.set_selection(id, grid.selectionAPI.select_item(id, args.newValue));
            }
            (grid as any)._pipeTrigger++;
        }
    }

    public update_row(value: any, id: string, rowID: any): void {
        const grid = this.get(id);
        const isRowSelected = grid.selectionAPI.is_item_selected(id, rowID);
        const index = grid.primaryKey ? grid.data.map((record) => record[grid.primaryKey]).indexOf(rowID) :
        grid.data.indexOf(rowID);
        if (index !== -1) {
            const args: IGridEditEventArgs = { row: this.get_row_by_key(id, rowID), cell: null,
                currentValue: this.get(id).data[index], newValue: value };
            grid.onEditDone.emit(args);
            grid.data[index] = args.newValue;
            if (isRowSelected) {
                grid.selectionAPI.set_selection(id, grid.selectionAPI.deselect_item(id, rowID));
                const newRowID = (grid.primaryKey) ? args.newValue[grid.primaryKey] : args.newValue;
                grid.selectionAPI.set_selection(id, grid.selectionAPI.select_item(id, newRowID));
            }
            (grid as any)._pipeTrigger++;
        }
    }

    public sort(id: string, fieldName: string, dir: SortingDirection, ignoreCase: boolean): void {
        if (dir === SortingDirection.None) {
            this.remove_grouping_expression(id, fieldName);
        }
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        this.prepare_sorting_expression([sortingState], { fieldName, dir, ignoreCase });
        this.get(id).sortingExpressions = sortingState;
    }

    public sort_multiple(id: string, expressions: ISortingExpression[]): void {
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        for (const each of expressions) {
            if (each.dir === SortingDirection.None) {
                this.remove_grouping_expression(id, each.fieldName);
            }
            this.prepare_sorting_expression([sortingState], each);
        }

        this.get(id).sortingExpressions = sortingState;
    }

    public filter(id: string, fieldName: string, term, conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase: boolean) {
        const grid = this.get(id);
        const filteringTree = grid.filteringExpressionsTree;
        this.escape_editMode(id);

        if (grid.paging) {
            grid.page = 0;
        }

        const fieldFilterIndex = filteringTree.findIndex(fieldName);
        if (fieldFilterIndex > -1) {
            filteringTree.filteringOperands.splice(fieldFilterIndex, 1);
        }

        this.prepare_filtering_expression(filteringTree, fieldName, term, conditionOrExpressionsTree, ignoreCase);
        grid.filteringExpressionsTree = filteringTree;
    }

    public filter_global(id, term, condition, ignoreCase) {
        const grid = this.get(id);
        const filteringTree = grid.filteringExpressionsTree;
        if (grid.paging) {
            grid.page = 0;
        }

        filteringTree.filteringOperands = [];
        this.remove_summary(id);

        if (condition) {
            for (const column of grid.columns) {
                this.prepare_filtering_expression(filteringTree, column.field, term,
                    condition, ignoreCase || column.filteringIgnoreCase);
            }
        }

        grid.filteringExpressionsTree = filteringTree;
    }

    public clear_filter(id, fieldName) {
        if (fieldName) {
            const column = this.get_column_by_name(id, fieldName);
            if (!column) {
                return;
            }
        }

        const grid = this.get(id);
        const filteringState = grid.filteringExpressionsTree;
        const index = filteringState.findIndex(fieldName);

        if (index > -1) {
            filteringState.filteringOperands.splice(index, 1);
            this.remove_summary(id, fieldName);
        } else {
            filteringState.filteringOperands = [];
            this.remove_summary(id);
        }

        grid.filteringExpressionsTree = filteringState;
        grid.filteredData = null;
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

    protected prepare_filtering_expression(filteringState: IFilteringExpressionsTree, fieldName: string, searchVal,
        conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree, ignoreCase: boolean) {

        let newExpressionsTree;
        const oldExpressionsTreeIndex = filteringState.findIndex(fieldName);
        const expressionsTree = conditionOrExpressionsTree instanceof FilteringExpressionsTree ?
            conditionOrExpressionsTree as IFilteringExpressionsTree : null;
        const condition = conditionOrExpressionsTree instanceof FilteringExpressionsTree ?
            null : conditionOrExpressionsTree as IFilteringOperation;
        const newExpression: IFilteringExpression = { fieldName, searchVal, condition, ignoreCase };

        if (oldExpressionsTreeIndex === -1) {
            // no expressions tree found for this field
            if (expressionsTree) {
                filteringState.filteringOperands.push(expressionsTree);
            } else if (condition) {
                // create expressions tree for this field and add the new expression to it
                newExpressionsTree = new FilteringExpressionsTree(filteringState.operator, fieldName);
                newExpressionsTree.filteringOperands.push(newExpression);
                filteringState.filteringOperands.push(newExpressionsTree);
            }
        }
    }

    protected prepare_sorting_expression(states, expression: ISortingExpression) {
        if (expression.dir === SortingDirection.None) {
            states.forEach(state => {
                state.splice(state.findIndex((expr) => expr.fieldName === expression.fieldName), 1);
            });
            return;
        }

        states.forEach(state => {
            const e = state.find((expr) => expr.fieldName === expression.fieldName);
            if (!e) {
                state.push(expression);
            } else {
                Object.assign(e, expression);
            }
        });
    }

    protected abstract remove_grouping_expression(id: string, fieldName: string);
    public abstract refreshSearch(id: string, updateHighlight?: boolean);

}

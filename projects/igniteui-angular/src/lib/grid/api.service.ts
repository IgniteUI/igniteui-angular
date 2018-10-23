import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { cloneArray } from '../core/utils';
import { DataUtil } from '../data-operations/data-util';
import { IFilteringExpression, FilteringLogic } from '../data-operations/filtering-expression.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IGridEditEventArgs, IgxGridComponent } from './grid.component';
import { IgxGridRowComponent } from './row.component';
import { IFilteringOperation } from '../data-operations/filtering-condition';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { Transaction, TransactionType } from '../services/index';
/**
 *@hidden
 */
@Injectable()
export class IgxGridAPIService {

    public change: Subject<any> = new Subject<any>();
    protected state: Map<string, IgxGridComponent> = new Map<string, IgxGridComponent>();
    protected editCellState: Map<string, any> = new Map<string, any>();
    protected editRowState: Map<string, { rowID: any, rowIndex: number }> = new Map();
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, any[]>>();

    public register(grid: IgxGridComponent) {
        this.state.set(grid.id, grid);
    }

    public unsubscribe(grid: IgxGridComponent) {
        this.state.delete(grid.id);
    }

    public get(id: string): IgxGridComponent {
        return this.state.get(id);
    }

    public unset(id: string) {
        this.state.delete(id);
        this.summaryCacheMap.delete(id);
        this.editCellState.delete(id);
        this.editRowState.delete(id);
    }

    public get_column_by_name(id: string, name: string): IgxColumnComponent {
        return this.get(id).columnList.find((col) => col.field === name);
    }

    public set_summary_by_column_name(id: string, name: string) {
        if (!this.summaryCacheMap.get(id)) {
            this.summaryCacheMap.set(id, new Map<string, any[]>());
        }
        const column = this.get_column_by_name(id, name);
        const grid = this.get(id);
        let data = grid.filteredData;
        if (!data) {
            if (grid.transactions.enabled) {
                data = DataUtil.mergeTransactions(
                    cloneArray(grid.data, true),
                    grid.transactions.aggregatedState(true),
                    grid.primaryKey
                );
            } else {
                data = grid.data;
            }
        }
        if (data) {
            const columnValues = data.map((rec) => rec[column.field]);
            this.calculateSummaries(id, column, columnValues);
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

    public set_cell_inEditMode(gridId: string, cell) {
        const grid = this.get(gridId);
        if (grid.rowEditable) {
            const currentEditRow = this.get_row_inEditMode(gridId);
            if (currentEditRow && currentEditRow.rowID !== cell.cellID.rowID) {
                grid.endRowEdit(true);
                grid.startRowEdit(cell.row);
            }
            if (!currentEditRow) {
                grid.startRowEdit(cell.row);
            }
            const rowState = { rowID: cell.cellID.rowID, rowIndex: cell.cellID.rowIndex };
            this.set_row_inEditMode(gridId, rowState);
        }

        if (!this.get_cell_inEditMode(gridId)) {
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
                const grid = this.get(gridId);
                grid.endRowEdit(true);
                this.editCellState.delete(gridId);
            }
        }

        this.get(gridId).refreshSearch();
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
            return this.get(id).dataRowList.find((row) => row.rowData[primaryKey] === rowSelector);
        } else {
            return this.get(id).dataRowList.find((row) => row.rowData === rowSelector);
        }
    }

    public get_row_by_index(id: string, rowIndex: number): IgxGridRowComponent {
        return this.get(id).rowList.find((row) => row.index === rowIndex);
    }

    public get_row_inEditMode(gridId) {
        const editRow = this.editRowState.get(gridId);
        return editRow ? editRow : null;

    }

    public set_row_inEditMode(gridId, row: { rowID: any, rowIndex: number }) {
        if (!row) {
            this.editRowState.delete(gridId);
        } else {
            this.editRowState.set(gridId, row);
        }
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

    public submit_value(gridId, detectChanges = true) {
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
            if (detectChanges) {
                this.get(gridId).cdr.detectChanges();
            }
        }
    }

    //  TODO: refactor update_cell. Maybe separate logic in two methods - one with transaction
    //  and one without transaction
    public update_cell(id: string, rowID, columnID, editValue) {
        const grid = this.get(id);
        const isRowSelected = grid.selection.is_item_selected(id, rowID);
        const editableCell = this.get_cell_inEditMode(id);
        const column = grid.columnList.toArray()[columnID];
        const cellObj = (editableCell && editableCell.cellID.rowID === rowID && editableCell.cellID.columnID === columnID) ?
            editableCell.cell : grid.columnList.toArray()[columnID].cells.find((cell) => cell.cellID.rowID === rowID);
        let rowIndex = grid.primaryKey ? grid.data.map((record) => record[grid.primaryKey]).indexOf(rowID) : grid.data.indexOf(rowID);
        let oldValue: any;
        let rowData: any;
        if (rowIndex !== -1) {
            oldValue = grid.data[rowIndex][column.field];
            rowData = grid.data[rowIndex];
        }

        //  if we have transactions and add row was edited look for old value and row data in added rows
        if (rowIndex < 0 && grid.transactions.enabled) {
            const dataWithTransactions = grid.dataWithAddedInTransactionRows;
            rowIndex = grid.primaryKey ?
            dataWithTransactions.map((record) => record[grid.primaryKey]).indexOf(rowID) :
            dataWithTransactions.indexOf(rowID);
            if (rowIndex !== -1) {
                oldValue = dataWithTransactions[rowIndex][column.field];
                rowData = dataWithTransactions[rowIndex];
            }
        }

        if (oldValue !== undefined && rowData !== undefined) {
            const args: IGridEditEventArgs = {
                row: cellObj ? cellObj.row : null, cell: cellObj,
                currentValue: oldValue,
                newValue: editValue
            };
            grid.onEditDone.emit(args);

            //  if we are editing the cell for second or next time, get the old value from transaction
            const oldValueInTransaction = grid.transactions.getAggregatedValue(rowID, true);
            if (oldValueInTransaction) {
                oldValue = oldValueInTransaction[column.field];
            }

            //  if edit (new) value is same as old value do nothing here
            if (oldValue !== undefined && oldValue === args.newValue) { return; }

            const transaction: Transaction = { id: rowID, type: TransactionType.UPDATE, newValue: { [column.field]: args.newValue } };
            if (grid.transactions.enabled) {
                grid.transactions.add(transaction, rowData);
            } else {
                grid.data[rowIndex][column.field] = args.newValue;
            }
            if (grid.primaryKey === column.field && isRowSelected) {
                grid.selection.deselect_item(id, rowID);
                grid.selection.select_item(id, args.newValue);
            }
            if (!grid.rowEditable || !grid.rowInEditMode || grid.rowInEditMode.rowID !== rowID) {
                (grid as any)._pipeTrigger++;
            }
        }
    }

    public update_row(value: any, id: string, rowID: any): void {
        const grid = this.get(id);
        const isRowSelected = grid.selection.is_item_selected(id, rowID);
        const index = grid.primaryKey ? grid.data.map((record) => record[grid.primaryKey]).indexOf(rowID) :
            grid.data.indexOf(rowID);
        if (index !== -1) {
            const args: IGridEditEventArgs = {
                row: this.get_row_by_key(id, rowID),
                cell: null,
                currentValue: this.get(id).data[index],
                newValue: value
            };
            grid.onEditDone.emit(args);
            if (grid.transactions.enabled) {
                grid.transactions.add({id: rowID, newValue: args.newValue, type: TransactionType.UPDATE}, args.currentValue);
            } else {
                grid.data[index] = args.newValue;
            }
            if (isRowSelected) {
                grid.selection.deselect_item(id, rowID);
                const newRowID = (grid.primaryKey) ? args.newValue[grid.primaryKey] : args.newValue;
                grid.selection.select_item(id, newRowID);
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

    public groupBy(id: string, fieldName: string, dir: SortingDirection, ignoreCase: boolean): void {
        const groupingState = cloneArray(this.get(id).groupingExpressions);
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        this.prepare_sorting_expression([sortingState, groupingState], { fieldName, dir, ignoreCase });
        this.get(id).groupingExpressions = groupingState;
        this.arrange_sorting_expressions(id);
    }

    public groupBy_multiple(id: string, expressions: ISortingExpression[]): void {
        const groupingState = cloneArray(this.get(id).groupingExpressions);
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        for (const each of expressions) {
            this.prepare_sorting_expression([sortingState, groupingState], each);
        }

        this.get(id).groupingExpressions = groupingState;
        this.arrange_sorting_expressions(id);
    }

    public clear_groupby(id: string, name?: string) {
        const groupingState = cloneArray(this.get(id).groupingExpressions);
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        if (name) {
            // clear specific expression
            const grExprIndex = groupingState.findIndex((exp) => exp.fieldName === name);
            const sortExprIndex = sortingState.findIndex((exp) => exp.fieldName === name);
            const grpExpandState = this.get(id).groupingExpansionState;
            if (grExprIndex > -1) {
                groupingState.splice(grExprIndex, 1);
            }
            if (sortExprIndex > -1) {
                sortingState.splice(sortExprIndex, 1);
            }
            this.get(id).groupingExpressions = groupingState;
            this.get(id).sortingExpressions = sortingState;

            /* remove expansion states related to the cleared group
            and all with deeper hierarchy than the cleared group */
            this.get(id).groupingExpansionState = grpExpandState
                .filter((val) => {
                    return val.hierarchy && val.hierarchy.length <= grExprIndex;
                });
        } else {
            // clear all
            this.get(id).groupingExpressions = [];
            this.get(id).groupingExpansionState = [];
            for (const grExpr of groupingState) {
                const sortExprIndex = sortingState.findIndex((exp) => exp.fieldName === grExpr.fieldName);
                if (sortExprIndex > -1) {
                    sortingState.splice(sortExprIndex, 1);
                }
            }
            this.get(id).sortingExpressions = sortingState;
        }
    }

    public groupBy_get_expanded_for_group(id: string, groupRow: IGroupByRecord): IGroupByExpandState {
        const grState = this.get(id).groupingExpansionState;
        const hierarchy = DataUtil.getHierarchy(groupRow);
        return grState.find((state) =>
            DataUtil.isHierarchyMatch(state.hierarchy || [{ fieldName: groupRow.expression.fieldName, value: groupRow.value }], hierarchy));
    }

    public groupBy_toggle_group(id: string, groupRow: IGroupByRecord) {
        const grid = this.get(id);
        const expansionState = grid.groupingExpansionState;

        const state: IGroupByExpandState = this.groupBy_get_expanded_for_group(id, groupRow);
        if (state) {
            state.expanded = !state.expanded;
        } else {
            expansionState.push({
                expanded: !grid.groupsExpanded,
                hierarchy: DataUtil.getHierarchy(groupRow)
            });
        }
        this.get(id).groupingExpansionState = expansionState;
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

        grid.filteredData = null;
        grid.filteringExpressionsTree = filteringState;
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

    public arrange_sorting_expressions(id) {
        const groupingState = this.get(id).groupingExpressions;
        this.get(id).sortingExpressions.sort((a, b) => {
            const groupExprA = groupingState.find((expr) => expr.fieldName === a.fieldName);
            const groupExprB = groupingState.find((expr) => expr.fieldName === b.fieldName);
            if (groupExprA && groupExprB) {
                return groupingState.indexOf(groupExprA) > groupingState.indexOf(groupExprB) ? 1 : -1;
            } else if (groupExprA) {
                return -1;
            } else if (groupExprB) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    protected remove_grouping_expression(id, fieldName) {
        const groupingExpressions = this.get(id).groupingExpressions;
        const index = groupingExpressions.findIndex((expr) => expr.fieldName === fieldName);
        if (index !== -1) {
            groupingExpressions.splice(index, 1);
        }
    }
}

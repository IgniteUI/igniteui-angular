import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { cloneArray, isEqual, mergeObjects } from '../core/utils';
import { DataUtil, DataType } from '../data-operations/data-util';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IGridEditEventArgs, IgxGridBaseComponent, IGridDataBindable } from './grid-base.component';
import { IgxRowComponent } from './row.component';
import { IFilteringOperation } from '../data-operations/filtering-condition';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { Transaction, TransactionType, State } from '../services/index';
import { ISortingStrategy } from '../data-operations/sorting-strategy';
import { IgxCell, IgxRow } from '../core/grid-selection';
/**
 *@hidden
 */
@Injectable()
export class GridBaseAPIService <T extends IgxGridBaseComponent & IGridDataBindable> {

    grid: T;
    protected editCellState: Map<string, any> = new Map<string, any>();
    protected editRowState: Map<string, { rowID: any, rowIndex: number }> = new Map();
    protected destroyMap: Map<string, Subject<boolean>> = new Map<string, Subject<boolean>>();

    public get_column_by_name(name: string): IgxColumnComponent {
        return this.grid.columnList.find((col) => col.field === name);
    }

    public get_summary_data() {
        const grid = this.grid;
        let data = grid.filteredData;
        if (!data) {
            if (grid.transactions.enabled) {
                data = DataUtil.mergeTransactions(
                    cloneArray(grid.data),
                    grid.transactions.getAggregatedChanges(true),
                    grid.primaryKey
                );
                const deletedRows = grid.transactions.getTransactionLog().filter(t => t.type === TransactionType.DELETE).map(t => t.id);
                deletedRows.forEach(rowID => {
                    const tempData = grid.primaryKey ? data.map(rec => rec[grid.primaryKey]) : data;
                    const index = tempData.indexOf(rowID);
                    if (index !== -1) {
                       data.splice(index, 1);
                    }
                });
            } else {
                data = grid.data;
            }
        }
        return data;
    }

    // TODO: Refactor
    // public set_cell_inEditMode(gridId: string, cell: IgxGridCellComponent) {
    //     const grid = this.grid;
    //     const args: IGridEditEventArgs = {
    //         rowID: cell.cellID.rowID,
    //         cellID: cell.cellID,
    //         oldValue: cell.value,
    //         cancel: false
    //     };
    //     grid.onCellEditEnter.emit(args);
    //     if (args.cancel) {
    //         return;
    //     }
    //     if (grid.rowEditable) {
    //         const currentEditRow = this.get_edit_row_state(gridId);
    //         if (currentEditRow && currentEditRow.rowID !== cell.cellID.rowID) {
    //             grid.endEdit(true);
    //             grid.startRowEdit(cell.cellID);
    //         }
    //         if (!currentEditRow) {
    //             grid.startRowEdit(cell.cellID);
    //         }
    //     }

    //     if (!this.get_cell_inEditMode(gridId)) {
    //         const cellCopy = Object.assign({}, cell);
    //         cellCopy.row = Object.assign({}, cell.row);
    //     this.editCellState.set(gridId, { cellID: cell.cellID, cell: cellCopy });
    //     }
    // }

    // TODO: Refactor
    public escape_editMode() {
        this.grid.crudService.end();
        // const editableCell = this.get_cell_inEditMode(gridId);
        // if (editableCell) {
        //     if (cellId) {
        //         if (cellId.rowID === editableCell.cellID.rowID &&
        //             cellId.columnID === editableCell.cellID.columnID) {
        //             this.editCellState.delete(gridId);
        //         }
        //     } else {
        //         this.editCellState.delete(gridId);
        //     }
        // }

        this.grid.refreshSearch();
    }

    // TODO: Refactor
    public get_cell_inEditMode(): IgxCell {
        // const editCellId = this.editCellState.get(gridId);
        // if (editCellId) {
        //     return editCellId;
        // } else {
        //     return null;
        // }
        return this.grid.crudService.cell;
    }

    public get_row_index_in_data(rowID: any): number {
        const grid = this.grid as IgxGridBaseComponent;
        if (!grid) {
            return -1;
        }
        const data = this.get_all_data(grid.transactions.enabled);
        return grid.primaryKey ? data.findIndex(record => record[grid.primaryKey] === rowID) : data.indexOf(rowID);
    }

    public get_row_by_key(id: string, rowSelector: any): IgxRowComponent<IgxGridBaseComponent & IGridDataBindable> {
        const primaryKey = this.grid.primaryKey;
        if (primaryKey !== undefined && primaryKey !== null) {
            return this.grid.dataRowList.find((row) => row.rowData[primaryKey] === rowSelector);
        } else {
            return this.grid.dataRowList.find((row) => row.rowData === rowSelector);
        }
    }

    public get_row_by_index(id: string, rowIndex: number): IgxRowComponent<IgxGridBaseComponent & IGridDataBindable> {
        return this.grid.rowList.find((row) => row.index === rowIndex);
    }

    public get_edit_row_state(gridId): {
        rowID: any,
        rowIndex: number
    } {
        const editRow = this.editRowState.get(gridId);
        return editRow ? editRow : null;

    }

    public set_edit_row_state(gridId, row: { rowID: any, rowIndex: number }) {
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

    public submit_value() {
        const editableCell = this.get_cell_inEditMode();
        if (editableCell) {
            // const gridEditState = this.create_grid_edit_args(gridId, editableCell.id.rowID,
            //     editableCell.id.columnID, editableCell.id.editValue);
            // if (!editableCell.cell.column.inlineEditorTemplate && editableCell.cell.column.dataType === 'number') {
            //     if (!editableCell.cell.editValue) {
            //         gridEditState.args.newValue = 0;
            //         this.update_cell(gridId, editableCell.cellID.rowID, editableCell.cellID.columnID, 0, gridEditState);
            //     } else {
            //         const val = parseFloat(editableCell.cell.editValue);
            //         if (!isNaN(val) || isFinite(val)) {
            //             gridEditState.args.newValue = val;
            //             this.update_cell(gridId, editableCell.cellID.rowID, editableCell.cellID.columnID, val, gridEditState);
            //         }
            //     }
            // } else {
            //     this.update_cell(gridId, editableCell.cellID.rowID, editableCell.cellID.columnID,
            //         editableCell.cell.editValue, gridEditState);
            // }
            const gridEditState = this.update_cell(editableCell);
            if (gridEditState.args.cancel) {
                return;
            }
            this.escape_editMode();
        }
    }

    public build_edit_args(cell: IgxCell) {
        const data = this.get_all_data(this.grid.transactions.enabled);
        const isRowSelected = this.grid.selection.is_item_selected(this.grid.id, cell.id.rowID);
        let rowIndex = this.get_row_index_in_data(cell.id.rowID);
        let rowData;

        if (rowIndex > -1) {
            cell.value = data[rowIndex][cell.column.field];
            rowData = data[rowIndex];
        }

        if (rowIndex < 0 && this.grid.transactions.enabled) {
            const transData = this.grid.dataWithAddedInTransactionRows;
            rowIndex = this.grid.primaryKey ?
                transData.map(record => record[this.grid.primaryKey]).indexOf(cell.id.rowID) :
                transData.indexOf(cell.id.rowID);
            if (rowIndex > -1) {
                cell.value = transData[rowIndex][cell.column.field];
                rowData = transData[rowIndex];
            }
        }
        return { args: cell.createEditEventArgs(), isRowSelected, rowData};
    }

    // TODO: Refactor
    // public create_grid_edit_args(id: string, rowID, columnID, editValue): {
    //     args: IGridEditEventArgs,
    //     isRowSelected: boolean,
    //     rowData: any
    // } {
    //     const grid = this.grid;
    //     const data = this.get_all_data(grid.transactions.enabled);
    //     const isRowSelected = grid.selection.is_item_selected(id, rowID);
    //     const editableCell = this.get_cell_inEditMode();
    //     const column = grid.columnList.toArray()[columnID];
    //     columnID = columnID !== undefined && columnID !== null ? columnID : null;
    //     let cellObj;
    //     if (columnID !== null) {
    //         if ((editableCell && editableCell.id.rowID === rowID && editableCell.id.columnID === columnID)) {
    //             cellObj = editableCell;
    //         } else {
    //             cellObj = grid.columnList.toArray()[columnID].cells.find((cell) => cell.cellID.rowID === rowID);
    //         }
    //     }
    //     let rowIndex = this.get_row_index_in_data(rowID);
    //     let oldValue: any;
    //     let rowData: any;
    //     if (rowIndex !== -1) {
    //         oldValue = columnID !== null ? data[rowIndex][column.field] : null;
    //         rowData = data[rowIndex];
    //     }

    //     //  if we have transactions and add row was edited look for old value and row data in added rows
    //     if (rowIndex < 0 && grid.transactions.enabled) {
    //         const dataWithTransactions = grid.dataWithAddedInTransactionRows;
    //         rowIndex = grid.primaryKey ?
    //             dataWithTransactions.map((record) => record[grid.primaryKey]).indexOf(rowID) :
    //             dataWithTransactions.indexOf(rowID);
    //         if (rowIndex !== -1) {
    //             //  Check if below change will work on added rows with transactions
    //             // oldValue = this.get_all_data(id, true)[rowIndex][column.field];
    //             // rowData = this.get_all_data(id, true)[rowIndex];
    //             oldValue = columnID !== null ? dataWithTransactions[rowIndex][column.field] : null;
    //             rowData = dataWithTransactions[rowIndex];
    //         }
    //     }
    //     // Cell edit event args
    //     const args = {
    //         rowID,
    //         oldValue: oldValue,
    //         newValue: editValue,
    //         cancel: false
    //     };
    //     if (cellObj) {
    //         Object.assign(args, {
    //             cellID: cellObj.cellID
    //         });
    //     }
    //     return {
    //         args,
    //         isRowSelected,
    //         // Row edit event argument
    //         rowData
    //     };
    // }

    //  TODO: refactor update_cell. Maybe separate logic in two methods - one with transaction
    //  and one without transaction
    // public update_cell(id: string, rowID, columnID, editValue, gridEditState?: {
    //     args: IGridEditEventArgs,
    //     isRowSelected: boolean,
    //     rowData: any
    // }): void {
    //     const grid = this.grid;
    //     // const data = this.get_all_data(id, grid.transactions.enabled);
    //     const currentGridEditState = gridEditState || this.create_grid_edit_args(id, rowID, columnID, editValue);
    //     const emittedArgs = currentGridEditState.args;
    //     const column = grid.columnList.toArray()[columnID];
    //     const rowIndex = this.get_row_index_in_data(rowID);

    //     if (emittedArgs.oldValue !== undefined && currentGridEditState.rowData !== undefined) {
    //         grid.onCellEdit.emit(emittedArgs);
    //         if (emittedArgs.cancel) {
    //             return;
    //         }
    //         //  if we are editing the cell for second or next time, get the old value from transaction
    //         const oldValueInTransaction = grid.transactions.getAggregatedValue(rowID, true);
    //         if (oldValueInTransaction) {
    //             emittedArgs.oldValue = oldValueInTransaction[column.field];
    //         }

    //         //  if edit (new) value is same as old value do nothing here
    //         if (emittedArgs.oldValue !== undefined
    //             && isEqual(emittedArgs.oldValue, emittedArgs.newValue)) { return; }
    //         const rowValue = this.get_all_data(grid.transactions.enabled)[rowIndex];
    //         this.updateData(grid, rowID, rowValue, currentGridEditState.rowData, { [column.field]: emittedArgs.newValue });
    //         if (grid.primaryKey === column.field) {
    //             if (currentGridEditState.isRowSelected) {
    //                 grid.selection.deselect_item(id, rowID);
    //                 grid.selection.select_item(id, emittedArgs.newValue);
    //             }
    //             if (grid.hasSummarizedColumns) {
    //                 grid.summaryService.removeSummaries(rowID);
    //             }
    //         }
    //         if (!grid.rowEditable || !grid.rowInEditMode || grid.rowInEditMode.rowID !== rowID || !grid.transactions.enabled) {
    //             grid.summaryService.clearSummaryCache(emittedArgs);
    //             (grid as any)._pipeTrigger++;
    //         }
    //     }
    // }

    update_cell(cell: IgxCell) {
        const index = this.get_row_index_in_data(cell.id.rowID);
        const state = this.build_edit_args(cell);

        this.grid.onCellEdit.emit(state.args);
        if (state.args.cancel) {
            return state;
        }
        const transactionValue = this.grid.transactions.getAggregatedValue(cell.id.rowID, true);
        if (transactionValue) {
            state.args.oldValue = transactionValue[cell.column.field];
        }
        if (isEqual(cell.value, cell.editValue)) { return state; }
        const rowValue = this.get_all_data(this.grid.transactions.enabled)[index];
        this.updateData(this.grid, cell.id.rowID, rowValue, state.rowData, { [cell.column.field ]: state.args.newValue });
        if (this.grid.primaryKey === cell.column.field) {
            if (state.isRowSelected) {
                this.grid.selection.deselect_item(this.grid.id, cell.id.rowID);
                this.grid.selection.select_item(this.grid.id, state.args.newValue);
            }
            if (this.grid.hasSummarizedColumns) {
                this.grid.summaryService.removeSummaries(cell.id.rowID);
            }
        }
        if (!this.grid.rowEditable || !this.grid.crudService.row ||
                this.grid.crudService.row.id !== cell.id.rowID || !this.grid.transactions.enabled) {
            this.grid.summaryService.clearSummaryCache(state.args);
            (this.grid as any)._pipeTrigger++;
        }
        return state;

    }

    /**
     * Updates related row of provided grid's data source with provided new row value
     * @param grid Grid to update data for
     * @param rowID ID of the row to update
     * @param rowValueInDataSource Initial value of the row as it is in data source
     * @param rowCurrentValue Current value of the row as it is with applied previous transactions
     * @param rowNewValue New value of the row
     */
    protected updateData(grid, rowID, rowValueInDataSource: any, rowCurrentValue: any, rowNewValue: {[x: string]: any}) {
        if (grid.transactions.enabled) {
            const transaction: Transaction = {
                id: rowID,
                type: TransactionType.UPDATE,
                newValue: rowNewValue
            };
            grid.transactions.add(transaction, rowCurrentValue);
        } else {
            mergeObjects(rowValueInDataSource, rowNewValue);
        }
    }

    update_row(value: any, row: IgxRow): void {
        const index = this.get_row_index_in_data(row.id);
        if (index < 0) {
            return;
        }
        const data = this.get_all_data(this.grid.transactions.enabled);
        const rowInEditMode = this.grid.crudService.row;
        const enabledSummaries = this.grid.hasSummarizedColumns;
        let _value = Object.assign({}, data[index]);

        if (this.grid.transactions.enabled) {
            const lastValue = this.grid.transactions.getState(row.id)
                ? Object.assign({}, this.grid.transactions.getState(row.id).value) : null;
            _value = lastValue ? Object.assign(_value, lastValue) : _value;
        } else if (rowInEditMode && rowInEditMode.id === row.id) {
            _value = Object.assign(_value, rowInEditMode.data);
        }

        if (rowInEditMode) {
            this.grid.transactions.endPending(false);
        }
        if (enabledSummaries) {
            this.grid.summaryService.removeSummaries(row.id);
        }
        this.updateData(this.grid, row.id, data[index], _value, value);
        (this.grid as any)._pipeTrigger++;
    }

    // TODO: Refactor
    // public update_row(value: any, id: string, rowID: any, gridState?: {
    //     args: IGridEditEventArgs,
    //     isRowSelected: boolean,
    //     rowData: any
    // }): void {
    //     const grid = this.grid;
    //     // if (this.grid.crudService.inEditMode) {
    //     //     this.grid.crudService.commit();
    //     // }
    //     const data = this.get_all_data(grid.transactions.enabled);
    //     // const currentGridState = gridState ? gridState : this.create_grid_edit_args(id, rowID, null, value);
    //     const currentGridState = this.build_edit_args(this.grid.crudService.cell);
    //     const emitArgs = currentGridState.args;
    //     const index = this.get_row_index_in_data(rowID);
    //     const currentRowInEditMode = this.get_edit_row_state(id);
    //     let oldValue = Object.assign({}, data[index]);
    //     const hasSummarizedColumns = grid.hasSummarizedColumns;
    //     if (grid.currentRowState && grid.currentRowState[grid.primaryKey] === rowID
    //         || currentRowInEditMode && currentRowInEditMode.rowID === rowID) {
    //         oldValue = Object.assign(oldValue, grid.currentRowState);
    //     } else if (grid.transactions.enabled) {
    //         // If transactions are enabled, old value == last commited value (as it's not applied in data yet)
    //         const lastCommitedValue = // Last commited value (w/o pending)
    //             grid.transactions.getState(rowID) ? Object.assign({}, grid.transactions.getState(rowID).value) : null;
    //         oldValue = lastCommitedValue ? Object.assign(oldValue, lastCommitedValue) : oldValue;
    //     }
    //     Object.assign(emitArgs, { oldValue, rowID});
    //     if (index !== -1) {
    //         grid.onRowEdit.emit(emitArgs);
    //         if (emitArgs.cancel) {
    //             return;
    //         }
    //         if (currentRowInEditMode) {
    //             grid.transactions.endPending(false);
    //         }
    //         if (hasSummarizedColumns) {
    //             grid.summaryService.removeSummaries(emitArgs.rowID);
    //         }
    //         this.updateData(grid, rowID, data[index], emitArgs.oldValue, emitArgs.newValue);
    //         if (currentGridState.isRowSelected) {
    //             grid.selection.deselect_item(id, rowID);
    //             const newRowID = (grid.primaryKey) ? emitArgs.newValue[grid.primaryKey] : emitArgs.newValue;
    //             grid.selection.select_item(id, newRowID);
    //         }
    //         if (hasSummarizedColumns) {
    //             grid.summaryService.removeSummaries(rowID);
    //         }
    //         (grid as any)._pipeTrigger++;
    //     }
    // }

    protected update_row_in_array(id: string, value: any, rowID: any, index: number) {
        const grid = this.grid;
        grid.data[index] = value;
    }

    public sort(id: string, expression: ISortingExpression): void {
        if (expression.dir === SortingDirection.None) {
            this.remove_grouping_expression(id, expression.fieldName);
        }
        const sortingState = cloneArray(this.grid.sortingExpressions);
        this.prepare_sorting_expression([sortingState], expression);
        this.grid.sortingExpressions = sortingState;
    }

    public sort_multiple(id: string, expressions: ISortingExpression[]): void {
        const sortingState = cloneArray(this.grid.sortingExpressions);

        for (const each of expressions) {
            if (each.dir === SortingDirection.None) {
                this.remove_grouping_expression(id, each.fieldName);
            }
            this.prepare_sorting_expression([sortingState], each);
        }

        this.grid.sortingExpressions = sortingState;
    }

    public filter(id: string, fieldName: string, term, conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase: boolean) {
        const grid = this.grid;
        const filteringTree = grid.filteringExpressionsTree;
        grid.endEdit(false);

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
        const grid = this.grid;
        const filteringTree = grid.filteringExpressionsTree;
        if (grid.paging) {
            grid.page = 0;
        }

        filteringTree.filteringOperands = [];
        if (condition) {
            for (const column of grid.columns) {
                this.prepare_filtering_expression(filteringTree, column.field, term,
                    condition, ignoreCase || column.filteringIgnoreCase);
            }
        }

        grid.filteringExpressionsTree = filteringTree;
    }

    public clear_filter(fieldName: string) {
        if (fieldName) {
            const column = this.get_column_by_name(fieldName);
            if (!column) {
                return;
            }
        }

        const grid = this.grid;
        const filteringState = grid.filteringExpressionsTree;
        const index = filteringState.findIndex(fieldName);

        if (index > -1) {
            filteringState.filteringOperands.splice(index, 1);
        } else {
            filteringState.filteringOperands = [];
        }

        grid.filteredData = null;
        grid.filteringExpressionsTree = filteringState;
    }

    public clear_sort(fieldName: string) {
        const sortingState = this.grid.sortingExpressions;
        const index = sortingState.findIndex((expr) => expr.fieldName === fieldName);
        if (index > -1) {
            sortingState.splice(index, 1);
            this.grid.sortingExpressions = sortingState;
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

    protected prepare_sorting_expression(stateCollections: Array<Array<any>>, expression: ISortingExpression) {
        if (expression.dir === SortingDirection.None) {
            stateCollections.forEach(state => {
                state.splice(state.findIndex((expr) => expr.fieldName === expression.fieldName), 1);
            });
            return;
        }

        /**
         * We need to make sure the states in each collection with same fields point to the same object reference.
         * If the different state collections provided have different sizes we need to get the largest one.
         * That way we can get the state reference from the largest one that has the same fieldName as the expression to prepare.
         */
        let maxCollection = stateCollections[0];
        for (let i = 1; i < stateCollections.length; i++) {
            if (maxCollection.length < stateCollections[i].length) {
                maxCollection = stateCollections[i];
            }
        }
        const maxExpr = maxCollection.find((expr) => expr.fieldName === expression.fieldName);

        stateCollections.forEach(collection => {
            const myExpr = collection.find((expr) => expr.fieldName === expression.fieldName);
            if (!myExpr && !maxExpr) {
                // Expression with this fieldName is missing from the current and the max collection.
                collection.push(expression);
            } else if (!myExpr && maxExpr) {
                // Expression with this fieldName is missing from the current and but the max collection has.
                collection.push(maxExpr);
                Object.assign(maxExpr, expression);
            } else {
                // The current collection has the expression so just update it.
                Object.assign(myExpr, expression);
            }
        });
    }

    protected remove_grouping_expression(id, fieldName) {
        }

    public should_apply_number_style(column: IgxColumnComponent): boolean {
        return column.dataType === DataType.Number;
    }

    public get_all_data(includeTransactions = false): any[] {
        const grid = this.grid;
        const data = includeTransactions ? grid.dataWithAddedInTransactionRows : grid.data;
        return data ? data : [];
    }

    protected getSortStrategyPerColumn(id: string, fieldName: string) {
        return this.get_column_by_name(fieldName) ?
            this.get_column_by_name(fieldName).sortStrategy : undefined;
    }

    public addRowToData(gridID: string, rowData: any) {
        // Add row goes to transactions and if rowEditable is properly implemented, added rows will go to pending transactions
        // If there is a row in edit - > commit and close
        const grid = this.grid;
        if (grid.transactions.enabled) {
            const transactionId = grid.primaryKey ? rowData[grid.primaryKey] : rowData;
            const transaction: Transaction = { id: transactionId, type: TransactionType.ADD, newValue: rowData };
            grid.transactions.add(transaction);
        } else {
            grid.data.push(rowData);
        }
    }

    public deleteRowFromData(gridID: string, rowID: any, index: number) {
        //  if there is a row (index !== 0) delete it
        //  if there is a row in ADD or UPDATE state change it's state to DELETE
        const grid = this.grid;
        if (index !== -1) {
            if (grid.transactions.enabled) {
                const transaction: Transaction = { id: rowID, type: TransactionType.DELETE, newValue: null };
                grid.transactions.add(transaction, grid.data[index]);
            } else {
                grid.data.splice(index, 1);
            }
        } else {
            const state: State = grid.transactions.getState(rowID);
            grid.transactions.add({ id: rowID, type: TransactionType.DELETE, newValue: null }, state && state.recordRef);
        }
    }

    public deleteRowById(gridID: string, rowId: any) {
        let index: number;
        const grid = this.grid;
        const data = this.get_all_data();
        if (grid.primaryKey) {
            index = data.map((record) => record[grid.primaryKey]).indexOf(rowId);
        } else {
            index = data.indexOf(rowId);
        }
        const state: State = grid.transactions.getState(rowId);
        const hasRowInNonDeletedState = state && state.type !== TransactionType.DELETE;

        //  if there is a row (index !== -1) and the we have cell in edit mode on same row exit edit mode
        //  if there is no row (index === -1), but there is a row in ADD or UPDATE state do as above
        //  Otherwise just exit - there is nothing to delete
        if (index !== -1 || hasRowInNonDeletedState) {
            // Always exit edit when row is deleted
            grid.endEdit(true);
        } else {
            return;
        }

        //  TODO: should we emit this when cascadeOnDelete is true for each row?!?!
        grid.onRowDeleted.emit({ data: data[index] });

        //  first deselect row then delete it
        if (grid.rowSelectable && grid.selection.is_item_selected(grid.id, rowId)) {
            grid.deselectRows([rowId]);
        } else {
            grid.checkHeaderCheckboxStatus();
        }

        this.deleteRowFromData(gridID, rowId, index);
        (grid as any)._pipeTrigger++;
        grid.cdr.markForCheck();
        // Data needs to be recalculated if transactions are in place
        // If no transactions, `data` will be a reference to the grid getter, otherwise it will be stale
        const dataAfterDelete = grid.transactions.enabled ? grid.dataWithAddedInTransactionRows : data;
        grid.refreshSearch();
        if (dataAfterDelete.length % grid.perPage === 0 && dataAfterDelete.length / grid.perPage - 1 < grid.page && grid.page !== 0) {
            grid.page--;
        }
    }

    public get_row_id(id: string, rowData) {
        const grid = this.grid;
        return grid.primaryKey ? rowData[grid.primaryKey] : rowData;
    }

    public row_deleted_transaction(id: string, rowID: any): boolean {
        const grid = this.grid;
        if (!grid) {
            return false;
        }
        if (!grid.transactions.enabled) {
            return false;
        }
        const state = grid.transactions.getState(rowID);
        if (state) {
            return state.type === TransactionType.DELETE;
        }

        return false;
    }

    public atInexistingPage(id: string): Boolean {
        const grid = this.grid;
        return grid.data.length % grid.perPage === 0 && grid.isLastPage && grid.page !== 0;
    }
}

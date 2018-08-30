import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { cloneArray } from '../core/utils';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { IgxRowComponent } from './row.component';
import { IFilteringOperation, FilteringExpressionsTree, IFilteringExpressionsTree } from '../../public_api';
import { IGridEditEventArgs, IGridComponent } from './grid-interfaces';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';

/**
 *@hidden
 */
@Injectable()
export class IGridAPIService <T extends IGridComponent> {

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

    public get_row_by_key(id: string, rowSelector: any): IgxRowComponent<IGridComponent>  {
        const primaryKey = this.get(id).primaryKey;
        if (primaryKey !== undefined && primaryKey !== null) {
            return this.get(id).dataRowList.find((row) => row.rowData[primaryKey] === rowSelector);
        } else {
            return this.get(id).dataRowList.find((row) => row.rowData === rowSelector);
        }
    }

    public get_row_by_index(id: string, rowIndex: number): IgxRowComponent<IGridComponent> {
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

    public refreshSearch(id: string, updateActiveInfo?: boolean) {
        const grid = this.get(id);
        if (grid && grid.lastSearchInfo.searchText) {
            this.rebuildMatchCache(id);

            if (updateActiveInfo) {
                const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(id);
                grid.lastSearchInfo.matchInfoCache.forEach((match, i) => {
                    if (match.column === activeInfo.columnID &&
                        match.row === activeInfo.rowID &&
                        match.index === activeInfo.index) {
                            grid.lastSearchInfo.activeMatchIndex = i;
                    }
                });
            }

            return this.find(
                id,
                grid.lastSearchInfo.searchText,
                0,
                grid.lastSearchInfo.caseSensitive,
                grid.lastSearchInfo.exactMatch,
                false
            );
        } else {
            return 0;
        }
    }

    public find(id: string, text: string, increment: number, caseSensitive?: boolean, exactMatch?: boolean, scroll?: boolean) {
        const grid = this.get(id);
        if (!grid || !grid.rowList) {
            return 0;
        }

        const editModeCell = this.get_cell_inEditMode(id);
        if (editModeCell) {
            this.escape_editMode(id);
        }

        if (!text) {
            this.clearSearch(id);
            return 0;
        }

        const caseSensitiveResolved = caseSensitive ? true : false;
        const exactMatchResolved = exactMatch ? true : false;
        let rebuildCache = false;

        if (grid.lastSearchInfo.searchText !== text ||
            grid.lastSearchInfo.caseSensitive !== caseSensitiveResolved ||
            grid.lastSearchInfo.exactMatch !== exactMatchResolved) {
            grid.lastSearchInfo = {
                searchText: text,
                activeMatchIndex: 0,
                caseSensitive: caseSensitiveResolved,
                exactMatch: exactMatchResolved,
                matchInfoCache: []
            };

            rebuildCache = true;
        } else {
            grid.lastSearchInfo.activeMatchIndex += increment;
        }

        if (rebuildCache) {
            grid.dataRowList.forEach((row) => {
                row.cells.forEach((c) => {
                    c.highlightText(text, caseSensitiveResolved, exactMatchResolved);
                });
            });

            this.rebuildMatchCache(id);
        }

        if (grid.lastSearchInfo.activeMatchIndex >= grid.lastSearchInfo.matchInfoCache.length) {
            grid.lastSearchInfo.activeMatchIndex = 0;
        } else if (grid.lastSearchInfo.activeMatchIndex < 0) {
            grid.lastSearchInfo.activeMatchIndex = grid.lastSearchInfo.matchInfoCache.length - 1;
        }

        if (grid.lastSearchInfo.matchInfoCache.length) {
            const matchInfo = grid.lastSearchInfo.matchInfoCache[grid.lastSearchInfo.activeMatchIndex];

            IgxTextHighlightDirective.setActiveHighlight(id, {
                columnID: matchInfo.column,
                rowID: matchInfo.row,
                index: matchInfo.index,
            });

            if (scroll !== false) {
                this.scrollTo(id, matchInfo.row, matchInfo.column);
            }
        } else {
            IgxTextHighlightDirective.clearActiveHighlight(id);
        }

        return grid.lastSearchInfo.matchInfoCache.length;
    }

    public clearSearch(id: string) {
        this.get(id).lastSearchInfo = {
            searchText: '',
            caseSensitive: false,
            exactMatch: false,
            activeMatchIndex: 0,
            matchInfoCache: []
        };

        this.get(id).dataRowList.forEach((row) => {
            row.cells.forEach((c) => {
                c.clearHighlight();
            });
        });
    }

    protected scrollTo(id: string, row: any, column: any): void {
        const grid = this.get(id);
        const rowIndex = grid.filteredSortedData.indexOf(row);
        let columnIndex = this.get_column_by_name(id, column).visibleIndex;

        if (grid.paging) {
            grid.page = Math.floor(rowIndex / grid.perPage);
        }

        this.scrollDirective(id, grid.verticalScrollContainer, rowIndex);

        const scrollRow = grid.rowList.find(r => r.virtDirRow);
        const virtDir = scrollRow ? scrollRow.virtDirRow : null;

        if (grid.pinnedColumns.length) {
            if (columnIndex >= grid.pinnedColumns.length) {
                columnIndex -= grid.pinnedColumns.length;
                this.scrollDirective(id, virtDir, columnIndex);
            }
        } else {
            this.scrollDirective(id, virtDir, columnIndex);
        }
    }

    private scrollDirective(id: string, directive: IgxForOfDirective<any>, goal: number): void {
        if (!directive) {
            return;
        }
        const grid = this.get(id);
        const state = directive.state;
        const start = state.startIndex;
        const isColumn = directive.igxForScrollOrientation === 'horizontal';

        const size = directive.getItemCountInView();

        if (start >= goal) {
            // scroll so that goal is at beggining of visible chunk
            directive.scrollTo(goal);
        } else if (start + size <= goal) {
            // scroll so that goal is at end of visible chunk
            if (isColumn) {
                directive.getHorizontalScroll().scrollLeft =
                    directive.getColumnScrollLeft(goal) -
                    parseInt(directive.igxForContainerSize, 10) +
                    parseInt(grid.columns[goal].width, 10);
            } else {
                directive.scrollTo(goal - size + 1);
            }
        }
    }

    private rebuildMatchCache(id: string) {
        const grid = this.get(id);
        grid.lastSearchInfo.matchInfoCache = [];

        const caseSensitive = grid.lastSearchInfo.caseSensitive;
        const exactMatch = grid.lastSearchInfo.exactMatch;
        const searchText = caseSensitive ? grid.lastSearchInfo.searchText : grid.lastSearchInfo.searchText.toLowerCase();
        const data = grid.filteredSortedData;
        const columnItems = grid.visibleColumns.filter((c) => !c.columnGroup).sort((c1, c2) => c1.visibleIndex - c2.visibleIndex);

        data.forEach((dataRow) => {
            columnItems.forEach((c) => {
                const value = c.formatter ? c.formatter(dataRow[c.field]) : dataRow[c.field];
                if (value !== undefined && value !== null && c.searchable) {
                    let searchValue = caseSensitive ? String(value) : String(value).toLowerCase();

                    if (exactMatch) {
                        if (searchValue === searchText) {
                            grid.lastSearchInfo.matchInfoCache.push({
                                row: dataRow,
                                column: c.field,
                                index: 0,
                            });
                        }
                    } else {
                        let occurenceIndex = 0;
                        let searchIndex = searchValue.indexOf(searchText);

                        while (searchIndex !== -1) {
                            grid.lastSearchInfo.matchInfoCache.push({
                                row: dataRow,
                                column: c.field,
                                index: occurenceIndex++,
                            });

                            searchValue = searchValue.substring(searchIndex + searchText.length);
                            searchIndex = searchValue.indexOf(searchText);
                        }
                    }
                }
            });
        });
    }

    protected remove_grouping_expression(id: string, fieldName: string) {

    }
}

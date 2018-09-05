import { Injectable, IterableChangeRecord, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { DataType } from '../data-operations/data-util';

const DEFAULT_TARGET_RECORD_NUMBER = 10;
const MINIMUM_COLUMN_WIDTH = 136;

/**
 *@hidden
 */
@Injectable()
export class IGridAPIService <T extends IGridComponent> {

    public change: Subject<any> = new Subject<any>();
    protected state: Map<string, T> = new Map<string, T>();
    protected editCellState: Map<string, any> = new Map<string, any>();
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, any[]>>();
    protected destroyMap: Map<string, Subject<boolean>> = new Map<string, Subject<boolean>>();

    public onInit(grid: T) {
        this.register(grid);
        grid.columnListDiffer = grid.differs.find([]).create(null);
        grid.calcWidth = grid.width && grid.width.indexOf('%') === -1 ? parseInt(grid.width, 10) : 0;
        grid.calcHeight = 0;
        grid.calcRowCheckboxWidth = 0;

        const id = grid.id;
        grid.onRowAdded.pipe(takeUntil(this.getDestroy(id))).subscribe(() => grid.clearSummaryCache());
        grid.onRowDeleted.pipe(takeUntil(this.getDestroy(id))).subscribe(() => grid.clearSummaryCache());
        grid.onFilteringDone.pipe(takeUntil(this.getDestroy(id))).subscribe(() => grid.clearSummaryCache());
        grid.onEditDone.pipe(takeUntil(this.getDestroy(id))).subscribe((editCell) => grid.clearSummaryCache(editCell));
        grid.onColumnMoving.pipe(takeUntil(this.getDestroy(id))).subscribe((source) => {
            this.submit_value(grid.id);
        });
    }

    public onAfterContentInit(id: string) {
        const grid = this.get(id);
        if (grid.autoGenerate) {
            this.autogenerateColumns(id);
        }

        this.initColumns(id, grid.columnList, (col: IgxColumnComponent) => grid.onColumnInit.emit(col));
        grid.columnListDiffer.diff(grid.columnList);
        grid.clearSummaryCache();
        grid.summariesHeight = this.calcMaxSummaryHeight(id);
        this._derivePossibleHeight(id);
        grid.markForCheck();

        grid.columnList.changes
            .pipe(takeUntil(this.getDestroy(id)))
            .subscribe((change: QueryList<IgxColumnComponent>) => {
                const diff = grid.columnListDiffer.diff(change);
                if (diff) {

                    this.initColumns(id, grid.columnList);

                    diff.forEachAddedItem((record: IterableChangeRecord<IgxColumnComponent>) => {
                        grid.clearSummaryCache();
                        grid.reflow();
                        grid.onColumnInit.emit(record.item);
                    });

                    diff.forEachRemovedItem((record: IterableChangeRecord<IgxColumnComponent>) => {
                        // Recalculate Summaries
                        grid.clearSummaryCache();
                        grid.reflow();

                        // Clear Filtering
                        this.clear_filter(id, record.item.field);

                        // Clear Sorting
                        this.clear_sort(id, record.item.field);
                    });
                }
                grid.markForCheck();
            });
        const vertScrDC = grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement;
        vertScrDC.addEventListener('scroll', (evt) => { grid.scrollHandler(evt); });
    }

    public onAfterViewInit(id: string) {
        const grid = this.get(id);
        grid.zone.runOutsideAngular(() => {
            grid.document.defaultView.addEventListener('resize', this.resizeHandler);
        });
        this.derivePossibleWidth(id);
        this.initPinning(id);
        grid.reflow();
        grid.onDensityChanged.pipe(takeUntil(this.getDestroy(id))).subscribe(() => {
            requestAnimationFrame(() => {
                grid.summariesHeight = 0;
                grid.reflow();
            });
        });
        grid.ngAfterViewInitPassed = true;

        // In some rare cases we get the AfterViewInit before the grid is added to the DOM
        // and as a result we get 0 width and can't size ourselves properly.
        // In order to prevent that add a mutation observer that watches if we have been added.
        if (!grid.calcWidth && grid.width !== undefined) {
            const config = { childList: true, subtree: true };
            let observer: MutationObserver = null;
            const callback = (mutationsList) => {
                mutationsList.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        const addedNodes = new Array(...mutation.addedNodes);
                        addedNodes.forEach((node) => {
                            const added = this.checkIfGridIsAdded(node, id);
                            if (added) {
                                this.calculateGridWidth(id);
                                observer.disconnect();
                            }
                        });
                    }
                });
            };

            observer = new MutationObserver(callback);
            observer.observe(grid.document.body, config);
        }
    }

    public onDestroy(id: string) {
        const grid = this.get(id);
        grid.zone.runOutsideAngular(() => grid.document.defaultView.removeEventListener('resize', this.resizeHandler));
        this.getDestroy(id).next(true);
        this.getDestroy(id).complete();
        this.unset(id);
    }

    public register(grid: T) {
        this.state.set(grid.id, grid);
        this.destroyMap.set(grid.id, new Subject<boolean>());
    }

    public unsubscribe(grid: T) {
        this.state.delete(grid.id);
    }

    public get(id: string): T {
        return this.state.get(id);
    }

    public getDestroy(id: string): Subject<any> {
        return this.destroyMap.get(id);
    }

    public unset(id: string) {
        this.state.delete(id);
        this.summaryCacheMap.delete(id);
        this.editCellState.delete(id);
        this.destroyMap.delete(id);
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
        const isRowSelected = grid.selection.is_item_selected(id, rowID);
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
                grid.selection.deselect_item(id, rowID);
                grid.selection.select_item(id, args.newValue);
            }
            (grid as any)._pipeTrigger++;
        }
    }

    public update_row(value: any, id: string, rowID: any): void {
        const grid = this.get(id);
        const isRowSelected = grid.selection.is_item_selected(id, rowID);
        const index = grid.primaryKey ? grid.data.map((record) => record[grid.primaryKey]).indexOf(rowID) :
        grid.data.indexOf(rowID);
        if (index !== -1) {
            const args: IGridEditEventArgs = { row: this.get_row_by_key(id, rowID), cell: null,
                currentValue: this.get(id).data[index], newValue: value };
            grid.onEditDone.emit(args);
            grid.data[index] = args.newValue;
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

    public scrollTo(id: string, row: any, column: any): void {
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

    private resizeHandler = (id) => {
        this.get(id).reflow();
        this.get(id).zone.run(() => this.get(id).markForCheck());
    }

    /**
     * @hidden
     */
    protected autogenerateColumns(id: string) {
        const grid = this.get(id);
        const factory = grid.resolver.resolveComponentFactory(IgxColumnComponent);
        const fields = Object.keys(grid.data[0]);
        const columns = [];

        fields.forEach((field) => {
            const ref = grid.viewRef.createComponent(factory);
            ref.instance.field = field;
            ref.instance.dataType = this.resolveDataTypes(grid.data[0][field]);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });

        grid.columnList.reset(columns);
    }

    /**
     * @hidden
     */
    protected calcMaxSummaryHeight(id: string) {
        const grid = this.get(id);
        let maxSummaryLength = 0;
        grid.columnList.filter((col) => col.hasSummary && !col.hidden).forEach((column) => {
            this.set_summary_by_column_name(id, column.field);
            const getCurrentSummaryColumn = this.get_summaries(id).get(column.field);
            if (getCurrentSummaryColumn) {
                if (maxSummaryLength < getCurrentSummaryColumn.length) {
                    maxSummaryLength = getCurrentSummaryColumn.length;
                }
            }
        });
        return maxSummaryLength * grid.defaultRowHeight;
    }

        /**
     * @hidden
     */
    protected _derivePossibleHeight(id: string) {
        const grid = this.get(id);
        if ((grid.height && grid.height.indexOf('%') === -1) || !grid.height) {
            return;
        }
        if (!grid.nativeElement.parentNode.clientHeight) {
            const viewPortHeight = document.documentElement.clientHeight;
            grid.height = this.rowBasedHeight(id) <= viewPortHeight ? null : viewPortHeight.toString();
        } else {
            const parentHeight = grid.nativeElement.parentNode.getBoundingClientRect().height;
            grid.height = this.rowBasedHeight <= parentHeight ? null : grid.height;
        }
        this.calculateGridHeight(id);
        grid.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    public derivePossibleWidth(id: string) {
        const grid = this.get(id);
        if (!grid.columnWidthSetByUser) {
            grid.columnWidth = this.getPossibleColumnWidth(id);
            this.initColumns(id, grid.columnList, null);
        }
        this.calculateGridWidth(id);
    }

    /**
     * @hidden
     */
    protected rowBasedHeight(id: string) {
        const grid = this.get(id);
        if (grid.data && grid.data.length) {
            return grid.data.length * grid.rowHeight;
        }
        return 0;
    }

    /**
     * @hidden
     */
    public calculateGridHeight(id: string) {
        const grid = this.get(id);
        const computed = grid.document.defaultView.getComputedStyle(grid.nativeElement);

        // TODO: Calculate based on grid density
        if (grid.maxLevelHeaderDepth) {
            grid.theadRow.nativeElement.style.height = `${(grid.maxLevelHeaderDepth + 1) * grid.defaultRowHeight + 1}px`;
        }

        if (!grid.height) {
            grid.calcHeight = null;
            if (grid.hasSummarizedColumns && !grid.summariesHeight) {
                grid.summariesHeight = grid.summaries ?
                    this.calcMaxSummaryHeight(id) : 0;
            }
            return;
        }

        let toolbarHeight = 0;
        if (grid.showToolbar && grid.toolbarHtml != null) {
            toolbarHeight = grid.toolbarHtml.nativeElement.firstElementChild ?
                grid.toolbarHtml.nativeElement.offsetHeight : 0;
        }

        let pagingHeight = 0;
        if (grid.paging && grid.paginator) {
            pagingHeight = grid.paginator.nativeElement.firstElementChild ?
                grid.paginator.nativeElement.offsetHeight : 0;
        }

        if (!grid.summariesHeight) {
            grid.summariesHeight = grid.summaries ?
                this.calcMaxSummaryHeight(id) : 0;
        }

        const groupAreaHeight = this.getGroupAreaHeight(id);

        if (grid.height && grid.height.indexOf('%') !== -1) {
            /*height in %*/
            grid.calcHeight = this._calculateGridBodyHeight(grid.id,
                parseInt(computed.getPropertyValue('height'), 10), toolbarHeight, pagingHeight, groupAreaHeight);
        } else {
            grid.calcHeight = this._calculateGridBodyHeight(grid.id,
                parseInt(grid.height, 10), toolbarHeight, pagingHeight, groupAreaHeight);
        }
    }

    protected getGroupAreaHeight(id): number {
        return 0;
    }

        /**
     * @hidden
     */
    protected _calculateGridBodyHeight(id: string, gridHeight: number,
        toolbarHeight: number, pagingHeight: number, groupAreaHeight: number) {
        const grid = this.get(id);
        const footerBordersAndScrollbars = grid.tfoot.nativeElement.offsetHeight -
            grid.tfoot.nativeElement.clientHeight;
        if (isNaN(gridHeight)) {
            return this.defaultTargetBodyHeight(id);
        }

        return Math.abs(gridHeight - toolbarHeight -
            grid.theadRow.nativeElement.offsetHeight -
            grid.summariesHeight - pagingHeight - groupAreaHeight -
            footerBordersAndScrollbars -
            grid.scr.nativeElement.clientHeight);
    }

    /**
     * @hidden
    */
    private defaultTargetBodyHeight(id: string): number {
        const grid = this.get(id);
        const allItems = grid.totalItemCount || grid.data.length;
        return grid.rowHeight * Math.min(DEFAULT_TARGET_RECORD_NUMBER,
            grid.paging ? Math.min(allItems, grid.perPage) : allItems);
    }

    /**
     * @hidden
     */
    protected calculateGridWidth(id) {
        const grid = this.get(id);
        const computed = grid.document.defaultView.getComputedStyle(grid.nativeElement);

        if (grid.width && grid.width.indexOf('%') !== -1) {
            /* width in %*/
            const width = parseInt(computed.getPropertyValue('width'), 10);
            if (Number.isFinite(width) && width !== grid.calcWidth) {
                grid.calcWidth = width;

                this.derivePossibleWidth(id);
                grid.cdr.markForCheck();
            }
            return;
        }
        grid.calcWidth = parseInt(grid.width, 10);
    }


        /**
     * @hidden
     */
    protected initColumns(id, collection: QueryList<IgxColumnComponent>, cb: any = null) {
        const grid = this.get(id);
        if (grid.columns.length !== collection.length) {
            // XXX: Deprecate index
            grid.columns = grid.columnList.toArray();
        }
        const _columnsWithNoSetWidths = [];

        collection.forEach((column: IgxColumnComponent) => {
            column.gridID = grid.id;
            if (cb) {
                cb(column);
            }
            if ((grid.columnsWithNoSetWidths === null && !column.width) ||
                (grid.columnsWithNoSetWidths !== null && grid.columnsWithNoSetWidths.indexOf(column) !== -1)) {
                column.width = grid.columnWidth;

                if (!column.hidden) {
                    _columnsWithNoSetWidths.push(column);
                }
            }
        });

        grid.columnsWithNoSetWidths = _columnsWithNoSetWidths;
        this.reinitPinStates(id);
    }


    protected reinitPinStates(id: string) {
        const grid = this.get(id);
        if (grid.hasColumnGroups) {
            grid.pinnedColumns = grid.columnList.filter((c) => c.pinned);
        }
        grid.unpinnedColumns = grid.columnList.filter((c) => !c.pinned);
    }

      /**
     * @hidden
     */
    protected resolveDataTypes(rec) {
        if (typeof rec === 'number') {
            return DataType.Number;
        } else if (typeof rec === 'boolean') {
            return DataType.Boolean;
        } else if (typeof rec === 'object' && rec instanceof Date) {
            return DataType.Date;
        }
        return DataType.String;
    }

     /**
     * @hidden
     */
    protected getPossibleColumnWidth(id: string) {
        const grid = this.get(id);
        let computedWidth = parseInt(
            grid.document.defaultView.getComputedStyle(grid.nativeElement).getPropertyValue('width'), 10);

        let maxColumnWidth = Math.max(
            ...grid.visibleColumns.map((col) => parseInt(col.width, 10))
                .filter((width) => !isNaN(width))
        );

        if (grid.rowSelectable) {
            computedWidth -= grid.headerCheckboxContainer.nativeElement.clientWidth;
        }

        if (grid.columnsWithNoSetWidths === null) {
            grid.columnsWithNoSetWidths = grid.visibleColumns.filter((col) => !col.columnGroup && col.width === null);
        }

        const sumExistingWidths = grid.visibleColumns
            .filter((col) => !col.columnGroup && grid.columnsWithNoSetWidths.indexOf(col) === -1)
            .reduce((prev, curr) => prev + parseInt(curr.width, 10), 0);

        maxColumnWidth = !Number.isFinite(sumExistingWidths) ?
            Math.max(computedWidth / grid.columnsWithNoSetWidths.length, MINIMUM_COLUMN_WIDTH) :
            Math.max((computedWidth - sumExistingWidths) / grid.columnsWithNoSetWidths.length, MINIMUM_COLUMN_WIDTH);

        return maxColumnWidth.toString();
    }

    private checkIfGridIsAdded(node, id): boolean {
        const grid = this.get(id);
        if (node === grid.nativeElement) {
            return true;
        } else {
            for (const childNode of node.childNodes) {
                const added = this.checkIfGridIsAdded(childNode, id);
                if (added) {
                    return true;
                }
            }

            return false;
        }
    }

    /**
     * @hidden
     */
    protected initPinning(id: string) {
        const grid = this.get(id);
        let currentPinnedWidth = 0;
        const pinnedColumns = [];
        const unpinnedColumns = [];
        const newUnpinnedCols = [];

        // When a column is a group or is inside a group, pin all related.
        grid.pinnedColumns.forEach(col => {
            if (col.parent) {
                col.parent.pinned = true;
            }
            if (col.columnGroup) {
                col.children.forEach(child => child.pinned = true);
            }
        });

        // Make sure we don't exceed unpinned area min width and get pinned and unpinned col collections.
        // We take into account top level columns (top level groups and non groups).
        // If top level is unpinned the pinning handles all children to be unpinned as well.
        for (let i = 0; i < grid.columns.length; i++) {
            if (grid.columns[i].pinned && !grid.columns[i].parent) {
                // Pinned column. Check if with it the unpinned min width is exceeded.
                const colWidth = parseInt(grid.columns[i].width, 10);
                if (currentPinnedWidth + colWidth > grid.calcWidth - grid.unpinnedAreaMinWidth) {
                    // unpinned min width is exceeded. Unpin the columns and add it to the unpinned collection.
                    grid.columns[i].pinned = false;
                    unpinnedColumns.push(grid.columns[i]);
                    newUnpinnedCols.push(grid.columns[i]);
                } else {
                    // unpinned min width is not exceeded. Keep it pinned and add it to the pinned collection.
                    currentPinnedWidth += colWidth;
                    pinnedColumns.push(grid.columns[i]);
                }
            } else if (grid.columns[i].pinned && grid.columns[i].parent) {
                if (grid.columns[i].topLevelParent.pinned) {
                    pinnedColumns.push(grid.columns[i]);
                } else {
                    grid.columns[i].pinned = false;
                    unpinnedColumns.push(grid.columns[i]);
                }
            } else {
                unpinnedColumns.push(grid.columns[i]);
            }
        }

        if (newUnpinnedCols.length) {
            console.warn(
                'igxGrid - The pinned area exceeds maximum pinned width. ' +
                'The following columns were unpinned to prevent further issues:' +
                newUnpinnedCols.map(col => '"' + col.header + '"').toString() + '. For more info see our documentation.'
            );
        }

        // Assign the applicaple collections.
        grid.pinnedColumns = pinnedColumns;
        grid.unpinnedColumns = unpinnedColumns;
    }
}

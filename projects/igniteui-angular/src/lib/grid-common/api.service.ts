import { Injectable, Inject, IterableChangeRecord, QueryList, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { cloneArray } from '../core/utils';
import { IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { ISortingState } from '../data-operations/sorting-state.interface';
import { IgxColumnComponent } from './column.component';
import { DataUtil } from '../data-operations/data-util';
import {
    FilteringExpressionsTree,
    IFilteringExpressionsTree
} from '../data-operations/filtering-expressions-tree';
import {IFilteringOperation} from '../data-operations/filtering-condition';
import {
    IGridEditEventArgs,
    IRowSelectionEventArgs,
    IColumnVisibilityChangedEventArgs,
    IGridBaseComponent } from './common/grid-interfaces';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { DataType } from '../data-operations/data-util';
import { DropPosition } from './common/grid-common.misc';
import { ISummaryExpression } from './summaries/grid-summary';

const DEFAULT_TARGET_RECORD_NUMBER = 10;
const MINIMUM_COLUMN_WIDTH = 136;

/**
 *@hidden
 */
@Injectable()
export class IGridAPIService <T extends IGridBaseComponent> {
    public change: Subject<any> = new Subject<any>();
    protected state: Map<string, T> = new Map<string, T>();
    protected editCellState: Map<string, any> = new Map<string, any>();
    protected summaryCacheMap: Map<string, Map<string, any[]>> = new Map<string, Map<string, any[]>>();
    protected destroyMap: Map<string, Subject<boolean>> = new Map<string, Subject<boolean>>();

    constructor(private zone: NgZone,
                @Inject(DOCUMENT) private document) {}

    private resizeHandler = () => {
        this.state.forEach(g => {
            g.reflow();
            this.zone.run(() => g.markForCheck());
        });
    }

    public on_init(grid: T) {
        this.register(grid);
        grid.columnListDiffer = grid.differs.find([]).create(null);
        grid.calcWidth = grid.width && grid.width.indexOf('%') === -1 ? parseInt(grid.width, 10) : 0;
        grid.calcHeight = 0;
        grid.calcRowCheckboxWidth = 0;

        const id = grid.id;
        grid.onRowAdded.pipe(takeUntil(this.get_destroy(id))).subscribe(() => grid.clearSummaryCache());
        grid.onRowDeleted.pipe(takeUntil(this.get_destroy(id))).subscribe(() => grid.clearSummaryCache());
        grid.onFilteringDone.pipe(takeUntil(this.get_destroy(id))).subscribe(() => grid.clearSummaryCache());
        grid.onEditDone.pipe(takeUntil(this.get_destroy(id))).subscribe((editCell) => grid.clearSummaryCache(editCell));
        grid.onColumnMoving.pipe(takeUntil(this.get_destroy(id))).subscribe(() => {
            this.submit_value(grid.id);
        });
    }

    public on_after_content_init(id: string) {
        const grid = this.get(id);
        if (grid.autoGenerate) {
            this.autogenerate_columns(id);
        }

        this.init_columns(id, grid.columnList, (col) => grid.onColumnInit.emit(col));
        grid.columnListDiffer.diff(grid.columnList);
        grid.clearSummaryCache();
        grid.summariesHeight = this.calc_max_summary_height(id);
        this.derive_possible_height(id);
        this.mark_for_check(id);

        grid.columnList.changes
            .pipe(takeUntil(this.get_destroy(id)))
            .subscribe((change: QueryList<any>) => {
                const diff = grid.columnListDiffer.diff(change);
                if (diff) {

                    this.init_columns(id, grid.columnList);

                    diff.forEachAddedItem((record: IterableChangeRecord<any>) => {
                        grid.clearSummaryCache();
                        grid.reflow();
                        grid.onColumnInit.emit(record.item);
                    });

                    diff.forEachRemovedItem((record: IterableChangeRecord<any>) => {
                        // Recalculate Summaries
                        grid.clearSummaryCache();
                        grid.reflow();

                        // Clear Filtering
                        this.clear_filter_implementation(id, record.item.field);

                        // Clear Sorting
                        this.clear_sort_implementation(id, record.item.field);
                    });
                }
                this.mark_for_check(id);
            });
        const vertScrDC = grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement;
        vertScrDC.addEventListener('scroll', (evt) => { grid.scrollHandler(evt); });
    }

    public on_after_view_init(id: string) {
        const grid = this.get(id);
        // Subscribe only if we haven't got any active subscribtions
        if (this.state.size === 0) {
            this.zone.runOutsideAngular(() => {
                this.document.defaultView.addEventListener('resize', this.resizeHandler);
            });
        }
        this.calculate_grid_width(id);
        this.init_pinning(id);
        grid.reflow();
        grid.onDensityChanged.pipe(takeUntil(this.get_destroy(id))).subscribe(() => {
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
                            const added = this.check_if_grid_is_added(node, id);
                            if (added) {
                                this.calculate_grid_width(id);
                                observer.disconnect();
                            }
                        });
                    }
                });
            };

            observer = new MutationObserver(callback);
            observer.observe(this.document.body, config);
        }
    }

    public on_destroy(id: string) {
        if (this.state.size === 1) {
            this.zone.runOutsideAngular(() => {
                this.document.defaultView.removeEventListener('resize', this.resizeHandler);
            });
        }
        this.get_destroy(id).next(true);
        this.get_destroy(id).complete();
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

    public get_destroy(id: string): Subject<any> {
        return this.destroyMap.get(id);
    }

    public unset(id: string) {
        this.state.delete(id);
        this.summaryCacheMap.delete(id);
        this.editCellState.delete(id);
        this.destroyMap.delete(id);
    }

    public reset(oldId: string, newId: string) {
        const destroy = this.destroyMap.get(oldId);
        const summary = this.summaryCacheMap.get(oldId);
        const editCellState = this.editCellState.get(oldId);
        const grid = this.get(oldId);

        this.unset(oldId);

        if (grid) {
            this.state.set(newId, grid);
        }

        if (destroy) {
            this.destroyMap.set(newId, destroy);
        }

        if (summary) {
            this.summaryCacheMap.set(newId, summary);
        }

        if (editCellState) {
            this.editCellState.set(newId, editCellState);
        }
    }

    public mark_for_check(id: string) {
        const grid = this.get(id);

        if (grid.rowList) {
            grid.rowList.forEach((row) => row.cdr.markForCheck());
        }
        grid.cdr.detectChanges();
    }

    public get_row_list(rowList: QueryList<any>): QueryList<any> {
        const res = new QueryList<any>();
        if (!rowList) {
            return res;
        }
        const rList = rowList.filter((item) => {
            return item.element.nativeElement.parentElement !== null;
        });
        res.reset(rList);
        return res;
    }

    public get_column_by_name(id: string, name: string) {
        return this.get(id).columns.find((col) => col.field === name);
    }

    public set_summary_by_column_name(id: string, name: string) {
        if (!this.summaryCacheMap.get(id)) {
            this.summaryCacheMap.set(id, new Map<string, any[]>());
        }
        const column = this.get_column_by_name(id, name);
        if (this.get(id).filteredData && this.get(id).filteredData.length >= 0) {
            this.calculate_summaries(id, column, this.get(id).filteredData.map((rec) => rec[column.field]));
        } else {
            if (this.get(id).data) {
                this.calculate_summaries(id, column, this.get(id).data.map((rec) => rec[column.field]));
            }
        }
    }

    private calculate_summaries(id: string, column, data) {
        if (!this.summaryCacheMap.get(id).get(column.field)) {
            this.summaryCacheMap.get(id).set(column.field,
                column.summaries.operate(data));
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

        this.refresh_search(gridId);
    }

    public get_cell_inEditMode(gridId): any {
        const editCellId = this.editCellState.get(gridId);
        if (editCellId) {
            return editCellId;
        } else {
            return null;
        }
    }

    public get_row_by_key(id: string, rowSelector: any): any {
        const primaryKey = this.get(id).primaryKey;
        if (primaryKey !== undefined && primaryKey !== null) {
            return this.get(id).dataRowList.find((row) => row.rowData[primaryKey] === rowSelector);
        } else {
            return this.get(id).dataRowList.find((row) => row.rowData === rowSelector);
        }
    }

    public get_row_by_index(id: string, rowIndex: number): any {
        return this.get(id).rowList.find((row) => row.index === rowIndex);
    }

    public get_cell_by_key(id: string, rowSelector: any, field: string): any {
        const row = this.get_row_by_key(id, rowSelector);
        if (row && row.cells) {
            return row.cells.find((cell) => cell.column.field === field);
        }
    }

    public get_cell_by_index(id: string, rowIndex: number, columnIndex: number): any {
        const row = this.get_row_by_index(id, rowIndex);
        if (row && row.cells) {
            return row.cells.find((cell) => cell.columnIndex === columnIndex);
        }
    }

    public get_cell_by_visible_index(id: string, rowIndex: number, columnIndex: number): any {
        const row = this.get_row_by_index(id, rowIndex);
        if (row && row.cells) {
            return row.cells.find((cell) => cell.visibleColumnIndex === columnIndex);
        }
    }

    public get_cell_by_column(id: string, rowIndex: number, columnField: string): any {
        const grid = this.get(id);
        const columnId = grid.columnList.map((column) => column.field).indexOf(columnField);
        if (columnId !== -1) {
            return this.get_cell_by_index(id, rowIndex, columnId);
        }
    }

    public submit_value(gridId) {
        const editableCell = this.get_cell_inEditMode(gridId);
        if (editableCell) {
            if (!editableCell.cell.column.inlineEditorTemplate && editableCell.cell.column.dataType === 'number') {
                if (!this.get_cell_inEditMode(gridId).cell.editValue) {
                    this.update_cell_implementation(gridId, editableCell.cellID.rowID, editableCell.cellID.columnID, 0);
                } else {
                    const val = parseFloat(this.get_cell_inEditMode(gridId).cell.editValue);
                    if (!isNaN(val) || isFinite(val)) {
                        this.update_cell_implementation(gridId, editableCell.cellID.rowID, editableCell.cellID.columnID, val);
                    }
                }
            } else {
                this.update_cell_implementation(gridId, editableCell.cellID.rowID,
                                                editableCell.cellID.columnID, editableCell.cell.editValue);
            }
            this.escape_editMode(gridId, editableCell.cellID);
            this.get(gridId).cdr.detectChanges();
        }
    }

    public sort(id: string, expression: ISortingExpression | Array<ISortingExpression>): void;
    public sort(id: string, rest): void {
        this.escape_editMode(id);
        if (rest.length === 1 && rest[0] instanceof Array) {
            this.sort_multiple_implementation(id, rest[0]);
        } else {
            this.sort_implementation(id, rest[0].fieldName, rest[0].dir, rest[0].ignoreCase);
        }
    }

    private sort_implementation(id: string, fieldName: string, dir: SortingDirection, ignoreCase: boolean): void {
        if (dir === SortingDirection.None) {
            this.remove_grouping_expression(id, fieldName);
        }
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        this.prepare_sorting_expression([sortingState], { fieldName, dir, ignoreCase });
        this.get(id).sortingExpressions = sortingState;
    }

    private sort_multiple_implementation(id: string, expressions: ISortingExpression[]): void {
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        for (const each of expressions) {
            if (each.dir === SortingDirection.None) {
                this.remove_grouping_expression(id, each.fieldName);
            }
            this.prepare_sorting_expression([sortingState], each);
        }

        this.get(id).sortingExpressions = sortingState;
    }

    public filter(id: string, fieldName: string, value: any, conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree,
                    ignoreCase: boolean) {
        const grid = this.get(id);
        const col = this.get_column_by_name(id, fieldName);
        const filteringIgnoreCase = ignoreCase || (col ? col.filteringIgnoreCase : false);

        if (conditionOrExpressionsTree) {
            this.filter_implementation(id, fieldName, value, conditionOrExpressionsTree, filteringIgnoreCase);
        } else {
            const expressionsTreeForColumn = grid.filteringExpressionsTree.find(name);
            if (expressionsTreeForColumn instanceof FilteringExpressionsTree) {
                this.filter_implementation(id, fieldName, value, expressionsTreeForColumn, filteringIgnoreCase);
            } else {
                const expressionForColumn = expressionsTreeForColumn as IFilteringExpression;
                this.filter_implementation(id, fieldName, value, expressionForColumn.condition, filteringIgnoreCase);
            }
        }
    }

    private filter_implementation(id: string, fieldName: string, value: any,
            conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree, ignoreCase: boolean) {
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

        this.prepare_filtering_expression(filteringTree, fieldName, value, conditionOrExpressionsTree, ignoreCase);
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

    public clear_filter(id: string, fieldName: string) {
        if (fieldName) {
            const column = this.get_column_by_name(id, fieldName);
            if (!column) {
                return;
            }
        }

        this.clear_filter_implementation(id, fieldName);
    }

    private clear_filter_implementation(id: string, fieldName: string) {
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

    public clear_sort(id, fieldName) {
        if (!fieldName) {
            this.get(id).sortingExpressions = [];
            return;
        }

        if (!this.get_column_by_name(id, fieldName)) {
            return;
        }

        this.clear_sort_implementation(id, fieldName);
    }

    private clear_sort_implementation(id, fieldName) {
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

    public filtered_sorted_data(id: string): any[] {
        const grid = this.get(id);
        let data: any[] = grid.filteredData ? grid.filteredData : grid.data;

        if (grid.sortingExpressions &&
            grid.sortingExpressions.length > 0) {
            const state: ISortingState = {
                'expressions': grid.sortingExpressions
            };

            data = DataUtil.sort(cloneArray(data), state);
        }

        return data;
    }

    public refresh_search(id: string, updateActiveInfo?: boolean) {
        const grid = this.get(id);
        if (grid && grid.lastSearchInfo.searchText) {
            this.rebuild_match_cache(id);

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

    public find(id: string,
                text: string,
                increment: number,
                caseSensitive?: boolean,
                exactMatch?: boolean,
                scroll?: boolean) {

        const grid = this.get(id);
        if (!grid || !grid.rowList) {
            return 0;
        }

        const editModeCell = this.get_cell_inEditMode(id);
        if (editModeCell) {
            this.escape_editMode(id);
        }

        if (!text) {
            this.clear_search(id);
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

            this.rebuild_match_cache(id);
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
                this.scroll_to(id, matchInfo.row, matchInfo.column);
            }
        } else {
            IgxTextHighlightDirective.clearActiveHighlight(id);
        }

        return grid.lastSearchInfo.matchInfoCache.length;
    }

    public clear_search(id: string) {
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

    public scroll_to(id: string, row: any | number, column: any | number): void {
        const grid = this.get(id);
        const rowIndex = typeof row === 'number' ? row : grid.filteredSortedData.indexOf(row);
        let columnIndex = typeof column === 'number' ? column : this.get_column_by_name(id, column).visibleIndex;

        if (grid.paging) {
            grid.page = Math.floor(rowIndex / grid.perPage);
        }

        this.scroll_directive(id, grid.verticalScrollContainer, rowIndex);

        const scrollRow = grid.rowList.find(r => r.virtDirRow);
        const virtDir = scrollRow ? scrollRow.virtDirRow : null;

        if (grid.pinnedColumns.length) {
            if (columnIndex >= grid.pinnedColumns.length) {
                columnIndex -= grid.pinnedColumns.length;
                this.scroll_directive(id, virtDir, columnIndex);
            }
        } else {
            this.scroll_directive(id, virtDir, columnIndex);
        }
    }

    private scroll_directive(id: string, directive: IgxForOfDirective<any>, goal: number): void {
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

    private rebuild_match_cache(id: string) {
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

    public reflow(id: string) {
        const grid = this.get(id);
        this.derive_possible_width(id);
        grid.cdr.detectChanges();
        this.calculate_grid_height(id);
        if (grid.rowSelectable) {
            grid.calcRowCheckboxWidth = grid.headerCheckboxContainer.nativeElement.clientWidth;
        }
        grid.cdr.detectChanges();
    }

    protected remove_grouping_expression(id: string, fieldName: string) {

    }

    private autogenerate_columns(id: string) {
        const grid = this.get(id);
        const factory = grid.resolver.resolveComponentFactory(IgxColumnComponent);
        const fields = Object.keys(grid.data[0]);
        const columns = [];

        fields.forEach((field) => {
            const ref = grid.viewRef.createComponent(factory);
            ref.instance.field = field;
            ref.instance.dataType = this.resolve_data_types(grid.data[0][field]);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });

        grid.columnList.reset(columns);
    }

    private calc_max_summary_height(id: string) {
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

    private derive_possible_height(id: string) {
        const grid = this.get(id);
        if ((grid.height && grid.height.indexOf('%') === -1) || !grid.height) {
            return;
        }
        if (!grid.nativeElement.parentNode.clientHeight) {
            const viewPortHeight = document.documentElement.clientHeight;
            grid.height = this.row_based_height(id) <= viewPortHeight ? null : viewPortHeight.toString();
        } else {
            const parentHeight = grid.nativeElement.parentNode.getBoundingClientRect().height;
            grid.height = this.row_based_height(id) <= parentHeight ? null : grid.height;
        }
        this.calculate_grid_height(id);
        grid.cdr.detectChanges();
    }

    private derive_possible_width(id: string) {
        const grid = this.get(id);
        if (!grid.columnWidthSetByUser) {
            grid.columnWidth = this.get_possible_column_width(id);
            grid.columnWidthSetByUser = false;
            this.init_columns(id, grid.columnList, null);
        }
        this.calculate_grid_width(id);
    }

    public calculate_grid_height(id: string) {
        const grid = this.get(id);
        const computed = this.document.defaultView.getComputedStyle(grid.nativeElement);

        // TODO: Calculate based on grid density
        if (grid.maxLevelHeaderDepth) {
            grid.theadRow.nativeElement.style.height = `${(grid.maxLevelHeaderDepth + 1) * grid.defaultRowHeight + 1}px`;
        }

        if (!grid.height) {
            grid.calcHeight = null;
            if (grid.hasSummarizedColumns && !grid.summariesHeight) {
                grid.summariesHeight = grid.summaries ?
                    this.calc_max_summary_height(id) : 0;
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
                this.calc_max_summary_height(id) : 0;
        }

        const groupAreaHeight = this.get_group_area_height(id);

        if (grid.height && grid.height.indexOf('%') !== -1) {
            /*height in %*/
            grid.calcHeight = this.calculate_grid_body_height(grid.id,
                parseInt(computed.getPropertyValue('height'), 10), toolbarHeight, pagingHeight, groupAreaHeight);
        } else {
            grid.calcHeight = this.calculate_grid_body_height(grid.id,
                parseInt(grid.height, 10), toolbarHeight, pagingHeight, groupAreaHeight);
        }
    }

    protected get_group_area_height(id): number {
        return 0;
    }

    private calculate_grid_body_height(id: string, gridHeight: number,
        toolbarHeight: number, pagingHeight: number, groupAreaHeight: number) {
        const grid = this.get(id);
        const footerBordersAndScrollbars = grid.tfoot.nativeElement.offsetHeight -
            grid.tfoot.nativeElement.clientHeight;
        if (isNaN(gridHeight)) {
            return this.default_target_body_height(id);
        }

        return Math.abs(gridHeight - toolbarHeight -
            grid.theadRow.nativeElement.offsetHeight -
            grid.summariesHeight - pagingHeight - groupAreaHeight -
            footerBordersAndScrollbars -
            grid.scr.nativeElement.clientHeight);
    }

    private default_target_body_height(id: string): number {
        const grid = this.get(id);
        const allItems = grid.totalItemCount || grid.data.length;
        return grid.rowHeight * Math.min(DEFAULT_TARGET_RECORD_NUMBER,
            grid.paging ? Math.min(allItems, grid.perPage) : allItems);
    }

    private calculate_grid_width(id) {
        const grid = this.get(id);
        const computed = this.document.defaultView.getComputedStyle(grid.nativeElement);

        if (grid.width && grid.width.indexOf('%') !== -1) {
            /* width in %*/
            const width = parseInt(computed.getPropertyValue('width'), 10);
            if (Number.isFinite(width) && width !== grid.calcWidth) {
                grid.calcWidth = width;

                this.derive_possible_width(id);
                grid.cdr.markForCheck();
            }
            return;
        }
        grid.calcWidth = parseInt(grid.width, 10);
    }

    private init_columns(id: string, collection: QueryList<IgxColumnComponent>, cb: any = null) {
        const grid = this.get(id);
        // XXX: Deprecate index
        grid.columns = grid.columnList.toArray();
        collection.forEach((column: IgxColumnComponent) => {
            column.gridID = id;
            column.defaultWidth = grid.columnWidth;

            if (cb) {
                cb(column);
            }
        });

        this.reinit_pin_states(id);
    }

    private reinit_pin_states(id: string) {
        const grid = this.get(id);

        if (grid.hasColumnGroups) {
            grid.pinnedColumns = grid.columns.filter(c => c.pinned);
        }
        grid.unpinnedColumns = grid.columns.filter(c => !c.pinned);
    }

    private resolve_data_types(rec) {
        if (typeof rec === 'number') {
            return DataType.Number;
        } else if (typeof rec === 'boolean') {
            return DataType.Boolean;
        } else if (typeof rec === 'object' && rec instanceof Date) {
            return DataType.Date;
        }
        return DataType.String;
    }

    private get_possible_column_width(id: string) {
        const grid = this.get(id);
        let computedWidth = parseInt(
            this.document.defaultView.getComputedStyle(grid.nativeElement).getPropertyValue('width'), 10);

        if (grid.rowSelectable) {
            computedWidth -= grid.headerCheckboxContainer.nativeElement.clientWidth;
        }

        const visibleChildColumns = grid.visibleColumns.filter(c => !c.columnGroup);

        const columnsWithSetWidths = visibleChildColumns.filter(c => c.widthSetByUser);
        const columnsToSize = visibleChildColumns.length - columnsWithSetWidths.length;

        const sumExistingWidths = columnsWithSetWidths
            .reduce((prev, curr) => prev + parseInt(curr.width, 10), 0);

        const columnWidth = !Number.isFinite(sumExistingWidths) ?
            Math.max(computedWidth / columnsToSize, MINIMUM_COLUMN_WIDTH) :
            Math.max((computedWidth - sumExistingWidths) / columnsToSize, MINIMUM_COLUMN_WIDTH);

        return columnWidth.toString();
    }

    private check_if_grid_is_added(id, node): boolean {
        const grid = this.get(id);
        if (node === grid.nativeElement) {
            return true;
        } else {
            for (const childNode of node.childNodes) {
                const added = this.check_if_grid_is_added(id, childNode);
                if (added) {
                    return true;
                }
            }

            return false;
        }
    }

    private init_pinning(id: string) {
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

    private row_based_height(id: string) {
        const grid = this.get(id);
        if (grid.data && grid.data.length) {
            return grid.data.length * grid.rowHeight;
        }
        return 0;
    }

    public focus_next_cell(id: string, rowIndex: number, columnIndex: number, dir?: string, event?) {
        const grid = this.get(id);
        let row = this.get_row_by_index(id, rowIndex);
        const virtualDir = dir !== undefined ? row.virtDirRow : grid.verticalScrollContainer;
        this.subscribe_next(virtualDir, () => {
            let target;
            grid.cdr.detectChanges();
            row = this.get_row_by_index(id, rowIndex);
            target = this.get_cell_by_visible_index(id, rowIndex, columnIndex);

            if (!target) {
                if (dir) {
                    target = dir === 'left' ? row.cells.first : row.cells.last;
                } else if (row) {
                    target = row.getNavigationTarget(0, rowIndex);
                } else {
                    return;
                }
            }
            row.performNavigationAction(target, event);
        });
    }

    private subscribe_next(virtualContainer: any, callback: (elem?) => void) {
        const subscription = virtualContainer.onChunkLoad.pipe(take(1)).subscribe({
            next: (e: any) => {
                callback(e);
            }
        });
    }

    public navigate_up(id: string, rowIndex: number, columnIndex: number, event?) {
        const grid = this.get(id);
        const row = this.get_row_by_index(id, rowIndex);
        const target = row ? row.getNavigationTarget(columnIndex, rowIndex) : undefined;
        const verticalScroll = grid.verticalScrollContainer.getVerticalScroll();

        if (!verticalScroll && !target) {
            return;
        }
        if (target) {
            const containerTopOffset =
                parseInt(row.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            if (grid.rowHeight > Math.abs(containerTopOffset) // not the entire row is visible, due to grid offset
                && verticalScroll.scrollTop // the scrollbar is not at the first item
                && row.element.nativeElement.offsetTop < grid.rowHeight) { // the target is in the first row
                const scrollAmount = containerTopOffset < 0 ?
                    containerTopOffset :
                    -grid.rowHeight + Math.abs(containerTopOffset);
                this.perform_vertical_scroll(id, scrollAmount, rowIndex - 1, columnIndex, event);
            }
            row.performNavigationAction(target, event);
        } else {
            const scrollOffset =
                -parseInt(grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const scrollAmount = grid.rowHeight + scrollOffset;
            this.perform_vertical_scroll(id, -scrollAmount, rowIndex, columnIndex, event);
        }
    }

    public navigate_down(id: string, rowIndex: number, columnIndex: number, event?) {
        const grid = this.get(id);
        const row = this.get_row_by_index(id, rowIndex);
        const target = row ? row.getNavigationTarget(columnIndex, rowIndex) : undefined;
        const verticalScroll = grid.verticalScrollContainer.getVerticalScroll();
        if (!verticalScroll && !target) {
            return;
        }

        if (target) {
            const containerHeight = grid.calcHeight ?
                Math.ceil(grid.calcHeight) :
                null; // null when there is no vertical virtualization
            const containerTopOffset =
                parseInt(grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const targetEndTopOffset = row.element.nativeElement.offsetTop + grid.rowHeight + containerTopOffset;
            if (containerHeight && targetEndTopOffset > containerHeight) {
                const scrollAmount = targetEndTopOffset - containerHeight;
                this.perform_vertical_scroll(id, scrollAmount, rowIndex, columnIndex, event);
            } else {
                row.performNavigationAction(target, event);
            }
        } else {
            const contentHeight = grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.offsetHeight;
            const scrollOffset = parseInt(grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const lastRowOffset = contentHeight + scrollOffset - grid.calcHeight;
            const scrollAmount = grid.rowHeight + lastRowOffset;
            this.perform_vertical_scroll(id, scrollAmount, rowIndex, columnIndex, event);
        }
    }

    private perform_vertical_scroll(id: string, amount: number, rowIndex: number, columnIndex: number, event?) {
        const grid = this.get(id);
        const scrolled = grid.verticalScrollContainer.addScrollTop(amount);
        if (scrolled) {
            this.focus_next_cell(id, rowIndex, columnIndex, undefined, event);
        }
    }

    public on_header_checkbox_click(id: string, event: any) {
        const grid = this.get(id);
        grid.allRowsSelected = event.checked;
        const newSelection =
            event.checked ?
                grid.filteredData ?
                    grid.selection.add_items(id, grid.selection.get_all_ids(grid.filteredData, grid.primaryKey)) :
                    grid.selection.get_all_ids(grid.data, grid.primaryKey) :
                grid.filteredData ?
                    grid.selection.delete_items(id, grid.selection.get_all_ids(grid.filteredData, grid.primaryKey)) :
                    grid.selection.get_empty();
        this.trigger_row_selection_change(id, newSelection, null, event, event.checked);
        this.check_header_checkbox_status(id, event.checked);
    }

    public check_header_checkbox_status(id: string, headerStatus?: boolean) {
        const grid = this.get(id);
        if (headerStatus === undefined) {
            grid.allRowsSelected = grid.selection.are_all_selected(id, grid.data);
            if (grid.headerCheckbox) {
                grid.headerCheckbox.indeterminate = !grid.allRowsSelected && !grid.selection.are_none_selected(id);
                if (!grid.headerCheckbox.indeterminate) {
                    grid.headerCheckbox.checked = grid.selection.are_all_selected(id, grid.data);
                }
            }
            grid.cdr.markForCheck();
        } else if (grid.headerCheckbox) {
            grid.headerCheckbox.checked = headerStatus;
        }
    }

    public selected_rows(id: string): any[] {
        const grid = this.get(id);
        const selection = grid.selection.get(id);
        return selection ? Array.from(selection) : [];
    }

    public select_rows(id: string, rowIDs: any[], clearCurrentSelection?: boolean) {
        const grid = this.get(id);
        const newSelection = grid.selection.add_items(id, rowIDs, clearCurrentSelection);
        this.trigger_row_selection_change(id, newSelection);
    }

    public deselect_rows(id: string, rowIDs: any[]) {
        const grid = this.get(id);
        const newSelection = grid.selection.delete_items(id, rowIDs);
        this.trigger_row_selection_change(id, newSelection);
    }

    public trigger_row_selection_change(id: string, newSelectionAsSet: Set<any>, row?: any,
                                    event?: Event, headerStatus?: boolean) {
        const grid = this.get(id);
        const oldSelectionAsSet = grid.selection.get(id);
        const oldSelection = oldSelectionAsSet ? Array.from(oldSelectionAsSet) : [];
        const newSelection = newSelectionAsSet ? Array.from(newSelectionAsSet) : [];
        const args: IRowSelectionEventArgs = { oldSelection, newSelection, row, event };
        grid.onRowSelectionChange.emit(args);
        newSelectionAsSet = grid.selection.get_empty();
        for (let i = 0; i < args.newSelection.length; i++) {
            newSelectionAsSet.add(args.newSelection[i]);
        }
        grid.selection.set(id, newSelectionAsSet);
        this.check_header_checkbox_status(id, headerStatus);
    }

    public update_header_checkbox_status_on_filter(id: string, data: any[]) {
        const grid = this.get(id);
        if (!data) {
            data = grid.data;
        }
        switch (this.filtered_items_status(id, data, grid.primaryKey)) {
            case 'allSelected': {
                grid.allRowsSelected = true;
                grid.headerCheckbox.indeterminate = false;
                break;
            }
            case 'noneSelected': {
                grid.allRowsSelected = false;
                grid.headerCheckbox.indeterminate = false;
                break;
            }
            default: {
                grid.headerCheckbox.indeterminate = true;
                grid.allRowsSelected = false;
                break;
            }
        }
    }

    private filtered_items_status(id: string, filteredData: any[], primaryKey?) {
        const grid = this.get(id);
        const currSelection = grid.selection.get(id);
        let atLeastOneSelected = false;
        let notAllSelected = false;
        if (currSelection) {
            for (const key of Object.keys(filteredData)) {
                const dataItem = primaryKey ? filteredData[key][primaryKey] : filteredData[key];
                if (currSelection.has(dataItem)) {
                    atLeastOneSelected = true;
                    if (notAllSelected) {
                        return 'indeterminate';
                    }
                } else {
                    notAllSelected = true;
                    if (atLeastOneSelected) {
                        return 'indeterminate';
                    }
                }
            }
        }
        return atLeastOneSelected ? 'allSelected' : 'noneSelected';
    }

    public selected_cells(id: string): any[] {
        const grid = this.get(id);
        if (grid.rowList) {
            return grid.dataRowList.
                        map((row) => row.cells.filter((cell) => cell.selected)).
                        reduce((a, b) => a.concat(b), []);
        } else {
            return [];
        }
    }

    public pin_column(id: string, columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.get_column_by_name(id, columnName);
        return col.pin(index);
    }

    public unpin_column(id: string, columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.get_column_by_name(id, columnName);
        return col.unpin(index);
    }

    public get_pinned_width(id: string, takeHidden: boolean) {
        const grid = this.get(id);
        const fc = takeHidden ? grid.pinnedColumns : grid.pinnedColumns.filter(c => !c.hidden);
        let sum = 0;
        for (const col of fc) {
            if (col.level === 0) {
                sum += parseInt(col.width, 10);
            }
        }
        if (grid.rowSelectable) {
            sum += grid.calcRowCheckboxWidth;
        }

        return sum;
    }

    public get_unpinned_width(id: string, takeHidden: boolean) {
        const grid = this.get(id);
        const width = grid.width && grid.width.indexOf('%') !== -1 ?
            grid.calcWidth :
            parseInt(grid.width, 10);
        return width - this.get_pinned_width(id, takeHidden);
    }

    public toggle_column_visibility(id: string, args: IColumnVisibilityChangedEventArgs) {
        const grid = this.get(id);
        const col = this.get_column_by_name(id, args.column.field);
        col.hidden = args.newValue;
        grid.onColumnVisibilityChanged.emit(args);

        this.mark_for_check(id);
    }

    public total_width(id: string) {
        const grid = this.get(id);
        // Take only top level, unpinned columns
        const cols = grid.visibleColumns.filter(col => col.level === 0 && !col.pinned);
        let totalWidth = 0;
        let i = 0;
        for (i; i < cols.length; i++) {
            totalWidth += parseInt(cols[i].width, 10) || 0;
        }
        return totalWidth;
    }

    public move_column(id: string, column: IgxColumnComponent, dropTarget: IgxColumnComponent, pos: DropPosition = DropPosition.None) {
        const grid = this.get(id);
        let position = pos;
        const fromIndex = column.visibleIndex;
        const toIndex = dropTarget.visibleIndex;

        if (pos === DropPosition.BeforeDropTarget && fromIndex < toIndex) {
            position = DropPosition.BeforeDropTarget;
        } else if (pos === DropPosition.AfterDropTarget && fromIndex > toIndex) {
            position = DropPosition.AfterDropTarget;
        } else {
            position = DropPosition.None;
        }


        if ((column.level !== dropTarget.level) ||
            (column.topLevelParent !== dropTarget.topLevelParent)) {
            return;
        }

        this.submit_value(id);
        if (column.level) {
            this.move_child_columns(column.parent, column, dropTarget, position);
        }

        if (dropTarget.pinned && column.pinned) {
            this.reorder_pinned_columns(id, column, dropTarget, position);
        }

        if (dropTarget.pinned && !column.pinned) {
            column.pin();
            this.reorder_pinned_columns(id, column, dropTarget, position);
        }

        if (!dropTarget.pinned && column.pinned) {
            column.unpin();

            const list = grid.columnList.toArray();
            const fi = list.indexOf(column);
            const ti = list.indexOf(dropTarget);

            if (pos === DropPosition.BeforeDropTarget && fi < ti) {
                position = DropPosition.BeforeDropTarget;
            } else if (pos === DropPosition.AfterDropTarget && fi > ti) {
                position = DropPosition.AfterDropTarget;
            } else {
                position = DropPosition.None;
            }
        }

        this.move_columns(id, column, dropTarget, position);
        grid.cdr.detectChanges();
    }

    private move_columns(id: string, from: IgxColumnComponent, to: IgxColumnComponent, pos: DropPosition = DropPosition.None) {
        const grid = this.get(id);
        const list = grid.columnList.toArray();
        const fromIndex = list.indexOf(from);
        let toIndex = list.indexOf(to);

        if (pos === DropPosition.BeforeDropTarget) {
            toIndex--;
            if (toIndex < 0) {
                toIndex = 0;
            }
        }

        if (pos === DropPosition.AfterDropTarget) {
            toIndex++;
        }

        list.splice(toIndex, 0, ...list.splice(fromIndex, 1));
        const newList = this.reset_column_list(id, list);
        grid.columnList.reset(newList);
        grid.columnList.notifyOnChanges();
        grid.columns = grid.columnList.toArray();
    }

    private move_child_columns(parent: IgxColumnComponent, from: IgxColumnComponent, to: IgxColumnComponent, pos: DropPosition) {
        const buffer = parent.children.toArray();
        const fromIndex = buffer.indexOf(from);
        let toIndex = buffer.indexOf(to);

        if (pos === DropPosition.BeforeDropTarget) {
            toIndex--;
        }

        if (pos === DropPosition.AfterDropTarget) {
            toIndex++;
        }

        buffer.splice(toIndex, 0, ...buffer.splice(fromIndex, 1));
        parent.children.reset(buffer);
    }

    private reorder_pinned_columns(id: string, from: IgxColumnComponent, to: IgxColumnComponent, position: DropPosition) {
        const grid = this.get(id);
        const pinned = grid.pinnedColumns;
        let dropIndex = pinned.indexOf(to);

        if (position === DropPosition.BeforeDropTarget) {
            dropIndex--;
        }

        if (position === DropPosition.AfterDropTarget) {
            dropIndex++;
        }

        pinned.splice(dropIndex, 0, ...pinned.splice(pinned.indexOf(from), 1));
    }

    private reset_column_list(id: string, list?: IgxColumnComponent[]): IgxColumnComponent[] {
        const grid = this.get(id);
        if (!list) {
            list = grid.columnList.toArray();
        }
        let newList = [];
        list.filter(c => c.level === 0).forEach(p => {
            newList.push(p);
            if (p.columnGroup) {
                newList = newList.concat(p.allChildren);
            }
        });
        return newList;
    }

    public add_row(id: string, data: any) {
        const grid = this.get(id);
        grid.data.push(data);
        grid.onRowAdded.emit({ data });
        grid.pipeTrigger++;
        grid.cdr.markForCheck();

        this.refresh_search(id);
    }

    public delete_row(id: string, rowSelector: any) {
        const grid = this.get(id);
        if (grid.primaryKey !== undefined && grid.primaryKey !== null) {
            const index = grid.data.map((record) => record[grid.primaryKey]).indexOf(rowSelector);
            if (index !== -1) {
                const editableCell = this.get_cell_inEditMode(id);
                if (editableCell && editableCell.cellID.rowID === rowSelector) {
                    this.escape_editMode(id, editableCell.cellID);
                }
                grid.onRowDeleted.emit({ data: grid.data[index] });
                grid.data.splice(index, 1);
                if (grid.rowSelectable === true && grid.selection.is_item_selected(id, rowSelector)) {
                    this.deselect_rows(id, [rowSelector]);
                } else {
                    this.check_header_checkbox_status(id);
                }
                grid.pipeTrigger++;
                grid.cdr.markForCheck();

                this.refresh_search(id);
                if (grid.data.length % grid.perPage === 0 && grid.isLastPage && grid.page !== 0) {
                    grid.page--;
                }
            }
        }
    }

    public update_cell(id: string, value: any, rowSelector: any, column: string): void {
        const grid = this.get(id);
        if (grid.primaryKey !== undefined && grid.primaryKey !== null) {
            const columnEdit = grid.columns.filter((col) => col.field === column);
            if (columnEdit.length > 0) {
                const columnId = grid.columns.indexOf(columnEdit[0]);
                const editableCell = this.get_cell_inEditMode(id);
                if (editableCell && editableCell.cellID.rowID === rowSelector &&
                    editableCell.cellID.columnID === columnId) {
                    this.escape_editMode(id, editableCell.cellID);
                }
                this.update_cell_implementation(id, rowSelector, columnId, value);
                grid.cdr.markForCheck();
                this.refresh_search(id);
            }
        }
    }

    public update_cell_implementation(id: string, rowID, columnID, editValue): void {
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

    public update_row(id: string, value: any, rowSelector: any): void {
        const grid = this.get(id);
        if (grid.primaryKey !== undefined && grid.primaryKey !== null) {
            const editableCell = this.get_cell_inEditMode(id);
            if (editableCell && editableCell.cellID.rowID === rowSelector) {
                this.escape_editMode(id, editableCell.cellID);
            }
            this.update_row_implementation(id, value, rowSelector);
            grid.cdr.markForCheck();
            this.refresh_search(id);
        }
    }

    public update_row_implementation(id: string, value: any, rowID: any): void {
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

    public enable_summaries(id: string, rest) {
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this.multiple_summaries(id, rest[0], true);
        } else {
            this.summaries(id, rest[0], true, rest[1]);
        }
        const grid = this.get(id);
        grid.summariesHeight = 0;
        this.mark_for_check(id);
        this.calculate_grid_height(id);
        grid.cdr.detectChanges();
    }

    public disable_summaries(id: string, rest) {
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this.disable_multiple_summaries(id, rest[0]);
        } else {
            this.summaries(id, rest[0], false);
        }
        const grid = this.get(id);
        grid.summariesHeight = 0;
        this.mark_for_check(id);
        this.calculate_grid_height(id);
        grid.cdr.detectChanges();
    }

    public recalculate_summaries(id: string) {
        this.get(id).summariesHeight = 0;
        requestAnimationFrame(() => this.reflow(id));
    }

    public clear_summary_cache(id: string, editCell) {
        if (editCell && editCell.cell) {
            this.remove_summary(id, editCell.cell.column.filed);
        } else {
            this.remove_summary(id);
        }
    }

    private summaries(id: string, fieldName: string, hasSummary: boolean, summaryOperand?: any) {
        const column = this.get_column_by_name(id, fieldName);
        column.hasSummary = hasSummary;
        if (summaryOperand) {
            column.summaries = summaryOperand;
        }
    }

    private multiple_summaries(id: string, expressions: ISummaryExpression[], hasSummary: boolean) {
        expressions.forEach((element) => {
            this.summaries(id, element.fieldName ? element.fieldName : element.toString(), hasSummary, element.customSummary);
        });
    }

    private disable_multiple_summaries(id: string, expressions: string[]) {
        expressions.forEach((column) => { this.summaries(id, column, false); });
    }

    public paginate(id: string, val: number) {
        const grid = this.get(id);
        if (val < 0 || val > grid.totalPages - 1) {
            return;
        }

        grid.page = val;
    }

    public next_page(id: string) {
        const grid = this.get(id);
        if (!grid.isLastPage) {
            grid.page += 1;
        }
    }

    public previous_page(id: string) {
        const grid = this.get(id);
        if (!grid.isFirstPage) {
            grid.page -= 1;
        }
    }

    public on_key_down_page_down(id: string, event) {
        const grid = this.get(id);
        event.preventDefault();
        grid.verticalScrollContainer.scrollNextPage();
        grid.nativeElement.focus();
    }

    public on_key_down_page_up(id: string, event) {
        const grid = this.get(id);
        event.preventDefault();
        grid.verticalScrollContainer.scrollPrevPage();
        grid.nativeElement.focus();
    }

    public scroll_handler(id: string, event) {
        const grid = this.get(id);
        grid.parentVirtDir.getHorizontalScroll().scrollLeft += event.target.scrollLeft;
        grid.verticalScrollContainer.getVerticalScroll().scrollTop += event.target.scrollTop;
        event.target.scrollLeft = 0;
        event.target.scrollTop = 0;
    }
}

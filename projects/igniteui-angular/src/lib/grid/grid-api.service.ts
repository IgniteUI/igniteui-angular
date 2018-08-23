import { IGridAPIService } from '../grid-common/api.service';
import { IgxGridComponent } from './grid.component';

import { cloneArray } from '../core/utils';
import { DataUtil } from '../data-operations/data-util';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';

export class IgxGridAPIService extends IGridAPIService<IgxGridComponent> {

    private static getLevelIncrement(currentIncrement, currentHierarchy, prevHierarchy) {
        if (currentHierarchy !== prevHierarchy && !!prevHierarchy && !!currentHierarchy) {
            return IgxGridAPIService.getLevelIncrement(++currentIncrement, currentHierarchy.groupParent, prevHierarchy.groupParent);
        } else {
            return currentIncrement;
        }
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

    public refreshSearch(id: string, updateActiveInfo?: boolean) {
        const grid = this.get(id);
        if (grid.lastSearchInfo.searchText) {
            this.rebuildMatchCache(id);

            if (updateActiveInfo) {
                const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(id);
                grid.lastSearchInfo.matchInfoCache.forEach((match, i) => {
                    if (match.column === activeInfo.columnIndex &&
                        match.row === activeInfo.rowIndex &&
                        match.index === activeInfo.index &&
                        match.page === activeInfo.page) {
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
        if (!grid.rowList) {
            return 0;
        }

        const editModeCell = this.get_cell_inEditMode(id);
        if (editModeCell) {
            this.escape_editMode(id);
        }

        if (grid.lastSearchInfo.collapsedHighlightedItem) {
            grid.lastSearchInfo.collapsedHighlightedItem = null;
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
                collapsedHighlightedItem: null,
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
                columnIndex: matchInfo.column,
                rowIndex: matchInfo.row,
                index: matchInfo.index,
                page: matchInfo.page
            });

            if (scroll !== false) {
                this.scrollTo(id, matchInfo.row, matchInfo.column, matchInfo.page, matchInfo.groupByRecord);
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
            collapsedHighlightedItem: null,
            matchInfoCache: []
        };

        this.get(id).dataRowList.forEach((row) => {
            row.cells.forEach((c) => {
                c.clearHighlight();
            });
        });
    }

    private scrollTo(id: string, row: number, column: number, page: number, groupByRecord?: IGroupByRecord): void {
        const grid = this.get(id);

        if (grid.paging) {
            grid.page = page;
        }

        if (groupByRecord && !grid.isExpandedGroup(groupByRecord)) {
            grid.toggleGroup(groupByRecord);
        }

        this.scrollDirective(id, grid.verticalScrollContainer, row);

        const scrollRow = grid.rowList.find(r => r.virtDirRow);
        const virtDir = scrollRow ? scrollRow.virtDirRow : null;

        if (grid.pinnedColumns.length) {
            if (column >= grid.pinnedColumns.length) {
                column -= grid.pinnedColumns.length;
                this.scrollDirective(id, virtDir, column);
            }
        } else {
            this.scrollDirective(id, virtDir, column);
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

        const groupIndexData = this.getGroupIncrementData(id);
        const groupByRecords = this.getGroupByRecords(id);
        let collapsedRowsCount = 0;

        data.forEach((dataRow, i) => {
            const groupByRecord = groupByRecords ? groupByRecords[i] : null;
            const groupByIncrement = groupIndexData ? groupIndexData[i] : 0;
            const pagingIncrement = this.getPagingIncrement(id, groupByIncrement, groupIndexData, Math.floor(i / grid.perPage));
            let rowIndex = grid.paging ? (i % grid.perPage) + pagingIncrement : i + groupByIncrement;

            if (grid.paging && i % grid.perPage === 0) {
                collapsedRowsCount = 0;
            }

            rowIndex -= collapsedRowsCount;

            if (groupByRecord && !grid.isExpandedGroup(groupByRecord)) {
                collapsedRowsCount++;
            }
            columnItems.forEach((c, j) => {
                const value = c.formatter ? c.formatter(dataRow[c.field]) : dataRow[c.field];
                if (value !== undefined && value !== null && c.searchable) {
                    let searchValue = caseSensitive ? String(value) : String(value).toLowerCase();
                    const pageIndex = grid.paging ? Math.floor(i / grid.perPage) : 0;

                    if (exactMatch) {
                        if (searchValue === searchText) {
                            grid.lastSearchInfo.matchInfoCache.push({
                                row: rowIndex,
                                column: j,
                                page: pageIndex,
                                index: 0,
                                groupByRecord: groupByRecord,
                                item: dataRow
                            });
                        }
                    } else {
                        let occurenceIndex = 0;
                        let searchIndex = searchValue.indexOf(searchText);

                        while (searchIndex !== -1) {
                            grid.lastSearchInfo.matchInfoCache.push({
                                row: rowIndex,
                                column: j,
                                page: pageIndex,
                                index: occurenceIndex++,
                                groupByRecord: groupByRecord,
                                item: dataRow
                            });

                            searchValue = searchValue.substring(searchIndex + searchText.length);
                            searchIndex = searchValue.indexOf(searchText);
                        }
                    }
                }
            });
        });
    }

    // This method's idea is to get by how much each data row is offset by the group by rows before it.
    private getGroupIncrementData(id: string): number[] {
        const grid = this.get(id);
        if (grid.groupingExpressions && grid.groupingExpressions.length) {
            const groupsRecords = this.getGroupByRecords(id);
            const groupByIncrements = [];
            const values = [];

            let prevHierarchy = null;
            let increment = 0;

            groupsRecords.forEach((gbr) => {
                if (values.indexOf(gbr) === -1) {
                    let levelIncrement = 1;

                    if (prevHierarchy !== null) {
                        levelIncrement += IgxGridAPIService.getLevelIncrement(0, gbr.groupParent, prevHierarchy.groupParent);
                    } else {
                        // This is the first level we stumble upon, so we haven't accounted for any of its parents
                        levelIncrement += gbr.level;
                    }

                    increment += levelIncrement;
                    prevHierarchy = gbr;
                    values.push(gbr);
                }

                groupByIncrements.push(increment);
            });
            return groupByIncrements;
        } else {
            return null;
        }
    }

    public getGroupByRecords(id: string): IGroupByRecord[] {
        const grid = this.get(id);
        if (grid.groupingExpressions && grid.groupingExpressions.length) {
            const state = {
                expressions: grid.groupingExpressions,
                expansion: grid.groupingExpansionState,
                defaultExpanded: grid.groupsExpanded
            };

            return DataUtil.group(cloneArray(grid.filteredSortedData), state).metadata;
        } else {
            return null;
        }
    }

    // For paging we need just the increment between the start of the page and the current row
    private getPagingIncrement(id: string, groupByIncrement: number, groupIndexData: number[], page: number) {
        const grid = this.get(id);
        let pagingIncrement = 0;

        if (grid.paging && groupByIncrement) {
            const lastRowOnPrevPageInrement = page ? groupIndexData[page * grid.perPage - 1] : 0;
            const firstRowOnThisPageInrement = groupIndexData[page * grid.perPage];
            // If the page ends in the middle of the group, on the next page there is
            // one additional group by row. We need to account for this.
            const additionalPagingIncrement = lastRowOnPrevPageInrement === firstRowOnThisPageInrement ? 1 : 0;
            pagingIncrement = groupByIncrement - lastRowOnPrevPageInrement + additionalPagingIncrement;
        }

        return pagingIncrement;
    }

    public restoreHighlight(id: string): void {
        const grid = this.get(id);
        if (grid.lastSearchInfo.searchText) {
            const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(grid.id);
            const matchInfo = grid.lastSearchInfo.matchInfoCache[grid.lastSearchInfo.activeMatchIndex];
            const data = grid.filteredSortedData;
            const groupByIncrements = this.getGroupIncrementData(id);

            const rowIndex = matchInfo ? data.indexOf(matchInfo.item) : -1;
            const page = grid.paging ? Math.floor(rowIndex / grid.perPage) : 0;
            let increment = groupByIncrements && rowIndex !== -1 ? groupByIncrements[rowIndex] : 0;
            if (grid.paging && increment) {
                increment = this.getPagingIncrement(id, increment, groupByIncrements, page);
            }

            const row = grid.paging ? (rowIndex % grid.perPage) + increment : rowIndex + increment;

            this.rebuildMatchCache(id);

            if (rowIndex !== -1) {
                if (grid.lastSearchInfo.collapsedHighlightedItem && groupByIncrements !== null) {
                    grid.lastSearchInfo.collapsedHighlightedItem.info.page = page;
                    grid.lastSearchInfo.collapsedHighlightedItem.info.rowIndex = row;
                } else {
                    IgxTextHighlightDirective.setActiveHighlight(id, {
                        columnIndex: activeInfo.columnIndex,
                        rowIndex: row,
                        index: activeInfo.index,
                        page: page
                    });

                    grid.lastSearchInfo.matchInfoCache.forEach((match, i) => {
                        if (match.column === activeInfo.columnIndex &&
                            match.row === row &&
                            match.index === activeInfo.index &&
                            match.page === page) {
                            grid.lastSearchInfo.activeMatchIndex = i;
                        }
                    });
                }
            } else {
                grid.lastSearchInfo.activeMatchIndex = 0;
                this.find(id, grid.lastSearchInfo.searchText, 0, grid.lastSearchInfo.caseSensitive, grid.lastSearchInfo.exactMatch, false);
            }
        }
    }
}

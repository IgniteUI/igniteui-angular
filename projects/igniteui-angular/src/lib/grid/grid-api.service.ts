import { IGridAPIService } from '../grid-common/api.service';
import { IgxGridComponent } from './grid.component';

import { cloneArray } from '../core/utils';
import { DataUtil } from '../data-operations/data-util';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';

export class IgxGridAPIService extends IGridAPIService<IgxGridComponent> {

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

    public on_after_content_init(id: string) {
        const grid = this.get(id);
        if (grid.groupTemplate) {
            grid.groupRowTemplate = grid.groupTemplate.template;
        }

        super.on_after_content_init(id);
    }

    public get_group_area_height(id: string): number {
        const grid = this.get(id);
        return grid.groupArea ? grid.groupArea.nativeElement.offsetHeight : 0;
    }

    protected remove_grouping_expression(id, fieldName) {
        const groupingExpressions = this.get(id).groupingExpressions;
        const index = groupingExpressions.findIndex((expr) => expr.fieldName === fieldName);
        if (index !== -1) {
            groupingExpressions.splice(index, 1);
        }
    }

    public group_by(id: string, fieldName: string, dir: SortingDirection, ignoreCase: boolean): void {
        const groupingState = cloneArray(this.get(id).groupingExpressions);
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        this.prepare_sorting_expression([sortingState, groupingState], { fieldName, dir, ignoreCase });
        this.get(id).groupingExpressions = groupingState;
        this.arrange_sorting_expressions(id);
    }

    public group_by_multiple(id: string, expressions: ISortingExpression[]): void {
        const groupingState = cloneArray(this.get(id).groupingExpressions);
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        for (const each of expressions) {
            this.prepare_sorting_expression([sortingState, groupingState], each);
        }

        this.get(id).groupingExpressions = groupingState;
        this.arrange_sorting_expressions(id);
    }

    public clear_group_by(id: string, name?: string) {
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

    public group_by_get_expanded_for_group(id: string, groupRow: IGroupByRecord): IGroupByExpandState {
        const grState = this.get(id).groupingExpansionState;
        const hierarchy = DataUtil.getHierarchy(groupRow);
        return grState.find((state) =>
            DataUtil.isHierarchyMatch(state.hierarchy || [{ fieldName: groupRow.expression.fieldName, value: groupRow.value }], hierarchy));
    }

    public group_by_toggle_group(id: string, groupRow: IGroupByRecord) {
        const grid = this.get(id);
        const expansionState = grid.groupingExpansionState;

        const state: IGroupByExpandState = this.group_by_get_expanded_for_group(id, groupRow);
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

    public scroll_to(id: string, row: any | number, column: any | number): void {
        const grid = this.get(id);
        if (grid.groupingExpressions && grid.groupingExpressions.length) {
            const groupByRecords = this.get_group_by_records(id);
            const rowIndex = grid.filteredSortedData.indexOf(row);
            const groupByRecord = groupByRecords[rowIndex];

            if (groupByRecord && !grid.isExpandedGroup(groupByRecord)) {
                grid.toggleGroup(groupByRecord);
            }
        }

        super.scroll_to(id, row, column);
    }

    private get_group_by_records(id: string): IGroupByRecord[] {
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

    public get_pinned_width(id: string, takeHidden: boolean) {
        const grid = this.get(id);
        let sum = super.get_pinned_width(id, takeHidden);

        if (grid.groupingExpressions.length > 0 && grid.headerGroupContainer) {
            sum += grid.headerGroupContainer.nativeElement.clientWidth;
        }

        return sum;
    }
}

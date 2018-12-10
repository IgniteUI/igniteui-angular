import { GridBaseAPIService } from '../api.service';
import { IgxGridComponent } from './grid.component';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { DataUtil } from '../../data-operations/data-util';
import { cloneArray } from '../../core/utils';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';

export class IgxGridAPIService extends GridBaseAPIService<IgxGridComponent> {

    public groupBy(id: string, expression: IGroupingExpression): void {
        const groupingState = cloneArray(this.get(id).groupingExpressions);
        const sortingState = cloneArray(this.get(id).sortingExpressions);
        this.prepare_sorting_expression([sortingState, groupingState], expression);
        this.get(id).groupingExpressions = groupingState;
        this.arrange_sorting_expressions(id);
    }

    public groupBy_multiple(id: string, expressions: IGroupingExpression[]): void {
        const groupingState = cloneArray(this.get(id).groupingExpressions);
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        for (const each of expressions) {
            this.prepare_sorting_expression([sortingState, groupingState], each);
        }

        this.get(id).groupingExpressions = groupingState;
        this.arrange_sorting_expressions(id);
    }

    public clear_groupby(id: string, name?: string | Array<string>) {
        const groupingState = cloneArray(this.get(id).groupingExpressions);
        const sortingState = cloneArray(this.get(id).sortingExpressions);

        if (name) {
            const names = typeof name === 'string' ? [ name ] : name;
            const groupedCols = groupingState.filter((state) => names.indexOf(state.fieldName) < 0);
            const newSortingExpr = sortingState.filter((state) => names.indexOf(state.fieldName) < 0);
            this.get(id).groupingExpressions = groupedCols;
            this.get(id).sortingExpressions = newSortingExpr;
            names.forEach((colName) => {
                const grExprIndex = groupingState.findIndex((exp) => exp.fieldName === colName);
                const grpExpandState = this.get(id).groupingExpansionState;
                /* remove expansion states related to the cleared group
                and all with deeper hierarchy than the cleared group */
                this.get(id).groupingExpansionState = grpExpandState
                    .filter((val) => {
                        return val.hierarchy && val.hierarchy.length <= grExprIndex;
                    });
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

    public groupBy_is_row_in_group(id: string, groupRow: IGroupByRecord, rowID): boolean {
        const grid = this.get(id);
        let rowInGroup = false;
        groupRow.records.forEach(row => {
            if (grid.primaryKey ? row[grid.primaryKey] === rowID : row === rowID) {
                rowInGroup = true;
            }
        });
        return rowInGroup;
    }

    public groupBy_toggle_group(id: string, groupRow: IGroupByRecord) {
        const grid = this.get(id);
        const expansionState = grid.groupingExpansionState;
        let toggleRowEditingOverlay: boolean;
        let isEditRowInGroup = false;
        if (grid.rowEditable) {
            const rowState = this.get_edit_row_state(id);

            // Toggle only row editing overlays that are inside current expanded/collapsed group.
            isEditRowInGroup = rowState ? this.groupBy_is_row_in_group(id, groupRow, this.get_edit_row_state(id).rowID) : false;
        }
        const state: IGroupByExpandState = this.groupBy_get_expanded_for_group(id, groupRow);
        if (state) {
            state.expanded = !state.expanded;
            if (isEditRowInGroup) {
                toggleRowEditingOverlay = state.expanded;
            }
        } else {
            expansionState.push({
                expanded: !grid.groupsExpanded,
                hierarchy: DataUtil.getHierarchy(groupRow)
            });
            if (isEditRowInGroup) {
                toggleRowEditingOverlay = false;
            }
        }
        this.get(id).groupingExpansionState = expansionState;
        if (grid.rowEditable) {
            grid.repositionRowEditingOverlay(grid.rowInEditMode);
        }
    }

    protected remove_grouping_expression(id, fieldName) {
        const groupingExpressions = this.get(id).groupingExpressions;
        const index = groupingExpressions.findIndex((expr) => expr.fieldName === fieldName);
        if (index !== -1) {
            groupingExpressions.splice(index, 1);
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

    public get_groupBy_record_id(gRow: IGroupByRecord): string {
        let recordId = '{ ';
        const hierrarchy = DataUtil.getHierarchy(gRow);

        for (let i = 0; i < hierrarchy.length; i++) {
            const groupByKey = hierrarchy[i];
            recordId += `'${groupByKey.fieldName}': '${groupByKey.value}'`;

            if (i < hierrarchy.length - 1) {
                recordId += ', ';
            }
        }
        recordId += ' }';

        return recordId;
    }

}

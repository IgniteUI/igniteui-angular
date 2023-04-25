import { GridBaseAPIService } from '../api.service';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { DataUtil } from '../../data-operations/data-util';
import { cloneArray } from '../../core/utils';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { Injectable } from '@angular/core';
import { GridServiceType, GridType } from '../common/grid.interface';

@Injectable()
export class IgxGridAPIService extends GridBaseAPIService<GridType> implements GridServiceType {

    public groupBy(expression: IGroupingExpression): void {
        const groupingState = cloneArray(this.grid.groupingExpressions);
        this.prepare_grouping_expression([groupingState], expression);
        this.grid.groupingExpressions = groupingState;
        this.arrange_sorting_expressions();
    }

    public groupBy_multiple(expressions: IGroupingExpression[]): void {
        const groupingState = cloneArray(this.grid.groupingExpressions);

        for (const each of expressions) {
            this.prepare_grouping_expression([groupingState], each);
        }

        this.grid.groupingExpressions = groupingState;
        this.arrange_sorting_expressions();
    }

    public override clear_groupby(name?: string | Array<string>) {
        const groupingState = cloneArray(this.grid.groupingExpressions);

        if (name) {
            const names = typeof name === 'string' ? [name] : name;
            const groupedCols = groupingState.filter((state) => names.indexOf(state.fieldName) < 0);
            this.grid.groupingExpressions = groupedCols;
            names.forEach((colName) => {
                const grExprIndex = groupingState.findIndex((exp) => exp.fieldName === colName);
                const grpExpandState = this.grid.groupingExpansionState;
                /* remove expansion states related to the cleared group
                   and all with deeper hierarchy than the cleared group */
                const newExpandState = grpExpandState.filter((val) => val.hierarchy && val.hierarchy.length <= grExprIndex);
                /* Do not set the new instance produced by filter
                    when there are no differences between expansion states */
                if (newExpandState.length !== grpExpandState.length) {
                    this.grid.groupingExpansionState = newExpandState;
                }
            });
        } else {
            // clear all
            this.grid.groupingExpressions = [];
            this.grid.groupingExpansionState = [];
        }
    }

    public groupBy_get_expanded_for_group(groupRow: IGroupByRecord): IGroupByExpandState {
        const grState = this.grid.groupingExpansionState;
        const hierarchy = DataUtil.getHierarchy(groupRow);
        return grState.find((state) =>
            DataUtil.isHierarchyMatch(
                state.hierarchy || [{ fieldName: groupRow.expression.fieldName, value: groupRow.value }],
                hierarchy,
                this.grid.groupingExpressions));
    }

    public groupBy_is_row_in_group(groupRow: IGroupByRecord, rowID): boolean {
        const grid = this.grid;
        let rowInGroup = false;
        groupRow.records.forEach(row => {
            if (grid.primaryKey ? row[grid.primaryKey] === rowID : row === rowID) {
                rowInGroup = true;
            }
        });
        return rowInGroup;
    }

    public groupBy_toggle_group(groupRow: IGroupByRecord) {
        const grid = this.grid;
        if (grid.gridAPI.crudService.cellInEditMode) {
            this.crudService.endEdit(false);
        }

        const expansionState = grid.groupingExpansionState;
        const state: IGroupByExpandState = this.groupBy_get_expanded_for_group(groupRow);
        if (state) {
            state.expanded = !state.expanded;
        } else {
            expansionState.push({
                expanded: !grid.groupsExpanded,
                hierarchy: DataUtil.getHierarchy(groupRow)
            });
        }
        this.grid.groupingExpansionState = [...expansionState];
        if (grid.rowEditable) {
            grid.repositionRowEditingOverlay(grid.gridAPI.crudService.rowInEditMode);
        }
    }
    public set_grouprow_expansion_state(groupRow: IGroupByRecord, value: boolean) {
        if (this.grid.isExpandedGroup(groupRow) !== value) {
            this.groupBy_toggle_group(groupRow);
        }
    }

    public groupBy_fully_expand_group(groupRow: IGroupByRecord) {
        const state: IGroupByExpandState = this.groupBy_get_expanded_for_group(groupRow);
        const expanded = state ? state.expanded : this.grid.groupsExpanded;
        if (!expanded) {
            this.groupBy_toggle_group(groupRow);
        }
        if (groupRow.groupParent) {
            this.groupBy_fully_expand_group(groupRow.groupParent);
        }
    }

    public groupBy_select_all_rows_in_group(groupRow: IGroupByRecord, clearPrevSelection: boolean) {
        this.grid.selectionService.selectRowsWithNoEvent(this.grid.primaryKey ?
            groupRow.records.map(x => x[this.grid.primaryKey]) : groupRow.records, clearPrevSelection);
    }

    public groupBy_deselect_all_rows_in_group(groupRow: IGroupByRecord) {
        this.grid.selectionService.deselectRowsWithNoEvent(this.grid.primaryKey ?
            groupRow.records.map(x => x[this.grid.primaryKey]) : groupRow.records);
    }

    public arrange_sorting_expressions() {
        const groupingState = this.grid.groupingExpressions;
        const sortingState = cloneArray(this.grid.sortingExpressions);
        for (const grExpr of groupingState) {
            const sortExprIndex = sortingState.findIndex((exp) => exp.fieldName === grExpr.fieldName);
            if (sortExprIndex > -1) {
                sortingState.splice(sortExprIndex, 1);
            }
        }
        this.grid.sortingExpressions = sortingState;
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

    public override remove_grouping_expression(fieldName: string) {
        const groupingExpressions = this.grid.groupingExpressions;
        const index = groupingExpressions.findIndex((expr) => expr.fieldName === fieldName);
        if (index !== -1) {
            groupingExpressions.splice(index, 1);
        }
    }
}

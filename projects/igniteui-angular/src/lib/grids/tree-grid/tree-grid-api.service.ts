import { GridBaseAPIService } from '../api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { cloneArray, mergeObjects } from '../../core/utils';
import { DataUtil, DataType } from '../../data-operations/data-util';
import { ISortingExpression, SortingDirection } from '../../data-operations/sorting-expression.interface';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';
import { IRowToggleEventArgs } from './tree-grid.interfaces';
import { IgxExpansionPanelDescriptionDirective } from '../../expansion-panel/expansion-panel.directives';
import { IgxColumnComponent } from '../column.component';

export class IgxTreeGridAPIService extends GridBaseAPIService<IgxTreeGridComponent> {
    public get_all_data(id: string, transactions?: boolean): any[] {
        const grid = this.get(id);
        const data = transactions ? grid.dataWithAddedInTransactionRows : grid.flatData;
        return data ? data : [];
    }

    public expand_row(id: string, rowID: any) {
        const grid = this.get(id);
        const expandedStates = grid.expansionStates;
        expandedStates.set(rowID, true);
        grid.expansionStates = expandedStates;
    }

    public collapse_row(id: string, rowID: any) {
        const grid = this.get(id);
        const expandedStates = grid.expansionStates;
        expandedStates.set(rowID, false);
        grid.expansionStates = expandedStates;
    }

    public toggle_row_expansion(id: string, rowID: any) {
        const grid = this.get(id);
        const expandedStates = grid.expansionStates;
        const treeRecord = grid.records.get(rowID);

        if (treeRecord) {
            const isExpanded = this.get_row_expansion_state(id, rowID, treeRecord.level);
            expandedStates.set(rowID, !isExpanded);
            grid.expansionStates = expandedStates;
        }
    }

    public trigger_row_expansion_toggle(id: string, row: IgxTreeGridRowComponent, event: Event) {
        const grid = this.get(id);
        const expanded = !row.treeRow.expanded;

        const args: IRowToggleEventArgs = {
            row: row,
            expanded: expanded,
            event: event,
            cancel: false
        };
        grid.onRowToggle.emit(args);

        if (args.cancel) {
            return;
        }

        const expandedStates = grid.expansionStates;
        expandedStates.set(row.rowID, expanded);
        grid.expansionStates = expandedStates;
    }

    public get_row_expansion_state(id: string, rowID: any, indentationLevel: number): boolean {
        const grid = this.get(id);
        const states = grid.expansionStates;
        const expanded = states.get(rowID);

        if (expanded !== undefined) {
            return expanded;
        } else {
            return indentationLevel < grid.expansionDepth;
        }
    }

    public add_child_row(id: string, parentRowID: any, data: any) {
        const grid = this.get(id);
        const parentRecord = grid.records.get(parentRowID);

        if (!parentRecord) {
            throw Error('Invalid parent row ID!');
        }

        if (grid.primaryKey && grid.foreignKey) {
            data[grid.foreignKey] = parentRowID;
            grid.addRow(data);
        } else {
            const parentData = parentRecord.data;
            const childKey = grid.childDataKey;
            if (!parentData[childKey]) {
                parentData[childKey] = [];
            }
            parentData[childKey].push(data);

            grid.onRowAdded.emit({ data });
            (grid as any)._pipeTrigger++;
            grid.cdr.markForCheck();

            grid.refreshSearch();
        }
    }

    protected update_row_in_array(id: string, value: any, rowID: any, index: number) {
        const grid = this.get(id);
        if (grid.primaryKey && grid.foreignKey) {
            super.update_row_in_array(id, value, rowID, index);
        } else {
            const record = grid.records.get(rowID);
            const childData = record.parent ? record.parent.data[grid.childDataKey] : grid.data;
            index = grid.primaryKey ? childData.map(c => c[grid.primaryKey]).indexOf(rowID) :
                childData.indexOf(rowID);
            childData[index] = value;
        }
    }

    public should_apply_number_style(column: IgxColumnComponent): boolean {
        return column.dataType === DataType.Number && column.visibleIndex !== 0;
    }
}

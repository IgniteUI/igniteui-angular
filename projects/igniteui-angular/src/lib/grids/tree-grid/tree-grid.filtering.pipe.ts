import { Pipe, PipeTransform } from '@angular/core';
import { DataUtil } from '../../data-operations/data-util';
import { GridBaseAPIService } from '../api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { BaseFilteringStrategy, IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringState } from '../../data-operations/filtering-state.interface';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IgxGridBaseDirective } from '../grid/public_api';
import { GridType } from '../common/grid.interface';
import { resolveNestedPath, parseDate } from '../../core/utils';

/** @hidden */
export class TreeGridFilteringStrategy extends BaseFilteringStrategy {
    public filter(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): ITreeGridRecord[] {
        return this.filterImpl(data, expressionsTree, advancedExpressionsTree, undefined, grid);
    }

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false): any {
        const hierarchicalRecord = rec as ITreeGridRecord;
        let value = resolveNestedPath(hierarchicalRecord.data, fieldName);
        value = value && isDate ? parseDate(value) : value;
        return value;
    }

    private filterImpl(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree: IFilteringExpressionsTree, parent: ITreeGridRecord, grid?: GridType): ITreeGridRecord[] {
        let i: number;
        let rec: ITreeGridRecord;
        const len = data.length;
        const res: ITreeGridRecord[] = [];
        if ((FilteringExpressionsTree.empty(expressionsTree) && FilteringExpressionsTree.empty(advancedExpressionsTree)) || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = DataUtil.cloneTreeGridRecord(data[i]);
            rec.parent = parent;
            if (rec.children) {
                const filteredChildren = this.filterImpl(rec.children, expressionsTree, advancedExpressionsTree, rec, grid);
                rec.children = filteredChildren.length > 0 ? filteredChildren : null;
            }

            if (this.matchRecord(rec, expressionsTree, grid) && this.matchRecord(rec, advancedExpressionsTree, grid)) {
                res.push(rec);
            } else if (rec.children && rec.children.length > 0) {
                rec.isFilteredOutParent = true;
                res.push(rec);
            }
        }
        return res;
    }
}

/** @hidden */
@Pipe({
    name: 'treeGridFiltering',
    pure: true
})
export class IgxTreeGridFilteringPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>) {
        this.gridAPI = gridAPI as IgxTreeGridAPIService;
     }

    public transform(hierarchyData: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        filterStrategy: IFilteringStrategy,
        advancedFilteringExpressionsTree: IFilteringExpressionsTree,
        _: number, __: number, pinned?): ITreeGridRecord[] {
        const grid: IgxTreeGridComponent = this.gridAPI.grid;
        const state: IFilteringState = {
            expressionsTree,
            advancedExpressionsTree: advancedFilteringExpressionsTree,
            strategy: new TreeGridFilteringStrategy()
        };

        if (filterStrategy) {
            state.strategy = filterStrategy;
        }

        this.resetFilteredOutProperty(grid.records);

        if (FilteringExpressionsTree.empty(state.expressionsTree) && FilteringExpressionsTree.empty(state.advancedExpressionsTree)) {
            grid.setFilteredData(null, pinned);
            return hierarchyData;
        }

        const result = this.filter(hierarchyData, state, grid);
        const filteredData: any[] = [];
        this.expandAllRecursive(grid, result, grid.expansionStates, filteredData);
        grid.setFilteredData(filteredData, pinned);

        return result;
    }

    private resetFilteredOutProperty(map: Map<any, ITreeGridRecord>) {
        const keys = Array.from(map.keys());
        for (const key of keys) {
            map.get(key).isFilteredOutParent = undefined;
        }
    }

    private expandAllRecursive(grid: IgxTreeGridComponent, data: ITreeGridRecord[],
        expandedStates: Map<any, boolean>, filteredData: any[]) {
        for (const rec of data) {
            filteredData.push(rec.data);
            this.updateNonProcessedRecord(grid, rec);

            if (rec.children && rec.children.length > 0) {
                expandedStates.set(rec.rowID, true);
                this.expandAllRecursive(grid, rec.children, expandedStates, filteredData);
            }
        }
    }

    private updateNonProcessedRecord(grid: IgxTreeGridComponent, record: ITreeGridRecord) {
        const rec = grid.records.get(record.rowID);
        rec.isFilteredOutParent = record.isFilteredOutParent;
    }

    private filter(data: ITreeGridRecord[], state: IFilteringState, grid?: GridType): ITreeGridRecord[] {
        return state.strategy.filter(data, state.expressionsTree, state.advancedExpressionsTree, grid);
    }
}

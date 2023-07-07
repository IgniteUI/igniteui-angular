import { Inject, Pipe, PipeTransform } from '@angular/core';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringState } from '../../data-operations/filtering-state.interface';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';
import { TreeGridFilteringStrategy } from './tree-grid.filtering.strategy';

/** @hidden */
@Pipe({
    name: 'treeGridFiltering',
    standalone: true
})
export class IgxTreeGridFilteringPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) {}

    public transform(hierarchyData: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        filterStrategy: IFilteringStrategy,
        advancedFilteringExpressionsTree: IFilteringExpressionsTree,
        _: number, __: number, pinned?): ITreeGridRecord[] {
        const state: IFilteringState = {
            expressionsTree,
            advancedExpressionsTree: advancedFilteringExpressionsTree,
            strategy: new TreeGridFilteringStrategy()
        };

        if (filterStrategy) {
            state.strategy = filterStrategy;
        }

        if (FilteringExpressionsTree.empty(state.expressionsTree) && FilteringExpressionsTree.empty(state.advancedExpressionsTree)) {
            this.grid.setFilteredData(null, pinned);
            return hierarchyData;
        }

        const result = this.filter(hierarchyData, state, this.grid);
        const filteredData: any[] = [];
        this.expandAllRecursive(this.grid, result, this.grid.expansionStates, filteredData);
        this.grid.setFilteredData(filteredData, pinned);

        return result;
    }

    private expandAllRecursive(grid: GridType, data: ITreeGridRecord[],
        expandedStates: Map<any, boolean>, filteredData: any[]) {
        for (const rec of data) {
            filteredData.push(rec.data);

            if (rec.children && rec.children.length > 0) {
                expandedStates.set(rec.key, true);
                this.expandAllRecursive(grid, rec.children, expandedStates, filteredData);
            }
        }
    }

    private filter(data: ITreeGridRecord[], state: IFilteringState, grid?: GridType): ITreeGridRecord[] {
        return state.strategy.filter(data, state.expressionsTree, state.advancedExpressionsTree, grid);
    }
}

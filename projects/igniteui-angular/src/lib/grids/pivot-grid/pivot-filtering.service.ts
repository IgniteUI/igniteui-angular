import { Injectable } from '@angular/core';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { FilteringLogic } from '../../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { PivotUtil } from './pivot-util';

@Injectable()
export class IgxPivotFilteringService extends IgxFilteringService {
    protected filter_internal(fieldName: string, term, conditionOrExpressionsTree: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase: boolean) {
        super.filter_internal(fieldName, term, conditionOrExpressionsTree, ignoreCase);
        const grid = this.grid;
        const config = (grid as IgxPivotGridComponent).pivotConfiguration;
        const allDimensions = PivotUtil.flatten(config.rows.concat(config.columns).concat(config.filters).filter(x => x !== null));
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);
        const dim = enabledDimensions.find(x => x.fieldName === fieldName || x.member === fieldName);
        const filteringTree = dim.filters || new FilteringExpressionsTree(FilteringLogic.And);
        const fieldFilterIndex = filteringTree.findIndex(fieldName);
        if (fieldFilterIndex > -1) {
            filteringTree.filteringOperands.splice(fieldFilterIndex, 1);
        }

        this.prepare_filtering_expression(filteringTree, fieldName, term, conditionOrExpressionsTree, ignoreCase, fieldFilterIndex);
        dim.filters = filteringTree;
        grid.filteringPipeTrigger++;
        if (PivotUtil.flatten(config.columns).indexOf(dim) !== -1) {
            // update columns
            (grid as any).setupColumns();
        }
    }
    public clearFilter(field: string): void {
        this.clear_filter(field);
    }

    public clear_filter(fieldName: string) {
        super.clear_filter(fieldName);
        const grid = this.grid;
        const config = (grid as IgxPivotGridComponent).pivotConfiguration;
        const allDimensions = PivotUtil.flatten(config.rows.concat(config.columns).concat(config.filters).filter(x => x !== null));
        const enabledDimensions = allDimensions.filter(x => x && x.enabled);
        const dim = enabledDimensions.find(x => x.fieldName === fieldName || x.member === fieldName);
        dim.filters = undefined;
        grid.filteringPipeTrigger++;
        if (PivotUtil.flatten(config.columns).indexOf(dim) !== -1) {
            // update columns
            (grid as any).setupColumns();
        }
    }

}

import { Component, EnvironmentInjector, Inject, Injector, ViewContainerRef } from '@angular/core';
import { IGX_GRID_SERVICE_BASE, GridServiceType, IPinningConfig}  from '../../../igniteui-angular/src/lib/grids/common/grid.interface';
import { IFilteringExpressionsTree } from '../../../igniteui-angular/src/lib/data-operations/filtering-expressions-tree';
import { IPagingState } from '../../../igniteui-angular/src/lib/data-operations/paging-state.interface';
import { ISortingExpression } from '../../../igniteui-angular/src/lib/data-operations/sorting-strategy';
import { IGroupingState } from '../../../igniteui-angular/src/lib/data-operations/groupby-state.interface';
import { GridSelectionRange } from '../../../igniteui-angular/src/lib/grids/common/types';
import { IPivotConfiguration } from '../../../igniteui-angular/src/lib/grids/pivot-grid/pivot-grid.interface'
import { GridFeatures, IColumnState, IGridStateCollection, IgxGridStateBaseDirective } from '../../../igniteui-angular/src/lib/grids/state-base.directive';

/* tsPlainInterface */
/* marshalByValue */
export interface IGridStateInfo {
    columns?: IColumnState[];
    filtering?: IFilteringExpressionsTree;
    advancedFiltering?: IFilteringExpressionsTree;
    paging?: IPagingState;
    moving?: boolean;
    sorting?: ISortingExpression[];
    groupBy?: IGroupingState;
    cellSelection?: GridSelectionRange[];
    rowSelection?: any[];
    columnSelection?: string[];
    rowPinning?: any[];
    pinningConfig?: IPinningConfig;
    expansion?: any[];
    rowIslands?: IGridStateCollection[];
    id?: string;
    pivotConfiguration?: IPivotConfiguration;
}

/* blazorElement */
/* wcElementTag: igc-grid-state */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/**
 * State component allows saving and restoring the state of the grid features.
 * @igxParent IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxPivotGridComponent, *
 */
@Component({
    selector: 'igx-grid-state',
    template: ``,
    standalone: true
})
export class IgxGridStateComponent extends IgxGridStateBaseDirective {

    constructor(
        @Inject(IGX_GRID_SERVICE_BASE) private api: GridServiceType,
        protected override viewRef: ViewContainerRef, protected  override envInjector: EnvironmentInjector,
        protected override injector: Injector,
        ) {
            super(api.grid, viewRef, envInjector, injector);
        }

    /**
     * Restores grid features' state based on the IGridStateInfo object passed as an argument.
     * @param state object to restore state from.
     * @param feature string or array of strings determining the features to be added in the state. If skipped, all features are added.
     */
    public applyState(state: IGridStateInfo , features: GridFeatures | GridFeatures[] = []) {
        if (features.length === 0) {
            features = null;
        }
        super.setStateInternal(state, features);
    }

    /**
     * Restores grid features' state based on the serialized IGridState object passed as an argument.
     * @param state string to restore state from.
     * @param feature string or array of strings determining the features to be added in the state. If skipped, all features are added.
     */
    public applyStateFromString(state: string, features: GridFeatures | GridFeatures[] = []) {
        if (features.length === 0) {
            features = null;
        }
        super.setStateInternal(state, features);
    }

    /**
     * Gets the state of a feature or states of all grid features, unless a certain feature is disabled through the `options` property.
     *
     * @param feature string or array of strings determining the features to be added in the state. If skipped, all features are added.
     * @returns The state object.
     */
    public getState(features: GridFeatures | GridFeatures[] = []): IGridStateInfo {
        /** Due to return type in getState being union type and having no support for union type in the translators
         * hiding getState in favor of a simpler extractState method that omits the serialize property and always returns just a string. */
        if (features.length === 0) {
            features = null;
        }
        return super.getStateInternal(false, features) as IGridStateInfo;
    }

    /**
     * Gets the state of a feature or states of all grid features, unless a certain feature is disabled through the `options` property.
     *
     * @param feature array of strings determining the features to be added in the state. If skipped, all features are added.
     * @returns Returns the serialized to JSON string IGridStateInfo object.
     */
    public getStateAsString(features: GridFeatures | GridFeatures[] = []): string {
        if (features.length === 0) {
            features = null;
        }
        return super.getStateInternal(true, features) as string;
    }


}

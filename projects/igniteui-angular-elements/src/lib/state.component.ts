import { Input, Component, EnvironmentInjector, Inject, Injector, ViewContainerRef } from '@angular/core';
import {IgxGridStateDirective, IGridStateOptions, IGridState, GridFeatures } from "../../../igniteui-angular/src/lib/grids/state.directive";
import { IGX_GRID_SERVICE_BASE, GridServiceType}  from '../../../igniteui-angular/src/lib/grids/common/grid.interface';

/* blazorElement */
/* wcElementTag: igc-grid-state */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/**
 * State component description
 * @igxParent IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxPivotGridComponent, *
 */
@Component({
    selector: 'igx-grid-state',
    template: ``,
    standalone: true
})
export class IgxGridStateComponent extends IgxGridStateDirective {

    constructor(
        @Inject(IGX_GRID_SERVICE_BASE) private api: GridServiceType,
        protected override viewRef: ViewContainerRef, protected  override envInjector: EnvironmentInjector,
        protected override injector: Injector,
        ) {
            super(api.grid, viewRef, envInjector, injector);
        }

        @Input()
        public override get options(): IGridStateOptions {
           return this._options;
        }


    /** This method is marked as hidden, because it collides with the react components existing setState method.
    /** Circumventing this by exposing a alternative applyState method. */
    /** @hidden @internal */
    public override setState(state: IGridState | string, features?: GridFeatures | GridFeatures[]) {
        super.setState(state, features);
    }

    /**
     * Restores grid features' state based on the IGridState object passed as an argument.
     *
     * @param IGridState object to restore state from.
     * @returns
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * this.state.applyState(gridState);
     * ```
     */
    public applyState(state: IGridState | string, features?: GridFeatures | GridFeatures[]) {
        super.setState(state, features);
    }
}

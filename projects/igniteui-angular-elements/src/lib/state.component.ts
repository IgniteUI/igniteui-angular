import { Input, Component, EnvironmentInjector, Inject, Injector, ViewContainerRef } from '@angular/core';
import {IgxGridStateDirective, IGridStateOptions } from "../../../igniteui-angular/src/lib/grids/state.directive";
import { IGX_GRID_SERVICE_BASE, GridServiceType}  from '../../../igniteui-angular/src/lib/grids/common/grid.interface';

/* blazorElement */
/* mustUseNGParentAnchor */
/* wcElementTag: igc-grid-state */
/* blazorIndirectRender */
/* contentParent: GridBaseDirective */
/* jsonAPIManageItemInMarkup */
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
}

import { Input, Component, EnvironmentInjector, Inject, Injector, ViewContainerRef } from '@angular/core';
import {IgxGridStateDirective, IGridStateOptions, IGridState, GridFeatures } from "../../../igniteui-angular/src/lib/grids/state.directive";
import { IGX_GRID_SERVICE_BASE, GridServiceType}  from '../../../igniteui-angular/src/lib/grids/common/grid.interface';
import { IgxGridComponent } from '../../../igniteui-angular/src/lib/grids/grid/grid.component';

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

        public override set options(value: IGridStateOptions) {
            Object.assign(this._options, value);
            if (!(this.grid instanceof IgxGridComponent)) {
                delete this._options.groupBy;
            } else {
                delete this._options.rowIslands;
            }
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
    public applyState(state: IGridState , features: GridFeatures | GridFeatures[] = []) {
        if (features.length === 0) {
            features = null;
        }
        super.setState(state, features);
    }

    /** @hidden @internal */
    public override getState(serialize = true, features?: GridFeatures | GridFeatures[]): IGridState | string  {
        return super.getState(serialize, features);
    }

    /**
     * Restores grid features' state based on the serialized IGridState object passed as an argument.
     *
     * @param serialized IGridState object to restore state from.
     * @returns
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * this.state.setState(gridState);
     * ```
     */
    public applyStateFromString(state: string, features: GridFeatures | GridFeatures[] = []) {
        if (features.length === 0) {
            features = null;
        }
        super.setState(state, features);
    }

    /**
     * Gets the state of a feature or states of all grid features, unless a certain feature is disabled through the `options` property.
     *
     * @param `feature` string or array of strings determining the features to be added in the state. If skipped, all features are added.
    * @returns Returns the non-serialized IGridState object.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * let state = this.state.extractState(); // returns `IGridState` object
     * ```
     */
    public extractState(features: GridFeatures | GridFeatures[] = []): IGridState {
        /** Due to return type in getState being union type and having no support for union type in the translators
         * hiding getState in favor of a simpler extractState method that omits the serialize property and always returns just a string. */
        if (features.length === 0) {
            features = null;
        }
        return super.getState(false, features) as IGridState;
    }

    /**
     * Gets the state of a feature or states of all grid features, unless a certain feature is disabled through the `options` property.
     *
     * @param `feature` array of strings determining the features to be added in the state. If skipped, all features are added.
     * @returns Returns the serialized to JSON string IGridState object.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * let state = this.state.extractStateAsString(); // returns string
     * ```
     */
    public extractStateAsString(features: GridFeatures | GridFeatures[] = []): string {
        if (features.length === 0) {
            features = null;
        }
        return super.getState(true, features) as string;
    }


}

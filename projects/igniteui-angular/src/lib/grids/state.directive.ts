import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { GridFeatures, IGridState, IGridStateOptions, IgxGridStateBaseDirective } from './state-base.directive';

@Directive({
    selector: '[igxGridState]',
    standalone: true
})
export class IgxGridStateDirective extends IgxGridStateBaseDirective {
    private static ngAcceptInputType_options: IGridStateOptions | '';

    /**
     *  An object with options determining if a certain feature state should be saved.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * public options = {selection: false, advancedFiltering: false};
     * ```
     */
    @Input('igxGridState')
    public override get options(): IGridStateOptions {
        return super.options;
    }

    public override set options(value: IGridStateOptions) {
        super.options = value;
    }

    /**
     * Gets the state of a feature or states of all grid features, unless a certain feature is disabled through the `options` property.
     *
     * @param `serialize` determines whether the returned object will be serialized to JSON string. Default value is true.
     * @param `feature` string or array of strings determining the features to be added in the state. If skipped, all features are added.
     * @returns Returns the serialized to JSON string IGridState object, or the non-serialized IGridState object.
     * ```html
     * <igx-grid [igxGridState]="options"></igx-grid>
     * ```
     * ```typescript
     * @ViewChild(IgxGridStateDirective, { static: true }) public state;
     * let state = this.state.getState(); // returns string
     * let state = this.state(false) // returns `IGridState` object
     * ```
     */
    public getState(serialize = true, features?: GridFeatures | GridFeatures[]): IGridState | string  {
        return super.getStateInternal(serialize, features);
    }

    /* blazorSuppress */
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
     * this.state.setState(gridState);
     * ```
     */
    public setState(state: IGridState | string, features?: GridFeatures | GridFeatures[]) {
        if (typeof state === 'string') {
            state = JSON.parse(state) as IGridState;
            this.stateParsed.emit(state)
        }
        return super.setStateInternal(state, features);
    }

    /**
     *  Event emitted when set state is called with a string.
     * Returns the parsed state object so that it can be further modified before applying to the grid.
     * ```typescript
     * this.state.stateParsed.subscribe(parsedState => parsedState.sorting.forEach(x => x.strategy = NoopSortingStrategy.instance()});
     * ```
     */
    @Output()
    public stateParsed = new EventEmitter<IGridState>();
}

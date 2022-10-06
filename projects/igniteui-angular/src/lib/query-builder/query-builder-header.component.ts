import { Component, Input } from '@angular/core';
import { IQueryBuilderResourceStrings } from '../core/i18n/query-builder-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';

@Component({
    selector: 'igx-query-builder-header',
    templateUrl: 'query-builder-header.component.html'
})
export class IgxQueryBuilderHeaderComponent {

    private _resourceStrings = CurrentResourceStrings.QueryBuilderResStrings;

    /**
     * An @Input property that sets the title of the `IgxQueryBuilderHeaderComponent`.
     *
     * @example
     * ```html
     * <igx-query-builder-header title="Sample Query Builder"></igx-query-builder-header>
     * ```
     */
    @Input()
    public title: string;

    /**
     * An @Input property to show/hide the legend.
     *
     * @example
     * ```html
     * <igx-query-builder-header [showLegend]="false"></igx-query-builder-header>
     * ```
     */
    @Input()
    public showLegend = true;

    /**
     * Sets the resource strings.
     * By default it uses EN resources.
     */
     @Input()
     public set resourceStrings(value: IQueryBuilderResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
     }

     /**
      * Returns the resource strings.
      */
     public get resourceStrings(): IQueryBuilderResourceStrings {
        return this._resourceStrings;
     }
}

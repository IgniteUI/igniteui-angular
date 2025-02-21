import { Component, Input } from '@angular/core';
import { IQueryBuilderResourceStrings, QueryBuilderResourceStringsEN } from '../core/i18n/query-builder-resources';
import { getCurrentResourceStrings } from '../core/i18n/resources';

@Component({
    selector: 'igx-query-builder-header',
    templateUrl: 'query-builder-header.component.html'
})
export class IgxQueryBuilderHeaderComponent {

    private _resourceStrings = getCurrentResourceStrings(QueryBuilderResourceStringsEN);

    /**
     * Sets the title of the `IgxQueryBuilderHeaderComponent`.
     *
     * @example
     * ```html
     * <igx-query-builder-header title="Sample Query Builder"></igx-query-builder-header>
     * ```
     */
    @Input()
    public title: string;

    /**
     * Show/hide the legend.
     *
     * @example
     * ```html
     * <igx-query-builder-header [showLegend]="false"></igx-query-builder-header>
     * ```
     * @deprecated in version 19.1.0.
     */
    @Input()
    public showLegend = true;

    /**
     * Sets the resource strings.
     * By default it uses EN resources.
     * 
     * @deprecated in version 19.1.0.
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

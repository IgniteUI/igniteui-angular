import { Component, DestroyRef, HostBinding, inject, Input } from '@angular/core';
import { IQueryBuilderResourceStrings, QueryBuilderResourceStringsEN } from 'igniteui-angular/core';
import { getCurrentResourceStrings, onResourceChangeHandle } from 'igniteui-angular/core';

/* wcElementTag: igc-query-builder-header */
/* blazorElement */
/* jsonAPIManageItemInMarkup */
/* jsonAPIManageCollectionInMarkup */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/* contentParent: QueryBuilder */
/**
*/
@Component({
    selector: 'igx-query-builder-header',
    templateUrl: 'query-builder-header.component.html'
})
export class IgxQueryBuilderHeaderComponent {

    private _destroyRef = inject(DestroyRef);
    private _resourceStrings: IQueryBuilderResourceStrings = null;
    private _defaultResourceStrings = getCurrentResourceStrings(QueryBuilderResourceStringsEN);

    /**
     * @hidden @internal
     */
    @HostBinding('class') public get getClass() {
        return 'igx-query-builder__header';
    }

    /**
     * Sets the title of the `IgxQueryBuilderHeaderComponent`.
     */
    @Input()
    public title: string;

    /**
     * Show/hide the legend.
     *
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
        return this._resourceStrings || this._defaultResourceStrings;
    }

    constructor() {
        onResourceChangeHandle(this._destroyRef, () => {
            this._defaultResourceStrings = getCurrentResourceStrings(QueryBuilderResourceStringsEN, false);
        }, this);
    }
}

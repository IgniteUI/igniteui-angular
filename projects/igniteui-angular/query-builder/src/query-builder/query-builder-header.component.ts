import { Component, HostBinding, Input, ChangeDetectionStrategy } from '@angular/core';

/* wcElementTag: igc-query-builder-header */
/* blazorElement */
/* jsonAPIManageItemInMarkup */
/* jsonAPIManageCollectionInMarkup */
/* blazorIndirectRender */
/* singleInstanceIdentifier */
/* contentParent: QueryBuilder */
/**
* @igxParent IgxQueryBuilderComponent
*/
@Component({
    selector: 'igx-query-builder-header',
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: 'query-builder-header.component.html'
})
export class IgxQueryBuilderHeaderComponent {
    /**
     * @hidden @internal
     */
    @HostBinding('class') public get getClass() {
        return 'igx-query-builder__header';
    }

    /**
     * Sets the title of the query builder header.
     *
     * @example
     * ```html
     * <igx-query-builder-header title="Sample Query Builder"></igx-query-builder-header>
     * ```
     */
    @Input()
    public title!: string;
}

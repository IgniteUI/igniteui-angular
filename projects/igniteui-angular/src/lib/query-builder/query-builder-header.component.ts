import { Component, Input } from '@angular/core';

@Component({
    selector: 'igx-query-builder-header',
    templateUrl: 'query-builder-header.component.html',
    styleUrls: ['./query-builder.component.css']
})
export class IgxQueryBuilderHeaderComponent {
    /**
     * An @Input property that sets the title of the `IgxQueryBuilderHeaderComponent`.
     * ```html
     * <igx-query-builder-header title="Sample Query Builder">
     * ```
     */
    @Input()
    public title: string;

    /**
     * An @Input property to show/hide the legend.
     */
    @Input()
    public showLegend = true;
}
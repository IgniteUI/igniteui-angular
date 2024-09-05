import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Defines the custom template that will be used for the search value input of condition in edit mode
 * 
 * @igxModule IgxQueryBuilderModule
 * @igxKeywords query builder, query builder search value
 * @igxGroup Data entry and display
 *
 * @example
 * <igx-query-builder>
 *      <ng-template igxQueryBuilderSearchValue>
 *          <span>Custom Search Value</span>
 *      </ng-template>
 *  </igx-query-builder>
 */
@Directive({
    selector: '[igxQueryBuilderSearchValue]',
    standalone: true
})
export class IgxQueryBuilderSearchValueTemplateDirective {
    @Input()
    public searchValue: any;

    constructor(public template: TemplateRef<any>) { }
}

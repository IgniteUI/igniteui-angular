import { Directive, TemplateRef, inject } from '@angular/core';
import { IgxQueryBuilderSearchValueContext } from './query-builder.common';

/**
 * Defines the custom template that will be used for the search value input of condition in edit mode
 *
 * @igxModule IgxQueryBuilderModule
 * @igxKeywords query builder, query builder search value
 * @igxGroup Data entry and display
 *
 * @example
 * <igx-query-builder>
 *      <ng-template igxQueryBuilderSearchValue let-expression="expression">
 *          <input type="text" required [(ngModel)]="expression.searchVal"/>
 *      </ng-template>
 *  </igx-query-builder>
 */
@Directive({
    selector: '[igxQueryBuilderSearchValue]',
    standalone: true
})
export class IgxQueryBuilderSearchValueTemplateDirective {
    public template = inject<TemplateRef<IgxQueryBuilderSearchValueContext>>(TemplateRef);

     public static ngTemplateContextGuard(_directive: IgxQueryBuilderSearchValueTemplateDirective,
        context: unknown): context is IgxQueryBuilderSearchValueContext {
        return true;
    }
}

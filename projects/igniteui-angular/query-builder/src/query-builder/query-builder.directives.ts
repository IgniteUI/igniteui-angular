import { Directive, TemplateRef, inject } from '@angular/core';
import { IgxQueryBuilderSearchValueContext } from './query-builder.common';

/**
 * Defines the custom template that will be used for the search value input of condition in edit mode
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

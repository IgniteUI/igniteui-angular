import { Directive, TemplateRef, inject } from '@angular/core';
import { IgxHeadSelectorTemplateContext, IgxGroupByRowSelectorTemplateContext, IgxRowSelectorTemplateContext } from '../common/grid.interface';

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxRowSelector]',
    standalone: true
})
export class IgxRowSelectorDirective {
    public templateRef = inject<TemplateRef<IgxRowSelectorTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxRowSelectorDirective,
        context: unknown): context is IgxRowSelectorTemplateContext { 
        return true
    }
}

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxGroupByRowSelector]',
    standalone: true
})
export class IgxGroupByRowSelectorDirective {
    public templateRef = inject<TemplateRef<IgxGroupByRowSelectorTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxGroupByRowSelectorDirective,
        context: unknown): context is IgxGroupByRowSelectorTemplateContext { 
        return true
    }
}

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxHeadSelector]',
    standalone: true
})
export class IgxHeadSelectorDirective {
    public templateRef = inject<TemplateRef<IgxHeadSelectorTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxHeadSelectorDirective,
        context: unknown): context is IgxHeadSelectorTemplateContext { 
        return true
    }
}

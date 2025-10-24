import { Directive, TemplateRef } from '@angular/core';
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
    constructor(public templateRef: TemplateRef<IgxRowSelectorTemplateContext>) { }

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
    constructor(public templateRef: TemplateRef<IgxGroupByRowSelectorTemplateContext>) { }

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
    constructor(public templateRef: TemplateRef<IgxHeadSelectorTemplateContext>) { }

    public static ngTemplateContextGuard(_directive: IgxHeadSelectorDirective,
        context: unknown): context is IgxHeadSelectorTemplateContext { 
        return true
    }
}

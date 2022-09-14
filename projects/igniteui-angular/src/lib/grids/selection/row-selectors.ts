import { Directive, TemplateRef } from '@angular/core';
import { IgxHeadSelectorTemplateContext, IgxGroupByRowSelectorTemplateContext, IgxRowSelectorTemplateContext } from '../common/grid.interface';

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxRowSelector]'
})
export class IgxRowSelectorDirective {
    constructor(public templateRef: TemplateRef<any>) { }

    static ngTemplateContextGuard<T>(directive: IgxRowSelectorDirective,
        context: unknown): context is IgxRowSelectorTemplateContext { 
        return true
    };
}

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxGroupByRowSelector]'
})
export class IgxGroupByRowSelectorDirective {
    constructor(public templateRef: TemplateRef<any>) { }

    static ngTemplateContextGuard<T>(directive: IgxGroupByRowSelectorDirective,
        context: unknown): context is IgxGroupByRowSelectorTemplateContext { 
        return true
    };
}

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxHeadSelector]'
})
export class IgxHeadSelectorDirective {
    constructor(public templateRef: TemplateRef<any>) { }

    static ngTemplateContextGuard<T>(directive: IgxHeadSelectorDirective,
        context: unknown): context is IgxHeadSelectorTemplateContext { 
        return true
    };
}

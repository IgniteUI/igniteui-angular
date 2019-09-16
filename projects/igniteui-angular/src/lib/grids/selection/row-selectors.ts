import { Directive, TemplateRef } from '@angular/core';

/**
 * @hidden
 * @internal
 */
@Directive({
    selector: '[igxRowSelector]'
})
export class IgxRowSelectorDirective {
    constructor(public templateRef: TemplateRef<any>) { }
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
}

import { Directive, NgModule, TemplateRef } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowSelector]'
})
export class IgxRowSelectorDirective {
    constructor(public templateRef: TemplateRef<any>) { }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxHeadSelector]'
})
export class IgxHeadSelectorDirective {
    constructor(public templateRef: TemplateRef<any>) { }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxRowSelectorDirective, IgxHeadSelectorDirective],
    exports: [IgxRowSelectorDirective, IgxHeadSelectorDirective]
})
export class IgxRowSelectorsModule {
}

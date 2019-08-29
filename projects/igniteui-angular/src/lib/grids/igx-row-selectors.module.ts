import { Directive, NgModule, TemplateRef } from '@angular/core';

@Directive({
    selector: '[igxRowSelector]'
})
export class IgxRowSelectorDirective {
    constructor(public templateRef: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxHeadSelector]'
})
export class IgxHeadSelectorDirective {
    constructor(public templateRef: TemplateRef<any>) { }
}

@NgModule({
    declarations: [IgxRowSelectorDirective, IgxHeadSelectorDirective],
    exports: [IgxRowSelectorDirective, IgxHeadSelectorDirective]
})
export class IgxRowSelectorsModule {
}

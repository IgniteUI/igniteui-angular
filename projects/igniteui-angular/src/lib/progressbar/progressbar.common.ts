import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[igxProcessBarText]'
})
export class IgxProcessBarTextTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxProgressBarGradient]'
})
export class IgxProgressBarGradientDirective {
    constructor(public template: TemplateRef<any>) { }
}


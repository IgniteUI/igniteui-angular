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
export class IgxProgressBarGradientTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}


import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[igxProcessBarText]',
    standalone: true
})
export class IgxProcessBarTextTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxProgressBarGradient]',
    standalone: true
})
export class IgxProgressBarGradientDirective {
    constructor(public template: TemplateRef<any>) { }
}


import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[igxProgressBarText]',
    standalone: true
})
export class IgxProgressBarTextTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxProgressBarGradient]',
    standalone: true
})
export class IgxProgressBarGradientDirective {
    constructor(public template: TemplateRef<any>) { }
}


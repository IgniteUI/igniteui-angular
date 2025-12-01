import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
    selector: '[igxProgressBarText]',
    standalone: true
})
export class IgxProgressBarTextTemplateDirective {
    public template = inject<TemplateRef<any>>(TemplateRef);
}

@Directive({
    selector: '[igxProgressBarGradient]',
    standalone: true
})
export class IgxProgressBarGradientDirective {
    public template = inject<TemplateRef<any>>(TemplateRef);
}


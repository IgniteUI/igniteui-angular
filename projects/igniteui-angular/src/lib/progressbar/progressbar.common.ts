import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
    selector: '[igxProgressBarText]',
    standalone: true
})
export class IgxProgressBarTextTemplateDirective {
    template = inject<TemplateRef<any>>(TemplateRef);
}

@Directive({
    selector: '[igxProgressBarGradient]',
    standalone: true
})
export class IgxProgressBarGradientDirective {
    template = inject<TemplateRef<any>>(TemplateRef);
}


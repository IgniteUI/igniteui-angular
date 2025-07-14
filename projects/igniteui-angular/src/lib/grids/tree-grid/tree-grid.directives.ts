import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowLoadingIndicator]',
    standalone: true
})
export class IgxRowLoadingIndicatorTemplateDirective {
    template = inject<TemplateRef<any>>(TemplateRef);
}

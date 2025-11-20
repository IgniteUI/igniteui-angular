import { Directive, TemplateRef } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowLoadingIndicator]',
    standalone: true
})
export class IgxRowLoadingIndicatorTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

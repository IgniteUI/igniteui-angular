import { Directive, TemplateRef } from '@angular/core';

/**
 * @hidden
 */
@Directive({
    selector: '[igxRowLoadingIndicator]'
})
export class IgxRowLoadingIndicatorTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

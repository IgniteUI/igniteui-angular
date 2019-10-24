import { Directive, TemplateRef } from '@angular/core';


/**
 * The IgxGridToolbarCustomContentDirective directive is used to mark an 'ng-template' (with
 * the 'igxToolbarCustomContent' selector) defined in the IgxGrid which is used to provide
 * custom content for cener part of the IgxGridToolbar.
 */
@Directive({
    selector: '[igxToolbarCustomContent]'
})
export class IgxGridToolbarCustomContentDirective {
    constructor(public template: TemplateRef<any>) { }
}

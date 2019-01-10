import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[igxDatePickerTemplate]'
})
export class IgxDatePickerTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

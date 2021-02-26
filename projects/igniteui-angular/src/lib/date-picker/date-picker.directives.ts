import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[igxDatePickerTemplate]'
})

/**
 * IgxDatePickerTemplateDirective can be used to re-template the date-picker input-group.
 *
 * @hidden
 */
export class IgxDatePickerTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

/**
 * IgxDatePickerActionsDirective can be used to re-template the dropdown/dialog action buttons.
 */
@Directive({
    selector: '[igxPickerActions]'
})
export class IgxPickerActionsDirective {
    constructor(public template: TemplateRef<any>) { }
}

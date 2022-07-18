import { Directive, TemplateRef } from '@angular/core';
/**
 * @hidden
 */
@Directive({
    selector: '[igxPivotValueChip]'
})
export class IgxPivotValueChipTemplateDirective {

    constructor(public template: TemplateRef<any>) { }

}

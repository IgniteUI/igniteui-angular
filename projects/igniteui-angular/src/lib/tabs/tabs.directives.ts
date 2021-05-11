import {
    Directive,
    TemplateRef
} from '@angular/core';

@Directive({
    selector: '[igxTab]'
})
export class IgxTabItemTemplateDirective {

    constructor(public template: TemplateRef<any>) {
    }
}

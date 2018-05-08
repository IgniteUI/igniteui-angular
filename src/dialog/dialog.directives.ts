import { DOCUMENT } from "@angular/common";
import { Directive, TemplateRef } from "@angular/core";

@Directive({
    selector: "[igxDialogTitle]"
})
export class IgxDialogTitleDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: "[igxDialogActions]"
})
export class IgxDialogActionsDirective {
    constructor(public template: TemplateRef<any>) { }
}

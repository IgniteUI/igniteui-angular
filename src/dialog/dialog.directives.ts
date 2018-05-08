import { DOCUMENT } from "@angular/common";
import { Directive, TemplateRef } from "@angular/core";

@Directive({
    selector: "[igxDialogTitle]"
})
export class IgxDialogTitleDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: "[igxDialogButtons]"
})
export class IgxDialogButtonsDirective {
    constructor(public template: TemplateRef<any>) { }
}

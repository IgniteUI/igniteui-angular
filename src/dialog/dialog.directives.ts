import { DOCUMENT } from "@angular/common";
import { Directive } from "@angular/core";

@Directive({
    selector: "igx-dialog-title,[igxDialogTitle]"
})
export class IgxDialogTitleDirective { }

@Directive({
    selector: "igx-dialog-actions,[igxDialogActions]"
})
export class IgxDialogActionsDirective { }

import { DOCUMENT } from "@angular/common";
import { Directive, HostBinding } from "@angular/core";

@Directive({
    selector: "igx-dialog-title,[igxDialogTitle]"
})
export class IgxDialogTitleDirective {

    @HostBinding("class.igx-dialog__window-title")
    public defaultStyle = true;
 }

@Directive({
    selector: "igx-dialog-actions,[igxDialogActions]"
})
export class IgxDialogActionsDirective {

    @HostBinding("class.igx-dialog__window-actions")
    public defaultClass = true;
 }

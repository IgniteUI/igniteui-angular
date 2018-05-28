import { Directive, HostBinding } from "@angular/core";
var IgxDialogTitleDirective = (function () {
    function IgxDialogTitleDirective() {
        this.defaultStyle = true;
    }
    IgxDialogTitleDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-dialog-title,[igxDialogTitle]"
                },] },
    ];
    IgxDialogTitleDirective.propDecorators = {
        "defaultStyle": [{ type: HostBinding, args: ["class.igx-dialog__window-title",] },],
    };
    return IgxDialogTitleDirective;
}());
export { IgxDialogTitleDirective };
var IgxDialogActionsDirective = (function () {
    function IgxDialogActionsDirective() {
        this.defaultClass = true;
    }
    IgxDialogActionsDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-dialog-actions,[igxDialogActions]"
                },] },
    ];
    IgxDialogActionsDirective.propDecorators = {
        "defaultClass": [{ type: HostBinding, args: ["class.igx-dialog__window-actions",] },],
    };
    return IgxDialogActionsDirective;
}());
export { IgxDialogActionsDirective };

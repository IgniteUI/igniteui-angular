import { Directive, HostBinding } from "@angular/core";
var IgxLabelDirective = (function () {
    function IgxLabelDirective() {
        this.defaultClass = true;
    }
    IgxLabelDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxLabel]"
                },] },
    ];
    IgxLabelDirective.propDecorators = {
        "defaultClass": [{ type: HostBinding, args: ["class.igx-input-group__label",] },],
    };
    return IgxLabelDirective;
}());
export { IgxLabelDirective };

import { Directive, HostBinding } from "@angular/core";
var IgxPrefixDirective = (function () {
    function IgxPrefixDirective() {
        this.defaultClass = true;
    }
    IgxPrefixDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-prefix,[igxPrefix]"
                },] },
    ];
    IgxPrefixDirective.propDecorators = {
        "defaultClass": [{ type: HostBinding, args: ["class.igx-input-group__bundle-prefix",] },],
    };
    return IgxPrefixDirective;
}());
export { IgxPrefixDirective };

import { Directive, HostBinding } from "@angular/core";
var IgxSuffixDirective = (function () {
    function IgxSuffixDirective() {
        this.defaultClass = true;
    }
    IgxSuffixDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-suffix,[igxSuffix]"
                },] },
    ];
    IgxSuffixDirective.propDecorators = {
        "defaultClass": [{ type: HostBinding, args: ["class.igx-input-group__bundle-suffix",] },],
    };
    return IgxSuffixDirective;
}());
export { IgxSuffixDirective };

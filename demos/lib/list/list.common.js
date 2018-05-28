import { Directive, TemplateRef } from "@angular/core";
export var IgxListPanState;
(function (IgxListPanState) {
    IgxListPanState[IgxListPanState["NONE"] = 0] = "NONE";
    IgxListPanState[IgxListPanState["LEFT"] = 1] = "LEFT";
    IgxListPanState[IgxListPanState["RIGHT"] = 2] = "RIGHT";
})(IgxListPanState || (IgxListPanState = {}));
var IgxEmptyListTemplateDirective = (function () {
    function IgxEmptyListTemplateDirective(template) {
        this.template = template;
    }
    IgxEmptyListTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxEmptyList]"
                },] },
    ];
    IgxEmptyListTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxEmptyListTemplateDirective;
}());
export { IgxEmptyListTemplateDirective };

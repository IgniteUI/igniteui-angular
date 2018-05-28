import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef } from "@angular/core";
var HVirtualHelperComponent = (function () {
    function HVirtualHelperComponent(elementRef) {
        this.elementRef = elementRef;
        this.cssClasses = "igx-vhelper--horizontal";
    }
    HVirtualHelperComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-horizontal-virtual-helper",
                    template: "<div #horizontal_container class='igx-vhelper__placeholder-content' [style.width.px]='width'></div>"
                },] },
    ];
    HVirtualHelperComponent.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    HVirtualHelperComponent.propDecorators = {
        "_vcr": [{ type: ViewChild, args: ["horizontal_container", { read: ViewContainerRef },] },],
        "width": [{ type: Input },],
        "cssClasses": [{ type: HostBinding, args: ["class",] },],
    };
    return HVirtualHelperComponent;
}());
export { HVirtualHelperComponent };

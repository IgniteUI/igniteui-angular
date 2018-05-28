import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef } from "@angular/core";
var VirtualHelperComponent = (function () {
    function VirtualHelperComponent(elementRef) {
        this.elementRef = elementRef;
        this.cssClasses = "igx-vhelper--vertical";
    }
    VirtualHelperComponent.prototype.ngOnInit = function () {
    };
    VirtualHelperComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-virtual-helper",
                    template: "<div #container class='igx-vhelper__placeholder-content' [style.height.px]='height'></div>"
                },] },
    ];
    VirtualHelperComponent.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    VirtualHelperComponent.propDecorators = {
        "_vcr": [{ type: ViewChild, args: ["container", { read: ViewContainerRef },] },],
        "itemsLength": [{ type: Input },],
        "cssClasses": [{ type: HostBinding, args: ["class",] },],
    };
    return VirtualHelperComponent;
}());
export { VirtualHelperComponent };

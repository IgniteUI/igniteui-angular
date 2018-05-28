import { ChangeDetectorRef, Component, HostBinding, ViewChild, ViewContainerRef } from "@angular/core";
var DisplayContainerComponent = (function () {
    function DisplayContainerComponent(cdr, _viewContainer) {
        this.cdr = cdr;
        this._viewContainer = _viewContainer;
        this.cssClass = "igx-display-container";
        this.notVirtual = true;
    }
    DisplayContainerComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-display-container",
                    template: "<ng-template #display_container></ng-template>"
                },] },
    ];
    DisplayContainerComponent.ctorParameters = function () { return [
        { type: ChangeDetectorRef, },
        { type: ViewContainerRef, },
    ]; };
    DisplayContainerComponent.propDecorators = {
        "_vcr": [{ type: ViewChild, args: ["display_container", { read: ViewContainerRef },] },],
        "cssClass": [{ type: HostBinding, args: ["class",] },],
        "notVirtual": [{ type: HostBinding, args: ["class.igx-display-container--inactive",] },],
    };
    return DisplayContainerComponent;
}());
export { DisplayContainerComponent };

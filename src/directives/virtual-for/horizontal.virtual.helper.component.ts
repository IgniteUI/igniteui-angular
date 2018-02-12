import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef } from "@angular/core";

@Component({
    selector: "igx-horizontal-virtual-helper",
    template: "<div #horizontal_container [style.width.px]='width' style='height: 1px;'></div>"
})
export class HVirtualHelperComponent {
    @ViewChild("horizontal_container", { read: ViewContainerRef }) public _vcr;
    @Input() public width: number;
    @HostBinding("class")
    public cssClasses = "igx-vhelper--horizontal";

    constructor(public elementRef: ElementRef) { }
}

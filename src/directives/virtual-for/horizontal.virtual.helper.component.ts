import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from "@angular/core";

@Component({
    selector: "horizontal-virtual-helper",
    styles: [":host { display: block; width: 100%; overflow: auto; }"],
    template: "<div [style.width.px]='width' #horizontal_container style='height: 1px;'></div>"
})
export class HVirtualHelper {
    @ViewChild("horizontal_container", { read: ViewContainerRef }) public _vcr;
    @Input() public width: number;
    constructor(public elementRef: ElementRef) { }
}

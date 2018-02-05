import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from "@angular/core";

@Component({
    selector: "virtual-helper",
    styles: [":host { overflow: auto; display: block; height: 100%; float:right; width:17px; }"],
    template: "<div style='width:1px;float:right;' [style.height.px]='height' #container></div>"
})
export class VirtualHelper {
    @ViewChild("container", { read: ViewContainerRef }) public _vcr;
    @Input() public itemsLength: number;
    public height: number;

    constructor(public elementRef: ElementRef) { }

    public ngOnInit() {
    }

}

import { Component, ElementRef, Input, OnInit, ViewChild, ViewContainerRef } from "@angular/core";

@Component({
    selector: "igx-virtual-helper",
    styles: [":host { overflow: auto; display: block; height: 100%; float:right; width:17px; }"],
    template: "<div style='width:1px;float:right;' [style.height.px]='height' #container></div>"
})
export class VirtualHelperComponent implements OnInit {
    @ViewChild("container", { read: ViewContainerRef }) public _vcr;
    @Input() public itemsLength: number;
    public height: number;

    constructor(public elementRef: ElementRef) { }

    public ngOnInit() {
    }

}

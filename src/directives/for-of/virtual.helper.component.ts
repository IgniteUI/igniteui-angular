import { Component, ElementRef, HostBinding, Input, OnInit, ViewChild, ViewContainerRef } from "@angular/core";

@Component({
    selector: "igx-virtual-helper",
    template: "<div #container class='igx-vhelper__placeholder-content' [style.height.px]='height'></div>"
})
export class VirtualHelperComponent implements OnInit {
    @ViewChild("container", { read: ViewContainerRef }) public _vcr;
    @Input() public itemsLength: number;
    public height: number;

    @HostBinding("class")
    public cssClasses = "igx-vhelper--vertical";

    @HostBinding("style.width.px")
    public get width() {
        const content = document.createElement("div");
        content.style.height = "1000px";
        content.style.width = "1px";

        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.width = "100px";
        div.style.height = "100px";
        div.style.left = "-100px";
        div.style.overflow = "auto";

        div.appendChild(content);
        document.body.appendChild(div);

        // Increase the size with 2px so there is enough buffer when zooming so the scrollbar doesn't get clipped
        const scrollWidth = div.offsetWidth - div.clientWidth + 2;
        document.body.removeChild(div);

        return scrollWidth;
    }

    constructor(public elementRef: ElementRef) { }

    public ngOnInit() {
    }

}

import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    ViewChild,
    ViewContainerRef
} from "@angular/core";

@Component({
    selector: "igx-display-container",
    template: "<ng-template #display_container></ng-template>"
})
export class DisplayContainerComponent {
    @ViewChild("display_container", { read: ViewContainerRef })
    public _vcr;

    @HostBinding("class")
    public cssClass = "igx-display-container";

    constructor(public cdr: ChangeDetectorRef, public _viewContainer: ViewContainerRef) { }
}

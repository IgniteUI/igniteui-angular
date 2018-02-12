import { ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from "@angular/core";

@Component({
    selector: "igx-display-container",
    styles: [`
    :host {
        height: calc(100% - 18px);
        width: calc(100% - 18px);
        overflow: hidden;
        float: left;
        position: relative;
        display: inherit; }`],
    template: "<ng-template #display_container></ng-template>"
})
export class DisplayContainerComponent {
    @ViewChild("display_container", { read: ViewContainerRef }) public _vcr;
    constructor(public cdr: ChangeDetectorRef, public _viewContainer: ViewContainerRef) { }
}

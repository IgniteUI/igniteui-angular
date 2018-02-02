import { ChangeDetectorRef, Component, , ViewChild, ViewContainerRef } from "@angular/core";

@Component({
    selector: "display-container",
    styles: [`
	:host {
		height: calc(100% - 18px);
		width: calc(100% - 18px);
		overflow: hidden;
		float: left;
		position: relative;
		display: grid; }`],
    template: "<ng-template #display_container></ng-template>"
})
export class DisplayContainer {
    @ViewChild("display_container", { read: ViewContainerRef }) public _vcr;
    constructor(public cdr: ChangeDetectorRef, public _viewContainer: ViewContainerRef) { }
}

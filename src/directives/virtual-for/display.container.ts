import { Component, ViewChild, ViewContainerRef, ChangeDetectorRef } from "@angular/core";
import { makeDecorator } from "@angular/core/src/util/decorators";

@Component({
	selector: 'display-container',
	template: '<ng-template #display_container></ng-template>',
	styles: [':host { height: calc(100% - 18px); width: calc(100% - 18px); overflow: hidden; float: left; position: relative; display: grid; }']
})
export class DisplayContainer {
	@ViewChild('display_container', { read: ViewContainerRef }) _vcr;
	constructor(public cdr: ChangeDetectorRef, public _viewContainer: ViewContainerRef) { }
	scroll(event) {
		console.log(event);
	}
}
import { Component, ViewChild, ViewContainerRef,ChangeDetectorRef } from "@angular/core";
import { makeDecorator } from "@angular/core/src/util/decorators";

@Component({
	selector: 'display-container',
	template: '<span #display_container></span>',
	styles: [':host { height: calc(100% - 18px); width: calc(100% - 18px); overflow: hidden; float: left; position: relative;}']
})
export class DisplayContainer {
	@ViewChild('display_container', { read: ViewContainerRef }) _vcr;
	constructor( public cdr: ChangeDetectorRef, public _viewContainer: ViewContainerRef){}
	scroll(event){
		console.log(event);
	}
}
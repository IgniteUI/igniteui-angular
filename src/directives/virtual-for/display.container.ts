import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { makeDecorator } from "@angular/core/src/util/decorators";

@Component({
	selector: 'display-container',
	template: '<span #display_container></span>',
	styles: [':host { height: calc(100% - 18px); width: calc(100% - 18px); overflow: hidden; display: block; float: left; position: relative;}']
})
export class DisplayContainer {
	@ViewChild('display_container', { read: ViewContainerRef }) _vcr;

	scroll(event){
		console.log(event);
	}
}
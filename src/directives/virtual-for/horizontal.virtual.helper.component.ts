import { Component, ViewChild, ViewContainerRef, style, HostListener, Output, EventEmitter, ElementRef, Input, HostBinding } from "@angular/core";

@Component({
	selector: 'horizontal-virtual-helper',
	template: '<div [style.width.px]="width" #horizontal_container style="height: 1px;"></div>',
	styles: [':host { display: block; width: 100%; overflow: auto; }']
})
export class HVirtualHelper {
	@ViewChild('horizontal_container', { read: ViewContainerRef }) _vcr;
	@Output() vhscroll: EventEmitter<any> = new EventEmitter();
	@Input() itemsLength: number;
	public width: number;

	ngOnInit() {
		this.width = 55 * this.itemsLength;
	}

	@HostListener('scroll', ['$event'])
	onScroll(event) {
		this.vhscroll.emit(event);
	}
}
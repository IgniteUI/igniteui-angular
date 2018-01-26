import { Component, ViewChild, ViewContainerRef, style, HostListener, Output, EventEmitter, ElementRef, Input, HostBinding } from "@angular/core";

@Component({
	selector: 'virtual-helper',
	template: '<div style="width:1px;float:right;" [style.height.px]="height" #container></div>',
	styles: [':host { overflow: auto; display: block; height: calc(100% - 18px); float:right; }']
})
export class VirtualHelper {
	@ViewChild('container', { read: ViewContainerRef }) _vcr;
	@Output() vhscroll: EventEmitter<any> = new EventEmitter();
	@Input() itemsLength: number;
	public height: number;

	ngOnInit() {
		this.height = 50 * this.itemsLength;
	}
	constructor(public elementRef: ElementRef) { }
	@HostListener('scroll', ['$event'])
	onScroll(event) {
		this.vhscroll.emit(event);
	}
}
import {
	Directive, DoCheck, OnChanges, Input, TrackByFunction, isDevMode, ChangeDetectorRef, NgIterable, IterableDiffer,
	ViewContainerRef, TemplateRef, IterableDiffers, SimpleChanges, IterableChanges, EmbeddedViewRef, IterableChangeRecord,
	ComponentFactory, ComponentFactoryResolver, ViewChild, HostListener, NgZone,
	AfterViewInit
} from '@angular/core';
import { NgForOfContext } from '@angular/common';
import { NgForOf } from '@angular/common/src/directives/ng_for_of';
import { VirtualHelper } from './virtual.helper.component';
import { ComponentRef } from '@angular/core/src/linker/component_factory';
import { DisplayContainer } from './display.container';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HVirtualHelper } from './horizontal.virtual.helper.component';

@Directive({ selector: '[igVirtFor]' })
export class IgVirtualForOf<T> {

	private hScroll;
	private func;
	private hCache: Array<number>;

	dc: ComponentRef<DisplayContainer>;

	@ViewChild(DisplayContainer)
	private displayContiner: DisplayContainer;

	@ViewChild(VirtualHelper)
	private virtualHelper: VirtualHelper;

	@Input() igVirtForOf: Array<any>;
	@Input() igVirtForScrolling: string;
	@Input() igVirtForUseForScroll: any;
	@Input() igVirtForContainerSize: any;

	private _embeddedViews: Array<EmbeddedViewRef<any>> = [];

	//@Input()
	//set ngForTrackBy(fn: TrackByFunction<T>) {
	//  if (isDevMode() && fn != null && typeof fn !== 'function') {
	//	// TODO(vicb): use a log service once there is a public one available
	//	if (<any>console && <any>console.warn) {
	//	  console.warn(
	//		  `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
	//		  `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
	//	}
	//  }
	//  this._trackByFn = fn;
	//}
	//

	onScroll(event) {
		let scrollTop = event.target.scrollTop;
		let vcHeight = event.target.children[0].scrollHeight;
		let ratio = scrollTop / vcHeight;
		let embeddedViewCopy = Object.assign([], this._embeddedViews);

		this._currIndex = Math.round(ratio * this.igVirtForOf.length);

		let endingIndex = this._pageSize + this._currIndex;
		for (let i = this._currIndex; i < endingIndex && this.igVirtForOf[i] !== undefined; i++) {
			let input = this.igVirtForOf[i];
			var embView = embeddedViewCopy.shift();
			var cntx = (<EmbeddedViewRef<any>>embView).context;
			cntx.$implicit = input;
			cntx.index = this.igVirtForOf.indexOf(input);
		}
		this.dc.changeDetectorRef.detectChanges();
	}

	onHScroll(event) {
		let scrollLeft = event.target.scrollLeft;
		let hcWidth = event.target.children[0].scrollWidth;
		let ratio = scrollLeft / hcWidth;
		let embeddedViewCopy = Object.assign([], this._embeddedViews);

		this._currIndex = Math.round(ratio * this.igVirtForOf.length);

		let endingIndex = this._pageSize + this._currIndex;
		for (let i = this._currIndex; i < endingIndex && this.igVirtForOf[i] !== undefined; i++) {
			let input = this.igVirtForOf[i];
			var embView = embeddedViewCopy.shift();
			var cntx = (<EmbeddedViewRef<any>>embView).context;
			cntx.$implicit = input;
			cntx.index = this.igVirtForOf.indexOf(input);
		}
		this.dc.changeDetectorRef.detectChanges();
	}

	get ngForTrackBy(): TrackByFunction<T> { return this._trackByFn; }

	private _differ: IterableDiffer<T> | null = null;
	private _trackByFn: TrackByFunction<T>;
	private _pageSize: number = 0;
	private _currIndex: number = 0;

	constructor(
		private _viewContainer: ViewContainerRef,
		private _template: TemplateRef<NgForOfContext<T>>,
		private _differs: IterableDiffers,
		private resolver: ComponentFactoryResolver,
		public cdr: ChangeDetectorRef,
		private _zone: NgZone) { }

	//@Input()
	//set ngForTemplate(value: TemplateRef<NgForOfContext<T>>) {
	//  // TODO(TS2.1): make TemplateRef<Partial<NgForRowOf<T>>> once we move to TS v2.1
	//  // The current type is too restrictive; a template that just uses index, for example,
	//  // should be acceptable.
	//  if (value) {
	//	this._template = value;
	//  }
	//}
	//
	ngAfterViewInit(): void {
		var that = this;
		let vc = this.igVirtForUseForScroll ? this.igVirtForUseForScroll._viewContainer : this._viewContainer;
		if (this.igVirtForScrolling === "horizontal") {
			var totalWidth: number = this.initHCache(this.igVirtForOf);
			this._pageSize = this.getHorizontalIndexAt(
				parseInt(this.igVirtForContainerSize, 10),
				this.hCache,
				0
			) + 2;
		} else {
			this._pageSize = parseInt(this.igVirtForContainerSize, 10) / 50;
		}

		const dcFactory: ComponentFactory<DisplayContainer> = this.resolver.resolveComponentFactory(DisplayContainer);
		this.dc = this._viewContainer.createComponent(dcFactory, 0);
		for (let i = 0; i < this._pageSize && this.igVirtForOf[i] !== undefined; i++) {
			let input = this.igVirtForOf[i];
			let embeddedView = this.dc.instance._vcr.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
			this._embeddedViews.push(embeddedView);
		}

		if (this.igVirtForScrolling === "vertical") {
			const factory: ComponentFactory<VirtualHelper> = this.resolver.resolveComponentFactory(VirtualHelper);
			let vh: ComponentRef<VirtualHelper> = this._viewContainer.createComponent(factory, 1);
			vh.instance.itemsLength = this.igVirtForOf.length;
			this._zone.runOutsideAngular(() => {
				vh.instance.elementRef.nativeElement.addEventListener('scroll', function (evt) { that.onScroll(evt) });
			});
		}

		if (this.igVirtForScrolling === "horizontal") {
			this.dc.instance._viewContainer.element.nativeElement.style.display = "inline-flex";
			this.dc.instance._viewContainer.element.nativeElement.style.height = "100%";
			var directiveRef = this.igVirtForUseForScroll || this;
			this.hScroll = this.getHorizontalScroll(vc, "horizontal-virtual-helper");
			this.func = function (evt) { that.onHScroll(evt); }
			if (!this.hScroll) {
				const hvFactory: ComponentFactory<HVirtualHelper> = this.resolver.resolveComponentFactory(HVirtualHelper);
				let hvh: ComponentRef<HVirtualHelper> = vc.createComponent(hvFactory);
				hvh.instance.width = totalWidth;
				this._zone.runOutsideAngular(() => {
					hvh.instance.elementRef.nativeElement.addEventListener('scroll', that.func);
				});
			} else {
				this._zone.runOutsideAngular(() => {
					this.hScroll.addEventListener('scroll', this.func);
				});
			}
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ('igVirtForOf' in changes) {
			const value = changes['igVirtForOf'].currentValue;
			if (!this._differ && value) {
				try {
					this._differ = this._differs.find(value).create(this.ngForTrackBy);
				} catch (e) {
					throw new Error(
						`Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
				}
			}
		}
	}
	ngDoCheck(): void {
		if (this._differ) {
			const changes = this._differ.diff(this.igVirtForOf);
			if (changes) this._applyChanges(changes);
		}
	}
	private _applyChanges(changes: IterableChanges<T>) {
		if (this.igVirtForOf && this.igVirtForOf.length && this.dc) {
			let embeddedViewCopy = Object.assign([], this._embeddedViews);
			let endingIndex = this._pageSize + this._currIndex;
			for (let i = this._currIndex; i < endingIndex && this.igVirtForOf[i] !== undefined; i++) {
				let input = this.igVirtForOf[i];
				var embView = embeddedViewCopy.shift();
				var cntx = (<EmbeddedViewRef<any>>embView).context;
				cntx.$implicit = input;
				cntx.index = this.igVirtForOf.indexOf(input);
			}
			this.dc.changeDetectorRef.detectChanges();
		}
	}

	getHorizontalScroll(viewref, nodeName) {
		var elem = viewref.element.nativeElement.parentElement.getElementsByTagName(nodeName);
		return elem.length > 0 ? elem[0] : null;
	}

	initHCache(cols: Array<any>): number {
		var totalWidth = 0, i = 0;
		this.hCache = [];
		this.hCache.push(0);
		for (i; i < cols.length; i++) {
			totalWidth += cols[i].width;
			this.hCache.push(totalWidth);
		}
		return totalWidth;
	}

	getHorizontalIndexAt(left, set, index) {
		var midIdx, midLeft;
		if (set.length === 1) {
			return index;
		}
		midIdx = Math.floor(set.length / 2);
		midLeft = set[midIdx];
		return this.getHorizontalIndexAt(
			left,
			midLeft > left ? set.slice(0, midIdx) : set.slice(midIdx),
			midLeft > left ? index : index + midIdx
		);
	}
}

class RecordViewTuple<T> {
	constructor(public record: any, public view: EmbeddedViewRef<NgForOfContext<T>>) { }
}

export function getTypeNameForDebugging(type: any): string {
	return type['name'] || typeof type;
}

@NgModule({
	declarations: [IgVirtualForOf, DisplayContainer, VirtualHelper, HVirtualHelper],
	entryComponents: [DisplayContainer, VirtualHelper, HVirtualHelper],
	imports: [CommonModule],
	exports: [IgVirtualForOf]
})
export class IgxVirtForModule {
}

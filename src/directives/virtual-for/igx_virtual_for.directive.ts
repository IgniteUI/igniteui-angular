import { Directive, DoCheck, OnChanges, Input, TrackByFunction, isDevMode, NgIterable, IterableDiffer, ViewContainerRef, TemplateRef, IterableDiffers, SimpleChanges, IterableChanges, EmbeddedViewRef, IterableChangeRecord, ComponentFactory, ComponentFactoryResolver, ViewChild, HostListener } from '@angular/core';
import { NgForOfContext } from '@angular/common';
import { NgForOf } from '@angular/common/src/directives/ng_for_of';
import { VirtualHelper } from './virtual.helper.component';
import { ComponentRef } from '@angular/core/src/linker/component_factory';
import { DisplayContainer } from './display.container';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HVirtualHelper } from './horizontal.virtual.helper.component';

@Directive({selector: '[igVirtFor]'})
export class IgVirtualForOf<T> {

	dc :ComponentRef<DisplayContainer>;

	@ViewChild(DisplayContainer)
	private displayContiner: DisplayContainer;

	@ViewChild(VirtualHelper)
	private virtualHelper: VirtualHelper;

	@Input() igVirtForOf: Array<any>;
	@Input() igVirtForScrolling: string;
	@Input() igVirtForIsChild: boolean;
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

		this._currIndex = Math.round(ratio * this.igVirtForOf.length);
		this.dc.instance._vcr.clear();

		let endingIndex = this._pageSize + this._currIndex;
		for(let i = this._currIndex; i < endingIndex && this.igVirtForOf[i] !== undefined; i++) {
			let input = this.igVirtForOf[i];
			//this._viewContainer.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
			this.dc.instance._vcr.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
		}
	}

	onHScroll(event) {
		let scrollLeft = event.target.scrollLeft;
		let hcWidth = event.target.children[0].scrollWidth;
		let ratio = scrollLeft / hcWidth;

		this._currIndex = Math.round(ratio * this.igVirtForOf.length);
		this.dc.instance._vcr.clear();

		let endingIndex = this._pageSize + this._currIndex;
		for(let i = this._currIndex; i < endingIndex && this.igVirtForOf[i] !== undefined; i++) {
			let input = this.igVirtForOf[i];
			//this._viewContainer.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
			this.dc.instance._vcr.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
		}
	}

	get ngForTrackBy(): TrackByFunction<T> { return this._trackByFn; }

	private _differ: IterableDiffer<T>|null = null;
	private _trackByFn: TrackByFunction<T>;
	private _pageSize: number = 20;
	private _currIndex: number = 0;

	constructor(
		private _viewContainer: ViewContainerRef, private _template: TemplateRef<NgForOfContext<T>>,
		private _differs: IterableDiffers, private resolver: ComponentFactoryResolver) {}

	//ngOnInit(): void {
	//	this._viewContainer.createEmbeddedView(this._template);
	//}

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
	ngOnChanges(changes: SimpleChanges): void {
		this._viewContainer.clear();
		
		

		
		const dcFactory: ComponentFactory<DisplayContainer> = this.resolver.resolveComponentFactory(DisplayContainer);

		if (this.igVirtForIsChild !== true) {
			//this._viewContainer.element.nativeElement.parentElement.style.height = "400px";
			const factory: ComponentFactory<VirtualHelper> = this.resolver.resolveComponentFactory(VirtualHelper);
			let vh: ComponentRef<VirtualHelper> = this._viewContainer.createComponent(factory);
			vh.instance.itemsLength = this.igVirtForOf.length;
			vh.instance.vhscroll.subscribe(v => this.onScroll(v));

			this.dc = this._viewContainer.createComponent(dcFactory);


			for(let i = 0; i < this._pageSize && this.igVirtForOf[i] !== undefined; i++) {
				let input = this.igVirtForOf[i];
				//this._viewContainer.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
				this.dc.instance._vcr.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
			}
		} else {
			for(let i = 0; i < this._pageSize && this.igVirtForOf[i] !== undefined; i++) {
				let input = this.igVirtForOf[i];
				//this._viewContainer.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
				this._viewContainer.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
			}
		}

		if (this.igVirtForScrolling === "horizontal") {
			//this._viewContainer.element.nativeElement.parentElement.style.width = "1645px";
			const hvFactory: ComponentFactory<HVirtualHelper> = this.resolver.resolveComponentFactory(HVirtualHelper);
			let hvh: ComponentRef<HVirtualHelper> = this._viewContainer.createComponent(hvFactory);
			hvh.instance.itemsLength = this.igVirtForOf.length;
			hvh.instance.vhscroll.subscribe(v => this.onHScroll(v));
		}


		//for (const input of this.igVirtForOf) {
		//	this._viewContainer.createEmbeddedView(this._template, { $implicit: input, index: this.igVirtForOf.indexOf(input) });
		//	if (this.igVirtForOf.indexOf(input) > this._pageSize) break;
		//}
	}
  //
	//ngDoCheck(): void {
	//  if (this._differ) {
	//	const changes = this._differ.diff(this.igVirtForOf);
	//	if (changes) this._applyChanges(changes);
	//  }
	//}
  //
	//private _applyChanges(changes: IterableChanges<T>) {
	//  const insertTuples: RecordViewTuple<T>[] = [];
	//  changes.forEachOperation(
	//	  (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
	//		if (item.previousIndex == null) {
	//		  const view = this._viewContainer.createEmbeddedView(
	//			  this._template, new NgForOfContext<T>(null !, this.igVirtForOf, -1, -1), currentIndex);
	//		  const tuple = new RecordViewTuple<T>(item, view);
	//		  insertTuples.push(tuple);
	//		} else if (currentIndex == null) {
	//		  this._viewContainer.remove(adjustedPreviousIndex);
	//		} else {
	//		  const view = this._viewContainer.get(adjustedPreviousIndex) !;
	//		  this._viewContainer.move(view, currentIndex);
	//		  const tuple = new RecordViewTuple(item, <EmbeddedViewRef<NgForOfContext<T>>>view);
	//		  insertTuples.push(tuple);
	//		}
	//	  });
  //
	//  for (let i = 0; i < insertTuples.length; i++) {
	//	this._perViewChange(insertTuples[i].view, insertTuples[i].record);
	//  }
  //
	//  for (let i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
	//	const viewRef = <EmbeddedViewRef<NgForOfContext<T>>>this._viewContainer.get(i);
	//	viewRef.context.index = i;
	//	viewRef.context.count = ilen;
	//  }
  //
	//  changes.forEachIdentityChange((record: any) => {
	//	const viewRef =
	//		<EmbeddedViewRef<NgForOfContext<T>>>this._viewContainer.get(record.currentIndex);
	//	viewRef.context.$implicit = record.item;
	//  });
	//}
  //
	//private _perViewChange(
	//	view: EmbeddedViewRef<NgForOfContext<T>>, record: IterableChangeRecord<any>) {
	//  view.context.$implicit = record.item;
	//}

}

class RecordViewTuple<T> {
	constructor(public record: any, public view: EmbeddedViewRef<NgForOfContext<T>>) {}
}

export function getTypeNameForDebugging(type: any): string {
	return type['name'] || typeof type;
}



@NgModule({
    declarations: [	IgVirtualForOf, DisplayContainer, VirtualHelper, HVirtualHelper],
    entryComponents: [	DisplayContainer, VirtualHelper, HVirtualHelper],
	imports: [ CommonModule ],
	exports: [ IgVirtualForOf ]
})
export class IgxVirtForModule {
}
